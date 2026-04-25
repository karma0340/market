"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { 
  Wallet, PlusCircle, CreditCard, Clock, 
  CheckCircle, AlertCircle, TrendingUp, 
  Package, ExternalLink, ChevronRight, 
  DollarSign, ShieldCheck, Zap, BarChart3,
  ArrowUpRight, LayoutGrid
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function BrokerDashboard() {
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cryptoCurrency, setCryptoCurrency] = useState('usdttrc20');
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const initialPayout = user?.payoutMethod?.split(':') || ['bank', ''];
  const [payoutMethod, setPayoutMethod] = useState(initialPayout[0]);
  const [myProducts, setMyProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [payoutDetails, setPayoutDetails] = useState(initialPayout[1]);
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [payoutBreakdown, setPayoutBreakdown] = useState(null);

  useEffect(() => {
    setMounted(true);
    if (user && user.role === 'broker') {
      fetchWallet();
      fetchMyProducts();
      fetchTransactions();
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [user]);

  useEffect(() => {
    if (wallet?.cryptoWallet?.address) {
      setCryptoAddress(wallet.cryptoWallet.address);
      setCryptoCurrency(wallet.cryptoWallet.currency || 'usdttrc20');
    }
  }, [wallet]);

  // Automatic redirect if session lost
  useEffect(() => {
    if (mounted && !user) {
      toast.error('Session expired. Please re-authenticate.');
      setTimeout(() => window.location.href = '/login', 2000);
    }
  }, [user, mounted]);

  const handleSavePayout = async () => {
    setIsSavingPayout(true);
    try {
      await api.put('/auth/payout-settings', { payoutMethod: `${payoutMethod}:${payoutDetails}` });
      toast.success('Payout intelligence synced!');
    } catch (error) {
      toast.error('Failed to sync payout settings');
    } finally {
      setIsSavingPayout(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/wallet/transactions');
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions');
    }
  };

  const fetchMyProducts = async () => {
    try {
      const { data } = await api.get('/products');
      const ownProducts = data.filter(p => p.sellerId?._id === user?._id || p.sellerId === user?._id);
      setMyProducts(ownProducts);
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  const fetchWallet = async () => {
    try {
      const { data } = await api.get('/wallet');
      setWallet(data);
    } catch (error) {
      toast.error('Failed to load wallet data');
    }
  };

  const saveCryptoWallet = async () => {
    if (!cryptoAddress.trim()) return toast.error('Please enter a wallet address');
    setIsSavingWallet(true);
    try {
      await api.put('/wallet/crypto-wallet', { address: cryptoAddress, currency: cryptoCurrency });
      toast.success('Crypto wallet saved! You can now request payouts.');
      fetchWallet();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save wallet');
    } finally {
      setIsSavingWallet(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    if (!cryptoAddress) return toast.error('Please save a crypto wallet address first in the Payout Protocol section below.');
    
    try {
      const { data } = await api.post('/wallet/withdraw', { amount: Number(withdrawAmount) });
      toast.success(`Payout of $${data.breakdown.brokerReceives} requested! Platform fee: $${data.breakdown.platformFee}`);
      setPayoutBreakdown(data.breakdown);
      setWithdrawAmount('');
      fetchWallet();
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    }
  };

  if (!mounted) return null;

  if (!user || user.role !== 'broker') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-12 glass rounded-[40px] border border-white/5 max-w-md w-full relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-8 animate-pulse" />
          <h2 className="text-3xl font-black text-white tracking-tighter">Access Restricted</h2>
          <p className="text-slate-400 mt-4 italic leading-relaxed">This hub is reserved for verified brokers. Your current clearance is insufficient.</p>
          <Link href="/login" className="mt-10 block px-8 py-4 bg-white text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs hover:scale-105 transition-all">
            Re-authenticate
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen pt-24 lg:pt-32 pb-12 px-4 sm:px-6 relative overflow-hidden text-slate-200">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-50"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">
              <Zap className="h-3 w-3 animate-pulse" /> Command Center v2.0
            </div>
            <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-none mb-4">
              Broker <span className="text-indigo-500">Vault.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed italic">Manage your digital empire and monitor real-time performance streaming.</p>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass px-6 py-4 rounded-3xl border border-white/5 flex flex-col items-end"
            >
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Local Time</div>
              <div className="text-3xl font-black text-white tracking-tighter font-mono">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </div>
            </motion.div>

            <Link 
              href="/dashboard/broker/upload" 
              className="inline-flex items-center justify-center gap-4 bg-white text-slate-950 px-8 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/5 group"
            >
              <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />
              Forge New Asset
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Dashboard Core */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* High Impact Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-8 sm:p-10 rounded-[48px] border border-white/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp className="h-24 w-24 text-indigo-500" />
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                  <BarChart3 className="h-4 w-4 text-indigo-400" /> Cumulative Revenue
                </div>
                <div className="text-5xl font-black text-white tracking-tighter leading-none mb-4">
                  ${wallet?.balance.toFixed(2) || '0.00'}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-green-400 uppercase tracking-widest bg-green-400/5 px-3 py-1.5 rounded-full w-fit">
                  <ArrowUpRight className="h-3 w-3" /> +14.2% Growth
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-8 sm:p-10 rounded-[48px] border border-white/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Package className="h-24 w-24 text-purple-500" />
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                  <LayoutGrid className="h-4 w-4 text-purple-400" /> Deployed Assets
                </div>
                <div className="text-5xl font-black text-white tracking-tighter leading-none mb-4">
                  {myProducts.length}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                  Active in {new Set(myProducts.map(p => p.category)).size} Global Clusters
                </div>
              </motion.div>
            </div>

            {/* Managed Assets Stream */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass p-8 sm:p-10 rounded-[48px] border border-white/5"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3 uppercase tracking-widest text-xs text-slate-400">
                  <Zap className="h-5 w-5 text-indigo-500 animate-pulse" /> Deployment Stream
                </h2>
                <Link href="/products" className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors border-b border-white/10 pb-1">View Public Store</Link>
              </div>
              
              <div className="space-y-4">
                {myProducts.length === 0 ? (
                  <div className="text-center py-24 bg-white/[0.02] rounded-[40px] border border-dashed border-white/10">
                    <Package className="h-16 w-16 text-slate-800 mx-auto mb-6" />
                    <p className="text-sm font-bold text-slate-500 italic max-w-xs mx-auto">No assets forged yet. Initiate your first deployment above.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {myProducts.map((p, idx) => (
                      <motion.div 
                        key={p._id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="group flex items-center justify-between p-5 bg-white/[0.03] rounded-[32px] border border-white/5 hover:bg-white/[0.06] hover:border-indigo-500/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[24px] bg-slate-900 overflow-hidden border border-white/10 shadow-2xl">
                            <img src={p.images[0]} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          </div>
                          <div>
                            <h4 className="font-black text-white text-lg tracking-tight group-hover:text-indigo-400 transition-colors">{p.title}</h4>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">${p.price}</span>
                              <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className={`hidden sm:block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            p.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 
                            p.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
                            'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {p.status}
                          </span>
                          <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-slate-950 transition-all">
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </div>

          {/* Intelligence Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Wallet Terminal */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-[48px] border border-white/5 overflow-hidden shadow-2xl shadow-indigo-500/5"
            >
              <div className="p-10 bg-gradient-to-br from-indigo-600 to-indigo-800 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="relative z-10">
                  <h3 className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5" /> Liquid Balance
                  </h3>
                  <div className="text-5xl font-black text-white tracking-tighter mb-8">${wallet?.balance.toFixed(2) || '0.00'}</div>
                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div className="relative">
                      <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                      <input
                        type="number"
                        min="1"
                        max={wallet?.balance || 0}
                        value={withdrawAmount}
                        onChange={(e) => {
                          setWithdrawAmount(e.target.value);
                          setPayoutBreakdown(null);
                        }}
                        placeholder="Amount to withdraw"
                        className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white text-sm font-bold placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                      />
                    </div>
                    {withdrawAmount > 0 && (
                      <div className="bg-white/10 rounded-2xl p-4 text-[10px] font-bold space-y-1.5">
                        <div className="flex justify-between text-white/70">
                          <span>You requested</span><span>${Number(withdrawAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-300">
                          <span>You receive (80%)</span><span>${(Number(withdrawAmount) * 0.8).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/40">
                          <span>Platform fee (20%)</span><span>-${(Number(withdrawAmount) * 0.2).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > (wallet?.balance || 0)}
                      className="w-full bg-white text-indigo-600 font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
                    >
                      Request Crypto Payout
                    </button>
                  </form>
                </div>
              </div>
              <div className="p-8 space-y-4 bg-white/[0.02]">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Escrow Pending</span>
                  <span className="text-white">${wallet?.pending.toFixed(2) || '0.00'}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[60%] animate-pulse"></div>
                </div>
                <div className="text-[9px] text-slate-600 font-bold italic leading-relaxed">
                  * Dynamic security lock applied to new funds for 7 days
                </div>
              </div>
            </motion.div>

            {/* Crypto Payout Protocol */}
            <div className="glass p-8 rounded-[48px] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldCheck className="h-20 w-20 text-indigo-400" />
              </div>
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-2 flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-indigo-500" /> Crypto Payout Wallet
              </h3>
              <p className="text-[9px] text-slate-500 italic mb-6">Payouts are sent automatically in crypto when admin approves.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Network / Currency</label>
                  <select
                    value={cryptoCurrency}
                    onChange={(e) => setCryptoCurrency(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="usdttrc20">USDT (TRC20 - Tron)</option>
                    <option value="usdterc20">USDT (ERC20 - Ethereum)</option>
                    <option value="btc">Bitcoin (BTC)</option>
                    <option value="eth">Ethereum (ETH)</option>
                    <option value="bnbbsc">BNB (BSC)</option>
                    <option value="ltc">Litecoin (LTC)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Your Wallet Address</label>
                  <input
                    type="text"
                    placeholder="Enter your crypto wallet address"
                    value={cryptoAddress}
                    onChange={(e) => setCryptoAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-[11px] font-bold placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
                {wallet?.cryptoWallet?.address && (
                  <div className="flex items-center gap-2 text-[9px] text-green-400 font-bold">
                    <CheckCircle className="h-3 w-3" /> Wallet saved: {wallet.cryptoWallet.address.slice(0, 12)}...{wallet.cryptoWallet.address.slice(-6)}
                  </div>
                )}
                <button
                  onClick={saveCryptoWallet}
                  disabled={isSavingWallet || !cryptoAddress}
                  className="w-full bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-[10px] transition-all disabled:opacity-50"
                >
                  {isSavingWallet ? 'Saving...' : 'Save Wallet Address'}
                </button>
              </div>
            </div>

            {/* Performance History */}
            <div className="glass p-8 rounded-[48px] border border-white/5">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <Clock className="h-4 w-4 text-slate-500" /> Live Stream
              </h3>
              <div className="space-y-6">
                {transactions.slice(0, 4).map((t) => (
                  <div key={t._id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-2xl ${t.type === 'withdrawal' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                        <TrendingUp className={`h-4 w-4 ${t.type === 'withdrawal' ? 'rotate-180' : ''}`} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{t.type}</p>
                        <p className="text-[9px] text-slate-500 font-bold">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-black ${t.type === 'withdrawal' ? 'text-red-500' : 'text-white'}`}>
                      {t.type === 'withdrawal' ? '-' : '+'}${t.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
                {transactions.length === 0 && <p className="text-[10px] text-slate-600 text-center py-6 italic font-medium">No active streams detected</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
