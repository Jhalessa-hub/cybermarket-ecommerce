export function hasValidDate(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

export function formatOrderDate(value) {
  return hasValidDate(value)
    ? new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : 'Fecha no registrada';
}
