"use client";

import { Suspense, useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Package, User, ShieldCheck, Mail, Lock, Sparkles } from 'lucide-react';

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'user';
  const redirect = searchParams.get('redirect');
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: initialRole });
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(formData.name, formData.email, formData.password, formData.role);
      toast.success('Registration successful');
      
      if (redirect) {
        router.push(redirect);
      } else {
        router.push(`/dashboard/${user.role}`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to register');
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse animation-delay-2000"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="p-3 bg-indigo-600 rounded-2xl group-hover:rotate-12 transition-transform">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter italic">DigitalMarket</span>
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">Create your account</h1>
          <p className="text-slate-500 mt-2">Join the future of digital asset commerce</p>
        </div>

        <div className="glass p-8 lg:p-10 rounded-[40px] border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">I want to</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'user' })}
                  className={`py-4 rounded-2xl font-bold text-sm transition-all border ${
                    formData.role === 'user' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' 
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  Buy Assets
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'broker' })}
                  className={`py-4 rounded-2xl font-bold text-sm transition-all border ${
                    formData.role === 'broker' 
                    ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20' 
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  Sell Assets
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-950"></div>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Get Started
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link 
              href={redirect ? `/login?redirect=${redirect}` : "/login"} 
              className="font-bold text-indigo-400 hover:text-indigo-300"
            >
              Sign in here
            </Link>
          </p>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale">
          <ShieldCheck className="h-8 w-8 text-white" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Bank Grade Encryption</span>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={
      <div className="bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
