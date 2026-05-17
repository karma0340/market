"use client";

import { useEffect, useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { Search, Filter, Sparkles, Package, ArrowRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import toast from 'react-hot-toast';
import LottieSpotlight from '@/components/LottieSpotlight';

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
    
    const isAlreadyInCart = items.some(item => item.product._id === product._id);
    if (isAlreadyInCart) {
      toast.error('Already in cart');
      return;
    }

    addToCart(product);
    toast.success('Added to vault!');
  };

  return (
    <div className="min-h-screen pb-12 pt-16 lg:pt-32" style={{ background: 'transparent' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-6 grid gap-8 lg:mb-16 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2 sm:mb-4"
              style={{
                background: 'var(--accent-subtle)',
                border: '1px solid var(--border-accent)',
                color: 'var(--accent)',
              }}
            >
              <Sparkles className="h-3 w-3" /> Digital Treasury
            </div>
            <h1
              className="text-4xl sm:text-7xl font-black tracking-tighter mb-2 sm:mb-6 text-3d"
              style={{ color: 'var(--fg-primary)' }}
            >
              Marketplace<span style={{ color: 'var(--accent)' }}>.</span>
            </h1>
            <p className="text-sm sm:text-xl max-w-2xl leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
              Discover premium digital assets curated by experts.
              High-end templates, courses, and software for the elite.
            </p>
          </div>
          <LottieSpotlight
            src="/animations/market-orbit.json"
            tone="market"
            size="md"
            badge="Curated"
            title="Fresh assets"
            subtitle="Search, filter, and move premium items into your vault without losing context."
            className="hidden lg:block"
          />
        </header>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 lg:mb-16">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 transition-colors"
              style={{ color: 'var(--fg-muted)' }}
            />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl py-3.5 sm:py-4 pl-10 sm:pl-12 pr-4 outline-none transition-all text-xs sm:text-sm"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--fg-primary)',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--border-accent)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-subtle)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full sm:w-auto rounded-2xl px-6 py-3.5 sm:py-4 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-between gap-4 transition-all min-w-[160px] sm:min-w-[200px]"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--fg-secondary)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-input)'}
            >
              <span style={{ color: 'var(--fg-primary)' }}>
                {category === 'all' ? 'All Vaults' : category}
              </span>
              <Filter
                className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--fg-muted)' }}
              />
            </button>

            {isFilterOpen && (
              <div
                className="absolute top-full right-0 mt-2 w-full sm:w-64 rounded-[20px] sm:rounded-[24px] shadow-2xl z-[60] overflow-hidden"
                style={{
                  background: 'var(--bg-dropdown)',
                  border: '1px solid var(--border-subtle)',
                  backdropFilter: 'blur(24px)',
                }}
              >
                <div className="p-1.5 sm:p-2">
                  {['all', 'templates', 'courses', 'software', 'notes'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setIsFilterOpen(false); }}
                      className="w-full text-left px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all"
                      style={{
                        background: category === cat ? 'var(--accent)' : 'transparent',
                        color: category === cat ? '#fff' : 'var(--fg-secondary)',
                      }}
                      onMouseEnter={e => {
                        if (category !== cat) e.currentTarget.style.background = 'var(--bg-hover)';
                      }}
                      onMouseLeave={e => {
                        if (category !== cat) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {cat === 'all' ? 'All Vaults' : cat === 'notes' ? 'Study Notes' : cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-[250px] sm:h-[300px] rounded-[20px] sm:rounded-[24px] shimmer"
                style={{ border: '1px solid var(--border-subtle)' }}
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            className="text-center py-20 sm:py-32 glass rounded-[28px] sm:rounded-[40px]"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6" style={{ color: 'var(--fg-muted)' }} />
            <h3 className="text-xl sm:text-2xl font-black mb-1 sm:mb-2 tracking-tight" style={{ color: 'var(--fg-primary)' }}>
              No assets found
            </h3>
            <p className="text-xs sm:text-base" style={{ color: 'var(--fg-secondary)' }}>
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="group card-3d rounded-[20px] sm:rounded-[24px] overflow-hidden transition-all duration-500 relative"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-accent)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Link href={`/products/${product._id}`} className="block relative">
                  {/* Image */}
                  <div
                    className="aspect-[4/3] overflow-hidden relative"
                    style={{ background: 'var(--bg-surface)' }}
                  >
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/600'}
                      alt={product.title}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Mobile Hint Overlay */}
                    <div className="md:hidden absolute inset-0 flex items-center justify-center opacity-0 animate-fade-in-up [animation-delay:5s] [animation-fill-mode:forwards] pointer-events-none"
                      style={{ background: 'var(--accent-subtle)', backdropFilter: 'blur(2px)' }}
                    >
                      <div
                        className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2 animate-bounce"
                        style={{ background: 'var(--bg-base)', color: 'var(--fg-primary)', border: '1px solid var(--border-subtle)' }}
                      >
                        <Sparkles className="h-3 w-3" style={{ color: 'var(--accent)' }} /> See What&apos;s Inside
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-xl backdrop-blur-md"
                      style={{ background: 'var(--bg-navbar)', border: '1px solid var(--border-subtle)' }}
                    >
                      <p className="text-sm sm:text-base font-black tracking-tighter" style={{ color: 'var(--fg-primary)' }}>
                        {product.currency === 'INR' ? '₹' : '$'}{product.price}
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest"
                        style={{ color: 'var(--accent)' }}
                      >
                        {product.category || 'Premium'}
                      </span>
                      <div className="w-1 h-1 rounded-full" style={{ background: 'var(--border-medium)' }} />
                      <span
                        className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest"
                        style={{ color: 'var(--fg-muted)' }}
                      >
                        {product.sellerId?.name || 'Elite Vendor'}
                      </span>
                    </div>
                    <h3
                      className="text-lg sm:text-xl font-black tracking-tight mb-3 transition-colors line-clamp-1"
                      style={{ color: 'var(--fg-primary)' }}
                      title={product.title}
                    >
                      {product.title}
                    </h3>

                    <div
                      className="flex items-center justify-between pt-3 sm:pt-4"
                      style={{ borderTop: '1px solid var(--border-subtle)' }}
                    >
                      <span
                        className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                        style={{ color: 'var(--fg-muted)' }}
                      >
                        View Details <ArrowRight className="h-3 w-3" />
                      </span>

                      {user && hasPurchased(product._id) ? (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          className="px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-default"
                          style={{
                            background: 'var(--success-subtle)',
                            color: 'var(--success)',
                            border: '1px solid var(--success-subtle)',
                          }}
                        >
                          Purchased
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleQuickAdd(e, product)}
                          className="p-2.5 sm:p-3 rounded-xl transition-all group/btn"
                          style={{ background: 'var(--bg-hover)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        >
                          <ShoppingCart
                            className="h-4 w-4 group-hover/btn:scale-110 transition-transform"
                            style={{ color: 'var(--fg-primary)' }}
                          />
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
