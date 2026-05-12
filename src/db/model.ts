import { Find } from '../query/find';
import { planQuery } from '../query/queryPlanner';
import { mapIdbError, errorFactory } from '../error/errorFactory';
import { ZorixError } from '../error/zorixError';
import type { SchemaResult, Query, InsertManyResult, UpdateResult, DeleteResult } from '../types';

/** Represents a single IndexedDB object store with typed CRUD operations. */
export class Model<T extends Record<string, unknown>> {
  protected readonly storeName: string;
  protected readonly getDb: () => Promise<IDBDatabase>;
  /** Frozen schema reference — only this model's schema, not the full registry. */
  protected readonly schema: Readonly<SchemaResult>;

  constructor(
    storeName: string,
    getDb: () => Promise<IDBDatabase>,
    schema: Readonly<SchemaResult>
  ) {
    this.storeName = storeName;
    this.getDb = getDb;
    this.schema = schema;
  }

  // ── Internals ──────────────────────────────────────────────────

  /** Validates data using schema.parse() — throws with field context on failure. */
  protected async validateData(data: T): Promise<void> {
    if (!data || typeof data !== 'object') {
      throw errorFactory.dataError('Data must be a non-null object.');
    }

    const { PK } = this.schema;

    // Only validate PK when explicitly defined (not auto-increment)
    if (PK && !PK.autoIncrement && data[PK.keyPath] === undefined) {
      throw errorFactory.validationError(
        PK.keyPath,
        data[PK.keyPath],
        'Primary key is required when autoIncrement is disabled'
      );
    }

    // Delegate all field type-checking to schema.parse()
    this.schema.parse(data);
  }

  /** Opens an object store in the given transaction mode. */
  protected async openStore(mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    const db = await this.getDb();
    const tx = db.transaction(this.storeName, mode);
    return tx.objectStore(this.storeName);
  }

  /** Wraps an IDB request in a promise. */
  protected promisify<R>(request: IDBRequest<R>): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      request.onerror = () => reject(mapIdbError(request.error));
      request.onsuccess = () => resolve(request.result);
    });
  }

  // ── Public API ─────────────────────────────────────────────────

  /** Inserts a single record after schema validation. */
  public async insert(data: T): Promise<IDBValidKey> {
    await this.validateData(data);
    const store = await this.openStore('readwrite');
    return this.promisify(store.add(data));
  }

  /** Inserts multiple records in a single transaction. */
  public async insertMany(data: T[]): Promise<InsertManyResult> {
    if (!Array.isArray(data) || data.length === 0) {
      throw new ZorixError({
        message: 'Data must be a non-empty array.',
        name: 'Validation Error',
        code: 'E10000',
      });
    }

    // Validate ALL items before opening the transaction.
    // IDB transactions auto-commit when idle — interleaving async validation
    // calls with store.add() via Promise.all causes TransactionInactiveError.
    for (const item of data) {
      await this.validateData(item);
    }

    const store = await this.openStore('readwrite');

    // Add records sequentially within the same transaction (no async gaps).
    for (const item of data) {
      await this.promisify(store.add(item));
    }

    return { insertedCount: data.length };
  }

  /** Finds records matching the query. */
  public async find(queryArgs: Query<T>): Promise<T[]> {
    if (!queryArgs || !queryArgs.where) {
      throw errorFactory.syntaxError('Query is required with at least a "where" clause.');
    }

    const store = await this.openStore('readonly');
    const engine = new Find<T>(store, this.schema as SchemaResult);
    return engine.find(queryArgs);
  }

  /** Retrieves a single record by primary key. */
  public async get(pk: string | number): Promise<T | undefined> {
    const store = await this.openStore('readonly');
    return this.promisify(store.get(pk)) as Promise<T | undefined>;
  }

  /** Retrieves all records from the store. */
  public async getAll(): Promise<T[]> {
    const store = await this.openStore('readonly');
    return this.promisify(store.getAll()) as Promise<T[]>;
  }

  /** Updates records matching the query with the given partial data. */
  public async update(query: Omit<Query<T>, 'orderBy'>, data: Partial<T>): Promise<UpdateResult> {
    const schema = this.schema as SchemaResult;
    const plan = planQuery(schema, query as Query<T>);
    const store = await this.openStore('readwrite');

    return new Promise<UpdateResult>((resolve, reject) => {
      const cursorReq = plan.bestIndex
        ? store.index(plan.bestIndex).openCursor(plan.range)
        : store.openCursor(plan.range);

      let updatedCount = 0;
      let skipped = 0;

      cursorReq.onsuccess = e => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;

        if (!cursor) {
          return resolve({ updatedCount });
        }

        try {
          const finder = new Find<T>(store, schema);
          if (!finder.matchesCriteria(cursor.value, query.where)) {
            cursor.continue();
            return;
          }
        } catch (err) {
          return reject(err);
        }

        if (query.offset && skipped < query.offset) {
          skipped++;
          cursor.continue();
          return;
        }

        const merged = { ...cursor.value, ...data };

        // Validate merged data before writing back
        const result = schema.validate(merged);
        if (!result.valid) {
          return reject(
            errorFactory.validationError(
              result.field ?? 'unknown',
              merged[result.field ?? ''],
              result.reason ?? 'Validation failed'
            )
          );
        }

        const updateReq = cursor.update(merged);

        updateReq.onsuccess = () => {
          updatedCount++;
          if (query.limit && updatedCount >= query.limit) {
            return resolve({ updatedCount });
          }
          cursor.continue();
        };
        updateReq.onerror = () => reject(mapIdbError(updateReq.error));
      };

      cursorReq.onerror = () => reject(mapIdbError(cursorReq.error));
    });
  }

  /** Deletes records matching the query. */
  public async delete(query: Omit<Query<T>, 'orderBy'>): Promise<DeleteResult> {
    const schema = this.schema as SchemaResult;
    const plan = planQuery(schema, query as Query<T>);
    const store = await this.openStore('readwrite');

    return new Promise<DeleteResult>((resolve, reject) => {
      const cursorReq = plan.bestIndex
        ? store.index(plan.bestIndex).openCursor(plan.range)
        : store.openCursor(plan.range);

      let deletedCount = 0;
      let skipped = 0;

      cursorReq.onsuccess = e => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;

        if (!cursor) {
          return resolve({ deletedCount });
        }

        try {
          const finder = new Find<T>(store, schema);
          if (!finder.matchesCriteria(cursor.value, query.where)) {
            cursor.continue();
            return;
          }
        } catch (err) {
          return reject(err);
        }

        if (query.offset && skipped < query.offset) {
          skipped++;
          cursor.continue();
          return;
        }

        const deleteReq = cursor.delete();
        deleteReq.onsuccess = () => {
          deletedCount++;
          if (query.limit && deletedCount >= query.limit) {
            return resolve({ deletedCount });
          }
          cursor.continue();
        };
        deleteReq.onerror = () => reject(mapIdbError(deleteReq.error));
      };

      cursorReq.onerror = () => reject(mapIdbError(cursorReq.error));
    });
  }

  /** Returns the total record count. */
  public async count(): Promise<number> {
    const store = await this.openStore('readonly');
    return this.promisify(store.count());
  }

  /** Clears all records from the store. */
  public async clear(): Promise<undefined> {
    const store = await this.openStore('readwrite');
    return this.promisify(store.clear());
  }
}
