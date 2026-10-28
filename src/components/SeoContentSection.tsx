import React, { useState } from 'react';
import {
  ChevronDown,
  Sparkles,
  Zap,
  ShieldCheck,
  Scissors,
  Smartphone,
  FolderDown,
  Layers,
  HelpCircle,
  ExternalLink,
  Check,
  X,
  Lock,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I split a video into multiple equal parts?',
    answer:
      'Upload your video, click the "Split by Pieces" tab, and select how many parts you want (e.g., 4 or 5 pieces). SplitStream will automatically calculate the exact timestamp boundaries and divide the entire video timeline equally without missing a single frame.',
  },
  {
    question: 'Can I cut a specific minute-to-minute part of a video?',
    answer:
      'Yes! Switch to the "Cut Min to Min" tab. You can set the exact Start Time (e.g., 01:30) and End Time (e.g., 04:15). You can also click "Set to Now" while previewing the video in the player to mark exact cut points instantly, or click "+ Add Another Cut" to extract multiple specific segments from the same video.',
  },
  {
    question: 'How does 16:9 to 9:16 vertical conversion work for Reels and Shorts?',
    answer:
      'You can select "9:16 Vertical" before splitting or convert your cut clips on the completion screen. You can choose from three styles: Blurred Background (centered video surrounded by dynamic blurred reflections), Center Crop (fills the full vertical screen), or Letterbox (classic black bars).',
  },
  {
    question: 'How do I attach promotional cards above and below the video?',
    answer:
      'Enable the "Top & Bottom Promotional Cards" option in the 9:16 converter. You can upload custom banner graphics or pick pre-styled viral templates ("Wait Till The End", "Subscribe for Part 2"). Full adjustment sliders allow you to customize top and bottom card heights (200px to 800px), fit modes (Cover vs Contain), zoom, video padding, and background colors with a live phone preview.',
  },
  {
    question: 'How do I add multiple timed banners across a video timeline?',
    answer:
      'In the promotional cards manager, switch to "Timeline Banners Mode". You can add up to 10+ distinct banner pairs for specific time intervals (e.g., 0-6s, 6-12s, 12-18s) with instant auto-divide presets and an interactive timeline ribbon to switch banners dynamically during video playback.',
  },
  {
    question: 'Are my videos uploaded to any external server or cloud?',
    answer:
      'No! SplitStream operates 100% locally in your web browser using WebAssembly (FFmpeg WASM). Your video data never leaves your computer, ensuring absolute privacy, zero bandwidth usage, and complete confidentiality for proprietary, sensitive, or personal content.',
  },
  {
    question: 'What video file formats are supported?',
    answer:
      'SplitStream supports MP4, MOV, MKV, AVI, WebM, M4V, FLV, and all common video containers and codecs (H.264, H.265, VP8, VP9, ProRes). Stream copy is available for MP4 containers, while universal re-encoding guarantees compatibility for all formats.',
  },
  {
    question: 'Can I save all split clips directly to a folder on my computer?',
    answer:
      'Yes! By using the native File System Access API in modern browsers (Chrome, Edge), you can click "Save to New Folder" and SplitStream will create a dedicated timestamped folder on your computer and save each clip directly. You can also download all clips in a single ZIP file with one click.',
  },
  {
    question: 'Is there any watermark on exported videos?',
    answer:
      'No, SplitStream does not add any watermarks, logos, or branding to your exported video clips. All outputs remain in pristine, 100% original quality.',
  },
  {
    question: 'Is SplitStream free to use?',
    answer:
      'Yes, SplitStream is 100% free and open to everyone with no subscriptions, paywalls, limits on file length, or registration required.',
  },
];

