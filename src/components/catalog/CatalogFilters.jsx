import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { specLabels } from '../../utils/catalog.js';

function Options({ title, values, selected, onToggle }) {
  return <fieldset className="space-y-3 border-t border-white/10 pt-5">
    <legend className="float-left mb-3 w-full text-sm font-semibold">{title}</legend>
    <div className="clear-both max-h-44 space-y-2 overflow-y-auto pr-2">
      {values.map(({ id, name }) => <label key={id} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted hover:text-white">
        <input type="checkbox" checked={selected.includes(id)} onChange={() => onToggle(id)} className="h-4 w-4 shrink-0 accent-brand-orange" />{name}
      </label>)}
    </div>
  </fieldset>;
}

export default function CatalogFilters({ catalog, categories }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { filters, setFilter, toggle, toggleSpec, facets, activeCount, clear, priceError } = catalog;
  return <aside aria-label="Filtros del catálogo" className="space-y-5 rounded-2xl border border-white/10 bg-surface/40 p-5 lg:sticky lg:top-56 lg:max-h-[calc(100vh-15rem)] lg:overflow-y-auto xl:top-28 xl:max-h-[calc(100vh-8rem)]">
    <div className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-semibold"><SlidersHorizontal size={17} aria-hidden="true" />Filtros</h2>{activeCount > 0 && <button className="text-xs text-brand-orange hover:underline" onClick={clear}>Limpiar todo</button>}</div>
    <button className="button-secondary w-full text-sm lg:hidden" aria-expanded={mobileOpen} aria-controls="catalog-filter-options" onClick={() => setMobileOpen((value) => !value)}>{mobileOpen ? 'Ocultar filtros' : 'Mostrar filtros'}{activeCount > 0 ? ` (${activeCount})` : ''}</button>
    <div id="catalog-filter-options" className={`${mobileOpen ? '' : 'hidden'} space-y-5 lg:block`}>
    <Options title="Categorías" values={categories.map((c) => ({ id: c.id, name: c.name }))} selected={filters.categories} onToggle={(id) => toggle('categories', id)} />
    <Options title="Marca" values={facets.brands.map((brand) => ({ id: brand, name: brand }))} selected={filters.brands} onToggle={(id) => toggle('brands', id)} />
    <fieldset className="space-y-3 border-t border-white/10 pt-5">
      <legend className="float-left mb-3 w-full text-sm font-semibold">Precio · USD</legend>
      <div className="clear-both grid grid-cols-2 gap-2">{[['minPrice', 'Desde'], ['maxPrice', 'Hasta']].map(([key, label]) => <label className="space-y-1 text-xs text-ink-muted" key={key}>{label}<input type="number" min="0" step="0.01" inputMode="decimal" className="form-input !px-2" value={filters[key]} placeholder="—" aria-label={`Precio ${key === 'minPrice' ? 'mínimo' : 'máximo'} en USD`} aria-invalid={!!priceError} aria-describedby={priceError ? 'price-filter-error' : undefined} onChange={(event) => setFilter(key, event.target.value)} /></label>)}</div>
      {priceError && <p id="price-filter-error" role="alert" className="text-xs text-red-300">{priceError}</p>}
    </fieldset>
    <Options title="Disponibilidad" values={[{ id: 'available', name: 'En stock' }, { id: 'sold-out', name: 'Agotados' }]} selected={filters.availability} onToggle={(id) => toggle('availability', id)} />
    <details className="border-t border-white/10 pt-5" open={Object.values(filters.specs).some((values) => values.length) || undefined}>
      <summary className="cursor-pointer text-sm font-semibold">Características técnicas</summary>
      <div className="mt-5 space-y-5">{Object.entries(facets.specs).filter(([, options]) => options.length).map(([key, options]) => <Options key={key} title={specLabels[key]} values={options.map((value) => ({ id: value, name: value }))} selected={filters.specs[key] ?? []} onToggle={(value) => toggleSpec(key, value)} />)}</div>
    </details>
    </div>
  </aside>;
}

export function ActiveFilters({ catalog, categories }) {
  const { filters, setFilter, toggle, toggleSpec } = catalog;
  const chips = [];
  if (filters.query.trim()) chips.push({ id: 'query', label: `Búsqueda: ${filters.query}`, remove: () => setFilter('query', '') });
  filters.categories.forEach((id) => chips.push({ id, label: categories.find((c) => c.id === id)?.name ?? id, remove: () => toggle('categories', id) }));
  filters.brands.forEach((brand) => chips.push({ id: brand, label: brand, remove: () => toggle('brands', brand) }));
  filters.availability.forEach((value) => chips.push({ id: value, label: value === 'available' ? 'En stock' : 'Agotados', remove: () => toggle('availability', value) }));
  if (filters.minPrice !== '') chips.push({ id: 'min', label: `Desde USD ${filters.minPrice}`, remove: () => setFilter('minPrice', '') });
  if (filters.maxPrice !== '') chips.push({ id: 'max', label: `Hasta USD ${filters.maxPrice}`, remove: () => setFilter('maxPrice', '') });
  Object.entries(filters.specs).forEach(([key, values]) => values.forEach((value) => chips.push({ id: `${key}-${value}`, label: `${specLabels[key] ?? key}: ${value}`, remove: () => toggleSpec(key, value) })));
  return chips.length > 0 && <div aria-label="Filtros activos" className="flex flex-wrap gap-2">{chips.map((chip) => <button key={chip.id} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-ink-muted hover:text-white" aria-label={`Quitar filtro ${chip.label}`} onClick={chip.remove}>{chip.label}<X size={12} aria-hidden="true" /></button>)}</div>;
}
