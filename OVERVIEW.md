# VidCuts — Comprehensive Architectural & Technical Overview

> **Version**: 2.2.0  
> **Author & Publisher**: Reeyansh Tech Solutions  
> **Official Domain**: [https://www.vidcuts.online/](https://www.vidcuts.online/)  
> **Core Architecture**: 100% Client-Side In-Browser WebAssembly, Privacy-First, Zero Cloud Uploads

---

## 1. Executive Summary

**VidCuts** is a high-performance, client-side multimedia workstation running entirely inside modern web browsers. It eliminates the privacy risks, subscription paywalls, and bandwidth costs of cloud converters by executing all processing locally on the user's device using **WebAssembly (WASM)**, modern HTML5 APIs, and Web Workers.

### Core Value Pillars
- 🔒 **Absolute Privacy**: 0 bytes uploaded to external servers. All videos, images, and confidential PDFs remain local.
- ⚡ **Near-Instant Execution**: Uses stream-copy lossless cutting (`-c copy`) for videos and client-side vector engines for PDFs and QR codes.
- 📱 **Mobile & Desktop Responsive**: Includes a slide-in mobile navigation drawer, fluid touch targets, and responsive layouts.
- 🚀 **Core Web Vitals Optimized**: Optimized for >95% performance on PageSpeed Insights with deferred third-party scripts, viewport-triggered 3D scenes, and responsive image compression.

---

## 2. Six Integrated Studio Modules

VidCuts integrates six specialized creative and document workspaces:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VIDCUTS MULTIMEDIA SUITE                        │
├─────────────────┬─────────────────┬─────────────────┬──────────────────┤
│ 1. Video Cutter │ 2. Media Tools  │ 3. Image Studio │ 4. 32 PDF Tools  │
│ & 9:16 Shorts   │ & Audio Extract │ & Shape Cropper │ Suite            │
├─────────────────┴─────────────────┴─────────────────┴──────────────────┤
│ 5. Vector QR Studio & 3D Scanner  │ 6. Local Files & Export Manager    │
└───────────────────────────────────┴────────────────────────────────────┘
```

### Module 1: Video Cutter & 9:16 Shorts Generator
- **Multi-Mode Slicing**:
  - **Split by Pieces**: Divide video into equal $N$ parts.
  - **Split by Duration**: Fixed duration clips (30s WhatsApp, 60s Shorts) with zero frame loss.
  - **Cut Min to Min**: Custom timestamp ranges with real-time video scrubber sync and multi-cut extraction.
- **9:16 Vertical Video Conversion**:
  - Styles: Dynamic Blurred Background, Center Crop, or Letterbox.
  - **Top & Bottom Promotional Cards**: Attach banners above and below 16:9 video with live adjustment sliders (height, zoom, padding, background colors).
  - **Timeline Banners Mode**: Attach up to 10+ timed promotional cards across specific intervals of the video timeline with automatic division presets.
- **Dual Engine**: Stream copy (lossless, instant) or frame-accurate re-encode (`libx264` + `aac`).
- **Direct Disk Output**: Uses File System Access API to create dedicated folders on disk or export as a single ZIP archive.

### Module 2: Media Tools & Audio Extractor
- **Direct Web Downloader**: Clean client-side video link parser and extractor.
- **Audio Extractor**: Extract high-fidelity audio tracks from any video container into MP3 or AAC.
- **Video Audio Muter**: Remove audio tracks with lossless stream copy in under 1 second.

### Module 3: Image Studio & Shape Cropper
- **Aspect Ratio Cropping**: Standard social presets (1:1 Square, 4:5 Portrait, 16:9 Landscape, 9:16 Stories).
- **Geometric Shape Cutouts**: Circle, Heart, Star, Hexagon, Octagon, Diamond, and Custom Polygons with anti-aliasing.
- **Photo Retouching**: Contrast, saturation, exposure, rotate, flip, and high-DPI export (PNG, JPEG, WebP).

### Module 4: 32 Client-Side PDF Tools
Complete PDF workspace supporting all standard iLovePDF-equivalent operations locally:
- **Organize**: Merge PDFs, Split pages, Remove pages, Extract pages, Reorder pages.
- **Optimize**: Compress PDF without quality loss, Linearize for web fast view.
- **Convert**: PDF to JPG/PNG, Images to PDF, Text to PDF, HTML to PDF.
- **Security**: AES-256 password encryption, Unlock PDF, Remove permissions.
- **Watermark & Page Numbers**: Add dynamic watermarks, signatures, stamps, and customizable page numbers.

### Module 5: Vector QR Code Studio & 3D Laser Scanner
- **15 Supported Protocols**: URL, Plain Text, WiFi (WPA/WPA2/WEP), UPI Payment, VCard, Email, Phone, SMS, Crypto, and more.
- **Deep Customization**: Dot patterns, corner shapes, gradient fills, and custom center logo embedding with 9-position alignment.
- **Plain QR Mode**: High-contrast, standard compliant monochrome QR codes.
- **3D Laser Scanner Stage**: Three.js WebGL visualization simulating a live laser scanning matrix. Lazy-loaded via `IntersectionObserver` to preserve initial page load performance.

### Module 6: Local Files & Export Manager
- In-browser file registry listing all processed clips, audio tracks, images, PDFs, and QR codes during the active session.
- Individual download buttons, clip preview players, and single-click batch ZIP archiving.

---

## 3. Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend Framework** | React 19, TypeScript 5.8 | Component architecture, strict type safety |
| **Build & Bundler** | Vite 8, Rolldown runtime | Sub-second HMR, tree-shaking, manual chunking |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons | Responsive glassmorphism, semantic micro-interactions |
| **Video Engine** | `@ffmpeg/ffmpeg` (v0.12), Single-threaded WASM | Client-side FFmpeg pipeline |
| **PDF Engine** | `pdf-lib`, `pdfjs-dist` | In-browser PDF manipulation and rendering |
| **QR Code Engine** | `qrcode`, `qr-code-styling`, `html5-qrcode` | High-DPI vector QR codes & camera scanning |
| **3D Graphics** | `three` (Three.js) | Interactive 3D laser matrix scanner |
| **Packaging & Export**| `jszip`, File System Access API | ZIP bundling and local folder writing |

---

## 4. Performance & Core Web Vitals Optimization Engine

VidCuts is engineered to hit **>95% on Mobile PageSpeed Insights** under Slow 4G throttling (1.6 Mbps / 150ms RTT):

### Key Optimizations Implemented
1. **Deferred Google AdSense (0 ms TBT Penalty)**:
   - `<meta name="google-adsense-account">` remains in `<head>` for instant domain ownership verification.
   - `adsbygoogle.js` is loaded lazily on first user interaction (`scroll`, `touchstart`, `click`, `mousemove`) or after a 3.8s idle callback (`requestIdleCallback`).
   - Prevents Google's ~254 KiB ad scripts (`sodar2.js`, `show_ads_impl`) from blocking initial paint and causing long main-thread tasks.
2. **IntersectionObserver 3D Lazy Loading**:
   - Three.js (`vendor-three` 539 KiB raw / 133 KiB gzip) and QR libraries (`vendor-qr` 153 KiB raw / 54 KiB gzip) are completely isolated from initial load.
   - The `<LazyQR3DScanner />` container only triggers module import when scrolled within 300px of the viewport.
3. **Ultra-Compressed Asset Pipeline**:
   - Header, drawer, and footer icons use `app-icon-small.png` (5.6 KiB) and `reeyansh-logo-small.png` (7.5 KiB), saving >330 KiB vs raw originals.
4. **Zero-Delay Inline HTML Skeleton**:
   - `index.html` embeds an immediate CSS skeleton inside `<div id="root">`, delivering immediate visual structure before React hydration.
5. **Strict 0 Cumulative Layout Shift (CLS)**:
   - Ad containers and media players feature predefined aspect ratios and `min-height` constraints (`min-h-[90px]`, `min-h-[120px]`).
6. **Mobile Accessibility Tap Targets (100 Score)**:
   - Hamburger drawer toggle, logo, and close buttons adhere strictly to Google's $\ge 48 \times 48\text{px}$ touch target guideline.

---

## 5. Google AdSense & Monetization Architecture

The application includes two compliant web Google AdSense units (Publisher ID: `ca-pub-5783404252931950`):

```
┌────────────────────────────────────────────────────────┐
│                      VidCuts UI                        │
│                                                        │
│  [ AdBanner: Responsive Display (Slot: 7986346271) ]   │
│                                                        │
│  [ Studio Workspaces / Video Tools / Media Player ]    │
│                                                        │
│  [ AdBanner: In-Feed Fluid (Slot: 6721366060) ]       │
│    Layout Key: -fb+5w+4e-db+86                         │
│                                                        │
│  [ FAQ & SEO Structured Content Section ]              │
└────────────────────────────────────────────────────────┘
```

- **Domain ads.txt**: Verified and published at `public/ads.txt`:
  ```
  google.com, pub-5783404252931950, DIRECT, f08c47fec0942fa0
  ```
- **Ad Components**: Wrapped in `<AdBanner />` with automatic deduplication, layout key propagation, and fallback error containment.

---

## 6. Project Directory Map

```
video-cutter/
├── index.html                   # SEO tags, Schema.org LD-JSON, AdSense verification & skeleton
├── vite.config.ts               # Vite 8 config, manualChunks code-splitting
├── package.json                 # Dependencies & build scripts
├── public/
│   ├── ads.txt                  # Google AdSense publisher verification
│   ├── robots.txt               # Search crawler permissions
│   ├── sitemap.xml              # XML Sitemap for search indexing
│   ├── app-icon.png             # Full-res 1024x1024 master icon
│   ├── app-icon-small.png       # 96x96 5.6 KiB high-speed web icon
│   ├── reeyansh-logo-small.png  # 7.5 KiB optimized brand mark
│   └── ffmpeg/                  # Locally bundled FFmpeg WASM core
└── src/
    ├── App.tsx                  # Root shell, state coordinator, route dispatcher
    ├── main.tsx                 # React DOM root entry
    ├── types/                   # TypeScript definitions (Video, PDF, QR)
    ├── services/
    │   ├── ffmpegService.ts     # WASM lifecycle, slicing, 9:16 filters
    │   └── fileSystemService.ts # File System Access API folder writer
    └── components/
        ├── Header.tsx           # Nav bar + accessible mobile slide drawer
        ├── Footer.tsx           # Brand credits, links, legal disclaimers
        ├── HomePage.tsx         # Showcase hub, lazy 3D stage, FAQ section
        ├── AdBanner.tsx         # AdSense Display & In-Feed Fluid component
        ├── QR3DLaserScanner.tsx # Three.js WebGL laser matrix simulation
        ├── MediaTools/          # Audio extractor, muter, video downloader
        ├── ImageStudio/         # Aspect ratio & shape cropping studio
        ├── PdfStudio/           # 32 client-side PDF manipulation tools
        └── QrStudio/            # Vector QR code generator & camera scanner
```

---

## 7. Development & Deployment Workflow

### Prerequisites
- Node.js $\ge 18$
- npm $\ge 9$

### Setup & Local Development
```bash
# 1. Install dependencies
npm install

# 2. Start local Vite development server
npm run dev
# Running on http://localhost:5173/
```

### Production Build
```bash
# Builds single-threaded WASM assets and optimizes chunking
npm run build

# Preview production build locally
npm run preview
```

### Live Deployment
Pushes to the `main` branch automatically build and deploy via GitHub Pages to:
**`https://www.vidcuts.online/`**

---

*Copyright © 2026 Reeyansh Tech Solutions. All rights reserved.*
