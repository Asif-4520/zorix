# Transactions

Zorix abstracts IndexedDB transactions to provide a safer and more intuitive API.

## Automatic Transactions

Every CRUD operation in Zorix (`insert`, `update`, `delete`, `find`) automatically opens and manages a transaction.

```typescript
// This internally opens a 'readwrite' transaction
await Users.insert({ name: 'Alice' });
```

## Atomic Operations

Methods like `insertMany`, `update`, and `delete` (when targeting multiple records) are **atomic**. They use a single transaction for the entire operation. If any part of the operation fails, the entire transaction is rolled back.

## Manual Transactions

If you need to perform multiple operations across different stores atomically, you can use the [Advanced API](../api/database.md#the-escape-hatch-db-tx).

```typescript
const tx = await db.tx(['users', 'logs'], 'readwrite');
// ... operations
```

Learn about [Raw IndexedDB Access](./raw-idb.md).
