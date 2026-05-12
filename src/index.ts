import { DB } from './db/db';
import { schema } from './schema/schema';
import { string, number, array, boolean, object, date, any } from './schema/fields';
import { ZorixError } from './error/zorixError';
export * from './db/db';
export * from './schema/fields';
export * from './schema/schema';
export type * from './types/index';

declare global {
  interface Window {
    zorix: {
      DB: typeof DB;
      schema: typeof schema;
      string: typeof string;
      number: typeof number;
      array: typeof array;
      boolean: typeof boolean;
      object: typeof object;
      date: typeof date;
      any: typeof any;
      ZorixError: typeof ZorixError;
    };
  }
}
