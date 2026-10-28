import React from 'react';
import {
  Layers,
  Clock,
  Zap,
  Cpu,
  Settings2,
  Info,
  Scissors,
  Plus,
  Trash2,
  Crosshair,
  PlayCircle,
} from 'lucide-react';
import type { CustomRange, SplitConfig, SplitMode } from '../types';
import { formatTime } from '../utils/formatters';
import { PromoCardsManager, DEFAULT_CARD_ADJUSTMENTS } from './PromoCardsManager';

interface SplitConfigurationProps {
  totalDuration: number;
  config: SplitConfig;
  onChangeConfig: (newConfig: SplitConfig) => void;
  defaultBaseName: string;
  currentPlayheadTime?: number;
  onSeek?: (time: number) => void;
  videoPreviewUrl?: string;
}

export const SplitConfiguration: React.FC<SplitConfigurationProps> = ({
  totalDuration,
  config,
  onChangeConfig,
  defaultBaseName,
  currentPlayheadTime = 0,
  onSeek,
  videoPreviewUrl,
}) => {
  const handleModeChange = (mode: SplitMode) => {
    // If switching to range mode and no ranges exist, initialize with a default range
    let customRanges = config.customRanges;
    if (mode === 'range' && (!customRanges || customRanges.length === 0)) {
      const defaultEnd = Math.min(60, totalDuration);
      customRanges = [{ id: `range-${Date.now()}`, start: 0, end: defaultEnd }];
    }

    onChangeConfig({
      ...config,
      mode,
      customRanges,
    });
  };

  const handlePiecesChange = (pieces: number) => {
    const valid = Math.max(1, Math.min(100, isNaN(pieces) ? 1 : pieces));
    onChangeConfig({
      ...config,
      pieces: valid,
    });
  };

  const handleDurationSecondsChange = (seconds: number) => {
    const valid = Math.max(1, isNaN(seconds) ? 1 : seconds);
    onChangeConfig({
      ...config,
      clipDurationSeconds: valid,
    });
  };

  // Custom Range Handlers
  const handleAddRange = () => {
    const ranges = config.customRanges || [];
    const lastRange = ranges[ranges.length - 1];
    let start = 0;
    let end = Math.min(totalDuration, 60);

    if (lastRange) {
      start = Math.min(totalDuration, lastRange.end);
      end = Math.min(totalDuration, start + 60);
    }

    const newRange: CustomRange = {
      id: `range-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      start,
      end,
    };

    onChangeConfig({
      ...config,
      customRanges: [...ranges, newRange],
    });
  };

  const handleRemoveRange = (id: string) => {
    const ranges = (config.customRanges || []).filter((r) => r.id !== id);
    onChangeConfig({
      ...config,
      customRanges: ranges.length > 0 ? ranges : [{ id: `range-${Date.now()}`, start: 0, end: Math.min(60, totalDuration) }],
    });
  };

  const handleUpdateRange = (id: string, updates: Partial<CustomRange>) => {
    const ranges = (config.customRanges || []).map((r) => {
      if (r.id !== id) return r;
      const updated = { ...r, ...updates };
      // Bounds check
      updated.start = Math.max(0, Math.min(totalDuration, updated.start));
      updated.end = Math.max(0, Math.min(totalDuration, updated.end));
      return updated;
    });

    onChangeConfig({
      ...config,
      customRanges: ranges,
    });
  };

  const handleApplyPresetRange = (start: number, end: number) => {
    const validStart = Math.max(0, Math.min(totalDuration, start));
    const validEnd = Math.max(validStart + 0.1, Math.min(totalDuration, end));
    onChangeConfig({
      ...config,
      customRanges: [
        {
          id: `range-${Date.now()}`,
          start: validStart,
          end: validEnd,
        },
      ],
    });
  };

  // Presets
  const piecePresets = [2, 3, 4, 5, 8, 10];
  const durationPresets = [
    { label: '15s', sec: 15 },
    { label: '30s', sec: 30 },
    { label: '1 min', sec: 60 },
    { label: '2 min', sec: 120 },
    { label: '5 min', sec: 300 },
  ];

  // Calculations for live summary
  let summaryText = '';
  if (config.mode === 'pieces') {
    const estimatedClips = Math.max(1, config.pieces);
    const pieceSec = totalDuration / estimatedClips;
    summaryText = `Splitting into ${estimatedClips} equal clips of ${formatTime(pieceSec, true)} each.`;
  } else if (config.mode === 'duration') {
    const clipSec = Math.max(0.1, config.clipDurationSeconds);
    const estimatedClips = Math.ceil(totalDuration / clipSec);
    const fullClips = Math.floor(totalDuration / clipSec);
    const remainderSec = totalDuration % clipSec;
    const hasRemainder = remainderSec > 0.05 && fullClips > 0;

    if (hasRemainder) {
      summaryText = `Generating ${fullClips} clip${fullClips > 1 ? 's' : ''} of ${formatTime(
        clipSec
      )} plus 1 final clip of ${formatTime(remainderSec, true)}. No footage will be lost.`;
    } else {
      summaryText = `Evenly splitting into ${estimatedClips} clip${
        estimatedClips > 1 ? 's' : ''
      } of ${formatTime(clipSec)} each.`;
    }
  } else {
    const count = (config.customRanges || []).length;
    summaryText = `Extracting ${count} specific minute-to-minute cut${count > 1 ? 's' : ''} from the video.`;
  }

  return (
    <div className="w-full rounded-3xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-md shadow-2xl space-y-6">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-400" />
            <span>Splitting Configuration</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose how you want to divide or trim your video.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800 flex-wrap gap-1">
          <button
            type="button"
            onClick={() => handleModeChange('pieces')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              config.mode === 'pieces'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mode A: Pieces</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('duration')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              config.mode === 'duration'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Mode B: Duration</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('range')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              config.mode === 'range'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 -rotate-45" />
            <span>Mode C: Min to Min</span>
          </button>
        </div>
      </div>

      {/* Mode A Controls: Split by Number of Pieces */}
      {config.mode === 'pieces' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-200 block mb-1">
                Number of Pieces
              </label>
              <p className="text-xs text-slate-400">
                Divide the total video duration ({formatTime(totalDuration)}) into equal parts.
              </p>
            </div>

            {/* Stepper Input */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => handlePiecesChange(config.pieces - 1)}
                disabled={config.pieces <= 2}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-lg flex items-center justify-center border border-slate-700 transition cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={100}
                value={config.pieces}
                onChange={(e) => handlePiecesChange(parseInt(e.target.value, 10))}
                className="w-20 h-10 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono font-bold text-base text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handlePiecesChange(config.pieces + 1)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg flex items-center justify-center border border-slate-700 transition cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 mr-1">Presets:</span>
            {piecePresets.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handlePiecesChange(num)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  config.pieces === num
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {num} pieces
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode B Controls: Split by Clip Duration */}
      {config.mode === 'duration' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-200 block mb-1">
                Clip Duration
              </label>
              <p className="text-xs text-slate-400">
                Length of each clip. Any remaining portion is saved as the final clip.
              </p>
            </div>

            {/* Stepper with minutes and seconds */}
            <div className="flex items-center gap-3 self-start sm:self-center">
              {/* Minutes input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  value={Math.floor(config.clipDurationSeconds / 60)}
                  onChange={(e) => {
                    const mins = Math.max(0, parseInt(e.target.value, 10) || 0);
                    const secs = config.clipDurationSeconds % 60;
                    handleDurationSecondsChange(mins * 60 + secs);
                  }}
                  className="w-16 h-10 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-slate-400 font-medium">min</span>
              </div>

              {/* Seconds input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={Math.floor(config.clipDurationSeconds % 60)}
                  onChange={(e) => {
                    const mins = Math.floor(config.clipDurationSeconds / 60);
                    const secs = Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0));
                    handleDurationSecondsChange(mins * 60 + secs);
                  }}
                  className="w-16 h-10 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-slate-400 font-medium">sec</span>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 mr-1">Presets:</span>
            {durationPresets.map((preset) => (
              <button
                key={preset.sec}
                type="button"
                onClick={() => handleDurationSecondsChange(preset.sec)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  config.clipDurationSeconds === preset.sec
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode C Controls: Cut Specific Minutes to Minutes */}
      {config.mode === 'range' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-200 block mb-1">
                Particular Time Range (Minute to Minute)
              </label>
              <p className="text-xs text-slate-400">
                Specify exact start and end minutes/seconds to cut specific portions.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddRange}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-semibold border border-indigo-500/30 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Cut</span>
            </button>
          </div>

          {/* Ranges List */}
          <div className="space-y-3">
            {(config.customRanges || []).map((range, idx) => {
              const startMins = Math.floor(range.start / 60);
              const startSecs = Math.floor(range.start % 60);
              const endMins = Math.floor(range.end / 60);
              const endSecs = Math.floor(range.end % 60);
              const cutDuration = Math.max(0, range.end - range.start);
              const isInvalid = range.end <= range.start;

              return (
                <div
                  key={range.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isInvalid
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        Cut Segment {idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        Duration: {formatTime(cutDuration, true)}
                      </span>
                      {(config.customRanges || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRange(range.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Remove cut range"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Start & End Inputs Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    {/* Start Time Section */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Start Time
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateRange(range.id, {
                                start: Math.min(range.end - 0.5, currentPlayheadTime),
                              })
                            }
                            className="text-[10px] text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                            title={`Set to current player time (${formatTime(currentPlayheadTime)})`}
                          >
                            <Crosshair className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Set to Now ({formatTime(currentPlayheadTime)})</span>
                          </button>
                          {onSeek && (
                            <button
                              type="button"
                              onClick={() => onSeek(range.start)}
                              className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                              title="Preview start position in video"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            value={startMins}
                            onChange={(e) => {
                              const mins = Math.max(0, parseInt(e.target.value, 10) || 0);
                              handleUpdateRange(range.id, { start: mins * 60 + startSecs });
                            }}
                            className="w-14 h-9 rounded-lg bg-slate-950 border border-slate-700 text-center font-mono font-bold text-white text-sm focus:outline-none focus:border-indigo-500"
                          />
                          <span className="text-xs text-slate-400">m</span>
                        </div>
                        <span className="text-slate-400">:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={59}
                            value={startSecs}
                            onChange={(e) => {
                              const secs = Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0));
                              handleUpdateRange(range.id, { start: startMins * 60 + secs });
                            }}
                            className="w-14 h-9 rounded-lg bg-slate-950 border border-slate-700 text-center font-mono font-bold text-white text-sm focus:outline-none focus:border-indigo-500"
                          />
                          <span className="text-xs text-slate-400">s</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 ml-auto">
                          ({formatTime(range.start)})
                        </span>
                      </div>
                    </div>

                    {/* End Time Section */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                          End Time
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateRange(range.id, {
                                end: Math.max(range.start + 0.5, Math.min(totalDuration, currentPlayheadTime)),
                              })
                            }
                            className="text-[10px] text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                            title={`Set to current player time (${formatTime(currentPlayheadTime)})`}
                          >
                            <Crosshair className="w-2.5 h-2.5 text-rose-400" />
                            <span>Set to Now ({formatTime(currentPlayheadTime)})</span>
                          </button>
                          {onSeek && (
                            <button
                              type="button"
                              onClick={() => onSeek(range.end)}
                              className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                              title="Preview end position in video"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            value={endMins}
                            onChange={(e) => {
                              const mins = Math.max(0, parseInt(e.target.value, 10) || 0);
                              handleUpdateRange(range.id, { end: mins * 60 + endSecs });
                            }}
                            className="w-14 h-9 rounded-lg bg-slate-950 border border-slate-700 text-center font-mono font-bold text-white text-sm focus:outline-none focus:border-indigo-500"
                          />
                          <span className="text-xs text-slate-400">m</span>
                        </div>
                        <span className="text-slate-400">:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={59}
                            value={endSecs}
                            onChange={(e) => {
                              const secs = Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0));
                              handleUpdateRange(range.id, { end: endMins * 60 + secs });
                            }}
                            className="w-14 h-9 rounded-lg bg-slate-950 border border-slate-700 text-center font-mono font-bold text-white text-sm focus:outline-none focus:border-indigo-500"
                          />
                          <span className="text-xs text-slate-400">s</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 ml-auto">
                          ({formatTime(range.end)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {isInvalid && (
                    <p className="text-[11px] text-rose-400 mt-2 font-medium">
                      ⚠️ End time must be greater than start time.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Presets for Range Mode */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs text-slate-400 mr-1">Quick Presets:</span>
            <button
              type="button"
              onClick={() => handleApplyPresetRange(0, Math.min(60, totalDuration))}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              First 1 Min
            </button>
            <button
              type="button"
              onClick={() => handleApplyPresetRange(0, Math.min(120, totalDuration))}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              First 2 Min
            </button>
            {totalDuration > 120 && (
              <button
                type="button"
                onClick={() =>
                  handleApplyPresetRange(totalDuration * 0.25, totalDuration * 0.75)
                }
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Middle Section
              </button>
            )}
            {totalDuration > 60 && (
              <button
                type="button"
                onClick={() => handleApplyPresetRange(Math.max(0, totalDuration - 60), totalDuration)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Last 1 Min
              </button>
            )}
            <button
              type="button"
              onClick={() => handleApplyPresetRange(0, totalDuration)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Full Video
            </button>
          </div>
        </div>
      )}

      {/* Advanced Settings: Aspect Ratio, Engine & Naming */}
      <div className="pt-4 border-t border-slate-800/80 space-y-4">
        {/* Aspect Ratio Conversion Row */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="text-indigo-400 font-mono">16:9 → 9:16</span> Aspect Ratio Conversion
              </span>
              <p className="text-[11px] text-slate-400">
                Optionally convert landscape (16:9) clips into vertical format for YouTube Shorts, Reels, and TikTok.
              </p>
            </div>

            {/* Ratio options */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() =>
                  onChangeConfig({
                    ...config,
                    targetAspectRatio: 'original',
                  })
                }
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  config.targetAspectRatio === 'original'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Original (16:9)
              </button>

              <button
                type="button"
                onClick={() =>
                  onChangeConfig({
                    ...config,
                    targetAspectRatio: '9:16',
                    useReencoding: true, // Requires re-encoding
                  })
                }
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  config.targetAspectRatio === '9:16'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>9:16 Vertical</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-white/20">Shorts</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onChangeConfig({
                    ...config,
                    targetAspectRatio: '1:1',
                    useReencoding: true,
                  })
                }
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  config.targetAspectRatio === '1:1'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1:1 Square
              </button>
            </div>
          </div>

          {/* 9:16 Style selector when 9:16 is active */}
          {config.targetAspectRatio === '9:16' && (
            <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-150">
              <span className="text-[11px] text-slate-300 font-medium">
                Vertical Layout Style:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onChangeConfig({ ...config, verticalFitMode: 'blur' })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    config.verticalFitMode === 'blur'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ✨ Blurred Background (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeConfig({ ...config, verticalFitMode: 'crop' })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    config.verticalFitMode === 'crop'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ✂️ Center Crop (Fill Screen)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeConfig({ ...config, verticalFitMode: 'fit' })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    config.verticalFitMode === 'fit'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⬛ Letterbox (Black Bars)
                </button>
              </div>
            </div>
          )}

          {/* Promotional Cards Section for 9:16 */}
          {config.targetAspectRatio === '9:16' && (
            <div className="pt-3 border-t border-slate-800/60">
              <PromoCardsManager
                config={
                  config.promoCards || {
                    enabled: false,
                    bannerMode: 'static',
                    topCard: null,
                    bottomCard: null,
                    adjustments: DEFAULT_CARD_ADJUSTMENTS,
                  }
                }
                onChange={(promoCards) => onChangeConfig({ ...config, promoCards })}
                videoPreviewUrl={videoPreviewUrl}
                totalDuration={totalDuration}
                currentPlayheadTime={currentPlayheadTime}
              />
            </div>
          )}
        </div>

        {/* Engine Toggle & Custom Naming Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Engine Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mt-0.5 shrink-0">
              {config.useReencoding || config.targetAspectRatio !== 'original' ? (
                <Cpu className="w-4 h-4" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Splitting Engine</span>
                <button
                  type="button"
                  disabled={config.targetAspectRatio !== 'original'}
                  onClick={() =>
                    onChangeConfig({
                      ...config,
                      useReencoding: !config.useReencoding,
                    })
                  }
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition cursor-pointer disabled:opacity-75 ${
                    config.useReencoding || config.targetAspectRatio !== 'original'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {config.targetAspectRatio !== 'original'
                    ? 'Re-encode (Ratio Filter)'
                    : config.useReencoding
                    ? 'Re-encode (Exact)'
                    : 'Stream Copy (Fast)'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {config.targetAspectRatio !== 'original'
                  ? 'Re-encoding active to transform video into 9:16 vertical resolution.'
                  : config.useReencoding
                  ? 'Frame-accurate cut points with H.264 re-encoding.'
                  : 'Lightning-fast lossless split without re-encoding.'}
              </p>
            </div>
          </div>

          {/* Custom Naming Prefix */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white">Filename Prefix</span>
              <span className="text-[10px] text-slate-400 font-mono">_part_01.mp4</span>
            </div>
            <input
              type="text"
              placeholder={defaultBaseName}
              value={config.namingPrefix}
              onChange={(e) =>
                onChangeConfig({
                  ...config,
                  namingPrefix: e.target.value,
                })
              }
              className="w-full h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Live Summary Alert */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-white">Split Plan Summary</div>
          <p className="text-indigo-200/90">{summaryText}</p>
        </div>
      </div>
    </div>
  );
};
