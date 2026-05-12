import { FieldBuilder } from './fieldBuilder';

/** Creates a **string** field. */
export function string() {
  return new FieldBuilder('string');
}

/** Creates a **number** field. */
export function number() {
  return new FieldBuilder('number');
}

/** Creates a **boolean** field. Cannot be indexed directly. */
export function boolean() {
  return new FieldBuilder('boolean');
}

/** Creates an **object** field. Stores arbitrary JSON. */
export function object() {
  return new FieldBuilder('object');
}

/** Creates an **array** field. Use with `index({ multiEntry: true })`. */
export function array() {
  return new FieldBuilder('array');
}

/** Creates a **date** field. Supports range queries. */
export function date() {
  return new FieldBuilder('date');
}

/** Creates an **any** field. Bypasses strict type checking. */
export function any() {
  return new FieldBuilder('any');
}
