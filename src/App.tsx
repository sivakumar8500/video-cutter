import { useState, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { VideoUploader } from './components/VideoUploader';
import { VideoPlayerPreview } from './components/VideoPlayerPreview';
import { SplitConfiguration } from './components/SplitConfiguration';
import { TimelinePreview } from './components/TimelinePreview';
import { ProcessingModal } from './components/ProcessingModal';
import { CompletionView } from './components/CompletionView';
import { Footer } from './components/Footer';
import { SeoContentSection } from './components/SeoContentSection';
import { trackEvent } from './utils/analytics';
import type {
  ExportedClip,
  ProcessingProgress,
  SplitConfig,
  VideoMetadata,
} from './types';
import {
  calculateSegments,
  getFileExtension,
  sanitizeBaseFilename,
} from './utils/formatters';
import { ffmpegService } from './services/ffmpegService';

export function App() {
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);

  // Split Configuration State
  const [config, setConfig] = useState<SplitConfig>({
    mode: 'pieces',
    pieces: 4,
    clipDurationSeconds: 30,
    customRanges: [],
    useReencoding: false, // Stream copy by default for lightning-fast lossless cutting
    namingPrefix: '',
    targetAspectRatio: 'original',
    verticalFitMode: 'blur',
  });

  // Processing & Export State
  const [progress, setProgress] = useState<ProcessingProgress>({
    status: 'idle',
    currentClipIndex: 0,
    totalClips: 0,
    currentClipProgress: 0,
    overallProgress: 0,
    statusMessage: '',
    logs: [],
  });

  const [exportedClips, setExportedClips] = useState<ExportedClip[]>([]);
  const [outputFolderName, setOutputFolderName] = useState<string>('');

  // Default base filename without extension
  const defaultBaseName = useMemo(() => {
    return video ? sanitizeBaseFilename(video.name) : 'video';
  }, [video]);

  const fileExtension = useMemo(() => {
    return video ? getFileExtension(video.name) : 'mp4';
  }, [video]);

  // Dynamically calculated segments
  const segments = useMemo(() => {
    if (!video || video.duration <= 0) return [];
    return calculateSegments(video.duration, config, defaultBaseName, fileExtension);
  }, [video, config, defaultBaseName, fileExtension]);

  // Video Selected Handler
  const handleVideoSelected = useCallback((metadata: VideoMetadata) => {
    setVideo(metadata);
    setExportedClips([]);
    setCurrentVideoTime(0);

    trackEvent('video_uploaded', {
      name: metadata.name,
      size_mb: Number((metadata.size / (1024 * 1024)).toFixed(2)),
      duration_sec: Math.round(metadata.duration),
    });

    const defaultEnd = Math.min(60, metadata.duration);
    setConfig((prev) => ({
      ...prev,
      namingPrefix: sanitizeBaseFilename(metadata.name),
      clipDurationSeconds: metadata.duration > 120 ? 60 : Math.max(5, Math.round(metadata.duration / 4)),
      customRanges: [{ id: `range-${Date.now()}`, start: 0, end: defaultEnd }],
    }));
  }, []);

  // Remove Video Handler
  const handleReset = useCallback(() => {
    if (progress.status === 'processing') {
      ffmpegService.cancel();
    }
    if (video?.previewUrl) {
      URL.revokeObjectURL(video.previewUrl);
    }
    exportedClips.forEach((c) => {
      URL.revokeObjectURL(c.url);
    });
    setVideo(null);
    setCurrentVideoTime(0);
    setExportedClips([]);
    setProgress({
      status: 'idle',
      currentClipIndex: 0,
      totalClips: 0,
      currentClipProgress: 0,
      overallProgress: 0,
      statusMessage: '',
      logs: [],
    });
  }, [video, exportedClips, progress.status]);

  // Start Splitting Process
  const handleStartProcess = async () => {
    if (!video || segments.length === 0) return;

    trackEvent('split_started', {
      mode: config.mode,
      total_clips: segments.length,
      aspect_ratio: config.targetAspectRatio,
      has_promo_cards: !!(
        config.promoCards?.enabled &&
        (config.promoCards?.topCard || config.promoCards?.bottomCard)
      ),
    });

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace('T', '_')
      .slice(0, 15);
    const folderName = `${defaultBaseName}_split_${timestamp}`;
    setOutputFolderName(folderName);

    setProgress({
      status: 'loading-ffmpeg',
      currentClipIndex: 0,
      totalClips: segments.length,
      currentClipProgress: 0,
      overallProgress: 0,
      statusMessage: 'Preparing video splitting engine...',
      logs: [],
    });

    try {
      const clips = await ffmpegService.splitVideo(
        video.file,
        segments,
        config.useReencoding,
        config.targetAspectRatio,
        config.verticalFitMode,
        config.promoCards,
        (update) => {
          setProgress((prev) => ({
            ...prev,
            ...update,
            logs: update.logs ? [...prev.logs, ...update.logs] : prev.logs,
          }));
        }
      );

      setExportedClips(clips);
      trackEvent('split_completed', {
        total_clips: clips.length,
      });

      setProgress((prev) => ({
        ...prev,
        status: 'completed',
        overallProgress: 100,
      }));
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error during video splitting';
      console.error('Splitting error:', err);
      setProgress((prev) => ({
        ...prev,
        status: errMsg.includes('cancelled') ? 'cancelled' : 'error',
        errorMessage: errMsg,
        statusMessage: errMsg,
      }));
    }
  };

  // Cancel Process Handler
  const handleCancelProcess = () => {
    ffmpegService.cancel();
    setProgress((prev) => ({
      ...prev,
      status: 'cancelled',
      errorMessage: 'Splitting operation was cancelled by user.',
      statusMessage: 'Cancelled',
    }));
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Header hasVideo={!!video} onReset={handleReset} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* State 1: No video selected yet */}
        {!video && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Hero Heading */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-2">
                <span>By Reeyansh Tech Solutions • 100% In-Browser & Private</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Split Any Video Into Clips In Seconds
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
                Split videos by piece count, duration, or exact minute ranges with optional 16:9 to 9:16 vertical conversion & promotional cards.
                All processing happens 100% locally in your browser using FFmpeg WebAssembly.
              </p>
            </div>

            {/* Video Upload Dropzone */}
            <VideoUploader onVideoSelected={handleVideoSelected} />

            {/* Full SEO & Educational Content Section */}
            <SeoContentSection />
          </div>
        )}

        {/* State 2: Video loaded & ready to configure / preview */}
        {video && exportedClips.length === 0 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Video Preview Player & Split Controls */}
              <div className="lg:col-span-7 space-y-6">
                <VideoPlayerPreview
                  metadata={video}
                  seekTime={seekTime}
                  onRemove={handleReset}
                  onChangeVideo={handleReset}
                  onCurrentTimeChange={setCurrentVideoTime}
                />

                <SplitConfiguration
                  totalDuration={video.duration}
                  config={config}
                  onChangeConfig={setConfig}
                  defaultBaseName={defaultBaseName}
                  currentPlayheadTime={currentVideoTime}
                  onSeek={(time) => setSeekTime(time)}
                  videoPreviewUrl={video.previewUrl}
                />
              </div>

              {/* Right Column: Timeline Visualization & Segment Cuts */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                <TimelinePreview
                  totalDuration={video.duration}
                  segments={segments}
                  onSeek={(time) => setSeekTime(time)}
                  onStartProcess={handleStartProcess}
                  isProcessing={
                    progress.status === 'processing' ||
                    progress.status === 'loading-ffmpeg' ||
                    progress.status === 'preparing-file'
                  }
                  isRangeMode={config.mode === 'range'}
                />
              </div>
            </div>
          </div>
        )}

        {/* State 3: Completed splitting results */}
        {exportedClips.length > 0 && (
          <CompletionView
            clips={exportedClips}
            folderName={outputFolderName}
            onReset={handleReset}
            onUpdateClips={setExportedClips}
          />
        )}
      </main>

      {/* Processing Modal Overlay */}
      {(progress.status === 'processing' ||
        progress.status === 'loading-ffmpeg' ||
        progress.status === 'preparing-file' ||
        (progress.status === 'error' && exportedClips.length === 0) ||
        progress.status === 'cancelled') && (
        <ProcessingModal
          progress={progress}
          onCancel={
            progress.status === 'error' || progress.status === 'cancelled'
              ? () => setProgress((p) => ({ ...p, status: 'idle' }))
              : handleCancelProcess
          }
        />
      )}

      {/* Reeyansh Tech Solutions Footer & Copyright */}
      <Footer />
    </div>
  );
}

export default App;
