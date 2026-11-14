import { expect, it } from 'vitest';
import { createCatalogFilters } from '../../../src/utils/catalog.js';
import { readCatalogSearch, writeCatalogSearch } from '../../../src/utils/catalogLocation.js';
import { safeReturnTo } from '../../../src/routes/routePaths.js';

it('filtros acumulativos y orden sobreviven a serializar la URL', () => {
  const filters = { ...createCatalogFilters(), query: 'RTX & Ryzen', categories: ['graphics', 'processors'], brands: ['AMD', 'NVIDIA'], availability: ['available'], minPrice: '100.00', maxPrice: '500', specs: { socket: ['AM4', 'AM5'], vramGB: ['8'] } };
  expect(readCatalogSearch(writeCatalogSearch(filters, 'price-asc'))).toEqual({ filters, sort: 'price-asc' });
});

it('parámetros desconocidos no crean atributos y se deduplican los filtros', () => {
  const { filters, sort } = readCatalogSearch(new URLSearchParams('category=graphics&category=graphics&spec.unknown=bad&sort=unknown'));
  expect(filters.categories).toEqual(['graphics']); expect(filters.specs).toEqual({}); expect(sort).toBe('default');
});

it('retorno de autenticación conserva búsqueda sin aceptar destinos externos', () => {
  expect(safeReturnTo('/search?q=RTX&category=graphics', 'customer')).toBe('/search?q=RTX&category=graphics');
  expect(safeReturnTo('//evil.example/search', 'customer')).toBe('/');
  expect(safeReturnTo('/search/../../admin', 'customer')).toBe('/');
});
