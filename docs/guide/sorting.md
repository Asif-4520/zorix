# Sorting

Zorix allows you to sort your query results using the `orderBy` property.

## Basic Sorting

You can sort by any field that has an index.

```typescript
const users = await Users.find({
  orderBy: { field: 'name', direction: 'asc' }
});
```

### Sorting Directions

- `asc`: Ascending order (A-Z, 0-9)
- `desc`: Descending order (Z-A, 9-0)

## Performance Note

Sorting is performed using IndexedDB's native cursor direction. This means sorting is extremely efficient as long as the field being sorted is indexed.

Next, learn about [Pagination](./pagination.md).
