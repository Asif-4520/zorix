import { beforeAll, describe, expect, it } from 'vitest';
import { array, boolean, DB, schema, string } from '../../../src/index';

// ─── Update Operations ─────────────────────────────────────────────
// E2E tests for update() — matching, partial updates, validation,
// and non-matching queries.

let model;

describe('Update Operations', () => {
  beforeAll(async () => {
    const db = new DB('zorix-update-test-v2');
    model = await db.model(
      'employees',
      schema({
        name: string(),
        role: string(),
        active: boolean(),
        tags: array().index({ multiEntry: true }),
      })
    );

    await model.insertMany([
      { name: 'Alice', role: 'engineer', active: true, tags: ['dev', 'js'] },
      { name: 'Bob', role: 'designer', active: true, tags: ['design', 'figma'] },
      { name: 'Carol', role: 'engineer', active: false, tags: ['dev', 'python'] },
      { name: 'Dave', role: 'manager', active: true, tags: ['lead'] },
      { name: 'Eve', role: 'engineer', active: true, tags: ['dev', 'go'] },
    ]);
  });

  it('should update a single field by name', async () => {
    await model.update({ where: { name: 'Alice' } }, { role: 'senior-engineer' });
    const result = await model.find({ where: { name: 'Alice' } });
    expect(result[0].role).toBe('senior-engineer');
  });

  it('should update active status', async () => {
    await model.update({ where: { name: 'Carol' } }, { active: true });
    const result = await model.find({ where: { name: 'Carol' } });
    expect(result[0].active).toBe(true);
  });

  it('should update tags array', async () => {
    await model.update({ where: { name: 'Bob' } }, { tags: ['design', 'sketch'] });
    const result = await model.find({ where: { name: 'Bob' } });
    expect(result[0].tags).toEqual(['design', 'sketch']);
  });

  it('should update multiple matching records', async () => {
    const result = await model.update({ where: { role: 'engineer' } }, { active: false });
    expect(result.updatedCount).toBeGreaterThanOrEqual(2);

    const engineers = await model.find({ where: { role: 'engineer' } });
    expect(engineers.every(e => e.active === false)).toBe(true);
  });

  it('should return updatedCount: 0 for non-matching query', async () => {
    const result = await model.update({ where: { name: 'DOES_NOT_EXIST' } }, { role: 'fired' });
    expect(result.updatedCount).toBe(0);
  });

  it('should update records found by tag includes', async () => {
    await model.update({ where: { tags: { includes: 'dev' } } }, { tags: ['dev', 'updated'] });
    const devs = await model.find({ where: { tags: { includes: 'updated' } } });
    expect(devs.length).toBeGreaterThan(0);
  });

  it('should preserve untouched fields during update', async () => {
    await model.update({ where: { name: 'Dave' } }, { role: 'director' });
    const dave = await model.find({ where: { name: 'Dave' } });
    expect(dave[0].name).toBe('Dave');
    expect(dave[0].active).toBe(true);
    expect(dave[0].tags).toEqual(['lead']);
    expect(dave[0].role).toBe('director');
  });
});
