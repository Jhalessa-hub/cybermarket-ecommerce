import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useLocalDatabase } from '../hooks/useLocalDatabase.js';
import { localDatabase } from '../services/storage/localDatabase.js';
import { adminCustomers } from '../services/customerService.js';
import { calculateMetrics } from '../services/metricsService.js';
import { createProductService } from '../services/productService.js';
import { createCartService, reconcileCart, summarizeCart } from '../services/cartService.js';
import { errorMessage } from '../utils/errorMessages.js';
import { createOrderService, customerOrders } from '../services/orderService.js';

export const ShopContext = createContext(null);
const EMPTY = Object.freeze([]);

export function ShopProvider({ children, database = localDatabase }) {
  const snapshot = useLocalDatabase(database);
  const auth = useAuth();
  const service = useMemo(() => createCartService(database), [database]);
  const orderService = useMemo(() => createOrderService(database), [database]);
  const productService = useMemo(() => createProductService(database), [database]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const sequence = useRef(0);
  const notify = useCallback((message, type = 'error') => {
    setNotifications((previous) => [...previous.slice(-2), { id: ++sequence.current, message, type }]);
  }, []);
  const dismissNotification = useCallback((id) => setNotifications((previous) => previous.filter((item) => item.id !== id)), []);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const cartAction = useCallback((action) => {
    try { action(); return true; }
    catch (error) { notify(errorMessage(error)); return false; }
  }, [notify]);
  useEffect(() => {
    if (snapshot.status !== 'ready' || auth.role === 'admin') return;
    if (!reconcileCart(snapshot.cart.lines, snapshot.data.Products).adjustments.length) return;
    try {
      const changes = service.reconcile();
      changes.forEach((message) => notify(message, 'warning'));
    } catch (error) { notify(errorMessage(error)); }
  }, [snapshot, service, auth.role, notify]);
  useEffect(() => { if (auth.role === 'admin') setCartOpen(false); }, [auth.role]);
  const value = useMemo(() => {
    const ready = snapshot.status === 'ready';
    // storage actualiza las tablas compartidas sin sustituir la identidad de esta pestaña.
    const data = ready ? snapshot.data : null;
    const admin = auth.role === 'admin';
    const orders = !data ? EMPTY : admin ? data.Orders : auth.role === 'customer' ? customerOrders(data) : EMPTY;
    const customers = admin && data ? adminCustomers(data) : EMPTY;
    let metrics = null, metricsError = null;
    if (admin && data) { try { metrics = calculateMetrics(data); } catch (failure) { metricsError = failure; } }
    const cart = ready ? snapshot.cart.lines : EMPTY;
    const adjusted = ready ? reconcileCart(cart, data.Products) : { lines: EMPTY, adjustments: [] };
    let summary;
    try { summary = summarizeCart(adjusted.lines, data?.Products ?? EMPTY); }
    catch (error) { summary = { lines: EMPTY, totalCents: 0, itemCount: cart.reduce((count, line) => count + line.quantity, 0), error }; }
    return {
      status: snapshot.status,
      dataRevision: data?.revision ?? null,
      error: snapshot.error,
      products: data?.Products.filter((product) => admin || product.active) ?? EMPTY,
      categories: data?.Categories ?? EMPTY,
      orders,
      customers,
      metrics,
      metricsError,
      createProduct: productService.createProduct,
      updateProduct: productService.updateProduct,
      deactivateProduct: productService.deactivateProduct,
      updateOrderStatus: orderService.updateOrderStatus,
      cart,
      cartSummary: { ...summary, adjustments: adjusted.adjustments },
      cartOpen,
      openCart,
      closeCart,
      addToCart: (id, quantity = 1) => cartAction(() => service.add(id, quantity)),
      updateCartQuantity: (id, quantity) => cartAction(() => service.setQuantity(id, quantity)),
      removeFromCart: (id) => cartAction(() => service.remove(id)),
      reviewCheckout: orderService.reviewCheckout,
      confirmCheckout: orderService.confirmCheckout,
      notifications,
      notify,
      dismissNotification,
      retry: database.retry,
    };
  }, [snapshot, auth.role, auth.user?.id, database, service, orderService, productService, cartAction, cartOpen, openCart, closeCart, notifications, notify, dismissNotification]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
