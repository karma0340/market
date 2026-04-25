import Link from 'next/link';
import { Package, ShieldCheck, Mail, Globe } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
      
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-20 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-20">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">
                Digital<span className="text-indigo-500">Market</span>
              </span>
            </Link>
            <p className="text-base leading-7 text-slate-400 max-w-sm">
              Empowering the next generation of digital creators with a secure, high-performance marketplace for premium assets.
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-slate-500 hover:text-indigo-400 transition-colors"><Globe className="h-5 w-5" /></Link>
              <Link href="#" className="text-slate-500 hover:text-indigo-400 transition-colors"><Mail className="h-5 w-5" /></Link>
            </div>
          </div>
          
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-12">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Marketplace</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link href="/products" className="text-sm text-slate-400 hover:text-white transition-colors">Browse Assets</Link></li>
                  <li><Link href="/register" className="text-sm text-slate-400 hover:text-white transition-colors">Start Selling</Link></li>
                  <li><Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Creator Login</Link></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">Our Vision</Link></li>
                  <li><Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">Support Center</Link></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-12">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">User Terms</Link></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <div className="glass p-6 rounded-2xl border border-white/5">
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                    <ShieldCheck className="h-4 w-4" /> Secure Hub
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Protected by AES-256 encryption and multi-gateway secure settling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">&copy; {currentYear} DigitalMarket Global. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-bold text-slate-600 tracking-widest uppercase">Secured by Stripe & Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
