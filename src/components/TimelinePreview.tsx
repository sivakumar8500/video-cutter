import React from 'react';
import { Film, PlayCircle, Scissors } from 'lucide-react';
import type { VideoSegment } from '../types';
import { formatTime } from '../utils/formatters';

interface TimelinePreviewProps {
  totalDuration: number;
  segments: VideoSegment[];
  onSeek: (seconds: number) => void;
  onStartProcess: () => void;
  isProcessing: boolean;
  isRangeMode?: boolean;
}

const SEGMENT_COLORS = [
  'from-indigo-600 to-indigo-500',
  'from-cyan-600 to-cyan-500',
  'from-emerald-600 to-emerald-500',
  'from-violet-600 to-violet-500',
  'from-amber-600 to-amber-500',
  'from-rose-600 to-rose-500',
  'from-blue-600 to-blue-500',
  'from-teal-600 to-teal-500',
];

export const TimelinePreview: React.FC<TimelinePreviewProps> = ({
  totalDuration,
  segments,
  onSeek,
  onStartProcess,
  isProcessing,
  isRangeMode = false,
}) => {
  return (
    <div className="w-full rounded-3xl bg-white border border-[#E8E2D9] p-5 sm:p-6 shadow-sm space-y-6">
      {/* Title & Stats */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="text-base font-bold text-[#2B140D]">Segment Cuts &amp; Timeline</h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] font-semibold border border-[#FDE68A]">
            {segments.length} {segments.length === 1 ? 'Clip' : 'Clips'} Planned
          </span>
          <span className="text-[#6B4E44] font-mono">
            Total: {formatTime(totalDuration, true)}
          </span>
        </div>
      </div>

      {/* Visual Timeline Bar */}
      <div className="space-y-2">
        <div className="relative w-full h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
          {/* Subtle second tick marks background */}
          <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20 px-2 items-center">
            <span className="h-4 w-px bg-white" />
            <span className="h-2 w-px bg-white" />
            <span className="h-4 w-px bg-white" />
            <span className="h-2 w-px bg-white" />
            <span className="h-4 w-px bg-white" />
          </div>

          {!isRangeMode ? (
            // Mode A & B: Continuous segments
            <div className="flex h-full w-full">
              {segments.map((seg, idx) => {
                const widthPct = (seg.duration / totalDuration) * 100;
                const colorClass = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];

                return (
                  <div
                    key={seg.index}
                    style={{ width: `${widthPct}%` }}
                    onClick={() => onSeek(seg.start)}
                    title={`Part ${seg.index}: ${formatTime(seg.start)} - ${formatTime(seg.end)} (${formatTime(
                      seg.duration
                    )})`}
                    className={`group relative h-full bg-gradient-to-r ${colorClass} border-r border-slate-950/40 hover:brightness-125 transition-all duration-150 cursor-pointer flex items-center justify-center overflow-hidden`}
                  >
                    <span className="text-[11px] font-bold text-white drop-shadow truncate px-1 opacity-90 group-hover:opacity-100">
                      #{seg.index}
                    </span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })}
            </div>
          ) : (
            // Mode C: Absolute positioned highlight slices for custom ranges
            <div className="relative h-full w-full">
              {segments.map((seg, idx) => {
                const leftPct = (seg.start / totalDuration) * 100;
                const widthPct = Math.max(1, (seg.duration / totalDuration) * 100);
                const colorClass = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];

                return (
                  <div
                    key={seg.index}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    onClick={() => onSeek(seg.start)}
                    title={`Cut #${seg.index}: ${formatTime(seg.start)} - ${formatTime(seg.end)} (${formatTime(
                      seg.duration
                    )})`}
                    className={`group absolute top-1 bottom-1 rounded-lg bg-gradient-to-r ${colorClass} shadow-lg hover:brightness-125 transition-all duration-150 cursor-pointer flex items-center justify-center border border-white/20 overflow-hidden`}
                  >
                    <span className="text-[10px] font-bold text-white drop-shadow truncate px-1 opacity-90 group-hover:opacity-100">
                      #{seg.index}
                    </span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Timeline time marks */}
        <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1">
          <span>00:00</span>
          <span>{formatTime(totalDuration / 2)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Segment Cards Grid / Scrollable List */}
      <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {segments.map((seg, idx) => {
            const colorClass = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];

            return (
              <div
                key={seg.index}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colorClass} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    {seg.index}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-semibold text-slate-200 truncate font-mono" title={seg.outputFilename}>
                      {seg.outputFilename}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {formatTime(seg.start)} → {formatTime(seg.end)}{' '}
                      <span className="text-indigo-400">({formatTime(seg.duration, true)})</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSeek(seg.start)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
                  title="Seek to start in video player"
                >
                  <PlayCircle className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Splitting Action CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onStartProcess}
          disabled={isProcessing || segments.length === 0}
          className="w-full py-4 rounded-2xl bg-[#2B140D] hover:bg-[#3D1E14] text-white font-bold text-base shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Scissors className="w-5 h-5 -rotate-45 text-[#F59E0B]" />
          <span>
            {isRangeMode ? 'Cut & Export Selected Minute Range(s)' : `Cut & Export ${segments.length} Video Clips Now`}
          </span>
        </button>
      </div>
    </div>
  );
};
