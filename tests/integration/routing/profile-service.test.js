import { beforeEach, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { setupDatabase } from '../../helpers.js';
import { createAuthService } from '../../../src/services/authService.js';
import { createProfileService } from '../../../src/services/profileService.js';

let db;
let auth;
let profile;
const address = { recipient: 'Jhon Demo', line1: 'Jr. Manco Capac 350', city: 'Lima', region: 'Lima', postalCode: '15001', country: 'Perú' };
beforeEach(async () => {
  vi.stubGlobal('crypto', webcrypto);
  ({ db } = setupDatabase());
  db.initialize();
  auth = createAuthService(db);
  profile = createProfileService(db);
  await auth.register({ name: 'Jhon Demo', email: 'jhon@example.com', password: 'solo-demo-123' });
});

it('guarda perfil sin permitir cambiar email, rol o credenciales desde el formulario', () => {
  profile.updateProfile({ name: 'Jhon Actualizado', phone: '+51 999 123 456', role: 'admin', email: 'admin@cybermarket.com' });
  const customer = db.getSnapshot().data.Customers[0];
  expect(customer.name).toBe('Jhon Actualizado');
  expect(customer.role).toBe('customer');
  expect(customer.email).toBe('jhon@example.com');
});

it('la primera dirección se selecciona y queda predeterminada; puede cambiarse sin perder la anterior', () => {
  const first = profile.saveAddress(address);
  const second = profile.saveAddress({ ...address, line1: 'Av. Demo 200' });
  profile.selectAddress(second.id);
  let customer = db.getSnapshot().data.Customers[0];
  expect(customer.selectedAddressId).toBe(second.id);
  expect(customer.defaultAddressId).toBe(first.id);
  profile.setDefaultAddress(second.id);
  profile.deleteAddress(second.id);
  customer = db.getSnapshot().data.Customers[0];
  expect(customer.selectedAddressId).toBe(first.id);
  expect(customer.defaultAddressId).toBe(first.id);
  profile.deleteAddress(first.id);
  expect(db.getSnapshot().data.Customers[0].selectedAddressId).toBeNull();
});

it('deniega cambios sin sesión Cliente y no permite modificar una dirección ajena', async () => {
  const first = profile.saveAddress(address);
  auth.logout();
  expect(() => profile.updateProfile({ name: 'Intruso', phone: '' })).toThrow();
  await auth.register({ name: 'Otro Cliente', email: 'otro@example.com', password: 'solo-demo-456' });
  expect(() => profile.saveAddress({ ...address, id: first.id })).toThrow();
  expect(() => profile.deleteAddress(first.id)).toThrow();
  expect(() => profile.selectAddress(first.id)).toThrow();
  expect(db.getSnapshot().data.Customers[0].addresses[0].recipient).toBe('Jhon Demo');
});

it('valida perfil y dirección sin anunciar guardado de datos inválidos', () => {
  expect(() => profile.updateProfile({ name: '', phone: 'x' })).toThrow();
  expect(() => profile.saveAddress({ ...address, city: '' })).toThrow();
  expect(db.getSnapshot().data.Customers[0].addresses).toEqual([]);
});

it('rechaza fotos remotas/SVG y acepta únicamente imágenes locales limitadas', () => {
  expect(() => profile.updateProfile({ name: 'Jhon', phone: '', avatar: 'https://example.com/photo.jpg' })).toThrow();
  expect(() => profile.updateProfile({ name: 'Jhon', phone: '', avatar: 'data:image/svg+xml;base64,AAAA' })).toThrow();
  expect(() => profile.updateProfile({ name: 'Jhon', phone: '', avatar: `data:image/jpeg;base64,${'A'.repeat(150000)}` })).toThrow();
});
