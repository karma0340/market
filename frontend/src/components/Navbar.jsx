"use client";

import Link from 'next/link';
import Image from 'next/image';
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
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });

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
    hidden:  { opacity: 0, y: -10, scale: 0.98 },
    visible: { opacity: 1, y: 0,   scale: 1, transition: { duration: 0.2 } },
    exit:    { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#020617]/90 backdrop-blur-md border-b border-[#1E293B] py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* ── Logo + Nav Links ─────────────────────────── */}
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 relative transition-transform group-hover:scale-105">
                <Image src="/icon-logo.png" alt="DigitalMarket Logo" fill sizes="48px" className="object-contain" priority />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Digital<span className="text-[#00D2FF]">Market</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {[
                { href: '/products', label: 'Marketplace' },
                { href: '/pricing',  label: 'Pricing' },
                { href: '/about',    label: 'About Us' },
                { href: '/contact',  label: 'Contact' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-semibold text-[#A1A1AA] hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Right Side: Cart + Profile ──────── */}
          <div className="flex items-center gap-4 ml-auto">

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-[#A1A1AA] hover:text-white transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#00D2FF] text-[9px] font-bold text-white">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Desktop Profile Actions */}
            <div className="hidden md:flex items-center gap-4 ml-2">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#334155] bg-[#0F172A] hover:border-[#475569] transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#10B981] to-[#00D2FF] flex items-center justify-center text-xs font-bold text-white">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-white ml-1">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-[#71717A] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                         variants={menuVariants}
                         initial="hidden"
                         animate="visible"
                         exit="exit"
                         className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#111111] border border-[#27272A] shadow-2xl overflow-hidden py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-[#27272A] mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] mb-1">
                            {user.role}
                          </p>
                          <p className="text-sm font-bold text-white truncate">
                            {user.email}
                          </p>
                        </div>

                        <div className="px-2 space-y-1">
                          {user.role === 'user' ? (
                            <Link href="/dashboard/user" onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A] transition-colors"
                            >
                              <BookOpen className="h-4 w-4 text-[#FF8C00]" />
                              My Library
                            </Link>
                          ) : user.role === 'admin' ? (
                            <>
                              <Link href="/dashboard/admin" onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A] transition-colors"
                              >
                                <ShieldCheck className="h-4 w-4 text-[#FF0080]" />
                                Admin Hub
                              </Link>
                              <Link href="/dashboard/broker" onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A] transition-colors"
                              >
                                <LayoutGrid className="h-4 w-4 text-[#8000FF]" />
                                Broker Vault
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link href="/dashboard/broker" onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A] transition-colors"
                              >
                                <LayoutGrid className="h-4 w-4 text-[#FF8C00]" />
                                Dashboard
                              </Link>
                              <Link href="/dashboard/broker/upload" onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A] transition-colors"
                              >
                                <PlusCircle className="h-4 w-4 text-[#00D2FF]" />
                                Add Product
                              </Link>
                            </>
                          )}

                          <div className="h-px my-1 mx-2 bg-[#27272A]" />

                          <button
                            onClick={() => { logout(); setIsProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-semibold text-[#A1A1AA] hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link
                    href="/register?role=broker"
                    className="px-5 py-2 text-sm font-bold bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                  >
                    Start Selling
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 text-[#A1A1AA] hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-[100%] left-0 right-0 bg-[#0F172A] border-b border-[#1E293B] shadow-2xl z-50"
          >
            <div className="px-6 py-8 space-y-6">
              <div className="flex flex-col space-y-4">
                {[
                  { href: '/products', label: 'Marketplace' },
                  { href: '/pricing',  label: 'Pricing' },
                  { href: '/about',    label: 'About Us' },
                  { href: '/contact',  label: 'Contact' },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-bold text-[#A1A1AA] hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
              </div>

              <div className="pt-6 border-t border-[#1F1F1F]">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#27272A] flex items-center justify-center font-bold text-white text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-[#71717A] uppercase">{user.role}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                       {user.role === 'user' ? (
                          <Link href="/dashboard/user" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-[#A1A1AA] py-2">My Library</Link>
                        ) : user.role === 'admin' ? (
                          <>
                            <Link href="/dashboard/admin" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-[#A1A1AA] py-2">Admin Hub</Link>
                            <Link href="/dashboard/broker" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-[#A1A1AA] py-2">Broker Vault</Link>
                          </>
                        ) : (
                          <>
                            <Link href="/dashboard/broker" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-[#A1A1AA] py-2">Dashboard</Link>
                            <Link href="/dashboard/broker/upload" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-[#A1A1AA] py-2">Add Product</Link>
                          </>
                        )}
                        <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-left text-sm font-semibold text-[#EF4444] py-2">Sign Out</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-center font-bold py-3 border border-[#27272A] rounded-full text-white">
                      Sign In
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)} className="text-center font-bold py-3 bg-white text-black rounded-full">
                      Start Selling
                    </Link>
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
