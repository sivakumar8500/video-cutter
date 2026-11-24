import React from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Scissors,
  Music,
  Image as ImageIcon,
  FileText,
  QrCode,
  FolderDown,
} from 'lucide-react';
import type { ActiveTab } from './Header';

interface StudioPageHeaderProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  badge: string;
  title: string;
  subtitle: string;
}

const STUDIO_TABS: {
  id: ActiveTab;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'video-cutter', label: 'Free Online Video Cutter', badge: '4K', icon: Scissors },
  { id: 'media-tools', label: 'Online Media Conversion Tools', badge: 'Audio', icon: Music },
  { id: 'image-tools', label: 'Free Online Image Editor', badge: 'Shapes', icon: ImageIcon },
  { id: 'pdf-tools', label: '32 Free Online PDF Tools', badge: '32', icon: FileText },
  { id: 'qr-code-generator', label: 'Free QR Code Generator', badge: 'Vector', icon: QrCode },
  { id: 'file-tools', label: 'File Tools', icon: FolderDown },
];

const isTabActive = (tabId: ActiveTab, currentTab: ActiveTab) => {
  if (tabId === currentTab) return true;
  if (tabId === 'image-tools' && currentTab === 'image-studio') return true;
  if (tabId === 'image-studio' && currentTab === 'image-tools') return true;
  if (tabId === 'pdf-tools' && currentTab === 'pdf-studio') return true;
  if (tabId === 'pdf-studio' && currentTab === 'pdf-tools') return true;
  if (tabId === 'qr-code-generator' && currentTab === 'qr') return true;
  if (tabId === 'qr' && currentTab === 'qr-code-generator') return true;
  if (tabId === 'file-tools' && currentTab === 'files') return true;
  if (tabId === 'files' && currentTab === 'file-tools') return true;
  return false;
};

export const StudioPageHeader: React.FC<StudioPageHeaderProps> = ({
  activeTab,
  onNavigate,
  badge,
  title,
  subtitle,
}) => {
  return (
    <div className="w-full space-y-4 mb-8">
      {/* Top Breadcrumb Row */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition-colors shadow-2xs cursor-pointer font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">Studio Tools</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-900">{title}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% In-Browser Privacy</span>
        </div>
      </nav>

      {/* Hero Header Card */}
      <header className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {badge}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Studio Switcher Pill Tabs Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          {STUDIO_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = isTabActive(tab.id, activeTab);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onNavigate(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>
    </div>
  );
};
