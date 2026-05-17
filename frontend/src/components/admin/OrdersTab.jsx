'use client';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, TrendingUp, Download } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const badge = (s) => {
  const m = { completed:'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', pending:'text-yellow-400 bg-yellow-500/10 border-yellow-500/25', failed:'text-rose-400 bg-rose-500/10 border-rose-500/25', processing:'text-blue-400 bg-blue-500/10 border-blue-500/25' };
  return `text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${m[s] || m.pending}`;
};

function MiniStat({ label, value, icon: Icon, color }) {
  const isLong = typeof value === 'string' && value.length > 12;
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-5 flex items-center gap-4 min-w-0">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{label}</p>
        <p className={`font-extrabold text-white mt-0.5 tracking-tight truncate ${isLong ? 'text-sm sm:text-base md:text-lg lg:text-xl' : 'text-xl'}`} title={value}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function OrdersTab({ orders, search }) {
  const filtered = orders.filter(o =>
    !search ||
    o._id?.toLowerCase().includes(search.toLowerCase()) ||
    o.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.productId?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUSD = orders.filter(o => o.currency !== 'INR').reduce((s, o) => s + (o.amount || 0), 0);
  const totalINR = orders.filter(o => o.currency === 'INR').reduce((s, o) => s + (o.amount || 0), 0);
  
  const usdCount = orders.filter(o => o.currency !== 'INR').length;
  const inrCount = orders.filter(o => o.currency === 'INR').length;

  const avgUSD = usdCount ? Math.round(totalUSD / usdCount) : 0;
  const avgINR = inrCount ? Math.round(totalINR / inrCount) : 0;

  const revenueValue = `$${totalUSD.toLocaleString()}${totalINR > 0 ? ` | ₹${totalINR.toLocaleString()}` : ''}`;
  const avgValue = `$${avgUSD}${avgINR > 0 ? ` | ₹${avgINR}` : ''}`;

  const handleDownloadInvoice = async (id) => {
    try {
      const toastId = toast.loading('Generating invoice...');
      const response = await api.get(`/admin/orders/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Invoice downloaded', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to download invoice');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniStat label="Total Orders"   value={orders.length}                         icon={ShoppingBag}  color="#ff007f" />
        <MiniStat label="Total Revenue"  value={revenueValue}   icon={DollarSign}   color="#10B981" />
        <MiniStat label="Avg. Order"     value={avgValue}                        icon={TrendingUp}   color="#00D2FF" />
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-[#111113] overflow-x-auto">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">All Orders</h3>
        </div>
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] border-b border-white/[0.06] bg-black/20">
              <th className="text-left py-3.5 px-5">Order ID</th>
              <th className="text-left py-3.5">Buyer</th>
              <th className="text-left py-3.5">Product</th>
              <th className="text-right py-3.5">Amount</th>
              <th className="text-center py-3.5">Status</th>
              <th className="text-right py-3.5">Date</th>
              <th className="text-center py-3.5 px-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-5 font-mono text-[11px] text-[#6B7280]">#{o._id?.slice(-8)}</td>
                <td className="py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ff007f] to-[#b200ff] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                      {o.userId?.name?.charAt(0) || '?'}
                    </div>
                    <span className="text-white font-medium">{o.userId?.name || '—'}</span>
                  </div>
                </td>
                <td className="py-3.5 text-[#6B7280] max-w-[180px] truncate">{o.productId?.title || '—'}</td>
                <td className="py-3.5 text-right text-[#ff007f] font-bold">{o.currency === 'INR' ? '₹' : '$'}{o.amount || 0}</td>
                <td className="py-3.5 text-center"><span className={badge(o.status)}>{o.status || 'pending'}</span></td>
                <td className="py-3.5 text-right text-[#6B7280] text-xs">
                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </td>
                <td className="py-3.5 px-5 text-center">
                  <button 
                    onClick={() => handleDownloadInvoice(o._id)}
                    className="p-2 bg-[#1A1A1D] hover:bg-[#2A2A2D] text-[#00D2FF] rounded-lg transition-colors border border-white/[0.05]"
                    title="Download Invoice"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={6} className="py-12 text-center text-[#6B7280] text-sm">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
