import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export default function Dialog({ title, children, onClose, variant = 'default' }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = ref.current;
    if (!dialog.open) dialog.showModal();
    return () => { if (dialog.open) dialog.close?.(); document.body.style.overflow = previousOverflow; if (previous?.isConnected) previous.focus(); };
  }, []);
  return (
    <dialog ref={ref} aria-labelledby={titleId} className={`${variant === 'drawer' ? 'cart-dialog fixed inset-y-0 left-auto right-0 m-0 h-[100dvh] max-h-none w-[min(100vw,30rem)] max-w-none rounded-l-2xl' : variant === 'wide' ? 'w-[min(94vw,64rem)] rounded-2xl' : 'w-[min(92vw,36rem)] rounded-2xl'} border border-white/10 bg-surface p-0 text-ink-primary shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm`}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === ref.current) onClose(); }}>
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <h2 id={titleId} className="text-xl font-semibold">{title}</h2>
        <button className="icon-button" aria-label="Cerrar ventana" onClick={onClose}><X size={20} aria-hidden="true" /></button>
      </div>
      <div className={variant === 'drawer' ? 'flex min-h-0 flex-1 flex-col overflow-y-auto p-6' : 'max-h-[78vh] overflow-y-auto p-6'}>{children}</div>
    </dialog>
  );
}
