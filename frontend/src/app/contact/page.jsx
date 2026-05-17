"use client";

import { Mail, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import LottieSpotlight from '@/components/LottieSpotlight';

export default function ContactPage() {
  return (
    <div
      className="min-h-screen pt-24 pb-32 relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient gradient */}
      <div
        className="absolute bottom-0 left-0 w-full h-1/2 pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--accent-subtle), transparent)' }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

          {/* Left: Info */}
          <div>
            <h2 className="section-label mb-4">Support Hub</h2>
            <h1
              className="text-5xl font-black sm:text-7xl tracking-tighter text-3d"
              style={{ color: 'var(--fg-primary)' }}
            >
              LET&apos;S TALK.
            </h1>
            <p
              className="mt-8 text-xl max-w-md leading-relaxed"
              style={{ color: 'var(--fg-secondary)' }}
            >
              Whether you&apos;re a buyer needing assistance or a creator looking to scale, our elite support team is ready to assist.
            </p>

            <LottieSpotlight
              src="/animations/secure-access.json"
              tone="secure"
              size="sm"
              badge="Support"
              title="Fast signal routing"
              subtitle="Buyer, broker, and security messages move through the right path from the first contact."
              className="mt-10 max-w-sm"
            />

            <div className="mt-12 space-y-8">
              <div className="flex items-center gap-6 group">
                <div
                  className="w-16 h-16 glass rounded-2xl flex items-center justify-center transition-all"
                  style={{ border: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <Mail className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
                    Email Support
                  </div>
                  <div className="text-lg font-black" style={{ color: 'var(--fg-primary)' }}>
                    support@digitalmarket.com
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div
                  className="w-16 h-16 glass rounded-2xl flex items-center justify-center transition-all"
                  style={{ border: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <MessageSquare className="h-6 w-6" style={{ color: 'var(--secondary)' }} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
                    Global Partnerships
                  </div>
                  <div className="text-lg font-black" style={{ color: 'var(--fg-primary)' }}>
                    partners@digitalmarket.com
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div
                  className="w-16 h-16 glass rounded-2xl flex items-center justify-center transition-all"
                  style={{ border: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <ShieldCheck className="h-6 w-6" style={{ color: 'var(--success)' }} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
                    Security Reports
                  </div>
                  <div className="text-lg font-black" style={{ color: 'var(--fg-primary)' }}>
                    security@digitalmarket.com
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div
            className="glass p-10 lg:p-12 rounded-[40px] relative overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <div className="absolute top-0 right-0 p-4 pointer-events-none" style={{ opacity: 0.08 }}>
              <Sparkles className="h-20 w-20" style={{ color: 'var(--fg-primary)' }} />
            </div>
            <h3 className="text-2xl font-black mb-10" style={{ color: 'var(--fg-primary)' }}>
              Send an Encrypted Message
            </h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full rounded-2xl px-6 py-4 outline-none transition-all"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--fg-primary)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full rounded-2xl px-6 py-4 outline-none transition-all"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--fg-primary)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-2xl px-6 py-4 outline-none transition-all"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--fg-primary)',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              />
              <textarea
                rows={5}
                placeholder="Your Message..."
                className="w-full rounded-2xl px-6 py-4 outline-none transition-all resize-none"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--fg-primary)',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              />
              <button
                className="w-full py-5 font-black rounded-2xl shadow-xl transition-all hover:-translate-y-0.5"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  boxShadow: '0 0 30px var(--accent-glow)',
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              >
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
