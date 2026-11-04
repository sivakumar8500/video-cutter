import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Smartphone,
  Layers,
  Sparkles,
  Loader2,
  Trash2,
  FileArchive,
  FolderDown,
  Download,
  RotateCcw,
  CheckCircle2,
  Film,
  Plus,
  Check,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type {
  ExportedClip,
  PromoCardsConfig,
  VerticalFitMode,
  BatchConvertProgress,
} from '../types';
import { formatFileSize, formatTime } from '../utils/formatters';
import {
  downloadAllAsZip,
  downloadSingleClip,
  isFileSystemAccessSupported,
  saveClipsToLocalFolder,
} from '../services/fileSystemService';
import { ffmpegService } from '../services/ffmpegService';
import { PromoCardsManager, DEFAULT_CARD_ADJUSTMENTS } from './PromoCardsManager';

interface BatchConvertViewProps {
  initialFiles?: File[];
  onBackToSingle: () => void;
}

interface VideoFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  duration: number;
  previewUrl: string;
}

export const BatchConvertView: React.FC<BatchConvertViewProps> = ({
  initialFiles = [],
  onBackToSingle,
}) => {
  const [fileItems, setFileItems] = useState<VideoFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Conversion Options
  const [verticalFitMode, setVerticalFitMode] = useState<VerticalFitMode>('blur');
  const [promoCardsConfig, setPromoCardsConfig] = useState<PromoCardsConfig>({
    enabled: false,
    bannerMode: 'static',
    topCard: null,
    bottomCard: null,
    adjustments: DEFAULT_CARD_ADJUSTMENTS,
    cancelMiddle: false,
    ogGenerationOption: 'both',
  });

  // Processing & Export State
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchConvertProgress>({
    currentFileIndex: 0,
    totalFiles: 0,
    currentFileName: '',
    currentFileProgress: 0,
    overallProgress: 0,
    statusMessage: '',
  });

  const [convertedClips, setConvertedClips] = useState<ExportedClip[]>([]);

  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [isSavingFolder, setIsSavingFolder] = useState(false);
  const [folderSaveStatus, setFolderSaveStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const addFileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (files: File[]) => {
    const valid = files.filter(
      (f) => f.type.startsWith('video/') || /\.(mp4|mov|mkv|avi|webm|m4v|wmv|flv)$/i.test(f.name)
    );

    const newItems: VideoFileItem[] = [];

    for (const f of valid) {
      const previewUrl = URL.createObjectURL(f);
      const item: VideoFileItem = {
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file: f,
        name: f.name,
        size: f.size,
        duration: 0,
        previewUrl,
      };

      // Probe duration
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = previewUrl;
        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => {
            item.duration = video.duration || 0;
            resolve();
          };
          video.onerror = () => resolve();
          setTimeout(resolve, 1000);
        });
      } catch {
        // ignore
      }

      newItems.push(item);
    }

    setFileItems((prev) => [...prev, ...newItems]);
  };

  // Load initial files
  useEffect(() => {
    if (initialFiles.length > 0) {
      addFiles(initialFiles);
    }
  }, [initialFiles]);

  const removeFile = (id: string) => {
    setFileItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  // Start Batch Conversion
  const handleStartBatchConvert = async () => {
    if (fileItems.length === 0) return;

    setIsProcessing(true);
    setConvertedClips([]);
    setBatchProgress({
      currentFileIndex: 1,
      totalFiles: fileItems.length,
      currentFileName: fileItems[0].name,
      currentFileProgress: 0,
      overallProgress: 0,
      statusMessage: `Initializing batch conversion for ${fileItems.length} videos...`,
    });

    try {
      const filesToProcess = fileItems.map((item) => item.file);
      const results = await ffmpegService.batchConvertVideos(
        filesToProcess,
        {
          targetAspectRatio: '9:16',
          verticalFitMode,
          promoCards: promoCardsConfig.enabled ? promoCardsConfig : undefined,
          cancelMiddle: promoCardsConfig.cancelMiddle,
          ogGenerationOption: promoCardsConfig.ogGenerationOption || 'both',
        },
        (progress) => {
          setBatchProgress(progress);
        }
      );

      setConvertedClips(results);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#6366f1', '#10b981', '#f59e0b'],
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Batch convert failed:', err);
      alert(err instanceof Error ? err.message : 'Batch conversion failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    ffmpegService.cancel();
    setIsProcessing(false);
  };

  const handleDownloadZip = async () => {
    if (convertedClips.length === 0) return;
    setIsZipping(true);
    setZipProgress(0);
    try {
      await downloadAllAsZip('batch_9x16_converted', convertedClips, (pct) => setZipProgress(pct));
    } catch (err) {
      console.error('ZIP creation failed:', err);
      alert('Failed to generate ZIP archive.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleSaveToFolder = async () => {
    if (convertedClips.length === 0) return;
    setIsSavingFolder(true);
    setFolderSaveStatus(null);
    try {
      const res = await saveClipsToLocalFolder('batch_9x16_converted', convertedClips);
      setFolderSaveStatus({
        success: res.success,
        message: res.message,
      });
    } catch (err) {
      setFolderSaveStatus({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to save to folder.',
      });
    } finally {
      setIsSavingFolder(false);
    }
  };

  const totalBytes = fileItems.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 text-[11px] font-bold uppercase tracking-wider">
              Batch 16:9 → 9:16 Converter
            </span>
            <span className="text-xs text-slate-400">• Multi-Video Queue</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Convert Multiple Videos to 9:16 At Once
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Convert multiple horizontal 16:9 videos into vertical 9:16 Shorts/Reels with background blur, top &amp; bottom banners, middle cancel option, and OG preservation.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToSingle}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition cursor-pointer flex items-center gap-2 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Switch to Video Splitter</span>
        </button>
      </div>

      {/* COMPLETED RESULTS VIEW */}
      {convertedClips.length > 0 && !isProcessing && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-pink-950/40 border border-emerald-500/30 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Batch Conversion Finished!</span>
                  <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  Generated <strong className="text-emerald-400">{convertedClips.length} video files</strong> ready to download or save.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {isZipping ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileArchive className="w-4 h-4" />}
                <span>{isZipping ? `Creating ZIP (${zipProgress}%)...` : 'Download All as ZIP'}</span>
              </button>

              {isFileSystemAccessSupported() && (
                <button
                  type="button"
                  onClick={handleSaveToFolder}
                  disabled={isSavingFolder}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  {isSavingFolder ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderDown className="w-4 h-4 text-emerald-400" />}
                  <span>Save to Local Folder</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setConvertedClips([])}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-medium transition cursor-pointer"
              >
                Back to Settings
              </button>
            </div>
          </div>

          {folderSaveStatus && (
            <div
              className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                folderSaveStatus.success
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              {folderSaveStatus.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{folderSaveStatus.message}</span>
            </div>
          )}

          {/* Grid of Results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {convertedClips.map((clip, idx) => (
              <div
                key={clip.id}
                className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/40 transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[200px]" title={clip.filename}>
                    #{idx + 1} {clip.filename}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    clip.isOgClip
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                  }`}>
                    {clip.isOgClip ? 'OG Original' : '9:16 Vertical'}
                  </span>
                </div>

                <div className="aspect-[9/16] max-h-72 w-full rounded-2xl overflow-hidden bg-black border border-slate-800 mx-auto flex items-center justify-center">
                  <video
                    src={clip.url}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400 font-mono">{formatFileSize(clip.size)}</span>
                  <button
                    type="button"
                    onClick={() => downloadSingleClip(clip)}
                    className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE BATCH QUEUE & CONFIGURATION */}
      {convertedClips.length === 0 && (
        <div className="space-y-8">
          {/* File Queue Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-pink-400" />
                <h3 className="text-base font-bold text-white">Video Queue</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                  {fileItems.length} {fileItems.length === 1 ? 'Video' : 'Videos'} ({formatFileSize(totalBytes)})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={addFileInputRef}
                  type="file"
                  multiple
                  accept="video/*,.mp4,.mov,.mkv,.avi,.webm"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => addFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-pink-400" />
                  <span>Add More Videos</span>
                </button>
                {fileItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFileItems([])}
                    className="px-2.5 py-1.5 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Dropzone / Queue List */}
            {fileItems.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => addFileInputRef.current?.click()}
                className={`py-12 px-6 rounded-2xl border-2 border-dashed transition text-center cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-slate-800 hover:border-pink-500/50 bg-slate-950/40 hover:bg-slate-950/60'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Select or Drop Multiple 16:9 Videos
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Select 2, 5, 10 or more video files at once to convert to 9:16 vertical format
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-slate-900 text-[11px] font-mono text-slate-400 border border-slate-800">
                  Supports MP4, MOV, MKV, AVI, WebM
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                {fileItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-3 group hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-10 rounded-lg bg-black border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                        <video
                          src={item.previewUrl}
                          className="w-full h-full object-cover pointer-events-none"
                          muted
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate" title={item.name}>
                          #{idx + 1} {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {formatFileSize(item.size)} {item.duration > 0 && `• ${formatTime(item.duration)}`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                      title="Remove from batch queue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Global Conversion Settings Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-pink-400" />
                <span>Global 9:16 Vertical Conversion Settings</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                These settings will apply to every video in your batch queue.
              </p>
            </div>

            {/* Vertical Layout Style */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                1. Vertical Layout Style (When Banners Are Not Used or Behind Content):
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setVerticalFitMode('blur')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    verticalFitMode === 'blur'
                      ? 'bg-pink-600/30 border-pink-500 text-pink-200 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ✨ Blurred Background (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setVerticalFitMode('crop')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    verticalFitMode === 'crop'
                      ? 'bg-pink-600/30 border-pink-500 text-pink-200 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ✂️ Center Crop (Fill Screen)
                </button>
                <button
                  type="button"
                  onClick={() => setVerticalFitMode('fit')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    verticalFitMode === 'fit'
                      ? 'bg-pink-600/30 border-pink-500 text-pink-200 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⬛ Letterbox (Black Bars)
                </button>
              </div>
            </div>

            {/* Top & Bottom Banners Integration */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span>2. Top &amp; Bottom Promotional Banners (Optional)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Overlay customized branding or banners onto the top and bottom of all converted 9:16 videos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPromoCardsConfig((prev) => ({
                      ...prev,
                      enabled: !prev.enabled,
                    }))
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    promoCardsConfig.enabled
                      ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md shadow-pink-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {promoCardsConfig.enabled ? 'Banners Active ✓' : 'Enable Banners'}
                </button>
              </div>

              {promoCardsConfig.enabled && (
                <div className="pt-2">
                  <PromoCardsManager
                    config={promoCardsConfig}
                    onChange={setPromoCardsConfig}
                    videoPreviewUrl={fileItems[0]?.previewUrl}
                    totalDuration={fileItems[0]?.duration || 60}
                  />
                </div>
              )}
            </div>

            {/* OG (Original) Generation Option */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-purple-950/40 border border-indigo-500/30 space-y-2.5">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-indigo-400" />
                  <span>3. OG (Original) Generation Option</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Select whether you want to generate 9:16 vertical clips, keep the unaltered original (OG) 16:9 files, or export both.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setPromoCardsConfig((p) => ({ ...p, ogGenerationOption: 'both' }))
                  }
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1 ${
                    (promoCardsConfig.ogGenerationOption || 'both') === 'both'
                      ? 'bg-gradient-to-br from-indigo-600/30 to-purple-600/20 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-white">Both (OG + 9:16)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      Recommended
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Export both 9:16 vertical and the original 16:9 video files
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPromoCardsConfig((p) => ({ ...p, ogGenerationOption: 'banners_only' }))
                  }
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1 ${
                    promoCardsConfig.ogGenerationOption === 'banners_only'
                      ? 'bg-gradient-to-br from-pink-600/30 to-rose-600/20 border-pink-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-white">9:16 Vertical Only</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Only export converted 9:16 vertical video files
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPromoCardsConfig((p) => ({ ...p, ogGenerationOption: 'og_only' }))
                  }
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1 ${
                    promoCardsConfig.ogGenerationOption === 'og_only'
                      ? 'bg-gradient-to-br from-cyan-600/30 to-blue-600/20 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-white">OG Original Only</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Bypass 9:16 and retain only the original 16:9 video files
                  </span>
                </button>
              </div>
            </div>

            {/* Convert Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartBatchConvert}
                disabled={fileItems.length === 0 || isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-pink-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Smartphone className="w-5 h-5" />
                <span>
                  Convert All {fileItems.length} Videos (16:9 → 9:16)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Modal Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Batch Conversion In Progress</span>
                  <Sparkles className="w-4 h-4 text-pink-400" />
                </h3>
                <p className="text-xs text-slate-400">
                  Processing Video {batchProgress.currentFileIndex} of {batchProgress.totalFiles}
                </p>
              </div>
            </div>

            {/* Status Message */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-medium">
              <span className="text-pink-400 font-semibold mr-1">Current File:</span>
              <span className="font-mono text-white">{batchProgress.currentFileName || 'Processing...'}</span>
            </div>

            {/* Current File Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Current Video Progress</span>
                <span className="font-mono font-bold text-pink-400">{batchProgress.currentFileProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  style={{ width: `${batchProgress.currentFileProgress}%` }}
                  className="h-full bg-pink-500 transition-all duration-150"
                />
              </div>
            </div>

            {/* Overall Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-200 font-semibold">Overall Batch Progress</span>
                <span className="font-mono font-bold text-indigo-400">{batchProgress.overallProgress}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
                <div
                  style={{ width: `${batchProgress.overallProgress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Batch Process</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
