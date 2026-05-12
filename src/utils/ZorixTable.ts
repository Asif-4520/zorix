export class MigrationTable {
  constructor(
    protected db: IDBDatabase,
    protected store: IDBObjectStore
  ) {}

  /** Deletes an "index" from the object table. */
  deleteIndex(name: string) {
    this.store.deleteIndex(name);
  }
  /** Creates an "index" in the object table. */
  createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters) {
    this.store.createIndex(name, keyPath, options);
  }
  /** Deletes the object "table". */
  delete() {
    this.db.deleteObjectStore(this.store.name);
  }
}
