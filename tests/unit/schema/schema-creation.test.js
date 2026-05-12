import { expect, it, describe } from 'vitest';
import { schema, string, number, boolean, array, object, date } from '../../../src/index';

// ─── Schema Creation ────────────────────────────────────────────────
// Tests for the schema() factory function — basic creation, all field
// types, structure preservation, and immutability guarantees.

describe('Schema Creation - Basic Field Types', () => {
  it('should create a schema with a string field', () => {
    const s = schema({ name: string() });
    expect(s.fields.name.type).toBe('string');
  });

  it('should create a schema with a number field', () => {
    const s = schema({ age: number() });
    expect(s.fields.age.type).toBe('number');
  });

  it('should create a schema with a boolean field', () => {
    const s = schema({ isActive: boolean() });
    expect(s.fields.isActive.type).toBe('boolean');
  });

  it('should create a schema with an array field', () => {
    const s = schema({ tags: array() });
    expect(s.fields.tags.type).toBe('array');
  });

  it('should create a schema with an object field', () => {
    const s = schema({ address: object() });
    expect(s.fields.address.type).toBe('object');
  });

  it('should create a schema with a date field', () => {
    const s = schema({ createdAt: date() });
    expect(s.fields.createdAt.type).toBe('date');
  });

  it('should create a schema with all field types combined', () => {
    const s = schema({
      name: string(),
      age: number(),
      active: boolean(),
      tags: array(),
      meta: object(),
      createdAt: date(),
    });
    expect(Object.keys(s.fields)).toHaveLength(6);
    expect(s.fields.name.type).toBe('string');
    expect(s.fields.age.type).toBe('number');
    expect(s.fields.active.type).toBe('boolean');
    expect(s.fields.tags.type).toBe('array');
    expect(s.fields.meta.type).toBe('object');
    expect(s.fields.createdAt.type).toBe('date');
  });
});

describe('Schema Creation - Structure Integrity', () => {
  it('should preserve all field names in order', () => {
    const s = schema({
      id: string(),
      age: number(),
      role: string(),
    });
    expect(Object.keys(s.fields)).toEqual(['id', 'age', 'role']);
  });

  it('should not mutate the original input object', () => {
    const input = { id: string() };
    schema(input);
    expect(input.id).toBeDefined();
    expect(input.id.config).toBeDefined();
  });

  it('should not share field instances between schemas', () => {
    const s1 = schema({ id: string() });
    const s2 = schema({ id: string() });
    expect(s1.fields.id).not.toBe(s2.fields.id);
  });

  it('should handle schema with a single field', () => {
    const s = schema({ solo: string() });
    expect(Object.keys(s.fields)).toEqual(['solo']);
  });

  it('should handle schema with 50 fields', () => {
    const fields = {};
    for (let i = 0; i < 50; i++) {
      fields['field_' + i] = string();
    }
    const s = schema(fields);
    expect(Object.keys(s.fields)).toHaveLength(50);
  });

  it('should handle schema with 100 fields', () => {
    const fields = {};
    for (let i = 0; i < 100; i++) {
      fields['f' + i] = i % 2 === 0 ? string() : number();
    }
    const s = schema(fields);
    expect(Object.keys(s.fields)).toHaveLength(100);
  });
});

describe('Schema Creation - Immutability (Deep Freeze)', () => {
  const s = schema({
    id: number().primary(),
    name: string().index({ unique: true }),
    tags: array().index({ multiEntry: true }),
  });

  it('should freeze the top-level schema object', () => {
    expect(Object.isFrozen(s)).toBe(true);
  });

  it('should freeze the fields map', () => {
    expect(Object.isFrozen(s.fields)).toBe(true);
  });

  it('should freeze individual field configs', () => {
    expect(Object.isFrozen(s.fields.id)).toBe(true);
    expect(Object.isFrozen(s.fields.name)).toBe(true);
    expect(Object.isFrozen(s.fields.tags)).toBe(true);
  });

  it('should freeze index definitions array', () => {
    expect(Object.isFrozen(s.indexes)).toBe(true);
  });

  it('should freeze each index definition object', () => {
    s.indexes.forEach(idx => {
      expect(Object.isFrozen(idx)).toBe(true);
    });
  });

  it('should freeze PK definition', () => {
    expect(Object.isFrozen(s.PK)).toBe(true);
  });

  it('should throw when trying to modify a field type', () => {
    expect(() => {
      s.fields.id.type = 'string';
    }).toThrow();
    expect(s.fields.id.type).toBe('number');
  });

  it('should throw when trying to add new fields', () => {
    expect(() => {
      s.fields.newField = { type: 'string' };
    }).toThrow();
  });

  it('should throw when trying to push to indexes array', () => {
    expect(() => {
      s.indexes.push({ name: 'hack' });
    }).toThrow();
  });

  it('should throw when trying to modify PK keyPath', () => {
    expect(() => {
      s.PK.keyPath = 'hacked';
    }).toThrow();
  });

  it('should throw when trying to reassign PK', () => {
    expect(() => {
      s.PK = null;
    }).toThrow();
  });

  it('should throw when trying to reassign fields', () => {
    expect(() => {
      s.fields = {};
    }).toThrow();
  });
});
