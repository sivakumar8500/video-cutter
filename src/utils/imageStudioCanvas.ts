import type {
  ImageStudioConfig,
  ImageShape,
  LoadedImageInfo,
  ExportFormat,
} from '../types/imageStudio';
import QRCode from 'qrcode';
import {
  drawFrameBackground,
  drawFrameForeground,
  getFrameWindowArea,
} from './frameTemplates';

/**
 * Creates path for various shapes inside canvas bounding box (0, 0, w, h)
 */
export function buildShapePath(
  ctx: CanvasRenderingContext2D,
  shape: ImageShape,
  w: number,
  h: number,
  radius: number
): void {
  ctx.beginPath();

  switch (shape) {
    case 'circle': {
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(cx, cy);
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      break;
    }

    case 'rounded': {
      const maxR = Math.min(w, h) / 2;
      const r = Math.min(radius, maxR);
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(0, 0, w, h, r);
      } else {
        // Fallback round rect
        ctx.moveTo(r, 0);
        ctx.lineTo(w - r, 0);
        ctx.quadraticCurveTo(w, 0, w, r);
        ctx.lineTo(w, h - r);
        ctx.quadraticCurveTo(w, h, w - r, h);
        ctx.lineTo(r, h);
        ctx.quadraticCurveTo(0, h, 0, h - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
      }
      break;
    }

    case 'squircle': {
      // Superellipse approximation
      const cx = w / 2;
      const cy = h / 2;
      const rx = w / 2;
      const ry = h / 2;
      const k = 0.86; // squircle factor
      ctx.moveTo(cx, 0);
      ctx.bezierCurveTo(cx + rx * k, 0, w, cy - ry * k, w, cy);
      ctx.bezierCurveTo(w, cy + ry * k, cx + rx * k, h, cx, h);
      ctx.bezierCurveTo(cx - rx * k, h, 0, cy + ry * k, 0, cy);
      ctx.bezierCurveTo(0, cy - ry * k, cx - rx * k, 0, cx, 0);
      break;
    }

    case 'heart': {
      const x = w / 2;
      const y = h * 0.35;
      const size = Math.min(w, h) * 0.45;
      ctx.moveTo(x, y + size * 0.6);
      ctx.bezierCurveTo(x + size * 1.1, y - size * 0.4, x + size * 1.1, y + size * 0.7, x, y + size * 1.3);
      ctx.bezierCurveTo(x - size * 1.1, y + size * 0.7, x - size * 1.1, y - size * 0.4, x, y + size * 0.6);
      break;
    }

    case 'star': {
      const cx = w / 2;
      const cy = h / 2;
      const outerR = Math.min(cx, cy);
      const innerR = outerR * 0.45;
      const points = 5;
      const step = Math.PI / points;
      let rot = (Math.PI / 2) * 3;

      ctx.moveTo(cx, cy - outerR);
      for (let i = 0; i < points; i++) {
        let px = cx + Math.cos(rot) * outerR;
        let py = cy + Math.sin(rot) * outerR;
        ctx.lineTo(px, py);
        rot += step;

        px = cx + Math.cos(rot) * innerR;
        py = cy + Math.sin(rot) * innerR;
        ctx.lineTo(px, py);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerR);
      break;
    }

    case 'hexagon': {
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(cx, cy);
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      break;
    }

    case 'diamond': {
      const cx = w / 2;
      const cy = h / 2;
      ctx.moveTo(cx, 0);
      ctx.lineTo(w, cy);
      ctx.lineTo(cx, h);
      ctx.lineTo(0, cy);
      break;
    }

    case 'shield': {
      const cx = w / 2;
      ctx.moveTo(w * 0.1, h * 0.1);
      ctx.lineTo(w * 0.9, h * 0.1);
      ctx.lineTo(w * 0.9, h * 0.55);
      ctx.quadraticCurveTo(w * 0.9, h * 0.85, cx, h * 0.98);
      ctx.quadraticCurveTo(w * 0.1, h * 0.85, w * 0.1, h * 0.55);
      ctx.lineTo(w * 0.1, h * 0.1);
      break;
    }

    case 'rectangle':
    default:
      ctx.rect(0, 0, w, h);
      break;
  }
  ctx.closePath();
}

/**
 * Render the image according to full configuration onto a target canvas
 */
