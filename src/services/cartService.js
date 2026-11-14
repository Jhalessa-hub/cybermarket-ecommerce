import { DomainError, isMoney, validateCartLine } from '../utils/validation.js';

export function reconcileCart(lines, products) {
  const adjustments = [];
  const next = [];
  for (const line of lines) {
    const product = products.find((p) => p.id === line.productId);
    if (!product?.active || product.stock === 0) {
      adjustments.push(`${product?.name ?? 'Un artículo'} se retiró porque ya no está disponible.`);
    } else if (line.quantity > product.stock) {
      next.push({ ...line, quantity: product.stock });
      adjustments.push(`${product.name}: cantidad ajustada a ${product.stock} unidades disponibles.`);
    } else next.push(line);
  }
  return { lines: next, adjustments };
}

export function summarizeCart(lines, products) {
  const result = lines.map((line) => {
    const product = products.find((p) => p.id === line.productId);
    return { ...line, product: product ?? null, lineTotalCents: product ? product.priceCents * line.quantity : 0 };
  });
  const totalCents = result.reduce((sum, line) => sum + line.lineTotalCents, 0);
  if (!isMoney(totalCents)) throw new DomainError('TOTAL', 'El importe supera el límite admitido por la demo.');
  return { lines: result, totalCents, itemCount: lines.reduce((sum, line) => sum + line.quantity, 0), adjustments: reconcileCart(lines, products).adjustments };
}

export function createCartService(database) {
  function shopper(data) {
    if (data.Session?.role === 'admin') throw new DomainError('FORBIDDEN', 'El carrito está disponible para visitantes y Clientes, no para Admin.');
  }
  function quantity(value) {
    if (!Number.isSafeInteger(value) || value < 1) throw new DomainError('QUANTITY', 'La cantidad debe ser un entero de al menos una unidad.');
  }
  return {
    add(productId, amount = 1) {
      return database.updateCart((cart, data) => {
        shopper(data); quantity(amount);
        const current = cart.lines.find((line) => line.productId === productId);
        const line = { productId, quantity: (current?.quantity ?? 0) + amount };
        validateCartLine(line, data.Products.find((p) => p.id === productId));
        if (current) current.quantity = line.quantity;
        else cart.lines.push(line);
        summarizeCart(cart.lines, data.Products);
      });
    },
    setQuantity(productId, value) {
      return database.updateCart((cart, data) => {
        shopper(data); quantity(value);
        const line = cart.lines.find((item) => item.productId === productId);
        if (!line) throw new DomainError('NOT_FOUND', 'Ese artículo no está en tu carrito.');
        validateCartLine({ productId, quantity: value }, data.Products.find((p) => p.id === productId));
        line.quantity = value;
        summarizeCart(cart.lines, data.Products);
      });
    },
    remove(productId) {
      return database.updateCart((cart, data) => { shopper(data); cart.lines = cart.lines.filter((line) => line.productId !== productId); });
    },
    reconcile() {
      return database.updateCart((cart, data) => {
        const result = reconcileCart(cart.lines, data.Products);
        cart.lines = result.lines;
        return result.adjustments;
      });
    },
  };
}
