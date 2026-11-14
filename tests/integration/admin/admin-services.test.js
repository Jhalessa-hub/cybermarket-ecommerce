import { expect, it, vi } from 'vitest';
import { adminFixture } from './fixtures.js';
import { createProductService } from '../../../src/services/productService.js';
import { createOrderService } from '../../../src/services/orderService.js';
import { createCustomerService } from '../../../src/services/customerService.js';
import { createMetricsService } from '../../../src/services/metricsService.js';
import { allowedOrderTransitions } from '../../../src/utils/orderStatus.js';
import { DATABASE_KEY } from '../../../src/services/storage/databaseSchema.js';

function change(service, order, status, description = '') {
  return service.updateOrderStatus(order.id, { status, description, expectedStatus: order.status, expectedRevision: order.statusRevision ?? 0, confirmed: true });
}

it('CRUD conserva snapshots y detecta edición obsoleta después de cambiar stock', () => {
  const { db } = adminFixture(); const service = createProductService(db);
  const input = { name: 'GPU Demo', brand: 'Demo', categoryId: 'graphics', description: 'Modelo de prueba', priceCents: 12345, stock: 5, specs: { vramGB: 8 } };
  const created = service.createProduct(input);
  service.updateProduct(created.id, { stock: 4, priceCents: 15000 });
  expect(service.listAdminProducts().find((p) => p.id === created.id).stock).toBe(4);
  expect(() => service.updateProduct(created.id, { stock: 10 }, { expectedProduct: created })).toThrow(/cambiado/);
  const savedOrder = structuredClone(db.getSnapshot().data.Orders[0]);
  service.deactivateProduct(savedOrder.lines[0].productId);
  expect(service.listProducts().some((p) => p.id === savedOrder.lines[0].productId)).toBe(false);
  expect(db.getSnapshot().data.Orders[0]).toEqual(savedOrder);
});

it.each([{ priceCents: -1 }, { stock: 1.5 }, { categoryId: 'missing' }, { name: '' }])('producto inválido no se guarda: %j', (patch) => {
  const { db, storage } = adminFixture(); const before = storage.getItem(DATABASE_KEY);
  expect(() => createProductService(db).updateProduct('graphics-001', patch)).toThrow();
  expect(storage.getItem(DATABASE_KEY)).toBe(before);
});

it('ciclo normal valida estados, registra fechas/eventos y no permite retroceder Entregado', () => {
  const { db, orderId } = adminFixture(); const service = createOrderService(db);
  let order = service.listAdminOrders().find((o) => o.id === orderId);
  for (const status of ['paid', 'shipped', 'delivered']) {
    order = change(service, order, status);
    expect(order.status).toBe(status);
    expect(order.events.at(-1)).toMatchObject({ status, actor: 'admin', createdAt: order.updatedAt });
  }
  expect(allowedOrderTransitions(order)).toEqual([]);
  expect(() => change(service, order, 'pending')).toThrow();
  expect(db.getSnapshot().data.Orders.find((o) => o.id === orderId).events).toHaveLength(4);
});

it('bloquea saltos, falta de confirmación y cambios logísticos obsoletos', () => {
  const { db } = adminFixture(); const service = createOrderService(db);
  const order = service.listAdminOrders()[0];
  expect(() => change(service, order, 'shipped')).toThrow();
  expect(() => service.updateOrderStatus(order.id, { status: 'paid' })).toThrow();
  change(service, order, 'paid');
  expect(() => change(service, order, 'paid')).toThrow(/cambiado/);
});

it('Incidencia exige motivo y retoma el último estado normal, sin saltarse etapas', () => {
  const { db } = adminFixture(); const service = createOrderService(db);
  let order = service.listAdminOrders()[0];
  order = change(service, order, 'paid');
  expect(() => change(service, order, 'incident')).toThrow();
  order = change(service, order, 'incident', 'Revisar dirección');
  expect(allowedOrderTransitions(order)).toEqual(['paid', 'cancelled']);
  expect(() => change(service, order, 'delivered')).toThrow();
  order = change(service, order, 'paid', 'Dirección revisada');
  expect(order.events.at(-2).description).toBe('Revisar dirección');
  expect(allowedOrderTransitions(order)).toEqual(['shipped', 'cancelled', 'incident']);
});

it('Cancelado exige motivo y es terminal sin reembolsos ni reposición de inventario', () => {
  const { db } = adminFixture(); const service = createOrderService(db);
  const order = service.listAdminOrders()[0]; const stock = db.getSnapshot().data.Products;
  expect(() => change(service, order, 'cancelled')).toThrow();
  const cancelled = change(service, order, 'cancelled', 'Solicitud del cliente');
  expect(allowedOrderTransitions(cancelled)).toEqual([]);
  expect(db.getSnapshot().data.Products).toEqual(stock);
});

