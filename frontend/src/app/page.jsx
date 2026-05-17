"use client";

import Link from 'next/link';
import { ArrowRight, Shield, ShoppingBag, CheckCircle, DollarSign, Code, LayoutTemplate, BookOpen, PenTool, Database, MonitorPlay, Upload, Zap, Activity } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

export default function Home() {
  // Use pure window scroll for maximum performance and to avoid ref offset errors
  const { scrollYProgress } = useScroll();

  // Hero Parallax Transforms directly from pure scroll progress (removes lag)
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 300]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const orbY1 = useTransform(scrollYProgress, [0, 1], [0, 1000]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -800]);

  // Storytelling Transforms
  const storyOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.3], [0, 1, 0]);
  const storyScale = useTransform(scrollYProgress, [0.1, 0.2, 0.3], [0.8, 1, 1.2]);

  return (
    <div className="relative bg-[#020617] min-h-[300vh] overflow-hidden selection:bg-[#00D2FF]/30">

      {/* ── Background Orbs (Parallax) ───────────────────── */}
      <motion.div 
        style={{ y: orbY1 }} 
        className="fixed top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#00D2FF]/10 rounded-full blur-[120px] md:blur-[150px] pointer-events-none"
      />
      <motion.div 
        style={{ y: orbY2 }} 
        className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#0070FF]/10 rounded-full blur-[120px] md:blur-[180px] pointer-events-none"
      />

      {/* ── 1. Hero Section (Parallax Fade) ──────────────── */}
      <motion.div 
        style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
        className="h-[100svh] sticky top-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 z-10"
      >
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="w-full max-w-[90vw] md:max-w-7xl mx-auto flex flex-col items-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full px-4 py-2 sm:px-5 sm:py-2 text-[10px] sm:text-xs font-bold mb-6 sm:mb-8 bg-[#0F172A]/80 backdrop-blur-md border border-[#1E293B] text-[#00D2FF] uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,210,255,0.15)]">
            <span className="flex h-2 w-2 rounded-full bg-[#00D2FF] animate-ping" />
            <span className="truncate max-w-[200px] sm:max-w-none">The New Standard</span>
          </motion.div>

          {/* Fluid Typography using vw */}
          <motion.h1 variants={fadeUp} className="text-[14vw] md:text-[11vw] font-black tracking-tighter leading-[0.85] mb-6 sm:mb-8 text-white uppercase mix-blend-screen w-full break-words">
            The Future <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-[#E2E8F0] to-[#00D2FF] drop-shadow-2xl">
              Is Digital.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-sm sm:text-xl md:text-2xl max-w-[90%] md:max-w-3xl mx-auto text-[#94A3B8] font-medium leading-relaxed mb-10 sm:mb-12">
            Join the elite circle of creators. Buy and sell premium code, stunning designs, and futuristic digital assets with bank-grade security.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link href="/products" className="group relative w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-white text-black text-sm sm:text-base font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-[#00D2FF] to-[#0070FF] opacity-0 group-hover:opacity-10 transition-opacity"></span>
              Start Exploring <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register" className="group relative w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-[#0F172A]/80 backdrop-blur-md text-white text-sm sm:text-base font-black rounded-2xl border border-[#1E293B] hover:border-[#00D2FF]/50 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-[#00D2FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
              Start Selling <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-[#00D2FF]" />
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Marquee Ticker ─────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden border-t border-[#1E293B] bg-[#020617]/50 backdrop-blur-md py-3 sm:py-4 z-20">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
            className="flex whitespace-nowrap items-center w-max"
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 sm:gap-16 px-8 sm:px-16 text-[10px] sm:text-sm font-bold text-[#64748B] uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-[#00D2FF]" /> $2.4M+ Paid to Creators</span>
                <span>•</span>
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#10B981]" /> 10,000+ Premium Assets</span>
                <span>•</span>
                <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-[#0070FF]" /> 100% Encrypted Protocol</span>
                <span>•</span>
                <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-[#F59E0B]" /> Sub-second Delivery</span>
                <span>•</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ── Spacer for Scroll ── */}
      <div className="h-[10vh]"></div>

      {/* ── 2. Storytelling Section ──────────────────────── */}
      <div className="py-20 sm:py-32 relative flex items-center justify-center">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="w-full px-4 sm:px-6 flex items-center justify-center text-center"
        >
          <div className="max-w-[90vw] md:max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-[#10B981] leading-tight mb-4 sm:mb-6">
              We eliminated the middleman.
            </h2>
            <p className="text-lg sm:text-2xl md:text-3xl font-semibold text-[#94A3B8] leading-relaxed">
              No hidden fees. No delayed payouts. Just a seamless protocol connecting elite creators directly with buyers. Experience raw efficiency.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── 3. The Protocol (Sticky Scrolling Layout) ────── */}
      <div className="relative bg-[#0F172A] border-y border-[#1E293B] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
          
          <div className="lg:w-1/3">
            <div className="lg:sticky top-32 space-y-4 sm:space-y-6">
              <div className="text-[10px] font-black text-[#00D2FF] uppercase tracking-[0.3em] mb-2 sm:mb-4">Architecture</div>
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter leading-none">
                THE <br className="hidden sm:block"/>PROTOCOL.
              </h2>
              <p className="text-base sm:text-lg text-[#94A3B8] font-medium leading-relaxed">
                A perfectly engineered system designed for speed, security, and scale. Watch how value flows.
              </p>
            </div>
          </div>

          <div className="lg:w-2/3 space-y-16 sm:space-y-20 lg:space-y-32 lg:py-10">
            {/* Step 1 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="group relative">
              <div className="absolute -inset-4 sm:-inset-8 bg-gradient-to-r from-[#00D2FF]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-8">
                <div className="text-5xl sm:text-6xl font-black text-[#1E293B] group-hover:text-[#00D2FF] transition-colors leading-none">01</div>
                <div>
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-[#00D2FF]" />
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Encrypted Upload</h3>
                  </div>
                  <p className="text-lg sm:text-xl text-[#94A3B8] leading-relaxed font-medium">
                    Sellers deploy their assets into our secure vault. Every file is instantly encrypted with bank-grade AES-256 protocols and held in a fragmented state.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="group relative">
              <div className="absolute -inset-4 sm:-inset-8 bg-gradient-to-r from-[#10B981]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-8">
                <div className="text-5xl sm:text-6xl font-black text-[#1E293B] group-hover:text-[#10B981] transition-colors leading-none">02</div>
                <div>
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-[#10B981]" />
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Instant Verification</h3>
                  </div>
                  <p className="text-lg sm:text-xl text-[#94A3B8] leading-relaxed font-medium">
                    Buyers execute transactions via hyper-fast gateways (Stripe/Razorpay/Crypto). Our consensus engine validates the transaction in milliseconds.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="group relative">
              <div className="absolute -inset-4 sm:-inset-8 bg-gradient-to-r from-[#0070FF]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-8">
                <div className="text-5xl sm:text-6xl font-black text-[#1E293B] group-hover:text-[#0070FF] transition-colors leading-none">03</div>
                <div>
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#0070FF]" />
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Streamed Delivery</h3>
                  </div>
                  <p className="text-lg sm:text-xl text-[#94A3B8] leading-relaxed font-medium">
                    Upon validation, a unique, timed decryption token is generated. The asset streams directly to the buyer's private library, completely bypassing public networks.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* ── 4. Ecosystem & Features (Glass Grid) ─────────── */}
      <div className="py-24 sm:py-32 bg-[#020617] relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 sm:mb-6">
              THE ECOSYSTEM.
            </h2>
            <p className="text-lg sm:text-xl text-[#94A3B8] font-medium max-w-2xl mx-auto">
              Everything you need to buy and sell at the highest level. No compromises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "Zero-Trust Vault",
                desc: "Your files are stored in our encrypted local delivery system, accessible only via timed streaming tokens.",
                icon: <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-[#00D2FF]" />
              },
              {
                title: "Liquid Payouts",
                desc: "Withdraw your earnings instantly to Bank, PayPal, or Crypto. No 30-day holds. Capital is yours.",
                icon: <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-[#10B981]" />
              },
              {
                title: "Curated Elite",
                desc: "Every product is hand-reviewed by our admin elite to ensure only the highest quality code and assets enter the network.",
                icon: <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-[#0070FF]" />
              }
            ].map((f, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} 
                className="bg-[#0F172A]/50 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] border border-[#1E293B] hover:border-[#00D2FF]/30 hover:bg-[#0F172A] transition-all hover:-translate-y-2 group"
              >
                <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-[#020617] inline-block rounded-2xl border border-[#1E293B] shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4 text-white tracking-tight">{f.title}</h3>
                <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Immersive CTA ─────────────────────────────── */}
      <div className="h-[100svh] relative flex items-center justify-center overflow-hidden z-20 bg-[#020617]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00D2FF]/10 to-transparent"></div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="relative z-10 text-center px-4 w-full"
        >
          <div className="text-[10px] sm:text-[12px] font-black text-[#00D2FF] uppercase tracking-[0.4em] mb-4 sm:mb-6">Initiate Sequence</div>
          
          {/* Fluid Typography for CTA */}
          <h2 className="text-[14vw] md:text-[11vw] font-black mb-8 sm:mb-10 tracking-tighter leading-none text-white uppercase mix-blend-screen w-full break-words">
            Are You <br className="hidden sm:block"/> Ready?
          </h2>
          
          <Link
            href="/register"
            className="group relative inline-flex items-center justify-center gap-3 sm:gap-4 px-8 sm:px-12 py-4 sm:py-6 bg-white text-black rounded-full overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#00D2FF] to-[#0070FF] opacity-0 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative z-10 text-base sm:text-xl font-black uppercase tracking-widest group-hover:text-white transition-colors">Enter The Market</span>
            <ArrowRight className="relative z-10 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 group-hover:text-white transition-all" />
          </Link>
        </motion.div>
      </div>
      
    </div>
  );
}
