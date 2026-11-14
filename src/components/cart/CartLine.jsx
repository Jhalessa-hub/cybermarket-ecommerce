import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart.js';
import { formatMoney } from '../../utils/currency.js';
import ProductImage from '../catalog/ProductImage.jsx';

export default function CartLine({ line }) {
  const cart = useCart();
  const product = line.product;
  return <article className="flex gap-3 border-b border-white/10 py-5">
    <ProductImage product={product} className="h-24 w-24 shrink-0 [&_figcaption]:hidden" />
    <div className="min-w-0 flex-1 space-y-2">
      <h3 className="text-sm font-medium leading-snug">{product.name}</h3>
      <p className="text-xs text-ink-muted">{formatMoney(product.priceCents)} por unidad</p>
      <p className="text-sm font-bold">{formatMoney(line.lineTotalCents)}</p>
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center rounded-lg border border-white/15">
          <button className="icon-button !p-2" aria-label={`Reducir cantidad de ${product.name}`} disabled={line.quantity <= 1} onClick={() => cart.setQuantity(product.id, line.quantity - 1)}><Minus size={14} aria-hidden="true" /></button>
          <span className="w-7 text-center text-sm" aria-label={`Cantidad de ${product.name}`}>{line.quantity}</span>
          <button className="icon-button !p-2" aria-label={`Aumentar cantidad de ${product.name}`} disabled={line.quantity >= product.stock} title={`Máximo disponible: ${product.stock}`} onClick={() => cart.setQuantity(product.id, line.quantity + 1)}><Plus size={14} aria-hidden="true" /></button>
        </div>
        <button className="icon-button hover:!text-red-300" aria-label={`Eliminar ${product.name} del carrito`} onClick={() => cart.remove(product.id)}><Trash2 size={17} aria-hidden="true" /></button>
      </div>
      {line.quantity >= product.stock && <p className="text-xs text-orange-300">Máximo disponible: {product.stock} unidades.</p>}
    </div>
  </article>;
}
