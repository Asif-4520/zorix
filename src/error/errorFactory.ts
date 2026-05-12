import { ZorixError } from './zorixError';
import { errorCodes } from './codes';

/** Factory for creating typed ZorixError instances. */
export const errorFactory = {
  duplicateKeyError: (key: string, collection: string) => {
    return new ZorixError({
      name: 'Duplicate key Error',
      message: `${key} already exists in collection ${collection}.`,
      code: errorCodes.DUPLICATE_KEY_ERROR,
    });
  },

  validationError: (field: string, value: any, reason: string) => {
    return new ZorixError({
      name: 'Validation Error',
      message: `Field "${field}" with value "${value}" is invalid. Reason: ${reason}.`,
      code: errorCodes.VALIDATION_ERROR,
    });
  },

  constraintError: (message: string) => {
    return new ZorixError({
      name: 'Constraint Error',
      code: errorCodes.CONSTRAINT_ERROR,
      message,
    });
  },

  dataError: (message: string) => {
    return new ZorixError({
      name: 'Data Error',
      code: errorCodes.DATA_ERROR,
      message,
    });
  },

  definitionError: (message: string) => {
    return new ZorixError({
      name: 'Definition Error',
      code: errorCodes.DEFINITION_ERROR,
      message,
    });
  },

  transactionInactiveError: (message: string) => {
    return new ZorixError({
      name: 'Transaction Error',
      code: errorCodes.TRANSACTION_INACTIVE_ERROR,
      message,
    });
  },

  readonlyError: (message: string) => {
    return new ZorixError({
      name: 'Readonly Error',
      code: errorCodes.READONLY_ERROR,
      message,
    });
  },

  notFoundError: (message: string) => {
    return new ZorixError({
      name: 'Not found Error',
      code: errorCodes.NOT_FOUND_ERROR,
      message,
    });
  },

  quotaExceededError: (message: string) => {
    return new ZorixError({
      name: 'Quota exceeded Error',
      code: errorCodes.QUOTA_EXCEEDED_ERROR,
      message,
    });
  },

  syntaxError: (message: string) => {
    return new ZorixError({
      name: 'Syntax Error',
      code: errorCodes.SYNTAX_ERROR,
      message,
    });
  },

  typeError: (message: string) => {
    return new ZorixError({
      name: 'Type Error',
      code: errorCodes.TYPE_ERROR,
      message,
    });
  },

  unknownError: (message: string) => {
    return new ZorixError({
      name: 'Unknown Error',
      code: errorCodes.UNKNOWN_ERROR,
      message,
    });
  },
};

/** Maps native IndexedDB errors to ZorixError instances. */
export function mapIdbError(error: any): Error {
  if (!error) return errorFactory.unknownError('Unknown IndexedDB error');

  const msg = error.message || 'Database operation failed';
  const name = error.name;

  switch (name) {
    case 'ConstraintError':
      return errorFactory.constraintError(msg);
    case 'DataError':
      return errorFactory.dataError(msg);
    case 'TransactionInactiveError':
      return errorFactory.transactionInactiveError(msg);
    case 'ReadOnlyError':
      return errorFactory.readonlyError(msg);
    case 'NotFoundError':
      return errorFactory.notFoundError(msg);
    case 'QuotaExceededError':
      return errorFactory.quotaExceededError(msg);
    case 'SyntaxError':
      return errorFactory.syntaxError(msg);
    case 'TypeError':
      return errorFactory.typeError(msg);
    default:
      return errorFactory.unknownError(msg);
  }
}