it('métricas cuentan activos con stock 0–4, estados y ventas vigentes sin cifras ficticias', () => {
  const { db } = adminFixture();
  db.update((data) => { data.Products.forEach((p) => { p.active = false; });
    [0, 4, 5].forEach((stock, i) => { data.Products[i].active = true; data.Products[i].stock = stock; });
    data.Orders[0].status = 'cancelled';
  });
  const metrics = createMetricsService(db).getMetrics();
  expect(metrics.activeProducts).toBe(3); expect(metrics.lowStockProducts).toHaveLength(2);
  expect(metrics.soldOutProducts).toBe(1); expect(metrics.customers).toBe(2);
  expect(metrics.ordersByStatus.cancelled).toBe(1);
  expect(metrics.salesCents).toBe(59800 * 2);
  db.update((data) => { data.Orders = []; data.Customers = []; data.Products = []; });
  expect(createMetricsService(db).getMetrics()).toMatchObject({ activeProducts: 0, customers: 0, salesCents: 0, orderCount: 0, lowStockProducts: [] });
});

it('consulta Clientes usa columnas permitidas, nunca credenciales ni datos extra', () => {
  const { db } = adminFixture(); db.update((data) => { data.Customers[0].secret = 'NO-EXPOSE'; });
  const customers = createCustomerService(db).listCustomers();
  expect(customers[0]).toMatchObject({ name: 'Cliente Demo', email: 'demo@example.com', orderCount: 2 });
  expect(customers[0]).not.toHaveProperty('credential'); expect(customers[0]).not.toHaveProperty('addresses');
  expect(JSON.stringify(customers)).not.toContain('NO-EXPOSE');
});

it.each(['anonymous', 'customer'])('lecturas y mutaciones Admin se deniegan a %s', (role) => {
  const { db, storage } = adminFixture(); db.update((data) => { data.Session = role === 'anonymous' ? null : { role: 'customer', userId: 'customer-1', email: 'demo@example.com', createdAt: new Date().toISOString() }; });
  const products = createProductService(db), orders = createOrderService(db);
  const before = storage.getItem(DATABASE_KEY);
  for (const action of [() => products.listAdminProducts(), () => products.createProduct({}), () => products.updateProduct('graphics-001', { stock: 2 }), () => products.deactivateProduct('graphics-001'), () => orders.listAdminOrders(), () => orders.updateOrderStatus('order-newer', {}), () => createCustomerService(db).listCustomers(), () => createMetricsService(db).getMetrics()]) expect(action).toThrow();
  expect(storage.getItem(DATABASE_KEY)).toBe(before);
});

it('fallo de storage no anuncia cambio logístico ni altera sus eventos', () => {
  const { db, storage } = adminFixture(); const service = createOrderService(db);
  const order = service.listAdminOrders()[0]; const before = storage.getItem(DATABASE_KEY);
  vi.spyOn(storage, 'setItem').mockImplementation(() => { throw Error('QuotaExceededError'); });
  expect(() => change(service, order, 'paid')).toThrow();
  expect(storage.getItem(DATABASE_KEY)).toBe(before);
  expect(db.getSnapshot().data.Orders.find((o) => o.id === order.id).status).toBe('pending');
});

it('servicios ya creados pierden permisos al cerrar sesión', () => {
  const { db, storage } = adminFixture();
  const products = createProductService(db), orders = createOrderService(db), customers = createCustomerService(db), metrics = createMetricsService(db);
  db.update((data) => { data.Session = null; }); const before = storage.getItem(DATABASE_KEY);
  expect(() => products.updateProduct('graphics-001', { stock: 1 })).toThrow();
  expect(() => orders.updateOrderStatus('order-newer', {})).toThrow();
  expect(() => customers.listCustomers()).toThrow(); expect(() => metrics.getMetrics()).toThrow();
  expect(storage.getItem(DATABASE_KEY)).toBe(before);
});

it('revalida stock modificado en otra pestaña antes de guardar una edición antigua', () => {
  const { db, storage } = adminFixture(); const service = createProductService(db);
  const original = service.listAdminProducts().find((p) => p.id === 'graphics-001');
  const external = JSON.parse(storage.getItem(DATABASE_KEY)); external.Products.find((p) => p.id === original.id).stock = 1;
  storage.setItem(DATABASE_KEY, JSON.stringify(external));
  expect(() => service.updateProduct(original.id, { priceCents: 30000, stock: original.stock }, { expectedProduct: original })).toThrow(/cambiado/);
  expect(JSON.parse(storage.getItem(DATABASE_KEY)).Products.find((p) => p.id === original.id).stock).toBe(1);
});

it('métricas fuera del rango monetario seguro no muestran un total impreciso', () => {
  const { db } = adminFixture();
  db.update((data) => { data.Orders.forEach((order) => { order.lines = [{ ...order.lines[0], quantity: 2, priceCents: 4000000000000000 }]; order.totalCents = 8000000000000000; }); });
  expect(() => createMetricsService(db).getMetrics()).toThrow(/límite/);
});
