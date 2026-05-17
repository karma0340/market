'use client';
import { LayoutGrid, ShoppingBag, TrendingUp, Settings, Home, LogOut, HelpCircle, Package, Users, ShieldCheck, DollarSign } from 'lucide-react';
import Link from 'next/link';

const MAIN_NAV = [
  { id: 'overview',  label: 'Dashboard',  icon: LayoutGrid },
  { id: 'brokers',   label: 'Brokers',    icon: ShieldCheck },
  { id: 'orders',    label: 'Orders',     icon: ShoppingBag },
  { id: 'products',  label: 'Products',   icon: Package },
  { id: 'payouts',   label: 'Payouts',    icon: DollarSign },
  { id: 'users',     label: 'Users',      icon: Users },
];

const BOTTOM_NAV = [
  { id: 'settings',  label: 'Settings',   icon: Settings },
];

function NavItem({ id, label, Icon, active, onClick }) {
  return (
    <button onClick={() => onClick(id)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      active
        ? 'bg-[#ff007f] text-white shadow-[0_0_16px_rgba(255,0,127,0.35)]'
        : 'text-[#6B7280] hover:text-white hover:bg-white/5'
    }`}>
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

export default function AdminSidebar({ tab, setTab, user, logout, router, open, setOpen }) {
  const handleNav = (id) => { setTab(id); setOpen(false); };

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/70 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`
        fixed top-0 left-0 h-screen z-40 flex flex-col
        w-56 bg-[#0A0A0A] border-r border-white/[0.06]
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 pt-7 pb-8">
          <div className="w-8 h-8 rounded-lg bg-[#ff007f] flex items-center justify-center text-white font-black text-sm shadow-[0_0_12px_rgba(255,0,127,0.5)]">
            N
          </div>
          <span className="text-white font-extrabold tracking-tight">NexusAdmin</span>
        </div>

        {/* Main nav */}
        <div className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {MAIN_NAV.map(({ id, label, icon: Icon }) => (
            <NavItem key={id} id={id} label={label} Icon={Icon} active={tab === id} onClick={handleNav} />
          ))}

          <div className="pt-2 mt-2 border-t border-white/[0.06]">
            <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#6B7280] hover:text-white hover:bg-white/5 transition-all">
              <Home className="h-4 w-4 flex-shrink-0" />
              <span>Back to Site</span>
            </Link>
          </div>
        </div>

        {/* Bottom nav: support + settings */}
        <div className="px-3 pb-2 space-y-0.5 border-t border-white/[0.06] pt-3">
          {BOTTOM_NAV.map(({ id, label, icon: Icon }) => (
            <NavItem key={id} id={id} label={label} Icon={Icon} active={tab === id} onClick={handleNav} />
          ))}
          <button onClick={() => { logout(); router.push('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all">
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>

        {/* User avatar at base */}
        <div className="px-4 py-4 border-t border-white/[0.06] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff007f] to-[#b200ff] flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-[0_0_10px_rgba(255,0,127,0.4)]">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-[#6B7280] truncate">{user?.email}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
