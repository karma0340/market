import Link from 'next/link';
import { Check, ArrowRight, Shield, Zap, Star, DollarSign, Package } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="relative bg-slate-950 overflow-hidden min-h-screen pt-24 pb-20">
      {/* Immersive Background */}
      <div className="absolute inset-0 mesh-gradient opacity-40"></div>
      
      {/* Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000"></div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="text-indigo-400 font-black uppercase tracking-[0.3em] text-sm mb-4">Pricing Strategy</h2>
          <p className="text-4xl font-black tracking-tight text-white sm:text-6xl mb-6">
            PREMIUM ASSETS. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              FAIR MARKET VALUE.
            </span>
          </p>
          <p className="text-lg leading-8 text-slate-400">
            Our marketplace hosts high-end digital assets curated for professional creators and enterprises. 
            Quality is our priority, ensuring every purchase delivers exceptional value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Asset Categories */}
          {[
            {
              title: "Standard Assets",
              range: "$300 - $500",
              desc: "Perfect for independent creators and small projects.",
              features: ["Verified Quality", "Standard License", "Community Support", "Instant Delivery"],
              icon: <Package className="h-6 w-6 text-blue-400" />,
              border: "border-white/5"
            },
            {
              title: "Premium Assets",
              range: "$500 - $800",
              desc: "High-performance code and exclusive designs for professionals.",
              features: ["Priority Review", "Commercial License", "Email Support", "Lifetime Updates"],
              icon: <Star className="h-6 w-6 text-indigo-400" />,
              border: "border-indigo-500/50 shadow-2xl shadow-indigo-500/20",
              popular: true
            },
            {
              title: "Enterprise Solutions",
              range: "$800 - $1000",
              desc: "Full-scale applications and advanced architecture for businesses.",
              features: ["VIP Review", "Extended License", "Direct Support", "Source Code Access"],
              icon: <Zap className="h-6 w-6 text-purple-400" />,
              border: "border-white/5"
            }
          ].map((tier, i) => (
            <div key={i} className={`glass relative p-8 rounded-[32px] border ${tier.border} flex flex-col`}>
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  {tier.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{tier.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">{tier.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{tier.range}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-indigo-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/products"
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  tier.popular 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                Browse Tier <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Security Trust Section */}
        <div className="glass p-10 rounded-[40px] border border-white/5 text-center max-w-3xl mx-auto">
          <div className="flex justify-center gap-4 mb-6">
            <Shield className="h-8 w-8 text-indigo-500" />
            <DollarSign className="h-8 w-8 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-4 uppercase italic">Secure Transactions</h3>
          <p className="text-slate-400 leading-relaxed">
            All prices are in USD. We use Razorpay and Stripe to ensure your payments are 100% secure. 
            Our digital delivery system guarantees instant access to your assets upon successful payment.
          </p>
        </div>
      </div>
    </div>
  );
}
