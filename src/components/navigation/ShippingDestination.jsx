import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { paths } from '../../routes/routePaths.js';
import Dialog from '../feedback/Dialog.jsx';
import AddressBook from '../profile/AddressBook.jsx';

export default function ShippingDestination() {
  const { user, selectedAddress, role } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const name = (selectedAddress?.recipient || user?.name || '').split(/\s+/)[0];
  const content = <>
    <MapPin aria-hidden="true" size={24} className="shrink-0 text-ink-muted" strokeWidth={1.5} />
    <span className="min-w-0 text-left leading-tight">
      <span className="block text-xs text-ink-muted">{user ? `Enviar a ${name}` : '¿Dónde recibes tu pedido?'}</span>
      <span className="mt-1 block max-w-[210px] truncate text-sm font-semibold" title={selectedAddress?.line1}>{selectedAddress?.line1 || 'Añade tu dirección'}</span>
    </span>
    <ChevronDown size={13} aria-hidden="true" className="shrink-0 text-ink-muted" />
  </>;
  return <>
    {role === 'customer'
      ? <button className="shipping-destination" aria-label="Elegir dirección de envío" aria-haspopup="dialog" onClick={() => setOpen(true)}>{content}</button>
      : <Link className="shipping-destination" to={paths.login} state={{ from: location.pathname }}>{content}</Link>}
    {open && <Dialog title="¿A dónde lo enviamos?" onClose={() => setOpen(false)}>
      <p className="mb-5 text-sm text-ink-muted">Selecciona un destino guardado. Puedes gestionar tus direcciones desde tu perfil.</p>
      <AddressBook selectOnly onChoose={() => setOpen(false)} />
    </Dialog>}
  </>;
}
