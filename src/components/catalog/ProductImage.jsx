import { useEffect, useState } from 'react';
import { getCatalogPhoto } from '../../utils/catalogPhotos.js';

export function safeImageSource(value) {
  if (typeof value !== 'string') return null;
  if (/^\/(?!\/)/.test(value) || /^https:\/\//i.test(value)) return value;
  return null;
}

export default function ProductImage({ product, className = '', eager = false }) {
  const source = safeImageSource(product.image) ?? (!product.image ? getCatalogPhoto(product)?.src : null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [source]);
  const fallback = !source || failed;
  const category = ['computers', 'motherboards', 'graphics', 'processors'].includes(product.categoryId) ? product.categoryId : 'computers';
  return <figure className={`relative overflow-hidden rounded-xl bg-[#e8ebef] ${className}`}>
    <img src={fallback ? `/images/catalog/${category}.svg` : source} alt={fallback ? `Ilustración de categoría. Foto de ${product.name} no disponible.` : product.name}
      loading={eager ? 'eager' : 'lazy'} className="h-full w-full object-contain p-4 transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.03]" onError={() => { if (!fallback) setFailed(true); }} />
    {fallback && <figcaption className="absolute bottom-2 left-2 rounded bg-white/80 px-1.5 py-0.5 text-[9px] text-slate-600">Imagen referencial</figcaption>}
  </figure>;
}
