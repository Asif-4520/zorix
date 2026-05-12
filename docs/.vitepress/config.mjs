import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Zorix',
  description: 'Modern IndexedDB toolkit for structured local databases',

  base: '/zorix/',

  themeConfig: {
    logo: '/asset/zorix.png',

    nav: [
      { text: 'Guide', link: '/guide/introduction', activeMatch: '/guide/' },
      { text: 'Changelog', link: '/changelog' },
      {
        text: 'NPM',
        link: 'https://www.npmjs.com/package/zorixdb',
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
        collapsed: true,
      },
      {
        text: 'Core Concepts',
        items: [
          { text: 'Database Instance', link: '/guide/database' },
          { text: 'Schema Design', link: '/guide/schemas' },
          { text: 'Models & Collections', link: '/guide/models' },
        ],
        collapsed: true,
      },
      {
        text: 'CRUD Operations',
        items: [
          { text: 'Creating Data', link: '/guide/create' },
          { text: 'Reading Data', link: '/guide/read' },
          { text: 'Updating Data', link: '/guide/update' },
          { text: 'Deleting Data', link: '/guide/delete' },
        ],
        collapsed: true,
      },
      {
        text: 'Querying & Search',
        items: [
          { text: 'Query Basics', link: '/guide/queries' },
          { text: 'Filtering', link: '/guide/filtering' },
          { text: 'Sorting & Ordering', link: '/guide/sorting' },
          { text: 'Pagination', link: '/guide/pagination' },
          { text: 'Indexes & Optimization', link: '/guide/indexes' },
        ],
        collapsed: true,
      },
      {
        text: 'Migrations',
        items: [
          { text: 'Versioning Overview', link: '/guide/versioning' },
          { text: 'Schema Migration', link: '/guide/schema-migration' },
          { text: 'Data Transformation', link: '/guide/data-transform' },
        ],
        collapsed: true,
      },
      {
        text: 'Advanced Topics',
        items: [
          { text: 'Transactions', link: '/guide/transactions' },
          { text: 'Query Optimization', link: '/guide/query-optimization' },
          { text: 'Error Handling', link: '/guide/errors' },
          { text: 'Raw IndexedDB', link: '/guide/raw-idb' },
          { text: 'Performance Guide', link: '/guide/performance' },
          { text: 'Patterns & Recipes', link: '/guide/recipes' },
        ],
        collapsed: true,
      },

      {
        text: 'API Reference',
        items: [
          { text: 'Database Instance', link: '/api/database' },
          { text: 'Schema Builder', link: '/api/schema' },
          { text: 'Query Engine', link: '/api/query' },
          { text: 'Migration System', link: '/api/migration' },
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
      copyright: 'Copyright © 2026 Asif-4520',
    },
  },
});
