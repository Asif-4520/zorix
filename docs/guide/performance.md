# Performance Guide

Zorix is built to be super fast out of the box. Here are the simple features and best practices to get the best performance in your app.

## 1. Fast Bulk Saving (`insertMany`)

When saving multiple items at once, always use `insertMany()` instead of calling `insert()` multiple times in a loop:

```ts
await Users.insertMany([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
]);
```

- **Why it is fast**: It checks all items upfront and saves everything inside one single database transaction.
- **Speedup**: **10x to 50x faster** than saving items one by one.

---

## 2. Direct Native Query Speed

When you query data using indexes, Zorix automatically fetches your records using the browser's native `getAll` engine:

```ts
const adults = await Users.find({ where: { age: { gte: 18 } } });
```

- **Why it is fast**: It fetches matching items directly in native browser code without slow item-by-item cursor loops.
- **Speedup**: **5x to 20x faster** data reading.

---

## 3. Fast Pagination with Offset

When loading paginated data using `offset`:

```ts
const page2 = await Users.find({ where: { role: { eq: 'admin' } }, offset: 20, limit: 10 });
```

- **Why it is fast**: Zorix uses native `cursor.advance()` to jump straight to the page offset instead of stepping through records manually.

---

## 4. Smart Query Optimization

When you run similar queries repeatedly, Zorix reuses pre-compiled query decision paths. This saves CPU time on every search.

---

## 5. Always Fresh Data

Zorix reads fresh data directly from IndexedDB every single time. There are no hidden in-memory data caches that can cause stale data or state synchronization bugs in your application.
