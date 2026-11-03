'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CartItem = {
  id: string;
  productId: string;
  title: string;
  slug: string;
  price: number;
  regularPrice?: number;
  image?: string;
  quantity: number;
  selectedVariant?: string;
  tenantDomain?: string;
};

type CartStore = {
  cart: CartItem[];
  isCartDrawerOpen: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  toggleCartDrawer: (open?: boolean) => void;
  
  // Computed Helpers
  getCartCount: () => number;
  getCartTotal: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartDrawerOpen: false,

      // ➕ 1. Add Item to Cart (or increment quantity if already exists)
      addItem: (newItem) => {
        const currentCart = get().cart;
        const existingIndex = currentCart.findIndex(
          (item) =>
            item.productId === newItem.productId &&
            item.selectedVariant === newItem.selectedVariant
        );

        if (existingIndex > -1) {
          const updatedCart = [...currentCart];
          updatedCart[existingIndex].quantity += newItem.quantity || 1;
          set({ cart: updatedCart, isCartDrawerOpen: true });
        } else {
          const itemToAdd: CartItem = {
            ...newItem,
            id: `cart-${newItem.productId}-${Date.now()}`,
            quantity: newItem.quantity || 1,
          };
          set({ cart: [itemToAdd, ...currentCart], isCartDrawerOpen: true });
        }
      },

      // 🗑️ 2. Remove Item from Cart
      removeItem: (id) => {
        set({ cart: get().cart.filter((item) => item.id !== id) });
      },

      // 🔄 3. Update Item Quantity (+1 / -1)
      updateQuantity: (id, delta) => {
        const currentCart = get().cart;
        const updatedCart = currentCart
          .map((item) => {
            if (item.id === id) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as CartItem[];

        set({ cart: updatedCart });
      },

      // 🧹 4. Clear Entire Cart
      clearCart: () => {
        set({ cart: [] });
      },

      // 🚪 5. Toggle Cart Drawer Visibility
      toggleCartDrawer: (open) => {
        set((state) => ({
          isCartDrawerOpen: open !== undefined ? open : !state.isCartDrawerOpen,
        }));
      },

      // 📊 6. Get Total Product Quantity Count
      getCartCount: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },

      // 💰 7. Get Cart Total Subtotal Amount
      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'merchant_cart_storage', // LocalStorage Key
      storage: createJSONStorage(() => localStorage),
    }
  )
);