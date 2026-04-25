import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          set({ user: res.data, token: res.data.token, isLoading: false });
          return res.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (name, email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/register', { name, email, password, role });
          set({ user: res.data, token: res.data.token, isLoading: false });
          return res.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Registration failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null });
      },

      fetchProfile: async () => {
        try {
          const res = await api.get('/auth/profile');
          set({ user: res.data });
        } catch (error) {
          console.error('Failed to fetch profile', error);
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
