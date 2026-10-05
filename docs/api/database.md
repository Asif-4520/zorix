# Advanced API & Escape Hatches

For the vast majority of application needs—CRUD operations, complex querying, and schema management—Zorix's Model API provides a premium, modern development workflow. 

However, a truly robust database abstraction should never become a limitation. When you need absolute control, Zorix provides a seamless **promisified escape hatch** directly to native IndexedDB transactions.


## Why Use Zorix for Native Transactions?

Raw IndexedDB forces you into "callback hell" with endless `onsuccess` and `onerror` event listeners. Zorix solves this by wrapping native IDB in a **Promisified Proxy**. 


You get **100% native performance** with **0% callback hell**. Every native method (like `.add()`, `.put()`, `.openCursor()`) returns a standard Promise that you can `await`.


## The Escape Hatch: `db.tx()`

Generates a promisified proxy of a native IndexedDB transaction.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `storeNames` | `string | string[]` | The names of the object stores to lock. |
| `mode` | `'readonly' | 'readwrite'` | The transaction mode. |

### Basic Usage

```typescript
// Lock multiple stores safely
const tx = await db.tx(['users', 'sessions'], 'readwrite');
const userStore = tx.objectStore('users');

// Native method, but fully awaitable!
await userStore.add({ id: 1, name: 'Alice' }); 
```

::: info Note on Method Names
When using `db.tx()`, you must use the standard native IDB method names (e.g., `.add()`, `.put()`, `.delete()`), **not** the Zorix Model API names (e.g., `.insert()`, `.update()`).
:::


## Advanced Use Cases

### 1. Atomic Cross-Store Transfers
Move data between two tables where both operations must succeed or fail together.

```typescript
const tx = await db.tx(['orders', 'cart'], 'readwrite');
const orderStore = tx.objectStore('orders');
const cartStore = tx.objectStore('cart');

// Atomic transfer
await orderStore.add({ id: 501, item: 'Laptop' });
await cartStore.delete(501);

// Optional: Await the full completion
await tx.done;
```

### 2. High-Performance Memory-Safe Cursors
Stream millions of rows asynchronously with a microscopic memory footprint.

```typescript
const tx = await db.tx('logs', 'readonly');
const store = tx.objectStore('logs');

let cursor = await store.openCursor();

while (cursor) {
  processLog(cursor.value);
  cursor = await cursor.continue(); // Simple, readable loop
}
```

### 3. Native KeyRange Bulk Deletions
Instantly wipe out massive chunks of data without slow iteration using `IDBKeyRange`.

```typescript
const tx = await db.tx('analytics', 'readwrite');
const store = tx.objectStore('analytics');

const range = IDBKeyRange.bound(startTime, endTime);
await store.delete(range); // Blazing fast native deletion
```


## Trade-offs: Gain vs. Loss

| Feature | Model API | Advanced API (`db.tx`) |
| :--- | :--- | :--- |
| **Performance** | High | Maximum (Native) |
| **Validation** | Strict Schema | None (Native IDB) |
| **Type Safety** | 100% Inferred | Generic |
| **Complexity** | Low (ORM-like) | Medium (Native IDB Knowledge) |

::: danger Proceed with Caution
Schema validation is bypassed when using `db.tx()`. Always manually sanitize your data before writing to the database via native transactions to prevent data corruption.
:::


## Lifecycle Events API

Both `DB` and `Model` extend `Emitter`, providing complete event lifecycle monitoring:

### Event Listener Methods

- `db.on(event, handler)` / `model.on(event, handler)`: Register a persistent event listener.
- `db.once(event, handler)` / `model.once(event, handler)`: Register a one-time event listener that auto-detaches after firing once.
- `db.off(event, handler)` / `model.off(event, handler)`: Unbind a registered event listener.
- `db.removeAllListeners(event?)`: Clear listeners for a specific event or all events.

### Database Connection Events (`DB`)

| Event | Payload | Description |
| :--- | :--- | :--- |
| `'open'` / `'connect'` | `IDBDatabase` | Fired when the IndexedDB connection opens successfully. |
| `'close'` | `null` | Fired when `db.close()` is called. |
| `'error'` | `DOMException` | Fired on unhandled database errors. |
| `'upgrade'` | `{ oldVersion, newVersion }` | Fired during schema upgrade (`onupgradeneeded`). |
| `'blocked'` | `IDBVersionChangeEvent` | Fired when database upgrade is blocked by another open tab. |
| `'versionchange'` | `null` | Fired when another tab requests a version change. |

### Model Mutation & Reactive Change Events (`Model` & `DB`)

| Event | Payload | Description |
| :--- | :--- | :--- |
| `'insert'` | `{ storeName, records }` | Fired when records are inserted into a model. |
| `'update'` | `{ storeName, query, data, updatedCount }` | Fired when records are updated. |
| `'delete'` | `{ storeName, query, deletedCount }` | Fired when records are deleted. |
| `'clear'` | `{ storeName }` | Fired when an object store is cleared. |
| `'change'` | `{ storeName, action, ... }` | Fired on **ANY** store mutation for reactive UI updates. |

```typescript
// Subscribe to reactive database changes
db.on('change', (event) => {
  console.log(`Store "${event.storeName}" changed via "${event.action}"`);
});

// Subscribe to database connection blockages
db.on('blocked', () => {
  console.warn('Upgrade blocked! Please close other open tabs.');
});
```
