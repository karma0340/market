"use client";

import { useEffect, useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ShoppingCart, Zap, ShieldCheck, ArrowLeft, Package, Sparkles, Globe, Brain, BookOpen, Lightbulb, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import LottieSpotlight from '@/components/LottieSpotlight';

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

  const [activeImage, setActiveImage] = useState(0);

  const getImageUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/800';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    // Assume it's a relative path from the server
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const baseUrl = apiBase.replace('/api', '');
    return `${baseUrl}/${img.replace(/\\/g, '/')}`;
  };

  if (isLoading) return (
    <div className="bg-[#000000] min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );
  
  if (error || !product) return (
    <div className="bg-[#000000] min-h-screen flex items-center justify-center px-6">
      <div className="text-center p-12 glass rounded-[40px] border border-red-500/20 max-w-md">
        <h2 className="text-3xl font-black text-white">Asset not found.</h2>
        <p className="text-[#A1A1AA] mt-4 leading-relaxed">The digital asset you are looking for has been moved or de-listed.</p>
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
    <div className="bg-transparent min-h-screen pt-8 sm:pt-24 lg:pt-32 pb-12 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        
        <Link href="/products" className="inline-flex items-center gap-2 text-[#71717A] hover:text-white transition-colors mb-6 sm:mb-8 lg:mb-12 group text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Market
        </Link>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16 items-start">
          
          {/* Product Image Gallery */}
          <div className="lg:col-span-7 mb-6 lg:mb-0 space-y-4">
            <div className="glass card-3d rounded-[20px] sm:rounded-[40px] overflow-hidden border border-[#1F1F1F] shadow-2xl shadow-indigo-500/10 relative aspect-[4/3]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full relative"
                >
                  <Image
                    src={getImageUrl(product.images[activeImage])}
                    alt={product.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 px-1 custom-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-indigo-500 scale-105' : 'border-[#1F1F1F] hover:border-[#3F3F46]'}`}
                  >
                    <Image 
                      src={getImageUrl(img)} 
                      alt={`Thumbnail ${idx}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="lg:col-span-5">
            <header className="mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111] border border-[#27272A] rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-3 sm:mb-4">
                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Certified Premium
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter mb-2 sm:mb-3 leading-tight">{product.title}</h1>
              <p className="text-3xl sm:text-4xl font-black text-indigo-400 tracking-tighter">
                {product.currency === 'INR' ? '₹' : '$'}{product.price}
              </p>
            </header>
            
            <div className="space-y-6 sm:space-y-8">
              <div className="glass card-3d p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-[#1F1F1F]">
                <h3 className="text-[9px] sm:text-[10px] font-black text-[#71717A] uppercase tracking-widest mb-2 sm:mb-4">Description</h3>
                <p className="text-white leading-relaxed text-xs sm:text-base">{product.description}</p>
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#1F1F1F] flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-[#71717A] uppercase tracking-widest italic mb-0.5">Elite Broker</p>
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
                      className="flex-1 py-3.5 sm:py-5 rounded-xl sm:rounded-[24px] bg-[#111111] border border-[#27272A] text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] hover:bg-[#1A1A1A] transition-all flex items-center justify-center gap-2"
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
                    className="w-full py-3 sm:py-4 rounded-xl sm:rounded-[24px] bg-[#111111] border border-[#27272A] text-[#A1A1AA] text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] hover:text-white hover:border-[#3F3F46] transition-all flex items-center justify-center gap-2 group"
                  >
                    <Globe className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" /> 
                    Live Asset Preview
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3 text-[#71717A] justify-center py-2 sm:py-4 border-t border-[#1F1F1F]">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Secured via Stripe Protection</span>
              </div>

              <LottieSpotlight
                src="/animations/secure-access.json"
                tone="secure"
                size="sm"
                badge="Protected"
                title="Instant buyer vault"
                subtitle="After payment, approved assets become available through your encrypted library."
              />
            </div>
          </div>
        </div>

        {/* AI SMART NOTES SECTION */}
        {product.category === 'notes' && product.aiMetadata?.isProcessed && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 sm:mt-24"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter">AI Smart <span className="text-indigo-500">Intelligence.</span></h2>
                <p className="text-[10px] font-black text-[#71717A] uppercase tracking-widest mt-1">Automatically synthesized for academic excellence</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Summary & Terms */}
              <div className="lg:col-span-7 space-y-8">
                <div className="glass card-3d p-8 sm:p-10 rounded-[40px] border border-[#1F1F1F] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BookOpen className="h-24 w-24 text-indigo-400" />
                  </div>
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <Lightbulb className="h-4 w-4" /> Smart Summary
                  </h3>
                  <div className="text-white leading-relaxed text-sm sm:text-lg italic font-medium whitespace-pre-line">
                    {product.aiMetadata.summary}
                  </div>
                </div>

                <div className="glass card-3d p-8 sm:p-10 rounded-[40px] border border-[#1F1F1F]">
                  <h3 className="text-[10px] font-black text-[#71717A] uppercase tracking-[0.3em] mb-6">Key Concepts</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.aiMetadata.keyTerms.map((term, i) => (
                      <span key={i} className="px-5 py-2 bg-[#111111] border border-[#27272A] rounded-full text-[10px] font-black text-white uppercase tracking-widest hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-default">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Flashcards */}
              <div className="lg:col-span-5">
                <div className="glass p-8 sm:p-10 rounded-[40px] border border-[#1F1F1F] h-full">
                  <h3 className="text-[10px] font-black text-[#71717A] uppercase tracking-[0.3em] mb-8 flex items-center justify-between">
                    <span>Interactive Flashcards</span>
                    <span className="text-indigo-400">1 / {product.aiMetadata.flashcards.length}</span>
                  </h3>
                  
                  <div className="perspective-1000 h-[300px] w-full relative group">
                    <AnimatePresence mode="wait">
                      <Flashcard card={product.aiMetadata.flashcards[0]} />
                    </AnimatePresence>
                  </div>
                  
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <p className="text-[9px] font-bold text-[#71717A] uppercase tracking-widest italic text-center">
                      Tap card to flip • Buy to unlock all {product.aiMetadata.flashcards.length} cards
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Flashcard({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <motion.div
      onClick={() => setIsFlipped(!isFlipped)}
      className="w-full h-full cursor-pointer relative preserve-3d transition-all duration-700"
      animate={{ rotateY: isFlipped ? 180 : 0 }}
    >
      {/* Front */}
      <div className="absolute inset-0 backface-hidden bg-[#111111] border border-[#27272A] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl">
        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Question</div>
        <p className="text-lg font-black text-white leading-tight tracking-tight">{card.front}</p>
      </div>
      
      {/* Back */}
      <div className="absolute inset-0 backface-hidden bg-indigo-600 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl rotate-y-180">
        <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-4">Answer</div>
        <p className="text-lg font-bold text-white leading-tight">{card.back}</p>
      </div>
    </motion.div>
  );
}
