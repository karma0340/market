'use client';
import React, { useRef, useEffect } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { 
  Bell, Check, Trash2, ShoppingBag, 
  UserCheck, XCircle, Award, CreditCard, 
  Info, Sparkles, Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_CONFIG = {
  new_sale: { icon: ShoppingBag, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  broker_approved: { icon: UserCheck, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
  broker_rejected: { icon: XCircle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  product_approved: { icon: Award, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  product_rejected: { icon: XCircle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  withdrawal_request: { icon: Clock, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  withdrawal_approved: { icon: CreditCard, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
  system: { icon: Info, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  broker_request: { icon: Clock, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  product_submitted: { icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
};

export default function NotificationDropdown({ isOpen, onClose }) {
  const store = useNotificationStore();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      store.fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const notifications = store.notifications || [];

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-3xl border border-white/[0.08] bg-[#0A0A0C]/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-black/40">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#ff007f]" />
          <span className="text-xs font-black uppercase tracking-widest text-white">Notifications</span>
        </div>
        {store.unreadCount > 0 && (
          <button 
            onClick={() => store.markAllAsRead()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02]"
          >
            <Check className="h-3 w-3 text-emerald-400" /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-white/[0.04] custom-scrollbar">
        <AnimatePresence initial={false}>
          {notifications.map((n) => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
            const Icon = config.icon;

            return (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                onClick={() => {
                  if (!n.isRead) store.markAsRead(n._id);
                }}
                className={`p-4 flex gap-3.5 items-start cursor-pointer hover:bg-white/[0.02] transition-colors relative group ${
                  !n.isRead ? 'bg-[#ff007f]/[0.02]' : ''
                }`}
              >
                {/* Icon wrapper */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-white truncate">{n.title}</p>
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 bg-[#ff007f] rounded-full shrink-0 animate-pulse shadow-[0_0_6px_rgba(255,0,127,0.8)]" />
                    )}
                  </div>
                  <p className="text-[10px] text-[#94A3B8] mt-1 leading-normal break-words">{n.message}</p>
                  <span className="text-[8px] font-bold text-[#64748B] uppercase tracking-wider mt-2 block font-mono">
                    {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} @ {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-full border border-white/[0.06] bg-white/[0.02] flex items-center justify-center mx-auto mb-3">
              <Check className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-xs font-bold text-white">All Caught Up!</p>
            <p className="text-[9px] text-[#6B7280] mt-1">No new alerts or system updates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
