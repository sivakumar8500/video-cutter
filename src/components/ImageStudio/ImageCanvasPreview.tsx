import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Download,
  Copy,
  Check,
  Eye,
  RefreshCw,
  Crop,
  Globe,
  Link as LinkIcon,
  ArrowRight,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import type { ImageStudioConfig, LoadedImageInfo } from '../../types/imageStudio';
import {
  renderImageToCanvas,
  exportCanvasToBlob,
  applyCropToImage,
  loadImageFromUrl,
} from '../../utils/imageStudioCanvas';
import { formatFileSize } from '../../utils/formatters';

interface ImageCanvasPreviewProps {
  imageInfo: LoadedImageInfo;
  config: ImageStudioConfig;
  onChangeConfig?: React.Dispatch<React.SetStateAction<ImageStudioConfig>>;
  onResetImage: () => void;
  onApplyCrop?: (newImageInfo: LoadedImageInfo) => void;
  onLoadNewImage?: (newImageInfo: LoadedImageInfo) => void;
}

export const ImageCanvasPreview: React.FC<ImageCanvasPreviewProps> = ({
  imageInfo,
  config,
  onChangeConfig,
  onResetImage,
  onApplyCrop,
  onLoadNewImage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  // Load from URL State
  const [showUrlBar, setShowUrlBar] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleFetchUrl = async (urlOverride?: string) => {
    const target = (urlOverride || urlInput).trim();
    if (!target) {
      setUrlError('Please enter an image URL');
      return;
    }
    setUrlError(null);
    setIsLoadingUrl(true);
    try {
      const newInfo = await loadImageFromUrl(target);
      onLoadNewImage?.(newInfo);
      setShowUrlBar(false);
      setUrlInput('');
    } catch (err: unknown) {
      setUrlError(err instanceof Error ? err.message : 'Failed to load image from URL');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleQuickQualityBoost = () => {
    if (!onChangeConfig) return;
    const isAlreadyUpscaled =
      config.resize.scalePercent > 100 ||
      (config.adjustments.sharpness ?? 0) > 0 ||
      config.resize.quality >= 1.0;

    if (!isAlreadyUpscaled) {
      // 2x HD Upscale & Detail Boost
      const newW = Math.round(imageInfo.originalWidth * 2);
      const newH = Math.round(imageInfo.originalHeight * 2);
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
    } else {
      // Reset back to original 1x
      onChangeConfig((prev) => ({
        ...prev,
        resize: {
          ...prev.resize,
          width: imageInfo.originalWidth,
          height: imageInfo.originalHeight,
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
    }
  };

  // Pan drag reference
  const dragStartRef = useRef<{
    x: number;
    y: number;
    startOffsetX: number;
    startOffsetY: number;
  }>({ x: 0, y: 0, startOffsetX: 0, startOffsetY: 0 });

  // Crop Drag state
  const [cropDragMode, setCropDragMode] = useState<string | null>(null);
  const cropStartRef = useRef<{
    clientX: number;
    clientY: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>({ clientX: 0, clientY: 0, x: 0, y: 0, width: 0, height: 0 });

  // Re-render canvas whenever image or configuration changes
  const renderPreview = useCallback(() => {
    if (!canvasRef.current || !imageInfo.imgElement) return;
    renderImageToCanvas(canvasRef.current, imageInfo, config);

    // Calculate estimated blob size in debounced manner
    exportCanvasToBlob(
      canvasRef.current,
      config.exportFormat,
      config.resize.quality,
      config.resize.targetSizeKb
    )
      .then((res) => {
        setEstimatedSize(res.sizeBytes);
      })
      .catch(() => {
        // ignore
      });
  }, [imageInfo, config]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  // Handle Drag / Pan with Cursor (when NOT cropping)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (config.crop?.active) return;
    if (!onChangeConfig) return;
    setIsPanning(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffsetX: config.adjustments.offsetX || 0,
      startOffsetY: config.adjustments.offsetY || 0,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (config.crop?.active) return;
    if (!isPanning || !onChangeConfig || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const scaleFactor = canvas.width / (canvas.clientWidth || 1) / (zoom || 1);
    const deltaX = (e.clientX - dragStartRef.current.x) * scaleFactor;
    const deltaY = (e.clientY - dragStartRef.current.y) * scaleFactor;

    onChangeConfig((prev) => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        offsetX: Math.round(dragStartRef.current.startOffsetX + deltaX),
        offsetY: Math.round(dragStartRef.current.startOffsetY + deltaY),
      },
    }));
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch handlers for mobile / touchpads
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (config.crop?.active) return;
    if (!onChangeConfig || e.touches.length === 0) return;
    setIsPanning(true);
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      startOffsetX: config.adjustments.offsetX || 0,
      startOffsetY: config.adjustments.offsetY || 0,
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (config.crop?.active) return;
    if (!isPanning || !onChangeConfig || !canvasRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const scaleFactor = canvas.width / (canvas.clientWidth || 1) / (zoom || 1);
    const deltaX = (touch.clientX - dragStartRef.current.x) * scaleFactor;
    const deltaY = (touch.clientY - dragStartRef.current.y) * scaleFactor;

    onChangeConfig((prev) => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        offsetX: Math.round(dragStartRef.current.startOffsetX + deltaX),
        offsetY: Math.round(dragStartRef.current.startOffsetY + deltaY),
      },
    }));
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  // Handle Wheel Zoom on Canvas
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!onChangeConfig) return;
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
    const currentZoom = config.adjustments.zoom || 1;
    const nextZoom = Math.max(0.2, Math.min(4.0, parseFloat((currentZoom + zoomDelta).toFixed(2))));

    onChangeConfig((prev) => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        zoom: nextZoom,
      },
    }));
  };

  // Reset Center Position
  const handleResetPosition = () => {
    if (!onChangeConfig) return;
    onChangeConfig((prev) => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        offsetX: 0,
        offsetY: 0,
        zoom: 1,
      },
    }));
  };

  // --- INTERACTIVE CROP BOX HANDLERS ---
  const handleCropHandleMouseDown = (mode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCropDragMode(mode);
    cropStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      x: config.crop.x,
      y: config.crop.y,
      width: config.crop.width,
      height: config.crop.height,
    };
  };

  useEffect(() => {
    if (!cropDragMode || !onChangeConfig || !canvasRef.current) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const canvasW = rect.width || 1;
      const canvasH = rect.height || 1;

      const dx = (e.clientX - cropStartRef.current.clientX) / canvasW;
      const dy = (e.clientY - cropStartRef.current.clientY) / canvasH;

      const orig = cropStartRef.current;
      let newX = orig.x;
      let newY = orig.y;
      let newW = orig.width;
      let newH = orig.height;

      if (cropDragMode === 'move') {
        newX = Math.max(0, Math.min(1 - orig.width, orig.x + dx));
        newY = Math.max(0, Math.min(1 - orig.height, orig.y + dy));
      } else {
        if (cropDragMode.includes('e')) {
          newW = Math.max(0.1, Math.min(1 - orig.x, orig.width + dx));
        }
        if (cropDragMode.includes('s')) {
          newH = Math.max(0.1, Math.min(1 - orig.y, orig.height + dy));
        }
        if (cropDragMode.includes('w')) {
          const maxLeft = orig.x + orig.width - 0.1;
          newX = Math.max(0, Math.min(maxLeft, orig.x + dx));
          newW = orig.width - (newX - orig.x);
        }
        if (cropDragMode.includes('n')) {
          const maxTop = orig.y + orig.height - 0.1;
          newY = Math.max(0, Math.min(maxTop, orig.y + dy));
          newH = orig.height - (newY - orig.y);
        }
      }

      onChangeConfig((prev) => ({
        ...prev,
        crop: {
          ...prev.crop,
          x: parseFloat(newX.toFixed(3)),
          y: parseFloat(newY.toFixed(3)),
          width: parseFloat(newW.toFixed(3)),
          height: parseFloat(newH.toFixed(3)),
        },
      }));
    };

    const handleWindowMouseUp = () => {
      setCropDragMode(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [cropDragMode, onChangeConfig]);

  // Apply Crop directly from Canvas Preview
  const handleApplyCrop = async () => {
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

  // Handle Download
  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const { url } = await exportCanvasToBlob(
        canvasRef.current,
        config.exportFormat,
        config.resize.quality,
        config.resize.targetSizeKb
      );

      const extMap = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/webp': 'webp',
      };
      const ext = extMap[config.exportFormat] || 'png';
      const cleanName = config.outputFilename.trim() || 'resized_image';
      const filename = `${cleanName}.${ext}`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Copy to Clipboard
  const handleCopyToClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      const { blob } = await exportCanvasToBlob(
        canvasRef.current,
        'image/png', // PNG is standard for clipboard
        1.0
      );

      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const hasCustomPosition =
    config.adjustments.offsetX !== 0 ||
    config.adjustments.offsetY !== 0 ||
    (config.adjustments.zoom && config.adjustments.zoom !== 1);

  return (
    <div
      ref={containerRef}
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl flex flex-col justify-between"
    >
      {/* Top Header: Comparison stats & actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Live Studio Canvas</span>
            {config.crop?.active && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                CROP ACTIVE
              </span>
            )}
            {config.shape.shape !== 'rectangle' && !config.crop?.active && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {config.shape.shape.toUpperCase()}
              </span>
            )}
            {config.frame && config.frame.enabled && !config.crop?.active && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {config.frame.customFrameUrl ? 'CUSTOM FRAME' : 'FRAME ON'}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
            <span>{config.resize.width} × {config.resize.height} px</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
              {Math.round((config.resize.quality || 0.95) * 100)}% Q
            </span>
            {config.resize.scalePercent > 100 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {Math.round((config.resize.width / imageInfo.originalWidth) * 10) / 10}x HD
              </span>
            )}
            {config.adjustments.sharpness ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                +{config.adjustments.sharpness}% Sharp
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="px-2 py-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
              title="Zoom canvas view out"
            >
              -
            </button>
            <span className="font-mono text-slate-300 text-[11px] px-1">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.25))}
              className="px-2 py-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
              title="Zoom canvas view in"
            >
              +
            </button>
          </div>

          {/* Reset Position (Center) */}
          {hasCustomPosition && (
            <button
              onClick={handleResetPosition}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold cursor-pointer transition-all"
              title="Center image position (0, 0)"
            >
              Center Image
            </button>
          )}

          {/* Quick Quality Boost button */}
          {onChangeConfig && (
            <button
              onClick={handleQuickQualityBoost}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                config.resize.scalePercent > 100 || (config.adjustments.sharpness ?? 0) > 0
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
              }`}
              title="Toggle 2x HD Quality Boost & Sharpness"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {config.resize.scalePercent > 100
                  ? `${Math.round((config.resize.width / imageInfo.originalWidth) * 10) / 10}x HD Active`
                  : 'Increase Quality'}
              </span>
            </button>
          )}

          {/* Load from Web URL button */}
          {onLoadNewImage && (
            <button
              onClick={() => setShowUrlBar(!showUrlBar)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showUrlBar
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/30'
              }`}
              title="Load image from URL"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>From URL</span>
            </button>
          )}

          {/* Pick another image */}
          <button
            onClick={onResetImage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            title="Upload another image"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Image</span>
          </button>
        </div>
      </div>

      {/* Inline URL Input Bar */}
      {showUrlBar && (
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30 shadow-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load Any Image by Web Link / URL</span>
            </span>
            <button
              type="button"
              onClick={() => setShowUrlBar(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFetchUrl();
                }}
                placeholder="Paste any image URL e.g. https://..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => handleFetchUrl()}
              disabled={isLoadingUrl || !urlInput.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shrink-0"
            >
              {isLoadingUrl ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Load</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
          {urlError && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{urlError}</span>
            </div>
          )}
        </div>
      )}

      {/* Canvas Viewport Area */}
      <div className="relative min-h-[360px] sm:min-h-[440px] rounded-2xl bg-[#070b13] border border-slate-800/80 overflow-hidden flex items-center justify-center p-6 select-none group">
        {/* Subtle checkerboard for alpha transparency */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(45deg, #334155 25%, transparent 25%), linear-gradient(-45deg, #334155 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #334155 75%), linear-gradient(-45deg, transparent 75%, #334155 75%)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
          }}
        />

        {/* Floating Hint: Move via Cursor or Crop Mode */}
        {!config.crop?.active ? (
          <div className="absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] text-cyan-400 backdrop-blur-md shadow-md">
            <span>✋ Click & drag to move image</span>
            <span className="text-slate-500">•</span>
            <span>Scroll to zoom</span>
          </div>
        ) : (
          <div className="absolute top-3 left-3 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-[11px] text-emerald-300 backdrop-blur-md shadow-lg">
            <Crop className="w-3.5 h-3.5" />
            <span>Drag box or handles to crop</span>
          </div>
        )}

        {/* Position coordinate indicator when moved */}
        {hasCustomPosition && !config.crop?.active && (
          <div className="absolute top-3 right-3 z-20 pointer-events-none px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-300 backdrop-blur-md">
            X: {config.adjustments.offsetX}px | Y: {config.adjustments.offsetY}px |{' '}
            {Math.round((config.adjustments.zoom || 1) * 100)}%
          </div>
        )}

        {/* Original preview on hold */}
        {showOriginal ? (
          <img
            src={imageInfo.previewUrl}
            alt="Original"
            className="max-h-[380px] max-w-full object-contain rounded-lg shadow-2xl relative z-10 transition-transform"
            style={{ transform: `scale(${zoom})` }}
          />
        ) : (
          <div
            className="relative flex items-center justify-center max-w-full"
            style={{ transform: `scale(${zoom})` }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              className={`max-h-[380px] max-w-full object-contain rounded-lg shadow-2xl relative z-10 transition-transform duration-100 ${
                config.crop?.active ? 'cursor-default' : isPanning ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              title={
                config.crop?.active
                  ? 'Crop Mode Active'
                  : 'Click & drag with cursor to reposition image inside frame'
              }
            />

            {/* Interactive Crop Box Overlay */}
            {config.crop?.active && (
              <div className="absolute inset-0 z-20 pointer-events-none">
                {/* Crop Cutout Window */}
                <div
                  onMouseDown={(e) => handleCropHandleMouseDown('move', e)}
                  className="absolute border-2 border-emerald-400 bg-emerald-500/10 cursor-move pointer-events-auto shadow-2xl"
                  style={{
                    left: `${config.crop.x * 100}%`,
                    top: `${config.crop.y * 100}%`,
                    width: `${config.crop.width * 100}%`,
                    height: `${config.crop.height * 100}%`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                  }}
                >
                  {/* Rule-of-Thirds Grid */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-white" />
                    <div className="border-r border-white" />
                    <div />
                  </div>

                  {/* Corner Handles */}
                  <div
                    onMouseDown={(e) => handleCropHandleMouseDown('nw', e)}
                    className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full cursor-nw-resize shadow-md"
                  />
                  <div
                    onMouseDown={(e) => handleCropHandleMouseDown('ne', e)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full cursor-ne-resize shadow-md"
                  />
                  <div
                    onMouseDown={(e) => handleCropHandleMouseDown('sw', e)}
                    className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full cursor-sw-resize shadow-md"
                  />
                  <div
                    onMouseDown={(e) => handleCropHandleMouseDown('se', e)}
                    className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full cursor-se-resize shadow-md"
                  />

                  {/* Edge Handles */}
                  <div
                    onMouseDown={(e) => handleCropHandleMouseDown('n', e)}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-emerald-400 border border-white rounded-full cursor-n-resize shadow-md"
                  />
                  <div
                    onMouseDown={(e) => handleCropHandleMouseDown('s', e)}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-emerald-400 border border-white rounded-full cursor-s-resize shadow-md"
                  />
                  <div
                    onMouseDown={(e) => handleCropHandleMouseDown('w', e)}
                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 h-6 w-2.5 bg-emerald-400 border border-white rounded-full cursor-w-resize shadow-md"
                  />
                  <div
                    onMouseDown={(e) => handleCropHandleMouseDown('e', e)}
                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 h-6 w-2.5 bg-emerald-400 border border-white rounded-full cursor-e-resize shadow-md"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hold to Compare Original */}
        {!config.crop?.active && (
          <button
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onTouchStart={() => setShowOriginal(true)}
            onTouchEnd={() => setShowOriginal(false)}
            className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white backdrop-blur-md cursor-pointer transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hold for Original</span>
          </button>
        )}

        {/* Quick Inner Photo Adjustment Toolbar when Frame is active */}
        {config.frame?.enabled && !config.crop?.active && (
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950/85 border border-slate-700/80 backdrop-blur-md shadow-xl text-xs">
            <span className="text-[10px] text-amber-400 font-bold px-1.5 uppercase hidden sm:inline">
              Inner Photo:
            </span>
            <button
              type="button"
              onClick={() =>
                onChangeConfig?.((prev) => ({
                  ...prev,
                  adjustments: {
                    ...prev.adjustments,
                    zoom: Math.max(0.2, parseFloat(((prev.adjustments.zoom || 1) - 0.1).toFixed(2))),
                  },
                }))
              }
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer"
              title="Reduce inner photo size"
            >
              - Size
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeConfig?.((prev) => ({
                  ...prev,
                  adjustments: {
                    ...prev.adjustments,
                    zoom: Math.min(3.5, parseFloat(((prev.adjustments.zoom || 1) + 0.1).toFixed(2))),
                  },
                }))
              }
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer"
              title="Increase inner photo size"
            >
              + Size
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeConfig?.((prev) => ({
                  ...prev,
                  adjustments: {
                    ...prev.adjustments,
                    scaleX: Math.max(0.3, parseFloat(((prev.adjustments.scaleX ?? 1) - 0.05).toFixed(2))),
                  },
                }))
              }
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-medium cursor-pointer hidden md:inline"
              title="Reduce inner photo width"
            >
              - W
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeConfig?.((prev) => ({
                  ...prev,
                  adjustments: {
                    ...prev.adjustments,
                    scaleX: Math.min(2.5, parseFloat(((prev.adjustments.scaleX ?? 1) + 0.05).toFixed(2))),
                  },
                }))
              }
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-medium cursor-pointer hidden md:inline"
              title="Increase inner photo width"
            >
              + W
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeConfig?.((prev) => ({
                  ...prev,
                  adjustments: {
                    ...prev.adjustments,
                    scaleY: Math.max(0.3, parseFloat(((prev.adjustments.scaleY ?? 1) - 0.05).toFixed(2))),
                  },
                }))
              }
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-fuchsia-300 font-medium cursor-pointer hidden md:inline"
              title="Reduce inner photo height"
            >
              - H
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeConfig?.((prev) => ({
                  ...prev,
                  adjustments: {
                    ...prev.adjustments,
                    scaleY: Math.min(2.5, parseFloat(((prev.adjustments.scaleY ?? 1) + 0.05).toFixed(2))),
                  },
                }))
              }
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-fuchsia-300 font-medium cursor-pointer hidden md:inline"
              title="Increase inner photo height"
            >
              + H
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeConfig?.((prev) => ({
                  ...prev,
                  adjustments: {
                    ...prev.adjustments,
                    offsetX: 0,
                    offsetY: 0,
                    scaleX: 1,
                    scaleY: 1,
                    zoom: 1,
                  },
                }))
              }
              className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-medium cursor-pointer"
              title="Reset photo to center"
            >
              Center
            </button>
          </div>
        )}

        {/* Floating Apply Crop Toolbar in Crop Mode */}
        {config.crop?.active && (
          <div className="absolute bottom-4 z-30 flex items-center gap-2 bg-slate-950/90 border border-slate-700 p-2 rounded-2xl shadow-2xl backdrop-blur-md">
            <button
              onClick={handleApplyCrop}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply Crop</span>
            </button>
            <button
              onClick={() =>
                onChangeConfig?.((prev) => ({
                  ...prev,
                  crop: { ...prev.crop, active: false },
                }))
              }
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* File Size & Resolution Comparison Metric Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Original</div>
          <div className="text-xs sm:text-sm font-semibold text-slate-200">
            {imageInfo.originalWidth} × {imageInfo.originalHeight}
          </div>
          <div className="text-[11px] text-slate-400">
            {formatFileSize(imageInfo.originalSizeBytes)}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-bold text-cyan-400">Output Target</div>
          <div className="text-xs sm:text-sm font-semibold text-white">
            {config.resize.width} × {config.resize.height}
          </div>
          <div className="text-[11px] text-cyan-300 font-mono">
            {estimatedSize ? `~${formatFileSize(estimatedSize)}` : 'Calculating...'}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:flex-col sm:items-start sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
          <div className="text-[10px] uppercase font-bold text-slate-400">Format</div>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-white uppercase">
            <span>{config.exportFormat.replace('image/', '')}</span>
            <span className="text-slate-500 font-normal">
              ({Math.round(config.resize.quality * 100)}% Q)
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons: Download & Clipboard */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>
            {isExporting ? 'Generating Image...' : `Download ${config.exportFormat.replace('image/', '').toUpperCase()}`}
          </span>
        </button>

        <button
          onClick={handleCopyToClipboard}
          className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          title="Copy transparent PNG to clipboard"
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
