import { Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import CustomerLayout from '../components/layout/CustomerLayout.jsx';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import SessionState from '../components/feedback/SessionState.jsx';
import StorePage from '../pages/StorePage.jsx';
import Home from '../pages/Home.jsx';
import Catalog from '../pages/Catalog.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import CheckoutPage from '../pages/CheckoutPage.jsx';
import OrderConfirmationPage from '../pages/OrderConfirmationPage.jsx';
import MyOrdersPage from '../pages/MyOrdersPage.jsx';
import OrderDetailPage from '../pages/OrderDetailPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx';
import AdminProductsPage from '../pages/admin/AdminProductsPage.jsx';
import AdminLogisticsPage from '../pages/admin/AdminLogisticsPage.jsx';
import AdminCustomersPage from '../pages/admin/AdminCustomersPage.jsx';
import PublicRoute from './PublicRoute.jsx';
import CustomerRoute from './CustomerRoute.jsx';
import AdminRoute from './AdminRoute.jsx';
import { paths } from './routePaths.js';

export default function AppRouter() {
  return <SessionState><Routes>
    <Route element={<AppShell />}>
      <Route element={<CustomerLayout />}>
        <Route path={paths.store} element={<Home />} />
        <Route path={paths.search} element={<Catalog />} />
        <Route path={paths.catalog} element={<Catalog />} />
        <Route path="/products/:productId" element={<StorePage />} />
        <Route path={paths.cart} element={<StorePage cartRoute />} />
        <Route element={<PublicRoute />}>
          <Route path={paths.login} element={<LoginPage />} />
          <Route path={paths.register} element={<RegisterPage />} />
        </Route>
        <Route element={<CustomerRoute />}>
          <Route path={paths.profile} element={<ProfilePage />} />
          <Route path={paths.checkout} element={<CheckoutPage />} />
          <Route path="/checkout/confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path={paths.orders} element={<MyOrdersPage />} />
          <Route path="/my-orders/:orderId" element={<OrderDetailPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path={paths.admin} element={<AdminDashboardPage />} />
          <Route path={paths.products} element={<AdminProductsPage />} />
          <Route path={paths.logistics} element={<AdminLogisticsPage />} />
          <Route path={paths.customers} element={<AdminCustomersPage />} />
          <Route path="/admin/*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Route>
  </Routes></SessionState>;
}
