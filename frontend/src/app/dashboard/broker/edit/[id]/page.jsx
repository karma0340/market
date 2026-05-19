"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Package, Upload, Globe, DollarSign, 
  Layout, FileText, Sparkles, ArrowLeft, 
  Image as ImageIcon, Clipboard, CheckCircle2,
  FolderOpen, Smartphone, Zap, ChevronRight, Github, Edit
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import LottieSpotlight from '@/components/LottieSpotlight';
import { useBrokerStore } from '@/store/useBrokerStore';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const imageInputRef = useRef(null);
  const { updateAsset } = useBrokerStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'templates',
    demoUrl: '',
    currency: 'USD',
  });
  
  const [existingImages, setExistingImages] = useState([]); // URLs from backend
  const [imageFiles, setImageFiles] = useState([]); // New File objects
  const [imagePreviews, setImagePreviews] = useState([]); // New preview URLs
  
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'github'
  const [githubRepo, setGithubRepo] = useState('');
  const [existingFilePath, setExistingFilePath] = useState('');

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data;
        setFormData({
          title: p.title || '',
          description: p.description || '',
          price: p.price || '',
          category: p.category || 'templates',
          demoUrl: p.demoUrl || '',
          currency: p.currency || 'USD',
        });
        
        setExistingImages(p.images || []);
        
        // Since getProductById removes filePath, we might not get it directly, 
        // but if it's a github repo we can guess by checking if it starts with http
        // Actually, getProductById removes filePath. But the backend handles updates fine without it.
        
      } catch (error) {
        toast.error('Failed to load product details');
        router.push('/dashboard/broker');
      } finally {
        setIsFetching(false);
      }
    };
    
    if (id) fetchProduct();
  }, [id, router]);

  const handleImageFile = (newFile) => {
    if (!newFile) return;
    if (newFile.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const totalImages = existingImages.length + imageFiles.length;
    if (totalImages >= 10) {
      toast.error('Max 10 images allowed in total');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreviews(prev => [...prev, event.target.result]);
      setImageFiles(prev => [...prev, newFile]);
      toast.success('Visual captured!');
    };
    reader.readAsDataURL(newFile);
  };

  // Handle Clipboard Paste for Images
  useEffect(() => {
    const handlePaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          handleImageFile(blob);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [existingImages.length, imageFiles.length]);



  const removeNewImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('demoUrl', formData.demoUrl);
      data.append('currency', formData.currency);
      
      // Append existing images as stringified JSON so backend keeps them
      data.append('images', JSON.stringify(existingImages));
      
      // Append new image files
      imageFiles.forEach(imgFile => {
        data.append('productImages', imgFile);
      });
      
      if (uploadType === 'file' && file) {
        data.append('productFile', file);
      } else if (uploadType === 'github' && githubRepo) {
        data.append('githubRepo', githubRepo);
      }

      await updateAsset(id, data);

      toast.success('Asset updated successfully! ✨');
      router.push('/dashboard/broker');
    } catch (error) {
      toast.error(error.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading asset details...</div>;
  }

  const totalImageCount = existingImages.length + imageFiles.length;

  return (
    <div className="bg-slate-950 min-h-screen pt-8 lg:pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#b200ff]/10 via-transparent to-transparent opacity-50"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-8 grid gap-8 sm:mb-12 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <Link href="/dashboard/broker" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4 sm:mb-6 text-[10px] font-black uppercase tracking-widest">
              <ArrowLeft className="h-4 w-4" /> Back to Vault
            </Link>
            <div className="flex items-center gap-4 mb-3 sm:mb-4">
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="p-3 bg-gradient-to-br from-[#b200ff] to-[#ff007f] rounded-2xl shadow-lg shadow-[#b200ff]/20"
              >
                <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </motion.div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter">Edit <span className="text-[#ff007f]">Asset.</span></h1>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl">Modify your masterpiece to boost sales and clarity.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            {/* Primary Details */}
            <div className="glass p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-white/5 space-y-5 sm:space-y-6 bg-[#0F172A]/80">
              <h2 className="text-[10px] sm:text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#ff007f]" /> Identity
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
                    className="w-full bg-[#020617] border border-[#1E293B] rounded-2xl px-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-[#b200ff] transition-all placeholder:text-slate-600"
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
                    className="w-full bg-[#020617] border border-[#1E293B] rounded-2xl px-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-[#b200ff] transition-all resize-none placeholder:text-slate-600"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Economics & Experience */}
            <div className="glass p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-white/5 space-y-5 sm:space-y-6 bg-[#0F172A]/80">
              <h2 className="text-[10px] sm:text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" /> Economics
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="49"
                      className="w-full bg-[#020617] border border-[#1E293B] rounded-2xl pl-12 pr-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-[#b200ff] transition-all"
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
                      className="w-full bg-[#020617] border border-[#1E293B] rounded-2xl pl-12 pr-6 py-4 text-white text-[10px] outline-none focus:ring-2 focus:ring-[#b200ff] transition-all appearance-none font-black tracking-widest uppercase"
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
                      className="w-full bg-[#020617] border border-[#1E293B] rounded-2xl pl-12 pr-6 py-4 text-white text-[10px] outline-none focus:ring-2 focus:ring-[#b200ff] transition-all appearance-none font-black tracking-widest uppercase"
                    >
                      <option value="templates">Templates</option>
                      <option value="courses">Courses</option>
                      <option value="software">Software</option>
                      <option value="assets">Assets</option>
                      <option value="notes">Study Notes (AI Enhanced)</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Preview Link (Live Demo)</label>
                  <div className="relative">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00D2FF]" />
                    <input
                      type="url"
                      value={formData.demoUrl}
                      onChange={(e) => setFormData({...formData, demoUrl: e.target.value})}
                      placeholder="https://your-preview-site.com"
                      className="w-full bg-[#020617] border border-[#1E293B] rounded-2xl pl-12 pr-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-[#b200ff] transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
            {/* Visuals Gallery */}
            <div className="glass p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-white/5 space-y-5 sm:space-y-6 relative overflow-hidden bg-[#0F172A]/80">
              <div className="relative z-10">
                <h2 className="text-[10px] sm:text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                  <ImageIcon className="h-4 w-4 text-[#b200ff]" /> Product Visuals ({totalImageCount}/10)
                </h2>
                
                <div className="space-y-5">
                  <div className="flex flex-col gap-3">
                    <button 
                      type="button"
                      disabled={totalImageCount >= 10}
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center justify-between p-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <span className="flex items-center gap-3"><FolderOpen className="h-4 w-4" /> Add More Photos</span>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </button>
                    <input 
                      type="file" 
                      ref={imageInputRef} 
                      className="hidden" 
                      accept="image/*"
                      multiple
                      onChange={(e) => Array.from(e.target.files).forEach(handleImageFile)}
                    />
                  </div>

                  {/* Image Gallery Grid */}
                  {(existingImages.length > 0 || imagePreviews.length > 0) && (
                    <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {/* Existing Images */}
                      {existingImages.map((imgUrl, idx) => (
                        <motion.div 
                          key={`ext-${idx}`}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="aspect-square w-full rounded-xl overflow-hidden border border-white/10 relative group shadow-lg"
                        >
                          <img src={imgUrl} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeExistingImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-rose-500/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                          >
                            <Zap className="h-3 w-3 rotate-45" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md text-[8px] font-bold text-white px-2 py-0.5 rounded-full uppercase">Current</div>
                        </motion.div>
                      ))}

                      {/* New Image Previews */}
                      {imagePreviews.map((preview, idx) => (
                        <motion.div 
                          key={`new-${idx}`}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="aspect-square w-full rounded-xl overflow-hidden border border-[#b200ff]/50 relative group shadow-[0_0_15px_rgba(178,0,255,0.2)]"
                        >
                          <img src={preview} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeNewImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-rose-500/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                          >
                            <Zap className="h-3 w-3 rotate-45" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-[#b200ff]/80 backdrop-blur-md text-[8px] font-bold text-white px-2 py-0.5 rounded-full uppercase">New</div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Final Payload - Optional for Edit */}
            <div className="glass p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-[#00D2FF]/20 bg-[#00D2FF]/5 space-y-5 sm:space-y-6">
              <h2 className="text-[10px] sm:text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#00D2FF]" /> Update Payload (Optional)
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Leave blank to keep existing file/repo.</p>
              
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadType('file')}
                  className={`flex-1 py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    uploadType === 'file'
                      ? 'bg-gradient-to-r from-[#00D2FF] to-[#0070FF] text-white shadow-[0_0_15px_rgba(0,210,255,0.3)]'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <Upload className="h-4 w-4" /> File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('github')}
                  className={`flex-1 py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    uploadType === 'github'
                      ? 'bg-[#1E293B] border border-slate-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <Github className="h-4 w-4" /> GitHub Repo
                </button>
              </div>

              {uploadType === 'file' ? (
                <div className="relative group">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-[#00D2FF]/30 rounded-[28px] p-8 sm:p-10 flex flex-col items-center justify-center gap-3 group-hover:border-[#00D2FF]/60 transition-all bg-[#00D2FF]/5">
                    <div className="p-4 bg-gradient-to-br from-[#00D2FF] to-[#0070FF] rounded-2xl shadow-xl shadow-[#00D2FF]/20">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest text-center truncate max-w-full px-4">
                      {file ? file.name : 'Select New ZIP/PDF Payload'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Github className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="w-full bg-[#020617] border border-[#1E293B] rounded-2xl pl-12 pr-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-[#00D2FF] transition-all placeholder:text-slate-600"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 sm:py-6 rounded-[28px] bg-gradient-to-r from-[#b200ff] to-[#ff007f] text-white text-xs sm:text-sm font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(255,0,127,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
              >
                {isLoading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
