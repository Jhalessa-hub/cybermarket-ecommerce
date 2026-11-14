import { requireRole } from './authService.js';
import { DomainError, isText, validateProduct } from '../utils/validation.js';

export function createProductService(database) {
  function data() {
    const snapshot = database.getSnapshot();
    if (snapshot.status !== 'ready') throw new DomainError('NOT_READY', 'El catálogo aún no está disponible.');
    return snapshot.data;
  }
  function adminUpdate(action) { return database.update((draft) => { requireRole(draft, 'admin'); return action(draft); }); }
  function productById(draft, id) {
    const product = draft.Products.find((p) => p.id === id);
    if (!product) throw new DomainError('NOT_FOUND', 'No se encontró el producto.');
    return product;
  }
  function categoryById(draft, id) {
    const category = draft.Categories.find((c) => c.id === id);
    if (!category) throw new DomainError('NOT_FOUND', 'No se encontró la categoría.');
    return category;
  }
  function categoryName(value, draft, ignoreId) {
    if (!isText(value) || value.trim().length > 100) throw new DomainError('VALIDATION', 'Introduce un nombre de categoría de hasta 100 caracteres.');
    const name = value.trim();
    if (draft.Categories.some((c) => c.id !== ignoreId && c.name.toLowerCase() === name.toLowerCase())) throw new DomainError('VALIDATION', 'Ya existe esa categoría.');
    return name;
  }
  function patch(product, input) {
    for (const key of ['name', 'brand', 'description', 'categoryId', 'priceCents', 'currency', 'stock', 'active', 'image', 'specs']) {
      if (Object.hasOwn(input, key)) product[key] = input[key];
    }
  }
  return {
    listAdminProducts() { const current = data(); requireRole(current, 'admin'); return current.Products; },
    listProducts() { return data().Products.filter((p) => p.active); },
    getProduct(id) { return data().Products.find((p) => p.id === id && p.active) ?? null; },
    listCategories() { return data().Categories; },
    createProduct(input) {
      return adminUpdate((draft) => {
        const product = { id: crypto.randomUUID(), brand: '', image: null, active: true, specs: {}, currency: 'USD' };
        patch(product, input);
        validateProduct(product, draft.Categories);
        draft.Products.push(product);
        return product;
      });
    },
    updateProduct(id, input, { expectedProduct } = {}) {
      return adminUpdate((draft) => {
        const product = productById(draft, id);
        if (expectedProduct && JSON.stringify(product) !== JSON.stringify(expectedProduct)) throw new DomainError('CONFLICT', 'El producto ha cambiado. Cierra el formulario y vuelve a abrirlo antes de guardar.');
        patch(product, input); validateProduct(product, draft.Categories); return product;
      });
    },
    deactivateProduct(id, { expectedProduct } = {}) { return adminUpdate((draft) => {
      const product = productById(draft, id);
      if (expectedProduct && JSON.stringify(product) !== JSON.stringify(expectedProduct)) throw new DomainError('CONFLICT', 'El producto ha cambiado. Revisa sus datos antes de desactivarlo.');
      product.active = false;
    }); },
    createCategory(input) {
      return adminUpdate((draft) => { const category = { id: crypto.randomUUID(), name: categoryName(input.name, draft) }; draft.Categories.push(category); return category; });
    },
    updateCategory(id, input) { return adminUpdate((draft) => { const category = categoryById(draft, id); category.name = categoryName(input.name, draft, id); return category; }); },
    deleteCategory(id) {
      return adminUpdate((draft) => {
        categoryById(draft, id);
        if (draft.Products.some((p) => p.categoryId === id)) throw new DomainError('RELATION', 'No puedes eliminar una categoría con productos asociados.');
        draft.Categories = draft.Categories.filter((c) => c.id !== id);
      });
    },
  };
}
