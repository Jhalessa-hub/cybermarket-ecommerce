import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AppProviders } from '../../../src/app/providers.jsx';
import App from '../../../src/app/App.jsx';
import { createAuthService } from '../../../src/services/authService.js';
import { createProfileService } from '../../../src/services/profileService.js';
import { safeReturnTo } from '../../../src/routes/routePaths.js';
import { CART_KEY, DATABASE_KEY } from '../../../src/services/storage/databaseSchema.js';
import { setupDatabase } from '../../helpers.js';

beforeAll(() => {
  // jsdom no implementa la API modal nativa; el navegador sí gestiona foco y Escape.
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
});
beforeEach(() => { vi.stubGlobal('crypto', webcrypto); });
afterEach(cleanup);

function CurrentPath() {
  const location = useLocation();
  return <span hidden data-testid="current-path">{location.pathname}</span>;
}
function mount(database, path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><AppProviders database={database}><App /><CurrentPath /></AppProviders></MemoryRouter>);
}
async function customer(database, email = 'jhon@example.com', name = 'Jhon Demo') {
  return createAuthService(database).register({ name, email, password: 'solo-demo-123' });
}
function fillAccess(email, password) {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
}

it('visitante tiene navbar oscuro sin opciones ni enlaces Admin', () => {
  const { db } = setupDatabase();
  mount(db);
  expect(screen.getByRole('link', { name: 'Ingresar' })).toBeTruthy();
  expect(screen.queryByText(/admin|dashboard|logística/i)).toBeNull();
  expect(screen.getByRole('link', { name: /Añade tu dirección/ })).toBeTruthy();
});

it('Cliente ve círculo con icono y solo su primer nombre, sin interfaz Admin', async () => {
  const { db } = setupDatabase(); db.initialize();
  await customer(db);
  mount(db);
  const summary = screen.getByLabelText('Cuenta de Jhon');
  expect(summary.textContent).toBe('Jhon');
  expect(summary.querySelector('svg')).toBeTruthy();
  expect(screen.queryByRole('navigation', { name: 'Navegación administrativa' })).toBeNull();
  expect(document.querySelector('a[href^="/admin"]')).toBeNull();
});

it.each(['/admin', '/admin/products', '/admin/logistics', '/admin/customers', '/admin/unknown'])('deniega a Cliente la ruta directa %s sin renderizar Admin', async (path) => {
  const { db } = setupDatabase(); db.initialize();
  await customer(db);
  mount(db, path);
  await waitFor(() => expect(screen.getByTestId('current-path').textContent).toBe('/login'));
  expect(screen.getByText(/Acceso de Administrador/)).toBeTruthy();
  expect(db.getSnapshot().data.Session.role).toBe('customer');
  expect(screen.queryByRole('navigation', { name: 'Navegación administrativa' })).toBeNull();
  expect(document.querySelector('a[href^="/admin"]')).toBeNull();
});

