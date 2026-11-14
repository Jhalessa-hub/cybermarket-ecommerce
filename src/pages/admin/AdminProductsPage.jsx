import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useShop } from '../../hooks/useShop.js';
import AdminHeading from '../../components/admin/AdminHeading.jsx';
import ProductTable from '../../components/admin/ProductTable.jsx';
import ProductForm from '../../components/admin/ProductForm.jsx';
import Dialog from '../../components/feedback/Dialog.jsx';
import FormField from '../../components/auth/FormField.jsx';
import { errorMessage } from '../../utils/errorMessages.js';

export default function AdminProductsPage() {
  const shop = useShop();
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [stock, setStock] = useState(params.get('stock') === 'low' ? 'low' : 'all');
  const [active, setActive] = useState(params.get('visibility') === 'active' ? 'active' : 'all');
  const [limit, setLimit] = useState(20);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const products = shop.products.filter((p) => `${p.name} ${p.brand} ${p.id}`.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es')) && (active === 'all' || p.active === (active === 'active')) && (stock === 'all' || (stock === 'low' ? p.stock <= 4 : p.stock === 0)));
  function save(input) {
    try {
      if (editing.id) shop.updateProduct(editing.id, input, { expectedProduct: editing });
      else shop.createProduct(input);
      setEditing(null); shop.notify('Producto guardado correctamente.', 'success');
    } catch (failure) { if (failure.code === 'CONFLICT') shop.retry(); throw failure; }
  }
  return <div className="space-y-7"><AdminHeading title="Productos" description="Gestiona catálogo, precios y disponibilidad. Las compras históricas se conservan." action={<button className="button-primary inline-flex items-center gap-2" onClick={() => setEditing({})}><Plus size={18} aria-hidden="true" />Nuevo producto</button>} />
    <div className="grid items-end gap-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]"><FormField label="Buscar productos" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /><label className="space-y-2 text-sm"><span className="block">Inventario</span><select className="form-input" value={stock} onChange={(event) => setStock(event.target.value)}><option value="all">Todo el stock</option><option value="low">Stock bajo (0–4)</option><option value="zero">Agotados</option></select></label><label className="space-y-2 text-sm"><span className="block">Visibilidad</span><select className="form-input" value={active} onChange={(event) => setActive(event.target.value)}><option value="all">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label></div>
    <p className="text-xs text-ink-muted">{products.length} productos · Stock bajo: menos de 5 unidades · Agotado: 0</p>
    <ProductTable products={products.slice(0, limit)} categories={shop.categories} onEdit={setEditing} onDeactivate={(product) => { setError(''); setDeleting(product); }} />
    {products.length > limit && <button className="button-secondary" onClick={() => setLimit((previous) => previous + 20)}>Mostrar más productos ({Math.min(limit, products.length)} de {products.length})</button>}
    {editing && <Dialog title={editing.id ? 'Editar producto' : 'Nuevo producto'} variant="drawer" onClose={() => setEditing(null)}><ProductForm product={editing.id ? editing : null} categories={shop.categories} onSave={save} onCancel={() => setEditing(null)} /></Dialog>}
    {deleting && <Dialog title="¿Desactivar producto?" onClose={() => setDeleting(null)}><p className="break-words text-sm leading-relaxed text-ink-muted">{deleting.name} dejará de estar disponible en la tienda. Sus datos en pedidos anteriores no cambiarán.</p>{error && <p role="alert" className="form-error mt-4">{error}</p>}<div className="mt-6 flex flex-wrap gap-3"><button className="button-secondary" onClick={() => setDeleting(null)}>Conservar producto</button><button className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white" onClick={() => { try { shop.deactivateProduct(deleting.id, { expectedProduct: deleting }); setDeleting(null); shop.notify('Producto desactivado.', 'success'); } catch (failure) { setError(errorMessage(failure)); if (failure.code === 'CONFLICT') shop.retry(); } }}>Desactivar producto</button></div></Dialog>}
  </div>;
}
