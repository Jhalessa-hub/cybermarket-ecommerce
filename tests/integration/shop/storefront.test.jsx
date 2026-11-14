import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { AppProviders } from '../../../src/app/providers.jsx';
import App from '../../../src/app/App.jsx';
import { setupDatabase } from '../../helpers.js';

afterEach(cleanup);
function LocationProbe() {
  const location = useLocation(), navigate = useNavigate();
  return <><span data-testid="location">{location.pathname + location.search}</span><button onClick={() => navigate(-1)}>Atrás de prueba</button></>;
}
function mount(path = '/') {
  const { db } = setupDatabase();
  return render(<MemoryRouter initialEntries={[path]}><AppProviders database={db}><App /><LocationProbe /></AppProviders></MemoryRouter>);
}

it('Inicio presenta hero, categorías y cuadrícula amplia, sin filtros iniciales', () => {
  mount();
  expect(screen.getByRole('region', { name: 'Portada CyberMarket' })).toBeTruthy();
  expect(screen.queryByRole('complementary', { name: 'Filtros del catálogo' })).toBeNull();
  expect(screen.getByRole('link', { name: 'Filtrar catálogo' }).getAttribute('href')).toBe('/catalog');
  expect(screen.getByRole('navigation', { name: 'Categorías de productos' })).toBeTruthy();
  const cards = screen.getAllByRole('article');
  expect(cards).toHaveLength(20);
  expect(cards[0].parentElement.className).toContain('lg:grid-cols-4');
  expect(cards[0].parentElement.className).toContain('2xl:grid-cols-5');
});

it('usar el buscador abre /search, conserva el foco y permite seguir escribiendo', () => {
  mount();
  const input = screen.getByRole('searchbox', { name: 'Buscar productos' });
  input.focus(); fireEvent.focus(input);
  expect(screen.getByTestId('location').textContent).toBe('/search');
  fireEvent.change(input, { target: { value: 'RTX 4060' } });
  expect(screen.getByTestId('location').textContent).toContain('/search?q=RTX+4060');
  expect(document.activeElement).toBe(input);
  expect(screen.getByRole('complementary', { name: 'Filtros del catálogo' })).toBeTruthy();
  expect(screen.queryByRole('region', { name: 'Portada CyberMarket' })).toBeNull();
});

it('una categoría de la portada navega con su filtro preseleccionado', () => {
  mount();
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Categorías de productos' })).getByRole('link', { name: 'Tarjetas gráficas' }));
  expect(screen.getByTestId('location').textContent).toBe('/catalog?category=graphics');
  expect(screen.getByRole('checkbox', { name: 'Tarjetas gráficas' }).checked).toBe(true);
  expect(screen.getAllByRole('article').every((card) => /NVIDIA|AMD Radeon/.test(card.textContent))).toBe(true);
});

it.each(['/search', '/catalog'])('ruta directa %s muestra filtros aunque no haya búsqueda', (path) => {
  mount(path);
  expect(screen.getByRole('complementary', { name: 'Filtros del catálogo' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Explora el catálogo' })).toBeTruthy();
});

it('URL restaura búsqueda, filtros y orden al abrirla directamente', () => {
  mount('/search?q=RTX+4060&category=graphics&brand=NVIDIA&maxPrice=400&sort=price-desc');
  expect(screen.getByRole('searchbox', { name: 'Buscar productos' }).value).toBe('RTX 4060');
  expect(screen.getByRole('checkbox', { name: 'NVIDIA' }).checked).toBe(true);
  expect(screen.getByRole('spinbutton', { name: 'Precio máximo en USD' }).value).toBe('400');
  expect(screen.getByRole('combobox', { name: 'Ordenar por' }).value).toBe('price-desc');
  expect(screen.getAllByRole('article')).toHaveLength(2);
});

it('volver a Inicio limpia la vista y Atrás restaura los criterios sin perderlos', () => {
  mount('/search?q=RTX+4060&category=graphics');
  fireEvent.click(screen.getByRole('link', { name: 'Volver a Inicio' }));
  expect(screen.queryByRole('complementary', { name: 'Filtros del catálogo' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Atrás de prueba' }));
  expect(screen.getByRole('checkbox', { name: 'Tarjetas gráficas' }).checked).toBe(true);
  expect(screen.getByRole('searchbox', { name: 'Buscar productos' }).value).toBe('RTX 4060');
});

it('filtros recibidos en Inicio conducen a la vista dedicada', () => {
  mount('/?category=processors');
  expect(screen.getByTestId('location').textContent).toBe('/search?category=processors');
  expect(screen.getByRole('checkbox', { name: 'Procesadores' }).checked).toBe(true);
});
