"use client";

import { create } from 'zustand';

const THEME_KEY = 'dm-theme';

export const useThemeStore = create((set) => ({
  theme: 'dark',

  initTheme: () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(THEME_KEY);
    const preferred = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', preferred);
    set({ theme: preferred });
  },

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      return { theme: next };
    }),

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(THEME_KEY, theme);
    }
    set({ theme });
  },
}));
