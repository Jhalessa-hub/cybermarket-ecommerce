import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import ProductImage from '../catalog/ProductImage.jsx';
import { formatMoney } from '../../utils/currency.js';
import { paths } from '../../routes/routePaths.js';

export default function CheckoutSummary({ summary }) {
  return <aside className="panel order-first space-y-5 lg:sticky lg:top-28 lg:order-last" aria-label="Resumen de compra">
    <h2 className="flex items-center gap-2 text-lg font-semibold"><ShoppingBag size={20} aria-hidden="true" />Resumen de compra</h2>
    <p className="text-xs text-ink-muted">{summary.itemCount} {summary.itemCount === 1 ? 'artículo' : 'artículos'} · Precios vigentes en USD</p>
    <ul className="max-h-96 space-y-5 overflow-y-auto pr-1">
      {summary.lines.map((line) => <li key={line.productId} className="flex items-start gap-3">
        <ProductImage product={line.product} className="h-20 w-20 shrink-0" />
        <div className="min-w-0 flex-1"><p className="break-words text-sm font-medium">{line.product.name}</p><p className="mt-1 text-xs text-ink-muted">{line.quantity} × {formatMoney(line.product.priceCents)}</p><p className="mt-2 text-sm font-semibold">{formatMoney(line.lineTotalCents)}</p></div>
      </li>)}
    </ul>
    <dl className="space-y-3 border-t border-white/10 pt-5">
      <div className="flex justify-between text-sm text-ink-muted"><dt>Subtotal</dt><dd>{formatMoney(summary.totalCents)}</dd></div>
      <div className="flex justify-between gap-3 text-xl font-bold"><dt>Total</dt><dd>{formatMoney(summary.totalCents)}</dd></div>
    </dl>
    <p className="text-xs leading-relaxed text-ink-muted">Sin cargos adicionales de envío ni impuestos. Los precios y la disponibilidad se verifican al confirmar el pedido.</p>
    <Link className="inline-block text-sm text-brand-yellow underline underline-offset-4" to={paths.cart}>Editar mi carrito</Link>
  </aside>;
}
