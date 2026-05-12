# Read Records

Zorix offers multiple ways to retrieve your data.

## Get by Primary Key

The fastest way to retrieve a single record is by its primary key using `.get()`.

```typescript
const user = await Users.get(1);
```

## Find with Criteria

Use `.find()` to search for records matching specific filters.

```typescript
const activeUsers = await Users.find({
  where: { status: 'active' }
});
```

## Get All Records

To retrieve every record in a store, use `.getAll()`.

```typescript
const allUsers = await Users.getAll();
```

::: warning ⚠️ Memory Usage
Be careful with `.getAll()` on very large stores. It loads everything into memory at once.
:::

## Count Records

To quickly get the number of records:

```typescript
const count = await Users.count();
```

Learn more about [Queries](./queries.md) and [Filtering](./filtering.md).
