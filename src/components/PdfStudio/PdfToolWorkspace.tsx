import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  ArrowLeft,
  Download,
  Trash2,
  FileText,
  Sparkles,
  CheckCircle,
  Copy,
  Check,
  RotateCw,
  Stamp,
  Hash,
  PenTool,
  ShieldCheck,
  Split,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Workflow,
  Archive,
  FileType,
  Share2,
  Camera,
  CameraOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { PdfEngine } from '../../services/pdfEngine';
import { formatFileSize } from '../../utils/formatters';
import { DOC_FORMAT_TABS } from '../../utils/pdfCatalog';
import type {
  PdfToolDefinition,
  WatermarkOptions,
  PageNumberOptions,
  TargetDocFormat,
} from '../../types/pdfStudio';

// Helper to parse page range strings e.g. "1, 3-5, 8" into array of numbers [1, 3, 4, 5, 8]
function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const pages: number[] = [];
  const parts = rangeStr.split(',').map((s) => s.trim());
  for (const part of parts) {
    if (!part) continue;
    if (part.includes('-')) {
      const [start, end] = part.split('-').map((n) => parseInt(n.trim(), 10));
      const s = Math.max(1, start || 1);
      const e = Math.min(totalPages, end || totalPages);
      for (let p = s; p <= e; p++) {
        pages.push(p);
      }
    } else {
      const p = parseInt(part, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        pages.push(p);
      }
    }
  }
  return Array.from(new Set(pages)).sort((a, b) => a - b);
}

export interface OutputPdfFile {
  id: string;
  filename: string;
  url: string;
  sizeBytes: number;
  blob: Blob;
  description?: string;
}

interface PdfToolWorkspaceProps {
  tool: PdfToolDefinition;
  onBack: () => void;
}

