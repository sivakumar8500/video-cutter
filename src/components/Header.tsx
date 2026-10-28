import React from 'react';
import { ShieldCheck, Sparkles, RefreshCw, ExternalLink } from 'lucide-react';

interface HeaderProps {
  hasVideo: boolean;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ hasVideo, onReset }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative group flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-orange-500/20 p-0.5 shadow-lg shadow-cyan-500/10 border border-cyan-500/30">
            <img
              src="./app-icon.png"
              alt="SplitStream App Icon"
              className="w-full h-full object-cover rounded-[10px] shadow-sm transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                SplitStream
              </span>
              <a
                href="https://www.reeyanshtech.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 border border-orange-500/25 hover:border-orange-500/40 transition-all cursor-pointer group"
                title="Visit Reeyansh Tech Solutions Official Website"
              >
                <img
                  src="./reeyansh-logo.png"
                  alt="Reeyansh"
                  className="w-3.5 h-3.5 object-contain group-hover:scale-110 transition-transform"
                />
                <span className="text-[10px] font-bold tracking-wide">
                  Reeyansh Tech Solutions
                </span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Client-Side High Precision Video Cutter & 9:16 Shorts Engine
            </p>
          </div>
        </div>

        {/* Status Badges & Controls */}
        <div className="flex items-center gap-3">
          {/* Privacy Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Private • In-Browser FFmpeg</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Stream Copy & Lossless</span>
          </div>

          {hasVideo && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all duration-150 cursor-pointer"
              title="Reset and start over"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
