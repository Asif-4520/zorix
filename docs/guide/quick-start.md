# Quickstart Guide

Get up and running with Zorix in less than 5 minutes. This guide walks you through the essential steps to initialize your database, define your data structure, and perform your first query.

## 1. Initialize the Database

The `DB` class is the heart of Zorix. It manages your IndexedDB connection and coordinates all model operations.

```typescript
import { DB } from '@zorix/zorixdb';

// Initialize a database named 'store-db'
const db = new DB('store-db', { version: 1 });
```

## 2. Define Your Schema

Zorix is schema-driven. This means you define your data shape once, and Zorix provides validation and perfect TypeScript autocompletion across your entire app.

```typescript
import { schema, string, number } from '@zorix/zorixdb';

const productSchema = schema({
  id: number().primary(),
  title: string().index(),
  price: number(),
});
```

## 3. Create a Model

A **Model** is your primary interface for interacting with a specific "table" (Object Store) in your database.

```typescript
// Bind the schema to an object store named 'products'
const Products = await db.model('products', productSchema);
```

::: info 🔄 Auto-Upgrades
The `await db.model()` call is where the magic happens. Zorix compares your schema to the existing database and automatically creates the store and any necessary indexes.
:::

## 4. Perform CRUD Operations

Now you can interact with your data using the model instance. All methods are promise-based and fully typed.

```typescript
// 🟢 Create: Insert a new product
await Products.insert({
  id: 1,
  title: 'Mechanical Keyboard',
  price: 129,
});

// 🔵 Read: Fetch the product by its ID
const item = await Products.get(1);
console.log(item.title); // "Mechanical Keyboard"

// 🟡 Update: Change the price
await Products.update({ where: { id: 1 } }, { price: 99 });

// 🔴 Delete: Remove the product
await Products.delete({ where: { id: 1 } });
```

## 🚀 What's Next?

Congratulations! You've just built a type-safe database layer in your browser.

- **Dive Deeper**: Explore complex data types in the [Schema Guide](./schemas.md).
- **Master Queries**: Learn about advanced filtering in the [Queries Guide](./queries.md).
- **Advanced Control**: Need raw performance? Check out the [Advanced API](../api/database.md).
