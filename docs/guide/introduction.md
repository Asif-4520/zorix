# Introduction

Zorix is a lightweight, type-safe IndexedDB library for modern web applications. It makes working with local browser databases easy, fast, and straightforward.

## Why Zorix?

Raw IndexedDB is very powerful, but writing raw IndexedDB code with complex event handlers and callbacks can quickly get confusing. Zorix makes things simple by giving you:

- **TypeScript-First**: Full auto-completion and type checking while writing your schemas and queries.
- **Super Fast Performance**: Inserts thousands of records quickly in a single transaction and fetches data using native browser speed.
- **Simple Schemas**: Define your table structure once, and Zorix automatically handles validation for you.
- **Easy Event Listeners**: Listen for data inserts, updates, and deletes to keep your UI updated automatically.
- **Always Fresh Data**: Reads fresh data directly from IndexedDB every time, so you never have to worry about stale cache issues.

## Simple Comparison

| Feature | Raw IndexedDB | Standard Libraries | Zorix DB |
| :--- | :--- | :--- | :--- |
| **API Style** | Complex Callbacks | Basic Promises | Clean Async/Await & Simple Events |
| **Schema & Types** | Manual Checking | Partial Types | Full TypeScript Auto-Completion |
| **Bulk Saving** | Slow / Manual | Sequential Promises | Super Fast Single Transaction |
| **Data Fetching** | Item-by-item Cursors | Cursor Loops | Direct Native Browser Speed |

Next, check out [Installation](./installation.md).
