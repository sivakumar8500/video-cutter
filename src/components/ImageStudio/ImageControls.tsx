import React, { useState, useEffect, useRef } from 'react';
import {
  Maximize2,
  Crop,
  Shapes,
  Sliders,
  Sparkles,
  Type,
  Download,
  Link2,
  Link2Off,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  RotateCcw as ResetIcon,
  Circle,
  Square,
  Heart,
  Star,
  Hexagon,
  Shield,
  Gem,
  Check,
  Ban,
  Upload,
  Trash2,
  Wand2,
  ZoomIn,
  ZoomOut,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  QrCode,
} from 'lucide-react';
import type {
  ImageStudioConfig,
  ImageShape,
  ExportFormat,
  FrameCategory,
  AspectRatioPreset,
  LoadedImageInfo,
} from '../../types/imageStudio';
import { FRAME_TEMPLATES, type FrameTemplateItem } from '../../utils/frameTemplates';
import { applyCropToImage, upscaleLoadedImage } from '../../utils/imageStudioCanvas';

interface ImageControlsProps {
  config: ImageStudioConfig;
  onChangeConfig: React.Dispatch<React.SetStateAction<ImageStudioConfig>>;
  originalWidth: number;
  originalHeight: number;
  imageInfo?: LoadedImageInfo;
  onApplyCrop?: (newImageInfo: LoadedImageInfo) => void;
  onUpscaleBaseImage?: (newImageInfo: LoadedImageInfo) => void;
  onReset: () => void;
}

type ControlSection = 'quality' | 'resize' | 'crop' | 'frames' | 'shapes' | 'adjust' | 'watermark' | 'qr' | 'export';

const CROP_ASPECT_RATIOS: { id: AspectRatioPreset; label: string; ratio?: number; desc: string }[] = [
  { id: 'free', label: 'Free Crop', desc: 'Custom Rectangle' },
  { id: '1:1', label: '1:1 Square', ratio: 1, desc: 'Instagram / Avatar' },
  { id: '4:5', label: '4:5 Portrait', ratio: 4 / 5, desc: 'Instagram Post' },
  { id: '16:9', label: '16:9 Banner', ratio: 16 / 9, desc: 'YouTube / Banner' },
  { id: '9:16', label: '9:16 Story', ratio: 9 / 16, desc: 'Reels / TikTok' },
  { id: '4:3', label: '4:3 Photo', ratio: 4 / 3, desc: 'Classic Standard' },
  { id: '3:2', label: '3:2 Camera', ratio: 3 / 2, desc: '35mm DSLR' },
];

const FILTER_PRESETS = [
  {
    name: 'Normal',
    desc: 'Clean & natural',
    adjustments: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      temperature: 0,
      vignette: 0,
      hueRotate: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      blur: 0,
    },
  },
  {
    name: 'Vivid Pop',
    desc: 'Punchy & vibrant',
    adjustments: {
      brightness: 105,
      contrast: 115,
      saturation: 135,
      temperature: 8,
      vignette: 12,
      hueRotate: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      blur: 0,
    },
  },
  {
    name: 'Golden Hour',
    desc: 'Warm sunset glow',
    adjustments: {
      brightness: 110,
      contrast: 105,
      saturation: 120,
      temperature: 45,
      vignette: 20,
      hueRotate: 0,
      grayscale: 0,
      sepia: 15,
      invert: 0,
      blur: 0,
    },
  },
  {
    name: 'Cinematic',
    desc: 'Teal & moody shadow',
    adjustments: {
      brightness: 95,
      contrast: 125,
      saturation: 90,
      temperature: -18,
      vignette: 38,
      hueRotate: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      blur: 0,
    },
  },
  {
    name: 'Dramatic B&W',
    desc: 'High-contrast monochrome',
    adjustments: {
      brightness: 105,
      contrast: 140,
      saturation: 0,
      temperature: 0,
      vignette: 35,
      hueRotate: 0,
      grayscale: 100,
      sepia: 0,
      invert: 0,
      blur: 0,
    },
  },
  {
    name: 'Vintage Film',
    desc: '70s retro nostalgic tone',
    adjustments: {
      brightness: 105,
      contrast: 90,
      saturation: 85,
      temperature: 25,
      vignette: 28,
      hueRotate: 0,
      grayscale: 0,
      sepia: 40,
      invert: 0,
      blur: 0,
    },
  },
  {
    name: 'Cyberpunk',
    desc: 'Neon magenta & electric blue',
    adjustments: {
      brightness: 108,
      contrast: 130,
      saturation: 155,
      temperature: -25,
      vignette: 25,
      hueRotate: 45,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      blur: 0,
    },
  },
];

