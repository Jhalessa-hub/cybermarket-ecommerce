export const paths = Object.freeze({
  store: '/', login: '/login', register: '/register', profile: '/profile',
  search: '/search', catalog: '/catalog',
  checkout: '/checkout', cart: '/cart', orders: '/my-orders',
  confirmation: (orderId) => `/checkout/confirmation/${encodeURIComponent(orderId)}`,
  order: (orderId) => `/my-orders/${encodeURIComponent(orderId)}`,
  admin: '/admin', products: '/admin/products', logistics: '/admin/logistics', customers: '/admin/customers',
});

// Nunca utilizar un destino de retorno arbitrario como href o redirección externa.
export function safeReturnTo(value, role) {
  if (role === 'admin') {
    return [paths.admin, paths.products, paths.logistics, paths.customers].includes(value) ? value : paths.admin;
  }
  if (typeof value !== 'string') return paths.store;
  if (value.length <= 4096 && /^\/(search|catalog)(\?[^#\r\n]*)?$/.test(value)) return value;
  if ([paths.store, paths.checkout, paths.profile, paths.orders, paths.cart].includes(value)) return value;
  if (/^\/(my-orders|products)\/[a-zA-Z0-9_-]+$/.test(value)) return value;
  if (/^\/checkout\/confirmation\/[a-zA-Z0-9_-]+$/.test(value)) return value;
  return paths.store;
}
