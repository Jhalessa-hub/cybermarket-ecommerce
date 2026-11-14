import { expect, it, vi } from 'vitest';
import { setupDatabase, createMemoryStorage } from '../../helpers.js';
import { createAuthService } from '../../../src/services/authService.js';
import { createOrderService } from '../../../src/services/orderService.js';
import { createProductService } from '../../../src/services/productService.js';
import { createProfileService } from '../../../src/services/profileService.js';
import { createCartService } from '../../../src/services/cartService.js';
import { createMetricsService } from '../../../src/services/metricsService.js';
import { DATABASE_KEY, SESSION_KEY, SHARED_COLLECTION_KEYS } from '../../../src/services/storage/databaseSchema.js';
import { createLocalDatabase } from '../../../src/services/storage/localDatabase.js';

const input = { name: 'Cliente Paralelo', email: 'tabs@example.com', password: 'solo-demo-123' };

it('Cliente y Admin conservan identidad independiente y comparten compras/stock/estados en vivo', async () => {
  const customer = setupDatabase(); customer.db.initialize();
  await createAuthService(customer.db).register(input);
  const admin = setupDatabase({ storage: customer.storage, target: customer.target }); admin.db.initialize();
  expect(admin.db.getSnapshot().data.Session).toBeNull();
  const stopCustomer = customer.db.subscribe(() => {}), stopAdmin = admin.db.subscribe(() => {});
  await createAuthService(admin.db).login({ email: 'admin@cybermarket.com', password: 'admin123' });
  expect(customer.db.getSnapshot().data.Session.role).toBe('customer');
  expect(admin.db.getSnapshot().data.Session.role).toBe('admin');
  expect(JSON.parse(customer.storage.getItem(DATABASE_KEY)).Session).toBeNull();
  expect(customer.storage.getItem(SESSION_KEY)).toBeNull();
  expect(JSON.parse(admin.sessionStorage.getItem(SESSION_KEY)).role).toBe('admin');
  const address = createProfileService(customer.db).saveAddress({ recipient: input.name, line1: 'Calle Demo 1', city: 'Lima', region: 'Lima', postalCode: '15001', country: 'Perú' });
  createProfileService(customer.db).updateProfile({ name: input.name, phone: '+51 999123456' });
  createCartService(customer.db).add('graphics-001', 2);
  const service = createOrderService(customer.db);
  const { order } = service.confirmCheckout(service.reviewCheckout(address.id));
  expect(createMetricsService(admin.db).getMetrics()).toMatchObject({ salesCents: 59800, orderCount: 1, customers: 1 });
  expect(admin.db.getSnapshot().data.Products.find((p) => p.id === 'graphics-001').stock).toBe(10);
  createOrderService(admin.db).updateOrderStatus(order.id, { status: 'paid', expectedStatus: 'pending', expectedRevision: 0, confirmed: true });
  expect(service.getCustomerOrder(order.id).status).toBe('paid');
  createProductService(admin.db).updateProduct('graphics-001', { priceCents: 31000 });
  expect(customer.db.getSnapshot().data.Products.find((p) => p.id === 'graphics-001').priceCents).toBe(31000);
  expect(JSON.parse(customer.storage.getItem(SHARED_COLLECTION_KEYS.Orders))[0].status).toBe('paid');
  expect(JSON.parse(customer.storage.getItem(SHARED_COLLECTION_KEYS.Customers))).toHaveLength(1);
  expect(JSON.parse(customer.storage.getItem(SHARED_COLLECTION_KEYS.Products)).find((p) => p.id === 'graphics-001').priceCents).toBe(31000);
  createAuthService(admin.db).logout();
  expect(customer.db.getSnapshot().data.Session.role).toBe('customer');
  expect(() => createProductService(customer.db).updateProduct('graphics-001', { stock: 999 })).toThrow();
  stopAdmin(); stopCustomer();
});

it('recarga conserva la sesión de su pestaña; una pestaña nueva empieza anónima', async () => {
  const fixture = setupDatabase(); fixture.db.initialize(); await createAuthService(fixture.db).register(input);
  const restored = createLocalDatabase({ getStorage: () => fixture.storage, getSessionStorage: () => fixture.sessionStorage }); restored.initialize();
  expect(restored.getSnapshot().data.Session.email).toBe(input.email);
  const fresh = createLocalDatabase({ getStorage: () => fixture.storage, getSessionStorage: () => createMemoryStorage() }); fresh.initialize();
  expect(fresh.getSnapshot().data.Session).toBeNull();
});

