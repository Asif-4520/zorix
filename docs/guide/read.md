# Reading Data

Zorix gives you simple methods to fetch data from your database, whether you need a single record or filtered search results.

## 1. Get by Primary Key (`get`)

Fetching an item by its primary key using `.get()` is the fastest possible read operation in IndexedDB:

```typescript
const user = await Users.get(1);
console.log(user?.name);
```

If the item exists, it returns the object. If not found, it returns `undefined`.

---

## 2. Fast Query Search (`find`)

Use `.find()` to search for items matching your criteria. Zorix automatically uses browser indexes to make your search super fast:

```typescript
const activeUsers = await Users.find({
  where: { status: { eq: 'active' } },
});
```

---

## 3. Get All Records (`getAll`)

To fetch every single record from an object store:

```typescript
const allUsers = await Users.getAll();
```

::: tip 📌 Quick Tip
For large tables with thousands of items, prefer using `.find()` with `limit` and `offset` instead of loading everything into memory at once.
:::

---

## 4. Count Total Records (`count`)

To quickly get the total number of records in a table:

```typescript
const totalUsers = await Users.count();
console.log('Total users:', totalUsers);
```

---

## 🚀 Next Steps

- 🔍 **[Query Engine Basics](./queries.md)** — Learn more about query options.
- 🎯 **[Filtering Operators](./filtering.md)** — Learn about operators like `gte`, `lte`, `between`, and `startsWith`.
- 🟡 **[Updating Data](./update.md)** — Learn how to update matching records.
