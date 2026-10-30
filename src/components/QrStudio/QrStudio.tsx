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

  // Re-render Canvas whenever configuration changes
  const updateCanvas = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      await renderQrToCanvas(canvasRef.current, config);
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
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Main Container Card (Crisp clean styling matching screenshots) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 text-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top Type Selector Grid (Matching Screenshot 1 exactly) */}
            <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-200/70">
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
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#e6f9f4] border-2 border-[#00b894] text-[#00a382] shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#00a382]' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 1: Complete the content */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#1e293b] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </span>
                <h3 className="text-sm font-bold text-[#1e293b]">Complete the content</h3>
              </div>

              {/* URL or Content Input */}
              <div className="space-y-1.5 pl-8">
                <label className="text-xs font-semibold text-slate-600">
                  {config.type === 'link' && 'Enter your Website'}
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

                {/* Primary Input (Styled as the light blue box in screenshot) */}
                <input
                  type="text"
                  value={config.content}
                  onChange={(e) => setConfig((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder=""
                  className="w-full px-4 py-3 bg-[#eef5fc] border border-blue-100 focus:border-[#00b894] focus:bg-white rounded-xl text-sm text-slate-800 focus:outline-none transition-all shadow-inner"
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
                      className="px-3 py-2 bg-[#eef5fc] border border-blue-100 rounded-xl text-xs"
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
                      className="px-3 py-2 bg-[#eef5fc] border border-blue-100 rounded-xl text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Design your QR Code */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#1e293b] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <h3 className="text-sm font-bold text-[#1e293b]">Design your QR Code</h3>
                </div>

                {/* Plain QR vs Styled Custom Mode */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={applyPlainQr}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isPlainQr
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Standard clean black & white QR code with no logo or styling"
                  >
                    <span className="w-2.5 h-2.5 rounded-sm bg-black inline-block" />
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      !isPlainQr
                        ? 'bg-white text-[#00a382] shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>Custom Design</span>
                  </button>
                </div>
              </div>

              {/* Subtabs: Frame | Shape | Logo */}
              <div className="pl-8 space-y-4">
                <div className="flex border-b border-slate-200">
                  {[
                    { id: 'frame' as QrDesignTab, label: 'Frame' },
                    { id: 'shape' as QrDesignTab, label: 'Shape' },
                    { id: 'logo' as QrDesignTab, label: 'Logo' },
                  ].map((tab) => {
                    const isSelected = config.designTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, designTab: tab.id }))}
                        className={`px-6 py-2.5 text-xs font-bold transition-all cursor-pointer rounded-t-xl border-t border-x ${
                          isSelected
                            ? 'bg-white border-slate-200 border-b-white text-[#00a382] -mb-px'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Subtab 1: LOGO */}
                {config.designTab === 'logo' && (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-6 animate-in fade-in duration-200">
                    {/* 1. Local Upload Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-[#00b894]" />
                          <span>Local Logo Upload</span>
                        </label>
                        {config.logoUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="text-[11px] text-red-500 hover:text-red-600 flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove Local Logo</span>
                          </button>
                        )}
                      </div>

                      {/* Active Uploaded Logo Card OR Drag-Drop Zone */}
                      {config.logoUrl ? (
                        <div className="p-3.5 rounded-xl border border-[#00b894]/30 bg-[#f0fbf8] flex items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs">
                              <img
                                src={config.logoUrl}
                                alt="Uploaded Logo"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {fileNameInput || 'Local Logo Image'}
                              </p>
                              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Active on QR Code
                              </p>
                            </div>
                          </div>

                          <label className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 rounded-lg cursor-pointer transition-all shrink-0">
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
                          className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                            isDragging
                              ? 'border-[#00b894] bg-[#e6f9f4]/60 scale-[1.01]'
                              : 'border-slate-300 hover:border-[#00b894] bg-slate-50/60 hover:bg-[#f0fbf8]'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[#00a382]">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              Upload local logo from your device
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Drag & drop here or <span className="text-[#00a382] underline font-semibold">browse files</span> (PNG, JPG, SVG, WebP)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. Logo Alignment & Position Provision */}
                    <div className="pt-3 border-t border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Move className="w-3.5 h-3.5 text-[#00b894]" />
                            <span>Logo Alignment & Positioning Provision</span>
                          </label>
                          <p className="text-[11px] text-slate-500">
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
                            className="text-[11px] text-[#00a382] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
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
                              className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center ${
                                isSelected
                                  ? 'bg-[#e6f9f4] border-[#00b894] text-[#00a382] ring-2 ring-[#00b894]/20 shadow-xs'
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Horizontal Shift (X)</span>
                            <span className="font-mono font-semibold text-slate-800">
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
                            className="w-full accent-[#00b894] cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Vertical Shift (Y)</span>
                            <span className="font-mono font-semibold text-slate-800">
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
                            className="w-full accent-[#00b894] cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Logo Size Scale Slider */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Logo Scale / Size</span>
                          <span className="font-mono font-bold text-slate-800">
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
                          className="w-full accent-[#00b894] cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400">
                          Recommended: 18% - 24% for maximum camera scannability.
                        </p>
                      </div>

                      {/* Logo Plate Shape & Background */}
                      <div className="space-y-2 pt-1">
                        <span className="text-xs font-semibold text-slate-700 block">
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
                              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                (config.logoShape || 'circle') === sh.id
                                  ? 'bg-[#e6f9f4] border-[#00b894] text-[#00a382]'
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
                          <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00b894]" />
                        </label>
                        <span className="text-xs font-semibold text-slate-700">
                          Remove background behind Logo
                        </span>
                      </div>
                    </div>

                    {/* 3. Preset Logos Grid */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <label className="text-xs font-bold text-slate-700 block">
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
                              ? 'border-[#00b894] bg-[#e6f9f4] text-[#00a382]'
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
                                  ? 'border-[#00b894] ring-2 ring-[#00b894]/20 bg-slate-50'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                              title={logo.label}
                            >
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs"
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
                                ? 'border-[#00b894] bg-[#e6f9f4] text-[#00a382]'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-[11px] font-bold font-mono">{b.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtab 2: SHAPE (Screenshot 2) */}
                {config.designTab === 'shape' && (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-5 animate-in fade-in duration-200">
                    <h4 className="text-xs font-bold text-slate-700">Shape & Color</h4>

                    {/* Shape style grid (8 body module styles) */}
                    <div className="space-y-2">
                      <span className="text-xs text-slate-500 font-semibold">Shape style</span>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {[
                          { id: 'square' as QrShapeStyle, label: 'Square' },
                          { id: 'rounded' as QrShapeStyle, label: 'Rounded' },
                          { id: 'lines' as QrShapeStyle, label: 'Lines' },
                          { id: 'disconnected' as QrShapeStyle, label: 'Disconnected' },
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
                                ? 'border-[#00b894] bg-[#e6f9f4] text-[#00a382] ring-2 ring-[#00b894]/20'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-[10px] font-bold">{st.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Colors & Toggles (Screenshot 2 layout) */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Background Color */}
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-slate-600 block">Background color</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={config.bgColor}
                            disabled={config.transparentBg}
                            onChange={(e) => setConfig((prev) => ({ ...prev, bgColor: e.target.value }))}
                            className="w-28 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                          />
                          <input
                            type="color"
                            value={config.bgColor}
                            disabled={config.transparentBg}
                            onChange={(e) => setConfig((prev) => ({ ...prev, bgColor: e.target.value }))}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                          />
                        </div>
                        <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={config.transparentBg}
                            onChange={(e) => setConfig((prev) => ({ ...prev, transparentBg: e.target.checked }))}
                            className="accent-[#00b894] rounded"
                          />
                          <span className="text-xs text-slate-600">Transparent background</span>
                        </label>
                      </div>

                      {/* Shape Color */}
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-slate-600 block">Shape color</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={config.fgColor}
                            onChange={(e) => setConfig((prev) => ({ ...prev, fgColor: e.target.value }))}
                            className="w-28 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                          />
                          <input
                            type="color"
                            value={config.fgColor}
                            onChange={(e) => setConfig((prev) => ({ ...prev, fgColor: e.target.value }))}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                          />
                        </div>
                        <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={config.gradientEnabled}
                            onChange={(e) => setConfig((prev) => ({ ...prev, gradientEnabled: e.target.checked }))}
                            className="accent-[#00b894] rounded"
                          />
                          <span className="text-xs text-slate-600">Gradient</span>
                        </label>
                      </div>
                    </div>

                    {/* Border style (8 eye corner outer styles) */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-600">Border style</span>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {[
                          { id: 'square' as QrBorderStyle, label: 'Square' },
                          { id: 'rounded' as QrBorderStyle, label: 'Rounded' },
                          { id: 'circle' as QrBorderStyle, label: 'Circle' },
                          { id: 'leaf-right' as QrBorderStyle, label: 'Leaf Right' },
                          { id: 'leaf-left' as QrBorderStyle, label: 'Leaf Left' },
                          { id: 'teardrop' as QrBorderStyle, label: 'Teardrop' },
                          { id: 'circle-in-square' as QrBorderStyle, label: 'Circle+Sq' },
                          { id: 'shield' as QrBorderStyle, label: 'Shield' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setConfig((prev) => ({ ...prev, borderStyle: b.id }))}
                            className={`h-12 rounded-xl border flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                              config.borderStyle === b.id
                                ? 'border-[#00b894] bg-[#e6f9f4] text-[#00a382] ring-2 ring-[#00b894]/20'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-[10px] font-bold">{b.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Border Color */}
                      <div className="pt-2">
                        <span className="text-xs font-semibold text-slate-600 block mb-1">Border color</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={config.borderColor}
                            onChange={(e) => setConfig((prev) => ({ ...prev, borderColor: e.target.value }))}
                            className="w-28 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                          />
                          <input
                            type="color"
                            value={config.borderColor}
                            onChange={(e) => setConfig((prev) => ({ ...prev, borderColor: e.target.value }))}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtab 3: FRAME (Screenshot 3) */}
                {config.designTab === 'frame' && (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 animate-in fade-in duration-200">
                    <span className="text-xs font-bold text-slate-700 block">Select QR Code Frame</span>
                    {/* Horizontal scrollable row of frames (Screenshot 3) */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1">
                      {[
                        { id: 'none' as QrFrameType, label: 'No Frame', desc: 'Plain QR' },
                        { id: 'black-banner' as QrFrameType, label: 'Black Banner', desc: 'SCAN ME' },
                        { id: 'bottom-banner' as QrFrameType, label: 'Green Pill', desc: 'SCAN ME' },
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
                              ? 'border-[#00b894] bg-[#e6f9f4] text-[#00a382] ring-2 ring-[#00b894]/20'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold">{fr.label}</span>
                          <span className="text-[10px] text-slate-400 mt-1">{fr.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Frame text label input */}
                    {config.frameType !== 'none' && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <label className="text-xs font-semibold text-slate-700">Frame Text Label</label>
                        <input
                          type="text"
                          value={config.frameLabel}
                          onChange={(e) => setConfig((prev) => ({ ...prev, frameLabel: e.target.value }))}
                          placeholder="SCAN ME"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW & DOWNLOAD ================= */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="space-y-4">
              {/* Step 3 Badge */}
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#1e293b] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </span>
                <h3 className="text-sm font-bold text-[#1e293b]">Download QR Code</h3>
              </div>

              {/* Large Centered QR Canvas Frame (Matching screenshots) */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-md flex items-center justify-center overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto object-contain transition-all"
                  style={{ maxHeight: '340px' }}
                />
              </div>

              {/* Big Vibrant Green Download Button (Exact match from screenshots) */}
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-3.5 px-6 rounded-xl bg-[#00b894] hover:bg-[#00a382] text-white font-bold text-sm shadow-lg shadow-[#00b894]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download QR Code</span>
              </button>

              {/* Secondary Options: SVG, Copy, Print */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Vector SVG</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00b894]" />
                      <span className="text-[#00a382]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Features Banner (Matches Screenshot 3 bottom banner) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-md text-slate-700 text-center">
        <div className="flex flex-col items-center justify-center gap-2 p-2">
          <Smartphone className="w-6 h-6 text-[#00b894]" />
          <span className="text-xs font-semibold">Fully customized landing pages</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 p-2">
          <FileText className="w-6 h-6 text-[#00b894]" />
          <span className="text-xs font-semibold">QR Code Statistics</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 p-2">
          <QrIcon className="w-6 h-6 text-[#00b894]" />
          <span className="text-xs font-semibold">Customized Colors & Shapes for QR Codes</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 p-2">
          <ImageIcon className="w-6 h-6 text-[#00b894]" />
          <span className="text-xs font-semibold">Add Logos to QR Codes</span>
        </div>
      </div>
    </div>
  );
};
