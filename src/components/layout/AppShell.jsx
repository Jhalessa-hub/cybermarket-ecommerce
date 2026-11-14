import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function AppShell() {
  const { pathname } = useLocation();
  useEffect(() => {
    // La búsqueda navega al recibir foco: no interrumpir la escritura al cambiar de vista.
    if (['/search', '/catalog'].includes(pathname) && document.activeElement?.matches('[data-catalog-search]')) return;
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);
  return <div className="flex min-h-screen flex-col">
    <a href="#main-content" className="sr-only z-50 bg-brand-yellow p-3 text-canvas focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Saltar al contenido</a>
    <Outlet />
    <footer className="mt-auto border-t border-white/10 px-6 py-6 text-xs text-ink-muted">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><p>CyberMarket · Tecnología para tu próxima idea.</p><p>Demo académica local · Sin pagos reales · Usa datos ficticios</p></div>
    </footer>
  </div>;
}
