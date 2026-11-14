import { CircuitBoard, ShieldCheck } from 'lucide-react';

export default function AuthLayout({ title, description, children }) {
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-12 py-8 lg:grid-cols-2 lg:py-16">
      <section className="space-y-6">
        <span className="eyebrow">Tu espacio CyberMarket</span>
        <h1 className="max-w-md text-4xl font-bold leading-tight lg:text-5xl">Tu próxima gran <span className="text-brand-orange">idea empieza aquí.</span></h1>
        <p className="max-w-md leading-relaxed text-ink-muted">Una cuenta para guardar tus direcciones y tener todo preparado para tu próxima PC.</p>
        <div className="flex items-center gap-4 text-ink-muted"><CircuitBoard aria-hidden="true" size={44} className="text-brand-yellow" /><span className="text-sm">Hecho para quienes<br />disfrutan la tecnología.</span></div>
      </section>
      <section className="panel space-y-6 !p-8">
        <div><h2 className="text-2xl font-bold">{title}</h2><p className="mt-2 text-sm text-ink-muted">{description}</p></div>
        {children}
        <p className="flex gap-2 border-t border-white/10 pt-5 text-xs leading-relaxed text-ink-muted"><ShieldCheck className="shrink-0" size={17} aria-hidden="true" />Demo local académica, sin seguridad de producción. No ingreses datos personales ni contraseñas reales.</p>
      </section>
    </div>
  );
}
