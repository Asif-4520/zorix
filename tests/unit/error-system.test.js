import { describe, it, expect } from 'vitest';
import { ZorixError } from '../../src/error/zorixError';
import { errorFactory, mapIdbError } from '../../src/error/errorFactory';
import { errorCodes } from '../../src/error/codes';

// ─── ZorixError ─────────────────────────────────────────────────────

describe('ZorixError - Construction', () => {
  it('should create error extending Error', () => {
    const err = new ZorixError({
      name: 'Test Error',
      code: 'E99999',
      message: 'Something broke',
    });
    expect(err).toBeInstanceOf(Error);
  });

  it('should include name, code, and message in error message', () => {
    const err = new ZorixError({
      name: 'Test Error',
      code: 'E99999',
      message: 'Something broke',
    });
    expect(err.message).toContain('Test Error');
    expect(err.message).toContain('E99999');
    expect(err.message).toContain('Something broke');
  });

  it('should handle missing code gracefully', () => {
    const err = new ZorixError({
      name: 'No Code',
      message: 'No code provided',
    });
    expect(err.message).toContain('No Code');
    expect(err.message).toContain('No code provided');
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new ZorixError({
        name: 'Throw Test',
        code: 'E00000',
        message: 'thrown',
      });
    }).toThrow('Throw Test');
  });

  it('should format message as "Name[Code]: Message"', () => {
    const err = new ZorixError({
      name: 'Test',
      code: 'E12345',
      message: 'msg',
    });
    expect(err.message).toBe('Test[E12345]: msg');
  });

  it('should format message with empty code brackets when no code', () => {
    const err = new ZorixError({
      name: 'Test',
      message: 'msg',
    });
    expect(err.message).toBe('Test[]: msg');
  });
});

// ─── errorFactory ──────────────────────────────────────────────────

describe('errorFactory - All Methods', () => {
  it('should create duplicateKeyError', () => {
    const err = errorFactory.duplicateKeyError('uid', 'users');
    expect(err).toBeInstanceOf(ZorixError);
    expect(err.message).toContain('uid');
    expect(err.message).toContain('users');
    expect(err.message).toContain('Duplicate key');
  });

  it('should create validationError with field context', () => {
    const err = errorFactory.validationError('age', 'abc', 'Not a number');
    expect(err).toBeInstanceOf(ZorixError);
    expect(err.message).toContain('age');
    expect(err.message).toContain('abc');
    expect(err.message).toContain('Not a number');
  });

  it('should create constraintError', () => {
    const err = errorFactory.constraintError('Unique violated');
    expect(err).toBeInstanceOf(ZorixError);
    expect(err.message).toContain('Constraint');
  });

  it('should create dataError', () => {
    const err = errorFactory.dataError('Bad data');
    expect(err).toBeInstanceOf(ZorixError);
    expect(err.message).toContain('Data Error');
  });

  it('should create definitionError', () => {
    const err = errorFactory.definitionError('Bad schema');
    expect(err).toBeInstanceOf(ZorixError);
    expect(err.message).toContain('Definition');
  });

  it('should create transactionInactiveError', () => {
    const err = errorFactory.transactionInactiveError('TX dead');
    expect(err).toBeInstanceOf(ZorixError);
    expect(err.message).toContain('Transaction');
  });

  it('should create readonlyError', () => {
    const err = errorFactory.readonlyError('Cannot write');
    expect(err).toBeInstanceOf(ZorixError);
    expect(err.message).toContain('Readonly');
  });

  it('should create notFoundError', () => {
    const err = errorFactory.notFoundError('Store missing');
    expect(err).toBeInstanceOf(ZorixError);
    expect(err.message).toContain('Not found');
  });

  it('should create quotaExceededError', () => {
    const err = errorFactory.quotaExceededError('Storage full');
    expect(err).toBeInstanceOf(ZorixError);
    expect(err.message).toContain('Quota exceeded');
  });

  it('should create syntaxError', () => {
    const err = errorFactory.syntaxError('Bad query');
    expect(err).toBeInstanceOf(ZorixError);
    expect(err.message).toContain('Syntax');
  });

  it('should create typeError', () => {
    const err = errorFactory.typeError('Wrong type');
    expect(err).toBeInstanceOf(ZorixError);
    expect(err.message).toContain('Type Error');
  });

  it('should create unknownError', () => {
    const err = errorFactory.unknownError('???');
    expect(err).toBeInstanceOf(ZorixError);
    expect(err.message).toContain('Unknown');
  });
});

