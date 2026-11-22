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
import { AdBanner } from '../AdBanner';
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold shadow-xs">
          <Files className="w-3.5 h-3.5" />
          <span>Complete In-Browser PDF Suite • 100% Client-Side & Private</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Every Tool You Need To Work With PDFs In One Place
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
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
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 focus:border-rose-500 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs Menu with Dynamic Counts */}
      <div className="flex items-center justify-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-full">
          {PDF_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedCategory === cat.id
                ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${selectedCategory === cat.id
                  ? 'bg-black/20 text-white'
                  : 'bg-slate-100 text-slate-600'
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
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Files className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                  PDF Tools Navigation Menu
                </h2>
                <p className="text-[11px] text-slate-500">
                  Quick access to all 6 PDF modules • Click any tool to launch immediately
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Full Directory:</span>
              <span className="text-rose-600 font-semibold">6 Modules • 31 Tools</span>
            </div>
          </div>

          {/* 6 Columns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-3 overflow-x-auto">
            {SCREENSHOT_COLUMNS.map((col) => (
              <div key={col.title} className="space-y-3">
                <div className="border-b border-slate-200 pb-2">
                  <span className="text-[11px] font-black tracking-wider text-slate-600 uppercase">
                    {col.title}
                  </span>
                </div>
                <ul className="space-y-1">
                  {col.tools.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveToolId(item.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer group ${item.isHighlighted
                          ? 'bg-purple-50 text-purple-700 border border-purple-200 font-bold'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                      >
                        <span className={`shrink-0 ${item.iconColor} group-hover:scale-110 transition-transform`}>
                          {renderToolIcon(item.iconName, 'w-3.5 h-3.5')}
                        </span>
                        <span
                          className={`truncate ${item.id === 'compress' ? 'text-red-600 font-bold' : ''
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
          className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-200 hover:border-blue-300 transition-all cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6 shadow-md hover:shadow-lg group"
        >
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Universal Multi-Format Converter</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
              Convert PDF to All Document Formats
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Convert your PDF into <strong>Word (.doc/.docx)</strong>, <strong>Excel (.csv)</strong>, <strong>PowerPoint (.ppt)</strong>, <strong>JPG Images</strong>, <strong>Markdown (.md)</strong>, <strong>Text (.txt)</strong>, or <strong>HTML</strong> using interactive format tabs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-wrap gap-1.5 justify-end max-w-xs">
              {['Word', 'Excel', 'PPT', 'Images', 'Markdown', 'Text', 'HTML', 'PDF/A'].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-1 rounded-lg bg-white text-blue-700 border border-blue-200 text-[10px] font-mono font-bold shadow-xs"
                >
                  {fmt}
                </span>
              ))}
            </div>
            <button className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <span>Open Converter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mid-Page AdSense Banner */}
      <AdBanner />

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setActiveToolId(tool.id)}
            className="group relative p-5 rounded-3xl bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            {/* Top Icon & Badge */}
            <div className="flex items-center justify-between">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.colorGradient} flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-110`}
              >
                {renderToolIcon(tool.iconName, 'w-6 h-6')}
              </div>

              {tool.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${tool.badge === 'POPULAR'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : tool.badge === 'AI'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                >
                  {tool.badge}
                </span>
              )}
            </div>

            {/* Title & Tagline */}
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                {tool.name}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {tool.tagline}
              </p>
            </div>

            {/* Launch Action */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
              <span>Open Tool</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <p className="text-sm font-bold text-slate-900">No tools found for "{searchQuery}"</p>
          <p className="text-xs text-slate-500">Try searching for merge, split, compress, or convert.</p>
        </div>
      )}
    </div>
  );
};
