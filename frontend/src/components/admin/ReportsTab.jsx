'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const badge = (s) => {
  const m = { approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25', rejected: 'text-rose-400 bg-rose-500/10 border-rose-500/25' };
  return `text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${m[s] || m.pending}`;
};

export default function ReportsTab({ store, tab = 'brokers', search = '' }) {
  const [rejectId, setRejectId] = useState(null);
  const [reason, setReason] = useState('');

  const approve = async (id) => { (await store.approveBroker(id)) ? toast.success('Approved!') : toast.error('Failed'); };
  const reject  = async () => {
    if (!rejectId) return;
    (await store.rejectBroker(rejectId, reason)) ? toast.success('Rejected') : toast.error('Failed');
    setRejectId(null); setReason('');
  };
  const setProductStatus = async (id, status) => { (await store.updateProductStatus(id, status)) ? toast.success(`Product ${status}`) : toast.error('Failed'); };

  const filteredBrokers = store.pendingBrokers.filter(b => 
    !search || 
    b.name?.toLowerCase().includes(search.toLowerCase()) || 
    b.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = store.allProducts.filter(p =>
    !search ||
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.sellerId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = store.users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      {tab === 'brokers' && (
        <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white"><Clock className="h-4 w-4 text-[#ff007f]" />Pending Applications ({filteredBrokers.length})</h3>
          {!filteredBrokers.length && <p className="text-sm text-[#6B7280] py-8 text-center">No pending applications</p>}
          {filteredBrokers.map(b => (
            <div key={b._id} className="p-4 rounded-xl border border-white/[0.06] bg-black/40 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff007f] to-[#b200ff] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{b.name?.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-white">{b.name}</p>
                  {b.isPhoneVerified
                    ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full"><ShieldCheck className="h-3 w-3" />Verified</span>
                    : <span className="text-[10px] font-bold text-[#6B7280] bg-white/5 px-2 py-0.5 rounded-full">Unverified</span>}
                </div>
                <p className="text-xs text-[#6B7280]">{b.email}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => approve(b._id)} className="px-3 py-1.5 rounded-lg bg-[#ff007f]/10 text-[#ff007f] text-xs font-bold hover:bg-[#ff007f]/20 border border-[#ff007f]/20 flex items-center gap-1 transition-colors">
                  <CheckCircle className="h-3.5 w-3.5" />Approve
                </button>
                <button onClick={() => setRejectId(b._id)} className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-bold hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1 transition-colors">
                  <XCircle className="h-3.5 w-3.5" />Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'products' && (
        <div className="rounded-2xl border border-white/[0.07] bg-[#111113] overflow-x-auto">
          <table className="w-full text-sm min-w-[580px]">
            <thead><tr className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] border-b border-white/[0.06] bg-black/30">
              <th className="text-left py-4 px-5">Product</th><th className="text-left py-4">Seller</th>
              <th className="text-right py-4">Price</th><th className="text-center py-4">Status</th><th className="text-right py-4 px-5">Actions</th>
            </tr></thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-5 font-medium text-white">{p.title}</td>
                  <td className="py-3.5 text-[#6B7280]">{p.sellerId?.name || '—'}</td>
                  <td className="py-3.5 text-right text-[#ff007f] font-bold">{p.currency === 'INR' ? '₹' : '$'}{p.price}</td>
                  <td className="py-3.5 text-center"><span className={badge(p.status)}>{p.status}</span></td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {p.status !== 'approved'  && <button onClick={() => setProductStatus(p._id, 'approved')}  className="text-emerald-400 hover:text-emerald-300 transition-colors"><CheckCircle className="h-4 w-4" /></button>}
                      {p.status !== 'rejected'  && <button onClick={() => setProductStatus(p._id, 'rejected')}  className="text-rose-400 hover:text-rose-300 transition-colors"><XCircle className="h-4 w-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredProducts.length && <tr><td colSpan={5} className="py-10 text-center text-[#6B7280] text-sm">No products found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div className="rounded-2xl border border-white/[0.07] bg-[#111113] overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead><tr className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] border-b border-white/[0.06] bg-black/30">
              <th className="text-left py-4 px-5">User</th>
              <th className="text-left py-4">Role</th>
              <th className="text-left py-4">Reg. Date</th>
              <th className="text-left py-4">IP Address</th>
              <th className="text-center py-4">Orders</th>
              <th className="text-center py-4 px-5">Verified</th>
            </tr></thead>
            <tbody>
              {filteredUsers.map(u => {
                const userOrders = store.orders.filter(o => o.userId?._id === u._id);
                const orderCount = userOrders.length;
                const regDate = new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                return (
                  <tr key={u._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D2FF] to-[#0070FF] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{u.name?.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-white block truncate">{u.name}</span>
                          <span className="text-[10px] text-[#6B7280] block truncate">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-left"><span className={badge(u.role === 'admin' ? 'approved' : u.role === 'broker' ? 'pending' : 'rejected')}>{u.role}</span></td>
                    <td className="py-3.5 text-[#6B7280] text-xs">{regDate}</td>
                    <td className="py-3.5 text-[#6B7280] text-xs font-mono">{u.registrationIp || u.lastIp || 'N/A'}</td>
                    <td className="py-3.5 text-center font-bold text-white">{orderCount}</td>
                    <td className="py-3.5 text-center px-5">{u.isPhoneVerified ? <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto" /> : <XCircle className="h-4 w-4 text-rose-400 mx-auto" />}</td>
                  </tr>
                );
              })}
              {!filteredUsers.length && <tr><td colSpan={6} className="py-10 text-center text-[#6B7280] text-sm">No users found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#111113] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-[#ff007f] uppercase tracking-widest mb-4">Reject Broker</h3>
            <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for rejection..." rows={3}
              className="w-full rounded-xl p-3 bg-black border border-white/[0.08] text-white text-sm outline-none focus:border-[#ff007f] transition-colors resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={reject}                                             className="flex-1 py-2.5 rounded-xl bg-[#ff007f] text-white font-bold text-sm hover:bg-[#e6006e] transition-colors">Confirm</button>
              <button onClick={() => { setRejectId(null); setReason(''); }}        className="flex-1 py-2.5 rounded-xl bg-white/5 text-[#94A3B8] font-bold text-sm hover:bg-white/10 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
