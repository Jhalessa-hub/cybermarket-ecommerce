import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '../../../src/app/providers.jsx';
import App from '../../../src/app/App.jsx';
import { adminFixture } from './fixtures.js';
import { createOrderService } from '../../../src/services/orderService.js';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
});
afterEach(cleanup);
function mount(db, path = '/admin') { return render(<MemoryRouter initialEntries={[path]}><AppProviders database={db}><App /></AppProviders></MemoryRouter>); }
function fill(label, value) { fireEvent.change(screen.getByLabelText(label), { target: { value } }); }

it('dashboard presenta métricas reales, contexto y alertas; sin registros no inventa actividad', () => {
  const { db } = adminFixture(); mount(db);
  expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
  expect(screen.getByRole('region', { name: 'Importe de pedidos' }).textContent).toMatch(/USD\s1,794\.00/);
  expect(screen.getByText(/Periodo: todo el historial\./)).toBeTruthy();
  act(() => db.update((data) => { data.Orders = []; data.Customers = []; }));
  expect(screen.getByText('Aún no hay pedidos registrados.')).toBeTruthy();
  expect(screen.getByText('Todavía no hay clientes registrados.')).toBeTruthy();
});

it('alta en drawer valida campos, guarda atributos y se refleja en la tienda', () => {
  const { db } = adminFixture(); mount(db, '/admin/products');
  fill('Buscar productos', 'GPU Demo Nueva');
  fireEvent.click(screen.getByRole('button', { name: 'Nuevo producto' }));
  fill('Nombre del producto', 'GPU Demo Nueva'); fill('Descripción', 'Descripción de prueba');
  fill('Categoría', 'graphics'); fill('Precio (USD)', '-1'); fill('Stock (unidades)', '1.5');
  fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));
  expect(screen.getByLabelText('Precio (USD)').getAttribute('aria-invalid')).toBe('true');
  expect(screen.getByLabelText('Stock (unidades)').getAttribute('aria-invalid')).toBe('true');
  fill('Precio (USD)', '129.99'); fill('Stock (unidades)', '4'); fill('VRAM (GB)', '8');
  fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  const product = db.getSnapshot().data.Products.find((p) => p.name === 'GPU Demo Nueva');
  expect(product).toMatchObject({ priceCents: 12999, stock: 4, specs: { vramGB: 8 } });
  act(() => db.update((data) => { data.Session = { role: 'customer', userId: 'customer-1', email: 'demo@example.com', createdAt: new Date().toISOString() }; }));
  fill('Buscar productos', 'GPU Demo Nueva');
  expect(screen.getByRole('article').textContent).toContain('GPU Demo Nueva');
  expect(screen.queryByRole('navigation', { name: 'Navegación administrativa' })).toBeNull();
});

it('editar/desactivar conserva historial e imágenes y permite consultar inactivos', () => {
  const { db } = adminFixture(); mount(db, '/admin/products');
  fill('Buscar productos', 'NVIDIA GeForce RTX 4060');
  fireEvent.click(screen.getByRole('button', { name: 'Editar NVIDIA GeForce RTX 4060', exact: true }));
  fill('Precio (USD)', '310.50'); fill('Stock (unidades)', '5');
  fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));
  expect(db.getSnapshot().data.Products.find((p) => p.id === 'graphics-001')).toMatchObject({ priceCents: 31050, image: null });
  fireEvent.click(screen.getByRole('button', { name: 'Desactivar NVIDIA GeForce RTX 4060', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Conservar producto' }));
  expect(db.getSnapshot().data.Products.find((p) => p.id === 'graphics-001').active).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Desactivar NVIDIA GeForce RTX 4060', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Desactivar producto', exact: true }));
  expect(db.getSnapshot().data.Products.find((p) => p.id === 'graphics-001').active).toBe(false);
  expect(db.getSnapshot().data.Orders[0].lines[0].priceCents).toBe(29900);
  fill('Visibilidad', 'inactive');
  expect(screen.getByRole('region', { name: 'Tabla de productos' }).textContent).toContain('NVIDIA GeForce RTX 4060');
});

it('filtros de inventario distinguen 4/5/0 y las tablas permiten foco de teclado', () => {
  const { db } = adminFixture(); mount(db, '/admin/products');
  fill('Inventario', 'low');
  const table = screen.getByRole('region', { name: 'Tabla de productos' }); table.focus(); expect(document.activeElement).toBe(table);
  expect(within(table).queryByText('Disponible · 5')).toBeNull();
  expect(within(table).getAllByText('Stock bajo · 4').length).toBeGreaterThan(0);
  expect(within(table).getAllByText('Agotado · 0').length).toBeGreaterThan(0);
});

