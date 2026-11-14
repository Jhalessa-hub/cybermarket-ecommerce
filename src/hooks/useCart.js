import { useShop } from './useShop.js';

export function useCart() {
  const shop = useShop();
  return {
    ...shop.cartSummary,
    status: shop.status,
    error: shop.error ?? shop.cartSummary.error,
    isOpen: shop.cartOpen,
    open: shop.openCart,
    close: shop.closeCart,
    add: shop.addToCart,
    setQuantity: shop.updateCartQuantity,
    remove: shop.removeFromCart,
  };
}
