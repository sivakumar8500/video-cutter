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
];

export const SeoContentSection: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="w-full mt-16 pt-12 border-t border-slate-800/80 space-y-16 text-slate-300">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 px-4">
        <a
          href="https://www.reeyanshtech.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 text-orange-400 hover:text-orange-300 text-xs font-semibold uppercase tracking-wider transition-all group cursor-pointer"
          title="Visit Reeyansh Tech Solutions Official Website"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
          <span>Engineered by Reeyansh Tech Solutions</span>
          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Complete In-Browser Video Cutting & Shorts Suite
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          SplitStream delivers studio-grade multimedia processing right in your browser. No file size limits imposed by cloud servers, no subscriptions, and complete data sovereignty.
        </p>
      </div>

      {/* Feature Grid */}
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
          <h3 className="text-base font-bold text-white">Promotional Banners & Cards</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Attach branded promotional cards to the top and bottom of your vertical videos with full control over heights, scaling, zoom, padding, and background color styling.
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

      {/* Step-by-Step How To Guide */}
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

      {/* SEO FAQ Accordion Section */}
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
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 bg-slate-950/20">
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
