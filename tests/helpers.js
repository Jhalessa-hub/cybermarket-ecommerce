import { createLocalDatabase } from '../src/services/storage/localDatabase.js';

export function createMemoryStorage() {
  const entries = new Map();
  const storage = {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => { entries.set(key, String(value)); },
    removeItem: (key) => { entries.delete(key); },
  };
  return storage;
}

export function setupDatabase({ storage = createMemoryStorage(), sessionStorage = createMemoryStorage(), target = new EventTarget() } = {}) {
  const db = createLocalDatabase({ getStorage: () => storage, getSessionStorage: () => sessionStorage, eventTarget: target });
  const sendStorage = (key) => {
    const event = new Event('storage');
    Object.defineProperty(event, 'key', { value: key });
    Object.defineProperty(event, 'storageArea', { value: storage });
    target.dispatchEvent(event);
  };
  return { db, storage, sessionStorage, target, sendStorage };
}
