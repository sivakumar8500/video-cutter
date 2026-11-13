import React, { useState, useEffect } from 'react';
import {
  Film,
  Image as ImageIcon,
  FileText,
  QrCode,
  ArrowRight,
  Play,
  Pause,
  Scissors,
  RotateCw,
  Music,
} from 'lucide-react';
import type { ActiveTab } from './Header';

interface HomePageProps {
  onNavigate: (tab: ActiveTab) => void;
  filesCount?: number;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  // Video Scrubber Simulation State
  const [isPlayingSim, setIsPlayingSim] = useState(true);
  const [playheadPos, setPlayheadPos] = useState(38);
  const [activeStudioTab, setActiveStudioTab] = useState<'video' | 'media' | 'image' | 'pdf' | 'qr'>('video');

  // Thermodynamic / Precision Temperature Slider State (Oryzo.ai T=0.1, T=1, T=10)
  const [tempMode, setTempMode] = useState<'deterministic' | 'balanced' | 'extreme'>('deterministic');

  // Smart Flip Encryption State (Oryzo.ai #encryption input flip)
  const [isFlipped, setIsFlipped] = useState(false);
  const [encryptInput, setEncryptInput] = useState('LEGAL_CONTRACT_2026.PDF');

  // Friction / Speed Zoom Box State (Oryzo.ai #grip)
  const [frictionAngle, setFrictionAngle] = useState(0);

