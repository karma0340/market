"use client";
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';

export default function NotificationPoller() {
  const { user } = useAuthStore();
  const { fetchNotifications, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    if (!user) return;

    // Fetch immediately on mount or user change
    fetchNotifications();
    fetchUnreadCount();

    // Poll every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, [user, fetchNotifications, fetchUnreadCount]);

  return null; // This is a logic-only component
}
