---
layout: home

hero:
  name: 'Zorix DB'
  text: 'Simple & Fast IndexedDB Library'
  tagline: Super fast, lightweight, and type-safe database for your web apps. Working with IndexedDB has never been this easy.
  image:
    src: '/asset/zorix.png'
    alt: Zorix Logo
  actions:
    - theme: brand
      text: Get Started →
      link: /guide/introduction
    - theme: alt
      text: API Reference
      link: /api/database
    - theme: alt
      text: GitHub
      link: https://github.com/Asif-4520/zorix
---

<div class="showcase">

<div class="install-bar">
  <code>pnpm add @zorix/zorixdb</code>
</div>

<div class="code-window">
  <div class="window-header">
    <div class="window-dots">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
    </div>
    <div class="window-title">quickstart.ts</div>
  </div>

```typescript
import { DB, schema, string, number } from '@zorix/zorixdb';

// 1. Connect to database
const db = new DB('my-app', { version: 1 });

// 2. Listen for database changes easily
db.on('change', (event) => console.log('Data changed:', event));

// 3. Define schema with type safety
const Users = await db.model(
  'users',
  schema({
    id: number().primary(),
    name: string().index(),
    age: number(),
  })
);

// 4. Fast bulk insert in one single transaction
await Users.insertMany([
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
]);

// 5. Query data using simple, clean syntax
const adults = await Users.find({ where: { age: { gte: 18 } } });
console.log(adults);
```
</div>

<div class="grid-features">
  <div class="feature-card">
    <div class="card-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
    </div>
    <div class="card-title">10x–50x Fast Bulk Writes</div>
    <div class="card-desc">Inserts thousands of records in one quick transaction. Super fast data saving.</div>
  </div>

  <div class="feature-card">
    <div class="card-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12l-5 5"></path><path d="M12 15l5-5"></path></svg>
    </div>
    <div class="card-title">Native Query Speed</div>
    <div class="card-desc">Fetches data straight from the browser engine without slow cursor loops.</div>
  </div>

  <div class="feature-card">
    <div class="card-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
    </div>
    <div class="card-title">TypeScript-First</div>
    <div class="card-desc">Full auto-completion and type checking. Catch errors early while writing code.</div>
  </div>

  <div class="feature-card">
    <div class="card-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path><circle cx="12" cy="12" r="2"></circle><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path><path d="M19.1 4.9c3.9 3.9 3.9 10.3 0 14.2"></path></svg>
    </div>
    <div class="card-title">Simple Events</div>
    <div class="card-desc">Listen to data inserts, updates, and deletes easily to keep your UI in sync.</div>
  </div>

  <div class="feature-card">
    <div class="card-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
    </div>
    <div class="card-title">Always Fresh Data</div>
    <div class="card-desc">Reads fresh data straight from IndexedDB every time. No hidden cache confusion.</div>
  </div>

  <div class="feature-card">
    <div class="card-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
    </div>
    <div class="card-title">Zero Dependencies</div>
    <div class="card-desc">Tiny library size with zero extra packages. Keeps your app build light and clean.</div>
  </div>
</div>

</div>

<style>
.showcase {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 2rem 6rem;
}

.install-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.install-bar code {
  background: var(--vp-c-bg-soft) !important;
  border: 1px solid var(--vp-c-brand-1) !important;
  padding: 14px 28px !important;
  border-radius: 30px !important;
  color: var(--vp-c-brand-1) !important;
  font-family: var(--vp-font-family-mono);
  font-size: 1.05rem;
  font-weight: 600;
  box-shadow: 0 8px 30px rgba(62, 175, 124, 0.15);
}

.code-window {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  margin-bottom: 4rem;
}

.window-header {
  background: var(--vp-c-bg-soft);
  padding: 12px 18px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--vp-c-border);
  position: relative;
}

.window-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.dot-red { background: #ff5f56; }
.dot-yellow { background: #ffbd2e; }
.dot-green { background: #27c93f; }

.window-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
}

.grid-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.feature-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
  padding: 1.75rem;
  transition: all 0.25s ease;
}

.feature-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.card-icon {
  margin-bottom: 0.75rem;
  color: var(--vp-c-brand-1);
}

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}

.card-desc {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .grid-features {
    grid-template-columns: 1fr;
  }
}
</style>
