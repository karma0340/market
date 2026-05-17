"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, Upload, Globe, DollarSign, 
  Layout, FileText, Sparkles, ArrowLeft, 
  Image as ImageIcon, Clipboard, CheckCircle2,
  FolderOpen, Smartphone, Zap, ChevronRight, Github
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import LottieSpotlight from '@/components/LottieSpotlight';

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
    currency: 'USD',
  });
  const [imageFiles, setImageFiles] = useState([]); // Array of File objects
  const [imagePreviews, setImagePreviews] = useState([]); // Array of preview URLs
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'github'
  const [githubRepo, setGithubRepo] = useState('');

  // Handle Clipboard Paste for Images (Mainly for Desktop)
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
  }, []);

  const handleImageFile = (newFile) => {
    if (!newFile) return;
    if (newFile.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    if (imageFiles.length >= 10) {
      toast.error('Max 10 images allowed');
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

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadType === 'file' && !file) {
      toast.error('Select your digital resource (ZIP/PDF)');
      return;
    }
    if (uploadType === 'github' && !githubRepo) {
      toast.error('Please enter a GitHub repository URL');
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
      
      // Append each image file
      imageFiles.forEach(imgFile => {
        data.append('productImages', imgFile);
      });
      
      if (uploadType === 'file' && file) {
        data.append('productFile', file);
      } else if (uploadType === 'github' && githubRepo) {
        data.append('githubRepo', githubRepo);
      }

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
        <header className="mb-8 grid gap-8 sm:mb-12 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
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
          </div>
          <LottieSpotlight
            src="/animations/creator-flow.json"
            tone="creator"
            size="sm"
            badge="Upload"
            title="Ready to launch"
            subtitle="Add visuals, price, preview, and protected payload in one pass."
          />
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

            {/* Economics & Experience */}
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
                      <option value="notes">Study Notes (AI Enhanced)</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Preview Link (Live Demo)</label>
                  <div className="relative">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                    <input
                      type="url"
                      value={formData.demoUrl}
                      onChange={(e) => setFormData({...formData, demoUrl: e.target.value})}
                      placeholder="https://your-preview-site.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
            {/* Visuals Gallery */}
            <div className="glass p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-white/5 space-y-5 sm:space-y-6 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-[10px] sm:text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                  <ImageIcon className="h-4 w-4 text-purple-400" /> Product Visuals ({imageFiles.length}/10)
                </h2>
                
                <div className="space-y-5">
                  <div className="flex flex-col gap-3">
                    <button 
                      type="button"
                      disabled={imageFiles.length >= 10}
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center justify-between p-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <span className="flex items-center gap-3"><FolderOpen className="h-4 w-4" /> {imageFiles.length > 0 ? 'Add More Photos' : 'Upload Photos'}</span>
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
                    
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl border-dashed flex items-center justify-center gap-3">
                      <Smartphone className="h-3 w-3 text-slate-500" />
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Paste Image to Quick Capture</span>
                    </div>
                  </div>

                  {/* Image Gallery Grid */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {imagePreviews.map((preview, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="aspect-square w-full rounded-xl overflow-hidden border border-white/10 relative group shadow-lg"
                        >
                          <img src={preview} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                          >
                            <Zap className="h-3 w-3 rotate-45" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Final Payload */}
            <div className="glass p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-indigo-500/20 bg-indigo-600/10 space-y-5 sm:space-y-6">
              <h2 className="text-[10px] sm:text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" /> Master Asset
              </h2>
              
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadType('file')}
                  className={`flex-1 py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    uploadType === 'file'
                      ? 'bg-indigo-600 text-white'
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
                      ? 'bg-slate-800 border border-slate-600 text-white'
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
              ) : (
                <div className="relative">
                  <Github className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-3 font-medium">Link your public GitHub repository as the asset source.</p>
                </div>
              )}

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
