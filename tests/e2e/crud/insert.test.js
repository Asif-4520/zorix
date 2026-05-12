import { expect, it, describe } from 'vitest';
import { DB, number, schema, string, boolean } from '../../../src/index';

// ─── Insert Operations ─────────────────────────────────────────────
// E2E tests for insert() and insertMany() — valid data, type
// validation, constraint enforcement, and batch behavior.

describe('Insert - Single Record', () => {
  let users;

  it('should setup model for insert tests', async () => {
    const db = new DB('zorix-insert-single-test');
    users = await db.model(
      'users',
      schema({
        uid: number().primary(),
        username: string().index({ unique: true }),
        age: number().optional(),
        active: boolean().optional(),
      })
    );
  });

  it('should insert valid data successfully', async () => {
    const key = await users.insert({ uid: 1, username: 'alice', age: 25, active: true });
    expect(key).toBe(1);
  });

  it('should insert with only required fields', async () => {
    const key = await users.insert({ uid: 2, username: 'bob' });
    expect(key).toBe(2);
  });

  it('should reject duplicate primary key', async () => {
    await expect(users.insert({ uid: 1, username: 'charlie' })).rejects.toThrow();
  });

  it('should reject duplicate unique index', async () => {
    await expect(users.insert({ uid: 3, username: 'alice' })).rejects.toThrow();
  });

  it('should reject null data', async () => {
    await expect(users.insert(null)).rejects.toThrow('Data must be a non-null object');
  });

  it('should reject undefined data', async () => {
    await expect(users.insert(undefined)).rejects.toThrow('Data must be a non-null object');
  });

  it('should reject empty object', async () => {
    await expect(users.insert({})).rejects.toThrow('Validation Error');
  });

  it('should reject wrong type for number field', async () => {
    await expect(users.insert({ uid: 'not-a-number', username: 'x' })).rejects.toThrow(
      'Validation Error'
    );
  });

  it('should reject wrong type for string field', async () => {
    await expect(users.insert({ uid: 3, username: 123 })).rejects.toThrow('Validation Error');
  });

  it('should reject missing required primary key', async () => {
    await expect(users.insert({ username: 'dave' })).rejects.toThrow('Validation Error');
  });

  it('should reject missing required username', async () => {
    await expect(users.insert({ uid: 4 })).rejects.toThrow('Validation Error');
  });

  it('should reject non-object data (string)', async () => {
    await expect(users.insert('string')).rejects.toThrow();
  });

  it('should reject non-object data (number)', async () => {
    await expect(users.insert(42)).rejects.toThrow();
  });

  it('should reject non-object data (boolean)', async () => {
    await expect(users.insert(true)).rejects.toThrow();
  });

  it('should reject non-object data (array)', async () => {
    await expect(users.insert([1, 2])).rejects.toThrow();
  });
});

describe('Insert - Batch (insertMany)', () => {
  let model;

  it('should setup model for batch tests', async () => {
    const db = new DB('zorix-insert-batch-test');
    model = await db.model(
      'items',
      schema({
        tid: number().primary(),
        label: string(),
      })
    );
  });

  it('should insert multiple records and return count', async () => {
    const result = await model.insertMany([
      { tid: 1, label: 'A' },
      { tid: 2, label: 'B' },
      { tid: 3, label: 'C' },
    ]);
    expect(result.insertedCount).toBe(3);
  });

  it('should reject empty array', async () => {
    await expect(model.insertMany([])).rejects.toThrow();
  });

  it('should reject non-array argument (object)', async () => {
    await expect(model.insertMany({ tid: 10 })).rejects.toThrow();
  });

  it('should reject invalid data types in batch', async () => {
    await expect(model.insertMany([{ tid: '10', label: 123 }])).rejects.toThrow();
  });

  it('should validate each item in batch', async () => {
    await expect(
      model.insertMany([
        { tid: 10, label: 'valid' },
        { tid: '11', label: 'invalid-uid' },
      ])
    ).rejects.toThrow();
  });

  it('should reject batch with duplicate primary keys', async () => {
    await expect(
      model.insertMany([
        { tid: 20, label: 'x' },
        { tid: 20, label: 'y' },
      ])
    ).rejects.toThrow();
  });

  it('should reject batch with Set objects', async () => {
    await expect(model.insertMany([new Set()])).rejects.toThrow();
  });

  it('should reject batch with Date objects', async () => {
    await expect(model.insertMany([new Date()])).rejects.toThrow();
  });

  it('should reject batch with empty objects', async () => {
    await expect(model.insertMany([{}])).rejects.toThrow();
  });
});

describe('Insert - Auto Increment (no PK)', () => {
  let model;

  it('should setup model without primary key', async () => {
    const db = new DB('zorix-auto-inc-insert-test');
    model = await db.model(
      'items',
      schema({
        title: string(),
        value: number().optional(),
      })
    );
  });

  it('should auto-assign _id to inserted records', async () => {
    await model.insert({ title: 'Item A', value: 10 });
    await model.insert({ title: 'Item B', value: 20 });

    const all = await model.getAll();
    expect(all).toHaveLength(2);
    all.forEach(item => {
      expect(item._id).toBeDefined();
      expect(typeof item._id).toBe('number');
    });
  });

  it('should assign sequential _id values', async () => {
    const all = await model.getAll();
    expect(all[0]._id).toBe(1);
    expect(all[1]._id).toBe(2);
  });

  it('should increment _id for new inserts', async () => {
    const key = await model.insert({ title: 'Item C' });
    expect(key).toBe(3);
  });
});
