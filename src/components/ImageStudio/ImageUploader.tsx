import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Link as LinkIcon,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import type { LoadedImageInfo } from '../../types/imageStudio';
import { generateSampleImage, loadImageFromUrl } from '../../utils/imageStudioCanvas';

interface ImageUploaderProps {
  onImageLoaded: (info: LoadedImageInfo) => void;
}

const SAMPLE_URLS = [
  {
    label: 'Mountain Nature',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
  },
  {
    label: 'Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80',
  },
  {
    label: 'Birthday Party',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&q=80',
  },
  {
    label: 'Cyberpunk Neon',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80',
  },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, SVG, etc.)');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      onImageLoaded({
        file,
        name: file.name,
        originalWidth: img.naturalWidth || img.width,
        originalHeight: img.naturalHeight || img.height,
        originalSizeBytes: file.size,
        previewUrl,
        imgElement: img,
      });
    };
    img.src = previewUrl;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    try {
      const sample = await generateSampleImage();
      onImageLoaded(sample);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleLoadFromUrl = async (urlOverride?: string) => {
    const targetUrl = (urlOverride || inputUrl).trim();
    if (!targetUrl) {
      setUrlError('Please paste an image web link (URL).');
      return;
    }

    setUrlError(null);
    setIsLoadingUrl(true);

    try {
      const loaded = await loadImageFromUrl(targetUrl);
      onImageLoaded(loaded);
    } catch (err: unknown) {
      setUrlError(
        err instanceof Error
          ? err.message
          : 'Could not fetch this image URL. Please verify the link is accessible.'
      );
    } finally {
      setIsLoadingUrl(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center transition-all duration-300 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01] shadow-2xl shadow-cyan-500/20'
            : 'border-slate-700/80 hover:border-cyan-500/60 bg-slate-900/40 hover:bg-slate-900/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-200">
              <UploadCloud className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Drop your image here, or{' '}
              <span className="text-cyan-400 underline decoration-cyan-500/40 underline-offset-4">
                browse
              </span>
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Supports PNG, JPG, WebP, SVG, and GIF. 100% private in-browser editing.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
              🔲 Custom Dimensions
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
              ⭕ Shape Cropping
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
              ⚡ KB Size Reducer
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
              🎨 Color & Filters
            </span>
          </div>
        </div>
      </div>

      {/* Option 2: Paste Any Image URL */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Load Image from Web URL</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                  Any Link
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                Paste any online image URL (Unsplash, Pexels, CDN, or web link) to preview & edit.
              </p>
            </div>
          </div>
        </div>

        {/* URL Input Bar */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLoadFromUrl();
                  }
                }}
                placeholder="Paste image link e.g. https://images.unsplash.com/photo-..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => handleLoadFromUrl()}
              disabled={isLoadingUrl || !inputUrl.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
            >
              {isLoadingUrl ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Fetching Image...</span>
                </>
              ) : (
                <>
                  <span>Load & Edit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {urlError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{urlError}</span>
            </div>
          )}

          {/* Quick Preset URLs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] text-slate-400 font-medium">Quick Examples:</span>
            {SAMPLE_URLS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setInputUrl(sample.url);
                  handleLoadFromUrl(sample.url);
                }}
                disabled={isLoadingUrl}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-cyan-500/15 hover:text-cyan-300 border border-slate-700/80 text-[11px] text-slate-300 transition-all cursor-pointer disabled:opacity-50"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Or Try Sample Image Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Don't have an image ready?</h4>
            <p className="text-xs text-slate-400">
              Generate a high-res sample artwork to explore resizing, shapes, and filters.
            </p>
          </div>
        </div>

        <button
          onClick={handleLoadSample}
          disabled={isLoadingSample}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          <span>{isLoadingSample ? 'Generating Sample...' : 'Try Demo Sample Image'}</span>
        </button>
      </div>

      {/* Features Overview Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-slate-200">100% Local & Secure</h5>
            <p className="text-[11px] text-slate-400">
              Images never leave your device. All resizing and masking happen client-side.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 flex items-start gap-3">
          <ImageIcon className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-slate-200">9 Viral Shapes</h5>
            <p className="text-[11px] text-slate-400">
              Crop into Circle, Squircle, Heart, Star, Hexagon, Diamond, or Shield with borders.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 flex items-start gap-3">
          <Zap className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-slate-200">Target KB Reducer</h5>
            <p className="text-[11px] text-slate-400">
              Specify your target file size in KB or drag the quality slider for instant shrinkage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
