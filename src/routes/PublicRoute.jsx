import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import SessionState from '../components/feedback/SessionState.jsx';
import { paths, safeReturnTo } from './routePaths.js';

export default function PublicRoute() {
  const { status, role } = useAuth();
  const location = useLocation();
  const adminLogin = location.pathname === paths.login && new URLSearchParams(location.search).get('mode') === 'admin';
  return <SessionState>{status === 'authenticated' && !(adminLogin && role !== 'admin') ? <Navigate to={safeReturnTo(location.state?.from, role)} replace /> : <Outlet />}</SessionState>;
}
