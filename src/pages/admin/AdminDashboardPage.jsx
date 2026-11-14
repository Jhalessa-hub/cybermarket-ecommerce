import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useShop } from '../../hooks/useShop.js';
import AdminHeading from '../../components/admin/AdminHeading.jsx';
import MetricsDashboard from '../../components/admin/MetricsDashboard.jsx';

export default function AdminDashboardPage() {
  const { metrics, metricsError, retry, dataRevision } = useShop();
  useEffect(() => { retry(); }, [retry]);
  return <div className="space-y-7"><AdminHeading title="Dashboard" description="Consulta los pedidos, el inventario y la actividad de tus clientes en un solo lugar." action={<button className="button-secondary inline-flex items-center gap-2" onClick={retry}><RefreshCw size={17} aria-hidden="true" />Actualizar datos</button>} />
    <div className="space-y-2 rounded-xl border border-white/10 bg-surface/40 p-4 text-xs leading-relaxed text-ink-muted"><p>Sitio: <code className="break-all text-ink-primary">{window.location.origin}</code> · Versión de datos {dataRevision}</p><p>Los cambios en productos, pedidos y clientes se reflejan automáticamente en las vistas abiertas de la tienda.</p></div>
    {metricsError ? <p role="alert" className="form-error">{metricsError.message}</p> : metrics ? <MetricsDashboard metrics={metrics} /> : <p role="status">Preparando métricas…</p>}
    {metrics?.orderCount === 0 && <p className="text-sm text-ink-muted">Los pedidos aparecerán aquí a medida que tus clientes confirmen sus compras.</p>}
  </div>;
}
