import type { FrameCategory, FrameConfig } from '../types/imageStudio';

export interface FrameWindowArea {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

export interface FrameTemplateItem {
  id: string;
  category: FrameCategory;
  name: string;
  emoji: string;
  badge: string;
  accentColor: string;
  secondaryColor: string;
  defaultPrimary: string;
  defaultSecondary: string;
}

export const FRAME_TEMPLATES: FrameTemplateItem[] = [
  // 1. Multiple Birthday
  {
    id: 'bday-balloons',
    category: 'birthday',
    name: 'Balloons, Hats & Pennants',
    emoji: '🎈',
    badge: 'Birthday 1',
    accentColor: '#ec4899', // pink
    secondaryColor: '#8b5cf6', // purple
    defaultPrimary: 'HAPPY BIRTHDAY! 🎂',
    defaultSecondary: 'Wishing you endless joy, laughter & sweet memories!',
  },
  {
    id: 'bday-cake',
    category: 'birthday',
    name: 'Celebration Cake & Balloons',
    emoji: '🎂',
    badge: 'Birthday 2',
    accentColor: '#a855f7', // purple
    secondaryColor: '#f59e0b', // gold
    defaultPrimary: 'HAPPY BIRTHDAY 🥳',
    defaultSecondary: 'May all your dreams & wishes come true!',
  },
  {
    id: 'bday-golden',
    category: 'birthday',
    name: 'Royal Gold & Stars',
    emoji: '👑',
    badge: 'Birthday 3',
    accentColor: '#eab308', // gold
    secondaryColor: '#ca8a04',
    defaultPrimary: 'ROYAL BIRTHDAY CELEBRATION 👑',
    defaultSecondary: 'Best Wishes On Your Special Milestone!',
  },

  // 2. Events
  {
    id: 'event-bamboo',
    category: 'events',
    name: 'Tropical Bamboo & Leaves',
    emoji: '🎋',
    badge: 'Nature Fest',
    accentColor: '#10b981', // emerald
    secondaryColor: '#d97706', // bamboo gold
    defaultPrimary: 'TROPICAL NATURE FESTIVAL 🌿',
    defaultSecondary: 'Eco Green Living • Harmony with Nature',
  },
  {
    id: 'event-gala',
    category: 'events',
    name: 'Golden Gala & Red Carpet',
    emoji: '🌟',
    badge: 'Gala Night',
    accentColor: '#f59e0b',
    secondaryColor: '#b45309',
    defaultPrimary: 'ANNUAL EXCELLENCE GALA 🌟',
    defaultSecondary: 'Honoring Innovation, Leadership & Achievement',
  },
  {
    id: 'event-summit',
    category: 'events',
    name: 'Tech & Leadership Summit',
    emoji: '🚀',
    badge: 'Summit 2026',
    accentColor: '#06b6d4',
    secondaryColor: '#3b82f6',
    defaultPrimary: 'GLOBAL INNOVATION SUMMIT 2026',
    defaultSecondary: 'Keynote Session • Emerging Technologies & Future',
  },

  // 3. Party
  {
    id: 'party-crowd',
    category: 'party',
    name: 'Concert & Party Crowd',
    emoji: '🎉',
    badge: 'Party Crowd',
    accentColor: '#06b6d4',
    secondaryColor: '#ec4899',
    defaultPrimary: 'MUSIC FESTIVAL & PARTY 🪩',
    defaultSecondary: 'Live Beats • Dancing Crowd • Euphoria & Neon Nights',
  },
  {
    id: 'party-disco',
    category: 'party',
    name: 'Neon Disco Waves',
    emoji: '🪩',
    badge: 'Disco Night',
    accentColor: '#d946ef',
    secondaryColor: '#06b6d4',
    defaultPrimary: 'SATURDAY NIGHT DISCO FEVER 🪩',
    defaultSecondary: 'Live DJ • Neon Dance Floor • Drinks & Good Vibes',
  },
  {
    id: 'party-champagne',
    category: 'party',
    name: 'Champagne & Sparkles',
    emoji: '🍾',
    badge: 'VIP Party',
    accentColor: '#eab308',
    secondaryColor: '#f43f5e',
    defaultPrimary: 'CHEERS TO THE CELEBRATION! 🍾',
    defaultSecondary: 'Exclusive VIP Celebration • Cocktails & High Spirits',
  },

  // 4. Meeting
  {
    id: 'meeting-boardroom',
    category: 'meeting',
    name: 'Corporate Boardroom Mockup',
    emoji: '🏢',
    badge: 'Executive',
    accentColor: '#3b82f6',
    secondaryColor: '#1e293b',
    defaultPrimary: 'EXECUTIVE BOARD MEETING 💼',
    defaultSecondary: 'Strategic Leadership • Annual Stakeholder Review',
  },
  {
    id: 'meeting-webinar',
    category: 'meeting',
    name: 'Live Webinar Keynote',
    emoji: '🎙️',
    badge: 'Webinar',
    accentColor: '#0ea5e9',
    secondaryColor: '#6366f1',
    defaultPrimary: 'LIVE WEBINAR SPOTLIGHT 🎙️',
    defaultSecondary: 'Featured Keynote Presentation & Panel Discussion',
  },

  // 5. Political Campaigns
  {
    id: 'pol-campaign',
    category: 'political',
    name: 'Election Campaign & Vote',
    emoji: '🗳️',
    badge: 'Election',
    accentColor: '#f97316',
    secondaryColor: '#10b981',
    defaultPrimary: 'VOTE FOR INTEGRITY & PROGRESS 🗳️',
    defaultSecondary: 'Your Voice Matters • Building A Prosperous Future',
  },
  {
    id: 'pol-leader',
    category: 'political',
    name: "The People's Leadership",
    emoji: '✊',
    badge: 'Leadership',
    accentColor: '#dc2626',
    secondaryColor: '#1e3a8a',
    defaultPrimary: "THE PEOPLE'S VOICE & CHAMPION ✊",
    defaultSecondary: 'Dedicated Public Service • Unity, Strength & Justice',
  },

  // 6. Advertisement
  {
    id: 'ad-sale50',
    category: 'advertisement',
    name: 'Mega Sale 50% OFF',
    emoji: '🔥',
    badge: '50% OFF',
    accentColor: '#ef4444',
    secondaryColor: '#f59e0b',
    defaultPrimary: 'MEGA SALE • UP TO 50% OFF! 🔥',
    defaultSecondary: 'Limited Time Deal • Biggest Discounts Of The Season',
  },
  {
    id: 'ad-flash',
    category: 'advertisement',
    name: 'Flash Deal & Special Offer',
    emoji: '⚡',
    badge: 'Flash Deal',
    accentColor: '#eab308',
    secondaryColor: '#ef4444',
    defaultPrimary: '⚡ SPECIAL LIMITED-TIME OFFER',
    defaultSecondary: 'Exclusive Promo Voucher • Claim Yours Before Stocks End!',
  },
];

/**
 * Returns the exact photo cutout window (bounding box) inside the frame
 */
export function getFrameWindowArea(w: number, h: number, templateId: string): FrameWindowArea {
  switch (templateId) {
    case 'bday-balloons':
      // Centered rectangular window leaving top/bottom for banner & hats
      return {
        x: Math.round(w * 0.16),
        y: Math.round(h * 0.11),
        width: Math.round(w * 0.68),
        height: Math.round(h * 0.58),
        radius: 16,
      };

    case 'bday-cake':
      // Square central window
      return {
        x: Math.round(w * 0.17),
        y: Math.round(h * 0.16),
        width: Math.round(w * 0.66),
        height: Math.round(h * 0.62),
        radius: 12,
      };

    case 'meeting-boardroom':
      // Presentation screen on boardroom wall
      return {
        x: Math.round(w * 0.22),
        y: Math.round(h * 0.16),
        width: Math.round(w * 0.56),
        height: Math.round(h * 0.42),
        radius: 6,
      };

    case 'event-bamboo':
      // Bamboo frame window
      return {
        x: Math.round(w * 0.14),
        y: Math.round(h * 0.14),
        width: Math.round(w * 0.72),
        height: Math.round(h * 0.72),
        radius: 8,
      };

    case 'party-crowd':
      // Upper central area above crowd
      return {
        x: Math.round(w * 0.10),
        y: Math.round(h * 0.08),
        width: Math.round(w * 0.80),
        height: Math.round(h * 0.62),
        radius: 16,
      };

    default:
      // Standard generous window
      return {
        x: Math.round(w * 0.12),
        y: Math.round(h * 0.10),
        width: Math.round(w * 0.76),
        height: Math.round(h * 0.68),
        radius: 16,
      };
  }
}

/**
 * Draw frame background (Backdrop painted before user's photo)
 */
export function drawFrameBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: FrameConfig
): void {
  const tid = frame.templateId;

  ctx.save();

  if (tid === 'bday-balloons') {
    // Vibrant purple/magenta festival gradient (as in Image 1)
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#9333ea'); // violet-600
    bg.addColorStop(0.35, '#c026d3'); // fuchsia-600
    bg.addColorStop(0.7, '#6366f1'); // indigo-500
    bg.addColorStop(1, '#3b82f6'); // blue-500
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Decorative white twinkling stars
    drawSparkleStar(ctx, w * 0.18, h * 0.06, 16, '#ffffff');
    drawSparkleStar(ctx, w * 0.75, h * 0.07, 12, '#ffffff');
    drawSparkleStar(ctx, w * 0.94, h * 0.36, 14, '#ffffff');
    drawSparkleStar(ctx, w * 0.10, h * 0.74, 15, '#ffffff');
    drawSparkleStar(ctx, w * 0.90, h * 0.76, 14, '#ffffff');
    drawSparkleStar(ctx, w * 0.07, h * 0.93, 16, '#ffffff');

    // Golden curls
    drawRibbonSpiral(ctx, w * 0.08, h * 0.06, h * 0.10, '#fbbf24');
    drawRibbonSpiral(ctx, w * 0.90, h * 0.44, h * 0.09, '#fbbf24');
  } else if (tid === 'bday-cake') {
    // Deep purple royal celebration gradient (as in Image 2)
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 50, w * 0.5, h * 0.5, w * 0.8);
    bg.addColorStop(0, '#7e22ce');
    bg.addColorStop(0.6, '#581c87');
    bg.addColorStop(1, '#3b0764');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Floating confetti dots & sparkles
    drawConfettiParticles(ctx, w, h, 60);
  } else if (tid === 'meeting-boardroom') {
    // Conference room wall & ceiling (as in Image 3)
    const wall = ctx.createLinearGradient(0, 0, 0, h);
    wall.addColorStop(0, '#64748b'); // slate top
    wall.addColorStop(0.55, '#94a3b8'); // lighter wall
    wall.addColorStop(0.65, '#e2e8f0'); // baseboard line
    wall.addColorStop(0.66, '#78350f'); // rich wood floor
    wall.addColorStop(1, '#451a03'); // darker wood
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, w, h);

    // Wood floor planks lines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 2;
    for (let py = h * 0.68; py < h; py += h * 0.05) {
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(w, py);
      ctx.stroke();
    }

    // Ceiling rails & modern pendant lamp
    ctx.fillStyle = '#475569';
    ctx.fillRect(w * 0.1, 0, w * 0.8, h * 0.03);

    // Conical spotlight beam down
    const lampX = w * 0.5;
    const lightGrad = ctx.createRadialGradient(lampX, h * 0.04, 20, lampX, h * 0.4, w * 0.6);
    lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    lightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = lightGrad;
    ctx.beginPath();
    ctx.moveTo(lampX - 30, h * 0.04);
    ctx.lineTo(w, h * 0.65);
    ctx.lineTo(0, h * 0.65);
    ctx.closePath();
    ctx.fill();
  } else if (tid === 'event-bamboo') {
    // Clean transparent or subtle cream backdrop for bamboo (as in Image 4)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);
  } else if (tid === 'party-crowd') {
    // Stage lights & laser beams backdrop (as in Image 5)
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(0.5, '#1e1b4b');
    bg.addColorStop(1, '#020617');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Laser light beams
    drawLaserBeam(ctx, w * 0.2, 0, w * 0.8, h * 0.8, 'rgba(6, 182, 212, 0.25)');
    drawLaserBeam(ctx, w * 0.8, 0, w * 0.2, h * 0.8, 'rgba(236, 72, 153, 0.25)');
    drawLaserBeam(ctx, w * 0.5, 0, w * 0.5, h * 0.7, 'rgba(168, 85, 247, 0.25)');
  } else {
    // Default rich dark gradient
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(0.5, '#1e1b4b');
    bg.addColorStop(1, '#090d16');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }

  // Draw Photo Window Mat / Border (Before photo is drawn inside)
  const win = getFrameWindowArea(w, h, tid);
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#ffffff';

  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(win.x - 8, win.y - 8, win.width + 16, win.height + 16, win.radius + 4);
    ctx.fill();
  } else {
    ctx.fillRect(win.x - 8, win.y - 8, win.width + 16, win.height + 16);
  }

  // Scalloped inner border for Birthday 1 (Image 1 style)
  if (tid === 'bday-balloons') {
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 3;
    ctx.strokeRect(win.x - 4, win.y - 4, win.width + 8, win.height + 8);
  }
  ctx.restore();

  ctx.restore();
}

