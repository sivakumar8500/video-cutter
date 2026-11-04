import React, { useState, useRef } from 'react';
import {
  Download,
  Link,
  Music,
  VolumeX,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  ExternalLink,
  Scissors,
  Copy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ffmpegService } from '../../services/ffmpegService';
import { formatFileSize, formatTime } from '../../utils/formatters';
import type { VideoMetadata } from '../../types';

interface MediaToolsStudioProps {
  onSendToVideoCutter?: (metadata: VideoMetadata) => void;
}

type MediaToolMode = 'url-downloader' | 'video-to-audio' | 'audio-remover';

const SAMPLE_URLS = [
  {
    name: 'Big Buck Bunny (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    name: 'For Bigger Blazes (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    name: 'Elephants Dream (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
];

export const MediaToolsStudio: React.FC<MediaToolsStudioProps> = ({ onSendToVideoCutter }) => {
  const [activeMode, setActiveMode] = useState<MediaToolMode>('url-downloader');

  // ================= 1. URL DOWNLOADER STATE =================
  const [inputUrl, setInputUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlFetchProgress, setUrlFetchProgress] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [fetchedVideo, setFetchedVideo] = useState<{
    file: File;
    blob: Blob;
    url: string;
    filename: string;
    size: number;
    duration: number;
  } | null>(null);

  // ================= 2. VIDEO TO AUDIO STATE =================
  const [audioInputVideo, setAudioInputVideo] = useState<File | null>(null);
  const [audioVideoPreviewUrl, setAudioVideoPreviewUrl] = useState<string | null>(null);
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'wav' | 'aac' | 'm4a' | 'ogg'>('mp3');
  const [audioBitrate, setAudioBitrate] = useState<'320k' | '256k' | '192k' | '128k'>('320k');
  const [isExtractingAudio, setIsExtractingAudio] = useState(false);
  const [extractAudioProgress, setExtractAudioProgress] = useState(0);
  const [extractedAudio, setExtractedAudio] = useState<{
    blob: Blob;
    url: string;
    filename: string;
    size: number;
  } | null>(null);

  // ================= 3. AUDIO REMOVER STATE =================
  const [muteInputVideo, setMuteInputVideo] = useState<File | null>(null);
  const [muteVideoPreviewUrl, setMuteVideoPreviewUrl] = useState<string | null>(null);
  const [isMutingVideo, setIsMutingVideo] = useState(false);
  const [muteProgress, setMuteProgress] = useState(0);
  const [mutedVideo, setMutedVideo] = useState<{
    blob: Blob;
    url: string;
    filename: string;
    size: number;
  } | null>(null);

  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const muteFileInputRef = useRef<HTMLInputElement>(null);

  // ================= 1. URL DOWNLOADER HANDLERS =================
  const handleFetchUrlVideo = async (targetUrl?: string) => {
    const rawUrl = (targetUrl || inputUrl).trim();
    if (!rawUrl) {
      setUrlError('Please enter or paste a valid video URL.');
      return;
    }

    setUrlError(null);
    setIsFetchingUrl(true);
    setUrlFetchProgress('Connecting to video source...');

    try {
      let response: Response | null = null;
      let finalBlob: Blob | null = null;

      // Attempt 1: Direct fetch
      try {
        response = await fetch(rawUrl, { mode: 'cors' });
        if (response.ok) {
          finalBlob = await response.blob();
        }
      } catch (directErr) {
        console.warn('Direct fetch failed due to CORS, attempting proxy fallback...', directErr);
      }

      // Attempt 2: CORS Proxy Fallback
      if (!finalBlob) {
        setUrlFetchProgress('Bypassing CORS via secure media proxy...');
        const proxyUrls = [
          `https://corsproxy.io/?url=${encodeURIComponent(rawUrl)}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`,
        ];

        for (const pUrl of proxyUrls) {
          try {
            const pRes = await fetch(pUrl);
            if (pRes.ok) {
              finalBlob = await pRes.blob();
              break;
            }
          } catch {
            // continue
          }
        }
      }

      // If still blocked, trigger browser direct download helper
      if (!finalBlob) {
        throw new Error(
          'This video URL has strict cross-origin CORS security restrictions. Click "Direct Browser Download" below to download it directly in your browser tab.'
        );
      }

      setUrlFetchProgress('Probing video metadata & frame parameters...');

      // Infer clean filename
      let filename = 'downloaded_video.mp4';
      try {
        const parsed = new URL(rawUrl);
        const pathParts = parsed.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart && /\.(mp4|mov|mkv|webm|m4v)$/i.test(lastPart)) {
          filename = decodeURIComponent(lastPart);
        }
      } catch {
        // ignore
      }

      const file = new File([finalBlob], filename, {
        type: finalBlob.type || 'video/mp4',
      });
      const previewUrl = URL.createObjectURL(finalBlob);

      // Probe duration
      let duration = 0;
      try {
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.src = previewUrl;
        await new Promise<void>((resolve) => {
          v.onloadedmetadata = () => {
            duration = v.duration || 0;
            resolve();
          };
          v.onerror = () => resolve();
          setTimeout(resolve, 1500);
        });
      } catch {
        // ignore
      }

      setFetchedVideo({
        file,
        blob: finalBlob,
        url: previewUrl,
        filename,
        size: finalBlob.size,
        duration,
      });

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#6366f1', '#10b981'],
        });
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      setUrlError(err instanceof Error ? err.message : 'Failed to fetch video from URL.');
    } finally {
      setIsFetchingUrl(false);
      setUrlFetchProgress(null);
    }
  };

  const handleDownloadBlob = (blob: Blob, filename: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text);
        handleFetchUrlVideo(text);
      }
    } catch {
      alert('Clipboard permission not granted or clipboard is empty.');
    }
  };

  // ================= 2. VIDEO TO AUDIO HANDLERS =================
  const handleSelectAudioFile = (file: File) => {
    setAudioInputVideo(file);
    if (audioVideoPreviewUrl) {
      URL.revokeObjectURL(audioVideoPreviewUrl);
    }
    setAudioVideoPreviewUrl(URL.createObjectURL(file));
    setExtractedAudio(null);
  };

  const handleStartExtractAudio = async () => {
    if (!audioInputVideo) return;
    setIsExtractingAudio(true);
    setExtractAudioProgress(0);

    try {
      const result = await ffmpegService.extractAudio(
        audioInputVideo,
        audioFormat,
        audioBitrate,
        undefined,
        (pct) => setExtractAudioProgress(pct)
      );

      setExtractedAudio(result);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ec4899', '#6366f1'],
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Audio extraction failed:', err);
      alert(err instanceof Error ? err.message : 'Audio extraction failed');
    } finally {
      setIsExtractingAudio(false);
    }
  };

  // ================= 3. AUDIO REMOVER HANDLERS =================
  const handleSelectMuteFile = (file: File) => {
    setMuteInputVideo(file);
    if (muteVideoPreviewUrl) {
      URL.revokeObjectURL(muteVideoPreviewUrl);
    }
    setMuteVideoPreviewUrl(URL.createObjectURL(file));
    setMutedVideo(null);
  };

  const handleStartRemoveAudio = async () => {
    if (!muteInputVideo) return;
    setIsMutingVideo(true);
    setMuteProgress(0);

    try {
      const result = await ffmpegService.removeAudio(
        muteInputVideo,
        undefined,
        (pct) => setMuteProgress(pct)
      );

      setMutedVideo(result);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#6366f1'],
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Audio removal failed:', err);
      alert(err instanceof Error ? err.message : 'Audio removal failed');
    } finally {
      setIsMutingVideo(false);
    }
  };

  // Seamless cross-tool helpers
  const sendFetchedToAudio = () => {
    if (fetchedVideo) {
      handleSelectAudioFile(fetchedVideo.file);
      setActiveMode('video-to-audio');
    }
  };

  const sendFetchedToMuter = () => {
    if (fetchedVideo) {
      handleSelectMuteFile(fetchedVideo.file);
      setActiveMode('audio-remover');
    }
  };

  const sendFetchedToCutter = () => {
    if (fetchedVideo && onSendToVideoCutter) {
      const meta: VideoMetadata = {
        file: fetchedVideo.file,
        name: fetchedVideo.filename,
        size: fetchedVideo.size,
        duration: fetchedVideo.duration,
        width: 1920,
        height: 1080,
        format: fetchedVideo.file.type || 'video/mp4',
        previewUrl: fetchedVideo.url,
      };
      onSendToVideoCutter(meta);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Studio Header & Tool Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#ffedd6]/15">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 text-orange-400 text-[11px] font-mono font-bold uppercase tracking-wider">
              Media Processing Suite
            </span>
            <span className="text-xs text-slate-400">• 100% Client-Side FFmpeg</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#ffedd6] tracking-tight">
            Video Downloader &amp; Audio Studio
          </h2>
          <p className="text-xs sm:text-sm text-[#ffedd6]/70 mt-1 max-w-2xl">
            Download videos from any direct web URL, extract studio-grade MP3/WAV audio tracks, or remove audio completely with lossless stream copy.
          </p>
        </div>

        {/* 3 Mode Navigation Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-black/80 border border-[#ffedd6]/20 shadow-xl flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveMode('url-downloader')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeMode === 'url-downloader'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-black shadow-md'
                : 'text-[#ffedd6]/70 hover:text-[#ffedd6]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>URL Downloader</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('video-to-audio')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeMode === 'video-to-audio'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md'
                : 'text-[#ffedd6]/70 hover:text-[#ffedd6]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Video to Audio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('audio-remover')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeMode === 'audio-remover'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-500 text-white shadow-md'
                : 'text-[#ffedd6]/70 hover:text-[#ffedd6]'
            }`}
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Audio Remover</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: ANY URL TO GET VIDEO DOWNLOAD
      ====================================================================== */}
      {activeMode === 'url-downloader' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* URL Input Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-[#ffedd6]/15 backdrop-blur-xl shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Link className="w-5 h-5 text-orange-400" />
                  <span>Download Video From Any URL</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paste any direct video link (MP4, WebM, MOV, MKV, M3U8) or web video URL to stream, download, or edit.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Copy className="w-3.5 h-3.5 text-orange-400" />
                <span>Paste from Clipboard</span>
              </button>
            </div>

            {/* Input Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4 or direct web link..."
                  className="w-full h-12 pl-4 pr-10 rounded-2xl bg-black/70 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 font-mono transition"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFetchUrlVideo();
                  }}
                />
                {inputUrl && (
                  <button
                    type="button"
                    onClick={() => setInputUrl('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleFetchUrlVideo()}
                disabled={isFetchingUrl || !inputUrl.trim()}
                className="h-12 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-black font-extrabold text-sm shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isFetchingUrl ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-black" />
                    <span>Fetch &amp; Download</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Test Sample URLs */}
            <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
              <span className="text-slate-400 font-mono">Test Samples:</span>
              {SAMPLE_URLS.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => {
                    setInputUrl(sample.url);
                    handleFetchUrlVideo(sample.url);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  {sample.name}
                </button>
              ))}
            </div>

            {/* Loading message */}
            {isFetchingUrl && (
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-orange-500/30 text-xs text-orange-300 flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-orange-400 shrink-0" />
                <span>{urlFetchProgress || 'Fetching video stream into browser memory...'}</span>
              </div>
            )}

            {/* Error Message with Direct Download Fallback */}
            {urlError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>{urlError}</p>
                </div>
                {inputUrl.trim() && (
                  <div className="pt-2 flex items-center gap-3">
                    <a
                      href={inputUrl.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-semibold cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Direct Browser Download</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fetched Video Result Card */}
          {fetchedVideo && (
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-emerald-500/40 shadow-2xl space-y-5 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                      {fetchedVideo.filename}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatFileSize(fetchedVideo.size)}
                      {fetchedVideo.duration > 0 && ` • ${formatTime(fetchedVideo.duration)}`} • Ready to download or edit
                    </p>
                  </div>
                </div>

                {/* Primary Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownloadBlob(fetchedVideo.blob, fetchedVideo.filename)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Video (MP4)</span>
                </button>
              </div>

              {/* In-Browser Video Player */}
              <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-xl aspect-video flex items-center justify-center">
                <video
                  src={fetchedVideo.url}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Cross-Tool Actions */}
              <div className="p-4 rounded-2xl bg-black/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Send Video To Other Studios:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={sendFetchedToAudio}
                    className="px-3.5 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Extract Audio (MP3/WAV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={sendFetchedToMuter}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Remove Audio Track (Mute)</span>
                  </button>

                  {onSendToVideoCutter && (
                    <button
                      type="button"
                      onClick={sendFetchedToCutter}
                      className="px-3.5 py-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Open in Video Cutter &amp; Splitter</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: VIDEO TO AUDIO CONVERTER
      ====================================================================== */}
      {activeMode === 'video-to-audio' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-[#ffedd6]/15 backdrop-blur-xl shadow-2xl space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-pink-400" />
                <span>Extract Audio From Video</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Convert any video into high-fidelity MP3, WAV, AAC, M4A, or OGG audio track in your browser.
              </p>
            </div>

            {/* Video Input Dropzone */}
            <input
              ref={audioFileInputRef}
              type="file"
              accept="video/*,.mp4,.mov,.mkv,.avi,.webm"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleSelectAudioFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {!audioInputVideo ? (
              <div
                onClick={() => audioFileInputRef.current?.click()}
                className="py-12 px-6 rounded-2xl border-2 border-dashed border-slate-800 hover:border-pink-500/50 bg-slate-950/40 hover:bg-slate-950/70 transition text-center cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Select Video to Extract Audio</h4>
                  <p className="text-xs text-slate-400 mt-1">Supports MP4, MOV, MKV, AVI, WebM files</p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                    <FileVideo className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{audioInputVideo.name}</p>
                    <p className="text-[10px] text-slate-400">{formatFileSize(audioInputVideo.size)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => audioFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}

            {/* Audio Format & Bitrate Controls */}
            {audioInputVideo && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Format Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Target Audio Format:
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(['mp3', 'wav', 'aac', 'm4a', 'ogg'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setAudioFormat(fmt)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                            audioFormat === fmt
                              ? 'bg-pink-600 text-white shadow-sm'
                              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          .{fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bitrate Selector (for lossy formats) */}
                  {audioFormat !== 'wav' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Bitrate Quality:
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {(['320k', '256k', '192k', '128k'] as const).map((br) => (
                          <button
                            key={br}
                            type="button"
                            onClick={() => setAudioBitrate(br)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                              audioBitrate === br
                                ? 'bg-pink-600 text-white shadow-sm'
                                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {br === '320k' ? '320k (Studio)' : br}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Extract Button */}
                <button
                  type="button"
                  onClick={handleStartExtractAudio}
                  disabled={isExtractingAudio}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-pink-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isExtractingAudio ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extracting Audio ({extractAudioProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Music className="w-4 h-4" />
                      <span>Extract &amp; Export Audio (.{audioFormat.toUpperCase()})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Extracted Audio Player Result Card */}
          {extractedAudio && (
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-pink-500/40 shadow-2xl space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                    <Music className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      {extractedAudio.filename}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {formatFileSize(extractedAudio.size)} • High-Fidelity Audio
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadBlob(extractedAudio.blob, extractedAudio.filename)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs shadow-lg shadow-pink-500/25 transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Audio</span>
                </button>
              </div>

              {/* Audio Player */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <audio src={extractedAudio.url} controls className="w-full" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 3: VIDEO AUDIO REMOVER (MUTER)
      ====================================================================== */}
      {activeMode === 'audio-remover' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-[#ffedd6]/15 backdrop-blur-xl shadow-2xl space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <VolumeX className="w-5 h-5 text-cyan-400" />
                <span>Remove Audio Track From Video (Mute Video)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Completely strip the sound track from any video file with 100% lossless video stream copy. Fast, crisp, and 0% degradation.
              </p>
            </div>

            {/* Video Input Dropzone */}
            <input
              ref={muteFileInputRef}
              type="file"
              accept="video/*,.mp4,.mov,.mkv,.avi,.webm"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleSelectMuteFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {!muteInputVideo ? (
              <div
                onClick={() => muteFileInputRef.current?.click()}
                className="py-12 px-6 rounded-2xl border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/40 hover:bg-slate-950/70 transition text-center cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <VolumeX className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Select Video to Remove Audio</h4>
                  <p className="text-xs text-slate-400 mt-1">Lossless stream copy drops audio track in 1-2 seconds</p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                    <FileVideo className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{muteInputVideo.name}</p>
                    <p className="text-[10px] text-slate-400">{formatFileSize(muteInputVideo.size)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => muteFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}

            {muteInputVideo && (
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleStartRemoveAudio}
                  disabled={isMutingVideo}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isMutingVideo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Removing Audio Track ({muteProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Remove Audio Track (Make Video Silent)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Muted Video Result Card */}
          {mutedVideo && (
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-cyan-500/40 shadow-2xl space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      {mutedVideo.filename}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {formatFileSize(mutedVideo.size)} • Audio stream removed successfully
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadBlob(mutedVideo.blob, mutedVideo.filename)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Silent Video</span>
                </button>
              </div>

              {/* Silent Video Preview */}
              <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-xl aspect-video flex items-center justify-center">
                <video src={mutedVideo.url} controls className="w-full h-full object-contain" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
