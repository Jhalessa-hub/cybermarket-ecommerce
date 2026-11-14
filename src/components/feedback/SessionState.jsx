import { LoaderCircle, TriangleAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

export default function SessionState({ children }) {
  const { status, error, retry } = useAuth();
  if (status === 'loading') return (
    <div role="status" className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center gap-3 p-8 text-ink-muted">
      <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> Preparando tu espacio…
    </div>
  );
  if (status === 'error') return (
    <section role="alert" className="panel mx-auto my-16 max-w-lg space-y-4">
      <TriangleAlert aria-hidden="true" className="text-brand-orange" />
      <h1 className="text-xl font-bold">No pudimos cargar tus datos</h1>
      <p className="text-ink-muted">{error?.message}</p>
      <button className="button-primary" onClick={retry}>Reintentar sin borrar datos</button>
    </section>
  );
  return children;
}