describe('errorFactory - Error Codes', () => {
  it('should use correct error code for duplicateKeyError', () => {
    const err = errorFactory.duplicateKeyError('k', 'c');
    expect(err.message).toContain(errorCodes.DUPLICATE_KEY_ERROR);
  });

  it('should use correct error code for validationError', () => {
    const err = errorFactory.validationError('f', 'v', 'r');
    expect(err.message).toContain(errorCodes.VALIDATION_ERROR);
  });

  it('should use correct error code for constraintError', () => {
    const err = errorFactory.constraintError('m');
    expect(err.message).toContain(errorCodes.CONSTRAINT_ERROR);
  });

  it('should use correct error code for dataError', () => {
    const err = errorFactory.dataError('m');
    expect(err.message).toContain(errorCodes.DATA_ERROR);
  });

  it('should use correct error code for syntaxError', () => {
    const err = errorFactory.syntaxError('m');
    expect(err.message).toContain(errorCodes.SYNTAX_ERROR);
  });

  it('should use correct error code for typeError', () => {
    const err = errorFactory.typeError('m');
    expect(err.message).toContain(errorCodes.TYPE_ERROR);
  });
});

// ─── mapIdbError ────────────────────────────────────────────────────

describe('mapIdbError - IDB Error Mapping', () => {
  it('should map ConstraintError', () => {
    const err = mapIdbError({ name: 'ConstraintError', message: 'dup key' });
    expect(err).toBeInstanceOf(ZorixError);
    expect(err.message).toContain('Constraint');
  });

  it('should map DataError', () => {
    const err = mapIdbError({ name: 'DataError', message: 'bad data' });
    expect(err.message).toContain('Data');
  });

  it('should map TransactionInactiveError', () => {
    const err = mapIdbError({ name: 'TransactionInactiveError', message: 'tx dead' });
    expect(err.message).toContain('Transaction');
  });

  it('should map ReadOnlyError', () => {
    const err = mapIdbError({ name: 'ReadOnlyError', message: 'readonly' });
    expect(err.message).toContain('Readonly');
  });

  it('should map NotFoundError', () => {
    const err = mapIdbError({ name: 'NotFoundError', message: 'missing' });
    expect(err.message).toContain('Not found');
  });

  it('should map QuotaExceededError', () => {
    const err = mapIdbError({ name: 'QuotaExceededError', message: 'full' });
    expect(err.message).toContain('Quota exceeded');
  });

  it('should map SyntaxError', () => {
    const err = mapIdbError({ name: 'SyntaxError', message: 'bad syntax' });
    expect(err.message).toContain('Syntax');
  });

  it('should map TypeError', () => {
    const err = mapIdbError({ name: 'TypeError', message: 'wrong type' });
    expect(err.message).toContain('Type Error');
  });

  it('should map unknown error names to unknownError', () => {
    const err = mapIdbError({ name: 'WeirdError', message: 'weird' });
    expect(err.message).toContain('Unknown');
  });

  it('should handle null error gracefully', () => {
    const err = mapIdbError(null);
    expect(err).toBeInstanceOf(ZorixError);
    expect(err.message).toContain('Unknown');
  });

  it('should handle undefined error gracefully', () => {
    const err = mapIdbError(undefined);
    expect(err).toBeInstanceOf(ZorixError);
    expect(err.message).toContain('Unknown');
  });

  it('should handle error with no message', () => {
    const err = mapIdbError({ name: 'DataError' });
    expect(err.message).toContain('Data');
    expect(err.message).toContain('Database operation failed');
  });

  it('should handle error with empty message', () => {
    const err = mapIdbError({ name: 'DataError', message: '' });
    expect(err.message).toContain('Data');
  });
});

// ─── Error Codes Const ──────────────────────────────────────────────

describe('Error Codes', () => {
  it('should have all expected error code keys', () => {
    expect(errorCodes.DUPLICATE_KEY_ERROR).toBeDefined();
    expect(errorCodes.VALIDATION_ERROR).toBeDefined();
    expect(errorCodes.CONSTRAINT_ERROR).toBeDefined();
    expect(errorCodes.DATA_ERROR).toBeDefined();
    expect(errorCodes.TRANSACTION_INACTIVE_ERROR).toBeDefined();
    expect(errorCodes.READONLY_ERROR).toBeDefined();
    expect(errorCodes.NOT_FOUND_ERROR).toBeDefined();
    expect(errorCodes.QUOTA_EXCEEDED_ERROR).toBeDefined();
    expect(errorCodes.SYNTAX_ERROR).toBeDefined();
    expect(errorCodes.TYPE_ERROR).toBeDefined();
    expect(errorCodes.DEFINITION_ERROR).toBeDefined();
    expect(errorCodes.UNKNOWN_ERROR).toBeDefined();
  });

  it('should have string error codes', () => {
    Object.values(errorCodes).forEach(code => {
      expect(typeof code).toBe('string');
      expect(code).toMatch(/^E\d+$/);
    });
  });
});
