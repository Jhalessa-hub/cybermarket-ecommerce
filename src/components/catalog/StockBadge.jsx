export default function StockBadge({ stock }) {
  const label = stock === 0 ? 'Agotado' : stock <= 4 ? 'Últimas unidades' : 'Disponible';
  return <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${stock === 0 ? 'text-red-300' : stock <= 4 ? 'text-orange-300' : 'text-emerald-300'}`}>
    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${stock === 0 ? 'bg-red-400' : stock <= 4 ? 'bg-orange-400' : 'bg-emerald-400'}`} />{label}
  </span>;
}
