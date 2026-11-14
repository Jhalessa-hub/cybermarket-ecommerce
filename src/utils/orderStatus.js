import { hasValidDate } from './dates.js';

export const orderStages = ['pending', 'paid', 'shipped', 'delivered'];
export const orderStatuses = {
  pending: { label: 'Pendiente', description: 'Tu pedido está registrado y pendiente de procesamiento.' },
  paid: { label: 'Pagado', description: 'El pago de tu pedido figura como completado.' },
  shipped: { label: 'Enviado', description: 'Tu pedido está en camino a la dirección indicada.' },
  delivered: { label: 'Entregado', description: 'Tu pedido figura como entregado. Gracias por elegir CyberMarket.' },
  cancelled: { label: 'Cancelado', description: 'El pedido se ha cancelado. El proceso no continuará.' },
  incident: { label: 'Incidencia', description: 'Se ha registrado una incidencia. El seguimiento está en pausa.' },
};

export function incidentResumeStatus(order) {
  const normal = orderStages.slice(0, -1);
  if (normal.includes(order.resumeStatus)) return order.resumeStatus;
  return [...(Array.isArray(order.events) ? order.events : [])].reverse().find((event) => normal.includes(event?.status))?.status ?? 'pending';
}

export function allowedOrderTransitions(order) {
  if (['delivered', 'cancelled'].includes(order.status)) return [];
  if (order.status === 'incident') return [incidentResumeStatus(order), 'cancelled'];
  const index = orderStages.indexOf(order.status);
  return index < 0 ? [] : [orderStages[index + 1], 'cancelled', 'incident'];
}

export function buildOrderTimeline(order) {
  const index = orderStages.indexOf(order.status);
  const records = (Array.isArray(order.events) ? order.events : [])
    .filter((event) => event && orderStatuses[event.status])
    .map((event, position) => ({ status: event.status, createdAt: event.createdAt, description: typeof event.description === 'string' ? event.description : '', position }))
    .sort((a, b) => hasValidDate(a.createdAt) && hasValidDate(b.createdAt)
      ? Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.position - a.position
      : b.position - a.position);
  const current = records.find((event) => event.status === order.status) ?? {
    status: order.status, createdAt: order.status === 'pending' ? order.createdAt : null,
  };
  const history = records.filter((event) => event !== current);
  // Un estado normal implica sus etapas previas, pero no conocemos sus fechas si faltan eventos.
  const completed = index >= 0 ? orderStages.slice(0, index).reverse() : ['pending'];
  for (const status of completed) {
    if (!history.some((event) => event.status === status)) {
      const event = { status, createdAt: status === 'pending' ? order.createdAt : null };
      const beforeEarlierStage = history.findIndex((item) => orderStages.includes(item.status) && orderStages.indexOf(item.status) < orderStages.indexOf(status));
      if (beforeEarlierStage < 0) history.push(event);
      else history.splice(beforeEarlierStage, 0, event);
    }
  }
  return { current, history, future: index >= 0 ? orderStages.slice(index + 1) : [] };
}
