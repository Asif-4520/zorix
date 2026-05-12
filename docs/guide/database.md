# Database

The `DB` class is the entry point for Zorix. It manages the connection to your IndexedDB database and serves as a factory for models.

## Initialization

To start, create a new instance of the `DB` class.

```typescript
import { DB } from 'zorixdb';

const db = new DB('my-database', { version: 1 });
```

### Configuration Options

| Option | Type | Description |
| :--- | :--- | :--- |
| `version` | `number` | The database version. Increment this to trigger migrations. |

## Managing Connections

Zorix handles the opening of the database lazily. The first time you interact with a model or a transaction, the connection will be established.

### Closing the Database

In most web applications, you don't need to manually close the database. However, if you need to, you can use:

```typescript
await db.close();
```

## Global Events

The `DB` instance emits events that you can listen to for lifecycle management.

```typescript
db.on('versionchange', () => {
  console.log('Database version is changing...');
});

db.on('blocked', () => {
  console.warn('Database upgrade is blocked by another tab.');
});
```

Learn more about defining [Schemas](./schemas.md).
