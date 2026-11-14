import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { paths, safeReturnTo } from '../../routes/routePaths.js';
import FormField from './FormField.jsx';
import { ADMIN_EMAIL } from '../../services/storage/databaseSchema.js';
import { DomainError, normalizeEmail } from '../../utils/validation.js';

export default function AuthForm({ register = false }) {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const adminLogin = !register && new URLSearchParams(location.search).get('mode') === 'admin';
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const change = (event) => setValues({ ...values, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      if (adminLogin && normalizeEmail(values.email) !== ADMIN_EMAIL) throw new DomainError('CREDENTIALS', 'Este acceso es para la cuenta Admin de demostración.');
      const user = await (register ? auth.register(values) : auth.login(values));
      setValues({ name: '', email: '', password: '' });
      navigate(safeReturnTo(location.state?.from, user.role), { replace: true });
    } catch (failure) {
      setError(failure);
      setValues((previous) => ({ ...previous, password: '' }));
    } finally { setPending(false); }
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {register && <FormField label="Nombre completo" name="name" autoComplete="name" value={values.name} onChange={change} maxLength={100} required error={error?.fields?.name} />}
      <FormField label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={change} required error={error?.fields?.email} />
      <FormField label="Contraseña" name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} value={values.password} onChange={change} required error={error?.fields?.password} hint={register ? 'Entre 8 y 128 caracteres. Utiliza una contraseña ficticia para esta demo.' : undefined} />
      {error && <p role="alert" className="form-error">{error.code ? error.message : 'No se pudo completar el acceso. Reintenta desde este navegador.'}</p>}
      <button disabled={pending} className="button-primary flex w-full items-center justify-center gap-2" type="submit">
        {pending ? <LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
        {pending ? 'Un momento…' : register ? 'Crear mi cuenta' : 'Iniciar sesión'}
      </button>
      {adminLogin ? <p className="text-sm leading-relaxed text-ink-muted">Acceso de Administrador · Solo cambia la sesión de esta pestaña. Usa admin@cybermarket.com y admin123. <Link className="text-brand-yellow" to={paths.store}>Volver a Inicio</Link></p> : <p className="text-center text-sm text-ink-muted">{register ? '¿Ya tienes una cuenta?' : '¿Primera vez por aquí?'}{' '}
        <Link className="text-brand-yellow hover:underline" to={register ? paths.login : paths.register} state={location.state}>
          {register ? 'Inicia sesión' : 'Crea tu cuenta'}
        </Link>
      </p>}
    </form>
  );
}
