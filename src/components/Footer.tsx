import React from 'react';
import { ShieldCheck, Zap, Scissors, Smartphone, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl mt-16 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Brand & Logo */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-slate-900 to-indigo-500/20 p-1 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                <img
                  src="./app-icon.png"
                  alt="SplitStream App Icon"
                  className="w-10 h-10 object-cover rounded-xl drop-shadow"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>SplitStream</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    v2.0
                  </span>
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span>A product of</span>
                  <img
                    src="./reeyansh-logo.png"
                    alt="Reeyansh"
                    className="w-3.5 h-3.5 object-contain"
                  />
                  <strong className="text-slate-300">Reeyansh Tech Solutions</strong>
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg">
              SplitStream is engineered by <strong className="text-slate-200">Reeyansh Tech Solutions</strong> to give content creators, video editors, and social media managers total control over their video slicing without sacrificing privacy or uploading large media files to third-party servers.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% In-Browser Privacy
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Lossless Stream Copy
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" /> 9:16 Shorts & Reels
              </span>
            </div>
          </div>

          {/* Quick Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Core Capabilities
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Scissors className="w-3.5 h-3.5 text-orange-400" />
                <span>Split by Piece Count (Equal Slices)</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                <span>Split by Clip Duration (Fixed Sec/Min)</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>Cut Exact Minute-to-Minute Ranges</span>
              </li>
              <li className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                <span>16:9 to 9:16 Vertical Converter</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                <span>Top & Bottom Promotional Cards</span>
              </li>
            </ul>
          </div>

          {/* Technology & Privacy */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Technology Stack
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>WebAssembly (WASM) Video Engine</li>
              <li>Single-threaded FFmpeg Core 0.12</li>
              <li>React 19 + TypeScript 7</li>
              <li>Tailwind CSS v4 Engine</li>
              <li>Direct Folder Export (File System API)</li>
              <li>Client-Side JSZip Archiver</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <img
              src="./reeyansh-logo.png"
              alt="Reeyansh Tech Solutions"
              className="w-5 h-5 object-contain"
            />
            <span>
              &copy; {new Date().getFullYear()} <strong className="text-white font-medium">Reeyansh Tech Solutions</strong>. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>by</span>
            <span className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">
              Reeyansh Tech Solutions
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