const COMPARISON_DATA = [
  {
    feature: 'Cloud Upload Required',
    splitstream: 'No (100% In-Browser)',
    splitstreamGood: true,
    cloud: 'Yes (Must upload entire file)',
    cloudGood: false,
  },
  {
    feature: 'File Size & Duration Limits',
    splitstream: 'Unlimited (Uses your device RAM)',
    splitstreamGood: true,
    cloud: 'Capped at 250MB–500MB on free tiers',
    cloudGood: false,
  },
  {
    feature: 'Data Privacy & Security',
    splitstream: '100% Private (Never leaves device)',
    splitstreamGood: true,
    cloud: 'Stored on 3rd-party servers',
    cloudGood: false,
  },
  {
    feature: 'Watermarks',
    splitstream: 'Zero Watermark (100% Clean)',
    splitstreamGood: true,
    cloud: 'Large watermark on free exports',
    cloudGood: false,
  },
  {
    feature: 'Pricing & Subscriptions',
    splitstream: '100% Free Forever',
    splitstreamGood: true,
    cloud: '$16 – $24 per month',
    cloudGood: false,
  },
  {
    feature: 'Cutting Speed (Stream Copy)',
    splitstream: 'Instant (Milliseconds without re-encode)',
    splitstreamGood: true,
    cloud: 'Queue time + Slow re-encoding',
    cloudGood: false,
  },
  {
    feature: '16:9 to 9:16 Shorts with Banners',
    splitstream: 'Included with live timeline sliders',
    splitstreamGood: true,
    cloud: 'Requires Pro / Paid tier',
    cloudGood: false,
  },
  {
    feature: 'Direct Folder Export',
    splitstream: 'Direct save to PC folder (File System API)',
    splitstreamGood: true,
    cloud: 'Manual one-by-one web downloads',
    cloudGood: false,
  },
];

