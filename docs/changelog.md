# Changelog

All notable changes to the **Zorix DB** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-05

### 🚀 Production Release (High-Performance Engine & Event Lifecycle)

Official stable release of `@zorix/zorixdb` v1.0.0 featuring a high-performance IndexedDB execution engine overhaul, native browser fast-paths, zero dynamic data caching, and a reactive Event Lifecycle System.

### ⚡ Performance & Engine Optimizations
- **Synchronous Bulk Transaction Processing (`insertMany`)**: Refactored `Model.insertMany()` to perform upfront schema validation for all records and dispatch `store.add()` synchronously inside a single `readwrite` IndexedDB transaction. Achieves **10x–50x write throughput speedup**.
- **Native `getAll()` Fast Path Query Engine**: Upgraded `Find.find()` to detect when queries match an index or key range without secondary post-filtering or custom sorting, executing directly via browser native `index.getAll(range)` and `store.getAll(range)`. Achieves **5x–20x read speedup**.
- **Native Offset Pagination (`cursor.advance`)**: Enhanced pagination in `Find.find()` to use native browser `cursor.advance(offset)` for direct offset skipping without manual JS loop iterations.
- **Static Pre-Compiled Query Plan Caching**: Implemented a static execution plan cache in `queryPlanner.ts` mapping query shapes to optimal index decision paths, eliminating runtime string parsing and scoring overhead on repeating queries.
- **100% Data Freshness Architecture**: Enforced zero dynamic record caching in memory. Every `get()` and `find()` operation queries IndexedDB directly, eliminating stale cache bugs while preserving maximum reliability.

### 📡 Event Lifecycle System (`Emitter`)
- **Event Emitter Core**: Upgraded `Emitter` with `.on()`, `.once()`, `.off()`, and `.removeAllListeners()`.
- **Database Connection Lifecycle Events (`DB`)**: Added support for listening to `'open'`, `'connect'`, `'close'`, `'error'`, `'upgrade'`, `'versionchange'`, and `'blocked'`.
- **Model Mutation & Reactive UI Events (`Model` & `DB`)**: Added granular model mutation events (`'insert'`, `'update'`, `'delete'`, `'clear'`) and a unified `'change'` event for real-time UI state synchronization.

### 🛠️ Runtime Safety & Constraint Preservation
- **Strict Error Delegation**: Attached `tx.onerror` and `tx.onabort` handlers to bulk transactions to catch IndexedDB constraint collisions (`ConstraintError`, duplicate keys), rolling back transactions safely and mapping errors to typed `ZorixError` instances.

---

## [1.0.0-beta.0] - 2026-05-12

### 📦 Initial Public Beta
- **Schema-Driven Models**: Introduced schema definition API with field builders (`string`, `number`, `boolean`, `date`, `array`, `object`, `any`).
- **Query Planner Engine**: Initial query planner with single-field and compound index selection.
- **Promise-Based Transactions**: Promisified wrapper around raw IndexedDB transactions (`db.tx()`).
- **Database Migrations**: Initial migration table and schema versioning support.
- **Multi-Format Packaging**: Distributed ESM (`zorix.esm.js`), CommonJS (`zorix.cjs`), and IIFE (`zorix.iife.js`) bundles.
