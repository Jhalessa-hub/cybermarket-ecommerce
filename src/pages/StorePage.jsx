import { useEffect, useState } from 'react';
import { ArrowLeft, SearchX, SlidersHorizontal } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useShop } from '../hooks/useShop.js';
import { useCatalogLocation } from '../hooks/useCatalogLocation.js';
import { useCart } from '../hooks/useCart.js';
import CatalogFilters, { ActiveFilters } from '../components/catalog/CatalogFilters.jsx';
import ProductGrid from '../components/catalog/ProductGrid.jsx';
import ProductDetailModal from '../components/catalog/ProductDetailModal.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import StoreHero from '../components/catalog/StoreHero.jsx';
import { paths } from '../routes/routePaths.js';

export default function StorePage({ cartRoute = false, mode = 'home' }) {
  const { products, categories, status, error, retry } = useShop();
  const catalog = useCatalogLocation(products);
  const location = useLocation();
  const home = mode === 'home';
  const { productId } = useParams();
  const navigate = useNavigate();
  const cart = useCart();
  const [selected, setSelected] = useState(null);
  const [limit, setLimit] = useState(20);
  const product = products.find((item) => item.id === (productId ?? selected));
  useEffect(() => { if (cartRoute) cart.open(); }, [cartRoute, cart.open]);
  useEffect(() => { setLimit(20); }, [catalog.filters, catalog.sort]);
  function closeDetail() { setSelected(null); if (productId) navigate('/', { replace: true }); }
  if (status === 'loading') return <p role="status" className="py-16 text-center text-ink-muted">Cargando catálogo…</p>;
  if (status === 'error') return <section role="alert" className="panel"><p>{error.message}</p><button className="button-secondary mt-4" onClick={retry}>Reintentar</button></section>;
  if (productId && !product) return <NotFoundPage />;
  if (home && catalog.activeCount > 0 && !productId && !cartRoute) return <Navigate to={`${paths.search}${location.search}`} replace />;
  return <div className="space-y-7">
    {home ? <StoreHero /> : <header className="space-y-3"><Link to={paths.store} className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-white"><ArrowLeft size={16} aria-hidden="true" />Volver a Inicio</Link><h1 className="text-3xl font-bold">{catalog.filters.query.trim() ? 'Resultados de búsqueda' : 'Explora el catálogo'}</h1><p className="text-sm text-ink-muted">Afina tu búsqueda por categoría, marca, precio y disponibilidad.</p></header>}
    {home && <nav aria-label="Categorías de productos" className="flex flex-wrap items-center gap-3">{categories.map((category) => <Link key={category.id} to={`${paths.catalog}?category=${encodeURIComponent(category.id)}`} className="rounded-full border border-white/15 bg-surface/50 px-5 py-3 text-sm transition-colors hover:border-brand-orange/60 hover:text-brand-orange">{category.name}</Link>)}</nav>}
    <div className={home ? '' : 'grid items-start gap-7 lg:grid-cols-[225px_minmax(0,1fr)]'}>
      {!home && <CatalogFilters catalog={catalog} categories={categories} />}
      <section id="catalogo-principal" aria-label="Productos" className="min-w-0 scroll-mt-48 space-y-5">
        {home && <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">Encuentra tu próximo componente</h2><Link to={paths.catalog} className="inline-flex items-center gap-2 text-sm font-medium text-brand-yellow"><SlidersHorizontal size={17} aria-hidden="true" />Abrir filtros</Link></div>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-sm text-ink-muted"><span className="font-semibold text-white">{catalog.results.length}</span> productos encontrados</p>
          <label className="flex items-center gap-2 text-xs text-ink-muted">Ordenar por<select value={catalog.sort} onChange={(event) => catalog.setSort(event.target.value)} className="rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white"><option value="default">Orden del catálogo</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option><option value="name">Nombre</option></select></label>
        </div>
        <ActiveFilters catalog={catalog} categories={categories} />
        {catalog.results.length > 0 ? <>
          <ProductGrid products={catalog.results.slice(0, limit)} onDetail={setSelected} wide={home} />
          <div className="space-y-3 py-6 text-center"><p className="text-xs text-ink-muted">Mostrando {Math.min(limit, catalog.results.length)} de {catalog.results.length} productos</p>{limit < catalog.results.length && <button className="button-secondary" onClick={() => setLimit((previous) => previous + 20)}>Ver más productos</button>}</div>
        </> : <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center"><SearchX size={36} className="mx-auto mb-4 text-ink-muted" aria-hidden="true" /><h2 className="text-xl font-semibold">{products.length ? 'No encontramos coincidencias' : 'El catálogo está vacío'}</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">{products.length ? 'Busca otro término o quita algún filtro para encontrar más opciones.' : 'Todavía no hay productos disponibles. Vuelve más adelante.'}</p>{catalog.activeCount > 0 && <button className="button-secondary mt-6" onClick={catalog.clear}>Limpiar filtros</button>}</div>}
        <p className="border-t border-white/10 pt-5 text-xs leading-relaxed text-ink-muted">Precios en USD. Consulta las especificaciones y la variante de cada producto en su ficha. Las imágenes pueden variar según la configuración.</p>
      </section>
    </div>
    {product && <ProductDetailModal product={product} onClose={closeDetail} />}
  </div>;
}
