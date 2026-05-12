import { describe, it, beforeAll, expect } from 'vitest';
import { DB, number, schema, string } from '../../../src/index';

// Concise advanced CRUD smoke test — keeps essential coverage while avoiding
// duplication with other E2E files. This is a single, fast scenario.

describe('Advanced CRUD Smoke Test', () => {
  let model;

  beforeAll(async () => {
    const db = new DB('zorix-advanced-smoke');
    model = await db.model(
      'products',
      schema({
        pid: number().primary(),
        name: string().index({ unique: true }),
        price: number(),
      })
    );

    await model.clear();
    await model.insertMany([
      { pid: 1, name: 'A', price: 10 },
      { pid: 2, name: 'B', price: 20 },
      { pid: 3, name: 'C', price: 30 },
    ]);
  });

  it('performs a basic lifecycle: insert, find, update, delete', async () => {
    expect(await model.count()).toBe(3);

    const found = await model.find({ where: { name: 'B' } });
    expect(found).toHaveLength(1);

    await model.update({ where: { pid: 2 } }, { price: 25 });
    expect((await model.get(2)).price).toBe(25);

    await model.delete({ where: { pid: 3 } });
    expect(await model.get(3)).toBeUndefined();

    await model.clear();
    expect(await model.count()).toBe(0);
  });
});
