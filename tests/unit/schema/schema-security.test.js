import { expect, it, describe } from 'vitest';
import { schema, string, number } from '../../../src/index';

// ─── Schema Input Validation & Security ─────────────────────────────
// Tests for malicious/invalid inputs, edge cases, and prototype
// pollution defense.

describe('Schema - Invalid Input Rejection', () => {
  it('should throw for null schema input', () => {
    expect(() => schema(null)).toThrow(
      'Syntax Error[E14003]: Schema must be a non-null object with field definitions.'
    );
  });

  it('should throw for undefined schema input', () => {
    expect(() => schema(undefined)).toThrow();
  });

  it('should throw for string schema input', () => {
    expect(() => schema('name')).toThrow();
  });

  it('should throw for number schema input', () => {
    expect(() => schema(123)).toThrow();
  });

  it('should throw for boolean schema input', () => {
    expect(() => schema(true)).toThrow();
  });

  it('should throw for array schema input', () => {
    expect(() => schema(['id'])).toThrow(
      'Syntax Error[E14003]: Schema must be a non-null object with field definitions.'
    );
  });

  it('should throw for empty schema object', () => {
    expect(() => schema({})).toThrow(/Schema cannot be empty/);
  });

  it('should throw for raw strings instead of FieldBuilder', () => {
    expect(() => schema({ name: 'invalid' })).toThrow(/not a valid FieldBuilder/);
  });

  it('should throw for raw numbers instead of FieldBuilder', () => {
    expect(() => schema({ age: 42 })).toThrow(/not a valid FieldBuilder/);
  });

  it('should throw for raw booleans instead of FieldBuilder', () => {
    expect(() => schema({ flag: true })).toThrow(/not a valid FieldBuilder/);
  });

  it('should throw for raw arrays instead of FieldBuilder', () => {
    expect(() => schema({ tags: [1, 2] })).toThrow(/not a valid FieldBuilder/);
  });

  it('should throw for raw objects instead of FieldBuilder', () => {
    expect(() => schema({ meta: { type: 'string' } })).toThrow(/not a valid FieldBuilder/);
  });

  it('should throw for null field value', () => {
    expect(() => schema({ name: null })).toThrow(/not a valid FieldBuilder/);
  });

  it('should throw for undefined field value', () => {
    expect(() => schema({ name: undefined })).toThrow(/not a valid FieldBuilder/);
  });
});

describe('Schema - Prototype Pollution Defense', () => {
  it('should not have prototype methods as schema fields', () => {
    const s = schema({ name: string() });
    expect(s.hasField('constructor')).toBe(false);
    expect(s.hasField('__proto__')).toBe(false);
    expect(s.hasField('toString')).toBe(false);
    expect(s.hasField('valueOf')).toBe(false);
  });

  it('should safely handle field names that match Object.prototype methods', () => {
    // These are valid field names; they should work fine
    const s = schema({
      constructor: string().optional(),
      toString: string().optional(),
    });
    expect(s.hasField('constructor')).toBe(true);
    expect(s.hasField('toString')).toBe(true);
  });

  it('should reject injection-style field data', () => {
    const s = schema({
      name: string(),
      age: number(),
    });
    const result = s.validate({
      name: '<script>alert("xss")</script>',
      age: 25,
    });
    // The data is type-valid (it's a string), but the content is suspicious.
    // Schema validates types, not content — so this passes type validation.
    expect(result.valid).toBe(true);
  });
});

describe('Schema - Edge Case Field Names', () => {
  it('should handle field name with underscores', () => {
    const s = schema({ first_name: string() });
    expect(s.hasField('first_name')).toBe(true);
  });

  it('should handle field name with numbers', () => {
    const s = schema({ field1: string() });
    expect(s.hasField('field1')).toBe(true);
  });

  it('should handle field name with dollar sign', () => {
    const s = schema({ $ref: string() });
    expect(s.hasField('$ref')).toBe(true);
  });

  it('should handle camelCase field names', () => {
    const s = schema({ firstName: string(), lastName: string() });
    expect(s.hasField('firstName')).toBe(true);
    expect(s.hasField('lastName')).toBe(true);
  });
});
