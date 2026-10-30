import React, { useState, useRef, useMemo } from 'react';
import {
  FolderOpen,
  FileVideo,
  FileImage,
  Upload,
  Play,
  Palette,
  Trash2,
  Download,
  ShieldCheck,
  Film,
} from 'lucide-react';
import { formatFileSize, getFileExtension } from '../utils/formatters';
import type { VideoMetadata, ExportedClip } from '../types';
import type { ActiveTab } from './Header';

export interface ManagedMediaItem {
  id: string;
  name: string;
  type: 'video' | 'image' | 'clip';
  sizeBytes: number;
  url: string;
  dateAdded: Date;
  file?: File;
  duration?: number;
  width?: number;
  height?: number;
}

interface FilesManagerViewProps {
  activeVideo: VideoMetadata | null;
  exportedClips: ExportedClip[];
  onSelectVideoForCutter: (metadata: VideoMetadata) => void;
  onSelectImageForStudio?: (file: File) => void;
  onSwitchTab: (tab: ActiveTab) => void;
}

export const FilesManagerView: React.FC<FilesManagerViewProps> = ({
  activeVideo,
  exportedClips,
  onSelectVideoForCutter,
  onSwitchTab,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'video' | 'image' | 'clip'>('all');
  const [customFiles, setCustomFiles] = useState<ManagedMediaItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Consolidate all session files
  // Consolidate all session files
  const allMediaItems = useMemo<ManagedMediaItem[]>(() => {
    const items: ManagedMediaItem[] = [];

    // 1. Currently active video
    if (activeVideo) {
      items.push({
        id: `active-video-${activeVideo.name}`,
        name: activeVideo.name,
        type: 'video',
        sizeBytes: activeVideo.size,
        url: activeVideo.previewUrl,
        dateAdded: new Date(),
        file: activeVideo.file,
        duration: activeVideo.duration,
        width: activeVideo.width,
        height: activeVideo.height,
      });
    }

    // 2. Exported video clips
    exportedClips.forEach((clip) => {
      items.push({
        id: `clip-${clip.id}`,
        name: clip.filename,
        type: 'clip',
        sizeBytes: clip.blob.size,
        url: clip.url,
        dateAdded: new Date(),
        duration: clip.end - clip.start,
      });
    });

    // 3. Custom uploaded files in Files tab
    customFiles.forEach((f) => {
      items.push(f);
    });

    return items;
  }, [activeVideo, exportedClips, customFiles]);

  // Filter items
  const filteredItems = useMemo(() => {
    return allMediaItems.filter((item) => {
      if (filterType === 'all') return true;
      return item.type === filterType;
    });
  }, [allMediaItems, filterType]);

  // Handle Upload Any File (Video or Image)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const url = URL.createObjectURL(file);

      const newItem: ManagedMediaItem = {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        type: isVideo ? 'video' : 'image',
        sizeBytes: file.size,
        url,
        dateAdded: new Date(),
        file,
      };

      setCustomFiles((prev) => [newItem, ...prev]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open in Video Cutter
  const handleOpenInVideoCutter = (item: ManagedMediaItem) => {
    if (item.file) {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => {
        onSelectVideoForCutter({
          file: item.file!,
          name: item.name,
          size: item.sizeBytes,
          duration: v.duration,
          width: v.videoWidth,
          height: v.videoHeight,
          format: getFileExtension(item.name),
          previewUrl: item.url,
        });
        onSwitchTab('video-cutter');
      };
      v.src = item.url;
    } else {
      onSwitchTab('video-cutter');
    }
  };

  // Open in Image Studio
  const handleOpenInImageStudio = () => {
    onSwitchTab('image-studio');
  };

  // Remove file from list
  const handleDeleteItem = (id: string) => {
    setCustomFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Download item
  const handleDownloadItem = (item: ManagedMediaItem) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalBytes = allMediaItems.reduce((acc, curr) => acc + curr.sizeBytes, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Local Media & Files Hub</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Manage All Videos, Images & Cuts
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Upload and organize your project files. Seamlessly launch any file into the{' '}
          <strong className="text-cyan-300">Video Cutter</strong> or{' '}
          <strong className="text-cyan-300">Image Studio</strong> with 1-click.
        </p>
      </div>

      {/* Upload Zone & Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dropzone Card */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="md:col-span-2 p-6 rounded-3xl bg-slate-900/60 border-2 border-dashed border-slate-700/80 hover:border-cyan-500/60 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-cyan-950/20 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 text-center group shadow-xl"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/10">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">
              Click or drag to add files to session
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              Supports MP4, MOV, WebM, MKV, PNG, JPG, WebP, SVG
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*,image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Storage & Privacy Stat Card */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between shadow-xl">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Session Storage
            </span>
            <div className="text-2xl font-extrabold text-white">
              {formatFileSize(totalBytes)}
            </div>
            <div className="text-xs text-slate-400">
              {allMediaItems.length} media files in local memory
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] text-emerald-300 font-medium">
              100% In-Browser. Files never leave your device.
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
          {[
            { id: 'all' as const, label: `All Files (${allMediaItems.length})` },
            {
              id: 'video' as const,
              label: `Videos (${allMediaItems.filter((i) => i.type === 'video').length})`,
            },
            {
              id: 'image' as const,
              label: `Images (${allMediaItems.filter((i) => i.type === 'image').length})`,
            },
            {
              id: 'clip' as const,
              label: `Exported Clips (${allMediaItems.filter((i) => i.type === 'clip').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {allMediaItems.length > 0 && (
          <button
            onClick={() => {
              setCustomFiles([]);
            }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Added Files</span>
          </button>
        )}
      </div>

      {/* Media Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800 space-y-3">
          <FolderOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No files in this category yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Upload files using the dropzone above, cut a video, or edit an image to populate your library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group p-4 rounded-3xl bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-xl"
            >
              {/* Media Thumbnail & Badges */}
              <div className="relative aspect-video rounded-2xl bg-black/60 overflow-hidden flex items-center justify-center border border-slate-800/80">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                )}

                {/* Type Tag */}
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md flex items-center gap-1 ${
                      item.type === 'video'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : item.type === 'image'
                        ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <FileVideo className="w-3 h-3" />
                    ) : item.type === 'image' ? (
                      <FileImage className="w-3 h-3" />
                    ) : (
                      <Film className="w-3 h-3" />
                    )}
                    <span className="uppercase">{item.type}</span>
                  </span>
                </div>

                {/* Duration Badge if video */}
                {item.duration && (
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-white backdrop-blur-md">
                    {Math.round(item.duration)}s
                  </div>
                )}
              </div>

              {/* Title & Specs */}
              <div className="space-y-1">
                <h4
                  className="text-xs font-bold text-white truncate"
                  title={item.name}
                >
                  {item.name}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{formatFileSize(item.sizeBytes)}</span>
                  {item.width && item.height && (
                    <span className="font-mono text-slate-500">
                      {item.width}×{item.height}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                {item.type === 'video' || item.type === 'clip' ? (
                  <button
                    onClick={() => handleOpenInVideoCutter(item)}
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/15 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Cut Video</span>
                  </button>
                ) : (
                  <button
                    onClick={handleOpenInImageStudio}
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/15 cursor-pointer"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Edit Image</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownloadItem(item)}
                    className="flex-1 py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 cursor-pointer transition-all"
                    title="Remove from session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
