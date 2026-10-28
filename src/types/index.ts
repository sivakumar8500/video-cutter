export interface VideoMetadata {
  file: File;
  name: string;
  size: number;
  duration: number; // in seconds
  width: number;
  height: number;
  format: string;
  previewUrl: string;
}

export type SplitMode = 'pieces' | 'duration' | 'range';

export type AspectRatioOption = 'original' | '9:16' | '1:1';
export type VerticalFitMode = 'blur' | 'crop' | 'fit';

export type CardFitMode = 'cover' | 'contain';

export interface CardAdjustments {
  fitMode: CardFitMode;
  topHeight: number; // in px out of 1920 (default 656)
  bottomHeight: number; // in px out of 1920 (default 656)
  backgroundColor: string; // hex color e.g. '#000000'
  videoPadding: number; // in px (0 - 30)
  topZoom: number; // scale factor (0.8 - 1.5)
  bottomZoom: number; // scale factor (0.8 - 1.5)
}

export interface CustomRange {
  id: string;
  start: number; // in seconds
  end: number; // in seconds
  label?: string;
}

export interface PromoCard {
  id: string;
  name: string;
  blob: Blob;
  previewUrl: string;
}

export interface TimedBannerSlot {
  id: string;
  start: number; // in seconds
  end: number; // in seconds
  card: PromoCard | null;
  label?: string;
}

export type BannerMode = 'static' | 'timeline';

export interface PromoCardsConfig {
  enabled: boolean;
  bannerMode?: BannerMode; // 'static' (1 top, 1 bottom) | 'timeline' (multiple timed banners)
  topCard: PromoCard | null;
  bottomCard: PromoCard | null;
  topSlots?: TimedBannerSlot[]; // Array of timed top banners
  bottomSlots?: TimedBannerSlot[]; // Array of timed bottom banners
  adjustments: CardAdjustments;
}

export interface SplitConfig {
  mode: SplitMode;
  pieces: number; // For Mode A
  clipDurationSeconds: number; // For Mode B
  customRanges: CustomRange[]; // For Mode C: Cut specific minutes to minutes
  useReencoding: boolean; // false = stream copy (fast/lossless), true = re-encode (exact cut)
  namingPrefix: string;
  targetAspectRatio: AspectRatioOption;
  verticalFitMode: VerticalFitMode;
  promoCards?: PromoCardsConfig;
}

export interface VideoSegment {
  index: number; // 1-based
  start: number; // in seconds
  end: number; // in seconds
  duration: number; // in seconds
  outputFilename: string;
  label?: string;
}

export type ProcessStatus = 
  | 'idle' 
  | 'loading-ffmpeg' 
  | 'preparing-file' 
  | 'processing' 
  | 'completed' 
  | 'error' 
  | 'cancelled';

export interface ProcessingProgress {
  status: ProcessStatus;
  currentClipIndex: number;
  totalClips: number;
  currentClipProgress: number; // 0 - 100
  overallProgress: number; // 0 - 100
  statusMessage: string;
  logs: string[];
  errorMessage?: string;
  startTime?: number;
  estimatedRemainingSec?: number;
}

export interface ExportedClip {
  id: string;
  index: number;
  filename: string;
  blob: Blob;
  url: string;
  duration: number;
  size: number;
  start: number;
  end: number;
  aspectRatio?: AspectRatioOption;
  hasPromoCards?: boolean;
}
