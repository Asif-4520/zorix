# Querying Data

Zorix features a powerful and expressive query engine that abstracts the complexity of IndexedDB's `IDBKeyRange` and cursor management into a clean, modern API.


## The Query Structure

All data retrieval and mutation methods accept a `Query` object. This object defines the scope and presentation of the operation.

| Property | Type | Description |
| :--- | :--- | :--- |
| `where` | `Object` | Filter criteria using [Zorix Operators](./filtering.md). |
| `limit` | `number` | Restricts the number of records returned. |
| `offset` | `number` | Skips a specified number of records. |
| `orderBy` | `Object` | Defines sorting behavior. |


## Filtering with Operators

Filtering in Zorix is declarative. Instead of writing loops, you define the conditions your data must meet.

### Exact Matches
The simplest query is an exact value match.

```typescript
const users = await Users.find({
  where: { role: 'admin' }
});
```

### Advanced Conditions
For range queries or complex logic, use operator objects.

```typescript
const recentPosts = await Posts.find({
  where: {
    views: { gte: 1000 },          // Greater than or equal to 1000
    category: { neq: 'archive' }, // Not equal to 'archive'
    title: { startsWith: 'JS' }    // String begins with 'JS'
  }
});
```

::: tip Index Optimization
Zorix automatically detects if a field has an index and uses the native `IDBKeyRange` optimization for operators like `gt`, `lt`, and `startsWith`. This prevents expensive full-table scans.
:::


## Sorting Results

Use the `orderBy` property to sort your results. Sorting is performed at the database level when an index is available.

| Field | Type | Description |
| :--- | :--- | :--- |
| `field` | `string` | The property name to sort by. |
| `direction` | `'asc' | 'desc'` | The sort order. |

```typescript
const usersByAge = await Users.find({
  orderBy: { field: 'age', direction: 'desc' }
});
```

::: warning Performance Warning
Sorting on a field that is **not indexed** requires Zorix to fetch all records into memory and sort them in JavaScript. For large stores, this will be significantly slower and memory-intensive.
:::


## Query Performance

The speed of your queries depends heavily on your schema's indexing strategy.

| Query Type | Index Status | Complexity | User Experience |
| :--- | :--- | :--- | :--- |
| **Primary Key Lookup** (`.get`) | Always Indexed | **O(1)** | Instant |
| **Indexed Operator** (`gt`, `startsWith`) | Indexed | **O(log n)** | Very Fast |
| **Unindexed Filter** | Not Indexed | **O(n)** | Slow (Full Scan) |

::: tip Compound Index Power
If you frequently query by two fields together (e.g., `status: 'active'` AND `category: 'electronics'`), define a **Compound Index** in your schema. This allows Zorix to perform a single optimized lookup instead of filtering results in memory.

```typescript
// Schema with compound index
schema({ ... }, { compoundIndexes: [['status', 'category']] })
```
:::


## Mutation Queries

The `where` clause isn't just for finding data; it's also used to target records for updates and deletions.

```typescript
// Update only 'pending' orders
await Orders.update(
  { where: { status: 'pending' } },
  { status: 'processing', updatedAt: new Date() }
);

// Delete old logs
await Logs.delete({
  where: { timestamp: { lt: thirtyDaysAgo } }
});
```

::: info Atomic Transactions
Queries used in `update()` and `delete()` operations are executed within a single transaction. If any part of the operation fails, the entire change is rolled back.
:::
