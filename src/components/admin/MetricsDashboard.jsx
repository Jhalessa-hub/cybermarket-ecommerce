import { Link } from 'react-router-dom';
import { ArrowUpRight, Boxes, CircleDollarSign, Package, TriangleAlert, Users } from 'lucide-react';
import LowStockAlert from './LowStockAlert.jsx';
import { formatMoney } from '../../utils/currency.js';
import { orderStatuses } from '../../utils/orderStatus.js';
import { paths } from '../../routes/routePaths.js';

export default function MetricsDashboard({ metrics }) {
  const cards = [
    ['Productos activos', metrics.activeProducts, Boxes, 'Disponibles en el catálogo'],
    ['Unidades en inventario', metrics.stockUnits, Boxes, 'Stock actual de productos activos'],
    ['Stock bajo', metrics.lowStockProducts.length, TriangleAlert, `${metrics.soldOutProducts} agotados · Solo productos activos`],
    ['Pedidos registrados', metrics.orderCount, Package, 'Todos los estados'],
    ['Clientes registrados', metrics.customers, Users, 'Cuentas Cliente del navegador'],
    ['Ventas simuladas', formatMoney(metrics.salesCents), CircleDollarSign, 'Importe de pedidos no cancelados'],
  ];
  return <div className="space-y-7">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, Icon, note]) => <section key={label} aria-label={label} className="rounded-2xl border border-white/10 bg-surface p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-sm text-ink-muted">{label}</h2><Icon size={20} className="shrink-0 text-brand-orange" aria-hidden="true" /></div><p className="mt-5 break-words text-3xl font-bold">{value}</p><p className="mt-3 text-xs text-ink-muted">{note}</p></section>)}</div>
    <p className="text-xs leading-relaxed text-ink-muted">Periodo: todo el historial local. Ventas simuladas = suma de pedidos registrados salvo Cancelado, incluidos Pendiente e Incidencia; no son ingresos cobrados.</p>
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <section className="rounded-2xl border border-white/10 bg-surface p-5"><h2 className="text-lg font-semibold">Pedidos por estado</h2>{metrics.orderCount ? <dl className="mt-5 divide-y divide-white/10">{Object.entries(orderStatuses).map(([status, value]) => <div key={status} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-ink-muted">{value.label}</dt><dd className="font-semibold">{metrics.ordersByStatus[status]}</dd></div>)}</dl> : <p className="py-8 text-sm text-ink-muted">Aún no hay pedidos registrados.</p>}<Link className="mt-4 inline-flex items-center gap-2 text-sm text-brand-yellow" to={paths.logistics}>Abrir logística<ArrowUpRight size={16} aria-hidden="true" /></Link></section>
      <section className="rounded-2xl border border-white/10 bg-surface p-5"><h2 className="text-lg font-semibold">Inventario que requiere atención</h2><p className="mt-2 text-xs text-ink-muted">Productos activos de 0 a 4 unidades · Menor stock primero</p>{metrics.lowStockProducts.length ? <ul className="mt-4 max-h-96 divide-y divide-white/10 overflow-y-auto">{metrics.lowStockProducts.slice(0, 8).map((product) => <li key={product.id} className="space-y-2 py-3"><p className="break-words text-sm">{product.name}</p><LowStockAlert stock={product.stock} /></li>)}</ul> : <p className="py-8 text-sm text-ink-muted">No hay productos activos con stock bajo.</p>}{metrics.lowStockProducts.length > 8 && <p className="mt-3 text-xs text-ink-muted">Y {metrics.lowStockProducts.length - 8} productos más.</p>}<Link className="mt-4 inline-flex items-center gap-2 text-sm text-brand-yellow" to={`${paths.products}?stock=low&visibility=active`}>Revisar inventario<ArrowUpRight size={16} aria-hidden="true" /></Link></section>
    </div>
    {metrics.customers === 0 && <p className="text-sm text-ink-muted">Todavía no hay clientes registrados.</p>}
  </div>;
}
