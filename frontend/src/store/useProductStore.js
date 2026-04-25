import { create } from 'zustand';
import api from '../lib/axios';

export const useProductStore = create((set) => ({
  products: [],
  product: null,
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/products');
      set({ products: res.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/products/${id}`);
      set({ product: res.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/products', productData);
      set({ isLoading: false });
      return res.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create product', 
        isLoading: false 
      });
      throw error;
    }
  }
}));
