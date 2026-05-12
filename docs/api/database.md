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


## Lifecycle Events

The `DB` class extends a standard event emitter, allowing you to listen for core database events.

### The `blocked` Event
Triggered when a schema upgrade is blocked by active connections in other browser tabs.

```typescript
db.on('blocked', () => {
  console.warn('Upgrade blocked! Notify user to close other tabs.');
});
```

::: tip Production Readiness
Always handle the `blocked` event in production apps. Without it, your application will stall during upgrades if the user has multiple tabs open.
:::
