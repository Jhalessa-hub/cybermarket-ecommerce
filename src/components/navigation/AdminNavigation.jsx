import { LayoutDashboard, Package, Truck, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { paths } from '../../routes/routePaths.js';

const items = [[paths.admin, 'Dashboard', LayoutDashboard], [paths.products, 'Productos', Package], [paths.logistics, 'Logística', Truck], [paths.customers, 'Clientes', Users]];
export default function AdminNavigation() {
  return <nav aria-label="Navegación administrativa" className="flex flex-wrap gap-2 lg:flex-col">
    {items.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === paths.admin} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-brand-orange/10 text-brand-orange' : 'text-ink-muted hover:bg-white/5 hover:text-white'}`}><Icon size={19} aria-hidden="true" />{label}</NavLink>)}
  </nav>;
}
