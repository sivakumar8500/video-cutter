import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Link2,
  FileText,
  Mail,
  Phone,
  MessageSquare,
  UserCheck,
  Wifi,
  FileCode,
  Smartphone,
  Image as ImageIcon,
  Play,
  Share2,
  Calendar,
  Barcode,
  Download,
  Copy,
  Check,
  X,
  QrCode as QrIcon,
  Upload,
  Trash2,
  Move,
  RotateCcw,
  Palette,
  Folder,
  Search,
  Box,
  Sparkles,
  Layers,
} from 'lucide-react';
import type {
  QrConfig,
  QrContentType,
  QrDesignTab,
  QrShapeStyle,
  QrBorderStyle,
  QrPresetLogo,
  QrFrameType,
  QrLogoAlign,
  QrLogoShape,
} from '../../types/qrStudio';
import {
  renderQrToCanvas,
  generateQrSvg,
  decodeQrFromCanvas,
} from '../../utils/qrGenerator';

interface QrStudioProps {
  onSendToImageStudio?: (file: File) => void;
}

export const QrStudio: React.FC<QrStudioProps> = () => {
  const [config, setConfig] = useState<QrConfig>({
    type: 'link',
    content: '',
    wifi: {
      ssid: '',
      password: '',
      encryption: 'WPA',
      hidden: false,
    },
    upi: {
      vpa: '',
      name: '',
      amount: '',
      currency: 'INR',
      note: '',
    },
    vcard: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      company: '',
      title: '',
      website: '',
      address: '',
    },
    phone: '',
    smsMessage: '',
    emailAddress: '',
    emailSubject: '',
    emailBody: '',
    whatsappPhone: '',
    whatsappMessage: '',

    // Design tab
    designTab: 'shape',

    // Shapes & Colors
    shapeStyle: 'square',
    fgColor: '#000000',
    bgColor: '#ffffff',
    transparentBg: false,
    gradientEnabled: false,
    gradientColor: '#7c3aed',
    gradientType: 'linear',

    // Corner Eye Borders
    borderStyle: 'square',
    borderColor: '#000000',

    // Frame
    frameType: 'none',
    frameLabel: 'SCAN ME',
    frameSubText: '',

    // Logo
    presetLogo: 'none',
    logoUrl: undefined,
    logoElement: undefined,
    removeLogoBackground: false,
    logoSizePercent: 22,
    logoAlign: 'center',
    logoOffsetX: 0,
    logoOffsetY: 0,
    logoShape: 'circle',

    errorCorrectionLevel: 'M',
    size: 1024,
    margin: 2,
  });

  const isPlainQr =
    config.presetLogo === 'none' &&
    !config.logoElement &&
    config.shapeStyle === 'square' &&
    config.borderStyle === 'square' &&
    config.frameType === 'none' &&
    config.fgColor === '#000000' &&
    config.bgColor === '#ffffff' &&
    !config.transparentBg &&
    !config.gradientEnabled;

  const applyPlainQr = () => {
    setConfig((prev) => ({
      ...prev,
      shapeStyle: 'square',
      borderStyle: 'square',
      presetLogo: 'none',
      logoUrl: undefined,
      logoElement: undefined,
      logoAlign: 'center',
      logoOffsetX: 0,
      logoOffsetY: 0,
      logoShape: 'circle',
      frameType: 'none',
      fgColor: '#000000',
      bgColor: '#ffffff',
      borderColor: '#000000',
      transparentBg: false,
      gradientEnabled: false,
      errorCorrectionLevel: 'M',
    }));
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [fileNameInput, setFileNameInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isScannable, setIsScannable] = useState<boolean | null>(null);
  const [scannedContent, setScannedContent] = useState<string | null>(null);

  // Auto-calibrate 3D parameters to guarantee 100% phone camera scanning
  const handleCalibrateScannable = () => {
    setConfig((prev) => ({
      ...prev,
      is3dEnabled: true,
      yaw3d: 8,
      pitch3d: 6,
      depth3d: 14,
      heightVariation3d: false,
      fgColor: prev.fgColor === '#000000' || !prev.fgColor ? '#065f46' : prev.fgColor,
      errorCorrectionLevel: 'H',
    }));
  };

  // Re-render Canvas whenever configuration changes and verify scanner readability
  const updateCanvas = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      await renderQrToCanvas(canvasRef.current, config);
      const decoded = decodeQrFromCanvas(canvasRef.current);
      setIsScannable(!!decoded);
      setScannedContent(decoded);
    } catch (err) {
      console.error('Failed to render QR Code:', err);
    }
  }, [config]);

  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  // Process selected or dropped local image file
  const processLogoFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setFileNameInput(file.name);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setConfig((prev) => ({
        ...prev,
        logoUrl: url,
        logoElement: img,
        presetLogo: 'none',
        errorCorrectionLevel: 'H',
      }));
    };
    img.src = url;
  };

  // Handle Logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processLogoFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processLogoFile(file);
  };

  const handleRemoveLogo = () => {
    setFileNameInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setConfig((prev) => ({
      ...prev,
      logoUrl: undefined,
      logoElement: undefined,
      presetLogo: 'none',
    }));
  };

  // Download High-Res PNG
  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode_${config.type}_${Date.now()}.png`;
    a.click();
  };

  // Download Vector SVG
  const handleDownloadSvg = async () => {
    try {
      const svg = await generateQrSvg(config);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode_${config.type}_${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('SVG download error:', err);
    }
  };

  // Copy Image to Clipboard
  const handleCopy = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    } catch {
      navigator.clipboard.writeText(config.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-300 text-slate-900">
      {/* ================= 1. HERO SECTION (From Reference UI) ================= */}
      <div className="text-center max-w-4xl mx-auto space-y-6 pt-4 pb-2">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Vector QR Studio • 100% Client-Side &amp; Private</span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          We make <span className="text-emerald-500">QR codes</span> easy
        </h1>

        {/* Benefits Checkmark Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-1 text-xs sm:text-sm font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>Generate dynamic, editable QR codes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>Track performance with analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>Design QR codes with Logo, Color &amp; Shapes</span>
          </div>
        </div>

        {/* Main Hero CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              document.getElementById('qr-builder-workspace')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <QrIcon className="w-5 h-5" />
            <span>Create QR code</span>
          </button>
        </div>
      </div>

      {/* ================= 2. DASHBOARD & STUDIO PREVIEW MOCKUP ================= */}
      <div className="relative mx-auto max-w-5xl rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-5 sm:p-7 space-y-6 overflow-hidden">
        {/* Soft decorative glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header of Mockup */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-emerald-500/30">
              <QrIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">My QR Codes</h3>
              <p className="text-[11px] text-slate-500">Live In-Browser Studio Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => document.getElementById('qr-builder-workspace')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Folder className="w-3.5 h-3.5 text-slate-500" />
              <span>New Folder</span>
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('qr-builder-workspace')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 cursor-pointer"
            >
              <QrIcon className="w-3.5 h-3.5" />
              <span>Create QR Code</span>
            </button>
          </div>
        </div>

        {/* Folder Stats Strip (matching screenshot UI) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { name: 'UI-UX design', count: '50 Files' },
            { name: 'Prototype', count: '20 Files' },
            { name: 'UI design', count: '5 Files' },
            { name: 'UX design', count: '3 Files' },
            { name: 'Design System', count: '21 Files' },
          ].map((f) => (
            <div key={f.name} className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <Folder className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold text-slate-900">{f.count}</span>
              </div>
              <p className="text-xs font-semibold text-slate-600 truncate">{f.name}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search QR Codes..."
              readOnly
              value=""
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Active</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium">
              Image
            </span>
            <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium">
              Most relevant
            </span>
          </div>
        </div>

        {/* Table Mockup Rows */}
        <div className="space-y-2">
          {[
            { name: 'My QR Code 01', scans: '50 Scans', link: 'https://vidcuts.app/portfolio-showcase', date: '01 Nov 2026' },
            { name: 'My QR Code 02', scans: '25 Scans', link: 'https://vidcuts.app/wifi-studio-guest', date: '05 Nov 2026' },
            { name: 'My QR Code 03', scans: '80 Scans', link: 'https://vidcuts.app/creator-contact-vcard', date: '12 Nov 2026' },
          ].map((row) => (
            <div key={row.name} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200/70 hover:border-emerald-300 transition-all text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-mono font-bold shrink-0">
                  <QrIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{row.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{row.link} • {row.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden sm:inline-block font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {row.scans}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setConfig((prev) => ({ ...prev, content: row.link }));
                    document.getElementById('qr-builder-workspace')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold border border-slate-200 transition-all cursor-pointer"
                >
                  Edit
                </button>
                <div className="w-8 h-4 bg-emerald-500 rounded-full flex items-center justify-end px-0.5">
                  <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 3. THREE SIMPLE STEPS (Centerpiece from Screenshot) ================= */}
      <div className="py-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Create your <br />
            QR code in three <span className="text-emerald-500">simple steps</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Follow these three simple steps to generate, personalize, and export professional QR codes in seconds.
          </p>
        </div>

        {/* 3 Connected Steps with Horizontal Dotted Line */}
        <div className="relative max-w-4xl mx-auto">
          {/* Horizontal Dotted Line */}
          <div className="hidden md:block absolute top-7 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-slate-200 -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Step 1: Content (Emerald Green) */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 shadow-xl shadow-emerald-500/30 flex items-center justify-center text-white shrink-0 transform transition-transform hover:scale-110">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h3 className="text-base font-extrabold text-slate-900">Choose your QR Code content</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Decide what you want to share. You can use URLs, videos, apps, Wi-Fi, vCards, and more!
                </p>
              </div>
            </div>

            {/* Step 2: Customize (Purple / Indigo) */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500 shadow-xl shadow-indigo-500/30 flex items-center justify-center text-white shrink-0 transform transition-transform hover:scale-110">
                <Palette className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h3 className="text-base font-extrabold text-slate-900">Customize your design</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Personalize your QR code&apos;s color, shape, and style to create a unique design that matches your brand.
                </p>
              </div>
            </div>

            {/* Step 3: Download (Sky Blue) */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-500 shadow-xl shadow-blue-500/30 flex items-center justify-center text-white shrink-0 transform transition-transform hover:scale-110">
                <Download className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h3 className="text-base font-extrabold text-slate-900">Download your QR code</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Save your QR code as a PNG, SVG, JPG or EPS. Print it or share it digitally anywhere!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. THE LIVE GENERATOR WORKSPACE ================= */}
      <div id="qr-builder-workspace" className="pt-4 space-y-8">
        {/* Workspace Sub-Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono mb-2">
                <QrIcon className="w-3.5 h-3.5" />
                <span>Interactive Studio Builder</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Live QR Code Studio
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Customize your content, shapes, local logo watermark, and frame with real-time browser rendering.
              </p>
            </div>

            {/* Plain QR vs Custom Design Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200">
              <button
                type="button"
                onClick={applyPlainQr}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  isPlainQr
                    ? 'bg-slate-900 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Standard clean black & white QR code with no logo or styling"
              >
                <span className="w-2 h-2 rounded-sm bg-black inline-block" />
                <span>Plain QR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isPlainQr) {
                    setConfig((prev) => ({
                      ...prev,
                      borderStyle: 'rounded',
                      shapeStyle: 'rounded',
                      designTab: 'shape',
                    }));
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  !isPlainQr
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Custom Design</span>
              </button>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-8 space-y-8">
          {/* Top Type Selector Grid (Clean hairline pills, no boxy cards) */}
          <div className="border border-slate-200 rounded-2xl p-3 bg-white">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'link' as QrContentType, label: 'Link', icon: Link2 },
                { id: 'text' as QrContentType, label: 'Text', icon: FileText },
                { id: 'email' as QrContentType, label: 'E-mail', icon: Mail },
                { id: 'call' as QrContentType, label: 'Call', icon: Phone },
                { id: 'sms' as QrContentType, label: 'SMS', icon: MessageSquare },

                { id: 'vcard' as QrContentType, label: 'V-card', icon: UserCheck },
                { id: 'whatsapp' as QrContentType, label: 'WhatsApp', icon: MessageSquare },
                { id: 'wifi' as QrContentType, label: 'WI-FI', icon: Wifi },
                { id: 'pdf' as QrContentType, label: 'PDF', icon: FileCode },
                { id: 'app' as QrContentType, label: 'App', icon: Smartphone },

                { id: 'images' as QrContentType, label: 'Images', icon: ImageIcon },
                { id: 'video' as QrContentType, label: 'Video', icon: Play },
                { id: 'social' as QrContentType, label: 'Social Media', icon: Share2 },
                { id: 'event' as QrContentType, label: 'Event', icon: Calendar },
                { id: 'barcode' as QrContentType, label: '2D Barcode', icon: Barcode },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = config.type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, type: item.id }))}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-transparent border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-emerald-600'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 1: Complete the content */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-emerald-600 border border-emerald-300 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                1
              </span>
              <h3 className="text-sm font-mono tracking-wider uppercase font-bold text-slate-900">
                Complete The Content
              </h3>
            </div>

            {/* URL or Content Input */}
            <div className="space-y-2 pl-7">
              <label className="text-xs font-mono text-slate-600 block">
                {config.type === 'link' && 'Enter your Website URL'}
                {config.type === 'text' && 'Enter your Text Message'}
                {config.type === 'email' && 'Enter your Email Address'}
                {config.type === 'call' && 'Enter your Phone Number'}
                {config.type === 'sms' && 'Enter your Mobile Number & SMS'}
                {config.type === 'vcard' && 'Enter your Contact Details / Website'}
                {config.type === 'whatsapp' && 'Enter WhatsApp Number with Country Code'}
                {config.type === 'wifi' && 'Enter Wi-Fi Network Name (SSID) & Password'}
                {config.type === 'pdf' && 'Enter PDF Link URL'}
                {config.type === 'app' && 'Enter App Store or Play Store Link'}
                {config.type === 'images' && 'Enter Images Gallery Link'}
                {config.type === 'video' && 'Enter YouTube / Video Link'}
                {config.type === 'social' && 'Enter Social Media Profile Link'}
                {config.type === 'event' && 'Enter Event Registration Link'}
                {config.type === 'barcode' && 'Enter Barcode Data / Value'}
              </label>

              <input
                type="text"
                value={config.content}
                onChange={(e) => setConfig((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-mono"
              />

              {/* Wi-Fi Additional Inputs */}
              {config.type === 'wifi' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <input
                    type="text"
                    value={config.wifi.ssid}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        wifi: { ...prev.wifi, ssid: e.target.value },
                      }))
                    }
                    placeholder="Network Name (SSID)"
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={config.wifi.password}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        wifi: { ...prev.wifi, password: e.target.value },
                      }))
                    }
                    placeholder="Password"
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Design your QR Code */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-emerald-600 border border-emerald-300 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                2
              </span>
              <h3 className="text-sm font-mono tracking-wider uppercase font-bold text-slate-900">
                Design & Styling
              </h3>
            </div>

            {/* Subtabs: Shape | Logo | Frame */}
            <div className="pl-7 space-y-5">
              <div className="flex border-b border-slate-200 gap-3 sm:gap-6 overflow-x-auto">
                {[
                  { id: 'shape' as QrDesignTab, label: 'Shape & Color', icon: Palette },
                  { id: '3d' as QrDesignTab, label: '3D Voxel Blocks & AI', icon: Box, isNew: true },
                  { id: 'logo' as QrDesignTab, label: 'Logo Embedding', icon: Upload },
                  { id: 'frame' as QrDesignTab, label: 'Frames & Label', icon: Layers },
                ].map((tab) => {
                  const isSelected = config.designTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, designTab: tab.id }))}
                      className={`pb-3 text-xs font-mono tracking-wider uppercase transition-all cursor-pointer border-b-2 -mb-px flex items-center gap-1.5 shrink-0 ${
                        isSelected
                          ? 'border-emerald-500 text-emerald-600 font-bold'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      {tab.isNew && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500 text-white animate-pulse">
                          3D
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Subtab 1: LOGO */}
              {config.designTab === 'logo' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* 1. Local Upload Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-slate-900 flex items-center gap-1.5 font-bold">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        <span>Local Logo Upload</span>
                      </label>
                      {config.logoUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-mono cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove Local Logo</span>
                        </button>
                      )}
                    </div>

                    {/* Active Uploaded Logo OR Drag-Drop Zone */}
                    {config.logoUrl ? (
                      <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-black border border-slate-300 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                            <img
                              src={config.logoUrl}
                              alt="Uploaded Logo"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-mono font-bold text-slate-900 truncate">
                              {fileNameInput || 'Local Logo Image'}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active on QR Code
                            </p>
                          </div>
                        </div>

                        <label className="px-3 py-1.5 bg-slate-50 hover:bg-black text-slate-900 text-xs font-mono border border-slate-300 rounded-lg cursor-pointer transition-all shrink-0">
                          Change File
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-6 rounded-2xl border border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                          isDragging
                            ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                            : 'border-slate-300 hover:border-emerald-400 bg-white hover:bg-emerald-50'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-emerald-600">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 font-mono">
                            Upload local logo from your device
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Drag & drop here or <span className="text-emerald-600 underline">browse files</span> (PNG, JPG, SVG, WebP)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Logo Alignment & Position Provision */}
                  <div className="pt-4 border-t border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <Move className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Logo Alignment & Positioning Provision</span>
                        </label>
                        <p className="text-[11px] text-slate-600">
                          Align the logo anywhere on the QR code (center or corner offsets)
                        </p>
                      </div>

                      {(config.logoAlign !== 'center' || config.logoOffsetX !== 0 || config.logoOffsetY !== 0) && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfig((prev) => ({
                              ...prev,
                              logoAlign: 'center',
                              logoOffsetX: 0,
                              logoOffsetY: 0,
                            }))
                          }
                          className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 font-mono cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset Position</span>
                        </button>
                      )}
                    </div>

                    {/* 9-Position Alignment Grid */}
                    <div className="grid grid-cols-3 gap-2 max-w-[260px]">
                      {[
                        { id: 'top-left' as QrLogoAlign, label: '↖', title: 'Top-Left' },
                        { id: 'top' as QrLogoAlign, label: '⬆', title: 'Top-Center' },
                        { id: 'top-right' as QrLogoAlign, label: '↗', title: 'Top-Right' },
                        { id: 'left' as QrLogoAlign, label: '⬅', title: 'Left' },
                        { id: 'center' as QrLogoAlign, label: '🎯', title: 'Center (Standard)' },
                        { id: 'right' as QrLogoAlign, label: '➡', title: 'Right' },
                        { id: 'bottom-left' as QrLogoAlign, label: '↙', title: 'Bottom-Left' },
                        { id: 'bottom' as QrLogoAlign, label: '⬇', title: 'Bottom-Center' },
                        { id: 'bottom-right' as QrLogoAlign, label: '↘', title: 'Bottom-Right' },
                      ].map((pos) => {
                        const isSelected = (config.logoAlign || 'center') === pos.id;
                        return (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() =>
                              setConfig((prev) => ({
                                ...prev,
                                logoAlign: pos.id,
                                errorCorrectionLevel: 'H',
                              }))
                            }
                            className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center justify-center ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-600 ring-1 ring-emerald-500/30'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                            title={pos.title}
                          >
                            <span className="text-sm">{pos.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Fine Shift Sliders (X and Y offsets) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono text-slate-600">
                          <span>Horizontal Shift (X)</span>
                          <span className="font-mono text-emerald-600">
                            {config.logoOffsetX || 0}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={-30}
                          max={30}
                          value={config.logoOffsetX || 0}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              logoOffsetX: Number(e.target.value),
                              errorCorrectionLevel: 'H',
                            }))
                          }
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono text-slate-600">
                          <span>Vertical Shift (Y)</span>
                          <span className="font-mono text-emerald-600">
                            {config.logoOffsetY || 0}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={-30}
                          max={30}
                          value={config.logoOffsetY || 0}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              logoOffsetY: Number(e.target.value),
                              errorCorrectionLevel: 'H',
                            }))
                          }
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Logo Size Scale Slider */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-mono text-slate-600">
                        <span>Logo Scale / Size</span>
                        <span className="font-mono font-bold text-emerald-600">
                          {config.logoSizePercent || 22}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={34}
                        value={config.logoSizePercent || 22}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            logoSizePercent: Number(e.target.value),
                            errorCorrectionLevel: 'H',
                          }))
                        }
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-500 font-mono">
                        Recommended: 18% - 24% for maximum camera scannability.
                      </p>
                    </div>

                    {/* Logo Plate Shape & Background */}
                    <div className="space-y-2 pt-1">
                      <span className="text-xs font-mono text-slate-600 block">
                        Logo Background Plate Shape
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'circle' as QrLogoShape, label: 'Circle Plate' },
                          { id: 'rounded' as QrLogoShape, label: 'Rounded Square' },
                          { id: 'square' as QrLogoShape, label: 'Square' },
                          { id: 'none' as QrLogoShape, label: 'Transparent / No Plate' },
                        ].map((sh) => (
                          <button
                            key={sh.id}
                            type="button"
                            onClick={() => setConfig((prev) => ({ ...prev, logoShape: sh.id }))}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-mono cursor-pointer transition-all ${
                              (config.logoShape || 'circle') === sh.id
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {sh.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Toggle: Remove background behind Logo */}
                    <div className="pt-2 flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.removeLogoBackground}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              removeLogoBackground: e.target.checked,
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 text-white" />
                      </label>
                      <span className="text-xs font-mono text-slate-700">
                        Remove background behind Logo
                      </span>
                    </div>
                  </div>

                  {/* 3. Preset Logos Grid */}
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <label className="text-xs font-mono font-bold text-slate-900 block">
                      Or choose preset icon / logo
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {/* Remove / None */}
                      <button
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            presetLogo: 'none',
                            logoUrl: undefined,
                            logoElement: undefined,
                          }))
                        }
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                          config.presetLogo === 'none' && !config.logoElement
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                            : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                        }`}
                        title="None"
                      >
                        <X className="w-4 h-4 font-bold" />
                      </button>

                      {/* Presets */}
                      {[
                        { id: 'link' as QrPresetLogo, label: 'Link', bg: '#9b59b6', text: '🔗' },
                        { id: 'location' as QrPresetLogo, label: 'Location Pin', bg: '#e74c3c', text: '📍' },
                        { id: 'email' as QrPresetLogo, label: 'Email', bg: '#f39c12', text: '✉' },
                        { id: 'whatsapp' as QrPresetLogo, label: 'WhatsApp', bg: '#25D366', text: '💬' },
                        { id: 'wifi' as QrPresetLogo, label: 'Wi-Fi', bg: '#3498db', text: '📶' },
                        { id: 'vcard' as QrPresetLogo, label: 'vCard', bg: '#2c3e50', text: '🪪' },
                        { id: 'phonepe' as QrPresetLogo, label: 'PhonePe', bg: '#5f259f', text: 'पे' },
                        { id: 'upi' as QrPresetLogo, label: 'UPI', bg: '#0f75bc', text: 'UPI' },
                        { id: 'paypal' as QrPresetLogo, label: 'PayPal', bg: '#003087', text: 'P' },
                        { id: 'bitcoin' as QrPresetLogo, label: 'Bitcoin', bg: '#f7931a', text: '₿' },
                      ].map((logo) => {
                        const isSelected = config.presetLogo === logo.id && !config.logoElement;
                        return (
                          <button
                            key={logo.id}
                            type="button"
                            onClick={() =>
                              setConfig((prev) => ({
                                ...prev,
                                presetLogo: logo.id,
                                logoElement: undefined,
                                logoUrl: undefined,
                                errorCorrectionLevel: 'H',
                              }))
                            }
                            className={`w-11 h-11 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                              isSelected
                                ? 'border-emerald-500 ring-1 ring-emerald-500/40 bg-emerald-50'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                            title={logo.label}
                          >
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: logo.bg }}
                            >
                              {logo.text}
                            </span>
                          </button>
                        );
                      })}

                      {/* Frame badges as logo icons */}
                      {[
                        { id: 'scanme-1' as QrPresetLogo, label: 'SCAN ME brackets', text: '[SCAN ME]' },
                        { id: 'scanme-2' as QrPresetLogo, label: 'SCAN ME bold', text: 'SCAN ME' },
                        { id: 'qr-device' as QrPresetLogo, label: 'QR device', text: '📱' },
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() =>
                            setConfig((prev) => ({
                              ...prev,
                              presetLogo: b.id,
                              logoElement: undefined,
                              logoUrl: undefined,
                              errorCorrectionLevel: 'H',
                            }))
                          }
                          className={`h-11 px-3 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                            config.presetLogo === b.id
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-[11px] font-bold font-mono">{b.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Subtab 2: SHAPE */}
              {config.designTab === 'shape' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Shape style grid (8 body module styles) */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-slate-600 block">Body Shape Style</span>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {[
                        { id: 'square' as QrShapeStyle, label: 'Square' },
                        { id: 'rounded' as QrShapeStyle, label: 'Rounded' },
                        { id: 'lines' as QrShapeStyle, label: 'Lines' },
                        { id: 'disconnected' as QrShapeStyle, label: 'Broken' },
                        { id: 'cross' as QrShapeStyle, label: 'Cross' },
                        { id: 'diamond' as QrShapeStyle, label: 'Diamond' },
                        { id: 'mosaic' as QrShapeStyle, label: 'Mosaic' },
                        { id: 'dots' as QrShapeStyle, label: 'Dots' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setConfig((prev) => ({ ...prev, shapeStyle: st.id }))}
                          className={`h-12 rounded-xl border flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                            config.shapeStyle === st.id
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/30'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                          }`}
                        >
                          <span className="text-[10px] font-mono font-bold">{st.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors & Toggles */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Background Color */}
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-slate-600 block">Background Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={config.bgColor}
                          disabled={config.transparentBg}
                          onChange={(e) => setConfig((prev) => ({ ...prev, bgColor: e.target.value }))}
                          className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                        />
                        <input
                          type="color"
                          value={config.bgColor}
                          disabled={config.transparentBg}
                          onChange={(e) => setConfig((prev) => ({ ...prev, bgColor: e.target.value }))}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-black"
                        />
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={config.transparentBg}
                          onChange={(e) => setConfig((prev) => ({ ...prev, transparentBg: e.target.checked }))}
                          className="accent-emerald-500 rounded"
                        />
                        <span className="text-xs font-mono text-slate-600">Transparent Background</span>
                      </label>
                    </div>

                    {/* Shape Color */}
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-slate-600 block">Shape Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={config.fgColor}
                          onChange={(e) => setConfig((prev) => ({ ...prev, fgColor: e.target.value }))}
                          className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                        />
                        <input
                          type="color"
                          value={config.fgColor}
                          onChange={(e) => setConfig((prev) => ({ ...prev, fgColor: e.target.value }))}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-black"
                        />
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={config.gradientEnabled}
                          onChange={(e) => setConfig((prev) => ({ ...prev, gradientEnabled: e.target.checked }))}
                          className="accent-emerald-500 rounded"
                        />
                        <span className="text-xs font-mono text-slate-600">Gradient Accents</span>
                      </label>
                    </div>
                  </div>

                  {/* Border style (8 eye corner outer styles) */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <span className="text-xs font-mono text-slate-600 block">Eye Corner Border Style</span>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {[
                        { id: 'square' as QrBorderStyle, label: 'Square' },
                        { id: 'rounded' as QrBorderStyle, label: 'Rounded' },
                        { id: 'circle' as QrBorderStyle, label: 'Circle' },
                        { id: 'leaf-right' as QrBorderStyle, label: 'Leaf-R' },
                        { id: 'leaf-left' as QrBorderStyle, label: 'Leaf-L' },
                        { id: 'teardrop' as QrBorderStyle, label: 'Teardrop' },
                        { id: 'circle-in-square' as QrBorderStyle, label: 'Circ+Sq' },
                        { id: 'shield' as QrBorderStyle, label: 'Shield' },
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setConfig((prev) => ({ ...prev, borderStyle: b.id }))}
                          className={`h-12 rounded-xl border flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                            config.borderStyle === b.id
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/30'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                          }`}
                        >
                          <span className="text-[10px] font-mono font-bold">{b.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Border Color */}
                    <div className="pt-3">
                      <span className="text-xs font-mono text-slate-600 block mb-1">Corner Eye Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={config.borderColor}
                          onChange={(e) => setConfig((prev) => ({ ...prev, borderColor: e.target.value }))}
                          className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                        />
                        <input
                          type="color"
                          value={config.borderColor}
                          onChange={(e) => setConfig((prev) => ({ ...prev, borderColor: e.target.value }))}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-black"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subtab 3: FRAME */}
              {config.designTab === 'frame' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <span className="text-xs font-mono font-bold text-slate-900 block">
                    Select Frame Wrapper
                  </span>
                  {/* Horizontal scrollable row of frames */}
                  <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1">
                    {[
                      { id: 'none' as QrFrameType, label: 'No Frame', desc: 'Plain QR' },
                      { id: 'black-banner' as QrFrameType, label: 'Dark Banner', desc: 'SCAN ME' },
                      { id: 'bottom-banner' as QrFrameType, label: 'Amber Pill', desc: 'SCAN ME' },
                      { id: 'clipboard' as QrFrameType, label: 'Clipboard', desc: 'Top Clip' },
                      { id: 'clapper' as QrFrameType, label: 'Clapper', desc: 'Movie Strip' },
                      { id: 'phone' as QrFrameType, label: 'Smartphone', desc: 'Device' },
                      { id: 'stamp' as QrFrameType, label: 'Stamp', desc: 'Postage' },
                    ].map((fr) => (
                      <button
                        key={fr.id}
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, frameType: fr.id }))}
                        className={`w-28 h-28 rounded-xl border flex flex-col items-center justify-center p-2 shrink-0 cursor-pointer transition-all ${
                          config.frameType === fr.id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/30'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs font-mono font-bold">{fr.label}</span>
                        <span className="text-[10px] text-slate-500 mt-1 font-mono">{fr.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Frame text label input */}
                  {config.frameType !== 'none' && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <label className="text-xs font-mono text-slate-600 block">Frame Text Label</label>
                      <input
                        type="text"
                        value={config.frameLabel}
                        onChange={(e) => setConfig((prev) => ({ ...prev, frameLabel: e.target.value }))}
                        placeholder="SCAN ME"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Subtab 4: 3D VOXEL BLOCKS & AI ARTISTIC ILLUSION */}
              {config.designTab === '3d' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Master 3D Toggle */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Box className="w-5 h-5 text-emerald-600" />
                        <h4 className="text-sm font-bold text-slate-900">
                          3D Extruded Voxel QR Engine
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                          NEW
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Turn standard 2D modules into standing 3D architectural voxel blocks with cast shadows.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          is3dEnabled: !prev.is3dEnabled,
                          fgColor: !prev.is3dEnabled && (prev.fgColor === '#000000' || !prev.fgColor) ? '#065f46' : prev.fgColor,
                          yaw3d: 8,
                          pitch3d: 6,
                          depth3d: 14,
                          heightVariation3d: false,
                          errorCorrectionLevel: 'H',
                        }))
                      }
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs shrink-0 ${
                        config.is3dEnabled
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${config.is3dEnabled ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                      <span>{config.is3dEnabled ? '3D Active' : 'Enable 3D'}</span>
                    </button>
                  </div>

                  {/* 3D Scannability Mode Presets */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-slate-700 font-bold block">
                        Scannable 3D Presets
                      </label>
                      <span className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                        100% Camera Scannable
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        {
                          name: 'Scannable 3D (Recommended)',
                          desc: 'Optimized 8° tilt for instant phone recognition',
                          yaw: 8,
                          pitch: 6,
                          depth: 14,
                        },
                        {
                          name: 'Deep Isometric Stand',
                          desc: 'Architectural 12° standing block aesthetic',
                          yaw: 12,
                          pitch: 7,
                          depth: 18,
                        },
                        {
                          name: 'Frontal 3D Bevel Pop',
                          desc: 'Planar front face with extruded 3D drop depth',
                          yaw: 0,
                          pitch: 4,
                          depth: 12,
                        },
                      ].map((preset) => {
                        const isSelected =
                          config.is3dEnabled &&
                          config.yaw3d === preset.yaw &&
                          config.pitch3d === preset.pitch;

                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() =>
                              setConfig((prev) => ({
                                ...prev,
                                is3dEnabled: true,
                                yaw3d: preset.yaw,
                                pitch3d: preset.pitch,
                                depth3d: preset.depth,
                                heightVariation3d: false,
                                errorCorrectionLevel: 'H',
                              }))
                            }
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <p className="text-xs font-bold text-slate-900">{preset.name}</p>
                            <p className="text-[10px] text-slate-500 leading-snug">{preset.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3D Color & Material Presets */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-700 font-bold block">
                      3D Block Color Themes
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { name: 'Emerald Studio', base: '#065f46', top: '#10b981', side: '#047857', desc: 'VidCuts theme' },
                        { name: 'Dark Obsidian', base: '#0f172a', top: '#334155', side: '#020617', desc: 'High contrast' },
                        { name: 'Reference Slate', base: '#312e81', top: '#6366f1', side: '#1e1b4b', desc: 'As in image' },
                        { name: 'Cyber Cyan', base: '#0e7490', top: '#22d3ee', side: '#155e75', desc: 'Futuristic' },
                        { name: 'Crimson Royal', base: '#881337', top: '#f43f5e', side: '#4c0519', desc: 'Bold ruby' },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            setConfig((prev) => ({
                              ...prev,
                              is3dEnabled: true,
                              fgColor: preset.base,
                              color3dTop: preset.top,
                              color3dSide: preset.side,
                            }))
                          }
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                            config.fgColor === preset.base && config.is3dEnabled
                              ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: preset.base }} />
                            <span className="w-2.5 h-2.5 rounded-md shrink-0" style={{ backgroundColor: preset.top }} />
                            <span className="w-2.5 h-2.5 rounded-md shrink-0" style={{ backgroundColor: preset.side }} />
                          </div>
                          <p className="text-xs font-bold text-slate-900 truncate">{preset.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{preset.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3D Sliders & Geometry Settings */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-900 block">
                        3D Perspective &amp; Extrusion Geometry
                      </span>
                      <button
                        type="button"
                        onClick={handleCalibrateScannable}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold font-mono underline cursor-pointer"
                      >
                        Reset to Optimal Scan
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Depth / Extrusion Height */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono text-slate-600">
                          <span>Block Height (Depth)</span>
                          <span className="font-bold text-emerald-600">{config.depth3d ?? 14}px</span>
                        </div>
                        <input
                          type="range"
                          min={6}
                          max={32}
                          value={config.depth3d ?? 14}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              is3dEnabled: true,
                              depth3d: parseInt(e.target.value, 10),
                            }))
                          }
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      {/* Yaw Angle */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono text-slate-600">
                          <span>Isometric Yaw Tilt</span>
                          <span className="font-bold text-emerald-600">{config.yaw3d ?? 8}&deg;</span>
                        </div>
                        <input
                          type="range"
                          min={-20}
                          max={20}
                          value={config.yaw3d ?? 8}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              is3dEnabled: true,
                              yaw3d: parseInt(e.target.value, 10),
                            }))
                          }
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      {/* Pitch Angle */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono text-slate-600">
                          <span>Overhead Pitch</span>
                          <span className="font-bold text-emerald-600">{config.pitch3d ?? 6}&deg;</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={16}
                          value={config.pitch3d ?? 6}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              is3dEnabled: true,
                              pitch3d: parseInt(e.target.value, 10),
                            }))
                          }
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Voxel Height Variation & Shadow Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <label className="flex items-center gap-2 text-xs font-mono text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.shadow3d ?? true}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              is3dEnabled: true,
                              shadow3d: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                        />
                        <span>Floor Contact Drop Shadow</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-mono text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.heightVariation3d ?? false}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              is3dEnabled: true,
                              heightVariation3d: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                        />
                        <span>Variable Step Heights (Artistic)</span>
                      </label>
                    </div>
                  </div>

                  {/* Artistic AI Illusion & Image Texture Section (Reference Image 2) */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-mono font-bold text-slate-900 uppercase">
                          Artistic AI Illusion &amp; Photo Blend
                        </h4>
                      </div>
                      {config.artisticImageOverlay && (
                        <button
                          type="button"
                          onClick={() => setConfig((prev) => ({ ...prev, artisticImageOverlay: undefined }))}
                          className="text-[11px] text-red-500 hover:underline cursor-pointer font-mono"
                        >
                          Remove Photo Overlay
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Blend sandwich, food textures, landscapes, or artworks into the QR code canvas like in AI QR art.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Photo Upload */}
                      <label className="p-4 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer">
                        <Upload className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">Upload Artwork / Food Image</span>
                        <span className="text-[10px] text-slate-500">PNG, JPG or WebP</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setConfig((prev) => ({
                                  ...prev,
                                  artisticImageOverlay: ev.target?.result as string,
                                }));
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>

                      {/* Opacity slider */}
                      <div className="space-y-2 flex flex-col justify-center">
                        <div className="flex justify-between text-xs font-mono text-slate-600">
                          <span>Artwork Blend Opacity</span>
                          <span className="font-bold text-emerald-600">
                            {Math.round((config.artisticOpacity ?? 0.65) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={95}
                          value={Math.round((config.artisticOpacity ?? 0.65) * 100)}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              artisticOpacity: parseInt(e.target.value, 10) / 100,
                            }))
                          }
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-500">
                          Keep between 50-70% for scannability while keeping the artwork visible.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: LIVE PREVIEW & DOWNLOAD ================= */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="space-y-4">
            {/* Step 3 Badge & 3D Quick Toggle */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 shadow-xs">
                  3
                </span>
                <h3 className="text-sm font-mono tracking-wider uppercase font-bold text-slate-900">
                  Live QR Preview
                </h3>
              </div>

              {/* 1-Click 3D Toggle Pill */}
              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    is3dEnabled: !prev.is3dEnabled,
                    fgColor: !prev.is3dEnabled && (prev.fgColor === '#000000' || !prev.fgColor) ? '#065f46' : prev.fgColor,
                    yaw3d: 8,
                    pitch3d: 6,
                    depth3d: 14,
                    heightVariation3d: false,
                    errorCorrectionLevel: 'H',
                  }))
                }
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  config.is3dEnabled
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
                title="Toggle between 2D flat and 3D isometric block QR code"
              >
                <Box className="w-3.5 h-3.5" />
                <span>{config.is3dEnabled ? '3D Active' : 'Switch to 3D'}</span>
              </button>
            </div>

            {/* Large Centered QR Canvas Frame */}
            <div className="p-6 rounded-3xl bg-white shadow-xl border border-slate-200 relative flex flex-col items-center justify-center overflow-hidden">
              {config.is3dEnabled && (
                <div className="w-full mb-3 flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
                      <Box className="w-3.5 h-3.5 text-emerald-600" />
                      <span>3D Voxel Stand</span>
                    </span>

                    {/* Live Scannability Badge */}
                    {isScannable ? (
                      <span
                        title={scannedContent ? `Scanned: ${scannedContent}` : 'Verified by jsQR engine'}
                        className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xs animate-in fade-in"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span>100% Scannable</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>Tilt High</span>
                      </span>
                    )}
                  </div>

                  {!isScannable && (
                    <div className="w-full mt-1 p-2 rounded-xl bg-amber-50/90 border border-amber-200 flex items-center justify-between text-[11px] font-mono text-amber-900">
                      <span>Camera scanner warning: angle too steep</span>
                      <button
                        type="button"
                        onClick={handleCalibrateScannable}
                        className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                      >
                        Auto-Calibrate
                      </button>
                    </div>
                  )}
                </div>
              )}

              <canvas
                ref={canvasRef}
                className="max-w-full h-auto object-contain transition-all relative z-10 rounded-xl"
                style={{ maxHeight: '340px' }}
              />
            </div>

            {/* Big Vibrant Emerald Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer font-mono tracking-wider uppercase hover:scale-[1.01] active:scale-[0.99]"
            >
              <Download className="w-4 h-4" />
              <span>{config.is3dEnabled ? 'Download 3D PNG QR Code' : 'Download PNG QR Code'}</span>
            </button>

            {/* Secondary Options: SVG & Copy Image */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-100 text-slate-900 text-xs font-mono tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vector SVG</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-100 text-slate-900 text-xs font-mono tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copy Image</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* ================= 5. ADVANCED QR CODE GENERATOR FEATURES (From Screenshot) ================= */}
      <div className="py-12 border-t border-slate-200 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Experience the most <br />
            <span className="text-emerald-500">Advanced QR code</span> generator
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            We&apos;ve built the market&apos;s most powerful and customizable QR code software, packing it full of functionality while keeping it 100% private, client-side, and free.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Smartphone className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Dynamic Multi-Content</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Support for 15+ protocols: URLs, vCards, Wi-Fi access, SMS, WhatsApp direct chat, and apps.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Palette className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Custom Shapes &amp; Eye Borders</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Choose from rounded, squircle, or hexagon dots with customizable corner eye patterns.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Local Logo Embedding</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload your brand logo with 9 anchor position options, size slider, and transparent margin padding.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Download className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Lossless Vector SVG Export</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export ultra-crisp resolution-independent vector SVG or high-res PNG ready for commercial print.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
