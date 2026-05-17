import { Shield, AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import LottieSpotlight from '@/components/LottieSpotlight';

export default function RefundsPage() {
  return (
    <div
      className="min-h-screen pt-24 pb-32 relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient blob */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'var(--danger-subtle)' }}
      />

      <div className="mx-auto max-w-4xl px-6 relative z-10">
        <div className="glass p-12 lg:p-20 rounded-[48px]" style={{ border: '1px solid var(--border-subtle)' }}>
          <h1
            className="text-4xl lg:text-6xl font-black tracking-tighter mb-8 italic uppercase text-3d"
            style={{ color: 'var(--fg-primary)' }}
          >
            Refund Protocol.
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest mb-12" style={{ color: 'var(--fg-muted)' }}>
            Policy Version 3.1 • Last Updated: April 29, 2026
          </p>

          <LottieSpotlight
            src="/animations/secure-access.json"
            tone="secure"
            size="sm"
            badge="Refunds"
            title="Review before release"
            subtitle="Digital purchases stay clear on exceptions, delivery, and cancellation limits."
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
                <Shield className="h-6 w-6" style={{ color: 'var(--accent)' }} /> General Policy
              </h2>
              <p>
                Due to the intangible nature of digital assets (code, designs, templates), all sales are generally final.
                Once an asset has been downloaded or accessed, we cannot revoke access, and therefore cannot provide a refund.
              </p>
            </section>

            <section className="p-8">
              <h2
                className="text-2xl font-black mb-4 flex items-center gap-3"
                style={{ color: 'var(--fg-primary)' }}
              >
                <AlertCircle className="h-6 w-6" style={{ color: '#f59e0b' }} /> Exceptions
              </h2>
              <p className="mb-4">Refunds may be granted under the following specific conditions:</p>
              <ul className="list-disc pl-6 space-y-4">
                <li><strong style={{ color: 'var(--fg-primary)' }}>Defective Assets:</strong> If the product is proven to be technically defective or non-functional.</li>
                <li><strong style={{ color: 'var(--fg-primary)' }}>Misrepresentation:</strong> If the product significantly differs from its description on the marketplace.</li>
                <li><strong style={{ color: 'var(--fg-primary)' }}>Non-Delivery:</strong> If you did not receive access to the product within 24 hours of payment.</li>
              </ul>
            </section>

            <section className="p-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <h2
                className="text-2xl font-black mb-4 flex items-center gap-3"
                style={{ color: 'var(--fg-primary)' }}
              >
                <RefreshCw className="h-6 w-6" style={{ color: 'var(--success)' }} /> Refund Process
              </h2>
              <p>
                To request a refund, please contact{' '}
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>support@digitalmarket.com</span>{' '}
                within 24 hours of purchase.
                Include your order ID and a detailed description of the issue.
                Approved refunds will be processed back to the original payment method within 5-7 business days.
              </p>
            </section>

            <section className="p-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <h2
                className="text-2xl font-black mb-4 flex items-center gap-3"
                style={{ color: 'var(--fg-primary)' }}
              >
                <XCircle className="h-6 w-6" style={{ color: 'var(--danger)' }} /> Cancellation
              </h2>
              <p>
                Orders cannot be cancelled once the payment is successful and the digital delivery has been initiated.
                Please review your cart carefully before completing the transaction.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
