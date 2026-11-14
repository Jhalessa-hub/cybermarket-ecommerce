import { useMemo, useState } from 'react';
import { createCatalogFilters, filterProducts, priceFilterError, specLabels } from '../utils/catalog.js';

export function useCatalog(products, options = {}) {
  const [localFilters, setLocalFilters] = useState(createCatalogFilters);
  const [localSort, setLocalSort] = useState('default');
  const filters = options.filters ?? localFilters;
  const sort = options.sort ?? localSort;
  const setFilters = options.onFiltersChange ?? setLocalFilters;
  const setSort = options.onSortChange ?? setLocalSort;
  const results = useMemo(() => {
    const result = filterProducts(products, filters);
    if (sort === 'default') {
      // Alterna categorías para mostrar variedad, sin afirmar popularidad ni promociones.
      const groups = new Map();
      result.forEach((product) => {
        if (!groups.has(product.categoryId)) groups.set(product.categoryId, []);
        groups.get(product.categoryId).push(product);
      });
      const mixed = [];
      const lists = [...groups.values()];
      for (let index = 0; mixed.length < result.length; index += 1) lists.forEach((list) => { if (list[index]) mixed.push(list[index]); });
      return mixed;
    }
    if (sort === 'price-asc') result.sort((a, b) => a.priceCents - b.priceCents);
    if (sort === 'price-desc') result.sort((a, b) => b.priceCents - a.priceCents);
    if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return result;
  }, [products, filters, sort]);
  const facets = useMemo(() => ({
    brands: [...new Set(products.filter((p) => p.active && p.brand).map((p) => p.brand))].sort(),
    specs: Object.fromEntries(Object.keys(specLabels).map((key) => [key, [...new Set(products.filter((p) => p.active && p.specs?.[key] != null).map((p) => String(p.specs[key])))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))])),
  }), [products]);
  function setFilter(key, value) { setFilters((previous) => ({ ...previous, [key]: value })); }
  function toggle(key, value) {
    setFilters((previous) => ({ ...previous, [key]: previous[key].includes(value) ? previous[key].filter((item) => item !== value) : [...previous[key], value] }));
  }
  function toggleSpec(key, value) {
    setFilters((previous) => {
      const selected = previous.specs[key] ?? [];
      return { ...previous, specs: { ...previous.specs, [key]: selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value] } };
    });
  }
  const activeCount = Number(!!filters.query.trim()) + filters.categories.length + filters.brands.length + filters.availability.length + Number(filters.minPrice !== '') + Number(filters.maxPrice !== '') + Object.values(filters.specs).reduce((sum, list) => sum + list.length, 0);
  return { filters, results, facets, sort, setSort, setFilter, toggle, toggleSpec, clear: () => setFilters(createCatalogFilters()), activeCount, priceError: priceFilterError(filters) };
}
