import React from 'react';
import {
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export type ActiveTab = 'home' | 'video-cutter' | 'media-tools' | 'image-studio' | 'pdf-studio' | 'qr' | 'files';

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
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E2D9] bg-white/95 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('home');
              }}
              className="relative group flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-1 shadow-sm border border-[#E8E2D9] shrink-0 cursor-pointer"
              title="VidCuts - In-Browser Media Suite Home"
              aria-label="VidCuts Home"
            >
              <img
                src="./app-icon.png"
                alt="VidCuts App Icon"
                className="w-full h-full object-contain rounded-lg transition-transform duration-200 group-hover:scale-105"
              />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <a
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault();
                    onTabChange('home');
                  }}
                  className="font-extrabold text-base sm:text-lg tracking-tight text-[#2B140D] hover:text-[#5B2E1E] transition-colors cursor-pointer"
                  title="VidCuts Home"
                >
                  VidCuts
                </a>
                <a
                  href="https://www.reeyanshtech.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#B45309] border border-[#FDE68A] transition-all cursor-pointer group"
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
              <p className="text-[11px] text-[#6B4E44] hidden md:block">
                100% In-Browser Video, Image, PDF &amp; QR Suite
              </p>
            </div>
          </div>

          {/* Sub-Navigation Tabs Menu (Crawlable SEO link-based navigation) */}
          <nav aria-label="Main Navigation" className="flex items-center gap-1 sm:gap-2">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('home');
              }}
              aria-current={activeTab === 'home' ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer inline-flex items-center ${
                activeTab === 'home'
                  ? 'bg-[#2B140D] text-white font-extrabold shadow-sm'
                  : 'text-[#5C3D32] hover:text-[#2B140D] hover:bg-[#F5EFE6]'
              }`}
              title="VidCuts Home Overview"
            >
              <span>Home</span>
            </a>

            <a
              href="#video-cutter"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('video-cutter');
              }}
              aria-current={activeTab === 'video-cutter' ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer inline-flex items-center ${
                activeTab === 'video-cutter'
                  ? 'bg-[#2B140D] text-white font-extrabold shadow-sm'
                  : 'text-[#5C3D32] hover:text-[#2B140D] hover:bg-[#F5EFE6]'
              }`}
              title="Video Cutter &amp; Splitter Tool"
            >
              <span className="hidden sm:inline">Video Cutter</span>
              <span className="sm:hidden">Video</span>
            </a>

            <a
              href="#media-tools"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('media-tools');
              }}
              aria-current={activeTab === 'media-tools' ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer inline-flex items-center ${
                activeTab === 'media-tools'
                  ? 'bg-[#2B140D] text-white font-extrabold shadow-sm'
                  : 'text-[#5C3D32] hover:text-[#2B140D] hover:bg-[#F5EFE6]'
              }`}
              title="Media Tools - URL Downloader, Audio Extractor &amp; Remover"
            >
              <span className="hidden sm:inline">Media Tools</span>
              <span className="sm:hidden">Tools</span>
            </a>

            <a
              href="#image-studio"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('image-studio');
              }}
              aria-current={activeTab === 'image-studio' ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer inline-flex items-center ${
                activeTab === 'image-studio'
                  ? 'bg-[#2B140D] text-white font-extrabold shadow-sm'
                  : 'text-[#5C3D32] hover:text-[#2B140D] hover:bg-[#F5EFE6]'
              }`}
              title="Image Studio - Aspect Crop &amp; Shape Mask Editor"
            >
              <span className="hidden sm:inline">Image Studio</span>
              <span className="sm:hidden">Image</span>
            </a>

            <a
              href="#pdf-studio"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('pdf-studio');
              }}
              aria-current={activeTab === 'pdf-studio' ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === 'pdf-studio'
                  ? 'bg-[#2B140D] text-white font-extrabold shadow-sm'
                  : 'text-[#5C3D32] hover:text-[#2B140D] hover:bg-[#F5EFE6]'
              }`}
              title="32 Client-Side PDF Tools Suite"
            >
              <span>PDF Tools</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                32
              </span>
            </a>

            <a
              href="#qr"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('qr');
              }}
              aria-current={activeTab === 'qr' ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer inline-flex items-center ${
                activeTab === 'qr'
                  ? 'bg-[#2B140D] text-white font-extrabold shadow-sm'
                  : 'text-[#5C3D32] hover:text-[#2B140D] hover:bg-[#F5EFE6]'
              }`}
              title="Custom Vector QR Code Studio &amp; Scanner"
            >
              <span>QR Code</span>
            </a>
          </nav>

          {/* Right Status Badges & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] text-xs font-mono font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>100% Private</span>
            </div>

            {hasVideo && activeTab === 'video-cutter' && (
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2B140D] hover:bg-[#F5EFE6] bg-white border border-[#E8E2D9] rounded-lg transition-all duration-150 cursor-pointer shadow-xs"
                title="Reset video task"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="hidden sm:inline">New Video</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
