export class ZorixRecord {
  public value: Record<string, any>;

  private cursor: IDBCursorWithValue;

  constructor(cursor: IDBCursorWithValue) {
    this.cursor = cursor;
    this.value = structuredClone(cursor.value);
  }

  update(data: Record<string, any>) {
    const updated = {
      ...this.value,
      ...data,
    };

    this.cursor.update(updated);
  }

  replace(data: Record<string, any>) {
    this.cursor.update(data);
  }

  delete() {
    this.cursor.delete();
  }
}
