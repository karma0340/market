"use client";

import { Suspense, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Package, Mail, Lock, Sparkles } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(formData.email, formData.password);
      toast.success('Welcome back!');
      
      if (redirect) {
        router.push(redirect);
      } else {
        router.push(`/dashboard/${user.role}`);
      }
    } catch (error) {
      toast.error('Credentials do not match. Redirecting to create an account...');
      setTimeout(() => {
        router.push('/register');
      }, 2000);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center px-6 py-24 relative overflow-hidden mesh-gradient">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
            <motion.div 
              whileHover={{ rotate: 12, scale: 1.1 }}
              className="p-3.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20"
            >
              <Package className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-3xl font-black text-white tracking-tighter italic">DigitalMarket</span>
          </Link>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">Access your hub</h1>
            <p className="text-slate-400 font-medium">Enter your credentials to continue</p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass p-8 lg:p-12 rounded-[48px] border border-white/10 shadow-2xl relative"
        >
          {/* Subtle Glow inside card */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900/40 border border-white/5 rounded-[22px] pl-14 pr-6 py-4.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-slate-900/60 transition-all font-medium placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/40 border border-white/5 rounded-[22px] pl-14 pr-6 py-4.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-slate-900/60 transition-all font-medium placeholder:text-slate-700"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-white text-slate-950 font-black rounded-[22px] hover:shadow-2xl hover:shadow-white/10 transition-all shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group/btn"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-950"
                  ></motion.div>
                ) : (
                  <motion.div 
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-5 w-5 transition-transform group-hover/btn:scale-125" />
                    <span className="text-lg">Sign In</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500 font-medium">
              New to the market?{' '}
              <Link href="/register" className="font-black text-indigo-400 hover:text-indigo-300 transition-colors ml-1 uppercase text-xs tracking-widest">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
