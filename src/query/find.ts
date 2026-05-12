import type { SchemaResult, Query, OrderByClause } from '../types';
import { planQuery, type NormalizedCondition, normalizeWhere } from './queryPlanner';
import { BTree } from './bTree';

/** Query execution engine for IndexedDB. */
export class Find<F> {
  protected store: IDBObjectStore;
  protected schema: SchemaResult;

  constructor(store: IDBObjectStore, schema: SchemaResult) {
    this.store = store;
    this.schema = schema;
  }

  /** Tests whether a record matches the given `where` clause. */
  public matchesCriteria(record: F, where: Query<F>['where']): boolean {
    if (!where) return true;
    const normalized = normalizeWhere(where as Record<string, unknown>);
    return this.matchesNormalized(record, normalized);
  }

  /** Tests whether a record matches pre-normalized conditions. */
  public matchesNormalized(record: F, conditions: Record<string, NormalizedCondition>): boolean {
    for (const key in conditions) {
      const { op, val } = conditions[key];
      const recordValue = record[key as keyof F];

      // Use schema's getField() for field metadata lookup
      const fieldMeta = this.schema.getField(key);

      // Array field: check membership
      if (fieldMeta && fieldMeta.type === 'array') {
        if (!Array.isArray(recordValue)) return false;
        if (op === 'neq') {
          // neq on array: record must NOT contain the value
          if (recordValue.includes(val)) return false;
        } else {
          // 'includes', 'eq', or bare value: record must contain the value
          if (!recordValue.includes(val)) return false;
        }
        continue;
      }

      switch (op) {
        case 'eq':
          if (recordValue !== val) return false;
          break;
        case 'neq':
          if (recordValue === val) return false;
          break;
        case 'gt':
          if (!(recordValue > (val as any))) return false;
          break;
        case 'gte':
          if (!(recordValue >= (val as any))) return false;
          break;
        case 'lt':
          if (!(recordValue < (val as any))) return false;
          break;
        case 'lte':
          if (!(recordValue <= (val as any))) return false;
          break;
        case 'between': {
          const arr = val as unknown[];
          const lower = arr[0];
          const upper = arr[1];
          const lowerOpen = arr.length >= 3 ? (arr[2] as boolean) : false;
          const upperOpen = arr.length >= 4 ? (arr[3] as boolean) : false;

          if (lowerOpen) {
            if (!(recordValue > (lower as any))) return false;
          } else {
            if (!(recordValue >= (lower as any))) return false;
          }
          if (upperOpen) {
            if (!(recordValue < (upper as any))) return false;
          } else {
            if (!(recordValue <= (upper as any))) return false;
          }
          break;
        }
        case 'startsWith':
          if (typeof recordValue !== 'string') return false;
          if (!recordValue.startsWith(val as string)) return false;
          break;
        case 'includes':
          if (Array.isArray(recordValue)) {
            if (!recordValue.includes(val)) return false;
          } else {
            if (recordValue !== val) return false;
          }
          break;
        default:
          throw new Error(`Unsupported operator: ${op}`);
      }
    }
    return true;
  }

  /** Creates an execution plan for the query. */
  protected createPlan(query: Query<F>) {
    return planQuery(this.schema, query);
  }

  /** Executes the query and returns matching records. */
  async find(query: Query<F>): Promise<F[]> {
    return new Promise((resolve, reject) => {
      const plan = this.createPlan(query);
      let request: IDBRequest<IDBCursorWithValue | null>;

      if (plan.bestIndex) {
        const index = this.store.index(plan.bestIndex as string);
        request = index.openCursor(plan.range, plan.direction);
      } else {
        request = this.store.openCursor(plan.range, plan.direction);
      }

      const normalizedWhere = normalizeWhere(query.where as Record<string, unknown>);

      const orderBy = query.orderBy as OrderByClause<F> | undefined;

      const result: BTree<F> | Array<F> =
        plan.needsSorting && orderBy ? new BTree<F>(orderBy.field as unknown as keyof F) : [];

      let skipped = 0;

      request.onsuccess = event => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor) {
          const value = cursor.value as F;

          if (this.matchesNormalized(value, normalizedWhere)) {
            if (query.offset && skipped < query.offset) {
              skipped++;
            } else {
              result.push(value);
            }

            if (query.limit) {
              const size = result.length;
              if (size >= query.limit) {
                return resolve(Array.isArray(result) ? result : result.getAll(orderBy?.direction));
              }
            }
          }
          cursor.continue();
        } else {
          resolve(Array.isArray(result) ? result : result.getAll(orderBy?.direction));
        }
      };

      request.onerror = event => {
        reject((event.target as IDBRequest).error);
      };
    });
  }
}
