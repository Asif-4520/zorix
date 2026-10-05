import { expect, it, describe, vi } from 'vitest';
import { DB, number, schema, string } from '../../../src/index';

describe('Model & DB Event Lifecycle Integration (E2E Browser)', () => {
  it('should emit CRUD mutation events on Model and DB instances', async () => {
    const db = new DB('zorix-events-test-' + Date.now(), { version: 1 });

    const dbChangeFn = vi.fn();
    const modelInsertFn = vi.fn();
    const modelUpdateFn = vi.fn();
    const modelDeleteFn = vi.fn();

      db.on('change', dbChangeFn);

    const Users = await db.model(
      'users',
      schema({
        id: number().primary(),
        name: string(),
      })
    );

    Users.on('insert', modelInsertFn);
    Users.on('update', modelUpdateFn);
    Users.on('delete', modelDeleteFn);

    // Insert
    await Users.insert({ id: 1, name: 'Alice' });
    expect(modelInsertFn).toHaveBeenCalledTimes(1);
    expect(dbChangeFn).toHaveBeenCalledWith(
      expect.objectContaining({ storeName: 'users', action: 'insert' })
    );

    // Update
    await Users.update({ where: { id: { eq: 1 } } }, { name: 'Alice Updated' });
    expect(modelUpdateFn).toHaveBeenCalledTimes(1);

    // Delete
    await Users.delete({ where: { id: { eq: 1 } } });
    expect(modelDeleteFn).toHaveBeenCalledTimes(1);

    db.close();
  });
});