export const ImageControls: React.FC<ImageControlsProps> = ({
  config,
  onChangeConfig,
  originalWidth,
  originalHeight,
  imageInfo,
  onApplyCrop,
  onUpscaleBaseImage,
  onReset,
}) => {
  const [activeSection, setActiveSection] = useState<ControlSection>('quality');
  const [selectedFrameCategory, setSelectedFrameCategory] = useState<FrameCategory | 'all'>('all');
  const [isUpscalingBase, setIsUpscalingBase] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Aspect ratio helper
  const aspectRatio = originalWidth / (originalHeight || 1);

  // Robust string state for Width & Height inputs
  // Solves: "resize user give zero and enter number"
  const [widthInput, setWidthInput] = useState<string>(String(config.resize.width));
  const [heightInput, setHeightInput] = useState<string>(String(config.resize.height));

  useEffect(() => {
    setWidthInput(String(config.resize.width));
  }, [config.resize.width]);

  useEffect(() => {
    setHeightInput(String(config.resize.height));
  }, [config.resize.height]);

  const handleWidthChange = (val: string) => {
    // Keep raw string allowing empty or starting with 0
    const digitsOnly = val.replace(/[^0-9]/g, '');
    setWidthInput(digitsOnly);

    const parsed = parseInt(digitsOnly, 10);
    if (!isNaN(parsed) && parsed > 0) {
      let validH = config.resize.height;
      if (config.resize.lockAspectRatio) {
        validH = Math.max(1, Math.round(parsed / aspectRatio));
        setHeightInput(String(validH));
      }
      onChangeConfig((prev) => ({
        ...prev,
        resize: {
          ...prev.resize,
          width: parsed,
          height: validH,
          scalePercent: Math.round((parsed / originalWidth) * 100),
        },
      }));
    }
  };

  const handleWidthBlur = () => {
    const parsed = parseInt(widthInput, 10);
    if (isNaN(parsed) || parsed < 16) {
      const fallback = Math.max(16, config.resize.width || originalWidth);
      setWidthInput(String(fallback));
      handleWidthChange(String(fallback));
    }
  };

  const handleHeightChange = (val: string) => {
    const digitsOnly = val.replace(/[^0-9]/g, '');
    setHeightInput(digitsOnly);

    const parsed = parseInt(digitsOnly, 10);
    if (!isNaN(parsed) && parsed > 0) {
      let validW = config.resize.width;
      if (config.resize.lockAspectRatio) {
        validW = Math.max(1, Math.round(parsed * aspectRatio));
        setWidthInput(String(validW));
      }
      onChangeConfig((prev) => ({
        ...prev,
        resize: {
          ...prev.resize,
          width: validW,
          height: parsed,
          scalePercent: Math.round((parsed / originalHeight) * 100),
        },
      }));
    }
  };

  const handleHeightBlur = () => {
    const parsed = parseInt(heightInput, 10);
    if (isNaN(parsed) || parsed < 16) {
      const fallback = Math.max(16, config.resize.height || originalHeight);
      setHeightInput(String(fallback));
      handleHeightChange(String(fallback));
    }
  };

  const handleScalePreset = (percent: number) => {
    const factor = percent / 100;
    const newW = Math.max(16, Math.round(originalWidth * factor));
    const newH = Math.max(16, Math.round(originalHeight * factor));
    setWidthInput(String(newW));
    setHeightInput(String(newH));
    onChangeConfig((prev) => ({
      ...prev,
      resize: {
        ...prev.resize,
        width: newW,
        height: newH,
        scalePercent: percent,
      },
    }));
  };

  const handleQualityPreset = (preset: '2x_hd' | '4x_ultra' | 'sharp_crisp' | 'hdr_pop' | 'clean_reset') => {
    switch (preset) {
      case '2x_hd': {
        const newW = Math.round(originalWidth * 2);
        const newH = Math.round(originalHeight * 2);
        setWidthInput(String(newW));
        setHeightInput(String(newH));
        onChangeConfig((prev) => ({
          ...prev,
          resize: {
            ...prev.resize,
            width: newW,
            height: newH,
            scalePercent: 200,
            quality: 1.0,
            upscaleFactor: 2,
          },
          adjustments: {
            ...prev.adjustments,
            sharpness: 32,
            clarity: 24,
          },
        }));
        break;
      }
      case '4x_ultra': {
        const newW = Math.round(originalWidth * 4);
        const newH = Math.round(originalHeight * 4);
        setWidthInput(String(newW));
        setHeightInput(String(newH));
        onChangeConfig((prev) => ({
          ...prev,
          resize: {
            ...prev.resize,
            width: newW,
            height: newH,
            scalePercent: 400,
            quality: 1.0,
            upscaleFactor: 4,
          },
          adjustments: {
            ...prev.adjustments,
            sharpness: 48,
            clarity: 36,
          },
        }));
        break;
      }
      case 'sharp_crisp': {
        onChangeConfig((prev) => ({
          ...prev,
          resize: {
            ...prev.resize,
            quality: 1.0,
          },
          adjustments: {
            ...prev.adjustments,
            sharpness: 60,
            clarity: 35,
          },
        }));
        break;
      }
      case 'hdr_pop': {
        onChangeConfig((prev) => ({
          ...prev,
          resize: {
            ...prev.resize,
            quality: 1.0,
          },
          adjustments: {
            ...prev.adjustments,
            sharpness: 28,
            clarity: 45,
            contrast: 112,
            saturation: 118,
          },
        }));
        break;
      }
      case 'clean_reset': {
        setWidthInput(String(originalWidth));
        setHeightInput(String(originalHeight));
        onChangeConfig((prev) => ({
          ...prev,
          resize: {
            ...prev.resize,
            width: originalWidth,
            height: originalHeight,
            scalePercent: 100,
            quality: 0.95,
            upscaleFactor: 1,
          },
          adjustments: {
            ...prev.adjustments,
            sharpness: 0,
            clarity: 0,
          },
        }));
        break;
      }
    }
  };

  const handleUpscaleMultiplier = (factor: number) => {
    const newW = Math.round(originalWidth * factor);
    const newH = Math.round(originalHeight * factor);
    setWidthInput(String(newW));
    setHeightInput(String(newH));
    onChangeConfig((prev) => ({
      ...prev,
      resize: {
        ...prev.resize,
        width: newW,
        height: newH,
        scalePercent: Math.round(factor * 100),
        quality: 1.0,
        upscaleFactor: factor,
      },
      adjustments: {
        ...prev.adjustments,
        sharpness: factor > 1 ? Math.min(50, Math.round(factor * 15)) : 0,
        clarity: factor > 1 ? Math.min(40, Math.round(factor * 12)) : 0,
      },
    }));
  };

  const handleStandardResolution = (targetMaxDimension: number) => {
    const currentMax = Math.max(originalWidth, originalHeight);
    const scale = targetMaxDimension / currentMax;
    const newW = Math.round(originalWidth * scale);
    const newH = Math.round(originalHeight * scale);
    setWidthInput(String(newW));
    setHeightInput(String(newH));
    onChangeConfig((prev) => ({
      ...prev,
      resize: {
        ...prev.resize,
        width: newW,
        height: newH,
        scalePercent: Math.round(scale * 100),
        quality: 1.0,
      },
      adjustments: {
        ...prev.adjustments,
        sharpness: scale > 1 ? 30 : 0,
        clarity: scale > 1 ? 22 : 0,
      },
    }));
  };

  const handlePermanentUpscale = async (factor: number) => {
    if (!imageInfo || !onUpscaleBaseImage) return;
    setIsUpscalingBase(true);
    try {
      const upscaled = await upscaleLoadedImage(imageInfo, factor);
      onUpscaleBaseImage(upscaled);
    } catch (err) {
      console.error('Failed to upscale base image:', err);
    } finally {
      setIsUpscalingBase(false);
    }
  };

  // Custom Frame Upload
  const handleCustomFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      onChangeConfig((prev) => ({
        ...prev,
        frame: {
          ...prev.frame,
          enabled: true,
          category: 'none',
          customFrameUrl: url,
          customFrameElement: img,
          customFrameFit: 'stretch',
          customFrameOpacity: 1.0,
        },
      }));
    };
    img.src = url;
  };

  const handleRemoveCustomFrame = () => {
    onChangeConfig((prev) => ({
      ...prev,
      frame: {
        ...prev.frame,
        customFrameUrl: undefined,
        customFrameElement: undefined,
        enabled: false,
      },
    }));
  };

  // Crop Ratio Select
  const handleSelectCropRatio = (preset: AspectRatioPreset) => {
    const item = CROP_ASPECT_RATIOS.find((r) => r.id === preset);
    let newW = 0.8;
    let newH = 0.8;
    if (item?.ratio) {
      const currentCanvasRatio = originalWidth / (originalHeight || 1);
      if (item.ratio > currentCanvasRatio) {
        newW = 0.85;
        newH = (0.85 * currentCanvasRatio) / item.ratio;
      } else {
        newH = 0.85;
        newW = (0.85 * item.ratio) / currentCanvasRatio;
      }
    }
    const newX = (1 - newW) / 2;
    const newY = (1 - newH) / 2;
    onChangeConfig((prev) => ({
      ...prev,
      crop: {
        active: true,
        aspectRatio: preset,
        x: Math.max(0, parseFloat(newX.toFixed(3))),
        y: Math.max(0, parseFloat(newY.toFixed(3))),
        width: Math.min(1, parseFloat(newW.toFixed(3))),
        height: Math.min(1, parseFloat(newH.toFixed(3))),
      },
    }));
  };

  // Commit Crop Action
  const handleApplyCropClick = async () => {
    if (!imageInfo || !onApplyCrop) return;
    const cw = imageInfo.originalWidth;
    const ch = imageInfo.originalHeight;
    const crop = config.crop;
    const px = Math.max(0, Math.round(crop.x * cw));
    const py = Math.max(0, Math.round(crop.y * ch));
    const pw = Math.min(cw - px, Math.max(16, Math.round(crop.width * cw)));
    const ph = Math.min(ch - py, Math.max(16, Math.round(crop.height * ch)));
    const cropped = await applyCropToImage(imageInfo, { x: px, y: py, width: pw, height: ph });
    onApplyCrop(cropped);
  };

  const handleShapeSelect = (shape: ImageShape) => {
    onChangeConfig((prev) => ({
      ...prev,
      shape: {
        ...prev.shape,
        shape,
      },
    }));
  };

  const handleApplyFrame = (template: FrameTemplateItem) => {
    onChangeConfig((prev) => ({
      ...prev,
      frame: {
        enabled: true,
        category: template.category,
        templateId: template.id,
        primaryText: template.defaultPrimary,
        secondaryText: template.defaultSecondary,
        accentColor: template.accentColor,
        showBanner: true,
        frameBorderWidth: prev.frame?.frameBorderWidth || 16,
        customFrameUrl: undefined,
        customFrameElement: undefined,
      },
    }));
  };

  const handleDisableFrame = () => {
    onChangeConfig((prev) => ({
      ...prev,
      frame: {
        ...prev.frame,
        enabled: false,
        category: 'none',
        customFrameUrl: undefined,
        customFrameElement: undefined,
      },
    }));
  };

  const colorPresets = [
    '#ffffff',
    '#38bdf8', // cyan
    '#10b981', // emerald
    '#f97316', // orange
    '#a855f7', // purple
    '#f59e0b', // amber
    '#ef4444', // red
    '#000000', // black
  ];

  const filteredFrames =
    selectedFrameCategory === 'all'
      ? FRAME_TEMPLATES
      : FRAME_TEMPLATES.filter((t) => t.category === selectedFrameCategory);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>Studio Controls</span>
          <span className="text-[10px] font-mono font-normal text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
            {originalWidth}×{originalHeight}
          </span>
        </h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer"
          title="Reset all settings to original defaults"
        >
          <ResetIcon className="w-3 h-3 text-cyan-400" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Primary Category Tabs (9 full tool sections) */}
      <div className="grid grid-cols-3 sm:grid-cols-9 gap-1 p-1 bg-slate-950/70 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveSection('quality')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
            activeSection === 'quality'
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20'
              : 'text-amber-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="font-bold">Quality</span>
        </button>

        <button
          onClick={() => setActiveSection('resize')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
            activeSection === 'resize'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Resize</span>
        </button>

        <button
          onClick={() => setActiveSection('crop')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
            activeSection === 'crop'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Crop className="w-3.5 h-3.5 text-emerald-400" />
          <span>Crop</span>
        </button>

        <button
          onClick={() => setActiveSection('frames')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
            activeSection === 'frames'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Frames</span>
        </button>

        <button
          onClick={() => setActiveSection('shapes')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
            activeSection === 'shapes'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Shapes className="w-3.5 h-3.5" />
          <span>Shapes</span>
        </button>

        <button
          onClick={() => setActiveSection('adjust')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
            activeSection === 'adjust'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>

        <button
          onClick={() => setActiveSection('watermark')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
            activeSection === 'watermark'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>Text</span>
        </button>

        <button
          onClick={() => setActiveSection('qr')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
            activeSection === 'qr'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
              : 'text-purple-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-bold">QR</span>
        </button>

        <button
          onClick={() => setActiveSection('export')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
            activeSection === 'export'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>

      {/* SECTION 0: QUALITY & ENHANCEMENT */}
      {activeSection === 'quality' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quality Overview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900/90 to-purple-500/15 border border-amber-500/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Increase Quality & AI Upscaler
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Boost resolution, sharpen edges, recover details & set lossless quality
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {Math.round((config.resize.quality || 0.95) * 100)}% QUALITY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Current Canvas Size</span>
                <span className="font-mono text-sm font-bold text-white">
                  {config.resize.width} × {config.resize.height} px
                </span>
                <span className="text-[10px] text-cyan-400 block mt-0.5">
                  {Math.round((config.resize.width / originalWidth) * 100)}% of original
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Original Image Size</span>
                <span className="font-mono text-sm font-bold text-slate-300">
                  {originalWidth} × {originalHeight} px
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">
                  Base Resolution
                </span>
              </div>
            </div>
          </div>

          {/* 1-Click AI Quality Remaster Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Quality Enhancers</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQualityPreset('2x_hd')}
                className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/40 hover:border-amber-400 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                    🚀 2x HD Upscale
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    2× Res
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Doubles pixels with edge smoothing, +32% sharpness & 100% quality
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQualityPreset('4x_ultra')}
                className="p-3 rounded-2xl bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-500/40 hover:border-purple-400 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-300 group-hover:text-purple-200">
                    💎 4x 4K Ultra HD
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    4× Res
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Quadruples resolution up to 4K with deep unsharp masking
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQualityPreset('sharp_crisp')}
                className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                    ✨ Crisp & Sharp
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                    Edges
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Unsharp mask eliminates blur and brings out razor-sharp edges
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQualityPreset('hdr_pop')}
                className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                    🎨 HDR Detail Pop
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    Vibrant
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Micro-contrast pop, vivid saturation & enhanced dynamic clarity
                </p>
              </button>
            </div>
          </div>

          {/* Resolution Multipliers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Resolution Scale Multiplier
              </span>
              <button
                type="button"
                onClick={() => handleQualityPreset('clean_reset')}
                className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
              >
                Reset to 1x
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { factor: 1, label: '1x', sub: 'Native' },
                { factor: 1.5, label: '1.5x', sub: 'HD' },
                { factor: 2, label: '2x', sub: 'FHD' },
                { factor: 3, label: '3x', sub: '2K' },
                { factor: 4, label: '4x', sub: '4K UHD' },
              ].map((m) => {
                const isSelected = Math.round((config.resize.width / originalWidth) * 10) / 10 === m.factor;
                return (
                  <button
                    key={m.factor}
                    type="button"
                    onClick={() => handleUpscaleMultiplier(m.factor)}
                    className={`py-2 px-1 text-center rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{m.label}</div>
                    <div className="text-[9px] text-slate-400">{m.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Standard HD Targets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Target Standard Resolution
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'HD 720p', max: 1280 },
                { label: 'FHD 1080p', max: 1920 },
                { label: '2K 1440p', max: 2560 },
                { label: '4K 2160p', max: 3840 },
              ].map((std) => (
                <button
                  key={std.max}
                  type="button"
                  onClick={() => handleStandardResolution(std.max)}
                  className="py-2 text-xs font-semibold rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  {std.label}
                </button>
              ))}
            </div>
          </div>

          {/* Export Quality / Compression Level Slider */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Export Image Quality
                </h4>
                <p className="text-[11px] text-slate-400">
                  Controls output compression (JPEG & WebP lossless quality)
                </p>
              </div>
              <span className="font-mono text-sm font-bold text-amber-400">
                {Math.round((config.resize.quality || 0.95) * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.01"
              value={config.resize.quality || 0.95}
              onChange={(e) => {
                const q = parseFloat(e.target.value);
                onChangeConfig((prev) => ({
                  ...prev,
                  resize: { ...prev.resize, quality: q },
                }));
              }}
              className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { q: 0.8, label: '80% Good' },
                { q: 0.9, label: '90% High' },
                { q: 0.95, label: '95% Pro' },
                { q: 1.0, label: '100% Ultra' },
              ].map((item) => (
                <button
                  key={item.q}
                  type="button"
                  onClick={() =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      resize: { ...prev.resize, quality: item.q },
                    }))
                  }
                  className={`py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                    Math.abs((config.resize.quality || 0.95) - item.q) < 0.02
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sharpness & Clarity Sliders */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Sharpness & Clarity Fine-Tuning
            </h4>

            {/* Sharpness Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Sharpness (Unsharp Mask)</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {config.adjustments.sharpness || 0}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                value={config.adjustments.sharpness || 0}
                onChange={(e) =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    adjustments: { ...prev.adjustments, sharpness: parseInt(e.target.value) },
                  }))
                }
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Enhances edge contrast, eliminating softness when zooming or upscaling.
              </p>
            </div>

            {/* Clarity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Clarity (Micro-Contrast Pop)</span>
                <span className="font-mono text-amber-400 font-bold">
                  {config.adjustments.clarity || 0}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                value={config.adjustments.clarity || 0}
                onChange={(e) =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    adjustments: { ...prev.adjustments, clarity: parseInt(e.target.value) },
                  }))
                }
                className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Boosts textural contrast in midtones to make hair, fabric, and textures pop.
              </p>
            </div>
          </div>

          {/* Permanent Source Upscale */}
          {onUpscaleBaseImage && imageInfo && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white">Permanently Upscale Source File</h5>
                  <p className="text-[10px] text-slate-400">
                    Re-samples base image buffer in memory so all crops & shapes work on HD pixels.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isUpscalingBase}
                  onClick={() => handlePermanentUpscale(2)}
                  className="flex-1 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpscalingBase ? 'Processing...' : '⚡ Super-Sample 2x'}
                </button>
                <button
                  type="button"
                  disabled={isUpscalingBase}
                  onClick={() => handlePermanentUpscale(4)}
                  className="flex-1 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpscalingBase ? 'Processing...' : '💎 Super-Sample 4x'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 1: RESIZE & COMPRESS */}
      {activeSection === 'resize' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quick Quality & Upscale Shortcut */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Increase Quality / Upscale</span>
                <span className="text-[10px] text-slate-400 block">Quick 1-click HD resolution & detail boost</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleQualityPreset('2x_hd')}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-sm"
              >
                2x HD
              </button>
              <button
                type="button"
                onClick={() => handleQualityPreset('4x_ultra')}
                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer transition-all shadow-sm"
              >
                4x 4K
              </button>
            </div>
          </div>

          {/* Dimension Inputs (Zero-friendly, fully editable) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Dimensions (Pixels)
              </label>
              <button
                type="button"
                onClick={() =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    resize: {
                      ...prev.resize,
                      lockAspectRatio: !prev.resize.lockAspectRatio,
                    },
                  }))
                }
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  config.resize.lockAspectRatio
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="Lock aspect ratio"
              >
                {config.resize.lockAspectRatio ? (
                  <>
                    <Link2 className="w-3 h-3 text-cyan-400" />
                    <span>Ratio Locked</span>
                  </>
                ) : (
                  <>
                    <Link2Off className="w-3 h-3" />
                    <span>Free Aspect</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Width</span>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={widthInput}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    onBlur={handleWidthBlur}
                    placeholder="e.g. 1080"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm font-mono text-white focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500">px</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Height</span>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={heightInput}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    onBlur={handleHeightBlur}
                    placeholder="e.g. 1080"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm font-mono text-white focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500">px</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              💡 Tip: You can freely backspace, type 0, or enter any custom dimensions.
            </p>
          </div>

          {/* Quick Percentage Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Quick Scale Presets
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {[25, 50, 75, 100, 200].map((pct) => (
                <button
                  key={pct}
                  onClick={() => handleScalePreset(pct)}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    config.resize.scalePercent === pct
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Target File Size in KB (Auto Compression) */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Target File Size (KB)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Auto-compresses image to meet upload limits
                </p>
              </div>
              {config.resize.targetSizeKb && (
                <button
                  onClick={() =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      resize: { ...prev.resize, targetSizeKb: undefined },
                    }))
                  }
                  className="text-[10px] text-slate-400 hover:text-red-400"
                >
                  Clear Limit
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map((kb) => (
                <button
                  key={kb}
                  onClick={() =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      resize: { ...prev.resize, targetSizeKb: kb },
                    }))
                  }
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    config.resize.targetSizeKb === kb
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  &lt; {kb} KB
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="number"
                min="10"
                max="50000"
                value={config.resize.targetSizeKb || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onChangeConfig((prev) => ({
                    ...prev,
                    resize: {
                      ...prev.resize,
                      targetSizeKb: isNaN(val) ? undefined : val,
                    },
                  }));
                }}
                placeholder="Or custom target size in KB (e.g. 150)"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs font-mono text-white focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500">KB</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CROP & ASPECT RATIO */}
      {activeSection === 'crop' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Crop & Aspect Ratios
              </h4>
              <p className="text-[11px] text-slate-400">
                Choose a viral ratio or free-form crop rectangle
              </p>
            </div>
            <button
              onClick={() =>
                onChangeConfig((prev) => ({
                  ...prev,
                  crop: { ...prev.crop, active: !prev.crop.active },
                }))
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                config.crop.active
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Crop className="w-3.5 h-3.5" />
              <span>{config.crop.active ? 'Crop Mode On' : 'Activate Crop'}</span>
            </button>
          </div>

          {/* Aspect Ratio Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CROP_ASPECT_RATIOS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectCropRatio(item.id)}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  config.crop.active && config.crop.aspectRatio === item.id
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>

          {/* Crop Action Buttons */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="text-xs text-slate-300 flex items-center justify-between">
              <span>Interactive Crop Bounding Box</span>
              <span className="font-mono text-emerald-400 text-[11px]">
                {Math.round(config.crop.width * originalWidth)} ×{' '}
                {Math.round(config.crop.height * originalHeight)} px
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleApplyCropClick}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply & Crop Image Now</span>
              </button>
              <button
                onClick={() =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    crop: { ...prev.crop, active: false },
                  }))
                }
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              ✂️ Drag the crop rectangle on the canvas preview to frame your shot, then click Apply.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 3: FRAMES (Custom Upload + Presets) */}
      {activeSection === 'frames' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* A. Upload Custom Frame Option */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-950 border border-cyan-500/30 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Upload Custom Frame
                </h4>
              </div>
              {config.frame.customFrameUrl && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ACTIVE
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              Upload your own PNG frame, transparent border, organization logo border, or Polaroid cutout.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleCustomFrameUpload}
              className="hidden"
            />

            {!config.frame.customFrameUrl ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl border border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Select Custom Frame (PNG with transparency)</span>
              </button>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={config.frame.customFrameUrl}
                      alt="Custom Frame"
                      className="w-10 h-10 object-contain rounded-lg bg-slate-950 border border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">Custom Uploaded Frame</div>
                      <div className="text-[10px] text-cyan-400">Overlaying photo seamlessly</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      onClick={handleRemoveCustomFrame}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 cursor-pointer"
                      title="Remove custom frame"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Frame Fit Mode */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400">Frame Fit Mode</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'stretch', label: 'Stretch to Edge', desc: 'Exact border' },
                      { id: 'contain', label: 'Contain', desc: 'Keep aspect' },
                      { id: 'cover', label: 'Cover', desc: 'Fill canvas' },
                    ].map((fit) => (
                      <button
                        key={fit.id}
                        onClick={() =>
                          onChangeConfig((prev) => ({
                            ...prev,
                            frame: {
                              ...prev.frame,
                              customFrameFit: fit.id as 'stretch' | 'contain' | 'cover',
                            },
                          }))
                        }
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          (config.frame.customFrameFit || 'stretch') === fit.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {fit.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Opacity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Frame Opacity</span>
                    <span className="font-mono text-cyan-400">
                      {Math.round((config.frame.customFrameOpacity ?? 1) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={config.frame.customFrameOpacity ?? 1.0}
                    onChange={(e) =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        frame: { ...prev.frame, customFrameOpacity: parseFloat(e.target.value) },
                      }))
                    }
                    className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* B. Preset Themed Frames */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Preset Themed Frames
                </h4>
                <p className="text-[11px] text-slate-400">
                  Birthdays, Bamboo Events, Meetings, Party & Campaigns
                </p>
              </div>
              {config.frame.enabled && (
                <button
                  onClick={handleDisableFrame}
                  className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 cursor-pointer"
                >
                  <Ban className="w-3 h-3" />
                  <span>Turn Off Frame</span>
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All' },
                { id: 'birthday', label: '🎂 Birthday' },
                { id: 'events', label: '🎋 Events' },
                { id: 'party', label: '🎉 Party' },
                { id: 'meeting', label: '🏢 Meeting' },
                { id: 'political', label: '🗳️ Political' },
                { id: 'advertisement', label: '⚡ Sale/Ads' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFrameCategory(cat.id as FrameCategory | 'all')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedFrameCategory === cat.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
              {filteredFrames.map((t) => {
                const isActive =
                  config.frame.enabled &&
                  !config.frame.customFrameUrl &&
                  config.frame.templateId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleApplyFrame(t)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-cyan-950/60 to-slate-900 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{t.emoji}</span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold border"
                        style={{
                          backgroundColor: `${t.accentColor}18`,
                          borderColor: `${t.accentColor}40`,
                          color: t.accentColor,
                        }}
                      >
                        {t.badge}
                      </span>
                    </div>
                    <div className="text-xs font-bold leading-snug line-clamp-1">{t.name}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {t.defaultPrimary}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* C. Inside Photo Sizing, Height/Width & Position Adjustments */}
          {config.frame && config.frame.enabled && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 to-slate-950 border border-amber-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Inside Photo Sizing & Dimensions
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  INNER IMAGE CONTROLS
                </span>
              </div>

              <p className="text-[11px] text-slate-400">
                Adjust the photo inside the frame: reduce/increase height, width, overall zoom, or nudge position.
              </p>

              {/* Quick Size / Sizing Actions */}
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      adjustments: {
                        ...prev.adjustments,
                        zoom: Math.max(0.2, parseFloat(((prev.adjustments.zoom || 1) - 0.1).toFixed(2))),
                      },
                    }))
                  }
                  className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 cursor-pointer transition-all"
                  title="Reduce overall size"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Size -</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      adjustments: {
                        ...prev.adjustments,
                        zoom: Math.min(4.0, parseFloat(((prev.adjustments.zoom || 1) + 0.1).toFixed(2))),
                      },
                    }))
                  }
                  className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 cursor-pointer transition-all"
                  title="Increase overall size"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Size +</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      adjustments: {
                        ...prev.adjustments,
                        zoom: 0.72,
                        scaleX: 1,
                        scaleY: 1,
                        offsetX: 0,
                        offsetY: 0,
                      },
                    }))
                  }
                  className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-amber-300 cursor-pointer transition-all"
                  title="Fit whole photo inside frame cutout without cropping"
                >
                  <span>Fit Frame</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      adjustments: {
                        ...prev.adjustments,
                        zoom: 1,
                        scaleX: 1,
                        scaleY: 1,
                        offsetX: 0,
                        offsetY: 0,
                      },
                    }))
                  }
                  className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 cursor-pointer transition-all"
                  title="Reset to default fill and center"
                >
                  <span>Reset Fit</span>
                </button>
              </div>

              {/* Overall Zoom / Scale Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Overall Photo Scale (Zoom)</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {Math.round((config.adjustments.zoom || 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.05"
                  value={config.adjustments.zoom || 1}
                  onChange={(e) =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      adjustments: { ...prev.adjustments, zoom: parseFloat(e.target.value) },
                    }))
                  }
                  className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Inside Photo Width Adjustment (Reduce or Increase Width) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Inside Photo Width</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-bold">
                      {Math.round((config.adjustments.scaleX ?? 1) * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeConfig((prev) => ({
                          ...prev,
                          adjustments: { ...prev.adjustments, scaleX: 1 },
                        }))
                      }
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      100%
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        adjustments: {
                          ...prev.adjustments,
                          scaleX: Math.max(0.2, parseFloat(((prev.adjustments.scaleX ?? 1) - 0.05).toFixed(2))),
                        },
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                  >
                    - Width
                  </button>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.05"
                    value={config.adjustments.scaleX ?? 1}
                    onChange={(e) =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        adjustments: { ...prev.adjustments, scaleX: parseFloat(e.target.value) },
                      }))
                    }
                    className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        adjustments: {
                          ...prev.adjustments,
                          scaleX: Math.min(2.5, parseFloat(((prev.adjustments.scaleX ?? 1) + 0.05).toFixed(2))),
                        },
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                  >
                    + Width
                  </button>
                </div>
              </div>

              {/* Inside Photo Height Adjustment (Reduce or Increase Height) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Inside Photo Height</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-fuchsia-400 font-bold">
                      {Math.round((config.adjustments.scaleY ?? 1) * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeConfig((prev) => ({
                          ...prev,
                          adjustments: { ...prev.adjustments, scaleY: 1 },
                        }))
                      }
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      100%
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        adjustments: {
                          ...prev.adjustments,
                          scaleY: Math.max(0.2, parseFloat(((prev.adjustments.scaleY ?? 1) - 0.05).toFixed(2))),
                        },
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                  >
                    - Height
                  </button>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.05"
                    value={config.adjustments.scaleY ?? 1}
                    onChange={(e) =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        adjustments: { ...prev.adjustments, scaleY: parseFloat(e.target.value) },
                      }))
                    }
                    className="w-full accent-fuchsia-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        adjustments: {
                          ...prev.adjustments,
                          scaleY: Math.min(2.5, parseFloat(((prev.adjustments.scaleY ?? 1) + 0.05).toFixed(2))),
                        },
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                  >
                    + Height
                  </button>
                </div>
              </div>

              {/* Pan Position Nudges & D-pad */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Position Alignment</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    X: {config.adjustments.offsetX}px | Y: {config.adjustments.offsetY}px
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        adjustments: { ...prev.adjustments, offsetX: (prev.adjustments.offsetX || 0) - 25 },
                      }))
                    }
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                    title="Nudge Left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        adjustments: { ...prev.adjustments, offsetY: (prev.adjustments.offsetY || 0) - 25 },
                      }))
                    }
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                    title="Nudge Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Up</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        adjustments: { ...prev.adjustments, offsetX: 0, offsetY: 0 },
                      }))
                    }
                    className="py-1.5 px-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold text-cyan-300 flex items-center justify-center cursor-pointer"
                    title="Center in Frame"
                  >
                    <span>Center</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        adjustments: { ...prev.adjustments, offsetY: (prev.adjustments.offsetY || 0) + 25 },
                      }))
                    }
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                    title="Nudge Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Down</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        adjustments: { ...prev.adjustments, offsetX: (prev.adjustments.offsetX || 0) + 25 },
                      }))
                    }
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                    title="Nudge Right"
                  >
                    <span>Right</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: SHAPES & BORDERS */}
      {activeSection === 'shapes' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Viral Cutout Shapes
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rectangle' as ImageShape, label: 'Rectangle', icon: Square },
                { id: 'rounded' as ImageShape, label: 'Rounded', icon: Square },
                { id: 'squircle' as ImageShape, label: 'Squircle', icon: Square },
                { id: 'circle' as ImageShape, label: 'Circle', icon: Circle },
                { id: 'heart' as ImageShape, label: 'Heart', icon: Heart },
                { id: 'star' as ImageShape, label: 'Star', icon: Star },
                { id: 'hexagon' as ImageShape, label: 'Hexagon', icon: Hexagon },
                { id: 'shield' as ImageShape, label: 'Shield', icon: Shield },
                { id: 'diamond' as ImageShape, label: 'Diamond', icon: Gem },
              ].map((s) => {
                const IconComponent = s.icon;
                const isSelected = config.shape.shape === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleShapeSelect(s.id)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-semibold">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Border Width & Color */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider">
                Border Width
              </span>
              <span className="font-mono text-cyan-400">{config.shape.borderWidth}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="1"
              value={config.shape.borderWidth}
              onChange={(e) =>
                onChangeConfig((prev) => ({
                  ...prev,
                  shape: { ...prev.shape, borderWidth: parseInt(e.target.value) },
                }))
              }
              className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />

            {config.shape.borderWidth > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400">Color:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        onChangeConfig((prev) => ({
                          ...prev,
                          shape: { ...prev.shape, borderColor: c },
                        }))
                      }
                      className={`w-6 h-6 rounded-full border cursor-pointer transition-transform ${
                        config.shape.borderColor.toLowerCase() === c.toLowerCase()
                          ? 'scale-125 border-cyan-400 ring-2 ring-cyan-500/40'
                          : 'border-slate-700 hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: ADJUST & FILTERS */}
      {activeSection === 'adjust' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quick Filter Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Click Filter Presets</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FILTER_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      adjustments: {
                        ...prev.adjustments,
                        ...p.adjustments,
                      },
                    }))
                  }
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 text-left cursor-pointer transition-all hover:bg-slate-900"
                >
                  <div className="text-xs font-bold text-white">{p.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Orientation & Rotate */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Rotate & Flip
            </span>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    adjustments: {
                      ...prev.adjustments,
                      rotation: (prev.adjustments.rotation + 90) % 360,
                    },
                  }))
                }
                className="flex items-center justify-center gap-1 p-2 rounded-xl bg-slate-950/70 border border-slate-800 hover:text-white text-slate-300 text-xs font-semibold cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>+90°</span>
              </button>

              <button
                onClick={() =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    adjustments: {
                      ...prev.adjustments,
                      rotation: (prev.adjustments.rotation - 90 + 360) % 360,
                    },
                  }))
                }
                className="flex items-center justify-center gap-1 p-2 rounded-xl bg-slate-950/70 border border-slate-800 hover:text-white text-slate-300 text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>-90°</span>
              </button>

              <button
                onClick={() =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    adjustments: {
                      ...prev.adjustments,
                      flipH: !prev.adjustments.flipH,
                    },
                  }))
                }
                className={`flex items-center justify-center gap-1 p-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                  config.adjustments.flipH
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Flip H</span>
              </button>

              <button
                onClick={() =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    adjustments: {
                      ...prev.adjustments,
                      flipV: !prev.adjustments.flipV,
                    },
                  }))
                }
                className={`flex items-center justify-center gap-1 p-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                  config.adjustments.flipV
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <FlipVertical className="w-3.5 h-3.5" />
                <span>Flip V</span>
              </button>
            </div>
          </div>

          {/* Precision Sliders */}
          <div className="space-y-4">
            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Brightness</span>
                <span className="font-mono text-cyan-400">{config.adjustments.brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="2"
                value={config.adjustments.brightness}
                onChange={(e) =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    adjustments: { ...prev.adjustments, brightness: parseInt(e.target.value) },
                  }))
                }
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Contrast</span>
                <span className="font-mono text-cyan-400">{config.adjustments.contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="2"
                value={config.adjustments.contrast}
                onChange={(e) =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    adjustments: { ...prev.adjustments, contrast: parseInt(e.target.value) },
                  }))
                }
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Saturation</span>
                <span className="font-mono text-cyan-400">{config.adjustments.saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={config.adjustments.saturation}
                onChange={(e) =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    adjustments: { ...prev.adjustments, saturation: parseInt(e.target.value) },
                  }))
                }
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Warmth / Temperature */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Warmth / Temperature</span>
                <span className="font-mono text-amber-400">
                  {config.adjustments.temperature > 0
                    ? `+${config.adjustments.temperature} Warm`
                    : config.adjustments.temperature < 0
                    ? `${config.adjustments.temperature} Cool`
                    : '0 Neutral'}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={config.adjustments.temperature || 0}
                onChange={(e) =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    adjustments: { ...prev.adjustments, temperature: parseInt(e.target.value) },
                  }))
                }
                className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Vignette */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Cinematic Vignette</span>
                <span className="font-mono text-cyan-400">{config.adjustments.vignette || 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={config.adjustments.vignette || 0}
                onChange={(e) =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    adjustments: { ...prev.adjustments, vignette: parseInt(e.target.value) },
                  }))
                }
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Hue Rotate */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Hue Color Shift</span>
                <span className="font-mono text-cyan-400">{config.adjustments.hueRotate || 0}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="10"
                value={config.adjustments.hueRotate || 0}
                onChange={(e) =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    adjustments: { ...prev.adjustments, hueRotate: parseInt(e.target.value) },
                  }))
                }
                className="w-full accent-fuchsia-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Sharpness (Unsharp Mask) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Sharpness (Edge Boost)</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {config.adjustments.sharpness || 0}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                value={config.adjustments.sharpness || 0}
                onChange={(e) =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    adjustments: { ...prev.adjustments, sharpness: parseInt(e.target.value) },
                  }))
                }
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Clarity */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Clarity & Texture Pop</span>
                <span className="font-mono text-amber-400 font-bold">
                  {config.adjustments.clarity || 0}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                value={config.adjustments.clarity || 0}
                onChange={(e) =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    adjustments: { ...prev.adjustments, clarity: parseInt(e.target.value) },
                  }))
                }
                className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Blur */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Blur Effect</span>
                <span className="font-mono text-cyan-400">{config.adjustments.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={config.adjustments.blur}
                onChange={(e) =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    adjustments: { ...prev.adjustments, blur: parseFloat(e.target.value) },
                  }))
                }
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: TEXT & WATERMARK */}
      {activeSection === 'watermark' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Text & Watermark Tool
              </h4>
              <p className="text-[11px] text-slate-400">
                Overlay custom branding, signature, or banner text
              </p>
            </div>
            <button
              onClick={() =>
                onChangeConfig((prev) => ({
                  ...prev,
                  watermark: { ...prev.watermark, enabled: !prev.watermark.enabled },
                }))
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                config.watermark.enabled
                  ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {config.watermark.enabled ? 'Watermark Enabled' : 'Enable Watermark'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">Watermark Text</span>
              <input
                type="text"
                value={config.watermark.text}
                onChange={(e) =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    watermark: { ...prev.watermark, text: e.target.value },
                  }))
                }
                placeholder="e.g. © 2026 Studio Branding"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
              />
            </div>

            {/* Position Picker */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400">Position Placement</span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'top-left', label: 'Top-L' },
                  { id: 'top-right', label: 'Top-R' },
                  { id: 'center', label: 'Center' },
                  { id: 'bottom-left', label: 'Btm-L' },
                  { id: 'bottom-right', label: 'Btm-R' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        watermark: {
                          ...prev.watermark,
                          position: pos.id as
                            | 'top-left'
                            | 'top-right'
                            | 'center'
                            | 'bottom-left'
                            | 'bottom-right',
                        },
                      }))
                    }
                    className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                      config.watermark.position === pos.id
                        ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size & Opacity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Font Size</span>
                  <span className="font-mono text-cyan-400">{config.watermark.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="72"
                  value={config.watermark.fontSize}
                  onChange={(e) =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      watermark: { ...prev.watermark, fontSize: parseInt(e.target.value) },
                    }))
                  }
                  className="w-full accent-fuchsia-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Opacity</span>
                  <span className="font-mono text-cyan-400">
                    {Math.round(config.watermark.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={config.watermark.opacity}
                  onChange={(e) =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      watermark: { ...prev.watermark, opacity: parseFloat(e.target.value) },
                    }))
                  }
                  className="w-full accent-fuchsia-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: QR CODE OVERLAY */}
      {activeSection === 'qr' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-purple-400" />
                <span>QR Code Image Overlay</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Stamp a scannable QR code onto this image (Website, UPI Pay, Wi-Fi, WhatsApp)
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onChangeConfig((prev) => ({
                  ...prev,
                  watermark: {
                    ...prev.watermark,
                    qrEnabled: !prev.watermark.qrEnabled,
                    qrContent: prev.watermark.qrContent || 'https://www.reeyanshtech.in/',
                  },
                }))
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                config.watermark.qrEnabled
                  ? 'bg-purple-500 border-purple-400 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {config.watermark.qrEnabled ? 'QR Active' : 'Enable QR'}
            </button>
          </div>

          {config.watermark.qrEnabled && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-purple-500/30 space-y-4">
              {/* QR Content Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">QR Code Target URL / Text</label>
                <input
                  type="text"
                  value={config.watermark.qrContent || ''}
                  onChange={(e) =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      watermark: { ...prev.watermark, qrContent: e.target.value },
                    }))
                  }
                  placeholder="https://yourwebsite.com or UPI ID or Wi-Fi"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl text-xs font-mono text-white focus:outline-none"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Reeyansh Tech', val: 'https://www.reeyanshtech.in/' },
                  { label: 'Instagram', val: 'https://instagram.com/' },
                  { label: 'Google Maps', val: 'https://maps.google.com/' },
                  { label: 'WhatsApp', val: 'https://wa.me/919876543210' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        watermark: { ...prev.watermark, qrContent: item.val },
                      }))
                    }
                    className="px-2.5 py-1 text-[10px] rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-500 text-slate-300 hover:text-white cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* QR Position on Canvas */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white">QR Code Position on Image</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'bottom-right' as const, label: 'Bottom Right' },
                    { id: 'bottom-left' as const, label: 'Bottom Left' },
                    { id: 'top-right' as const, label: 'Top Right' },
                    { id: 'top-left' as const, label: 'Top Left' },
                    { id: 'center' as const, label: 'Center' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() =>
                        onChangeConfig((prev) => ({
                          ...prev,
                          watermark: { ...prev.watermark, qrPosition: pos.id },
                        }))
                      }
                      className={`py-2 px-1 text-center rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                        (config.watermark.qrPosition || 'bottom-right') === pos.id
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Size Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">QR Code Size</span>
                  <span className="font-mono text-purple-400 font-bold">
                    {config.watermark.qrSize || 120}px
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="280"
                  step="5"
                  value={config.watermark.qrSize || 120}
                  onChange={(e) =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      watermark: { ...prev.watermark, qrSize: parseInt(e.target.value) },
                    }))
                  }
                  className="w-full accent-purple-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Bottom Label on QR Card */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Bottom Label Text (Optional)</label>
                <input
                  type="text"
                  value={config.watermark.qrLabel || ''}
                  onChange={(e) =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      watermark: { ...prev.watermark, qrLabel: e.target.value },
                    }))
                  }
                  placeholder="e.g. SCAN ME or SCAN TO PAY"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              {/* Color Settings */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">QR Modules Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.watermark.qrFgColor || '#000000'}
                      onChange={(e) =>
                        onChangeConfig((prev) => ({
                          ...prev,
                          watermark: { ...prev.watermark, qrFgColor: e.target.value },
                        }))
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">
                      {config.watermark.qrFgColor || '#000000'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">Card Background</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.watermark.qrBgColor || '#ffffff'}
                      onChange={(e) =>
                        onChangeConfig((prev) => ({
                          ...prev,
                          watermark: { ...prev.watermark, qrBgColor: e.target.value },
                        }))
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">
                      {config.watermark.qrBgColor || '#ffffff'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 8: EXPORT FORMAT */}
      {activeSection === 'export' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Output Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'image/png' as ExportFormat, label: 'PNG', badge: 'Alpha Transparency' },
                { id: 'image/webp' as ExportFormat, label: 'WebP', badge: 'Best Compression' },
                { id: 'image/jpeg' as ExportFormat, label: 'JPEG', badge: 'Standard Photo' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() =>
                    onChangeConfig((prev) => ({ ...prev, exportFormat: fmt.id }))
                  }
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    config.exportFormat === fmt.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-bold">{fmt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{fmt.badge}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Export Quality Control */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Export Image Quality
                </h4>
                <p className="text-[11px] text-slate-400">
                  {config.exportFormat === 'image/png'
                    ? 'PNG is lossless by default with alpha transparency'
                    : 'Adjust output quality & compression level'}
                </p>
              </div>
              <span className="font-mono text-sm font-bold text-amber-400">
                {Math.round((config.resize.quality || 0.95) * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.01"
              value={config.resize.quality || 0.95}
              onChange={(e) => {
                const q = parseFloat(e.target.value);
                onChangeConfig((prev) => ({
                  ...prev,
                  resize: { ...prev.resize, quality: q },
                }));
              }}
              className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { q: 0.8, label: '80% Good' },
                { q: 0.9, label: '90% High' },
                { q: 0.95, label: '95% Pro' },
                { q: 1.0, label: '100% Ultra' },
              ].map((item) => (
                <button
                  key={item.q}
                  type="button"
                  onClick={() =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      resize: { ...prev.resize, quality: item.q },
                    }))
                  }
                  className={`py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                    Math.abs((config.resize.quality || 0.95) - item.q) < 0.02
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Output Filename
            </label>
            <input
              type="text"
              value={config.outputFilename}
              onChange={(e) =>
                onChangeConfig((prev) => ({ ...prev, outputFilename: e.target.value }))
              }
              placeholder="e.g. edited_masterpiece"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm font-mono text-white focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
