import { describe, it, expect } from 'vitest';
import { schema, string, number, boolean, array, object, date } from '../../../src/index';

// Consolidated schema unit tests — deduplicated from multiple smaller files.

describe('Schema - Basic creation & types', () => {
  it('creates a schema with expected field types', () => {
    const s = schema({
      id: number().primary(),
      name: string(),
      active: boolean().optional(),
      tags: array().optional(),
      meta: object().optional(),
      createdAt: date().optional(),
    });

    expect(s.fields.id.type).toBe('number');
    expect(s.fields.name.type).toBe('string');
    expect(s.fields.active.type).toBe('boolean');
    expect(s.PK.keyPath).toBe('id');
  });
});

describe('Schema - Validation & parse', () => {
  const s = schema({
    name: string(),
    age: number().optional(),
    active: boolean().optional(),
  });

  it('validate() returns { valid: true } for good input', () => {
    expect(s.validate({ name: 'Alice', age: 30 })).toEqual({ valid: true });
  });

  it('validate() flags missing required fields', () => {
    const res = s.validate({ age: 20 });
    expect(res.valid).toBe(false);
    expect(res.field).toBe('name');
  });

  it('parse() returns data or throws with field context', () => {
    // provide all fields explicitly to match current parse() behavior
    expect(s.parse({ name: 'Bob', age: 20, active: false })).toEqual({
      name: 'Bob',
      age: 20,
      active: false,
    });
    expect(() => s.parse({ name: 123 })).toThrow();
  });
});

describe('Schema - Indexes & primary key rules', () => {
  it('sets primary and required flags correctly', () => {
    const s = schema({
      uid: number().primary(),
      name: string().index({ unique: true }),
    });
    expect(s.fields.uid.primary).toBe(true);
    expect(s.fields.uid.required).toBe(true);
    expect(s.indexes.find(i => i.keyPath === 'name')).toBeDefined();
  });

  it('rejects multiEntry on non-array fields at runtime (error path)', () => {
    expect(() => schema({ t: string().index({ multiEntry: true }) })).toThrow();
  });
});

describe('Schema - Compound indexes & edge names', () => {
  it('creates compound indexes and names them predictably', () => {
    const s = schema({ a: string(), b: string(), c: number() }, { compoundIndexes: [['a', 'b']] });
    const idx = s.indexes.find(i => i.name === 'a_b');
    expect(idx).toBeDefined();
    expect(idx.keyPath).toEqual(['a', 'b']);
  });

  it('handles unusual field names safely', () => {
    const s = schema({ constructor: string().optional(), $ref: string() });
    expect(s.hasField('$ref')).toBe(true);
    expect(s.hasField('constructor')).toBe(true);
  });
});

describe('Schema - Immutability & structure', () => {
  it('freezes schema objects to avoid accidental mutation', () => {
    const s = schema({ id: number().primary(), name: string() });
    expect(Object.isFrozen(s)).toBe(true);
    expect(Object.isFrozen(s.fields)).toBe(true);
    expect(Object.isFrozen(s.indexes)).toBe(true);
  });
});
