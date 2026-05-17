# Recipes & Patterns

Common architectural patterns and solutions for real-world scenarios using Zorix.

## 🖼️ Storing Binary Data (Images/Files)

IndexedDB natively supports storing `Blob` and `File` objects. In Zorix, you can use the `object()` field type to handle binary data.

```typescript
const Files = await db.model(
  'files',
  schema({
    id: string().primary(),
    name: string(),
    data: object(), // Stores Blob/File natively
  })
);

// Storing an image from a file input
const file = fileInput.files[0];
await Files.insert({
  id: crypto.randomUUID(),
  name: file.name,
  data: file,
});

// Retrieving and displaying
const record = await Files.get(someId);
const url = URL.createObjectURL(record.data);
imageElement.src = url;
```

## 🏛️ Singleton Database Architecture

To prevent redundant initialization and ensure type safety across your entire application, it is a best practice to initialize Zorix as a singleton.

**`lib/database.ts`**

```typescript
import { DB, schema, string } from '@zorix/zorixdb';

export const db = new DB('my-app', { version: 1 });

export const Users = await db.model(
  'users',
  schema({
    id: string().primary(),
    name: string().index(),
  })
);
```

**`components/UserProfile.tsx`**

```typescript
import { Users } from '../lib/database';

// Directly use the initialized model
const user = await Users.get('user_123');
```

## ⚡ Indexing Booleans (Workaround)

Since native IndexedDB cannot index boolean fields, filtering by "active" or "deleted" status can be slow on large datasets. Use a **Status Code** pattern instead.

```typescript
const userSchema = schema({
  username: string(),
  // Use 1 for active, 0 for inactive
  statusCode: number().index().default(1),
});

// High-performance query
const activeUsers = await Users.find({
  where: { statusCode: 1 },
});
```

## 🧹 Auto-Cleanup (TTL Pattern)

You can implement a Time-To-Live (TTL) pattern to automatically remove old data (e.g., caches or logs).

```typescript
const cleanupOldLogs = async () => {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const result = await Logs.delete({
    where: { timestamp: { lt: new Date(thirtyDaysAgo) } },
  });

  console.log(`Cleaned up ${result.deletedCount} old logs.`);
};

// Run on app start
cleanupOldLogs();
```

## 🛡️ Robust Error Handling

Always wrap your database operations in `try/catch` blocks to handle edge cases like quota exceeded or browser-specific issues.

```typescript
try {
  await Users.insert(userData);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    showToast('Storage full! Please clear some space.');
  } else {
    console.error('Database error:', error);
  }
}
```
