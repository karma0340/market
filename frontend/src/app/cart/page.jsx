"use client";

import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Trash2, CreditCard, ShieldCheck, ArrowRight, Package, Landmark, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import api, { getImageUrl } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import LottieSpotlight from '@/components/LottieSpotlight';

function PaymentOption({ id, label, subtitle, icon: Icon, activeColor, isActive, onSelect }) {
  return (
    <button
      onClick={() => onSelect(id)}
      className="p-4 sm:p-6 rounded-[28px] flex items-center justify-between transition-all"
      style={{
        background: isActive ? `${activeColor}18` : 'var(--bg-input)',
        border: `1px solid ${isActive ? activeColor : 'var(--border-subtle)'}`,
        boxShadow: isActive ? `0 0 0 3px ${activeColor}22` : 'none',
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="p-3 rounded-2xl"
          style={{ background: isActive ? activeColor : 'var(--bg-hover)', color: isActive ? '#fff' : 'var(--fg-muted)' }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-left">
          <span className="block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--fg-primary)' }}>
            {label}
          </span>
          <span className="block text-[10px] font-bold uppercase tracking-tighter" style={{ color: 'var(--fg-muted)' }}>
            {subtitle}
          </span>
        </div>
      </div>
      <div
        className="h-6 w-6 rounded-full border-2 flex items-center justify-center"
        style={{ borderColor: isActive ? activeColor : 'var(--border-subtle)', background: isActive ? activeColor : 'transparent' }}
      >
        {isActive && <Zap className="h-3 w-3 text-white fill-current" />}
      </div>
    </button>
  );
}

export default function CartPage() {
  const { items, removeFromCart, getCartTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('crypto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAcceptedTOS, setIsAcceptedTOS] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onerror = () => {
      toast.error('Failed to load payment gateway. Please check your internet connection or DNS settings.');
    };
    document.body.appendChild(script);
  }, []);

  const total = getCartTotal();

  const handleRazorpayPayment = async (orderData) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: "INR",
      name: "Digital Market",
      description: `Secure Acquisition of ${items.length} Assets`,
      order_id: orderData.pgOrderId,
      handler: async function (response) {
        try {
          await api.post('/payments/razorpay/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          toast.success('Payment Verified! Redirecting...');
          clearCart();
          router.push('/dashboard/user?success=true');
        } catch (error) {
          console.error('Verification failed', error);
          toast.error('Payment verification failed. Please contact support.');
        }
      },
      prefill: { name: user.name, email: user.email },
      theme: { color: "#6366f1" },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
          toast.error('Payment cancelled by user');
        }
      }
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.on('payment.failed', function (response) {
      setIsProcessing(false);
      toast.error(`Payment failed: ${response.error.description}`);
    });
    rzp1.open();
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Identity verification required. Please login to continue.');
      router.push('/login?redirect=/cart');
      return;
    }
    if (items.length === 0) return;
    if (!isAcceptedTOS) {
      toast.error('Please accept the Terms of Service to proceed.');
      return;
    }

    setIsProcessing(true);
    try {
      const productIds = items.map(item => item.product._id);
      const { data } = await api.post('/payments/initiate', { productIds, paymentType: paymentMethod });

      if (paymentMethod === 'stripe' && data.url) {
        window.location.href = data.url;
      } else if (paymentMethod === 'crypto') {
        window.location.href = data.invoiceUrl;
      } else if (paymentMethod === 'razorpay') {
        handleRazorpayPayment(data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  /* ── Empty State ─────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg-base)' }}>
        <div
          className="text-center p-12 glass rounded-[40px] max-w-md w-full"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <LottieSpotlight
            src="/animations/secure-access.json"
            tone="secure"
            size="sm"
            badge="Vault"
            className="mb-8"
          />
          <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--fg-primary)' }}>
            Your vault is empty.
          </h2>
          <p className="mt-4 leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
            Discover premium digital assets to fill your collection.
          </p>
          <Link
            href="/products"
            className="mt-10 inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-black shadow-xl hover:scale-105 transition-transform uppercase tracking-widest"
            style={{ background: 'var(--fg-primary)', color: 'var(--fg-inverted)' }}
          >
            Start Exploring <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* ── Payment Method Button ───────────────────────── */
  /* ── Full Cart ───────────────────────────────────── */
  return (
    <div className="min-h-screen pt-20 lg:pt-32 pb-12" style={{ background: 'var(--bg-base)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 lg:mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2 sm:mb-4"
            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)', color: 'var(--accent)' }}
          >
            <Package className="h-3 w-3" /> Secure Checkout
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-3d" style={{ color: 'var(--fg-primary)' }}>
            Shopping <span style={{ color: 'var(--accent)' }}>Cart.</span>
          </h1>
        </header>

        <div className="mt-6 lg:mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-16">
          {/* Cart Items */}
          <section className="lg:col-span-7">
            <ul className="space-y-4 lg:space-y-8">
              {items.map((item) => (
                <li
                  key={item.product._id}
                  className="group glass p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] flex flex-col sm:flex-row gap-4 sm:gap-8 relative overflow-hidden transition-all"
                  style={{ border: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-medium)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <Link
                    href={`/products/${item.product._id}`}
                    className="h-24 w-24 sm:h-40 sm:w-40 rounded-xl sm:rounded-3xl overflow-hidden flex-shrink-0 shadow-2xl mx-auto sm:mx-0"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                  >
                    <img
                      src={getImageUrl(item.product.images[0])}
                      alt={item.product.title}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link href={`/products/${item.product._id}`}>
                          <h3
                            className="text-lg sm:text-2xl font-black tracking-tight leading-tight transition-colors"
                            style={{ color: 'var(--fg-primary)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-primary)'}
                          >
                            {item.product.title}
                          </h3>
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          className="p-2 sm:p-3 rounded-lg sm:rounded-2xl transition-all"
                          style={{ background: 'var(--bg-hover)', color: 'var(--fg-muted)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-subtle)'; e.currentTarget.style.color = 'var(--danger)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--fg-muted)'; }}
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                      <p className="mt-1 text-[10px] sm:text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
                        by <span style={{ color: 'var(--fg-secondary)' }}>{item.product.sellerId?.name || 'Elite Vendor'}</span>
                      </p>
                    </div>

                    <div
                      className="mt-3 sm:mt-6 flex items-center justify-between pt-3 sm:pt-6"
                      style={{ borderTop: '1px solid var(--border-subtle)' }}
                    >
                      <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest italic" style={{ color: 'var(--accent)' }}>
                        Digital License
                      </div>
                      <p className="text-xl sm:text-3xl font-black tracking-tighter" style={{ color: 'var(--fg-primary)' }}>
                        {item.product.currency === 'INR' ? '₹' : '$'}{item.product.price}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Order Summary */}
          <section className="mt-8 lg:col-span-5 lg:mt-0">
            <div
              className="glass p-6 sm:p-8 lg:p-12 rounded-[32px] sm:rounded-[40px] shadow-2xl sticky top-32"
              style={{ border: '1px solid var(--border-accent)' }}
            >
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-6 sm:mb-8" style={{ color: 'var(--fg-primary)' }}>
                Order Summary
              </h2>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
                    Subtotal Breakdown
                  </span>
                  {Object.entries(total).map(([curr, amount]) => (
                    <div key={curr} className="flex items-center justify-between text-sm" style={{ color: 'var(--fg-secondary)' }}>
                      <span>{curr} Total</span>
                      <span className="font-bold" style={{ color: 'var(--fg-primary)' }}>
                        {curr === 'INR' ? '₹' : '$'}{amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm" style={{ color: 'var(--fg-secondary)' }}>
                  <span>Processing Fee</span>
                  <span className="font-bold text-xs uppercase tracking-widest" style={{ color: 'var(--success)' }}>Waived</span>
                </div>

                <div className="pt-6 space-y-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <span className="text-lg font-bold block mb-2" style={{ color: 'var(--fg-primary)' }}>Total to Pay</span>
                  <div className="space-y-2">
                    {Object.entries(total).map(([curr, amount]) => (
                      <div key={curr} className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>{curr}</span>
                        <span
                          className="font-black tracking-tighter text-3xl"
                          style={{ color: curr === 'INR' ? 'var(--accent)' : 'var(--secondary)' }}
                        >
                          {curr === 'INR' ? '₹' : '$'}{amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-10">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--fg-muted)' }}>
                  Payment Method
                </label>
                <div className="grid grid-cols-1 gap-2 sm:gap-4">
                  <PaymentOption id="stripe" label="Card Payment" subtitle="Powered by Stripe" icon={CreditCard} activeColor="#6366f1" isActive={paymentMethod === 'stripe'} onSelect={setPaymentMethod} />
                  <PaymentOption id="razorpay" label="Instant Pay" subtitle="Razorpay, UPI, Netbanking" icon={Landmark} activeColor="#3b82f6" isActive={paymentMethod === 'razorpay'} onSelect={setPaymentMethod} />
                  <PaymentOption id="crypto" label="Crypto Payment" subtitle="BTC, USDT, ETH & More" icon={ShieldCheck} activeColor="#a855f7" isActive={paymentMethod === 'crypto'} onSelect={setPaymentMethod} />
                </div>
              </div>

              {/* TOS */}
              <div className="mt-8">
                <div
                  className="flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}
                  onClick={() => setIsAcceptedTOS(!isAcceptedTOS)}
                >
                  <input
                    type="checkbox"
                    id="tos"
                    checked={isAcceptedTOS}
                    onChange={(e) => setIsAcceptedTOS(e.target.checked)}
                    onClick={e => e.stopPropagation()}
                    className="mt-1 h-4 w-4 rounded accent-indigo-600"
                  />
                  <label htmlFor="tos" className="text-[10px] sm:text-xs font-medium leading-relaxed cursor-pointer select-none" style={{ color: 'var(--fg-secondary)' }}>
                    I acknowledge that these are{' '}
                    <span className="font-bold" style={{ color: 'var(--fg-primary)' }}>Digital Assets</span>{' '}
                    and agree to the{' '}
                    <Link href="/terms" className="underline" style={{ color: 'var(--accent)' }} onClick={e => e.stopPropagation()}>
                      Terms of Service
                    </Link>
                    . I understand that all sales are final and non-refundable once the download is initiated.
                  </label>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="mt-6 w-full py-6 rounded-[24px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                style={{
                  background: 'var(--fg-primary)',
                  color: 'var(--fg-inverted)',
                  boxShadow: 'var(--shadow-elevated)',
                }}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 animate-pulse fill-current" /> Initializing...
                  </div>
                ) : (
                  <>
                    Secure Checkout <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Protected label */}
              <div className="mt-6 flex items-center justify-center gap-4">
                <div className="w-full h-px" style={{ background: 'var(--border-subtle)' }} />
                <div className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--fg-muted)' }}>
                  Protected Transaction
                </div>
                <div className="w-full h-px" style={{ background: 'var(--border-subtle)' }} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