/**
 * Convenience helper to draw both background and foreground
 */
export function drawThemedFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: FrameConfig
): void {
  drawFrameBackground(ctx, w, h, frame);
  drawFrameForeground(ctx, w, h, frame);
}

/**
 * Draw frame foreground (Rich Overlays, Balloons, Cake, Banners, Chairs, Crowd)
 * Painted ON TOP of the user's photo!
 */
export function drawFrameForeground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: FrameConfig
): void {
  const tid = frame.templateId;
  const template =
    FRAME_TEMPLATES.find((t) => t.id === tid) ||
    FRAME_TEMPLATES.find((t) => t.category === frame.category) ||
    FRAME_TEMPLATES[0];

  const primaryText = frame.primaryText.trim() || template.defaultPrimary;
  const secondaryText = frame.secondaryText.trim() || template.defaultSecondary;
  const win = getFrameWindowArea(w, h, tid);

  ctx.save();

  // 1. FRAME: BALLOONS, HATS & PENNANTS (Image 1 style)
  if (tid === 'bday-balloons') {
    // Top-left Party Hat (green & gold dots)
    drawPartyHat(ctx, w * 0.13, h * 0.22, w * 0.16, h * 0.18, -25, '#10b981', '#fbbf24');

    // Bottom-right Party Hat (purple & gold diamonds)
    drawPartyHat(ctx, w * 0.86, h * 0.62, w * 0.17, h * 0.20, 25, '#9333ea', '#f59e0b');

    // Top-right 3D Floating Balloons (Yellow & Orange)
    drawGlossyBalloon(ctx, w * 0.86, h * 0.14, w * 0.11, h * 0.14, '#eab308', '#ca8a04', '#fef08a');
    drawGlossyBalloon(ctx, w * 0.86, h * 0.28, w * 0.10, h * 0.13, '#ea580c', '#c2410c', '#fed7aa');

    // Left 3D Floating Balloons (Green & Purple)
    drawGlossyBalloon(ctx, w * 0.14, h * 0.48, w * 0.11, h * 0.14, '#22c55e', '#16a34a', '#bbf7d0');
    drawGlossyBalloon(ctx, w * 0.15, h * 0.62, w * 0.10, h * 0.13, '#a855f7', '#7e22ce', '#f3e8ff');

    // Hanging Double-Row Bunting Pennants Banner (Image 1 style)
    const bannerY1 = Math.round(win.y + win.height + h * 0.02);
    const bannerY2 = Math.round(bannerY1 + h * 0.08);

    drawBuntingPennants(
      ctx,
      w * 0.22,
      bannerY1,
      w * 0.56,
      h * 0.075,
      'HAPPY',
      ['#ef4444', '#f97316', '#eab308', '#06b6d4', '#ec4899']
    );

    drawBuntingPennants(
      ctx,
      w * 0.12,
      bannerY2,
      w * 0.76,
      h * 0.08,
      'BIRTHDAY',
      ['#a855f7', '#f43f5e', '#eab308', '#06b6d4', '#ec4899', '#22c55e', '#f97316', '#8b5cf6']
    );
  }

  // 2. FRAME: CELEBRATION CAKE & BALLOONS (Image 2 style)
  else if (tid === 'bday-cake') {
    // Hanging Bunting Flags on Top
    drawBuntingPennants(
      ctx,
      w * 0.25,
      h * 0.14,
      w * 0.50,
      h * 0.065,
      'HAPPY',
      ['#ef4444', '#eab308', '#06b6d4', '#ec4899', '#22c55e']
    );

    drawBuntingPennants(
      ctx,
      w * 0.18,
      h * 0.22,
      w * 0.64,
      h * 0.065,
      'BIRTHDAY',
      ['#a855f7', '#f43f5e', '#eab308', '#06b6d4', '#ec4899', '#22c55e', '#f97316', '#8b5cf6']
    );

    // Multi-tier Birthday Cake with Candles at bottom-left
    drawTieredBirthdayCake(ctx, w * 0.26, h * 0.80, w * 0.32, h * 0.20);

    // Glossy balloons floating around
    drawGlossyBalloon(ctx, w * 0.18, h * 0.15, w * 0.10, h * 0.13, '#10b981', '#059669', '#d1fae5');
    drawGlossyBalloon(ctx, w * 0.19, h * 0.29, w * 0.07, h * 0.09, '#f59e0b', '#d97706', '#fef3c7');
    drawGlossyBalloon(ctx, w * 0.14, h * 0.64, w * 0.09, h * 0.12, '#8b5cf6', '#6d28d9', '#ede9fe');

    drawGlossyBalloon(ctx, w * 0.72, h * 0.13, w * 0.08, h * 0.11, '#a855f7', '#7e22ce', '#f3e8ff');
    drawGlossyBalloon(ctx, w * 0.83, h * 0.23, w * 0.10, h * 0.13, '#eab308', '#ca8a04', '#fef08a');
    drawGlossyBalloon(ctx, w * 0.88, h * 0.55, w * 0.06, h * 0.08, '#22c55e', '#16a34a', '#dcfce7');
    drawGlossyBalloon(ctx, w * 0.81, h * 0.78, w * 0.10, h * 0.13, '#ef4444', '#b91c1c', '#fee2e2');

    // Golden spiral ribbons
    drawRibbonSpiral(ctx, w * 0.07, h * 0.44, h * 0.10, '#fbbf24');
    drawRibbonSpiral(ctx, w * 0.93, h * 0.38, h * 0.10, '#fbbf24');
  }

  // 3. FRAME: CORPORATE BOARDROOM MOCKUP (Image 3 style)
  else if (tid === 'meeting-boardroom') {
    // Canvas frame bezel & shadow on the wall
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 10;
    ctx.strokeRect(win.x, win.y, win.width, win.height);

    // Boardroom Conference Table & Chairs overlapping in front!
    drawBoardroomTableAndChairs(ctx, w, h);

    // Subtitle label on bottom baseboard
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText(primaryText, w / 2, h * 0.96);
  }

  // 4. FRAME: TROPICAL BAMBOO & FOLIAGE (Image 4 style)
  else if (tid === 'event-bamboo') {
    drawBambooPolesAndFoliage(ctx, w, h, win);
  }

  // 5. FRAME: PARTY CONCERT CROWD (Image 5 style)
  else if (tid === 'party-crowd') {
    drawPartyCrowdSilhouettes(ctx, w, h);
  }

  // 6. DEFAULT BANNER / OTHER FRAMES
  else {
    drawGenericEventBanner(ctx, w, h, frame, primaryText, secondaryText);
  }

  ctx.restore();
}

