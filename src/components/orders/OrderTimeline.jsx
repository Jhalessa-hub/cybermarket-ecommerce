import { Check, CircleCheck, Clock3, CreditCard, PackageCheck, TriangleAlert, Truck, X } from 'lucide-react';
import { buildOrderTimeline, orderStages, orderStatuses } from '../../utils/orderStatus.js';
import { formatOrderDate, hasValidDate } from '../../utils/dates.js';

const icons = { pending: Clock3, paid: CreditCard, shipped: Truck, delivered: PackageCheck, cancelled: X, incident: TriangleAlert };

export default function OrderTimeline({ order }) {
  const { current, history, future } = buildOrderTimeline(order);
  const alternative = ['cancelled', 'incident'].includes(order.status);
  const color = order.status === 'cancelled' ? 'text-red-300' : order.status === 'incident' ? 'text-brand-orange' : 'text-emerald-300';
  const nodeColor = order.status === 'cancelled' ? 'border-red-400/40 bg-red-400/10' : order.status === 'incident' ? 'border-brand-orange/40 bg-brand-orange/10' : 'border-emerald-400/40 bg-emerald-400/10';
  const noticeColor = order.status === 'cancelled' ? 'border-red-400/25' : 'border-brand-orange/25';
  return <section className="panel space-y-6" aria-labelledby="timeline-heading">
    <div><h2 id="timeline-heading" className="text-xl font-semibold">Seguimiento</h2><p className="mt-2 text-xs text-ink-muted">El avance más reciente aparece arriba.</p></div>
    <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">Estado actual: {orderStatuses[order.status]?.label ?? 'No disponible'}</p>
    {alternative && <div className={`rounded-xl border p-4 text-sm ${noticeColor} ${color}`}><p className="font-semibold">{order.status === 'cancelled' ? 'Pedido cancelado' : 'Seguimiento en pausa'}</p><p className="mt-2 leading-relaxed">{orderStatuses[order.status].description}</p></div>}
    <ol aria-label="Avances del pedido, más reciente primero" tabIndex={0} className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow">
      {[current, ...history].map((event, index, events) => {
        const active = index === 0;
        const Icon = icons[event.status] ?? Clock3;
        return <li key={`${event.status}-${index}`} aria-current={active ? 'step' : undefined} className={`relative flex gap-4 pb-7 last:pb-0 ${active ? color : 'text-ink-muted'}`}>
          {index < events.length - 1 && <span className="absolute bottom-0 left-[19px] top-10 w-px bg-white/15" aria-hidden="true" />}
          <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${active ? nodeColor : 'border-white/15 bg-white/5'}`}><Icon size={19} aria-hidden="true" /></span>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h3 className="font-semibold">{orderStatuses[event.status]?.label ?? 'Estado no disponible'}</h3><span className="inline-flex items-center gap-1 text-xs">{!active && <Check size={12} aria-hidden="true" />}{active ? 'Estado actual' : orderStages.includes(event.status) ? 'Completado' : 'Registrado'}</span></div>
            {hasValidDate(event.createdAt) ? <time dateTime={event.createdAt} className="mt-1 block text-xs text-ink-muted">{formatOrderDate(event.createdAt)}</time> : <p className="mt-1 text-xs text-ink-muted">Fecha no registrada</p>}
            {active && !alternative && <p className="mt-2 text-sm leading-relaxed text-ink-muted">{orderStatuses[event.status]?.description}</p>}
            {event.description && <p className="mt-2 break-words text-sm leading-relaxed text-ink-muted">{event.description}</p>}
          </div>
        </li>;
      })}
    </ol>
    {order.status === 'delivered' && <p className="flex items-center gap-2 text-sm text-emerald-300"><CircleCheck size={17} aria-hidden="true" />Proceso completado</p>}
    {future.length > 0 && <div className="border-t border-white/10 pt-5"><h3 className="text-xs font-medium uppercase tracking-widest text-ink-muted">Próximas etapas</h3><ol aria-label="Etapas por completar" className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-xs text-ink-muted">{future.map((status) => <li key={status} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full border border-white/30" aria-hidden="true" />{orderStatuses[status].label} · Por completar</li>)}</ol></div>}
    <p className="border-t border-white/10 pt-4 text-xs leading-relaxed text-ink-muted">Flujo previsto: Pendiente → Pagado → Enviado → Entregado. Seguimiento de demostración local, sin conexión con transportistas ni fechas de entrega estimadas.</p>
  </section>;
}
