import { expect, it, describe, beforeAll } from 'vitest';
import { DB, number, schema, string, boolean, array } from '../../../src/index';

// ─── Edge Cases & Security ──────────────────────────────────────────
// E2E tests for worst-case scenarios: auto-increment, multi-store,
// validation, special characters, large payloads, and malicious inputs.

describe('Auto Increment (no explicit PK)', () => {
  let model;

  beforeAll(async () => {
    const db = new DB('zorix-edge-autoinc-v2');
    model = await db.model(
      'items',
      schema({
        title: string(),
        value: number().optional(),
      })
    );

    await model.insertMany([
      { title: 'Item A', value: 10 },
      { title: 'Item B', value: 20 },
      { title: 'Item C', value: 30 },
    ]);
  });

  it('should auto-assign _id to each record', async () => {
    const all = await model.getAll();
    expect(all).toHaveLength(3);
    all.forEach(item => {
      expect(item._id).toBeDefined();
      expect(typeof item._id).toBe('number');
    });
  });

  it('should assign sequential _id values', async () => {
    const all = await model.getAll();
    expect(all[0]._id).toBe(1);
    expect(all[1]._id).toBe(2);
    expect(all[2]._id).toBe(3);
  });

  it('should retrieve by auto-generated _id', async () => {
    const record = await model.get(1);
    expect(record).toBeDefined();
    expect(record.title).toBe('Item A');
  });

  it('should count records correctly', async () => {
    expect(await model.count()).toBe(3);
  });

  it('should find records by field value', async () => {
    const result = await model.find({ where: { title: 'Item B' } });
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(20);
  });

  it('should insert without providing _id', async () => {
    const key = await model.insert({ title: 'Item D', value: 40 });
    expect(key).toBe(4);
  });
});

describe('Multiple Stores in one DB', () => {
  let users, orders;

  beforeAll(async () => {
    const db = new DB('zorix-edge-multistore-v2');
    users = await db.model(
      'users',
      schema({
        userId: number().primary(),
        name: string(),
      })
    );
    orders = await db.model(
      'orders',
      schema({
        orderId: number().primary(),
        product: string(),
        quantity: number().optional(),
      })
    );

    await users.insert({ userId: 1, name: 'Alice' });
    await orders.insert({ orderId: 100, product: 'Widget', quantity: 3 });
  });

  it('should store data independently per store', async () => {
    expect(await users.getAll()).toHaveLength(1);
    expect(await orders.getAll()).toHaveLength(1);
  });

  it('should query each store independently', async () => {
    const user = await users.get(1);
    expect(user.name).toBe('Alice');

    const order = await orders.get(100);
    expect(order.product).toBe('Widget');
  });

  it('should not cross-contaminate stores', async () => {
    const userResult = await users.getAll();
    expect(userResult.every(u => u.name !== undefined)).toBe(true);
    expect(userResult.every(u => u.product === undefined)).toBe(true);
  });
});

describe('Insert Validation (schema.parse integration)', () => {
  let model;

  beforeAll(async () => {
    const db = new DB('zorix-edge-validation-v2');
    model = await db.model(
      'entries',
      schema({
        eid: number().primary(),
        label: string(),
        active: boolean().optional(),
        tags: array().optional(),
      })
    );
  });

  it('should accept valid data', async () => {
    await expect(
      model.insert({ eid: 1, label: 'Valid', active: true, tags: ['a'] })
    ).resolves.toBeDefined();
  });

  it('should reject wrong type for string field', async () => {
    await expect(model.insert({ eid: 2, label: 123 })).rejects.toThrow('Validation Error');
  });

  it('should reject wrong type for boolean field', async () => {
    await expect(model.insert({ eid: 3, label: 'X', active: 'yes' })).rejects.toThrow(
      'Validation Error'
    );
  });

  it('should reject wrong type for array field', async () => {
    await expect(model.insert({ eid: 4, label: 'X', tags: 'not-array' })).rejects.toThrow(
      'Validation Error'
    );
  });

  it('should reject missing required field', async () => {
    await expect(model.insert({ eid: 5 })).rejects.toThrow('Validation Error');
  });

  it('should reject null data', async () => {
    await expect(model.insert(null)).rejects.toThrow();
  });

  it('should reject string data', async () => {
    await expect(model.insert('string')).rejects.toThrow();
  });

  it('should reject number data', async () => {
    await expect(model.insert(42)).rejects.toThrow();
  });
});

describe('insertMany Edge Cases', () => {
  let model;

  beforeAll(async () => {
    const db = new DB('zorix-edge-insertmany-v2');
    model = await db.model(
      'things',
      schema({
        tid: number().primary(),
        label: string(),
      })
    );
  });

  it('should reject empty array', async () => {
    await expect(model.insertMany([])).rejects.toThrow();
  });

  it('should reject non-array argument', async () => {
    await expect(model.insertMany({ tid: 1 })).rejects.toThrow();
  });

  it('should return insertedCount on success', async () => {
    const result = await model.insertMany([
      { tid: 1, label: 'A' },
      { tid: 2, label: 'B' },
    ]);
    expect(result.insertedCount).toBe(2);
  });
});

describe('Special Characters in Data', () => {
  let model;

  beforeAll(async () => {
    const db = new DB('zorix-edge-special-chars-v2');
    model = await db.model(
      'notes',
      schema({
        title: string(),
        content: string().optional(),
      })
    );
  });

  it('should handle unicode characters', async () => {
    await model.insert({ title: '日本語テスト', content: '🎉' });
    const result = await model.find({ where: { title: '日本語テスト' } });
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('🎉');
  });

  it('should handle very long strings', async () => {
    const longStr = 'x'.repeat(10000);
    await model.insert({ title: longStr });
    const result = await model.find({ where: { title: longStr } });
    expect(result).toHaveLength(1);
    expect(result[0].title.length).toBe(10000);
  });

  it('should handle empty string values', async () => {
    await model.insert({ title: '' });
    const result = await model.find({ where: { title: '' } });
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle special regex characters safely', async () => {
    await model.insert({ title: 'test.*+?^${}()|[]\\/' });
    const result = await model.find({ where: { title: 'test.*+?^${}()|[]\\/' } });
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle HTML-like strings (XSS payload)', async () => {
    await model.insert({ title: '<script>alert("xss")</script>' });
    const result = await model.find({ where: { title: '<script>alert("xss")</script>' } });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].title).toBe('<script>alert("xss")</script>');
  });

  it('should handle SQL injection-like strings safely', async () => {
    await model.insert({ title: "'; DROP TABLE users; --" });
    const result = await model.find({ where: { title: "'; DROP TABLE users; --" } });
    expect(result.length).toBeGreaterThan(0);
  });
});
