import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { Header, type ActiveTab } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { StudioPageHeader } from './components/StudioPageHeader';
import { LegalPageView } from './components/LegalPages/LegalPageView';
import { AdBanner } from './components/AdBanner';
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

// Synchronous URL Hash to Tab Resolver for SEO and deep-linking
const parseHashToTab = (): ActiveTab => {
  if (typeof window === 'undefined') return 'home';
  const h = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  if (h === 'video-cutter' || h === 'video' || h === 'cutter' || h === 'splitter') return 'video-cutter';
  if (h === 'media-tools' || h === 'tools' || h === 'downloader' || h === 'audio') return 'media-tools';
  if (h === 'image-studio' || h === 'image' || h === 'photo') return 'image-studio';
  if (h === 'pdf-studio' || h === 'pdf' || h === 'pdf-tools') return 'pdf-studio';
  if (h === 'qr' || h === 'qr-studio' || h === 'qrcode') return 'qr';
  if (h === 'files' || h === 'manager' || h === 'downloads') return 'files';
  if (h === 'privacy' || h === 'privacy-policy') return 'privacy';
  if (h === 'terms' || h === 'terms-and-conditions' || h === 'tos') return 'terms';
  if (h === 'about' || h === 'about-us') return 'about';
  if (h === 'contact' || h === 'contact-us') return 'contact';
  return 'home';
};

