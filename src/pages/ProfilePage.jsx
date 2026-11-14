import { MapPin, UserRound } from 'lucide-react';
import ProfileForm from '../components/profile/ProfileForm.jsx';
import AddressBook from '../components/profile/AddressBook.jsx';
import { useAuth } from '../hooks/useAuth.js';

export default function ProfilePage() {
  const { user } = useAuth();
  return <div className="mx-auto max-w-5xl space-y-8 py-5">
    <div><p className="eyebrow">Tu cuenta, a tu manera</p><h1 className="mt-2 text-3xl font-bold">Mi perfil</h1><p className="mt-2 text-ink-muted">Tu información y tus destinos, en un solo lugar.</p></div>
    <section className="panel"><h2 className="mb-6 flex items-center gap-2 text-lg font-semibold"><UserRound size={20} aria-hidden="true" className="text-brand-orange" />Datos personales</h2><ProfileForm key={user.id} /></section>
    <section className="panel"><h2 className="mb-6 flex items-center gap-2 text-lg font-semibold"><MapPin size={20} aria-hidden="true" className="text-brand-orange" />Direcciones de envío</h2><AddressBook key={user.id} /></section>
  </div>;
}
