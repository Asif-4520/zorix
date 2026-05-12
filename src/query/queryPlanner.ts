import type { SchemaResult, Query, OrderByClause } from '../types';
import { errorFactory } from '../error/errorFactory';

/** Execution plan produced by the query planner. */
export interface ExecutionPlan {
  bestIndex: string | null;
  range: IDBKeyRange | null;
  direction: IDBCursorDirection;
  postFilter: Record<string, NormalizedCondition>;
  needsSorting: boolean;
  isFullScan: boolean;
}

// ── Operator Scoring ────────────────────────────────────────────────

const OPERATOR_SCORE: Record<string, number> = {
  eq: 100,
  between: 70,
  gt: 60,
  gte: 60,
  lt: 60,
  lte: 60,
  startsWith: 50,
  includes: 40,
  neq: 10,
};

function getOperatorScore(op: string): number {
  return OPERATOR_SCORE[op] ?? 0;
}

const ALLOWED_OPERATORS = new Set(Object.keys(OPERATOR_SCORE));

// ── Normalized Condition ────────────────────────────────────────────

export type NormalizedCondition = { op: string; val: unknown };

/** Normalizes a `where` clause into `{ op, val }` pairs. */
export function normalizeWhere(
  where: Record<string, unknown>
): Record<string, NormalizedCondition> {
  const normalized: Record<string, NormalizedCondition> = {};

  for (const key in where) {
    const raw = where[key];
    if (raw === undefined) continue;

    if (raw !== null && typeof raw === 'object' && !Array.isArray(raw) && !(raw instanceof Date)) {
      const obj = raw as Record<string, unknown>;
      const ops = Object.keys(obj);

      if (ops.length === 0) {
        throw errorFactory.validationError(key, raw, 'Empty operator object');
      }

      for (const op of ops) {
        if (!ALLOWED_OPERATORS.has(op)) {
          throw errorFactory.validationError(key, op, `Unknown operator "${op}"`);
        }
      }

      // Combined range: { gte: 10, lte: 30 } or { gt: 10, lt: 30 }
      if (ops.length === 2) {
        const hasLower = obj.gt !== undefined || obj.gte !== undefined;
        const hasUpper = obj.lt !== undefined || obj.lte !== undefined;

        if (hasLower && hasUpper) {
          const lowerVal = obj.gte !== undefined ? obj.gte : obj.gt;
          const upperVal = obj.lte !== undefined ? obj.lte : obj.lt;
          const lowerOpen = obj.gt !== undefined;
          const upperOpen = obj.lt !== undefined;

          normalized[key] = {
            op: 'between',
            val: [lowerVal, upperVal, lowerOpen, upperOpen],
          };
          continue;
        }
      }

      const op = ops[0];
      const val = obj[op];

      if (op === 'between') {
        if (!Array.isArray(val) || val.length < 2) {
          throw errorFactory.validationError(key, raw, 'between requires an array of [min, max]');
        }
        normalized[key] = { op, val };
      } else if (op === 'startsWith') {
        if (typeof val !== 'string') {
          throw errorFactory.validationError(key, raw, 'startsWith requires a string argument');
        }
        normalized[key] = { op, val };
      } else {
        if (val === undefined) {
          throw errorFactory.validationError(key, raw, `${op} requires a value`);
        }
        normalized[key] = { op, val };
      }
    } else {
      // Bare value: shorthand for eq
      normalized[key] = { op: 'eq', val: raw };
    }
  }

  return normalized;
}

// ── Index Selection ─────────────────────────────────────────────────