export function renderImageToCanvas(
  targetCanvas: HTMLCanvasElement,
  imageInfo: LoadedImageInfo,
  config: ImageStudioConfig
): void {
  const { resize, shape, adjustments } = config;
  const outW = Math.max(16, Math.round(resize.width));
  const outH = Math.max(16, Math.round(resize.height));

  targetCanvas.width = outW;
  targetCanvas.height = outH;

  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  ctx.clearRect(0, 0, outW, outH);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If a Themed Frame is active, render with realistic 3-layer sandwich:
  // Layer 1: Frame Background (wall, room, party glow, backdrop)
  // Layer 2: Photo clipped inside Frame Window Area (movable & zoomable with cursor)
  // Layer 3: Frame Foreground (3D balloons, party hats, bunting, cakes, leaves, chairs, text banners)
  // If a Themed Frame or Custom Uploaded Frame is active:
  if (config.frame && config.frame.enabled) {
    // Case A: Custom Uploaded Frame (User uploaded their own frame PNG/JPG)
    if (config.frame.customFrameElement) {
      // Background handling
      if (shape.backgroundMode === 'solid') {
        ctx.fillStyle = shape.backgroundColor || '#000000';
        ctx.fillRect(0, 0, outW, outH);
      } else if (shape.backgroundMode === 'blur') {
        ctx.save();
        ctx.filter = 'blur(20px) brightness(0.7)';
        ctx.drawImage(imageInfo.imgElement, -outW * 0.1, -outH * 0.1, outW * 1.2, outH * 1.2);
        ctx.restore();
      }

      // Draw photo with adjustments & cursor pan/zoom
      ctx.save();
      const imgW = imageInfo.originalWidth || imageInfo.imgElement.naturalWidth || 800;
      const imgH = imageInfo.originalHeight || imageInfo.imgElement.naturalHeight || 600;
      const centerX = outW / 2 + (adjustments.offsetX || 0);
      const centerY = outH / 2 + (adjustments.offsetY || 0);
      ctx.translate(centerX, centerY);

      const baseScale = Math.max(outW / imgW, outH / imgH);
      const currentZoom = (adjustments.zoom || 1) * baseScale;
      const sx = (adjustments.scaleX ?? 1) * (adjustments.flipH ? -1 : 1);
      const sy = (adjustments.scaleY ?? 1) * (adjustments.flipV ? -1 : 1);
      ctx.scale(currentZoom * sx, currentZoom * sy);

      if (adjustments.rotation !== 0) {
        ctx.rotate((adjustments.rotation * Math.PI) / 180);
      }

      const filters: string[] = [];
      if (adjustments.brightness !== 100) filters.push(`brightness(${adjustments.brightness}%)`);
      if (adjustments.contrast !== 100) filters.push(`contrast(${adjustments.contrast}%)`);
      if (adjustments.saturation !== 100) filters.push(`saturate(${adjustments.saturation}%)`);
      if (adjustments.blur > 0) filters.push(`blur(${adjustments.blur}px)`);
      if (adjustments.grayscale > 0) filters.push(`grayscale(${adjustments.grayscale}%)`);
      if (adjustments.sepia > 0) filters.push(`sepia(${adjustments.sepia}%)`);
      if (adjustments.invert > 0) filters.push(`invert(${adjustments.invert}%)`);
      if (adjustments.hueRotate) filters.push(`hue-rotate(${adjustments.hueRotate}deg)`);

      if (filters.length > 0) {
        ctx.filter = filters.join(' ');
      }

      ctx.drawImage(imageInfo.imgElement, -imgW / 2, -imgH / 2, imgW, imgH);
      ctx.restore();

      // Apply Temperature Overlay
      if (adjustments.temperature && adjustments.temperature !== 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'soft-light';
        if (adjustments.temperature > 0) {
          ctx.fillStyle = `rgba(255, 140, 0, ${Math.min(0.6, (adjustments.temperature / 100) * 0.45)})`;
        } else {
          ctx.fillStyle = `rgba(0, 160, 255, ${Math.min(0.6, (Math.abs(adjustments.temperature) / 100) * 0.45)})`;
        }
        ctx.fillRect(0, 0, outW, outH);
        ctx.restore();
      }

      // Apply Vignette
      if (adjustments.vignette && adjustments.vignette > 0) {
        ctx.save();
        const grad = ctx.createRadialGradient(
          outW / 2,
          outH / 2,
          Math.min(outW, outH) * 0.35,
          outW / 2,
          outH / 2,
          Math.max(outW, outH) * 0.75
        );
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, `rgba(0,0,0,${(adjustments.vignette / 100) * 0.85})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, outW, outH);
        ctx.restore();
      }

      // Draw Custom Frame Overlay
      ctx.save();
      ctx.globalAlpha = Math.max(0.05, Math.min(1.0, config.frame.customFrameOpacity ?? 1.0));
      const cf = config.frame.customFrameElement;
      const fit = config.frame.customFrameFit || 'stretch';
      if (fit === 'stretch') {
        ctx.drawImage(cf, 0, 0, outW, outH);
      } else if (fit === 'contain') {
        const sc = Math.min(outW / (cf.naturalWidth || 1), outH / (cf.naturalHeight || 1));
        const dw = (cf.naturalWidth || outW) * sc;
        const dh = (cf.naturalHeight || outH) * sc;
        ctx.drawImage(cf, (outW - dw) / 2, (outH - dh) / 2, dw, dh);
      } else {
        const sc = Math.max(outW / (cf.naturalWidth || 1), outH / (cf.naturalHeight || 1));
        const dw = (cf.naturalWidth || outW) * sc;
        const dh = (cf.naturalHeight || outH) * sc;
        ctx.drawImage(cf, (outW - dw) / 2, (outH - dh) / 2, dw, dh);
      }
      ctx.restore();

      // Detail Boost (Sharpness & Clarity)
      if (adjustments.sharpness && adjustments.sharpness > 0) {
        applySharpnessFilter(ctx, outW, outH, adjustments.sharpness);
      }
      if (adjustments.clarity && adjustments.clarity > 0) {
        applyClarityFilter(ctx, outW, outH, adjustments.clarity);
      }

      // Render Watermark if enabled
      drawWatermarkOverlay(ctx, outW, outH, config);
      return;
    }

    // Case B: Preset Themed Frames (Layer 1: Background, Layer 2: Photo in Cutout, Layer 3: Foreground Overlays)
    drawFrameBackground(ctx, outW, outH, config.frame);

    // 2. Window cutout area
    const win = getFrameWindowArea(outW, outH, config.frame.templateId);

    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function' && win.radius > 0) {
      ctx.roundRect(win.x, win.y, win.width, win.height, win.radius);
    } else {
      ctx.rect(win.x, win.y, win.width, win.height);
    }
    ctx.clip();

    // Draw user photo inside window area
    ctx.save();
    const centerX = win.x + win.width / 2 + (adjustments.offsetX || 0);
    const centerY = win.y + win.height / 2 + (adjustments.offsetY || 0);
    ctx.translate(centerX, centerY);

    const imgW = imageInfo.originalWidth || imageInfo.imgElement.naturalWidth || 800;
    const imgH = imageInfo.originalHeight || imageInfo.imgElement.naturalHeight || 600;

    const baseScale = Math.max(win.width / imgW, win.height / imgH);
    const currentZoom = (adjustments.zoom || 1) * baseScale;
    const sx = (adjustments.scaleX ?? 1) * (adjustments.flipH ? -1 : 1);
    const sy = (adjustments.scaleY ?? 1) * (adjustments.flipV ? -1 : 1);
    ctx.scale(currentZoom * sx, currentZoom * sy);

    if (adjustments.rotation !== 0) {
      ctx.rotate((adjustments.rotation * Math.PI) / 180);
    }

    // Apply filters
    const filters: string[] = [];
    if (adjustments.brightness !== 100) filters.push(`brightness(${adjustments.brightness}%)`);
    if (adjustments.contrast !== 100) filters.push(`contrast(${adjustments.contrast}%)`);
    if (adjustments.saturation !== 100) filters.push(`saturate(${adjustments.saturation}%)`);
    if (adjustments.blur > 0) filters.push(`blur(${adjustments.blur}px)`);
    if (adjustments.grayscale > 0) filters.push(`grayscale(${adjustments.grayscale}%)`);
    if (adjustments.sepia > 0) filters.push(`sepia(${adjustments.sepia}%)`);
    if (adjustments.invert > 0) filters.push(`invert(${adjustments.invert}%)`);
    if (adjustments.hueRotate) filters.push(`hue-rotate(${adjustments.hueRotate}deg)`);

    if (filters.length > 0) {
      ctx.filter = filters.join(' ');
    }

    ctx.drawImage(
      imageInfo.imgElement,
      -imgW / 2,
      -imgH / 2,
      imgW,
      imgH
    );

    ctx.restore(); // restore photo transform
    ctx.restore(); // restore window clip

    // Apply Temperature Overlay inside window
    if (adjustments.temperature && adjustments.temperature !== 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      if (adjustments.temperature > 0) {
        ctx.fillStyle = `rgba(255, 140, 0, ${Math.min(0.6, (adjustments.temperature / 100) * 0.45)})`;
      } else {
        ctx.fillStyle = `rgba(0, 160, 255, ${Math.min(0.6, (Math.abs(adjustments.temperature) / 100) * 0.45)})`;
      }
      ctx.fillRect(win.x, win.y, win.width, win.height);
      ctx.restore();
    }

    // 3. Draw frame foreground overlay
    drawFrameForeground(ctx, outW, outH, config.frame);

    // Detail Boost (Sharpness & Clarity)
    if (adjustments.sharpness && adjustments.sharpness > 0) {
      applySharpnessFilter(ctx, outW, outH, adjustments.sharpness);
    }
    if (adjustments.clarity && adjustments.clarity > 0) {
      applyClarityFilter(ctx, outW, outH, adjustments.clarity);
    }

    // Watermark
    drawWatermarkOverlay(ctx, outW, outH, config);
    return;
  }

  // --- STANDARD SHAPE / RESIZE MODE (No Frame) ---
  // Background handling
  if (shape.backgroundMode === 'solid') {
    ctx.fillStyle = shape.backgroundColor || '#000000';
    ctx.fillRect(0, 0, outW, outH);
  } else if (shape.backgroundMode === 'blur') {
    // Draw blurred full bleed background
    ctx.save();
    ctx.filter = 'blur(20px) brightness(0.7)';
    ctx.drawImage(imageInfo.imgElement, -outW * 0.1, -outH * 0.1, outW * 1.2, outH * 1.2);
    ctx.restore();
  }

  // Save state for shape clipping
  ctx.save();

  // If a shape other than rectangle is selected, apply clip path
  if (shape.shape !== 'rectangle' || shape.cornerRadius > 0) {
    const pad = shape.borderWidth > 0 ? shape.borderWidth / 2 : 0;
    const clipW = outW - pad * 2;
    const clipH = outH - pad * 2;

    ctx.translate(pad, pad);
    buildShapePath(
      ctx,
      shape.shape,
      clipW,
      clipH,
      shape.cornerRadius
    );
    ctx.clip();
    ctx.translate(-pad, -pad);
  }

  // Draw image with adjustments, rotations, flips, and cursor pan offsets
  ctx.save();
  ctx.translate(outW / 2 + (adjustments.offsetX || 0), outH / 2 + (adjustments.offsetY || 0));

  const currentZoom = adjustments.zoom || 1;
  const sx = (adjustments.scaleX ?? 1) * (adjustments.flipH ? -1 : 1);
  const sy = (adjustments.scaleY ?? 1) * (adjustments.flipV ? -1 : 1);
  ctx.scale(currentZoom * sx, currentZoom * sy);

  if (adjustments.rotation !== 0) {
    ctx.rotate((adjustments.rotation * Math.PI) / 180);
  }

  // Build CSS filter string for canvas
  const filters: string[] = [];
  if (adjustments.brightness !== 100) filters.push(`brightness(${adjustments.brightness}%)`);
  if (adjustments.contrast !== 100) filters.push(`contrast(${adjustments.contrast}%)`);
  if (adjustments.saturation !== 100) filters.push(`saturate(${adjustments.saturation}%)`);
  if (adjustments.blur > 0) filters.push(`blur(${adjustments.blur}px)`);
  if (adjustments.grayscale > 0) filters.push(`grayscale(${adjustments.grayscale}%)`);
  if (adjustments.sepia > 0) filters.push(`sepia(${adjustments.sepia}%)`);
  if (adjustments.invert > 0) filters.push(`invert(${adjustments.invert}%)`);
  if (adjustments.hueRotate) filters.push(`hue-rotate(${adjustments.hueRotate}deg)`);

  if (filters.length > 0) {
    ctx.filter = filters.join(' ');
  }

  // Draw centered
  ctx.drawImage(
    imageInfo.imgElement,
    -outW / 2,
    -outH / 2,
    outW,
    outH
  );

  ctx.restore(); // restore adjustments & rotation

  // Apply Temperature Overlay
  if (adjustments.temperature && adjustments.temperature !== 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    if (adjustments.temperature > 0) {
      ctx.fillStyle = `rgba(255, 140, 0, ${Math.min(0.6, (adjustments.temperature / 100) * 0.45)})`;
    } else {
      ctx.fillStyle = `rgba(0, 160, 255, ${Math.min(0.6, (Math.abs(adjustments.temperature) / 100) * 0.45)})`;
    }
    ctx.fillRect(0, 0, outW, outH);
    ctx.restore();
  }

  // Apply Vignette
  if (adjustments.vignette && adjustments.vignette > 0) {
    ctx.save();
    const grad = ctx.createRadialGradient(
      outW / 2,
      outH / 2,
      Math.min(outW, outH) * 0.35,
      outW / 2,
      outH / 2,
      Math.max(outW, outH) * 0.75
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${(adjustments.vignette / 100) * 0.85})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, outW, outH);
    ctx.restore();
  }

  ctx.restore(); // restore shape clipping

  // Detail Boost (Sharpness & Clarity)
  if (adjustments.sharpness && adjustments.sharpness > 0) {
    applySharpnessFilter(ctx, outW, outH, adjustments.sharpness);
  }
  if (adjustments.clarity && adjustments.clarity > 0) {
    applyClarityFilter(ctx, outW, outH, adjustments.clarity);
  }

  // Draw Border (if enabled)
  if (shape.borderWidth > 0) {
    ctx.save();
    const pad = shape.borderWidth / 2;
    ctx.translate(pad, pad);
    const borderW = outW - pad * 2;
    const borderH = outH - pad * 2;

    buildShapePath(
      ctx,
      shape.shape,
      borderW,
      borderH,
      shape.cornerRadius
    );

    ctx.strokeStyle = shape.borderColor || '#38bdf8';
    ctx.lineWidth = shape.borderWidth;

    if (shape.borderStyle === 'dashed') {
      ctx.setLineDash([12, 6]);
    } else {
      ctx.setLineDash([]);
    }

    if (shape.shadow) {
      ctx.shadowColor = shape.shadowColor || 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = shape.shadowBlur || 15;
    }

    ctx.stroke();
    ctx.restore();
  }

  // Watermark
  drawWatermarkOverlay(ctx, outW, outH, config);
}

// Cache for generated QR canvas elements in Image Studio
const qrCanvasCache = new Map<string, HTMLCanvasElement>();

export function getCachedQrCanvas(text: string, fg: string, bg: string): HTMLCanvasElement | null {
  const key = `${text}_${fg}_${bg}`;
  if (qrCanvasCache.has(key)) return qrCanvasCache.get(key)!;
  try {
    const cv = document.createElement('canvas');
    QRCode.toCanvas(cv, text, {
      margin: 1,
      width: 256,
      color: { dark: fg, light: bg },
      errorCorrectionLevel: 'M',
    });
    qrCanvasCache.set(key, cv);
    return cv;
  } catch {
    return null;
  }
}

/**
 * Renders watermark text and/or QR Code badge overlay
 */
export function drawWatermarkOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: ImageStudioConfig
): void {
  const wm = config.watermark;
  if (!wm) return;

  // 1. Text Watermark
  if (wm.enabled && wm.text.trim()) {
    ctx.save();
    ctx.globalAlpha = Math.max(0.1, Math.min(1.0, wm.opacity ?? 0.8));

    const fontSize = wm.fontSize || 24;
    ctx.font = `bold ${fontSize}px sans-serif`;

    const text = wm.text.trim();
    const textMetrics = ctx.measureText(text);
    const textW = textMetrics.width;
    const paddingX = 14;
    const paddingY = 8;
    const badgeW = textW + paddingX * 2;
    const badgeH = fontSize + paddingY * 2;

    let x = w - badgeW - 20;
    let y = h - badgeH - 20;

    switch (wm.position) {
      case 'top-left':
        x = 20;
        y = 20;
        break;
      case 'top-right':
        x = w - badgeW - 20;
        y = 20;
        break;
      case 'bottom-left':
        x = 20;
        y = h - badgeH - 20;
        break;
      case 'center':
        x = (w - badgeW) / 2;
        y = (h - badgeH) / 2;
        break;
      case 'bottom-right':
      default:
        x = w - badgeW - 20;
        y = h - badgeH - 20;
        break;
    }

    if (wm.showBackground) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(x, y, badgeW, badgeH, 8);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, badgeW, badgeH);
      }
    }

    ctx.fillStyle = wm.color || '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + paddingX, y + badgeH / 2);
    ctx.restore();
  }

  // 2. QR Code Watermark Overlay
  if (wm.qrEnabled && wm.qrContent?.trim()) {
    const qrSize = Math.max(48, Math.min(Math.min(w, h) * 0.45, wm.qrSize || 120));
    const pad = 8;
    const boxSize = qrSize + pad * 2;
    const pos = wm.qrPosition || 'bottom-right';

    let qx = w - boxSize - 20;
    let qy = h - boxSize - 20;
    if (pos === 'top-left') {
      qx = 20;
      qy = 20;
    } else if (pos === 'top-right') {
      qx = w - boxSize - 20;
      qy = 20;
    } else if (pos === 'bottom-left') {
      qx = 20;
      qy = h - boxSize - 20;
    } else if (pos === 'center') {
      qx = (w - boxSize) / 2;
      qy = (h - boxSize) / 2;
    }

    const qrCv = getCachedQrCanvas(
      wm.qrContent.trim(),
      wm.qrFgColor || '#000000',
      wm.qrBgColor || '#ffffff'
    );

    if (qrCv) {
      ctx.save();
      ctx.globalAlpha = Math.max(0.1, Math.min(1.0, wm.opacity ?? 0.95));

      // White card background with shadow
      ctx.fillStyle = wm.qrBgColor || '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 10;
      const extraH = wm.qrLabel ? 16 : 0;
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(qx, qy, boxSize, boxSize + extraH, 12);
        ctx.fill();
      } else {
        ctx.fillRect(qx, qy, boxSize, boxSize + extraH);
      }
      ctx.shadowColor = 'transparent';

      // Draw QR image
      ctx.drawImage(qrCv, qx + pad, qy + pad, qrSize, qrSize);

      if (wm.qrLabel) {
        ctx.fillStyle = wm.qrFgColor || '#000000';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(wm.qrLabel, qx + boxSize / 2, qy + boxSize + 6);
      }
      ctx.restore();
    }
  }
}

/**
 * Apply crop box onto an image and produce a new LoadedImageInfo
 */
export async function applyCropToImage(
  imageInfo: LoadedImageInfo,
  cropRect: { x: number; y: number; width: number; height: number }
): Promise<LoadedImageInfo> {
  const cropCanvas = document.createElement('canvas');
  const cw = Math.max(16, Math.round(cropRect.width));
  const ch = Math.max(16, Math.round(cropRect.height));
  cropCanvas.width = cw;
  cropCanvas.height = ch;

  const ctx = cropCanvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.drawImage(
    imageInfo.imgElement,
    cropRect.x,
    cropRect.y,
    cropRect.width,
    cropRect.height,
    0,
    0,
    cw,
    ch
  );

  return new Promise((resolve, reject) => {
    cropCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to export cropped blob'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        resolve({
          name: imageInfo.name,
          originalWidth: cw,
          originalHeight: ch,
          originalSizeBytes: blob.size,
          previewUrl: url,
          imgElement: img,
        });
      };
      img.onerror = () => reject(new Error('Failed to load cropped image'));
      img.src = url;
    }, 'image/png');
  });
}

/**
 * Generate output blob from canvas with format and quality settings
 */
export async function exportCanvasToBlob(
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  quality: number,
  targetSizeKb?: number
): Promise<{ blob: Blob; url: string; sizeBytes: number }> {
  // If target size specified and format is jpeg/webp, iteratively find quality
  let currentQuality = Math.max(0.05, Math.min(1.0, quality));

  if (targetSizeKb && targetSizeKb > 0 && format !== 'image/png') {
    const targetBytes = targetSizeKb * 1024;
    // Binary search quality for best fit
    let minQ = 0.05;
    let maxQ = 1.0;
    let bestBlob: Blob | null = null;

    for (let iter = 0; iter < 5; iter++) {
      const testQ = (minQ + maxQ) / 2;
      const b = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((res) => resolve(res), format, testQ)
      );

      if (b) {
        bestBlob = b;
        if (b.size > targetBytes) {
          maxQ = testQ;
        } else {
          minQ = testQ;
        }
      }
    }

    if (bestBlob) {
      return {
        blob: bestBlob,
        url: URL.createObjectURL(bestBlob),
        sizeBytes: bestBlob.size,
      };
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to generate image blob from canvas'));
          return;
        }
        resolve({
          blob,
          url: URL.createObjectURL(blob),
          sizeBytes: blob.size,
        });
      },
      format,
      currentQuality
    );
  });
}

/**
 * Generates an instant, vibrant sample image with graphic patterns for demo testing
 */
export function generateSampleImage(): Promise<LoadedImageInfo> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 800);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e1b4b');
    bgGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 800);

    // Decorative glowing circles
    const drawGlowCircle = (x: number, y: number, r: number, color: string) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    drawGlowCircle(300, 250, 260, 'rgba(6, 182, 212, 0.45)');
    drawGlowCircle(900, 500, 320, 'rgba(249, 115, 22, 0.45)');
    drawGlowCircle(600, 700, 300, 'rgba(168, 85, 247, 0.35)');

    // Stylized badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(150, 150, 900, 500, 28);
      ctx.fill();
      ctx.stroke();
    }

    // Typography
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 54px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SplitStream Studio', 600, 340);

    ctx.font = '32px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('⚡ High-Precision Image Resizer & Shape Cropper', 600, 420);

    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('100% In-Browser • Lossless • Privacy First', 600, 490);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        resolve({
          name: 'sample_studio_graphic.png',
          originalWidth: 1200,
          originalHeight: 800,
          originalSizeBytes: blob.size,
          previewUrl: url,
          imgElement: img,
        });
      };
      img.src = url;
    }, 'image/png');
  });
}

/**
 * Loads an image from any web URL (HTTP, HTTPS, or Data URL) into LoadedImageInfo.
 * Includes CORS proxy fallback to ensure images from any domain can be edited client-side.
 */
export async function loadImageFromUrl(rawUrl: string): Promise<LoadedImageInfo> {
  const url = rawUrl.trim();
  if (!url) {
    throw new Error('Please enter a valid image URL');
  }

  // Handle data URLs directly
  if (url.startsWith('data:image/')) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          name: 'data_image.png',
          originalWidth: img.naturalWidth || img.width,
          originalHeight: img.naturalHeight || img.height,
          originalSizeBytes: Math.round(url.length * 0.75),
          previewUrl: url,
          imgElement: img,
        });
      };
      img.onerror = () => reject(new Error('Invalid image data URL'));
      img.src = url;
    });
  }

  // Determine a default filename from the URL path
  let filename = 'web_image.jpg';
  try {
    const parsed = new URL(url);
    const lastPart = parsed.pathname.split('/').pop()?.split('?')[0];
    if (lastPart && lastPart.includes('.')) {
      filename = decodeURIComponent(lastPart);
    }
  } catch {
    // ignore URL parsing error
  }

  let blob: Blob | null = null;

  // Prioritized proxy list:
  // 1. Same-origin local Vite dev server proxy (immune to COEP / CORS restrictions)
  // 2. weserv.nl / wsrv.nl (global CDN that returns Cross-Origin-Resource-Policy: cross-origin & Access-Control-Allow-Origin: *)
  // 3. Direct fetch
  const proxyEndpoints = [
    `/api/proxy-image?url=${encodeURIComponent(url)}`,
    `https://images.weserv.nl/?url=${encodeURIComponent(url)}`,
    `https://wsrv.nl/?url=${encodeURIComponent(url)}`,
    url,
  ];

  for (const endpoint of proxyEndpoints) {
    try {
      const res = await fetch(endpoint, { mode: 'cors' });
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (!ct || ct.includes('image') || ct.includes('octet-stream')) {
          blob = await res.blob();
          if (blob && blob.size > 0) {
            break;
          }
        }
      }
    } catch {
      // Try next endpoint
    }
  }

  if (!blob) {
    throw new Error(
      'Could not load image from this URL. Please verify the URL points directly to an image file or try another link.'
    );
  }

  // Create local Blob Object URL so COEP & canvas tainting are never triggered
  const objectUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      resolve({
        name: filename,
        originalWidth: img.naturalWidth || img.width,
        originalHeight: img.naturalHeight || img.height,
        originalSizeBytes: blob ? blob.size : 150000,
        previewUrl: objectUrl,
        imgElement: img,
        file: new File([blob!], filename, { type: blob!.type || 'image/jpeg' }),
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          'Could not decode image from this URL. Please verify the link is an active, valid image file.'
        )
      );
    };

    img.src = objectUrl;
  });
}

