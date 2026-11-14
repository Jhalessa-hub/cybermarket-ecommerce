import { MapPin, ShoppingBag } from 'lucide-react';
import ProductImage from '../catalog/ProductImage.jsx';
import { formatMoney } from '../../utils/currency.js';

export default function OrderSummary({ order }) {
  const address = order.shippingAddress;
  return <section className="panel space-y-6" aria-labelledby="order-summary-heading">
    <h2 id="order-summary-heading" className="flex items-center gap-2 text-xl font-semibold"><ShoppingBag size={20} aria-hidden="true" />Resumen del pedido</h2>
    <ul className="divide-y divide-white/10">{order.lines.map((line) => <li key={line.productId} className="flex items-start gap-3 py-4 first:pt-0">
      <ProductImage product={{ id: line.productId, name: line.name, categoryId: line.productId.split('-')[0] }} className="h-16 w-16 shrink-0" />
      <div className="min-w-0 flex-1"><p className="break-words text-sm font-medium">{line.name}</p><p className="mt-2 text-xs text-ink-muted">{line.quantity} × {formatMoney(line.priceCents)}</p></div><p className="shrink-0 text-sm font-semibold">{formatMoney(line.quantity * line.priceCents)}</p>
    </li>)}</ul>
    <dl className="border-t border-white/10 pt-5"><div className="flex flex-wrap justify-between gap-3 text-lg font-bold"><dt>Total del pedido</dt><dd>{formatMoney(order.totalCents)}</dd></div></dl>
    <section className="border-t border-white/10 pt-5" aria-label="Datos de envío del pedido"><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><MapPin size={17} aria-hidden="true" />Enviar a</h3><address className="space-y-1 break-words text-sm not-italic text-ink-muted"><p className="font-medium text-ink-primary">{address.recipient}</p><p>{address.line1}</p><p>{address.city}, {address.region} · {address.postalCode}</p><p>{address.country}</p></address>{order.contactPhone && <p className="mt-3 text-sm text-ink-muted">Contacto: {order.contactPhone}</p>}<p className="mt-3 text-xs text-ink-muted">Dirección e importes guardados al realizar la compra.</p></section>
  </section>;
}
