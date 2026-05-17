import LottieSpotlight from '@/components/LottieSpotlight';

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen pt-24 pb-32 relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient blob */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'var(--accent-subtle)' }}
      />

      <div className="mx-auto max-w-4xl px-6 relative z-10">
        <div className="glass p-12 lg:p-20 rounded-[48px]" style={{ border: '1px solid var(--border-subtle)' }}>
          <h1
            className="text-4xl lg:text-6xl font-black tracking-tighter mb-8 text-3d"
            style={{ color: 'var(--fg-primary)' }}
          >
            PRIVACY PROTOCOL.
          </h1>
          <p
            className="text-xl mb-12 border-l-4 pl-6 leading-relaxed italic"
            style={{
              color: 'var(--fg-secondary)',
              borderColor: 'var(--accent)',
            }}
          >
            Your data is your property. We only interact with it to ensure your transactions are processed with the highest level of security.
          </p>
          <LottieSpotlight
            src="/animations/secure-access.json"
            tone="secure"
            size="sm"
            badge="Privacy"
            title="Data stays guarded"
            subtitle="Account and transaction data are handled only for authentication, access, and order fulfillment."
            className="mb-12"
          />

          <div className="space-y-12 leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
            <section>
              <h2 className="text-2xl font-black mb-4" style={{ color: 'var(--fg-primary)' }}>
                01. Data Collection
              </h2>
              <p>
                We collect essential telemetry: Name, encrypted email, and transaction IDs. We do not store full credit card details on our local servers; all payment data is handled by our PCI-compliant partners (Stripe/Razorpay).
              </p>
            </section>

            <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '3rem' }}>
              <h2 className="text-2xl font-black mb-4" style={{ color: 'var(--fg-primary)' }}>
                02. Security Measures
              </h2>
              <p>
                Every digital asset is delivered via an encrypted local streaming tunnel. Access logs are purged every 30 days to ensure maximum anonymity for our buyers and sellers.
              </p>
            </section>

            <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '3rem' }}>
              <h2 className="text-2xl font-black mb-4" style={{ color: 'var(--fg-primary)' }}>
                03. Third Party Policy
              </h2>
              <p>
                We never sell your data. We only share transaction-necessary metadata with your chosen payment gateway to finalize order settlement.
              </p>
            </section>

            <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '3rem' }}>
              <h2 className="text-2xl font-black mb-4" style={{ color: 'var(--fg-primary)' }}>
                04. Your Rights
              </h2>
              <p>
                You have the right to request deletion of your personal data at any time. Contact{' '}
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>privacy@digitalmarket.com</span>{' '}
                with your account details and we will process your request within 7 business days.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
