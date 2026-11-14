import { afterEach, beforeAll, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '../../../src/app/providers.jsx';
import App from '../../../src/app/App.jsx';
import OrderTimeline from '../../../src/components/orders/OrderTimeline.jsx';
import { DATABASE_KEY } from '../../../src/services/storage/databaseSchema.js';
import { ordersFixture } from './fixtures.js';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
});
afterEach(cleanup);
function mount(db, path = '/my-orders') {
  return render(<MemoryRouter initialEntries={[path]}><AppProviders database={db}><App /></AppProviders></MemoryRouter>);
}

it('historial minimalista lista compras propias en orden y enlaza al seguimiento', () => {
  const { db, orderId } = ordersFixture(); mount(db);
  const list = screen.getByRole('list', { name: 'Mis pedidos' });
  const cards = within(list).getAllByRole('article');
  expect(cards).toHaveLength(2);
  expect(cards[0].textContent).toContain('order-newer');
  expect(cards[1].textContent).toContain(orderId);
  expect(screen.queryByText('private-order')).toBeNull();
  const link = within(cards[1]).getByRole('link', { name: /Ver seguimiento/ });
  link.focus(); expect(document.activeElement).toBe(link); fireEvent.click(link);
  expect(screen.getByRole('heading', { name: 'Seguimiento de tu pedido' })).toBeTruthy();
});

