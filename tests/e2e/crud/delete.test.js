import { expect, it, describe, beforeAll } from 'vitest';
import { DB, number, schema, string } from '../../../src/index';

// ─── Delete Operations ─────────────────────────────────────────────
// E2E tests for delete() — single/batch deletion, count verification,
// and non-matching queries.

let model;

describe('Delete Operations', () => {
  beforeAll(async () => {
    const db = new DB('zorix-delete-test-v2');
    model = await db.model(
      'products',
      schema({
        pid: number().primary(),
        name: string().index({ unique: true }),
        price: number(),
      })
    );

    await model.insertMany([
      { pid: 1, name: 'Widget', price: 10 },
      { pid: 2, name: 'Gadget', price: 20 },
      { pid: 3, name: 'Doohickey', price: 30 },
      { pid: 4, name: 'Thingamajig', price: 40 },
      { pid: 5, name: 'Whatchamacallit', price: 50 },
    ]);
  });

  it('should delete a record by primary key', async () => {
    const result = await model.delete({ where: { pid: 1 } });
    expect(result.deletedCount).toBe(1);

    const deleted = await model.get(1);
    expect(deleted).toBeUndefined();
  });

  it('should delete by string field', async () => {
    const result = await model.delete({ where: { name: 'Gadget' } });
    expect(result.deletedCount).toBe(1);
  });

  it('should delete by numeric condition', async () => {
    const result = await model.delete({ where: { price: 30 } });
    expect(result.deletedCount).toBe(1);
  });

  it('should return deletedCount: 0 for non-matching query', async () => {
    const result = await model.delete({ where: { name: 'DOES_NOT_EXIST' } });
    expect(result.deletedCount).toBe(0);
  });

  it('should verify remaining records after deletions', async () => {
    const remaining = await model.getAll();
    expect(remaining).toHaveLength(2); // 5 - 3 deleted
  });
});

describe('Delete - Clear All', () => {
  let clearModel;

  beforeAll(async () => {
    const db = new DB('zorix-clear-test-v2');
    clearModel = await db.model('items', schema({ name: string() }));

    await clearModel.insertMany([{ name: 'A' }, { name: 'B' }, { name: 'C' }]);
  });

  it('should clear all records', async () => {
    await clearModel.clear();
    const count = await clearModel.count();
    expect(count).toBe(0);
  });

  it('should return empty array after clear', async () => {
    const all = await clearModel.getAll();
    expect(all).toEqual([]);
  });
});
