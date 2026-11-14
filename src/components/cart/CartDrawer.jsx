import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart.js';
import Dialog from '../feedback/Dialog.jsx';
import CartLine from './CartLine.jsx';
import { formatMoney } from '../../utils/currency.js';
import { paths } from '../../routes/routePaths.js';

export default function CartDrawer() {
  const cart = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  function close() { cart.close(); if (location.pathname === paths.cart) navigate(paths.store, { replace: true }); }
  if (!cart.isOpen) return null;
  return <Dialog title="Tu carrito" variant="drawer" onClose={close}>
    {cart.error ? <div role="alert" className="space-y-4"><p className="text-red-300">{cart.error.message}</p><p className="text-sm text-ink-muted">No se puede calcular el total de este carrito. No se ha creado ningún pedido.</p><button className="button-secondary" onClick={close}>Cerrar carrito</button></div> : cart.lines.length ? <>
      <p className="text-xs text-ink-muted">{cart.itemCount} {cart.itemCount === 1 ? 'artículo' : 'artículos'} · Guardado en este navegador</p>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">{cart.lines.map((line) => <CartLine key={line.productId} line={line} />)}</div>
      <div className="space-y-4 border-t border-white/10 pt-5">
        <dl className="space-y-3 text-sm"><div className="flex justify-between text-ink-muted"><dt>Subtotal</dt><dd>{formatMoney(cart.totalCents)}</dd></div><div className="flex justify-between text-lg font-bold"><dt>Total estimado</dt><dd>{formatMoney(cart.totalCents)}</dd></div></dl>
        <p className="text-xs leading-relaxed text-ink-muted">Importes de demostración. El stock y los precios se revisarán de nuevo antes de confirmar una compra. El pago no realiza cobros reales.</p>
        <button className="button-primary flex w-full items-center justify-center gap-2" disabled={cart.adjustments.length > 0} onClick={() => { close(); navigate(paths.checkout); }}>Continuar al checkout<ArrowRight size={18} aria-hidden="true" /></button>
        <button className="w-full py-1 text-center text-sm text-ink-muted hover:text-white" onClick={close}>Seguir explorando</button>
      </div>
    </> : <div className="flex flex-1 flex-col items-center justify-center py-14 text-center">
      <ShoppingBag size={44} className="mb-5 text-ink-muted" strokeWidth={1.3} aria-hidden="true" /><h2 className="text-xl font-bold">Tu carrito está vacío</h2><p className="mb-7 mt-3 max-w-64 text-sm text-ink-muted">Encuentra el componente ideal para tu próxima PC.</p><button className="button-primary" onClick={() => { close(); navigate(paths.store); }}>Volver a la tienda</button><p className="mt-6 text-sm text-ink-muted">Total estimado: {formatMoney(0)}</p><button className="button-secondary mt-4" disabled>Continuar al checkout</button>
    </div>}
  </Dialog>;
}
