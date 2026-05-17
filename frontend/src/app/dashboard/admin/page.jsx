"use client";
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAdminStore } from '@/store/useAdminStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import NotificationDropdown from '@/components/NotificationDropdown';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, X } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import OverviewTab  from '@/components/admin/OverviewTab';
import ReportsTab   from '@/components/admin/ReportsTab';
import OrdersTab    from '@/components/admin/OrdersTab';
import SettingsTab  from '@/components/admin/SettingsTab';
import PayoutsTab   from '@/components/admin/PayoutsTab';

const TITLES = { overview: 'Admin Dashboard', brokers: 'Brokers', orders: 'Orders', products: 'Products', payouts: 'Payouts', users: 'Users', settings: 'Settings' };

export default function AdminDashboard() {
  const { user, logout, isHydrated } = useAuthStore();
  const store = useAdminStore();
  const notifStore = useNotificationStore();
  const router = useRouter();
  const [tab, setTab]           = useState('overview');
  const [search, setSearch]     = useState('');
  const [sideOpen, setSideOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    store.fetchStats();
    store.fetchPendingBrokers();
    store.fetchAllBrokers();
    store.fetchAllProducts();
    store.fetchUsers();
    store.fetchOrders();
    store.fetchPendingWithdrawals();
    notifStore.fetchUnreadCount();
    notifStore.fetchNotifications();
  }, [isHydrated, user]);

  if (!isHydrated) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#ff007f] border-t-transparent animate-spin" />
    </div>
  );
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <AdminSidebar tab={tab} setTab={setTab} user={user} logout={logout} router={router} open={sideOpen} setOpen={setSideOpen} />

      {/* Main column */}
      <div className="lg:ml-56 flex flex-col min-h-screen">

        {/* Top navbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4 bg-[#0D0D0F]/95 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-1 text-[#6B7280] hover:text-white rounded-lg hover:bg-white/5 transition-all"
              onClick={() => setSideOpen(v => !v)}
            >
              {sideOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <p className="text-[10px] text-[#6B7280] uppercase tracking-widest leading-none">Admin</p>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight">{TITLES[tab]}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B7280]" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-36 lg:w-48 bg-white/5 border border-white/[0.08] rounded-full py-2 pl-9 pr-4 text-xs text-white outline-none focus:border-[#ff007f] focus:bg-white/8 transition-all placeholder-[#6B7280]"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(v => !v)}
                className="relative p-2 rounded-xl bg-white/5 border border-white/[0.08] hover:bg-white/10 hover:border-white/[0.15] transition-all outline-none"
              >
                <Bell className="h-4 w-4 text-[#94A3B8] hover:text-white" />
                {notifStore.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-[#ff007f] shadow-[0_0_8px_rgba(255,0,127,0.8)] text-[8px] font-bold text-white">
                    {notifStore.unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff007f] to-[#b200ff] flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(255,0,127,0.35)]">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {tab === 'overview'  && <OverviewTab  stats={store.stats} />}
          {tab === 'brokers'   && <ReportsTab   store={store} tab="brokers" search={search} />}
          {tab === 'products'  && <ReportsTab   store={store} tab="products" search={search} />}
          {tab === 'payouts'   && <PayoutsTab   store={store} search={search} />}
          {tab === 'users'     && <ReportsTab   store={store} tab="users" search={search} />}
          {tab === 'orders'    && <OrdersTab    orders={store.orders} search={search} />}
          {tab === 'settings'  && <SettingsTab  user={user} logout={logout} router={router} />}
        </main>
      </div>
    </div>
  );
}
