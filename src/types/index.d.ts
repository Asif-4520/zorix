import type { FieldBuilder } from '../schema/fieldBuilder';

export type IDB_options = {
  version?: number;
};

// ─── Field Type System ───────────────────────────────────────────────
// Note: These types are used for TypeScript inference and runtime validation.
// IndexedDB itself is schemaless and does not enforce these types.
// Changing a type in the schema requires manual data migration.

export type FieldTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  object: Record<string, unknown>;
  array: unknown[];
  date: Date;
  any: any;
};

export type FieldsType = keyof FieldTypeMap;

export type IndexConfig = {
  unique?: boolean;
  multiEntry?: boolean;
};

/** Internal configuration for a single schema field. */
export type TDefault<T extends FieldsType> = FieldTypeMap[T] | (() => FieldTypeMap[T]);
export type FieldConfig<
  TType extends FieldsType = FieldsType,
  TRequired extends boolean = boolean,
  TPrimary extends boolean = boolean,
> = {
  type: TType;
  required: TRequired;
  primary: TPrimary;
  indexes?: IndexConfig;
  default?: TDefault<TType>;
};

export type AnyFieldConfig = FieldConfig<FieldsType, boolean, boolean>;
export type AnyFieldBuilder = FieldBuilder<FieldsType, boolean, boolean>;

// ─── Schema Input / Output ───────────────────────────────────────────

export type SchemaInput = Record<string, AnyFieldBuilder>;

export type SchemaInputToFields<TInput extends SchemaInput> = {
  [K in keyof TInput]: TInput[K]['config'];
};

export type SchemaFields = Record<string, AnyFieldConfig>;

// ─── Data Inference ──────────────────────────────────────────────────

type RequiredFieldKeys<TFields extends SchemaFields> = {
  [K in keyof TFields]-?: TFields[K]['required'] extends true
    ? K
    : TFields[K]['primary'] extends true
      ? K
      : never;
}[keyof TFields];

type OptionalFieldKeys<TFields extends SchemaFields> = Exclude<
  keyof TFields,
  RequiredFieldKeys<TFields>
>;

type ValueFromField<TField extends AnyFieldConfig> = FieldTypeMap[TField['type']];

type Simplify<T> = { [K in keyof T]: T[K] } & {};

/** Produces the data shape from a SchemaFields map. */
export type SchemaFieldsToData<TFields extends SchemaFields> = Simplify<
  {
    [K in RequiredFieldKeys<TFields>]-?: ValueFromField<TFields[K]>;
  } & {
    [K in OptionalFieldKeys<TFields>]?: ValueFromField<TFields[K]>;
  }
>;

export type PrimaryKeyName<TFields extends SchemaFields> =
  | Extract<
      {
        [K in keyof TFields]-?: TFields[K]['primary'] extends true ? K : never;
      }[keyof TFields],
      string
    >
  | '_id';

export type PrimaryKeyType<TFields extends SchemaFields> =
  PrimaryKeyName<TFields> extends keyof TFields
    ? ValueFromField<TFields[PrimaryKeyName<TFields>]>
    : IDBValidKey;

// ─── Schema Result ───────────────────────────────────────────────────

export interface IndexDefinition {
  name: string;
  keyPath: string | string[];
  unique: boolean;
  multiEntry: boolean;
}

export interface PrimaryKeyDefinition {
  name: string;
  keyPath: string;
  autoIncrement: boolean;
}

/** Compiled schema returned by `schema()`. */
export type SchemaResult<TFields extends SchemaFields = SchemaFields> = {
  PK: PrimaryKeyDefinition | null;
  indexes: IndexDefinition[];
  fields: TFields;
  /** Checks if a field exists in this schema. */
  hasField: (key: string) => boolean;
  /** Returns the field config for a given key, or undefined. */
  getField: (key: string) => AnyFieldConfig | undefined;
  /** Returns detailed validation result with field-level error info. */
  validate: (data: any) => {
    valid: boolean;
    field?: string;
    reason?: string;
  };
  /** Validates and returns data, throws with field context on failure. */
  parse: (data: any) => any;
};

export type SchemaOutput<TInput extends SchemaInput> = SchemaResult<SchemaInputToFields<TInput>>;

export type SchemaData<TFields extends SchemaFields> = SchemaFieldsToData<TFields>;

export type InferSchema<TSchema> =
  TSchema extends SchemaResult<infer TFields>
    ? SchemaFieldsToData<TFields>
    : TSchema extends SchemaFields
      ? SchemaFieldsToData<TSchema>
      : TSchema;

export type InferSchemaFields<TInput extends SchemaInput> = SchemaInputToFields<TInput>;

// ─── Query Types — Type-Specific Operators ───────────────────────────

export type StringFieldQuery =
  | string
  | { eq: string }
  | { neq: string }
  | { gt: string; lt?: string }
  | { gte: string; lte?: string }
  | { lt: string }
  | { lte: string }
  | { between: [string, string] }
  | { startsWith: string };

export type NumberFieldQuery =
  | number
  | { eq: number }
  | { neq: number }
  | { gt: number; lt?: number }
  | { gte: number; lte?: number }
  | { lt: number }
  | { lte: number }
  | { between: [number, number] };

export type BooleanFieldQuery = boolean | { eq: boolean } | { neq: boolean };

export type DateFieldQuery =
  | Date
  | { eq: Date }
  | { neq: Date }
  | { gt: Date; lt?: Date }
  | { gte: Date; lte?: Date }
  | { lt: Date }
  | { lte: Date }
  | { between: [Date, Date] };

export type ArrayFieldQuery<T = unknown> = { includes: T };

export type ObjectFieldQuery =
  | Record<string, unknown>
  | { eq: Record<string, unknown> }
  | { neq: Record<string, unknown> };

/** Resolves the operator type based on the field's value type. */
export type FieldQuery<T> = 0 extends (1 & T)
  ? any
  : T extends string
    ? StringFieldQuery
  : T extends number
    ? NumberFieldQuery
    : T extends boolean
      ? BooleanFieldQuery
      : T extends Date
        ? DateFieldQuery
        : T extends (infer U)[]
          ? ArrayFieldQuery<U>
          : T extends Record<string, unknown>
            ? ObjectFieldQuery
            : T | { eq: T } | { neq: T };

export type QueryWhere<TSchemaOrData> = Partial<{
  [K in keyof TSchemaOrData]: FieldQuery<TSchemaOrData[K]>;
}>;

export interface OrderByClause<T> {
  field: keyof T & string;
  direction: 'asc' | 'desc';
}

export interface Query<TSchemaOrData> {
  where: QueryWhere<TSchemaOrData>;
  limit?: number;
  offset?: number;
  orderBy?: OrderByClause<TSchemaOrData>;
}

// ─── Result Types ────────────────────────────────────────────────────

export interface InsertManyResult {
  insertedCount: number;
}

export interface UpdateResult {
  updatedCount: number;
}

export interface DeleteResult {
  deletedCount: number;
}
