import { expect, it, describe } from 'vitest';
import { schema, string, number, boolean, array } from '../../../src/index';

// ─── Schema Indexing ────────────────────────────────────────────────
// Tests for single-field indexes, compound indexes, multiEntry,
// unique constraints, and invalid index configurations.

describe('Schema - Single Field Indexes', () => {
  it('should create an index with default options', () => {
    const s = schema({ email: string().index() });
    expect(s.indexes).toHaveLength(1);
    expect(s.indexes[0]).toEqual({
      name: 'email',
      keyPath: 'email',
      unique: false,
      multiEntry: false,
    });
  });

  it('should create a unique index', () => {
    const s = schema({ email: string().index({ unique: true }) });
    expect(s.indexes[0].unique).toBe(true);
    expect(s.indexes[0].multiEntry).toBe(false);
  });

  it('should create a multiEntry index on array field', () => {
    const s = schema({ tags: array().index({ multiEntry: true }) });
    expect(s.indexes[0].multiEntry).toBe(true);
  });

  it('should allow index without being primary key', () => {
    const s = schema({ name: string().index() });
    expect(s.fields.name.indexes).toBeDefined();
    expect(s.fields.name.primary).toBe(false);
  });

  it('should allow a field without any index', () => {
    const s = schema({ name: string() });
    expect(s.fields.name.indexes).toBeUndefined();
  });

  it('should create multiple indexes on different fields', () => {
    const s = schema({
      email: string().index({ unique: true }),
      age: number().index(),
      tags: array().index({ multiEntry: true }),
    });
    expect(s.indexes).toHaveLength(3);
  });
});

describe('Schema - Invalid Indexes', () => {
  it('should throw when indexing a boolean field', () => {
    expect(() => schema({ flag: boolean().index() })).toThrow(/Boolean field.*cannot be indexed/);
  });

  it('should throw when using multiEntry on non-array field', () => {
    expect(() => schema({ name: string().index({ multiEntry: true }) })).toThrow(
      /multiEntry.*only allowed on arrays/
    );
  });

  it('should throw when indexing a primary key field', () => {
    expect(() => schema({ id: string().primary().index({ unique: true }) })).toThrow(
      /Primary keys are indexed by default/
    );
  });
});

describe('Schema - Compound Indexes (Valid)', () => {
  it('should create a compound index with two fields', () => {
    const s = schema(
      {
        firstName: string(),
        lastName: string(),
        age: number(),
      },
      { compoundIndexes: [['firstName', 'lastName']] }
    );
    const idx = s.indexes.find(i => i.name === 'firstName_lastName');
    expect(idx).toBeDefined();
    expect(idx.keyPath).toEqual(['firstName', 'lastName']);
    expect(idx.unique).toBe(false);
    expect(idx.multiEntry).toBe(false);
  });

  it('should create multiple compound indexes', () => {
    const s = schema(
      {
        a: string(),
        b: string(),
        c: number(),
      },
      {
        compoundIndexes: [
          ['a', 'b'],
          ['b', 'c'],
        ],
      }
    );
    expect(s.indexes.find(i => i.name === 'a_b')).toBeDefined();
    expect(s.indexes.find(i => i.name === 'b_c')).toBeDefined();
  });

  it('should create compound index with three fields', () => {
    const s = schema(
      {
        a: string(),
        b: string(),
        c: number(),
      },
      { compoundIndexes: [['a', 'b', 'c']] }
    );
    const idx = s.indexes.find(i => i.name === 'a_b_c');
    expect(idx).toBeDefined();
    expect(idx.keyPath).toEqual(['a', 'b', 'c']);
  });
});

describe('Schema - Compound Indexes (Invalid)', () => {
  it('should throw for compound index with less than 2 fields', () => {
    expect(() => schema({ name: string() }, { compoundIndexes: [['name']] })).toThrow(
      'at least 2 fields'
    );
  });

  it('should throw for compound index with unknown field', () => {
    expect(() =>
      schema({ username: string(), age: number() }, { compoundIndexes: [['username', 'phone']] })
    ).toThrow(/Unknown field "phone" in compound index/);
  });

  it('should throw for compound index containing boolean field', () => {
    expect(() =>
      schema(
        { username: string(), isAdult: boolean() },
        { compoundIndexes: [['isAdult', 'username']] }
      )
    ).toThrow(/Boolean field.*cannot be indexed/);
  });

  it('should throw for empty compound index array', () => {
    expect(() => schema({ name: string() }, { compoundIndexes: [[]] })).toThrow(
      'at least 2 fields'
    );
  });
});
