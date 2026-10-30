export type ImageShape =
  | 'rectangle'
  | 'rounded'
  | 'circle'
  | 'squircle'
  | 'heart'
  | 'star'
  | 'hexagon'
  | 'diamond'
  | 'shield';

export type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export type BackgroundMode = 'transparent' | 'solid' | 'blur';

export type FrameCategory =
  | 'none'
  | 'birthday'
  | 'events'
  | 'party'
  | 'meeting'
  | 'political'
  | 'advertisement';

export interface FrameConfig {
  enabled: boolean;
  category: FrameCategory;
  templateId: string;
  primaryText: string;
  secondaryText: string;
  accentColor: string;
  showBanner: boolean;
  frameBorderWidth: number;
  customFrameUrl?: string; // Uploaded frame image URL
  customFrameElement?: HTMLImageElement;
  customFrameFit?: 'cover' | 'contain' | 'stretch';
  customFrameOpacity?: number; // 0.1 to 1.0 (default 1.0)
}

export type AspectRatioPreset = 'free' | '1:1' | '4:5' | '16:9' | '9:16' | '4:3' | '3:2';

export interface CropConfig {
  active: boolean;
  aspectRatio: AspectRatioPreset;
  // Normalized 0 to 1 coordinates within the current canvas
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  fontSize: number; // 12 to 72
  color: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  opacity: number; // 0.1 to 1.0
  showBackground: boolean;

  // QR Code Overlay
  qrEnabled?: boolean;
  qrContent?: string;
  qrSize?: number; // in px e.g. 120
  qrPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  qrFgColor?: string;
  qrBgColor?: string;
  qrLabel?: string;
}

export interface ImageAdjustments {
  brightness: number; // 50 to 150 (default 100)
  contrast: number; // 50 to 150 (default 100)
  saturation: number; // 0 to 200 (default 100)
  blur: number; // 0 to 20 (default 0)
  sharpness?: number; // 0 to 100 (default 0) - edge & detail enhancement
  clarity?: number; // 0 to 100 (default 0) - micro-contrast pop
  grayscale: number; // 0 to 100 (default 0)
  sepia: number; // 0 to 100 (default 0)
  invert: number; // 0 to 100 (default 0)
  temperature: number; // -100 (cool) to 100 (warm), default 0
  vignette: number; // 0 to 100, default 0
  hueRotate: number; // 0 to 360, default 0
  rotation: number; // 0, 90, 180, 270 or free angle
  flipH: boolean;
  flipV: boolean;
  offsetX: number; // pan horizontal in px via cursor
  offsetY: number; // pan vertical in px via cursor
  zoom: number; // scale factor 0.2 to 5.0 (default 1.0)
  scaleX?: number; // width multiplier for inner image (0.2 to 3.0, default 1.0)
  scaleY?: number; // height multiplier for inner image (0.2 to 3.0, default 1.0)
}

export interface ShapeOptions {
  shape: ImageShape;
  cornerRadius: number; // in px (0 - 150)
  borderWidth: number; // in px (0 - 30)
  borderColor: string; // hex
  borderStyle: 'solid' | 'dashed' | 'double';
  shadow: boolean;
  shadowBlur: number;
  shadowColor: string;
  backgroundMode: BackgroundMode;
  backgroundColor: string; // hex
}

export interface ResizeOptions {
  width: number;
  height: number;
  lockAspectRatio: boolean;
  scalePercent: number; // 25, 50, 75, 100, 200, or custom
  quality: number; // 0.1 to 1.0 (default 0.95 - 1.0 lossless)
  targetSizeKb?: number; // Target file size in KB (optional auto-compression)
  upscaleFactor?: number; // 1, 1.5, 2, 3, 4
}

export interface ImageStudioConfig {
  resize: ResizeOptions;
  crop: CropConfig;
  shape: ShapeOptions;
  adjustments: ImageAdjustments;
  frame: FrameConfig;
  watermark: WatermarkConfig;
  exportFormat: ExportFormat;
  outputFilename: string;
}

export interface LoadedImageInfo {
  file?: File;
  name: string;
  originalWidth: number;
  originalHeight: number;
  originalSizeBytes: number;
  previewUrl: string;
  imgElement: HTMLImageElement;
}
