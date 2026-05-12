import { describe, it, expect } from 'vitest';
import { schema, any, string, number } from '../../../src/index';

describe('Schema - any type', () => {
  it('should allow creating a schema with any type', () => {
    const s = schema({
      data: any()
    });
    expect(s.fields.data.type).toBe('any');
  });

  it('should validate any value for any type field', () => {
    const s = schema({
      flexible: any()
    });

    expect(s.validate({ flexible: 'a string' }).valid).toBe(true);
    expect(s.validate({ flexible: 123 }).valid).toBe(true);
    expect(s.validate({ flexible: true }).valid).toBe(true);
    expect(s.validate({ flexible: { key: 'val' } }).valid).toBe(true);
    expect(s.validate({ flexible: [1, 2, 3] }).valid).toBe(true);
    expect(s.validate({ flexible: new Date() }).valid).toBe(true);
  });

  it('should parse any value correctly', () => {
    const s = schema({
      flexible: any()
    });

    const data1 = { flexible: 'text' };
    expect(s.parse(data1)).toEqual(data1);

    const data2 = { flexible: 456 };
    expect(s.parse(data2)).toEqual(data2);

    const data3 = { flexible: { nested: true } };
    expect(s.parse(data3)).toEqual(data3);
  });

  it('should still respect required constraint for any type', () => {
    const s = schema({
      flexible: any().required()
    });

    expect(s.validate({}).valid).toBe(false);
    expect(s.validate({ flexible: null }).valid).toBe(false);
    expect(s.validate({ flexible: undefined }).valid).toBe(false);
    
    expect(() => s.parse({})).toThrow();
  });

  it('should allow optional any type', () => {
    const s = schema({
      flexible: any().optional()
    });

    expect(s.validate({}).valid).toBe(true);
    expect(s.parse({})).toEqual({});
  });
});
