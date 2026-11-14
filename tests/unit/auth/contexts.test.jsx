import { afterEach, expect, it } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { AppProviders } from '../../../src/app/providers.jsx';
import { useAuth } from '../../../src/hooks/useAuth.js';
import { useShop } from '../../../src/hooks/useShop.js';
import { useCart } from '../../../src/hooks/useCart.js';
import { createAuthService } from '../../../src/services/authService.js';
import { DATABASE_KEY } from '../../../src/services/storage/databaseSchema.js';
import { setupDatabase } from '../../helpers.js';

afterEach(cleanup);

function Probe() {
  const auth = useAuth();
  const shop = useShop();
  const cart = useCart();
  return <div data-testid="probe">{JSON.stringify({ status: auth.status, role: auth.role, user: auth.user, count: shop.products.length, customers: shop.customers, orders: shop.orders, items: cart.itemCount })}</div>;
}
const result = () => JSON.parse(screen.getByTestId('probe').textContent);

it('hidrata providers sin poblar clientes y reacciona a login/logout sin recarga', async () => {
  const { db } = setupDatabase();
  render(<AppProviders database={db}><Probe /></AppProviders>);
  expect(result()).toMatchObject({ status: 'anonymous', role: null, count: 80, customers: [], orders: [], items: 0 });
  const auth = createAuthService(db);
  await act(() => auth.login({ email: 'admin@cybermarket.com', password: 'admin123' }));
  expect(result()).toMatchObject({ status: 'authenticated', role: 'admin' });
  act(() => auth.logout());
  expect(result().status).toBe('anonymous');
});

it('reacciona a cambios externos y no expone un rol obsoleto ante corrupción', async () => {
  const { db, storage, sendStorage } = setupDatabase();
  render(<AppProviders database={db}><Probe /></AppProviders>);
  await act(() => createAuthService(db).login({ email: 'admin@cybermarket.com', password: 'admin123' }));
  act(() => {
    storage.setItem(DATABASE_KEY, '{bad');
    sendStorage(DATABASE_KEY);
  });
  expect(result()).toMatchObject({ status: 'error', role: null, count: 0 });
});

it('hace visibles cambios de catálogo desde el snapshot sin recarga', () => {
  const { db } = setupDatabase();
  render(<AppProviders database={db}><Probe /></AppProviders>);
  act(() => db.update((draft) => { draft.Products[0].active = false; }));
  expect(result().count).toBe(79);
});
