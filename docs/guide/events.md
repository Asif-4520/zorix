# Event Lifecycle System

Zorix includes a rich event lifecycle system built on both `DB` and `Model` instances. This allows you to log events, handle connection state changes, and reactively update UI components when data changes.

## 1. Database Connection Events (`DB.on`)

Subscribe to database connection lifecycle events on your `DB` instance:

```ts
import { DB } from '@zorix/zorixdb';

const db = new DB('my-app', { version: 1 });

// Connection opened
db.on('connect', (connection) => {
  console.log('Database connected successfully!');
});

// Database upgrade / schema migration
db.on('upgrade', (info) => {
  console.log(`Upgrading database from v${info.oldVersion} to v${info.newVersion}`);
});

// Connection closed
db.on('close', () => {
  console.log('Database connection closed');
});

// Database upgrade blocked by another tab
db.on('blocked', () => {
  console.warn('Database upgrade blocked by another open tab');
});

// Version change requested by another tab
db.on('versionchange', () => {
  console.warn('Another tab requested a database version change');
  db.close();
});

// Unhandled error
db.on('error', (err) => {
  console.error('Database error:', err);
});
```

---

## 2. Model Mutation & Reactive Change Events (`Model.on` & `DB.on`)

Listen for mutation events on specific models or globally across the database:

### Model Mutation Events
- `'insert'`: Fired when `insert()` or `insertMany()` completes.
- `'update'`: Fired when `update()` completes.
- `'delete'`: Fired when `delete()` completes.
- `'clear'`: Fired when `clear()` completes.
- `'change'`: Fired on **ANY** mutation (`insert`, `update`, `delete`, `clear`).

```ts
const Users = await db.model('users', schema({ ... }));

// Listen for inserts on Users model
Users.on('insert', (event) => {
  console.log('New user(s) inserted:', event.records);
});

// Listen for any modification on Users model
Users.on('change', (event) => {
  console.log(`Users model changed via action "${event.action}"`);
  renderUserUI();
});
```

### Global Database Change Subscriptions
You can also subscribe to mutations globally on the `DB` instance:

```ts
db.on('change', (event) => {
  console.log(`Global store "${event.storeName}" mutated via action "${event.action}"`);
});
```

---

## 3. Event Listener Utility Methods

### One-Time Listeners (`.once`)
`once()` automatically unbinds after firing once:

```ts
db.once('open', () => {
  console.log('Fired only once on initial open');
});
```

### Removing Listeners (`.off` & `.removeAllListeners`)

```ts
const handler = (data) => console.log(data);
Users.on('insert', handler);

// Remove specific handler
Users.off('insert', handler);

// Remove all listeners for a specific event or all events
Users.removeAllListeners('insert');
Users.removeAllListeners();
```
