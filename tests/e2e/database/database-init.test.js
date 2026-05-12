import { describe, it, expect } from 'vitest';
import { DB, schema, string } from '../../../src/index';

// ─── Database Initialization ────────────────────────────────────────
// E2E tests for DB initialization, schema creation, and store setup.

describe('Database Initialization', () => {
  it('should initialize database and create model', async () => {
    const db = new DB('zorix-init-test');
    const user = await db.model('users', schema({ username: string() }));
    expect(user).toBeDefined();
  });

  it('should reject duplicate store names', async () => {
    const db = new DB('zorix-dup-store-test');
    await db.model('users', schema({ username: string() }));
    await expect(db.model('users', schema({ email: string() }))).rejects.toThrow(
      'Store with name "users" already exists'
    );
  });

  it('should reject non-string store name', async () => {
    const db = new DB('zorix-model-name-test');
    await expect(db.model(123, schema({ x: string() }))).rejects.toThrow('Invalid');
  });

  it('should allow multiple different stores', async () => {
    const db = new DB('zorix-multi-init-test');
    const users = await db.model('users', schema({ name: string() }));
    const orders = await db.model('orders', schema({ item: string() }));
    expect(users).toBeDefined();
    expect(orders).toBeDefined();
  });
});

describe('Database Transaction Validation', () => {
  it('should reject invalid store name type for tx()', async () => {
    const db = new DB('zorix-tx-name-test');
    await db.model('test', schema({ x: string() }));
    await expect(db.tx(123, 'readonly')).rejects.toThrow('Invalid');
  });

  it('should reject empty string store name for tx()', async () => {
    const db = new DB('zorix-tx-empty-test');
    await db.model('test', schema({ x: string() }));
    await expect(db.tx('', 'readonly')).rejects.toThrow('empty');
  });

  it('should reject invalid transaction mode', async () => {
    const db = new DB('zorix-tx-mode-test');
    await db.model('test', schema({ x: string() }));
    await expect(db.tx('test', 'invalid')).rejects.toThrow('Invalid transaction mode');
  });
});
