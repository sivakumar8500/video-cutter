import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { ImageControls } from './ImageControls';
import { ImageCanvasPreview } from './ImageCanvasPreview';
import type { ImageStudioConfig, LoadedImageInfo } from '../../types/imageStudio';
import { sanitizeBaseFilename } from '../../utils/formatters';

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
      text: 'SplitStream Studio',
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
      {/* Hero Heading for Image Studio */}
      {!imageInfo && (
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <span>✨ 100% Client-Side In-Browser Image Studio</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Resize, Compress & Crop Any Image Into Shapes
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Reduce file size to exact KB targets, crop into viral shapes (Circle, Squircle, Heart, Star, Hexagon, Shield), customize borders, and apply instant enhancements.
          </p>
        </div>
      )}

      {/* State 1: Upload Dropzone */}
      {!imageInfo ? (
        <ImageUploader onImageLoaded={handleImageLoaded} />
      ) : (
        /* State 2: Active Image Workspace */
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
                    text: 'SplitStream Studio',
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
      )}
    </div>
  );
};
