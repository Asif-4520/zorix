# Model API Reference

A model instance, created via `db.model('name', schema)`, provides a standardized, fully-typed API for CRUD (Create, Read, Update, Delete) operations. It abstracts the complexity of IndexedDB transactions into a modern, promise-based workflow.


## The Query Architecture

Many methods such as `.find()`, `.update()`, and `.delete()` utilize a structured `Query` object to target specific records.

| Property  | Type | Description |
| :--- | :--- | :--- |
| `where` | `object` | Filter criteria using [Zorix operators](../guide/filtering.md). |
| `limit` | `number` | Maximum number of records to return or process. |
| `offset` | `number` | Number of records to skip before starting. |
| `orderBy` | `object` | Sorting instructions (`field` and `direction`). |


## Insertion Methods

### `.insert(data)`
Inserts a single record. Data is strictly validated against the schema.

- **Returns**: `Promise<string | number>` (The generated or provided Primary Key).

```typescript
const userId = await Users.insert({
  name: 'John Doe',
  email: 'john@example.com'
});
```

### `.insertMany(dataArray)`
Inserts multiple records within a **single atomic transaction** for maximum performance.

- **Returns**: `Promise<{ insertedCount: number }>`

::: tip 🚀 Bulk Performance
Always use `.insertMany()` for large datasets. It opens a single transaction for all records, which is significantly faster than calling `.insert()` in a loop.
:::


## Retrieval Methods

### `.get(primaryKey)`
Fetches a single record by its unique primary key. This is the most efficient retrieval method.

- **Returns**: `Promise<Record | undefined>`

```typescript
const user = await Users.get(101);
```

### `.find(query)`
Retrieves an array of records matching the specified criteria.

- **Returns**: `Promise<Record[]>`

```typescript
const activeUsers = await Users.find({
  where: { status: 'active' },
  orderBy: { field: 'createdAt', direction: 'desc' },
  limit: 20
});
```

### `.getAll()`
Retrieves every record in the object store.

- **Returns**: `Promise<Record[]>`

::: danger ⚠️ Memory Constraint
Avoid calling `.getAll()` on stores containing millions of records. Loading such a large array into memory can cause the browser tab to crash. Use `.find()` with `limit` or the [Advanced API](./database.md) for streaming data.
:::


## Mutation & Deletion

### `.update(query, data)`
Modifies all records matching the `query` with the provided partial `data`.

- **Returns**: `Promise<{ updatedCount: number }>`

```typescript
await Users.update(
  { where: { role: 'user' } },
  { status: 'verified' }
);
```

### `.delete(query)`
Removes all records matching the `query`.

- **Returns**: `Promise<{ deletedCount: number }>`

```typescript
await Users.delete({ where: { lastLogin: { lt: oneYearAgo } } });
```

### `.clear()`
Permanently wipes all data from the object store.

- **Returns**: `Promise<void>`


## Metadata & Utility

### `.count()`
Returns the total number of records in the store. This uses the native IDB count optimization and is extremely fast.

- **Returns**: `Promise<number>`

```typescript
const total = await Users.count();
```


## Error Handling

Zorix methods throw descriptive errors to help you debug quickly:

1. **`TypeError`**: Data does not match the schema definition during insertion or update.
2. **`ValidationError`**: A constraint (like `unique: true`) was violated.
3. **`TransactionError`**: The underlying IndexedDB transaction failed or was aborted.

::: tip Atomic Operations
Operations like `.insertMany()`, `.update()`, and `.delete()` are atomic. If a single record fails validation or an error occurs mid-process, the entire transaction is rolled back, ensuring no partial or corrupt data is saved.
:::
