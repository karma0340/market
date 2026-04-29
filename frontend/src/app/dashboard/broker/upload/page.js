"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, Upload, Globe, DollarSign, 
  Layout, FileText, Sparkles, ArrowLeft, 
  Image as ImageIcon, Clipboard, CheckCircle2,
  FolderOpen, Smartphone, Zap, ChevronRight
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductUploadPage() {
  const router = useRouter();
  const imageInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'templates',
    demoUrl: '',
    imageUrl: '',
    currency: 'USD',
  });
  const [file, setFile] = useState(null);
  const [isPasting, setIsPasting] = useState(false);

  // Handle Clipboard Paste for Images (Mainly for Desktop)
  useEffect(() => {
    const handlePaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          setIsPasting(true);
          const blob = items[i].getAsFile();
          handleImageFile(blob);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleImageFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, imageUrl: event.target.result }));
      toast.success('Visual asset captured!');
      setIsPasting(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Select your digital resource (ZIP/PDF)');
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('demoUrl', formData.demoUrl);
      data.append('currency', formData.currency);
      data.append('images', JSON.stringify([formData.imageUrl]));
      data.append('productFile', file);

      await api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Deployed to Marketplace! 🚀');
      router.push('/dashboard/broker');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen pt-8 lg:pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-8 sm:mb-12">
          <Link href="/dashboard/broker" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4 sm:mb-6 text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" /> Back to Vault
          </Link>
          <div className="flex items-center gap-4 mb-3 sm:mb-4">
            <motion.div 
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20"
            >
              <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </motion.div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter">Forge <span className="text-indigo-500">Asset.</span></h1>
          </div>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl">Release your masterpiece. High-quality digital assets earn premium prices.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            {/* Primary Details */}
            <div className="glass p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-white/5 space-y-5 sm:space-y-6">
              <h2 className="text-[10px] sm:text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" /> Identity
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Asset Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Cyberpunk UI Kit"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Description</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your asset's features..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none placeholder:text-slate-600"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Economics */}
            <div className="glass p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-white/5 space-y-5 sm:space-y-6">
              <h2 className="text-[10px] sm:text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-400" /> Economics
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Price (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="49"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Currency</label>
                  <div className="relative">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-[10px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none font-black tracking-widest uppercase"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Category</label>
                  <div className="relative">
                    <Layout className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-[10px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none font-black tracking-widest uppercase"
                    >
                      <option value="templates">Templates</option>
                      <option value="courses">Courses</option>
                      <option value="software">Software</option>
                      <option value="assets">Assets</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
            {/* Visuals - High Impact on Mobile */}
            <div className="glass p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-white/5 space-y-5 sm:space-y-6 relative overflow-hidden">
              <AnimatePresence>
                {formData.imageUrl && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-0 opacity-20"
                  >
                    <img src={formData.imageUrl} className="w-full h-full object-cover blur-2xl" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative z-10">
                <h2 className="text-[10px] sm:text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                  <ImageIcon className="h-4 w-4 text-purple-400" /> Cover Visual
                </h2>
                
                <div className="space-y-5">
                  <div className="flex flex-col gap-3">
                    <button 
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center justify-between p-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5"
                    >
                      <span className="flex items-center gap-3"><FolderOpen className="h-4 w-4" /> Pick from Gallery</span>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </button>
                    <input 
                      type="file" 
                      ref={imageInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleImageFile(e.target.files[0])}
                    />
                    
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl border-dashed flex items-center justify-center gap-3">
                      <Smartphone className="h-3 w-3 text-slate-500" />
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Or Paste / Take Photo</span>
                    </div>
                  </div>

                  {formData.imageUrl && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 relative group shadow-2xl"
                    >
                      <img src={formData.imageUrl} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, imageUrl: ''})}
                        className="absolute top-3 right-3 p-3 bg-red-500 rounded-xl text-white shadow-xl hover:scale-110 active:scale-90 transition-all"
                      >
                        <Zap className="h-4 w-4 rotate-45" />
                      </button>
                    </motion.div>
                  )}

                  <div className="pt-2">
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Or URL Endpoint</label>
                    <div className="relative">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="url"
                        value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-[10px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Payload */}
            <div className="glass p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-indigo-500/20 bg-indigo-600/10 space-y-5 sm:space-y-6">
              <h2 className="text-[10px] sm:text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" /> Master Asset
              </h2>
              
              <div className="relative group">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-white/10 rounded-[28px] p-8 sm:p-10 flex flex-col items-center justify-center gap-3 group-hover:border-indigo-500/50 transition-all bg-white/5">
                  <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest text-center truncate max-w-full px-4">
                    {file ? file.name : 'Select ZIP/PDF Payload'}
                  </span>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Tap to browse files</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 sm:py-6 rounded-[28px] bg-white text-slate-950 text-xs sm:text-sm font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? 'Processing...' : 'Deploy Asset'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