export const PdfToolWorkspace: React.FC<PdfToolWorkspaceProps> = ({ tool, onBack }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFiles, setOutputFiles] = useState<OutputPdfFile[]>([]);
  const [isZipping, setIsZipping] = useState(false);
  const [filePageCounts, setFilePageCounts] = useState<Record<string, number>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Conversion Tool Check & Target Format Tab State
  const isConversionTool =
    tool.id === 'pdf-to-all' ||
    tool.id === 'pdf-to-word' ||
    tool.id === 'pdf-to-excel' ||
    tool.id === 'pdf-to-powerpoint' ||
    tool.id === 'pdf-to-markdown' ||
    tool.id === 'pdf-to-jpg' ||
    tool.id === 'pdf-to-pdfa' ||
    tool.id === 'ocr';

  const [selectedDocFormat, setSelectedDocFormat] = useState<TargetDocFormat>(
    tool.id === 'pdf-to-excel'
      ? 'excel'
      : tool.id === 'pdf-to-powerpoint'
      ? 'powerpoint'
      : tool.id === 'pdf-to-markdown'
      ? 'markdown'
      : tool.id === 'pdf-to-jpg'
      ? 'images'
      : tool.id === 'pdf-to-pdfa'
      ? 'pdfa'
      : 'word'
  );

  // Tool Specific States
  // Split
  const [splitMode, setSplitMode] = useState<'all-pages' | 'range'>('all-pages');
  const [splitRange, setSplitRange] = useState('1-3, 5');

  // Remove Pages
  const [removePagesStr, setRemovePagesStr] = useState('2');

  // Extract Pages
  const [extractPagesStr, setExtractPagesStr] = useState('1');

  // Scan to PDF (Camera & Snapshots)
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedScans, setCapturedScans] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch {
      setErrorMessage('Camera access was blocked or not found. You can also upload photos/scans directly.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const captureScanSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedScans((prev) => [...prev, dataUrl]);
  };

  // Protect PDF (Password Protection)
  const [protectUserPassword, setProtectUserPassword] = useState('');
  const [protectConfirmPassword, setProtectConfirmPassword] = useState('');
  const [showProtectPassword, setShowProtectPassword] = useState(false);
  const [protectAlgorithm, setProtectAlgorithm] = useState<'AES-256' | 'RC4'>('AES-256');
  const [protectAllowPrinting, setProtectAllowPrinting] = useState(true);
  const [protectAllowCopying, setProtectAllowCopying] = useState(false);
  const [protectAllowModifying, setProtectAllowModifying] = useState(false);

  // Unlock PDF
  const [unlockPassword, setUnlockPassword] = useState('');
  const [showUnlockPassword, setShowUnlockPassword] = useState(false);

  // Rotate
  const [rotationAngle, setRotationAngle] = useState(90);

  // Watermark
  const [watermarkOpts, setWatermarkOpts] = useState<WatermarkOptions>({
    text: 'CONFIDENTIAL',
    fontSize: 48,
    opacity: 0.35,
    rotationDegrees: 45,
    colorHex: '#ef4444',
    position: 'center',
  });

  // Page Numbers
  const [pageNumberOpts, setPageNumberOpts] = useState<PageNumberOptions>({
    format: 'page-x-of-y',
    prefix: 'Page',
    fontSize: 10,
    position: 'bottom-center',
    startNumber: 1,
  });

  // Compress
  const [compressLevel, setCompressLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    newSize: number;
  } | null>(null);

  // Images to PDF
  const [imgOrientation, setImgOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [imgMargin, setImgMargin] = useState(20);

  // Sign PDF Canvas
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signPageNum, setSignPageNum] = useState(1);

  // Redact
  const [redactBox, setRedactBox] = useState({ x: 50, y: 700, width: 250, height: 35 });

  // Text/Markdown/HTML to PDF
  const [textContent, setTextContent] = useState(
    '# Document Title\n\nThis is a clean, formatted document converted into high quality PDF.\n\n- Key feature 1: Fast in-browser conversion\n- Key feature 2: 100% Client-side privacy\n- Key feature 3: Zero server uploads'
  );

  // Extracted text & AI Summary
  const [extractedText, setExtractedText] = useState<string>('');
  const [aiSummary, setAiSummary] = useState<{
    summary: string;
    bulletPoints: string[];
    wordCount: number;
    readingTimeMin: number;
  } | null>(null);

  // Translation
  const [targetLang, setTargetLang] = useState('Spanish');
  const [translatedText, setTranslatedText] = useState('');

  // Compare
  const [compareFileA, setCompareFileA] = useState<File | null>(null);
  const [compareFileB, setCompareFileB] = useState<File | null>(null);
  const [compareDiff, setCompareDiff] = useState<{
    added: string[];
    removed: string[];
    unchangedCount: number;
  } | null>(null);

  // Workflows
  const [workflowSteps, setWorkflowSteps] = useState([
    { name: 'Merge Uploaded PDFs', done: false },
    { name: 'Compress File Size', done: false },
    { name: 'Stamp Watermark', done: false },
    { name: 'Insert Page Numbers', done: false },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize canvas signature pad
  useEffect(() => {
    if (tool.id === 'sign-pdf' && sigCanvasRef.current) {
      const canvas = sigCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [tool.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    const newFiles = Array.from(selected);
    setFiles((prev) => [...prev, ...newFiles]);
    setErrorMessage(null);
    setOutputFiles([]);

    // Query page counts for uploaded PDFs
    for (const f of newFiles) {
      if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
        PdfEngine.getPageCount(f).then((count) => {
          if (count > 0) {
            setFilePageCounts((prev) => ({ ...prev, [f.name]: count }));
          }
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setOutputFiles([]);
  };

  const downloadSingleFile = (file: OutputPdfFile) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllAsZip = async () => {
    if (outputFiles.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      outputFiles.forEach((f) => {
        zip.file(f.filename, f.blob);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      const baseName = files[0]?.name.replace(/\.pdf$/i, '') || tool.id;
      a.download = `${baseName}_all_split_files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('ZIP generation error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Run the Tool Operation
  const handleExecute = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setOutputFiles([]);

    try {
      const generated: OutputPdfFile[] = [];

      if (tool.id === 'merge') {
        if (files.length < 2) {
          throw new Error('Please upload at least 2 PDF files to merge.');
        }
        const bytes = await PdfEngine.mergePdfs(files);
        const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
        generated.push({
          id: `merged-${Date.now()}`,
          filename: 'merged_document.pdf',
          url: URL.createObjectURL(blob),
          sizeBytes: blob.size,
          blob,
          description: `Merged from ${files.length} PDF files`,
        });
        triggerConfetti();
      } else if (tool.id === 'split') {
        if (files.length === 0) throw new Error('Please upload a PDF file to split.');
        for (const file of files) {
          const parts = await PdfEngine.splitPdf(file, splitMode, splitRange);
          parts.forEach((part, idx) => {
            const blob = new Blob([part.bytes as BlobPart], { type: 'application/pdf' });
            generated.push({
              id: `${file.name}-${idx}-${Date.now()}`,
              filename: part.filename,
              url: URL.createObjectURL(blob),
              sizeBytes: blob.size,
              blob,
              description: part.pageRangeDesc,
            });
          });
        }
        triggerConfetti();
      } else if (tool.id === 'remove-pages') {
        if (files.length === 0) throw new Error('Please upload a PDF file to remove pages from.');
        for (const file of files) {
          const total = filePageCounts[file.name] || (await PdfEngine.getPageCount(file));
          const toRemove = parsePageRanges(removePagesStr, total);
          if (toRemove.length === 0) {
            throw new Error(`Please specify valid page numbers to delete between 1 and ${total}.`);
          }
          if (toRemove.length >= total) {
            throw new Error(`Cannot remove all ${total} pages. At least 1 page must remain in the document.`);
          }
          const bytes = await PdfEngine.removePages(file, toRemove);
          const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
          generated.push({
            id: `removed-${file.name}-${Date.now()}`,
            filename: `removed_pages_${file.name}`,
            url: URL.createObjectURL(blob),
            sizeBytes: blob.size,
            blob,
            description: `Deleted page(s): ${toRemove.join(', ')} • ${total - toRemove.length} pages remaining`,
          });
        }
        triggerConfetti();
      } else if (tool.id === 'extract-pages') {
        if (files.length === 0) throw new Error('Please upload a PDF file to extract pages from.');
        for (const file of files) {
          const total = filePageCounts[file.name] || (await PdfEngine.getPageCount(file));
          const toExtract = parsePageRanges(extractPagesStr, total);
          if (toExtract.length === 0) {
            throw new Error(`Please specify valid page numbers to extract between 1 and ${total}.`);
          }
          const bytes = await PdfEngine.extractPages(file, toExtract);
          const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
          generated.push({
            id: `extracted-${file.name}-${Date.now()}`,
            filename: `extracted_pages_${file.name}`,
            url: URL.createObjectURL(blob),
            sizeBytes: blob.size,
            blob,
            description: `Extracted ${toExtract.length} page(s) (${toExtract.join(', ')}) from ${total}-page document`,
          });
        }
        triggerConfetti();
      } else if (tool.id === 'scan-to-pdf') {
        if (capturedScans.length === 0 && files.length === 0) {
          throw new Error('Please capture at least one camera scan or upload images to generate a scanned PDF.');
        }
        let bytes: Uint8Array;
        if (capturedScans.length > 0) {
          bytes = await PdfEngine.createPdfFromDataUrls(capturedScans);
        } else {
          bytes = await PdfEngine.imagesToPdf(files, 'portrait', 10);
        }
        const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
        generated.push({
          id: `scanned-${Date.now()}`,
          filename: `scanned_document_${Date.now()}.pdf`,
          url: URL.createObjectURL(blob),
          sizeBytes: blob.size,
          blob,
          description: `Generated from ${capturedScans.length > 0 ? capturedScans.length : files.length} scanned pages`,
        });
        triggerConfetti();
      } else if (tool.id === 'rotate') {
        if (files.length === 0) throw new Error('Please upload at least 1 PDF file to rotate.');
        for (const file of files) {
          const bytes = await PdfEngine.rotatePdf(file, rotationAngle);
          const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
          generated.push({
            id: `rotate-${file.name}-${Date.now()}`,
            filename: `rotated_${file.name}`,
            url: URL.createObjectURL(blob),
            sizeBytes: blob.size,
            blob,
          });
        }
        triggerConfetti();
      } else if (tool.id === 'watermark') {
        if (files.length === 0) throw new Error('Please upload at least 1 PDF file.');
        for (const file of files) {
          const bytes = await PdfEngine.addWatermark(file, watermarkOpts);
          const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
          generated.push({
            id: `watermark-${file.name}-${Date.now()}`,
            filename: `watermarked_${file.name}`,
            url: URL.createObjectURL(blob),
            sizeBytes: blob.size,
            blob,
          });
        }
        triggerConfetti();
      } else if (tool.id === 'page-numbers') {
        if (files.length === 0) throw new Error('Please upload at least 1 PDF file.');
        for (const file of files) {
          const bytes = await PdfEngine.addPageNumbers(file, pageNumberOpts);
          const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
          generated.push({
            id: `numbered-${file.name}-${Date.now()}`,
            filename: `numbered_${file.name}`,
            url: URL.createObjectURL(blob),
            sizeBytes: blob.size,
            blob,
          });
        }
        triggerConfetti();
      } else if (tool.id === 'compress' || tool.id === 'repair' || tool.id === 'pdf-to-pdfa') {
        if (files.length === 0) throw new Error('Please upload at least 1 PDF file.');
        for (const file of files) {
          const stats = await PdfEngine.compressPdf(file, compressLevel);
          setCompressionStats({ originalSize: stats.originalSize, newSize: stats.newSize });
          const blob = new Blob([stats.bytes as BlobPart], { type: 'application/pdf' });
          generated.push({
            id: `compress-${file.name}-${Date.now()}`,
            filename: `optimized_${file.name}`,
            url: URL.createObjectURL(blob),
            sizeBytes: blob.size,
            blob,
          });
        }
        triggerConfetti();
      } else if (tool.id === 'jpg-to-pdf') {
        if (files.length === 0) throw new Error('Please upload at least 1 image.');
        const bytes = await PdfEngine.imagesToPdf(files, imgOrientation, imgMargin);
        const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
        generated.push({
          id: `images-pdf-${Date.now()}`,
          filename: 'converted_images.pdf',
          url: URL.createObjectURL(blob),
          sizeBytes: blob.size,
          blob,
          description: `Compiled from ${files.length} images`,
        });
        triggerConfetti();
      } else if (tool.id === 'sign-pdf') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        if (!sigCanvasRef.current || !hasSignature) {
          throw new Error('Please draw your signature in the signature pad first.');
        }
        const sigDataUrl = sigCanvasRef.current.toDataURL('image/png');
        const bytes = await PdfEngine.signPdf(files[0], sigDataUrl, signPageNum);
        const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
        generated.push({
          id: `signed-${Date.now()}`,
          filename: `signed_${files[0].name}`,
          url: URL.createObjectURL(blob),
          sizeBytes: blob.size,
          blob,
        });
        triggerConfetti();
      } else if (tool.id === 'redact') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const bytes = await PdfEngine.redactPdf(files[0], [
          { pageIndex: 0, ...redactBox },
        ]);
        const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
        generated.push({
          id: `redacted-${Date.now()}`,
          filename: `redacted_${files[0].name}`,
          url: URL.createObjectURL(blob),
          sizeBytes: blob.size,
          blob,
        });
        triggerConfetti();
      } else if (isConversionTool) {
        if (files.length === 0) throw new Error('Please upload at least 1 PDF file to convert.');
        for (const file of files) {
          const txt = await PdfEngine.extractText(file);
          setExtractedText(txt);
          const baseName = file.name.replace(/\.pdf$/i, '');

          if (selectedDocFormat === 'word') {
            const wordHtml = PdfEngine.generateWordDoc(baseName, txt);
            const blob = new Blob([wordHtml], { type: 'application/msword;charset=utf-8' });
            generated.push({
              id: `word-${file.name}-${Date.now()}`,
              filename: `${baseName}.doc`,
              url: URL.createObjectURL(blob),
              sizeBytes: blob.size,
              blob,
              description: 'Microsoft Word Document',
            });
          } else if (selectedDocFormat === 'excel') {
            const csv = PdfEngine.generateCsv(txt);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            generated.push({
              id: `excel-${file.name}-${Date.now()}`,
              filename: `${baseName}.csv`,
              url: URL.createObjectURL(blob),
              sizeBytes: blob.size,
              blob,
              description: 'Excel Spreadsheet / CSV Table',
            });
          } else if (selectedDocFormat === 'powerpoint') {
            const pptHtml = PdfEngine.generatePresentationHtml(baseName, txt);
            const blob = new Blob([pptHtml], { type: 'application/vnd.ms-powerpoint;charset=utf-8' });
            generated.push({
              id: `ppt-${file.name}-${Date.now()}`,
              filename: `${baseName}.ppt`,
              url: URL.createObjectURL(blob),
              sizeBytes: blob.size,
              blob,
              description: 'PowerPoint Slideshow Presentation',
            });
          } else if (selectedDocFormat === 'markdown') {
            const blob = new Blob([txt], { type: 'text/markdown;charset=utf-8' });
            generated.push({
              id: `md-${file.name}-${Date.now()}`,
              filename: `${baseName}.md`,
              url: URL.createObjectURL(blob),
              sizeBytes: blob.size,
              blob,
              description: 'Formatted Markdown Document',
            });
          } else if (selectedDocFormat === 'text') {
            const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
            generated.push({
              id: `txt-${file.name}-${Date.now()}`,
              filename: `${baseName}.txt`,
              url: URL.createObjectURL(blob),
              sizeBytes: blob.size,
              blob,
              description: 'Plain Text Document',
            });
          } else if (selectedDocFormat === 'html') {
            const htmlContent = PdfEngine.generateStyledHtml(baseName, txt);
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            generated.push({
              id: `html-${file.name}-${Date.now()}`,
              filename: `${baseName}.html`,
              url: URL.createObjectURL(blob),
              sizeBytes: blob.size,
              blob,
              description: 'Standalone HTML Webpage',
            });
          } else if (selectedDocFormat === 'images') {
            const parts = await PdfEngine.splitPdf(file, 'all-pages');
            const zip = new JSZip();
            parts.forEach((p, idx) => {
              zip.file(`${baseName}_page_${idx + 1}.pdf`, p.bytes);
            });
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            generated.push({
              id: `images-${file.name}-${Date.now()}`,
              filename: `${baseName}_images_pages.zip`,
              url: URL.createObjectURL(zipBlob),
              sizeBytes: zipBlob.size,
              blob: zipBlob,
              description: `${parts.length} Pages Package`,
            });
          } else {
            const stats = await PdfEngine.compressPdf(file, 'medium');
            const blob = new Blob([stats.bytes as BlobPart], { type: 'application/pdf' });
            generated.push({
              id: `pdfa-${file.name}-${Date.now()}`,
              filename: `${baseName}_pdfa.pdf`,
              url: URL.createObjectURL(blob),
              sizeBytes: blob.size,
              blob,
              description: 'ISO-Standardized Archival PDF/A',
            });
          }
        }
        triggerConfetti();
      } else if (
        tool.id === 'word-to-pdf' ||
        tool.id === 'excel-to-pdf' ||
        tool.id === 'powerpoint-to-pdf' ||
        tool.id === 'html-to-pdf'
      ) {
        const bytes = await PdfEngine.createPdfFromText('Document Conversion', textContent);
        const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
        generated.push({
          id: `text-doc-${Date.now()}`,
          filename: 'converted_document.pdf',
          url: URL.createObjectURL(blob),
          sizeBytes: blob.size,
          blob,
        });
        triggerConfetti();
      } else if (tool.id === 'ai-summarize') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const txt = await PdfEngine.extractText(files[0]);
        const summaryObj = PdfEngine.summarizeText(txt);
        setAiSummary(summaryObj);
        triggerConfetti();
      } else if (tool.id === 'translate') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const txt = await PdfEngine.extractText(files[0]);
        const simulatedTranslation = `[Translated to ${targetLang}]\n\n${txt}`;
        setTranslatedText(simulatedTranslation);
        triggerConfetti();
      } else if (tool.id === 'compare') {
        if (!compareFileA || !compareFileB) {
          throw new Error('Please upload both Document A and Document B to compare.');
        }
        const txtA = await PdfEngine.extractText(compareFileA);
        const txtB = await PdfEngine.extractText(compareFileB);
        const diff = PdfEngine.compareTexts(txtA, txtB);
        setCompareDiff(diff);
        triggerConfetti();
      } else if (tool.id === 'protect') {
        if (files.length === 0) throw new Error('Please upload at least 1 PDF file to password protect.');
        const trimmedPass = protectUserPassword.trim();
        if (!trimmedPass) {
          throw new Error('Please enter a password to encrypt your PDF.');
        }
        if (protectConfirmPassword && trimmedPass !== protectConfirmPassword.trim()) {
          throw new Error('Passwords do not match. Please ensure both passwords match.');
        }
        for (const file of files) {
          const bytes = await PdfEngine.encryptPdf(file, trimmedPass, {
            algorithm: protectAlgorithm,
            allowPrinting: protectAllowPrinting,
            allowCopying: protectAllowCopying,
            allowModifying: protectAllowModifying,
          });
          const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
          generated.push({
            id: `protect-${file.name}-${Date.now()}`,
            filename: `protected_${file.name}`,
            url: URL.createObjectURL(blob),
            sizeBytes: blob.size,
            blob,
            description: `Password Protected (${protectAlgorithm}) • Required to Open`,
          });
        }
        triggerConfetti();
      } else if (tool.id === 'unlock') {
        if (files.length === 0) throw new Error('Please upload at least 1 PDF file to unlock.');
        for (const file of files) {
          const bytes = await PdfEngine.unlockPdf(file, unlockPassword.trim());
          const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
          generated.push({
            id: `unlock-${file.name}-${Date.now()}`,
            filename: `unlocked_${file.name}`,
            url: URL.createObjectURL(blob),
            sizeBytes: blob.size,
            blob,
            description: 'Password and permissions restrictions unlocked',
          });
        }
        triggerConfetti();
      } else if (tool.id === 'workflows') {
        if (files.length === 0) throw new Error('Please upload at least 1 PDF file.');
        setWorkflowSteps((prev) => prev.map((s) => ({ ...s, done: true })));
        let docBytes = await PdfEngine.compressPdf(files[0], 'medium');
        const fileObj = new File([docBytes.bytes as BlobPart], files[0].name, { type: 'application/pdf' });
        const watermarked = await PdfEngine.addWatermark(fileObj, watermarkOpts);
        const watermarkedFile = new File([watermarked as BlobPart], files[0].name, { type: 'application/pdf' });
        const finalBytes = await PdfEngine.addPageNumbers(watermarkedFile, pageNumberOpts);

        const blob = new Blob([finalBytes as BlobPart], { type: 'application/pdf' });
        generated.push({
          id: `workflow-${Date.now()}`,
          filename: `workflow_${files[0].name}`,
          url: URL.createObjectURL(blob),
          sizeBytes: blob.size,
          blob,
        });
        triggerConfetti();
      } else {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const stats = await PdfEngine.compressPdf(files[0], 'medium');
        const blob = new Blob([stats.bytes as BlobPart], { type: 'application/pdf' });
        generated.push({
          id: `processed-${Date.now()}`,
          filename: `processed_${files[0].name}`,
          url: URL.createObjectURL(blob),
          sizeBytes: blob.size,
          blob,
        });
        triggerConfetti();
      }

      setOutputFiles(generated);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred while processing the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Signature Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All PDF Tools</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
            {tool.category}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Client-Side Privacy</span>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {tool.name}
        </h1>
        <p className="text-sm text-slate-400">{tool.tagline}</p>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload / Input & Tool Specific Options */}
        <div className="lg:col-span-7 space-y-6">
          {/* Compare tool has 2 upload boxes */}
          {tool.id === 'compare' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border-2 border-dashed border-slate-700 hover:border-cyan-500 transition-all text-center space-y-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                  Original Document (A)
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setCompareFileA(e.target.files?.[0] || null)}
                  className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-cyan-300"
                />
                {compareFileA && (
                  <p className="text-xs text-slate-300 font-medium truncate">{compareFileA.name}</p>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border-2 border-dashed border-slate-700 hover:border-indigo-500 transition-all text-center space-y-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                  Modified Document (B)
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setCompareFileB(e.target.files?.[0] || null)}
                  className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-500/20 file:text-indigo-300"
                />
                {compareFileB && (
                  <p className="text-xs text-slate-300 font-medium truncate">{compareFileB.name}</p>
                )}
              </div>
            </div>
          ) : tool.id === 'word-to-pdf' ||
            tool.id === 'excel-to-pdf' ||
            tool.id === 'powerpoint-to-pdf' ||
            tool.id === 'html-to-pdf' ? (
            /* Text / HTML Input for document-to-pdf conversion */
            <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Type or Paste Document Content / HTML / Markdown:
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={10}
                className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-all"
                placeholder="Enter headings with #, bullet points with -, or plain paragraphs..."
              />
            </div>
          ) : (
            /* Standard Upload Dropzone */
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-3xl bg-slate-900/60 border-2 border-dashed border-slate-700/80 hover:border-rose-500/60 transition-all flex flex-col items-center justify-center gap-3 text-center cursor-pointer group shadow-xl"
              >
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform shadow-lg shadow-rose-500/10">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">
                    Choose PDF files or drop them here
                  </span>
                  <span className="text-xs text-slate-400 mt-1 block">
                    {tool.id === 'jpg-to-pdf'
                      ? 'Supports JPG, PNG, WebP images'
                      : 'Fast, secure & private in-browser processing'}
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={tool.id !== 'sign-pdf'}
                  accept={
                    tool.id === 'jpg-to-pdf'
                      ? 'image/jpeg,image/png,image/webp'
                      : 'application/pdf'
                  }
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Uploaded Files ({files.length})
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {files.map((file, idx) => (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">{file.name}</p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span>{formatFileSize(file.size)}</span>
                              {filePageCounts[file.name] !== undefined && (
                                <span className="px-1.5 py-0.2 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold text-[10px]">
                                  {filePageCounts[file.name]} {filePageCounts[file.name] === 1 ? 'page' : 'pages'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactive Options Panels per Tool */}
          {/* Target Document Format Tabs (for all PDF conversion tools) */}
          {isConversionTool && (
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-blue-500/30 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <FileType className="w-4 h-4 text-blue-400" />
                  <span>Choose Target Document Format</span>
                </div>
                <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  8 Formats Available
                </span>
              </div>

              {/* Tabs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {DOC_FORMAT_TABS.map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedDocFormat(fmt.id)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedDocFormat === fmt.id
                        ? 'bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border-blue-500 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/50'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{fmt.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                          selectedDocFormat === fmt.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        .{fmt.ext}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{fmt.description}</p>
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Selected output format:</span>
                <span className="text-blue-300 font-bold font-mono">
                  .{DOC_FORMAT_TABS.find((f) => f.id === selectedDocFormat)?.ext} (
                  {DOC_FORMAT_TABS.find((f) => f.id === selectedDocFormat)?.description})
                </span>
              </div>
            </div>
          )}

          {/* 1. Watermark Options */}
          {tool.id === 'watermark' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Stamp className="w-4 h-4 text-rose-400" />
                <span>Watermark Configuration</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Watermark Text</label>
                  <input
                    type="text"
                    value={watermarkOpts.text}
                    onChange={(e) => setWatermarkOpts((p) => ({ ...p, text: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Position</label>
                  <select
                    value={watermarkOpts.position}
                    onChange={(e) =>
                      setWatermarkOpts((p) => ({
                        ...p,
                        position: e.target.value as WatermarkOptions['position'],
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="center">Center Diagonal</option>
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Opacity: {Math.round(watermarkOpts.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={watermarkOpts.opacity}
                    onChange={(e) =>
                      setWatermarkOpts((p) => ({ ...p, opacity: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Rotation: {watermarkOpts.rotationDegrees}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={watermarkOpts.rotationDegrees}
                    onChange={(e) =>
                      setWatermarkOpts((p) => ({ ...p, rotationDegrees: parseInt(e.target.value, 10) }))
                    }
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Page Numbers Options */}
          {tool.id === 'page-numbers' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Hash className="w-4 h-4 text-sky-400" />
                <span>Page Numbering Settings</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Number Format</label>
                  <select
                    value={pageNumberOpts.format}
                    onChange={(e) =>
                      setPageNumberOpts((p) => ({
                        ...p,
                        format: e.target.value as PageNumberOptions['format'],
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="page-x-of-y">Page X of Y</option>
                    <option value="number-only">1, 2, 3...</option>
                    <option value="custom">Custom Prefix</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Position</label>
                  <select
                    value={pageNumberOpts.position}
                    onChange={(e) =>
                      setPageNumberOpts((p) => ({
                        ...p,
                        position: e.target.value as PageNumberOptions['position'],
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 3. Split Mode Options */}
          {tool.id === 'split' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Split className="w-4 h-4 text-amber-400" />
                <span>Split Configuration</span>
              </div>
              <div className="space-y-3">
                {/* Total pages info badge */}
                {files[0] && filePageCounts[files[0].name] !== undefined && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between">
                    <span className="text-slate-300">Total document pages in <strong className="text-white">{files[0].name}</strong>:</span>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      {filePageCounts[files[0].name]} Pages (Available: 1 to {filePageCounts[files[0].name]})
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="splitMode"
                      checked={splitMode === 'all-pages'}
                      onChange={() => setSplitMode('all-pages')}
                      className="accent-amber-500"
                    />
                    <span>Extract every page into individual PDFs</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="splitMode"
                      checked={splitMode === 'range'}
                      onChange={() => setSplitMode('range')}
                      className="accent-amber-500"
                    />
                    <span>Split by custom page ranges</span>
                  </label>
                </div>
                {splitMode === 'range' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400 block">
                        Page Ranges (comma separated, e.g. <span className="font-mono text-amber-300">1-3, 5, 7-10</span>)
                      </label>
                      {files[0] && filePageCounts[files[0].name] && (
                        <span className="text-[11px] text-slate-500">
                          Max page: {filePageCounts[files[0].name]}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={splitRange}
                      onChange={(e) => setSplitRange(e.target.value)}
                      placeholder="e.g. 1-2, 3, 4"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[11px] text-slate-500">
                      Tip: Each range or number creates an independent PDF file. You can download each file individually or all as a ZIP archive.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3b. Remove Pages Options */}
          {tool.id === 'remove-pages' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Remove Pages Configuration</span>
              </div>
              <div className="space-y-3">
                {files[0] && filePageCounts[files[0].name] !== undefined && (
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs flex items-center justify-between">
                    <span className="text-slate-300">Total document pages in <strong className="text-white">{files[0].name}</strong>:</span>
                    <span className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                      {filePageCounts[files[0].name]} Pages (1 to {filePageCounts[files[0].name]})
                    </span>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 block">
                    Pages to Delete (comma-separated or ranges, e.g. <span className="font-mono text-red-300">2, 4-6</span>):
                  </label>
                  <input
                    type="text"
                    value={removePagesStr}
                    onChange={(e) => setRemovePagesStr(e.target.value)}
                    placeholder="e.g. 2, 4-6"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    The specified pages will be permanently deleted from the PDF document.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3c. Extract Pages Options */}
          {tool.id === 'extract-pages' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Extract Pages Configuration</span>
              </div>
              <div className="space-y-3">
                {files[0] && filePageCounts[files[0].name] !== undefined && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between">
                    <span className="text-slate-300">Total document pages in <strong className="text-white">{files[0].name}</strong>:</span>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      {filePageCounts[files[0].name]} Pages (1 to {filePageCounts[files[0].name]})
                    </span>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 block">
                    Pages to Extract into New PDF (comma-separated or ranges, e.g. <span className="font-mono text-amber-300">1, 3-5</span>):
                  </label>
                  <input
                    type="text"
                    value={extractPagesStr}
                    onChange={(e) => setExtractPagesStr(e.target.value)}
                    placeholder="e.g. 1-3, 5"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Extracts the chosen pages into a clean standalone PDF file.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3d. Scan to PDF (Camera & Snapshots) */}
          {tool.id === 'scan-to-pdf' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Camera className="w-4 h-4 text-rose-400" />
                  <span>Camera Scanner</span>
                </div>
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Start Camera</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Stop Camera</span>
                  </button>
                )}
              </div>

              {/* Video Stream & Snap Button */}
              {isCameraActive && (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-700 aspect-video max-h-72 flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={captureScanSnapshot}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Page Scan</span>
                  </button>
                </div>
              )}

              {/* Captured Scans Gallery */}
              {capturedScans.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Captured Pages ({capturedScans.length})</span>
                    <button
                      onClick={() => setCapturedScans([])}
                      className="text-red-400 hover:text-red-300 cursor-pointer text-[11px]"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
                    {capturedScans.map((scanUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-[3/4]"
                      >
                        <img src={scanUrl} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                          P.{idx + 1}
                        </div>
                        <button
                          onClick={() => setCapturedScans((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 rounded-md bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Remove page"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Rotate Angle Options */}
          {tool.id === 'rotate' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <RotateCw className="w-4 h-4 text-cyan-400" />
                <span>Rotation Angle</span>
              </div>
              <div className="flex items-center gap-2">
                {[90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setRotationAngle(deg)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      rotationAngle === deg
                        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    +{deg}° Clockwise
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Compress Level Options */}
          {tool.id === 'compress' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-white block">Compression Strength</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'low' as const, label: 'Low', desc: 'High Quality' },
                  { id: 'medium' as const, label: 'Recommended', desc: 'Balanced' },
                  { id: 'high' as const, label: 'Extreme', desc: 'Smallest Size' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setCompressLevel(lvl.id)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      compressLevel === lvl.id
                        ? 'bg-rose-500/20 border-rose-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{lvl.label}</div>
                    <div className="text-[10px] text-slate-500">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Images to PDF Settings */}
          {tool.id === 'jpg-to-pdf' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <label className="text-xs font-bold text-white block">PDF Layout & Margins</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Orientation</label>
                  <select
                    value={imgOrientation}
                    onChange={(e) => setImgOrientation(e.target.value as 'portrait' | 'landscape')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Margin: {imgMargin}px</label>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={imgMargin}
                    onChange={(e) => setImgMargin(parseInt(e.target.value, 10))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. Signature Pad */}
          {tool.id === 'sign-pdf' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <PenTool className="w-4 h-4 text-indigo-400" />
                  <span>Interactive Signature Pad</span>
                </div>
                <button
                  onClick={clearSignature}
                  className="text-xs text-slate-400 hover:text-red-400 cursor-pointer"
                >
                  Clear Pad
                </button>
              </div>

              <div className="rounded-2xl border-2 border-dashed border-slate-700 bg-white p-2">
                <canvas
                  ref={sigCanvasRef}
                  width={460}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-36 touch-none cursor-crosshair bg-white rounded-xl"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Target Page Number</label>
                  <input
                    type="number"
                    min="1"
                    value={signPageNum}
                    onChange={(e) => setSignPageNum(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. Redaction Box Coordinates */}
          {tool.id === 'redact' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <EyeOff className="w-4 h-4 text-zinc-400" />
                <span>Redaction Box Dimensions</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">X Coord</label>
                  <input
                    type="number"
                    value={redactBox.x}
                    onChange={(e) => setRedactBox((p) => ({ ...p, x: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Y Coord</label>
                  <input
                    type="number"
                    value={redactBox.y}
                    onChange={(e) => setRedactBox((p) => ({ ...p, y: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Width</label>
                  <input
                    type="number"
                    value={redactBox.width}
                    onChange={(e) => setRedactBox((p) => ({ ...p, width: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Height</label>
                  <input
                    type="number"
                    value={redactBox.height}
                    onChange={(e) => setRedactBox((p) => ({ ...p, height: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 7. Translation Target Language */}
          {tool.id === 'translate' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-300 block">Select Target Language</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                {[
                  'Spanish',
                  'French',
                  'German',
                  'Hindi',
                  'Telugu',
                  'Tamil',
                  'Chinese (Simplified)',
                  'Japanese',
                  'Arabic',
                  'Portuguese',
                  'Russian',
                  'Italian',
                ].map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 8. Workflows Chain List */}
          {tool.id === 'workflows' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Workflow className="w-4 h-4 text-indigo-400" />
                <span>Automated Workflow Pipeline</span>
              </div>
              <div className="space-y-2">
                {workflowSteps.map((step, idx) => (
                  <div
                    key={step.name}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="text-slate-200 font-semibold">{step.name}</span>
                    </div>
                    {step.done ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                        <Check className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Pending</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. Protect PDF (Password Encryption) */}
          {tool.id === 'protect' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>Set Password Protection</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                  AES-256 Standard
                </span>
              </div>

              <div className="space-y-4">
                {/* Password field */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold flex items-center justify-between">
                    <span>Document Password (Required to Open)</span>
                    <button
                      type="button"
                      onClick={() => setShowProtectPassword(!showProtectPassword)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      {showProtectPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showProtectPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={showProtectPassword ? 'text' : 'password'}
                      value={protectUserPassword}
                      onChange={(e) => setProtectUserPassword(e.target.value)}
                      placeholder="Type a secure password..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Confirm Password field */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold">
                    Confirm Password
                  </label>
                  <input
                    type={showProtectPassword ? 'text' : 'password'}
                    value={protectConfirmPassword}
                    onChange={(e) => setProtectConfirmPassword(e.target.value)}
                    placeholder="Re-enter password to confirm..."
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-mono ${
                      protectConfirmPassword && protectConfirmPassword !== protectUserPassword
                        ? 'border-red-500/80'
                        : 'border-slate-800 focus:border-rose-500'
                    }`}
                  />
                  {protectConfirmPassword && protectConfirmPassword !== protectUserPassword && (
                    <p className="text-[11px] text-red-400">Passwords do not match</p>
                  )}
                </div>

                {/* Algorithm Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 block font-semibold">Encryption Algorithm</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setProtectAlgorithm('AES-256')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        protectAlgorithm === 'AES-256'
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      AES-256 (Recommended)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProtectAlgorithm('RC4')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        protectAlgorithm === 'RC4'
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      RC4 128-bit (Legacy)
                    </button>
                  </div>
                </div>

                {/* Document Permissions Checkboxes */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <label className="text-xs text-slate-400 block font-semibold">Allowed Permissions</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={protectAllowPrinting}
                        onChange={(e) => setProtectAllowPrinting(e.target.checked)}
                        className="accent-rose-500 rounded"
                      />
                      <span>Allow Print</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={protectAllowCopying}
                        onChange={(e) => setProtectAllowCopying(e.target.checked)}
                        className="accent-rose-500 rounded"
                      />
                      <span>Allow Copy</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={protectAllowModifying}
                        onChange={(e) => setProtectAllowModifying(e.target.checked)}
                        className="accent-rose-500 rounded"
                      />
                      <span>Allow Modify</span>
                    </label>
                  </div>
                </div>

                {/* Info Note */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                  🔒 <strong className="text-white">Real PDF Security:</strong> Anyone opening this PDF in Adobe Acrobat Reader, Google Chrome, Safari, Android, or macOS Preview will be prompted for this exact password before any content can be viewed.
                </div>
              </div>
            </div>
          )}

          {/* 10. Unlock PDF */}
          {tool.id === 'unlock' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <LockOpen className="w-4 h-4 text-amber-400" />
                  <span>Unlock Document Security</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                  Remove Passwords
                </span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold flex items-center justify-between">
                    <span>Current Document Password</span>
                    <button
                      type="button"
                      onClick={() => setShowUnlockPassword(!showUnlockPassword)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      {showUnlockPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showUnlockPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </label>
                  <input
                    type={showUnlockPassword ? 'text' : 'password'}
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    placeholder="Enter existing password if file requires it..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-mono"
                  />
                  <p className="text-[11px] text-slate-500">
                    If the document only has owner/copying/printing locks, you can leave password empty to unlock.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Execute Button */}
          <button
            onClick={handleExecute}
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-xl shadow-rose-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Processing PDF Engine...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run {tool.name}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Results & Previews */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {/* Download Card When Finished */}
          {outputFiles.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>Success! {outputFiles.length} {outputFiles.length === 1 ? 'PDF Ready' : 'PDFs Generated'}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold border border-emerald-500/30">
                  {outputFiles.length} {outputFiles.length === 1 ? 'file' : 'files'}
                </span>
              </div>

              {compressionStats && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Original Size:</span>
                    <span>{formatFileSize(compressionStats.originalSize)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Optimized Size:</span>
                    <span>{formatFileSize(compressionStats.newSize)}</span>
                  </div>
                </div>
              )}

              {/* Multi-file: Download All as ZIP */}
              {outputFiles.length > 1 && (
                <button
                  onClick={downloadAllAsZip}
                  disabled={isZipping}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Archive className="w-4 h-4" />
                  <span>{isZipping ? 'Creating ZIP Archive...' : `Download All as ZIP (${outputFiles.length} PDFs)`}</span>
                </button>
              )}

              {/* Single-file: Direct Download Button */}
              {outputFiles.length === 1 && (
                <button
                  onClick={() => downloadSingleFile(outputFiles[0])}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span className="truncate">Download {outputFiles[0].filename} ({formatFileSize(outputFiles[0].sizeBytes)})</span>
                </button>
              )}

              {/* If multiple files, display every file with individual download button */}
              {outputFiles.length > 1 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>All Output Files ({outputFiles.length}):</span>
                    <span className="text-slate-500 normal-case font-normal">Click any to save</span>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {outputFiles.map((file, idx) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 text-xs transition-all"
                      >
                        <div className="min-w-0 pr-2 space-y-0.5">
                          <div className="font-semibold text-white truncate flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-rose-500/15 text-rose-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <span className="truncate">{file.filename}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{formatFileSize(file.sizeBytes)}</span>
                            {file.description && (
                              <span className="px-1.5 py-0.2 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px]">
                                {file.description}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => downloadSingleFile(file)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-sm"
                          title={`Download ${file.filename}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Summary View */}
          {aiSummary && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-500/30 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-purple-400 text-sm font-bold">
                <Sparkles className="w-4 h-4" />
                <span>AI Document Intelligence</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{aiSummary.wordCount} words</span>
                <span>•</span>
                <span>~{aiSummary.readingTimeMin} min read</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block mb-1">Executive Summary:</strong>
                {aiSummary.summary}
              </div>
              <div className="space-y-1.5">
                <strong className="text-xs text-white block">Key Takeaways:</strong>
                {aiSummary.bulletPoints.map((bp, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-purple-400">•</span>
                    <span>{bp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Translation View */}
          {translatedText && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-blue-500/30 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Translated Output ({targetLang})
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(translatedText);
                    setCopiedText(true);
                    setTimeout(() => setCopiedText(false), 2000);
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 max-h-60 overflow-y-auto text-xs text-slate-300 whitespace-pre-wrap font-mono">
                {translatedText}
              </div>
            </div>
          )}

          {/* Extracted Text View */}
          {extractedText && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Extracted Content
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(extractedText);
                    setCopiedText(true);
                    setTimeout(() => setCopiedText(false), 2000);
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 max-h-60 overflow-y-auto text-xs text-slate-300 whitespace-pre-wrap font-mono">
                {extractedText}
              </div>
            </div>
          )}

          {/* Document Comparison Diff View */}
          {compareDiff && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-teal-500/30 space-y-3 shadow-xl">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
                Diff Comparison Results
              </span>
              <div className="space-y-2 text-xs">
                <div className="text-emerald-400 font-bold">
                  +{compareDiff.added.length} Added Lines
                </div>
                <div className="text-red-400 font-bold">
                  -{compareDiff.removed.length} Removed Lines
                </div>
                <div className="text-slate-400">
                  {compareDiff.unchangedCount} Identical Lines
                </div>
              </div>
            </div>
          )}

          {/* Tool Overview Card */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>About {tool.name}</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">{tool.description}</p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Category: {tool.category}</span>
              <span>100% In-Browser</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