// Dynamic per-section SEO Titles & Meta Descriptions for Search Engines
const TAB_SEO_CONFIG: Record<ActiveTab, { title: string; desc: string }> = {
  home: {
    title: 'VidCuts — Free Video, Image, PDF & QR Suite | Reeyansh',
    desc: '100% private in-browser multimedia and document suite. Split videos, edit photos, process 32 PDF tools & create vector QR codes with zero server uploads.',
  },
  'video-cutter': {
    title: 'Online Video Cutter & Splitter (Free, Lossless & 9:16 Shorts) — VidCuts',
    desc: 'Split video files by pieces, duration, or custom minute ranges. Convert 16:9 to 9:16 vertical Shorts with blurred padding. 100% private in-browser FFmpeg.',
  },
  'media-tools': {
    title: 'Media Tools — URL Video Downloader, Audio Extractor & Remover — VidCuts',
    desc: 'Download videos directly from URL, extract clean audio to MP3/AAC, and mute video audio tracks directly in your browser.',
  },
  'image-studio': {
    title: 'Image Studio — Free Online Photo Cropper, Aspect Ratios & Shape Masks — VidCuts',
    desc: 'Crop photos to exact social aspect ratios (1:1, 4:5, 16:9, 9:16) or mask into geometric shapes (circle, heart, hexagon, star) with instant transparent PNG export.',
  },
  'pdf-studio': {
    title: '32 PDF Tools — Free Client-Side PDF Merge, Split, Compress & Protect — VidCuts',
    desc: 'Complete client-side PDF suite: Merge, split, compress, watermark, rotate, page number, and AES-256 encrypt confidential PDF files without uploading.',
  },
  qr: {
    title: 'Custom Vector QR Code Studio — Free QR Generator with Logo & Scanner — VidCuts',
    desc: 'Generate branded vector QR codes with embedded logos, 15 protocols, custom colors, and built-in camera scanner. 100% private.',
  },
  files: {
    title: 'Files & Local Clip Manager — VidCuts',
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
  const [activeTab, setActiveTab] = useState<ActiveTab>(parseHashToTab);
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

  // Two-way URL Hash navigation for Google crawling and back/forward browser history
  useEffect(() => {
    const handleHashChange = () => {
      const tab = parseHashToTab();
      setActiveTab(tab);
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
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
    const targetHash = `#${tab}`;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
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
            <StudioPageHeader
              activeTab={activeTab}
              onNavigate={handleTabChange}
              badge="FFmpeg WASM 4K Engine"
              title="Video Cutter & Lossless Splitter"
              subtitle="Slice videos into exact pieces or duration with lossless stream copy, 16:9 to 9:16 Shorts conversion, and promotional cards."
            />
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

                      {/* Mid-Page AdSense Unit */}
                      <AdBanner />

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
            <StudioPageHeader
              activeTab={activeTab}
              onNavigate={handleTabChange}
              badge="Lossless Audio & URL Suite"
              title="Media Tools & Audio Extractor"
              subtitle="Download web video clips by URL, extract clean audio tracks to MP3/AAC, or mute audio streams directly in your browser."
            />
            <Suspense fallback={<StudioLoader label="Loading Media Tools..." />}>
              <MediaToolsStudio
                onSendToVideoCutter={(metadata) => {
                  handleVideoSelected(metadata);
                  handleTabChange('video-cutter');
                  setCutterMode('single');
                }}
              />
            </Suspense>
            <AdBanner />
          </section>
        )}

        {/* TAB 2: Image Studio (Resize, Shapes & Filters) */}
        {activeTab === 'image-studio' && (
          <section id="image-studio" aria-label="Image Studio Photo Cropper" className="space-y-6">
            <StudioPageHeader
              activeTab={activeTab}
              onNavigate={handleTabChange}
              badge="Aspect Ratio & 9 Shapes"
              title="Image Studio & Shape Cropper"
              subtitle="Crop photos to social aspect ratios (1:1, 4:5, 16:9, 9:16) or mask into 9 geometric shapes with transparent PNG export and target KB reducer."
            />
            <Suspense fallback={<StudioLoader label="Loading Image Studio & Shape Cropper..." />}>
              <ImageStudio />
            </Suspense>
            <AdBanner />
          </section>
        )}

        {/* TAB 3: PDF Studio (All 32 iLovePDF Tools & Workflows) */}
        {activeTab === 'pdf-studio' && (
          <section id="pdf-studio" aria-label="32 Client-Side PDF Tools" className="space-y-6">
            <StudioPageHeader
              activeTab={activeTab}
              onNavigate={handleTabChange}
              badge="32 In-1 Client-Side PDF Engine"
              title="32 Client-Side PDF Tools Suite"
              subtitle="Complete client-side PDF workstation: Merge, split, compress, watermark, rotate, page number, and AES-256 protect confidential documents."
            />
            <Suspense fallback={<StudioLoader label="Loading 32 Client-Side PDF Tools..." />}>
              <PdfStudio />
            </Suspense>
            <AdBanner />
          </section>
        )}

        {/* TAB 4: QR Code Studio (Generate, Customize & Scan) */}
        {activeTab === 'qr' && (
          <section id="qr" aria-label="Custom Vector QR Code Studio" className="space-y-6">
            <StudioPageHeader
              activeTab={activeTab}
              onNavigate={handleTabChange}
              badge="Vector Matrix & 3D Scanner"
              title="Custom Vector QR Code Studio"
              subtitle="Create branded vector QR codes with custom logos, 15 protocols, custom colors, patterns, and live camera laser scanner."
            />
            <Suspense fallback={<StudioLoader label="Loading Custom Vector QR Studio..." />}>
              <QrStudio
                onSendToImageStudio={() => {
                  handleTabChange('image-studio');
                }}
              />
            </Suspense>
            <AdBanner />
          </section>
        )}

        {/* TAB 5: Media & Files Manager */}
        {activeTab === 'files' && (
          <section id="files" aria-label="Local Media and Export Manager" className="space-y-6">
            <StudioPageHeader
              activeTab={activeTab}
              onNavigate={handleTabChange}
              badge="Local Media Manager"
              title="Local Files & Export Manager"
              subtitle="Review, preview, inspect, and batch export your generated clips, images, and document files stored securely in your browser."
            />
            <Suspense fallback={<StudioLoader label="Loading Media & Files Manager..." />}>
              <FilesManagerView
                activeVideo={video}
                exportedClips={exportedClips}
                onSelectVideoForCutter={handleVideoSelected}
                onSwitchTab={handleTabChange}
              />
            </Suspense>
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
            <AdBanner />
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
