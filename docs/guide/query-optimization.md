# Query Optimization

Zorix includes an intelligent **Query Planner** that analyzes your queries and selects the most efficient execution path based on your schema's indexes.

## How the Planner Works

When you call `find()`, `update()`, or `delete()`, Zorix performs the following steps:

1. **Normalization**: Your `where` clause is converted into a standard set of conditions.
2. **Scoring**: Each available index is scored based on its selectivity and the operators being used.
3. **Range Building**: The best index is used to create a native `IDBKeyRange`.
4. **Execution**: The query is executed using a native cursor or an optimized range lookup.
5. **Post-Filtering**: Any conditions that couldn't be satisfied by the index are filtered in memory.


## Operator Selectivity

Different operators have different performance characteristics. Zorix scores them accordingly:

| Operator | Score | Performance |
| :--- | :--- | :--- |
| `eq` | **100** | Maximum (Direct Lookup) |
| `between` | **70** | High (Bounded Range) |
| `gt`, `gte`, `lt`, `lte` | **60** | High (One-sided Range) |
| `startsWith` | **50** | Medium (Prefix Match) |
| `includes` | **40** | Medium (Multi-entry Scan) |
| `neq` | **10** | Low (Full Scan Required) |


## Index Selection Strategy

### Primary Key
Looking up by the Primary Key using `.get()` is always **O(1)** and is the fastest possible operation.

### Single-Field Indexes
For most queries, Zorix will pick the index on the field with the most "selective" operator (e.g., `eq` is preferred over `gt`).

### Compound Indexes
If you have a compound index like `['status', 'createdAt']`, Zorix will use it effectively if you filter by both fields.

```typescript
// Uses compound index optimized
await Orders.find({
  where: {
    status: 'shipped',
    createdAt: { gte: lastWeek }
  }
});
```


## The "Post-Filter" Phase

If your query filters by multiple fields but you only have an index for one of them, Zorix will:
1. Use the index to fetch a subset of records.
2. Manually filter the remaining conditions in JavaScript.

::: tip 🚀 Performance Tip
To avoid the post-filter phase for frequently used query combinations, define a **Compound Index** in your schema.
:::

## Analyzing Plans

In development, you can inspect the execution plan (internal feature) to see if your queries are performing a **Full Scan** (no index used). A full scan is **O(n)** and should be avoided for large object stores.

Next, explore [Advanced Patterns](./recipes.md).
