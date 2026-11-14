import { expect, it, vi } from 'vitest';
import { createCartService, summarizeCart } from '../../../src/services/cartService.js';
import { createLocalDatabase } from '../../../src/services/storage/localDatabase.js';
import { CART_KEY, DATABASE_KEY } from '../../../src/services/storage/databaseSchema.js';
import { setupDatabase } from '../../helpers.js';

it('agrega, acumula, cambia cantidad, calcula centavos y elimina líneas', () => {
  const { db } = setupDatabase(); db.initialize();
  const cart = createCartService(db);
  cart.add('graphics-001'); cart.add('graphics-001');
  let summary = summarizeCart(db.getSnapshot().cart.lines, db.getSnapshot().data.Products);
  expect(summary.itemCount).toBe(2);
  expect(summary.totalCents).toBe(59800);
  cart.setQuantity('graphics-001', 3);
  summary = summarizeCart(db.getSnapshot().cart.lines, db.getSnapshot().data.Products);
  expect(summary.lines[0].lineTotalCents).toBe(89700);
  cart.remove('graphics-001');
  expect(db.getSnapshot().cart.lines).toEqual([]);
});

it('rechaza cero, negativos, fracciones, stock agotado y más unidades del inventario', () => {
  const { db } = setupDatabase(); db.initialize();
  const cart = createCartService(db);
  cart.add('graphics-003', 4);
  expect(() => cart.add('graphics-003')).toThrow();
  for (const quantity of [0, -1, 1.5, 5]) expect(() => cart.setQuantity('graphics-003', quantity)).toThrow();
  expect(() => cart.add('graphics-004')).toThrow();
  expect(() => cart.add('unknown')).toThrow();
  expect(db.getSnapshot().cart.lines[0].quantity).toBe(4);
});

it('el carrito persiste separado de DB y restaura cantidades tras recargar', () => {
  const { db, storage } = setupDatabase(); db.initialize();
  const databaseBefore = storage.getItem(DATABASE_KEY);
  createCartService(db).add('graphics-001', 2);
  expect(storage.getItem(DATABASE_KEY)).toBe(databaseBefore);
  const restored = createLocalDatabase({ getStorage: () => storage });
  restored.initialize();
  expect(restored.getSnapshot().cart.lines).toEqual([{ productId: 'graphics-001', quantity: 2 }]);
});

it('se notifica solo después de persistir y se sincroniza el evento storage', () => {
  const { db, storage, sendStorage } = setupDatabase(); db.initialize();
  const listener = vi.fn(); const stop = db.subscribe(listener);
  createCartService(db).add('graphics-001');
  expect(listener).toHaveBeenCalledTimes(1);
  expect(JSON.parse(storage.getItem(CART_KEY)).lines).toHaveLength(1);
  storage.setItem(CART_KEY, JSON.stringify({ version: 1, lines: [{ productId: 'processors-001', quantity: 3 }] }));
  sendStorage(CART_KEY);
  expect(db.getSnapshot().cart.lines[0].quantity).toBe(3);
  stop();
});

it('ajusta inventario reducido y retira artículos inactivos o agotados, informando cambios', () => {
  const { db } = setupDatabase(); db.initialize();
  const cart = createCartService(db);
  cart.add('graphics-001', 5); cart.add('graphics-002', 2);
  db.update((draft) => { draft.Products.find((p) => p.id === 'graphics-001').stock = 2; draft.Products.find((p) => p.id === 'graphics-002').active = false; });
  const changes = cart.reconcile();
  expect(changes).toHaveLength(2);
  expect(db.getSnapshot().cart.lines).toEqual([{ productId: 'graphics-001', quantity: 2 }]);
  expect(cart.reconcile()).toEqual([]);
});

it('un fallo de almacenamiento conserva el carrito anterior y no publica un falso éxito', () => {
  const { db, storage } = setupDatabase(); db.initialize();
  const cart = createCartService(db); cart.add('graphics-001');
  const before = db.getSnapshot().cart;
  vi.spyOn(storage, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError'); });
  expect(() => cart.add('graphics-001')).toThrow();
  expect(db.getSnapshot().cart).toBe(before);
  expect(db.getSnapshot().status).toBe('error');
});

it('rechaza un importe fuera del límite de enteros seguros antes de persistir', () => {
  const { db, storage } = setupDatabase(); db.initialize();
  db.update((draft) => { draft.Products.find((p) => p.id === 'graphics-001').priceCents = Number.MAX_SAFE_INTEGER; });
  expect(() => createCartService(db).add('graphics-001', 2)).toThrow();
  expect(storage.getItem(CART_KEY)).toBeNull();
});
