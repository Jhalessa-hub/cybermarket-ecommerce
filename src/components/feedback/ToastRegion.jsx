import { useEffect } from 'react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { useShop } from '../../hooks/useShop.js';

function Toast({ item, dismiss }) {
  const Icon = item.type === 'success' ? CircleCheck : CircleAlert;
  useEffect(() => {
    if (item.type === 'error') return;
    const timer = setTimeout(() => dismiss(item.id), 10000);
    return () => clearTimeout(timer);
  }, [item.id, item.type, dismiss]);
  return <div role={item.type === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-xl border bg-surface p-4 shadow-xl ${item.type === 'error' ? 'border-red-400/50' : item.type === 'success' ? 'border-emerald-400/50' : 'border-brand-orange/50'}`}>
    <Icon size={19} aria-hidden="true" className={`mt-0.5 shrink-0 ${item.type === 'error' ? 'text-red-300' : item.type === 'success' ? 'text-emerald-300' : 'text-brand-orange'}`} />
    <p className="text-sm leading-relaxed">{item.message}</p>
    <button className="icon-button ml-auto self-start !p-0.5" aria-label="Cerrar aviso" onClick={() => dismiss(item.id)}><X size={16} aria-hidden="true" /></button>
  </div>;
}
export default function ToastRegion() {
  const { notifications, dismissNotification } = useShop();
  return <section aria-label="Avisos de la tienda" className="pointer-events-none fixed bottom-6 right-6 z-50 w-[min(90vw,25rem)] space-y-3 [&>*]:pointer-events-auto">
    {notifications.map((item) => <Toast key={item.id} item={item} dismiss={dismissNotification} />)}
  </section>;
}
