import { expect, it, vi } from 'vitest';
import { createCartService } from '../../../src/services/cartService.js';
import { createOrderService } from '../../../src/services/orderService.js';
import { createLocalDatabase } from '../../../src/services/storage/localDatabase.js';
import { CART_KEY, DATABASE_KEY } from '../../../src/services/storage/databaseSchema.js';
import { checkoutFixture } from './fixtures.js';

it('guarda pedido y stock juntos, snapshot inmutable, estado Pendiente y carrito vacío', () => {
  const { db, storage, service } = checkoutFixture();
  const quote = service.reviewCheckout('address-1');
  const stock = db.getSnapshot().data.Products.find((p) => p.id === 'graphics-001').stock;
  const write = vi.spyOn(storage, 'setItem');
  const result = service.confirmCheckout(quote);
  expect(result.order.status).toBe('pending');
  expect(result.order.totalCents).toBe(59800);
  expect(result.order.paymentMode).toBe('demo');
  expect(db.getSnapshot().cart.lines).toEqual([]);
  const dbWrites = write.mock.calls.filter(([key]) => key === DATABASE_KEY);
  expect(dbWrites).toHaveLength(1);
  const saved = JSON.parse(dbWrites[0][1]);
  expect(saved.Orders).toHaveLength(1);
  expect(saved.Products.find((p) => p.id === 'graphics-001').stock).toBe(stock - 2);
  db.update((data) => { data.Customers[0].addresses[0].line1 = 'Otra calle'; data.Products.find((p) => p.id === 'graphics-001').name = 'Otro nombre'; });
  expect(db.getSnapshot().data.Orders[0].shippingAddress.line1).toBe('Calle Demo 123');
  expect(db.getSnapshot().data.Orders[0].lines[0].name).toBe('NVIDIA GeForce RTX 4060');
});

it('reintentos y otra instancia no duplican pedidos ni vacían compras posteriores', () => {
  const { db, service } = checkoutFixture();
  const quote = service.reviewCheckout('address-1');
  const first = service.confirmCheckout(quote).order;
  createCartService(db).add('processors-001');
  expect(createOrderService(db).confirmCheckout(quote).order.id).toBe(first.id);
  expect(db.getSnapshot().data.Orders).toHaveLength(1);
  expect(db.getSnapshot().cart.lines).toEqual([{ productId: 'processors-001', quantity: 1 }]);
});

it.each(['stock', 'price', 'address', 'cart'])('rechaza cambios de %s antes de escribir y conserva el carrito', (kind) => {
  const { db, storage, service } = checkoutFixture();
  const quote = service.reviewCheckout('address-1');
  if (kind === 'cart') createCartService(db).add('processors-001');
  else db.update((data) => {
    const product = data.Products.find((p) => p.id === 'graphics-001');
    if (kind === 'stock') product.stock = 1;
    if (kind === 'price') product.priceCents += 100;
    if (kind === 'address') data.Customers[0].addresses[0].line1 = 'Otra dirección';
  });
  const before = storage.getItem(CART_KEY);
  expect(() => service.confirmCheckout(quote)).toThrow();
  expect(db.getSnapshot().data.Orders).toHaveLength(0);
  expect(storage.getItem(CART_KEY)).toBe(before);
});

it('revalida datos de otra pestaña aunque no haya llegado el evento storage', () => {
  const { db, storage, service } = checkoutFixture();
  const quote = service.reviewCheckout('address-1');
  const latest = JSON.parse(storage.getItem(DATABASE_KEY));
  latest.Products.find((p) => p.id === 'graphics-001').stock = 0;
  storage.setItem(DATABASE_KEY, JSON.stringify(latest));
  expect(() => service.confirmCheckout(quote)).toThrow();
  expect(JSON.parse(storage.getItem(DATABASE_KEY)).Orders).toHaveLength(0);
  expect(db.getSnapshot().cart.lines).toHaveLength(1);
});

it('un fallo de DB no confirma ni modifica stock o carrito', () => {
  const { db, storage, service } = checkoutFixture();
  const quote = service.reviewCheckout('address-1');
  const before = storage.getItem(DATABASE_KEY), cart = storage.getItem(CART_KEY);
  vi.spyOn(storage, 'setItem').mockImplementation(() => { throw Error('QuotaExceededError'); });
  expect(() => service.confirmCheckout(quote)).toThrow();
  expect(storage.getItem(DATABASE_KEY)).toBe(before);
  expect(storage.getItem(CART_KEY)).toBe(cart);
  expect(db.getSnapshot().data.Orders).toHaveLength(0);
});

