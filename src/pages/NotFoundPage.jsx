import { Link } from 'react-router-dom';
export default function NotFoundPage() {
  return <section className="panel my-10 space-y-4"><p className="eyebrow">No disponible</p><h1 className="text-3xl font-bold">No encontramos esta página</h1><p className="text-ink-muted">El enlace no existe o no está disponible para esta cuenta.</p><Link className="button-secondary inline-block" to="/">Volver al inicio</Link></section>;
}
