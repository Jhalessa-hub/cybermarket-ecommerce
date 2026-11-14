import { CircleAlert, TriangleAlert } from 'lucide-react';

export default function LowStockAlert({ stock }) {
  if (stock === 0) return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-300"><CircleAlert size={14} aria-hidden="true" />Agotado · 0</span>;
  if (stock <= 4) return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-orange"><TriangleAlert size={14} aria-hidden="true" />Stock bajo · {stock}</span>;
  return <span className="text-xs text-emerald-300">Disponible · {stock}</span>;
}
