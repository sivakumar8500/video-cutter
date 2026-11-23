import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Menu,
  X,
  Home,
  Scissors,
  Music,
  Image as ImageIcon,
  FileText,
  QrCode,
  FolderDown,
  ChevronRight,
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  const navItems = [
    {
      id: 'home' as ActiveTab,
      label: 'Home Overview',
      desc: 'Suite overview & feature highlights',
      icon: Home,
      badge: 'Home',
    },
    {
      id: 'video-cutter' as ActiveTab,
      label: 'Video Cutter',
      desc: 'Lossless 4K & 9:16 Shorts converter',
      icon: Scissors,
      badge: 'FFmpeg',
    },
    {
      id: 'media-tools' as ActiveTab,
      label: 'Media Tools',
      desc: 'URL Downloader & Audio Extractor',
      icon: Music,
      badge: 'MP3/AAC',
    },
    {
      id: 'image-studio' as ActiveTab,
      label: 'Image Studio',
      desc: 'Aspect crop & 9 geometric shapes',
      icon: ImageIcon,
      badge: 'Shapes',
    },
    {
      id: 'pdf-studio' as ActiveTab,
      label: '32 PDF Tools',
      desc: 'Merge, split, protect & convert PDFs',
      icon: FileText,
      badge: '32 In 1',
    },
    {
      id: 'qr' as ActiveTab,
      label: 'QR Code Studio',
      desc: 'Custom vector matrix & laser scanner',
      icon: QrCode,
      badge: 'Vector',
    },
    {
      id: 'files' as ActiveTab,
      label: 'Files & Exports',
      desc: 'Local browser media & clip manager',
      icon: FolderDown,
      badge: 'Manager',
    },
  ];

  const handleNavigate = (tab: ActiveTab) => {
    setIsDrawerOpen(false);
    onTabChange(tab);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-xs">
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
                className="relative group flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-1 shadow-sm border border-slate-200 shrink-0 cursor-pointer"
                title="VidCuts - In-Browser Media Suite Home"
                aria-label="VidCuts Home"
              >
                <img
                  src="./app-icon.png"
                  alt="VidCuts App Icon"
                  width={44}
                  height={44}
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
                    className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer"
                    title="VidCuts Home"
                  >
                    VidCuts
                  </a>
                  <a
                    href="https://www.reeyanshtech.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all cursor-pointer group"
                    title="Visit Reeyansh Tech Solutions Official Website"
                  >
                    <img
                      src="./reeyansh-logo.png"
                      alt="Reeyansh Tech Solutions Logo"
                      width={14}
                      height={14}
                      className="w-3.5 h-3.5 object-contain group-hover:scale-110 transition-transform"
                    />
                    <span className="text-[10px] font-bold tracking-wide">
                      Reeyansh Tech Solutions
                    </span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-600 hidden md:block">
                  100% In-Browser Video, Image, PDF &amp; QR Suite
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs Menu (Hidden on mobile screens < md) */}
            <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 sm:gap-1.5 lg:gap-2">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  onTabChange('home');
                }}
                aria-current={activeTab === 'home' ? 'page' : undefined}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer inline-flex items-center ${
                  activeTab === 'home'
                    ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer inline-flex items-center ${
                  activeTab === 'video-cutter'
                    ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Video Cutter &amp; Splitter Tool"
              >
                <span>Video Cutter</span>
              </a>

              <a
                href="#media-tools"
                onClick={(e) => {
                  e.preventDefault();
                  onTabChange('media-tools');
                }}
                aria-current={activeTab === 'media-tools' ? 'page' : undefined}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer inline-flex items-center ${
                  activeTab === 'media-tools'
                    ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Media Tools - URL Downloader, Audio Extractor &amp; Remover"
              >
                <span>Media Tools</span>
              </a>

              <a
                href="#image-studio"
                onClick={(e) => {
                  e.preventDefault();
                  onTabChange('image-studio');
                }}
                aria-current={activeTab === 'image-studio' ? 'page' : undefined}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer inline-flex items-center ${
                  activeTab === 'image-studio'
                    ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Image Studio - Aspect Crop &amp; Shape Mask Editor"
              >
                <span>Image Studio</span>
              </a>

              <a
                href="#pdf-studio"
                onClick={(e) => {
                  e.preventDefault();
                  onTabChange('pdf-studio');
                }}
                aria-current={activeTab === 'pdf-studio' ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'pdf-studio'
                    ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="32 Client-Side PDF Tools Suite"
              >
                <span>PDF Tools</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'pdf-studio' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer inline-flex items-center ${
                  activeTab === 'qr'
                    ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Custom Vector QR Code Studio &amp; Scanner"
              >
                <span>QR Code</span>
              </a>
            </nav>

            {/* Right Status Badges & Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Private</span>
              </div>

              {hasVideo && activeTab === 'video-cutter' && (
                <button
                  type="button"
                  onClick={onReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 bg-white border border-slate-200 rounded-xl transition-all duration-150 cursor-pointer shadow-xs"
                  title="Reset video task"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">New Video</span>
                </button>
              )}

              {/* Mobile Drawer Toggle Hamburger Button (Visible only on < md) */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                aria-label="Open navigation menu"
                aria-expanded={isDrawerOpen}
              >
                <Menu className="w-5 h-5 text-slate-800" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE SIDE DRAWER (Accessible, Smooth Slide-in from Right) */}
      {/* ========================================================================= */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          isDrawerOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
        aria-hidden={!isDrawerOpen}
      >
        {/* Backdrop Overlay */}
        <div
          onClick={() => setIsDrawerOpen(false)}
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
            isDrawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />

        {/* Slide-out Drawer Panel */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className={`fixed top-0 right-0 bottom-0 w-[84%] max-w-sm bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <img
                src="./app-icon.png"
                alt="VidCuts App Icon"
                width={38}
                height={38}
                className="w-9 h-9 object-contain rounded-xl border border-slate-200 p-1 bg-white shadow-2xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-slate-900">VidCuts</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                    v2.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">Client-Side Media &amp; PDF Suite</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Navigation List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-600 px-3 py-1 font-bold">
              Studio Tools &amp; Workspaces
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigate(item.id);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-bold ${isActive ? 'text-emerald-950 font-extrabold' : 'text-slate-900'}`}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                              isActive
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200/70 text-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-emerald-600 translate-x-0.5' : 'text-slate-400'
                    }`}
                  />
                </a>
              );
            })}
          </div>

          {/* Drawer Footer with Company Attribution & Privacy */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-[11px] leading-tight">
                100% Client-Side In-Browser • 0 Bytes Uploaded
              </span>
            </div>

            <a
              href="https://www.reeyanshtech.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs hover:border-emerald-300 transition-colors cursor-pointer group"
              title="Visit Reeyansh Tech Solutions Official Website"
            >
              <div className="flex items-center gap-2">
                <img
                  src="./reeyansh-logo.png"
                  alt="Reeyansh Tech Solutions Logo"
                  width={18}
                  height={18}
                  className="w-4.5 h-4.5 object-contain"
                />
                <span className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700">
                  Reeyansh Tech Solutions
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </a>
          </div>
        </aside>
      </div>
    </>
  );
};
