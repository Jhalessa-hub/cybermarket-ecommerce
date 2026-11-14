import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCatalog } from './useCatalog.js';
import { readCatalogSearch, writeCatalogSearch } from '../utils/catalogLocation.js';

export function useCatalogLocation(products) {
  const [params, setParams] = useSearchParams();
  const settings = useMemo(() => readCatalogSearch(params), [params]);
  return useCatalog(products, {
    ...settings,
    onFiltersChange: (update) => setParams((previous) => {
      const current = readCatalogSearch(previous);
      return writeCatalogSearch(typeof update === 'function' ? update(current.filters) : update, current.sort);
    }, { replace: true }),
    onSortChange: (sort) => setParams((previous) => writeCatalogSearch(readCatalogSearch(previous).filters, sort), { replace: true }),
  });
}