it('logística filtra, confirma un cambio y actualiza el tracking Cliente', () => {
  const { db, orderId } = adminFixture(); mount(db, '/admin/logistics');
  fill('Buscar pedidos', orderId);
  fireEvent.click(screen.getByRole('button', { name: `Gestionar pedido ${orderId}` }));
  expect(within(screen.getByRole('combobox', { name: 'Nuevo estado' })).queryByRole('option', { name: 'Enviado', exact: true })).toBeNull();
  fill('Nuevo estado', 'paid');
  fireEvent.click(screen.getByRole('button', { name: 'Actualizar estado', exact: true }));
  expect(db.getSnapshot().data.Orders.find((o) => o.id === orderId).status).toBe('pending');
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar cambio' }));
  expect(db.getSnapshot().data.Orders.find((o) => o.id === orderId).status).toBe('paid');
  expect(screen.getAllByRole('status').some((item) => item.textContent.includes('Estado actual: Pagado'))).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar ventana' }));
  act(() => db.update((data) => { data.Session = { role: 'customer', userId: 'customer-1', email: 'demo@example.com', createdAt: new Date().toISOString() }; }));
  fireEvent.click(screen.getAllByRole('link', { name: 'Mis compras', exact: true })[0]);
  fireEvent.click(screen.getByRole('link', { name: `Ver seguimiento del pedido ${orderId}` }));
  expect(document.querySelector('[aria-current="step"] h3').textContent).toBe('Pagado');
});

it('Incidencia exige motivo y el selector solo permite retomar o cancelar', () => {
  const { db, orderId } = adminFixture(); mount(db, '/admin/logistics');
  fireEvent.click(screen.getByRole('button', { name: `Gestionar pedido ${orderId}` }));
  fill('Nuevo estado', 'incident'); fireEvent.click(screen.getByRole('button', { name: 'Actualizar estado', exact: true }));
  expect(screen.getByRole('alert').textContent).toContain('motivo');
  fill('Motivo (obligatorio)', 'Revisar destino'); fireEvent.click(screen.getByRole('button', { name: 'Actualizar estado', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar cambio' }));
  expect(screen.getByRole('option', { name: 'Retomar en Pendiente' })).toBeTruthy();
  expect(within(screen.getByRole('combobox', { name: 'Nuevo estado' })).queryByRole('option', { name: 'Enviado', exact: true })).toBeNull();
});

it('Clientes permite buscar, solo consulta columnas seguras y no contiene secretos', () => {
  const { db } = adminFixture(); mount(db, '/admin/customers');
  fill('Buscar clientes', 'private@example.com');
  const table = screen.getByRole('region', { name: 'Tabla de clientes' });
  expect(within(table).getByText('private@example.com')).toBeTruthy();
  expect(within(table).queryByText('demo@example.com')).toBeNull();
  expect(table.textContent).not.toContain('PBKDF2');
  expect(within(table).queryByRole('button')).toBeNull();
});

it('un fallo de guardado no emite toast de éxito ni modifica el producto', () => {
  const { db, storage } = adminFixture(); mount(db, '/admin/products');
  fill('Buscar productos', 'NVIDIA GeForce RTX 4060');
  fireEvent.click(screen.getByRole('button', { name: 'Editar NVIDIA GeForce RTX 4060', exact: true }));
  fill('Stock (unidades)', '20');
  const spy = vi.spyOn(storage, 'setItem').mockImplementation(() => { throw Error('QuotaExceededError'); });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));
  expect(screen.queryByText('Producto guardado correctamente.')).toBeNull();
  expect(db.getSnapshot().data.Products.find((p) => p.id === 'graphics-001').stock).toBe(10);
  spy.mockRestore();
});

it('pedidos terminales no presentan selector y las transiciones no se duplican', () => {
  const { db, orderId } = adminFixture(); const service = createOrderService(db);
  for (const status of ['paid', 'shipped', 'delivered']) {
    const current = service.listAdminOrders().find((o) => o.id === orderId);
    service.updateOrderStatus(orderId, { status, expectedStatus: current.status, expectedRevision: current.statusRevision ?? 0, confirmed: true });
  }
  mount(db, '/admin/logistics'); fireEvent.click(screen.getByRole('button', { name: `Gestionar pedido ${orderId}` }));
  expect(screen.queryByRole('combobox', { name: 'Nuevo estado' })).toBeNull();
  expect(screen.getByText('Este pedido ha finalizado y no admite más cambios de estado.')).toBeTruthy();
});

it('cerrar el formulario con cancelación nativa devuelve el foco y no escribe cambios', () => {
  const { db } = adminFixture(); mount(db, '/admin/products');
  const trigger = screen.getByRole('button', { name: 'Nuevo producto' }); trigger.focus(); fireEvent.click(trigger);
  fill('Nombre del producto', 'No guardar');
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: true, cancelable: true }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(db.getSnapshot().data.Products.some((p) => p.name === 'No guardar')).toBe(false);
});

it.each(['/admin/products', '/admin/logistics', '/admin/customers'])('sección vacía %s muestra estado accionable sin inventar registros', (path) => {
  const { db } = adminFixture(); db.update((data) => { data.Orders = []; data.Customers = []; data.Products = []; });
  mount(db, path);
  expect(screen.getByRole('navigation', { name: 'Navegación administrativa' })).toBeTruthy();
  expect(screen.getByRole('main').textContent).toMatch(/No hay/);
  expect(screen.queryByRole('table')).toBeNull();
});
