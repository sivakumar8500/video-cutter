import type { PromoCard } from '../types';

/**
 * Create a PromoCard object from an uploaded image file
 */
export function createPromoCardFromFile(file: File): PromoCard {
  return {
    id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: file.name,
    blob: file,
    previewUrl: URL.createObjectURL(file),
  };
}

/**
 * Generate a pre-styled promotional card image (PNG) on a canvas
 * for quick use (e.g., "Wait Till The End", "Subscribe For Part 2", etc.)
 */
export async function generateTextPromoCard(
  mainText: string,
  subText = '',
  theme: 'fire' | 'dark' | 'gradient' | 'neon' = 'gradient'
): Promise<PromoCard> {
  const width = 1080;
  const height = 656; // Matching top/bottom space of 16:9 inside 9:16 (1920 - 608) / 2 = 656

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Background styling based on theme
  if (theme === 'fire') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#7f1d1d');
    grad.addColorStop(0.5, '#b91c1c');
    grad.addColorStop(1, '#c2410c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'neon') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(1, '#0284c7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'dark') {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);
    // Subtle border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, width - 20, height - 20);
  } else {
    // Gradient (Indigo -> Purple -> Pink)
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#4338ca');
    grad.addColorStop(0.5, '#6366f1');
    grad.addColorStop(1, '#ec4899');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Modern decorative badge / shapes
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  ctx.arc(width - 100, 100, 200, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(100, height - 50, 160, 0, Math.PI * 2);
  ctx.fill();

  // Main Heading Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px system-ui, sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 20;

  const centerY = subText ? height / 2 - 25 : height / 2;
  ctx.fillText(mainText.toUpperCase(), width / 2, centerY);

  // Subtitle / Call to action
  if (subText) {
    ctx.fillStyle = '#fef08a';
    ctx.font = '600 36px system-ui, sans-serif';
    ctx.shadowBlur = 10;
    ctx.fillText(subText, width / 2, height / 2 + 50);
  }

  // Convert canvas to Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error('Blob creation failed');
      const previewUrl = URL.createObjectURL(blob);
      resolve({
        id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `${mainText.slice(0, 15)}.png`,
        blob,
        previewUrl,
      });
    }, 'image/png');
  });
}
