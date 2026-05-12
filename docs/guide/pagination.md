# Pagination

When dealing with large datasets, pagination is essential for performance and user experience.

## Offset-Based Pagination

Zorix supports `limit` and `offset` for simple pagination.

```typescript
const page1 = await Users.find({
  where:{},// No filter → returns all users
  limit: 10,
  offset: 0
});

const page2 = await Users.find({
  where:{},// No filter → returns all users
  limit: 10,
  offset: 10
});
```

- **`limit`**: The maximum number of records to return.
- **`offset`**: The number of records to skip before starting.

## Best Practices

While offset-based pagination is easy to use, it can become slower as the offset increases because IndexedDB still has to iterate over the skipped records. For very large datasets, consider using a cursor-based approach or filtered queries.

Learn about [Migrations](./versioning.md).
