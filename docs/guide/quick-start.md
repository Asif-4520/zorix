# Quick Start Guide

Get up and running with Zorix in under 5 minutes. This guide walks you through database initialization, schema definition, event listening, and high-performance data operations.

## 1. Initialize the Database

The `DB` class manages your IndexedDB connection and coordinates all model operations.

```typescript
import { DB } from '@zorix/zorixdb';

// Initialize a database named 'store-db' at version 1
const db = new DB('store-db', { version: 1 });

// Subscribe to reactive database changes
db.on('change', (event) => {
  console.log(`Store "${event.storeName}" modified via action "${event.action}"`);
});
```

---

## 2. Define Your Schema

Zorix is schema-driven. You define your data structure once, and Zorix provides validation and full TypeScript auto-completion across your application.

```typescript
import { schema, string, number } from '@zorix/zorixdb';

const productSchema = schema({
  id: number().primary(),
  title: string().index(),
  price: number().index(),
});
```

---

## 3. Create a Model

A **Model** is your primary typed interface for interacting with an object store in IndexedDB.

```typescript
// Bind the schema to an object store named 'products'
const Products = await db.model('products', productSchema);
```

---

## 4. Perform High-Performance CRUD Operations

All model methods are promise-based, fully typed, and optimized for maximum browser execution speed.

```typescript
// 🟢 High-Speed Bulk Create: Insert multiple items in a single transaction
await Products.insertMany([
  { id: 1, title: 'Mechanical Keyboard', price: 129 },
  { id: 2, title: 'Ergonomic Mouse', price: 79 },
]);

// 🔵 Read: Fetch a single product by primary key
const item = await Products.get(1);
console.log(item?.title); // "Mechanical Keyboard"

// 🔍 Query: Fast indexed search using the native getAll engine
const budgetItems = await Products.find({
  where: { price: { lte: 100 } },
});
console.log(budgetItems);

// 🟡 Update: Update matching records
await Products.update({ where: { id: { eq: 1 } } }, { price: 99 });

// 🔴 Delete: Remove records matching criteria
await Products.delete({ where: { id: { eq: 2 } } });
```

---

## What's Next?

- Learn more about schema design in the [Schema Guide](./schemas.md).
- Explore reactive events in the [Event Lifecycle Guide](./events.md).
- Learn about performance tuning in the [Performance Guide](./performance.md).
