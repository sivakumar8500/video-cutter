import React, { useRef, useState } from 'react';
import {
  Upload,
  Sparkles,
  Trash2,
  Smartphone,
  Image as ImageIcon,
  Sliders,
  RotateCcw,
  Palette,
} from 'lucide-react';
import type { CardAdjustments, PromoCardsConfig } from '../types';
import {
  createPromoCardFromFile,
  generateTextPromoCard,
} from '../utils/promoCardGenerator';

export const DEFAULT_CARD_ADJUSTMENTS: CardAdjustments = {
  fitMode: 'cover',
  topHeight: 656,
  bottomHeight: 656,
  backgroundColor: '#000000',
  videoPadding: 0,
  topZoom: 1,
  bottomZoom: 1,
};

interface PromoCardsManagerProps {
  config: PromoCardsConfig;
  onChange: (updated: PromoCardsConfig) => void;
  videoPreviewUrl?: string;
}

const COLOR_PRESETS = [
  { label: 'Black', hex: '#000000' },
  { label: 'Charcoal', hex: '#0b0f19' },
  { label: 'Slate', hex: '#0f172a' },
  { label: 'Dark Red', hex: '#450a0a' },
  { label: 'Dark Purple', hex: '#2e1065' },
  { label: 'Dark Blue', hex: '#082f49' },
  { label: 'White', hex: '#ffffff' },
];

