import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Zap, Star, Users, Globe, CheckCircle, ShoppingBag, Upload, ShieldCheck, DollarSign } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative bg-slate-950 overflow-hidden min-h-screen">
      {/* Immersive Background */}
      <div className="absolute inset-0 mesh-gradient opacity-40"></div>
      
      {/* Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000"></div>

      {/* Hero Section */}
      <div className="relative pt-12 pb-10 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="animate-fade-in-up text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-[10px] sm:text-xs font-bold text-indigo-400 mb-4 lg:mb-8 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Voted #1 Digital Marketplace of 2026
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tight text-white leading-[0.9] mb-4 lg:mb-8">
                THE FUTURE <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  IS DIGITAL.
                </span>
              </h1>
              
              <p className="text-sm sm:text-lg lg:text-xl text-slate-400 max-w-xl lg:mx-0 mx-auto leading-relaxed mb-6 lg:mb-12">
                Join the elite circle of 10,000+ creators. Buy and sell premium code, stunning designs, and futuristic digital assets with instant, secure delivery.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <Link
                  href="/products"
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-2xl shadow-indigo-500/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 group"
                >
                  Start Exploring <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all text-center backdrop-blur-md"
                >
                  List Your Assets
                </Link>
              </div>
            </div>

            <div className="relative group perspective-1000 hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[40px] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative glass rounded-[40px] p-4 border border-white/10 overflow-hidden transform group-hover:rotate-x-2 group-hover:rotate-y-2 transition-transform duration-700">
                <Image 
                  src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80" 
                  alt="Marketplace Interface" 
                  width={800}
                  height={500}
                  className="rounded-[32px] shadow-2xl w-full h-auto object-cover"
                  priority={true}
                />
                
                {/* Floating Stats UI */}
                <div className="absolute bottom-10 left-10 glass p-6 rounded-3xl border border-white/20 animate-bounce-slow">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500/20 p-3 rounded-2xl">
                      <Zap className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white">$12.4k</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Earnings Today</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: How it Works Section */}
      <div className="relative py-12 sm:py-16 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-10 sm:mb-20">
            <h2 className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] sm:text-sm mb-2 sm:mb-4">The Protocol</h2>
            <h3 className="text-3xl sm:text-6xl font-black text-white tracking-tighter">HOW IT WORKS.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-20">
            {/* For Buyers */}
            <div className="space-y-8 sm:space-y-12">
              <div className="inline-flex items-center gap-4 px-5 py-2 bg-indigo-500 text-white rounded-full font-black text-[10px] sm:text-sm uppercase italic">
                <ShoppingBag className="h-4 w-4" /> For Buyers
              </div>
              <div className="space-y-6 sm:space-y-8">
                {[
                  { step: "01", title: "Discover", desc: "Browse thousands of hand-reviewed premium digital assets." },
                  { step: "02", title: "Secure Checkout", desc: "Pay with Stripe, Razorpay, or Crypto via our secure gateways." },
                  { step: "03", title: "Instant Access", desc: "Download your files immediately through encrypted streaming links." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-4 sm:gap-6">
                    <span className="text-2xl sm:text-3xl font-black text-indigo-500/30 italic">{s.step}</span>
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{s.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Sellers */}
            <div className="space-y-8 sm:space-y-12">
              <div className="inline-flex items-center gap-4 px-5 py-2 bg-purple-500 text-white rounded-full font-black text-[10px] sm:text-sm uppercase italic">
                <Upload className="h-4 w-4" /> For Sellers
              </div>
              <div className="space-y-6 sm:space-y-8">
                {[
                  { step: "01", title: "Upload", desc: "Upload your code or design packages to your broker dashboard." },
                  { step: "02", title: "Admin Review", desc: "Our team verifies quality and security before going live." },
                  { step: "03", title: "Scale", desc: "Earn 80% on every sale and withdraw your funds instantly." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-4 sm:gap-6">
                    <span className="text-2xl sm:text-3xl font-black text-purple-500/30 italic">{s.step}</span>
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{s.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative py-12 sm:py-24 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "Local Secure Vault",
                desc: "Your files are stored in our encrypted local delivery system, accessible only via timed streaming tokens.",
                icon: <Shield className="h-6 w-6 sm:h-7 sm:w-7" />,
                gradient: "from-blue-600 to-indigo-600"
              },
              {
                title: "Hyper-Fast Payouts",
                desc: "Withdraw your earnings instantly to Bank, PayPal, or Crypto. No waiting periods, no hidden fees.",
                icon: <DollarSign className="h-6 w-6 sm:h-7 sm:w-7" />,
                gradient: "from-purple-600 to-pink-600"
              },
              {
                title: "Curated Selection",
                desc: "Every product is hand-reviewed by our admin elite to ensure only the highest quality reaches our users.",
                icon: <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7" />,
                gradient: "from-amber-500 to-orange-600"
              }
            ].map((f, i) => (
              <div key={i} className="glass group p-6 sm:p-10 rounded-[28px] sm:rounded-[32px] border border-white/5 hover:border-indigo-500/30 transition-all duration-500">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shadow-lg`}>
                  <div className="text-white">{f.icon}</div>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-4">{f.title}</h3>
                <p className="text-xs sm:text-base text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Preview Section */}
      <div className="relative py-12 sm:py-24 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] sm:text-sm mb-4">Market Value</h2>
            <h3 className="text-3xl sm:text-6xl font-black text-white tracking-tighter uppercase italic">PRICING TIERS.</h3>
            <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Premium digital assets starting from $300. Every product is hand-reviewed for maximum quality and security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { tier: "Standard", price: "$300+", desc: "Quality-vetted essential assets." },
              { tier: "Pro", price: "$500+", desc: "Professional grade digital solutions." },
              { tier: "Elite", price: "$800+", desc: "Full-scale enterprise applications." }
            ].map((p, i) => (
              <div key={i} className="glass p-8 rounded-[32px] border border-white/5 text-center group hover:border-indigo-500/50 transition-all duration-500">
                <div className="text-indigo-500 font-black text-xs uppercase tracking-[0.2em] mb-4">{p.tier}</div>
                <div className="text-4xl font-black text-white mb-4 tracking-tight">{p.price}</div>
                <p className="text-xs text-slate-400 mb-8">{p.desc}</p>
                <Link href="/pricing" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2">
                  View Details <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Immersive CTA */}
      <div className="relative py-16 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-3xl"></div>
        <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
          <h2 className="text-4xl sm:text-7xl font-black text-white mb-4 sm:mb-8 tracking-tighter uppercase italic">Ready to Scale?</h2>
          <p className="text-base sm:text-xl text-slate-400 mb-8 sm:mb-12">Start your digital venture today and reach a global audience of high-intent buyers.</p>
          <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-950 font-black rounded-2xl hover:scale-105 transition-transform shadow-2xl shadow-white/10 text-sm">
            JOIN THE MARKETPLACE <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
