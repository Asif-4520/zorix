# Introduction

Zorix is a modern, type-safe IndexedDB toolkit designed for building robust local databases in the browser. It provides an ORM-like experience, abstracting away the complexities of raw IndexedDB while maintaining high performance.

## Why Zorix?

IndexedDB is powerful but notoriously difficult to work with due to its low-level, event-driven API. Zorix bridges this gap by offering:

- **Type Safety**: Built with TypeScript from the ground up, providing perfect autocompletion.
- **Schema-Driven**: Define your data structure once and get automated validation.
- **Promise-Based**: No more callback hell; use `async/await` for all operations.
- **Query Engine**: Powerful filtering, sorting, and pagination out of the box.
- **Migrations**: Easy versioning and schema evolution.

## Core Philosophy

Zorix is built on the principle that client-side data deserves the same level of architectural rigor as server-side data. Whether you're building an offline-first app, a sophisticated state management system, or just need to cache API responses, Zorix provides the tools to do it right.

## Comparison

| Feature | Raw IndexedDB | Zorix |
| :--- | :--- | :--- |
| **API Style** | Event-based / Callbacks | Promise-based / Async-Await |
| **Schema** | Implicit / Manual | Explicit / Declarative |
| **Validation** | None | Automatic |
| **TypeScript** | Basic | Deeply Integrated |
| **Transactions** | Manual Management | Automated & Scoped |

Next, let's get you set up with [Installation](./installation.md).
