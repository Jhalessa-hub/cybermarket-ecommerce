import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/useCart.js';
import Dialog from '../feedback/Dialog.jsx';
import ProductImage from './ProductImage.jsx';
import StockBadge from './StockBadge.jsx';
import { formatMoney } from '../../utils/currency.js';
import { specLabels } from '../../utils/catalog.js';
import { getCatalogPhoto } from '../../utils/catalogPhotos.js';

export default function ProductDetailModal({ product, onClose }) {
  const cart = useCart();
  const photo = !product.image ? getCatalogPhoto(product) : null;
  const quantity = cart.lines.find((line) => line.productId === product.id)?.quantity ?? 0;
  const entries = Object.entries(product.specs ?? {}).filter(([, value]) => value !== null && value !== undefined && value !== '');
  return <Dialog title="Detalle del producto" variant="wide" onClose={onClose}>
    <div className="grid items-start gap-7 md:grid-cols-2">
      <ProductImage product={product} className="aspect-square" eager />
      <div className="space-y-5">
        <p className="eyebrow">{product.brand || 'Componentes de PC'}</p>
        <h1 className="text-2xl font-bold leading-snug">{product.name}</h1>
        <p className="text-3xl font-bold">{formatMoney(product.priceCents)}</p>
        <div className="flex items-center gap-4"><StockBadge stock={product.stock} /><span className="text-xs text-ink-muted">{product.stock} unidades disponibles</span></div>
        <p className="text-sm leading-relaxed text-ink-muted">{product.description}</p>
        <button className="button-primary inline-flex items-center gap-2" disabled={product.stock === 0 || quantity >= product.stock} onClick={() => cart.add(product.id)}><ShoppingCart size={18} aria-hidden="true" />{product.stock === 0 ? 'Agotado' : quantity >= product.stock ? 'Máximo disponible en el carrito' : 'Añadir al carrito'}</button>
        {quantity > 0 && <p className="text-xs text-ink-muted">Ya tienes {quantity} en tu carrito. Máximo disponible: {product.stock}.</p>}
        <p className="text-xs leading-relaxed text-ink-muted">Precio en USD. La disponibilidad se verifica al confirmar tu pedido.</p>
        {photo && <p className="text-xs leading-relaxed text-ink-muted">
          {photo.variant ? `Variante fotografiada: ${photo.variant}. ` : 'Foto del modelo o familia comercial; la configuración puede variar. '}
          <a className="underline hover:text-accent" href={photo.sourcePage} target="_blank" rel="noreferrer">Fuente de la imagen</a>
        </p>}
      </div>
    </div>
    <section className="mt-8 border-t border-white/10 pt-6">
      <h2 className="mb-4 text-lg font-semibold">Especificaciones técnicas</h2>
      {entries.length ? <dl className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
        {entries.map(([key, value]) => <div key={key} className="bg-surface p-4"><dt className="text-xs text-ink-muted">{specLabels[key] ?? ({ type: 'Tipo', configuration: 'Configuración' }[key] ?? key)}</dt><dd className="mt-1 break-words text-sm font-medium">{String(value)}</dd></div>)}
      </dl> : <p className="text-sm text-ink-muted">Las especificaciones técnicas aún no están disponibles. Consulta la ficha del fabricante.</p>}
    </section>
  </Dialog>;
}
