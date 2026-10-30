import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Files,
  Split,
  Trash2,
  Share2,
  Camera,
  LayoutGrid,
  RotateCw,
  Crop,
  Hash,
  Minimize2,
  Wrench,
  ScanText,
  FileText,
  Presentation,
  Sheet,
  FileType,
  FileSpreadsheet,
  Image as ImageIcon,
  Images,
  Code,
  Archive,
  FileCode2,
  PenTool,
  Stamp,
  EyeOff,
  FileCheck2,
  LockOpen,
  ShieldCheck,
  Globe,
  GitCompare,
  Workflow,
  ArrowRight,
} from 'lucide-react';
import { PDF_CATEGORIES, PDF_TOOLS } from '../../utils/pdfCatalog';
import { PdfToolWorkspace } from './PdfToolWorkspace';
import type { PdfCategory, PdfToolId } from '../../types/pdfStudio';

// Helper icon mapper
function renderToolIcon(iconName: string, className = 'w-6 h-6') {
  switch (iconName) {
    case 'Files':
      return <Files className={className} />;
    case 'Split':
      return <Split className={className} />;
    case 'Trash2':
      return <Trash2 className={className} />;
    case 'Share2':
      return <Share2 className={className} />;
    case 'LayoutGrid':
      return <LayoutGrid className={className} />;
    case 'Camera':
      return <Camera className={className} />;
    case 'RotateCw':
      return <RotateCw className={className} />;
    case 'Crop':
      return <Crop className={className} />;
    case 'Hash':
      return <Hash className={className} />;
    case 'Minimize2':
      return <Minimize2 className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'ScanText':
      return <ScanText className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'Presentation':
      return <Presentation className={className} />;
    case 'Sheet':
      return <Sheet className={className} />;
    case 'FileType':
      return <FileType className={className} />;
    case 'FileSpreadsheet':
      return <FileSpreadsheet className={className} />;
    case 'Image':
      return <ImageIcon className={className} />;
    case 'Images':
      return <Images className={className} />;
    case 'Code':
      return <Code className={className} />;
    case 'Archive':
      return <Archive className={className} />;
    case 'FileCode2':
      return <FileCode2 className={className} />;
    case 'PenTool':
    case 'Signature':
      return <PenTool className={className} />;
    case 'Stamp':
      return <Stamp className={className} />;
    case 'EyeOff':
      return <EyeOff className={className} />;
    case 'FileCheck2':
      return <FileCheck2 className={className} />;
    case 'LockOpen':
      return <LockOpen className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'GitCompare':
      return <GitCompare className={className} />;
    case 'Workflow':
      return <Workflow className={className} />;
    default:
      return <FileText className={className} />;
  }
}

