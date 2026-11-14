export const specLabels = { socket: 'Socket', chipset: 'Chipset', memory: 'Memoria RAM', vramGB: 'VRAM (GB)', cores: 'Núcleos' };
export const createCatalogFilters = () => ({ query: '', categories: [], brands: [], minPrice: '', maxPrice: '', availability: [], specs: {} });

export function parsePrice(value) {
  if (value === '' || value == null) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(String(value))) return NaN;
  const cents = Math.round(Number(value) * 100);
  return Number.isSafeInteger(cents) ? cents : NaN;
}

export function priceFilterError(filters) {
  const min = parsePrice(filters.minPrice), max = parsePrice(filters.maxPrice);
  if (Number.isNaN(min) || Number.isNaN(max)) return 'Introduce precios no negativos con hasta dos decimales.';
  if (min !== null && max !== null && min > max) return 'El precio mínimo no puede superar al máximo.';
  return '';
}

export function filterProducts(products, filters) {
  if (priceFilterError(filters)) return [];
  const query = filters.query.trim().toLocaleLowerCase('es');
  const min = parsePrice(filters.minPrice), max = parsePrice(filters.maxPrice);
  return products.filter((product) => {
    if (!product.active) return false;
    if (query && !`${product.name} ${product.description}`.toLocaleLowerCase('es').includes(query)) return false;
    if (filters.categories.length && !filters.categories.includes(product.categoryId)) return false;
    if (filters.brands.length && !filters.brands.includes(product.brand)) return false;
    if (min !== null && product.priceCents < min) return false;
    if (max !== null && product.priceCents > max) return false;
    if (filters.availability.length && !filters.availability.includes(product.stock > 0 ? 'available' : 'sold-out')) return false;
    return Object.entries(filters.specs).every(([key, values]) => !values.length || values.includes(String(product.specs?.[key])));
  });
}
