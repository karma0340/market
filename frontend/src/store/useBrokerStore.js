import { create } from 'zustand';
import api from '../lib/axios';

export const useBrokerStore = create((set, get) => ({
  stats: null,
  products: [],
  isLoading: false,

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/broker/stats');
      set({ stats: res.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch broker stats', error);
      set({ isLoading: false });
    }
  },

  fetchProducts: async () => {
    try {
      const res = await api.get('/broker/products');
      set({ products: res.data });
    } catch (error) {
      console.error('Failed to fetch broker products', error);
    }
  },

  sendOtp: async (mobileNumber) => {
    try {
      const res = await api.post('/verify/send-otp', { mobileNumber });
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  validateOtp: async (data) => {
    try {
      const res = await api.post('/verify/validate-otp', data);
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  fetchWallet: async () => {
    try {
      const res = await api.get('/wallet');
      set((state) => ({ stats: { ...state.stats, wallet: res.data } }));
      return res.data;
    } catch (error) {
      console.error('Failed to fetch wallet', error);
      throw error.response?.data || error;
    }
  },

  updatePayoutMethods: async (data) => {
    try {
      const res = await api.put('/wallet/payout-methods', data);
      await get().fetchWallet();
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  requestPayout: async (amount, method) => {
    try {
      const res = await api.post('/wallet/withdraw', { amount, method });
      await get().fetchWallet();
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  changePassword: async (data) => {
    try {
      const res = await api.put('/auth/change-password', data);
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateAsset: async (id, formData) => {
    try {
      const res = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await get().fetchProducts();
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
}));
