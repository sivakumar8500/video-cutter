import type { SplitConfig, VideoSegment } from '../types';

/**
 * Format seconds into HH:MM:SS or MM:SS
 */
export function formatTime(seconds: number, includeMs = false): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';

  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const ms = Math.floor((seconds - totalSeconds) * 100);

  const minsStr = hrs > 0 ? String(mins).padStart(2, '0') : String(mins);
  const secsStr = String(secs).padStart(2, '0');
  const msStr = includeMs ? `.${String(ms).padStart(2, '0')}` : '';

  if (hrs > 0) {
    return `${hrs}:${minsStr}:${secsStr}${msStr}`;
  }
  return `${minsStr}:${secsStr}${msStr}`;
}

/**
 * Format seconds into a compact filename-friendly string e.g. 01m30s
 */
export function formatCompactTime(seconds: number): string {
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${padZero(mins, 2)}m${padZero(secs, 2)}s`;
}

/**
 * Format bytes into human-readable B, KB, MB, GB
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Pad a number with leading zeros
 */
export function padZero(num: number, size = 2): string {
  let s = num.toString();
  while (s.length < size) s = '0' + s;
  return s;
}

/**
 * Sanitize filename by removing extension and unsafe characters
 */
export function sanitizeBaseFilename(filename: string): string {
  // Remove extension
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  // Replace spaces and special characters with underscore or hyphen
  return withoutExt.replace(/[^a-zA-Z0-9_\-\.]/g, '_').replace(/_+/g, '_');
}

/**
 * Get file extension (defaulting to mp4)
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length > 1) {
    const ext = parts[parts.length - 1].toLowerCase();
    // Common video extensions
    if (['mp4', 'mov', 'mkv', 'webm', 'avi', 'm4v', 'ts'].includes(ext)) {
      return ext;
    }
  }
  return 'mp4';
}

/**
 * Calculate segments according to configuration
 */
export function calculateSegments(
  totalDuration: number,
  config: SplitConfig,
  baseFilename: string,
  extension: string
): VideoSegment[] {
  if (totalDuration <= 0) return [];

  const prefix = config.namingPrefix.trim() || sanitizeBaseFilename(baseFilename);
  const segments: VideoSegment[] = [];

  if (config.mode === 'pieces') {
    // Mode A: Split by Number of Pieces
    const pieceCount = Math.max(1, Math.floor(config.pieces));
    const pieceDuration = totalDuration / pieceCount;

    for (let i = 0; i < pieceCount; i++) {
      const start = i * pieceDuration;
      // Last piece ends exactly at totalDuration to prevent rounding cutoffs
      const end = i === pieceCount - 1 ? totalDuration : Math.min(totalDuration, (i + 1) * pieceDuration);
      const duration = end - start;
      const index = i + 1;
      const outputFilename = `${prefix}_part_${padZero(index, 2)}.${extension}`;

      segments.push({
        index,
        start,
        end,
        duration,
        outputFilename,
      });
    }
  } else if (config.mode === 'duration') {
    // Mode B: Split by Clip Duration
    const clipDuration = Math.max(0.1, config.clipDurationSeconds);
    const clipCount = Math.ceil(totalDuration / clipDuration);

    for (let i = 0; i < clipCount; i++) {
      const start = i * clipDuration;
      const end = Math.min(totalDuration, start + clipDuration);
      const duration = end - start;
      const index = i + 1;
      const outputFilename = `${prefix}_part_${padZero(index, 2)}.${extension}`;

      segments.push({
        index,
        start,
        end,
        duration,
        outputFilename,
      });
    }
  } else if (config.mode === 'range') {
    // Mode C: Cut Particular Minutes to Minutes (Custom Time Ranges)
    const ranges = config.customRanges && config.customRanges.length > 0
      ? config.customRanges
      : [{ id: 'default', start: 0, end: totalDuration }];

    ranges.forEach((r, idx) => {
      const start = Math.max(0, Math.min(totalDuration, r.start));
      const end = Math.max(start + 0.1, Math.min(totalDuration, r.end));
      const duration = end - start;
      const index = idx + 1;
      const label = r.label ? `_${sanitizeBaseFilename(r.label)}` : `_${formatCompactTime(start)}_to_${formatCompactTime(end)}`;
      const outputFilename = `${prefix}_cut_${padZero(index, 2)}${label}.${extension}`;

      segments.push({
        index,
        start,
        end,
        duration,
        outputFilename,
        label: r.label,
      });
    });
  }

  return segments;
}
