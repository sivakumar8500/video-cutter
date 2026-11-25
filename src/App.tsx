import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { Header, type ActiveTab } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { LegalPageView } from './components/LegalPages/LegalPageView';
import { ToolDocumentationGuide } from './components/StudioGuides/ToolDocumentationGuide';
import { trackEvent } from './utils/analytics';
import { ExternalLink, Scissors, Smartphone } from 'lucide-react';
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

// Lazy-loaded studio modules for maximum mobile performance and minimal initial bundle size
const VideoUploader = lazy(() => import('./components/VideoUploader').then((m) => ({ default: m.VideoUploader })));
const VideoPlayerPreview = lazy(() => import('./components/VideoPlayerPreview').then((m) => ({ default: m.VideoPlayerPreview })));
const SplitConfiguration = lazy(() => import('./components/SplitConfiguration').then((m) => ({ default: m.SplitConfiguration })));
const TimelinePreview = lazy(() => import('./components/TimelinePreview').then((m) => ({ default: m.TimelinePreview })));
const ProcessingModal = lazy(() => import('./components/ProcessingModal').then((m) => ({ default: m.ProcessingModal })));
const CompletionView = lazy(() => import('./components/CompletionView').then((m) => ({ default: m.CompletionView })));
const SeoContentSection = lazy(() => import('./components/SeoContentSection').then((m) => ({ default: m.SeoContentSection })));
const ImageStudio = lazy(() => import('./components/ImageStudio/ImageStudio').then((m) => ({ default: m.ImageStudio })));
const PdfStudio = lazy(() => import('./components/PdfStudio/PdfStudio').then((m) => ({ default: m.PdfStudio })));
const FilesManagerView = lazy(() => import('./components/FilesManagerView').then((m) => ({ default: m.FilesManagerView })));
const QrStudio = lazy(() => import('./components/QrStudio/QrStudio').then((m) => ({ default: m.QrStudio })));
const BatchConvertView = lazy(() => import('./components/BatchConvertView').then((m) => ({ default: m.BatchConvertView })));
const MediaToolsStudio = lazy(() => import('./components/MediaTools/MediaToolsStudio').then((m) => ({ default: m.MediaToolsStudio })));

// Sleek fallback loader for lazy tabs
const StudioLoader = ({ label = 'Loading Studio...' }: { label?: string }) => (
  <div className="w-full min-h-[360px] flex flex-col items-center justify-center p-8 text-center space-y-4">
    <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-green-600 shadow-xs">
      <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
    <div className="space-y-1">
      <p className="text-sm font-bold text-black">{label}</p>
      <p className="text-xs text-green-700 font-mono">100% In-Browser Privacy • Client-Side Only</p>
    </div>
  </div>
);

// Clean URL Path & Hash to Tab Resolver for SEO, GitHub Pages subpaths, and client history
const resolveRouteToTab = (): ActiveTab => {
  if (typeof window === 'undefined') return 'home';

  // 1. Check path (e.g. /video-cutter/, /media-tools/, etc.)
  const rawPath = window.location.pathname.toLowerCase().replace(/^\/|\/$/g, '');
  if (rawPath) {
    if (rawPath === 'video-cutter' || rawPath === 'video' || rawPath === 'cutter') return 'video-cutter';
    if (rawPath === 'media-tools' || rawPath === 'media' || rawPath === 'tools') return 'media-tools';
    if (rawPath === 'image-tools' || rawPath === 'image-studio' || rawPath === 'image') return 'image-tools';
    if (rawPath === 'pdf-tools' || rawPath === 'pdf-studio' || rawPath === 'pdf') return 'pdf-tools';
    if (rawPath === 'qr-code-generator' || rawPath === 'qr' || rawPath === 'qr-code') return 'qr-code-generator';
    if (rawPath === 'file-tools' || rawPath === 'files' || rawPath === 'manager') return 'file-tools';
    if (rawPath === 'privacy' || rawPath === 'privacy-policy') return 'privacy';
    if (rawPath === 'terms' || rawPath === 'terms-and-conditions' || rawPath === 'tos') return 'terms';
    if (rawPath === 'about' || rawPath === 'about-us') return 'about';
    if (rawPath === 'contact' || rawPath === 'contact-us') return 'contact';
  }

  // 2. Check hash fallback (e.g. #video-cutter, #image-studio, etc.)
  const h = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  if (h === 'video-cutter' || h === 'video' || h === 'cutter' || h === 'splitter') return 'video-cutter';
  if (h === 'media-tools' || h === 'tools' || h === 'downloader' || h === 'audio') return 'media-tools';
  if (h === 'image-tools' || h === 'image-studio' || h === 'image' || h === 'photo') return 'image-tools';
  if (h === 'pdf-tools' || h === 'pdf-studio' || h === 'pdf') return 'pdf-tools';
  if (h === 'qr-code-generator' || h === 'qr' || h === 'qr-studio' || h === 'qrcode') return 'qr-code-generator';
  if (h === 'file-tools' || h === 'files' || h === 'manager' || h === 'downloads') return 'file-tools';
  if (h === 'privacy' || h === 'privacy-policy') return 'privacy';
  if (h === 'terms' || h === 'terms-and-conditions' || h === 'tos') return 'terms';
  if (h === 'about' || h === 'about-us') return 'about';
  if (h === 'contact' || h === 'contact-us') return 'contact';

  return 'home';
};

