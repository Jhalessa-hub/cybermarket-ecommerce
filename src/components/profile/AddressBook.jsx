import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import FormField from '../auth/FormField.jsx';
import Dialog from '../feedback/Dialog.jsx';
import { paths } from '../../routes/routePaths.js';

const addressFields = [
  ['recipient', 'Destinatario', 'name'], ['line1', 'Dirección', 'street-address'],
  ['city', 'Ciudad', 'address-level2'], ['region', 'Región o estado', 'address-level1'],
  ['postalCode', 'Código postal', 'postal-code'], ['country', 'País', 'country-name'],
];

export default function AddressBook({ selectOnly = false, onChoose, checkout = false, onEditingChange }) {
  const auth = useAuth();
  const [editing, setEditing] = useState(() => checkout && !auth.user?.addresses?.length ? { recipient: auth.user.name, line1: '', city: '', region: '', postalCode: '', country: '' } : null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const addresses = auth.user?.addresses ?? [];
  useEffect(() => { onEditingChange?.(!!editing); }, [editing, onEditingChange]);
  function perform(action, message) {
    setError(null); setNotice('');
    try { action(); setNotice(message); return true; }
    catch (failure) { setError(failure); return false; }
  }
  function save(event) {
    event.preventDefault();
    if (perform(() => {
      const saved = auth.saveAddress(editing);
      if (checkout) auth.selectAddress(saved.id);
    }, 'Dirección guardada.')) setEditing(null);
  }
  function startEdit(value) { setError(null); setNotice(''); setEditing(value); }
  return (
    <div className="space-y-5">
      {!addresses.length && <div className="rounded-xl border border-dashed border-white/15 p-6 text-center">
        <MapPin className="mx-auto mb-3 text-ink-muted" aria-hidden="true" />
        <p className="font-medium">Aún no tienes direcciones</p><p className="mt-1 text-sm text-ink-muted">{checkout ? 'Configura una dirección válida para continuar al pago.' : 'Añade un destino para verlo en el encabezado.'}</p>
      </div>}
      <div className="space-y-3">
        {addresses.map((address) => (
          <article key={address.id} className={`rounded-xl border p-4 ${auth.selectedAddress?.id === address.id ? 'border-brand-orange/60 bg-brand-orange/5' : 'border-white/10 bg-canvas/30'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words font-semibold">{address.recipient}</p>
                <p className="mt-1 break-words text-sm text-ink-muted">{address.line1}</p>
                <p className="mt-1 text-xs text-ink-muted">{address.city}, {address.region} · {address.postalCode} · {address.country}</p>
              </div>
              {auth.user.defaultAddressId === address.id && <span className="flex shrink-0 items-center gap-1 text-xs text-brand-yellow"><Star size={13} aria-hidden="true" />Predeterminada</span>}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <button className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 hover:bg-white/5" onClick={() => {
                if (perform(() => auth.selectAddress(address.id), 'Destino actualizado.')) onChoose?.();
              }}>
                {auth.selectedAddress?.id === address.id && <Check size={14} aria-hidden="true" />}{auth.selectedAddress?.id === address.id ? 'Dirección seleccionada' : 'Enviar aquí'}
              </button>
              {!selectOnly && <>
                <button className="text-ink-muted hover:text-white" onClick={() => startEdit({ ...address })} aria-label={`Editar dirección ${address.line1}`}><Pencil size={16} aria-hidden="true" /></button>
                <button className="text-ink-muted hover:text-red-300" onClick={() => setDeleting(address)} aria-label={`Eliminar dirección ${address.line1}`}><Trash2 size={16} aria-hidden="true" /></button>
                {auth.user.defaultAddressId !== address.id && <button className="text-ink-muted hover:text-brand-yellow" onClick={() => perform(() => auth.setDefaultAddress(address.id), 'Dirección predeterminada actualizada.')}>Hacer predeterminada</button>}
              </>}
            </div>
          </article>
        ))}
      </div>
      {selectOnly ? <Link className="button-secondary inline-flex w-full justify-center" to={paths.profile} onClick={onChoose}>Gestionar mis direcciones</Link>
        : !editing && <button className="button-secondary inline-flex items-center gap-2" onClick={() => startEdit({ recipient: auth.user.name, line1: '', city: '', region: '', postalCode: '', country: '' })}><Plus size={17} aria-hidden="true" />Añadir dirección</button>}
      {editing && !selectOnly && (
        <form className="space-y-5 rounded-xl border border-white/10 p-5" onSubmit={save} noValidate>
          <h3 className="font-semibold">{editing.id ? 'Editar dirección' : 'Nueva dirección'}</h3>
          <div className="grid gap-4 sm:grid-cols-2">{addressFields.map(([name, label, autoComplete]) => <FormField key={name} label={label} name={name} autoComplete={autoComplete} required value={editing[name]} error={error?.fields?.[name]} onChange={(event) => setEditing({ ...editing, [name]: event.target.value })} />)}</div>
          <div className="flex flex-wrap gap-3"><button type="submit" className="button-primary">Guardar dirección</button><button type="button" className="button-secondary" onClick={() => { setEditing(null); setError(null); }}>Cancelar</button></div>
        </form>
      )}
      {error && <p role="alert" className="form-error">{error.message}</p>}
      {notice && <p role="status" className="text-sm text-emerald-300">{notice}</p>}
      {deleting && <Dialog title="¿Eliminar esta dirección?" onClose={() => setDeleting(null)}>
        <p className="text-ink-muted">Se eliminará {deleting.line1} de tu perfil. Las direcciones de pedidos anteriores no cambian.</p>
        <div className="mt-6 flex gap-3"><button className="button-secondary" onClick={() => setDeleting(null)}>Conservar</button><button className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white" onClick={() => {
          if (perform(() => auth.deleteAddress(deleting.id), 'Dirección eliminada.')) setDeleting(null);
        }}>Eliminar dirección</button></div>
      </Dialog>}
    </div>
  );
}
