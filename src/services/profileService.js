import { requireRole, publicCustomer } from './authService.js';
import { DomainError, validateAddress, validateProfile, validateAvatar } from '../utils/validation.js';

export function getSelectedAddress(user) {
  return user?.addresses?.find((address) => address.id === user.selectedAddressId)
    ?? user?.addresses?.find((address) => address.id === user.defaultAddressId)
    ?? user?.addresses?.[0]
    ?? null;
}

export function createProfileService(database) {
  function update(action) {
    return database.update((draft) => {
      const session = requireRole(draft, 'customer');
      const customer = draft.Customers.find((item) => item.id === session.userId);
      return action(customer);
    });
  }
  function ownAddress(customer, id) {
    const address = customer.addresses.find((item) => item.id === id);
    if (!address) throw new DomainError('NOT_FOUND', 'No se encontró esa dirección en tu perfil.');
    return address;
  }
  return {
    updateProfile({ name, phone, avatar }) {
      validateProfile({ name, phone });
      validateAvatar(avatar);
      return update((customer) => {
        customer.name = name.trim();
        customer.phone = phone?.trim() ?? '';
        if (avatar !== undefined) customer.avatar = avatar;
        return publicCustomer(customer);
      });
    },
    saveAddress(input) {
      validateAddress(input);
      return update((customer) => {
        const existing = input.id ? ownAddress(customer, input.id) : null;
        const address = { id: existing?.id ?? crypto.randomUUID() };
        for (const field of ['recipient', 'line1', 'city', 'region', 'postalCode', 'country']) address[field] = input[field].trim();
        if (existing) Object.assign(existing, address);
        else customer.addresses.push(address);
        customer.defaultAddressId ??= address.id;
        customer.selectedAddressId ??= address.id;
        return address;
      });
    },
    deleteAddress(id) {
      return update((customer) => {
        ownAddress(customer, id);
        customer.addresses = customer.addresses.filter((address) => address.id !== id);
        if (customer.defaultAddressId === id) customer.defaultAddressId = customer.addresses[0]?.id ?? null;
        if (customer.selectedAddressId === id) customer.selectedAddressId = customer.defaultAddressId ?? customer.addresses[0]?.id ?? null;
      });
    },
    selectAddress(id) {
      return update((customer) => {
        ownAddress(customer, id);
        customer.selectedAddressId = id;
      });
    },
    setDefaultAddress(id) {
      return update((customer) => {
        ownAddress(customer, id);
        customer.defaultAddressId = id;
      });
    },
  };
}
