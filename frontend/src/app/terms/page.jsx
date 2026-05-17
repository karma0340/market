import LottieSpotlight from '@/components/LottieSpotlight';

export default function TermsPage() {
  return (
    <div
      className="min-h-screen pt-24 pb-32 relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient blob */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'var(--secondary-subtle)' }}
      />

      <div className="mx-auto max-w-4xl px-6 relative z-10">
        <div className="glass p-12 lg:p-20 rounded-[48px]" style={{ border: '1px solid var(--border-subtle)' }}>
          <h1
            className="text-4xl lg:text-6xl font-black tracking-tighter mb-8 text-3d"
            style={{ color: 'var(--fg-primary)' }}
          >
            TERMS OF ENGAGEMENT.
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest mb-12" style={{ color: 'var(--fg-muted)' }}>
            Protocol Version 2.0 • Last Sync: April 23, 2026
          </p>

          <LottieSpotlight
            src="/animations/secure-access.json"
            tone="secure"
            size="sm"
            badge="Terms"
            title="Clear usage rules"
            subtitle="Licensing, fees, refund logic, and disputes are framed before buyers commit."
            className="mb-12"
          />

          <div className="space-y-12 leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>

            <section
              className="p-8 rounded-3xl"
              style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
            >
              <h2 className="text-2xl font-black mb-4" style={{ color: 'var(--fg-primary)' }}>
                01. Asset Usage
              </h2>
              <p>
                Purchased assets are granted under a non-exclusive, perpetual license for the buyer&apos;s own projects. Redistribution or unauthorized resale of acquired digital assets is strictly prohibited and monitored via watermarked metadata.
              </p>
            </section>

            <section className="p-8">
              <h2 className="text-2xl font-black mb-4" style={{ color: 'var(--fg-primary)' }}>
                02. Platform Fees
              </h2>
              <p>
                DigitalMarket operates on a 20% commission model for all successful transactions. This fee powers our global payment infrastructure and secure delivery tunnels.
              </p>
            </section>

            <section className="p-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <h2 className="text-2xl font-black mb-4" style={{ color: 'var(--fg-primary)' }}>
                03. Refund Logic
              </h2>
              <p>
                Due to the digital nature of assets, refunds are only issued if the asset is proven defective within 24 hours of purchase and before the first successful download completion.
              </p>
            </section>

            <section className="p-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <h2 className="text-2xl font-black mb-4" style={{ color: 'var(--fg-primary)' }}>
                04. Dispute Resolution
              </h2>
              <p>
                Any disputes arising from transactions on this platform shall be resolved through binding arbitration. Contact our support team at{' '}
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>legal@digitalmarket.com</span>{' '}
                to initiate the process.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