  // Product Selection Tier State (Oryzo, Oryzo Pro, Oryzo Pro Max)
  const [selectedProductTier, setSelectedProductTier] = useState<0 | 1 | 2>(1);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Playhead scrubber loop
  useEffect(() => {
    if (!isPlayingSim) return;
    const interval = setInterval(() => {
      setPlayheadPos((prev) => (prev >= 96 ? 4 : prev + 1));
    }, 120);
    return () => clearInterval(interval);
  }, [isPlayingSim]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2B140D] selection:bg-[#F59E0B]/30 selection:text-[#2B140D] font-sans overflow-x-hidden pb-24">
      {/* Top Ambient Horizon Glow (Warm Studio Light) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-[#F59E0B]/10 via-[#FAF9F6] to-transparent blur-3xl pointer-events-none z-0" />

      {/* ================= 1. HERO SECTION (#hero) ================= */}
      <section id="hero" className="relative z-10 pt-12 sm:pt-20 pb-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        {/* Top Tagline Row with Logo Reference */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono tracking-widest text-[#6B4E44] border-b border-[#E8E2D9] pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
            <span className="uppercase font-bold text-[#2B140D]">Made for creators. Built for hardware.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#6B4E44]">
            <span>[ 100% IN-BROWSER ]</span>
            <span>[ 0 BYTES SERVER UPLOAD ]</span>
            <span>[ FFmpeg WASM ]</span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#2B140D] leading-[1.05]">
              Designed to slice, crop, <br className="hidden sm:inline" />
              insulate &amp; generate in all <br className="hidden sm:inline" />
              the <span className="text-[#D97706] italic font-serif">right ways.</span>
            </h1>
            <p className="text-base sm:text-lg text-[#6B4E44] max-w-2xl leading-relaxed font-normal">
              VidCuts makes the simplest media task feel considered. 4K lossless video cutting, shape-masked image avatars, 32 client-side PDF tools, and precision vector QR codes running entirely in your browser memory.
            </p>
          </div>

          {/* Hero Editorial Column */}
          <div className="lg:col-span-4 space-y-4 lg:pl-6 lg:border-l border-[#E8E2D9]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D97706] font-bold block">
                CREATIVE STUDIO
              </span>
              <h4 className="text-sm font-bold text-[#2B140D] leading-snug">
                Engineered by Reeyansh Tech Solutions, the high-performance media lab.
              </h4>
            </div>
            <div className="o-dashline my-2" />
            <p className="text-xs text-[#6B4E44] leading-relaxed font-mono">
              The world&apos;s most unnecessarily sophisticated in-browser media suite.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <a
                href="#video-cutter"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('video-cutter');
                }}
                className="w-full py-2.5 rounded-full bg-[#2B140D] hover:bg-[#3D1E14] text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                title="Launch Video Cutter &amp; Splitter Tool"
              >
                <span>Open Video Cutter</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]" />
              </a>
            </div>
          </div>
        </div>

        {/* ================= HERO VIDEO / INTERACTIVE VIEWPORT (#hero-video-wrapper) ================= */}
        <div className="relative rounded-3xl overflow-hidden bg-white glow-oryzo-video border border-[#E8E2D9] p-4 sm:p-8 space-y-6 shadow-sm">
          {/* Studio Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E2D9] pb-4">
            <div className="flex items-center gap-2">
              {[
                { id: 'video' as const, label: 'Video Slicer', icon: Film },
                { id: 'media' as const, label: 'Media & Audio Tools', icon: Music },
                { id: 'image' as const, label: 'Image Studio', icon: ImageIcon },
                { id: 'pdf' as const, label: '32 PDF Tools', icon: FileText },
                { id: 'qr' as const, label: 'QR Vector Matrix', icon: QrCode },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeStudioTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveStudioTab(tab.id)}
                    className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#2B140D] text-white font-bold shadow-xs'
                        : 'bg-[#FAF9F6] text-[#5C3D32] hover:text-[#2B140D] hover:bg-[#F5EFE6] border border-[#E8E2D9]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlayingSim(!isPlayingSim)}
                className="px-3 py-1.5 rounded-full bg-[#FAF9F6] hover:bg-[#F5EFE6] text-[#2B140D] text-xs font-mono border border-[#E8E2D9] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isPlayingSim ? <Pause className="w-3 h-3 text-[#D97706]" /> : <Play className="w-3 h-3 text-[#D97706]" />}
                <span>{isPlayingSim ? 'PAUSE SCRUB' : 'PLAY SCRUB'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Live Canvas Stage */}
          <div className="relative aspect-video max-h-[460px] w-full rounded-2xl overflow-hidden bg-black border border-[#ffedd6]/10 flex items-center justify-center shadow-inner">
            {/* Ambient Animated Mesh */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FEF3C7]/40 via-white to-[#FAF9F6] opacity-90" />

            {/* Pulsing Laser Split Points (00:30 and 01:00 WhatsApp / Reels Status cuts) */}
            <div className="absolute inset-y-0 left-[30%] w-0.5 bg-[#F59E0B] shadow-[0_0_12px_#F59E0B] flex flex-col justify-between py-3 items-center z-20 pointer-events-none">
              <span className="text-[9px] font-mono font-bold bg-[#F59E0B] text-black px-1 rounded-xs">CUT 1</span>
              <Scissors className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-[9px] font-mono font-semibold text-[#D97706]">00:30</span>
            </div>

            <div className="absolute inset-y-0 left-[60%] w-0.5 bg-[#F59E0B] shadow-[0_0_12px_#F59E0B] flex flex-col justify-between py-3 items-center z-20 pointer-events-none">
              <span className="text-[9px] font-mono font-bold bg-[#F59E0B] text-black px-1 rounded-xs">CUT 2</span>
              <Scissors className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-[9px] font-mono font-semibold text-[#D97706]">01:00</span>
            </div>

            {/* Dynamic Scrubbing Playhead Line */}
            <div
              className="absolute inset-y-0 w-0.5 bg-[#2B140D] shadow-[0_0_8px_rgba(43,20,13,0.3)] z-20 pointer-events-none"
              style={{ left: `${playheadPos}%` }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-[#2B140D] -ml-1.5 -mt-1 shadow-md border-2 border-white" />
            </div>

            {/* Animated Waveform Visualizer */}
            <div className="absolute inset-x-8 bottom-6 h-16 flex items-end justify-between gap-1 opacity-70 z-10 pointer-events-none">
              {[40, 65, 30, 85, 95, 45, 75, 80, 55, 90, 60, 35, 70, 88, 50, 78, 62, 92, 40, 68, 85, 48, 80, 58, 42, 70, 92, 65, 50].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-[#F59E0B] to-[#FBAE17] rounded-t-xs"
                  style={{
                    height: isPlayingSim ? `${((h + playheadPos) % 85) + 15}%` : `${h}%`,
                    transition: 'height 0.15s ease',
                  }}
                />
              ))}
            </div>

            {/* Center Stage Info Overlay */}
            <div className="relative z-10 text-center space-y-2 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-[#E8E2D9] max-w-md shadow-md">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D97706] font-bold block">
                HARDWARE PLAYHEAD ACTIVE
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#2B140D] uppercase tracking-wide">
                {activeStudioTab === 'video' && 'Lossless 4K Keyframe Slicing'}
                {activeStudioTab === 'media' && 'URL Video Downloader, Audio Extractor & Muter'}
                {activeStudioTab === 'image' && 'Shape Mask & 1:1 Aspect Crop'}
                {activeStudioTab === 'pdf' && '32 PDF Engine with AES-256 Lock'}
                {activeStudioTab === 'qr' && 'Vector QR Matrix with 9-Pos Logo'}
              </h3>
              <p className="text-xs text-[#6B4E44] font-mono">
                Playhead: 00:{playheadPos < 10 ? `0${playheadPos}` : playheadPos} / 01:30 • 60.0 FPS Local
              </p>
              <div className="pt-2">
                <a
                  href={`#${activeStudioTab === 'video' ? 'video-cutter' : activeStudioTab === 'media' ? 'media-tools' : activeStudioTab === 'image' ? 'image-studio' : activeStudioTab === 'pdf' ? 'pdf-studio' : 'qr'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (activeStudioTab === 'video') onNavigate('video-cutter');
                    else if (activeStudioTab === 'media') onNavigate('media-tools');
                    else if (activeStudioTab === 'image') onNavigate('image-studio');
                    else if (activeStudioTab === 'pdf') onNavigate('pdf-studio');
                    else if (activeStudioTab === 'qr') onNavigate('qr');
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#2B140D] hover:bg-[#3D1E14] text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer transition-transform hover:scale-105 shadow-xs"
                  title="Launch selected studio tool"
                >
                  <span>Launch Full Studio →</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. VIDCUTS CORE ARCHITECTURE (#architecture) ================= */}
      <section id="architecture" className="relative py-20 px-4 sm:px-8 max-w-5xl mx-auto border-t border-[#E8E2D9] space-y-12">
        <div className="space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#D97706] font-bold block">
            VIDCUTS-1 ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-6xl font-extrabold text-[#2B140D] leading-tight">
            isn&apos;t just <br />
            a video cutter.
          </h2>
          <div className="text-base sm:text-xl text-[#6B4E44] font-normal max-w-2xl leading-relaxed">
            VidCuts isn&apos;t just a simple trimmer. It&apos;s the result of unprecedented WebAssembly breakthroughs that shift heavy media decoding straight into your browser memory.
          </div>
        </div>

        {/* Instructions & disclaimer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-[#E8E2D9] font-mono text-xs text-[#6B4E44]">
          <div className="flex items-center gap-3">
            <span className="text-lg">👆</span>
            <span>Hover and scrub the playhead live to inspect keyframe cuts</span>
          </div>
          <div className="flex items-center gap-2">
            <span>* Zero cloud compute. 0 bytes uploaded to external servers.</span>
          </div>
        </div>
      </section>

      {/* ================= 3. THERMODYNAMIC & PRECISION STABILITY SLIDER (#features) ================= */}
      <section className="py-20 px-4 sm:px-8 max-w-5xl mx-auto border-t border-[#E8E2D9] space-y-12">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#ff7a00] font-bold block">
              PRECISION GRADING
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#ffedd6]">
              Thermodynamic Stability
            </h3>
            <p className="text-xs sm:text-sm text-[#ffedd6]/70 max-w-xl">
              From heavy 4K 60fps recordings to 100-page scanned bank PDFs - VidCuts stays perfectly stable in RAM.
            </p>
          </div>

          {/* Oryzo.ai Temperature Slider Bar (T=0.1, T=1, T=10) */}
          <div className="p-2 rounded-2xl bg-[#0d0d0d] border border-[#ffedd6]/20 flex items-center gap-2">
            {[
              { id: 'deterministic' as const, label: 'Lossless\nT = 0.1' },
              { id: 'balanced' as const, label: 'Balanced\nT = 1.0' },
              { id: 'extreme' as const, label: '4K Extreme\nT = 10.0' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTempMode(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer text-center leading-tight whitespace-pre-line ${
                  tempMode === t.id
                    ? 'bg-[#ff7a00] text-black font-extrabold shadow-md'
                    : 'text-[#ffedd6]/60 hover:text-[#ffedd6]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mathematical Equations & Schematics (Oryzo.ai Signature Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-[#ffedd6]/15 space-y-4">
            <span className="text-[10px] font-mono text-[#ffedd6]/50 block uppercase tracking-wider">
              Constant lift via geometry
            </span>
            <div className="h-10 flex items-center text-xs font-mono text-[#ff7a00]">
              {'ΔS = ∫ (dQ / T) ≥ 0  [Lossless Stream]'}
            </div>
            <div className="o-dashline my-2" />
            <h4 className="text-sm font-bold text-[#ffedd6]">Lossless Exact-Keyframe Cuts</h4>
            <p className="text-xs text-[#ffedd6]/60 leading-relaxed">
              Never re-encodes untouched frames. Retains 100% original video bitrate and colors.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-[#ffedd6]/15 space-y-4">
            <span className="text-[10px] font-mono text-[#ffedd6]/50 block uppercase tracking-wider">
              Circularity (circle = 1.0)
            </span>
            <div className="h-10 flex items-center text-xs font-mono text-[#ff7a00]">
              {'RoPE: Roundness Optimization & Perimeter Masking'}
            </div>
            <div className="o-dashline my-2" />
            <h4 className="text-sm font-bold text-[#ffedd6]">Now 37.9% More Geometric</h4>
            <p className="text-xs text-[#ffedd6]/60 leading-relaxed">
              Shape masks for Heart, Hexagon, Star, and Circle with transparent PNG export for social avatars.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-[#ffedd6]/15 space-y-4">
            <span className="text-[10px] font-mono text-[#ffedd6]/50 block uppercase tracking-wider">
              THERMAL DIFFUSION MODEL (TDM)
            </span>
            <div className="h-10 flex items-center text-xs font-mono text-[#ff7a00]">
              {'AES-256 GCM ⊕ IndexedDB Local Vault'}
            </div>
            <div className="o-dashline my-2" />
            <h4 className="text-sm font-bold text-[#ffedd6]">Client-Side Password Security</h4>
            <p className="text-xs text-[#ffedd6]/60 leading-relaxed">
              Encrypt and compress sensitive contracts directly in RAM with zero cloud leakage.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 4. SMART FLIP ENCRYPTION (#encryption) ================= */}
      <section className="py-20 px-4 sm:px-8 max-w-4xl mx-auto border-t border-[#E8E2D9] space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#D97706] font-bold block">
            SECURE COMMUNICATIONS SIMPLIFIED
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#2B140D]">
            Smart Flip Encryption
          </h2>
          <p className="text-xs sm:text-sm text-[#6B4E44] max-w-lg mx-auto">
            Write or select a document. Click flip. Instantly encrypt with AES-256 directly in browser RAM - until you flip it back.
          </p>
        </div>

        {/* The Interactive Flip Field */}
        <div className="p-8 rounded-3xl bg-white border border-[#E8E2D9] space-y-6 shadow-xs">
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#6B4E44] block">Target File Stream:</label>
            <input
              type="text"
              value={encryptInput}
              onChange={(e) => setEncryptInput(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm font-mono text-[#2B140D] focus:border-[#F59E0B] outline-none"
            />
          </div>

          {/* Flipped Output Display */}
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-dashed border-[#E8E2D9] font-mono text-xs flex justify-between items-center">
            <span className="text-[#6B4E44]">Status:</span>
            <span className={`font-bold ${isFlipped ? 'text-[#D97706]' : 'text-[#2B140D]'}`}>
              {isFlipped ? '🔒 AES-256 CIPHERTEXT ENCRYPTED' : '📄 PLAINTEXT LOCAL STREAM'}
            </span>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-8 py-3.5 rounded-full bg-[#2B140D] hover:bg-[#3D1E14] text-white font-black text-xs uppercase tracking-wider btn-flipper flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <RotateCw className="w-4 h-4 text-[#F59E0B]" />
              <span>{isFlipped ? 'Decode & Stream Lossless' : 'Encode & Encrypt Message'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= 5. GRIP & ZOOM FRICTION BOX (#grip) ================= */}
      <section className="py-20 px-4 sm:px-8 max-w-4xl mx-auto border-t border-[#E8E2D9] space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#D97706] font-bold block">
            PRECISION GRIP, ZERO DRAMA
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#2B140D]">
            Grip-Locked Anti-Lag Technology
          </h2>
          <p className="text-xs sm:text-sm text-[#6B4E44] max-w-md mx-auto">
            Hardware acceleration so responsive your video timeline locks to your mouse cursor without missing a frame.
          </p>
        </div>

        {/* Interactive Zoom & Friction Box */}
        <div className="p-8 rounded-3xl bg-white border border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xs">
          <div className="space-y-4 max-w-sm">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#6B4E44]">Hardware Speed Coeff (est):</span>
              <div className="text-4xl font-mono font-black text-[#D97706]">0.98</div>
            </div>
            <p className="text-xs text-[#6B4E44] leading-relaxed font-mono">
              WebAssembly multithreading enables concurrent demuxing and frame extraction without GPU memory spikes.
            </p>
          </div>

          {/* Interactive Dial Control */}
          <div className="flex flex-col items-center space-y-3">
            <div
              onClick={() => setFrictionAngle((a) => (a + 45) % 360)}
              className="w-32 h-32 rounded-full border-4 border-dashed border-[#E8E2D9] hover:border-[#F59E0B] flex items-center justify-center cursor-pointer transition-transform duration-300 bg-[#FAF9F6]"
              style={{ transform: `rotate(${frictionAngle}deg)` }}
            >
              <div className="w-4 h-4 rounded-full bg-[#F59E0B]" />
            </div>
            <span className="text-[11px] font-mono text-[#6B4E44]">CLICK DIAL TO RECALIBRATE</span>
          </div>
        </div>
      </section>

      {/* ================= 6. ZERO-CLOUD SUSTAINABILITY (#sustainability) ================= */}
      <section className="py-20 px-4 sm:px-8 max-w-5xl mx-auto border-t border-[#E8E2D9] space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#D97706] font-bold block">
            100% CLIENT HARDWARE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#2B140D]">
            Zero-Cloud Sustainability
          </h2>
          <p className="text-xs sm:text-sm text-[#6B4E44] max-w-md mx-auto">
            No remote cloud compute. No server tokens. Say &ldquo;please&rdquo; and &ldquo;thank you&rdquo; as much as you want, guilt-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
            <h3 className="text-lg font-bold text-[#2B140D]">Average Time to First Slice</h3>
            <p className="text-xs text-[#6B4E44] leading-relaxed font-mono">
              Starts processing in under 0.8 seconds since zero bytes wait in upload queues.
            </p>
            <div className="text-5xl font-mono font-black text-[#2B140D] pt-2">
              0.8<span className="text-lg text-[#D97706]">s</span>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
            <h3 className="text-lg font-bold text-[#2B140D]">Cloud Network Latency</h3>
            <p className="text-xs text-[#6B4E44] leading-relaxed font-mono">
              Because all tools execute in client RAM, network roundtrips are mathematically eliminated.
            </p>
            <div className="text-5xl font-mono font-black text-[#2B140D] pt-2">
              0.0<span className="text-lg text-[#D97706]">ms</span>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
            <h3 className="text-lg font-bold text-[#2B140D]">Server Power Draw in Use</h3>
            <p className="text-xs text-[#6B4E44] leading-relaxed font-mono">
              Zero cloud GPU clusters running 24/7. Your machine does the work efficiently.
            </p>
            <div className="text-5xl font-mono font-black text-[#D97706] pt-2">
              0.00<span className="text-lg text-[#2B140D]">W</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 7. REVIEWS TABLE (#testimonies) ================= */}
      <section className="py-20 px-4 sm:px-8 max-w-5xl mx-auto border-t border-[#E8E2D9] space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#6B4E44] pb-3 border-b border-[#E8E2D9]">
          <span className="text-[#2B140D] font-bold">Rating &amp; Reviews</span>
          <span>Community Reviews [ 364 ]</span>
          <span className="text-[#D97706] font-bold">[ 4.9 / 5 ] ★★★★★</span>
          <span className="text-[#2B140D]">VidCuts in use</span>
        </div>

        <div className="divide-y divide-[#E8E2D9]">
          {[
            {
              quote: '"This is the best video cutter that I\'ve ever used. Slices 4K files in seconds without waiting for cloud queues."',
              author: 'Edan K.',
              role: 'NASA astronaut wannabe',
              rating: '[ 5 / 5 ]',
            },
            {
              quote: '"My 16:9 recordings? Converted to 9:16 Shorts with blurred backdrop padding in one click. No watermarks."',
              author: 'Gol D. Roger',
              role: 'Old-school Pirate & Streamer',
              rating: '[ 4.9 / 5 ]',
            },
            {
              quote: '"We are so cooked. Hollywood is not ready for an in-browser media suite this fast and private."',
              author: 'Jamie R.',
              role: 'AI Influencer & Creator',
              rating: '[ 5 / 5 ]',
            },
            {
              quote: '"I generated tabletop Wi-Fi QR codes with our cafe logo in 10 seconds. Customers just tap and connect."',
              author: 'Priya K.',
              role: 'Cafe Owner & Freelancer',
              rating: '[ 5 / 5 ]',
            },
          ].map((rev, idx) => (
            <div key={idx} className="py-8 flex flex-col sm:flex-row justify-between gap-6 items-start">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-mono text-[#D97706]">{rev.rating}</span>
                <p className="text-lg sm:text-xl font-serif italic text-[#2B140D] leading-relaxed">
                  {rev.quote}
                </p>
                <div className="text-xs font-mono text-[#6B4E44] pt-1">
                  <strong>{rev.author}</strong> — <span>{rev.role}</span>
                </div>
              </div>
              <span className="text-xs font-mono text-[#B45309] shrink-0 bg-[#FEF3C7] px-3 py-1 rounded-full border border-[#FDE68A]">
                Verified Local
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 8. PRODUCT TIERS & COMPARE (#editions) ================= */}
      <section id="editions" className="py-20 px-4 sm:px-8 max-w-5xl mx-auto border-t border-[#E8E2D9] space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#D97706] font-bold block">
            CHOOSE YOUR OWN
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#2B140D]">
            VidCuts Suite Editions
          </h2>
          <div className="flex justify-center gap-3 pt-4">
            {['VidCuts', 'VidCuts Pro', 'VidCuts Studio'].map((tier, idx) => (
              <button
                key={tier}
                onClick={() => setSelectedProductTier(idx as 0 | 1 | 2)}
                className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  selectedProductTier === idx
                    ? 'bg-[#2B140D] text-white font-extrabold shadow-xs'
                    : 'bg-[#FAF9F6] text-[#6B4E44] hover:text-[#2B140D] border border-[#E8E2D9]'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Compare Table */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] shadow-xs overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#E8E2D9] text-[#D97706]">
                <th className="pb-4">Feature Metric</th>
                <th className="pb-4">VidCuts</th>
                <th className="pb-4">VidCuts Pro</th>
                <th className="pb-4">VidCuts Studio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D9] text-[#2B140D]">
              <tr>
                <td className="py-3 font-bold text-[#2B140D]">Processing Mode:</td>
                <td className="py-3">100% In-Browser</td>
                <td className="py-3">100% In-Browser</td>
                <td className="py-3">100% In-Browser</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-[#2B140D]">Cloud Uploads:</td>
                <td className="py-3 text-[#D97706] font-semibold">None (0 MB)</td>
                <td className="py-3 text-[#D97706] font-semibold">None (0 MB)</td>
                <td className="py-3 text-[#D97706] font-semibold">None (0 MB)</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-[#2B140D]">Watermarks:</td>
                <td className="py-3 text-[#D97706] font-semibold">Never</td>
                <td className="py-3 text-[#D97706] font-semibold">Never</td>
                <td className="py-3 text-[#D97706] font-semibold">Never</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-[#2B140D]">Tool Count:</td>
                <td className="py-3">Video Cutter</td>
                <td className="py-3">Video + Image + QR</td>
                <td className="py-3 text-[#D97706] font-bold">All 32 PDF + Full Suite</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-[#2B140D]">Cost / Subscription:</td>
                <td className="py-3 text-[#2B140D] font-bold">$0 Free</td>
                <td className="py-3 text-[#2B140D] font-bold">$0 Free</td>
                <td className="py-3 text-[#2B140D] font-bold">$0 Free Forever</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= 9. BIBTEX ABSTRACT (#technical-paper) ================= */}
      <section id="technical-paper" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto border-t border-[#E8E2D9] space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#D97706] font-bold block">
            OUR SOTA IN-BROWSER ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2B140D]">
            Abstract &amp; Peer Review
          </h2>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] space-y-4 font-mono text-xs text-[#6B4E44] leading-relaxed shadow-xs">
          <p>
            We present <strong>VidCuts-1</strong>, an open-architecture client-side media suite for rendering, lossless cutting, shape masking, and cryptographic PDF protection. VidCuts-1 faithfully reproduces key workstation behaviors with zero cloud dependencies.
          </p>
          <div className="o-dashline my-2" />
          <div className="italic text-[#2B140D]">
            &ldquo;VidCuts-1 is the fastest client-side media tool out there. Trust me bro.&rdquo;
            <span className="block text-[10px] text-[#D97706] mt-1">- Anonymous Creator on Reddit</span>
          </div>
          <div className="o-dashline my-2" />
          <pre className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E2D9] text-[11px] text-[#2B140D] overflow-x-auto">
{`@misc{vidcuts2026,
  title  = {VidCuts-1: High-Performance Client-Side Media Suite},
  author = {Reeyansh Tech Solutions},
  year   = {2026},
  note   = {100% In-Browser Hardware Acceleration. Zero Cloud Uploads.}
}`}
          </pre>
        </div>
      </section>

      {/* ================= 10. REAL FAQ SECTION (#faq) ================= */}
      <section id="faq" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto border-t border-[#E8E2D9] space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#D97706] font-bold block">
            DIRECT ANSWERS
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2B140D]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does VidCuts process videos without uploading them to a remote server?',
              a: 'VidCuts uses WebAssembly (FFmpeg compiled directly into browser code), HTML5 Canvas, and pdf-lib. When you select a video, image, or PDF file, your browser reads the file directly on your local device and performs all processing in local RAM.',
            },
            {
              q: 'Can I split a video into consecutive 30-second clips for WhatsApp Status?',
              a: 'Yes. In the Video Cutter, click "Split by Duration" and enter 30 seconds. VidCuts automatically cuts your video into consecutive 30-second clips with exact keyframe accuracy. You can download all clips in a single ZIP file.',
            },
            {
              q: 'How do I convert horizontal 16:9 videos into vertical 9:16 Shorts with blurred background?',
              a: 'Choose "9:16 Vertical" mode in the Video Cutter. VidCuts centers your original video and fills the top and bottom letterbox bars with a dynamically blurred reflection of the video itself.',
            },
            {
              q: 'Can I crop an image into a circle, heart, or hexagon for social profile avatars?',
              a: 'Yes. In Image Studio, open the Shape Mask tool and pick Circle, Heart, Star, Hexagon, or Diamond. You can adjust border padding and export a clean transparent PNG ready for social media avatars.',
            },
            {
              q: 'How can I compress a large 50MB PDF under 1MB for portal uploads?',
              a: 'Open PDF Tools and choose "Compress PDF". VidCuts strips redundant internal metadata, downsamples oversized scanned images, and optimizes font tables locally, shrinking file size by up to 97%.',
            },
            {
              q: 'Can I place my business logo inside a QR code and position it?',
              a: 'Yes. In QR Code Studio, open the "Logo" subtab. You can drag and drop your local logo file and use the 9-position alignment grid to place it in the center or corners, and fine-tune its position with horizontal and vertical shift sliders.',
            },
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-[#E8E2D9] rounded-2xl overflow-hidden bg-white transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF9F6]"
                >
                  <span className="text-xs sm:text-sm font-bold text-[#2B140D]">
                    {item.q}
                  </span>
                  <span className="text-[#D97706] font-bold text-sm shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#6B4E44] leading-relaxed border-t border-[#E8E2D9] pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= 11. FOOTER & SCROLL INDICATOR ================= */}
      <footer className="py-20 px-4 sm:px-8 border-t border-[#E8E2D9] text-center space-y-8">
        {/* Spinning Dotted Circle Indicator */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative w-12 h-12 rounded-full border-2 border-dashed border-[#F59E0B] animate-spin-slow flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#2B140D]" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B4E44]">
            SCROLL TO EXPLORE
          </span>
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <h3 className="text-2xl font-extrabold text-[#2B140D]">
            Start Creating with VidCuts
          </h3>
          <p className="text-xs text-[#6B4E44] font-mono">
            Zero cloud uploads. Zero software installs. 100% free forever.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="#video-cutter"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('video-cutter');
            }}
            className="px-6 py-2.5 rounded-full bg-[#2B140D] hover:bg-[#3D1E14] text-white font-black text-xs uppercase tracking-wider cursor-pointer transition-transform hover:scale-105 shadow-sm inline-flex items-center"
            title="Launch Video Cutter &amp; Splitter Tool"
          >
            Launch Video Cutter
          </a>
          <a
            href="#image-studio"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('image-studio');
            }}
            className="px-6 py-2.5 rounded-full bg-[#FAF9F6] hover:bg-[#F5EFE6] text-[#2B140D] font-bold text-xs uppercase tracking-wider border border-[#E8E2D9] cursor-pointer inline-flex items-center shadow-xs"
            title="Launch Image Studio"
          >
            Image Studio
          </a>
          <a
            href="#pdf-studio"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('pdf-studio');
            }}
            className="px-6 py-2.5 rounded-full bg-[#FAF9F6] hover:bg-[#F5EFE6] text-[#2B140D] font-bold text-xs uppercase tracking-wider border border-[#E8E2D9] cursor-pointer inline-flex items-center shadow-xs"
            title="Launch 32 Client-Side PDF Tools"
          >
            32 PDF Tools
          </a>
          <a
            href="#qr"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('qr');
            }}
            className="px-6 py-2.5 rounded-full bg-[#FAF9F6] hover:bg-[#F5EFE6] text-[#2B140D] font-bold text-xs uppercase tracking-wider border border-[#E8E2D9] cursor-pointer inline-flex items-center shadow-xs"
            title="Launch Vector QR Code Studio"
          >
            QR Studio
          </a>
        </div>

        <div className="pt-8 text-xs font-mono text-[#6B4E44] flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl mx-auto border-t border-[#E8E2D9]">
          <span>© 2026 VidCuts by Reeyansh Tech Solutions</span>
          <span>HIGH-PERFORMANCE IN-BROWSER MEDIA LAB</span>
        </div>
      </footer>
    </div>
  );
};
