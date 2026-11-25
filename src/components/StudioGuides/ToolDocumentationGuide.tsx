import React, { useState } from 'react';
import {
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronDown,
  ArrowRight,
  Laptop,
} from 'lucide-react';
import type { ActiveTab } from '../Header';

interface ToolGuideContent {
  title: string;
  badge: string;
  summary: string;
  whatItDoes: string[];
  whatItDoesNotDo: string[];
  steps: { step: number; title: string; desc: string }[];
  formats: { label: string; values: string }[];
  limitations: string[];
  privacyNotes: string;
  troubleshooting: { issue: string; solution: string }[];
  faqs: { question: string; answer: string }[];
  relatedTools: { id: ActiveTab; label: string; desc: string }[];
}

const TOOL_GUIDES: Record<string, ToolGuideContent> = {
  'media-tools': {
    title: 'Media Tools & Audio Extractor Technical Guide',
    badge: 'Audio Extraction & Stream Muter',
    summary:
      'Extract pristine audio tracks from any video container or strip audio streams directly in your browser using client-side WebAssembly FFmpeg. Zero cloud uploads, zero wait times, and lossless stream copying.',
    whatItDoes: [
      'Extracts audio tracks to MP3 (VBR High Quality) or lossless AAC in under 1 second.',
      'Losslessly strips audio tracks from video containers without re-encoding video frames (-c:v copy -an).',
      'Downloads public, CORS-enabled direct web video links directly to local storage.',
      'Sends extracted audio or processed video seamlessly to other VidCuts studios with one click.',
    ],
    whatItDoesNotDo: [
      'Does NOT bypass DRM-protected or copyrighted streaming platforms (e.g., Netflix, Spotify, Amazon Prime).',
      'Does NOT upload your media to any server or cloud storage — everything stays in device memory.',
      'Does NOT re-compress video when muting audio, ensuring 100% of the original video bitrate is preserved.',
    ],
    steps: [
      {
        step: 1,
        title: 'Select Input Method',
        desc: 'Drag and drop any local video file (MP4, MOV, MKV, AVI, WebM) or paste a direct public video URL.',
      },
      {
        step: 2,
        title: 'Choose Audio Operation',
        desc: 'Select "Extract Audio to MP3/AAC" to isolate the sound, or "Mute Video" to remove background audio.',
      },
      {
        step: 3,
        title: 'Instant Local Processing',
        desc: 'Click the process button. The single-threaded WebAssembly FFmpeg engine processes the stream locally.',
      },
      {
        step: 4,
        title: 'Preview & Save',
        desc: 'Listen to the audio in the built-in player or download the clean output directly to your computer.',
      },
    ],
    formats: [
      { label: 'Supported Video Inputs', values: 'MP4, MOV, MKV, AVI, WebM, M4V, FLV, TS' },
      { label: 'Audio Export Formats', values: 'MP3 (libmp3lame, 192–320 kbps), AAC (Lossless Stream Copy)' },
      { label: 'Muted Video Output', values: 'MP4 Container (Lossless Video Stream Copy)' },
      { label: 'Engine', values: 'FFmpeg 0.12 Single-Threaded WebAssembly (MEMFS)' },
    ],
    limitations: [
      'Files larger than 2GB may exceed browser tab memory limits on mobile or low-RAM devices.',
      'Direct URL downloader requires the remote server to allow Cross-Origin Resource Sharing (CORS).',
      'WebAssembly executes on client CPU; extraction speed depends on your local device hardware.',
    ],
    privacyNotes:
      'Audio extraction and stream muting execute entirely within an isolated WebAssembly sandbox in your browser. No files, file names, or metadata are ever transmitted to any external server.',
    troubleshooting: [
      {
        issue: 'Direct URL video download fails with network error',
        solution:
          'The hosting server is blocking external origins via CORS headers. Download the video directly in your browser first, then drag & drop the file into the local upload box.',
      },
      {
        issue: 'Audio export takes longer on very long videos',
        solution:
          'MP3 conversion re-encodes audio with libmp3lame. For instant conversion, choose AAC format which copies the audio stream directly without re-encoding.',
      },
    ],
    faqs: [
      {
        question: 'Can I extract audio from high-resolution 4K or 60fps video files?',
        answer:
          'Yes! The audio extractor parses the audio track directly from the container headers, ignoring heavy 4K video frames during extraction. This makes audio extraction from 4K videos remarkably fast.',
      },
      {
        question: 'Why does muting a video finish almost instantly?',
        answer:
          'VidCuts uses FFmpeg stream copy flags (-c:v copy -an). It copies existing encoded video packets directly into a new MP4 container without recalculating video pixels, completing a 1GB video in under 2 seconds.',
      },
    ],
    relatedTools: [
      { id: 'video-cutter', label: 'Video Cutter & Splitter', desc: 'Cut videos by pieces, duration, or minute intervals' },
      { id: 'file-tools', label: 'Local Files Manager', desc: 'Inspect, preview, and batch export your session clips' },
    ],
  },
  'image-tools': {
    title: 'Image Studio & Geometric Shape Cropper Technical Guide',
    badge: 'Aspect Ratio & 8 Shape Cutouts',
    summary:
      'High-precision client-side photo studio and geometric shape cropper. Crop photos to social aspect ratios (1:1, 4:5, 16:9, 9:16) or mask into 8 vector shapes with true alpha transparency and target KB reduction.',
    whatItDoes: [
      'Crops photos to exact social aspect ratios: 1:1 (Avatar), 4:5 (Portrait), 16:9 (Landscape), 9:16 (Story/Reel).',
      'Masks photos into 8 mathematical shapes: Circle, Heart, Star, Hexagon, Octagon, Diamond, Badge, Rounded Rectangle.',
      'Preserves 100% transparent backgrounds (alpha channel = 0) on geometric shape cutouts in PNG format.',
      'Applies real-time photo enhancements: Brightness, Contrast, Saturation, Sharpness, Rotation, and Flip.',
      'Compresses images to targeted file size limits (KB reducer) for official document and passport uploads.',
    ],
    whatItDoesNotDo: [
      'Does NOT send photos to cloud servers — all clipping renders in local HTML5 Canvas memory.',
      'Does NOT perform generative AI inpainting or synthetic face replacement.',
      'Does NOT degrade image resolution unless specifically chosen via the quality/size compression slider.',
    ],
    steps: [
      {
        step: 1,
        title: 'Upload Your Photo',
        desc: 'Drag & drop any JPEG, PNG, WebP, GIF, or BMP image directly from your computer or phone.',
      },
      {
        step: 2,
        title: 'Select Aspect Ratio or Shape',
        desc: 'Choose a fixed social aspect ratio (1:1, 4:5, 16:9) or pick a geometric vector shape mask (Circle, Heart, Star).',
      },
      {
        step: 3,
        title: 'Fine-Tune Framing & Adjustments',
        desc: 'Use the interactive 8-point boundary box to adjust your crop, and fine-tune brightness, contrast, or rotation.',
      },
      {
        step: 4,
        title: 'Export in Desired Format',
        desc: 'Save as transparent PNG for shapes, or JPG/WebP with target file size compression for web performance.',
      },
    ],
    formats: [
      { label: 'Supported Inputs', values: 'JPEG, PNG, WebP, GIF, BMP, SVG, AVIF' },
      { label: 'Export Formats', values: 'PNG (Alpha Transparency), JPEG (Adjustable Quality), WebP' },
      { label: 'Shape Masks', values: 'Circle, Heart (Bézier), Star (5-Point), Hexagon, Octagon, Diamond, Badge, Rounded Box' },
      { label: 'Canvas Rendering', values: 'HTML5 Canvas 2D API with High-DPI Sub-Pixel Anti-Aliasing' },
    ],
    limitations: [
      'Ultra-high resolution images (>8000×8000px) may be clamped by mobile browser Canvas memory limits.',
      'Transparent background masks require PNG or WebP export; JPEG does not support alpha transparency.',
    ],
    privacyNotes:
      'All image transformations execute entirely on your device using HTML5 OffscreenCanvas. No image data is ever uploaded, stored, or analyzed on any external server.',
    troubleshooting: [
      {
        issue: 'Shape cutout exported with black or white background instead of transparent',
        solution:
          'Ensure the export format is set to PNG. JPEG does not have an alpha transparency channel and defaults to a solid background.',
      },
      {
        issue: 'Image appears slightly rotated after upload',
        solution:
          'Photos taken on mobile cameras often contain EXIF orientation tags. Use the 90° rotation buttons in the toolbar to quickly adjust orientation.',
      },
    ],
    faqs: [
      {
        question: 'Can I use circular and heart shape cutouts for social media profile pictures?',
        answer:
          'Yes! When exported as PNG, the area outside the shape is 100% transparent, making it ideal for profile avatars, stickers, and website graphics.',
      },
      {
        question: 'How does the target KB compressor work?',
        answer:
          'It uses an iterative binary-search quantization algorithm on the Canvas export pipeline to reach your specified file size (e.g. under 50KB or 100KB) while maintaining the highest possible visual clarity.',
      },
    ],
    relatedTools: [
      { id: 'video-cutter', label: 'Video Cutter & 9:16 Shorts', desc: 'Create vertical social videos with promotional banners' },
      { id: 'qr-code-generator', label: 'Vector QR Code Studio', desc: 'Embed custom logos into scannable vector QR codes' },
    ],
  },
  'pdf-tools': {
    title: '32 Client-Side PDF Tools Technical Guide',
    badge: '32-in-1 In-Browser PDF Suite',
    summary:
      'Complete private document workstation replacing cloud PDF converters. Merge, split, compress, watermark, rotate, page number, and AES-256 encrypt documents locally with zero cloud uploads.',
    whatItDoes: [
      'Merges multiple PDF documents in any order while preserving vector text sharpness.',
      'Splits PDFs by custom page ranges (e.g. 1–3, 7–10) or separates all pages into individual files.',
      'Compresses PDF file size by rewriting XRef tables, stripping duplicate metadata, and downsampling images.',
      'Protects confidential documents with military-grade AES-256 user and owner encryption passwords.',
      'Renders high-DPI PDF page previews and converts PDF pages to JPG/PNG images in bulk.',
      'Adds customizable text watermarks, signatures, and page numbers at any position or angle.',
    ],
    whatItDoesNotDo: [
      'Does NOT perform cloud OCR on scanned physical paper documents into editable Word documents.',
      'Does NOT crack or bypass unknown passwords on encrypted PDFs without the user providing the password.',
      'Does NOT transmit documents to any server — 100% compliance for legal, banking, and confidential files.',
    ],
    steps: [
      {
        step: 1,
        title: 'Choose PDF Workflow',
        desc: 'Select from 32 specialized PDF tools: Merge, Split, Compress, Protect, Unlock, Watermark, or Convert.',
      },
      {
        step: 2,
        title: 'Upload Document Files',
        desc: 'Drag & drop one or multiple PDF documents into the secure local dropzone.',
      },
      {
        step: 3,
        title: 'Configure Operations',
        desc: 'Drag to reorder pages, enter AES-256 passwords, set watermark text, or adjust compression presets.',
      },
      {
        step: 4,
        title: 'Instant Local Export',
        desc: 'Click process. pdf-lib rebuilds the document in memory and saves the new PDF directly to your device.',
      },
    ],
    formats: [
      { label: 'Supported Standards', values: 'PDF 1.4, 1.5, 1.6, 1.7, PDF/A, PDF/X' },
      { label: 'Security & Encryption', values: 'Standard AES-256 Bit Encryption, 128-Bit RC4 Fallback' },
      { label: 'Image Conversion', values: 'PDF to High-DPI PNG/JPEG (144 DPI Vector Rendering via PDF.js)' },
      { label: 'Document Engines', values: 'pdf-lib, pdfjs-dist (Mozilla Foundation)' },
    ],
    limitations: [
      'Extremely large documents (>500 pages) may take several seconds to generate thumbnail previews on mobile.',
      'Encrypted PDFs must be unlocked with their password before pages can be merged or extracted.',
    ],
    privacyNotes:
      'VidCuts was specifically engineered for legal, financial, and confidential documents. All byte manipulation is handled by pdf-lib in browser memory. No document is ever stored, uploaded, or exposed.',
    troubleshooting: [
      {
        issue: 'Document fails to merge or gives an encryption error',
        solution:
          'The document is password-protected. Use our "Unlock PDF" tool first with the correct password, then merge the unlocked file.',
      },
      {
        issue: 'Compressed PDF file size did not decrease significantly',
        solution:
          'PDFs composed primarily of vector text, forms, or already-optimized monochrome scans have minimal redundant data to compress.',
      },
    ],
    faqs: [
      {
        question: 'Is it legally safe to use VidCuts for corporate contracts, medical forms, and NDAs?',
        answer:
          'Yes, absolutely. Because VidCuts operates 100% client-side with zero server interaction, your documents never traverse third-party networks or cloud storage, meeting strict data privacy standards (GDPR, HIPAA compliance models).',
      },
      {
        question: 'Does merging or splitting PDFs reduce text clarity or vector quality?',
        answer:
          'No! VidCuts uses pdf-lib to copy native vector page dictionaries and font subsets directly. Text remains razor-sharp at any zoom level with zero rasterization.',
      },
    ],
    relatedTools: [
      { id: 'image-tools', label: 'Image Studio & Shape Cropper', desc: 'Crop and optimize images before converting to PDF' },
      { id: 'file-tools', label: 'Local Files Manager', desc: 'Organize and batch export all processed documents' },
    ],
  },
  'qr-code-generator': {
    title: 'Custom Vector QR Code Studio Technical Guide',
    badge: '15 Protocols & Vector Engine',
    summary:
      'Generate permanent, branded vector QR codes with custom logos, gradient styling, and built-in camera scanning. Engineered with Level H error correction so your codes scan reliably in any lighting condition.',
    whatItDoes: [
      'Generates high-DPI vector QR codes for 15 data protocols: URL, WiFi, UPI Payments, VCard, Email, Phone, SMS, and more.',
      'Supports custom center logo uploads with automatic Level H (30%) Reed-Solomon Error Correction.',
      'Customizes dot geometries: Rounded, Dots, Classy, Square, and Extra-Rounded.',
      'Includes high-contrast Plain QR Mode for receipt printers, laser engraving, and industrial packaging.',
      'Includes a built-in camera scanner with real-time barcode decoding.',
    ],
    whatItDoesNotDo: [
      'Does NOT create expiring dynamic redirect links that trap you into monthly subscriptions.',
      'Does NOT track user scans or collect customer data — all QR codes encode direct, un-redirected data.',
      'Does NOT upload your embedded logos to any server.',
    ],
    steps: [
      {
        step: 1,
        title: 'Choose Data Protocol',
        desc: 'Select your QR type: Website URL, WiFi Network, UPI Payment, Digital Business Card (VCard), or Plain Text.',
      },
      {
        step: 2,
        title: 'Input Your Information',
        desc: 'Fill in your target URL, WiFi credentials, payment details, or contact information.',
      },
      {
        step: 3,
        title: 'Customize Style & Add Logo',
        desc: 'Pick your dot shapes, corner eye styles, gradient colors, and upload your central brand logo.',
      },
      {
        step: 4,
        title: 'Export Vector SVG or High-Res PNG',
        desc: 'Download as high-resolution PNG for digital use or lossless vector SVG for billboard printing.',
      },
    ],
    formats: [
      { label: 'Supported Protocols (15)', values: 'URL, WiFi (WPA/WPA2/WEP), UPI, VCard 3.0, Email, SMS, Phone, Crypto, Geo' },
      { label: 'Export Formats', values: 'High-Res PNG (up to 2000×2000px), Infinite Vector SVG, WebP' },
      { label: 'Error Correction Levels', values: 'Level L (7%), Level M (15%), Level Q (25%), Level H (30% with Logo)' },
      { label: 'Core Libraries', values: 'qr-code-styling, qrcode, html5-qrcode' },
    ],
    limitations: [
      'Embedded logos should not exceed 25–30% of the QR matrix area to ensure reliable scanning on budget cameras.',
      'Camera scanning requires granting standard browser camera permission over HTTPS.',
    ],
    privacyNotes:
      'QR code data matrices are computed directly on your device. WiFi passwords and payment addresses are never transmitted to external analytics or third-party servers.',
    troubleshooting: [
      {
        issue: 'QR code with custom logo fails to scan on some phones',
        solution:
          'Ensure high contrast between the QR dots and the background. If using a large logo, slightly reduce logo size or enable a white logo background cutout.',
      },
      {
        issue: 'WiFi QR code connects on iPhone but asks for password on Android',
        solution:
          'Make sure the encryption type (WPA/WPA2 vs WEP) exactly matches your router settings, and ensure the SSID is case-sensitive.',
      },
    ],
    faqs: [
      {
        question: 'Do VidCuts QR codes ever expire or stop working?',
        answer:
          'No! VidCuts generates direct, static QR codes. Your information is encoded directly into the pixel matrix. There are no middleman redirect servers, meaning your QR codes will work forever without fees.',
      },
      {
        question: 'Can I print these QR codes on large posters, restaurant tables, and billboards?',
        answer:
          'Yes! Export in SVG (Scalable Vector Graphics) format. SVG files can be enlarged to billboard size without losing a single pixel of crispness.',
      },
    ],
    relatedTools: [
      { id: 'image-tools', label: 'Image Studio & Shape Cropper', desc: 'Create circular or styled logo graphics for your QR codes' },
      { id: 'pdf-tools', label: '32 PDF Tools Suite', desc: 'Insert QR codes into documents, menus, and brochures' },
    ],
  },
  'file-tools': {
    title: 'Local Files & Session Export Manager Technical Guide',
    badge: 'In-Browser File System Manager',
    summary:
      'Centralized session file management for all your processed media. Review, inspect, batch export as a single ZIP archive, or save directly to a computer folder via the File System Access API.',
    whatItDoes: [
      'Catalogs all generated video clips, audio tracks, cropped photos, PDFs, and QR codes in one workspace.',
      'Provides integrated verification modals: video player with scrubber, audio waveform, image zoom, and PDF viewer.',
      'Direct Computer Folder Export: Uses the native File System Access API to save all files directly to your hard drive.',
      'One-Click Batch ZIP: Compresses all session files into an organized .zip archive with real-time compression progress.',
    ],
    whatItDoesNotDo: [
      'Does NOT keep files on remote cloud servers — closing or refreshing your browser tab clears in-memory session blobs.',
      'Does NOT require downloading clips one by one — full batch export support.',
    ],
    steps: [
      {
        step: 1,
        title: 'Review Processed Files',
        desc: 'Inspect your active clips, documents, and images generated across any VidCuts studio.',
      },
      {
        step: 2,
        title: 'Verify Output Quality',
        desc: 'Click on any item to open the integrated verification player and confirm precision cuts or edits.',
      },
      {
        step: 3,
        title: 'Choose Export Method',
        desc: 'Click "Save to New Folder" for direct disk write, or "Download All as ZIP" for single-click compression.',
      },
      {
        step: 4,
        title: 'Permanent Storage',
        desc: 'Your files are stored safely on your computer hard drive with zero server copies left behind.',
      },
    ],
    formats: [
      { label: 'Supported Media Types', values: 'Videos (MP4, WebM), Audio (MP3, AAC), Images (PNG, JPG, WebP), PDFs, QR Codes' },
      { label: 'Export Mechanisms', values: 'Native File System Access API (window.showDirectoryPicker), JSZip Archive' },
      { label: 'Session Storage Model', values: 'In-Memory Blob Registry (Wiped upon tab closure for maximum privacy)' },
    ],
    limitations: [
      'The File System Access API is supported in modern Chromium browsers (Chrome, Edge, Opera, Brave).',
      'On Firefox and Safari, the batch ZIP archive option is used as a universal, high-speed export fallback.',
    ],
    privacyNotes:
      'VidCuts maintains zero persistent tracking cookies or cloud file databases. Your session files exist solely in volatile browser RAM and are completely erased when you close your browser tab.',
    troubleshooting: [
      {
        issue: '"Save to Computer Folder" button is not visible or disabled',
        solution:
          'Your browser does not support the File System Access API (common on Firefox or Safari). Click "Download All as ZIP" instead to receive all files in a single archive.',
      },
      {
        issue: 'My files disappeared after refreshing the page',
        solution:
          'Because VidCuts is 100% private and does not store files on external cloud servers, refreshing clears the session memory. Always save your files before navigating away.',
      },
    ],
    faqs: [
      {
        question: 'How does "Save to Computer Folder" work without multiple download prompts?',
        answer:
          'By leveraging the standard HTML5 File System Access API, VidCuts asks for permission once to write to a designated local folder, then writes all your split clips and files directly to your disk seamlessly.',
      },
      {
        question: 'Are there any file size or clip count limits?',
        answer:
          'No! VidCuts does not impose arbitrary server quotas. The only limit is your device’s available RAM and disk storage capacity.',
      },
    ],
    relatedTools: [
      { id: 'video-cutter', label: 'Video Cutter & 9:16 Shorts', desc: 'Split long videos into organized clip collections' },
      { id: 'pdf-tools', label: '32 PDF Tools Suite', desc: 'Merge and protect business documents' },
    ],
  },
};

