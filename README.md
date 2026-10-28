# SplitStream — Modern Video Cutter & Splitter Web Application

A modern, responsive, high-precision **Video Cutter & Splitter Web App** built with React, TypeScript, Tailwind CSS, and FFmpeg WebAssembly. Split any local video into multiple smaller clips by piece count or clip duration—**100% locally in your browser** without uploading files to any external server.

---

## 🌟 Key Features

### 1. Local Video Upload & Inspection
- **Drag & Drop + File Picker**: Select video files directly from your computer.
- **Broad Format Support**: Supports `MP4`, `MOV`, `MKV`, `AVI`, `WebM`, `M4V`, and other common media containers.
- **Detailed Metadata Display**: Live badges show original filename, file size, duration, video resolution ($W \times H$), and MIME format.
- **Integrated Video Preview Player**: Full playback controls (Play/Pause, Timeline Scrubber, Mute/Volume slider, Fullscreen) with timestamp markers.
- **One-Click Demo Video Generator**: Generates an instant 30-second synthetic video clip with an animated countdown timer and audio ticks so you can test the splitting workflow without finding a local video file.

---

### 2. Dual Splitting Modes

#### 🧩 Mode A: Split by Number of Pieces
- Specify the desired number of clips (e.g., 2, 4, 5, 10 pieces).
- Automatically calculates the exact duration of each segment ($TotalDuration / Pieces$).
- Example: A 10-minute video divided into 5 pieces results in 5 clips of 2 minutes each.

#### ⏱️ Mode B: Split by Clip Duration
- Specify the target duration for each clip (e.g., 30s, 60s, 2 minutes, 5 minutes).
- Slices the video sequentially until the entire timeline is covered.
- **Zero Loss Guarantee**: If the total duration is not evenly divisible, a final clip is created with the exact remainder so no footage is ever lost or omitted.

#### ✂️ Mode C: Cut Particular Minute to Minute (Custom Time Range)
- Cut any specific portion of the video by entering exact **Start Time (Minutes : Seconds)** and **End Time (Minutes : Seconds)**.
- **"Set to Now" Button**: One-click sync from the video preview player so you can set cut points right while watching!
- **Multiple Custom Cuts**: Extract multiple specific segments from the same video in a single operation with the **"+ Add Another Cut"** button.
- **Quick Presets**: Instant buttons for "First 1 Min", "First 2 Min", "Middle Section", "Last 1 Min", and "Full Video".
- **Visual Range Slices**: Highlights the exact cut slices on the timeline ribbon.

---

### 📱 16:9 to 9:16 Aspect Ratio Conversion (Shorts, Reels & TikTok)
- **Pre-Cut Conversion**: Select **"9:16 Vertical"** in the configuration panel to directly export cuts in 9:16 vertical ratio.
- **Post-Cut Conversion (On Completion Screen)**: Cut your videos first in original resolution, then use the **"Convert Clips to 9:16 Vertical"** tool to transform all or individual clips on demand!
- **🎴 Top & Bottom Promotional Cards (Viral Social Stack)**:
  - Attach two promotional cards: **Top Card** at the top, **16:9 Video** in the middle, and **Bottom Card** at the bottom!
  - Upload custom card graphics (PNG, JPG, WebP) or click one-click pre-styled viral templates (*"🔥 Wait Till The End" + "👉 Subscribe For Part 2"*, *"Must Watch"*, etc.).
  - **⏱️ Multiple Timed Banners (Timeline Mode)**:
    - Attach different top and bottom banners at specific time intervals (e.g., 0-6s banner 1, 6-12s banner 2, up to 10+ banners across a 1-minute video).
    - **⚡ Quick Auto-Divide**: Instant buttons to divide video duration into 10 banners, 5 banners, every 5s, or every 10s.
    - **Visual Timeline Ribbon**: Interactive colored map of all time slices with click-to-seek.
    - **Live Phone Preview with Playhead Scrubber**: Scrub or play the video to watch the top and bottom banners switch in real time!
  - **🎛️ Full Uploaded Card Adjustment Controls**:
    - **Fit Mode**: Switch between **Fill (Cover)** to fill the banner without borders, or **Fit (Contain)** to preserve the full image.
    - **Custom Card Heights**: Precision sliders to adjust the height of the Top Card ($300\text{px} - 750\text{px}$) and Bottom Card ($300\text{px} - 750\text{px}$).
    - **Zoom & Scaling**: Fine-tune card zoom from $80\%$ to $150\%$.
    - **Background Color Palette**: Choose custom background colors behind cards (Black, Charcoal, Slate, Dark Red, Dark Purple, Navy, White, or hex color picker).
    - **Video Padding / Gap**: Set custom vertical gap ($0 - 30\text{px}$) between the cards and the video.
    - **Reset to Default**: One-click reset to standard balanced layout.
  - **Live 9:16 Phone Mockup**: Real-time visual mockup updates instantly as you adjust sliders before rendering.
- **3 Professional Vertical Styles**:
  1. **✨ Blurred Background (Recommended)**: Keeps the full 16:9 footage centered in high fidelity, surrounded by a stylish, dynamically scaled and blurred background.
  2. **✂️ Center Crop**: Crops and scales the center of the 16:9 video to fill the vertical 9:16 screen completely.
  3. **⬛ Letterbox (Black Bars)**: Centers the 16:9 footage with clean black bars above and below.
