import { Model } from './model';
import type { SchemaResult, SchemaData, IDB_options } from '../types';
import { Emitter } from '../utils/emitter';
import { errorFactory } from '../error/errorFactory';
import { proxyIndexedDBTransaction } from '../utils/idbProxy';
import { ZorixRecord } from '../utils/ZorixRecord';
import { MigrationTable } from '../utils/ZorixTable';
/** The main Zorix database class. Manages IndexedDB connections and models. */
export class DB extends Emitter {
  protected readonly dbName: string;
  protected readonly options: IDB_options;
  protected connection: IDBDatabase | null = null;
  protected transformations: Record<string, (db: ZorixRecord) => void> = {};
  protected migrations: Record<string, (db: MigrationTable) => void> = {};
  protected readonly schemas: Map<string, Readonly<SchemaResult>> = new Map();

  constructor(name: string, options?: IDB_options) {
    if (typeof name !== 'string') {
      throw new Error(`Invalid database name: "${name}".`);
    }
    if (name.trim() === '') {
      throw new Error('Invalid database name');
    }

    super();
    this.dbName = name;

    const opts = options ?? { version: 1 };

    if (typeof opts.version !== 'number' || opts.version <= 0 || !Number.isInteger(opts.version)) {
      throw errorFactory.typeError('Given version is not a positive integer.');
    }

    this.options = opts;
  }

  // ── Internals ──────────────────────────────────────────────────

  /** Handles `onupgradeneeded` to create/update object stores and indexes. */
  protected async handleUpgrade(event: IDBVersionChangeEvent, request: IDBOpenDBRequest) {
    const db = (event.target as IDBOpenDBRequest).result;

    const currentobjectStoreNames = new Set<string>(db.objectStoreNames);
    this.schemas.forEach((schemaRef, storeName) => {
      if (currentobjectStoreNames.has(storeName)) {
        currentobjectStoreNames.delete(storeName);
      }
      let store;

      if (db.objectStoreNames.contains(storeName) && !!request.transaction) {
        store = request.transaction.objectStore(storeName);
      } else {
        const storeOptions = schemaRef.PK
          ? {
              keyPath: schemaRef.PK.keyPath,
              autoIncrement: schemaRef.PK.autoIncrement,
            }
          : { keyPath: '_id', autoIncrement: true };

        store = db.createObjectStore(storeName, storeOptions);
      }

      schemaRef.indexes.forEach(idx => {
        if (store.indexNames.contains(idx.name)) return;
        store.createIndex(idx.name, idx.keyPath, {
          unique: idx.unique,
          multiEntry: idx.multiEntry,
        });
      });
    });
    await this.applyMigrationTable(request.transaction!);
    await this.applyTransformations(request.transaction!);
  }

