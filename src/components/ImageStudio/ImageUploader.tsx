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
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ── Drag & Drop Zone ── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center transition-all duration-300 overflow-hidden
          ${isDragging
            ? 'border-violet-500 bg-violet-50 scale-[1.01] shadow-xl shadow-violet-200/60'
            : 'border-violet-300/60 hover:border-violet-500 bg-gradient-to-br from-violet-50 via-white to-indigo-50/70 hover:shadow-xl hover:shadow-violet-100/60'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Background decorative orbs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-violet-200/40 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-200/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center space-y-5">
          {/* Upload Icon */}
          <div className="relative">
            <div className="absolute -inset-3 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition duration-300" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/35 group-hover:scale-110 transition-transform duration-200">
              <UploadCloud className="w-9 h-9" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Drop your image here, or{' '}
              <span className="text-violet-600 underline decoration-violet-400/50 underline-offset-4 decoration-2">
                browse files
              </span>
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              PNG · JPG · WebP · SVG · GIF &nbsp;·&nbsp; 100% private in-browser editing
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200/80 shadow-sm">
              🔲 Custom Dimensions
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200/80 shadow-sm">
              ⭕ Shape Cropping
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200/80 shadow-sm">
              ⚡ KB Size Reducer
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700 border border-pink-200/80 shadow-sm">
              🎨 Color &amp; Filters
            </span>
          </div>
        </div>
      </div>

      {/* ── Load from Web URL ── */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Load Image from Web URL
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-600 border border-indigo-200 uppercase tracking-wider">
                Any Link
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              Paste any online image URL (Unsplash, Pexels, CDN, or web link) to preview &amp; edit.
            </p>
          </div>
        </div>

        {/* URL Input */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLoadFromUrl();
                }}
                placeholder="Paste image link e.g. https://images.unsplash.com/photo-..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => handleLoadFromUrl()}
              disabled={isLoadingUrl || !inputUrl.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
            >
              {isLoadingUrl ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <span>Load &amp; Edit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {urlError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{urlError}</span>
            </div>
          )}

          {/* Quick sample URLs */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
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
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 border border-slate-200 text-[11px] text-slate-600 transition-all cursor-pointer disabled:opacity-50"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Try Sample Image ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-600 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Don't have an image ready?</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate a high-res sample artwork to explore resizing, shapes, and filters.
            </p>
          </div>
        </div>

        <button
          onClick={handleLoadSample}
          disabled={isLoadingSample}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-semibold shadow-md shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          <span>{isLoadingSample ? 'Generating Sample...' : 'Try Demo Sample Image'}</span>
        </button>
      </div>

      {/* ── Feature Info Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800">100% Local &amp; Secure</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Images never leave your device. All resizing and masking happen client-side.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0 mt-0.5">
            <ImageIcon className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800">9 Viral Shapes</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Crop into Circle, Squircle, Heart, Star, Hexagon, Diamond, or Shield.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800">Target KB Reducer</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Specify your target file size in KB or drag the quality slider for instant shrinkage.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