- **In-App Vertical Preview**: Play and inspect the converted 9:16 video clips with attached promotional cards directly in the preview player.

---

### 3. Interactive Timeline & Live Configuration
- **Visual Segment Ribbon**: A multi-colored timeline representing every planned segment with hover tooltips and instant time-seeking into the video player.
- **Segment Planner Table**: Clear breakdown of each clip's index, start time, end time, duration, and planned filename.
- **Input Validation**: Prevents zero, negative, or invalid durations.
- **Customizable Output Prefix**: Customize the output naming pattern (e.g., `vacation_part_01.mp4`).

---

### 4. Dual-Engine Video Processing (FFmpeg WASM)
- **Fast Stream Copy (Lossless, Default)**: Uses `-c copy` with `-avoid_negative_ts make_zero` to split videos near-instantly without re-encoding or quality degradation.
- **Accurate Re-encode Fallback**: Offers frame-accurate H.264 (`libx264` + `aac`) encoding when exact keyframe alignment is needed or if container stream copying fails.
- **Controlled Concurrency & Memory Hygiene**: Slices segments sequentially and cleans up temporary virtual files and WebAssembly heap memory after each clip.
- **Live Progress & FFmpeg Terminal**: Displays overall percentage, current clip percentage, elapsed time, and a collapsible console streaming real-time FFmpeg logs.
- **Cancellation**: Full ability to safely cancel an ongoing splitting operation.

---

### 5. Flexible Export & Folder Output
- **Direct Folder Export (File System Access API)**: Creates a new dedicated folder (e.g., `myvideo_split_20261027_193000`) and saves all generated clips directly onto your disk.
- **Download All as ZIP**: Compresses all generated clips into a single ZIP archive using JSZip with real-time compression progress.
- **Clip Verification Player & Individual Downloads**: Play each cut clip directly in the browser to verify cut accuracy before downloading individual clips.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 8](https://vite.dev/) with `@tailwindcss/vite` |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with custom dark charcoal glassmorphism |
| **Video Engine** | [`@ffmpeg/ffmpeg`](https://ffmpegwasm.netlify.app/) (Single-threaded WebAssembly core bundled locally) |
| **Archive Bundler** | [JSZip](https://stuk.github.io/jszip/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Celebration** | [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended, tested on v22.x)
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd "video cutter"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure FFmpeg WASM core files are in `public/ffmpeg/`:
   ```bash
   mkdir -p public/ffmpeg
   cp node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js public/ffmpeg/
   cp node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm public/ffmpeg/
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://127.0.0.1:5173/
   ```

---

## 🔒 Privacy & Browser Security Notice

- **100% Client-Side**: No video files, audio tracks, or frames are ever uploaded or transmitted to an external server. Everything is processed directly inside your browser tab.
- **Cross-Origin Isolation**: Vite is configured with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers to guarantee optimal WebAssembly performance and memory access.
- **Large File Recommendation**: Because 32-bit WebAssembly typically has a ~2GB memory ceiling, files under 800MB process best. Stream copy mode is recommended for fast, memory-efficient splitting.

---

## 📁 Project Architecture

```
video-cutter/
├── public/
│   └── ffmpeg/               # Bundled offline FFmpeg WASM assets
│       ├── ffmpeg-core.js
│       └── ffmpeg-core.wasm
├── src/
│   ├── components/
│   │   ├── Header.tsx             # Navigation bar, brand logo, status badges
│   │   ├── VideoUploader.tsx      # Drag & drop, file picker, 30s demo generator
│   │   ├── VideoPlayerPreview.tsx # Video player, metadata badges, scrub controls
│   │   ├── SplitConfiguration.tsx # Mode A & Mode B tabs, steppers, presets
│   │   ├── TimelinePreview.tsx    # Interactive multi-segment timeline & seek
│   │   ├── ProcessingModal.tsx    # Animated progress modal, terminal console
│   │   └── CompletionView.tsx     # Celebration, direct folder save, ZIP, clip player
│   ├── services/
│   │   ├── ffmpegService.ts       # FFmpeg lifecycle, stream copy, re-encoding fallback
│   │   └── fileSystemService.ts   # File System Access API & JSZip bundler
│   ├── utils/
│   │   ├── formatters.ts          # Duration, file size, filename sanitization
│   │   └── sampleVideo.ts         # In-browser synthetic test video generator
│   ├── types/
│   │   └── index.ts               # Complete TypeScript interfaces
│   ├── App.tsx                    # Main state machine and workflow
│   ├── index.css                  # Tailwind v4 theme, fonts, animations
│   └── main.tsx                   # React root entry
├── vite.config.ts                 # COOP/COEP headers, Tailwind v4 plugin
└── package.json
```

---

## 📜 Available Scripts

- `npm run dev`: Starts the local development server at `http://127.0.0.1:5173/`.
- `npm run build`: Compiles TypeScript and builds the production bundle into `dist/`.
- `npm run preview`: Previews the production build locally.

---

## 🚀 GitHub Actions Auto-Deployment

The repository includes an automated CI/CD workflow (`.github/workflows/deploy.yml`) that builds and deploys the application to **GitHub Pages** on every push to the `main` branch.

### To enable GitHub Pages:
1. Go to your repository on GitHub: `https://github.com/sivakumar8500/video-cutter`
2. Navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Any push to `main` will automatically build and publish the latest version!

