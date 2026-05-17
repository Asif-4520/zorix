# Defining Schemas

Schemas are the core foundation of Zorix. They provide strict data validation and enable full TypeScript inference, allowing development environments to provide accurate autocompletion and preventing invalid data from ever reaching the database.

## The Validation Flow

When you insert or update data, Zorix runs a multi-step validation process before committing the transaction to IndexedDB:

1. **Type Check**: Validates field types (e.g., is it a string?). Fails with `TypeError`.
2. **Constraints Check**: Validates requirements like `.required()`. Fails with `ValidationError`.
3. **Default Values**: Appends missing values if a `.default()` is defined.
4. **Commit**: Data is written to IndexedDB within an atomic transaction.

## Defining a Schema

The `schema(fields, options)` function is the entry point for creating your database models.

### `fields` (Required)

An object where keys represent property names and values are field type builders (e.g., `string()`, `number()`).

### `options` (Optional)

A configuration object for advanced database tuning, such as compound indexes.

::: code-group

```typescript [TypeScript]
import { schema, string, number } from '@zorix/zorixdb';

const mySchema = schema(
  // 1. Fields Definition
  {
    id: number().primary(),
    name: string().required(),
  },
  // 2. Options
  {
    compoundIndexes: [['id', 'name']],
  }
);
```

```javascript [JavaScript]
import { schema, string, number } from '@zorix/zorixdb';

const mySchema = schema({
  id: number().primary(),
  name: string().required(),
});
```

:::

## Core Data Types

Zorix provides a rich set of primitives to define your data.

| Type        | TypeScript Output     | Description                                        |
| :---------- | :-------------------- | :------------------------------------------------- |
| `string()`  | `string`              | Represents textual data.                           |
| `number()`  | `number`              | Integers or floating-point values.                 |
| `boolean()` | `boolean`             | Binary true/false values.                          |
| `date()`    | `Date`                | Standard JavaScript `Date` objects.                |
| `array()`   | `any[]`               | Collections of items.                              |
| `object()`  | `Record<string, any>` | Arbitrary JSON objects or nested dictionaries.     |
| `any()`     | `any`                 | Bypasses strict type checking for specific fields. |

::: warning Boolean Limitation
Due to native IndexedDB limitations, **`boolean()` fields cannot be indexed**. If you need to filter or sort by a boolean state, consider using a `number()` field (e.g., `0` for false, `1` for true) or a status string.
:::

## Field Modifiers

Modifiers allow you to chain additional logic and constraints onto your fields.

| Modifier        | Behavior   | Description                                              |
| :-------------- | :--------- | :------------------------------------------------------- |
| `.primary()`    | Structural | Designates the primary key. Exactly one per schema.      |
| `.required()`   | Validation | Ensures the field is not `undefined` or `null`.          |
| `.optional()`   | Validation | Allows the field to be omitted during insertion.         |
| `.default(val)` | Logic      | Provides a static value or a dynamic generator function. |
| `.index(opts)`  | Structural | Creates a database index for high-performance querying.  |

### `.index(options)`

Indexes are essential for query performance. Without them, Zorix may have to perform a full table scan.

- **`unique`**: Rejects duplicate values (e.g., for email fields).
- **`multiEntry`**: **Crucial for arrays.** When `true`, each item in the array is indexed individually.

::: tip Pro Tip: Multi-Entry Indexes
Always use `{ multiEntry: true }` for `array()` fields if you intend to use the `includes` operator. This transforms a slow O(n) scan into a lightning-fast O(log n) B-tree lookup.
:::

## Compound Indexes

Compound indexes span multiple fields, enabling high-performance queries that filter or sort by multiple properties simultaneously.

```typescript
const productSchema = schema(
  {
    category: string(),
    price: number(),
    brand: string(),
  },
  {
    compoundIndexes: [
      ['category', 'price'], // Optimizes search by category AND price
      ['brand', 'category'],
    ],
  }
);
```

::: info Ordering Matters
Compound indexes are stored as an array of values in IndexedDB. An index on `['category', 'price']` is most effective when searching by `category` first.
:::

## Advanced: Dynamic Defaults

Default values can be dynamic functions, allowing you to generate timestamps, UUIDs, or other dynamic values at the exact moment of insertion.

```typescript
const logSchema = schema({
  id: string().primary(),
  // Generated automatically on every insert
  timestamp: date().default(() => new Date()),
  status: string().default('pending'),
});
```

## Constraints & Critical Rules

1. **Exactly One Primary Key**: Every schema must have exactly one field marked with `.primary()`.
2. **Boolean Indexing**: As mentioned, `.index()` on a `boolean()` field will result in a runtime error.
3. **Array Indexing**: Use `multiEntry` exclusively for `array()` types to enable item-level searching.
4. **Immutability**: Once a schema is initialized with `db.model()`, its structure is locked. Structural changes require a database version bump.

> [!IMPORTANT]
> Zorix enforces these schemas at the **application level**. Because IndexedDB is natively schemaless, existing data from previous versions might not match. Always use [Migrations](./versioning.md) when changing field types to keep your data legacy in sync.
