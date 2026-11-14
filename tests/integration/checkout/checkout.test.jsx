import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '../../../src/app/providers.jsx';
import App from '../../../src/app/App.jsx';
import { createProfileService } from '../../../src/services/profileService.js';
import { DATABASE_KEY } from '../../../src/services/storage/databaseSchema.js';
import { checkoutFixture } from './fixtures.js';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
});
afterEach(cleanup);
function mount(db, path = '/checkout') {
  return render(<MemoryRouter initialEntries={[path]}><AppProviders database={db}><App /></AppProviders></MemoryRouter>);
}
function accept() {
  fireEvent.click(screen.getByRole('button', { name: 'Continuar al pago' }));
  fireEvent.click(screen.getByRole('checkbox', { name: /He revisado los artículos/ }));
}

it('requiere confirmar dirección y revisar resumen antes de pagar; no solicita datos financieros', () => {
  const { db } = checkoutFixture(); mount(db);
  expect(screen.getByRole('heading', { name: 'Finaliza tu compra' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: /Confirmar y pagar/ })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Continuar al pago' }));
  const pay = screen.getByRole('button', { name: /Confirmar y pagar/ });
  expect(pay.disabled).toBe(true);
  expect(screen.getByText(/Pago simulado, sin cobros reales/)).toBeTruthy();
  expect(document.querySelector('[autocomplete^="cc-"]')).toBeNull();
  expect(document.querySelector('input[name*="card"],input[name="cvv"],input[name="pin"]')).toBeNull();
  fireEvent.click(screen.getByRole('checkbox', { name: /He revisado los artículos/ }));
  fireEvent.click(pay);
  expect(screen.getByRole('heading', { name: '¡Tu pedido está confirmado!' })).toBeTruthy();
  const order = db.getSnapshot().data.Orders[0];
  expect(screen.getByText(order.id)).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Ir a Mis Compras' }).getAttribute('href')).toBe('/my-orders');
  expect(db.getSnapshot().cart.lines).toEqual([]);
});

it('sin dirección abre el formulario y bloquea pago hasta guardarla y confirmarla', () => {
  const { db } = checkoutFixture();
  db.update((data) => { data.Customers[0].addresses = []; data.Customers[0].selectedAddressId = null; data.Customers[0].defaultAddressId = null; });
  mount(db);
  expect(screen.getByRole('heading', { name: 'Nueva dirección' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Continuar al pago' }).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Guardar dirección' }));
  expect(screen.getByLabelText('Dirección').getAttribute('aria-invalid')).toBe('true');
  for (const [label, value] of [['Dirección', 'Av. Nueva 200'], ['Ciudad', 'Lima'], ['Región o estado', 'Lima'], ['Código postal', '15001'], ['País', 'Perú']]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Guardar dirección' }));
  expect(screen.queryByRole('heading', { name: 'Nueva dirección' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Continuar al pago' }).disabled).toBe(false);
  accept(); fireEvent.click(screen.getByRole('button', { name: /Confirmar y pagar/ }));
  expect(db.getSnapshot().data.Orders[0].shippingAddress.line1).toBe('Av. Nueva 200');
});

it('cambiar dirección invalida la confirmación previa y usa el nuevo destino', () => {
  const { db } = checkoutFixture();
  const address = db.getSnapshot().data.Customers[0].addresses[0];
  createProfileService(db).saveAddress({ ...address, id: undefined, line1: 'Av. Segunda 200' });
  mount(db); accept();
  fireEvent.click(screen.getByRole('button', { name: 'Enviar aquí' }));
  expect(screen.queryByRole('button', { name: /Confirmar y pagar/ })).toBeNull();
  accept(); fireEvent.click(screen.getByRole('button', { name: /Confirmar y pagar/ }));
  expect(db.getSnapshot().data.Orders[0].shippingAddress.line1).toBe('Av. Segunda 200');
});

it('un cambio de precio reactivo obliga a revisar otra vez el total', () => {
  const { db } = checkoutFixture(); mount(db); accept();
  act(() => db.update((data) => { data.Products.find((p) => p.id === 'graphics-001').priceCents = 35000; }));
  expect(screen.getByRole('button', { name: /Confirmar y pagar USD\s700/ }).disabled).toBe(true);
  expect(db.getSnapshot().data.Orders).toHaveLength(0);
});

it('editar una dirección bloquea el pago mientras haya cambios sin guardar', () => {
  const { db } = checkoutFixture(); mount(db); accept();
  fireEvent.click(screen.getByRole('button', { name: 'Editar dirección Calle Demo 123' }));
  expect(screen.queryByRole('button', { name: /Confirmar y pagar/ })).toBeNull();
  expect(screen.getByRole('button', { name: 'Continuar al pago' }).disabled).toBe(true);
  fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Calle Editada 900' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar dirección' }));
  accept(); fireEvent.click(screen.getByRole('button', { name: /Confirmar y pagar/ }));
  expect(db.getSnapshot().data.Orders[0].shippingAddress.line1).toBe('Calle Editada 900');
});

it('exige teléfono de envío y permite guardarlo sin abandonar checkout', () => {
  const { db } = checkoutFixture();
  db.update((data) => { data.Customers[0].phone = ''; }); mount(db);
  expect(screen.getByRole('button', { name: 'Continuar al pago' }).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Guardar teléfono' }));
  expect(screen.getByLabelText('Teléfono de contacto').getAttribute('aria-invalid')).toBe('true');
  fireEvent.change(screen.getByLabelText('Teléfono de contacto'), { target: { value: '+51 999123456' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar teléfono' }));
  accept(); fireEvent.click(screen.getByRole('button', { name: /Confirmar y pagar/ }));
  expect(db.getSnapshot().data.Orders[0].contactPhone).toBe('+51 999123456');
});

it('precio cambiado en almacenamiento se informa antes de crear una orden', () => {
  const { db, storage } = checkoutFixture(); mount(db); accept();
  const data = JSON.parse(storage.getItem(DATABASE_KEY));
  data.Products.find((p) => p.id === 'graphics-001').priceCents += 100;
  storage.setItem(DATABASE_KEY, JSON.stringify(data));
  fireEvent.click(screen.getByRole('button', { name: /Confirmar y pagar/ }));
  expect(screen.getByRole('alert').textContent).toContain('Han cambiado');
  expect(db.getSnapshot().data.Orders).toHaveLength(0);
  expect(db.getSnapshot().cart.lines).toHaveLength(1);
});

it('fallo de guardado no muestra éxito y permite reintentar con carrito conservado', () => {
  const { db, storage } = checkoutFixture(); mount(db); accept();
  const spy = vi.spyOn(storage, 'setItem').mockImplementation(() => { throw Error('QuotaExceededError'); });
  fireEvent.click(screen.getByRole('button', { name: /Confirmar y pagar/ }));
  expect(screen.queryByRole('heading', { name: '¡Tu pedido está confirmado!' })).toBeNull();
  expect(screen.getByRole('alert').textContent).toContain('No se pudieron');
  expect(db.getSnapshot().cart.lines).toHaveLength(1);
  spy.mockRestore();
  fireEvent.click(screen.getByRole('checkbox', { name: /He revisado los artículos/ }));
  fireEvent.click(screen.getByRole('button', { name: /Confirmar y pagar/ }));
  expect(db.getSnapshot().data.Orders).toHaveLength(1);
});

it('visitante va a login sin perder artículos', async () => {
  const { db } = checkoutFixture(); db.update((data) => { data.Session = null; });
  mount(db);
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeTruthy());
  expect(db.getSnapshot().cart.lines).toEqual([{ productId: 'graphics-001', quantity: 2 }]);
});

it('confirmación persiste tras recarga y no revela órdenes ajenas o inexistentes', () => {
  const { db, service } = checkoutFixture();
  const { order } = service.confirmCheckout(service.reviewCheckout('address-1'));
  const view = mount(db, `/checkout/confirmation/${order.id}`);
  expect(screen.getByRole('heading', { name: '¡Tu pedido está confirmado!' })).toBeTruthy();
  view.unmount();
  db.update((data) => { data.Orders[0].customerId = 'customer-2'; data.Customers.push({ ...data.Customers[0], id: 'customer-2', email: 'otro@example.com' }); });
  mount(db, `/checkout/confirmation/${order.id}`);
  expect(screen.getByRole('heading', { name: 'No encontramos esta página' })).toBeTruthy();
  expect(screen.queryByText(order.id)).toBeNull();
});

it('checkout vacío ofrece volver al catálogo sin controles de pago', () => {
  const { db, service } = checkoutFixture(); service.confirmCheckout(service.reviewCheckout('address-1'));
  mount(db);
  expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Volver a la tienda' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: /Confirmar y pagar/ })).toBeNull();
});
