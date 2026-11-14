import { expect, it } from 'vitest';
import { createSeedData } from '../../../src/services/storage/seedData.js';
import { filterProducts, createCatalogFilters } from '../../../src/utils/catalog.js';
import { createProductService } from '../../../src/services/productService.js';
import { createAuthService } from '../../../src/services/authService.js';
import { setupDatabase } from '../../helpers.js';

const products = createSeedData().Products;
it('acumula texto, categorías, precio, stock y atributos técnicos', () => {
  const result = filterProducts(products, {
    ...createCatalogFilters(), query: '  RYZEN  ', categories: ['processors'], minPrice: '100', maxPrice: '300', availability: ['available'], specs: { socket: ['AM4', 'AM5'], cores: ['6'] },
  });
  expect(result.length).toBeGreaterThan(0);
  expect(result.every((p) => p.name.includes('Ryzen') && p.priceCents >= 10000 && p.priceCents <= 30000 && p.stock > 0 && p.specs.cores === 6)).toBe(true);
});

it('aplica OR dentro de categorías y no muestra productos inactivos', () => {
  const items = [...products, { ...products[0], id: 'inactive', active: false }];
  const result = filterProducts(items, { ...createCatalogFilters(), categories: ['graphics', 'processors'] });
  expect(result).toHaveLength(48);
  expect(result.some((p) => p.id === 'inactive')).toBe(false);
});

it('precio inválido o rango invertido no produce resultados engañosos', () => {
  expect(filterProducts(products, { ...createCatalogFilters(), minPrice: '300', maxPrice: '100' })).toEqual([]);
  expect(filterProducts(products, { ...createCatalogFilters(), minPrice: '-1' })).toEqual([]);
  expect(filterProducts(products, { ...createCatalogFilters(), maxPrice: 'abc' })).toEqual([]);
});

it('consulta catálogo público sin exponer inactivos y restringe CRUD a Admin', async () => {
  const { db } = setupDatabase(); db.initialize();
  const service = createProductService(db);
  expect(service.listProducts()).toHaveLength(80);
  expect(() => service.createProduct({})).toThrow();
  await createAuthService(db).login({ email: 'admin@cybermarket.com', password: 'admin123' });
  const created = service.createProduct({ name: 'CPU demo', description: 'Prueba', categoryId: 'processors', priceCents: 10000, currency: 'USD', stock: 4, specs: {} });
  service.updateProduct(created.id, { stock: 3 });
  expect(service.getProduct(created.id).stock).toBe(3);
  service.deactivateProduct(created.id);
  expect(service.getProduct(created.id)).toBeNull();
  expect(db.getSnapshot().data.Products.some((p) => p.id === created.id)).toBe(true);
});

it('no elimina categorías utilizadas ni permite precio o inventario inválidos', async () => {
  const { db } = setupDatabase(); db.initialize();
  await createAuthService(db).login({ email: 'admin@cybermarket.com', password: 'admin123' });
  const service = createProductService(db);
  expect(() => service.deleteCategory('graphics')).toThrow();
  expect(() => service.updateProduct('graphics-001', { stock: -1 })).toThrow();
  expect(() => service.updateProduct('graphics-001', { priceCents: 1.5 })).toThrow();
  const category = service.createCategory({ name: 'Prueba de categoría' });
  service.updateCategory(category.id, { name: 'Categoría editada' });
  service.deleteCategory(category.id);
  expect(service.listCategories().some((c) => c.id === category.id)).toBe(false);
});
