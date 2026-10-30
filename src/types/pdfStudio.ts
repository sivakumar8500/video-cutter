export type PdfCategory =
  | 'all'
  | 'organize'
  | 'optimize'
  | 'convert-to-pdf'
  | 'convert-from-pdf'
  | 'convert'
  | 'edit'
  | 'security'
  | 'intelligence'
  | 'workflows';

export type PdfToolId =
  | 'merge'
  | 'split'
  | 'remove-pages'
  | 'extract-pages'
  | 'organize'
  | 'scan-to-pdf'
  | 'rotate'
  | 'crop'
  | 'page-numbers'
  | 'compress'
  | 'repair'
  | 'ocr'
  | 'pdf-to-all'
  | 'pdf-to-word'
  | 'pdf-to-powerpoint'
  | 'pdf-to-excel'
  | 'word-to-pdf'
  | 'powerpoint-to-pdf'
  | 'excel-to-pdf'
  | 'pdf-to-jpg'
  | 'jpg-to-pdf'
  | 'html-to-pdf'
  | 'pdf-to-pdfa'
  | 'pdf-to-markdown'
  | 'edit-pdf'
  | 'sign-pdf'
  | 'watermark'
  | 'redact'
  | 'pdf-forms'
  | 'unlock'
  | 'protect'
  | 'ai-summarize'
  | 'translate'
  | 'compare'
  | 'workflows';

export type TargetDocFormat =
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'images'
  | 'markdown'
  | 'text'
  | 'html'
  | 'pdfa';

export interface DocFormatOption {
  id: TargetDocFormat;
  label: string;
  ext: string;
  mimeType: string;
  iconName: string;
  description: string;
}

export interface PdfToolDefinition {
  id: PdfToolId;
  name: string;
  tagline: string;
  description: string;
  category: PdfCategory;
  iconName: string;
  badge?: 'NEW' | 'POPULAR' | 'AI';
  colorGradient: string;
}

export interface PdfUploadedFile {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  pageCount?: number;
  arrayBuffer?: ArrayBuffer;
  previewUrl?: string;
  thumbnails?: string[];
}

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number;
  rotationDegrees: number;
  colorHex: string;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface PageNumberOptions {
  format: 'number-only' | 'page-x-of-y' | 'custom';
  prefix: string;
  fontSize: number;
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right';
  startNumber: number;
}

export interface WorkflowStep {
  id: string;
  toolId: 'compress' | 'watermark' | 'page-numbers' | 'protect';
  params: Record<string, unknown>;
}
