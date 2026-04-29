import { Shield, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

export default function RefundsPage() {
  return (
    <div className="bg-slate-950 min-h-screen pt-24 pb-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px]"></div>
      
      <div className="mx-auto max-w-4xl px-6 relative z-10">
        <div className="glass p-12 lg:p-20 rounded-[48px] border border-white/5">
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-8 italic uppercase">Refund Protocol.</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-12">Policy Version 3.1 • Last Updated: April 29, 2026</p>
          
          <div className="space-y-12 text-slate-400 leading-relaxed">
            <section className="bg-white/5 p-8 rounded-3xl border border-white/5">
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                <Shield className="h-6 w-6 text-indigo-500" /> General Policy
              </h2>
              <p>
                Due to the intangible nature of digital assets (code, designs, templates), all sales are generally final. 
                Once an asset has been downloaded or accessed, we cannot revoke access, and therefore cannot provide a refund.
              </p>
            </section>

            <section className="p-8">
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-amber-500" /> Exceptions
              </h2>
              <p className="mb-4">Refunds may be granted under the following specific conditions:</p>
              <ul className="list-disc pl-6 space-y-4">
                <li><strong>Defective Assets:</strong> If the product is proven to be technically defective or non-functional.</li>
                <li><strong>Misrepresentation:</strong> If the product significantly differs from its description on the marketplace.</li>
                <li><strong>Non-Delivery:</strong> If you did not receive access to the product within 24 hours of payment.</li>
              </ul>
            </section>

            <section className="p-8 border-t border-white/5">
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                <RefreshCw className="h-6 w-6 text-green-500" /> Refund Process
              </h2>
              <p>
                To request a refund, please contact support@digitalmarket.com within 24 hours of purchase. 
                Include your order ID and a detailed description of the issue. 
                Approved refunds will be processed back to the original payment method within 5-7 business days.
              </p>
            </section>

            <section className="p-8 border-t border-white/5">
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-500" /> Cancellation
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
