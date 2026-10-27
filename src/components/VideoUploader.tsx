import React, { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Upload, Film, AlertTriangle, Play, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import type { VideoMetadata } from '../types';
import { generateSampleVideo } from '../utils/sampleVideo';

interface VideoUploaderProps {
  onVideoSelected: (metadata: VideoMetadata) => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isExtractingMeta, setIsExtractingMeta] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processSelectedFile = (file: File) => {
    setWarningMessage(null);

    // Check size warning (browser memory)
    if (file.size > 800 * 1024 * 1024) {
      setWarningMessage(
        `Large file detected (${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB). WebAssembly memory limit is ~2GB. Stream copy will be used for fastest performance.`
      );
    }

    setIsExtractingMeta(true);
    const previewUrl = URL.createObjectURL(file);

    // Extract metadata using an offscreen video element
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = previewUrl;

    video.onloadedmetadata = () => {
      setIsExtractingMeta(false);
      const metadata: VideoMetadata = {
        file,
        name: file.name,
        size: file.size,
        duration: video.duration || 0,
        width: video.videoWidth || 1920,
        height: video.videoHeight || 1080,
        format: file.type || 'video/mp4',
        previewUrl,
      };
      onVideoSelected(metadata);
    };

    video.onerror = () => {
      setIsExtractingMeta(false);
      // Fallback if browser can't decode metadata natively (e.g. some MKV/AVI containers in Safari)
      const metadata: VideoMetadata = {
        file,
        name: file.name,
        size: file.size,
        duration: 0,
        width: 1920,
        height: 1080,
        format: file.type || 'video/mp4',
        previewUrl,
      };
      onVideoSelected(metadata);
    };
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/') || /\.(mp4|mov|mkv|avi|webm|m4v|wmv|flv)$/i.test(file.name)) {
        processSelectedFile(file);
      } else {
        alert('Please select a valid video file (MP4, MOV, MKV, AVI, WebM).');
      }
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleCreateDemo = async () => {
    try {
      setIsGeneratingDemo(true);
      setDemoProgress(0);
      const demoFile = await generateSampleVideo(30, (pct) => setDemoProgress(pct));
      processSelectedFile(demoFile);
    } catch (err) {
      console.error('Failed to create demo video:', err);
      alert('Could not synthesize demo video. Please choose a local file.');
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Drop Zone Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group rounded-3xl p-10 sm:p-14 border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden ${
          isDragging
            ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01] shadow-2xl shadow-indigo-500/20'
            : 'border-slate-700/80 hover:border-indigo-500/60 bg-slate-900/40 hover:bg-slate-900/70 backdrop-blur-sm'
        }`}
      >
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,.mp4,.mov,.mkv,.avi,.webm,.m4v,.wmv"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Big Animated Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              {isExtractingMeta ? (
                <Loader2 className="w-9 h-9 text-indigo-400 animate-spin" />
              ) : isDragging ? (
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              ) : (
                <Upload className="w-9 h-9 text-indigo-400 group-hover:text-cyan-400 transition-colors" />
              )}
            </div>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {isDragging ? 'Drop video here to load' : 'Choose a video or drag & drop'}
        </h3>
        <p className="text-sm sm:text-base text-slate-400 max-w-md mb-6">
          High-speed in-browser cutting. Supported formats include{' '}
          <span className="text-slate-200 font-medium">MP4, MOV, MKV, AVI, WebM</span>.
        </p>

        {/* CTA Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <Film className="w-4 h-4" />
          <span>Browse Local Video</span>
        </button>

        {/* Supported Format Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono">
            .MP4
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono">
            .MOV
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono">
            .MKV
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono">
            .AVI
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono">
            .WEBM
          </span>
        </div>
      </div>

      {/* Warning if any */}
      {warningMessage && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p>{warningMessage}</p>
        </div>
      )}

      {/* Quick Demo Section */}
      <div className="rounded-2xl p-6 bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Don't have a video file ready?</h4>
            <p className="text-xs text-slate-400">
              Generate an instant 30-second synthetic video clip with countdown timer to test splitting.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateDemo}
          disabled={isGeneratingDemo}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isGeneratingDemo ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Generating ({demoProgress}%)...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Generate Test Video (30s)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
