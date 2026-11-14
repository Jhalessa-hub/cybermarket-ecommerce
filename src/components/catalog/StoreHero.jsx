import { ArrowRight, Cpu, SlidersHorizontal, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '../../routes/routePaths.js';
import photos from '../../data/catalogPhotos.json';

export default function StoreHero() {
  return <section aria-label="Portada CyberMarket" className="relative isolate overflow-hidden rounded-3xl border border-brand-orange/20 bg-surface">
    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_30%,rgba(255,100,0,0.18),transparent_60%)]" aria-hidden="true" />
    <div className="grid items-center gap-5 px-6 py-9 sm:px-10 lg:grid-cols-[1.3fr_1fr] lg:px-14 lg:py-12">
      <div className="max-w-2xl"><p className="eyebrow flex items-center gap-2"><Zap size={15} aria-hidden="true" />El siguiente nivel empieza aquí</p><h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Tu próximo<br /><span className="text-brand-orange">upgrade.</span></h1><p className="mt-5 max-w-md text-sm leading-relaxed text-ink-muted sm:text-base">PCs ensambladas y componentes para tu próxima idea. Explora, compara y encuentra la pieza que te falta.</p><div className="mt-7 flex flex-wrap gap-3"><a href="#catalogo-principal" className="button-primary inline-flex items-center gap-2">Explorar productos<ArrowRight size={17} aria-hidden="true" /></a><Link to={paths.catalog} className="button-secondary inline-flex items-center gap-2"><SlidersHorizontal size={17} aria-hidden="true" />Filtrar catálogo</Link></div></div>
      <div className="relative hidden h-72 items-center justify-center sm:flex lg:h-80" aria-hidden="true"><div className="absolute h-60 w-60 rounded-full border border-brand-orange/15 bg-brand-orange/5" /><div className="absolute h-80 w-80 rounded-full border border-white/5" /><img src={photos['computers-006'].src} alt="" fetchPriority="high" className="relative h-full max-w-full object-contain drop-shadow-2xl" /><span className="absolute bottom-3 right-0 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-canvas/90 px-4 py-3 text-xs text-ink-muted"><Cpu size={17} className="text-brand-orange" />Hardware para tu siguiente proyecto</span></div>
    </div>
  </section>;
}
