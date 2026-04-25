"use client";

import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Trash2, ShoppingBag, CreditCard, ShieldCheck, ArrowRight, Package, Landmark, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeFromCart, getCartTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('crypto');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const total = getCartTotal();

  const handleRazorpayPayment = async (orderData) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount * 100,
      currency: "INR",
      name: "Digital Market",
      description: "Secure Digital Acquisition",
      order_id: orderData.pgOrderId,
      handler: async function (response) {
        try {
          await api.post('/payments/razorpay/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            dbOrderId: orderData.orderId
          });
          toast.success('Payment Verified! Redirecting...');
          clearCart();
          router.push('/dashboard/user?success=true');
        } catch (error) {
          console.error('Verification failed', error);
          toast.error('Payment verification failed. Please contact support.');
        }
      },
      prefill: {
        name: user.name,
        email: user.email,
      },
      theme: {
        color: "#6366f1",
      },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Identity verification required. Please login to continue.');
      router.push('/login?redirect=/cart');
      return;
    }

    if (items.length === 0) return;

    setIsProcessing(true);
    try {
      const item = items[0]; 
      
      const { data } = await api.post('/payments/initiate', {
        productId: item.product._id,
        paymentType: paymentMethod
      });

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

  if (items.length === 0) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center px-6">
        <div className="text-center p-12 glass rounded-[40px] border border-white/5 max-w-md w-full">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
            <ShoppingBag className="h-10 w-10 text-slate-700" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Your vault is empty.</h2>
          <p className="mt-4 text-slate-400 leading-relaxed">Discover premium digital assets to fill your collection.</p>
          <Link href="/products" className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-black text-slate-950 shadow-xl hover:scale-105 transition-transform uppercase tracking-widest">
            Start Exploring <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen pt-20 lg:pt-32 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2 sm:mb-4">
            <Package className="h-3 w-3" /> Secure Checkout
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tighter">Shopping <span className="text-indigo-500">Cart.</span></h1>
        </header>

        <div className="mt-6 lg:mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-16">
          <section className="lg:col-span-7">
            <ul className="space-y-4 lg:space-y-8">
              {items.map((item) => (
                <li key={item.product._id} className="group glass p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row gap-4 sm:gap-8 relative overflow-hidden">
                  <Link href={`/products/${item.product._id}`} className="h-24 w-24 sm:h-40 sm:w-40 rounded-xl sm:rounded-3xl overflow-hidden bg-slate-900 flex-shrink-0 border border-white/10 shadow-2xl mx-auto sm:mx-0">
                    <img
                      src={item.product.images[0] || 'https://via.placeholder.com/150'}
                      alt={item.product.title}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </Link>
                  
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link href={`/products/${item.product._id}`}>
                          <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight group-hover:text-indigo-400 transition-colors">
                            {item.product.title}
                          </h3>
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          className="p-2 sm:p-3 bg-white/5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg sm:rounded-2xl transition-all"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                      <p className="mt-1 text-[10px] sm:text-sm text-slate-500 font-medium">by <span className="text-slate-300">{item.product.sellerId?.name || 'Elite Vendor'}</span></p>
                    </div>
                    
                    <div className="mt-3 sm:mt-6 flex items-center justify-between pt-3 sm:pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">
                        Digital License
                      </div>
                      <p className="text-xl sm:text-3xl font-black text-white tracking-tighter">${item.product.price}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 lg:col-span-5 lg:mt-0">
            <div className="glass p-6 sm:p-8 lg:p-12 rounded-[32px] sm:rounded-[40px] border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 sticky top-32">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-6 sm:mb-8">Order Summary</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">${total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Processing Fee</span>
                  <span className="font-bold text-white text-xs uppercase tracking-widest text-green-500">Waived</span>
                </div>
                
                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-lg font-bold text-white">Total</span>
                  <span className="text-4xl font-black text-indigo-400 tracking-tighter">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-10">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Payment Method</label>
                <div className="grid grid-cols-1 gap-2 sm:gap-4">
                  {/* Razorpay and Stripe disabled for now */}
                  <button 
                    onClick={() => setPaymentMethod('crypto')}
                    className={`p-4 sm:p-6 rounded-[28px] border flex items-center justify-between transition-all ${
                      paymentMethod === 'crypto' ? 'bg-purple-600/20 border-purple-500 ring-4 ring-purple-500/20' : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${paymentMethod === 'crypto' ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs font-black text-white uppercase tracking-widest">Crypto Payment</span>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-tighter">BTC, USDT, ETH & More</span>
                      </div>
                    </div>
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'crypto' ? 'border-purple-500 bg-purple-500' : 'border-white/10'}`}>
                      {paymentMethod === 'crypto' && <Zap className="h-3 w-3 text-white fill-current" />}
                    </div>
                  </button>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="mt-12 w-full py-6 rounded-[24px] bg-white text-slate-950 text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
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
              
              <div className="mt-6 flex items-center justify-center gap-4">
                <div className="w-full h-px bg-white/5"></div>
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">Protected Transaction</div>
                <div className="w-full h-px bg-white/5"></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
