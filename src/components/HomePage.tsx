import React, { useState, lazy, Suspense, useRef, useEffect } from 'react';
import {
  Film,
  Image as ImageIcon,
  FileText,
  QrCode,
  ArrowRight,
  Scissors,
  Music,
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  Sparkles,
  Lock,
  CheckCircle2,
  VolumeX,
  Palette,
  Share2,
} from 'lucide-react';
import type { ActiveTab } from './Header';
import { AdBanner } from './AdBanner';

// Lazy load 3D Laser scanner so Three.js does not block initial HomePage rendering
const QR3DLaserScanner = lazy(() =>
  import('./QR3DLaserScanner').then((m) => ({ default: m.QR3DLaserScanner }))
);

// Viewport-triggered component: Three.js and QRCode modules NEVER download until scrolled into view
const LazyQR3DScanner: React.FC<{ targetUrl: string; onOpenStudio: () => void }> = ({
  targetUrl,
  onOpenStudio,
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full min-h-[460px]">
      {shouldLoad ? (
        <Suspense
          fallback={
            <div className="w-full h-[460px] rounded-3xl bg-slate-900 border border-green-500/30 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono text-green-400 tracking-wider">
                INITIALIZING 3D LASER MATRIX...
              </span>
            </div>
          }
        >
          <QR3DLaserScanner targetUrl={targetUrl} onOpenStudio={onOpenStudio} />
        </Suspense>
      ) : (
        <div className="w-full h-[460px] rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <QrCode className="w-6 h-6" />
          </div>
          <span className="text-xs font-mono text-slate-400 tracking-wider">
            3D LASER PREVIEW READY
          </span>
        </div>
      )}
    </div>
  );
};

interface HomePageProps {
  onNavigate: (tab: ActiveTab) => void;
  filesCount?: number;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [active3dIndex, setActive3dIndex] = useState(0);

