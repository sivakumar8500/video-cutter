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

## 2. Detailed Explanation of Each Module (Purpose & How It Works)

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

---

### Module 1: Video Cutter & 9:16 Shorts Generator

#### 🎯 Purpose
Enables content creators, marketers, and everyday users to split long-form videos into precise segments (e.g. 30-second WhatsApp status clips, 60-second YouTube Shorts, Instagram Reels, TikTok videos) and convert horizontal 16:9 widescreen footage into high-engagement 9:16 vertical videos with branded promotional cards.

#### ⚙️ How It Works (Technical & User Flow)
1. **Local File Ingestion**:
   - The user selects or drags & drops an MP4, MOV, MKV, AVI, or WebM file.
   - An HTML5 `<video>` element reads the local file via `URL.createObjectURL(file)`. The browser extracts video metadata (duration, resolution, framerate, codecs) in milliseconds without any network request.
2. **Splitting Modes**:
   - **Split by Pieces**: Divides the total timeline duration $T$ by $N$ equal parts ($T / N$).
   - **Split by Duration**: Divides the timeline into fixed blocks (e.g., 30s or 60s). If the duration is not evenly divisible, a remainder clip is generated with the exact remaining time so zero frames are lost.
   - **Cut Min to Min**: Users pick exact `Start (MM:SS)` and `End (MM:SS)` timestamps. Users can click **"Set to Now"** to capture the current playback head position from the integrated video scrubber. Multiple custom cuts can be added in one batch.
3. **9:16 Vertical Conversion with Top & Bottom Promotional Cards**:
   - Users can convert cuts to vertical 9:16 format with three styles: **Dynamic Blurred Background**, **Center Crop**, or **Letterbox**.
   - **Promotional Cards**: Users attach a Top Banner and Bottom Banner around the video. Full sliders adjust banner height ($200\text{px} - 800\text{px}$), cover/contain mode, zoom, and background color.
   - **Timeline Banners Mode**: Users can configure up to 10+ distinct banner pairs that change dynamically at predetermined timestamps during video playback (e.g., 0–6s Banner A, 6–12s Banner B) with instant auto-divide presets.
4. **FFmpeg WebAssembly Engine**:
   - Loads `@ffmpeg/ffmpeg` compiled to single-threaded WebAssembly (`ffmpeg-core.wasm`).
   - Writes the input video into FFmpeg's in-memory virtual filesystem (MEMFS).
   - **Lossless Stream Copying**: For standard cuts, runs:
     ```bash
     ffmpeg -ss [start] -to [end] -i input.mp4 -c copy -avoid_negative_ts make_zero output.mp4
     ```
     Because this does not re-encode video frames, cutting a 1GB video takes under 2 seconds!
   - **Re-encode Fallback & 9:16 Filter Graph**: When converting to 9:16 or attaching promo cards, FFmpeg executes a multi-stream `filter_complex` graph using `scale`, `boxblur`, and `overlay` filters.
5. **Output**: Slices are read back from MEMFS as `Uint8Array` blobs and delivered directly to the user.

---

### Module 2: Media Tools & Audio Extractor

#### 🎯 Purpose
Provides essential audio and stream manipulation tools for content repurposing, podcast creation, and audio track isolation without needing heavy desktop software like Premiere or Audacity.

#### ⚙️ How It Works (Technical & User Flow)
1. **Audio Extractor**:
   - **Purpose**: Strip visual video tracks and export pure audio files in MP3 or AAC format for podcasts, music, and voiceover editing.
   - **Mechanism**: Passes the input video through FFmpeg WASM using:
     ```bash
     ffmpeg -i input.mp4 -vn -acodec libmp3lame -q:a 2 output.mp3
     ```
     If the source stream is already AAC and the user chooses AAC, it runs `-vn -c:a copy` for instantaneous lossless extraction in ~500ms.
2. **Video Audio Muter**:
   - **Purpose**: Remove copyright-protected background music, background noise, or unwanted audio tracks before publishing.
   - **Mechanism**: Runs FFmpeg with `-c:v copy -an`. Video packets are copied directly into a new container without altering the visual data or quality.
