# Query Operators Reference

Zorix operators enable precise filtering beyond simple equality. They allow you to perform range queries, string prefix matching, and array membership checks with high performance.


## Comparison Operators

These operators are used for basic value comparisons and work across almost all data types.

| Operator | Name | Syntax Example | Description |
| :--- | :--- | :--- | :--- |
| `eq` | Equal | `{ status: { eq: 'active' } }` | Strict equality check. |
| `neq` | Not Equal | `{ status: { neq: 'archived' } }` | Matches everything except the value. |
| `in` | In List | `{ role: { in: ['admin', 'owner'] } }` | Matches any value in the provided array. |

::: tip Shortcut
`{ status: 'active' }` is a shorthand for `{ status: { eq: 'active' } }`.
:::


## Quantitative & Range Operators

Optimized for `number()` and `date()` fields. These utilize IndexedDB's native B-Tree indexes for O(log n) performance.

| Operator | Name | Syntax Example |
| :--- | :--- | :--- |
| `gt` | Greater Than | `{ age: { gt: 18 } }` |
| `gte` | Greater Than or Equal | `{ age: { gte: 18 } }` |
| `lt` | Less Than | `{ price: { lt: 100 } }` |
| `lte` | Less Than or Equal | `{ price: { lte: 100 } }` |
| `between` | Range | `{ age: { between: [20, 30] } }` |

### `between` Deep Dive
By default, `between` is inclusive of both boundaries. You can customize this behavior:

```typescript
// Inclusive: [20, 30]
{ age: { between: [20, 30] } }

// Exclusive lower: (20, 30]
{ age: { between: [20, 30, true, false] } }

// Fully Exclusive: (20, 30)
{ age: { between: [20, 30, true, true] } }
```


## String Operators

### `startsWith`
Efficiently finds records where a string field begins with the given prefix.

```typescript
{ name: { startsWith: 'Asif' } }
```

::: warning 🔡 Case Sensitivity
IndexedDB indexes are strictly **case-sensitive**. Searching for `startsWith: 'asif'` will NOT match a record with the name `'Asif'`. Always ensure your data and queries use consistent casing.
:::



## Array Operators

### `includes`
Checks if an array field contains a specific value.

```typescript
{ tags: { includes: 'typescript' } }
```

::: important Multi-Entry Requirement
To use `includes` efficiently, the field **must** be indexed with `multiEntry: true` in your schema:
`tags: array().index({ multiEntry: true })`
:::


## Composite Logic

Zorix automatically treats multiple properties in a `where` clause as an **AND** operation.

```typescript
const products = await db.find({
  where: {
    category: 'electronics',
    price: { lte: 500 },
    inStock: { neq: false }
  }
});
```

::: tip 💡 Query Optimization
When using multiple filters, Zorix picks the most efficient index (e.g., a unique index or a highly selective one) to start the search and then filters the remaining results in memory.
:::
