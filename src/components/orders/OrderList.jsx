import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import ProductImage from '../catalog/ProductImage.jsx';
import OrderStatusBadge from './OrderStatusBadge.jsx';
import { formatMoney } from '../../utils/currency.js';
import { formatOrderDate, hasValidDate } from '../../utils/dates.js';
import { paths } from '../../routes/routePaths.js';

export default function OrderList({ orders }) {
  return <ul aria-label="Mis pedidos" className="space-y-4">
    {orders.map((order) => {
      const count = order.lines.reduce((sum, line) => sum + line.quantity, 0);
      return <li key={order.id}><article className="rounded-2xl border border-white/10 bg-surface p-5 sm:p-6" aria-label={`Pedido ${order.id}`}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs text-ink-muted">{hasValidDate(order.createdAt) ? <time dateTime={order.createdAt}>{formatOrderDate(order.createdAt)}</time> : 'Fecha no registrada'}</p><h2 className="mt-2 break-all font-mono text-xs text-ink-muted">Pedido {order.id}</h2></div><OrderStatusBadge status={order.status} /></div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-3"><div className="flex gap-2">{order.lines.slice(0, 3).map((line) => <ProductImage key={line.productId} product={{ id: line.productId, name: line.name, categoryId: line.productId.split('-')[0] }} className="h-14 w-14 shrink-0" />)}</div><p className="text-xs text-ink-muted">{count} {count === 1 ? 'artículo' : 'artículos'}{order.lines.length > 3 ? ` · +${order.lines.length - 3} productos` : ''}</p></div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3"><p className="text-lg font-semibold">{formatMoney(order.totalCents)}</p><Link className="inline-flex items-center gap-1.5 rounded-lg py-2 text-sm font-medium text-brand-yellow hover:underline" to={paths.order(order.id)} aria-label={`Ver seguimiento del pedido ${order.id}`}>Ver seguimiento<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
        </div>
      </article></li>;
    })}
  </ul>;
}
