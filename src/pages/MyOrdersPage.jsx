import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useShop } from '../hooks/useShop.js';
import OrderList from '../components/orders/OrderList.jsx';
import { paths } from '../routes/routePaths.js';

export default function MyOrdersPage() {
  const { orders, status, error, retry } = useShop();
  if (status === 'loading') return <p role="status" className="text-ink-muted">Cargando tus compras…</p>;
  if (status === 'error') return <section role="alert" className="panel space-y-4"><h1 className="text-xl font-bold">No pudimos cargar tus compras</h1><p className="text-ink-muted">{error?.message}</p><button className="button-secondary" onClick={retry}>Reintentar sin borrar datos</button></section>;
  return <div className="mx-auto max-w-5xl space-y-7">
    <header><p className="eyebrow">TUS PEDIDOS, EN UN SOLO LUGAR</p><h1 className="mt-3 text-3xl font-bold">Mis Compras</h1><p className="mt-3 text-sm text-ink-muted">Consulta tus compras y el último avance de cada pedido.</p></header>
    {orders.length ? <OrderList orders={orders} /> : <section className="rounded-2xl border border-dashed border-white/15 py-14 text-center"><ShoppingBag size={40} className="mx-auto mb-5 text-ink-muted" aria-hidden="true" /><h2 className="text-xl font-semibold">Aún no tienes compras</h2><p className="mx-auto mb-7 mt-3 max-w-sm px-4 text-sm text-ink-muted">Cuando confirmes tu primer pedido, podrás consultarlo aquí.</p><Link to={paths.store} className="button-primary inline-block">Explorar la tienda</Link></section>}
    <p className="text-xs leading-relaxed text-ink-muted">Consulta tus compras y sigue el estado de cada pedido desde aquí.</p>
  </div>;
}
