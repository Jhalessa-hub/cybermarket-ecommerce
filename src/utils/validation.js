export class DomainError extends Error {
  constructor(code, message, fields = {}) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.fields = fields;
  }
}

export const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
export const isText = (value) => typeof value === 'string' && value.trim().length > 0;
export const isEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const isMoney = (value) => Number.isSafeInteger(value) && value >= 0;
export const isStock = (value) => Number.isSafeInteger(value) && value >= 0;
export const normalizeEmail = (value) => typeof value === 'string' ? value.trim().toLowerCase() : '';

export function assertValid(fields) {
  if (Object.keys(fields).length) throw new DomainError('VALIDATION', 'Revisa los campos indicados.', fields);
}

export function validateRegistration({ name, email, password } = {}) {
  const fields = {};
  if (!isText(name) || name.trim().length > 100) fields.name = 'Introduce un nombre de hasta 100 caracteres.';
  if (!isEmail(normalizeEmail(email))) fields.email = 'Introduce un email válido.';
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) fields.password = 'Utiliza entre 8 y 128 caracteres.';
  assertValid(fields);
}

export function validateLogin({ email, password } = {}) {
  const fields = {};
  if (!isEmail(normalizeEmail(email))) fields.email = 'Introduce un email válido.';
  if (!isText(password)) fields.password = 'Introduce tu contraseña.';
  assertValid(fields);
}

export function validateProfile({ name, phone } = {}, { requirePhone = false } = {}) {
  const fields = {};
  if (!isText(name) || name.trim().length > 100) fields.name = 'Introduce un nombre válido.';
  if ((requirePhone || phone) && (typeof phone !== 'string' || !/^\+?[\d\s().-]{7,25}$/.test(phone))) fields.phone = 'Introduce un teléfono válido.';
  assertValid(fields);
}

export function validateAddress(address) {
  const fields = {};
  for (const key of ['recipient', 'line1', 'city', 'region', 'postalCode', 'country']) {
    if (!isText(address?.[key])) fields[key] = 'Campo requerido.';
  }
  assertValid(fields);
}

export function validateAvatar(avatar) {
  if (avatar == null) return;
  if (typeof avatar !== 'string' || avatar.length > 140000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(avatar)) {
    throw new DomainError('VALIDATION', 'Elige una foto JPG, PNG o WebP válida y pequeña.', { avatar: 'La foto debe ser local y ocupar menos de 100 KB una vez preparada.' });
  }
}

export function validateProduct(product, categories) {
  const fields = {};
  if (!isText(product?.name)) fields.name = 'Introduce un nombre.';
  if (!isText(product?.description)) fields.description = 'Introduce una descripción.';
  if (!categories.some((category) => category.id === product?.categoryId)) fields.categoryId = 'Selecciona una categoría válida.';
  if (!isMoney(product?.priceCents)) fields.priceCents = 'El precio debe ser un entero no negativo en centavos.';
  if (!isStock(product?.stock)) fields.stock = 'Las existencias deben ser un entero no negativo.';
  if (product?.currency !== 'USD') fields.currency = 'Los precios deben indicarse en USD.';
  if (typeof product?.active !== 'boolean') fields.active = 'Indica el estado del producto.';
  if (!isRecord(product?.specs)) fields.specs = 'Especificaciones inválidas.';
  if (product?.brand != null && typeof product.brand !== 'string') fields.brand = 'La marca debe ser texto.';
  if (product?.image != null && (typeof product.image !== 'string' || !/^(https:\/\/|\/(?!\/))/i.test(product.image))) fields.image = 'Usa una ruta local o una imagen HTTPS válida.';
  assertValid(fields);
}

export function validateCartLine(line, product) {
  if (!product?.active || line?.productId !== product.id || !Number.isSafeInteger(line?.quantity) || line.quantity < 1 || line.quantity > product.stock) {
    throw new DomainError('STOCK', 'Revisa la cantidad y disponibilidad del producto.');
  }
}

export function validateOrder(order) {
  if (!isRecord(order) || !isText(order.id) || !isText(order.customerId) || !isText(order.createdAt) || !isMoney(order.totalCents) || !Array.isArray(order.lines) || !order.lines.length) {
    throw new DomainError('VALIDATION', 'El pedido está incompleto.');
  }
  validateAddress(order.shippingAddress);
  for (const line of order.lines) {
    if (!isText(line.productId) || !isText(line.name) || !Number.isSafeInteger(line.quantity) || line.quantity < 1 || !isMoney(line.priceCents)) {
      throw new DomainError('VALIDATION', 'La línea del pedido es inválida.');
    }
  }
  const sum = order.lines.reduce((total, line) => total + line.quantity * line.priceCents, 0);
  if (!isMoney(sum) || sum !== order.totalCents) throw new DomainError('VALIDATION', 'El total del pedido no coincide.');
  if (!['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'incident'].includes(order.status)) {
    throw new DomainError('VALIDATION', 'Estado de pedido inválido.');
  }
}
