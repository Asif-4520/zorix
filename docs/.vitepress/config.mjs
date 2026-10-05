import { defineConfig } from 'vitepress';

const basePath = '/zorix/';

export default defineConfig({
  title: 'Zorix DB',
  description: 'High-performance, type-safe IndexedDB database layer for modern web applications',

  base: basePath,
  head: [
    ['link', { rel: 'icon', href: basePath + 'asset/zorix.png', type: 'image/png' }],
    ['link', { rel: 'shortcut icon', href: basePath + 'asset/zorix.png' }],
    ['link', { rel: 'apple-touch-icon', href: basePath + 'asset/zorix.png' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
  ],

  themeConfig: {
    logo: basePath + 'asset/zorix.png',

    nav: [
      { text: 'Guide', link: '/guide/introduction', activeMatch: '/guide/' },
      { text: 'API Reference', link: '/api/database', activeMatch: '/api/' },
      { text: 'Changelog', link: '/changelog' },
      {
        text: 'NPM v1.0.0',
        link: 'https://www.npmjs.com/package/@zorix/zorixdb',
      },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Quick Start', link: '/guide/quick-start' },
        ],
        collapsed: false,
      },
      {
        text: 'Core Architecture',
        items: [
          { text: 'Database Instance', link: '/guide/database' },
          { text: 'Schema Design', link: '/guide/schemas' },
          { text: 'Models & Collections', link: '/guide/models' },
        ],
        collapsed: false,
      },
      {
        text: 'High-Performance Engine',
        items: [
          { text: 'Performance Optimization', link: '/guide/performance' },
          { text: 'Query Optimization', link: '/guide/query-optimization' },
          { text: 'Indexes & Strategy', link: '/guide/indexes' },
        ],
        collapsed: false,
      },
      {
        text: 'Data Operations',
        items: [
          { text: 'Creating & Bulk Inserts', link: '/guide/create' },
          { text: 'Reading Data', link: '/guide/read' },
          { text: 'Updating Data', link: '/guide/update' },
          { text: 'Deleting Data', link: '/guide/delete' },
        ],
        collapsed: false,
      },
      {
        text: 'Querying & Search',
        items: [
          { text: 'Query Engine Basics', link: '/guide/queries' },
          { text: 'Filtering Operators', link: '/guide/filtering' },
          { text: 'Sorting & Ordering', link: '/guide/sorting' },
          { text: 'Offset Pagination', link: '/guide/pagination' },
        ],
        collapsed: true,
      },
      {
        text: 'Events & Reactivity',
        items: [
          { text: 'Event Lifecycle System', link: '/guide/events' },
          { text: 'Error System', link: '/guide/errors' },
        ],
        collapsed: true,
      },
      {
        text: 'Migrations & Advanced',
        items: [
          { text: 'Versioning Overview', link: '/guide/versioning' },
          { text: 'Schema Migration', link: '/guide/schema-migration' },
          { text: 'Data Transformation', link: '/guide/data-transform' },
          { text: 'Atomic Transactions', link: '/guide/transactions' },
          { text: 'Raw IDB Escape Hatch', link: '/guide/raw-idb' },
          { text: 'Design Patterns & Recipes', link: '/guide/recipes' },
        ],
        collapsed: true,
      },
      {
        text: 'API Reference',
        items: [
          { text: 'DB Instance API', link: '/api/database' },
          { text: 'Schema Builder API', link: '/api/schema' },
          { text: 'Query Engine API', link: '/api/query' },
          { text: 'Migration API', link: '/api/migration' },
        ],
        collapsed: true,
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/Asif-4520/zorix' }],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Asif-4520 — Zorix DB',
    },
  },
});
