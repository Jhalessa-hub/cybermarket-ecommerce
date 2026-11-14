import { Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paths } from '../../routes/routePaths.js';

export default function CatalogSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const searching = [paths.search, paths.catalog].includes(location.pathname);
  const params = new URLSearchParams(searching ? location.search : '');
  const query = params.get('q') ?? '';
  function go(value = query) {
    const next = new URLSearchParams(params);
    if (value) next.set('q', value); else next.delete('q');
    navigate({ pathname: searching ? location.pathname : paths.search, search: next.toString() }, { replace: searching });
  }
  return <form role="search" aria-label="Búsqueda del catálogo" onSubmit={(event) => { event.preventDefault(); go(); }} className="relative min-w-0 flex-1">
    <input type="search" data-catalog-search aria-label="Buscar productos" placeholder="Busca una PC, una GPU, un procesador…" value={query} onFocus={() => { if (!searching) go(); }} onChange={(event) => go(event.target.value)} className="form-input !py-3 !pl-4 !pr-12" />
    <button type="submit" aria-label="Buscar en el catálogo" className="absolute right-1 top-1 rounded-lg p-2 text-brand-yellow hover:bg-white/5"><Search size={21} aria-hidden="true" /></button>
  </form>;
}
