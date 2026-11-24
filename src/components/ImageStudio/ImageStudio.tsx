import React, { useState } from 'react';
import { ArrowLeft, X, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { ImageControls } from './ImageControls';
import { ImageCanvasPreview } from './ImageCanvasPreview';
import type { ImageStudioConfig, LoadedImageInfo } from '../../types/imageStudio';
import { sanitizeBaseFilename, formatFileSize } from '../../utils/formatters';

export const ImageStudio: React.FC = () => {
  const [imageInfo, setImageInfo] = useState<LoadedImageInfo | null>(null);

  const [config, setConfig] = useState<ImageStudioConfig>({
    resize: {
      width: 800,
      height: 600,
      lockAspectRatio: true,
      scalePercent: 100,
      quality: 0.92,
    },
    crop: {
      active: false,
      aspectRatio: 'free',
      x: 0.05,
      y: 0.05,
      width: 0.9,
      height: 0.9,
    },
    shape: {
      shape: 'rectangle',
      cornerRadius: 28,
      borderWidth: 0,
      borderColor: '#38bdf8',
      borderStyle: 'solid',
      shadow: false,
      shadowBlur: 15,
      shadowColor: 'rgba(0,0,0,0.5)',
      backgroundMode: 'transparent',
      backgroundColor: '#000000',
    },
    adjustments: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      temperature: 0,
      vignette: 0,
      hueRotate: 0,
      rotation: 0,
      flipH: false,
      flipV: false,
      offsetX: 0,
      offsetY: 0,
      zoom: 1,
    },
    frame: {
      enabled: false,
      category: 'none',
      templateId: 'bday-balloons',
      primaryText: 'HAPPY BIRTHDAY! 🎂',
      secondaryText: 'Wishing you endless joy, laughter & happiness!',
      accentColor: '#ec4899',
      showBanner: true,
      frameBorderWidth: 16,
      customFrameFit: 'stretch',
      customFrameOpacity: 1.0,
    },
    watermark: {
      enabled: false,
      text: 'VidCuts Studio',
      fontSize: 24,
      color: '#ffffff',
      position: 'bottom-right',
      opacity: 0.85,
      showBackground: true,
    },
    exportFormat: 'image/png',
    outputFilename: 'resized_image',
  });

  const handleImageLoaded = (info: LoadedImageInfo) => {
    setImageInfo(info);
    const baseName = sanitizeBaseFilename(info.name) || 'resized_image';
    setConfig((prev) => ({
      ...prev,
      resize: {
        ...prev.resize,
        width: info.originalWidth,
        height: info.originalHeight,
        scalePercent: 100,
      },
      outputFilename: `${baseName}_edited`,
    }));
  };

  const handleApplyCroppedImage = (newInfo: LoadedImageInfo) => {
    setImageInfo(newInfo);
    setConfig((prev) => ({
      ...prev,
      resize: {
        ...prev.resize,
        width: newInfo.originalWidth,
        height: newInfo.originalHeight,
        scalePercent: 100,
      },
      crop: {
        ...prev.crop,
        active: false,
      },
    }));
  };

  const handleResetImage = () => {
    if (imageInfo?.previewUrl) {
      URL.revokeObjectURL(imageInfo.previewUrl);
    }
    setImageInfo(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Hero Heading for Image Studio ── */}
      {!imageInfo && (
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 border border-green-300 text-green-700 text-xs font-bold shadow-sm">
            <span>🖼️ 100% Client-Side In-Browser Image Studio</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black leading-tight">
            Resize, Compress &amp;{' '}
            <span className="text-green-600">
              Crop Into Shapes
            </span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Reduce file size to exact KB targets, crop into viral shapes (Circle, Squircle, Heart, Star, Hexagon, Shield), customize borders, and apply instant enhancements.
          </p>
        </div>
      )}

      {/* State 1: Upload Dropzone */}
      {!imageInfo ? (
        <ImageUploader onImageLoaded={handleImageLoaded} />
      ) : (
        /* State 2: Active Image Workspace */
        <div className="space-y-6">
          {/* Top Breadcrumb & Cancel / Back Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetImage}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-2xs group"
                title="Cancel editing and return to image upload"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Cancel / Back to Upload</span>
              </button>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                    {imageInfo.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {imageInfo.originalWidth} × {imageInfo.originalHeight} px • {formatFileSize(imageInfo.originalSizeBytes)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetImage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer transition-all"
                title="Discard edits and upload another image"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Discard &amp;</span> Change Image
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">100% In-Browser Privacy</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Controls Column */}
            <div className="lg:col-span-6 space-y-6">
              <ImageControls
                config={config}
                onChangeConfig={setConfig}
                originalWidth={imageInfo.originalWidth}
                originalHeight={imageInfo.originalHeight}
                imageInfo={imageInfo}
                onApplyCrop={handleApplyCroppedImage}
                onUpscaleBaseImage={handleImageLoaded}
                onCancel={handleResetImage}
                onReset={() => {
                  setConfig((prev) => ({
                    ...prev,
                    resize: {
                      width: imageInfo.originalWidth,
                      height: imageInfo.originalHeight,
                      lockAspectRatio: true,
                      scalePercent: 100,
                      quality: 0.92,
                    },
                    crop: {
                      active: false,
                      aspectRatio: 'free',
                      x: 0.05,
                      y: 0.05,
                      width: 0.9,
                      height: 0.9,
                    },
                    shape: {
                      ...prev.shape,
                      shape: 'rectangle',
                      borderWidth: 0,
                    },
                    adjustments: {
                      brightness: 100,
                      contrast: 100,
                      saturation: 100,
                      blur: 0,
                      grayscale: 0,
                      sepia: 0,
                      invert: 0,
                      temperature: 0,
                      vignette: 0,
                      hueRotate: 0,
                      rotation: 0,
                      flipH: false,
                      flipV: false,
                      offsetX: 0,
                      offsetY: 0,
                      zoom: 1,
                    },
                    frame: {
                      enabled: false,
                      category: 'none',
                      templateId: 'bday-balloons',
                      primaryText: 'HAPPY BIRTHDAY! 🎂',
                      secondaryText: 'Wishing you endless joy, laughter & happiness!',
                      accentColor: '#ec4899',
                      showBanner: true,
                      frameBorderWidth: 16,
                      customFrameUrl: undefined,
                      customFrameElement: undefined,
                    },
                    watermark: {
                      enabled: false,
                      text: 'VidCuts Studio',
                      fontSize: 24,
                      color: '#ffffff',
                      position: 'bottom-right',
                      opacity: 0.85,
                      showBackground: true,
                    },
                  }));
                }}
              />
            </div>

            {/* Live Canvas Preview Column */}
            <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-24">
              <ImageCanvasPreview
                imageInfo={imageInfo}
                config={config}
                onChangeConfig={setConfig}
                onResetImage={handleResetImage}
                onApplyCrop={handleApplyCroppedImage}
                onLoadNewImage={handleImageLoaded}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
