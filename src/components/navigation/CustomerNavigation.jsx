import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useCart } from '../../hooks/useCart.js';
import { paths } from '../../routes/routePaths.js';
import Brand from './Brand.jsx';
import ProfileMenu from './ProfileMenu.jsx';
import ShippingDestination from './ShippingDestination.jsx';
import CatalogSearch from './CatalogSearch.jsx';

export default function CustomerNavigation() {
  const { role } = useAuth();
  const { itemCount, open } = useCart();
  const location = useLocation();
  const from = [paths.login, paths.register].includes(location.pathname) ? location.state : { from: location.pathname + location.search };
  return <header className="sticky top-0 z-20 border-b border-white/10 bg-canvas/95 backdrop-blur-lg">
    <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-5 gap-y-3 px-6 py-4">
      <Brand />
      <div className="order-4 w-full border-t border-white/5 pt-3 xl:order-none xl:w-auto xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0"><ShippingDestination /></div>
      <div className="order-3 w-full xl:order-none xl:w-auto xl:min-w-60 xl:flex-1"><CatalogSearch /></div>
      <nav aria-label="Navegación principal" className="ml-auto flex items-center gap-5 text-sm">
        <NavLink to={paths.store} end className={({ isActive }) => isActive ? 'text-brand-yellow' : 'text-ink-muted hover:text-white'}>Inicio</NavLink>
        <NavLink to={paths.catalog} className={({ isActive }) => isActive || location.pathname === paths.search ? 'text-brand-yellow' : 'text-ink-muted hover:text-white'}>Catálogo</NavLink>
        {role === 'customer' && <NavLink to={paths.orders} className={({ isActive }) => isActive ? 'text-brand-yellow' : 'text-ink-muted hover:text-white'}>Mis compras</NavLink>}
      </nav>
      <div className="flex items-center gap-4">
        {role === 'customer' ? <ProfileMenu /> : <Link className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-brand-orange/60" to={paths.login} state={from}>Ingresar</Link>}
        <button onClick={open} className="relative rounded-xl bg-white/5 p-3 hover:bg-white/10" aria-haspopup="dialog" aria-label={`Carrito, ${itemCount} artículos`}>
          <ShoppingBag size={21} aria-hidden="true" />
          {itemCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-brand-orange px-1.5 text-[10px] font-bold text-white">{itemCount}</span>}
        </button>
      </div>
    </div>
  </header>;
}
