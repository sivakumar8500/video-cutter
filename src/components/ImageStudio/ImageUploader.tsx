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
} from 'lucide-react';
import type { LoadedImageInfo } from '../../types/imageStudio';
import { generateSampleImage, loadImageFromUrl } from '../../utils/imageStudioCanvas';

interface ImageUploaderProps {
  onImageLoaded: (info: LoadedImageInfo) => void;
}

const SAMPLE_URLS = [
  {
    label: 'Mountain',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
  },
  {
    label: 'Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80',
  },
  {
    label: 'Birthday',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&q=80',
  },
  {
    label: 'Neon City',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80',
  },
];

const FEATURES = [
  { icon: ShieldCheck, label: '100% Private', desc: 'Never leaves your device', color: 'emerald' },
  { icon: ImageIcon, label: '9 Shapes', desc: 'Circle, Heart, Star & more', color: 'violet' },
  { icon: Zap, label: 'KB Reducer', desc: 'Hit any target file size', color: 'amber' },
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
    if (!targetUrl) {
      setUrlError('Please paste an image URL first.');
      return;
    }
    setUrlError(null);
    setUrlSuccess(false);
    setIsLoadingUrl(true);
    try {
      const loaded = await loadImageFromUrl(targetUrl);
      setUrlSuccess(true);
      setTimeout(() => setUrlSuccess(false), 1500);
      onImageLoaded(loaded);
    } catch (err: unknown) {
      setUrlError(
        err instanceof Error
          ? err.message
          : 'Could not fetch this image. Try another URL or download and upload the image directly.'
      );
    } finally {
      setIsLoadingUrl(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* ── Main Drop Zone ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative group cursor-pointer select-none
          rounded-2xl border-2 border-dashed
          px-8 py-12 sm:py-16 text-center
          transition-all duration-200 overflow-hidden
          ${isDragging
            ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-100'
            : 'border-slate-300 hover:border-violet-400 bg-white hover:bg-violet-50/40 shadow-sm'
          }
        `}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

        {/* subtle bg pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #7c3aed 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative flex flex-col items-center gap-4">
          {/* Icon */}
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200
              ${isDragging ? 'bg-violet-600 shadow-lg shadow-violet-500/40 scale-110' : 'bg-violet-600 group-hover:shadow-lg group-hover:shadow-violet-500/30 group-hover:scale-105'}
            `}>
              <UploadCloud className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Copy */}
          <div className="space-y-1">
            <p className="text-lg font-bold text-slate-800">
              {isDragging ? 'Drop to upload' : 'Drop image here'}
            </p>
            <p className="text-sm text-slate-500">
              or{' '}
              <span className="text-violet-600 font-semibold underline underline-offset-2 decoration-violet-400/60">
                click to browse
              </span>
              {' '}— PNG, JPG, WebP, SVG, GIF
            </p>
          </div>

          {/* Format pills */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {['Custom Resize', 'Shape Crop', 'KB Reduce', 'Filters & Adjust', 'Watermark', 'Frames'].map((f) => (
              <span key={f} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── URL Loader + Sample ── */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">

        {/* URL Input — takes 3/5 */}
        <div className="sm:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Load from URL</p>
              <p className="text-[11px] text-slate-500 leading-tight">Paste any image link — Unsplash, CDN, news sites, etc.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => { setInputUrl(e.target.value); setUrlError(null); setUrlSuccess(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLoadFromUrl(); }}
                placeholder="https://example.com/photo.jpg"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => handleLoadFromUrl()}
              disabled={isLoadingUrl || !inputUrl.trim()}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
            >
              {isLoadingUrl ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : urlSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
              <span>{isLoadingUrl ? 'Loading...' : 'Load'}</span>
            </button>
          </div>

          {/* Error */}
          {urlError && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="leading-snug">{urlError}</span>
            </div>
          )}

          {/* Quick sample URLs */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] text-slate-400 font-medium shrink-0">Try:</span>
            {SAMPLE_URLS.map((s) => (
              <button
                key={s.label}
                type="button"
                disabled={isLoadingUrl}
                onClick={() => { setInputUrl(s.url); handleLoadFromUrl(s.url); }}
                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 border border-slate-200 text-[10px] text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sample Image — takes 2/5 */}
        <div className="sm:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">No image?</p>
              <p className="text-[11px] text-slate-500 leading-tight">Generate a demo image to try all editing features instantly.</p>
            </div>
          </div>
          <button
            onClick={handleLoadSample}
            disabled={isLoadingSample}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold shadow-sm shadow-amber-500/30 transition-all cursor-pointer disabled:opacity-60"
          >
            <Zap className="w-3.5 h-3.5" />
            {isLoadingSample ? 'Generating...' : 'Generate Sample'}
          </button>
        </div>
      </div>

      {/* ── Feature Info Row ── */}
      <div className="grid grid-cols-3 gap-3">
        {FEATURES.map(({ icon: Icon, label, desc, color }) => (
          <div
            key={label}
            className={`p-3.5 rounded-xl border flex items-start gap-2.5
              ${color === 'emerald' ? 'bg-emerald-50 border-emerald-200' : ''}
              ${color === 'violet' ? 'bg-violet-50 border-violet-200' : ''}
              ${color === 'amber' ? 'bg-amber-50 border-amber-200' : ''}
            `}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0
              ${color === 'emerald' ? 'bg-emerald-100 border border-emerald-200' : ''}
              ${color === 'violet' ? 'bg-violet-100 border border-violet-200' : ''}
              ${color === 'amber' ? 'bg-amber-100 border border-amber-200' : ''}
            `}>
              <Icon className={`w-4 h-4
                ${color === 'emerald' ? 'text-emerald-600' : ''}
                ${color === 'violet' ? 'text-violet-600' : ''}
                ${color === 'amber' ? 'text-amber-600' : ''}
              `} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 leading-tight">{label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
