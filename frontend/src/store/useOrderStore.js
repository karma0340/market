import { create } from 'zustand';
import api from '../lib/axios';

export const useOrderStore = create((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/orders/myorders');
      set({ orders: res.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  hasPurchased: (productId) => {
    return get().orders.some(order => 
      order.status === 'paid' && 
      (order.productId?._id === productId || order.productId === productId)
    );
  }
}));
