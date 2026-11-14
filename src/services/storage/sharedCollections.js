import { SHARED_COLLECTION_KEYS } from './databaseSchema.js';
import { DomainError } from '../../utils/validation.js';

// Si solo existen las colecciones antiguas, conservarlas y validarlas antes de crear el envelope.
export function readInitialSharedCollections(storage, seed) {
  for (const [table, key] of Object.entries(SHARED_COLLECTION_KEYS)) {
    const raw = storage.getItem(key);
    if (raw === null) continue;
    try { seed[table] = JSON.parse(raw); }
    catch { throw new DomainError('CORRUPT', `La colección local ${key} no se pudo leer. No se ha sobrescrito.`); }
  }
  return seed;
}

// Proyecciones de compatibilidad. La transacción Orders + Products sigue siendo el envelope DB.
// Un fallo de una proyección no revierte ni oculta una compra ya guardada en la fuente canónica.
export function writeSharedCollections(storage, data) {
  for (const [table, key] of Object.entries(SHARED_COLLECTION_KEYS)) {
    try {
      const value = JSON.stringify(data[table]);
      if (storage.getItem(key) !== value) storage.setItem(key, value);
    } catch { /* La base canónica ya está persistida; se reintentará en la siguiente lectura. */ }
  }
}
