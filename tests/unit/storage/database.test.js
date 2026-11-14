import { describe, expect, it, vi } from 'vitest';
import { setupDatabase } from '../../helpers.js';
import { createSeedData } from '../../../src/services/storage/seedData.js';
import { CART_KEY, DATABASE_KEY, validateDatabase, migrateDatabase } from '../../../src/services/storage/databaseSchema.js';
import { createLocalDatabase } from '../../../src/services/storage/localDatabase.js';

describe('Catálogo y esquema relacional', () => {
  it('incluye 80 modelos y cuatro categorías con IDs únicos, sin clientes o pedidos inventados', () => {
    const db = validateDatabase(createSeedData());
    expect(db.Products).toHaveLength(80);
    expect(db.Categories).toHaveLength(4);
    expect(db.Customers).toEqual([]);
    expect(db.Orders).toEqual([]);
    expect(db.Session).toBeNull();
    expect(db.Products.filter((product) => product.categoryId === 'graphics')).toHaveLength(24);
    expect(db.Products.every((product) => product.currency === 'USD' && product.priceCents >= 0)).toBe(true);
  });

  it('devuelve semillas independientes sin compartir referencias mutables', () => {
    const a = createSeedData();
    a.Products[0].stock = 500;
    a.Categories[0].name = 'Otra';
    const b = createSeedData();
    expect(b.Products[0].stock).not.toBe(500);
    expect(b.Categories[0].name).not.toBe('Otra');
  });

  it('rechaza IDs duplicados y relaciones a categorías ausentes', () => {
    const db = createSeedData();
    db.Products.push(db.Products[0]);
    expect(() => validateDatabase(db)).toThrow();
    const invalid = createSeedData();
    invalid.Products[0].categoryId = 'missing';
    expect(() => validateDatabase(invalid)).toThrow();
  });

  it('rechaza stock fraccionario, negativos y precios no expresados en centavos enteros', () => {
    for (const [field, value] of [['stock', -1], ['stock', 1.5], ['priceCents', -100], ['priceCents', 1.2]]) {
      const db = createSeedData();
      db.Products[0][field] = value;
      expect(() => validateDatabase(db)).toThrow();
    }
  });

  it('migra solo el envelope v0 conocido sin perder el catálogo', () => {
    const old = createSeedData();
    old.version = 0;
    delete old.revision;
    const migrated = migrateDatabase(old);
    expect(migrated.version).toBe(1);
    expect(migrated.revision).toBe(0);
    expect(migrated.Products).toHaveLength(80);
  });

  it('rechaza una versión futura sin tratarla como datos vacíos', () => {
    expect(() => migrateDatabase({ ...createSeedData(), version: 999 })).toThrow();
  });
});

