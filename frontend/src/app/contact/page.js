"use client";

import { Mail, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-slate-950 min-h-screen pt-24 pb-32 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-indigo-900/10 to-transparent"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <h2 className="text-sm font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">Support Hub</h2>
            <h1 className="text-5xl font-black text-white sm:text-7xl tracking-tighter">LET'S TALK.</h1>
            <p className="mt-8 text-xl text-slate-400 max-w-md leading-relaxed">
              Whether you're a buyer needing assistance or a creator looking to scale, our elite support team is ready to assist.
            </p>

            <div className="mt-12 space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-indigo-500/50 transition-all">
                  <Mail className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Support</div>
                  <div className="text-lg font-black text-white">support@digitalmarket.com</div>
                </div>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-purple-500/50 transition-all">
                  <MessageSquare className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Partnerships</div>
                  <div className="text-lg font-black text-white">partners@digitalmarket.com</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-10 lg:p-12 rounded-[40px] border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="h-20 w-20 text-white" />
            </div>
            <h3 className="text-2xl font-black text-white mb-10">Send an Encrypted Message</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <input type="text" placeholder="First Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                <input type="text" placeholder="Last Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <input type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              <textarea rows={5} placeholder="Your Message..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"></textarea>
              <button className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all">
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
