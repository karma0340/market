"use client";

import { useEffect } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ShoppingCart, Zap, ShieldCheck, ArrowLeft, Package, Sparkles, Globe } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { product, fetchProductById, isLoading, error } = useProductStore();
  const { addToCart, items } = useCartStore();
  const { user } = useAuthStore();
  const { fetchOrders, hasPurchased } = useOrderStore();

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
    if (user) {
      fetchOrders();
    }
  }, [id, fetchProductById, user, fetchOrders]);

  if (isLoading) return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );
  
  if (error || !product) return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center px-6">
      <div className="text-center p-12 glass rounded-[40px] border border-red-500/20 max-w-md">
        <h2 className="text-3xl font-black text-white">Asset not found.</h2>
        <p className="text-slate-400 mt-4 leading-relaxed">The digital asset you are looking for has been moved or de-listed.</p>
        <Link href="/products" className="mt-8 inline-block px-8 py-3 bg-white text-slate-950 font-black rounded-2xl">
          Back to Marketplace
        </Link>
      </div>
    </div>
  );

  const handleAddToCart = () => {
    if (user && hasPurchased(product._id)) {
      toast.error('You have already purchased this asset.');
      return;
    }
    const isAlreadyInCart = items.some(item => item.product._id === product._id);
    if (isAlreadyInCart) {
      toast.error('Already in cart');
      return;
    }
    addToCart(product);
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (user && hasPurchased(product._id)) {
      toast.error('You have already purchased this asset.');
      return;
    }
    const isAlreadyInCart = items.some(item => item.product._id === product._id);
    if (!isAlreadyInCart) {
      addToCart(product);
    }
    router.push('/cart');
  };

  return (
    <div className="bg-slate-950 min-h-screen pt-8 sm:pt-24 lg:pt-32 pb-12 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        
        <Link href="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 sm:mb-8 lg:mb-12 group text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Market
        </Link>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16 items-start">
          
          {/* Product Image */}
          <div className="lg:col-span-7 mb-6 lg:mb-0">
            <div className="glass rounded-[20px] sm:rounded-[40px] overflow-hidden border border-white/5 shadow-2xl shadow-indigo-500/10">
              <img
                src={product.images[0] || 'https://via.placeholder.com/800'}
                alt={product.title}
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-5">
            <header className="mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-3 sm:mb-4">
                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Certified Premium
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter mb-2 sm:mb-3 leading-tight">{product.title}</h1>
              <p className="text-3xl sm:text-4xl font-black text-indigo-400 tracking-tighter">
                {product.currency === 'INR' ? '₹' : '$'}{product.price}
              </p>
            </header>
            
            <div className="space-y-6 sm:space-y-8">
              <div className="glass p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-white/5">
                <h3 className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 sm:mb-4">Description</h3>
                <p className="text-slate-300 leading-relaxed text-xs sm:text-base">{product.description}</p>
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-0.5">Elite Broker</p>
                    <p className="text-white font-bold text-sm sm:text-lg">{product.sellerId?.name || 'Elite Vendor'}</p>
                  </div>
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-slate-800" />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4">
                {user && product && hasPurchased(product._id) ? (
                  <div className="flex flex-col gap-3">
                    <div className="w-full py-4 rounded-[24px] bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Already Purchased
                    </div>
                    <Link
                      href="/dashboard/user"
                      className="w-full py-3.5 rounded-[24px] bg-indigo-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                    >
                      Go to Library <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 py-3.5 sm:py-5 rounded-xl sm:rounded-[24px] bg-white/5 border border-white/10 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 py-3.5 sm:py-5 rounded-xl sm:rounded-[24px] bg-indigo-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="h-4 w-4 fill-current" /> Buy Now
                    </button>
                  </div>
                )}

                {product.demoUrl && (
                  <a
                    href={product.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 sm:py-4 rounded-xl sm:rounded-[24px] bg-white/5 border border-white/10 text-slate-400 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    <Globe className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" /> 
                    Live Asset Preview
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3 text-slate-500 justify-center py-2 sm:py-4 border-t border-white/5">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Secured via Stripe Protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
