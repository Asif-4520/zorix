# Create Records

Zorix provides simple methods for adding data to your database.

## Single Insertion

Use `.insert()` to add a single record.

```typescript
const id = await Users.insert({
  name: 'John Doe',
  email: 'john@example.com'
});
```

Zorix will validate the data against the schema before insertion. If validation fails, it throws a `TypeError`.

## Bulk Insertion

For adding multiple records at once, use `.insertMany()`.

```typescript
const result = await Users.insertMany([
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' }
]);

console.log(result.insertedCount);
```

### Performance Tip

`.insertMany()` is much faster than calling `.insert()` in a loop because it uses a single transaction for all operations.

Learn how to [Read Records](./read.md).
