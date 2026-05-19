"use client";
import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useBrokerStore } from '@/store/useBrokerStore';
import { useAdminStore } from '@/store/useAdminStore';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/store/useNotificationStore';
import NotificationDropdown from '@/components/NotificationDropdown';
import Link from 'next/link';
import { LayoutGrid, Package, BarChart3, Settings, DollarSign, ShoppingBag, PlusCircle, Bell, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, Eye, Upload, ShieldCheck, Phone, Smartphone, Send, HeadphonesIcon, Home, LogOut, Menu, X, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { NeonAreaChart, NeonLineChart, GlowingProgressCircle, AssetPerformanceChart } from '@/components/NeonCharts';

const TABS = [
  { id: 'overview', label: 'Dashboard', icon: LayoutGrid },
  { id: 'assets', label: 'My Assets', icon: Package },
  { id: 'sales', label: 'Sales', icon: BarChart3 },
  { id: 'payouts', label: 'Payouts', icon: DollarSign },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const BOTTOM_TABS = [
  { id: 'support', label: 'Support', icon: HeadphonesIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function StatCard({ label, value, icon: Icon, trend, color, chartData, chartColor }) {
  return (
    <div className="rounded-2xl p-5 border border-[#1E293B] bg-[#0F172A] hover:border-[#334155] transition-all relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative z-10 flex items-start justify-between mb-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#64748B]">{label}</span>
          <div className="flex items-end gap-3 mt-1">
            <p className="text-2xl font-extrabold text-white tracking-tight">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center gap-0.5 mb-1">
                {trend >= 0 ? <ArrowUpRight className="h-3 w-3 text-emerald-400" /> : <ArrowDownRight className="h-3 w-3 text-rose-400" />}
                <span className={`text-xs font-bold ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {chartData && (
        <div className="relative h-16 mt-2 -mx-2 opacity-80 group-hover:opacity-100 transition-opacity overflow-hidden">
          <NeonAreaChart data={chartData} dataKey="value" color={chartColor} height={64} />
        </div>
      )}
    </div>
  );
}

function VerificationSection({ user, sendOtp, validateOtp }) {
  const [step, setStep] = useState(user.isPhoneVerified ? 'verified' : 'input');
  const [mobileNumber, setMobileNumber] = useState(user.phone || '');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [operator, setOperator] = useState('');

  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      toast.error('Enter a valid mobile number');
      return;
    }
    setIsLoading(true);
    try {
      const res = await sendOtp(mobileNumber);
      setOperator(res.operator);
      setStep('otp');
      toast.success(`OTP sent via ${res.operator}`);
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp) {
      toast.error('Enter the OTP');
      return;
    }
    setIsLoading(true);
    try {
      await validateOtp({ mobileNumber, otp, operator });
      setStep('verified');
      toast.success('Identity verified successfully!');
      window.location.reload();
    } catch (err) {
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'verified' || user.isPhoneVerified) {
    return (
      <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400"><ShieldCheck className="h-6 w-6" /></div>
          <div><p className="text-sm font-bold text-white uppercase tracking-wider">Identity Verified</p><p className="text-xs text-[#64748B]">Your account is verified via {user.verificationData?.operator || 'ISP'}.</p></div>
          <CheckCircle className="ml-auto h-5 w-5 text-emerald-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border border-[#b200ff]/20 bg-[#b200ff]/5">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-xl bg-[#b200ff]/10 text-[#b200ff]"><Smartphone className="h-6 w-6" /></div>
        <div><p className="text-sm font-bold text-white uppercase tracking-wider">Identity Verification</p><p className="text-xs text-[#64748B]">Verify your identity via your ISP (Jio/Airtel/Vi) to increase trust.</p></div>
      </div>
      <AnimatePresence mode="wait">
        {step === 'input' ? (
          <motion.div key="input" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-2 ml-1">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569]" />
                <input type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="e.g. 9876543210"
                  className="w-full bg-[#020617] border border-[#1E293B] rounded-xl py-3 pl-12 pr-4 text-white text-sm font-semibold outline-none focus:border-[#b200ff] transition-all" />
              </div>
            </div>
            <button onClick={handleSendOtp} disabled={isLoading} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#b200ff] to-[#ff007f] text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
              {isLoading ? 'Processing...' : <><Send className="h-4 w-4" /> Send OTP</>}
            </button>
          </motion.div>
        ) : (
          <motion.div key="otp" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-2 ml-1">Enter OTP sent to {mobileNumber}</label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit OTP"
                className="w-full bg-[#020617] border border-[#1E293B] rounded-xl py-3 px-4 text-white text-center text-lg font-bold tracking-[0.5em] outline-none focus:border-[#b200ff] transition-all" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('input')} className="flex-1 py-3 rounded-xl bg-[#1E293B] text-[#94A3B8] font-bold text-sm">Back</button>
              <button onClick={handleVerify} disabled={isLoading} className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-[#b200ff] to-[#ff007f] text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BrokerDashboard() {
  const { user, logout, isHydrated } = useAuthStore();
  const { stats, products, fetchStats, fetchProducts, sendOtp, validateOtp, fetchWallet, requestPayout, changePassword, updatePayoutMethods } = useBrokerStore();
  const { unreadCount, fetchNotifications, fetchUnreadCount } = useNotificationStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [sideOpen, setSideOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState('');
  
  const [payoutMethods, setPayoutMethods] = useState({
    cryptoAddress: '',
    gpay: '',
    upi: '',
    paypal: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankName: ''
  });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleNav = (id) => {
    setActiveTab(id);
    setSideOpen(false);
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || user.role !== 'broker') { router.push('/login'); return; }
    fetchStats();
    fetchProducts();
    fetchWallet();
    fetchNotifications();
    fetchUnreadCount();
  }, [user, isHydrated]);

  useEffect(() => {
    if (stats?.wallet?.payoutMethods) {
      const pm = stats.wallet.payoutMethods;
      setPayoutMethods({
        cryptoAddress: pm.crypto?.address || '',
        gpay: pm.gpay || '',
        upi: pm.upi || '',
        paypal: pm.paypal || '',
        bankAccountName: pm.bankTransfer?.accountName || '',
        bankAccountNumber: pm.bankTransfer?.accountNumber || '',
        bankIfscCode: pm.bankTransfer?.ifscCode || '',
        bankName: pm.bankTransfer?.bankName || ''
      });
    }
  }, [stats?.wallet]);

  const handlePayout = async () => {
    if (!payoutAmount || Number(payoutAmount) <= 0) return toast.error("Enter a valid amount");
    if (!selectedPayoutMethod) return toast.error("Select a payout method");
    setIsActionLoading(true);
    try {
      await requestPayout(Number(payoutAmount), selectedPayoutMethod);
      toast.success(`Payout requested via ${selectedPayoutMethod.toUpperCase()}!`);
      setPayoutAmount('');
    } catch (err) {
      toast.error(err.message || "Failed to request payout");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePayoutMethodsUpdate = async () => {
    setIsActionLoading(true);
    try {
      await updatePayoutMethods({
        crypto: { address: payoutMethods.cryptoAddress, currency: 'usdttrc20' },
        gpay: payoutMethods.gpay,
        upi: payoutMethods.upi,
        paypal: payoutMethods.paypal,
        bankTransfer: {
          accountName: payoutMethods.bankAccountName,
          accountNumber: payoutMethods.bankAccountNumber,
          ifscCode: payoutMethods.bankIfscCode,
          bankName: payoutMethods.bankName
        }
      });
      toast.success("Payout methods updated!");
    } catch (err) {
      toast.error(err.message || "Failed to update methods");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) return toast.error("Fill all fields");
    setIsActionLoading(true);
    try {
      await changePassword(passwordData);
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Memoize sparkline data to prevent jitter and CPU spikes on re-renders
  const { sparklineData1, sparklineData2, sparklineData3 } = useMemo(() => {
    if (!stats?.monthlyEarnings) return { sparklineData1: [], sparklineData2: [], sparklineData3: [] };
    return {
      sparklineData1: stats.monthlyEarnings.map(m => ({ value: m.revenue })),
      sparklineData2: stats.monthlyEarnings.map(m => ({ value: m.orders })),
      sparklineData3: stats.monthlyEarnings.map(m => ({ value: m.orders })),
    };
  }, [stats?.monthlyEarnings]);

  if (!isHydrated) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading...</div>;
  if (!user || user.role !== 'broker') return null;

  const isPending = user.brokerStatus === 'pending';
  const isRejected = user.brokerStatus === 'rejected';

  const calcTrend = () => {
    if (!stats?.monthlyEarnings || stats.monthlyEarnings.length < 2) return 0;
    const curr = stats.monthlyEarnings[stats.monthlyEarnings.length - 1]?.revenue || 0;
    const prev = stats.monthlyEarnings[stats.monthlyEarnings.length - 2]?.revenue || 1;
    return Math.round(((curr - prev) / (prev || 1)) * 100);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex relative">
      {/* Mobile overlay */}
      {sideOpen && <div className="fixed inset-0 bg-black/70 z-30 lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-screen z-40 flex flex-col
        w-64 bg-[#020617] border-r border-[#1E293B] pt-8 pb-6 px-4
        transition-transform duration-300 ease-in-out
        ${sideOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex items-center gap-3 px-3 mb-10">
          <div className="p-2 bg-gradient-to-br from-[#b200ff] to-[#ff007f] rounded-xl shadow-[0_0_15px_rgba(178,0,255,0.4)]">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">VENDOR<span className="text-[#ff007f]">HUB</span></span>
        </div>

        <div className="mb-6 px-3">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-all group">
            <Home className="h-4 w-4 group-hover:text-[#ff007f]" /> Back to Website
          </Link>
        </div>
        
        <div className="flex-1 space-y-2 overflow-y-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => handleNav(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-[#b200ff]/10 text-[#ff007f] border border-[#ff007f]/20 shadow-[inset_0_0_10px_rgba(255,0,127,0.1)]' : 'text-[#64748B] hover:text-white hover:bg-[#1E293B]'}`}>
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>
        
        <div className="mt-auto pt-6 space-y-2 border-t border-[#1E293B]">
          {BOTTOM_TABS.map(tab => (
            <button key={tab.id} onClick={() => handleNav(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-[#b200ff]/10 text-[#ff007f] border border-[#ff007f]/20' : 'text-[#64748B] hover:text-white hover:bg-[#1E293B]'}`}>
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
          
          <button 
            onClick={() => { logout(); router.push('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-all mt-2"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>

          <div className="mt-4 p-3 rounded-xl border border-[#1E293B] bg-[#0F172A]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#b200ff] to-[#ff007f] flex items-center justify-center text-sm font-bold text-white shadow-[0_0_10px_rgba(255,0,127,0.3)]">
                V
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-[#ff007f] uppercase tracking-wider">{user.brokerStatus === 'approved' ? 'Verified Vendor' : user.brokerStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="lg:ml-64 flex flex-col min-h-screen w-full relative">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4 bg-[#020617]/95 backdrop-blur-xl border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#1E293B] transition-all"
              onClick={() => setSideOpen(v => !v)}
            >
              {sideOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <p className="text-[10px] text-[#64748B] uppercase tracking-widest leading-none hidden sm:block">Dashboard</p>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight uppercase">Vendor Portal</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(v => !v)}
                className="relative p-2 rounded-xl bg-[#0F172A] border border-[#1E293B] hover:border-[#334155] transition-colors outline-none"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-[#94A3B8]" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-[#ff007f] shadow-[0_0_8px_rgba(255,0,127,0.8)] text-[8px] font-bold text-white">{unreadCount}</span>}
              </button>
              <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
            <Link href="/dashboard/broker/upload" className="flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#b200ff] to-[#ff007f] text-white text-xs sm:text-sm font-bold hover:shadow-[0_0_15px_rgba(255,0,127,0.4)] transition-all">
              <PlusCircle className="h-4 w-4" /> <span className="hidden sm:inline">Upload Asset</span><span className="sm:hidden">Upload</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">
        
        {/* Pending/Rejected Banner */}
        {isPending && (
          <div className="mb-6 p-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-500 shrink-0" />
            <div><p className="text-sm font-bold text-yellow-400">Application Pending</p><p className="text-xs text-[#94A3B8]">Your vendor application is under review.</p></div>
          </div>
        )}
        {isRejected && (
          <div className="mb-6 p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
            <div><p className="text-sm font-bold text-rose-400">Application Rejected</p><p className="text-xs text-[#94A3B8]">Please contact support for more information.</p></div>
          </div>
        )}

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (() => {
          const defaultStats = {
            totalEarningsUSD: 24815.70,
            totalSold: 1288,
            activeListings: 345,
            dailyPerformance: [
              { date: 'Aug 15', revenue: 300, downloads: 400, views: 800 },
              { date: 'Aug 20', revenue: 750, downloads: 600, views: 1200 },
              { date: 'Aug 25', revenue: 600, downloads: 500, views: 1000 },
              { date: 'Aug 28', revenue: 1350, downloads: 900, views: 1800 },
              { date: 'Sep 9', revenue: 900, downloads: 700, views: 1400 },
              { date: 'Sep 14', revenue: 1400, downloads: 950, views: 1900 },
            ],
            topProducts: [
              { title: 'Minimalist Vector Pack', sales: 310, revenue: 4900, iconColor: 'from-[#00D2FF] to-[#0070FF]' },
              { title: 'Figma UI Kit', sales: 215, revenue: 3100, iconColor: 'from-[#10B981] to-[#00D2FF]' },
              { title: 'Motion Graphics Pack', sales: 190, revenue: 2700, iconColor: 'from-[#b200ff] to-[#ff007f]' },
            ],
            recentOrders: [
              { details: 'Asset "Figma UI" sold', date: new Date().toISOString(), icon: ShoppingBag, color: 'text-[#ff007f] bg-[#ff007f]/10 border-[#ff007f]/20' },
              { details: 'Listing "Vector Pack" updated', date: new Date(Date.now() - 3600000).toISOString(), icon: Clock, color: 'text-[#b200ff] bg-[#b200ff]/10 border-[#b200ff]/20' },
              { details: 'Payout processed: $1,150', date: new Date(Date.now() - 7200000).toISOString(), icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            ]
          };

          const finalStats = {
            totalEarningsUSD: stats?.totalEarningsUSD || defaultStats.totalEarningsUSD,
            totalEarningsINR: stats?.totalEarningsINR || 0,
            totalSold: stats?.totalSold || defaultStats.totalSold,
            activeListings: stats?.activeListings || defaultStats.activeListings,
            dailyPerformance: stats?.dailyPerformance?.length ? stats.dailyPerformance.map(d => ({
              date: d.date ? new Date(d.date).toLocaleDateString('default', { month: 'short', day: 'numeric' }) : 'N/A',
              revenue: d.revenue || 0,
              downloads: d.sales || 0,
              views: (d.sales || 0) * 3 + 5,
            })) : defaultStats.dailyPerformance,
            topProducts: stats?.topProducts?.length ? stats.topProducts.map((p, idx) => ({
              title: p.title,
              sales: p.sales,
              revenue: p.revenue,
              currency: p.currency || 'USD',
              iconColor: idx === 0 ? 'from-[#00D2FF] to-[#0070FF]' : idx === 1 ? 'from-[#10B981] to-[#00D2FF]' : 'from-[#b200ff] to-[#ff007f]'
            })) : defaultStats.topProducts,
            recentOrders: stats?.recentOrders?.length ? stats.recentOrders.map((o, idx) => ({
              details: `Asset "${o.product}" sold`,
              date: o.date,
              icon: ShoppingBag,
              color: idx % 2 === 0 ? 'text-[#ff007f] bg-[#ff007f]/10 border-[#ff007f]/20' : 'text-[#b200ff] bg-[#b200ff]/10 border-[#b200ff]/20'
            })) : defaultStats.recentOrders,
          };

          return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {user.role === 'broker' && !user.isPhoneVerified && (
                <VerificationSection user={user} sendOtp={sendOtp} validateOtp={validateOtp} />
              )}

              {/* Stats Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl p-5 border border-[#1E293B] bg-[#020617] hover:border-[#ff007f]/30 transition-all relative overflow-hidden group shadow-lg shadow-[#ff007f]/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Total Earnings</span>
                  <div className="flex items-end justify-between mt-2">
                    <div>
                      {finalStats.totalEarningsINR > 0 ? (
                        <p className="text-3xl font-extrabold text-white tracking-tight">₹{finalStats.totalEarningsINR.toLocaleString()}</p>
                      ) : (
                        <p className="text-3xl font-extrabold text-white tracking-tight">${finalStats.totalEarningsUSD.toLocaleString()}</p>
                      )}
                      {finalStats.totalEarningsINR > 0 && finalStats.totalEarningsUSD > 0 && (
                        <span className="text-xs text-[#94A3B8] font-bold block mt-1">+ ${(finalStats.totalEarningsUSD).toLocaleString()} USD</span>
                      )}
                      <span className="text-xs text-emerald-400 font-bold mt-1 inline-block">+18.4% <span className="text-[#64748B] font-semibold">this month</span></span>
                    </div>
                  </div>
                  <div className="relative h-12 mt-4 -mx-5 opacity-80 group-hover:opacity-100 transition-all overflow-hidden">
                    <NeonAreaChart data={finalStats.dailyPerformance} dataKey="revenue" color="#ff007f" height={48} />
                  </div>
                </div>

                <div className="rounded-2xl p-5 border border-[#1E293B] bg-[#020617] hover:border-[#b200ff]/30 transition-all relative overflow-hidden group shadow-lg shadow-[#b200ff]/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Assets Sold</span>
                  <div className="flex items-end justify-between mt-2">
                    <div>
                      <p className="text-3xl font-extrabold text-white tracking-tight">{finalStats.totalSold.toLocaleString()} units</p>
                      <span className="text-xs text-[#b200ff] font-bold mt-1 inline-block">+9.2% <span className="text-[#64748B] font-semibold">this week</span></span>
                    </div>
                  </div>
                  <div className="relative h-12 mt-4 -mx-5 opacity-80 group-hover:opacity-100 transition-all overflow-hidden">
                    <NeonAreaChart data={finalStats.dailyPerformance} dataKey="downloads" color="#b200ff" height={48} />
                  </div>
                </div>

                <div className="rounded-2xl p-5 border border-[#1E293B] bg-[#020617] hover:border-[#00D2FF]/30 transition-all relative overflow-hidden group shadow-lg shadow-[#00D2FF]/5 flex flex-col justify-between">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Active Listings</span>
                    <p className="text-3xl font-extrabold text-white tracking-tight mt-2">{finalStats.activeListings.toLocaleString()} Assets</p>
                    <span className="text-xs text-[#00D2FF] font-bold mt-1 inline-block">+5, <span className="text-[#64748B] font-semibold">stable</span></span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden mt-6 shadow-[0_0_10px_rgba(0,210,255,0.2)]">
                    <div className="h-full bg-gradient-to-r from-[#b200ff] to-[#00D2FF] rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Left Section: Earnings & Top Selling */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Earnings Overview */}
                  <div className="rounded-2xl border border-[#1E293B] bg-[#020617] p-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff007f] rounded-full mix-blend-screen filter blur-[120px] opacity-5 pointer-events-none" />
                    <div className="flex items-center justify-between mb-6 relative z-10">
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Earnings Overview</h3>
                        <p className="text-[10px] text-[#64748B] font-bold mt-0.5 uppercase tracking-wide">Last 30 Days</p>
                      </div>
                      <div className="px-4 py-1.5 rounded-xl bg-[#0F172A] border border-[#1E293B] text-[10px] font-black uppercase tracking-widest text-white shadow-md">
                        Aug 15 - Sep 14
                      </div>
                    </div>
                    <div className="-mx-4 relative z-10">
                      <NeonAreaChart data={finalStats.dailyPerformance} dataKey="revenue" color="#ff007f" height={260} />
                    </div>
                  </div>

                  {/* Top Selling Assets List */}
                  <div className="rounded-2xl border border-[#1E293B] bg-[#020617] p-6 shadow-2xl">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Top Selling Assets</h3>
                    <div className="space-y-5">
                      {finalStats.topProducts.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] hover:border-[#b200ff]/20 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.iconColor} flex items-center justify-center font-black text-white shadow-lg`}>
                              {p.title.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-white">{p.title}</p>
                              <p className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider mt-1">{p.sales} Sales Completed</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="w-32 bg-[#1E293B] h-2 rounded-full overflow-hidden shrink-0 hidden sm:block">
                              <div className="h-full bg-gradient-to-r from-[#b200ff] to-[#ff007f] rounded-full group-hover:scale-x-105 origin-left transition-transform duration-500" style={{ width: `${Math.min((p.sales / 500) * 100, 100)}%` }} />
                            </div>
                            <span className="text-sm font-black text-[#ff007f]">{p.currency === 'INR' ? '₹' : '$'}{(p.revenue / 1000).toFixed(1)}K</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Right Section: Stats, Performance, Activity */}
                <div className="space-y-6">
                  {/* Top Selling Assets Horizontal Progress Meters */}
                  <div className="rounded-2xl border border-[#1E293B] bg-[#020617] p-6 shadow-2xl">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5">Asset Metrics</h3>
                    <div className="space-y-4">
                      {finalStats.topProducts.map((p, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#94A3B8] truncate max-w-[140px]">{p.title}</span>
                            <span className="text-[10px] font-bold text-[#ff007f]">{p.sales} units | {p.currency === 'INR' ? '₹' : '$'}{(p.revenue / 1000).toFixed(1)}K</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden shadow-inner">
                            <div className={`h-full rounded-full bg-gradient-to-r ${idx % 2 === 0 ? 'from-[#ff007f] to-[#b200ff]' : 'from-[#b200ff] to-[#00D2FF]'}`} style={{ width: `${Math.min((p.sales / 350) * 100, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assets Performance Chart */}
                  <div className="rounded-2xl border border-[#1E293B] bg-[#020617] p-6 shadow-2xl">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Assets Performance</h3>
                    <div className="flex gap-4 mb-4 text-[9px] font-bold uppercase tracking-wider text-[#64748B]">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ff007f] inline-block shadow-[0_0_5px_#ff007f]" /> Downloads</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#b200ff] inline-block shadow-[0_0_5px_#b200ff]" /> Views</span>
                    </div>
                    <div className="-mx-2">
                      <AssetPerformanceChart data={finalStats.dailyPerformance} height={160} />
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="rounded-2xl border border-[#1E293B] bg-[#020617] p-6 shadow-2xl">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Recent Activity</h3>
                    <div className="relative border-l border-[#1E293B] ml-4 pl-6 space-y-6">
                      {finalStats.recentOrders.map((o, idx) => {
                        const Icon = o.icon;
                        return (
                          <div key={idx} className="relative">
                            <div className={`absolute -left-[35px] top-0 p-1.5 rounded-full border border-[#1E293B] ${o.color} shadow-lg shrink-0 z-10`}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white leading-tight">{o.details}</p>
                              <p className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider mt-1">{new Date(o.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(o.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* ── ASSETS TAB ── */}
        {activeTab === 'assets' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
             <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white tracking-tight uppercase">My Assets ({products.length})</h2>
            </div>
            {products.map(p => (
              <div key={p._id} className="flex items-center gap-4 p-4 rounded-2xl border border-[#1E293B] bg-[#0F172A] hover:border-[#b200ff]/30 transition-all">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#1E293B] shrink-0 border border-[#334155]">
                  {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{p.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${p.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : p.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>{p.status}</span>
                    <span className="text-xs text-[#64748B] font-semibold">{p.salesCount || 0} sales</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-white">{p.currency === 'INR' ? '₹' : '$'}{p.price}</p>
                  <Link href={`/dashboard/broker/edit/${p._id}`} className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B] text-[10px] font-bold text-white hover:bg-[#b200ff] hover:text-white transition-all uppercase tracking-wider border border-white/5">
                    <Edit className="h-3 w-3" /> Edit Asset
                  </Link>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── SALES TAB ── */}
        {activeTab === 'sales' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight uppercase">Sales History</h2>
            <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead><tr className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] border-b border-[#1E293B] bg-black/30">
                  <th className="text-left py-4 px-5">Asset Sold</th>
                  <th className="text-left py-4">Buyer</th>
                  <th className="text-center py-4">Date</th>
                  <th className="text-right py-4">Amount</th>
                  <th className="text-right py-4 px-5">Your Earnings</th>
                </tr></thead>
                <tbody>
                  {(stats?.recentOrders || []).map((o, i) => (
                    <tr key={i} className="border-b border-[#1E293B]/50 hover:bg-[#1E293B]/20 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-white">{o.product}</td>
                      <td className="py-3.5">
                        <p className="text-white font-medium">{o.buyer}</p>
                        <p className="text-[#64748B] text-[10px]">{o.buyerEmail}</p>
                      </td>
                      <td className="py-3.5 text-center text-[#94A3B8] text-xs">{new Date(o.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td className="py-3.5 text-right text-[#94A3B8] font-mono">{o.currency === 'INR' ? '₹' : '$'}{(o.amount || 0).toFixed(2)}</td>
                      <td className="py-3.5 px-5 text-right font-bold text-emerald-400 font-mono">+{o.currency === 'INR' ? '₹' : '$'}{(o.brokerEarnings || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                    <tr><td colSpan={5} className="py-10 text-center text-[#64748B]">
                      <BarChart3 className="h-10 w-10 text-[#1E293B] mx-auto mb-3" />
                      <p>No detailed sales data yet.</p>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── PAYOUTS TAB ── */}
        {activeTab === 'payouts' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl">
            <h2 className="text-lg font-bold text-white tracking-tight uppercase">Payouts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 flex flex-col justify-center items-center">
                 <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-2">Available Balance</h3>
                 <p className="text-4xl font-extrabold text-emerald-400 mb-1">${(stats?.wallet?.balance || 0).toFixed(2)}</p>
                 <p className="text-xs text-[#94A3B8]">Pending Clearance: ${(stats?.wallet?.pending || 0).toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 space-y-4">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Request Withdrawal</h3>
                 <div>
                   <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">Amount ($)</label>
                   <input type="number" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} placeholder="0.00" className="w-full bg-[#020617] border border-[#1E293B] rounded-xl py-2 px-4 text-white text-sm outline-none focus:border-[#b200ff]" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">Payout Method</label>
                   <select value={selectedPayoutMethod} onChange={e => setSelectedPayoutMethod(e.target.value)} className="w-full bg-[#020617] border border-[#1E293B] rounded-xl py-2 px-4 text-white text-sm outline-none focus:border-[#b200ff]">
                     <option value="">Select a method...</option>
                     {stats?.wallet?.payoutMethods?.crypto?.address && <option value="crypto">Crypto (USDT TRC20)</option>}
                     {stats?.wallet?.payoutMethods?.gpay && <option value="gpay">Google Pay</option>}
                     {stats?.wallet?.payoutMethods?.upi && <option value="upi">UPI</option>}
                     {stats?.wallet?.payoutMethods?.paypal && <option value="paypal">PayPal</option>}
                     {stats?.wallet?.payoutMethods?.bankTransfer?.accountNumber && <option value="bankTransfer">Bank Transfer</option>}
                   </select>
                 </div>
                 <button onClick={handlePayout} disabled={isActionLoading || !payoutAmount || !selectedPayoutMethod} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#b200ff] to-[#ff007f] text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all mt-2">Request Payout</button>
                 <p className="text-[10px] text-[#64748B] text-center">Standard platform fee (20%) applies.</p>
              </div>
            </div>
            
            <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead><tr className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] border-b border-[#1E293B] bg-black/30">
                  <th className="text-left py-4 px-5">Date</th>
                  <th className="text-left py-4">Address</th>
                  <th className="text-right py-4">Amount</th>
                  <th className="text-right py-4 px-5">Status</th>
                </tr></thead>
                <tbody>
                  {(stats?.wallet?.transactions?.filter(t => t.type === 'withdrawal') || []).map((t, i) => (
                    <tr key={i} className="border-b border-[#1E293B]/50 hover:bg-[#1E293B]/20 transition-colors">
                      <td className="py-3.5 px-5 text-[#94A3B8]">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="py-3.5 font-mono text-xs text-[#E2E8F0]">{t.payoutAddress || 'N/A'}</td>
                      <td className="py-3.5 text-right font-bold text-white">${t.amount.toFixed(2)}</td>
                      <td className="py-3.5 px-5 text-right">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : t.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-rose-500/10 text-rose-400'}`}>{t.status}</span>
                      </td>
                    </tr>
                  ))}
                  {(!stats?.wallet?.transactions || stats.wallet.transactions.filter(t => t.type === 'withdrawal').length === 0) && (
                    <tr><td colSpan={4} className="py-10 text-center text-[#64748B]">No payout requests found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight uppercase">Advanced Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 relative overflow-hidden">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Revenue Trend (Last 12 Months)</h3>
                <div className="-mx-2 relative z-10">
                  <NeonAreaChart data={stats?.monthlyEarnings || []} dataKey="revenue" color="#00D2FF" height={300} />
                </div>
              </div>

              <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 relative overflow-hidden">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Sales Volume (Last 12 Months)</h3>
                <div className="-mx-2 relative z-10">
                  <NeonAreaChart data={stats?.monthlyEarnings || []} dataKey="orders" color="#b200ff" height={300} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SUPPORT TAB ── */}
        {activeTab === 'support' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight uppercase">Vendor Support</h2>
            <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 space-y-4">
              <p className="text-sm text-[#94A3B8]">Need help with your account or assets? Contact our dedicated vendor support team.</p>
              <div className="flex gap-4">
                <a href="mailto:support@vendorhub.com" className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#0070FF] text-white text-sm font-bold shadow-[0_0_15px_rgba(0,112,255,0.3)] hover:opacity-90 transition-all">
                  <Send className="h-4 w-4" /> Email Support
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-6">
            <VerificationSection user={user} sendOtp={sendOtp} validateOtp={validateOtp} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Profile</h3>
                <div className="space-y-4">
                  <div><label className="block text-xs font-bold text-[#64748B] uppercase mb-1">Name</label><p className="text-white font-semibold">{user.name}</p></div>
                  <div><label className="block text-xs font-bold text-[#64748B] uppercase mb-1">Email</label><p className="text-white font-semibold">{user.email}</p></div>
                  <div><label className="block text-xs font-bold text-[#64748B] uppercase mb-1">Status</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${user.brokerStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : user.brokerStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-rose-500/10 text-rose-400'}`}>{user.brokerStatus}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Payout Methods</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Crypto (USDT TRC20)</label>
                    <input type="text" value={payoutMethods.cryptoAddress} onChange={e => setPayoutMethods(prev => ({...prev, cryptoAddress: e.target.value}))} placeholder="T... address" className="w-full bg-[#020617] border border-[#1E293B] rounded-xl py-2 px-4 text-white text-sm outline-none focus:border-[#b200ff]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Google Pay Number</label>
                    <input type="text" value={payoutMethods.gpay} onChange={e => setPayoutMethods(prev => ({...prev, gpay: e.target.value}))} placeholder="+91..." className="w-full bg-[#020617] border border-[#1E293B] rounded-xl py-2 px-4 text-white text-sm outline-none focus:border-[#b200ff]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">UPI ID</label>
                    <input type="text" value={payoutMethods.upi} onChange={e => setPayoutMethods(prev => ({...prev, upi: e.target.value}))} placeholder="username@bank" className="w-full bg-[#020617] border border-[#1E293B] rounded-xl py-2 px-4 text-white text-sm outline-none focus:border-[#b200ff]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">PayPal Email</label>
                    <input type="email" value={payoutMethods.paypal} onChange={e => setPayoutMethods(prev => ({...prev, paypal: e.target.value}))} placeholder="email@example.com" className="w-full bg-[#020617] border border-[#1E293B] rounded-xl py-2 px-4 text-white text-sm outline-none focus:border-[#b200ff]" />
                  </div>
                  <div className="pt-2 border-t border-[#1E293B]">
                    <p className="text-xs font-bold text-white mb-2">Bank Transfer Details</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input type="text" value={payoutMethods.bankAccountName} onChange={e => setPayoutMethods(prev => ({...prev, bankAccountName: e.target.value}))} placeholder="Account Name" className="w-full bg-[#020617] border border-[#1E293B] rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-[#b200ff]" />
                      <input type="text" value={payoutMethods.bankName} onChange={e => setPayoutMethods(prev => ({...prev, bankName: e.target.value}))} placeholder="Bank Name" className="w-full bg-[#020617] border border-[#1E293B] rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-[#b200ff]" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={payoutMethods.bankAccountNumber} onChange={e => setPayoutMethods(prev => ({...prev, bankAccountNumber: e.target.value}))} placeholder="Account Number" className="w-full bg-[#020617] border border-[#1E293B] rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-[#b200ff]" />
                      <input type="text" value={payoutMethods.bankIfscCode} onChange={e => setPayoutMethods(prev => ({...prev, bankIfscCode: e.target.value}))} placeholder="IFSC/Routing Code" className="w-full bg-[#020617] border border-[#1E293B] rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-[#b200ff]" />
                    </div>
                  </div>
                </div>
                <button onClick={handlePayoutMethodsUpdate} disabled={isActionLoading} className="w-full py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-white text-sm font-bold transition-all mt-2">Save Payout Methods</button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">Current Password</label>
                  <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))} className="w-full bg-[#020617] border border-[#1E293B] rounded-xl py-2 px-4 text-white text-sm outline-none focus:border-[#ff007f]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">New Password</label>
                  <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData(prev => ({...prev, newPassword: e.target.value}))} className="w-full bg-[#020617] border border-[#1E293B] rounded-xl py-2 px-4 text-white text-sm outline-none focus:border-[#ff007f]" />
                </div>
              </div>
              <div className="pt-2">
                <button onClick={handlePasswordChange} disabled={isActionLoading} className="px-5 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-sm font-bold transition-all">Update Password</button>
              </div>
            </div>
          </motion.div>
        )}
        </main>
      </div>
    </div>
  );
}
