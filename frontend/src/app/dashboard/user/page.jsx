"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  Download, Clock, ShieldCheck,
  FolderLock, ArrowRight,
  TrendingUp, Calendar, Zap, Box, ChevronDown, ExternalLink,
  Search, Filter, Activity
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import LottieSpotlight from '@/components/LottieSpotlight';

export default function UserDashboard() {
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
    if (user && user.role === 'user') {
      fetchOrders();
    }
  }, [user]);

  // Automatic redirect if session lost
  useEffect(() => {
    if (mounted && !user) {
      toast.error('Session expired. Please re-authenticate.');
      setTimeout(() => window.location.href = '/login', 2000);
    }
  }, [user, mounted]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      clearCart();
      toast.success('Acquisition Successful! Welcome to the elite.', {
        icon: '💎',
        duration: 5000
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/myorders');
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load purchase history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (productId, productTitle) => {
    try {
      toast.loading('Decrypting your asset...', { id: 'download' });
      const response = await api.get(`/products/${productId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${productTitle.replace(/\\s+/g, '_')}_Package.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success('Download started!', { id: 'download' });
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            toast.error(errorData.message || 'Download failed', { id: 'download' });
          } catch (e) {
            toast.error('File missing from server storage', { id: 'download' });
          }
        };
        reader.readAsText(error.response.data);
      } else {
        toast.error('Download failed. File missing or access denied.', { id: 'download' });
      }
    }
  };

  const getCurrencySymbol = (currency) => currency === 'INR' ? '₹' : '$';

  const formatOrderTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = (order.productId?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            order._id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  if (!mounted) return null;

  if (!user || user.role !== 'user') {
    return (
      <div className="bg-[#000000] min-h-screen flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-12 glass rounded-[40px] border border-[#1F1F1F] max-w-md w-full relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
          <LottieSpotlight
            src="/animations/secure-access.json"
            tone="secure"
            size="sm"
            badge="Locked"
            className="mb-8"
          />
          <h2 className="text-3xl font-black text-white tracking-tighter">Vault Locked</h2>
          <p className="text-[#A1A1AA] mt-4 italic leading-relaxed">This vault is reserved for verified buyers. Please login to your primary account.</p>
          <Link href="/login" className="mt-10 block px-8 py-4 bg-white text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs hover:scale-105 transition-all">
            Login to Vault
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#020617] min-h-screen pt-24 lg:pt-32 pb-12 text-slate-200 relative overflow-hidden">
      {/* ── Background Glows ──────────────────────────────── */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-[#00D2FF]/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-[#0070FF]/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── Header Area ───────────────────────────────────── */}
        <header className="mb-10 lg:mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0F172A]/80 border border-[#1E293B] rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-[#00D2FF] mb-5 shadow-[0_0_20px_rgba(0,210,255,0.1)]">
              <FolderLock className="h-3 w-3" /> Personal Vault
            </div>
            <h1 className="text-4xl lg:text-7xl font-extrabold text-white tracking-tight leading-none mb-3">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-[#0070FF]">Library</span>
            </h1>
            <p className="text-[#94A3B8] text-sm sm:text-base max-w-lg font-medium leading-relaxed">
              Your securely encrypted collection of digital assets. Decrypt and download at any time.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-96"
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[#64748B] group-focus-within:text-[#00D2FF] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search assets or Order IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0F172A]/80 backdrop-blur-xl border border-[#1E293B] text-white text-sm rounded-2xl focus:ring-2 focus:ring-[#00D2FF]/50 focus:border-[#00D2FF] block pl-12 p-4 transition-all shadow-lg placeholder-[#64748B]"
              />
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          
          {/* ── Left Sidebar (Profile & Stats) ──────────────── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Profile Card */}
            <div className="bg-[#0F172A]/80 backdrop-blur-xl p-8 rounded-3xl border border-[#1E293B] shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D2FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00D2FF] to-[#0070FF] rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(0,210,255,0.3)] group-hover:scale-105 transition-transform duration-500 border border-white/10">
                  <span className="text-3xl font-black text-white">{user.name.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">{user.name}</h3>
                <p className="text-xs text-[#94A3B8] mt-1 font-medium bg-[#1E293B]/50 px-3 py-1 rounded-full">{user.email}</p>
                
                <div className="w-full mt-8 grid grid-cols-2 gap-3">
                  <div className="bg-[#020617]/50 p-4 rounded-2xl border border-[#1E293B] hover:border-[#00D2FF]/30 transition-colors text-left">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Total Assets</div>
                    <div className="text-2xl font-black text-white">{orders.length}</div>
                  </div>
                  <div className="bg-[#020617]/50 p-4 rounded-2xl border border-[#1E293B] hover:border-[#00D2FF]/30 transition-colors text-left">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Value</div>
                    <div className="text-xl font-black text-[#00D2FF] truncate">
                      ${orders.filter(o => o.currency !== 'INR').reduce((acc, curr) => acc + curr.amount, 0).toFixed(0)}
                      {orders.some(o => o.currency === 'INR') && ` | ₹${orders.filter(o => o.currency === 'INR').reduce((acc, curr) => acc + curr.amount, 0).toFixed(0)}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <Link href="/products" className="group w-full bg-gradient-to-r from-[#00D2FF] to-[#0070FF] p-[1px] rounded-2xl block hover:shadow-[0_0_30px_rgba(0,210,255,0.3)] transition-all">
              <div className="bg-[#020617] p-5 rounded-2xl flex items-center justify-between group-hover:bg-transparent transition-colors">
                <div className="flex items-center gap-3">
                  <Box className="h-5 w-5 text-[#00D2FF] group-hover:text-white transition-colors" />
                  <span className="font-bold text-sm text-white">Explore Marketplace</span>
                </div>
                <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            {/* Security Notice */}
            <div className="bg-[#0F172A]/50 backdrop-blur-xl p-6 rounded-3xl border border-[#1E293B]">
              <h4 className="font-bold text-white flex items-center gap-2 mb-3 text-xs uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-[#10B981]" /> End-to-End Security
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Assets are encrypted via AES-256 upon purchase. The files downloaded from your vault contain a hidden signature unique to your account.
              </p>
            </div>
          </motion.div>

          {/* ── Right Column (Asset Stream) ─────────────────── */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex items-center justify-between mb-6 bg-[#0F172A]/80 backdrop-blur-xl p-3 px-5 rounded-2xl border border-[#1E293B]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#64748B]" />
                <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Filter:</span>
              </div>
              <div className="flex gap-2">
                {['all', 'paid', 'pending', 'failed'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      statusFilter === status 
                        ? 'bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/30' 
                        : 'bg-transparent text-[#64748B] hover:text-white hover:bg-[#1E293B]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-[#0F172A]/50 rounded-3xl animate-pulse border border-[#1E293B]"></div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              
              /* ── Premium Empty State ──────────────────────── */
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 bg-[#0F172A]/40 backdrop-blur-xl rounded-[2rem] p-12 lg:p-20 text-center border border-[#1E293B] border-dashed flex flex-col items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="w-24 h-24 bg-[#020617] rounded-full border border-[#1E293B] shadow-[0_0_50px_rgba(0,112,255,0.1)] flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 rounded-full border border-[#00D2FF]/30 animate-ping opacity-20"></div>
                  <FolderLock className="h-10 w-10 text-[#00D2FF]" />
                </div>
                <h3 className="text-3xl font-extrabold text-white tracking-tight mb-3">
                  {searchQuery ? 'No Matches Found' : 'Your Vault is Empty'}
                </h3>
                <p className="text-sm text-[#94A3B8] max-w-sm mx-auto leading-relaxed font-medium mb-10">
                  {searchQuery 
                    ? `No assets match your search for "${searchQuery}". Try clearing your filters.` 
                    : 'Discover premium digital assets, source code, and tools. Once acquired, they will safely reside here.'}
                </p>
                {!searchQuery && (
                  <Link href="/products" className="group px-8 py-4 bg-white text-[#020617] rounded-2xl text-sm font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    Browse Marketplace <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </motion.div>

            ) : (
              <div className="space-y-4">
                <AnimatePresence mode='popLayout'>
                  {filteredOrders.map((order, idx) => (
                    
                    /* ── Modern Asset Card ─────────────────────── */
                    <motion.div 
                      key={order._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: idx * 0.05, duration: 0.2 }}
                      className={`group bg-[#0F172A]/60 backdrop-blur-xl rounded-3xl border transition-all duration-300 relative ${
                        expandedOrderId === order._id 
                          ? 'border-[#00D2FF]/50 shadow-[0_0_30px_rgba(0,210,255,0.1)] bg-[#0F172A]' 
                          : 'border-[#1E293B] hover:border-[#334155]'
                      }`}
                    >
                      <div 
                        onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                        className="p-5 flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                          <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-[#020617] border border-[#1E293B] relative group-hover:border-[#00D2FF]/30 transition-colors">
                            <div className="absolute inset-0 bg-[#00D2FF]/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                            <img
                              src={order.productId?.images?.[0] || 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400'}
                              alt={order.productId?.title}
                              className="h-full w-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                                order.status === 'paid' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 
                                order.status === 'failed' ? 'bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/20' :
                                'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
                              }`}>
                                {order.status}
                              </span>
                              <span className="text-[10px] text-[#64748B] font-semibold flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-white truncate group-hover:text-[#00D2FF] transition-colors">
                              {order.productId?.title || 'System Asset'}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                          <div className="text-right hidden sm:block">
                            <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Paid</div>
                            <div className="text-base sm:text-lg font-black text-white">
                              {getCurrencySymbol(order.currency)}{order.amount.toFixed(2)}
                            </div>
                          </div>
                          
                          {order.status === 'paid' && order.productId ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(order.productId._id, order.productId.title);
                              }}
                              className="bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/20 p-3 sm:p-3.5 rounded-xl hover:bg-[#00D2FF] hover:text-[#020617] hover:border-[#00D2FF] transition-all hover:scale-105 active:scale-95 group/btn"
                            >
                              <Download className="h-4 w-4 sm:h-5 sm:w-5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            </button>
                          ) : (
                            <div className="p-3 sm:p-3.5 bg-[#020617] rounded-xl opacity-40 cursor-not-allowed border border-[#1E293B]">
                              <Download className="h-4 w-4 sm:h-5 sm:w-5 text-[#64748B]" />
                            </div>
                          )}

                          <div className={`p-1.5 rounded-full transition-colors ${expandedOrderId === order._id ? 'bg-[#1E293B]' : 'hover:bg-[#1E293B]'}`}>
                            <ChevronDown className={`h-4 w-4 text-[#94A3B8] transition-transform duration-300 ${expandedOrderId === order._id ? 'rotate-180 text-white' : ''}`} />
                          </div>
                        </div>
                      </div>

                      {/* ── Expandable Details ──────────────────── */}
                      <AnimatePresence>
                        {expandedOrderId === order._id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="border-t border-[#1E293B] bg-[#020617]/50 rounded-b-3xl"
                          >
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                              <div className="space-y-4">
                                <div>
                                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                                    <FolderLock className="h-3 w-3" /> Order Identifier
                                  </label>
                                  <code className="block text-[11px] text-[#94A3B8] bg-[#0F172A] px-3 py-2 rounded-xl border border-[#1E293B] break-all">
                                    {order._id}
                                  </code>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                                    <ShieldCheck className="h-3 w-3 text-[#10B981]" /> Transaction Hash
                                  </label>
                                  <code className="block text-[11px] text-[#10B981] bg-[#10B981]/10 px-3 py-2 rounded-xl border border-[#10B981]/20 break-all">
                                    {order.paymentId || 'TX_PENDING_VERIFICATION'}
                                  </code>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between p-3.5 bg-[#0F172A] rounded-xl border border-[#1E293B]">
                                  <div>
                                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">Category</label>
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                                      {order.productId?.category || 'General Digital'}
                                    </span>
                                  </div>
                                  <Link href={`/products/${order.productId?._id}`} className="p-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#00D2FF] hover:text-[#020617] transition-all shadow-sm">
                                    <ExternalLink className="h-4 w-4" />
                                  </Link>
                                </div>
                                <div className="p-3.5 bg-[#0F172A] rounded-xl border border-[#1E293B]">
                                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Acquisition Time</label>
                                  <div className="flex items-center gap-2 text-xs font-semibold text-[#F8FAFC]">
                                    <Clock className="h-3.5 w-3.5 text-[#00D2FF]" />
                                    {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {formatOrderTime(order.createdAt)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