// 6-Column Mega Menu directory matching the screenshot
const SCREENSHOT_COLUMNS: {
  title: string;
  category: PdfCategory;
  tools: {
    id: PdfToolId;
    name: string;
    iconName: string;
    iconColor: string;
    isHighlighted?: boolean;
  }[];
}[] = [
  {
    title: 'ORGANIZE PDF',
    category: 'organize',
    tools: [
      { id: 'merge', name: 'Merge PDF', iconName: 'Files', iconColor: 'text-rose-500' },
      { id: 'split', name: 'Split PDF', iconName: 'Split', iconColor: 'text-rose-500' },
      { id: 'remove-pages', name: 'Remove pages', iconName: 'Trash2', iconColor: 'text-rose-500' },
      { id: 'extract-pages', name: 'Extract pages', iconName: 'Share2', iconColor: 'text-rose-500' },
      { id: 'organize', name: 'Organize PDF', iconName: 'LayoutGrid', iconColor: 'text-rose-500' },
      { id: 'scan-to-pdf', name: 'Scan to PDF', iconName: 'Camera', iconColor: 'text-rose-500' },
    ],
  },
  {
    title: 'OPTIMIZE PDF',
    category: 'optimize',
    tools: [
      { id: 'compress', name: 'Compress PDF', iconName: 'Minimize2', iconColor: 'text-emerald-500', isHighlighted: true },
      { id: 'repair', name: 'Repair PDF', iconName: 'Wrench', iconColor: 'text-emerald-500' },
      { id: 'ocr', name: 'OCR PDF', iconName: 'ScanText', iconColor: 'text-emerald-500' },
    ],
  },
  {
    title: 'CONVERT TO PDF',
    category: 'convert-to-pdf',
    tools: [
      { id: 'jpg-to-pdf', name: 'JPG to PDF', iconName: 'Images', iconColor: 'text-amber-500' },
      { id: 'word-to-pdf', name: 'WORD to PDF', iconName: 'FileType', iconColor: 'text-blue-500' },
      { id: 'powerpoint-to-pdf', name: 'POWERPOINT to PDF', iconName: 'Presentation', iconColor: 'text-orange-500' },
      { id: 'excel-to-pdf', name: 'EXCEL to PDF', iconName: 'FileSpreadsheet', iconColor: 'text-emerald-500' },
      { id: 'html-to-pdf', name: 'HTML to PDF', iconName: 'Code', iconColor: 'text-yellow-500' },
    ],
  },
  {
    title: 'CONVERT FROM PDF',
    category: 'convert-from-pdf',
    tools: [
      { id: 'pdf-to-jpg', name: 'PDF to JPG', iconName: 'Image', iconColor: 'text-amber-500' },
      { id: 'pdf-to-word', name: 'PDF to WORD', iconName: 'FileText', iconColor: 'text-blue-500' },
      { id: 'pdf-to-powerpoint', name: 'PDF to POWERPOINT', iconName: 'Presentation', iconColor: 'text-orange-500' },
      { id: 'pdf-to-excel', name: 'PDF to EXCEL', iconName: 'Sheet', iconColor: 'text-emerald-500' },
      { id: 'pdf-to-pdfa', name: 'PDF to PDF/A', iconName: 'Archive', iconColor: 'text-blue-600' },
    ],
  },
  {
    title: 'EDIT PDF',
    category: 'edit',
    tools: [
      { id: 'rotate', name: 'Rotate PDF', iconName: 'RotateCw', iconColor: 'text-purple-500' },
      { id: 'page-numbers', name: 'Add page numbers', iconName: 'Hash', iconColor: 'text-purple-500' },
      { id: 'watermark', name: 'Add watermark', iconName: 'Stamp', iconColor: 'text-purple-500' },
      { id: 'crop', name: 'Crop PDF', iconName: 'Crop', iconColor: 'text-purple-500' },
      { id: 'edit-pdf', name: 'Edit PDF', iconName: 'PenTool', iconColor: 'text-purple-500', isHighlighted: true },
      { id: 'pdf-forms', name: 'PDF Forms', iconName: 'FileCheck2', iconColor: 'text-purple-500' },
    ],
  },
  {
    title: 'PDF SECURITY',
    category: 'security',
    tools: [
      { id: 'unlock', name: 'Unlock PDF', iconName: 'LockOpen', iconColor: 'text-blue-500' },
      { id: 'protect', name: 'Protect PDF', iconName: 'ShieldCheck', iconColor: 'text-blue-600' },
      { id: 'sign-pdf', name: 'Sign PDF', iconName: 'PenTool', iconColor: 'text-blue-500' },
      { id: 'redact', name: 'Redact PDF', iconName: 'EyeOff', iconColor: 'text-slate-400' },
      { id: 'compare', name: 'Compare PDF', iconName: 'GitCompare', iconColor: 'text-blue-500' },
    ],
  },
];

