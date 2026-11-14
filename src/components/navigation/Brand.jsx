import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Brand({ to = '/' }) {
  return <Link to={to} aria-label="CyberMarket · Inicio" className="inline-flex shrink-0 items-center gap-2 text-xl font-extrabold tracking-tight">
    <span className="rounded-xl bg-brand-yellow p-2 text-canvas"><Zap size={22} strokeWidth={2.5} aria-hidden="true" /></span>
    <span>Cyber<span className="text-brand-orange">Market</span><span className="text-brand-yellow">.</span></span>
  </Link>;
}