3. **Direct Web Video Downloader**:
   - **Purpose**: Download video clips from direct HTTP/HTTPS web video links directly to the user's hard drive.
   - **Mechanism**: Streams chunks via the browser's `fetch()` API and `ReadableStream`, tracking download percentages before generating a local download Blob.

---

### Module 3: Image Studio & Geometric Shape Cropper

#### 🎯 Purpose
Provides a full-featured, zero-upload photo editor and aspect ratio/shape cropper for creating professional profile avatars, YouTube thumbnails, Instagram square photos, and custom geometric graphic assets.

#### ⚙️ How It Works (Technical & User Flow)
1. **Aspect Ratio Cropping**:
   - Offers locked aspect ratios: 1:1 (Square/Avatar), 4:5 (Instagram Portrait), 16:9 (YouTube Landscape), 9:16 (Stories/Reels), 2:3, and Freeform.
   - Live interactive cropping box with 8 boundary handles, corner guides, and aspect lock toggles.
2. **Geometric Shape Cutouts**:
   - Supports 8 custom shapes: **Circle**, **Heart**, **Star (5-point)**, **Hexagon**, **Octagon**, **Diamond**, **Rounded Rectangle**, and **Badge**.
   - **Clipping Engine**: Uses the HTML5 Canvas 2D API (`OffscreenCanvas`). A mathematical path is constructed (`ctx.arc()`, bezier cubic curves for the heart, parametric trigonometric formulas for stars and polygons).
   - `ctx.clip()` is applied, rendering the image strictly inside the shape while keeping the outer area 100% transparent (alpha channel = 0).
3. **Image Enhancement & Adjustments**:
   - Real-time CSS filter matrix for Brightness, Contrast, Saturation, Sharpness, and Exposure.
   - Transformations: 90° clockwise/counter-clockwise rotation, horizontal flip, and vertical flip.
4. **Export Engine**:
   - Exports high-DPI outputs in PNG (preserving transparency), JPG (adjustable quality slider), or WebP.

---

### Module 4: 32 Client-Side PDF Tools Suite

#### 🎯 Purpose
Delivers a complete, privacy-compliant replacement for cloud PDF suites (such as iLovePDF, Smallpdf, Adobe Acrobat Online). Allows banks, legal professionals, students, and businesses to process highly sensitive documents, contracts, and IDs with absolute assurance that no data leaves their computer.

