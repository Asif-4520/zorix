# Setup and Installation

Zorix is a lightweight, zero-dependency library designed for modern web environments. Whether you are using a state-of-the-art build pipeline or a simple vanilla HTML file, Zorix fits seamlessly into your workflow.

## 📦 Installation

Install Zorix via your preferred package manager to enjoy full TypeScript support and optimized bundling.

::: code-group

```bash [npm]
npm install @zorix/zorixdb
```

```bash [yarn]
yarn add @zorix/zorixdb
```

```bash [pnpm]
pnpm add @zorix/zorixdb
```

```bash [bun]
bun add @zorix/zorixdb
```

:::

## 🌐 CDN Usage

For rapid prototyping or vanilla projects, you can load Zorix directly via CDN.

### ES Modules (Recommended)

```html
<script type="module">
  import { DB, schema, string } from 'https://unpkg.com/@zorix/zorixdb@latest/dist/zorix.esm.js';

  const db = new DB('demo-db');
  // ...
</script>
```

### Global Variable (IIFE)

```html
<script src="https://unpkg.com/@zorix/zorixdb@latest/dist/zorix.iife.js"></script>
<script>
  const { DB, schema, string } = window.zorix;
  // ...
</script>
```

::: tip 📌 Version Locking
For production use via CDN, always lock to a specific version (e.g., `@1.0.5`) instead of `@latest` to avoid unexpected breaking changes during library updates.
:::

## ⚙️ Environment Requirements

Zorix interacts directly with the browser's native **IndexedDB API**.

- **Browsers**: All modern browsers (Chrome, Firefox, Safari, Edge).
- **SSR (Server-Side Rendering)**: Zorix is client-side only.

::: danger 🛑 SSR Frameworks (Next.js, Nuxt, etc.)
Because `indexedDB` does not exist in Node.js, Zorix will throw an error if initialized on the server. Always wrap Zorix initialization in a client-side lifecycle hook:

```typescript
// React Example
useEffect(() => {
  const db = new DB('my-app');
  // ...
}, []);
```

:::

## 💾 Storage Limits & Quotas

IndexedDB storage limits are managed by the browser and vary based on available disk space and user settings.

- **Dynamic Quotas**: Most modern browsers (Chrome, Edge, Firefox) allow IndexedDB to use up to 80% of total disk space.
- **Persistence**: Data in Zorix is persistent. However, browsers may clear "Best Effort" storage if the device runs extremely low on space.
- **Quota Exceeded**: If the limit is reached, Zorix will throw a `QuotaExceededError`.

::: tip 🛡️ Handling Quotas
Always wrap your `.insert()` or `.insertMany()` calls in a `try/catch` block to handle potential storage errors gracefully:

```typescript
try {
  await Users.insert(data);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    alert('Storage full! Please free up some space.');
  }
}
```

:::

## 🛡️ TypeScript Configuration

Zorix leverages advanced TypeScript inference. For the best experience (and accurate autocompletion), ensure your `tsconfig.json` is configured with `strict: true`.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true
  }
}
```

## 🚀 Next Steps

Ready to build? Move on to the [Quickstart Guide](./quick-start.md) to define your first model.
