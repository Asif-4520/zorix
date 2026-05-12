import { describe, it, expect } from 'vitest';
import { string, number, boolean, array, object, date } from '../../src/index';

// ─── FieldBuilder ───────────────────────────────────────────────────
// Tests for the fluent builder API: type creation, required/optional,
// primary key, index, default values, chaining, and invalid options.

describe('FieldBuilder - Type Creation', () => {
  it('should create a string field with correct type', () => {
    expect(string().config.type).toBe('string');
  });

  it('should create a number field with correct type', () => {
    expect(number().config.type).toBe('number');
  });

  it('should create a boolean field with correct type', () => {
    expect(boolean().config.type).toBe('boolean');
  });

  it('should create an array field with correct type', () => {
    expect(array().config.type).toBe('array');
  });

  it('should create an object field with correct type', () => {
    expect(object().config.type).toBe('object');
  });

  it('should create a date field with correct type', () => {
    expect(date().config.type).toBe('date');
  });
});

describe('FieldBuilder - Required / Optional', () => {
  it('should be required by default', () => {
    expect(string().config.required).toBe(true);
  });

  it('should set optional with .optional()', () => {
    expect(string().optional().config.required).toBe(false);
  });

  it('should set required with .required()', () => {
    expect(string().optional().required().config.required).toBe(true);
  });

  it('should toggle required/optional repeatedly', () => {
    const f = string().optional().required().optional();
    expect(f.config.required).toBe(false);
  });

  it('should keep all field types required by default', () => {
    expect(number().config.required).toBe(true);
    expect(boolean().config.required).toBe(true);
    expect(array().config.required).toBe(true);
    expect(object().config.required).toBe(true);
    expect(date().config.required).toBe(true);
  });
});

describe('FieldBuilder - Primary Key', () => {
  it('should set primary flag', () => {
    expect(string().primary().config.primary).toBe(true);
  });

  it('should auto-set required when primary', () => {
    expect(string().primary().config.required).toBe(true);
  });

  it('should not be primary by default', () => {
    expect(string().config.primary).toBe(false);
  });
});

describe('FieldBuilder - Index Configuration', () => {
  it('should set default index (no options)', () => {
    expect(string().index().config.indexes).toEqual({
      multiEntry: false,
      unique: false,
    });
  });

  it('should set unique index', () => {
    expect(string().index({ unique: true }).config.indexes).toEqual({
      unique: true,
    });
  });

  it('should set multiEntry index', () => {
    expect(array().index({ multiEntry: true }).config.indexes).toEqual({
      multiEntry: true,
    });
  });

  it('should set both unique and multiEntry', () => {
    expect(array().index({ multiEntry: true, unique: true }).config.indexes).toEqual({
      multiEntry: true,
      unique: true,
    });
  });

  it('should throw when indexing a primary key', () => {
    expect(() => string().primary().index()).toThrow('Primary keys are indexed by default');
  });
});

describe('FieldBuilder - Default Values', () => {
  it('should set a static default value', () => {
    const f = string().default('hello');
    expect(f.config.default).toBe('hello');
  });

  it('should set a function default value', () => {
    const fn = () => 42;
    const f = number().default(fn);
    expect(f.config.default).toBe(fn);
  });

  it('should keep required as-is when default is set (type-level only)', () => {
    // default() changes the type signature but doesn't mutate config.required at runtime
    const f = string().default('test');
    // The runtime config.required stays true — .default() only affects TypeScript types
    expect(f.config.required).toBe(true);
  });
});

describe('FieldBuilder - Method Chaining', () => {
  it('should support full chain: optional -> index -> default', () => {
    const f = string().optional().index({ unique: true }).default('x');
    expect(f.config.required).toBe(false);
    expect(f.config.indexes.unique).toBe(true);
    expect(f.config.default).toBe('x');
  });

  it('should return the same builder instance from index()', () => {
    const builder = string();
    const result = builder.index();
    expect(result).toBe(builder);
  });
});

describe('FieldBuilder - Invalid Options', () => {
  it('should throw for non-boolean unique option', () => {
    expect(() => string().index({ unique: 'yes' })).toThrow(/Invalid unique option/);
  });

  it('should throw for non-boolean multiEntry option', () => {
    expect(() => string().index({ multiEntry: 'no' })).toThrow(/Invalid multiEntry option/);
  });

  it('should throw for numeric multiEntry option', () => {
    expect(() => string().index({ unique: true, multiEntry: 123 })).toThrow(
      /Invalid multiEntry option/
    );
  });

  it('should throw for numeric unique option', () => {
    expect(() => string().index({ unique: 42 })).toThrow(/Invalid unique option/);
  });
});
