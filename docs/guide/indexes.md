# Indexes

Indexes are critical for performance in IndexedDB. They allow you to search for records by fields other than the primary key.

## Defining Indexes

In Zorix, you define indexes directly in your schema using the `.index()` method.

```typescript
const userSchema = schema({
  id: number().primary(),
  email: string().index({ unique: true }), // Unique index
  category: string().index(),              // Standard index
  tags: array().index({ multiEntry: true }) // Multi-entry index
});
```

## Index Options

| Option | Type | Description |
| :--- | :--- | :--- |
| `unique` | `boolean` | Ensures no two records have the same value for this field. |
| `multiEntry` | `boolean` | Used for arrays. Each item in the array is indexed separately. |

## Automated Management

When you call `db.model('name', schema)`, Zorix automatically:
1. Compares the defined indexes in the schema with the existing indexes in IndexedDB.
2. Creates missing indexes.
3. Removes indexes that are no longer defined (if needed).

## Performance Impact

Indexes make `find()` operations significantly faster. Without an index, IndexedDB has to perform a full scan of the object store to find matching records.

Next, learn how to [Create Records](./create.md).
