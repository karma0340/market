"use client";

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { 
  ShoppingCart, LogOut, Package, Menu, X, 
  Sparkles, ChevronDown, BookOpen, LayoutGrid, 
  PlusCircle, Wallet, ShieldCheck, DollarSign, Mail
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-2' : 'bg-transparent py-4'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-all duration-300">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-lg sm:text-2xl font-black tracking-tighter text-white">
                Digital<span className="text-indigo-500">Market</span>
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="/products" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Marketplace</Link>
              <Link href="/pricing" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Pricing</Link>
              <Link href="/about" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">About Us</Link>
              <Link href="/contact" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 ml-auto">
            <Link href="/cart" className="relative p-2 text-slate-400 hover:text-white transition-all group mr-2 sm:mr-0">
              <ShoppingCart className="h-6 w-6" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-black text-white ring-2 ring-slate-950">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Desktop Profile Actions */}
            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black text-white">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-white">{user.name.split(' ')[0]}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-4 w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden py-4 z-50"
                      >
                        <div className="px-6 py-4 border-b border-white/5 mb-2">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Clearance: {user.role}</p>
                          <p className="text-sm font-black text-white truncate">{user.email}</p>
                        </div>

                        <div className="px-2 space-y-1">
                          {user.role === 'user' ? (
                            <>
                              <Link 
                                href="/dashboard/user" 
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                              >
                                <BookOpen className="h-4 w-4 text-indigo-400" />
                                <span className="text-xs font-bold uppercase tracking-widest">My Library</span>
                              </Link>
                            </>
                          ) : user.role === 'admin' ? (
                            <div className="space-y-4">
                              <div>
                                <p className="px-4 text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">System Governance</p>
                                <Link 
                                  href="/dashboard/admin" 
                                  onClick={() => setIsProfileOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                                >
                                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                                  <span className="text-xs font-bold uppercase tracking-widest">Command Hub</span>
                                </Link>
                              </div>
                              
                              <div>
                                <p className="px-4 text-[8px] font-black text-purple-500 uppercase tracking-[0.2em] mb-1">Brokerage Terminal</p>
                                <Link 
                                  href="/dashboard/broker" 
                                  onClick={() => setIsProfileOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                                >
                                  <LayoutGrid className="h-4 w-4 text-purple-400" />
                                  <span className="text-xs font-bold uppercase tracking-widest">Broker Vault</span>
                                </Link>
                              </div>

                              <div>
                                <p className="px-4 text-[8px] font-black text-green-500 uppercase tracking-[0.2em] mb-1">Personal Vault</p>
                                <Link 
                                  href="/dashboard/user" 
                                  onClick={() => setIsProfileOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                                >
                                  <BookOpen className="h-4 w-4 text-green-400" />
                                  <span className="text-xs font-bold uppercase tracking-widest">My Library</span>
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Link 
                                href="/dashboard/broker" 
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                              >
                                <LayoutGrid className="h-4 w-4 text-indigo-400" />
                                <span className="text-xs font-bold uppercase tracking-widest">Broker Vault</span>
                              </Link>
                              <Link 
                                href="/dashboard/broker/upload" 
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                              >
                                <PlusCircle className="h-4 w-4 text-purple-400" />
                                <span className="text-xs font-bold uppercase tracking-widest">Forge Asset</span>
                              </Link>
                              <Link 
                                href="/dashboard/broker" 
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                              >
                                <Wallet className="h-4 w-4 text-green-400" />
                                <span className="text-xs font-bold uppercase tracking-widest">Revenue Terminal</span>
                              </Link>
                            </>
                          )}
                          
                          <div className="h-px bg-white/5 my-2 mx-4" />
                          
                          <button
                            onClick={() => { logout(); setIsProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
                          >
                            <LogOut className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Terminate Session</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Sign In</Link>
                  <Link 
                    href="/register?role=broker" 
                    className="relative group px-6 py-3 font-bold text-white transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-indigo-600 rounded-full blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-indigo-600 rounded-full px-6 py-3">Start Selling</div>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Actions */}
            <button 
              className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6 text-indigo-400" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="md:hidden fixed top-20 right-4 w-[280px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-2xl overflow-hidden z-[60]"
          >
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <Link href="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-sm font-black text-slate-300 uppercase tracking-widest hover:text-white">
                  <Package className="h-5 w-5 text-indigo-400" /> Marketplace
                </Link>
                <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-sm font-black text-slate-300 uppercase tracking-widest hover:text-white">
                  <DollarSign className="h-5 w-5 text-green-400" /> Pricing
                </Link>
                <Link href="/about" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-sm font-black text-slate-300 uppercase tracking-widest hover:text-white">
                  <Sparkles className="h-5 w-5 text-purple-400" /> About Us
                </Link>
                <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-sm font-black text-slate-300 uppercase tracking-widest hover:text-white">
                  <Mail className="h-5 w-5 text-indigo-400" /> Contact
                </Link>
              </div>
              
              <div className="pt-6 border-t border-white/5 space-y-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 rounded-3xl border border-white/5">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white uppercase tracking-widest text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate uppercase tracking-widest">{user.name}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Clearance: {user.role}</p>
                      </div>
                    </div>

                    {user.role === 'user' ? (
                      <Link 
                        href="/dashboard/user" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-4 py-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest"
                      >
                        <BookOpen className="h-4 w-4" /> My Library
                      </Link>
                    ) : user.role === 'admin' ? (
                      <>
                        <Link 
                          href="/dashboard/admin" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-4 py-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest"
                        >
                          <ShieldCheck className="h-4 w-4" /> Admin Hub
                        </Link>
                        <Link 
                          href="/dashboard/broker" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-4 py-2 text-purple-400 text-[10px] font-black uppercase tracking-widest"
                        >
                          <LayoutGrid className="h-4 w-4" /> Broker Vault
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link 
                          href="/dashboard/broker" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-4 py-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest"
                        >
                          <LayoutGrid className="h-4 w-4" /> Broker Vault
                        </Link>
                        <Link 
                          href="/dashboard/broker/upload" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-4 py-2 text-purple-400 text-[10px] font-black uppercase tracking-widest"
                        >
                          <PlusCircle className="h-4 w-4" /> Forge Asset
                        </Link>
                      </>
                    )}

                    <button 
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-3 bg-red-500/10 py-4 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl mt-4"
                    >
                      <LogOut className="h-4 w-4" /> Logout System
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-4 pt-2">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-center font-black text-slate-500 py-2 text-xs uppercase tracking-[0.2em] hover:text-white">Sign In</Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)} className="text-center bg-white text-slate-950 py-4 text-xs font-black uppercase tracking-widest rounded-2xl">Start Selling</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
