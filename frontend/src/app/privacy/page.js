export default function PrivacyPage() {
  return (
    <div className="bg-slate-950 min-h-screen pt-24 pb-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="glass p-12 lg:p-20 rounded-[48px] border border-white/5">
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-8">PRIVACY PROTOCOL.</h1>
          <p className="text-xl text-slate-400 mb-12 border-l-4 border-indigo-500 pl-6 leading-relaxed italic">
            Your data is your property. We only interact with it to ensure your transactions are processed with the highest level of security.
          </p>
          <div className="space-y-12 text-slate-400 leading-relaxed">
            <section>
              <h2 className="text-2xl font-black text-white mb-4">01. Data Collection</h2>
              <p>We collect essential telemetry: Name, encrypted email, and transaction IDs. We do not store full credit card details on our local servers; all payment data is handled by our PCI-compliant partners (Stripe/Razorpay).</p>
            </section>
            <section>
              <h2 className="text-2xl font-black text-white mb-4">02. Security Measures</h2>
              <p>Every digital asset is delivered via an encrypted local streaming tunnel. Access logs are purged every 30 days to ensure maximum anonymity for our buyers and sellers.</p>
            </section>
            <section>
              <h2 className="text-2xl font-black text-white mb-4">03. Third Party Policy</h2>
              <p>We never sell your data. We only share transaction-necessary metadata with your chosen payment gateway to finalize order settlement.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
