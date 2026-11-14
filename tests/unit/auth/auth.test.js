import { beforeEach, describe, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { setupDatabase } from '../../helpers.js';
import { createAuthService } from '../../../src/services/authService.js';
import { createLocalDatabase } from '../../../src/services/storage/localDatabase.js';
import { DATABASE_KEY } from '../../../src/services/storage/databaseSchema.js';

let db;
let storage;
let sessionStorage;
let auth;
const input = { name: 'Cliente Demo', email: 'test@example.com', password: 'solo-demo-123' };

beforeEach(() => {
  vi.stubGlobal('crypto', webcrypto);
  ({ db, storage, sessionStorage } = setupDatabase());
  db.initialize();
  auth = createAuthService(db);
});

describe('Autenticación de demostración', () => {
  it('registra solo Cliente, normaliza el email e ignora rol inyectado', async () => {
    const profile = await auth.register({ ...input, email: ' TEST@example.com ', role: 'admin' });
    expect(profile.role).toBe('customer');
    expect(profile.email).toBe('test@example.com');
    expect(profile).not.toHaveProperty('credential');
    expect(db.getSnapshot().data.Session.role).toBe('customer');
    expect(storage.getItem(DATABASE_KEY)).not.toContain(input.password);
    expect(db.getSnapshot().data.Customers[0].credential.salt).toHaveLength(32);
  });

  it('permite logout y login posterior con contraseña derivada', async () => {
    await auth.register(input);
    auth.logout();
    expect(db.getSnapshot().data.Session).toBeNull();
    await auth.login({ email: input.email, password: input.password });
    expect(db.getSnapshot().data.Session.role).toBe('customer');
  });

  it('mantiene sesión al recrear el repositorio sin expiración automática', async () => {
    await auth.register(input);
    const restored = createLocalDatabase({ getStorage: () => storage, getSessionStorage: () => sessionStorage });
    restored.initialize();
    expect(restored.getSnapshot().data.Session.userId).toBe(db.getSnapshot().data.Session.userId);
    expect(restored.getSnapshot().data.Session).not.toHaveProperty('expiresAt');
  });

  it('autentica Admin exclusivamente con las credenciales predefinidas', async () => {
    await expect(auth.login({ email: 'admin@cybermarket.com', password: 'incorrecta' })).rejects.toMatchObject({ code: 'CREDENTIALS' });
    await auth.login({ email: 'admin@cybermarket.com', password: 'admin123' });
    expect(auth.requireRole('admin').userId).toBe('admin');
    expect(db.getSnapshot().data.Customers).toEqual([]);
    auth.logout();
    expect(() => auth.requireRole('admin')).toThrow();
  });

  it('no permite registrar la dirección reservada del Admin', async () => {
    await expect(auth.register({ ...input, email: 'ADMIN@cybermarket.com' })).rejects.toMatchObject({ code: 'REGISTRATION' });
    expect(db.getSnapshot().data.Customers).toEqual([]);
  });

  it('no registra emails duplicados', async () => {
    await auth.register(input);
    await expect(auth.register(input)).rejects.toMatchObject({ code: 'REGISTRATION' });
    expect(db.getSnapshot().data.Customers).toHaveLength(1);
  });

  it('valida campos y política de contraseña mínima de 8 caracteres', async () => {
    await expect(auth.register({ name: '', email: 'bad', password: '123' })).rejects.toMatchObject({ code: 'VALIDATION' });
    expect(db.getSnapshot().data.Customers).toEqual([]);
  });

  it('da el mismo mensaje para email desconocido y contraseña incorrecta', async () => {
    await auth.register(input);
    auth.logout();
    const unknown = await auth.login({ email: 'unknown@example.com', password: 'wrong' }).catch((error) => error);
    const wrong = await auth.login({ email: input.email, password: 'wrong' }).catch((error) => error);
    expect(unknown.message).toBe(wrong.message);
    expect(db.getSnapshot().data.Session).toBeNull();
  });

  it('deniega capacidades Admin a Cliente', async () => {
    await auth.register(input);
    expect(() => auth.requireRole('admin')).toThrow();
    expect(auth.requireRole('customer').role).toBe('customer');
  });

  it('no anuncia registro exitoso cuando falla persistencia', async () => {
    vi.spyOn(storage, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError'); });
    await expect(auth.register(input)).rejects.toMatchObject({ code: 'STORAGE' });
    expect(db.getSnapshot().data.Customers).toEqual([]);
    expect(db.getSnapshot().data.Session).toBeNull();
  });
});
