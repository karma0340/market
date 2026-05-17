import { create } from 'zustand';
import api from '../lib/axios';
import { useAuthStore } from './useAuthStore';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  fetchNotifications: async () => {
    // Only fetch if user is logged in
    const token = useAuthStore.getState().token;
    if (!token) return;
    
    try {
      const res = await api.get('/notifications');
      set({ notifications: res.data });
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  },

  fetchUnreadCount: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    
    try {
      const res = await api.get('/notifications/unread-count');
      set({ unreadCount: res.data.count });
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set(state => ({
        notifications: state.notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  },
}));