/**
 * 3D Glossy Spherical Balloon with Knot, Highlight & String
 */
function drawGlossyBalloon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color1: string,
  color2: string,
  highlightColor: string
) {
  ctx.save();

  // Wavy Balloon String
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy + ry);
  ctx.bezierCurveTo(cx - 15, cy + ry + 35, cx + 15, cy + ry + 70, cx - 8, cy + ry + 110);
  ctx.stroke();

  // Knot at base
  ctx.fillStyle = color2;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + ry);
  ctx.lineTo(cx + 6, cy + ry);
  ctx.lineTo(cx, cy + ry + 8);
  ctx.closePath();
  ctx.fill();

  // 3D Sphere Radial Gradient
  const grad = ctx.createRadialGradient(cx - rx * 0.35, cy - ry * 0.35, rx * 0.1, cx, cy, rx);
  grad.addColorStop(0, highlightColor);
  grad.addColorStop(0.3, color1);
  grad.addColorStop(0.85, color2);
  grad.addColorStop(1, '#000000');

  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 6;

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glossy reflection specular highlight
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.beginPath();
  ctx.ellipse(cx - rx * 0.38, cy - ry * 0.38, rx * 0.28, ry * 0.16, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Patterned Party Cone Hat with Pom-pom
 */
function drawPartyHat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  angleDeg: number,
  baseColor: string,
  accentColor: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angleDeg * Math.PI) / 180);

  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 12;

  // Cone Body
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2); // tip
  ctx.lineTo(w / 2, h / 2);
  ctx.quadraticCurveTo(0, h / 2 + 10, -w / 2, h / 2);
  ctx.closePath();
  ctx.fill();

  // Pattern spots/diamonds
  ctx.fillStyle = accentColor;
  for (let r = -2; r <= 2; r++) {
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.arc(c * (w * 0.22), r * (h * 0.18), w * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Base golden rim
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-w / 2, h / 2);
  ctx.quadraticCurveTo(0, h / 2 + 10, w / 2, h / 2);
  ctx.stroke();

  // Fluffy Pom-Pom at tip
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(0, -h / 2, w * 0.14, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Hanging Double Swallowtail Bunting Pennants with individual letters
 */
function drawBuntingPennants(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  colors: string[]
) {
  const count = text.length;
  if (count === 0) return;

  const flagW = width / count;

  ctx.save();

  // Hanging wire / string
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + width / 2, y + 14, x + width, y);
  ctx.stroke();

  // Draw each pennant flag
  for (let i = 0; i < count; i++) {
    const fx = x + i * flagW;
    const progress = (i + 0.5) / count;
    // sag curve
    const sag = Math.sin(progress * Math.PI) * 14;
    const fy = y + sag;
    const color = colors[i % colors.length];

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    // Swallowtail flag shape
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(fx + 2, fy);
    ctx.lineTo(fx + flagW - 2, fy);
    ctx.lineTo(fx + flagW - 2, fy + height);
    ctx.lineTo(fx + flagW / 2, fy + height - 12); // notch
    ctx.lineTo(fx + 2, fy + height);
    ctx.closePath();
    ctx.fill();

    // White bold letter
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${Math.round(flagW * 0.65)}px sans-serif`;
    ctx.fillText(text[i], fx + flagW / 2, fy + height * 0.48);

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Multi-Tier Birthday Cake with Icing, Pearl Beads & Lit Candles (Image 2 style)
 */
function drawTieredBirthdayCake(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Cake Stand
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-w * 0.55, h * 0.5, w * 1.1, 8);

  // Bottom Tier
  drawCakeLayer(ctx, 0, h * 0.25, w * 0.95, h * 0.28, '#f1f5f9', '#38bdf8');

  // Middle Tier
  drawCakeLayer(ctx, 0, -h * 0.05, w * 0.72, h * 0.28, '#f1f5f9', '#38bdf8');

  // Top Tier
  drawCakeLayer(ctx, 0, -h * 0.35, w * 0.48, h * 0.28, '#f1f5f9', '#38bdf8');

  // 3 Lit Candles
  [-w * 0.14, 0, w * 0.14].forEach((cx) => {
    // Candle body
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(cx - 3, -h * 0.62, 6, h * 0.25);

    // Candle flame glow
    const fGrad = ctx.createRadialGradient(cx, -h * 0.70, 2, cx, -h * 0.70, 16);
    fGrad.addColorStop(0, '#fef08a');
    fGrad.addColorStop(0.5, '#f59e0b');
    fGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.arc(cx, -h * 0.70, 16, 0, Math.PI * 2);
    ctx.fill();

    // Candle flame teardrop
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(cx, -h * 0.76);
    ctx.quadraticCurveTo(cx + 5, -h * 0.68, cx, -h * 0.64);
    ctx.quadraticCurveTo(cx - 5, -h * 0.68, cx, -h * 0.76);
    ctx.fill();
  });

  ctx.restore();
}

function drawCakeLayer(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  lw: number,
  lh: number,
  frostColor: string,
  creamColor: string
) {
  ctx.save();
  ctx.fillStyle = frostColor;
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 8;
  ctx.fillRect(cx - lw / 2, cy - lh / 2, lw, lh);

  // Icing Ribbon
  ctx.fillStyle = creamColor;
  ctx.fillRect(cx - lw / 2, cy - lh / 2 + 6, lw, 8);

  // Pearl beads
  ctx.fillStyle = '#ffffff';
  for (let px = cx - lw / 2 + 6; px < cx + lw / 2 - 4; px += 10) {
    ctx.beginPath();
    ctx.arc(px, cy + lh / 2 - 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Conference Room Table & Ergonomic Chairs (Image 3 style)
 */
function drawBoardroomTableAndChairs(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();

  // Conference Table in Perspective
  const tableY = h * 0.66;
  const tableH = h * 0.12;

  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 20;

  // Table top (light wood)
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.moveTo(w * 0.22, tableY);
  ctx.lineTo(w * 0.78, tableY);
  ctx.lineTo(w * 0.85, tableY + tableH);
  ctx.lineTo(w * 0.15, tableY + tableH);
  ctx.closePath();
  ctx.fill();

  // Table edge thickness
  ctx.fillStyle = '#c2410c';
  ctx.fillRect(w * 0.15, tableY + tableH, w * 0.70, 8);

  // Metal Table Legs
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(w * 0.24, tableY + tableH + 8, 8, h * 0.18);
  ctx.fillRect(w * 0.76, tableY + tableH + 8, 8, h * 0.18);

  // Ergonomic Mesh Chairs in Foreground
  const chairPositions = [w * 0.18, w * 0.38, w * 0.62, w * 0.82];
  chairPositions.forEach((cx) => {
    drawErgonomicChair(ctx, cx, tableY + tableH * 0.7, w * 0.18, h * 0.25);
  });

  ctx.restore();
}

function drawErgonomicChair(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cw: number,
  ch: number
) {
  ctx.save();
  ctx.fillStyle = '#1e293b';

  // Mesh backrest
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(cx - cw * 0.35, cy - ch * 0.65, cw * 0.7, ch * 0.6, 12);
    ctx.fill();
  } else {
    ctx.fillRect(cx - cw * 0.35, cy - ch * 0.65, cw * 0.7, ch * 0.6);
  }

  // Seat cushion
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cx - cw * 0.4, cy - ch * 0.08, cw * 0.8, ch * 0.16);

  // Stem & 5-star wheeled base
  ctx.fillStyle = '#334155';
  ctx.fillRect(cx - 4, cy + ch * 0.08, 8, ch * 0.25);

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - cw * 0.35, cy + ch * 0.35);
  ctx.lineTo(cx, cy + ch * 0.33);
  ctx.lineTo(cx + cw * 0.35, cy + ch * 0.35);
  ctx.stroke();

  ctx.restore();
}

/**
 * Natural Bamboo Frame & Tropical Foliage (Image 4 style)
 */
function drawBambooPolesAndFoliage(
  ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  win: FrameWindowArea
) {
  ctx.save();

  const bw = 24;

  // Bamboo Cane Texture (Top, Bottom, Left, Right)
  drawBambooCane(ctx, win.x - bw, win.y - bw, win.width + bw * 2, bw, 'horizontal');
  drawBambooCane(ctx, win.x - bw, win.y + win.height, win.width + bw * 2, bw, 'horizontal');
  drawBambooCane(ctx, win.x - bw, win.y - bw, bw, win.height + bw * 2, 'vertical');
  drawBambooCane(ctx, win.x + win.width, win.y - bw, bw, win.height + bw * 2, 'vertical');

  // Lashings / Tied Twine at 4 corners
  ctx.fillStyle = '#78350f';
  [
    [win.x - bw, win.y - bw],
    [win.x + win.width, win.y - bw],
    [win.x - bw, win.y + win.height],
    [win.x + win.width, win.y + win.height],
  ].forEach(([cx, cy]) => {
    ctx.fillRect(cx - 4, cy - 4, bw + 8, bw + 8);
  });

  // Tropical Emerald Leaves Clusters at Corners (Image 4 style)
  drawLeafCluster(ctx, win.x, win.y, 45);
  drawLeafCluster(ctx, win.x + win.width, win.y, 135);
  drawLeafCluster(ctx, win.x, win.y + win.height, -45);
  drawLeafCluster(ctx, win.x + win.width, win.y + win.height, -135);

  ctx.restore();
}

function drawBambooCane(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  dir: 'horizontal' | 'vertical'
) {
  ctx.save();
  const grad = ctx.createLinearGradient(x, y, dir === 'horizontal' ? x : x + w, dir === 'horizontal' ? y + h : y);
  grad.addColorStop(0, '#d97706'); // golden bamboo
  grad.addColorStop(0.5, '#fef08a'); // bamboo sheen
  grad.addColorStop(1, '#92400e');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Bamboo joints / rings
  ctx.fillStyle = '#78350f';
  if (dir === 'horizontal') {
    for (let px = x + 40; px < x + w - 40; px += 80) {
      ctx.fillRect(px, y - 2, 6, h + 4);
    }
  } else {
    for (let py = y + 40; py < y + h - 40; py += 80) {
      ctx.fillRect(x - 2, py, w + 4, 6);
    }
  }
  ctx.restore();
}

function drawLeafCluster(ctx: CanvasRenderingContext2D, cx: number, cy: number, rotDeg: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotDeg * Math.PI) / 180);

  [-30, -10, 10, 30].forEach((ang) => {
    ctx.save();
    ctx.rotate((ang * Math.PI) / 180);
    ctx.fillStyle = '#059669'; // tropical leaf green
    ctx.beginPath();
    ctx.ellipse(35, 0, 35, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leaf center vein
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(65, 0);
    ctx.stroke();
    ctx.restore();
  });

  ctx.restore();
}

/**
 * Dancing Party & Concert Crowd Silhouettes (Image 5 style)
 */
function drawPartyCrowdSilhouettes(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();

  const crowdY = h * 0.72;
  const crowdH = h * 0.28;

  // Colorful geometric party crowd gradient (as in Image 5)
  const grad = ctx.createLinearGradient(0, crowdY, w, h);
  grad.addColorStop(0, '#06b6d4'); // cyan
  grad.addColorStop(0.25, '#10b981'); // emerald
  grad.addColorStop(0.5, '#eab308'); // yellow
  grad.addColorStop(0.75, '#f97316'); // orange
  grad.addColorStop(1, '#ec4899'); // pink

  ctx.fillStyle = grad;

  // Silhouette dancing figures
  const step = w / 16;
  for (let i = 0; i < 16; i++) {
    const px = i * step + step / 2;
    const bodyH = crowdH * (0.55 + Math.sin(i * 1.5) * 0.25);
    const py = h - bodyH;

    // Head
    ctx.beginPath();
    ctx.arc(px, py - 14, 10, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.moveTo(px - 14, py);
    ctx.lineTo(px + 14, py);
    ctx.lineTo(px + 20, h);
    ctx.lineTo(px - 20, h);
    ctx.closePath();
    ctx.fill();

    // Raised hands & arms
    ctx.lineWidth = 6;
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(px - 12, py + 8);
    ctx.lineTo(px - 22, py - 20);
    ctx.moveTo(px + 12, py + 8);
    ctx.lineTo(px + 22, py - 24);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Generic Event Lower Third Banner & Border
 */
function drawGenericEventBanner(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: FrameConfig,
  primary: string,
  secondary: string
) {
  const borderW = Math.max(8, frame.frameBorderWidth || 16);

  // Outer border
  ctx.lineWidth = borderW;
  ctx.strokeStyle = frame.accentColor;
  ctx.strokeRect(borderW / 2, borderW / 2, w - borderW, h - borderW);

  // Bottom Banner
  if (frame.showBanner) {
    const bannerH = Math.max(64, Math.round(h * 0.16));
    const bannerY = h - bannerH - borderW;

    ctx.fillStyle = 'rgba(2, 6, 23, 0.94)';
    ctx.fillRect(borderW, bannerY, w - borderW * 2, bannerH);

    ctx.fillStyle = frame.accentColor;
    ctx.fillRect(borderW, bannerY, w - borderW * 2, 4);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(15, Math.round(bannerH * 0.32))}px sans-serif`;
    ctx.fillText(primary, w / 2, bannerY + bannerH * 0.4);

    if (secondary) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `${Math.max(11, Math.round(bannerH * 0.22))}px sans-serif`;
      ctx.fillText(secondary, w / 2, bannerY + bannerH * 0.75);
    }
  }
}

function drawSparkleStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a + Math.PI / 4) * (r * 0.25), cy + Math.sin(a + Math.PI / 4) * (r * 0.25));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRibbonSpiral(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  const turns = 4;
  for (let i = 0; i < turns; i++) {
    const seg = len / turns;
    ctx.bezierCurveTo(x + 15, y + i * seg + seg * 0.3, x - 15, y + i * seg + seg * 0.7, x, y + (i + 1) * seg);
  }
  ctx.stroke();
  ctx.restore();
}

function drawConfettiParticles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  count: number
) {
  const colors = ['#f43f5e', '#eab308', '#06b6d4', '#ec4899', '#22c55e', '#a855f7'];
  ctx.save();
  for (let i = 0; i < count; i++) {
    const px = (Math.sin(i * 37) * 0.5 + 0.5) * w;
    const py = (Math.cos(i * 53) * 0.5 + 0.5) * h;
    const size = 3 + (i % 5);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(px, py, size, size * 1.5);
  }
  ctx.restore();
}

function drawLaserBeam(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}
