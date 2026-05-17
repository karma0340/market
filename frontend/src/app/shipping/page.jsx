import { Zap, ShieldCheck, Clock, Globe } from 'lucide-react';
import LottieSpotlight from '@/components/LottieSpotlight';

export default function ShippingPage() {
  return (
    <div
      className="min-h-screen pt-24 pb-32 relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient blob */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'var(--secondary-subtle)' }}
      />

      <div className="mx-auto max-w-4xl px-6 relative z-10">
        <div className="glass p-12 lg:p-20 rounded-[48px]" style={{ border: '1px solid var(--border-subtle)' }}>
          <h1
            className="text-4xl lg:text-6xl font-black tracking-tighter mb-8 italic uppercase text-3d"
            style={{ color: 'var(--fg-primary)' }}
          >
            Digital Delivery.
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest mb-12" style={{ color: 'var(--fg-muted)' }}>
            Protocol: Instant Fulfillment • Last Updated: April 29, 2026
          </p>

          <LottieSpotlight
            src="/animations/creator-flow.json"
            tone="creator"
            size="sm"
            badge="Delivery"
            title="Instant digital fulfillment"
            subtitle="No physical shipping: paid assets are provisioned to the buyer dashboard."
            className="mb-12"
          />

          <div className="space-y-12 leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>

            <section
              className="p-8 rounded-3xl"
              style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
            >
              <h2
                className="text-2xl font-black mb-4 flex items-center gap-3"
                style={{ color: 'var(--fg-primary)' }}
              >
                <Zap className="h-6 w-6" style={{ color: 'var(--secondary)' }} /> Instant Access
              </h2>
              <p>
                All products available on DigitalMarket are digital assets. We do not ship physical goods.
                Upon successful completion of your payment via Razorpay or Stripe, your assets are immediately provisioned to your account.
              </p>
            </section>

            <section className="p-8">
              <h2
                className="text-2xl font-black mb-4 flex items-center gap-3"
                style={{ color: 'var(--fg-primary)' }}
              >
                <Globe className="h-6 w-6" style={{ color: 'var(--accent)' }} /> Delivery Method
              </h2>
              <ul className="list-disc pl-6 space-y-4">
                <li><strong style={{ color: 'var(--fg-primary)' }}>Dashboard Access:</strong> Navigate to your &quot;User Library&quot; to view and download your assets.</li>
                <li><strong style={{ color: 'var(--fg-primary)' }}>Email Confirmation:</strong> A secure download link and purchase receipt will be sent to your registered email address within minutes.</li>
                <li><strong style={{ color: 'var(--fg-primary)' }}>Encrypted Streaming:</strong> For large assets, we use timed streaming tokens to ensure secure and fast transfer.</li>
              </ul>
            </section>

            <section className="p-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <h2
                className="text-2xl font-black mb-4 flex items-center gap-3"
                style={{ color: 'var(--fg-primary)' }}
              >
                <Clock className="h-6 w-6" style={{ color: 'var(--success)' }} /> Timeline
              </h2>
              <p>
                Delivery is typically instantaneous. In rare cases of high network congestion or manual review requirements,
                delivery may take up to 2-4 hours. If you haven&apos;t received your access within 24 hours, please contact our Support Hub.
              </p>
            </section>

            <section className="p-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <h2
                className="text-2xl font-black mb-4 flex items-center gap-3"
                style={{ color: 'var(--fg-primary)' }}
              >
                <ShieldCheck className="h-6 w-6" style={{ color: 'var(--accent)' }} /> Dispute Resolution
              </h2>
              <p>
                If you experience any delivery issues, our support team is available 24/7. Contact us at{' '}
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>support@digitalmarket.com</span> with your order ID and we will resolve the issue within one business day.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
