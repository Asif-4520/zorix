---
layout: home

hero:
  name: 'Zorix'
  text: 'The Modern IDB Layer'
  tagline: High-performance, type-safe database layer for the modern web.
  image:
    src: '/asset/zorix.png'
    alt: Zorix Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/installation
    - theme: alt
      text: GitHub
      link: https://github.com/Asif-4520/zorix
---

<div class="showcase">

<div class="install-bar">
  <code>npm install @zorix/zorixdb</code>
</div>

<div class="showcase-grid">
  
  <div class=" code-box">
  
```typescript
import { DB, schema, string, number } from '@zorix/zorixdb';
const db = new DB('mydb', {
  version: 1,
});
const Users = await db.model(
  'users',
  schema({
    id: number().primary(),
    name: string().index(),
  })
);
await Users.insert({ id: 1, name: 'Alice' });
const user = await Users.get(1);
```

  </div>

  <div class="item highlight">
    <div class="label">Performance</div>
    <div class="value">Sub-ms</div>
    <div class="desc">Native B-Tree indexing.</div>
  </div>

  <div class="item highlight">
    <div class="label">Typing</div>
    <div class="value">100%</div>
    <div class="desc">TS Inference.</div>
  </div>

  <div class="item highlight">
    <div class="label">Bundle</div>
    <div class="value">< 30KB</div>
    <div class="desc">Zero dependencies.</div>
  </div>

</div>

</div>

<style>
.showcase {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 2rem 8rem;
}

.install-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 4rem;
}

.install-bar code {
  background: var(--vp-c-bg-soft) !important;
  border: 1px solid var(--vp-c-border) !important;
  padding: 14px 28px !important;
  border-radius: 14px !important;
  color: var(--vp-c-brand-1) !important;
  font-family: var(--vp-font-family-mono);
  font-size: 1rem;
  box-shadow: var(--vp-c-shadow-3);
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.item {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: transform 0.2s ease;
}

.code-box {
  grid-column: span 3;
  padding: 10px !important;
  overflow: hidden;
}

.window-controls {
  padding: 12px 16px;
  display: flex;
  gap: 6px;
}

.window-controls span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.window-controls span:nth-child(1) { background: #ff5f56; }
.window-controls span:nth-child(2) { background: #ffbd2e; }
.window-controls span:nth-child(3) { background: #27c93f; }

.code-header {
  padding: 0 16px 8px;
  font-size: 0.8rem;
  color: #666;
  font-family: var(--vp-font-family-mono);
}

.highlight {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.value {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.desc {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .showcase-grid {
    grid-template-columns: 1fr;
  }
  .code-box {
    grid-column: span 1;
  }
}
</style>
