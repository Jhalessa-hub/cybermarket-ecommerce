import { useState } from 'react';
import Dialog from '../feedback/Dialog.jsx';
import OrderSummary from '../orders/OrderSummary.jsx';
import OrderTimeline from '../orders/OrderTimeline.jsx';
import { allowedOrderTransitions, orderStatuses } from '../../utils/orderStatus.js';
import { errorMessage } from '../../utils/errorMessages.js';

export default function LogisticsEditor({ order, onSave }) {
  const transitions = allowedOrderTransitions(order);
  const [status, setStatus] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const requiresReason = ['cancelled', 'incident'].includes(status);
  function request(event) {
    event.preventDefault(); setError('');
    if (!transitions.includes(status)) { setError('Selecciona uno de los estados permitidos.'); return; }
    if ((requiresReason && !description.trim()) || description.length > 1000) { setError('Escribe un motivo de hasta 1000 caracteres.'); return; }
    setConfirming(true);
  }
  function save() {
    try { onSave({ status, description, expectedStatus: order.status, expectedRevision: order.statusRevision ?? 0, confirmed: true }); }
    catch (failure) { setError(errorMessage(failure)); setConfirming(false); }
  }
  return <div className="space-y-6"><p className="break-all font-mono text-xs text-ink-muted">Pedido {order.id}</p>
    <OrderTimeline order={order} />
    {transitions.length ? <form className="space-y-4 rounded-xl border border-white/15 p-5" onSubmit={request} noValidate>
      <h3 className="font-semibold">Actualizar estado</h3>
      <label className="block space-y-2 text-sm"><span>Nuevo estado</span><select className="form-input" required value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Selecciona un estado</option>{transitions.map((next) => <option key={next} value={next}>{order.status === 'incident' && next !== 'cancelled' ? `Retomar en ${orderStatuses[next].label}` : orderStatuses[next].label}</option>)}</select></label>
      <label className="block space-y-2 text-sm"><span>{requiresReason ? 'Motivo (obligatorio)' : 'Nota del cambio (opcional)'}</span><textarea className="form-input min-h-24" required={requiresReason} maxLength={1000} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
      <p className="text-xs text-ink-muted">La nota será visible en el seguimiento del Cliente. No introduzcas datos sensibles.</p>
      {error && <p role="alert" className="form-error">{error}</p>}
      <button type="submit" className="button-primary">Actualizar estado</button>
    </form> : <p className="rounded-xl border border-white/10 p-5 text-sm text-ink-muted">Este pedido ha finalizado y no admite más cambios de estado.</p>}
    <OrderSummary order={order} />
    {confirming && <Dialog title="Confirmar cambio de estado" onClose={() => setConfirming(false)}><div className="space-y-4"><p className="text-sm">El pedido pasará de <strong>{orderStatuses[order.status].label}</strong> a <strong>{orderStatuses[status].label}</strong>.</p>{description.trim() && <p className="break-words text-sm text-ink-muted">Motivo o nota: {description.trim()}</p>}<p className="text-xs leading-relaxed text-ink-muted">El cambio quedará registrado con su fecha en el historial del pedido y será visible para el cliente.{status === 'cancelled' && ' La cancelación no incluye el reembolso ni la reposición automática del inventario.'}</p><div className="flex flex-wrap gap-3"><button className="button-secondary" onClick={() => setConfirming(false)}>Volver</button><button className="button-primary" onClick={save}>Confirmar cambio</button></div></div></Dialog>}
  </div>;
}
