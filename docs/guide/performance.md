# Performance

Zorix is engineered for high performance, but there are best practices you should follow to keep your app snappy.

## 1. Use Indexes Wisely

Any field you frequently use in `where` or `orderBy` clauses should be indexed. Searching on unindexed fields requires a full scan of the object store.

## 2. Bulk Operations

Always prefer `insertMany()` over multiple `insert()` calls. Each `insert()` opens a new transaction, which is expensive. `insertMany()` uses a single transaction.

## 3. Limit Your Results

Avoid `getAll()` on large stores. Use `find()` with `limit` and `offset` to load only what you need.

## 4. Primary Key Access

Accessing records by their primary key via `get()` is the fastest possible operation in IndexedDB.