  const modules = [
    {
      id: 'video-cutter' as ActiveTab,
      name: 'Video Cutter',
      tagline: 'Lossless 4K & Vertical Shorts',
      icon: Scissors,
      badge: 'FFmpeg WASM',
      color: 'bg-green-600',
      lightBg: 'bg-green-50',
      borderColor: 'border-green-300',
    },
    {
      id: 'media-tools' as ActiveTab,
      name: 'Media Tools',
      tagline: 'URL Downloader & Audio Extractor',
      icon: Music,
      badge: 'Lossless MP3',
      color: 'bg-emerald-600',
      lightBg: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
    },
    {
      id: 'image-tools' as ActiveTab,
      name: 'Free Online Image Editor',
      tagline: '9 Shape Masks & KB Reducer',
      icon: ImageIcon,
      badge: '9 Shapes',
      color: 'bg-teal-600',
      lightBg: 'bg-teal-50',
      borderColor: 'border-teal-300',
    },
    {
      id: 'pdf-tools' as ActiveTab,
      name: '32 Free Online PDF Tools',
      tagline: 'Merge, Split, Protect & Convert',
      icon: FileText,
      badge: '32 In-1 Engine',
      color: 'bg-green-700',
      lightBg: 'bg-green-50',
      borderColor: 'border-green-300',
    },
    {
      id: 'qr-code-generator' as ActiveTab,
      name: 'Free QR Code Generator',
      tagline: 'Custom Vector QR & Scanner',
      icon: QrCode,
      badge: '15+ Protocols',
      color: 'bg-green-600',
      lightBg: 'bg-green-50',
      borderColor: 'border-green-300',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black selection:bg-green-200 selection:text-black font-sans overflow-x-hidden pb-24">
      {/* Dynamic 3D Animation Styles */}
      <style>{`
        @keyframes float3d-1 {
          0%, 100% { transform: translateY(0px) rotateX(6deg) rotateY(-8deg); }
          50% { transform: translateY(-16px) rotateX(-6deg) rotateY(10deg); }
        }
        @keyframes float3d-2 {
          0%, 100% { transform: translateY(-10px) rotateX(-6deg) rotateY(10deg); }
          50% { transform: translateY(8px) rotateX(8deg) rotateY(-6deg); }
        }
        @keyframes float3d-3 {
          0%, 100% { transform: translateY(0px) rotateX(10deg) rotateY(6deg); }
          50% { transform: translateY(-20px) rotateX(-8deg) rotateY(-8deg); }
        }
        @keyframes pulseSoft {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        .animate-float-1 { animation: float3d-1 4.5s ease-in-out infinite; }
        .animate-float-2 { animation: float3d-2 5.2s ease-in-out infinite; }
        .animate-float-3 { animation: float3d-3 4.8s ease-in-out infinite; }
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
      `}</style>

      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-green-500/10 via-white to-transparent blur-3xl pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* SECTION 1: HERO & GRAND APPLICATION OVERVIEW WITH 3D ICONS ANIMATION */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-12 sm:pt-20 pb-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        {/* Status Pill */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono tracking-widest text-green-800 border-b border-green-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="uppercase font-bold text-black">100% IN-BROWSER MULTIMEDIA &amp; DOCUMENT SUITE</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-green-700 font-semibold">
            <span>[ ZERO SERVER UPLOADS ]</span>
            <span>[ CLIENT-SIDE WASM ]</span>
            <span>[ HARDWARE ACCELERATED ]</span>
          </div>
        </div>

        {/* Hero Title & Big Explanation */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-300 text-green-700 text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-green-600" />
            <span>VidCuts All-In-One Creative &amp; Productivity Suite</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-black leading-[1.08]">
            Your Complete{' '}
            <span className="text-green-600 underline decoration-green-300 decoration-wavy underline-offset-8">
              In-Browser
            </span>{' '}
            Media &amp; Document Studio
          </h1>

          <p className="text-base sm:text-lg text-green-800 max-w-3xl mx-auto leading-relaxed">
            VidCuts is an ultra-fast, privacy-first multimedia workstation running entirely in your browser memory.
            Cut &amp; split 4K videos losslessly, download web clips &amp; extract clean audio, crop photos into geometric shapes with target KB compression, process confidential PDFs across 32 tools, and generate custom vector QR codes — with <strong>0 bytes ever uploaded to any external server</strong>.
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('video-cutter')}
              className="px-6 py-3.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-md shadow-green-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Scissors className="w-4 h-4" />
              <span>Launch Video Cutter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('pdf-tools')}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-green-50 text-green-800 font-bold text-sm border-2 border-green-300 shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <FileText className="w-4 h-4 text-green-600" />
              <span>Explore 32 PDF Tools</span>
            </button>
            <button
              onClick={() => onNavigate('image-tools')}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-green-50 text-green-800 font-bold text-sm border-2 border-green-300 shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <ImageIcon className="w-4 h-4 text-green-600" />
              <span>Free Online Image Editor</span>
            </button>
          </div>
        </div>

        {/* 3D FLOATING ICONS INTERACTIVE SHOWCASE */}
        <div className="relative pt-8 pb-4">
          <div className="perspective-1000 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 preserve-3d">
              {modules.map((m, idx) => {
                const Icon = m.icon;
                const animClass =
                  idx % 3 === 0 ? 'animate-float-1' : idx % 3 === 1 ? 'animate-float-2' : 'animate-float-3';
                const isSelected = active3dIndex === idx;

                return (
                  <div
                    key={m.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${m.name}: ${m.tagline}`}
                    onClick={() => {
                      setActive3dIndex(idx);
                      onNavigate(m.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActive3dIndex(idx);
                        onNavigate(m.id);
                      }
                    }}
                    onMouseEnter={() => setActive3dIndex(idx)}
                    className={`${animClass} cursor-pointer group rounded-3xl p-5 bg-white border-2 ${
                      isSelected ? 'border-green-500 shadow-xl shadow-green-500/20 scale-105' : 'border-green-200 shadow-md hover:border-green-400'
                    } transition-all duration-300 flex flex-col items-center text-center space-y-3`}
                    style={{ animationDelay: `${idx * 0.3}s` }}
                  >
                    {/* 3D Floating Icon Orb */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-600/30 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                        <Icon className="w-8 h-8" />
                      </div>
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-800 border border-green-300 shadow-xs">
                        {m.badge}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-sm font-extrabold text-black group-hover:text-green-800 transition-colors">
                        {m.name}
                      </h2>
                      <p className="text-[11px] text-green-800 leading-tight mt-0.5">
                        {m.tagline}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-800 group-hover:translate-x-1 transition-transform">
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-green-200">
          {[
            { label: 'Lossless Video Cuts', val: '4K 60FPS', sub: 'FFmpeg WASM stream' },
            { label: 'Document Operations', val: '32 PDF Tools', sub: 'AES-256 in RAM' },
            { label: 'Geometric Shape Crops', val: '9 Shapes', sub: 'Instant transparent PNG' },
            { label: 'Private & Local', val: '100% Client-Side', sub: '0 bytes cloud storage' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-green-50/60 border border-green-200 text-center">
              <span className="text-xs font-mono uppercase text-green-800 font-semibold block">{stat.label}</span>
              <span className="text-xl sm:text-2xl font-black text-black block mt-0.5">{stat.val}</span>
              <span className="text-[11px] text-green-800 block font-medium">{stat.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: VIDEO CUTTER & SPLITTER */}
      {/* ========================================================================= */}
      <section className="relative py-20 px-4 sm:px-8 bg-green-50/40 border-t border-green-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Explanation Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-300 text-green-800 text-xs font-bold">
              <Scissors className="w-3.5 h-3.5 text-green-600" />
              <span>Section 01 • Video Precision Engine</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-black leading-tight">
              Lossless 4K Video Cutter &amp; Social Shorts Converter
            </h2>

            <p className="text-sm sm:text-base text-green-800 leading-relaxed">
              Slice large video recordings into perfectly timed segments without quality degradation. VidCuts uses hardware-accelerated FFmpeg WebAssembly to cut keyframes directly in browser memory — preserving 100% of the original video codec, bitrate, and color palette with zero re-encoding lag.
            </p>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { title: 'Exact Keyframe Slicing', desc: 'Lossless copy mode without recompression' },
                { title: '1-Click Status Splits', desc: 'Auto-split into 30s WhatsApp & 60s Reels' },
                { title: '16:9 to 9:16 Shorts', desc: 'Blurred background fill for vertical video' },
                { title: 'Batch ZIP Export', desc: 'Download all generated parts in one archive' },
                { title: 'Audio Retain or Mute', desc: 'Keep crystal clear sound or mute sound track' },
                { title: 'Multi-Format Support', desc: 'MP4, MOV, WebM, MKV, AVI & FLV formats' },
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-green-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-black">{feat.title}</h3>
                    <p className="text-[11px] text-green-800">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('video-cutter')}
                className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-md shadow-green-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <span>Launch Video Cutter &amp; Splitter</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Visual Interactive Stage */}
          <div className="lg:col-span-6">
            <div className="p-6 rounded-3xl bg-white border-2 border-green-300 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-green-200 pb-3">
                <span className="text-xs font-mono font-bold text-green-800 uppercase flex items-center gap-2">
                  <Film className="w-4 h-4 text-green-600" />
                  TIMELINE PREVIEW SIMULATION
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-green-100 text-green-800 font-bold">
                  60 FPS STREAM
                </span>
              </div>

              {/* Mock Timeline Visual */}
              <div className="space-y-3">
                <div className="relative h-24 rounded-2xl bg-green-50 border border-green-200 overflow-hidden flex items-center justify-center p-4">
                  <div className="absolute inset-x-4 flex items-end justify-between gap-1 h-12 opacity-80">
                    {[35, 60, 45, 80, 95, 40, 70, 85, 50, 90, 65, 40, 75, 85, 60, 80, 70, 95, 45, 75, 85, 55, 80, 60, 45, 75, 90, 65].map((h, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-green-500 rounded-t-xs"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>

                  {/* Cut Marker 1 */}
                  <div className="absolute left-[33%] inset-y-0 w-0.5 bg-green-600 flex flex-col justify-between py-1 items-center z-10">
                    <span className="text-[8px] font-mono font-bold bg-green-600 text-white px-1 rounded-xs">PART 1</span>
                    <Scissors className="w-3 h-3 text-green-700" />
                    <span className="text-[8px] font-mono text-green-800 font-bold">00:30</span>
                  </div>

                  {/* Cut Marker 2 */}
                  <div className="absolute left-[66%] inset-y-0 w-0.5 bg-green-600 flex flex-col justify-between py-1 items-center z-10">
                    <span className="text-[8px] font-mono font-bold bg-green-600 text-white px-1 rounded-xs">PART 2</span>
                    <Scissors className="w-3 h-3 text-green-700" />
                    <span className="text-[8px] font-mono text-green-800 font-bold">01:00</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-green-50 border border-green-200">
                    <span className="text-[10px] text-green-700 font-semibold block">Piece 1</span>
                    <span className="font-mono font-bold text-black">00:00 - 00:30</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-green-50 border border-green-200">
                    <span className="text-[10px] text-green-700 font-semibold block">Piece 2</span>
                    <span className="font-mono font-bold text-black">00:30 - 01:00</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-green-50 border border-green-200">
                    <span className="text-[10px] text-green-700 font-semibold block">Piece 3</span>
                    <span className="font-mono font-bold text-black">01:00 - 01:30</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: MEDIA TOOLS (DOWNLOADER, AUDIO EXTRACTOR, MUTER) */}
      {/* ========================================================================= */}
      <section className="relative py-20 px-4 sm:px-8 bg-white border-t border-green-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-300 text-green-800 text-xs font-bold">
              <Music className="w-3.5 h-3.5 text-green-600" />
              <span>Section 02 • Universal Media &amp; Audio Processing</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-black leading-tight">
              Video Downloader, Audio Extractor &amp; Audio Muter
            </h2>

            <p className="text-sm sm:text-base text-green-800 leading-relaxed">
              Handle online video streams and audio tracks with zero installations. Download web videos straight to local disk, extract clean MP3 audio tracks from podcasts and movies, or permanently mute video sound for background B-roll.
            </p>
          </div>

          {/* 3 Core Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tool 1 */}
            <div className="p-6 rounded-3xl bg-green-50/50 border-2 border-green-200 hover:border-green-400 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-md shadow-green-600/20">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-black">URL Video Downloader</h3>
                <p className="text-xs text-green-800 mt-1 leading-relaxed">
                  Paste any direct video URL, CDN stream, or web media file. Download and preview locally with automatic CORS proxy bypass.
                </p>
              </div>
              <ul className="text-xs text-green-700 space-y-1.5 pt-2 border-t border-green-200">
                <li className="flex items-center gap-2">✓ Direct HTTP &amp; HTTPS media grab</li>
                <li className="flex items-center gap-2">✓ Auto-resolves MP4, WebM &amp; TS chunks</li>
                <li className="flex items-center gap-2">✓ 1-click send to Video Cutter</li>
              </ul>
            </div>

            {/* Tool 2 */}
            <div className="p-6 rounded-3xl bg-green-50/50 border-2 border-green-200 hover:border-green-400 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-black">Audio Extractor (MP3 / AAC)</h3>
                <p className="text-xs text-green-800 mt-1 leading-relaxed">
                  Separate voice, music, and background audio from any video. Lossless export to MP3, WAV, or AAC format in seconds.
                </p>
              </div>
              <ul className="text-xs text-green-700 space-y-1.5 pt-2 border-t border-green-200">
                <li className="flex items-center gap-2">✓ High-fidelity 320 kbps sound export</li>
                <li className="flex items-center gap-2">✓ Ideal for podcast clips &amp; soundtracks</li>
                <li className="flex items-center gap-2">✓ Instant waveform inspection</li>
              </ul>
            </div>

            {/* Tool 3 */}
            <div className="p-6 rounded-3xl bg-green-50/50 border-2 border-green-200 hover:border-green-400 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                <VolumeX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-black">Video Muter / Track Stripper</h3>
                <p className="text-xs text-green-800 mt-1 leading-relaxed">
                  Permanently strip unwanted audio tracks from screen recordings or noisy camera clips. Retains 100% video quality without sound.
                </p>
              </div>
              <ul className="text-xs text-green-700 space-y-1.5 pt-2 border-t border-green-200">
                <li className="flex items-center gap-2">✓ Zero video re-encoding speed</li>
                <li className="flex items-center gap-2">✓ Instant B-roll preparation</li>
                <li className="flex items-center gap-2">✓ Removes copyright audio strikes</li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate('media-tools')}
              className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-md shadow-green-600/25 inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <span>Explore Media &amp; Audio Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Mid-Page In-Feed Fluid Ad Unit (Slot #6721366060) */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <AdBanner variant="in-feed" />
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: IMAGE STUDIO (SHAPES, KB REDUCER, FILTERS) */}
      {/* ========================================================================= */}
      <section className="relative py-20 px-4 sm:px-8 bg-green-50/40 border-t border-green-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Shape Matrix Display */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="p-6 rounded-3xl bg-white border-2 border-green-300 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-green-200 pb-3">
                <span className="text-xs font-mono font-bold text-green-800 uppercase flex items-center gap-2">
                  <Palette className="w-4 h-4 text-green-600" />
                  9 GEOMETRIC SHAPE MASKS &amp; BORDERS
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-green-100 text-green-800 font-bold">
                  TRANSPARENT PNG
                </span>
              </div>

              {/* 9 Shapes Showcase */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Circle', icon: '⭕' },
                  { name: 'Squircle', icon: '🔲' },
                  { name: 'Heart', icon: '❤️' },
                  { name: 'Star', icon: '⭐' },
                  { name: 'Hexagon', icon: '⬡' },
                  { name: 'Diamond', icon: '💎' },
                  { name: 'Shield', icon: '🛡️' },
                  { name: 'Rounded', icon: '▢' },
                  { name: 'Rectangle', icon: '▭' },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-green-50/60 border border-green-200 flex flex-col items-center justify-center text-center hover:bg-green-100/60 transition-colors cursor-pointer"
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-[11px] font-bold text-black mt-1">{s.name}</span>
                  </div>
                ))}
              </div>

              {/* KB Reducer Banner */}
              <div className="p-3.5 rounded-2xl bg-green-100/80 border border-green-300 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-black block">Exact Target KB Reducer</span>
                  <span className="text-[11px] text-green-700">Shrink images to &lt; 50 KB or 100 KB for passport &amp; job portals</span>
                </div>
                <span className="px-3 py-1 rounded-xl bg-green-600 text-white text-xs font-mono font-bold">
                  BINARY SEARCH
                </span>
              </div>
            </div>
          </div>

          {/* Right Text Column */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-300 text-green-800 text-xs font-bold">
              <ImageIcon className="w-3.5 h-3.5 text-green-600" />
              <span>Section 03 • Photo &amp; Avatar Studio</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-black leading-tight">
              Crop Photos Into Shapes &amp; Target Exact File Size
            </h2>

            <p className="text-sm sm:text-base text-green-800 leading-relaxed">
              Transform boring square pictures into stunning social profile pictures and avatars. Crop into circles, hearts, stars, or squircles with customized border thickness and colors. Need to upload a passport photo under 50 KB? Type the exact number and let VidCuts optimize quality automatically.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-green-800 font-semibold pt-1">
              <li className="flex items-center gap-2">✓ 9 Viral Geometric Shape Masks</li>
              <li className="flex items-center gap-2">✓ Precision Target KB File Reducer</li>
              <li className="flex items-center gap-2">✓ Contrast, Brightness &amp; Sepia filters</li>
              <li className="flex items-center gap-2">✓ Unsharp Mask edge sharpening</li>
              <li className="flex items-center gap-2">✓ Birthday &amp; Celebration photo frames</li>
              <li className="flex items-center gap-2">✓ Custom text &amp; QR code watermarks</li>
            </ul>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('image-tools')}
                className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-md shadow-green-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <span>Open Image Editor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: PDF STUDIO (32 POWER TOOLS) */}
      {/* ========================================================================= */}
      <section className="relative py-20 px-4 sm:px-8 bg-white border-t border-green-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-300 text-green-800 text-xs font-bold">
              <FileText className="w-3.5 h-3.5 text-green-600" />
              <span>Section 04 • 32 In-Browser PDF Tools</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-black leading-tight">
              32 Complete PDF Tools — 100% Free &amp; Confidential
            </h2>

            <p className="text-sm sm:text-base text-green-800 leading-relaxed">
              Never upload your confidential tax returns, bank statements, or legal contracts to third-party servers again. VidCuts executes all 32 PDF operations directly on your local device with zero server transmission.
            </p>
          </div>

          {/* 32 PDF Tools Categorized Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Group 1: Organize */}
            <div className="p-5 rounded-3xl bg-green-50/50 border border-green-200 space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-green-600" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-black">
                  Organize &amp; Edit
                </h3>
              </div>
              <div className="space-y-1.5 text-xs">
                {['Merge Multiple PDFs', 'Split PDF by Range', 'Rotate PDF Pages', 'Reorder & Rearrange', 'Delete Selected Pages', 'Extract Specific Pages'].map((t, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-white border border-green-200/80 font-medium text-black flex items-center justify-between">
                    <span>{t}</span>
                    <span className="text-[10px] text-green-800 font-bold">PDF</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Group 2: Security & Protection */}
            <div className="p-5 rounded-3xl bg-green-50/50 border border-green-200 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-600" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-black">
                  Security &amp; Privacy
                </h3>
              </div>
              <div className="space-y-1.5 text-xs">
                {['AES-256 Encrypt & Protect', 'Remove PDF Password', 'Add Custom Watermark', 'Blackout & Redact', 'Flatten Form Fields', 'Sanitize Metadata'].map((t, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-white border border-green-200/80 font-medium text-black flex items-center justify-between">
                    <span>{t}</span>
                    <span className="text-[10px] text-green-800 font-bold">LOCK</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Group 3: Conversion */}
            <div className="p-5 rounded-3xl bg-green-50/50 border border-green-200 space-y-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-green-600" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-black">
                  Conversion &amp; Export
                </h3>
              </div>
              <div className="space-y-1.5 text-xs">
                {['PDF to PNG / JPG Images', 'Images to PDF Maker', 'Grayscale B&W Converter', 'Extract Text & Words', 'Extract Images from PDF', 'Crop PDF Page Box'].map((t, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-white border border-green-200/80 font-medium text-black flex items-center justify-between">
                    <span>{t}</span>
                    <span className="text-[10px] text-green-800 font-bold">CONVERT</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Group 4: Optimization */}
            <div className="p-5 rounded-3xl bg-green-50/50 border border-green-200 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-black">
                  Optimize &amp; Stamp
                </h3>
              </div>
              <div className="space-y-1.5 text-xs">
                {['Compress PDF Size', 'Add Page Numbers (B/T)', 'Add Header & Footer Text', 'Deskew Crooked Scans', 'N-Up 2/4 Pages per Sheet', 'Compare Two PDFs'].map((t, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-white border border-green-200/80 font-medium text-black flex items-center justify-between">
                    <span>{t}</span>
                    <span className="text-[10px] text-green-800 font-bold">BOOST</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate('pdf-tools')}
              className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-md shadow-green-600/25 inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <span>Launch 32 PDF Tools Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Pre-Footer Display Responsive Ad Unit (Slot #7986346271) */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <AdBanner variant="display" />
      </div>

      {/* ========================================================================= */}
      {/* SECTION 6: QR STUDIO & CAMERA SCANNER */}
      {/* ========================================================================= */}
      <section className="relative py-20 px-4 sm:px-8 bg-green-50/40 border-t border-green-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-300 text-green-800 text-xs font-bold">
              <QrCode className="w-3.5 h-3.5 text-green-600" />
              <span>Section 05 • Vector QR Studio &amp; Scanner</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-black leading-tight">
              Vector QR Code Generator &amp; Built-In Camera Scanner
            </h2>

            <p className="text-sm sm:text-base text-green-800 leading-relaxed">
              Design branded vector QR codes for restaurants, business cards, Wi-Fi networks, and marketing campaigns. Embed your custom company logo, pick gradient dots, and download scalable SVG vector files that never pixelate on print billboards. Plus, scan any QR code instantly with your device camera!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { title: '15+ QR Protocols', desc: 'WiFi, vCard, Email, SMS, WhatsApp & UPI' },
                { title: 'Embedded Center Logo', desc: 'Upload custom PNG/SVG logo with auto padding' },
                { title: 'Lossless Vector SVG', desc: 'Infinite zoom print-ready format' },
                { title: 'Built-In Camera Scanner', desc: 'Scan codes with webcam or phone lens' },
                { title: 'Eye Frame & Dot Styling', desc: 'Custom rounded, square, or diamond dots' },
                { title: 'Error Correction M/Q/H', desc: 'Scannable even if 30% obstructed' },
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-green-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-black">{feat.title}</h3>
                    <p className="text-[11px] text-green-800">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('qr-code-generator')}
                className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-md shadow-green-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <span>Launch Free QR Code Generator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Visual 3D QR Laser Scanner Stage */}
          <div className="lg:col-span-6 w-full">
            <LazyQR3DScanner
              targetUrl="https://www.vidcuts.online"
              onOpenStudio={() => onNavigate('qr-code-generator')}
            />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: WHY VIDCUTS & GRAND CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-8 max-w-6xl mx-auto border-t border-green-200 space-y-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-green-600 text-white shadow-xl space-y-8 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider inline-block">
              Privacy First Guarantee
            </span>
            <h2 className="text-3xl sm:text-5xl font-black leading-tight text-white">
              Zero Uploads. Zero Cloud Storage. Zero Fees.
            </h2>
            <p className="text-sm sm:text-base text-green-100 max-w-2xl mx-auto leading-relaxed">
              Every tool on VidCuts utilizes browser WebAssembly and local memory to process your photos, videos, and legal PDFs. Your personal media never touches our servers.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20">
              <ShieldCheck className="w-6 h-6 mx-auto text-green-200 mb-1" />
              <h3 className="text-xs font-bold text-white uppercase">100% Private</h3>
              <p className="text-[10px] text-green-100 mt-0.5">Files stay on your machine</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20">
              <Zap className="w-6 h-6 mx-auto text-green-200 mb-1" />
              <h3 className="text-xs font-bold text-white uppercase">Local Speed</h3>
              <p className="text-[10px] text-green-100 mt-0.5">Instant hardware computation</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20">
              <CheckCircle2 className="w-6 h-6 mx-auto text-green-200 mb-1" />
              <h3 className="text-xs font-bold text-white uppercase">Always Free</h3>
              <p className="text-[10px] text-green-100 mt-0.5">No login, credit card, or limits</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20">
              <Globe className="w-6 h-6 mx-auto text-green-200 mb-1" />
              <h3 className="text-xs font-bold text-white uppercase">Offline Capable</h3>
              <p className="text-[10px] text-green-100 mt-0.5">Runs offline once cached</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('video-cutter')}
              className="px-6 py-3 rounded-2xl bg-white text-green-800 font-extrabold text-sm hover:bg-green-50 shadow-md cursor-pointer transition-all hover:scale-105"
            >
              Start Cutting Video →
            </button>
            <button
              onClick={() => onNavigate('pdf-tools')}
              className="px-6 py-3 rounded-2xl bg-green-800 text-white font-extrabold text-sm hover:bg-green-900 border border-white/20 shadow-md cursor-pointer transition-all hover:scale-105"
            >
              Open 32 PDF Tools →
            </button>
            <button
              onClick={() => onNavigate('qr-code-generator')}
              className="px-6 py-3 rounded-2xl bg-green-800 text-white font-extrabold text-sm hover:bg-green-900 border border-white/20 shadow-md cursor-pointer transition-all hover:scale-105"
            >
              Create QR Code →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
