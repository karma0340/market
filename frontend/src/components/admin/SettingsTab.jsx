'use client';
import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/useThemeStore';
import { LogOut } from 'lucide-react';

export default function SettingsTab({ user, logout, router }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6 max-w-xl">
      <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-6 space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#ff007f]">Account Information</h3>
        {[['Display Name', user?.name], ['Email Address', user?.email], ['Role', 'Administrator']].map(([label, val]) => (
          <div key={label}>
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">{label}</p>
            <div className="bg-black/40 border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#94A3B8] font-medium">{val}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#ff007f]">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Dark Mode</p>
            <p className="text-xs text-[#6B7280] mt-0.5">Toggle the global site theme</p>
          </div>
          <button 
            onClick={toggleTheme}
            className={`w-10 h-5 rounded-full relative transition-colors ${isDark ? 'bg-[#ff007f] shadow-[0_0_10px_rgba(255,0,127,0.4)]' : 'bg-[#475569]'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isDark ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400">Danger Zone</h3>
        <p className="text-sm text-[#6B7280]">This will end your current admin session immediately.</p>
        <button
          onClick={() => { logout(); router.push('/login'); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 text-sm font-bold border border-rose-500/20 hover:bg-rose-500/20 transition-all"
        >
          <LogOut className="h-4 w-4" /> Logout from Session
        </button>
      </div>
    </motion.div>
  );
}
