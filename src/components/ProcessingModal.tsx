import React, { useState, useEffect, useRef } from 'react';
import { Loader2, XCircle, Terminal, ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react';
import type { ProcessingProgress } from '../types';

interface ProcessingModalProps {
  progress: ProcessingProgress;
  onCancel: () => void;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({ progress, onCancel }) => {
  const [showLogs, setShowLogs] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Track elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (showLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [progress.logs, showLogs]);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl shadow-indigo-500/10 space-y-6">
        {/* Glow behind modal */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with spinner */}
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            <div className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Splitting In Progress</span>
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-400">
              Processing with FFmpeg WebAssembly in your browser
            </p>
          </div>
        </div>

        {/* Status Message */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-medium">
          <span className="text-indigo-400 font-semibold mr-1">Status:</span>
          {progress.statusMessage || 'Preparing video streams...'}
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-200">Overall Progress</span>
            <span className="font-mono font-bold text-indigo-400">{progress.overallProgress}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
            <div
              style={{ width: `${progress.overallProgress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-300 shadow-sm"
            />
          </div>
        </div>

        {/* Current Clip Progress (if multiple clips) */}
        {progress.totalClips > 1 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>
                Clip {progress.currentClipIndex || 1} of {progress.totalClips}
              </span>
              <span className="font-mono text-cyan-400">{progress.currentClipProgress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                style={{ width: `${progress.currentClipProgress}%` }}
                className="h-full rounded-full bg-cyan-400 transition-all duration-150"
              />
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Time Elapsed</div>
            <div className="text-xs font-mono font-bold text-white mt-0.5">{formatElapsed(elapsedSec)}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Clips Finished</div>
            <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
              {Math.max(0, (progress.currentClipIndex || 1) - 1)} / {progress.totalClips}
            </div>
          </div>
        </div>

        {/* Error message if any */}
        {progress.errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>{progress.errorMessage}</p>
          </div>
        )}

        {/* Collapsible Logs Drawer */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/90">
          <button
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className="w-full p-2.5 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <div className="flex items-center gap-1.5 font-mono">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>FFmpeg Output Console ({progress.logs.length} lines)</span>
            </div>
            {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showLogs && (
            <div className="p-3 max-h-40 overflow-y-auto font-mono text-[11px] text-slate-400 space-y-1 border-t border-slate-800 bg-black/60">
              {progress.logs.length === 0 ? (
                <div className="text-slate-400 italic">No logs yet...</div>
              ) : (
                progress.logs.map((log, idx) => (
                  <div key={idx} className="break-all whitespace-pre-wrap leading-relaxed">
                    <span className="text-slate-400 mr-2">&gt;</span>
                    {log}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        {/* Cancel Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800/60 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Splitting Operation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
