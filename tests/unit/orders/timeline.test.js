import { expect, it } from 'vitest';
import { buildOrderTimeline } from '../../../src/utils/orderStatus.js';
import { formatOrderDate } from '../../../src/utils/dates.js';

const createdAt = '2026-11-01T10:00:00.000Z';

it('eventos parciales no desordenan etapas previas ni inventan fechas', () => {
  const result = buildOrderTimeline({ status: 'shipped', createdAt, events: [{ status: 'pending', createdAt }, { status: 'shipped', createdAt: '2026-11-03T10:00:00Z' }] });
  expect([result.current, ...result.history].map((event) => event.status)).toEqual(['shipped', 'paid', 'pending']);
  expect(result.history[0].createdAt).toBeNull();
  expect(result.future).toEqual(['delivered']);
});

it('pedidos anteriores sin eventos conservan sus cuatro etapas y fechas desconocidas', () => {
  const result = buildOrderTimeline({ status: 'delivered', createdAt });
  expect([result.current, ...result.history].map((event) => event.status)).toEqual(['delivered', 'shipped', 'paid', 'pending']);
  expect(result.current.createdAt).toBeNull();
  expect(result.history.at(-1).createdAt).toBe(createdAt);
});

it('una incidencia resuelta conserva el historial y el último estado vigente arriba', () => {
  const result = buildOrderTimeline({ status: 'shipped', createdAt, events: [
    { status: 'pending', createdAt },
    { status: 'paid', createdAt: '2026-11-02T10:00:00Z' },
    { status: 'incident', createdAt: '2026-11-03T10:00:00Z', description: 'Incidencia anterior' },
    { status: 'shipped', createdAt: '2026-11-04T10:00:00Z' },
  ] });
  expect(result.history.map((event) => event.status)).toEqual(['incident', 'paid', 'pending']);
  expect(result.current.status).toBe('shipped');
});

it('fechas ausentes o inválidas no rompen el seguimiento y los eventos desconocidos se omiten', () => {
  const result = buildOrderTimeline({ status: 'paid', createdAt, events: [null, { status: 'unknown' }, { status: 'paid', createdAt: 'invalid' }] });
  expect(result.current.status).toBe('paid');
  expect(formatOrderDate(result.current.createdAt)).toBe('Fecha no registrada');
  expect(result.history.map((event) => event.status)).toEqual(['pending']);
});

it('ordenar los eventos no modifica el pedido persistido', () => {
  const events = Object.freeze([Object.freeze({ status: 'paid', createdAt: '2026-11-02T10:00:00Z' }), Object.freeze({ status: 'pending', createdAt })]);
  const order = Object.freeze({ status: 'paid', createdAt, events });
  const result = buildOrderTimeline(order);
  expect(result.current.status).toBe('paid');
  expect(order.events[0].status).toBe('paid');
});
