import { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { prepareAvatar } from '../../utils/avatar.js';
import Avatar from '../auth/Avatar.jsx';
import FormField from '../auth/FormField.jsx';

export default function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const [values, setValues] = useState({ name: user.name, phone: user.phone ?? '', avatar: user.avatar ?? null });
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [preparing, setPreparing] = useState(false);
  const photoVersion = useRef(0);
  useEffect(() => () => { photoVersion.current += 1; }, []);
  async function choosePhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const version = ++photoVersion.current;
    setPreparing(true); setError(null); setNotice('');
    try {
      const avatar = await prepareAvatar(file);
      if (photoVersion.current === version) setValues((previous) => ({ ...previous, avatar }));
    } catch (failure) { if (photoVersion.current === version) setError(failure); }
    finally { if (photoVersion.current === version) setPreparing(false); }
  }
  function submit(event) {
    event.preventDefault();
    if (preparing) return;
    setError(null); setNotice('');
    try { updateProfile(values); setNotice('Tu perfil se guardó correctamente.'); }
    catch (failure) { setError(failure); }
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="flex flex-wrap items-center gap-5">
        <Avatar photo={values.avatar} large />
        <div className="space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/5 focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-brand-yellow">
            <Camera size={16} aria-hidden="true" />Elegir foto
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} className="sr-only" />
          </label>
          {values.avatar && <button type="button" className="ml-3 text-xs text-ink-muted hover:text-white" onClick={() => setValues({ ...values, avatar: null })}>Quitar foto</button>}
          <p className="text-xs text-ink-muted">JPG, PNG o WebP · Hasta 2 MB · Solo en tu navegador</p>
        </div>
      </div>
      {preparing && <p role="status" className="text-sm text-ink-muted">Preparando tu foto…</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nombre completo" name="name" autoComplete="name" required maxLength={100} value={values.name} error={error?.fields?.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />
        <FormField label="Teléfono" name="phone" type="tel" autoComplete="tel" value={values.phone} error={error?.fields?.phone} hint="Puedes añadirlo después. Será necesario para enviar tus pedidos." onChange={(event) => setValues({ ...values, phone: event.target.value })} />
      </div>
      <FormField label="Email de tu cuenta" type="email" value={user.email} readOnly hint="Tu email identifica la cuenta y no se cambia desde este formulario." />
      {error && <p role="alert" className="form-error">{error.message}</p>}
      {notice && <p role="status" className="text-sm text-emerald-300">{notice}</p>}
      <button type="submit" disabled={preparing} className="button-primary">Guardar perfil</button>
    </form>
  );
}
