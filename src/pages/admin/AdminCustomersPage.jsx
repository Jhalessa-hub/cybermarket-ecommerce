import { useState } from 'react';
import { useShop } from '../../hooks/useShop.js';
import AdminHeading from '../../components/admin/AdminHeading.jsx';
import CustomerTable from '../../components/admin/CustomerTable.jsx';
import FormField from '../../components/auth/FormField.jsx';

export default function AdminCustomersPage() {
  const { customers } = useShop();
  const [query, setQuery] = useState('');
  const filtered = customers.filter((customer) => `${customer.name} ${customer.email} ${customer.phone}`.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es')));
  return <div className="space-y-7"><AdminHeading title="Clientes" description="Consulta las cuentas registradas y su actividad de compra." /><FormField label="Buscar clientes" type="search" value={query} onChange={(event) => setQuery(event.target.value)} hint="Por nombre, email o teléfono." /><p className="text-xs text-ink-muted">{filtered.length} clientes encontrados · Cuentas registradas</p><CustomerTable customers={filtered} /></div>;
}