it('visitante que abre Admin inicia sesión y vuelve a su ruta administrativa original', async () => {
  const { db } = setupDatabase();
  mount(db, '/admin/logistics');
  expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeTruthy();
  fillAccess('admin@cybermarket.com', 'admin123');
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
  await waitFor(() => expect(screen.getByTestId('current-path').textContent).toBe('/admin/logistics'));
  expect(screen.getByRole('navigation', { name: 'Navegación administrativa' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Elegir dirección de envío' })).toBeNull();
});

it('Admin no puede abrir checkout Cliente y al cerrar sesión pierde el acceso a rutas Admin', async () => {
  const { db } = setupDatabase(); db.initialize();
  const auth = createAuthService(db);
  await auth.login({ email: 'admin@cybermarket.com', password: 'admin123' });
  mount(db, '/checkout');
  await waitFor(() => expect(screen.getByTestId('current-path').textContent).toBe('/admin'));
  fireEvent.click(screen.getByLabelText('Cuenta de Administrador'));
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  await waitFor(() => expect(db.getSnapshot().data.Session).toBeNull());
  expect(screen.queryByRole('navigation', { name: 'Navegación administrativa' })).toBeNull();
});

it('checkout solicita login, conserva carrito y vuelve al mismo destino tras registrarse', async () => {
  const { db, storage } = setupDatabase();
  const rawCart = JSON.stringify({ version: 1, lines: [{ productId: 'graphics-001', quantity: 2 }] });
  storage.setItem(CART_KEY, rawCart);
  mount(db, '/checkout');
  fireEvent.click(screen.getByRole('link', { name: 'Crea tu cuenta' }));
  fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Jhon Demo' } });
  fillAccess('nuevo@example.com', 'solo-demo-123');
  fireEvent.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Finaliza tu compra' })).toBeTruthy());
  expect(screen.getByTestId('current-path').textContent).toBe('/checkout');
  expect(JSON.parse(storage.getItem(CART_KEY)).lines).toEqual(JSON.parse(rawCart).lines);
});

it('valida formulario de registro y no crea cuentas con campos vacíos', () => {
  const { db } = setupDatabase();
  mount(db, '/register');
  fireEvent.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));
  return waitFor(() => {
    expect(screen.getByLabelText('Nombre completo').getAttribute('aria-invalid')).toBe('true');
    expect(db.getSnapshot().data.Customers).toEqual([]);
  });
});

it('muestra error genérico de login sin habilitar navegación privada', async () => {
  const { db } = setupDatabase();
  mount(db, '/login');
  fillAccess('nadie@example.com', 'incorrecta');
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
  expect((await screen.findByRole('alert')).textContent).toContain('Email o contraseña incorrectos');
  expect(screen.getByLabelText('Contraseña').value).toBe('');
});

it('edita nombre y teléfono en perfil y refleja el primer nombre inmediatamente en navbar', async () => {
  const { db } = setupDatabase(); db.initialize();
  await customer(db);
  mount(db, '/profile');
  fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Carlos Demo' } });
  fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '+51 999123456' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar perfil' }));
  expect(screen.getByLabelText('Cuenta de Carlos')).toBeTruthy();
  expect(db.getSnapshot().data.Customers[0].phone).toBe('+51 999123456');
});

it('crea dirección en perfil y el encabezado muestra dos líneas sin fondo amarillo', async () => {
  const { db } = setupDatabase(); db.initialize();
  await customer(db);
  mount(db, '/profile');
  fireEvent.click(screen.getByRole('button', { name: 'Añadir dirección' }));
  for (const [label, value] of [['Destinatario', 'Jhon Demo'], ['Dirección', 'Jr. Manco Capac 350'], ['Ciudad', 'Lima'], ['Región o estado', 'Lima'], ['Código postal', '15001'], ['País', 'Perú']]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Guardar dirección' }));
  const destination = screen.getByRole('button', { name: 'Elegir dirección de envío' });
  expect(within(destination).getByText('Enviar a Jhon')).toBeTruthy();
  expect(within(destination).getByText('Jr. Manco Capac 350')).toBeTruthy();
  expect(destination.className).not.toContain('yellow');
  expect(db.getSnapshot().data.Customers[0].addresses).toHaveLength(1);
});

it('selecciona un destino en modal, actualiza el encabezado y cierra con devolución de foco', async () => {
  const { db } = setupDatabase(); db.initialize();
  await customer(db);
  const profile = createProfileService(db);
  const address = { recipient: 'Jhon Demo', line1: 'Jr. Manco Capac 350', city: 'Lima', region: 'Lima', postalCode: '15001', country: 'Perú' };
  profile.saveAddress(address);
  const second = profile.saveAddress({ ...address, line1: 'Av. Demo 200' });
  mount(db);
  const trigger = screen.getByRole('button', { name: 'Elegir dirección de envío' });
  trigger.focus(); fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: '¿A dónde lo enviamos?' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar aquí' }));
  expect(db.getSnapshot().data.Customers[0].selectedAddressId).toBe(second.id);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(trigger.textContent).toContain('Av. Demo 200');
  expect(document.activeElement).toBe(trigger);
});

it('perfil puede editar/eliminar direcciones y marcar la predeterminada sin romper selección', async () => {
  const { db } = setupDatabase(); db.initialize();
  await customer(db);
  createProfileService(db).saveAddress({ recipient: 'Jhon Demo', line1: 'Av. Antigua 100', city: 'Lima', region: 'Lima', postalCode: '15001', country: 'Perú' });
  mount(db, '/profile');
  fireEvent.click(screen.getByRole('button', { name: 'Editar dirección Av. Antigua 100' }));
  fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Av. Nueva 200' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar dirección' }));
  expect(screen.getByRole('button', { name: 'Elegir dirección de envío' }).textContent).toContain('Av. Nueva 200');
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar dirección Av. Nueva 200' }));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar dirección' }));
  expect(db.getSnapshot().data.Customers[0].addresses).toEqual([]);
  expect(screen.getByRole('button', { name: 'Elegir dirección de envío' }).textContent).toContain('Añade tu dirección');
});