describe('Adaptador local y reactividad', () => {
  it('refresca al volver a una ventana aunque se haya perdido el evento storage', () => {
    const { db, storage, target } = setupDatabase(); db.initialize();
    const stop = db.subscribe(() => {});
    const external = JSON.parse(storage.getItem(DATABASE_KEY));
    external.Products[0].stock = 2; external.revision += 1;
    storage.setItem(DATABASE_KEY, JSON.stringify(external));
    target.dispatchEvent(new Event('focus'));
    expect(db.getSnapshot().data.Products[0].stock).toBe(2);
    stop();
  });

  it('al reconectar una suscripción no reutiliza una copia anterior a la compra', () => {
    const { db, storage } = setupDatabase(); db.initialize();
    const stop = db.subscribe(() => {}); stop();
    const external = JSON.parse(storage.getItem(DATABASE_KEY)); external.Products[0].stock = 1;
    storage.setItem(DATABASE_KEY, JSON.stringify(external));
    const unsubscribe = db.subscribe(() => {});
    expect(db.getSnapshot().data.Products[0].stock).toBe(1);
    unsubscribe();
  });

  it('dos repositorios del mismo documento reciben escrituras sin depender del evento storage nativo', () => {
    const { db, storage, target } = setupDatabase(); db.initialize();
    const other = createLocalDatabase({ getStorage: () => storage, eventTarget: target }); other.initialize();
    const stop = other.subscribe(() => {});
    db.update((data) => { data.Products[0].stock = 3; });
    expect(other.getSnapshot().data.Products[0].stock).toBe(3);
    stop();
  });

  it('actualizar sin cambios conserva la identidad del snapshot y no genera bucles', () => {
    const { db } = setupDatabase(); db.initialize();
    const initial = db.getSnapshot(); db.retry();
    expect(db.getSnapshot()).toBe(initial);
  });

  it('pageshow y recuperar visibilidad rehidratan cambios que no notificó storage', () => {
    const { storage, target } = setupDatabase();
    const documentTarget = new EventTarget();
    Object.defineProperty(documentTarget, 'visibilityState', { value: 'visible' });
    const db = createLocalDatabase({ getStorage: () => storage, eventTarget: target, documentTarget }); db.initialize();
    const stop = db.subscribe(() => {});
    const external = JSON.parse(storage.getItem(DATABASE_KEY)); external.Products[0].stock = 5;
    storage.setItem(DATABASE_KEY, JSON.stringify(external)); target.dispatchEvent(new Event('pageshow'));
    expect(db.getSnapshot().data.Products[0].stock).toBe(5);
    external.Products[0].stock = 4; storage.setItem(DATABASE_KEY, JSON.stringify(external));
    documentTarget.dispatchEvent(new Event('visibilitychange'));
    expect(db.getSnapshot().data.Products[0].stock).toBe(4);
    stop();
    external.Products[0].stock = 3; storage.setItem(DATABASE_KEY, JSON.stringify(external));
    target.dispatchEvent(new Event('focus')); documentTarget.dispatchEvent(new Event('visibilitychange'));
    expect(db.getSnapshot().data.Products[0].stock).toBe(4);
  });

  it('inicializa una sola vez y no repuebla colecciones vacías válidas', () => {
    const { db, storage } = setupDatabase();
    db.initialize();
    db.update((draft) => { draft.Products = []; });
    const before = storage.getItem(DATABASE_KEY);
    db.initialize();
    expect(db.getSnapshot().data.Products).toEqual([]);
    expect(storage.getItem(DATABASE_KEY)).toBe(before);
  });

  it('persiste antes de notificar y entrega snapshots inmutables', () => {
    const { db, storage } = setupDatabase();
    db.initialize();
    const listener = vi.fn(() => {
      expect(JSON.parse(storage.getItem(DATABASE_KEY)).revision).toBe(db.getSnapshot().data.revision);
    });
    const stop = db.subscribe(listener);
    db.update((draft) => { draft.Products[0].stock = 30; });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(Object.isFrozen(db.getSnapshot().data.Products[0])).toBe(true);
    stop();
  });

  it('no escribe ni cambia el snapshot si falla una regla de dominio', () => {
    const { db, storage } = setupDatabase();
    db.initialize();
    const before = db.getSnapshot();
    const raw = storage.getItem(DATABASE_KEY);
    expect(() => db.update((draft) => { draft.Products[0].stock = -10; })).toThrow();
    expect(db.getSnapshot()).toBe(before);
    expect(storage.getItem(DATABASE_KEY)).toBe(raw);
  });

  it('conserva datos corruptos, bloquea escrituras y puede reintentar después de reparar', () => {
    const { db, storage } = setupDatabase();
    storage.setItem(DATABASE_KEY, '{damaged');
    db.initialize();
    expect(db.getSnapshot().status).toBe('error');
    expect(storage.getItem(DATABASE_KEY)).toBe('{damaged');
    expect(() => db.update(() => {})).toThrow();
    storage.setItem(DATABASE_KEY, JSON.stringify(createSeedData()));
    db.retry();
    expect(db.getSnapshot().status).toBe('ready');
  });

  it('conserva la última copia en memoria ante cuota excedida, sin publicar éxito', () => {
    const { db, storage } = setupDatabase();
    db.initialize();
    const before = db.getSnapshot().data;
    vi.spyOn(storage, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError'); });
    expect(() => db.update((draft) => { draft.Products[0].stock = 50; })).toThrow();
    expect(db.getSnapshot().status).toBe('error');
    expect(db.getSnapshot().data).toBe(before);
  });

  it('controla acceso a storage bloqueado', () => {
    const db = createLocalDatabase({ getStorage: () => { throw new Error('SecurityError'); } });
    db.initialize();
    expect(db.getSnapshot().status).toBe('error');
    expect(db.getSnapshot().data).toBeNull();
  });

  it('recibe cambios de otras pestañas y elimina listeners al desmontar', () => {
    const { db, storage, sendStorage } = setupDatabase();
    db.initialize();
    const listener = vi.fn();
    const stop = db.subscribe(listener);
    const next = createSeedData();
    next.Products[0].stock = 99;
    storage.setItem(DATABASE_KEY, JSON.stringify(next));
    sendStorage(DATABASE_KEY);
    expect(db.getSnapshot().data.Products[0].stock).toBe(99);
    expect(listener).toHaveBeenCalledTimes(1);
    stop();
    sendStorage(DATABASE_KEY);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('no restablece automáticamente ante un evento corrupto y conserva el snapshot anterior', () => {
    const { db, storage, sendStorage } = setupDatabase();
    db.initialize();
    const before = db.getSnapshot().data;
    const stop = db.subscribe(() => {});
    storage.setItem(DATABASE_KEY, 'bad');
    sendStorage(DATABASE_KEY);
    expect(db.getSnapshot().status).toBe('error');
    expect(db.getSnapshot().data).toBe(before);
    stop();
  });

  it('lee el carrito persistido sin borrarlo al inicializar', () => {
    const { db, storage } = setupDatabase();
    storage.setItem(CART_KEY, JSON.stringify({ version: 1, lines: [{ productId: 'graphics-001', quantity: 2 }] }));
    db.initialize();
    expect(db.getSnapshot().cart.lines[0].quantity).toBe(2);
  });

  it('detecta carrito corrupto sin borrarlo', () => {
    const { db, storage } = setupDatabase();
    storage.setItem(CART_KEY, 'bad');
    db.initialize();
    expect(db.getSnapshot().error.code).toBe('CART_CORRUPT');
    expect(storage.getItem(CART_KEY)).toBe('bad');
  });

  it('requiere confirmación y guarda una copia antes de restablecer la demo', () => {
    const { db, storage } = setupDatabase();
    storage.setItem(DATABASE_KEY, 'bad');
    expect(() => db.reset()).toThrow();
    db.reset({ confirmed: true });
    expect(storage.getItem(`${DATABASE_KEY}:backup`)).toBe('bad');
    expect(db.getSnapshot().status).toBe('ready');
  });
});
