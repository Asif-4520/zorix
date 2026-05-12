import { expect, it, describe } from 'vitest';
import { schema, string, number, boolean, array, object } from '../../../src/index';

// ─── Primary Key Configuration ──────────────────────────────────────
// Tests for primary key rules: single PK, type restrictions, required
// enforcement, and auto-increment behavior.

describe('Schema - Primary Key (Valid)', () => {
  it('should allow a string primary key', () => {
    const s = schema({ id: string().primary() });
    expect(s.PK).not.toBeNull();
    expect(s.PK.keyPath).toBe('id');
    expect(s.PK.name).toBe('id');
    expect(s.PK.autoIncrement).toBe(false);
  });

  it('should allow a number primary key', () => {
    const s = schema({ uid: number().primary() });
    expect(s.PK.keyPath).toBe('uid');
  });

  it('should make primary field required automatically', () => {
    const s = schema({ id: string().primary() });
    expect(s.fields.id.required).toBe(true);
  });

  it('should set primary flag on field config', () => {
    const s = schema({ id: string().primary() });
    expect(s.fields.id.primary).toBe(true);
  });

  it('should have PK as null when no primary key is declared', () => {
    const s = schema({ name: string(), age: number() });
    expect(s.PK).toBeNull();
  });
});

describe('Schema - Primary Key (Invalid)', () => {
  it('should throw error for multiple primary keys', () => {
    expect(() =>
      schema({
        id: string().primary(),
        uid: number().primary(),
      })
    ).toThrow(/Multiple primary keys/);
  });

  it('should throw error for boolean primary key', () => {
    expect(() =>
      schema({
        flag: boolean().primary(),
      })
    ).toThrow(/Primary key.*must be string or number/);
  });

  it('should throw error for array primary key', () => {
    expect(() =>
      schema({
        items: array().primary(),
      })
    ).toThrow(/Primary key.*must be string or number/);
  });

  it('should throw error for object primary key', () => {
    expect(() =>
      schema({
        data: object().primary(),
      })
    ).toThrow(/Primary key.*must be string or number/);
  });

  it('should throw error for three primary keys', () => {
    expect(() =>
      schema({
        a: string().primary(),
        b: string().primary(),
        c: string().primary(),
      })
    ).toThrow();
  });
});
