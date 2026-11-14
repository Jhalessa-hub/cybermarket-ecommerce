import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/useCart.js';
import { formatMoney } from '../../utils/currency.js';
import ProductImage from './ProductImage.jsx';
import StockBadge from './StockBadge.jsx';

export default function ProductCard({ product, onDetail }) {
  const cart = useCart();
  const inCart = cart.lines.find((line) => line.productId === product.id)?.quantity ?? 0;
  const maximum = inCart >= product.stock;
  return <article className="group min-w-0 rounded-2xl border border-transparent p-2 transition-colors hover:border-white/10 hover:bg-white/[.02]">
    <div className="relative">
      <a href={`/products/${product.id}`} onClick={(event) => { event.preventDefault(); onDetail(product.id); }} aria-label={`Ver detalle de ${product.name}`} className="block rounded-xl"><ProductImage product={product} className="aspect-[1.12]" /></a>
      <button className="absolute bottom-3 right-3 rounded-full border border-slate-200 bg-white p-2.5 text-slate-900 shadow-md transition-colors hover:bg-brand-yellow disabled:opacity-50"
        disabled={product.stock === 0 || maximum} aria-label={`Añadir ${product.name} al carrito`} title={product.stock === 0 ? 'Agotado' : maximum ? `Máximo disponible: ${product.stock}` : 'Añadir al carrito'} onClick={() => cart.add(product.id)}>
        <ShoppingCart size={20} aria-hidden="true" />
      </button>
    </div>
    <div className="space-y-2 px-1 pb-2 pt-3">
      <h2 className="min-h-10 text-sm leading-5"><a href={`/products/${product.id}`} onClick={(event) => { event.preventDefault(); onDetail(product.id); }} className="line-clamp-2 hover:text-brand-yellow" title={product.name}>{product.name}</a></h2>
      <p className="text-xl font-bold tracking-tight">{formatMoney(product.priceCents)}</p>
      <StockBadge stock={product.stock} />
    </div>
  </article>;
}
