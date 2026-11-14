import { UserRound } from 'lucide-react';

export default function Avatar({ photo, large = false }) {
  return <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5 ${large ? 'h-20 w-20' : 'h-9 w-9'}`}>
    {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <UserRound size={large ? 32 : 19} aria-hidden="true" className="text-ink-muted" />}
  </span>;
}