export const PdfStudio: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<PdfCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeToolId, setActiveToolId] = useState<PdfToolId | null>(null);

  // Active Tool Definition
  const activeTool = useMemo(() => {
    return PDF_TOOLS.find((t) => t.id === activeToolId) || null;
  }, [activeToolId]);

  // Filtered Tools
  const filteredTools = useMemo(() => {
    return PDF_TOOLS.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: PDF_TOOLS.length };
    PDF_TOOLS.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, []);

  // If a tool workspace is currently open
  if (activeTool) {
    return (
      <PdfToolWorkspace
        tool={activeTool}
        onBack={() => setActiveToolId(null)}
      />
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold shadow-sm">
          <Files className="w-3.5 h-3.5" />
          <span>Complete In-Browser PDF Suite • 100% Client-Side & Private</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Every Tool You Need To Work With PDFs In One Place
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Merge, split, compress, convert, edit, sign, redact, and analyze your PDF documents with ease.
          Everything processes locally in your browser memory for maximum privacy.
        </p>

        {/* Search Bar */}
        <div className="pt-2 max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search PDF tools (merge, compress, sign, convert, etc.)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 focus:border-rose-500 text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs Menu with Dynamic Counts */}
      <div className="flex items-center justify-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner max-w-full">
          {PDF_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === cat.id
                    ? 'bg-black/30 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {categoryCounts[cat.id] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 6-Column Quick Mega Directory (Matching iLovePDF Screenshot Layout) */}
      {(selectedCategory === 'all' || selectedCategory === 'organize' || selectedCategory === 'optimize' || selectedCategory === 'convert-to-pdf' || selectedCategory === 'convert-from-pdf' || selectedCategory === 'edit' || selectedCategory === 'security') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/85 border border-slate-800 shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Files className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">
                  PDF Tools Navigation Menu
                </h2>
                <p className="text-[11px] text-slate-400">
                  Quick access to all 6 PDF modules • Click any tool to launch immediately
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Full Directory:</span>
              <span className="text-rose-400 font-semibold">6 Modules • 31 Tools</span>
            </div>
          </div>

          {/* 6 Columns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-3 overflow-x-auto">
            {SCREENSHOT_COLUMNS.map((col) => (
              <div key={col.title} className="space-y-3">
                <div className="border-b border-slate-800/60 pb-2">
                  <span className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
                    {col.title}
                  </span>
                </div>
                <ul className="space-y-1">
                  {col.tools.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveToolId(item.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer group ${
                          item.isHighlighted
                            ? 'bg-purple-500/15 text-purple-200 border border-purple-500/30 font-bold'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                        }`}
                      >
                        <span className={`shrink-0 ${item.iconColor} group-hover:scale-110 transition-transform`}>
                          {renderToolIcon(item.iconName, 'w-3.5 h-3.5')}
                        </span>
                        <span
                          className={`truncate ${
                            item.id === 'compress' ? 'text-red-400 font-bold' : ''
                          }`}
                        >
                          {item.name}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Banner: PDF to All Document Formats */}
      {(selectedCategory === 'all' || selectedCategory === 'convert') && (
        <div
          onClick={() => setActiveToolId('pdf-to-all')}
          className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-blue-500/30 hover:border-blue-400/60 transition-all cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl group"
        >
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Universal Multi-Format Converter</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-blue-300 transition-colors">
              Convert PDF to All Document Formats
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Convert your PDF into <strong>Word (.doc/.docx)</strong>, <strong>Excel (.csv)</strong>, <strong>PowerPoint (.ppt)</strong>, <strong>JPG Images</strong>, <strong>Markdown (.md)</strong>, <strong>Text (.txt)</strong>, or <strong>HTML</strong> using interactive format tabs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-wrap gap-1.5 justify-end max-w-xs">
              {['Word', 'Excel', 'PPT', 'Images', 'Markdown', 'Text', 'HTML', 'PDF/A'].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-1 rounded-lg bg-slate-900/90 text-blue-300 border border-blue-500/20 text-[10px] font-mono font-bold"
                >
                  {fmt}
                </span>
              ))}
            </div>
            <button className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <span>Open Converter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setActiveToolId(tool.id)}
            className="group relative p-5 rounded-3xl bg-slate-900/70 hover:bg-slate-900/95 border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            {/* Top Icon & Badge */}
            <div className="flex items-center justify-between">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.colorGradient} flex items-center justify-center text-white shadow-lg transition-transform duration-200 group-hover:scale-110`}
              >
                {renderToolIcon(tool.iconName, 'w-6 h-6')}
              </div>

              {tool.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                    tool.badge === 'POPULAR'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : tool.badge === 'AI'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {tool.badge}
                </span>
              )}
            </div>

            {/* Title & Tagline */}
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors">
                {tool.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {tool.tagline}
              </p>
            </div>

            {/* Launch Action */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
              <span>Open Tool</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-2">
          <p className="text-sm font-bold text-white">No tools found for "{searchQuery}"</p>
          <p className="text-xs text-slate-400">Try searching for merge, split, compress, or convert.</p>
        </div>
      )}
    </div>
  );
};
