import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  FileVideo,
  Clock,
  HardDrive,
  Monitor,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import type { VideoMetadata } from '../types';
import { formatFileSize, formatTime } from '../utils/formatters';

interface VideoPlayerPreviewProps {
  metadata: VideoMetadata;
  seekTime?: number | null;
  onRemove: () => void;
  onChangeVideo: () => void;
  onCurrentTimeChange?: (time: number) => void;
}

export const VideoPlayerPreview: React.FC<VideoPlayerPreviewProps> = ({
  metadata,
  seekTime,
  onRemove,
  onChangeVideo,
  onCurrentTimeChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(metadata.duration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Sync seekTime from external component
  useEffect(() => {
    if (seekTime !== null && seekTime !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  }, [seekTime]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const t = videoRef.current.currentTime;
      setCurrentTime(t);
      onCurrentTimeChange?.(t);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || metadata.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    onCurrentTimeChange?.(time);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-md shadow-2xl space-y-4">
      {/* Top Header with Filename & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <FileVideo className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="overflow-hidden">
            <h3 className="text-base font-bold text-white truncate max-w-md sm:max-w-lg" title={metadata.name}>
              {metadata.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{metadata.format}</span>
              <span>•</span>
              <span>{formatFileSize(metadata.size)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onChangeVideo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Change</span>
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-medium border border-rose-500/20 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>
      </div>

      {/* Video Player Display */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center group shadow-inner">
        <video
          ref={videoRef}
          src={metadata.previewUrl}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
          playsInline
        />

        {/* Center Big Play Button Overlay when paused */}
        {!isPlaying && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/40 backdrop-blur-sm transition-all transform hover:scale-110 cursor-pointer"
            aria-label="Play video"
          >
            <Play className="w-7 h-7 ml-1 fill-white" />
          </button>
        )}

        {/* Floating Custom Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
          {/* Timeline Scrubber */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-300 min-w-[45px]">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.05}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition"
            />
            <span className="text-xs font-mono text-slate-400 min-w-[45px] text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Bottom Bar: Play/Pause, Volume, Fullscreen */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="p-1.5 hover:bg-white/10 rounded-lg transition cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-slate-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-slate-200" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-white/10 rounded-lg transition cursor-pointer"
              aria-label="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-slate-300 hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Metadata Badges Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Duration</div>
            <div className="text-xs font-semibold text-slate-100 font-mono">
              {formatTime(metadata.duration, true)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <HardDrive className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">File Size</div>
            <div className="text-xs font-semibold text-slate-100">
              {formatFileSize(metadata.size)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <Monitor className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resolution</div>
            <div className="text-xs font-semibold text-slate-100">
              {metadata.width} × {metadata.height}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <FileVideo className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Format</div>
            <div className="text-xs font-semibold text-slate-100 truncate max-w-[90px]" title={metadata.format}>
              {metadata.name.split('.').pop()?.toUpperCase() || 'VIDEO'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