const TAB_PATH_MAP: Record<ActiveTab, string> = {
  home: '/',
  'video-cutter': '/video-cutter/',
  'media-tools': '/media-tools/',
  'image-tools': '/image-tools/',
  'image-studio': '/image-tools/',
  'pdf-tools': '/pdf-tools/',
  'pdf-studio': '/pdf-tools/',
  'qr-code-generator': '/qr-code-generator/',
  qr: '/qr-code-generator/',
  'file-tools': '/file-tools/',
  files: '/file-tools/',
  privacy: '/privacy/',
  terms: '/terms/',
  about: '/about/',
  contact: '/contact/',
};

// Dynamic per-section SEO Titles & Meta Descriptions for Search Engines
const TAB_SEO_CONFIG: Record<ActiveTab, { title: string; desc: string }> = {
  home: {
    title: 'VidCuts — Free In-Browser Video Cutter, Image Studio, 32 PDF Tools & QR Generator | Reeyansh Tech Solutions',
    desc: '100% private in-browser multimedia and document suite. Split videos, edit photos, process 32 PDF tools & create vector QR codes with zero server uploads.',
  },
  'video-cutter': {
    title: 'Free Online Video Cutter & Lossless Splitter — VidCuts',
    desc: 'Split video files by pieces, duration, or custom minute ranges. Convert 16:9 to 9:16 vertical Shorts with blurred padding. 100% private in-browser FFmpeg.',
  },
  'media-tools': {
    title: 'Online Media Conversion Tools & Audio Extractor — VidCuts',
    desc: 'Download videos directly from URL, extract clean audio to MP3/AAC, and mute video audio tracks directly in your browser.',
  },
  'image-tools': {
    title: 'Free Online Image Editor & Shape Cropper — VidCuts',
    desc: 'Crop photos to exact social aspect ratios (1:1, 4:5, 16:9, 9:16) or mask into geometric shapes with instant transparent PNG export.',
  },
  'image-studio': {
    title: 'Free Online Image Editor & Shape Cropper — VidCuts',
    desc: 'Crop photos to exact social aspect ratios (1:1, 4:5, 16:9, 9:16) or mask into geometric shapes with instant transparent PNG export.',
  },
  'pdf-tools': {
    title: '32 Free Online PDF Tools (Merge, Split, Protect) — VidCuts',
    desc: 'Complete client-side PDF suite: Merge, split, compress, watermark, rotate, page number, and AES-256 encrypt confidential PDF files without uploading.',
  },
  'pdf-studio': {
    title: '32 Free Online PDF Tools (Merge, Split, Protect) — VidCuts',
    desc: 'Complete client-side PDF suite: Merge, split, compress, watermark, rotate, page number, and AES-256 encrypt confidential PDF files without uploading.',
  },
  'qr-code-generator': {
    title: 'Free QR Code Generator with Logo & Scanner — VidCuts',
    desc: 'Generate branded vector QR codes with embedded logos, 15 protocols, custom colors, and built-in camera scanner. 100% private.',
  },
  qr: {
    title: 'Free QR Code Generator with Logo & Scanner — VidCuts',
    desc: 'Generate branded vector QR codes with embedded logos, 15 protocols, custom colors, and built-in camera scanner. 100% private.',
  },
  'file-tools': {
    title: 'Local File Tools & Media Export Manager — VidCuts',
    desc: 'Manage, preview, and batch export your generated video clips, images, and document files.',
  },
  files: {
    title: 'Local File Tools & Media Export Manager — VidCuts',
    desc: 'Manage, preview, and batch export your generated video clips, images, and document files.',
  },
  privacy: {
    title: 'Privacy Policy — 100% In-Browser Zero Cloud Storage Guarantee | VidCuts',
    desc: 'VidCuts client-side data protection and privacy policy. 100% in-browser WebAssembly processing with zero server uploads, developed by Reeyansh Tech Solutions.',
  },
  terms: {
    title: 'Terms & Conditions — Client-Side Multimedia Suite Agreement | VidCuts',
    desc: 'Terms of Service for VidCuts. Users retain 100% ownership of all processed video, image, document, and QR files. Provided by Reeyansh Tech Solutions.',
  },
  about: {
    title: 'About Us — Reeyansh Tech Solutions & VidCuts Mission | VidCuts',
    desc: 'About VidCuts and Reeyansh Tech Solutions: Empowering creators with sovereign, serverless multimedia and document editing software.',
  },
  contact: {
    title: 'Contact Us — Support & Business Inquiries | VidCuts & Reeyansh Tech',
    desc: 'Get in touch with the VidCuts and Reeyansh Tech Solutions team for support, feature feedback, bug reports, or business partnerships.',
  },
};

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(resolveRouteToTab);
  const [cutterMode, setCutterMode] = useState<'single' | 'batch'>('single');
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
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
      import('./services/ffmpegService').then(({ ffmpegService }) => {
        ffmpegService.cancel();
      });
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
      const { ffmpegService } = await import('./services/ffmpegService');
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
  const handleCancelProcess = async () => {
    const { ffmpegService } = await import('./services/ffmpegService');
    ffmpegService.cancel();
    setProgress((prev) => ({
      ...prev,
      status: 'cancelled',
      errorMessage: 'Splitting operation was cancelled by user.',
      statusMessage: 'Cancelled',
    }));
  };

  // Multi-route navigation: responds to browser back/forward, subpaths, and hash change
  useEffect(() => {
    const handleLocationChange = () => {
      const tab = resolveRouteToTab();
      setActiveTab(tab);
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Synchronize document title and meta description dynamically for Google Crawlers
  useEffect(() => {
    const seo = TAB_SEO_CONFIG[activeTab];
    if (seo) {
      document.title = seo.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', seo.desc);
      }
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', seo.title);
      }
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', seo.title);
      }
    }
  }, [activeTab]);

  const handleTabChange = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    const targetPath = TAB_PATH_MAP[tab] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    trackEvent('navigate_tab', { tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar with Sub-Navigation Tabs */}
      <Header
        hasVideo={!!video}
        onReset={handleReset}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Main Container */}
      <main className={`flex-1 w-full mx-auto ${activeTab === 'home' ? 'max-w-full p-0' : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10'}`}>
        {/* TAB 0: Home Overview Page (Explains All Features Professionally) */}
        {activeTab === 'home' && (
          <section id="home" aria-label="VidCuts Suite Home Overview">
            <HomePage
              onNavigate={handleTabChange}
              filesCount={exportedClips.length}
            />
          </section>
        )}

        {/* TAB 1: Video Cutter & Splitter */}
        {activeTab === 'video-cutter' && (
          <section id="video-cutter" aria-label="Video Cutter and Splitter" className="space-y-6">
            <Suspense fallback={<StudioLoader label="Loading Video Cutter & Splitter Engine..." />}>
              {/* Mode Selector Switcher */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setCutterMode('single')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${cutterMode === 'single'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <Scissors className="w-3.5 h-3.5 text-white" />
                    <span>Video Splitter &amp; Cutter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCutterMode('batch')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${cutterMode === 'batch'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Batch 16:9 → 9:16 Mode (Multiple Videos)</span>
                  </button>
                </div>
              </div>

              {cutterMode === 'batch' ? (
                <BatchConvertView
                  initialFiles={batchFiles}
                  onBackToSingle={() => {
                    setCutterMode('single');
                    setBatchFiles([]);
                  }}
                />
              ) : (
                <>
                  {/* State 1: No video selected yet */}
                  {!video && (
                    <div className="space-y-10 animate-in fade-in duration-300">
                      {/* Hero Heading with Unique App Icon */}
                      <div className="text-center max-w-3xl mx-auto space-y-4">
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative group mb-3">
                            <div className="absolute -inset-1.5 bg-[#F59E0B]/25 rounded-3xl blur-lg opacity-60 group-hover:opacity-100 transition duration-500"></div>
                            <img
                              src="./app-icon-small.png"
                              alt="VidCuts App Icon"
                              title="VidCuts App Icon"
                              width={96}
                              height={96}
                              loading="eager"
                              decoding="async"
                              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-contain bg-white p-2 shadow-lg border border-slate-200"
                            />
                          </div>
                          <a
                            href="https://www.reeyanshtech.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#FDE68A] text-[#B45309] text-xs font-semibold transition-all cursor-pointer group shadow-xs"
                            title="Visit Reeyansh Tech Solutions Official Website"
                          >
                            <img
                              src="./reeyansh-logo-small.png"
                              alt="Reeyansh Tech Solutions Logo"
                              title="Reeyansh Tech Solutions Logo"
                              width={14}
                              height={14}
                              loading="lazy"
                              decoding="async"
                              className="w-3.5 h-3.5 object-contain group-hover:scale-110 transition-transform"
                            />
                            <span>By Reeyansh Tech Solutions • 100% In-Browser &amp; Private</span>
                            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                          Split Any Video Into Clips In Seconds
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
                          Split videos by piece count, duration, or exact minute ranges with optional 16:9 to 9:16 vertical conversion &amp; promotional cards.
                          All processing happens 100% locally in your browser using FFmpeg WebAssembly.
                        </p>
                      </div>

                      {/* Video Upload Dropzone */}
                      <VideoUploader
                        onVideoSelected={handleVideoSelected}
                        onMultipleVideosSelected={(files) => {
                          setBatchFiles(files);
                          setCutterMode('batch');
                        }}
                        onOpenBatchConverter={() => setCutterMode('batch')}
                      />

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
                </>
              )}
            </Suspense>
          </section>
        )}

        {/* TAB: Media Tools (URL Downloader, Video to Audio, Audio Remover) */}
        {activeTab === 'media-tools' && (
          <section id="media-tools" aria-label="Media Tools &amp; Audio Studio" className="space-y-6">
            <Suspense fallback={<StudioLoader label="Loading Media Tools..." />}>
              <MediaToolsStudio
                onSendToVideoCutter={(metadata) => {
                  handleVideoSelected(metadata);
                  handleTabChange('video-cutter');
                  setCutterMode('single');
                }}
              />
            </Suspense>
            <ToolDocumentationGuide toolId="media-tools" onNavigate={handleTabChange} />
          </section>
        )}

        {/* TAB 2: Image Studio (Resize, Shapes & Filters) */}
        {(activeTab === 'image-tools' || activeTab === 'image-studio') && (
          <section id="image-tools" aria-label="Image Studio Photo Cropper" className="space-y-6">
            <Suspense fallback={<StudioLoader label="Loading Image Studio & Shape Cropper..." />}>
              <ImageStudio />
            </Suspense>
            <ToolDocumentationGuide toolId="image-tools" onNavigate={handleTabChange} />
          </section>
        )}

        {/* TAB 3: PDF Studio (All 32 iLovePDF Tools & Workflows) */}
        {(activeTab === 'pdf-tools' || activeTab === 'pdf-studio') && (
          <section id="pdf-tools" aria-label="32 Client-Side PDF Tools" className="space-y-6">
            <Suspense fallback={<StudioLoader label="Loading 32 Client-Side PDF Tools..." />}>
              <PdfStudio />
            </Suspense>
            <ToolDocumentationGuide toolId="pdf-tools" onNavigate={handleTabChange} />
          </section>
        )}

        {/* TAB 4: QR Code Studio (Generate, Customize & Scan) */}
        {(activeTab === 'qr-code-generator' || activeTab === 'qr') && (
          <section id="qr-code-generator" aria-label="Custom Vector QR Code Studio" className="space-y-6">
            <Suspense fallback={<StudioLoader label="Loading Custom Vector QR Studio..." />}>
              <QrStudio
                onSendToImageStudio={() => {
                  handleTabChange('image-tools');
                }}
              />
            </Suspense>
            <ToolDocumentationGuide toolId="qr-code-generator" onNavigate={handleTabChange} />
          </section>
        )}

        {/* TAB 5: Media & Files Manager */}
        {(activeTab === 'file-tools' || activeTab === 'files') && (
          <section id="file-tools" aria-label="Local Media and Export Manager" className="space-y-6">
            <Suspense fallback={<StudioLoader label="Loading Media & Files Manager..." />}>
              <FilesManagerView
                activeVideo={video}
                exportedClips={exportedClips}
                onSelectVideoForCutter={handleVideoSelected}
                onSwitchTab={handleTabChange}
              />
            </Suspense>
            <ToolDocumentationGuide toolId="file-tools" onNavigate={handleTabChange} />
          </section>
        )}

        {/* TAB 6: Dedicated Legal & Company Individual Pages Flow */}
        {(activeTab === 'privacy' ||
          activeTab === 'terms' ||
          activeTab === 'about' ||
          activeTab === 'contact') && (
          <section id={activeTab} aria-label={`${activeTab} page`} className="space-y-6">
            <LegalPageView
              page={activeTab}
              onNavigate={handleTabChange}
            />
          </section>
        )}
      </main>

      {/* Processing Modal Overlay */}
      {(progress.status === 'processing' ||
        progress.status === 'loading-ffmpeg' ||
        progress.status === 'preparing-file' ||
        (progress.status === 'error' && exportedClips.length === 0) ||
        progress.status === 'cancelled') && (
          <Suspense fallback={null}>
            <ProcessingModal
              progress={progress}
              onCancel={
                progress.status === 'error' || progress.status === 'cancelled'
                  ? () => setProgress((p) => ({ ...p, status: 'idle' }))
                  : handleCancelProcess
              }
            />
          </Suspense>
        )}

      {/* Reeyansh Tech Solutions Footer & Copyright with Crawlable Link Navigation */}
      <Footer onNavigate={handleTabChange} />
    </div>
  );
}

export default App;
