import { orderStatuses } from '../../utils/orderStatus.js';

export default function OrderStatusBadge({ status }) {
  const color = status === 'cancelled' ? 'bg-red-400/10 text-red-300' : status === 'incident' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-emerald-400/10 text-emerald-300';
  return <span className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${color}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{orderStatuses[status]?.label ?? 'Estado no disponible'}
  </span>;
}