export interface ToolDocumentationGuideProps {
  toolId: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
}

export const ToolDocumentationGuide: React.FC<ToolDocumentationGuideProps> = ({
  toolId,
  onNavigate,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const normalizedId =
    toolId === 'image-studio'
      ? 'image-tools'
      : toolId === 'pdf-studio'
      ? 'pdf-tools'
      : toolId === 'qr'
      ? 'qr-code-generator'
      : toolId === 'files'
      ? 'file-tools'
      : toolId;

  const guide = TOOL_GUIDES[normalizedId];

  if (!guide) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 mb-16 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* 1. Header & Technical Scope */}
      <div className="border-t border-slate-200/80 pt-10 text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{guide.badge}</span>
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {guide.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {guide.summary}
        </p>
      </div>

      {/* 2. What It Does vs What It Does NOT Do (Transparency Matrix) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm uppercase tracking-wider">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>What This Tool Does</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            {guide.whatItDoes.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Scope &amp; What It Does NOT Do</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            {guide.whatItDoesNotDo.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. Step-by-Step Practical Workflow */}
      <div className="p-8 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700">
            User Workflow
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Step-by-Step Usage Instructions
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guide.steps.map((st) => (
            <div
              key={st.step}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                {st.step}
              </div>
              <h4 className="text-sm font-bold text-slate-900">{st.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Verified Formats & Technical Specifications */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <FileText className="w-5 h-5 text-emerald-600" />
          <span>Verified Specifications &amp; Format Support</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {guide.formats.map((fmt, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                {fmt.label}
              </span>
              <p className="font-semibold text-slate-900 leading-snug">{fmt.values}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Real Limitations & Troubleshooting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wider">
            <Laptop className="w-4 h-4 text-slate-600" />
            <span>Hardware &amp; Browser Requirements</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
            {guide.limitations.map((lim, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                <span>{lim}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 leading-relaxed">
              <strong>100% Privacy Model:</strong> {guide.privacyNotes}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Troubleshooting Common Issues</span>
          </div>
          <div className="space-y-3">
            {guide.troubleshooting.map((tb, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="text-rose-600 font-mono">Q:</span>
                  <span>{tb.issue}</span>
                </p>
                <p className="text-xs text-slate-600 pl-4 leading-relaxed">
                  <strong className="text-emerald-700">Solution:</strong> {tb.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Comprehensive Tool FAQs Accordion */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700">
            Direct Answers
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Frequently Asked Questions
          </h3>
        </div>
        <div className="space-y-3 max-w-4xl mx-auto">
          {guide.faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 overflow-hidden transition-all duration-150"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-bold text-slate-900">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-4 bg-white border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Related Tools Navigation */}
      <div className="p-6 rounded-3xl bg-emerald-900 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-800 pb-3">
          <div>
            <h4 className="text-base font-bold text-white">Related In-Browser Workstations</h4>
            <p className="text-xs text-emerald-200">
              Explore more zero-upload multimedia tools by Reeyansh Tech Solutions
            </p>
          </div>
          <button
            onClick={() => onNavigate('home')}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            ← Back to Suite Overview
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guide.relatedTools.map((rel) => (
            <div
              key={rel.id}
              onClick={() => onNavigate(rel.id)}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <h5 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {rel.label}
                </h5>
                <p className="text-xs text-emerald-200/80">{rel.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
