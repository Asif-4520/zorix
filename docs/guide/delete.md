# Delete Records

Zorix provides methods to remove data safely.

## Deleting by Query

Use `.delete()` to remove records matching a criteria.

```typescript
await Users.delete({
  where: { id: 1 }
});
```

## Bulk Deletion

Similar to updates, you can delete multiple records at once.

```typescript
await Users.delete({
  where: { status: 'banned' }
});
```

## Clearing a Store

To remove all records from an object store, use `.clear()`.

```typescript
await Users.clear();
```

Next, dive into the [Query System](./queries.md).
