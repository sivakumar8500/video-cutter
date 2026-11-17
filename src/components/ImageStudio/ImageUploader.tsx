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
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import type { LoadedImageInfo } from '../../types/imageStudio';
import { generateSampleImage, loadImageFromUrl } from '../../utils/imageStudioCanvas';

interface ImageUploaderProps {
  onImageLoaded: (info: LoadedImageInfo) => void;
}

const SAMPLE_URLS = [
  { label: 'Mountain', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80' },
  { label: 'Portrait', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80' },
  { label: 'Birthday', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&q=80' },
  { label: 'City Night', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80' },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlSuccess, setUrlSuccess] = useState(false);
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
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
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
    if (!targetUrl) { setUrlError('Please paste an image URL first.'); return; }
    setUrlError(null);
    setUrlSuccess(false);
    setIsLoadingUrl(true);
    try {
      const loaded = await loadImageFromUrl(targetUrl);
      setUrlSuccess(true);
      setTimeout(() => setUrlSuccess(false), 2000);
      onImageLoaded(loaded);
    } catch (err: unknown) {
      setUrlError(
        err instanceof Error
          ? err.message
          : 'Could not load this image. Try another URL or download and upload directly.'
      );
    } finally {
      setIsLoadingUrl(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* ── Drop Zone ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative group cursor-pointer select-none rounded-2xl
          border-2 border-dashed transition-all duration-200
          px-6 py-12 sm:py-16 text-center overflow-hidden
          ${isDragging
            ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
            : 'border-green-300 bg-white hover:border-green-500 hover:bg-green-50/60 shadow-sm'
          }
        `}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

        <div className="flex flex-col items-center gap-5">
          {/* Upload Icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-md
            ${isDragging ? 'bg-green-600 scale-110 shadow-green-400/40' : 'bg-green-600 group-hover:scale-105 group-hover:shadow-green-400/30'}
          `}>
            <UploadCloud className="w-8 h-8 text-white" />
          </div>

          {/* Text */}
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-black">
              {isDragging ? 'Release to upload' : 'Drop your image here'}
            </h3>
            <p className="text-sm text-gray-500">
              or{' '}
              <span className="text-green-600 font-semibold underline underline-offset-2 cursor-pointer">
                click to browse files
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG · JPG · WebP · SVG · GIF · BMP</p>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {[
              '🔲 Resize & Compress',
              '⭕ Shape Cropping',
              '⚡ KB Target',
              '🎨 Filters',
              '🖼️ Frames',
              '💧 Watermark',
            ].map((f) => (
              <span key={f}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white text-black border border-green-200 shadow-sm">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── URL Loader + Sample ── */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">

        {/* URL Input — 3 cols */}
        <div className="sm:col-span-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-black">Load from URL</p>
              <p className="text-xs text-gray-500">Paste any image link — CDN, news sites, Unsplash, etc.</p>
            </div>
          </div>

          {/* Input row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => { setInputUrl(e.target.value); setUrlError(null); setUrlSuccess(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLoadFromUrl(); }}
                placeholder="https://example.com/image.jpg"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/15 text-xs text-black placeholder-gray-400 focus:outline-none transition-all font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => handleLoadFromUrl()}
              disabled={isLoadingUrl || !inputUrl.trim()}
              className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
            >
              {isLoadingUrl ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : urlSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
              <span>{isLoadingUrl ? 'Loading...' : urlSuccess ? 'Loaded!' : 'Load'}</span>
            </button>
          </div>

          {/* Error */}
          {urlError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="leading-snug">{urlError}</span>
            </div>
          )}

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] text-gray-400 font-medium">Try:</span>
            {SAMPLE_URLS.map((s) => (
              <button
                key={s.label}
                type="button"
                disabled={isLoadingUrl}
                onClick={() => { setInputUrl(s.url); handleLoadFromUrl(s.url); }}
                className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sample Image — 2 cols */}
        <div className="sm:col-span-2 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-4 justify-between">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-green-100 border border-green-200 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-black">No image yet?</p>
              <p className="text-xs text-gray-500 leading-snug">Generate a demo image to explore all editing tools instantly.</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleLoadSample}
              disabled={isLoadingSample}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              <Zap className="w-4 h-4" />
              {isLoadingSample ? 'Generating...' : 'Try Demo Image'}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-black text-xs font-semibold transition-all cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Browse Files
            </button>
          </div>
        </div>
      </div>

      {/* ── Feature Info Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: ShieldCheck,
            title: '100% Private & Local',
            desc: 'Your images never leave your device. All processing happens inside your browser.',
          },
          {
            icon: ImageIcon,
            title: '9 Shape Masks',
            desc: 'Crop into Circle, Squircle, Heart, Star, Hexagon, Diamond, Shield & more.',
          },
          {
            icon: Zap,
            title: 'Target KB Reducer',
            desc: 'Set an exact KB target or slide the quality bar to shrink any image instantly.',
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shrink-0 shadow-sm">
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-black">{title}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
