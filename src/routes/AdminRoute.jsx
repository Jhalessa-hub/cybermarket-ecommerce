import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import SessionState from '../components/feedback/SessionState.jsx';
import { paths } from './routePaths.js';

export default function AdminRoute() {
  const { role } = useAuth();
  const location = useLocation();
  return <SessionState>{role === 'admin' ? <Outlet />
    : <Navigate to={`${paths.login}?mode=admin`} state={{ from: location.pathname }} replace />}</SessionState>;
}
