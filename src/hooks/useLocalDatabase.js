import { useEffect, useSyncExternalStore } from 'react';
import { localDatabase } from '../services/storage/localDatabase.js';

export function useLocalDatabase(database = localDatabase) {
  const snapshot = useSyncExternalStore(database.subscribe, database.getSnapshot, database.getSnapshot);
  useEffect(() => { database.initialize(); }, [database]);
  return snapshot;
}
