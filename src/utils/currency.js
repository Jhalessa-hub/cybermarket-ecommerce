const usd = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'USD', currencyDisplay: 'code' });
export function formatMoney(cents) { return usd.format(cents / 100); }
