import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { setAuthToken } from '../lib/axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isHydrated: false,
      
      setHydrated: () => set({ isHydrated: true }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          set({ user: res.data, token: res.data.token, isLoading: false });
          setAuthToken(res.data.token);
          return res.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      loginWithGoogle: async (idToken) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/google', { idToken });
          set({ user: res.data, token: res.data.token, isLoading: false });
          setAuthToken(res.data.token);
          return res.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Google Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      loginWithGithub: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/github', { code });
          set({ user: res.data, token: res.data.token, isLoading: false });
          setAuthToken(res.data.token);
          return res.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'GitHub Login failed', 
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
          setAuthToken(res.data.token);
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
        setAuthToken(null);
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
      onRehydrateStorage: () => (state) => {
        if (state && state.token) {
          setAuthToken(state.token);
        }
        state?.setHydrated?.();
      },
    }
  )
);
