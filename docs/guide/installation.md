# Installation & Setup

Zorix is a lightweight package with zero extra dependencies. You can install it using your favorite package manager or include it directly in an HTML file using a CDN.

## 📦 Package Managers

Install Zorix using npm, pnpm, yarn, or bun:

::: code-group

```bash [pnpm]
pnpm add @zorix/zorixdb
```

```bash [npm]
npm install @zorix/zorixdb
```

```bash [yarn]
yarn add @zorix/zorixdb
```

```bash [bun]
bun add @zorix/zorixdb
```

:::

---

## 🌐 Using CDN (No Build Tool Required)

If you are building a simple project without a bundler, you can include Zorix directly from CDN:

### ES Modules (Recommended)

```html
<script type="module">
  import { DB, schema, string } from 'https://unpkg.com/@zorix/zorixdb@latest/dist/zorix.esm.js';

  const db = new DB('demo-db');
</script>
```

### Global Script Tag (IIFE)

```html
<script src="https://unpkg.com/@zorix/zorixdb@latest/dist/zorix.iife.js"></script>
<script>
  const { DB, schema, string } = window.zorix;
  const db = new DB('demo-db');
</script>
```

::: tip 📌 Pro Tip for CDN
For production apps, lock the CDN link to a specific version number (like `@1.0.0`) so automatic updates don't break your site.
:::

---

## ⚙️ SSR Frameworks (Next.js, Nuxt, SvelteKit)

Zorix interacts directly with the browser's `window.indexedDB` engine. Because Node.js does not have `indexedDB`, make sure to run Zorix code on the client side:

```typescript
// React / Next.js Example
import { useEffect } from 'react';
import { DB } from '@zorix/zorixdb';

export default function App() {
  useEffect(() => {
    const db = new DB('my-app');
    // Initialize models here
  }, []);

  return <div>App loaded</div>;
}
```

---

## 🚀 Next Steps

Now that you have Zorix installed, check out the following guides:
- ⚡ **[Quick Start Guide](./quick-start.md)** — Build your first model in 5 minutes.
- 💡 **[Schema Design](./schemas.md)** — Learn how to define fields and indexes.
- 📚 **[DB Instance API](../api/database.md)** — Full API reference for the DB class.