it('la sesión compartida antigua se retira sin heredar Admin ni borrar Clientes/pedidos', async () => {
  const fixture = setupDatabase(); fixture.db.initialize(); await createAuthService(fixture.db).register(input);
  const raw = JSON.parse(fixture.storage.getItem(DATABASE_KEY));
  raw.Session = { userId: 'admin', role: 'admin', email: 'admin@cybermarket.com', createdAt: new Date().toISOString() };
  fixture.storage.setItem(DATABASE_KEY, JSON.stringify(raw));
  const newTab = setupDatabase({ storage: fixture.storage }); newTab.db.initialize();
  expect(newTab.db.getSnapshot().data.Session).toBeNull();
  expect(newTab.db.getSnapshot().data.Customers).toHaveLength(1);
  expect(JSON.parse(fixture.storage.getItem(DATABASE_KEY)).Session).toBeNull();
});

it('fallo de sessionStorage no anuncia login ni cambia la sesión de otra pestaña', async () => {
  const customer = setupDatabase(); customer.db.initialize(); await createAuthService(customer.db).register(input);
  const admin = setupDatabase({ storage: customer.storage }); admin.db.initialize();
  vi.spyOn(admin.sessionStorage, 'setItem').mockImplementation(() => { throw Error('SecurityError'); });
  await expect(createAuthService(admin.db).login({ email: 'admin@cybermarket.com', password: 'admin123' })).rejects.toMatchObject({ code: 'STORAGE' });
  expect(customer.db.getSnapshot().data.Session.role).toBe('customer');
  expect(admin.db.getSnapshot().data.Session).toBeNull();
});

it.each(Object.values(SHARED_COLLECTION_KEYS))('eventos storage de %s refrescan datos sin reemplazar la sesión propia', async (key) => {
  const tab = setupDatabase(); tab.db.initialize(); await createAuthService(tab.db).register(input);
  const own = tab.db.getSnapshot().data.Session;
  const stop = tab.db.subscribe(() => {});
  const external = JSON.parse(tab.storage.getItem(DATABASE_KEY)); external.Products[0].stock = 2; external.revision += 1;
  tab.storage.setItem(DATABASE_KEY, JSON.stringify(external)); tab.sendStorage(key);
  expect(tab.db.getSnapshot().data.Products[0].stock).toBe(2);
  expect(tab.db.getSnapshot().data.Session).toEqual(own);
  stop();
});

it('fallar al guardar el registro revierte la sesión de pestaña, sin crear un login fantasma', async () => {
  const tab = setupDatabase(); tab.db.initialize();
  vi.spyOn(tab.storage, 'setItem').mockImplementation(() => { throw Error('QuotaExceededError'); });
  await expect(createAuthService(tab.db).register(input)).rejects.toMatchObject({ code: 'STORAGE' });
  expect(tab.sessionStorage.getItem(SESSION_KEY)).toBeNull();
  expect(tab.db.getSnapshot().data.Customers).toHaveLength(0);
});

it('logout no modifica el documento compartido ni la sesión de otra cuenta', async () => {
  const one = setupDatabase(); one.db.initialize(); await createAuthService(one.db).register(input);
  const two = setupDatabase({ storage: one.storage }); two.db.initialize();
  await createAuthService(two.db).login({ email: 'admin@cybermarket.com', password: 'admin123' });
  const before = one.storage.getItem(DATABASE_KEY);
  createAuthService(one.db).logout();
  expect(one.storage.getItem(DATABASE_KEY)).toBe(before);
  expect(two.db.getSnapshot().data.Session.role).toBe('admin');
});

it('colecciones existentes se conservan si aún no tienen documento canónico', async () => {
  const one = setupDatabase(); one.db.initialize(); await createAuthService(one.db).register(input);
  one.storage.removeItem(DATABASE_KEY);
  const restored = setupDatabase({ storage: one.storage }); restored.db.initialize();
  expect(restored.db.getSnapshot().status).toBe('ready');
  expect(restored.db.getSnapshot().data.Customers[0].email).toBe(input.email);
  expect(restored.db.getSnapshot().data.Session).toBeNull();
});

it('colecciones corruptas sin documento canónico no se reemplazan con semillas', () => {
  const one = setupDatabase(); one.storage.setItem(SHARED_COLLECTION_KEYS.Customers, 'broken');
  one.db.initialize();
  expect(one.db.getSnapshot().status).toBe('error');
  expect(one.storage.getItem(DATABASE_KEY)).toBeNull();
  expect(one.storage.getItem(SHARED_COLLECTION_KEYS.Customers)).toBe('broken');
});
