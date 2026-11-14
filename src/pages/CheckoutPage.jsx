import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, LockKeyhole, MapPin, ShoppingBag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useShop } from '../hooks/useShop.js';
import AddressBook from '../components/profile/AddressBook.jsx';
import CheckoutSummary from '../components/cart/CheckoutSummary.jsx';
import FormField from '../components/auth/FormField.jsx';
import { formatMoney } from '../utils/currency.js';
import { errorMessage } from '../utils/errorMessages.js';
import { paths } from '../routes/routePaths.js';
import { validateProfile } from '../utils/validation.js';

export default function CheckoutPage() {
  const auth = useAuth();
  const shop = useShop();
  const navigate = useNavigate();
  const [addressConfirmed, setAddressConfirmed] = useState(null);
  const [addressEditing, setAddressEditing] = useState(false);
  const [phone, setPhone] = useState(auth.user.phone ?? '');
  const [phoneError, setPhoneError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [priceNotice, setPriceNotice] = useState('');
  const submitting = useRef(false);
  const paymentHeading = useRef(null);
  const addressKey = JSON.stringify(auth.selectedAddress);
  const quote = useMemo(() => {
    try { return shop.reviewCheckout(auth.selectedAddress?.id); }
    catch { return null; }
  }, [shop.reviewCheckout, shop.cart, shop.products, auth.selectedAddress]);
  const quoteKey = JSON.stringify(quote);
  const previousQuote = useRef(null);
  const phoneSaved = phone.trim() === auth.user.phone;
  const addressReady = addressConfirmed === addressKey && !!quote && !addressEditing && phoneSaved;
  useEffect(() => { setPhone(auth.user.phone ?? ''); }, [auth.user.phone]);
  useEffect(() => { setAccepted(false); }, [quoteKey, addressConfirmed, addressEditing, phone]);
  useEffect(() => {
    const previous = previousQuote.current;
    if (previous && quote && JSON.stringify(previous.lines) !== JSON.stringify(quote.lines)) {
      setPriceNotice('Los artículos o precios han cambiado. Revisa el resumen actualizado y confirma de nuevo.');
    }
    previousQuote.current = quote;
  }, [quoteKey, quote]);

  function continueToPayment() {
    if (!quote) return;
    setAddressConfirmed(addressKey); setError('');
    requestAnimationFrame(() => paymentHeading.current?.focus({ preventScroll: true }));
  }
  function savePhone(event) {
    event.preventDefault(); setPhoneError('');
    try {
      validateProfile({ name: auth.user.name, phone }, { requirePhone: true });
      auth.updateProfile({ name: auth.user.name, phone });
    } catch (failure) { setPhoneError(failure.fields?.phone ?? errorMessage(failure)); }
  }
  function confirm(event) {
    event.preventDefault();
    if (submitting.current || !accepted || !addressReady || !quote) return;
    submitting.current = true; setBusy(true); setError('');
    try {
      const result = shop.confirmCheckout(quote);
      shop.closeCart();
      navigate(paths.confirmation(result.order.id), { replace: true });
    } catch (failure) {
      setError(errorMessage(failure)); setAccepted(false);
      shop.retry();
    } finally { submitting.current = false; setBusy(false); }
  }

  if (!shop.cart.length) return <section className="panel mx-auto max-w-lg space-y-5 py-12 text-center">
    <ShoppingBag className="mx-auto text-brand-yellow" size={40} aria-hidden="true" />
    <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
    <p className="text-ink-muted">Añade productos antes de continuar con tu compra.</p>
    <Link className="button-primary inline-block" to={paths.store}>Volver a la tienda</Link>
  </section>;

  return <div className="space-y-8">
    <Link to={paths.cart} className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-white"><ArrowLeft size={16} aria-hidden="true" />Volver al carrito</Link>
    <header><p className="eyebrow">UN PASO MÁS PARA TU PRÓXIMO UPGRADE</p><h1 className="mt-3 text-3xl font-bold">Finaliza tu compra</h1><p className="mt-3 text-sm text-ink-muted">Elige dónde recibir tu pedido y revisa los detalles antes de confirmar.</p></header>
    <ol aria-label="Pasos de compra" className="flex flex-wrap gap-x-7 gap-y-3 border-y border-white/10 py-4 text-sm">
      <li className="flex items-center gap-2 text-emerald-300"><Check size={17} aria-hidden="true" />Carrito revisado</li>
      <li aria-current={!addressReady ? 'step' : undefined} className={`flex items-center gap-2 ${addressReady ? 'text-emerald-300' : 'text-brand-yellow'}`}><MapPin size={17} aria-hidden="true" />Dirección de envío</li>
      <li aria-current={addressReady ? 'step' : undefined} className={`flex items-center gap-2 ${addressReady ? 'text-brand-yellow' : 'text-ink-muted'}`}><CreditCard size={17} aria-hidden="true" />Pago y confirmación</li>
    </ol>
    {error && <div role="alert" className="rounded-xl border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-200">{error} No se ha confirmado una nueva compra. Revisa los datos y vuelve a intentarlo.</div>}
    {priceNotice && <p role="status" className="rounded-xl border border-brand-orange/30 p-4 text-sm text-brand-orange">{priceNotice}</p>}
    {shop.cartSummary.adjustments.length > 0 && <p role="alert" className="text-sm text-brand-orange">La disponibilidad ha cambiado. Revisa las cantidades del carrito antes de continuar.</p>}
    {shop.cartSummary.error ? <p role="alert" className="form-error">No se puede calcular el total. Revisa tu carrito.</p> : <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
      <div className="min-w-0 space-y-6">
        <section className="panel space-y-5" aria-labelledby="shipping-heading">
          <h2 id="shipping-heading" className="flex items-center gap-2 text-xl font-semibold"><MapPin size={21} className="text-brand-orange" aria-hidden="true" />1. Enviar a…</h2>
          <p className="text-sm text-ink-muted">Selecciona una dirección guardada o añade una nueva. Es obligatoria para continuar.</p>
          <form onSubmit={savePhone} noValidate className="space-y-3 rounded-xl border border-white/10 p-4">
            <FormField label="Teléfono de contacto" name="phone" type="tel" autoComplete="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} error={phoneError} hint="Obligatorio para el envío. Usa datos ficticios en esta demo." />
            <button type="submit" className="button-secondary">Guardar teléfono</button>
            {quote && phoneSaved && <p className="text-xs text-emerald-300">Teléfono guardado y válido.</p>}
          </form>
          <AddressBook checkout onEditingChange={setAddressEditing} />
          <button className="button-primary inline-flex items-center gap-2" disabled={!quote || !phoneSaved || addressEditing || shop.cartSummary.adjustments.length > 0} onClick={continueToPayment}>{addressReady && <Check size={17} aria-hidden="true" />}{addressReady ? 'Dirección confirmada' : 'Continuar al pago'}</button>
        </section>
        <section className={`panel space-y-5 ${!addressReady ? 'border-dashed' : ''}`} aria-labelledby="payment-heading">
          <h2 ref={paymentHeading} tabIndex={-1} id="payment-heading" className="flex items-center gap-2 text-xl font-semibold outline-none"><CreditCard size={21} className="text-brand-orange" aria-hidden="true" />2. Pago y confirmación</h2>
          {!addressReady ? <p className="flex items-start gap-2 text-sm text-ink-muted"><LockKeyhole size={18} className="shrink-0" aria-hidden="true" />Primero guarda tu teléfono y confirma tu dirección de envío.</p> : <form onSubmit={confirm} className="space-y-5">
            <div className="rounded-xl border border-brand-yellow/25 bg-brand-yellow/5 p-5"><p className="flex items-center gap-2 font-semibold"><CreditCard size={19} aria-hidden="true" />Pago de tu pedido</p><p className="mt-2 text-sm text-ink-muted">El pedido se registrará al confirmar. No necesitas introducir datos bancarios.</p></div>
            <p className="rounded-lg bg-white/5 px-3 py-2 text-xs leading-relaxed text-ink-muted">Modo demostración · Pago simulado, sin cobros reales.</p>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-brand-yellow" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />He revisado los artículos, el total de {formatMoney(quote.totalCents)} y la dirección de envío. Confirmo este pedido de demostración.</label>
            <button type="submit" className="button-primary flex w-full items-center justify-center gap-2" disabled={!accepted || busy || shop.cartSummary.adjustments.length > 0}><LockKeyhole size={18} aria-hidden="true" />{busy ? 'Procesando pedido…' : `Confirmar y pagar ${formatMoney(quote.totalCents)}`}</button>
            <p className="text-xs leading-relaxed text-ink-muted">Tu pedido se guardará en este navegador. No se enviarán correos ni se realizará un envío real.</p>
          </form>}
        </section>
      </div>
      <CheckoutSummary summary={shop.cartSummary} />
    </div>}
  </div>;
}
