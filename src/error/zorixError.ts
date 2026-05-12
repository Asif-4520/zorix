export interface ZorixErrorOptions {
  message: string;
  name: string;
  code?: string;
}

/** Custom error class for all Zorix-specific errors. */
export class ZorixError extends Error {
  /** The Zorix error category name (e.g. "Validation Error"). */
  public readonly zorixName: string;
  /** The Zorix error code (e.g. "E10000"). Empty string if not provided. */
  public readonly code: string;

  constructor(options: ZorixErrorOptions) {
    super(`${options.name}[${options.code ?? ''}]: ${options.message}`);
    this.name = options.name;
    this.zorixName = options.name;
    this.code = options.code ?? '';
    // Restore prototype chain — required when transpiling to ES5 with tsc/babel
    Object.setPrototypeOf(this, ZorixError.prototype);
  }
}