export const PromoCardsManager: React.FC<PromoCardsManagerProps> = ({
  config,
  onChange,
  videoPreviewUrl,
}) => {
  const topInputRef = useRef<HTMLInputElement>(null);
  const bottomInputRef = useRef<HTMLInputElement>(null);
  const [showAdjustments, setShowAdjustments] = useState(false);

  const adjustments = config.adjustments || DEFAULT_CARD_ADJUSTMENTS;

  const updateAdjustments = (partial: Partial<CardAdjustments>) => {
    onChange({
      ...config,
      adjustments: {
        ...adjustments,
        ...partial,
      },
    });
  };

  const resetAdjustments = () => {
    updateAdjustments(DEFAULT_CARD_ADJUSTMENTS);
  };

  const handleFileUpload = (file: File, position: 'top' | 'bottom') => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }
    const card = createPromoCardFromFile(file);
    if (position === 'top') {
      onChange({ ...config, topCard: card });
    } else {
      onChange({ ...config, bottomCard: card });
    }
  };

  const handleApplyPresetPair = async (
    topText: string,
    topSub: string,
    botText: string,
    botSub: string,
    theme: 'fire' | 'dark' | 'gradient' | 'neon'
  ) => {
    const top = await generateTextPromoCard(topText, topSub, theme);
    const bottom = await generateTextPromoCard(botText, botSub, theme);
    onChange({
      ...config,
      enabled: true,
      topCard: top,
      bottomCard: bottom,
      adjustments: config.adjustments || DEFAULT_CARD_ADJUSTMENTS,
    });
  };

  // Percentages for live phone preview
  const topPct = (adjustments.topHeight / 1920) * 100;
  const botPct = (adjustments.bottomHeight / 1920) * 100;
  const midPct = 100 - topPct - botPct;

  return (
    <div className="space-y-4">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-500 p-0.5 shadow-sm">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-pink-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Attach Top & Bottom Promotional Cards
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Viral 9:16 Style
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Stack promotional banners at top and bottom, with video in the middle and full adjustment controls.
            </p>
          </div>
        </div>

        {/* Toggle Enable/Disable & Adjustments button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {config.enabled && (
            <button
              type="button"
              onClick={() => setShowAdjustments(!showAdjustments)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                showAdjustments
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showAdjustments ? 'Hide Adjustments' : 'Adjust Cards'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              onChange({
                ...config,
                enabled: !config.enabled,
                adjustments: config.adjustments || DEFAULT_CARD_ADJUSTMENTS,
              })
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              config.enabled
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md shadow-pink-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {config.enabled ? 'Cards Enabled ✓' : 'Enable Promo Cards'}
          </button>
        </div>
      </div>

      {config.enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 rounded-3xl bg-slate-950/60 border border-slate-800 animate-in fade-in duration-200">
            {/* Left/Main Column: Upload Cards and Presets */}
            <div className="lg:col-span-8 space-y-4">
              {/* Top Card Upload Zone */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>1. Top Promotional Card</span>
                  </span>
                  {config.topCard && (
                    <button
                      type="button"
                      onClick={() => onChange({ ...config, topCard: null })}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {config.topCard ? (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <img
                      src={config.topCard.previewUrl}
                      alt="Top card preview"
                      className="w-24 h-14 object-cover rounded-lg border border-slate-800"
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-white truncate font-mono">
                        {config.topCard.name}
                      </div>
                      <span className="text-[10px] text-emerald-400">
                        Height: {adjustments.topHeight}px • Zoom: {Math.round(adjustments.topZoom * 100)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => topInputRef.current?.click()}
                    className="p-4 rounded-xl border border-dashed border-slate-700 hover:border-pink-500/60 bg-slate-950/60 hover:bg-slate-950 transition cursor-pointer flex flex-col items-center justify-center text-center"
                  >
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-300">
                      Upload Top Card Image
                    </span>
                    <span className="text-[10px] text-slate-400">
                      PNG, JPG, or WebP (Recommended: 1080 × {adjustments.topHeight})
                    </span>
                  </div>
                )}
                <input
                  ref={topInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0], 'top');
                    }
                  }}
                  className="hidden"
                />
              </div>

              {/* Bottom Card Upload Zone */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>2. Bottom Promotional Card</span>
                  </span>
                  {config.bottomCard && (
                    <button
                      type="button"
                      onClick={() => onChange({ ...config, bottomCard: null })}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {config.bottomCard ? (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <img
                      src={config.bottomCard.previewUrl}
                      alt="Bottom card preview"
                      className="w-24 h-14 object-cover rounded-lg border border-slate-800"
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-white truncate font-mono">
                        {config.bottomCard.name}
                      </div>
                      <span className="text-[10px] text-emerald-400">
                        Height: {adjustments.bottomHeight}px • Zoom: {Math.round(adjustments.bottomZoom * 100)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => bottomInputRef.current?.click()}
                    className="p-4 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-950/60 hover:bg-slate-950 transition cursor-pointer flex flex-col items-center justify-center text-center"
                  >
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-300">
                      Upload Bottom Card Image
                    </span>
                    <span className="text-[10px] text-slate-400">
                      PNG, JPG, or WebP (Recommended: 1080 × {adjustments.bottomHeight})
                    </span>
                  </div>
                )}
                <input
                  ref={bottomInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0], 'bottom');
                    }
                  }}
                  className="hidden"
                />
              </div>

              {/* Quick Template Presets */}
              <div className="pt-1">
                <span className="text-[11px] text-slate-400 font-medium block mb-2">
                  Need instant cards? Click a pre-made viral template pair:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPresetPair(
                        '🔥 WAIT TILL THE END 🔥',
                        'Shocking Twist Ahead',
                        '👉 SUBSCRIBE FOR PART 2',
                        'Drop a comment below!',
                        'fire'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-rose-400" />
                    <span>🔥 "Wait Till The End" + "Subscribe"</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPresetPair(
                        'MUST WATCH MOMENT 😱',
                        'Do not skip this part!',
                        'FOLLOW FOR MORE CONTENT',
                        'New episode every day',
                        'gradient'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>✨ "Must Watch" + "Follow For More"</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPresetPair(
                        'PART 1 OF THIS SERIES',
                        'Viral Story Breakdown',
                        'LIKE & SHARE WITH FRIENDS',
                        'Check link in description',
                        'neon'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>⚡ "Part 1" + "Like & Share"</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live 9:16 Visual Mockup Preview */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between w-full mb-2 px-1">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Live 9:16 Mockup
                </span>
                <span className="text-[10px] font-mono text-pink-400">
                  {adjustments.fitMode.toUpperCase()}
                </span>
              </div>

              {/* Mobile frame */}
              <div
                style={{ backgroundColor: adjustments.backgroundColor }}
                className="relative w-44 aspect-[9/16] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl flex flex-col transition-colors duration-150"
              >
                {/* Top card area */}
                <div
                  style={{
                    height: `${topPct}%`,
                    backgroundColor: adjustments.backgroundColor,
                  }}
                  className="w-full flex items-center justify-center overflow-hidden border-b border-white/10"
                >
                  {config.topCard ? (
                    <img
                      src={config.topCard.previewUrl}
                      alt="Top card"
                      style={{
                        objectFit: adjustments.fitMode,
                        transform: `scale(${adjustments.topZoom})`,
                      }}
                      className="w-full h-full transition-all duration-150"
                    />
                  ) : (
                    <div className="text-[9px] text-pink-400 text-center px-1 font-bold">
                      [Top Card: {adjustments.topHeight}px]
                    </div>
                  )}
                </div>

                {/* Middle 16:9 video area */}
                <div
                  style={{
                    height: `${midPct}%`,
                    padding: `${adjustments.videoPadding * 0.2}px 0`,
                  }}
                  className="w-full flex items-center justify-center overflow-hidden relative"
                >
                  {videoPreviewUrl ? (
                    <video
                      src={videoPreviewUrl}
                      className="w-full h-full object-contain"
                      muted
                      loop
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <div className="text-[9px] text-slate-400 text-center font-bold">
                      [16:9 Video Middle]
                    </div>
                  )}
                </div>

                {/* Bottom card area */}
                <div
                  style={{
                    height: `${botPct}%`,
                    backgroundColor: adjustments.backgroundColor,
                  }}
                  className="w-full flex items-center justify-center overflow-hidden border-t border-white/10"
                >
                  {config.bottomCard ? (
                    <img
                      src={config.bottomCard.previewUrl}
                      alt="Bottom card"
                      style={{
                        objectFit: adjustments.fitMode,
                        transform: `scale(${adjustments.bottomZoom})`,
                      }}
                      className="w-full h-full transition-all duration-150"
                    />
                  ) : (
                    <div className="text-[9px] text-indigo-400 text-center px-1 font-bold">
                      [Bottom Card: {adjustments.bottomHeight}px]
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Card Adjustment Controls Drawer */}
          {showAdjustments && (
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-xl space-y-5 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Card Adjustment Settings
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetAdjustments}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Default</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1. Fit Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                    <span>Card Image Fit Mode</span>
                    <span className="text-[10px] text-indigo-400 font-mono">
                      {adjustments.fitMode}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => updateAdjustments({ fitMode: 'cover' })}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                        adjustments.fitMode === 'cover'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Fill (Cover)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAdjustments({ fitMode: 'contain' })}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                        adjustments.fitMode === 'contain'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Fit (Contain)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Cover crops edges to fill banner. Fit preserves the full image without cropping.
                  </p>
                </div>

                {/* 2. Top Card Height */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-pink-300">
                      Top Card Height
                    </label>
                    <span className="text-xs font-mono font-bold text-white">
                      {adjustments.topHeight}px ({Math.round(topPct)}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={300}
                    max={750}
                    step={10}
                    value={adjustments.topHeight}
                    onChange={(e) =>
                      updateAdjustments({ topHeight: parseInt(e.target.value, 10) })
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>300px</span>
                    <span>Default: 656px</span>
                    <span>750px</span>
                  </div>
                </div>

                {/* 3. Bottom Card Height */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-indigo-300">
                      Bottom Card Height
                    </label>
                    <span className="text-xs font-mono font-bold text-white">
                      {adjustments.bottomHeight}px ({Math.round(botPct)}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={300}
                    max={750}
                    step={10}
                    value={adjustments.bottomHeight}
                    onChange={(e) =>
                      updateAdjustments({ bottomHeight: parseInt(e.target.value, 10) })
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>300px</span>
                    <span>Default: 656px</span>
                    <span>750px</span>
                  </div>
                </div>

                {/* 4. Top Card Zoom / Scale */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200">
                      Top Card Zoom
                    </label>
                    <span className="text-xs font-mono font-bold text-pink-400">
                      {Math.round(adjustments.topZoom * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.8}
                    max={1.5}
                    step={0.05}
                    value={adjustments.topZoom}
                    onChange={(e) =>
                      updateAdjustments({ topZoom: parseFloat(e.target.value) })
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>

                {/* 5. Bottom Card Zoom / Scale */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200">
                      Bottom Card Zoom
                    </label>
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      {Math.round(adjustments.bottomZoom * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.8}
                    max={1.5}
                    step={0.05}
                    value={adjustments.bottomZoom}
                    onChange={(e) =>
                      updateAdjustments({ bottomZoom: parseFloat(e.target.value) })
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* 6. Background Color Behind Cards */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Canvas Background Color</span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => updateAdjustments({ backgroundColor: color.hex })}
                        title={color.label}
                        style={{ backgroundColor: color.hex }}
                        className={`w-6 h-6 rounded-full border-2 transition transform hover:scale-110 cursor-pointer ${
                          adjustments.backgroundColor.toLowerCase() === color.hex.toLowerCase()
                            ? 'border-indigo-400 scale-110 shadow-md'
                            : 'border-slate-700'
                        }`}
                      />
                    ))}
                    <input
                      type="color"
                      value={adjustments.backgroundColor}
                      onChange={(e) => updateAdjustments({ backgroundColor: e.target.value })}
                      className="w-7 h-7 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                      title="Custom color"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
