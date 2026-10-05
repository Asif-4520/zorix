# Saving & Inserting Data

Zorix makes saving data into IndexedDB simple and fast. You can save single records or thousands of items at once.

## 1. Single Record Insert (`insert`)

Use `.insert()` to save one item. Zorix automatically checks your data against your schema before saving:

```typescript
const id = await Users.insert({
  id: 1,
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
});

console.log('Inserted primary key:', id);
```

If the record data does not match your schema rules, Zorix throws a clean error telling you exactly which field failed.

---

## 2. Super Fast Bulk Insert (`insertMany`)

When you have multiple records to save (such as importing data or syncing API responses), always use `.insertMany()`:

```typescript
const result = await Users.insertMany([
  { id: 10, name: 'Priya', email: 'priya@example.com' },
  { id: 11, name: 'Amit', email: 'amit@example.com' },
]);

console.log('Total saved records:', result.insertedCount);
```

### Why `.insertMany()` is Super Fast
Instead of opening a new transaction for every single item, `.insertMany()` checks all items upfront and saves everything inside **one single database transaction**. This gives you a **10x to 50x speedup**!

---

## 🚀 Next Steps

- 🔍 **[Reading Data](./read.md)** — Learn how to fetch data by primary key or queries.
- ⚡ **[Performance Guide](./performance.md)** — Learn how Zorix handles high-speed bulk saving.
- 📡 **[Event Lifecycle](./events.md)** — Subscribe to data insert events automatically.
