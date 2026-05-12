# Schema API Reference

The Schema API allows you to define the structure, types, and indexes of your data.

## `schema(fields, options)`

Creates a frozen schema definition.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `fields` | `object` | An object where keys are field names and values are `FieldBuilder` instances. |
| `options` | `object` | Optional configuration like `compoundIndexes`. |

### `options.compoundIndexes`
An array of field name arrays to create compound indexes.

```typescript
const userSchema = schema({
  firstName: string(),
  lastName: string()
}, {
  compoundIndexes: [['firstName', 'lastName']]
});
```

## Field Builders

Zorix provides builders for various data types:

- `string()`
- `number()`
- `boolean()`
- `date()`
- `array()`
- `object()`
- `any()`

### Common Builder Methods

Every builder supports these methods:

#### `.primary()`
Marks the field as the primary key. Only one primary key is allowed per schema.

#### `.index(options)`
Adds an index for this field.
- `options.unique`: (boolean) Ensure uniqueness.
- `options.multiEntry`: (boolean) For arrays, index each element.

#### `.required()`
Makes the field mandatory.

#### `.default(value | fn)`
Sets a default value or a function to generate one.

## Schema Instance Methods

The object returned by `schema()` is frozen and contains internal metadata used by Zorix, but also exposes:

### `.validate(data)`
Returns `{ valid: boolean, field?: string, reason?: string }`.

### `.parse(data)`
Validates and applies defaults to an object. Throws `ValidationError` if invalid.
