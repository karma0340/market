"use client";

import { useEffect, useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { Search, Filter, Sparkles, Package, ArrowRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const { products, fetchProducts, isLoading } = useProductStore();
  const { addToCart, items } = useCartStore();
  const { user } = useAuthStore();
  const { fetchOrders, hasPurchased } = useOrderStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchOrders();
    }
  }, [fetchProducts, user, fetchOrders]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase()) || 
                         product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || product.category?.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory && product.status === 'approved';
  });

  const handleQuickAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (user && hasPurchased(product._id)) {
      toast.error('You have already purchased this asset.');
      return;
    }
    
    // Check if already in cart
    const isAlreadyInCart = items.some(item => item.product._id === product._id);
    if (isAlreadyInCart) {
      toast.error('Already in cart');
      return;
    }

    addToCart(product);
    toast.success('Added to vault!');
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 pb-12 pt-16 lg:pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-6 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2 sm:mb-4">
            <Sparkles className="h-3 w-3" /> Digital Treasury
          </div>
          <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tighter mb-2 sm:mb-6">Marketplace<span className="text-indigo-500">.</span></h1>
          <p className="text-sm sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
            Discover premium digital assets curated by experts. 
            High-end templates, courses, and software for the elite.
          </p>
        </header>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 lg:mb-16">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 sm:py-4 pl-10 sm:pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xs sm:text-sm"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full sm:w-auto bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 sm:py-4 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-between gap-4 hover:bg-white/10 transition-all min-w-[160px] sm:min-w-[200px]"
            >
              <span>{category === 'all' ? 'All Vaults' : category}</span>
              <Filter className={`h-3 w-3 sm:h-4 sm:w-4 text-slate-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-full sm:w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[20px] sm:rounded-[24px] shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-1.5 sm:p-2">
                  {['all', 'templates', 'courses', 'software'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setIsFilterOpen(false); }}
                      className={`w-full text-left px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${
                        category === cat ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {cat === 'all' ? 'All Vaults' : cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-[300px] sm:h-[400px] bg-white/5 rounded-[28px] sm:rounded-[40px] animate-pulse"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 sm:py-32 glass rounded-[28px] sm:rounded-[40px] border border-white/5">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-slate-800 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl font-black text-white mb-1 sm:mb-2 tracking-tight">No assets found</h3>
            <p className="text-xs sm:text-base text-slate-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
            {filteredProducts.map((product) => (
              <div key={product._id} className="group bg-white/[0.02] rounded-[28px] sm:rounded-[32px] overflow-hidden border border-white/5 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 relative">
                <Link href={`/products/${product._id}`} className="block relative">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-900 relative">
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/600'}
                      alt={product.title}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Mobile Hint Overlay (Appears after 5s) */}
                    <div className="md:hidden absolute inset-0 bg-indigo-600/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 animate-fade-in-up [animation-delay:5s] [animation-fill-mode:forwards] pointer-events-none">
                      <div className="bg-white text-slate-950 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2 border border-white/20 animate-bounce">
                        <Sparkles className="h-3 w-3 text-indigo-600" /> See What's Inside
                      </div>
                    </div>

                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-slate-950/80 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-white/10">
                      <p className="text-base sm:text-lg font-black text-white tracking-tighter">
                        {product.currency === 'INR' ? '₹' : '$'}{product.price}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <span className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest">{product.category || 'Premium'}</span>
                      <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                      <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">{product.sellerId?.name || 'Elite Vendor'}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-3 sm:mb-4 group-hover:text-indigo-400 transition-colors">{product.title}</h3>
                    
                    <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-white/5">
                      <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        View Details <ArrowRight className="h-3 w-3" />
                      </span>
                      {user && hasPurchased(product._id) ? (
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          className="px-4 py-3 bg-green-500/10 text-green-400 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-500/20 cursor-default"
                        >
                          Purchased
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => handleQuickAdd(e, product)}
                          className="p-3 sm:p-4 bg-white/5 hover:bg-indigo-600 rounded-xl sm:rounded-2xl transition-all group/btn"
                        >
                          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-white group-hover/btn:scale-110 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
