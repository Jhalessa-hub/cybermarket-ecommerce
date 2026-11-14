import { AuthProvider } from '../context/AuthContext.jsx';
import { ShopProvider } from '../context/ShopContext.jsx';
import { localDatabase } from '../services/storage/localDatabase.js';

export function AppProviders({ children, database = localDatabase }) {
  return (
    <AuthProvider database={database}>
      <ShopProvider database={database}>{children}</ShopProvider>
    </AuthProvider>
  );
}
