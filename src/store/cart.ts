import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductVariant } from '@/types';

interface CartState {
  items: CartItem[];
  coupon: string | null;
  appliedCoupon: { code: string; discount: number } | null;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getDeliveryCharge: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      appliedCoupon: null,

      addItem: (product, quantity = 1, variant) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (item) => 
            item.product.id === product.id && 
            item.variant?.id === variant?.id
        );

        if (existingIndex > -1) {
          const newItems = [...items];
          newItems[existingIndex].quantity += quantity;
          set({ items: newItems });
        } else {
          set({ items: [...items, { product, quantity, variant }] });
        }
      },

      removeItem: (productId, variantId) => {
        const items = get().items.filter(
          (item) => !(item.product.id === productId && item.variant?.id === variantId)
        );
        set({ items });
      },

      updateQuantity: (productId, quantity, variantId) => {
        const items = get().items.map((item) =>
          item.product.id === productId && item.variant?.id === variantId
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        );
        set({ items });
      },

      clearCart: () => set({ items: [], coupon: null, appliedCoupon: null }),

      applyCoupon: (code, discount) => set({ appliedCoupon: { code, discount } }),
      
      removeCoupon: () => set({ appliedCoupon: null }),

      getTotal: () => {
        const { items, appliedCoupon } = get();
        const subtotal = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        const discount = appliedCoupon?.discount || 0;
        return Math.max(0, subtotal - discount + get().getDeliveryCharge());
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },

      getDiscount: () => {
        const { appliedCoupon } = get();
        return appliedCoupon?.discount || 0;
      },

      getDeliveryCharge: () => 0,

      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'rangao-cart',
    }
  )
);