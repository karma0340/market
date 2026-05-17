'use client';
import React, { memo, useEffect, useRef, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';

// Wrapper that observes real pixel size and passes it to children
function SizedChart({ height, children }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) { setWidth(w); setReady(true); }
    });
    ro.observe(ref.current);
    // initial check
    const w = ref.current.offsetWidth;
    if (w > 0) { setWidth(w); setReady(true); }
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height, minHeight: height, minWidth: 0 }}>
      {ready && width > 0 ? children(width, height) : null}
    </div>
  );
}

export const NeonAreaChart = memo(({ data, dataKey = 'revenue', color = '#b200ff', height = 200 }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !data?.length) return <div style={{ height, width: '100%' }} />;

  return (
    <SizedChart height={height}>
      {(w, h) => (
        <AreaChart width={w} height={h} data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`ag-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1E293B', borderRadius: 8, color: '#fff' }}
            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
            labelStyle={{ color: '#64748B' }}
            isAnimationActive={false}
          />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
            fillOpacity={1} fill={`url(#ag-${dataKey})`} isAnimationActive={false} />
        </AreaChart>
      )}
    </SizedChart>
  );
});

export const NeonLineChart = memo(({ data, lines = [], xAxisKey = 'month', height = 250 }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !data?.length) return <div style={{ height, width: '100%' }} />;

  return (
    <SizedChart height={height}>
      {(w, h) => (
        <LineChart width={w} height={h} data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey={xAxisKey} stroke="#334155" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis stroke="#334155" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
          <Tooltip
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1E293B', borderRadius: 8, color: '#fff' }}
            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
            labelStyle={{ color: '#64748B' }}
            isAnimationActive={false}
          />
          {lines.map((line, i) => (
            <Line key={i} type="monotone" dataKey={line.key} name={line.name}
              stroke={line.color} strokeWidth={2}
              dot={{ r: 2, fill: '#020617', stroke: line.color, strokeWidth: 1 }}
              activeDot={{ r: 4, fill: line.color, stroke: '#fff', strokeWidth: 1 }}
              isAnimationActive={false} />
          ))}
        </LineChart>
      )}
    </SizedChart>
  );
});

export const GlowingProgressCircle = memo(({ value, max, size = 160, color = '#ff007f', label, subLabel }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min(Math.max((value || 0) / (max || 1), 0), 1);
  const offset = circumference - percent * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#1E293B" strokeWidth={strokeWidth} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold tracking-tight" style={{ color }}>{Math.round(percent * 100)}%</span>
        {label && <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mt-1">{label}</span>}
        {subLabel && <span className="text-[10px] text-[#64748B] mt-0.5">{subLabel}</span>}
      </div>
    </div>
  );
});

export const AssetPerformanceChart = memo(({ data, height = 200 }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !data?.length) return <div style={{ height, width: '100%' }} />;

  return (
    <SizedChart height={height}>
      {(w, h) => (
        <LineChart width={w} height={h} data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="date" stroke="#334155" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis stroke="#334155" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1E293B', borderRadius: 8, color: '#fff' }}
            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
            labelStyle={{ color: '#64748B' }}
            isAnimationActive={false}
          />
          <Line type="monotone" dataKey="downloads" name="Downloads" stroke="#ff007f" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
          <Line type="monotone" dataKey="views" name="Views" stroke="#b200ff" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
        </LineChart>
      )}
    </SizedChart>
  );
});