it('recupera limpieza fallida al recargar sin volver a descontar stock', () => {
  const { db, storage, sessionStorage, service } = checkoutFixture();
  const quote = service.reviewCheckout('address-1');
  const original = storage.setItem;
  const spy = vi.spyOn(storage, 'setItem').mockImplementation((key, value) => {
    if (key === CART_KEY) throw Error('QuotaExceededError');
    original(key, value);
  });
  const result = service.confirmCheckout(quote);
  expect(result.order.id).toBeTruthy();
  expect(result.cleanupPending).toBe(true);
  spy.mockRestore();
  const restored = createLocalDatabase({ getStorage: () => storage, getSessionStorage: () => sessionStorage }); restored.initialize();
  expect(restored.getSnapshot().cart.lines).toEqual([]);
  expect(restored.getSnapshot().data.Orders).toHaveLength(1);
  expect(createOrderService(restored).confirmCheckout(quote).order.id).toBe(result.order.id);
});

it('requiere Cliente, dirección propia, carrito no vacío y revisión válida', () => {
  const { db, service } = checkoutFixture();
  expect(() => service.reviewCheckout('ajena')).toThrow();
  expect(() => service.confirmCheckout({})).toThrow();
  db.update((data) => { data.Session = null; });
  expect(() => service.reviewCheckout('address-1')).toThrow();
  db.update((data) => { data.Session = { userId: 'admin', email: 'admin@cybermarket.com', role: 'admin', createdAt: new Date().toISOString() }; });
  expect(() => service.reviewCheckout('address-1')).toThrow();
});

it('no persiste campos financieros ni campos extra recibidos desde la UI', () => {
  const { service } = checkoutFixture();
  const quote = service.reviewCheckout('address-1');
  const { order } = service.confirmCheckout({ ...quote, cardNumber: 'NO-GUARDAR', cvv: 'NO-GUARDAR' });
  expect(JSON.stringify(order)).not.toContain('NO-GUARDAR');
  expect(order).not.toHaveProperty('cardNumber');
});

it('un carrito anterior sin token conserva sus artículos y puede completar checkout', () => {
  const { db, storage, service } = checkoutFixture();
  const previous = db.getSnapshot().data;
  storage.setItem(CART_KEY, JSON.stringify({ version: 1, lines: [{ productId: 'graphics-001', quantity: 2 }] }));
  db.retry();
  expect(db.getSnapshot().cart.checkoutToken).toBeTruthy();
  expect(db.getSnapshot().data).toEqual(previous);
  expect(service.confirmCheckout(service.reviewCheckout('address-1')).order.totalCents).toBe(59800);
});

it('carrito vacío o dirección retirada no crean pedidos', () => {
  const { db, service } = checkoutFixture();
  const quote = service.reviewCheckout('address-1');
  db.update((data) => { data.Customers[0].addresses = []; data.Customers[0].selectedAddressId = null; data.Customers[0].defaultAddressId = null; });
  expect(() => service.confirmCheckout(quote)).toThrow();
  expect(db.getSnapshot().cart.lines).toHaveLength(1);
  createCartService(db).remove('graphics-001');
  expect(() => service.reviewCheckout('address-1')).toThrow();
  expect(db.getSnapshot().data.Orders).toEqual([]);
});

it('rechaza checkout sin teléfono de envío válido y revalida su snapshot', () => {
  const { db, service } = checkoutFixture();
  const quote = service.reviewCheckout('address-1');
  db.update((data) => { data.Customers[0].phone = ''; });
  expect(() => service.reviewCheckout('address-1')).toThrow();
  expect(() => service.confirmCheckout(quote)).toThrow();
  db.update((data) => { data.Customers[0].phone = '+51 888123456'; });
  expect(() => service.confirmCheckout(quote)).toThrow(/teléfono de contacto ha cambiado/);
  expect(db.getSnapshot().data.Orders).toEqual([]);
  expect(db.getSnapshot().cart.lines).toHaveLength(1);
});
