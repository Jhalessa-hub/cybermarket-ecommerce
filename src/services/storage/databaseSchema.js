import { DomainError, isRecord, isText, isEmail, validateAddress, validateProduct, validateOrder, validateProfile, validateAvatar } from '../../utils/validation.js';

export const DATABASE_KEY = 'cybermarket:db:v1';
export const CART_KEY = 'cybermarket:cart:v1';
export const SESSION_KEY = 'cybermarket_session';
export const SHARED_COLLECTION_KEYS = Object.freeze({ Products: 'cybermarket_products', Orders: 'cybermarket_orders', Customers: 'cybermarket_customers' });
export const DATABASE_VERSION = 1;
export const ADMIN_EMAIL = 'admin@cybermarket.com';

function requireCondition(condition) {
  if (!condition) throw new DomainError('SCHEMA', 'Los datos locales no tienen un formato compatible. No se han borrado.');
}

function uniqueIds(items) {
  requireCondition(items.every((item) => isRecord(item) && isText(item.id)));
  requireCondition(new Set(items.map((item) => item.id)).size === items.length);
}

export function validateDatabase(db) {
  requireCondition(isRecord(db) && db.version === DATABASE_VERSION && Number.isSafeInteger(db.revision) && db.revision >= 0);
  for (const name of ['Products', 'Categories', 'Customers', 'Orders']) {
    requireCondition(Array.isArray(db[name]));
    uniqueIds(db[name]);
  }
  requireCondition(db.Categories.every((category) => isText(category.name)));
  db.Products.forEach((product) => validateProduct(product, db.Categories));
  const emails = new Set();
  for (const customer of db.Customers) {
    requireCondition(customer.role === 'customer' && isEmail(customer.email) && customer.email === customer.email.trim().toLowerCase());
    requireCondition(customer.email !== ADMIN_EMAIL && !emails.has(customer.email));
    emails.add(customer.email);
    validateProfile(customer);
    const credential = customer.credential;
    requireCondition(isRecord(credential) && credential.algorithm === 'PBKDF2-SHA256' && credential.iterations === 600000 && /^[a-f0-9]{32}$/.test(credential.salt) && /^[a-f0-9]{64}$/.test(credential.hash));
    requireCondition(!('password' in customer) && Array.isArray(customer.addresses));
    uniqueIds(customer.addresses);
    customer.addresses.forEach(validateAddress);
    validateAvatar(customer.avatar);
    for (const field of ['selectedAddressId', 'defaultAddressId']) {
      requireCondition(customer[field] == null || customer.addresses.some((address) => address.id === customer[field]));
    }
  }
  for (const order of db.Orders) {
    validateOrder(order);
    requireCondition(db.Customers.some((customer) => customer.id === order.customerId));
    requireCondition(order.lines.every((line) => db.Products.some((product) => product.id === line.productId)));
  }
  validateSession(db.Session, db.Customers);
  return db;
}

export function validateSession(session, customers) {
  if (session !== null) {
    requireCondition(isRecord(session) && isText(session.createdAt) && !('password' in session) && !('credential' in session));
    requireCondition(
      (session.role === 'admin' && session.userId === 'admin' && session.email === ADMIN_EMAIL) ||
      (session.role === 'customer' && customers.some((customer) => customer.id === session.userId && customer.email === session.email)),
    );
  }
  return session;
}

// Única migración conocida: envelope v0 con las mismas tablas y sin contador de revisión.
// No se adivinan esquemas desconocidos ni se convierten contraseñas en claro automáticamente.
export function migrateDatabase(value) {
  if (!isRecord(value)) throw new DomainError('SCHEMA', 'Los datos locales no son válidos.');
  if (value.version === 0) return validateDatabase({ ...value, version: 1, revision: value.revision ?? 0 });
  return validateDatabase(value);
}

export function validateCart(cart) {
  requireCondition(isRecord(cart) && cart.version === 1 && Array.isArray(cart.lines));
  requireCondition(cart.checkoutToken === undefined || isText(cart.checkoutToken));
  requireCondition(cart.lines.every((line) => isText(line.productId) && Number.isSafeInteger(line.quantity) && line.quantity > 0));
  requireCondition(new Set(cart.lines.map((line) => line.productId)).size === cart.lines.length);
  requireCondition(Number.isSafeInteger(cart.lines.reduce((count, line) => count + line.quantity, 0)));
  return cart;
}
