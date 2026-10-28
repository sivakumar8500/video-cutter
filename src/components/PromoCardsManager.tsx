import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  Trash2,
  Smartphone,
  Image as ImageIcon,
  Sliders,
  RotateCcw,
  Palette,
  Clock,
  Layers,
  Plus,
  Play,
  Pause,
  Link2,
  Unlink,
  CheckCircle2,
} from 'lucide-react';
import type { CardAdjustments, PromoCardsConfig, TimedBannerSlot } from '../types';
import {
  createPromoCardFromFile,
  generateTextPromoCard,
} from '../utils/promoCardGenerator';
import { formatTime } from '../utils/formatters';

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
  totalDuration?: number;
  currentPlayheadTime?: number;
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
  totalDuration = 60,
  currentPlayheadTime = 0,
}) => {
  const topInputRef = useRef<HTMLInputElement>(null);
  const bottomInputRef = useRef<HTMLInputElement>(null);
  const slotFileInputRef = useRef<HTMLInputElement>(null);

  const [showAdjustments, setShowAdjustments] = useState(false);
  const [activeTimelinePosition, setActiveTimelinePosition] = useState<'top' | 'bottom'>('top');
  const [syncTopBottomTimes, setSyncTopBottomTimes] = useState(true);
  const [activeSlotTarget, setActiveSlotTarget] = useState<{
    position: 'top' | 'bottom';
    slotId: string;
  } | null>(null);

  // Live Phone Scrubber
  const duration = totalDuration > 0 ? totalDuration : 60;
  const [previewPlayhead, setPreviewPlayhead] = useState(currentPlayheadTime);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Text Template Modal
  const [templateTarget, setTemplateTarget] = useState<{
    position: 'top' | 'bottom';
    slotId?: string; // undefined if static
  } | null>(null);
  const [templateMainText, setTemplateMainText] = useState('🔥 WAIT TILL THE END');
  const [templateSubText, setTemplateSubText] = useState('👉 FOLLOW FOR PART 2');
  const [templateTheme, setTemplateTheme] = useState<'fire' | 'gradient' | 'neon' | 'dark'>('gradient');

  const bannerMode = config.bannerMode || 'static';
  const adjustments = config.adjustments || DEFAULT_CARD_ADJUSTMENTS;

  // Sync incoming playhead
  useEffect(() => {
    if (!isPlayingPreview) {
      setPreviewPlayhead(currentPlayheadTime);
    }
  }, [currentPlayheadTime, isPlayingPreview]);

  // Live playhead ticker
  useEffect(() => {
    let timer: number | null = null;
    if (isPlayingPreview) {
      timer = window.setInterval(() => {
        setPreviewPlayhead((prev) => {
          if (prev >= duration) {
            setIsPlayingPreview(false);
            return 0;
          }
          return Math.min(duration, Number((prev + 0.25).toFixed(2)));
        });
      }, 250);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingPreview, duration]);

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

  // Single card uploads
  const handleSingleFileUpload = (file: File, position: 'top' | 'bottom') => {
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

  // Timed slot file upload
  const handleSlotFileUpload = (file: File) => {
    if (!activeSlotTarget) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }
    const card = createPromoCardFromFile(file);
    const { position, slotId } = activeSlotTarget;
    const targetSlots = (position === 'top' ? config.topSlots || [] : config.bottomSlots || []).map((s) =>
      s.id === slotId ? { ...s, card } : s
    );
    onChange({
      ...config,
      [position === 'top' ? 'topSlots' : 'bottomSlots']: targetSlots,
    });
    setActiveSlotTarget(null);
  };

  // Auto-Divide Timeline
  const handleAutoDivide = (count: number) => {
    const validCount = Math.max(2, Math.min(50, count));
    const step = duration / validCount;

    const newTopSlots: TimedBannerSlot[] = [];
    const newBottomSlots: TimedBannerSlot[] = [];

    for (let i = 0; i < validCount; i++) {
      const start = Number((i * step).toFixed(2));
      const end = Number((i === validCount - 1 ? duration : (i + 1) * step).toFixed(2));
      const id = `slot_${Date.now()}_${i}`;
      newTopSlots.push({
        id: `top_${id}`,
        start,
        end,
        card: null,
        label: `Top Banner #${i + 1}`,
      });
      newBottomSlots.push({
        id: `bot_${id}`,
        start,
        end,
        card: null,
        label: `Bottom Banner #${i + 1}`,
      });
    }

    onChange({
      ...config,
      bannerMode: 'timeline',
      topSlots: newTopSlots,
      bottomSlots: newBottomSlots,
    });
  };

  // Add individual slot
  const handleAddSlot = (position: 'top' | 'bottom') => {
    const slots = position === 'top' ? config.topSlots || [] : config.bottomSlots || [];
    const last = slots[slots.length - 1];
    let start = 0;
    let end = Math.min(duration, 6);
    if (last) {
      start = last.end;
      end = Math.min(duration, start + 6);
    }
    const newSlot: TimedBannerSlot = {
      id: `${position}_slot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      start,
      end,
      card: null,
      label: `Banner #${slots.length + 1}`,
    };

    if (syncTopBottomTimes) {
      const otherSlots = position === 'top' ? config.bottomSlots || [] : config.topSlots || [];
      const pairedSlot: TimedBannerSlot = {
        id: `${position === 'top' ? 'bot' : 'top'}_slot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        start,
        end,
        card: null,
        label: `Banner #${otherSlots.length + 1}`,
      };
      onChange({
        ...config,
        topSlots: position === 'top' ? [...slots, newSlot] : [...otherSlots, pairedSlot],
        bottomSlots: position === 'top' ? [...otherSlots, pairedSlot] : [...slots, newSlot],
      });
    } else {
      onChange({
        ...config,
        [position === 'top' ? 'topSlots' : 'bottomSlots']: [...slots, newSlot],
      });
    }
  };

  // Remove slot
  const handleRemoveSlot = (position: 'top' | 'bottom', id: string, index: number) => {
    if (syncTopBottomTimes) {
      const topSlots = (config.topSlots || []).filter((_, idx) => idx !== index);
      const bottomSlots = (config.bottomSlots || []).filter((_, idx) => idx !== index);
      onChange({
        ...config,
        topSlots,
        bottomSlots,
      });
    } else {
      const current = position === 'top' ? config.topSlots || [] : config.bottomSlots || [];
      onChange({
        ...config,
        [position === 'top' ? 'topSlots' : 'bottomSlots']: current.filter((s) => s.id !== id),
      });
    }
  };

  // Update slot time
  const handleUpdateSlotTime = (
    position: 'top' | 'bottom',
    index: number,
    start: number,
    end: number
  ) => {
    const targetSlots = [...(position === 'top' ? config.topSlots || [] : config.bottomSlots || [])];
    if (!targetSlots[index]) return;
    targetSlots[index] = {
      ...targetSlots[index],
      start: Math.max(0, start),
      end: Math.max(start + 0.1, end),
    };

    if (syncTopBottomTimes) {
      const otherSlots = [...(position === 'top' ? config.bottomSlots || [] : config.topSlots || [])];
      if (otherSlots[index]) {
        otherSlots[index] = {
          ...otherSlots[index],
          start: Math.max(0, start),
          end: Math.max(start + 0.1, end),
        };
      }
      onChange({
        ...config,
        topSlots: position === 'top' ? targetSlots : otherSlots,
        bottomSlots: position === 'top' ? otherSlots : targetSlots,
      });
    } else {
      onChange({
        ...config,
        [position === 'top' ? 'topSlots' : 'bottomSlots']: targetSlots,
      });
    }
  };

  // Generate Template
  const handleGenerateTemplate = async () => {
    if (!templateTarget) return;
    const card = await generateTextPromoCard(templateMainText, templateSubText, templateTheme);
    if (!templateTarget.slotId) {
      // Single card mode
      if (templateTarget.position === 'top') {
        onChange({ ...config, topCard: card });
      } else {
        onChange({ ...config, bottomCard: card });
      }
    } else {
      // Slot mode
      const pos = templateTarget.position;
      const targetSlots = (pos === 'top' ? config.topSlots || [] : config.bottomSlots || []).map((s) =>
        s.id === templateTarget.slotId ? { ...s, card } : s
      );
      onChange({
        ...config,
        [pos === 'top' ? 'topSlots' : 'bottomSlots']: targetSlots,
      });
    }
    setTemplateTarget(null);
  };

  // Active slots for current playhead
  const topSlots = config.topSlots || [];
  const bottomSlots = config.bottomSlots || [];

  const activeTopSlot = topSlots.find(
    (s) => previewPlayhead >= s.start && previewPlayhead < s.end
  );
  const activeBottomSlot = bottomSlots.find(
    (s) => previewPlayhead >= s.start && previewPlayhead < s.end
  );

  const activeTopCard =
    bannerMode === 'timeline'
      ? activeTopSlot?.card || null
      : config.topCard;

  const activeBottomCard =
    bannerMode === 'timeline'
      ? activeBottomSlot?.card || null
      : config.bottomCard;

  // Percentages for live phone preview
  const topPct = (adjustments.topHeight / 1920) * 100;
  const botPct = (adjustments.bottomHeight / 1920) * 100;
  const midPct = 100 - topPct - botPct;

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={topInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleSingleFileUpload(file, 'top');
        }}
      />
      <input
        ref={bottomInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleSingleFileUpload(file, 'bottom');
        }}
      />
      <input
        ref={slotFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleSlotFileUpload(file);
        }}
      />

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
                Promotional Banners (9:16 Vertical)
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Single or Multi-Timed
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Attach top & bottom promotional banners. Switch dynamically across the video timeline (e.g. 0-6s, 6-12s, 10 banners).
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
              <span>{showAdjustments ? 'Hide Adjustments' : 'Adjust Layout'}</span>
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
            {config.enabled ? 'Banners Active ✓' : 'Enable 9:16 Banners'}
          </button>
        </div>
      </div>

      {config.enabled && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Mode Switcher Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => onChange({ ...config, bannerMode: 'static' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  bannerMode === 'static'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Single Banner (Full Video)
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated: PromoCardsConfig = {
                    ...config,
                    bannerMode: 'timeline',
                  };
                  if (!config.topSlots || config.topSlots.length === 0) {
                    const step = duration / 10;
                    const defaultTop: TimedBannerSlot[] = [];
                    const defaultBot: TimedBannerSlot[] = [];
                    for (let i = 0; i < 10; i++) {
                      const start = Number((i * step).toFixed(2));
                      const end = Number((i === 9 ? duration : (i + 1) * step).toFixed(2));
                      const id = `slot_${Date.now()}_${i}`;
                      defaultTop.push({ id: `top_${id}`, start, end, card: null, label: `Banner #${i + 1}` });
                      defaultBot.push({ id: `bot_${id}`, start, end, card: null, label: `Banner #${i + 1}` });
                    }
                    updated.topSlots = defaultTop;
                    updated.bottomSlots = defaultBot;
                  }
                  onChange(updated);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  bannerMode === 'timeline'
                    ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Multiple Timed Banners (Timeline)</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-500/30 text-pink-200">
                  New
                </span>
              </button>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Video Duration: <strong className="text-white font-mono">{formatTime(duration)}</strong></span>
            </div>
          </div>

          {/* Main Grid: Left = Card Configuration, Right = Live 9:16 Phone Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 rounded-3xl bg-slate-950/60 border border-slate-800">
            {/* Left Column: Card Configuration */}
            <div className="lg:col-span-8 space-y-4">
              {/* MODE A: SINGLE STATIC BANNER */}
              {bannerMode === 'static' && (
                <div className="space-y-4">
                  {/* Top Card */}
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
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>

                    {config.topCard ? (
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                        <img
                          src={config.topCard.previewUrl}
                          alt="Top Promo Card"
                          className="w-20 h-12 object-cover rounded-lg border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white truncate">{config.topCard.name}</p>
                          <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Ready for top overlay
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => topInputRef.current?.click()}
                          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => topInputRef.current?.click()}
                          className="flex-1 py-3 px-3 rounded-xl border border-dashed border-slate-700 hover:border-pink-500/50 bg-slate-950/40 hover:bg-slate-900/60 transition flex items-center justify-center gap-2 text-xs text-slate-300 cursor-pointer"
                        >
                          <Upload className="w-4 h-4 text-pink-400" />
                          <span>Upload Top Banner Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplateTarget({ position: 'top' })}
                          className="py-3 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Style Template</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bottom Card */}
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
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>

                    {config.bottomCard ? (
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                        <img
                          src={config.bottomCard.previewUrl}
                          alt="Bottom Promo Card"
                          className="w-20 h-12 object-cover rounded-lg border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white truncate">{config.bottomCard.name}</p>
                          <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Ready for bottom overlay
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => bottomInputRef.current?.click()}
                          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => bottomInputRef.current?.click()}
                          className="flex-1 py-3 px-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/50 bg-slate-950/40 hover:bg-slate-900/60 transition flex items-center justify-center gap-2 text-xs text-slate-300 cursor-pointer"
                        >
                          <Upload className="w-4 h-4 text-indigo-400" />
                          <span>Upload Bottom Banner Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplateTarget({ position: 'bottom' })}
                          className="py-3 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Style Template</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MODE B: MULTIPLE TIMED BANNERS (TIMELINE) */}
              {bannerMode === 'timeline' && (
                <div className="space-y-4">
                  {/* Auto-Divide Bar */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-950/30 via-slate-900 to-indigo-950/30 border border-pink-500/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        <span>⚡ Quick Auto-Divide Banners across Video Timeline</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Duration: {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAutoDivide(10)}
                        className="px-3 py-1.5 rounded-xl bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 text-pink-200 text-xs font-semibold transition cursor-pointer"
                      >
                        10 Banners (0-6s, 6-12s...)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoDivide(5)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                      >
                        5 Banners (Equal)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoDivide(Math.max(2, Math.round(duration / 5)))}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                      >
                        Every 5 Seconds
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoDivide(Math.max(2, Math.round(duration / 10)))}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                      >
                        Every 10 Seconds
                      </button>
                    </div>
                  </div>

                  {/* Subtabs for Top vs Bottom Banners & Sync Switch */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTimelinePosition('top')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          activeTimelinePosition === 'top'
                            ? 'bg-pink-600 text-white shadow-md'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>Top Banners ({topSlots.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTimelinePosition('bottom')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          activeTimelinePosition === 'bottom'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>Bottom Banners ({bottomSlots.length})</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSyncTopBottomTimes(!syncTopBottomTimes)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                        syncTopBottomTimes
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                      title="Keep start & end times aligned between top and bottom slots"
                    >
                      {syncTopBottomTimes ? <Link2 className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
                      <span>{syncTopBottomTimes ? 'Times Synced (Top & Bottom)' : 'Independent Times'}</span>
                    </button>
                  </div>

                  {/* Interactive Visual Timeline Ribbon */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Timeline Visual Map ({activeTimelinePosition === 'top' ? 'Top' : 'Bottom'})</span>
                      <span className="font-mono">Current Playhead: {formatTime(previewPlayhead)}</span>
                    </div>

                    <div className="relative w-full h-8 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex">
                      {(activeTimelinePosition === 'top' ? topSlots : bottomSlots).map((slot, idx) => {
                        const slotWidthPct = ((slot.end - slot.start) / duration) * 100;
                        const isCurrentActive = previewPlayhead >= slot.start && previewPlayhead < slot.end;
                        const hasImage = !!slot.card;

                        return (
                          <div
                            key={slot.id}
                            onClick={() => setPreviewPlayhead(slot.start)}
                            style={{ width: `${Math.max(1, slotWidthPct)}%` }}
                            className={`h-full border-r border-slate-950 flex flex-col justify-center px-1 transition-all cursor-pointer relative ${
                              isCurrentActive
                                ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white'
                                : hasImage
                                ? 'bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200'
                                : 'bg-slate-800/70 hover:bg-slate-700/80 text-slate-400'
                            }`}
                            title={`Slot #${idx + 1}: ${formatTime(slot.start)} - ${formatTime(slot.end)}${
                              hasImage ? ` (${slot.card?.name})` : ' (empty)'
                            }`}
                          >
                            <span className="text-[10px] font-bold truncate">#{idx + 1}</span>
                          </div>
                        );
                      })}

                      {/* Playhead Marker */}
                      <div
                        style={{ left: `${(previewPlayhead / duration) * 100}%` }}
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-10"
                      />
                    </div>
                  </div>

                  {/* List of Slots for active position */}
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {(activeTimelinePosition === 'top' ? topSlots : bottomSlots).map((slot, index) => {
                      const isActive = previewPlayhead >= slot.start && previewPlayhead < slot.end;

                      return (
                        <div
                          key={slot.id}
                          className={`p-3 rounded-2xl border transition-all ${
                            isActive
                              ? 'bg-slate-900/90 border-pink-500/60 shadow-lg shadow-pink-500/10'
                              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            {/* Slot Index and Time Inputs */}
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                  isActive
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                #{index + 1}
                              </span>

                              <div className="flex items-center gap-1 text-xs font-mono">
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  max={duration}
                                  value={slot.start}
                                  onChange={(e) =>
                                    handleUpdateSlotTime(
                                      activeTimelinePosition,
                                      index,
                                      parseFloat(e.target.value) || 0,
                                      slot.end
                                    )
                                  }
                                  className="w-14 px-1.5 py-1 rounded-md bg-slate-950 border border-slate-700 text-center text-white"
                                />
                                <span className="text-slate-500">s to</span>
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0.1"
                                  max={duration}
                                  value={slot.end}
                                  onChange={(e) =>
                                    handleUpdateSlotTime(
                                      activeTimelinePosition,
                                      index,
                                      slot.start,
                                      parseFloat(e.target.value) || 0.1
                                    )
                                  }
                                  className="w-14 px-1.5 py-1 rounded-md bg-slate-950 border border-slate-700 text-center text-white"
                                />
                                <span className="text-slate-500">s</span>
                                <span className="text-[10px] text-indigo-400 ml-1">
                                  ({(slot.end - slot.start).toFixed(1)}s)
                                </span>
                              </div>
                            </div>

                            {/* Slot Card Actions */}
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              {slot.card ? (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={slot.card.previewUrl}
                                    alt={slot.card.name}
                                    className="w-12 h-7 object-cover rounded border border-slate-700"
                                  />
                                  <span className="text-xs text-white max-w-[100px] truncate hidden md:inline">
                                    {slot.card.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveSlotTarget({
                                        position: activeTimelinePosition,
                                        slotId: slot.id,
                                      });
                                      slotFileInputRef.current?.click();
                                    }}
                                    className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
                                  >
                                    Replace
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const pos = activeTimelinePosition;
                                      const slots = (pos === 'top' ? config.topSlots || [] : config.bottomSlots || []).map((s) =>
                                        s.id === slot.id ? { ...s, card: null } : s
                                      );
                                      onChange({
                                        ...config,
                                        [pos === 'top' ? 'topSlots' : 'bottomSlots']: slots,
                                      });
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-400 rounded cursor-pointer"
                                    title="Remove Image"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveSlotTarget({
                                        position: activeTimelinePosition,
                                        slotId: slot.id,
                                      });
                                      slotFileInputRef.current?.click();
                                    }}
                                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <Upload className="w-3 h-3 text-pink-400" />
                                    <span>Upload</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setTemplateTarget({
                                        position: activeTimelinePosition,
                                        slotId: slot.id,
                                      })
                                    }
                                    className="px-2 py-1 text-xs rounded-lg bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    <span>Template</span>
                                  </button>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveSlot(activeTimelinePosition, slot.id, index)}
                                className="p-1 text-slate-500 hover:text-red-400 rounded cursor-pointer ml-1"
                                title="Delete this slot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Slot Button */}
                  <button
                    type="button"
                    onClick={() => handleAddSlot(activeTimelinePosition)}
                    className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-pink-500/50 bg-slate-900/40 hover:bg-slate-900/70 text-xs text-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
                  >
                    <Plus className="w-4 h-4 text-pink-400" />
                    <span>+ Add Another Banner Time Slot</span>
                  </button>
                </div>
              )}

              {/* Adjustments Panel (Collapsible) */}
              {showAdjustments && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Card Layout & Styling Adjustments</span>
                    </span>
                    <button
                      type="button"
                      onClick={resetAdjustments}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Fit Mode */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Card Fit Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateAdjustments({ fitMode: 'cover' })}
                          className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition cursor-pointer ${
                            adjustments.fitMode === 'cover'
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          Cover (Fill)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAdjustments({ fitMode: 'contain' })}
                          className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition cursor-pointer ${
                            adjustments.fitMode === 'contain'
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          Contain (Fit)
                        </button>
                      </div>
                    </div>

                    {/* Background Color */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                        <Palette className="w-3 h-3" /> Background Color
                      </label>
                      <div className="flex items-center gap-1.5">
                        {COLOR_PRESETS.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => updateAdjustments({ backgroundColor: c.hex })}
                            style={{ backgroundColor: c.hex }}
                            className={`w-6 h-6 rounded-full border transition cursor-pointer ${
                              adjustments.backgroundColor === c.hex
                                ? 'ring-2 ring-indigo-400 border-white'
                                : 'border-slate-700'
                            }`}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Top Height */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Top Height</span>
                        <span className="font-mono text-indigo-400">{adjustments.topHeight}px</span>
                      </div>
                      <input
                        type="range"
                        min="250"
                        max="750"
                        step="10"
                        value={adjustments.topHeight}
                        onChange={(e) => updateAdjustments({ topHeight: parseInt(e.target.value) })}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    {/* Bottom Height */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Bottom Height</span>
                        <span className="font-mono text-indigo-400">{adjustments.bottomHeight}px</span>
                      </div>
                      <input
                        type="range"
                        min="250"
                        max="750"
                        step="10"
                        value={adjustments.bottomHeight}
                        onChange={(e) => updateAdjustments({ bottomHeight: parseInt(e.target.value) })}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Live 9:16 Phone Mockup with Playhead Sync */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <div className="text-center mb-2">
                <span className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                  <span>Live 9:16 Phone Preview</span>
                </span>
                <p className="text-[10px] text-slate-400">
                  {bannerMode === 'timeline' ? 'Scrub or play to test timed switches' : 'Real-time card placement'}
                </p>
              </div>

              {/* Phone Frame */}
              <div
                style={{ backgroundColor: adjustments.backgroundColor }}
                className="w-[200px] sm:w-[220px] aspect-[9/16] rounded-[28px] border-4 border-slate-700 shadow-2xl relative overflow-hidden flex flex-col"
              >
                {/* Dynamic Top Card */}
                <div
                  style={{ height: `${topPct}%` }}
                  className="w-full relative overflow-hidden flex items-center justify-center border-b border-slate-800/50 transition-all duration-150"
                >
                  {activeTopCard ? (
                    <img
                      src={activeTopCard.previewUrl}
                      alt="Top Preview"
                      style={{ transform: `scale(${adjustments.topZoom})` }}
                      className={`w-full h-full ${
                        adjustments.fitMode === 'cover' ? 'object-cover' : 'object-contain'
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-950/40">
                      <ImageIcon className="w-4 h-4 text-slate-600 mb-1" />
                      <span className="text-[9px] text-slate-500 font-medium">Top Banner</span>
                    </div>
                  )}
                  {bannerMode === 'timeline' && activeTopSlot && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/70 text-[8px] font-mono text-pink-300">
                      #{topSlots.indexOf(activeTopSlot) + 1}
                    </span>
                  )}
                </div>

                {/* Center 16:9 Video Footage */}
                <div
                  style={{ height: `${midPct}%` }}
                  className="w-full relative flex items-center justify-center overflow-hidden bg-black/60"
                >
                  {videoPreviewUrl ? (
                    <video
                      src={videoPreviewUrl}
                      className="w-full h-full object-contain pointer-events-none"
                      muted
                      loop
                    />
                  ) : (
                    <div className="text-center p-2">
                      <span className="text-[9px] text-slate-400 font-medium">16:9 Video Middle</span>
                    </div>
                  )}
                </div>

                {/* Dynamic Bottom Card */}
                <div
                  style={{ height: `${botPct}%` }}
                  className="w-full relative overflow-hidden flex items-center justify-center border-t border-slate-800/50 transition-all duration-150"
                >
                  {activeBottomCard ? (
                    <img
                      src={activeBottomCard.previewUrl}
                      alt="Bottom Preview"
                      style={{ transform: `scale(${adjustments.bottomZoom})` }}
                      className={`w-full h-full ${
                        adjustments.fitMode === 'cover' ? 'object-cover' : 'object-contain'
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-950/40">
                      <ImageIcon className="w-4 h-4 text-slate-600 mb-1" />
                      <span className="text-[9px] text-slate-500 font-medium">Bottom Banner</span>
                    </div>
                  )}
                  {bannerMode === 'timeline' && activeBottomSlot && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/70 text-[8px] font-mono text-indigo-300">
                      #{bottomSlots.indexOf(activeBottomSlot) + 1}
                    </span>
                  )}
                </div>
              </div>

              {/* Timeline Mode Scrubber and Play Controls */}
              {bannerMode === 'timeline' && (
                <div className="w-full max-w-[220px] mt-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/50 cursor-pointer"
                    >
                      {isPlayingPreview ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{isPlayingPreview ? 'Pause' : 'Play'}</span>
                    </button>
                    <span className="font-mono text-slate-300">
                      {formatTime(previewPlayhead)} / {formatTime(duration)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={duration}
                    step="0.5"
                    value={previewPlayhead}
                    onChange={(e) => {
                      setIsPlayingPreview(false);
                      setPreviewPlayhead(parseFloat(e.target.value));
                    }}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Styled Text Template Modal */}
      {templateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  Style Custom Text Banner (
                  {templateTarget.position === 'top' ? 'Top' : 'Bottom'})
                </span>
              </h4>
              <button
                type="button"
                onClick={() => setTemplateTarget(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Main Headline Text</label>
                <input
                  type="text"
                  value={templateMainText}
                  onChange={(e) => setTemplateMainText(e.target.value)}
                  placeholder="e.g. 🔥 WAIT TILL THE END"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Subtitle / Call to Action</label>
                <input
                  type="text"
                  value={templateSubText}
                  onChange={(e) => setTemplateSubText(e.target.value)}
                  placeholder="e.g. 👉 FOLLOW FOR PART 2"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Visual Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['gradient', 'fire', 'neon', 'dark'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTemplateTheme(t)}
                      className={`py-1.5 rounded-lg text-xs font-semibold capitalize border transition cursor-pointer ${
                        templateTheme === t
                          ? 'bg-pink-600 border-pink-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTemplateTarget(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateTemplate}
                className="px-4 py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:opacity-95 shadow-md shadow-pink-500/20 cursor-pointer"
              >
                Generate & Apply Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