#### ⚙️ How It Works (Technical & User Flow)
1. **Underlying Architecture**:
   - Built using **`pdf-lib`** (for structural byte manipulation) and **`pdfjs-dist`** (Mozilla's vector PDF rendering engine).
   - Loads the PDF file as an `ArrayBuffer` directly into memory.
2. **Core Capabilities Breakdown**:
   - **Merge PDFs**: Reads multiple PDF documents, uses `PDFDocument.copyPages()` to extract page dictionaries, and merges them into a single continuous vector document without re-rasterizing text.
   - **Split & Extract Pages**: Extracts custom page ranges (e.g. pages 1–3, 7–10) or splits each page into an individual standalone PDF.
   - **Remove & Reorder Pages**: Visual thumbnail grid allows dragging pages to rearrange sequence or clicking trash icons to delete unneeded pages.
   - **Compress PDF**: Strips redundant metadata, optimizes xref tables, compresses internal streams with FlateDecode, and downsamples heavy embedded raster images.
   - **PDF to JPG / PNG**: Uses `pdfjs-dist` to render each vector page onto an in-memory `<canvas>` at $2\times$ scale (144 DPI) and exports individual images or a bundled ZIP.
   - **Images to PDF**: Takes multiple JPG, PNG, or WebP images, calculates page geometry (A4, Letter, Auto), and embeds them as full-bleed or margined PDF pages.
   - **Protect & Encrypt (AES-256)**: Adds user and owner passwords with standard PDF security permission flags (disallow printing, disallow text copy).
   - **Unlock PDF**: Removes security locks and restrictions upon entering the valid password.
   - **Watermarking & Page Numbers**: Stamps customizable text watermarks ("CONFIDENTIAL", "DRAFT", company names) or page numbers at top/bottom/center with opacity, font size, and rotation controls.
   - **Rotate & Flatten**: Permanently applies 90°/180° orientation flags to page dictionaries and flattens form fields.

---

### Module 5: Vector QR Code Studio & 3D Laser Scanner

#### 🎯 Purpose
Allows businesses and individuals to create professional, branded, custom vector QR codes for marketing campaigns, restaurant menus, WiFi access, payments, and product packaging, plus scan QR codes using local webcams.

#### ⚙️ How It Works (Technical & User Flow)
1. **15 Supported Data Protocols**:
   - URL, Plain Text, WiFi Network (SSID, Encryption WPA/WPA2/WEP, Password, Hidden toggle), UPI Payments (Virtual Payment Address, Payee Name, Amount, Note), VCard 3.0 (Full Contact Card), Email, Phone Call, SMS, Crypto Wallet, and Geolocation.
2. **Custom Dot Patterns & Styling**:
   - Powered by `qr-code-styling` and `qrcode`.
   - **Dot Styles**: Rounded, Dots, Classy, Square, Extra-Rounded.
   - **Corner Eye Shapes**: Custom square, dot, or rounded outer frames and inner corner balls.
   - **Color Engine**: Single solid colors or multi-stop linear/radial gradients.
3. **Logo Embedding & Error Correction**:
   - Users can upload company logos (SVG, PNG) to embed in the center of the QR code.
   - When a logo is attached, the algorithm automatically elevates the Reed-Solomon Error Correction Code to **Level H (High - 30%)**. This ensures that even with up to 30% of the center covered by a logo, 100% of standard phone cameras can scan the code instantly.
   - Includes 9-position alignment, custom logo margin padding, and background clearout.
4. **Plain QR Mode**:
   - High-contrast, standard-compliant black-and-white mode optimized for thermal receipt printers, laser engravers, and industrial barcode scanners.
5. **Interactive 3D Laser Matrix Scanner Stage**:
   - Built with **Three.js** to provide an engaging live preview of the generated QR code.
   - Translates QR matrix data into a 3D grid of instanced meshes (`InstancedMesh`) with metallic shaders and animates a scanning laser beam.
   - **Performance Protection**: Uses `IntersectionObserver` so Three.js and the WebGL renderer are **never downloaded or initialized** until the user scrolls down to that section.

---

### Module 6: Local Files & Session Export Manager

#### 🎯 Purpose
Acts as the user's centralized control center for all files created during their browsing session, providing instant previews, individual downloads, batch packaging, and direct-to-disk saving.

#### ⚙️ How It Works (Technical & User Flow)
1. **In-Browser Session Registry**:
   - An in-memory state tracking every processed item (videos, clips, audio tracks, cropped photos, PDFs, and QR codes) with their Blob URLs, filenames, MIME types, and file sizes.
2. **Direct Folder Saving (File System Access API)**:
   - Modern browsers (Chrome, Edge) support `window.showDirectoryPicker()`.
   - When the user clicks **"Save to Computer Folder"**, VidCuts requests permission to write to a local folder selected by the user, creates a timestamped subfolder, and streams all files directly onto the user's hard drive without triggering individual browser download prompts.
3. **One-Click Batch ZIP Archive**:
   - Powered by **JSZip**. Compresses all files in the session into a single `.zip` file with real-time compression progress indicators and triggers an automatic browser save.
4. **Live Verification Players**:
   - Modal inspection players for each file type: video playback for cut clips, waveform audio preview, high-res image zoom, and PDF page viewer.

---

## 3. Technology Stack Summary

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

VidCuts is engineered to achieve **>95% on Mobile PageSpeed Insights** under Slow 4G throttling (1.6 Mbps / 150ms RTT):

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
├── OVERVIEW.md                  # Comprehensive architectural and module documentation
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
# Builds single-threaded WASM assets, static routes and optimizes chunking
npm run build

# Preview production build locally
npm run preview
```

### Live Deployment
Pushes to the `main` branch automatically build and deploy via GitHub Pages to:  
**`https://www.vidcuts.online/`**

---

*Copyright © 2026 Reeyansh Tech Solutions. All rights reserved.*
