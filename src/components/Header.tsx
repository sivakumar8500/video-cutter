import React from 'react';
import { ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

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
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500/30 via-slate-800 to-indigo-500/20 p-0.5 shadow-lg shadow-orange-500/10 border border-orange-500/30">
            <img
              src="./reeyansh-logo.png"
              alt="Reeyansh Tech Solutions Logo"
              className="w-7 h-7 object-contain drop-shadow-md"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                SplitStream
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/25 tracking-wide">
                Reeyansh Tech Solutions
              </span>
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
