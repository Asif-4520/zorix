<div align="center">

# 🚀 Zorix

**A type-safe, schema-driven IndexedDB wrapper designed for the modern web.**

[![npm version](https://badge.fury.io/js/@asif_4520%2Fzorix.svg)](https://badge.fury.io/js/@asif_4520%2Fzorix)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Asif-4520/zorix/blob/main/LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Asif-4520/zorix/test.yml?branch=main)](https://github.com/Asif-4520/zorix/actions)
[![GitHub stars](https://img.shields.io/github/stars/Asif-4520/zorix.svg?style=social)](https://github.com/Asif-4520/zorix/stargazers)

[**Explore the Docs »**](https://asif-4520.github.io/zorix/) · [Report Bug](https://github.com/Asif-4520/zorix/issues) · [Request Feature](https://github.com/Asif-4520/zorix/issues)

</div>

<br />

## 🌟 Why Zorix?

IndexedDB is powerful but notoriously difficult to use with its event-based callbacks and lack of native type safety. **Zorix** transforms this experience by providing a high-level, promise-based API that feels like a modern backend ORM, but runs directly in your browser.

- ✅ **Schema-Driven**: Define your data shape once and enjoy automatic validation.
- ✅ **TypeScript First**: Get perfect autocompletion for your database models and queries.
- ✅ **Powerful Querying**: Rich operators for filtering, sorting, and pagination.
- ✅ **Performance Optimized**: Built-in support for compound indexes and atomic transactions.
- ✅ **Zero Dependencies**: Lightweight and focused exclusively on IndexedDB.

---

## 🚀 Quick Start

Install Zorix via npm:

```bash
npm install @zorix/zorixdb
```

### Basic Usage

```typescript
import { DB, schema, string, number } from '@zorix/zorixdb';

// 1. Initialize your database
const db = new DB('my-app');

// 2. Define your schema & create a model
const Users = await db.model(
  'users',
  schema({
    id: number().primary(),
    name: string().index(),
    age: number(),
  })
);

// 3. Insert and query data effortlessly
await Users.insert({ id: 1, name: 'Alice', age: 25 });

const results = await Users.find({
  where: { age: { gte: 18 } },
  orderBy: { field: 'name', direction: 'asc' },
});
```

---

## 📚 Key Features

### 🛡️ Type-Safe by Default

Zorix leverages TypeScript's advanced type system to ensure that your queries and results are always in sync with your schema. No more "any" types or runtime surprises.

### 🔍 Advanced Query Engine

Perform complex queries with ease using our intuitive API:

- **Filtering**: `gt`, `lt`, `gte`, `lte`, `contains`, `startsWith`, and more.
- **Sorting**: Single and multi-field sorting.
- **Pagination**: Built-in limit and offset support.

### ⚡ Blazing Fast

By using IndexedDB's native indexing and transaction system, Zorix ensures your app remains responsive even with large datasets.

---

## 🤝 Community & Support

- **[Contributing](CONTRIBUTING.md)**: We welcome all contributions! Please read our guide to get started.
- **[Code of Conduct](CODE_OF_CONDUCT.md)**: Our pledge to a welcoming environment.
- **[Security Policy](SECURITY.md)**: How to report security issues.

## 📄 License

Zorix is open-source software licensed under the **[MIT License](LICENSE)**.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/Asif-4520">Asif-4520</a></p>
</div>
