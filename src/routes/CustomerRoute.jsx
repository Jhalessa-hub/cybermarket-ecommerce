import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import SessionState from '../components/feedback/SessionState.jsx';
import { paths } from './routePaths.js';

export default function CustomerRoute() {
  const { role } = useAuth();
  const location = useLocation();
  return <SessionState>{role === 'customer' ? <Outlet /> : role === 'admin'
    ? <Navigate to={paths.admin} replace />
    : <Navigate to={paths.login} state={{ from: location.pathname }} replace />}</SessionState>;
}
