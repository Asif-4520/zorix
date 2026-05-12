export const zorixInternal = () => {
  const cache: Map<string, any> = new Map();
  return {
    get: (key: string) => {
      return cache.get(key);
    },
    set: (key: string, value: any) => {
      cache.set(key, value);
    },
    has: (key: string) => {
      return cache.has(key);
    },
    delete: (key: string) => {
      cache.delete(key);
    },
    getAll: () => {
      return Array.from(cache.entries());
    },
  };
};
