import { describe, it, expect } from 'vitest';
import { DB } from '../../src/index';

// ─── DB Class - Constructor ─────────────────────────────────────────
// Tests for the DB constructor — valid/invalid names, version options,
// and edge cases.

describe('DB Constructor - Valid Inputs', () => {
  it('should create a new DB instance with valid name', () => {
    const db = new DB('test-db');
    expect(db).toBeInstanceOf(DB);
  });

  it('should create a DB with explicit version', () => {
    const db = new DB('test-db', { version: 2 });
    expect(db).toBeInstanceOf(DB);
  });

  it('should default to version 1 when no options', () => {
    const db = new DB('test-db');
    expect(db).toBeInstanceOf(DB);
  });

  it('should accept very large version numbers', () => {
    const db = new DB('test-db', { version: 999999 });
    expect(db).toBeInstanceOf(DB);
  });

  it('should accept version 1', () => {
    const db = new DB('test-db', { version: 1 });
    expect(db).toBeInstanceOf(DB);
  });
});

describe('DB Constructor - Invalid Name', () => {
  it('should throw for numeric name', () => {
    expect(() => new DB(123)).toThrow('Invalid database name: "123".');
  });

  it('should throw for empty string name', () => {
    expect(() => new DB('')).toThrow('Invalid database name');
  });

  it('should throw for whitespace-only name', () => {
    expect(() => new DB('   ')).toThrow('Invalid database name');
  });

  it('should throw for null name', () => {
    expect(() => new DB(null)).toThrow('Invalid database name: "null".');
  });

  it('should throw for undefined name', () => {
    expect(() => new DB(undefined)).toThrow('Invalid database name: "undefined".');
  });

  it('should throw for object name', () => {
    expect(() => new DB({})).toThrow('Invalid database name: "[object Object]".');
  });

  it('should throw for array name', () => {
    expect(() => new DB([])).toThrow('Invalid database name: "".');
  });

  it('should throw for boolean name', () => {
    expect(() => new DB(true)).toThrow('Invalid database name: "true".');
  });

  it('should throw for function name', () => {
    expect(() => new DB(() => {})).toThrow('Invalid database name');
  });

  it('should throw for symbol name', () => {
    expect(() => new DB(Symbol('test'))).toThrow();
  });

  it('should throw for object with name property', () => {
    expect(() => new DB({ name: 'test-db' })).toThrow('Invalid database name');
  });
});

describe('DB Constructor - Invalid Version', () => {
  it('should throw for negative version', () => {
    expect(() => new DB('test-db', { version: -1 })).toThrow(
      'Type Error[E14004]: Given version is not a positive integer'
    );
  });

  it('should throw for zero version', () => {
    expect(() => new DB('test-db', { version: 0 })).toThrow(
      'Type Error[E14004]: Given version is not a positive integer'
    );
  });

  it('should throw for fractional version', () => {
    expect(() => new DB('test-db', { version: 1.5 })).toThrow(
      'Type Error[E14004]: Given version is not a positive integer'
    );
  });

  it('should throw for string version', () => {
    expect(() => new DB('test-db', { version: 'auto' })).toThrow(
      'Type Error[E14004]: Given version is not a positive integer'
    );
  });

  it('should throw for null version', () => {
    expect(() => new DB('test-db', { version: null })).toThrow(
      'Type Error[E14004]: Given version is not a positive integer'
    );
  });

  it('should throw for undefined version', () => {
    expect(() => new DB('test-db', { version: undefined })).toThrow(
      'Type Error[E14004]: Given version is not a positive integer'
    );
  });

  it('should throw for object version', () => {
    expect(() => new DB('test-db', { version: {} })).toThrow(
      'Type Error[E14004]: Given version is not a positive integer'
    );
  });

  it('should throw for array version', () => {
    expect(() => new DB('test-db', { version: [] })).toThrow(
      'Type Error[E14004]: Given version is not a positive integer'
    );
  });

  it('should throw for boolean version', () => {
    expect(() => new DB('test-db', { version: true })).toThrow(
      'Type Error[E14004]: Given version is not a positive integer'
    );
  });

  it('should throw for NaN version', () => {
    expect(() => new DB('test-db', { version: NaN })).toThrow(
      'Type Error[E14004]: Given version is not a positive integer'
    );
  });

  it('should throw for Infinity version', () => {
    expect(() => new DB('test-db', { version: Infinity })).toThrow(
      'Type Error[E14004]: Given version is not a positive integer'
    );
  });

  it('should throw for negative Infinity version', () => {
    expect(() => new DB('test-db', { version: -Infinity })).toThrow(
      'Type Error[E14004]: Given version is not a positive integer'
    );
  });
});
