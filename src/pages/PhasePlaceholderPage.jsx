import { ArrowRight, CircuitBoard } from 'lucide-react';
import { Link } from 'react-router-dom';

// Solo registra destinos de navegación. No implementa funcionalidades de Fases 3–6.
export default function PhasePlaceholderPage({ title, phase, description, link }) {
  return <section className="panel my-8 space-y-5 py-12">
    <CircuitBoard size={36} aria-hidden="true" className="text-brand-orange" />
    <p className="eyebrow">CyberMarket · Sección {phase}</p>
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="max-w-2xl leading-relaxed text-ink-muted">{description} Esta sección no está disponible en este momento.</p>
    {link && <Link className="inline-flex items-center gap-2 text-sm font-semibold text-brand-yellow" to={link.to}>{link.label}<ArrowRight size={17} aria-hidden="true" /></Link>}
  </section>;
}
