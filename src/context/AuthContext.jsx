import { createContext, useMemo } from 'react';
import { useLocalDatabase } from '../hooks/useLocalDatabase.js';
import { localDatabase } from '../services/storage/localDatabase.js';
import { createAuthService, publicCustomer } from '../services/authService.js';
import { createProfileService, getSelectedAddress } from '../services/profileService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children, database = localDatabase }) {
  const snapshot = useLocalDatabase(database);
  const service = useMemo(() => createAuthService(database), [database]);
  const profile = useMemo(() => createProfileService(database), [database]);
  // La Session del snapshot procede solo de sessionStorage de esta pestaña, no de localStorage.
  const session = snapshot.status === 'ready' ? snapshot.data.Session : null;
  const user = session?.role === 'admin'
    ? { id: 'admin', name: 'Administrador', email: session.email, role: 'admin' }
    : publicCustomer(snapshot.data?.Customers.find((customer) => customer.id === session?.userId));

  const value = useMemo(() => ({
    status: snapshot.status === 'loading' ? 'loading' : snapshot.status === 'error' ? 'error' : session ? 'authenticated' : 'anonymous',
    user,
    role: session?.role ?? null,
    error: snapshot.error,
    login: service.login,
    register: service.register,
    logout: service.logout,
    retry: database.retry,
    selectedAddress: getSelectedAddress(user),
    updateProfile: profile.updateProfile,
    saveAddress: profile.saveAddress,
    deleteAddress: profile.deleteAddress,
    selectAddress: profile.selectAddress,
    setDefaultAddress: profile.setDefaultAddress,
  }), [snapshot, service, session, user, database, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
