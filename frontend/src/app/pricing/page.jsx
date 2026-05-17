"use client";

import Link from 'next/link';
import { Check, ArrowRight, Shield, Zap, Star, DollarSign, Package } from 'lucide-react';
import LottieSpotlight from '@/components/LottieSpotlight';

export default function PricingPage() {
  return (
    <div
      className="relative overflow-hidden min-h-screen pt-24 pb-20"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Mesh background */}
      <div className="absolute inset-0 mesh-gradient opacity-40" />

      {/* Animated Blobs */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full filter blur-[120px] animate-blob pointer-events-none"
        style={{ background: 'var(--accent-subtle)' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full filter blur-[120px] animate-blob animation-delay-2000 pointer-events-none"
        style={{ background: 'var(--secondary-subtle)' }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 grid max-w-6xl gap-10 lg:grid-cols-[1fr_320px] lg:items-end">
          <div className="max-w-4xl lg:text-left">
            <h2 className="section-label mb-4">Pricing Policy</h2>
            <p
              className="text-4xl font-black tracking-tight sm:text-6xl mb-6 text-3d"
              style={{ color: 'var(--fg-primary)' }}
            >
              PREMIUM ASSETS. <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(to right, var(--accent), var(--secondary), #ec4899)' }}
              >
                TRANSPARENT VALUE.
              </span>
            </p>
            <p className="text-lg leading-8" style={{ color: 'var(--fg-secondary)' }}>
              Our marketplace hosts high-end digital assets curated for professional creators and enterprises.
              All prices are fixed and represent the quality-vetted value of each asset.
            </p>
          </div>
          <LottieSpotlight
            src="/animations/secure-access.json"
            tone="secure"
            size="md"
            badge="Value"
            title="Clear purchase rails"
            subtitle="Pricing, payments, delivery, and policy signals stay visible before checkout."
          />
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            {
              title: 'Standard Assets',
              range: '₹25,000 - ₹42,000 / $300 - $500',
              desc: 'Perfect for independent creators and small projects.',
              features: ['Verified Quality', 'Standard License', 'Community Support', 'Instant Delivery'],
              icon: <Package className="h-6 w-6" style={{ color: 'var(--accent)' }} />,
              popular: false,
            },
            {
              title: 'Premium Assets',
              range: '₹42,000 - ₹67,000 / $500 - $800',
              desc: 'High-performance code and exclusive designs for professionals.',
              features: ['Priority Review', 'Commercial License', 'Email Support', 'Lifetime Updates'],
              icon: <Star className="h-6 w-6" style={{ color: 'var(--accent)' }} />,
              popular: true,
            },
            {
              title: 'Enterprise Solutions',
              range: '₹67,000 - ₹84,000 / $800 - $1000',
              desc: 'Full-scale applications and advanced architecture for businesses.',
              features: ['VIP Review', 'Extended License', 'Direct Support', 'Source Code Access'],
              icon: <Zap className="h-6 w-6" style={{ color: 'var(--secondary)' }} />,
              popular: false,
            },
          ].map((tier, i) => (
            <div
              key={i}
              className="glass relative card-3d p-8 rounded-[32px] flex flex-col"
              style={{
                border: `1px solid ${tier.popular ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                boxShadow: tier.popular ? 'var(--shadow-accent)' : undefined,
              }}
            >
              {tier.popular && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full"
                  style={{ background: 'var(--accent)' }}
                >
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'var(--accent-subtle)' }}
                >
                  {tier.icon}
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--fg-primary)' }}>
                  {tier.title}
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--fg-secondary)' }}>
                  {tier.desc}
                </p>
                <div className="text-lg font-black tracking-tight" style={{ color: 'var(--fg-primary)' }}>
                  {tier.range}
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm" style={{ color: 'var(--fg-secondary)' }}>
                    <Check className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/products"
                className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all"
                style={
                  tier.popular
                    ? { background: 'var(--accent)', color: '#fff', boxShadow: 'var(--shadow-accent)' }
                    : { background: 'var(--bg-hover)', color: 'var(--fg-primary)', border: '1px solid var(--border-subtle)' }
                }
                onMouseEnter={e => tier.popular
                  ? e.currentTarget.style.filter = 'brightness(1.1)'
                  : e.currentTarget.style.background = 'var(--border-subtle)'
                }
                onMouseLeave={e => tier.popular
                  ? e.currentTarget.style.filter = 'brightness(1)'
                  : e.currentTarget.style.background = 'var(--bg-hover)'
                }
              >
                Browse Tier <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="glass p-10 rounded-[40px]" style={{ border: '1px solid var(--border-subtle)' }}>
            <h3
              className="text-xl font-black mb-4 uppercase tracking-tighter flex items-center gap-3"
              style={{ color: 'var(--fg-primary)' }}
            >
              <Shield className="h-6 w-6" style={{ color: 'var(--accent)' }} /> Refund &amp; Cancellation
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
              Due to the nature of digital assets, we generally do not offer refunds once the asset has been accessed or downloaded.
              However, if an asset is proven to be defective or incorrectly described, you may request a refund within 24 hours of purchase.
              Cancellations are not possible once the transaction is completed.
            </p>
          </div>
          <div className="glass p-10 rounded-[40px]" style={{ border: '1px solid var(--border-subtle)' }}>
            <h3
              className="text-xl font-black mb-4 uppercase tracking-tighter flex items-center gap-3"
              style={{ color: 'var(--fg-primary)' }}
            >
              <Zap className="h-6 w-6" style={{ color: 'var(--secondary)' }} /> Shipping &amp; Delivery
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
              All products on DigitalMarket are digital assets. No physical shipping is required.
              Upon successful payment, assets are delivered instantly via your user dashboard.
              You will also receive an email with secure access instructions immediately after purchase.
            </p>
          </div>
        </div>

        {/* Trust Bar */}
        <div
          className="glass p-10 rounded-[40px] text-center max-w-3xl mx-auto"
          style={{ border: '1px solid var(--border-accent)' }}
        >
          <div className="flex justify-center gap-4 mb-6">
            <Shield className="h-8 w-8" style={{ color: 'var(--accent)' }} />
            <DollarSign className="h-8 w-8" style={{ color: 'var(--accent)' }} />
          </div>
          <h3 className="text-2xl font-black mb-4 uppercase italic text-3d-white" style={{ color: 'var(--fg-primary)' }}>
            Secure Transactions
          </h3>
          <p className="leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
            Prices are displayed in your local currency (INR/USD). We use Razorpay and Stripe to ensure your payments are 100% secure.
            Our digital delivery system guarantees instant access to your assets upon successful payment.
          </p>
        </div>
      </div>
    </div>
  );
}
