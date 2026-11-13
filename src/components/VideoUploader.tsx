import React, { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Upload, Film, AlertTriangle, Play, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import type { VideoMetadata } from '../types';
import { generateSampleVideo } from '../utils/sampleVideo';

interface VideoUploaderProps {
  onVideoSelected: (metadata: VideoMetadata) => void;
  onMultipleVideosSelected?: (files: File[]) => void;
  onOpenBatchConverter?: () => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onVideoSelected,
  onMultipleVideosSelected,
  onOpenBatchConverter,
}) => {
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
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.type.startsWith('video/') || /\.(mp4|mov|mkv|avi|webm|m4v|wmv|flv)$/i.test(f.name)
      );

      if (files.length > 1 && onMultipleVideosSelected) {
        onMultipleVideosSelected(files);
      } else if (files.length === 1) {
        processSelectedFile(files[0]);
      } else {
        alert('Please select valid video file(s) (MP4, MOV, MKV, AVI, WebM).');
      }
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(
        (f) => f.type.startsWith('video/') || /\.(mp4|mov|mkv|avi|webm|m4v|wmv|flv)$/i.test(f.name)
      );

      if (files.length > 1 && onMultipleVideosSelected) {
        onMultipleVideosSelected(files);
      } else if (files.length === 1) {
        processSelectedFile(files[0]);
      }
      e.target.value = '';
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
            ? 'border-[#F59E0B] bg-[#FEF3C7]/40 scale-[1.01] shadow-xl'
            : 'border-[#E8E2D9] hover:border-[#F59E0B] bg-white hover:bg-[#FAF9F6] shadow-xs'
        }`}
      >
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-[#F59E0B]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,.mp4,.mov,.mkv,.avi,.webm,.m4v,.wmv"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Big Animated Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#F59E0B] to-[#FBAE17] p-0.5 shadow-md shadow-[#F59E0B]/20 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
            <div className="w-full h-full bg-[#2B140D] rounded-[14px] flex items-center justify-center">
              {isExtractingMeta ? (
                <Loader2 className="w-9 h-9 text-[#F59E0B] animate-spin" />
              ) : isDragging ? (
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              ) : (
                <Upload className="w-9 h-9 text-[#F59E0B] group-hover:text-amber-300 transition-colors" />
              )}
            </div>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-[#2B140D] mb-2">
          {isDragging ? 'Drop video(s) here to load' : 'Choose video(s) or drag & drop'}
        </h3>
        <p className="text-sm sm:text-base text-[#6B4E44] max-w-md mb-6">
          Single video trimming &amp; splitting, or{' '}
          <strong className="text-[#D97706]">select multiple videos at a time</strong> to batch-convert 16:9 to 9:16.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="px-6 py-3 rounded-xl bg-[#2B140D] hover:bg-[#3D1E14] text-white font-semibold shadow-sm transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Film className="w-4 h-4 text-[#F59E0B]" />
            <span>Browse Video File(s)</span>
          </button>

          {onOpenBatchConverter && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenBatchConverter();
              }}
              className="px-5 py-3 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#B45309] border border-[#FDE68A] font-semibold shadow-xs transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              <span>Batch 16:9 → 9:16 Mode</span>
            </button>
          )}
        </div>

        {/* Supported Format Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-[#6B4E44]">
          <span className="px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-[#E8E2D9] font-mono font-medium">
            .MP4
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-[#E8E2D9] font-mono font-medium">
            .MOV
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-[#E8E2D9] font-mono font-medium">
            .MKV
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-[#E8E2D9] font-mono font-medium">
            .AVI
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-[#E8E2D9] font-mono font-medium">
            .WEBM
          </span>
        </div>
      </div>

      {/* Warning if any */}
      {warningMessage && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#B45309] text-sm">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <p>{warningMessage}</p>
        </div>
      )}

      {/* Quick Demo Section */}
      <div className="rounded-2xl p-6 bg-white border border-[#E8E2D9] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#D97706]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#2B140D]">Don't have a video file ready?</h4>
            <p className="text-xs text-[#6B4E44]">
              Generate an instant 30-second synthetic video clip with countdown timer to test splitting.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateDemo}
          disabled={isGeneratingDemo}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F5EFE6] text-[#2B140D] border border-[#E8E2D9] text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
        >
          {isGeneratingDemo ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#F59E0B]" />
              <span>Generating ({demoProgress}%)...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-[#2B140D] text-[#2B140D]" />
              <span>Generate Test Video (30s)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
