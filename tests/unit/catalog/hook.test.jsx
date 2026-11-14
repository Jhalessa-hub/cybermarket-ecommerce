import { afterEach, expect, it } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useCatalog } from '../../../src/hooks/useCatalog.js';
import { createSeedData } from '../../../src/services/storage/seedData.js';

afterEach(cleanup);
it('quitar precio no borra categoría y ordenar precio no cambia el dataset original', () => {
  const products = createSeedData().Products;
  const firstId = products[0].id;
  const { result } = renderHook(() => useCatalog(products));
  act(() => { result.current.toggle('categories', 'graphics'); result.current.setFilter('maxPrice', '400'); });
  const limited = result.current.results.length;
  act(() => result.current.setFilter('maxPrice', ''));
  expect(result.current.filters.categories).toEqual(['graphics']);
  expect(result.current.results.length).toBeGreaterThan(limited);
  act(() => result.current.setSort('price-asc'));
  expect(result.current.results[0].priceCents).toBeLessThanOrEqual(result.current.results.at(-1).priceCents);
  expect(products[0].id).toBe(firstId);
});
