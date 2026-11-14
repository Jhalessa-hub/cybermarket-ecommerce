export default function AdminHeading({ title, description, action }) {
  return <header className="flex flex-wrap items-start justify-between gap-5"><div className="min-w-0"><p className="eyebrow">PANEL DE ADMINISTRACIÓN</p><h1 className="mt-3 text-3xl font-bold">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">{description}</p></div>{action}</header>;
}
