import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Package, UserRound } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { paths } from '../../routes/routePaths.js';
import Avatar from '../auth/Avatar.jsx';

export default function ProfileMenu() {
  const { user, role, logout } = useAuth();
  const ref = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  useEffect(() => { if (ref.current) ref.current.open = false; }, [location.pathname]);
  useEffect(() => {
    function pointer(event) { if (ref.current && !ref.current.contains(event.target)) ref.current.open = false; }
    function keyboard(event) {
      if (event.key === 'Escape' && ref.current?.open) {
        ref.current.open = false;
        ref.current.querySelector('summary')?.focus();
      }
    }
    document.addEventListener('pointerdown', pointer);
    document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('pointerdown', pointer); document.removeEventListener('keydown', keyboard); };
  }, []);
  function close() { if (ref.current) ref.current.open = false; }
  function signOut() {
    try { logout(); navigate(paths.store, { replace: true }); }
    catch (failure) { setError(failure.message); }
  }
  return <details className="relative" ref={ref}>
    <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl p-1.5 hover:bg-white/5 [&::-webkit-details-marker]:hidden" aria-label={`Cuenta de ${user.name.split(/\s+/)[0]}`}>
      <Avatar photo={user.avatar} /><span className="max-w-28 truncate text-sm font-semibold">{user.name.split(/\s+/)[0]}</span><ChevronDown size={14} className="text-ink-muted" aria-hidden="true" />
    </summary>
    <div className="absolute right-0 z-30 mt-3 w-60 overflow-hidden rounded-xl border border-white/10 bg-surface p-2 shadow-2xl">
      <p className="truncate px-3 py-2 text-xs text-ink-muted">{user.email}</p>
      {role === 'customer' && <>
        <Link to={paths.profile} className="dropdown-link" onClick={close}><UserRound size={17} aria-hidden="true" />Mi perfil</Link>
        <Link to={paths.orders} className="dropdown-link" onClick={close}><Package size={17} aria-hidden="true" />Mis compras</Link>
      </>}
      <div className="my-2 border-t border-white/10" />
      <button className="dropdown-link w-full text-red-300" onClick={signOut}><LogOut size={17} aria-hidden="true" />Cerrar sesión</button>
      {error && <p role="alert" className="p-2 text-xs text-red-300">{error}</p>}
    </div>
  </details>;
}
