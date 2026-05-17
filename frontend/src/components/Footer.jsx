"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Mail, Globe } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[#1E293B] bg-[#020617] text-white pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-20">

          {/* Brand Column */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 relative transition-transform group-hover:scale-105">
                <Image src="/icon-logo.png" alt="DigitalMarket Logo" fill sizes="40px" className="object-contain" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Digital<span className="text-[#00D2FF]">Market</span>
              </span>
            </Link>
            <p className="text-base leading-relaxed text-[#A1A1AA] max-w-sm">
              Empowering the next generation of digital creators with a secure, high-performance marketplace for premium assets.
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-[#A1A1AA] hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-[#A1A1AA] hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Links Grid */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-12">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                  Marketplace
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {[
                    { href: '/products', label: 'Browse Assets' },
                    { href: '/pricing',  label: 'Pricing' },
                    { href: '/register', label: 'Start Selling' },
                    { href: '/login',    label: 'Creator Login' },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="text-sm font-semibold text-[#A1A1AA] hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                  Company
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {[
                    { href: '/about',   label: 'Our Vision' },
                    { href: '/contact', label: 'Support Center' },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="text-sm font-semibold text-[#A1A1AA] hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-12">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                  Legal
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {[
                    { href: '/privacy',  label: 'Privacy Policy' },
                    { href: '/terms',    label: 'Terms & Conditions' },
                    { href: '/refunds',  label: 'Refund Policy' },
                    { href: '/shipping', label: 'Shipping & Delivery' },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="text-sm font-semibold text-[#A1A1AA] hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <div className="glass-solid p-6 border border-[#334155] bg-[#1E293B] rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-3 text-[#00D2FF]">
                    <ShieldCheck className="h-4 w-4" /> Secure Hub
                  </h4>
                  <p className="text-xs leading-relaxed text-[#71717A]">
                    Protected by AES-256 encryption and multi-gateway secure settling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-20 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 border-t border-[#1E293B]">
          <p className="text-xs font-medium text-center md:text-left text-[#71717A]">
            &copy; {currentYear} DigitalMarket Global. All rights reserved.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <span className="text-[10px] font-bold tracking-widest uppercase text-center text-[#71717A]">
              Product Pricing Range: ₹25,000 - ₹84,000 INR / $300 - $1000 USD
            </span>
            <div className="hidden md:block h-4 w-px bg-[#27272A]" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-center text-[#71717A]">
              Secured by Stripe &amp; Razorpay
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
