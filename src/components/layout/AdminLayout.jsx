import { Outlet } from 'react-router-dom';
import Brand from '../navigation/Brand.jsx';
import ProfileMenu from '../navigation/ProfileMenu.jsx';
import AdminNavigation from '../navigation/AdminNavigation.jsx';
import { paths } from '../../routes/routePaths.js';

export default function AdminLayout() {
  return <>
    <header className="border-b border-white/10 bg-surface/60"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4"><Brand to={paths.admin} /><div className="flex flex-wrap items-center gap-3"><span className="rounded-full border border-brand-orange/30 px-3 py-1 text-xs text-brand-orange">Admin · Demo local</span><ProfileMenu /></div></div></header>
    <div className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-6 py-8 lg:grid-cols-[210px_1fr]">
      <aside><p className="mb-4 px-4 text-xs font-semibold uppercase tracking-widest text-ink-muted">Administración</p><AdminNavigation /></aside>
      <main id="main-content" tabIndex={-1} className="min-w-0 outline-none"><Outlet /></main>
    </div>
  </>;
}
