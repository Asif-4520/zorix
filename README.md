# Zorix

Lightweight, type-safe IndexedDB helpers for modern web apps.

[![npm](https://badge.fury.io/js/%40zorix%2Fzorixdb.svg)](https://www.npmjs.com/package/@zorix/zorixdb) [![Build Status](https://img.shields.io/github/actions/workflow/status/Asif-4520/zorix/ci.yml?branch=main)](https://github.com/Asif-4520/zorix/actions) [![Downloads](https://img.shields.io/npm/dt/@zorix/zorixdb.svg)](https://www.npmjs.com/package/@zorix/zorixdb) [![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Intro

Zorix is a small, schema-driven library that wraps IndexedDB with a TypeScript-first API. It aims to make local browser databases easy, fast, and type-safe — great for PWAs, offline-first apps, and client-side caching.

## Highlights

- Schema-first models with TypeScript typings
- Promise-based APIs (no callback hell)
- Fast querying with indexes and cursors
- Atomic transactions across models
- Tiny runtime with zero external dependencies

## Quick install

PowerShell / terminal:

```powershell
pnpm add @zorix/zorixdb
# or
npm install @zorix/zorixdb
```

## Minimal usage (ES module)

```ts
import { DB, schema, string, number } from '@zorix/zorixdb';

const db = new DB('my-app', { version: 1 });

const Users = await db.model(
  'users',
  schema({
    id: number().primary(),
    name: string().index(),
    age: number(),
  })
);

await Users.insert({ id: 1, name: 'Alice', age: 25 });
const adults = await Users.find({ where: { age: { gte: 18 } } });
console.log(adults);
```

## Browser (CDN) example

Use the IIFE or ESM build from unpkg in demos or simple pages:

```html
<!-- ESM -->
<script type="module">
  import { DB, schema } from 'https://unpkg.com/@zorix/zorixdb@latest/dist/zorix.esm.js';
  // use as above
</script>

<!-- IIFE -->
<script src="https://unpkg.com/@zorix/zorixdb@latest/dist/zorix.iife.js"></script>
<script>
  // global `Zorix` (if the IIFE exposes a global) — see docs for exact names
</script>
```

## Where to learn more

- Full docs & guides: https://asif-4520.github.io/zorix/
- API reference: docs/api/
- Issues & feature requests: https://github.com/Asif-4520/zorix/issues

## Features (short)

- Typesafe schema builder
- Indexes (single & compound)
- Query operators (gt, lt, gte, lte, contains, startsWith)
- Sorting and pagination
- Transactions and migrations

## Development

Clone and run locally (PowerShell):

```powershell
git clone https://github.com/Asif-4520/zorix.git
cd zorix
pnpm install

# run docs locally
pnpm run docs:dev

# run tests / build
pnpm run build
pnpm run test
```

## Contribution

Contributions are welcome. Please open issues or PRs. Before submitting a PR, run the tests and follow the formatting rules described in the repo (prettier/eslint). Read `CONTRIBUTING.md` for details.


## Features

- Schema-driven models with TypeScript typings
- Fast queries using IndexedDB indexes & cursors
- Atomic transactions across multiple models
- Lightweight, zero runtime dependencies
- Clear migration/versioning story


## Documentation

Full docs and guides are hosted at: https://asif-4520.github.io/zorix/

They include guides for:

- Getting started and installation
- Schema & index design
- Query language and advanced queries
- Transactions and migrations


## Contributing

Contributions are welcome — please read `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` before opening PRs.

Local development:

```bash
git clone https://github.com/Asif-4520/zorix.git
cd zorix
pnpm install
pnpm run docs:dev   # run docs locally
pnpm run build      # build the library
```

---

## Security

Report security issues via the project's issue tracker or by following the `SECURITY.md` guidance.

---

## License

Zorix is released under the MIT License — see `LICENSE`.


Made with ❤️ by Asif-4520
