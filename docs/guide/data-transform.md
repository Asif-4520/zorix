# Data Transformation

Sometimes structural changes aren't enough, and you need to modify the data itself when upgrading schemas (e.g., converting strings to numbers or renaming fields).

## Declarative Transformations

Zorix provides a powerful `transform()` method to handle data updates during database upgrades. This method uses a cursor to traverse records efficiently.

```typescript
db.transform({
  users(record) {
    const user = record.value;

    // 1. Type Conversion
    if (typeof user.age === 'string') {
      user.age = Number(user.age);
    }

    // 2. Data Normalization
    user.email = user.email?.toLowerCase();
    user.username = user.username?.trim();

    // 3. Field Renaming
    if (user.name) {
      user.fullName = user.name;
      delete user.name;
    }

    // 4. Schema Evolution (Adding defaults)
    user.role = user.role || 'user';

    // Apply the changes
    record.update(user);
    
    // 5. Conditional Deletion
    if (user.status === 'banned' && !user.email) {
      record.delete();
    }
  }
});
```

> [!WARNING]
> `transform()` traverses **every single record** in the specified object store. For extremely large datasets, this can impact startup time during the upgrade process.

> [!NOTE]
> **No Strict Type Checking**: The `record.value` inside `transform()` is intentionally typed as `any`. This is because migrations often handle "legacy" data that may not conform to your current schema definitions. You are responsible for validating the data before calling `record.update()`.

## Common Patterns

### Full Record Rewrite
If you need to restructure a record completely:

```typescript
record.update({
  id: user.id,
  profile: {
    fullName: user.name,
    age: Number(user.age)
  },
  meta: {
    updatedAt: Date.now()
  }
});
```

### Conditional Updates
Only update if certain conditions are met to avoid unnecessary writes:

```typescript
if (!user.version || user.version < 2) {
  user.version = 2;
  record.update(user);
}
```

## Best Practices

1. **Safety First**: Test migrations on a copy of your data before deploying.
2. **Progressive**: Handle migrations step-by-step (e.g., check `db.version`).
3. **Validation**: Ensure the transformed data matches your new schema.

Next, explore [Advanced Topics](./transactions.md).
