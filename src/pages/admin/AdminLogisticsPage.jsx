import { useState } from 'react';
import { useShop } from '../../hooks/useShop.js';
import AdminHeading from '../../components/admin/AdminHeading.jsx';
import LogisticsQueue from '../../components/admin/LogisticsQueue.jsx';
import LogisticsEditor from '../../components/admin/LogisticsEditor.jsx';
import FormField from '../../components/auth/FormField.jsx';
import Dialog from '../../components/feedback/Dialog.jsx';
import { orderStatuses } from '../../utils/orderStatus.js';

export default function AdminLogisticsPage() {
  const shop = useShop();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const orders = shop.orders.filter((order) => {
    const customer = shop.customers.find((item) => item.id === order.customerId);
    return (status === 'all' || order.status === status) && `${order.id} ${customer?.name ?? ''} ${customer?.email ?? ''} ${order.shippingAddress.recipient}`.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es'));
  }).sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
  function save(input) {
    try { const result = shop.updateOrderStatus(selected.id, input); setSelected(result); shop.notify('Estado actualizado correctamente.', 'success'); }
    catch (failure) { if (failure.code === 'CONFLICT') shop.retry(); throw failure; }
  }
  return <div className="space-y-7"><AdminHeading title="Logística" description="Gestiona el estado de los pedidos y consulta el historial de cada actualización." />
    <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_auto]"><FormField label="Buscar pedidos" type="search" value={query} onChange={(event) => setQuery(event.target.value)} hint="Por número de pedido, nombre o email del Cliente." /><label className="space-y-2 text-sm"><span className="block">Estado del pedido</span><select className="form-input" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos los estados</option>{Object.entries(orderStatuses).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label></div>
    <p className="text-xs text-ink-muted">{orders.length} pedidos encontrados</p><LogisticsQueue orders={orders} customers={shop.customers} onManage={setSelected} />
    {selected && <Dialog title="Gestionar pedido" variant="wide" onClose={() => setSelected(null)}><LogisticsEditor key={`${selected.id}-${selected.statusRevision ?? 0}`} order={selected} onSave={save} /></Dialog>}
  </div>;
}
