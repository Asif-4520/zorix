# Update Records

Updating records in Zorix is straightforward using the `.update()` method.

## Updating by Query

You can update one or more records that match a specific criteria.

```typescript
await Users.update(
  { where: { id: 1 } },
  { name: 'John Updated' }
);
```

The second argument is a partial object containing the fields you want to change.

## Bulk Updates

If your query matches multiple records, all of them will be updated.

```typescript
// Deactivate all users who haven't logged in for a year
await Users.update(
  { where: { lastLogin: { lt: oneYearAgo } } },
  { status: 'inactive' }
);
```

## Atomic Operations

Updates are atomic. If the update of one record fails (e.g., due to a constraint violation), the entire operation is rolled back.

Learn about [Delete Records](./delete.md).
