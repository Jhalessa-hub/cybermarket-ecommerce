import { createCatalogFilters, specLabels } from './catalog.js';

export function readCatalogSearch(params) {
  const filters = createCatalogFilters();
  filters.query = params.get('q') ?? '';
  for (const [key, parameter] of [['categories', 'category'], ['brands', 'brand'], ['availability', 'availability']]) filters[key] = [...new Set(params.getAll(parameter))];
  filters.minPrice = params.get('minPrice') ?? '';
  filters.maxPrice = params.get('maxPrice') ?? '';
  for (const key of Object.keys(specLabels)) {
    const values = [...new Set(params.getAll(`spec.${key}`))];
    if (values.length) filters.specs[key] = values;
  }
  const sort = params.get('sort');
  return { filters, sort: ['price-asc', 'price-desc', 'name'].includes(sort) ? sort : 'default' };
}

export function writeCatalogSearch(filters, sort = 'default') {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  for (const [key, parameter] of [['categories', 'category'], ['brands', 'brand'], ['availability', 'availability']]) filters[key].forEach((value) => params.append(parameter, value));
  for (const key of ['minPrice', 'maxPrice']) if (filters[key] !== '') params.set(key, filters[key]);
  for (const [key, values] of Object.entries(filters.specs)) values.forEach((value) => params.append(`spec.${key}`, value));
  if (sort !== 'default') params.set('sort', sort);
  return params;
}
