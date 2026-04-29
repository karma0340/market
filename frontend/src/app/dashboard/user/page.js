"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { 
  Download, ShoppingBag, Clock, ShieldCheck, 
  AlertCircle, Sparkles, FolderLock, ArrowRight,
  TrendingUp, Calendar, Zap, Box, ChevronDown, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserDashboard() {
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    setMounted(true);
    if (user && user.role === 'user') {
      fetchOrders();
    }
    
    // Live Clock Logic
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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
      link.setAttribute('download', `${productTitle.replace(/\s+/g, '_')}_Package.zip`);
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

  if (!mounted) return null;

  if (!user || user.role !== 'user') {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-12 glass rounded-[40px] border border-white/5 max-w-md w-full relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-8 animate-pulse" />
          <h2 className="text-3xl font-black text-white tracking-tighter">Vault Locked</h2>
          <p className="text-slate-400 mt-4 italic leading-relaxed">This vault is reserved for verified buyers. Please login to your primary account.</p>
          <Link href="/login" className="mt-10 block px-8 py-4 bg-white text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs hover:scale-105 transition-all">
            Login to Vault
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen pt-24 lg:pt-32 pb-12 text-slate-200 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Superior Header */}
        <header className="mb-12 lg:mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">
              <FolderLock className="h-3 w-3" /> Encrypted Repository
            </div>
            <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-none mb-4">
              My <span className="text-indigo-500">Library.</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl font-medium leading-relaxed">Your collection of elite digital assets, secured by bank-grade protocols.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-end gap-4"
          >
            <div className="glass px-6 py-4 rounded-3xl border border-white/5 flex flex-col items-end group hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-3 text-indigo-400 font-black tracking-widest text-[10px] uppercase mb-1">
                <Zap className="h-3 w-3 animate-pulse" /> System Time
              </div>
              <div className="text-3xl font-black text-white tracking-tighter font-mono leading-none">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>
            
            <Link href="/products" className="group glass px-8 py-4 rounded-2xl flex items-center gap-3 text-sm font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all">
              Marketplace <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-indigo-400" />
            </Link>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* User Profile Hub */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 space-y-8"
          >
            <div className="glass p-8 sm:p-10 rounded-[48px] border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 sm:w-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3 group-hover:rotate-6 transition-transform">
                  <span className="text-4xl font-black text-white">{user.name.charAt(0)}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight text-center">{user.name}</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium text-center">{user.email}</p>
                
                <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.03] p-5 rounded-3xl border border-white/5 text-center hover:bg-white/[0.05] transition-all">
                    <div className="text-2xl sm:text-3xl font-black text-white mb-1">{orders.length}</div>
                    <div className="text-[8px] sm:text-[9px] uppercase font-black text-slate-500 tracking-[0.2em]">Acquired</div>
                  </div>
                  <div className="bg-white/[0.03] p-5 rounded-3xl border border-white/5 text-center hover:bg-white/[0.05] transition-all">
                    <div className="text-2xl sm:text-3xl font-black text-indigo-400 mb-1">
                      ${orders.filter(o => o.currency !== 'INR').reduce((acc, curr) => acc + curr.amount, 0).toFixed(0)}
                      {orders.some(o => o.currency === 'INR') && ` + ₹${orders.filter(o => o.currency === 'INR').reduce((acc, curr) => acc + curr.amount, 0).toFixed(0)}`}
                    </div>
                    <div className="text-[8px] sm:text-[9px] uppercase font-black text-slate-500 tracking-[0.2em]">Investment</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[40px] border border-indigo-500/20 bg-indigo-600/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldCheck className="h-24 w-24 text-indigo-500" />
              </div>
              <h4 className="font-black text-white flex items-center gap-3 mb-4 uppercase tracking-[0.2em] text-[10px]">
                <ShieldCheck className="h-4 w-4 text-indigo-400" /> Security Protocol
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                All binary assets are decrypted on-the-fly using AES-256. Your unique signature is embedded in every license file.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-green-500/80">Encrypted Stream Active</span>
              </div>
            </div>
          </motion.div>

          {/* Acquisition Stream */}
          <div className="lg:col-span-8">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 ml-2 flex items-center gap-3">
              <Box className="h-4 w-4 text-indigo-500" /> Asset Stream
            </h2>

            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-white/5 rounded-[32px] animate-pulse"></div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-[48px] p-12 sm:p-24 text-center border border-dashed border-white/10"
              >
                <ShoppingBag className="h-16 w-16 sm:h-20 sm:w-20 text-slate-800 mx-auto mb-8" />
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Vault Empty</h3>
                <p className="text-sm sm:text-slate-500 mt-4 max-w-xs mx-auto leading-relaxed font-medium">Start your digital treasury by exploring our curated marketplace.</p>
                <Link href="/products" className="mt-10 inline-flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition group">
                  Explore Now <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence mode='popLayout'>
                  {orders.map((order, idx) => (
                    <motion.div 
                      key={order._id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`group glass rounded-[32px] sm:rounded-[40px] border border-white/5 hover:border-indigo-500/30 transition-all relative overflow-hidden ${expandedOrderId === order._id ? 'bg-white/[0.04]' : 'bg-white/[0.01]'}`}
                    >
                      <div 
                        onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                        className="p-4 sm:p-8 flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-4 sm:gap-10 flex-1 min-w-0">
                          <div className="h-16 w-16 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-2xl sm:rounded-[24px] bg-slate-900 border border-white/10 shadow-2xl">
                            <img
                              src={order.productId?.images?.[0] || 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400'}
                              alt={order.productId?.title}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 sm:gap-4 mb-2 sm:mb-3">
                              <span className={`px-2.5 py-1 rounded-full text-[7px] sm:text-[9px] font-black uppercase tracking-widest ${
                                order.status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {order.status}
                              </span>
                              <div className="flex items-center gap-1.5 text-[7px] sm:text-[9px] text-slate-500 font-black uppercase tracking-widest whitespace-nowrap">
                                <Clock className="h-2.5 w-2.5 text-indigo-400" /> {formatOrderTime(order.createdAt)}
                              </div>
                            </div>
                            <h3 className="text-base sm:text-2xl font-black text-white tracking-tight leading-tight truncate group-hover:text-indigo-400 transition-colors">
                              {order.productId?.title || 'System Asset'}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-8 flex-shrink-0 pr-2">
                          <div className="text-right hidden sm:block">
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5 italic">Value</div>
                            <div className="text-xl sm:text-2xl font-black text-white tracking-tighter">{getCurrencySymbol(order.currency)}{order.amount.toFixed(2)}</div>
                          </div>
                          
                          {order.status === 'paid' && order.productId ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(order.productId._id, order.productId.title);
                              }}
                              className="bg-white text-slate-950 p-3 sm:p-5 rounded-xl sm:rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-2xl hover:shadow-indigo-500/20 group/btn"
                            >
                              <Download className="h-4 w-4 sm:h-6 sm:w-6 group-hover/btn:-translate-y-1 transition-transform" />
                            </button>
                          ) : (
                            <div className="p-3 sm:p-5 bg-white/5 rounded-xl sm:rounded-2xl opacity-20 cursor-not-allowed">
                              <Download className="h-4 w-4 sm:h-6 sm:w-6" />
                            </div>
                          )}

                          <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform duration-500 ${expandedOrderId === order._id ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Expandable Details Section */}
                      <AnimatePresence>
                        {expandedOrderId === order._id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5 bg-white/[0.02]"
                          >
                            <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                              <div className="space-y-6">
                                <div>
                                  <label className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Order Identification</label>
                                  <code className="text-[10px] sm:text-xs font-bold text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 break-all">
                                    {order._id}
                                  </code>
                                </div>
                                <div>
                                  <label className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Transaction Fingerprint</label>
                                  <code className="text-[10px] sm:text-xs font-bold text-indigo-400/80 bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/10 break-all">
                                    {order.paymentId || 'TX_PENDING_VERIFICATION'}
                                  </code>
                                </div>
                              </div>
                              <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                  <div>
                                    <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Category</label>
                                    <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">{order.productId?.category || 'General Digital'}</span>
                                  </div>
                                  <Link href={`/products/${order.productId?._id}`} className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                                    <ExternalLink className="h-4 w-4" />
                                  </Link>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                  <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-2">Purchase Date & Time</label>
                                  <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-300">
                                    <Calendar className="h-3 w-3 text-indigo-500" />
                                    {new Date(order.createdAt).toLocaleDateString()} at {formatOrderTime(order.createdAt)}
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
