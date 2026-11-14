import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { safeReturnTo } from '../../routes/routePaths.js';
import CustomerNavigation from '../navigation/CustomerNavigation.jsx';
import CartDrawer from '../cart/CartDrawer.jsx';

export default function CustomerLayout() {
  const { role } = useAuth();
  const location = useLocation();
  if (role === 'admin') return <Navigate to={safeReturnTo(location.state?.from, role)} replace />;
  const storefront = ['/', '/search', '/catalog', '/cart'].includes(location.pathname) || location.pathname.startsWith('/products/');
  return <><CustomerNavigation /><main id="main-content" tabIndex={-1} className={`mx-auto w-full flex-1 px-6 py-8 outline-none ${storefront ? 'max-w-[1600px]' : 'max-w-7xl'}`}><Outlet /></main><CartDrawer /></>;
}
