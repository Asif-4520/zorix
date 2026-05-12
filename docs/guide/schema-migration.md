# Schema Migration

Zorix handles structural changes to your database automatically whenever you increment the database version. For complex structural changes, it provides a powerful declarative migration API.

## Automatic Actions

When you initialize a `DB` with a higher version number, Zorix automatically:

- **Creates New Stores**: If a model is defined for a store that doesn't exist.
- **Adds New Indexes**: Based on your schema definitions.
- **Deletes Removed Indexes**: To optimize storage space.

```typescript
const db = new DB('my-app', { version: 2 });
```

## Declarative Migrations

For specific structural operations like deleting a store or manually managing indexes during an upgrade, use the `migrate()` method.

```typescript
db.migrate({
  // Perform structural changes on the 'users' table
  users(table) {
    table.createIndex('email', 'email', {
      unique: true,
    });

    // Clean up old indexes
    table.deleteIndex('oldEmail');
  },

  // Delete an entire object store by setting it to null
  deprecated_logs: null,
});
```

> [!IMPORTANT]
>
> - `migrate()` must be called **before** opening the database or defining models if you want the changes to be applied during the initial upgrade.

### Migration Table API

The `table` object passed to your migration function provides:

| Method                                | Description                    |
| :------------------------------------ | :----------------------------- |
| `createIndex(name, keyPath, options)` | Adds a new index to the store. |
| `deleteIndex(name)`                   | Removes an existing index.     |

## Changing Field Types

If you change a field type in your schema (e.g., from `string` to `number`), Zorix won't automatically convert the existing data. To transform data, see the [Data Transformation](./data-transform.md) guide.

> [!NOTE]
> When performing data transformations, keep in mind that the records are treated as `any` type. This is intentional, as the data being transformed often originates from an older, incompatible schema version.

Learn more about [Versioning](./versioning.md).