it('no renderiza datos privados o navbar de una sesión fallida hasta recuperar storage', async () => {
  const { db, storage, sendStorage } = setupDatabase(); db.initialize();
  await customer(db);
  mount(db, '/profile');
  act(() => { storage.setItem(DATABASE_KEY, 'bad'); sendStorage(DATABASE_KEY); });
  expect(screen.getByRole('alert').textContent).toContain('No pudimos cargar tus datos');
  expect(screen.queryByRole('heading', { name: 'Mi perfil' })).toBeNull();
});

it('para pedidos ajenos o inexistentes la respuesta no revela propiedad ni datos', async () => {
  const { db } = setupDatabase(); db.initialize();
  await customer(db);
  mount(db, '/my-orders/order-of-someone-else');
  expect(screen.getByRole('heading', { name: 'No encontramos esta página' })).toBeTruthy();
});

it('limita los destinos de retorno a rutas internas conocidas del rol', () => {
  for (const bad of ['https://evil.example', '//evil.example', '/\\evil.example', '/admin', '/login', '/checkout?next=https://evil.example']) {
    expect(safeReturnTo(bad, 'customer')).toBe('/');
  }
  expect(safeReturnTo('/checkout', 'customer')).toBe('/checkout');
  expect(safeReturnTo('/admin/logistics', 'admin')).toBe('/admin/logistics');
  expect(safeReturnTo('/checkout', 'admin')).toBe('/admin');
});

it('no expone rutas ni navbar mientras la sesión está sin hidratar', () => {
  const { db } = setupDatabase();
  vi.spyOn(db, 'initialize').mockImplementation(() => db.getSnapshot());
  mount(db, '/admin/products');
  expect(screen.getByRole('status').textContent).toContain('Preparando tu espacio');
  expect(screen.queryByRole('navigation')).toBeNull();
  expect(screen.queryByRole('heading', { name: 'Bienvenido de nuevo' })).toBeNull();
});

it('una foto local guardada se muestra en el círculo y puede retirarse', async () => {
  const { db } = setupDatabase(); db.initialize();
  await customer(db);
  const avatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/WZkAAAAASUVORK5CYII=';
  createProfileService(db).updateProfile({ name: 'Jhon Demo', phone: '', avatar });
  mount(db, '/profile');
  expect(screen.getByLabelText('Cuenta de Jhon').querySelector('img').getAttribute('src')).toBe(avatar);
  fireEvent.click(screen.getByRole('button', { name: 'Quitar foto' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar perfil' }));
  expect(screen.getByLabelText('Cuenta de Jhon').querySelector('img')).toBeNull();
  expect(db.getSnapshot().data.Customers[0].avatar).toBeNull();
});
