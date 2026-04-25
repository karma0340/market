import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({
      items: [], // [{ product, quantity: 1 }]
      
      addToCart: (product) => set((state) => {
        const existing = state.items.find(item => item.product._id === product._id);
        if (existing) return state; // Prevent duplicates since digital items are bought once
        return { items: [...state.items, { product, quantity: 1 }] };
      }),

      removeFromCart: (productId) => set((state) => ({
        items: state.items.filter(item => item.product._id !== productId)
      })),

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        const state = useCartStore.getState();
        return state.items.reduce((total, item) => total + item.product.price, 0);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);
