"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { ShieldCheck, Package, DollarSign, UserCheck, AlertCircle, Check, X, RefreshCw, Layers, TrendingUp, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [allProducts, setAllProducts] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPayout, setSelectedPayout] = useState(null);
 
  useEffect(() => {
    setMounted(true);
    if (user && user.role === 'admin') {
      fetchData();
      
      // Auto-poll the database every 10 seconds in the background
      const interval = setInterval(() => {
        fetchData(true);
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Automatic redirect if session lost
  useEffect(() => {
    if (mounted && (!user || user.role !== 'admin')) {
      const timer = setTimeout(() => {
        if (!user) window.location.href = '/login';
        else window.location.href = '/';
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, mounted]);

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [productsRes, withdrawalsRes, ordersRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/withdrawals'),
        api.get('/admin/orders')
      ]);
      setAllProducts(productsRes.data);
      setWithdrawals(withdrawalsRes.data);
      setAllOrders(ordersRes.data);
    } catch (error) {
      if (!silent) toast.error('Failed to load administrative data');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleProductStatus = async (id, status) => {
    try {
      await api.put(`/admin/products/${id}/status`, { status });
      toast.success(`Product successfully ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product completely removed from the system');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleApproveWithdrawal = async (id) => {
    try {
      await api.put(`/admin/withdrawals/${id}/approve`);
      toast.success('Withdrawal marked as processed');
      fetchData();
    } catch (error) {
      toast.error('Failed to process withdrawal');
    }
  };

  if (!mounted) return null;

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-slate-950 px-6">
        <div className="text-center p-8 sm:p-12 glass rounded-[40px] border border-white/5 max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
            <ShieldCheck className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Command Restricted</h2>
          <p className="text-slate-400 mt-4 italic leading-relaxed">System-level administrative privileges are required to access the Governance Hub.</p>
          <div className="mt-10 flex flex-col gap-4">
            <Link href="/login" className="px-8 py-4 bg-white text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs hover:scale-105 transition-all">
              Elevate Permissions
            </Link>
            <Link href="/" className="text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest text-center">
              Abort to Safety
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 pt-16 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Area */}
        <header className="mb-8 sm:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 animate-fade-in-up">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-3 sm:mb-4">
              <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> System Governance
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-tight">Command <span className="text-indigo-500">Hub.</span></h1>
            <p className="text-slate-400 mt-2 sm:mt-4 text-sm sm:text-lg max-w-xl">Oversee market operations, verify elite assets, and finalize global payouts.</p>
          </div>
          <button 
            onClick={fetchData}
            className="group p-3 sm:p-4 glass border border-white/10 rounded-xl sm:rounded-2xl hover:bg-white/5 transition flex items-center justify-center gap-3 text-[10px] sm:text-sm font-black text-white uppercase tracking-widest w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 text-indigo-400 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} /> 
            Sync Reality
          </button>
        </header>

        {/* Global Analytics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-10 sm:mb-16">
          <div className="glass p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-white/5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Package className="h-24 w-24 sm:h-32 sm:w-32 text-white" />
            </div>
            <div className="text-[9px] sm:text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-2 sm:mb-4 flex items-center gap-2">
              <Layers className="h-3 w-3 sm:h-4 sm:w-4" /> Total Assets
            </div>
            <div className="text-3xl sm:text-5xl font-black text-white mb-1 sm:mb-2">{allProducts.length}</div>
            <div className="text-[9px] sm:text-xs text-indigo-400 font-bold">{allProducts.filter(p => p.status === 'pending').length} Awaiting Verification</div>
          </div>
          
          <div className="glass p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-white/5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="h-24 w-24 sm:h-32 sm:w-32 text-white" />
            </div>
            <div className="text-[9px] sm:text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-2 sm:mb-4 flex items-center gap-2">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" /> Global Sales
            </div>
            <div className="text-3xl sm:text-5xl font-black text-white mb-1 sm:mb-2">{allOrders.length}</div>
            <div className="text-[9px] sm:text-xs text-green-400 font-bold">Total Platform Volume</div>
          </div>

          <div className="glass p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-white/5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign className="h-24 w-24 sm:h-32 sm:w-32 text-white" />
            </div>
            <div className="text-[9px] sm:text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-2 sm:mb-4 flex items-center gap-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" /> Payout Queue
            </div>
            <div className="text-3xl sm:text-5xl font-black text-white mb-1 sm:mb-2">{withdrawals.length}</div>
            <div className="text-[9px] sm:text-xs text-purple-400 font-bold">Ready for Settlement</div>
          </div>

          <div className="glass p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-indigo-600/10 border border-indigo-500/20 flex flex-col justify-center sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2">Platform Health</h3>
            <div className="h-1.5 sm:h-2 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[94%] shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
            </div>
            <p className="mt-2 sm:mt-4 text-[8px] sm:text-xs font-medium text-slate-400 uppercase tracking-widest">94% System Efficiency</p>
          </div>
        </div>

        {/* Tactical Control Tabs */}
        <div className="glass rounded-[28px] sm:rounded-[40px] border border-white/5 overflow-hidden shadow-2xl shadow-black/50">
          <div className="flex bg-white/[0.02] border-b border-white/5">
            <button 
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-4 sm:py-8 text-[9px] sm:text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 sm:gap-3 ${
                activeTab === 'products' ? 'text-white bg-indigo-600/20 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Assets
            </button>
            <button 
              onClick={() => setActiveTab('payouts')}
              className={`flex-1 py-4 sm:py-8 text-[9px] sm:text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 sm:gap-3 ${
                activeTab === 'payouts' ? 'text-white bg-purple-600/20 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Payouts
            </button>
            <button 
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 py-4 sm:py-8 text-[9px] sm:text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 sm:gap-3 ${
                activeTab === 'transactions' ? 'text-white bg-green-600/20 border-b-2 border-green-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Transactions
            </button>
          </div>

          <div className="p-4 sm:p-8 lg:p-12">
            {activeTab === 'products' ? (
              <div className="space-y-4 sm:space-y-8">
                {allProducts.length === 0 ? (
                  <div className="text-center py-20 sm:py-32">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-white/5">
                      <Package className="h-8 w-8 sm:h-10 sm:w-10 text-slate-700" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Empty Market.</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2">No assets have been submitted yet.</p>
                  </div>
                ) : allProducts.map((product) => (
                  <div key={product._id} 
                    onClick={() => setSelectedProduct(product)}
                    className="group bg-white/[0.03] p-4 sm:p-8 rounded-[20px] sm:rounded-[32px] border border-white/5 hover:border-indigo-500/30 hover:bg-white/5 transition-all flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 sm:gap-8 w-full md:w-auto">
                      <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-xl sm:rounded-3xl overflow-hidden bg-slate-900 flex-shrink-0 border border-white/10">
                        <img src={product.images[0] || 'https://via.placeholder.com/150'} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-0.5 sm:mb-1 italic ${
                          product.status === 'approved' ? 'text-green-400' :
                          product.status === 'rejected' ? 'text-red-400' : 'text-indigo-400'
                        }`}>
                          {product.status}
                        </div>
                        <h3 className="font-black text-white text-lg sm:text-2xl tracking-tight mb-1 sm:mb-2 truncate">{product.title}</h3>
                        <p className="text-[10px] sm:text-sm text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                          Creator: <span className="text-white font-bold">{product.sellerId?.name}</span>
                          <span className="hidden sm:inline">•</span>
                          Price: <span className="text-indigo-400 font-black">${product.price}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                      {product.status !== 'approved' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleProductStatus(product._id, 'approved'); }}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition"
                        >
                          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Approve
                        </button>
                      )}
                      {product.status !== 'rejected' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleProductStatus(product._id, 'rejected'); }}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition"
                        >
                          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Reject
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product._id); }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-8">
                {withdrawals.length === 0 ? (
                  <div className="text-center py-20 sm:py-32">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-white/5">
                      <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 text-slate-700" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Vault Secure.</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2">All withdrawal requests have been finalized.</p>
                  </div>
                ) : withdrawals.map((req) => (
                  <div key={req._id} 
                    onClick={() => setSelectedPayout(req)}
                    className="group bg-white/[0.03] p-4 sm:p-8 rounded-[20px] sm:rounded-[32px] border border-white/5 hover:border-purple-500/30 hover:bg-white/5 transition-all flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 sm:gap-8 w-full md:w-auto">
                      <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-[18px] sm:rounded-[28px] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                        <DollarSign className="h-8 w-8 sm:h-10 sm:w-10" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[8px] sm:text-[10px] font-black text-purple-400 uppercase tracking-widest mb-0.5 sm:mb-1 italic">Withdrawal Request</div>
                        <h3 className="font-black text-white text-lg sm:text-2xl tracking-tight mb-1 sm:mb-2 truncate">{req.userId?.name}</h3>
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="text-[10px] sm:text-xs text-slate-400">
                            Gateway: <span className="text-indigo-400 font-black uppercase tracking-widest">{req.userId?.payoutMethod?.split(':')[0] || 'Manual'}</span>
                          </div>
                          <div className="text-[10px] sm:text-sm text-slate-400">
                            Destination: <span className="text-white font-bold bg-white/5 px-2 py-1 rounded border border-white/10 select-all">{req.userId?.payoutMethod?.split(':').slice(1).join(':') || 'Contact Broker'}</span>
                          </div>
                          <div className="text-[8px] sm:text-[10px] text-slate-500 font-medium mt-1">
                            Requested on: {new Date(req.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6 sm:gap-12 w-full md:w-auto">
                      <div className="text-left md:text-right">
                        <div className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5 sm:mb-1">Settlement</div>
                        <div className="text-2xl sm:text-4xl font-black text-white tracking-tighter">${req.amount.toFixed(2)}</div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleApproveWithdrawal(req._id); }}
                        className="flex-1 md:flex-none bg-white text-slate-950 px-6 py-4 sm:px-10 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-xl shadow-white/5"
                      >
                        Finalize
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <div className="hidden md:grid grid-cols-5 gap-4 px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                  <div>Customer</div>
                  <div>Product</div>
                  <div>Method</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
                {allOrders.length === 0 ? (
                  <div className="text-center py-20">
                    <h3 className="text-xl font-black text-white">No Sales Yet.</h3>
                  </div>
                ) : allOrders.map((order) => (
                  <div key={order._id} className="bg-white/[0.03] p-6 rounded-3xl border border-white/5 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="flex flex-col">
                      <span className="text-white font-bold truncate">{order.userId?.name || 'Anonymous'}</span>
                      <span className="text-[10px] text-slate-500">{order.userId?.email}</span>
                    </div>
                    <div className="text-slate-300 font-medium truncate">{order.productId?.title}</div>
                    <div className="uppercase text-[10px] font-black text-indigo-400 tracking-widest">{order.paymentType}</div>
                    <div className="text-white font-black">${order.amount}</div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        order.status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative glass w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/10 shadow-2xl animate-fade-in-up">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-white">
              <X className="h-5 w-5" />
            </button>
            <div className="p-8 sm:p-12">
              <div className="flex items-center gap-3 mb-8">
                <Package className="h-6 w-6 text-indigo-400" />
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Asset Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-6">
                  <div className="aspect-square rounded-[24px] overflow-hidden bg-slate-900 border border-white/10">
                    <img src={selectedProduct.images[0] || 'https://via.placeholder.com/500'} className="w-full h-full object-cover" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedProduct.images.slice(1).map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-[16px] overflow-hidden bg-slate-900 border border-white/10">
                        <img src={img} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-8">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Title</div>
                    <div className="text-2xl font-bold text-white">{selectedProduct.title}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Description</div>
                    <p className="text-slate-400 text-sm leading-relaxed">{selectedProduct.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Price</div>
                      <div className="text-3xl font-black text-white">${selectedProduct.price}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Category</div>
                      <div className="text-lg font-bold text-white capitalize">{selectedProduct.category}</div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-[24px] border border-white/5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Broker Info</div>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-lg">
                        {selectedProduct.sellerId?.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{selectedProduct.sellerId?.name}</div>
                        <div className="text-xs text-slate-400">{selectedProduct.sellerId?.email}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Current Status</div>
                    <span className={`inline-flex px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                      selectedProduct.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                      selectedProduct.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {selectedProduct.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout Details Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedPayout(null)}></div>
          <div className="relative glass w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/10 shadow-2xl animate-fade-in-up">
            <button onClick={() => setSelectedPayout(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-white">
              <X className="h-5 w-5" />
            </button>
            <div className="p-8 sm:p-12">
              <div className="flex items-center gap-3 mb-8">
                <DollarSign className="h-6 w-6 text-purple-400" />
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Payout Dossier</h2>
              </div>
              
              <div className="bg-purple-600/10 p-8 rounded-[24px] border border-purple-500/20 text-center mb-8">
                <div className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">Requested Amount</div>
                <div className="text-5xl font-black text-white tracking-tighter">${selectedPayout.amount.toFixed(2)}</div>
                <div className="text-xs text-slate-400 mt-2">Date: {new Date(selectedPayout.createdAt).toLocaleString()}</div>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 border-b border-white/5 pb-2">Broker Identity</div>
                  <div className="flex items-center gap-4 bg-white/5 p-6 rounded-[20px]">
                    <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 font-black text-2xl">
                      {selectedPayout.userId?.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xl font-black text-white">{selectedPayout.userId?.name}</div>
                      <div className="text-sm text-slate-400">{selectedPayout.userId?.email}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 border-b border-white/5 pb-2">Settlement Instructions</div>
                  <div className="bg-white/5 p-6 rounded-[20px] space-y-4">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Gateway Type</div>
                      <div className="text-lg font-black text-purple-400 uppercase tracking-widest">
                        {selectedPayout.userId?.payoutMethod?.split(':')[0] || 'Manual Setup Required'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Destination Address / Account</div>
                      <div className="text-base font-mono text-white bg-slate-900 p-4 rounded-xl border border-white/5 select-all break-all">
                        {selectedPayout.userId?.payoutMethod?.split(':').slice(1).join(':') || 'No address provided by broker.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => { handleApproveWithdrawal(selectedPayout._id); setSelectedPayout(null); }}
                    className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform shadow-xl shadow-white/5"
                  >
                    Confirm & Finalize Payout
                  </button>
                  <p className="text-[10px] text-center text-slate-500 mt-4 italic">By clicking finalize, you confirm funds have been transferred in the real world.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
