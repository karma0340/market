import { create } from 'zustand';
import api from '../lib/axios';

export const useAdminStore = create((set, get) => ({
  // Dashboard stats
  stats: null,
  isLoadingStats: false,

  // Pending brokers
  pendingBrokers: [],
  allBrokers: [],

  // Products
  allProducts: [],
  pendingProducts: [],

  // Users
  users: [],

  // Orders
  orders: [],

  // Withdrawals
  pendingWithdrawals: [],

  // Notifications
  notifications: [],
  unreadCount: 0,

  // ── Dashboard Stats ──
  fetchStats: async () => {
    set({ isLoadingStats: true });
    try {
      const res = await api.get('/admin/stats');
      set({ stats: res.data, isLoadingStats: false });
    } catch (error) {
      console.error('Failed to fetch admin stats', error);
      set({ isLoadingStats: false });
    }
  },

  // ── Broker Approval ──
  fetchPendingBrokers: async () => {
    try {
      const res = await api.get('/admin/brokers/pending');
      set({ pendingBrokers: res.data });
    } catch (error) {
      console.error('Failed to fetch pending brokers', error);
    }
  },

  fetchAllBrokers: async () => {
    try {
      const res = await api.get('/admin/brokers');
      set({ allBrokers: res.data });
    } catch (error) {
      console.error('Failed to fetch brokers', error);
    }
  },

  approveBroker: async (id) => {
    try {
      await api.put(`/admin/brokers/${id}/approve`);
      set(state => ({
        pendingBrokers: state.pendingBrokers.filter(b => b._id !== id),
        allBrokers: state.allBrokers.map(b => 
          b._id === id ? { ...b, brokerStatus: 'approved' } : b
        ),
      }));
      return true;
    } catch (error) {
      console.error('Failed to approve broker', error);
      return false;
    }
  },

  rejectBroker: async (id, reason) => {
    try {
      await api.put(`/admin/brokers/${id}/reject`, { reason });
      set(state => ({
        pendingBrokers: state.pendingBrokers.filter(b => b._id !== id),
        allBrokers: state.allBrokers.map(b => 
          b._id === id ? { ...b, brokerStatus: 'rejected' } : b
        ),
      }));
      return true;
    } catch (error) {
      console.error('Failed to reject broker', error);
      return false;
    }
  },

  // ── Products ──
  fetchAllProducts: async () => {
    try {
      const res = await api.get('/admin/products');
      set({ allProducts: res.data });
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  },

  fetchPendingProducts: async () => {
    try {
      const res = await api.get('/admin/products/pending');
      set({ pendingProducts: res.data });
    } catch (error) {
      console.error('Failed to fetch pending products', error);
    }
  },

  updateProductStatus: async (id, status) => {
    try {
      await api.put(`/admin/products/${id}/status`, { status });
      set(state => ({
        allProducts: state.allProducts.map(p => 
          p._id === id ? { ...p, status } : p
        ),
        pendingProducts: state.pendingProducts.filter(p => p._id !== id),
      }));
      return true;
    } catch (error) {
      console.error('Failed to update product status', error);
      return false;
    }
  },

  deleteProduct: async (id) => {
    try {
      await api.delete(`/admin/products/${id}`);
      set(state => ({
        allProducts: state.allProducts.filter(p => p._id !== id),
      }));
      return true;
    } catch (error) {
      console.error('Failed to delete product', error);
      return false;
    }
  },

  // ── Users ──
  fetchUsers: async () => {
    try {
      const res = await api.get('/admin/users');
      set({ users: res.data });
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  },

  // ── Orders ──
  fetchOrders: async () => {
    try {
      const res = await api.get('/admin/orders');
      set({ orders: res.data });
    } catch (error) {
      console.error('Failed to fetch orders', error);
    }
  },

  // ── Withdrawals ──
  fetchPendingWithdrawals: async () => {
    try {
      const res = await api.get('/admin/withdrawals');
      set({ pendingWithdrawals: res.data });
    } catch (error) {
      console.error('Failed to fetch pending withdrawals', error);
    }
  },

  approveWithdrawal: async (id) => {
    try {
      await api.put(`/admin/withdrawals/${id}/approve`);
      set(state => ({
        pendingWithdrawals: state.pendingWithdrawals.filter(w => w._id !== id)
      }));
      return true;
    } catch (error) {
      console.error('Failed to approve withdrawal', error);
      return false;
    }
  },

  // ── Notifications ──
  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      set({ notifications: res.data });
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      set({ unreadCount: res.data.count });
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  },

  markNotificationRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set(state => ({
        notifications: state.notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark notification read', error);
    }
  },

  markAllRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  },
}));
