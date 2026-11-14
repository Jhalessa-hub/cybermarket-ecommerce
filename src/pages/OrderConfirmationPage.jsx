import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, MapPin, PackageCheck } from 'lucide-react';
import { useShop } from '../hooks/useShop.js';
import NotFoundPage from './NotFoundPage.jsx';
import { formatMoney } from '../utils/currency.js';
import { paths } from '../routes/routePaths.js';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const { orders } = useShop();
  const order = orders.find((item) => item.id === orderId);
  if (!order) return <NotFoundPage />;
  const address = order.shippingAddress;
  return <div className="mx-auto max-w-3xl space-y-7">
    <header className="space-y-4 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-emerald-300"><Check size={40} aria-hidden="true" /></div>
      <p className="eyebrow">GRACIAS POR ELEGIR CYBERMARKET</p>
      <h1 className="text-3xl font-bold">¡Tu pedido está confirmado!</h1>
      <p className="text-sm text-ink-muted">Lo hemos guardado correctamente en este navegador.</p>
    </header>
    <section className="panel space-y-6" aria-label="Confirmación de compra">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div className="min-w-0"><h2 className="text-xs uppercase tracking-widest text-ink-muted">Número de pedido</h2><p className="mt-2 break-all font-mono text-sm text-brand-yellow">{order.id}</p><p className="mt-2 text-xs text-ink-muted">{new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.createdAt))}</p></div>
        <p className="flex items-center gap-2 rounded-full bg-brand-orange/10 px-3 py-2 text-xs text-brand-orange"><PackageCheck size={16} aria-hidden="true" />Pendiente</p>
      </div>
      <ul className="space-y-4">{order.lines.map((line) => <li key={line.productId} className="flex items-start justify-between gap-4 text-sm"><div className="min-w-0"><p className="break-words font-medium">{line.name}</p><p className="mt-1 text-xs text-ink-muted">{line.quantity} × {formatMoney(line.priceCents)}</p></div><p className="shrink-0 font-semibold">{formatMoney(line.quantity * line.priceCents)}</p></li>)}</ul>
      <div className="flex justify-between gap-3 border-t border-white/10 pt-5 text-xl font-bold"><span>Total del pedido</span><span>{formatMoney(order.totalCents)}</span></div>
      <div className="rounded-xl border border-white/10 bg-canvas/40 p-5"><h2 className="mb-3 flex items-center gap-2 font-semibold"><MapPin size={18} aria-hidden="true" />Dirección de envío</h2><p className="break-words text-sm">{address.recipient}<br />{address.line1}<br />{address.city}, {address.region} · {address.postalCode}<br />{address.country}</p>{order.contactPhone && <p className="mt-3 text-sm text-ink-muted">Contacto: {order.contactPhone}</p>}</div>
      <p className="text-xs leading-relaxed text-ink-muted">Modo demostración · Pedido registrado en estado Pendiente. El pago es simulado: no se ha realizado ningún cobro ni se ha solicitado un envío real.</p>
    </section>
    <div className="flex flex-wrap justify-center gap-4"><Link to={paths.store} className="button-primary inline-flex items-center gap-2">Seguir comprando<ArrowRight size={17} aria-hidden="true" /></Link><Link to={paths.orders} className="button-secondary">Ir a Mis Compras</Link></div>
  </div>;
}
