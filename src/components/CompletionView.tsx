import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  FolderDown,
  FileArchive,
  Download,
  Play,
  RotateCcw,
  Sparkles,
  HardDrive,
  Film,
  Check,
  AlertCircle,
  Loader2,
  Smartphone,
  CheckCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ExportedClip, PromoCardsConfig, VerticalFitMode } from '../types';
import { formatFileSize, formatTime } from '../utils/formatters';
import {
  downloadAllAsZip,
  downloadSingleClip,
  isFileSystemAccessSupported,
  saveClipsToLocalFolder,
} from '../services/fileSystemService';
import { ffmpegService } from '../services/ffmpegService';
import { PromoCardsManager, DEFAULT_CARD_ADJUSTMENTS } from './PromoCardsManager';

interface CompletionViewProps {
  clips: ExportedClip[];
  folderName: string;
  onReset: () => void;
  onUpdateClips?: (updatedClips: ExportedClip[]) => void;
}

export const CompletionView: React.FC<CompletionViewProps> = ({
  clips: initialClips,
  folderName,
  onReset,
  onUpdateClips,
}) => {
  const [clips, setClips] = useState<ExportedClip[]>(initialClips);
  const [activeClipPreview, setActiveClipPreview] = useState<ExportedClip | null>(initialClips[0] || null);

  const [isSavingFolder, setIsSavingFolder] = useState(false);
  const [folderSaveStatus, setFolderSaveStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  // 9:16 Conversion State
  const [verticalFitMode, setVerticalFitMode] = useState<VerticalFitMode>('blur');
  const [promoCardsConfig, setPromoCardsConfig] = useState<PromoCardsConfig>({
    enabled: false,
    topCard: null,
    bottomCard: null,
    adjustments: DEFAULT_CARD_ADJUSTMENTS,
  });

  const [isConvertingAll, setIsConvertingAll] = useState(false);
  const [convertingClipId, setConvertingClipId] = useState<string | null>(null);
  const [convertProgress, setConvertProgress] = useState(0);
  const [convertStatusMessage, setConvertStatusMessage] = useState<string | null>(null);

  // Sync state if initialClips change
  useEffect(() => {
    setClips(initialClips);
    if (!activeClipPreview && initialClips.length > 0) {
      setActiveClipPreview(initialClips[0]);
    }
  }, [initialClips]);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  }, []);

  const totalBytes = clips.reduce((acc, c) => acc + c.size, 0);
  const hasFileSystemAccess = isFileSystemAccessSupported();

  const handleSaveToFolder = async () => {
    setIsSavingFolder(true);
    setFolderSaveStatus(null);
    try {
      const res = await saveClipsToLocalFolder(folderName, clips);
      setFolderSaveStatus({
        success: res.success,
        message: res.message,
      });
    } catch (err: unknown) {
      setFolderSaveStatus({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to save to folder.',
      });
    } finally {
      setIsSavingFolder(false);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    setZipProgress(0);
    try {
      await downloadAllAsZip(folderName, clips, (pct) => setZipProgress(pct));
    } catch (err) {
      console.error('ZIP creation failed:', err);
      alert('Failed to generate ZIP archive.');
    } finally {
      setIsZipping(false);
    }
  };

  // Convert a single clip to 9:16 vertical
  const handleConvertSingleClip = async (clip: ExportedClip) => {
    try {
      setConvertingClipId(clip.id);
      setConvertProgress(0);
      setConvertStatusMessage(`Converting ${clip.filename} to 9:16...`);

      const converted = await ffmpegService.convertClipAspectRatio(
        clip,
        '9:16',
        verticalFitMode,
        promoCardsConfig.enabled ? promoCardsConfig : undefined,
        (pct) => setConvertProgress(pct)
      );

      const updated = clips.map((c) => (c.id === clip.id ? converted : c));
      setClips(updated);
      onUpdateClips?.(updated);
      setActiveClipPreview(converted);
      setConvertStatusMessage(`Converted "${converted.filename}" to 9:16!`);
      setTimeout(() => setConvertStatusMessage(null), 3000);
    } catch (err) {
      console.error('9:16 conversion failed:', err);
      alert('Failed to convert clip to 9:16 aspect ratio.');
    } finally {
      setConvertingClipId(null);
    }
  };

  // Convert all clips to 9:16 vertical
  const handleConvertAllTo916 = async () => {
    try {
      setIsConvertingAll(true);
      setConvertProgress(0);

      const updated: ExportedClip[] = [];
      const total = clips.length;

      for (let i = 0; i < total; i++) {
        const clip = clips[i];
        setConvertStatusMessage(`Converting clip ${i + 1} of ${total}: ${clip.filename}...`);

        const converted = await ffmpegService.convertClipAspectRatio(
          clip,
          '9:16',
          verticalFitMode,
          promoCardsConfig.enabled ? promoCardsConfig : undefined,
          (pct) => {
            const overall = Math.round(((i + pct / 100) / total) * 100);
            setConvertProgress(overall);
          }
        );
        updated.push(converted);
      }

      setClips(updated);
      onUpdateClips?.(updated);
      if (updated.length > 0) {
        setActiveClipPreview(updated[0]);
      }
      setConvertStatusMessage(`Successfully converted all ${updated.length} clips to 9:16 vertical!`);
      setTimeout(() => setConvertStatusMessage(null), 4000);
    } catch (err) {
      console.error('All 9:16 conversion failed:', err);
      alert('Failed to convert all clips to 9:16.');
    } finally {
      setIsConvertingAll(false);
      setConvertingClipId(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Success Celebration Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-indigo-950/40 border border-emerald-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-xl shadow-emerald-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Splitting Completed Successfully!
                </h2>
                <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Generated <span className="text-emerald-400 font-semibold">{clips.length} video clips</span>{' '}
                ({formatFileSize(totalBytes)}) ready to download, save to folder, or convert to 9:16 Shorts/Reels.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Split Another Video</span>
          </button>
        </div>
      </div>

      {/* 16:9 to 9:16 Ratio Conversion Option Card with Promo Cards */}
      <div className="rounded-3xl bg-gradient-to-r from-pink-950/30 via-slate-900/70 to-indigo-950/30 border border-pink-500/30 p-5 sm:p-6 backdrop-blur-md shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Convert Clips to 9:16 Vertical Ratio
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Shorts • Reels • TikTok
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Convert horizontal video to vertical 9:16 format with background blur, crop, or top & bottom promotional cards.
              </p>
            </div>
          </div>

          {/* Style Selector & Convert All Button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setVerticalFitMode('blur')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-medium ${
                  verticalFitMode === 'blur'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ✨ Blurred BG
              </button>
              <button
                type="button"
                onClick={() => setVerticalFitMode('crop')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-medium ${
                  verticalFitMode === 'crop'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ✂️ Center Crop
              </button>
              <button
                type="button"
                onClick={() => setVerticalFitMode('fit')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-medium ${
                  verticalFitMode === 'fit'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⬛ Black Bars
              </button>
            </div>

            <button
              type="button"
              onClick={handleConvertAllTo916}
              disabled={isConvertingAll || !!convertingClipId}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-pink-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isConvertingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Converting All ({convertProgress}%)...</span>
                </>
              ) : (
                <>
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>
                    Convert All to 9:16 {promoCardsConfig.enabled ? '+ Cards' : ''}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress or feedback message */}
        {(isConvertingAll || convertingClipId || convertStatusMessage) && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-pink-300 font-medium">
                {convertStatusMessage || 'Processing aspect ratio conversion...'}
              </span>
              <span className="font-mono text-white font-bold">{convertProgress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
              <div
                style={{ width: `${convertProgress}%` }}
                className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-150"
              />
            </div>
          </div>
        )}

        {/* Promotional Cards Manager (Top & Bottom Banners) */}
        <div className="pt-2 border-t border-slate-800/60">
          <PromoCardsManager
            config={promoCardsConfig}
            onChange={setPromoCardsConfig}
            videoPreviewUrl={activeClipPreview?.url}
          />
        </div>
      </div>

      {/* Primary Actions Card: Direct Folder Save & ZIP Download */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-md shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-400" />
              <span>Export & Save All Clips</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Folder Name: <span className="text-indigo-300 font-semibold">{folderName}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Direct Folder Save Button (File System Access API) */}
            {hasFileSystemAccess && (
              <button
                type="button"
                onClick={handleSaveToFolder}
                disabled={isSavingFolder}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingFolder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Writing Folder...</span>
                  </>
                ) : (
                  <>
                    <FolderDown className="w-4 h-4" />
                    <span>Save to New Folder...</span>
                  </>
                )}
              </button>
            )}

            {/* Download All as ZIP Button */}
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isZipping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating ZIP ({zipProgress}%)...</span>
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4" />
                  <span>Download All as ZIP</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Folder Save Feedback */}
        {folderSaveStatus && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              folderSaveStatus.success
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
            }`}
          >
            {folderSaveStatus.success ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{folderSaveStatus.message}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Clip Player Preview + Clips List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Clip Video Player Preview */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 p-5 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-400" />
              <span>Clip Verification Player</span>
            </h4>
            <div className="flex items-center gap-1.5">
              {activeClipPreview?.aspectRatio === '9:16' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  9:16 {activeClipPreview.hasPromoCards ? '+ Promo Cards' : 'Vertical'}
                </span>
              )}
              <span className="text-xs font-mono text-indigo-400">
                Part #{activeClipPreview?.index}
              </span>
            </div>
          </div>

          {activeClipPreview && (
            <div className="space-y-3">
              <div
                className={`rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-inner mx-auto ${
                  activeClipPreview.aspectRatio === '9:16'
                    ? 'aspect-[9/16] max-h-[380px]'
                    : 'aspect-video'
                }`}
              >
                <video
                  key={activeClipPreview.id}
                  src={activeClipPreview.url}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-mono font-bold text-white truncate" title={activeClipPreview.filename}>
                  {activeClipPreview.filename}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Duration: {formatTime(activeClipPreview.duration, true)}</span>
                  <span>Size: {formatFileSize(activeClipPreview.size)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 16:9 -> 9:16 Single Conversion Button */}
                {activeClipPreview.aspectRatio !== '9:16' && (
                  <button
                    type="button"
                    onClick={() => handleConvertSingleClip(activeClipPreview)}
                    disabled={isConvertingAll || !!convertingClipId}
                    className="py-2.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 text-xs font-semibold border border-pink-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {convertingClipId === activeClipPreview.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Converting...</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>
                          Convert to 9:16 {promoCardsConfig.enabled ? '+ Cards' : ''}
                        </span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => downloadSingleClip(activeClipPreview)}
                  className={`py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 cursor-pointer ${
                    activeClipPreview.aspectRatio === '9:16' ? 'col-span-2' : ''
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Download Clip</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: List of All Generated Clips */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900/60 border border-slate-800/80 p-5 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white">Generated Video Clips ({clips.length})</h4>
            <span className="text-xs text-slate-400">Click any clip to preview & convert</span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {clips.map((clip) => {
              const isSelected = activeClipPreview?.id === clip.id;
              const isThisConverting = convertingClipId === clip.id;

              return (
                <div
                  key={clip.id}
                  onClick={() => setActiveClipPreview(clip)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-950/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-mono font-bold text-xs ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : clip.aspectRatio === '9:16'
                          ? 'bg-pink-600/30 text-pink-300 border border-pink-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isSelected ? <Play className="w-4 h-4 fill-white" /> : `#${clip.index}`}
                    </div>

                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-100 font-mono truncate" title={clip.filename}>
                          {clip.filename}
                        </span>
                        {clip.aspectRatio === '9:16' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 shrink-0">
                            9:16 {clip.hasPromoCards ? '+ Cards' : ''}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{formatTime(clip.duration, true)}</span>
                        <span>•</span>
                        <span>{formatFileSize(clip.size)}</span>
                        <span>•</span>
                        <span className="text-indigo-400">
                          {formatTime(clip.start)} - {formatTime(clip.end)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Inline Convert Button if not yet 9:16 */}
                    {clip.aspectRatio !== '9:16' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConvertSingleClip(clip);
                        }}
                        disabled={isConvertingAll || !!convertingClipId}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
                        title={`Convert to 9:16 vertical${promoCardsConfig.enabled ? ' with promo cards' : ''}`}
                      >
                        {isThisConverting ? (
                          <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                        ) : (
                          <Smartphone className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSingleClip(clip);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Download clip"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
