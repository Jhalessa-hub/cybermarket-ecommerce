import { SESSION_KEY, validateSession } from './databaseSchema.js';
import { DomainError } from '../../utils/validation.js';

export function readTabSession(storage, customers) {
  const raw = storage.getItem(SESSION_KEY);
  if (raw === null) return null;
  let session;
  try { session = JSON.parse(raw); }
  catch { throw new DomainError('SESSION_CORRUPT', 'La sesión de esta pestaña está dañada. Cierra esta pestaña y vuelve a iniciar sesión; los pedidos y Clientes siguen guardados.'); }
  // Una cuenta retirada de la base compartida pierde acceso solo en su pestaña.
  if (session?.role === 'customer' && !customers.some((customer) => customer.id === session.userId && customer.email === session.email)) {
    storage.setItem(SESSION_KEY, 'null');
    return null;
  }
  return validateSession(session, customers);
}

export function writeTabSession(storage, session, customers) {
  validateSession(session, customers);
  const safe = session === null ? null : Object.fromEntries(['userId', 'email', 'role', 'createdAt'].map((key) => [key, session[key]]));
  storage.setItem(SESSION_KEY, JSON.stringify(safe));
}