it('sin compras ofrece catálogo, no cifras o pedidos inventados', () => {
  const { db } = ordersFixture(); db.update((data) => { data.Orders = []; }); mount(db);
  expect(screen.getByRole('heading', { name: 'Aún no tienes compras' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Explorar la tienda' })).toBeTruthy();
  expect(screen.queryByRole('list', { name: 'Mis pedidos' })).toBeNull();
});

it.each(['private-order', 'unknown'])('detalle %s no revela la propiedad ni datos privados', (id) => {
  const { db } = ordersFixture(); mount(db, `/my-orders/${id}`);
  expect(screen.getByRole('heading', { name: 'No encontramos esta página' })).toBeTruthy();
  expect(screen.queryByText('Dirección privada')).toBeNull();
  expect(screen.queryByText('Artículo privado')).toBeNull();
});

it('detalle usa snapshots aunque cambien precio, nombre o dirección del perfil', () => {
  const { db, orderId } = ordersFixture();
  db.update((data) => { data.Products.find((p) => p.id === 'graphics-001').priceCents = 99900; data.Products.find((p) => p.id === 'graphics-001').name = 'Modelo editado'; data.Customers[0].addresses[0].line1 = 'Dirección editada'; });
  mount(db, `/my-orders/${orderId}`);
  expect(screen.getByText('NVIDIA GeForce RTX 4060')).toBeTruthy();
  expect(screen.getByText('Calle Demo 123')).toBeTruthy();
  expect(within(screen.getByRole('region', { name: 'Datos de envío del pedido' })).queryByText('Dirección editada')).toBeNull();
  expect(screen.getByRole('definition').textContent).toMatch(/USD\s598\.00/);
});

it.each(['pending', 'paid', 'shipped', 'delivered'])('timeline %s: estado actual arriba, anteriores grises y futuros separados', (status) => {
  const stages = ['pending', 'paid', 'shipped', 'delivered'];
  const labels = ['Pendiente', 'Pagado', 'Enviado', 'Entregado'];
  const { db, orderId } = ordersFixture();
  const order = { ...db.getSnapshot().data.Orders.find((o) => o.id === orderId), status, events: undefined };
  render(<OrderTimeline order={order} />);
  const timeline = screen.getByRole('list', { name: 'Avances del pedido, más reciente primero' });
  timeline.focus(); expect(document.activeElement).toBe(timeline);
  const events = within(timeline).getAllByRole('listitem');
  expect(events[0].textContent).toContain(labels[stages.indexOf(status)]);
  expect(events[0].getAttribute('aria-current')).toBe('step');
  expect(events[0].className).toContain('text-emerald');
  expect(events).toHaveLength(stages.indexOf(status) + 1);
  for (const event of events.slice(1)) { expect(event.textContent).toContain('Completado'); expect(event.className).toContain('text-ink-muted'); }
  const future = screen.queryByRole('list', { name: 'Etapas por completar' });
  if (status === 'delivered') { expect(future).toBeNull(); expect(screen.getByText('Proceso completado')).toBeTruthy(); }
  else { expect(within(future).getAllByRole('listitem')).toHaveLength(3 - stages.indexOf(status)); }
});

it.each(['cancelled', 'incident'])('estado alternativo %s no inventa entrega ni completa el proceso', (status) => {
  const { db } = ordersFixture();
  render(<OrderTimeline order={{ ...db.getSnapshot().data.Orders[0], status, events: [{ status: 'pending', createdAt: '2026-11-01T10:00:00Z' }, { status, createdAt: '2026-11-02T10:00:00Z', description: 'Motivo de prueba' }] }} />);
  expect(screen.getByText('Motivo de prueba')).toBeTruthy();
  expect(screen.queryByText('Proceso completado')).toBeNull();
  expect(screen.queryByRole('list', { name: 'Etapas por completar' })).toBeNull();
  expect(screen.getByText(status === 'cancelled' ? 'Pedido cancelado' : 'Seguimiento en pausa')).toBeTruthy();
});

it('historial de eventos conserva fechas reales, orden descendente y no inventa fechas faltantes', () => {
  const { db } = ordersFixture();
  render(<OrderTimeline order={{ ...db.getSnapshot().data.Orders[0], status: 'shipped', events: [{ status: 'shipped', createdAt: '2026-11-03T10:00:00Z' }, { status: 'pending', createdAt: '2026-11-01T10:00:00Z' }, { status: 'paid', createdAt: '2026-11-02T10:00:00Z' }] }} />);
  const timeline = screen.getByRole('list', { name: 'Avances del pedido, más reciente primero' });
  expect(within(timeline).getAllByRole('listitem').map((li) => li.querySelector('h3').textContent)).toEqual(['Enviado', 'Pagado', 'Pendiente']);
  expect(timeline.querySelectorAll('time')).toHaveLength(3);
});

it('repositorio actualiza un detalle abierto sin recargar y anuncia el nuevo estado', () => {
  const { db, orderId } = ordersFixture(); mount(db, `/my-orders/${orderId}`);
  act(() => db.update((data) => { const order = data.Orders.find((o) => o.id === orderId); order.status = 'paid'; order.events.push({ status: 'paid', createdAt: '2026-11-03T10:00:00Z' }); }));
  expect(screen.getByRole('status').textContent).toContain('Estado actual: Pagado');
  expect(document.querySelector('[aria-current="step"] h3').textContent).toBe('Pagado');
});

it('cambio por evento storage actualiza lista y detalle con el mismo pedido', () => {
  const { db, storage, sendStorage, orderId } = ordersFixture(); mount(db);
  const data = JSON.parse(storage.getItem(DATABASE_KEY));
  const order = data.Orders.find((o) => o.id === orderId); order.status = 'shipped';
  order.events.push({ status: 'shipped', createdAt: '2026-11-03T10:00:00Z' });
  act(() => { storage.setItem(DATABASE_KEY, JSON.stringify(data)); sendStorage(DATABASE_KEY); });
  const card = screen.getAllByRole('article').find((article) => article.textContent.includes(orderId));
  expect(card.textContent).toContain('Enviado');
  fireEvent.click(within(card).getByRole('link', { name: /Ver seguimiento/ }));
  expect(document.querySelector('[aria-current="step"] h3').textContent).toBe('Enviado');
});

it('un error de storage no se presenta como historial vacío y permite recuperar', () => {
  const { db, storage, sendStorage } = ordersFixture(); mount(db);
  const original = storage.getItem(DATABASE_KEY);
  act(() => { storage.setItem(DATABASE_KEY, 'broken'); sendStorage(DATABASE_KEY); });
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.queryByRole('heading', { name: 'Aún no tienes compras' })).toBeNull();
  storage.setItem(DATABASE_KEY, original);
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar sin borrar datos' }));
  expect(screen.getByRole('list', { name: 'Mis pedidos' })).toBeTruthy();
});

it('visitante que abre seguimiento va a login sin datos de pedidos', () => {
  const { db, orderId } = ordersFixture(); db.update((data) => { data.Session = null; });
  mount(db, `/my-orders/${orderId}`);
  expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeTruthy();
  expect(screen.queryByText(orderId)).toBeNull();
});

it('un cambio de cuenta mientras está abierto el detalle retira inmediatamente el pedido anterior', () => {
  const { db, orderId } = ordersFixture(); mount(db, `/my-orders/${orderId}`);
  act(() => db.update((data) => { data.Session = { ...data.Session, userId: 'customer-2', email: 'private@example.com' }; }));
  expect(screen.getByRole('heading', { name: 'No encontramos esta página' })).toBeTruthy();
  expect(screen.queryByRole('heading', { name: 'Seguimiento de tu pedido' })).toBeNull();
  expect(within(screen.getByRole('main')).queryByText('Calle Demo 123')).toBeNull();
});
