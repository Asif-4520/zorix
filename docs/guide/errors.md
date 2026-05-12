# Error Handling

Zorix uses a structured error system to provide detailed feedback when operations fail. All errors thrown by Zorix are instances of `ZorixError`.

## The `ZorixError` Class

Every error object contains:
- `name`: The category of the error.
- `code`: A unique alphanumeric code (e.g., `E10000`).
- `message`: A descriptive explanation of what went wrong.

```typescript
try {
  await Users.insert({ id: 'duplicate-id' });
} catch (err) {
  if (err instanceof ZorixError) {
    console.error(`Error ${err.code}: ${err.message}`);
  }
}
```


## Error Codes Reference

| Code | Category | Description |
| :--- | :--- | :--- |
| **E10000** | **Validation** | Data failed schema validation (missing fields, type mismatch). |
| **E11000** | **Duplicate Key** | Attempted to insert a record with a primary key that already exists. |
| **E11001** | **Constraint** | Violated a database constraint, such as a `unique: true` index. |
| **E12000** | **Data Error** | The provided data is malformed or invalid for IndexedDB. |
| **E13000** | **Transaction Inactive** | Attempted an operation on a transaction that has already closed or timed out. |
| **E13001** | **Read-only** | Attempted a write operation in a `readonly` transaction. |
| **E14001** | **Not Found** | The requested object store or index does not exist. |
| **E14002** | **Quota Exceeded** | The browser's storage limit has been reached. |
| **E14003** | **Syntax Error** | The query or schema definition contains a syntax error. |
| **E14004** | **Type Error** | A low-level type mismatch was detected during an operation. |
| **E15000** | **Definition** | An invalid schema or field configuration was detected. |


## Handling Common Errors

### Quota Exceeded

When the user's device runs out of space, IndexedDB will throw a `QuotaExceededError`.

```typescript
try {
  await LargeStore.insert(massiveData);
} catch (err) {
  if (err.code === 'E14002') {
    alert("Storage is full. Please clear some space!");
  }
}
```

### Validation Errors

Zorix validates your data before it even hits IndexedDB. This saves performance and ensures data integrity.

```typescript
try {
  await Users.insert({ age: "not-a-number" });
} catch (err) {
  if (err.code === 'E10000') {
    // Handle validation failure
  }
}
```

Next, learn how to [Optimize your Queries](./query-optimization.md).
