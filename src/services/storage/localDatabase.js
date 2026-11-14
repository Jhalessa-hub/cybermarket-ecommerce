import { CART_KEY, DATABASE_KEY, SESSION_KEY, SHARED_COLLECTION_KEYS, migrateDatabase, validateCart, validateDatabase } from './databaseSchema.js';
import { readLocalCart, writeLocalCart } from './localCart.js';
import { createSeedData } from './seedData.js';
import { DomainError } from '../../utils/validation.js';
import { readTabSession, writeTabSession } from './tabSession.js';
import { readInitialSharedCollections, writeSharedCollections } from './sharedCollections.js';

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

const LOCAL_WRITE_EVENT = 'cybermarket:storage-write';

export function createLocalDatabase({ getStorage = () => window.localStorage, getSessionStorage = () => window.sessionStorage, eventTarget = globalThis.window, documentTarget = eventTarget?.document } = {}) {
  let snapshot = Object.freeze({ status: 'loading', data: null, cart: null, error: null });
  const listeners = new Set();
  let attached = false;
  const source = Symbol('database-instance');

  function broadcast(storage, scope = 'shared') {
    // storage nativo solo avisa a otros documentos, no a otras instancias en esta página/HMR.
    if (!eventTarget?.dispatchEvent) return;
    const event = new Event(LOCAL_WRITE_EVENT);
    Object.defineProperty(event, 'detail', { value: { source, storageArea: storage, scope } });
    eventTarget.dispatchEvent(event);
  }

  function publish(next) {
    snapshot = freeze(next);
    listeners.forEach((listener) => listener());
  }

  function fail(cause) {
    const error = cause instanceof DomainError ? cause : new DomainError('STORAGE', 'No se pudieron leer o guardar los datos locales. Reintenta; tus datos no se borrarán automáticamente.');
    publish({ ...snapshot, status: 'error', error });
    return error;
  }

  function readDatabase(storage) {
    const raw = storage.getItem(DATABASE_KEY);
    if (raw === null) {
      const data = validateDatabase(readInitialSharedCollections(storage, createSeedData()));
      storage.setItem(DATABASE_KEY, JSON.stringify(data));
      writeSharedCollections(storage, data);
      return data;
    }
    let parsed;
    try { parsed = JSON.parse(raw); }
    catch { throw new DomainError('CORRUPT', 'Los datos locales están dañados. No se han borrado; reintenta o solicita restablecer la demo.'); }
    // Una Session antigua en localStorage jamás concede permisos a una pestaña nueva.
    const data = migrateDatabase({ ...parsed, Session: null });
    if (data.version !== parsed.version || parsed.Session !== null) storage.setItem(DATABASE_KEY, JSON.stringify(data));
    writeSharedCollections(storage, data);
    return data;
  }

  function withSession(data) {
    return { ...data, Session: readTabSession(getSessionStorage(), data.Customers) };
  }

  function refresh() {
    try {
      const storage = getStorage();
      const data = withSession(readDatabase(storage));
      const cart = readLocalCart(storage, data.Orders);
      if (snapshot.status === 'ready' && JSON.stringify(snapshot.data) === JSON.stringify(data) && JSON.stringify(snapshot.cart) === JSON.stringify(cart)) return snapshot;
      publish({ status: 'ready', data, cart, error: null });
    } catch (error) { fail(error); }
    return snapshot;
  }

  function handleStorage(event) {
    if (event.key === SESSION_KEY) {
      try { if (event.storageArea !== getSessionStorage()) return; }
      catch (error) { fail(error); return; }
      refresh(); return;
    }
    if (event.key === null || event.key === DATABASE_KEY || event.key === CART_KEY || Object.values(SHARED_COLLECTION_KEYS).includes(event.key)) {
      try { if (event.storageArea && event.storageArea !== getStorage()) return; }
      catch (error) { fail(error); return; }
      refresh();
    }
  }

  function handleLocalWrite(event) {
    if (event.detail?.source === source) return;
    try { if (event.detail?.storageArea !== (event.detail?.scope === 'session' ? getSessionStorage() : getStorage())) return; }
    catch (error) { fail(error); return; }
    refresh();
  }

  function handleVisible() {
    if (documentTarget?.visibilityState === 'visible') refresh();
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      if (!attached) {
        eventTarget?.addEventListener('storage', handleStorage);
        eventTarget?.addEventListener(LOCAL_WRITE_EVENT, handleLocalWrite);
        eventTarget?.addEventListener('focus', refresh);
        eventTarget?.addEventListener('pageshow', refresh);
        documentTarget?.addEventListener('visibilitychange', handleVisible);
        attached = true;
        // Reanudar una vista no debe reutilizar un snapshot anterior a una compra.
        if (snapshot.status === 'ready') refresh();
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size && attached) {
          eventTarget?.removeEventListener('storage', handleStorage);
          eventTarget?.removeEventListener(LOCAL_WRITE_EVENT, handleLocalWrite);
          eventTarget?.removeEventListener('focus', refresh);
          eventTarget?.removeEventListener('pageshow', refresh);
          documentTarget?.removeEventListener('visibilitychange', handleVisible);
          attached = false;
        }
      };
    },
    initialize() { return snapshot.status === 'ready' ? snapshot : refresh(); },
    retry: refresh,
    updateCart(mutator) {
      if (snapshot.status !== 'ready') throw new DomainError('NOT_READY', 'Los datos no están disponibles. Reintenta antes de guardar.');
      let storage, data, current;
      try {
        storage = getStorage();
        data = freeze(withSession(readDatabase(storage)));
        current = readLocalCart(storage, data.Orders);
      } catch (error) { throw fail(error); }
      const cart = structuredClone(current);
      const result = mutator(cart, data);
      if (result && typeof result.then === 'function') throw new DomainError('ASYNC_MUTATION', 'La escritura del carrito debe ser síncrona.');
      validateCart(cart);
      if (JSON.stringify(cart) === JSON.stringify(current)) return result;
      if (JSON.stringify(cart.lines) !== JSON.stringify(current.lines)) cart.checkoutToken = crypto.randomUUID();
      try { writeLocalCart(storage, cart); }
      catch (error) { throw fail(error); }
      publish({ status: 'ready', data, cart, error: null });
      broadcast(storage);
      return result;
    },
    update(mutator, { withCart = false } = {}) {
      if (snapshot.status !== 'ready') throw new DomainError('NOT_READY', 'Los datos no están disponibles. Reintenta antes de guardar.');
      let storage;
      let draft;
      let cart;
      try {
        storage = getStorage();
        draft = structuredClone(withSession(readDatabase(storage)));
        if (withCart) cart = freeze(readLocalCart(storage, draft.Orders));
      } catch (error) { throw fail(error); }
      // Un error de dominio no se convierte en error de almacenamiento ni modifica el snapshot.
      const previousSession = draft.Session;
      const before = JSON.stringify({ ...draft, Session: null });
      const result = mutator(draft, cart);
      if (result && typeof result.then === 'function') throw new DomainError('ASYNC_MUTATION', 'La escritura local debe ser síncrona.');
      validateDatabase(draft);
      const sharedChanged = JSON.stringify({ ...draft, Session: null }) !== before;
      const sessionChanged = JSON.stringify(draft.Session) !== JSON.stringify(previousSession);
      if (!sharedChanged && !sessionChanged) {
        publish({ ...snapshot, status: 'ready', data: draft, ...(withCart ? { cart } : {}), error: null });
        return result;
      }
      if (sharedChanged) draft.revision += 1;
      let sessionStorage, previousRawSession, sessionWritten = false;
      try {
        if (sessionChanged) {
          sessionStorage = getSessionStorage();
          previousRawSession = sessionStorage.getItem(SESSION_KEY);
          writeTabSession(sessionStorage, draft.Session, draft.Customers);
          sessionWritten = true;
        }
        if (sharedChanged) storage.setItem(DATABASE_KEY, JSON.stringify({ ...draft, Session: null }));
      } catch (error) {
        if (sessionWritten) {
          try {
            if (previousRawSession === null) sessionStorage.removeItem(SESSION_KEY);
            else sessionStorage.setItem(SESSION_KEY, previousRawSession);
          } catch { /* Se conserva el error y no se anuncia la operación como exitosa. */ }
        }
        throw fail(error);
      }
      if (sharedChanged) writeSharedCollections(storage, draft);
      publish({ ...snapshot, status: 'ready', data: draft, ...(withCart ? { cart } : {}), error: null });
      if (sharedChanged) broadcast(storage);
      if (sessionChanged) broadcast(sessionStorage, 'session');
      return result;
    },
    // Solo con confirmación explícita. No toca claves de otras aplicaciones ni el carrito.
    reset({ confirmed = false } = {}) {
      if (!confirmed) throw new DomainError('CONFIRM_REQUIRED', 'Confirma antes de restablecer los datos de la demo.');
      try {
        const storage = getStorage();
        const old = storage.getItem(DATABASE_KEY);
        if (old !== null) storage.setItem(`${DATABASE_KEY}:backup`, old);
        const data = validateDatabase(createSeedData());
        storage.setItem(DATABASE_KEY, JSON.stringify(data));
        writeSharedCollections(storage, data);
      } catch (error) { throw fail(error); }
      return refresh();
    },
  };
}

export const localDatabase = createLocalDatabase();
