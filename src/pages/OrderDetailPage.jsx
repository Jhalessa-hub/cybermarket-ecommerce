import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useShop } from '../hooks/useShop.js';
import OrderTimeline from '../components/orders/OrderTimeline.jsx';
import OrderSummary from '../components/orders/OrderSummary.jsx';
import OrderStatusBadge from '../components/orders/OrderStatusBadge.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import { formatOrderDate, hasValidDate } from '../utils/dates.js';
import { paths } from '../routes/routePaths.js';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { orders, status, error, retry } = useShop();
  if (status === 'loading') return <p role="status" className="text-ink-muted">Cargando tu pedido…</p>;
  if (status === 'error') return <section role="alert" className="panel space-y-4"><h1 className="text-xl font-bold">No pudimos cargar tu pedido</h1><p className="text-ink-muted">{error?.message}</p><button className="button-secondary" onClick={retry}>Reintentar sin borrar datos</button></section>;
  const order = orders.find((item) => item.id === orderId);
  if (!order) return <NotFoundPage />;
  return <div className="mx-auto max-w-5xl space-y-7">
    <Link to={paths.orders} className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-white"><ArrowLeft size={16} aria-hidden="true" />Volver a Mis Compras</Link>
    <header className="space-y-3"><h1 className="text-3xl font-bold">Seguimiento de tu pedido</h1><div className="flex flex-wrap items-center gap-x-5 gap-y-3"><p className="break-all font-mono text-xs text-ink-muted">Pedido {order.id}</p><OrderStatusBadge status={order.status} /></div><p className="text-xs text-ink-muted">Realizado el {hasValidDate(order.createdAt) ? <time dateTime={order.createdAt}>{formatOrderDate(order.createdAt)}</time> : 'Fecha no registrada'}</p></header>
    <OrderTimeline order={order} />
    <OrderSummary order={order} />
    <Link to={paths.store} className="button-secondary inline-block">Seguir comprando</Link>
  </div>;
}
