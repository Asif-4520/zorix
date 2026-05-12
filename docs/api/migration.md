# Migration API Reference

Zorix provides a comprehensive toolkit for managing database structural changes and data evolution.

## DB Migration Methods

### `db.migrate(migrations)`
Defines structural changes to object stores. Executed during the `onupgradeneeded` phase.

- **Parameters**: `Record<string, MigrationFn | null>`
- **MigrationFn**: `(table: MigrationTable) => void`
- **Return**: `void`

```typescript
db.migrate({
  users: (table) => {
    table.createIndex('email_idx', 'email', { unique: true });
  },
  old_store: table.delete() // Deletes the store
});
```

### `db.transform(transformations)`
Defines data transformations for records. Iterates over every record in the store using a cursor.

- **Parameters**: `Record<string, TransformFn>`
- **TransformFn**: `(record: ZorixRecord) => void`
- **Return**: `void`

```typescript
db.transform({
  users: (record) => {
    const user = record.value;
    user.age = Number(user.age);
    record.update(user);
  }
});
```

---

## Migration Classes

### `MigrationTable`
Passed to `migrate()` callbacks. Wraps native IDB store operations.

| Method | Signature | Description |
| :--- | :--- | :--- |
| `createIndex` | `(name, keyPath, options?)` | Adds a new index to the store. |
| `deleteIndex` | `(name)` | Removes an existing index. |
| `delete` | `()` | Deletes the entire object store. |

### `ZorixRecord`
Passed to `transform()` callbacks. Represents a single record during traversal.

| Property/Method | Signature | Description |
| :--- | :--- | :--- |
| `value` | `Object` | Read-only structured clone of the record data. |
| `update` | `(partialData)` | Merges fields into the existing record. |
| `replace` | `(newData)` | Overwrites the entire record. |
| `delete` | `()` | Removes the record from the store. |

---

## Migration Events

### `blocked`
Fired when an upgrade is blocked by another open tab with an older version of the database.

```typescript
db.on('blocked', (event) => {
  console.warn('Database upgrade blocked by another tab');
});
```
