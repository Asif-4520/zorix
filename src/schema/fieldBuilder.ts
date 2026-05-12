import type { FieldConfig, FieldsType, IndexConfig, TDefault } from '../types';

/** Fluent builder for schema field configuration. */
export class FieldBuilder<
  TType extends FieldsType,
  TRequired extends boolean = true,
  TPrimary extends boolean = false,
> {
  config: FieldConfig<TType, TRequired, TPrimary>;

  constructor(type: TType) {
    this.config = {
      type,
      required: true,
      primary: false,
    } as FieldConfig<TType, TRequired, TPrimary>;
  }

  /** Adds an index to this field. */
  index(opts?: IndexConfig): FieldBuilder<TType, TRequired, TPrimary> {
    if (this.config.primary) {
      throw new Error('Primary keys are indexed by default and cannot be indexed again.');
    }
    if (opts) {
      if (opts.unique && typeof opts.unique !== 'boolean') {
        throw new Error(
          `Invalid unique option. Expected "boolean" but got "${typeof opts.unique}"`
        );
      }
      if (opts.multiEntry && typeof opts.multiEntry !== 'boolean') {
        throw new Error(
          `Invalid multiEntry option. Expected "boolean" but got "${typeof opts.multiEntry}"`
        );
      }
    }
    this.config.indexes = opts || {
      multiEntry: false,
      unique: false,
    };
    return this;
  }

  /** Marks this field as the primary key. Auto-sets required. */
  primary(): FieldBuilder<TType, true, true> {
    this.config.primary = true as TPrimary;
    this.config.required = true as TRequired;
    return this as unknown as FieldBuilder<TType, true, true>;
  }

  /** Marks this field as required (the default — for explicit intent). */
  required(): FieldBuilder<TType, true, TPrimary> {
    this.config.required = true as TRequired;
    return this as unknown as FieldBuilder<TType, true, TPrimary>;
  }

  /** Marks this field as optional (the default). */
  optional(): FieldBuilder<TType, false, TPrimary> {
    this.config.required = false as TRequired;
    return this as unknown as FieldBuilder<TType, false, TPrimary>;
  }
  default(value: TDefault<TType>): FieldBuilder<TType, false, TPrimary> {
    this.config.default = value;
    return this as unknown as FieldBuilder<TType, false, TPrimary>;
  }
}
