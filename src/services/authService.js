import { ADMIN_EMAIL } from './storage/databaseSchema.js';
import { DomainError, normalizeEmail, validateLogin, validateRegistration } from '../utils/validation.js';

const hex = (buffer) => Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
const bytes = (value) => Uint8Array.from(value.match(/.{2}/g), (part) => parseInt(part, 16));

async function derive(password, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: bytes(salt), iterations }, key, 256));
}

export function publicCustomer(customer) {
  if (!customer) return null;
  const { credential, ...profile } = customer;
  return profile;
}

export function requireRole(db, role) {
  if (db.Session?.role !== role) throw new DomainError('FORBIDDEN', 'No tienes permiso para realizar esta operación.');
  if (role === 'customer' && !db.Customers.some((customer) => customer.id === db.Session.userId)) {
    throw new DomainError('FORBIDDEN', 'La sesión no es válida.');
  }
  return db.Session;
}

export function createAuthService(database) {
  let busy = false;
  function readyData() {
    const { status, data } = database.getSnapshot();
    if (status !== 'ready') throw new DomainError('NOT_READY', 'Espera a que se carguen los datos o reintenta.');
    return data;
  }

  async function exclusive(action) {
    if (busy) throw new DomainError('AUTH_BUSY', 'Hay una operación de acceso en curso.');
    busy = true;
    try { return await action(); }
    finally { busy = false; }
  }

  return {
    register(input) {
      return exclusive(async () => {
        validateRegistration(input);
        const email = normalizeEmail(input.email);
        const data = readyData();
        if (email === ADMIN_EMAIL || data.Customers.some((customer) => customer.email === email)) {
          throw new DomainError('REGISTRATION', 'No se puede registrar esa cuenta. Utiliza otro email o inicia sesión.');
        }
        const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
        const credential = { algorithm: 'PBKDF2-SHA256', iterations: 600000, salt, hash: await derive(input.password, salt, 600000) };
        const customer = { id: crypto.randomUUID(), name: input.name.trim(), email, phone: '', addresses: [], role: 'customer', credential, createdAt: new Date().toISOString() };
        database.update((draft) => {
          if (draft.Customers.some((existing) => existing.email === email)) throw new DomainError('REGISTRATION', 'No se puede registrar esa cuenta.');
          draft.Customers.push(customer);
          draft.Session = { userId: customer.id, role: 'customer', email, createdAt: new Date().toISOString() };
        });
        return publicCustomer(customer);
      });
    },
    login(input) {
      return exclusive(async () => {
        validateLogin(input);
        const data = readyData();
        const email = normalizeEmail(input.email);
        if (email === ADMIN_EMAIL && input.password === 'admin123') {
          database.update((draft) => { draft.Session = { userId: 'admin', email: ADMIN_EMAIL, role: 'admin', createdAt: new Date().toISOString() }; });
          return { id: 'admin', email: ADMIN_EMAIL, name: 'Administrador', role: 'admin' };
        }
        const customer = data.Customers.find((candidate) => candidate.email === email);
        if (!customer || await derive(input.password, customer.credential.salt, customer.credential.iterations) !== customer.credential.hash) {
          throw new DomainError('CREDENTIALS', 'Email o contraseña incorrectos.');
        }
        database.update((draft) => {
          const current = draft.Customers.find((candidate) => candidate.id === customer.id);
          if (!current || current.credential.hash !== customer.credential.hash) throw new DomainError('CREDENTIALS', 'Email o contraseña incorrectos.');
          draft.Session = { userId: customer.id, email, role: 'customer', createdAt: new Date().toISOString() };
        });
        return publicCustomer(customer);
      });
    },
    logout() {
      if (busy) throw new DomainError('AUTH_BUSY', 'Espera a que termine el acceso antes de cerrar sesión.');
      readyData();
      database.update((draft) => { draft.Session = null; });
    },
    requireRole(role) { return requireRole(readyData(), role); },
  };
}
