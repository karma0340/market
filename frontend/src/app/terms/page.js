export default function TermsPage() {
  return (
    <div className="bg-slate-950 min-h-screen pt-24 pb-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="glass p-12 lg:p-20 rounded-[48px] border border-white/5">
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-8">TERMS OF ENGAGEMENT.</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-12">Protocol Version 2.0 • Last Sync: April 23, 2026</p>
          
          <div className="space-y-12 text-slate-400 leading-relaxed">
            <section className="bg-white/5 p-8 rounded-3xl border border-white/5">
              <h2 className="text-2xl font-black text-white mb-4">01. Asset Usage</h2>
              <p>Purchased assets are granted under a non-exclusive, perpetual license for the buyer's own projects. Redistribution or unauthorized resale of acquired digital assets is strictly prohibited and monitored via watermarked metadata.</p>
            </section>
            <section className="p-8">
              <h2 className="text-2xl font-black text-white mb-4">02. Platform Fees</h2>
              <p>DigitalMarket operates on a 20% commission model for all successful transactions. This fee powers our global payment infrastructure and secure delivery tunnels.</p>
            </section>
            <section className="p-8 border-t border-white/5">
              <h2 className="text-2xl font-black text-white mb-4">03. Refund Logic</h2>
              <p>Due to the digital nature of assets, refunds are only issued if the asset is proven defective within 24 hours of purchase and before the first successful download completion.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
