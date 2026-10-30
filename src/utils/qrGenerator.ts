import QRCode from 'qrcode';
import jsQR from 'jsqr';
import type { QrConfig, QrBorderStyle, QrPresetLogo } from '../types/qrStudio';

/**
 * Builds the standard protocol string for QR encoding
 */
export function buildQrPayload(config: QrConfig): string {
  switch (config.type) {
    case 'link':
    case 'pdf':
    case 'app':
    case 'images':
    case 'video':
    case 'social':
    case 'barcode': {
      const u = config.content.trim();
      if (!u) return ' ';
      if (/^[a-zA-Z]+:\/\//.test(u)) return u;
      return `https://${u}`;
    }

    case 'wifi': {
      const { ssid, password, encryption, hidden } = config.wifi;
      const cleanSsid = (ssid || 'MyWiFi').replace(/[\\;,":]/g, '\\$&');
      const cleanPass = (password || '').replace(/[\\;,":]/g, '\\$&');
      const enc = encryption === 'nopass' ? 'nopass' : encryption;
      return `WIFI:T:${enc};S:${cleanSsid};P:${cleanPass};H:${hidden ? 'true' : 'false'};;`;
    }

    case 'upi': {
      const { vpa, name, amount, currency, note } = config.upi;
      const cleanVpa = encodeURIComponent(vpa.trim() || 'merchant@upi');
      const cleanName = encodeURIComponent(name.trim() || 'Payee');
      let url = `upi://pay?pa=${cleanVpa}&pn=${cleanName}&cu=${currency || 'INR'}`;
      if (amount && parseFloat(amount) > 0) {
        url += `&am=${encodeURIComponent(amount)}`;
      }
      if (note && note.trim()) {
        url += `&tn=${encodeURIComponent(note.trim())}`;
      }
      return url;
    }

    case 'call': {
      const p = config.phone.replace(/[^0-9+]/g, '');
      return `tel:${p || '+1234567890'}`;
    }

    case 'sms': {
      const p = config.phone.replace(/[^0-9+]/g, '');
      const msg = encodeURIComponent(config.smsMessage || '');
      return `smsto:${p}:${msg}`;
    }

    case 'email': {
      const addr = encodeURIComponent(config.emailAddress.trim());
      const sub = encodeURIComponent(config.emailSubject.trim());
      const body = encodeURIComponent(config.emailBody.trim());
      return `mailto:${addr}?subject=${sub}&body=${body}`;
    }

    case 'whatsapp': {
      const p = config.whatsappPhone.replace(/[^0-9]/g, '');
      const msg = encodeURIComponent(config.whatsappMessage || '');
      return `https://wa.me/${p}?text=${msg}`;
    }

    case 'vcard': {
      const { firstName, lastName, phone, email, company, title, website, address } = config.vcard;
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lastName || ''};${firstName || ''};;;`,
        `FN:${`${firstName || ''} ${lastName || ''}`.trim() || 'Contact'}`,
        company ? `ORG:${company}` : null,
        title ? `TITLE:${title}` : null,
        phone ? `TEL:${phone}` : null,
        email ? `EMAIL:${email}` : null,
        website ? `URL:${website}` : null,
        address ? `ADR:;;${address};;;;` : null,
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n');
    }

    case 'event': {
      return config.content.trim() || ' ';
    }

    case 'text':
    default:
      return config.content.trim() || ' ';
  }
}

/**
 * Draws custom corner eye outer border and center dot
 */
function drawCornerEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: QrBorderStyle,
  color: string
) {
  const pad = size * (1 / 7);
  const outerW = size;
  const innerW = size * (3 / 7);
  const innerX = x + (size - innerW) / 2;
  const innerY = y + (size - innerW) / 2;
  const r = size * 0.28;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = pad;

  // 1. Outer Border
  ctx.beginPath();
  switch (style) {
    case 'circle': {
      const cx = x + size / 2;
      const cy = y + size / 2;
      ctx.arc(cx, cy, (size - pad) / 2, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'rounded': {
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x + pad / 2, y + pad / 2, outerW - pad, outerW - pad, r);
        ctx.stroke();
      } else {
        ctx.strokeRect(x + pad / 2, y + pad / 2, outerW - pad, outerW - pad);
      }
      break;
    }

    case 'leaf-right': {
      // Rounded top-left and bottom-right, sharp others
      ctx.moveTo(x + pad / 2, y + r);
      ctx.quadraticCurveTo(x + pad / 2, y + pad / 2, x + r, y + pad / 2);
      ctx.lineTo(x + outerW - pad / 2, y + pad / 2);
      ctx.lineTo(x + outerW - pad / 2, y + outerW - r);
      ctx.quadraticCurveTo(x + outerW - pad / 2, y + outerW - pad / 2, x + outerW - r, y + outerW - pad / 2);
      ctx.lineTo(x + pad / 2, y + outerW - pad / 2);
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'leaf-left': {
      // Rounded top-right and bottom-left, sharp others
      ctx.moveTo(x + pad / 2, y + pad / 2);
      ctx.lineTo(x + outerW - r, y + pad / 2);
      ctx.quadraticCurveTo(x + outerW - pad / 2, y + pad / 2, x + outerW - pad / 2, y + r);
      ctx.lineTo(x + outerW - pad / 2, y + outerW - pad / 2);
      ctx.lineTo(x + r, y + outerW - pad / 2);
      ctx.quadraticCurveTo(x + pad / 2, y + outerW - pad / 2, x + pad / 2, y + outerW - r);
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'teardrop': {
      // Teardrop: top-left rounded, bottom-right sharp
      ctx.moveTo(x + pad / 2, y + r);
      ctx.quadraticCurveTo(x + pad / 2, y + pad / 2, x + r, y + pad / 2);
      ctx.quadraticCurveTo(x + outerW - pad / 2, y + pad / 2, x + outerW - pad / 2, y + r);
      ctx.lineTo(x + outerW - pad / 2, y + outerW - pad / 2);
      ctx.quadraticCurveTo(x + pad / 2, y + outerW - pad / 2, x + pad / 2, y + outerW - r);
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'shield': {
      // Rounded bottom
      ctx.moveTo(x + pad / 2, y + pad / 2);
      ctx.lineTo(x + outerW - pad / 2, y + pad / 2);
      ctx.lineTo(x + outerW - pad / 2, y + outerW * 0.6);
      ctx.quadraticCurveTo(x + outerW / 2, y + outerW - pad / 2, x + pad / 2, y + outerW * 0.6);
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'circle-in-square':
    case 'square':
    default: {
      ctx.strokeRect(x + pad / 2, y + pad / 2, outerW - pad, outerW - pad);
      break;
    }
  }

  // 2. Inner Dot
  ctx.beginPath();
  if (style === 'circle' || style === 'circle-in-square') {
    const cx = innerX + innerW / 2;
    const cy = innerY + innerW / 2;
    ctx.arc(cx, cy, innerW / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === 'rounded' || style === 'leaf-right' || style === 'leaf-left' || style === 'teardrop') {
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(innerX, innerY, innerW, innerW, innerW * 0.35);
      ctx.fill();
    } else {
      ctx.fillRect(innerX, innerY, innerW, innerW);
    }
  } else {
    ctx.fillRect(innerX, innerY, innerW, innerW);
  }

  ctx.restore();
}

/**
 * Draws preset vector logo (Location pin, WhatsApp, Wi-Fi, etc.)
 */
function drawPresetLogo(
  ctx: CanvasRenderingContext2D,
  preset: QrPresetLogo,
  x: number,
  y: number,
  size: number
) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;

  ctx.save();

  switch (preset) {
    case 'location': {
      // Red circle with white map pin (matches Screenshot 1)
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // White Pin Icon
      ctx.fillStyle = '#ffffff';
      const pinW = size * 0.38;
      const pinTopY = cy - size * 0.22;
      ctx.beginPath();
      ctx.arc(cx, pinTopY + pinW / 2, pinW / 2, Math.PI, 0, false);
      ctx.quadraticCurveTo(cx + pinW / 2, pinTopY + pinW, cx, cy + size * 0.22);
      ctx.quadraticCurveTo(cx - pinW / 2, pinTopY + pinW, cx - pinW / 2, pinTopY + pinW / 2);
      ctx.fill();

      // Pin center cutout
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(cx, pinTopY + pinW / 2, pinW * 0.24, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'link': {
      // Purple circle with chain link
      ctx.fillStyle = '#9b59b6';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = size * 0.08;
      ctx.beginPath();
      ctx.arc(cx - size * 0.08, cy, size * 0.14, Math.PI * 0.5, Math.PI * 1.5);
      ctx.lineTo(cx + size * 0.08, cy - size * 0.14);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + size * 0.08, cy, size * 0.14, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.lineTo(cx - size * 0.08, cy + size * 0.14);
      ctx.stroke();
      break;
    }

    case 'email': {
      // Orange/Yellow circle with envelope
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      const ew = size * 0.52;
      const eh = size * 0.34;
      const ex = cx - ew / 2;
      const ey = cy - eh / 2;
      ctx.fillRect(ex, ey, ew, eh);

      ctx.strokeStyle = '#f39c12';
      ctx.lineWidth = size * 0.04;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(cx, cy + size * 0.06);
      ctx.lineTo(ex + ew, ey);
      ctx.stroke();
      break;
    }

    case 'whatsapp': {
      // Green circle with chat bubble & phone
      ctx.fillStyle = '#25D366';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#25D366';
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(size * 0.28)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📞', cx, cy);
      break;
    }

    case 'wifi': {
      // Blue circle with Wi-Fi arcs
      ctx.fillStyle = '#3498db';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = size * 0.06;
      ctx.lineCap = 'round';

      // Dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy + size * 0.16, size * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Arcs
      for (let i = 1; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.16, size * 0.14 * i, Math.PI * 1.25, Math.PI * 1.75);
        ctx.stroke();
      }
      break;
    }

    case 'vcard': {
      // Navy circle with ID card
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      const cw = size * 0.48;
      const ch = size * 0.32;
      ctx.fillRect(cx - cw / 2, cy - ch / 2, cw, ch);

      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.arc(cx - cw * 0.2, cy, size * 0.08, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'paypal': {
      ctx.fillStyle = '#003087';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0079C1';
      ctx.font = `italic bold ${Math.round(size * 0.52)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('P', cx, cy);
      break;
    }

    case 'phonepe': {
      ctx.fillStyle = '#5f259f';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(size * 0.44)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('पे', cx, cy);
      break;
    }

    case 'upi': {
      ctx.fillStyle = '#0f75bc';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(size * 0.36)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('UPI', cx, cy);
      break;
    }

    case 'bitcoin': {
      ctx.fillStyle = '#f7931a';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(size * 0.48)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('₿', cx, cy);
      break;
    }

    case 'scanme-1':
    case 'scanme-2': {
      // Centered "SCAN ME" text badge
      ctx.fillStyle = preset === 'scanme-2' ? '#000000' : '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      const bw = size * 0.95;
      const bh = size * 0.55;
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 8);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
        ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);
      }

      ctx.fillStyle = preset === 'scanme-2' ? '#ffffff' : '#000000';
      ctx.font = `bold ${Math.round(bh * 0.36)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SCAN', cx, cy - bh * 0.2);
      ctx.fillText('ME', cx, cy + bh * 0.24);
      break;
    }

    case 'qr-device':
    case 'qr-frame':
    case 'barcode': {
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(size * 0.45)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📱', cx, cy);
      break;
    }

    default:
      break;
  }

  ctx.restore();
}

/**
 * Renders complete custom QR Code to Canvas with Shape, Border, Logo, and Frame
 */
export async function renderQrToCanvas(
  targetCanvas: HTMLCanvasElement,
  config: QrConfig
): Promise<void> {
  const payload = buildQrPayload(config);
  const size = Math.max(380, Math.min(2048, config.size || 1024));

  const hasLogo = !!config.logoElement || (config.presetLogo && config.presetLogo !== 'none');
  const ecl = hasLogo ? 'H' : config.errorCorrectionLevel || 'M';

  // Generate QR matrix representation
  const qr = QRCode.create(payload, { errorCorrectionLevel: ecl });
  const matrixSize = qr.modules.size;

  // Frame dimension paddings
  let framePaddingTop = 0;
  let framePaddingBottom = 0;
  let framePaddingSide = 0;

  if (config.frameType === 'black-banner') {
    framePaddingBottom = Math.round(size * 0.18);
    framePaddingTop = Math.round(size * 0.05);
    framePaddingSide = Math.round(size * 0.05);
  } else if (config.frameType === 'bottom-banner' || config.frameType === 'badge-pill') {
    framePaddingBottom = Math.round(size * 0.16);
    framePaddingTop = Math.round(size * 0.05);
    framePaddingSide = Math.round(size * 0.05);
  } else if (config.frameType === 'clipboard') {
    framePaddingTop = Math.round(size * 0.14);
    framePaddingBottom = Math.round(size * 0.12);
    framePaddingSide = Math.round(size * 0.06);
  } else if (config.frameType === 'clapper') {
    framePaddingTop = Math.round(size * 0.16);
    framePaddingBottom = Math.round(size * 0.1);
    framePaddingSide = Math.round(size * 0.06);
  } else if (config.frameType === 'phone') {
    framePaddingTop = Math.round(size * 0.15);
    framePaddingBottom = Math.round(size * 0.15);
    framePaddingSide = Math.round(size * 0.08);
  } else if (config.frameType === 'stamp') {
    framePaddingTop = Math.round(size * 0.08);
    framePaddingBottom = Math.round(size * 0.08);
    framePaddingSide = Math.round(size * 0.08);
  }

  const canvasWidth = size + framePaddingSide * 2;
  const canvasHeight = size + framePaddingTop + framePaddingBottom;

  targetCanvas.width = canvasWidth;
  targetCanvas.height = canvasHeight;

  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 1. Draw Frame Background
  if (config.frameType !== 'none') {
    ctx.fillStyle = '#ffffff';
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(0, 0, canvasWidth, canvasHeight, 20);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  } else if (!config.transparentBg) {
    ctx.fillStyle = config.bgColor || '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // 2. Setup QR coordinates
  const qrX = framePaddingSide;
  const qrY = framePaddingTop;
  const marginCells = config.margin ?? 2;
  const totalCells = matrixSize + marginCells * 2;
  const cellSize = size / totalCells;

  // Background for QR box (if not transparent)
  if (!config.transparentBg && config.frameType !== 'none') {
    ctx.fillStyle = config.bgColor || '#ffffff';
    ctx.fillRect(qrX, qrY, size, size);
  }

  // Gradient or Shape Color fill style
  let shapeFill: string | CanvasGradient = config.fgColor || '#000000';
  if (config.gradientEnabled) {
    const grad = ctx.createLinearGradient(qrX, qrY, qrX + size, qrY + size);
    grad.addColorStop(0, config.fgColor || '#0284c7');
    grad.addColorStop(1, config.gradientColor || '#9333ea');
    shapeFill = grad;
  }

  // Calculate logo position & exclusion zone in cells
  const logoPercent = Math.min(0.35, Math.max(0.12, (config.logoSizePercent || 22) / 100));
  const logoPixelSize = size * logoPercent;
  const logoRadiusCells = (logoPixelSize / cellSize / 2) + 0.6;

  // Alignment coordinates
  const align = config.logoAlign || 'center';
  let normX = 0;
  let normY = 0;
  switch (align) {
    case 'top': normY = -0.55; break;
    case 'bottom': normY = 0.55; break;
    case 'left': normX = -0.55; break;
    case 'right': normX = 0.55; break;
    case 'top-left': normX = -0.5; normY = -0.5; break;
    case 'top-right': normX = 0.5; normY = -0.5; break;
    case 'bottom-left': normX = -0.5; normY = 0.5; break;
    case 'bottom-right': normX = 0.5; normY = 0.5; break;
    case 'center':
    default:
      normX = 0;
      normY = 0;
      break;
  }
  // User fine-tune offsets (-30 to 30)
  normX += (config.logoOffsetX || 0) / 50;
  normY += (config.logoOffsetY || 0) / 50;

  normX = Math.max(-0.65, Math.min(0.65, normX));
  normY = Math.max(-0.65, Math.min(0.65, normY));

  const logoCenterX = qrX + size / 2 + (normX * (size / 2 - logoPixelSize / 2));
  const logoCenterY = qrY + size / 2 + (normY * (size / 2 - logoPixelSize / 2));
  const lx = logoCenterX - logoPixelSize / 2;
  const ly = logoCenterY - logoPixelSize / 2;

  const logoCenterCellC = (logoCenterX - qrX) / cellSize;
  const logoCenterCellR = (logoCenterY - qrY) / cellSize;

  // 3. Draw Data Modules with Shape Style
  ctx.save();
  ctx.fillStyle = shapeFill;

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (qr.modules.get(r, c) !== 1) continue;

      // Skip the 3 corner eyes (drawn separately with Border Style)
      const isTopLeftEye = r < 7 && c < 7;
      const isTopRightEye = r < 7 && c >= matrixSize - 7;
      const isBottomLeftEye = r >= matrixSize - 7 && c < 7;
      if (isTopLeftEye || isTopRightEye || isBottomLeftEye) continue;

      // Check if module is within logo cutout
      const cellR = r + marginCells;
      const cellC = c + marginCells;
      if (hasLogo) {
        const distFromCenter = Math.hypot(cellC + 0.5 - logoCenterCellC, cellR + 0.5 - logoCenterCellR);
        if (distFromCenter < logoRadiusCells) continue;
      }

      const mx = qrX + cellC * cellSize;
      const my = qrY + cellR * cellSize;

      ctx.beginPath();
      switch (config.shapeStyle) {
        case 'dots': {
          ctx.arc(mx + cellSize / 2, my + cellSize / 2, (cellSize / 2) * 0.88, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'rounded': {
          const rad = cellSize * 0.35;
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(mx + 0.5, my + 0.5, cellSize - 1, cellSize - 1, rad);
            ctx.fill();
          } else {
            ctx.fillRect(mx, my, cellSize, cellSize);
          }
          break;
        }

        case 'lines': {
          // Horizontal pill connected
          const hasRight = c + 1 < matrixSize && qr.modules.get(r, c + 1) === 1;
          const hasLeft = c - 1 >= 0 && qr.modules.get(r, c - 1) === 1;
          if (hasRight || hasLeft) {
            ctx.fillRect(mx, my + cellSize * 0.1, cellSize, cellSize * 0.8);
          } else {
            ctx.arc(mx + cellSize / 2, my + cellSize / 2, cellSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 'diamond': {
          ctx.moveTo(mx + cellSize / 2, my);
          ctx.lineTo(mx + cellSize, my + cellSize / 2);
          ctx.lineTo(mx + cellSize / 2, my + cellSize);
          ctx.lineTo(mx, my + cellSize / 2);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'disconnected': {
          ctx.fillRect(mx + cellSize * 0.15, my + cellSize * 0.15, cellSize * 0.7, cellSize * 0.7);
          break;
        }

        case 'cross': {
          const w3 = cellSize / 3;
          ctx.fillRect(mx + w3, my, w3, cellSize);
          ctx.fillRect(mx, my + w3, cellSize, w3);
          break;
        }

        case 'mosaic': {
          ctx.moveTo(mx, my);
          ctx.lineTo(mx + cellSize, my + cellSize);
          ctx.lineTo(mx, my + cellSize);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'square':
        default: {
          ctx.fillRect(mx, my, cellSize, cellSize);
          break;
        }
      }
    }
  }
  ctx.restore();

  // 4. Draw Corner Eye Borders (Top-Left, Top-Right, Bottom-Left)
  const eyeCellSize = cellSize * 7;
  const eyeColor = config.borderColor || config.fgColor || '#000000';

  // Top-Left Eye
  drawCornerEye(
    ctx,
    qrX + marginCells * cellSize,
    qrY + marginCells * cellSize,
    eyeCellSize,
    config.borderStyle || 'square',
    eyeColor
  );

  // Top-Right Eye
  drawCornerEye(
    ctx,
    qrX + (marginCells + matrixSize - 7) * cellSize,
    qrY + marginCells * cellSize,
    eyeCellSize,
    config.borderStyle || 'square',
    eyeColor
  );

  // Bottom-Left Eye
  drawCornerEye(
    ctx,
    qrX + marginCells * cellSize,
    qrY + (marginCells + matrixSize - 7) * cellSize,
    eyeCellSize,
    config.borderStyle || 'square',
    eyeColor
  );

  // 5. Draw Aligned Logo / Icon
  if (hasLogo) {
    const pad = logoPixelSize * 0.14;
    const bgW = logoPixelSize + pad * 2;
    const logoShape = config.logoShape || 'circle';

    // Draw background plate behind logo unless disabled
    if (!config.removeLogoBackground && logoShape !== 'none') {
      ctx.save();
      ctx.fillStyle = config.logoBgColor || config.bgColor || '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      if (logoShape === 'circle') {
        ctx.arc(logoCenterX, logoCenterY, bgW / 2, 0, Math.PI * 2);
      } else if (logoShape === 'rounded') {
        const rad = Math.round(bgW * 0.2);
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(lx - pad, ly - pad, bgW, bgW, rad);
        } else {
          ctx.rect(lx - pad, ly - pad, bgW, bgW);
        }
      } else {
        ctx.rect(lx - pad, ly - pad, bgW, bgW);
      }
      ctx.fill();
      ctx.restore();
    }

    if (config.logoElement) {
      ctx.save();
      ctx.beginPath();
      if (logoShape === 'circle') {
        ctx.arc(logoCenterX, logoCenterY, logoPixelSize / 2, 0, Math.PI * 2);
      } else if (logoShape === 'rounded') {
        const rad = Math.round(logoPixelSize * 0.18);
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(lx, ly, logoPixelSize, logoPixelSize, rad);
        } else {
          ctx.rect(lx, ly, logoPixelSize, logoPixelSize);
        }
      } else if (logoShape === 'square') {
        ctx.rect(lx, ly, logoPixelSize, logoPixelSize);
      }
      if (logoShape !== 'none') {
        ctx.clip();
      }
      ctx.drawImage(config.logoElement, lx, ly, logoPixelSize, logoPixelSize);
      ctx.restore();
    } else if (config.presetLogo && config.presetLogo !== 'none') {
      drawPresetLogo(ctx, config.presetLogo, lx, ly, logoPixelSize);
    }
  }

  // 6. Draw Frames (as seen in Screenshot 2 & 3)
  if (config.frameType === 'black-banner') {
    // Bold black banner with white text (matches Screenshot 2!)
    const bannerH = framePaddingBottom * 0.72;
    const bannerY = canvasHeight - framePaddingBottom + (framePaddingBottom - bannerH) / 2;
    const bannerW = size * 0.88;
    const bannerX = (canvasWidth - bannerW) / 2;

    ctx.save();
    ctx.fillStyle = '#000000';
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 8);
      ctx.fill();
    } else {
      ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(bannerH * 0.44)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.frameLabel || 'SCAN ME', canvasWidth / 2, bannerY + bannerH / 2);
    ctx.restore();
  } else if (config.frameType === 'bottom-banner' || config.frameType === 'badge-pill') {
    // Green or customized pill badge
    const badgeW = size * 0.58;
    const badgeH = framePaddingBottom * 0.65;
    const badgeX = (canvasWidth - badgeW) / 2;
    const badgeY = canvasHeight - framePaddingBottom + (framePaddingBottom - badgeH) / 2;

    ctx.save();
    ctx.fillStyle = '#00b894';
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
      ctx.fill();
    } else {
      ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(badgeH * 0.45)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.frameLabel || 'SCAN ME', canvasWidth / 2, badgeY + badgeH / 2);
    ctx.restore();
  } else if (config.frameType === 'clipboard') {
    // Top clipboard clip
    ctx.save();
    ctx.fillStyle = '#333333';
    const clipW = size * 0.35;
    const clipH = framePaddingTop * 0.55;
    ctx.fillRect((canvasWidth - clipW) / 2, 6, clipW, clipH);

    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.round(framePaddingBottom * 0.38)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.frameLabel || 'SCAN ME', canvasWidth / 2, canvasHeight - framePaddingBottom / 2);
    ctx.restore();
  } else if (config.frameType === 'clapper') {
    // Cinema clapper stripes top
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.fillRect(framePaddingSide, 4, size, framePaddingTop * 0.7);
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      const sx = framePaddingSide + i * (size / 7);
      ctx.moveTo(sx, 4);
      ctx.lineTo(sx + size / 14, 4);
      ctx.lineTo(sx + size / 20, 4 + framePaddingTop * 0.7);
      ctx.lineTo(sx - size / 40, 4 + framePaddingTop * 0.7);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

/**
 * Generate vector SVG string
 */
export async function generateQrSvg(config: QrConfig): Promise<string> {
  const payload = buildQrPayload(config);
  return QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: config.logoElement || config.presetLogo !== 'none' ? 'H' : 'M',
    margin: config.margin ?? 2,
    color: {
      dark: config.fgColor || '#000000',
      light: config.transparentBg ? '#00000000' : config.bgColor || '#ffffff',
    },
  });
}

/**
 * Decodes QR code from an HTMLCanvasElement
 */
export function decodeQrFromCanvas(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imgData.data, imgData.width, imgData.height, {
    inversionAttempts: 'attemptBoth',
  });
  return code ? code.data : null;
}

/**
 * Decodes QR code from an image File or Blob
 */
export async function decodeQrFromFile(file: File | Blob): Promise<string | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image file for QR scanning'));
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imgData.data, imgData.width, imgData.height, {
      inversionAttempts: 'attemptBoth',
    });
    return code ? code.data : null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
