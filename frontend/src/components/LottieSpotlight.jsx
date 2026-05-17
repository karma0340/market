"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { motion } from "framer-motion";

const animationCache = new Map();

const toneClasses = {
  market: "from-[#FF8C00]/20 via-[#FF0080]/10 to-[#00D2FF]/10 border-[#FF8C00]/30",
  secure: "from-[#10B981]/20 via-[#00D2FF]/10 to-[#FF8C00]/10 border-[#10B981]/30",
  creator: "from-[#8000FF]/20 via-[#00D2FF]/10 to-[#FF0080]/10 border-[#8000FF]/30",
};

const sizeClasses = {
  sm: "h-28 w-28",
  md: "h-40 w-40",
  lg: "h-56 w-56",
};

export default function LottieSpotlight({
  src,
  badge,
  title,
  subtitle,
  tone = "market",
  size = "md",
  className = "",
}) {
  const [animationData, setAnimationData] = useState(() => animationCache.get(src) || null);

  useEffect(() => {
    let isMounted = true;

    if (animationCache.has(src)) {
      setAnimationData(animationCache.get(src));
      return () => {
        isMounted = false;
      };
    }

    fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error("Animation unavailable");
        return response.json();
      })
      .then((data) => {
        animationCache.set(src, data);
        if (isMounted) setAnimationData(data);
      })
      .catch(() => {
        if (isMounted) setAnimationData(null);
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-[28px] border bg-[#080808]/90 p-5 shadow-2xl ${toneClasses[tone] || toneClasses.market} ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${toneClasses[tone] || toneClasses.market} opacity-80`} />
      <div className="relative z-10 flex flex-col items-center text-center">
        {badge && (
          <span className="mb-3 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[9px] font-black uppercase tracking-[0.24em] text-white/70">
            {badge}
          </span>
        )}
        <div className={`${sizeClasses[size] || sizeClasses.md} flex items-center justify-center`}>
          {animationData ? (
            <Lottie animationData={animationData} loop autoplay className="h-full w-full" />
          ) : (
            <div className="h-24 w-24 animate-pulse rounded-full border border-white/10 bg-white/5" />
          )}
        </div>
        {title && <h3 className="mt-3 text-lg font-black tracking-tight text-white">{title}</h3>}
        {subtitle && <p className="mt-2 max-w-xs text-xs font-medium leading-relaxed text-[#A1A1AA]">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