/**
 * High-performance convolution unsharp mask filter to enhance edges and micro-details
 * amount is 0 to 100
 */
export function applySharpnessFilter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  amount: number
): void {
  if (amount <= 0 || w <= 2 || h <= 2) return;
  try {
    const strength = (Math.min(100, Math.max(0, amount)) / 100) * 1.6;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const copy = new Uint8ClampedArray(data);

    // 3x3 Laplacian / Unsharp Kernel:
    // [  0,  -k,   0 ]
    // [ -k, 1+4k, -k ]
    // [  0,  -k,   0 ]
    const k = strength;
    const center = 1 + 4 * k;

    for (let y = 1; y < h - 1; y++) {
      const rowOffset = y * w * 4;
      const rowAbove = (y - 1) * w * 4;
      const rowBelow = (y + 1) * w * 4;

      for (let x = 1; x < w - 1; x++) {
        const idx = rowOffset + x * 4;
        const topIdx = rowAbove + x * 4;
        const bottomIdx = rowBelow + x * 4;
        const leftIdx = rowOffset + (x - 1) * 4;
        const rightIdx = rowOffset + (x + 1) * 4;

        // Red
        const r = copy[idx] * center - (copy[topIdx] + copy[bottomIdx] + copy[leftIdx] + copy[rightIdx]) * k;
        // Green
        const g = copy[idx + 1] * center - (copy[topIdx + 1] + copy[bottomIdx + 1] + copy[leftIdx + 1] + copy[rightIdx + 1]) * k;
        // Blue
        const b = copy[idx + 2] * center - (copy[topIdx + 2] + copy[bottomIdx + 2] + copy[leftIdx + 2] + copy[rightIdx + 2]) * k;

        data[idx] = r < 0 ? 0 : r > 255 ? 255 : r;
        data[idx + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
        data[idx + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  } catch {
    // Silently continue if security restriction on tainted canvas
  }
}

/**
 * Micro-contrast & clarity filter to enhance textural depth and vibrancy
 * amount is 0 to 100
 */
export function applyClarityFilter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  amount: number
): void {
  if (amount <= 0 || w <= 0 || h <= 0) return;
  try {
    const factor = (Math.min(100, Math.max(0, amount)) / 100) * 0.45;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const val = data[i + c] / 255;
        // S-curve contrast boost centered at midtones (0.5)
        const diff = val - 0.5;
        const enhanced = val + diff * factor * (1 - Math.abs(diff) * 1.4);
        data[i + c] = Math.max(0, Math.min(255, Math.round(enhanced * 255)));
      }
    }

    ctx.putImageData(imgData, 0, 0);
  } catch {
    // Silently continue if security restriction on tainted canvas
  }
}

/**
 * Permanently upscales the source LoadedImageInfo with high-res multi-pass smoothing and edge restoration
 */
export async function upscaleLoadedImage(
  imageInfo: LoadedImageInfo,
  factor: number
): Promise<LoadedImageInfo> {
  const f = Math.max(1, Math.min(4, factor));
  const newW = Math.round(imageInfo.originalWidth * f);
  const newH = Math.round(imageInfo.originalHeight * f);

  const canvas = document.createElement('canvas');
  canvas.width = newW;
  canvas.height = newH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not create upscaling canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(imageInfo.imgElement, 0, 0, newW, newH);

  // Apply subtle sharpness restoration to counteract upscaling blur
  applySharpnessFilter(ctx, newW, newH, 28);
  applyClarityFilter(ctx, newW, newH, 18);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to create upscaled blob'));
    }, 'image/png');
  });

  const url = URL.createObjectURL(blob);
  const upscaledImg = new Image();
  await new Promise<void>((resolve, reject) => {
    upscaledImg.onload = () => resolve();
    upscaledImg.onerror = () => reject(new Error('Failed to decode upscaled image'));
    upscaledImg.src = url;
  });

  const baseName = (imageInfo.name || 'image').replace(/\.[^/.]+$/, '');
  const upscaledName = `${baseName}_${f}xHD.png`;
  const upscaledFile = new File([blob], upscaledName, { type: 'image/png' });

  return {
    file: upscaledFile,
    name: upscaledName,
    originalWidth: newW,
    originalHeight: newH,
    originalSizeBytes: blob.size,
    previewUrl: url,
    imgElement: upscaledImg,
  };
}

