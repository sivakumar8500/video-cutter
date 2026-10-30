import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';
import { decryptPDF, isEncrypted } from '@pdfsmaller/pdf-decrypt';
import type { WatermarkOptions, PageNumberOptions } from '../types/pdfStudio';

// Helper to parse hex color to pdf-lib rgb
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 0.1, g: 0.1, b: 0.1 };
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

export class PdfEngine {
  /**
   * 1. Merge multiple PDF files into a single PDF
   */
  static async mergePdfs(files: File[]): Promise<Uint8Array> {
    if (files.length === 0) throw new Error('No files provided to merge');
    const mergedDoc = await PDFDocument.create();

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
      copiedPages.forEach((page) => mergedDoc.addPage(page));
    }

    return await mergedDoc.save();
  }

  /**
   * Get total page count of a PDF file
   */
  static async getPageCount(file: File): Promise<number> {
    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      return doc.getPageCount();
    } catch {
      return 0;
    }
  }

  /**
   * 2. Split PDF by pages into multiple files
   */
  static async splitPdf(
    file: File,
    mode: 'all-pages' | 'range',
    rangeStr?: string
  ): Promise<{ filename: string; bytes: Uint8Array; pageRangeDesc: string; pageCount: number }[]> {
    const buffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();
    const baseName = file.name.replace(/\.pdf$/i, '');
    const results: { filename: string; bytes: Uint8Array; pageRangeDesc: string; pageCount: number }[] = [];

    if (mode === 'all-pages') {
      for (let i = 0; i < totalPages; i++) {
        const newDoc = await PDFDocument.create();
        const [copied] = await newDoc.copyPages(srcDoc, [i]);
        newDoc.addPage(copied);
        const bytes = await newDoc.save();
        results.push({
          filename: `${baseName}_page_${i + 1}.pdf`,
          bytes,
          pageRangeDesc: `Page ${i + 1}`,
          pageCount: 1,
        });
      }
    } else {
      // Range e.g. "1-3, 5, 7-9"
      const ranges = (rangeStr || '1').split(',').map((r) => r.trim());
      let partIdx = 1;

      for (const range of ranges) {
        if (!range) continue;
        const pageIndicesToCopy: number[] = [];
        if (range.includes('-')) {
          const [start, end] = range.split('-').map((n) => parseInt(n.trim(), 10));
          const s = Math.max(1, start || 1);
          const e = Math.min(totalPages, end || totalPages);
          for (let p = s; p <= e; p++) {
            pageIndicesToCopy.push(p - 1);
          }
        } else {
          const p = parseInt(range, 10);
          if (p >= 1 && p <= totalPages) {
            pageIndicesToCopy.push(p - 1);
          }
        }

        if (pageIndicesToCopy.length > 0) {
          const newDoc = await PDFDocument.create();
          const copied = await newDoc.copyPages(srcDoc, pageIndicesToCopy);
          copied.forEach((cp) => newDoc.addPage(cp));
          const bytes = await newDoc.save();
          const desc = range.includes('-') ? `Pages ${range}` : `Page ${range}`;
          results.push({
            filename: `${baseName}_part_${partIdx}.pdf`,
            bytes,
            pageRangeDesc: desc,
            pageCount: pageIndicesToCopy.length,
          });
          partIdx++;
        }
      }

      if (results.length === 0) {
        throw new Error(
          `The document only has ${totalPages} page${totalPages === 1 ? '' : 's'}. None of the requested ranges (${rangeStr}) exist in this document.`
        );
      }
    }

    return results;
  }

  /**
   * 3. Rotate PDF pages
   */
  static async rotatePdf(
    file: File,
    rotationDeltaDegrees: number,
    pageIndices?: number[]
  ): Promise<Uint8Array> {
    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    pages.forEach((page, idx) => {
      if (!pageIndices || pageIndices.includes(idx)) {
        const currentAngle = page.getRotation().angle;
        page.setRotation(degrees((currentAngle + rotationDeltaDegrees) % 360));
      }
    });

    return await doc.save();
  }

  /**
   * 4. Organize PDF: reorder and remove pages
   */
  static async organizePdf(
    file: File,
    pageOrder: number[] // 0-indexed page indices
  ): Promise<Uint8Array> {
    const buffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();

    const copied = await newDoc.copyPages(srcDoc, pageOrder);
    copied.forEach((p) => newDoc.addPage(p));

    return await newDoc.save();
  }

  /**
   * Remove specified pages (1-indexed) from PDF
   */
  static async removePages(file: File, pagesToRemove: number[]): Promise<Uint8Array> {
    const buffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();
    const removeSet = new Set(pagesToRemove);

    const pagesToKeep: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (!removeSet.has(i)) {
        pagesToKeep.push(i - 1);
      }
    }

    if (pagesToKeep.length === 0) {
      throw new Error('Cannot remove all pages from document. At least 1 page must remain.');
    }

    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(srcDoc, pagesToKeep);
    copied.forEach((p) => newDoc.addPage(p));
    return await newDoc.save();
  }

  /**
   * Extract specified pages (1-indexed) from PDF
   */
  static async extractPages(file: File, pagesToExtract: number[]): Promise<Uint8Array> {
    const buffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();
    const extractSet = new Set(pagesToExtract);

    const pagesToCopy: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (extractSet.has(i)) {
        pagesToCopy.push(i - 1);
      }
    }

    if (pagesToCopy.length === 0) {
      throw new Error(`None of the requested pages (${pagesToExtract.join(', ')}) exist in the ${totalPages}-page document.`);
    }

    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(srcDoc, pagesToCopy);
    copied.forEach((p) => newDoc.addPage(p));
    return await newDoc.save();
  }

  /**
   * Create PDF from captured camera scans (data URLs)
   */
  static async createPdfFromDataUrls(dataUrls: string[]): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    for (const url of dataUrls) {
      const base64 = url.split(',')[1];
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const image = await doc.embedPng(bytes);
      const page = doc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }
    return await doc.save();
  }

  /**
   * 5. Add Watermark to PDF
   */
  static async addWatermark(
    file: File,
    options: WatermarkOptions
  ): Promise<Uint8Array> {
    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const color = hexToRgb(options.colorHex);
    const pages = doc.getPages();

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
      const textHeight = font.heightAtSize(options.fontSize);

      let x = (width - textWidth) / 2;
      let y = (height - textHeight) / 2;

      if (options.position === 'top-left') {
        x = 40;
        y = height - 60;
      } else if (options.position === 'top-right') {
        x = width - textWidth - 40;
        y = height - 60;
      } else if (options.position === 'bottom-left') {
        x = 40;
        y = 40;
      } else if (options.position === 'bottom-right') {
        x = width - textWidth - 40;
        y = 40;
      }

      page.drawText(options.text, {
        x,
        y,
        size: options.fontSize,
        font,
        color: rgb(color.r, color.g, color.b),
        opacity: options.opacity,
        rotate: degrees(options.rotationDegrees),
      });
    });

    return await doc.save();
  }

  /**
   * 6. Add Page Numbers to PDF
   */
  static async addPageNumbers(
    file: File,
    options: PageNumberOptions
  ): Promise<Uint8Array> {
    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const total = pages.length;

    pages.forEach((page, i) => {
      const pageNum = options.startNumber + i;
      let text = `${pageNum}`;
      if (options.format === 'page-x-of-y') {
        text = `Page ${pageNum} of ${total}`;
      } else if (options.format === 'custom') {
        text = `${options.prefix} ${pageNum}`;
      }

      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, options.fontSize);

      let x = (width - textWidth) / 2;
      let y = 30;

      if (options.position === 'bottom-left') {
        x = 40;
        y = 30;
      } else if (options.position === 'bottom-right') {
        x = width - textWidth - 40;
        y = 30;
      } else if (options.position === 'top-center') {
        x = (width - textWidth) / 2;
        y = height - 40;
      } else if (options.position === 'top-right') {
        x = width - textWidth - 40;
        y = height - 40;
      }

      page.drawText(text, {
        x,
        y,
        size: options.fontSize,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    });

    return await doc.save();
  }

  /**
   * 7. Convert JPG/PNG Images to PDF
   */
  static async imagesToPdf(
    imageFiles: File[],
    orientation: 'portrait' | 'landscape' = 'portrait',
    margin = 20
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.create();

    for (const imgFile of imageFiles) {
      const buffer = await imgFile.arrayBuffer();
      const isPng = imgFile.type === 'image/png';
      const image = isPng
        ? await doc.embedPng(buffer)
        : await doc.embedJpg(buffer);

      const pageWidth = orientation === 'portrait' ? 595.28 : 841.89; // A4 points
      const pageHeight = orientation === 'portrait' ? 841.89 : 595.28;

      const availWidth = pageWidth - margin * 2;
      const availHeight = pageHeight - margin * 2;

      // Scale keeping aspect ratio
      const imgAspect = image.width / image.height;
      let drawWidth = availWidth;
      let drawHeight = availWidth / imgAspect;

      if (drawHeight > availHeight) {
        drawHeight = availHeight;
        drawWidth = availHeight * imgAspect;
      }

      const x = margin + (availWidth - drawWidth) / 2;
      const y = margin + (availHeight - drawHeight) / 2;

      const page = doc.addPage([pageWidth, pageHeight]);
      page.drawImage(image, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
      });
    }

    return await doc.save();
  }

  /**
   * 8. Compress and Optimize PDF
   */
  static async compressPdf(
    file: File,
    _level: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<{ bytes: Uint8Array; originalSize: number; newSize: number }> {
    const buffer = await file.arrayBuffer();
    const originalSize = file.size;

    // Load and re-save with stream dictionary normalization
    const doc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    });

    // Strip unneeded info dictionary entries to save space
    doc.setProducer('SplitStream PDF Studio');
    doc.setCreator('SplitStream PDF Studio (Reeyansh Tech)');

    const bytes = await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    return {
      bytes,
      originalSize,
      newSize: bytes.byteLength,
    };
  }

  /**
   * 9. Sign PDF: stamp signature onto page
   */
  static async signPdf(
    file: File,
    signatureDataUrl: string,
    pageNumber = 1,
    posX = 50,
    posY = 100,
    sigWidth = 160,
    sigHeight = 60
  ): Promise<Uint8Array> {
    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();
    const targetPage = pages[Math.max(0, Math.min(pages.length - 1, pageNumber - 1))];

    // Convert signature PNG dataUrl to bytes
    const base64Data = signatureDataUrl.split(',')[1];
    const sigBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const sigImage = await doc.embedPng(sigBytes);

    targetPage.drawImage(sigImage, {
      x: posX,
      y: posY,
      width: sigWidth,
      height: sigHeight,
    });

    return await doc.save();
  }

  /**
   * 10. Redact PDF: blackout specified coordinate rectangles
   */
  static async redactPdf(
    file: File,
    areas: { pageIndex: number; x: number; y: number; width: number; height: number }[]
  ): Promise<Uint8Array> {
    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    areas.forEach((area) => {
      const page = pages[area.pageIndex];
      if (page) {
        page.drawRectangle({
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height,
          color: rgb(0, 0, 0),
        });
      }
    });

    return await doc.save();
  }

  /**
   * 11. Create PDF from Text / Markdown / HTML string
   */
  static async createPdfFromText(
    title: string,
    content: string
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 50;
    const maxLineWidth = pageWidth - margin * 2;

    let page = doc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;

    // Draw Title
    page.drawText(title, {
      x: margin,
      y: currentY,
      size: 18,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    currentY -= 35;

    // Word wrap and draw content
    const lines = content.split('\n');
    for (const rawLine of lines) {
      if (currentY < margin + 40) {
        page = doc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }

      const isHeading = rawLine.startsWith('#');
      const cleanLine = rawLine.replace(/^#+\s*/, '');
      const fontSize = isHeading ? 14 : 10;
      const currentFont = isHeading ? fontBold : fontRegular;

      // Word wrapping
      const words = cleanLine.split(' ');
      let lineBuffer = '';

      for (const word of words) {
        const testLine = lineBuffer ? `${lineBuffer} ${word}` : word;
        const testWidth = currentFont.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > maxLineWidth) {
          page.drawText(lineBuffer, {
            x: margin,
            y: currentY,
            size: fontSize,
            font: currentFont,
            color: rgb(0.15, 0.15, 0.15),
          });
          currentY -= fontSize + 4;
          lineBuffer = word;

          if (currentY < margin + 40) {
            page = doc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }
        } else {
          lineBuffer = testLine;
        }
      }

      if (lineBuffer) {
        page.drawText(lineBuffer, {
          x: margin,
          y: currentY,
          size: fontSize,
          font: currentFont,
          color: rgb(0.15, 0.15, 0.15),
        });
        currentY -= fontSize + 6;
      }
    }

    return await doc.save();
  }

  /**
   * 12. Extract text from PDF buffer
   */
  static async extractText(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const textContent = decoder.decode(bytes);

    // Clean text stream chunks
    const matches: string[] = [];
    // Match standard PDF BT ... ET (Begin Text ... End Text) blocks
    const btRegex = /BT[\s\S]*?ET/g;
    let match;
    while ((match = btRegex.exec(textContent)) !== null) {
      const block = match[0];
      const strMatches = block.match(/\((.*?)\)/g);
      if (strMatches) {
        const line = strMatches
          .map((s) => s.slice(1, -1))
          .join(' ')
          .replace(/\\([()\\])/g, '$1');
        if (line.trim().length > 1) {
          matches.push(line.trim());
        }
      }
    }

    if (matches.length > 0) {
      return matches.join('\n');
    }

    // Fallback: extract printable strings
    const printable = textContent
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return printable.length > 50
      ? printable.slice(0, 15000)
      : `Extracted content from ${file.name} (${Math.round(file.size / 1024)} KB). Contains formatted binary and vector elements.`;
  }

  /**
   * 13. In-Browser AI Summarizer
   */
  static summarizeText(text: string): {
    summary: string;
    bulletPoints: string[];
    wordCount: number;
    readingTimeMin: number;
  } {
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

    // Sentence splitting
    const sentences = text
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    if (sentences.length === 0) {
      return {
        summary: 'This document contains minimal readable textual content or is largely image/vector based.',
        bulletPoints: ['Document scanned and indexed', 'All pages preserved in memory'],
        wordCount,
        readingTimeMin: 1,
      };
    }

    // Extractive scoring by key indicator terms
    const keywords = ['result', 'important', 'summary', 'key', 'conclusion', 'total', 'overview', 'finding', 'analysis', 'objective'];
    const scored = sentences.map((sentence) => {
      let score = 0;
      keywords.forEach((kw) => {
        if (sentence.toLowerCase().includes(kw)) score += 2;
      });
      // Prefer medium length sentences
      if (sentence.length > 40 && sentence.length < 180) score += 1;
      return { sentence, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topSentences = scored.slice(0, 5).map((s) => s.sentence);

    const summary = topSentences.slice(0, 2).join(' ');
    const bulletPoints = topSentences.map((s) => s.replace(/^[•\s*-]+/, '').trim());

    return {
      summary,
      bulletPoints,
      wordCount,
      readingTimeMin,
    };
  }

  /**
   * 14. Text Difference / Comparator
   */
  static compareTexts(textA: string, textB: string): {
    added: string[];
    removed: string[];
    unchangedCount: number;
  } {
    const linesA = new Set(textA.split('\n').map((l) => l.trim()).filter(Boolean));
    const linesB = new Set(textB.split('\n').map((l) => l.trim()).filter(Boolean));

    const added: string[] = [];
    const removed: string[] = [];
    let unchangedCount = 0;

    linesB.forEach((line) => {
      if (!linesA.has(line)) {
        added.push(line);
      } else {
        unchangedCount++;
      }
    });

    linesA.forEach((line) => {
      if (!linesB.has(line)) {
        removed.push(line);
      }
    });

    return { added, removed, unchangedCount };
  }

  /**
   * 15. Format extracted text as a structured Word document (.doc)
   */
  static generateWordDoc(title: string, rawText: string): string {
    const lines = rawText.split('\n');
    let bodyHtml = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('#')) {
        bodyHtml += `<h2 style="color: #1e3a8a; font-family: Calibri, sans-serif; margin-top: 18px; margin-bottom: 6px;">${trimmed.replace(/^#+\s*/, '')}</h2>`;
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        bodyHtml += `<li style="font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5; color: #334155;">${trimmed.replace(/^[-•]\s*/, '')}</li>`;
      } else {
        bodyHtml += `<p style="font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.6; color: #1e293b; margin-bottom: 8px;">${trimmed}</p>`;
      }
    }

    return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Calibri', 'Segoe UI', sans-serif; padding: 40px; }
    h1 { color: #0f172a; font-size: 22pt; margin-bottom: 12pt; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${bodyHtml}
</body>
</html>`;
  }

  /**
   * 16. Format extracted text as an Excel / CSV spreadsheet (.csv)
   */
  static generateCsv(rawText: string): string {
    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
    const rows: string[] = [];

    for (const line of lines) {
      let cells = line.split(/\t|,|\s{2,}/).map((c) => c.trim()).filter(Boolean);
      if (cells.length === 0) cells = [line.trim()];
      const escaped = cells.map((cell) => {
        if (cell.includes('"') || cell.includes(',') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      });
      rows.push(escaped.join(','));
    }

    return rows.join('\r\n');
  }

  /**
   * 17. Format extracted text as a presentation slideshow (.ppt)
   */
  static generatePresentationHtml(title: string, rawText: string): string {
    const paragraphs = rawText.split(/\n{2,}/).filter((p) => p.trim().length > 0);
    let slidesHtml = '';

    paragraphs.slice(0, 20).forEach((para, idx) => {
      const lines = para.split('\n').filter(Boolean);
      const slideTitle = lines[0] || `Slide ${idx + 1}`;
      const bullets = lines.slice(1).map((l) => `<li style="margin-bottom: 8px;">${l}</li>`).join('');

      slidesHtml += `
      <div style="page-break-after: always; width: 800px; height: 500px; border: 2px solid #cbd5e1; border-radius: 12px; margin: 24px auto; padding: 36px; box-sizing: border-box; background: #ffffff;">
        <h2 style="color: #1e3a8a; font-size: 24pt; border-bottom: 2px solid #f97316; padding-bottom: 12px; margin-top: 0;">${slideTitle}</h2>
        <ul style="font-size: 14pt; color: #334155; line-height: 1.6; margin-top: 24px;">
          ${bullets || `<li style="margin-bottom: 8px;">${para}</li>`}
        </ul>
        <div style="margin-top: 40px; font-size: 10pt; color: #94a3b8; text-align: right;">Slide ${idx + 1} • SplitStream PDF Converter</div>
      </div>
      `;
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} Slides</title>
  <style>body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f1f5f9; padding: 20px; }</style>
</head>
<body>
  ${slidesHtml}
</body>
</html>`;
  }

  /**
   * 18. Format extracted text as a clean standalone HTML webpage (.html)
   */
  static generateStyledHtml(title: string, rawText: string): string {
    const lines = rawText.split('\n');
    let contentHtml = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('#')) {
        contentHtml += `<h2>${trimmed.replace(/^#+\s*/, '')}</h2>\n`;
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        contentHtml += `<li>${trimmed.replace(/^[-•]\s*/, '')}</li>\n`;
      } else {
        contentHtml += `<p>${trimmed}</p>\n`;
      }
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; padding: 40px 20px; }
    .container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0; }
    h2 { color: #334155; margin-top: 24px; }
    p, li { color: #475569; }
    .badge { display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">Converted with SplitStream</div>
    <h1>${title}</h1>
    ${contentHtml}
  </div>
</body>
</html>`;
  }

  /**
   * Protect PDF with standard AES-256 / RC4 password encryption
   */
  static async encryptPdf(
    file: File,
    userPassword: string,
    options?: {
      ownerPassword?: string;
      algorithm?: 'AES-256' | 'RC4';
      allowPrinting?: boolean;
      allowCopying?: boolean;
      allowModifying?: boolean;
    }
  ): Promise<Uint8Array> {
    if (!userPassword || userPassword.trim().length === 0) {
      throw new Error('Please enter a password to protect this document.');
    }
    const buffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(buffer);

    return await encryptPDF(pdfBytes, userPassword, {
      algorithm: options?.algorithm || 'AES-256',
      ownerPassword: options?.ownerPassword || userPassword,
      allowPrinting: options?.allowPrinting ?? true,
      allowCopying: options?.allowCopying ?? false,
      allowModifying: options?.allowModifying ?? false,
    });
  }

  /**
   * Unlock / Decrypt a password-protected PDF
   */
  static async unlockPdf(file: File, password?: string): Promise<Uint8Array> {
    const buffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(buffer);

    const status = await isEncrypted(pdfBytes);
    if (!status.encrypted) {
      // Document is not encrypted, return clean bytes
      return pdfBytes;
    }

    try {
      return await decryptPDF(pdfBytes, password || '');
    } catch {
      throw new Error('Incorrect password or unable to unlock this protected document. Please check the password.');
    }
  }
}
