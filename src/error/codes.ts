/**
 * Standard error codes used by the Zorix error system.
 *
 * Each code maps to a specific error category:
 *
 * | Code    | Category                |
 * |---------|-------------------------|
 * | E10000  | Validation              |
 * | E11000  | Duplicate key           |
 * | E11001  | Constraint violation    |
 * | E12000  | Data error              |
 * | E13000  | Transaction inactive    |
 * | E13001  | Read-only violation     |
 * | E14001  | Not found               |
 * | E14002  | Quota exceeded          |
 * | E14003  | Syntax error            |
 * | E14004  | Type error              |
 * | E14005  | Unknown error           |
 * | E15000  | Definition error        |
 */
export const errorCodes = {
  /** A record with the same key already exists. */
  DUPLICATE_KEY_ERROR: 'E11000',
  /** A field value failed validation (required, type mismatch, etc.). */
  VALIDATION_ERROR: 'E10000',
  /** An IndexedDB constraint was violated (unique index, etc.). */
  CONSTRAINT_ERROR: 'E11001',
  /** The provided data is invalid or malformed. */
  DATA_ERROR: 'E12000',
  /** The IDB transaction is no longer active. */
  TRANSACTION_INACTIVE_ERROR: 'E13000',
  /** Attempted to write in a read-only transaction. */
  READONLY_ERROR: 'E13001',
  /** The requested resource (store, schema, record) was not found. */
  NOT_FOUND_ERROR: 'E14001',
  /** The browser's storage quota has been exceeded. */
  QUOTA_EXCEEDED_ERROR: 'E14002',
  /** The query or schema definition has a syntax error. */
  SYNTAX_ERROR: 'E14003',
  /** A type mismatch was detected. */
  TYPE_ERROR: 'E14004',
  /** An unrecognized error occurred. */
  UNKNOWN_ERROR: 'E14005',
  /** A schema or field definition is invalid. */
  DEFINITION_ERROR: 'E15000',
} as const;

/** Type representing any valid Zorix error code. */
export type ErrorCode = (typeof errorCodes)[keyof typeof errorCodes];