  /** Opens the IndexedDB connection. */
  protected async openConnection(): Promise<IDBDatabase> {
    if (this.connection) return this.connection;

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.options.version);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        this.emit('versionchange', null);
        this.handleUpgrade(event, request);
      };

      request.onsuccess = event => {
        this.connection = (event.target as IDBOpenDBRequest).result;
        resolve(this.connection);
      };

      request.onerror = event => {
        reject((event.target as IDBOpenDBRequest).error);
      };

      request.onblocked = event => {
        this.emit('blocked', event);
      };
    });
  }

  /** Returns the database connection, opening it if necessary. */
  protected async getDatabase(): Promise<IDBDatabase> {
    if (this.connection) return this.connection;

    try {
      this.connection = await this.openConnection();
      return this.connection;
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  protected async applyTransformations(transaction: IDBTransaction): Promise<void> {
    const migrationKeys = Object.keys(this.transformations);
    if (migrationKeys.length === 0) return;

    for (const storeName of migrationKeys) {
      const transformFn = this.transformations[storeName];
      if (typeof transformFn !== 'function') {
        console.warn(`Skipping transformation for "${storeName}": Not a function.`);
        continue;
      }
      try {
        await new Promise<void>((resolve, reject) => {
          const store = transaction.objectStore(storeName);
          const request = store.openCursor();

          request.onsuccess = event => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              const record = new ZorixRecord(cursor);
              try {
                transformFn(record);
                cursor.continue();
              } catch (err) {
                reject(err instanceof Error ? err : new Error(String(err)));
              }
            } else {
              resolve();
            }
          };

          request.onerror = event => {
            reject((event.target as IDBRequest).error);
          };
        });
      } catch (error) {
        console.error(`Error applying transformation for "${storeName}":`, error);
        throw error instanceof Error ? error : new Error(String(error));
      }
    }
  }

  protected async applyMigrationTable(transaction: IDBTransaction): Promise<void> {
    const migrationKeys = Object.keys(this.migrations);
    if (migrationKeys.length === 0) return;

    for (const storeName of migrationKeys) {
      const migrationFn = this.migrations[storeName];
      if (migrationFn === null) {
        try {
          transaction.db.deleteObjectStore(storeName);
          continue;
        } catch (err) {
          console.error(`Error deleting store "${storeName}":`, err);
          throw err;
        }
      }
      if (typeof migrationFn !== 'function') {
        console.warn(`Skipping migration for "${storeName}": Not a function.`);
        continue;
      }
      try {
        await new Promise<void>((resolve, reject) => {
          const store = transaction.objectStore(storeName);
          const table = new MigrationTable(transaction.db, store);

          try {
            migrationFn(table);
            resolve();
          } catch (err) {
            reject(err instanceof Error ? err : new Error(String(err)));
          }
        });
      } catch (error) {
        console.error(`Error applying migration for "${storeName}":`, error);
        throw error instanceof Error ? error : new Error(String(error));
      }
    }
  }
  // ── Public API ─────────────────────────────────────────────────

  /** Creates a model (object store) bound to the given schema. */
  public async model<const S extends SchemaResult>(storeName: string, schema: S) {
    if (typeof storeName !== 'string') {
      throw new Error(`Invalid "Store Name" type. Expected "string" but got "${typeof storeName}"`);
    }

    if (this.schemas.has(storeName)) {
      throw new Error(`Store with name "${storeName}" already exists`);
    }

    // Store frozen schema reference — schema() already returns Object.freeze'd
    this.schemas.set(storeName, schema);

    // Pass only the single schema ref, not the entire map
    return new Model<SchemaData<S['fields']>>(storeName, () => this.getDatabase(), schema);
  }

  /** Creates a raw IndexedDB transaction. */
  public async tx(storeName: string | string[], mode: IDBTransactionMode) {
    if (typeof storeName !== 'string' && !Array.isArray(storeName)) {
      throw new Error(
        `Invalid "Store Name" type. Expected "string" or "string[]" but got "${typeof storeName}"`
      );
    }

    if (typeof storeName === 'string' && storeName.trim() === '') {
      throw new Error('Store name cannot be an empty string.');
    }

    if (mode !== 'readonly' && mode !== 'readwrite') {
      throw new Error(`Invalid transaction mode: "${mode}". Expected "readonly" or "readwrite".`);
    }

    const stores = typeof storeName === 'string' ? [storeName] : storeName;
    const db = await this.getDatabase();
    return proxyIndexedDBTransaction(db, stores, mode);
  }

  /** Open the The IndexedDB connection  */
  public async open(): Promise<void> {
    if (!this.connection) {
      await this.getDatabase();
    }
    return;
  }

  /** Closes the IndexedDB connection and releases the reference. */
  public close(): void {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  }

  /**
   * Defines structural migrations for specific object stores (tables).
   * These are executed during the IndexedDB `onupgradeneeded` phase.
   *
   * @param migrations - A record mapping store names to migration functions or null to delete.
   */
  public migrate(migrations: Record<string, ((table: MigrationTable) => void) | null>): void {
    if (typeof migrations !== 'object' || migrations === null) {
      throw new Error(
        'Migrations must be a non-null object with version keys and migration functions.'
      );
    }
    this.migrations = migrations as any;
  }
  /**
   * Defines data transformations for specific object stores (records).
   *
   * > [!WARNING]
   * > This method uses a cursor to traverse **every single record** in the object store.
   * > For large datasets, this can be slow and may impact startup performance during upgrades.
   *
   * @param migrations - A record mapping store names to transformation functions.
   */
  public transform(migrations: Record<string, (record: ZorixRecord) => void>): void {
    if (typeof migrations !== 'object' || migrations === null) {
      throw new Error(
        'Migrations must be a non-null object with version keys and migration functions.'
      );
    }
    this.transformations = migrations;
    if (!this.connection) {
      this.getDatabase();
    }
  }
}
