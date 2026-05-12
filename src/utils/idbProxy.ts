export function proxyIndexedDBTransaction(
  db: IDBDatabase,
  storeName: string | string[],
  mode: IDBTransactionMode = 'readonly'
) {
  const tx = db.transaction(storeName, mode);

  const done = new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

  function promisifyRequest(req: IDBRequest) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function wrapStore(store: IDBObjectStore) {
    return new Proxy(store, {
      get(target, prop) {
        const value = (target as any)[prop];

        if (typeof value !== 'function') return value;

        return (...args: any[]) => {
          const result = value.apply(target, args);

          if (result instanceof IDBRequest) {
            return promisifyRequest(result);
          }

          return result;
        };
      },
    });
  }

  const proxyTx = new Proxy(tx, {
    get(target, prop) {
      if (prop === 'done') return done;

      if (prop === 'objectStore') {
        return (name: string) => {
          const store = target.objectStore(name);
          return wrapStore(store);
        };
      }

      return (target as any)[prop];
    },
  });

  return proxyTx;
}
