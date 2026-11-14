import { afterEach, beforeAll, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '../../../src/app/providers.jsx';
import App from '../../../src/app/App.jsx';
import { setupDatabase } from '../../helpers.js';
import { createLocalDatabase } from '../../../src/services/storage/localDatabase.js';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
});
afterEach(cleanup);
function mount(db, path) { return render(<MemoryRouter initialEntries={[path]}><AppProviders database={db}><App /></AppProviders></MemoryRouter>); }
function fill(label, value) { fireEvent.change(screen.getByLabelText(label), { target: { value } }); }
function signOut(name) { fireEvent.click(screen.getByLabelText(`Cuenta de ${name}`)); fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' })); }

it('registro real → compra → recarga → login Admin muestra ventas, stock, Cliente y pedido; logística llega al Cliente', async () => {
  const { db, storage, sessionStorage } = setupDatabase(); mount(db, '/register');
  fill('Nombre completo', 'Comprador Integración'); fill('Email', 'compra-integracion@example.com'); fill('Contraseña', 'compra-demo-123');
  fireEvent.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));
  await waitFor(() => expect(screen.getByLabelText('Cuenta de Comprador')).toBeTruthy());
  fill('Buscar productos', 'NVIDIA GeForce RTX 4060');
  const add = screen.getByRole('button', { name: 'Añadir NVIDIA GeForce RTX 4060 al carrito', exact: true });
  fireEvent.click(add); fireEvent.click(add);
  fireEvent.click(screen.getByRole('button', { name: 'Carrito, 2 artículos' }));
  fireEvent.click(screen.getByRole('button', { name: 'Continuar al checkout' }));
  fill('Teléfono de contacto', '+51 999123456'); fireEvent.click(screen.getByRole('button', { name: 'Guardar teléfono' }));
  for (const [label, value] of [['Dirección', 'Calle Integración 123'], ['Ciudad', 'Lima'], ['Región o estado', 'Lima'], ['Código postal', '15001'], ['País', 'Perú']]) fill(label, value);
  fireEvent.click(screen.getByRole('button', { name: 'Guardar dirección' }));
  fireEvent.click(screen.getByRole('button', { name: 'Continuar al pago' }));
  fireEvent.click(screen.getByRole('checkbox', { name: /He revisado los artículos/ }));
  fireEvent.click(screen.getByRole('button', { name: /Confirmar y pagar/ }));
  expect(screen.getByRole('heading', { name: '¡Tu pedido está confirmado!' })).toBeTruthy();
  const orderId = db.getSnapshot().data.Orders[0].id;
  expect(db.getSnapshot().data.Products.find((p) => p.id === 'graphics-001').stock).toBe(10);
  signOut('Comprador');
  cleanup();
  const restored = createLocalDatabase({ getStorage: () => storage, getSessionStorage: () => sessionStorage });
  mount(restored, '/login'); fill('Email', 'admin@cybermarket.com'); fill('Contraseña', 'admin123');
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy());
  expect(screen.getByRole('region', { name: 'Importe de pedidos' }).textContent).toMatch(/USD\s598\.00/);
  expect(screen.getByRole('region', { name: 'Pedidos registrados' }).textContent).toContain('1');
  expect(screen.getByRole('region', { name: 'Clientes registrados' }).textContent).toContain('1');
  const units = restored.getSnapshot().data.Products.filter((p) => p.active).reduce((sum, p) => sum + p.stock, 0);
  expect(screen.getByRole('region', { name: 'Unidades en inventario' }).textContent).toContain(String(units));
  fireEvent.click(screen.getByRole('link', { name: 'Productos', exact: true }));
  fill('Buscar productos', 'NVIDIA GeForce RTX 4060');
  expect(screen.getByRole('row', { name: /NVIDIA GeForce RTX 4060 NVIDIA Tarjetas gráficas USD/ }).textContent).toContain('Disponible · 10');
  fireEvent.click(screen.getByRole('link', { name: 'Clientes', exact: true }));
  expect(screen.getByText('compra-integracion@example.com')).toBeTruthy();
  fireEvent.click(screen.getByRole('link', { name: 'Logística', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: `Gestionar pedido ${orderId}` }));
  for (const status of ['paid', 'shipped', 'delivered']) {
    fill('Nuevo estado', status);
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar estado', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cambio' }));
  }
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Gestionar pedido' })).getByRole('button', { name: 'Cerrar ventana' }));
  signOut('Administrador');
  cleanup(); mount(restored, `/my-orders/${orderId}`);
  fill('Email', 'compra-integracion@example.com'); fill('Contraseña', 'compra-demo-123');
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Seguimiento de tu pedido' })).toBeTruthy());
  expect(document.querySelector('[aria-current="step"] h3').textContent).toBe('Entregado');
}, 20000);
