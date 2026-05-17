'use client';
import React, { useEffect, useState } from 'react';
import { ShieldCheck, XCircle, DollarSign, Clock, CheckCircle, ArrowUpRight, HelpCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PayoutsTab({ store, search = '' }) {
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    store.fetchPendingWithdrawals();
  }, []);

  const handleApprove = async (id) => {
    setLoadingId(id);
    try {
      const ok = await store.approveWithdrawal(id);
      if (ok) {
        toast.success('Withdrawal approved and processed successfully!');
      } else {
        toast.error('Failed to approve withdrawal.');
      }
    } catch (err) {
      toast.error('An error occurred during approval.');
    } finally {
      setLoadingId(null);
    }
  };

  const withdrawals = (store.pendingWithdrawals || []).filter(w =>
    !search ||
    w.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.userId?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight uppercase">Withdrawal Requests Queue</h2>
          <p className="text-xs text-[#6B7280]">Review and approve pending withdrawal requests from verified platform brokers.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#ff007f]/10 border border-[#ff007f]/20 text-xs font-bold text-[#ff007f]">
          {withdrawals.length} Pending
        </span>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#0A0A0C] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] border-b border-white/[0.06] bg-black/40">
                <th className="py-4 px-6">Broker</th>
                <th className="py-4 px-6">Method & Details</th>
                <th className="py-4 px-6 text-center">Date Requested</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => {
                const userPm = w.userId?.payoutMethod || 'crypto';
                const userDetails = w.userId || {};

                return (
                  <tr key={w._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff007f] to-[#b200ff] flex items-center justify-center text-xs font-bold text-white shadow-md">
                          {userDetails.name?.charAt(0)?.toUpperCase() || 'B'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{userDetails.name || 'Unknown Broker'}</p>
                          <p className="text-[10px] text-[#6B7280] mt-0.5">{userDetails.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="max-w-xs space-y-1">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {w.payoutAddress ? 'Direct Payout' : userPm.toUpperCase()}
                        </span>
                        <p className="text-xs font-mono text-[#9CA3AF] truncate">
                          {w.payoutAddress || 'Using configured settings'}
                        </p>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center text-[#9CA3AF] text-xs">
                      {new Date(w.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                      <span className="block text-[9px] text-[#6B7280] mt-0.5">
                        {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <span className="text-sm font-black text-white font-mono">${w.amount.toFixed(2)}</span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <button
                        onClick={() => handleApprove(w._id)}
                        disabled={loadingId === w._id}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {loadingId === w._id ? 'Processing...' : 'Approve & Release'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#6B7280]">
                    <div className="w-12 h-12 rounded-full border border-white/[0.06] bg-white/[0.02] flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="text-xs font-bold text-white">All Clear!</p>
                    <p className="text-[10px] mt-1 text-[#6B7280]">There are no pending withdrawal requests to review.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
