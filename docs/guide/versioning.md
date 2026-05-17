# Database Migrations

Zorix provides a sophisticated, multi-layered migration system designed to keep your database schema and data in perfect sync as your application evolves. From automated structural updates to granular record transformations, Zorix handles the complexity of IndexedDB versioning for you.

## The Upgrade Lifecycle

When you increment the database version, Zorix executes a strictly ordered sequence of operations within a single, atomic **Version Change Transaction**.

1. **Automated Schema Sync**: Zorix creates/updates stores and indexes based on your schema.
2. **Manual Table Migrations**: `db.migrate()` hooks are executed for structural changes.
3. **Data Transformations**: `db.transform()` routines are run to migrate your record data.
4. **Upgrade Complete**: The transaction is committed and the database is ready for use.

## Getting Started: Versioning

Database structures in Zorix are version-controlled. By default, initialization begins at `version: 1`. To trigger an upgrade, simply increment the version parameter during instantiation.

```typescript
import { DB } from '@zorix/zorixdb';

// Incrementing to version 2 triggers the upgrade lifecycle
const db = new DB('my-app', { version: 2 });
```

### The Proper Setup Sequence

To ensure your migrations run correctly, always define your `migrate` and `transform` logic **before** calling `db.model()` or any other async database operation.

```typescript
const db = new DB('my-app', { version: 2 });

// 1. Define structural changes
db.migrate({ ... });

// 2. Define data transformations
db.transform({ ... });

// 3. Initialize models (This triggers the upgrade)
const Users = await db.model('users', userSchema);
```

## 1. Automated Schema Evolution

For most routine changes, Zorix does the heavy lifting. By simply updating your schema definition and bumping the version, Zorix automatically handles:

- **Object Store Creation**: New `model()` calls create the underlying stores.
- **Index Management**: Adding or updating `.index()` creates the relevant IDB indexes dynamically.

```typescript
// v2: Adding a unique index to 'email'
const Users = await db.model(
  'users',
  schema({
    id: number().primary(),
    email: string().index({ unique: true }), // Automatically created/updated
  })
);
```

## 2. Structural Migrations: `db.migrate()`

When you need to perform manual structural changes that Zorix doesn't automate (like deleting an old store), use the `migrate()` toolkit.

### `db.migrate(migrations)`

| Method                    | Description                                       |
| :------------------------ | :------------------------------------------------ |
| `table.deleteIndex(name)` | Permanently removes an index from the store.      |
| `table.delete()`          | Deletes the entire object store and all its data. |

```typescript
db.migrate({
  users: table => {
    // Cleanup: Remove a legacy index no longer in the schema
    table.deleteIndex('old_search_idx');
  },
});
```

## 3. Data Transformations: `db.transform()`

This is the most powerful tool in your migration arsenal. `db.transform()` allows you to iterate over existing records and modify their internal data shape.

### The `ZorixRecord` API

Inside the transformation callback, you interact with a specialized `record` object:

| Property/Method        | Type       | Description                                               |
| :--------------------- | :--------- | :-------------------------------------------------------- |
| `record.value`         | `Object`   | A structured clone of the record's current data.          |
| `record.update(data)`  | `Function` | Merges new fields into the existing record.               |
| `record.replace(data)` | `Function` | Overwrites the entire record with new data.               |
| `record.delete()`      | `Function` | Deletes the record from the database.                     |
| `record.any`           | `N/A`      | **Note:** `record.value` is intentionally typed as `any`. |

> [!IMPORTANT]
> **Type Safety During Migration**: Because `db.transform()` is often used to fix "broken" or legacy data that doesn't yet match your new schema, the `record.value` object is NOT strictly type-checked. You should treat it as `any` and perform your own runtime checks before updating.

### Example: Data Normalization

```typescript
db.transform({
  products: record => {
    const data = record.value;

    if (typeof data.price === 'string') {
      record.update({
        priceInfo: {
          amount: parseFloat(data.price),
          currency: 'USD',
        },
      });
    }
  },
});
```

::: danger ⚡ Performance & Scaling Warning
The `db.transform()` method utilizes an IndexedDB cursor to traverse **every single record** in the object store.

- **For Large Datasets**: If you have 100k+ records, this migration can take several seconds.
- **Blocking Operation**: Since migrations run during `onupgradeneeded`, the database will be unavailable to the rest of your app until the transformation completes.
  :::

## Best Practices & Safety

### Atomic Reliability

Because all migration steps run in a single transaction, if any step fails, the entire upgrade—including automated schema changes—is **rolled back**. Your database stays in its previous valid state.

### Managing Tab Contention

If a user has multiple tabs open, a version upgrade in one tab will be **blocked** by active connections in others.

::: tip Pro Tip: Handle the `blocked` Event
Always listen for the `blocked` event on your `DB` instance to notify users that an update is pending.

```typescript
db.on('blocked', () => {
  showNotification('Please close other tabs to update the database!');
});
```

:::

> [!NOTE]
> IndexedDB is natively schemaless. While Zorix provides a strict type-safe layer, the underlying engine does not validate existing data against new schemas automatically. Always use `db.transform()` to ensure your data legacy aligns with your future code.
