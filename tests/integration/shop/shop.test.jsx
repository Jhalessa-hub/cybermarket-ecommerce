import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '../../../src/app/providers.jsx';
import App from '../../../src/app/App.jsx';
import { setupDatabase } from '../../helpers.js';
import { createLocalDatabase } from '../../../src/services/storage/localDatabase.js';
import { CART_KEY } from '../../../src/services/storage/databaseSchema.js';
import { createAuthService } from '../../../src/services/authService.js';
import { webcrypto } from 'node:crypto';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
});
afterEach(cleanup);
function mount(db, path = '/') { return render(<MemoryRouter initialEntries={[path]}><AppProviders database={db}><App /></AppProviders></MemoryRouter>); }
function search(text) { fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar productos' }), { target: { value: text } }); }
function cartButton(count) { return screen.getByRole('button', { name: `Carrito, ${count} artículos` }); }

it('combina búsqueda, categoría y precio y permite quitar un filtro sin borrar el resto', () => {
  const { db } = setupDatabase(); mount(db);
  search('  GEFORCE RTX 4060  ');
  fireEvent.click(screen.getByRole('checkbox', { name: 'Tarjetas gráficas' }));
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Precio máximo en USD' }), { target: { value: '399' } });
  expect(screen.getAllByRole('article')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Quitar filtro Hasta USD 399' }));
  expect(screen.getAllByRole('article')).toHaveLength(3);
  expect(screen.getByRole('checkbox', { name: 'Tarjetas gráficas' }).checked).toBe(true);
  expect(screen.getByRole('searchbox').value).toBe('  GEFORCE RTX 4060  ');
});

it('muestra búsqueda vacía con acción correctiva, y diferencia un catálogo realmente vacío', () => {
  const { db } = setupDatabase(); mount(db);
  search('producto inexistente-999999');
  expect(screen.getByRole('heading', { name: 'No encontramos coincidencias' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
  expect(screen.queryByRole('heading', { name: 'No encontramos coincidencias' })).toBeNull();
  act(() => db.update((draft) => { draft.Products = []; }));
  expect(screen.getByRole('heading', { name: 'El catálogo está vacío' })).toBeTruthy();
});

it('tarjeta minimalista: imagen, nombre y precio, sin promociones; agotado se ve en rojo', () => {
  const { db } = setupDatabase(); mount(db);
  search('RTX 4070');
  const articles = screen.getAllByRole('article');
  const soldOut = articles.find((article) => article.textContent.includes('NVIDIA GeForce RTX 4070') && !article.textContent.includes('SUPER'));
  expect(within(soldOut).getByText('Agotado').className).toContain('text-red');
  expect(within(soldOut).getByRole('button', { name: /Añadir/ }).disabled).toBe(true);
  expect(soldOut.querySelector('figure')).toBeTruthy();
  expect(soldOut.textContent).not.toMatch(/promo|descuento|oferta/i);
});

it('abre modal con imagen y especificaciones, cierra con Escape y devuelve foco a la tarjeta', () => {
  const { db } = setupDatabase(); mount(db);
  search('RTX 4060 Ti 16 GB');
  const trigger = screen.getByRole('link', { name: 'Ver detalle de NVIDIA GeForce RTX 4060 Ti 16 GB' });
  trigger.focus(); fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Detalle del producto' });
  expect(within(dialog).getByRole('heading', { name: 'NVIDIA GeForce RTX 4060 Ti 16 GB' })).toBeTruthy();
  expect(within(dialog).getByText('VRAM (GB)')).toBeTruthy();
  expect(within(dialog).getByText('16')).toBeTruthy();
  fireEvent(dialog, new Event('cancel', { bubbles: false, cancelable: true }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it('detalle directo funciona sin specs opcionales e ID desconocido no muestra producto', () => {
  const { db } = setupDatabase(); db.initialize();
  db.update((draft) => { draft.Products.find((p) => p.id === 'graphics-001').specs = {}; });
  mount(db, '/products/graphics-001');
  expect(screen.getByText(/Las especificaciones técnicas aún no están disponibles/)).toBeTruthy();
  cleanup();
  mount(db, '/products/desconocido');
  expect(screen.getByRole('heading', { name: 'No encontramos esta página' })).toBeTruthy();
});

it('añadir actualiza solo el contador, persiste sin duplicar línea y no abre el drawer', () => {
  const { db, storage } = setupDatabase(); mount(db);
  search('RTX 4060 Ti 16 GB');
  const add = screen.getByRole('button', { name: 'Añadir NVIDIA GeForce RTX 4060 Ti 16 GB al carrito' });
  fireEvent.click(add); fireEvent.click(add);
  expect(cartButton(2)).toBeTruthy();
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(JSON.parse(storage.getItem(CART_KEY)).lines).toEqual([{ productId: 'graphics-003', quantity: 2 }]);
});

it('drawer lateral cambia cantidad hasta el límite, calcula total y elimina artículos', () => {
  const { db } = setupDatabase(); mount(db);
  search('RTX 4060 Ti 16 GB');
  fireEvent.click(screen.getByRole('button', { name: 'Añadir NVIDIA GeForce RTX 4060 Ti 16 GB al carrito' }));
  const trigger = cartButton(1); trigger.focus(); fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Tu carrito' });
  const plus = within(dialog).getByRole('button', { name: 'Aumentar cantidad de NVIDIA GeForce RTX 4060 Ti 16 GB' });
  fireEvent.click(plus); fireEvent.click(plus); fireEvent.click(plus);
  expect(plus.disabled).toBe(true);
  expect(within(dialog).getByText('Máximo disponible: 4 unidades.')).toBeTruthy();
  expect(db.getSnapshot().cart.lines[0].quantity).toBe(4);
  expect(within(dialog).getByText('Total estimado').parentElement.textContent).toContain('1,796.00');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Eliminar NVIDIA GeForce RTX 4060 Ti 16 GB del carrito' }));
  expect(within(dialog).getByRole('heading', { name: 'Tu carrito está vacío' })).toBeTruthy();
  expect(within(dialog).getByRole('button', { name: 'Continuar al checkout' }).disabled).toBe(true);
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar ventana' }));
  expect(document.activeElement).toBe(cartButton(0));
});

it('el carrito se conserva después de recrear repositorio y de navegar a login', () => {
  const { db, storage } = setupDatabase(); mount(db);
  search('RTX 4060 Ti 16 GB');
  fireEvent.click(screen.getByRole('button', { name: 'Añadir NVIDIA GeForce RTX 4060 Ti 16 GB al carrito' }));
  cleanup();
  const restored = createLocalDatabase({ getStorage: () => storage });
  mount(restored, '/login');
  expect(cartButton(1)).toBeTruthy();
  fireEvent.click(cartButton(1));
  expect(within(screen.getByRole('dialog')).getByRole('heading', { name: 'NVIDIA GeForce RTX 4060 Ti 16 GB' })).toBeTruthy();
});

it('un cambio de inventario ajusta cantidades y avisa, sin abrir carrito automáticamente', async () => {
  const { db } = setupDatabase(); mount(db);
  search('RTX 4060 Ti 16 GB');
  const add = screen.getByRole('button', { name: 'Añadir NVIDIA GeForce RTX 4060 Ti 16 GB al carrito' });
  fireEvent.click(add); fireEvent.click(add);
  act(() => db.update((draft) => { draft.Products.find((p) => p.id === 'graphics-003').stock = 1; }));
  await waitFor(() => expect(db.getSnapshot().cart.lines[0].quantity).toBe(1));
  expect(screen.getByText(/cantidad ajustada a 1 unidades disponibles/)).toBeTruthy();
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(cartButton(1)).toBeTruthy();
});

it('otra pestaña actualiza el contador del carrito sin recarga', () => {
  const { db, storage, sendStorage } = setupDatabase(); mount(db);
  act(() => { storage.setItem(CART_KEY, JSON.stringify({ version: 1, lines: [{ productId: 'graphics-001', quantity: 2 }] })); sendStorage(CART_KEY); });
  expect(cartButton(2)).toBeTruthy();
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('fallo de guardado no anuncia éxito ni altera el carrito persistido', () => {
  const { db, storage } = setupDatabase(); mount(db);
  search('RTX 4060 Ti 16 GB');
  vi.spyOn(storage, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError'); });
  fireEvent.click(screen.getByRole('button', { name: 'Añadir NVIDIA GeForce RTX 4060 Ti 16 GB al carrito' }));
  expect(storage.getItem(CART_KEY)).toBeNull();
  expect(db.getSnapshot().cart.lines).toEqual([]);
  expect(screen.getByRole('heading', { name: 'No pudimos cargar tus datos' })).toBeTruthy();
});

it('si una imagen falla aparece la ilustración marcada como referencial', () => {
  const { db } = setupDatabase(); db.initialize();
  db.update((draft) => { draft.Products.find((p) => p.id === 'graphics-001').image = 'https://example.com/unavailable.jpg'; });
  mount(db); search('NVIDIA GeForce RTX 4060');
  const image = screen.getByRole('img', { name: 'NVIDIA GeForce RTX 4060' });
  fireEvent.error(image);
  expect(image.getAttribute('src')).toBe('/images/catalog/graphics.svg');
  expect(image.getAttribute('alt')).toContain('Foto de NVIDIA GeForce RTX 4060 no disponible');
});

it('la ruta /cart abre el drawer también al hidratar una sesión Cliente existente', async () => {
  vi.stubGlobal('crypto', webcrypto);
  const { db, storage, sessionStorage } = setupDatabase(); db.initialize();
  await createAuthService(db).register({ name: 'Cliente Demo', email: 'cart-demo@example.com', password: 'solo-demo-123' });
  const restored = createLocalDatabase({ getStorage: () => storage, getSessionStorage: () => sessionStorage });
  mount(restored, '/cart');
  expect(await screen.findByRole('dialog', { name: 'Tu carrito' })).toBeTruthy();
});
