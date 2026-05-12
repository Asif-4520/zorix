import { expect, it, describe, beforeAll } from 'vitest';
import { array, boolean, DB, number, schema, string } from '../../../src/index';

// ─── Read / Query Operations ────────────────────────────────────────
// E2E tests for get(), getAll(), find() — filters, operators,
// pagination, sorting, and edge cases.

let users;

function expectSortedBy(arr, key, direction = 'asc') {
  const sorted = [...arr].sort((a, b) => (direction === 'asc' ? a[key] - b[key] : b[key] - a[key]));
  expect(arr).toEqual(sorted);
}

describe('Read Operations', () => {
  beforeAll(async () => {
    const db = new DB('zorix-read-query-test');
    users = await db.model(
      'users',
      schema({
        uid: number().primary(),
        username: string().index({ unique: true }),
        age: number(),
        isAdmin: boolean(),
        city: string(),
        ph: number().index(),
        tags: array().index({ multiEntry: true }),
      })
    );

    await users.insertMany([
      {
        uid: 1,
        username: 'user1',
        age: 21,
        isAdmin: false,
        city: 'Kolkata',
        ph: 9000000001,
        tags: ['user', 'test'],
      },
      {
        uid: 2,
        username: 'user2',
        age: 22,
        isAdmin: false,
        city: 'Delhi',
        ph: 9000000002,
        tags: ['user'],
      },
      {
        uid: 3,
        username: 'user3',
        age: 23,
        isAdmin: true,
        city: 'Mumbai',
        ph: 9000000003,
        tags: ['admin'],
      },
      {
        uid: 4,
        username: 'user4',
        age: 24,
        isAdmin: false,
        city: 'Chennai',
        ph: 9000000004,
        tags: ['user', 'premium'],
      },
      {
        uid: 5,
        username: 'user5',
        age: 25,
        isAdmin: false,
        city: 'Bangalore',
        ph: 9000000005,
        tags: ['user'],
      },
      {
        uid: 6,
        username: 'user6',
        age: 26,
        isAdmin: true,
        city: 'Hyderabad',
        ph: 9000000006,
        tags: ['admin', 'test'],
      },
      {
        uid: 7,
        username: 'user7',
        age: 27,
        isAdmin: false,
        city: 'Pune',
        ph: 9000000007,
        tags: ['user'],
      },
      {
        uid: 8,
        username: 'user8',
        age: 28,
        isAdmin: false,
        city: 'Jaipur',
        ph: 9000000008,
        tags: ['user', 'beta'],
      },
      {
        uid: 9,
        username: 'user9',
        age: 29,
        isAdmin: false,
        city: 'Lucknow',
        ph: 9000000009,
        tags: ['user'],
      },
      {
        uid: 10,
        username: 'user10',
        age: 30,
        isAdmin: true,
        city: 'Ahmedabad',
        ph: 9000000010,
        tags: ['admin'],
      },
    ]);
  });

  // ── getAll() ────────────────────────────────────────────────
  it('should return all 10 records', async () => {
    const result = await users.getAll();
    expect(result).toHaveLength(10);
  });

  // ── get() ───────────────────────────────────────────────────
  it('should fetch a user by primary key', async () => {
    const user = await users.get(1);
    expect(user).toMatchObject({ uid: 1, username: 'user1' });
  });

  it('should return undefined for non-existing primary key', async () => {
    await expect(users.get(999)).resolves.toBeUndefined();
  });

  // ── find() - eq (shorthand) ─────────────────────────────────
  it('should filter by single field (eq shorthand)', async () => {
    const result = await users.find({ where: { username: 'user2' } });
    expect(result).toHaveLength(1);
    expect(result[0].uid).toBe(2);
  });

  it('should filter by multiple fields', async () => {
    const result = await users.find({
      where: { uid: 2, username: 'user2', age: 22 },
    });
    expect(result).toHaveLength(1);
  });

  it('should return empty array for no match', async () => {
    const result = await users.find({ where: { username: 'not-exist' } });
    expect(result).toEqual([]);
  });

  // ── find() - gt ─────────────────────────────────────────────
  it('should filter with gt operator', async () => {
    const result = await users.find({ where: { age: { gt: 22 } } });
    expect(result).toHaveLength(8);
    expect(result.every(u => u.age > 22)).toBe(true);
  });

  // ── find() - gte ────────────────────────────────────────────
  it('should filter with gte operator', async () => {
    const result = await users.find({ where: { age: { gte: 25 } } });
    expect(result.every(u => u.age >= 25)).toBe(true);
  });

  // ── find() - lt ─────────────────────────────────────────────
  it('should filter with lt operator', async () => {
    const result = await users.find({ where: { age: { lt: 24 } } });
    expect(result.every(u => u.age < 24)).toBe(true);
  });

  // ── find() - lte ────────────────────────────────────────────
  it('should filter with lte operator', async () => {
    const result = await users.find({ where: { age: { lte: 23 } } });
    expect(result.every(u => u.age <= 23)).toBe(true);
  });

  // ── find() - neq ────────────────────────────────────────────
  it('should filter with neq operator', async () => {
    const result = await users.find({ where: { city: { neq: 'Kolkata' } } });
    expect(result.every(u => u.city !== 'Kolkata')).toBe(true);
  });

  // ── find() - between ────────────────────────────────────────
  it('should filter with between operator', async () => {
    const result = await users.find({ where: { age: { between: [22, 28] } } });
    expect(result).toHaveLength(7);
    expect(result.every(u => u.age >= 22 && u.age <= 28)).toBe(true);
  });

  // ── find() - combined range (gt + lt) ───────────────────────
  it('should filter with combined gt + lt', async () => {
    const result = await users.find({ where: { age: { gt: 22, lt: 28 } } });
    expect(result.every(u => u.age > 22 && u.age < 28)).toBe(true);
  });

  it('should filter with combined gte + lte', async () => {
    const result = await users.find({ where: { age: { gte: 22, lte: 28 } } });
    expect(result.every(u => u.age >= 22 && u.age <= 28)).toBe(true);
  });

  // ── find() - startsWith ─────────────────────────────────────
  it('should filter with startsWith', async () => {
    const result = await users.find({ where: { username: { startsWith: 'user' } } });
    expect(result).toHaveLength(10);
    expect(result.every(u => u.username.startsWith('user'))).toBe(true);
  });

  it('should filter startsWith with more specific prefix', async () => {
    const result = await users.find({ where: { username: { startsWith: 'user1' } } });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(u => u.username.startsWith('user1'))).toBe(true);
  });

  // ── find() - includes (multiEntry) ──────────────────────────
  it('should filter with multiEntry index (includes)', async () => {
    const result = await users.find({ where: { tags: { includes: 'admin' } } });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(u => u.tags.includes('admin'))).toBe(true);
  });

  it('should filter multiEntry with no matches', async () => {
    const result = await users.find({ where: { tags: { includes: 'unknown-tag' } } });
    expect(result).toEqual([]);
  });

  // ── find() - combined conditions ────────────────────────────
  it('should filter with age > 25 AND isAdmin true', async () => {
    const result = await users.find({
      where: { age: { gt: 25 }, isAdmin: true },
    });
    expect(result).toHaveLength(2);
    expect(result.every(u => u.age > 25 && u.isAdmin)).toBe(true);
  });

  it('should filter with between + includes + boolean', async () => {
    const result = await users.find({
      where: {
        age: { between: [22, 28] },
        tags: { includes: 'user' },
        isAdmin: false,
      },
    });
    expect(result).toHaveLength(5);
    expect(
      result.every(u => u.age >= 22 && u.age <= 28 && u.tags.includes('user') && !u.isAdmin)
    ).toBe(true);
  });

  it('should combine startsWith + gt', async () => {
    const result = await users.find({
      where: { username: { startsWith: 'user' }, age: { gt: 25 } },
    });
    expect(result).toHaveLength(5);
    expect(result.every(u => u.username.startsWith('user') && u.age > 25)).toBe(true);
  });

  // ── find() - limit ──────────────────────────────────────────
  it('should limit results', async () => {
    const result = await users.find({
      where: { tags: { includes: 'user' } },
      limit: 2,
    });
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('should limit to 1', async () => {
    const result = await users.find({
      where: { age: { gt: 20 } },
      limit: 1,
    });
    expect(result).toHaveLength(1);
  });

  // ── find() - offset ─────────────────────────────────────────
  it('should skip records with offset', async () => {
    const all = await users.find({ where: { age: { gt: 20 } } });
    const withOffset = await users.find({
      where: { age: { gt: 20 } },
      offset: 3,
    });
    expect(withOffset.length).toBe(all.length - 3);
  });

  // ── find() - orderBy ────────────────────────────────────────
  it('should sort by age ascending', async () => {
    const result = await users.find({
      where: { tags: { includes: 'test' } },
      orderBy: { field: 'age', direction: 'asc' },
    });
    expectSortedBy(result, 'age', 'asc');
  });

  it('should sort by age descending', async () => {
    const result = await users.find({
      where: { tags: { includes: 'test' } },
      orderBy: { field: 'age', direction: 'desc' },
    });
    expectSortedBy(result, 'age', 'desc');
  });

  // ── find() - invalid queries ────────────────────────────────
  it('should throw for unknown operator', async () => {
    await expect(users.find({ where: { age: { gts: 25 } } })).rejects.toThrow();
  });

  it('should throw for missing where clause', async () => {
    await expect(users.find({})).rejects.toThrow();
  });

  it('should throw for null query', async () => {
    await expect(users.find(null)).rejects.toThrow();
  });

  // ── Data integrity ──────────────────────────────────────────
  it('should maintain data integrity across queries', async () => {
    const all1 = await users.getAll();
    const all2 = await users.getAll();
    expect(all1).toEqual(all2);
  });

  it('should enforce unique username constraint', async () => {
    await expect(
      users.insert({
        uid: 11,
        username: 'user1',
        age: 40,
        isAdmin: false,
        city: 'Test',
        ph: 9999999999,
        tags: ['user'],
      })
    ).rejects.toBeDefined();
  });
});
