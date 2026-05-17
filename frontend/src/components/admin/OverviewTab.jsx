'use client';
import { motion } from 'framer-motion';
import { NeonAreaChart, NeonLineChart, GlowingProgressCircle } from '@/components/NeonCharts';
import { useMemo } from 'react';

function StatCard({ label, value, sub, trend, data, color }) {
  const isLongValue = typeof value === 'string' && value.length > 12;
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-5 flex flex-col gap-3 hover:border-white/[0.12] transition-all group min-w-0">
      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{label}</p>
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 flex-wrap">
        <p className={`font-extrabold text-white tracking-tight ${isLongValue ? 'text-lg sm:text-xl md:text-2xl' : 'text-2xl sm:text-3xl'}`} title={value}>
          {value}
        </p>
        {trend && <span className="text-[10px] font-bold" style={{ color }}>{trend}</span>}
      </div>
      {sub && <p className="text-xs text-[#6B7280]">{sub}</p>}
      {data && (
        <div className="h-14 -mx-2 mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <NeonAreaChart data={data} dataKey="value" color={color || '#ff007f'} height={56} />
        </div>
      )}
    </div>
  );
}

export default function OverviewTab({ stats }) {
  const s = stats;
  const sp1 = useMemo(() => s?.monthlyRevenue?.map(m => ({ value: m.revenue })) || [], [s?.monthlyRevenue]);
  const sp2 = useMemo(() => s?.monthlyRevenue?.map(m => ({ value: m.orders })) || [], [s?.monthlyRevenue]);
  const sp3 = useMemo(() => s?.monthlyRevenue?.map(m => ({ value: m.orders })) || [], [s?.monthlyRevenue]);
  const monthly = useMemo(() =>
    s?.monthlyRevenue?.map(m => ({ month: m.month, revenue: m.revenue, orders: m.orders || 0 })) || [],
  [s?.monthlyRevenue]);

  const revStr = `$${(s?.totalRevenueUSD || 0).toLocaleString()}${s?.totalRevenueINR ? ` | ₹${s.totalRevenueINR.toLocaleString()}` : ''}`;
  const cards = [
    { label: 'Total Revenue',     value: revStr,  sub: 'All time',        trend: '+12.4%', data: sp1, color: '#ff007f' },
    { label: 'Total Orders',      value: (s?.totalOrders    || 0).toLocaleString(),       sub: 'Completed sales', trend: '+8.2%',  data: sp2, color: '#b200ff' },
    { label: 'Registered Users',  value: (s?.totalUsers     || 0).toLocaleString(),       sub: 'Total accounts',  trend: '+5.1%',  data: sp3, color: '#00D2FF' },
    { label: 'Pending Brokers',   value: (s?.pendingBrokers || 0).toLocaleString(),       sub: 'Awaiting review', trend: null,     data: null, color: '#10B981' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-6 flex flex-col items-center gap-4">
          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest self-start">Revenue Target</p>
          <GlowingProgressCircle value={s?.totalRevenueUSD || 0} max={1000000} size={180} color="#ff007f" />
          <div className="text-center">
            <p className="text-sm font-bold text-white">${(s?.totalRevenueUSD || 0).toLocaleString()} <span className="text-[#6B7280] font-normal">/ $1M Goal</span></p>
            <p className="text-xs text-[#6B7280] mt-0.5">{s?.totalUsers || 0} active users</p>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-white/[0.07] bg-[#111113] p-6">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Earnings Overview</p>
            <div className="flex gap-4 text-[10px] font-bold text-[#6B7280]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-0.5 rounded bg-[#ff007f] inline-block" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-0.5 rounded bg-[#b200ff] inline-block" />Orders</span>
            </div>
          </div>
          <NeonLineChart data={monthly} lines={[{ key: 'revenue', name: 'Revenue', color: '#ff007f' }, { key: 'orders', name: 'Orders', color: '#b200ff' }]} height={220} />
        </div>
      </div>
    </motion.div>
  );
}