function pickBestIndex(
  schema: SchemaResult,
  where: Record<string, NormalizedCondition>,
  orderBy?: OrderByClause<any>
) {
  let bestIndex: string | null = null;
  let bestKeyPath: string[] = [];
  let bestScore = -Infinity;

  for (const index of schema.indexes) {
    const indexName = index.name;
    const keyPaths = Array.isArray(index.keyPath) ? index.keyPath : [index.keyPath];

    let score = 0;
    let matchedPrefix = 0;
    let hasAnyCondition = false;
    let lastPrefixWasEq = true;

    for (let position = 0; position < keyPaths.length; position++) {
      const field = keyPaths[position];

      // Use schema.getField() for metadata lookup
      const meta = schema.getField(field);

      // Type selectivity bonus
      if (meta) {
        if (meta.type === 'number' || meta.type === 'date') score += 40;
        else if (meta.type === 'string') score += 30;
        else if (meta.type === 'boolean') score += 10;
      }

      const condition = where[field];
      if (condition !== undefined) {
        hasAnyCondition = true;
        const opScore = getOperatorScore(condition.op);

        // Leading field bonus
        score += opScore * (position === 0 ? 1.5 : 1);

        // Track prefix matching for compound indexes
        if (matchedPrefix === position && lastPrefixWasEq) {
          matchedPrefix++;
          if (condition.op !== 'eq') {
            lastPrefixWasEq = false;
          }
        }
      } else {
        lastPrefixWasEq = false;
      }

      // orderBy alignment bonus
      if (orderBy?.field === field) {
        score += position === 0 ? 40 : 20;
      }
    }

    if (!hasAnyCondition) continue;

    if (index.unique) score += 40;
    if (index.multiEntry) score -= 20;
    if (matchedPrefix > 0) score += matchedPrefix * 150;

    if (matchedPrefix === keyPaths.length && keyPaths.length > 1) {
      score += 200;
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = indexName;
      bestKeyPath = keyPaths;
    }
  }

  return { bestIndex, bestKeyPath };
}

// ── Range Building ──────────────────────────────────────────────────

function buildRangeFromIndex(
  bestIndex: string | null,
  bestKeyPath: string[],
  where: Record<string, NormalizedCondition>,
  usedFields: Set<string>
): IDBKeyRange | null {
  if (!bestIndex) return null;

  // Single-field index
  if (bestKeyPath.length <= 1) {
    const fieldName = bestKeyPath[0] || bestIndex;
    const cond = where[fieldName];
    if (!cond) return null;

    usedFields.add(fieldName);
    return buildRangeFromCondition(cond);
  }

  // Compound index: collect EQ prefix values
  const prefixValues: unknown[] = [];
  let rangeField: string | null = null;
  let rangeCond: NormalizedCondition | null = null;

  for (const field of bestKeyPath) {
    const condition = where[field];
    if (!condition) break;

    if (condition.op === 'eq') {
      prefixValues.push(condition.val);
      usedFields.add(field);
    } else {
      rangeField = field;
      rangeCond = condition;
      break;
    }
  }

  // EQ prefix + range on next field
  if (prefixValues.length > 0 && rangeCond && rangeField) {
    usedFields.add(rangeField);
    const range = buildCompoundRange(prefixValues, rangeCond);
    if (range) return range;
  }

  // Pure EQ prefix
  if (prefixValues.length === 1) {
    return IDBKeyRange.only(prefixValues[0] as any);
  }
  if (prefixValues.length > 1) {
    return IDBKeyRange.only(prefixValues as any);
  }

  // Fallback: first field's condition
  const firstCond = where[bestKeyPath[0]];
  if (firstCond) {
    usedFields.add(bestKeyPath[0]);
    return buildRangeFromCondition(firstCond);
  }

  return null;
}

function buildRangeFromCondition(cond: NormalizedCondition): IDBKeyRange | null {
  const { op, val } = cond;

  switch (op) {
    case 'eq':
      return IDBKeyRange.only(val as any);
    case 'gt':
      return IDBKeyRange.lowerBound(val as any, true);
    case 'gte':
      return IDBKeyRange.lowerBound(val as any, false);
    case 'lt':
      return IDBKeyRange.upperBound(val as any, true);
    case 'lte':
      return IDBKeyRange.upperBound(val as any, false);
    case 'between': {
      const arr = val as unknown[];
      if (arr.length >= 4) {
        return IDBKeyRange.bound(
          arr[0] as any,
          arr[1] as any,
          arr[2] as boolean,
          arr[3] as boolean
        );
      }
      return IDBKeyRange.bound(arr[0] as any, arr[1] as any);
    }
    case 'startsWith': {
      const s = val as string;
      return IDBKeyRange.bound(s, s + '\uffff');
    }
    case 'includes':
      return IDBKeyRange.only(val as any);
    case 'neq':
      return null;
    default:
      return null;
  }
}