export const SeoContentSection: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="w-full mt-20 pt-16 border-t border-slate-800/80 space-y-20 text-slate-300">
      {/* 1. Section Header & AEO Direct Answer Target */}
      <div className="text-center max-w-4xl mx-auto space-y-4 px-4">
        <a
          href="https://www.reeyanshtech.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 text-orange-400 hover:text-orange-300 text-xs font-semibold uppercase tracking-wider transition-all group cursor-pointer shadow-sm"
          title="Visit Reeyansh Tech Solutions Official Website"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
          <span>Engineered by Reeyansh Tech Solutions</span>
          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Complete In-Browser Video Cutting, Splitting & 9:16 Shorts Suite
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-3xl mx-auto leading-relaxed">
          SplitStream delivers studio-grade multimedia processing right in your browser. No file size limits imposed by cloud servers, no subscriptions, zero watermarks, and complete data sovereignty.
        </p>
      </div>

      {/* 2. AEO Quick Direct Answer Cards (Optimized for AI Search, SearchGPT, Perplexity & Google AI Overviews) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/80 border border-slate-800 shadow-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Direct Answer: Video Splitting</span>
            </div>
            <h3 className="text-base font-bold text-white">How do I split a video into parts for free?</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Upload your file to SplitStream and select either <strong>Split by Pieces</strong> (equal slices), <strong>Split by Duration</strong> (e.g. 30s for WhatsApp / 60s for Shorts), or <strong>Cut Min to Min</strong>. SplitStream slices the file inside your browser without uploading to external servers, yielding instant zero-loss downloads.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/80 border border-slate-800 shadow-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Direct Answer: 9:16 Shorts</span>
            </div>
            <h3 className="text-base font-bold text-white">How to convert 16:9 landscape to 9:16 vertical?</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Select <strong>9:16 Vertical</strong> in SplitStream. Choose between <strong>Blurred Background</strong>, <strong>Center Crop</strong>, or <strong>Letterbox</strong>. Optionally attach top and bottom promotional banner cards with live height and zoom adjustment sliders for viral YouTube Shorts, TikTok, and Instagram Reels.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/80 border border-slate-800 shadow-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Direct Answer: Security & Limits</span>
            </div>
            <h3 className="text-base font-bold text-white">Is in-browser video cutting safe and private?</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Yes, 100%. SplitStream runs FFmpeg directly inside your web browser via WebAssembly (WASM). Your media never touches third-party servers, guaranteeing zero data interception, complete privacy for confidential media, and no cloud file-size restrictions.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Core Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Scissors className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Three Precise Splitting Modes</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Split by equal piece count, fixed clip duration (e.g. 30s or 60s), or exact minute-to-minute timestamps. Never lose a single frame with zero-loss remainder preservation.
          </p>
        </article>

        <article className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">16:9 to 9:16 Shorts & Reels</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Repurpose horizontal widescreen footage into high-engagement vertical content for YouTube Shorts, Instagram Reels, and TikTok with blurred backgrounds or center cropping.
          </p>
        </article>

        <article className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Promotional Cards & Multi-Banners</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Attach branded promotional cards to the top and bottom of your vertical videos with full control over heights, scaling, zoom, padding, and background color styling. Add multiple timed banners across the timeline.
          </p>
        </article>

        <article className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Lossless Stream Copy Engine</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Fast stream copy cuts files in milliseconds without re-encoding, preserving 100% of the original video and audio bitrates without any compression artifacts.
          </p>
        </article>

        <article className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FolderDown className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Direct Folder & ZIP Export</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Save all exported clips directly into a timestamped folder on your computer with the File System Access API, or bundle all clips into an organized ZIP archive.
          </p>
        </article>

        <article className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">100% Confidential & Secure</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Designed with a strict privacy-first architecture by{' '}
            <a
              href="https://www.reeyanshtech.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 font-semibold underline decoration-orange-500/40 hover:decoration-orange-400 transition-colors inline-flex items-center gap-0.5"
              title="Visit Reeyansh Tech Solutions Official Website"
            >
              <span>Reeyansh Tech Solutions</span>
              <ExternalLink className="w-2.5 h-2.5 inline-block opacity-70" />
            </a>
            . All video processing executes entirely inside your browser's WebAssembly sandbox.
          </p>
        </article>
      </div>

      {/* 4. Comparison Matrix Table (AEO / High-Intent Search Anchor) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-orange-400 text-xs font-semibold uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Comparison Matrix</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-bold text-white">
            SplitStream vs Traditional Cloud Video Cutters
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Why creators and privacy-conscious professionals prefer in-browser WebAssembly video processing over cloud-based editors.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800/90 bg-slate-900/40 shadow-2xl backdrop-blur-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-300 uppercase font-semibold tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-5">Feature / Capability</th>
                <th className="py-4 px-5 text-orange-400">SplitStream (In-Browser)</th>
                <th className="py-4 px-5 text-slate-400">Traditional Cloud Cutters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {COMPARISON_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-5 font-medium text-white flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{row.feature}</span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-emerald-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{row.splitstream}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <X className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{row.cloud}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Step-by-Step How To Guide (Schema.org HowTo Entity) */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            How to Cut and Split Videos in 3 Easy Steps
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            SplitStream makes slicing long videos as simple as a few clicks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
                1
              </span>
              <h4 className="text-sm font-semibold text-white">Select Your Video</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drag and drop any local video file (MP4, MOV, MKV, AVI, etc.) into the dropzone or click to browse. You can also generate an instant test video clip to experiment.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
                2
              </span>
              <h4 className="text-sm font-semibold text-white">Configure Your Split</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose your mode: Piece Count, Duration, or Custom Minute Ranges. Preview segments on the visual timeline ribbon and optionally select 9:16 vertical conversion.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
                3
              </span>
              <h4 className="text-sm font-semibold text-white">Export & Download</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click "Start Splitting". Preview each cut clip with the built-in player, save all clips directly to a local folder, or download as a ZIP archive.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Technical Specifications Summary */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/90 space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-400" />
            <span>Technical Specifications & Supported Formats</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <p className="text-slate-500 uppercase text-[10px] font-semibold">Video Containers</p>
              <p className="font-semibold text-slate-200 mt-1">MP4, MOV, MKV, AVI, WebM, M4V, FLV, TS</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <p className="text-slate-500 uppercase text-[10px] font-semibold">Video Codecs</p>
              <p className="font-semibold text-slate-200 mt-1">H.264 (AVC), H.265 (HEVC), VP8, VP9, ProRes</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <p className="text-slate-500 uppercase text-[10px] font-semibold">Processing Engine</p>
              <p className="font-semibold text-slate-200 mt-1">FFmpeg 0.12 WebAssembly (WASM)</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <p className="text-slate-500 uppercase text-[10px] font-semibold">Export Methods</p>
              <p className="font-semibold text-slate-200 mt-1">Direct Folder, ZIP Archive, MP4 Single</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. SEO FAQ Accordion Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-orange-400 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Common Questions</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-bold text-white">
            Frequently Asked Questions
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Everything you need to know about SplitStream by{' '}
            <a
              href="https://www.reeyanshtech.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 font-semibold underline decoration-orange-500/40 hover:decoration-orange-400 transition-colors inline-flex items-center gap-0.5"
              title="Visit Reeyansh Tech Solutions Official Website"
            >
              <span>Reeyansh Tech Solutions</span>
              <ExternalLink className="w-2.5 h-2.5 inline-block opacity-70" />
            </a>
            .
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800/90 bg-slate-900/40 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-white">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-orange-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50 bg-slate-950/20">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
