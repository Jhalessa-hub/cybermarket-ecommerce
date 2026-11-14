import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useShop } from '../../hooks/useShop.js';
import AdminHeading from '../../components/admin/AdminHeading.jsx';
import MetricsDashboard from '../../components/admin/MetricsDashboard.jsx';

export default function AdminDashboardPage() {
  const { metrics, metricsError, retry, dataRevision } = useShop();
  useEffect(() => { retry(); }, [retry]);
  return <div className="space-y-7"><AdminHeading title="Dashboard" description="Ventas, pedidos, inventario y Clientes de la misma base local. Las compras confirmadas se reflejan aquí." action={<button className="button-secondary inline-flex items-center gap-2" onClick={retry}><RefreshCw size={17} aria-hidden="true" />Actualizar datos</button>} />
    <div className="space-y-2 rounded-xl border border-white/10 bg-surface/40 p-4 text-xs leading-relaxed text-ink-muted"><p>Origen de los datos: <code className="break-all text-ink-primary">{window.location.origin}</code> · Revisión {dataRevision}</p><p>Sesión independiente por pestaña. Puedes mantener Cliente y Admin abiertos en dos pestañas normales de esta misma dirección y perfil; productos, pedidos y Clientes se actualizan automáticamente. Otros orígenes o perfiles tienen bases distintas.</p></div>
    {metricsError ? <p role="alert" className="form-error">{metricsError.message}</p> : metrics ? <MetricsDashboard metrics={metrics} /> : <p role="status">Preparando métricas…</p>}
    {metrics?.orderCount === 0 && <p className="text-sm text-ink-muted">Si ya confirmaste una compra y no aparece aquí, verifica el origen indicado arriba. No es necesario borrar ni restablecer los datos.</p>}
  </div>;
}
