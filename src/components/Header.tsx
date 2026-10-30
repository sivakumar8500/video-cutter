import React from 'react';
import {
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export type ActiveTab = 'home' | 'video-cutter' | 'image-studio' | 'pdf-studio' | 'qr' | 'files';

interface HeaderProps {
  hasVideo: boolean;
  onReset: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasVideo,
  onReset,
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#ffedd6]/15 bg-black/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onTabChange('home')}
              className="relative group flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#ff7a00]/30 via-slate-900 to-[#ffedd6]/10 p-0.5 shadow-lg shadow-[#ff7a00]/10 border border-[#ff7a00]/30 shrink-0 cursor-pointer"
            >
              <img
                src="./app-icon.png"
                alt="SplitStream App Icon"
                className="w-full h-full object-cover rounded-[10px] shadow-sm transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  onClick={() => onTabChange('home')}
                  className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent cursor-pointer hover:opacity-90 transition-opacity"
                >
                  SplitStream
                </span>
                <a
                  href="https://www.reeyanshtech.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 border border-orange-500/25 hover:border-orange-500/40 transition-all cursor-pointer group"
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
              <p className="text-[11px] text-slate-400 hidden md:block">
                100% In-Browser Video, Image, PDF & QR Suite
              </p>
            </div>
          </div>

          {/* Sub-Navigation Tabs Menu (Clean text-only navigation, no icons) */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onTabChange('home')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#ffedd6] text-black font-extrabold shadow-sm'
                  : 'text-[#ffedd6]/70 hover:text-[#ffedd6] hover:bg-white/5'
              }`}
            >
              <span>Home</span>
            </button>

            <button
              onClick={() => onTabChange('video-cutter')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === 'video-cutter'
                  ? 'bg-[#ffedd6] text-black font-extrabold shadow-sm'
                  : 'text-[#ffedd6]/70 hover:text-[#ffedd6] hover:bg-white/5'
              }`}
            >
              <span className="hidden sm:inline">Video Cutter</span>
              <span className="sm:hidden">Video</span>
            </button>

            <button
              onClick={() => onTabChange('image-studio')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === 'image-studio'
                  ? 'bg-[#ffedd6] text-black font-extrabold shadow-sm'
                  : 'text-[#ffedd6]/70 hover:text-[#ffedd6] hover:bg-white/5'
              }`}
            >
              <span className="hidden sm:inline">Image Studio</span>
              <span className="sm:hidden">Image</span>
            </button>

            <button
              onClick={() => onTabChange('pdf-studio')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === 'pdf-studio'
                  ? 'bg-[#ffedd6] text-black font-extrabold shadow-sm'
                  : 'text-[#ffedd6]/70 hover:text-[#ffedd6] hover:bg-white/5'
              }`}
            >
              <span>PDF Tools</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#ff7a00]/20 text-[#ffedd6] border border-[#ff7a00]/30">
                32
              </span>
            </button>

            <button
              onClick={() => onTabChange('qr')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-[#ffedd6] text-black font-extrabold shadow-sm'
                  : 'text-[#ffedd6]/70 hover:text-[#ffedd6] hover:bg-white/5'
              }`}
            >
              <span>QR Code</span>
            </button>
          </nav>

          {/* Right Status Badges & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff7a00]/10 border border-[#ff7a00]/25 text-[#ff7a00] text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Private</span>
            </div>

            {hasVideo && activeTab === 'video-cutter' && (
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all duration-150 cursor-pointer"
                title="Reset video task"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Video</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
