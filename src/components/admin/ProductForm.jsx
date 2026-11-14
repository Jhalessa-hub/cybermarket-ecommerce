import { useState } from 'react';
import FormField from '../auth/FormField.jsx';
import { parsePrice } from '../../utils/catalog.js';
import { assertValid, DomainError } from '../../utils/validation.js';
import { errorMessage } from '../../utils/errorMessages.js';

const specsByCategory = {
  computers: [['type', 'Tipo de equipo'], ['configuration', 'Configuración'], ['processor', 'Procesador'], ['memory', 'Memoria RAM'], ['storage', 'Almacenamiento'], ['graphics', 'Gráficos']],
  motherboards: [['socket', 'Socket'], ['chipset', 'Chipset'], ['memory', 'Memoria RAM compatible'], ['formFactor', 'Formato']],
  graphics: [['vramGB', 'VRAM (GB)'], ['interface', 'Interfaz'], ['dimensions', 'Dimensiones']],
  processors: [['socket', 'Socket'], ['cores', 'Núcleos'], ['frequencyGHz', 'Frecuencia (GHz)']],
};
const numericSpecs = ['vramGB', 'cores', 'frequencyGHz'];

export default function ProductForm({ product, categories, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({ name: product?.name ?? '', brand: product?.brand ?? '', description: product?.description ?? '', categoryId: product?.categoryId ?? categories[0]?.id ?? '', price: product ? (product.priceCents / 100).toFixed(2) : '', stock: product ? String(product.stock) : '', image: product?.image ?? '', active: product?.active ?? true, specs: { ...product?.specs } }));
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const fields = specsByCategory[form.categoryId] ?? [];
  const extras = Object.keys(form.specs).filter((key) => !fields.some(([name]) => name === key) && ['string', 'number'].includes(typeof form.specs[key])).map((key) => [key, key]);
  const change = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));
  function save(event) {
    event.preventDefault(); setError(null);
    try {
      const priceCents = parsePrice(form.price), stock = Number(form.stock);
      const invalid = {};
      if (priceCents === null || Number.isNaN(priceCents)) invalid.price = 'Introduce un precio no negativo con hasta 2 decimales.';
      if (!/^\d+$/.test(form.stock) || !Number.isSafeInteger(stock)) invalid.stock = 'Introduce unidades enteras, desde cero.';
      const specs = { ...form.specs };
      for (const [key] of [...fields, ...extras]) {
        if (String(specs[key] ?? '').trim() === '') { delete specs[key]; continue; }
        if (numericSpecs.includes(key)) {
          const value = Number(specs[key]);
          if (!Number.isFinite(value) || value <= 0 || (key !== 'frequencyGHz' && !Number.isSafeInteger(value))) invalid[`spec-${key}`] = 'Introduce un número positivo válido.';
          else specs[key] = value;
        } else specs[key] = String(specs[key]).trim();
      }
      assertValid(invalid); setBusy(true);
      onSave({ name: form.name.trim(), brand: form.brand.trim(), description: form.description.trim(), categoryId: form.categoryId, priceCents, stock, image: form.image.trim() || null, active: form.active, currency: 'USD', specs });
    } catch (failure) { setError(failure instanceof DomainError ? failure : { message: errorMessage(failure) }); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} noValidate className="space-y-5">
    <p className="text-xs leading-relaxed text-ink-muted">Actualiza el precio y la disponibilidad del producto. Los cambios no modifican compras anteriores.</p>
    <FormField label="Nombre del producto" name="name" required value={form.name} error={error?.fields?.name} onChange={change('name')} />
    <FormField label="Marca" name="brand" value={form.brand} error={error?.fields?.brand} onChange={change('brand')} />
    <div className="space-y-2"><label htmlFor="product-category" className="text-sm font-medium">Categoría</label><select id="product-category" className="form-input" required value={form.categoryId} aria-invalid={!!error?.fields?.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value, specs: {} })}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><p className="text-xs text-ink-muted">Cambiar categoría limpia los atributos de este formulario.</p>{error?.fields?.categoryId && <p className="text-xs text-red-300">{error.fields.categoryId}</p>}</div>
    <div className="space-y-2"><label htmlFor="product-description" className="text-sm font-medium">Descripción</label><textarea id="product-description" name="description" className="form-input min-h-24" required value={form.description} aria-invalid={!!error?.fields?.description} aria-describedby={error?.fields?.description ? 'product-description-error' : undefined} onChange={change('description')} />{error?.fields?.description && <p id="product-description-error" className="text-xs text-red-300">{error.fields.description}</p>}</div>
    <div className="grid gap-4 sm:grid-cols-2"><FormField label="Precio (USD)" name="price" type="number" min="0" step="0.01" required value={form.price} error={error?.fields?.price ?? error?.fields?.priceCents} onChange={change('price')} /><FormField label="Stock (unidades)" name="stock" type="number" min="0" step="1" required value={form.stock} error={error?.fields?.stock} onChange={change('stock')} /></div>
    <FormField label="Imagen (ruta local o HTTPS)" name="image" value={form.image} error={error?.fields?.image} onChange={change('image')} hint="Opcional. Deja el campo vacío para usar la imagen del catálogo o una ilustración si no hay una disponible." />
    <fieldset className="space-y-4 rounded-xl border border-white/10 p-4"><legend className="px-2 text-sm font-medium">Especificaciones técnicas · Opcionales</legend>{[...fields, ...extras].map(([key, label]) => <FormField key={key} label={label} name={`spec-${key}`} value={form.specs[key] ?? ''} type={numericSpecs.includes(key) ? 'number' : 'text'} step={key === 'frequencyGHz' ? 'any' : '1'} error={error?.fields?.[`spec-${key}`]} onChange={(event) => setForm({ ...form, specs: { ...form.specs, [key]: event.target.value } })} />)}{!fields.length && !extras.length && <p className="text-xs text-ink-muted">Esta categoría no tiene atributos técnicos predefinidos.</p>}</fieldset>
    <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} className="h-4 w-4 accent-brand-yellow" />Producto activo en la tienda</label>
    {error && <p role="alert" className="form-error">{errorMessage(error)}</p>}
    <div className="flex flex-wrap gap-3 border-t border-white/10 pt-5"><button type="submit" className="button-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar producto'}</button><button type="button" className="button-secondary" onClick={onCancel}>Cancelar</button></div>
  </form>;
}
