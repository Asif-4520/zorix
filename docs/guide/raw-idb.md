# Raw IndexedDB Access

While Zorix provides a powerful high-level API, there are times when you need the full power of native IndexedDB.

## The Escape Hatch

Zorix provides the `db.tx()` method, which returns a promisified version of a native IndexedDB transaction.

```typescript
const tx = await db.tx('users', 'readonly');
const store = tx.objectStore('users');

// Use native IDB methods, but with Promises!
const count = await store.count();
```

## When to Use Raw Access

1. **Performance**: For extremely high-volume operations where even the slight overhead of the ORM is too much.
2. **Advanced Features**: Using `IDBKeyRange` for complex range queries not yet supported by the high-level API.
3. **Cursors**: Directly managing cursors for streaming data.

For a full reference, see the [Advanced API Reference](../api/database.md).
