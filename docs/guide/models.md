# Models

Models are the primary way to interact with data in Zorix. Each model corresponds to an IndexedDB Object Store.

## Creating a Model

You create a model instance using the `db.model()` method. This method is asynchronous because it ensures the object store and its indexes are properly set up before you start using it.

```typescript
import { schema, string, number } from '@zorix/zorixdb';

const userSchema = schema({
  id: number().primary(),
  name: string().index(),
});

const Users = await db.model('users', userSchema);
```

## Model Properties

### `name`

The name of the object store.

### `schema`

The schema definition associated with the model.

## Core Operations

Models provide high-level methods for data manipulation:

- **Insertion**: `insert()`, `insertMany()`
- **Retrieval**: `get()`, `find()`, `getAll()`
- **Mutation**: `update()`
- **Deletion**: `delete()`, `clear()`
- **Utilities**: `count()`

See the [Data Operations](./create.md) section for detailed usage.
