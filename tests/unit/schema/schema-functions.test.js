import { expect, it, describe } from 'vitest';
import { schema, string, number } from '../../../src/index';

// ─── schema.parse() ────────────────────────────────────────────────
// Tests the throwing parse() method — returns valid data or throws
// ZorixError with field context.

describe('schema.parse() - Valid Input', () => {
  const s = schema({
    name: string(),
    age: number().optional(),
  });

  it('should return the parsed data on valid input', () => {
    const data = { name: 'Alice', age: 30 };
    const result = s.parse(data);
    expect(result).toEqual(data);
  });

  it('should parse data with only required fields (optional with default)', () => {
    const sWithDefault = schema({
      name: string(),
      role: string().default('user'),
    });
    const result = sWithDefault.parse({ name: 'Bob' });
    expect(result).toEqual({ name: 'Bob', role: 'user' });
  });

  it('should include optional fields when provided', () => {
    const result = s.parse({ name: 'Carol', age: 25 });
    expect(result.name).toBe('Carol');
    expect(result.age).toBe(25);
  });

  it('should handle empty string for required string field', () => {
    const sStr = schema({ name: string() });
    const result = sStr.parse({ name: '' });
    expect(result.name).toBe('');
  });

  it('should handle zero for optional number field', () => {
    const result = s.parse({ name: 'X', age: 0 });
    expect(result.age).toBe(0);
  });
});

describe('schema.parse() - Invalid Input', () => {
  const s = schema({
    name: string(),
    age: number().optional(),
  });

  it('should throw for invalid field type with field context', () => {
    expect(() => s.parse({ name: 123 })).toThrow('Validation Error');
    expect(() => s.parse({ name: 123 })).toThrow('name');
  });

  it('should throw when required field is missing', () => {
    expect(() => s.parse({ age: 30 })).toThrow('Validation Error');
  });

  it('should throw for null input', () => {
    expect(() => s.parse(null)).toThrow('Validation Error');
  });

  it('should throw for string input', () => {
    expect(() => s.parse('hello')).toThrow();
  });

  it('should throw for number input', () => {
    expect(() => s.parse(42)).toThrow();
  });

  it('should throw for boolean input', () => {
    expect(() => s.parse(true)).toThrow();
  });

  it('should throw for array input', () => {
    expect(() => s.parse([1, 2, 3])).toThrow();
  });

  it('should throw for undefined input', () => {
    expect(() => s.parse(undefined)).toThrow();
  });
});

describe('schema.parse() - Default Values', () => {
  it('should apply static default when field is not provided', () => {
    const s = schema({
      name: string(),
      role: string().default('user'),
    });
    const result = s.parse({ name: 'Alice' });
    expect(result.role).toBe('user');
  });

  it('should apply function default when field is not provided', () => {
    const s = schema({
      name: string(),
      count: number().default(() => 0),
    });
    const result = s.parse({ name: 'Alice' });
    expect(result.count).toBe(0);
  });

  it('should not override an explicit value with default', () => {
    const s = schema({
      name: string(),
      role: string().default('user'),
    });
    const result = s.parse({ name: 'Alice', role: 'admin' });
    expect(result.role).toBe('admin');
  });
});

// ─── schema.hasField() ─────────────────────────────────────────────

describe('schema.hasField()', () => {
  const s = schema({
    name: string(),
    age: number(),
  });

  it('should return true for existing fields', () => {
    expect(s.hasField('name')).toBe(true);
    expect(s.hasField('age')).toBe(true);
  });

  it('should return false for non-existing fields', () => {
    expect(s.hasField('email')).toBe(false);
    expect(s.hasField('')).toBe(false);
  });

  it('should return false for prototype pollution attempts', () => {
    expect(s.hasField('toString')).toBe(false);
    expect(s.hasField('constructor')).toBe(false);
    expect(s.hasField('__proto__')).toBe(false);
    expect(s.hasField('hasOwnProperty')).toBe(false);
  });
});

// ─── schema.getField() ─────────────────────────────────────────────

describe('schema.getField()', () => {
  const s = schema({
    name: string(),
    age: number().index(),
  });

  it('should return the field config for existing fields', () => {
    const nameField = s.getField('name');
    expect(nameField).toBeDefined();
    expect(nameField.type).toBe('string');
    expect(nameField.required).toBe(true);
  });

  it('should return field with index config', () => {
    const ageField = s.getField('age');
    expect(ageField).toBeDefined();
    expect(ageField.type).toBe('number');
    expect(ageField.indexes).toBeDefined();
  });

  it('should return undefined for non-existing fields', () => {
    expect(s.getField('email')).toBeUndefined();
    expect(s.getField('xyz')).toBeUndefined();
  });

  it('should return a value for Object.prototype method names (raw object lookup)', () => {
    // getField uses fieldConfigs[k] which falls through to Object.prototype
    // This is expected behavior for a plain object lookup
    const toStringResult = s.getField('toString');
    // toString exists on Object.prototype, so it returns something
    expect(toStringResult).toBeDefined();
  });
});
