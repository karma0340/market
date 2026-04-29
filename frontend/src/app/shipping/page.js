import { Zap, ShieldCheck, Clock, Globe } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="bg-slate-950 min-h-screen pt-24 pb-32 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]"></div>
      
      <div className="mx-auto max-w-4xl px-6 relative z-10">
        <div className="glass p-12 lg:p-20 rounded-[48px] border border-white/5">
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-8 italic uppercase">Digital Delivery.</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-12">Protocol: Instant Fulfillment • Last Updated: April 29, 2026</p>
          
          <div className="space-y-12 text-slate-400 leading-relaxed">
            <section className="bg-white/5 p-8 rounded-3xl border border-white/5">
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                <Zap className="h-6 w-6 text-purple-500" /> Instant Access
              </h2>
              <p>
                All products available on DigitalMarket are digital assets. We do not ship physical goods. 
                Upon successful completion of your payment via Razorpay or Stripe, your assets are immediately provisioned to your account.
              </p>
            </section>

            <section className="p-8">
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                <Globe className="h-6 w-6 text-indigo-500" /> Delivery Method
              </h2>
              <ul className="list-disc pl-6 space-y-4">
                <li><strong>Dashboard Access:</strong> Navigate to your "User Library" to view and download your assets.</li>
                <li><strong>Email Confirmation:</strong> A secure download link and purchase receipt will be sent to your registered email address within minutes.</li>
                <li><strong>Encrypted Streaming:</strong> For large assets, we use timed streaming tokens to ensure secure and fast transfer.</li>
              </ul>
            </section>

            <section className="p-8 border-t border-white/5">
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                <Clock className="h-6 w-6 text-green-500" /> Timeline
              </h2>
              <p>
                Delivery is typically instantaneous. In rare cases of high network congestion or manual review requirements, 
                delivery may take up to 2-4 hours. If you haven't received your access within 24 hours, please contact our Support Hub.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
