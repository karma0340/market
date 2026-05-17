"use client";
import { Suspense, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Package, User, Mail, Lock, Phone, ShieldCheck, ArrowRight, Eye, EyeOff, ShoppingCart, Store, Github } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useEffect } from 'react';

function Field({ label, icon: Icon, type = 'text', value, onChange, placeholder, required = true }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#52525B] mb-1.5 ml-1">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525B] group-focus-within:text-[#00D2FF] transition-colors pointer-events-none" />
        <input
          type={isPassword && show ? 'text' : type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl pl-11 pr-11 py-3 text-sm bg-[#0F172A] border border-[#1E293B] text-white placeholder-[#475569] outline-none focus:border-[#00D2FF] focus:ring-1 focus:ring-[#00D2FF]/30 transition-all"
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52525B] hover:text-white transition-colors">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'user';
  const redirect    = searchParams.get('redirect');
  const code        = searchParams.get('code');

  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', role: initialRole });
  const [loading, setLoading]   = useState(false);
  const { register, loginWithGoogle, loginWithGithub } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (code) {
      setLoading(true);
      useAuthStore.getState().loginWithGithub(code)
        .then(user => {
          toast.success('Account ready! Welcome aboard.');
          router.push(redirect || `/dashboard/${user.role}`);
        })
        .catch(err => {
          toast.error(err.message || 'GitHub Sign-Up failed');
          router.replace('/register');
        })
        .finally(() => setLoading(false));
    }
  }, [code, router, redirect]);

  const set = (field) => (e) => setFormData(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(formData.name, formData.email, formData.password, formData.role);
      toast.success('Account created! Welcome aboard.');
      router.push(redirect || `/dashboard/${user.role}`);
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (res) => {
    setLoading(true);
    try {
      const user = await loginWithGoogle(res.credential);
      toast.success('Account ready! Welcome aboard.');
      router.push(redirect || `/dashboard/${user.role}`);
    } catch (err) {
      toast.error(err.message || 'Google Sign-Up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#00D2FF] opacity-[0.06] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-[#0070FF] opacity-[0.05] blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Card */}
        <div className="bg-[#0A0F1E] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Join the market</h1>
            <p className="mt-1 text-sm text-[#64748B]">Create your free account today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role toggle */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#52525B] mb-1.5 ml-1">I want to</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: 'user',   label: 'Buy Assets',  icon: ShoppingCart },
                  { role: 'broker', label: 'Sell Assets',  icon: Store },
                ].map(({ role, label, icon: Icon }) => (
                  <button key={role} type="button" onClick={() => setFormData(p => ({ ...p, role }))}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
                      formData.role === role
                        ? 'bg-gradient-to-r from-[#00D2FF] to-[#0070FF] text-white border-transparent shadow-md shadow-cyan-500/20'
                        : 'bg-[#0F172A] text-[#94A3B8] border-[#1E293B] hover:border-[#334155]'
                    }`}>
                    <Icon className="h-4 w-4" />{label}
                  </button>
                ))}
              </div>
            </div>

            <Field label="Full Name"      icon={User} value={formData.name}     onChange={set('name')}     placeholder="John Doe" />
            <Field label="Email Address"  icon={Mail} type="email" value={formData.email}    onChange={set('email')}    placeholder="name@company.com" />
            <Field label="Password"       icon={Lock} type="password" value={formData.password} onChange={set('password')} placeholder="Min 8 characters" />

            {formData.role === 'broker' && (
              <Field label="Phone Number" icon={Phone} type="tel" value={formData.phone} onChange={set('phone')} placeholder="e.g. +91 9876543210" />
            )}

            <button type="submit" disabled={loading}
              className="w-full mt-2 py-3 font-bold rounded-xl text-sm bg-gradient-to-r from-[#00D2FF] to-[#0070FF] text-white flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-opacity disabled:opacity-60">
              {loading
                ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="flex-1 h-px bg-[#1E293B]" />
            <span className="text-[10px] text-[#52525B] font-bold uppercase tracking-widest">or</span>
            <span className="flex-1 h-px bg-[#1E293B]" />
          </div>

          <div className="flex flex-col gap-3 justify-center w-full overflow-hidden">
            <GoogleLogin onSuccess={handleGoogle} onError={() => toast.error('Google Sign-Up Failed')}
              theme="filled_black" size="large" width="370" text="signup_with" shape="rectangular" />
            
            <button type="button" onClick={() => {
              window.location.href = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${window.location.origin}/register&scope=user:email`;
            }} className="w-full h-[40px] px-3 rounded text-sm font-semibold bg-[#111827] border border-[#374151] hover:bg-[#1F2937] text-white flex items-center justify-center gap-2 transition-colors">
              <Github className="h-5 w-5" /> Sign up with GitHub
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-[#52525B]">
            Already have an account?{' '}
            <Link href={redirect ? `/login?redirect=${redirect}` : '/login'} className="font-bold text-[#00D2FF] hover:text-[#38BDF8] transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-[#334155]">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold uppercase tracking-widest">Bank-Grade Encryption · OAuth 2.0</span>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center"><div className="h-7 w-7 border-2 border-[#00D2FF]/30 border-t-[#00D2FF] rounded-full animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
