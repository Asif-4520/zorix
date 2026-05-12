import type { SchemaInput, AnyFieldBuilder, AnyFieldConfig, SchemaInputToFields } from '../types';
import { errorFactory } from '../error/errorFactory';

function isFieldBuilder(v: any): v is AnyFieldBuilder {
  return v && typeof v === 'object' && 'config' in v;
}

function extractConfig<T extends AnyFieldBuilder>(field: T): T['config'] {
  return field.config;
}

const VALID_TYPES = new Set(['string', 'number', 'boolean', 'object', 'array', 'date', 'any']);

export const schema = <const F extends SchemaInput>(
  fields: F,
  options?: {
    compoundIndexes?: Array<Array<keyof F>>;
  }
) => {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    throw errorFactory.syntaxError('Schema must be a non-null object with field definitions.');
  }

  const keys = Object.keys(fields);
  if (keys.length === 0) {
    throw errorFactory.syntaxError('Schema cannot be empty.');
  }

  const fieldConfigs: Record<string, AnyFieldConfig> = {};
  const fieldNames = new Set<string>();
  const indexNames = new Set<string>();
  const indexes: any[] = [];

  let primaryKey: {
    name: string;
    keyPath: string;
    autoIncrement: boolean;
  } | null = null;

  for (const key of keys) {
    if (!key || typeof key !== 'string') {
      throw errorFactory.definitionError(`Invalid field name "${key}"`);
    }

    const raw = fields[key];

    if (!isFieldBuilder(raw)) {
      throw errorFactory.definitionError(`Field "${key}" is not a valid FieldBuilder`);
    }

    const config = extractConfig(raw);

    if (fieldNames.has(key)) {
      throw errorFactory.definitionError(`Duplicate field "${key}"`);
    }
    fieldNames.add(key);

    if (!VALID_TYPES.has(config.type)) {
      throw errorFactory.definitionError(`Unsupported type "${config.type}" at "${key}"`);
    }

    // Primary key rules
    if (config.primary) {
      if (primaryKey) {
        throw errorFactory.definitionError(
          `Multiple primary keys: "${primaryKey.name}" and "${key}"`
        );
      }

      if (config.type !== 'string' && config.type !== 'number') {
        throw errorFactory.definitionError(`Primary key "${key}" must be string or number`);
      }

      primaryKey = {
        name: key,
        keyPath: key,
        autoIncrement: false,
      };
    }

    // Index validation
    if (config.indexes) {
      if (config.type === 'boolean') {
        throw errorFactory.definitionError(`Boolean field "${key}" cannot be indexed`);
      }

      if (config.indexes.multiEntry && config.type !== 'array') {
        throw errorFactory.definitionError(`multiEntry index only allowed on arrays ("${key}")`);
      }

      indexes.push({
        name: key,
        keyPath: key,
        unique: !!config.indexes.unique,
        multiEntry: !!config.indexes.multiEntry,
      });

      indexNames.add(key);
    }

    fieldConfigs[key] = config;
  }

  // ── Compound indexes ────────────────────────────
  if (options?.compoundIndexes) {
    for (const raw of options.compoundIndexes) {
      if (!Array.isArray(raw) || raw.length < 2) {
        throw errorFactory.definitionError(`Compound index must have at least 2 fields`);
      }

      const name = raw.join('_');

      if (indexNames.has(name)) {
        throw errorFactory.definitionError(`Duplicate index name "${name}"`);
      }

      for (const field of raw) {
        if (!fieldNames.has(field as string)) {
          throw errorFactory.definitionError(`Unknown field "${String(field)}" in compound index`);
        }

        const cfg = fieldConfigs[field as string];
        if (cfg.type === 'boolean') {
          throw errorFactory.definitionError(`Boolean field "${String(field)}" cannot be indexed`);
        }
      }

      indexes.push({
        name,
        keyPath: raw as string[],
        unique: false,
        multiEntry: false,
      });

      indexNames.add(name);
    }
  }

  // ── Schema utility functions ────────────────────
  // Note: These validations are for DX and data integrity within the library.
  // IndexedDB does not enforce these types natively.

  /** Checks if a single value matches the expected type. */
  function checkFieldType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'date':
        return value instanceof Date && !Number.isNaN(value.getTime());
      case 'object':
        return typeof value === 'object' && !Array.isArray(value) && value !== null;
      case 'any':
        return true;
      default:
        return false;
    }
  }

  /** Validates and returns data. Throws with field context on failure. */
  function validate(data: any): {
    valid: boolean;
    field?: string;
    reason?: string;
  } {
    if (typeof data !== 'object' || data === null) {
      return { valid: false, reason: 'Data must be a non-null object' };
    }

    for (const key of fieldNames) {
      const cfg = fieldConfigs[key];
      const value = data[key];

      if (value == null) {
        if (cfg.required) {
          return {
            valid: false,
            field: key,
            reason: 'Field is required',
          };
        }
        continue;
      }

      if (!checkFieldType(value, cfg.type)) {
        return {
          valid: false,
          field: key,
          reason: `Not of type "${cfg.type}"`,
        };
      }
    }

    return { valid: true };
  }

  function parse<T>(data: T) {
    if (typeof data !== 'object' || data === null) {
      throw errorFactory.validationError(typeof data, data, 'Input must be an object');
    }
    const result: Record<string, any> = {};
    for (const key of fieldNames) {
      const field = fieldConfigs[key];
      let value: any = data[key as keyof T];

      // Apply default if value is absent
      if (value === undefined && field.default) {
        value = typeof field.default === 'function' ? field.default() : field.default;
      }

      // Short-circuit null/undefined BEFORE type checks.
      // This prevents typeof null === 'object' from passing 'object' field validation.
      if (value === null || value === undefined) {
        if (field.required) {
          throw errorFactory.validationError(key, value, `"${key}" is required`);
        }
        continue; // optional field — skip type check entirely
      }

      if (!checkFieldType(value, field.type)) {
        throw errorFactory.validationError(key, value, `"${key}" must be of type "${field.type}"`);
      }

      result[key] = value;
    }
    return result;
  }
  // ── Deep-freeze for full immutability ───────────
  for (const key in fieldConfigs) {
    Object.freeze(fieldConfigs[key]);
  }
  Object.freeze(fieldConfigs);

  for (const idx of indexes) {
    Object.freeze(idx);
  }
  Object.freeze(indexes);

  if (primaryKey) Object.freeze(primaryKey);

  return Object.freeze({
    fields: fieldConfigs as SchemaInputToFields<F>,
    indexes,
    PK: primaryKey,
    hasField: (k: string) => fieldNames.has(k),
    getField: (k: string) => fieldConfigs[k],
    validate,
    parse,
  });
};