function buildCompoundRange(
  prefixValues: unknown[],
  rangeCond: NormalizedCondition
): IDBKeyRange | null {
  const { op, val } = rangeCond;

  switch (op) {
    case 'gt':
      return IDBKeyRange.bound(
        [...prefixValues, val] as any,
        [...prefixValues, []] as any,
        true,
        true
      );
    case 'gte':
      return IDBKeyRange.bound(
        [...prefixValues, val] as any,
        [...prefixValues, []] as any,
        false,
        true
      );
    case 'lt':
      return IDBKeyRange.bound([...prefixValues] as any, [...prefixValues, val] as any, true, true);
    case 'lte':
      return IDBKeyRange.bound(
        [...prefixValues] as any,
        [...prefixValues, val] as any,
        true,
        false
      );
    case 'between': {
      const arr = val as unknown[];
      const lowerOpen = arr.length >= 3 ? (arr[2] as boolean) : false;
      const upperOpen = arr.length >= 4 ? (arr[3] as boolean) : false;
      return IDBKeyRange.bound(
        [...prefixValues, arr[0]] as any,
        [...prefixValues, arr[1]] as any,
        lowerOpen,
        upperOpen
      );
    }
    default:
      return null;
  }
}

// ── Post Filter ─────────────────────────────────────────────────────

function buildPostFilter(
  where: Record<string, NormalizedCondition>,
  usedFields: Set<string>
): Record<string, NormalizedCondition> {
  const postFilter: Record<string, NormalizedCondition> = {};
  for (const key in where) {
    if (!usedFields.has(key)) {
      postFilter[key] = where[key];
    }
  }
  return postFilter;
}

// ── Direction & Sorting ─────────────────────────────────────────────

function determineDirectionAndSorting(
  orderBy: OrderByClause<any> | undefined,
  bestKeyPath: string[],
  bestIndex: string | null
) {
  const direction: IDBCursorDirection = orderBy?.direction === 'desc' ? 'prev' : 'next';
  const indexFirstField = bestKeyPath.length > 0 ? bestKeyPath[0] : bestIndex;
  const needsSorting = !!orderBy && (!indexFirstField || orderBy.field !== indexFirstField);
  return { direction, needsSorting };
}

// ── Main Entry Point ────────────────────────────────────────────────

/** Analyzes a query against a schema and produces an optimal execution plan. */
export function planQuery<T>(schema: SchemaResult, query: Query<T>): ExecutionPlan {
  if (typeof query !== 'object' || query === null) {
    throw new Error('Query is not in a valid format');
  }

  const defaultPlan: ExecutionPlan = {
    bestIndex: null,
    direction: 'next',
    isFullScan: true,
    needsSorting: false,
    postFilter: {},
    range: null,
  };

  if (!query.where) return defaultPlan;

  const rawWhere = query.where as Record<string, unknown>;

  if (Object.keys(rawWhere).length === 0) return defaultPlan;

  const where = normalizeWhere(rawWhere);
  const orderBy = query.orderBy as OrderByClause<T> | undefined;

  const { bestIndex, bestKeyPath } = pickBestIndex(schema, where, orderBy);

  if (!bestIndex) {
    return { ...defaultPlan, postFilter: where };
  }

  const usedFields = new Set<string>();
  let range: IDBKeyRange | null;

  // Use schema.getField() for metadata lookup
  const bestFieldMeta = schema.getField(bestIndex);
  const isMultiEntryArray = bestFieldMeta && bestFieldMeta.type === 'array';

  if (isMultiEntryArray) {
    const cond = where[bestIndex];
    if (!cond) {
      range = null;
    } else {
      range = IDBKeyRange.only(cond.val as any);
      usedFields.add(bestIndex);
    }
  } else {
    range = buildRangeFromIndex(bestIndex, bestKeyPath, where, usedFields);
  }

  const postFilter = buildPostFilter(where, usedFields);

  const { direction, needsSorting } = determineDirectionAndSorting(orderBy, bestKeyPath, bestIndex);

  return {
    bestIndex,
    range,
    direction,
    postFilter,
    needsSorting,
    isFullScan: false,
  };
}
