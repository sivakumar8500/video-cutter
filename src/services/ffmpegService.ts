import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type {
  AspectRatioOption,
  ExportedClip,
  ProcessingProgress,
  PromoCardsConfig,
  VerticalFitMode,
  VideoSegment,
} from '../types';

/**
 * Get FFmpeg filter arguments for standard aspect ratio conversion
 */
export function getFilterArgs(
  aspectRatio: AspectRatioOption = 'original',
  fitMode: VerticalFitMode = 'blur'
): string[] {
  if (aspectRatio === '9:16') {
    if (fitMode === 'crop') {
      return ['-vf', 'crop=ih*9/16:ih,scale=1080:1920'];
    }
    if (fitMode === 'fit') {
      return [
        '-vf',
        'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black',
      ];
    }
    // 'blur' mode: blurred video background + sharp centered foreground
    return [
      '-filter_complex',
      'split[bg][fg];[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:5[bg_blur];[fg]scale=1080:1920:force_original_aspect_ratio=decrease[fg_scaled];[bg_blur][fg_scaled]overlay=(W-w)/2:(H-h)/2',
    ];
  }

  if (aspectRatio === '1:1') {
    if (fitMode === 'crop') {
      return ['-vf', 'crop=min(iw\\,ih):min(iw\\,ih),scale=1080:1080'];
    }
    return [
      '-vf',
      'scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2:black',
    ];
  }

  return [];
}

export interface TimedBannerInput {
  inputIndex: number;
  position: 'top' | 'bottom';
  start: number; // in seconds
  end: number; // in seconds
}

/**
 * Build filter graph for top and bottom promotional card overlay in 9:16
 * with custom card adjustments (fit mode, custom heights, padding, zoom, and background color)
 * and optional timed multi-banners with between(t, start, end) expressions.
 */
export function getPromoCardsFilterArgs(
  topInputIndex: number | null,
  botInputIndex: number | null,
  adjustments?: import('../types').CardAdjustments,
  timedBanners?: TimedBannerInput[]
): string[] {
  const topH = Math.max(200, Math.min(800, adjustments?.topHeight ?? 656));
  const botH = Math.max(200, Math.min(800, adjustments?.bottomHeight ?? 656));
  const fit = adjustments?.fitMode ?? 'cover';
  const bgColor = adjustments?.backgroundColor || 'black';
  const padding = adjustments?.videoPadding ?? 0;
  const topZoom = adjustments?.topZoom ?? 1;
  const botZoom = adjustments?.bottomZoom ?? 1;

  const availH = 1920 - topH - botH;
  const videoH = Math.round((1080 * 9) / 16); // ~608px
  const videoY = Math.round(
    topH + padding + Math.max(0, (availH - padding * 2 - videoH) / 2)
  );

  let filter = `[0:v]scale=1080:${videoH}:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:${videoY}:${bgColor}[base]`;
  let currentBase = 'base';

  if (timedBanners && timedBanners.length > 0) {
    // Multi-Banner Timeline Mode: iterate through each timed banner slot
    for (let i = 0; i < timedBanners.length; i++) {
      const b = timedBanners[i];
      const isTop = b.position === 'top';
      const h = isTop ? topH : botH;
      const zoom = isTop ? topZoom : botZoom;
      const yPos = isTop ? 0 : 1920 - botH;

      if (fit === 'cover') {
        const scaledW = Math.round(1080 * zoom);
        const scaledH = Math.round(h * zoom);
        filter += `;[${b.inputIndex}:v]scale=${scaledW}:${scaledH}:force_original_aspect_ratio=increase,crop=1080:${h}[tb_scale_${i}]`;
      } else {
        filter += `;[${b.inputIndex}:v]scale=1080:${h}:force_original_aspect_ratio=decrease,pad=1080:${h}:(ow-iw)/2:(oh-ih)/2:${bgColor}[tb_scale_${i}]`;
      }

      // Overlay with enable expression between(t, start, end)
      filter += `;[${currentBase}][tb_scale_${i}]overlay=0:${yPos}:enable='between(t\\,${b.start.toFixed(2)}\\,${b.end.toFixed(2)})'[with_tb_${i}]`;
      currentBase = `with_tb_${i}`;
    }
  } else {
    // Single static banners mode
    if (topInputIndex !== null) {
      if (fit === 'cover') {
        const scaledW = Math.round(1080 * topZoom);
        const scaledH = Math.round(topH * topZoom);
        filter += `;[${topInputIndex}:v]scale=${scaledW}:${scaledH}:force_original_aspect_ratio=increase,crop=1080:${topH}[top_scaled]`;
      } else {
        filter += `;[${topInputIndex}:v]scale=1080:${topH}:force_original_aspect_ratio=decrease,pad=1080:${topH}:(ow-iw)/2:(oh-ih)/2:${bgColor}[top_scaled]`;
      }
      filter += `;[${currentBase}][top_scaled]overlay=0:0[with_top]`;
      currentBase = 'with_top';
    }

    if (botInputIndex !== null) {
      const botY = 1920 - botH;
      if (fit === 'cover') {
        const scaledW = Math.round(1080 * botZoom);
        const scaledH = Math.round(botH * botZoom);
        filter += `;[${botInputIndex}:v]scale=${scaledW}:${scaledH}:force_original_aspect_ratio=increase,crop=1080:${botH}[bot_scaled]`;
      } else {
        filter += `;[${botInputIndex}:v]scale=1080:${botH}:force_original_aspect_ratio=decrease,pad=1080:${botH}:(ow-iw)/2:(oh-ih)/2:${bgColor}[bot_scaled]`;
      }
      filter += `;[${currentBase}][bot_scaled]overlay=0:${botY}[with_bot]`;
      currentBase = 'with_bot';
    }
  }

  return ['-filter_complex', filter, '-map', `[${currentBase}]`, '-map', '0:a?'];
}

export class FFmpegService {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;
  private isCancelled = false;

  /**
   * Initialize and load FFmpeg WASM core
   */
  async load(onLog?: (msg: string) => void): Promise<void> {
    if (this.isLoaded && this.ffmpeg) {
      return;
    }

    this.ffmpeg = new FFmpeg();

    if (onLog) {
      this.ffmpeg.on('log', ({ message }) => {
        onLog(message);
      });
    }

    try {
      const base = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`;
      const baseURL = new URL(`${base}ffmpeg`, window.location.href).href;
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');

      await this.ffmpeg.load({
        coreURL,
        wasmURL,
      });

      this.isLoaded = true;
    } catch (localErr) {
      console.warn('Local FFmpeg WASM load failed, attempting CDN fallback...', localErr);

      const cdnBase = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm';
      const coreURL = await toBlobURL(`${cdnBase}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${cdnBase}/ffmpeg-core.wasm`, 'application/wasm');

      await this.ffmpeg.load({
        coreURL,
        wasmURL,
      });

      this.isLoaded = true;
    }
  }

  /**
   * Cancel ongoing processing
   */
  cancel(): void {
    this.isCancelled = true;
    if (this.ffmpeg) {
      try {
        this.ffmpeg.terminate();
      } catch (err) {
        console.warn('Error during FFmpeg termination:', err);
      }
      this.ffmpeg = null;
      this.isLoaded = false;
    }
  }

  /**
   * Convert an already cut clip to 9:16 with optional top and bottom promotional cards
   */
  async convertClipAspectRatio(
    clip: ExportedClip,
    targetRatio: AspectRatioOption,
    fitMode: VerticalFitMode,
    promoCards?: PromoCardsConfig,
    onProgress?: (progress: number) => void
  ): Promise<ExportedClip> {
    if (!this.isLoaded || !this.ffmpeg) {
      await this.load();
    }
    if (!this.ffmpeg) {
      throw new Error('FFmpeg failed to initialize');
    }

    const inputName = `conv_in_${Date.now()}.mp4`;
    const outName = `conv_out_${Date.now()}.mp4`;

    await this.ffmpeg.writeFile(inputName, await fetchFile(clip.blob));

    let topVirtualName: string | null = null;
    let botVirtualName: string | null = null;
    let topIndex: number | null = null;
    let botIndex: number | null = null;
    let nextIndex = 1;

    const extraInputs: string[] = [];
    const createdVirtualFiles: string[] = [];
    const timedBanners: TimedBannerInput[] = [];

    const isTimelineMode = promoCards?.enabled && promoCards.bannerMode === 'timeline';

    if (isTimelineMode) {
      const topSlots = promoCards.topSlots || [];
      for (let i = 0; i < topSlots.length; i++) {
        const slot = topSlots[i];
        if (slot.card && slot.end > slot.start) {
          const vName = `slot_top_${i}_${Date.now()}.png`;
          await this.ffmpeg.writeFile(vName, await fetchFile(slot.card.blob));
          createdVirtualFiles.push(vName);
          extraInputs.push('-i', vName);
          timedBanners.push({
            inputIndex: nextIndex++,
            position: 'top',
            start: Math.max(0, slot.start),
            end: Math.min(clip.duration, slot.end),
          });
        }
      }

      const bottomSlots = promoCards.bottomSlots || [];
      for (let i = 0; i < bottomSlots.length; i++) {
        const slot = bottomSlots[i];
        if (slot.card && slot.end > slot.start) {
          const vName = `slot_bot_${i}_${Date.now()}.png`;
          await this.ffmpeg.writeFile(vName, await fetchFile(slot.card.blob));
          createdVirtualFiles.push(vName);
          extraInputs.push('-i', vName);
          timedBanners.push({
            inputIndex: nextIndex++,
            position: 'bottom',
            start: Math.max(0, slot.start),
            end: Math.min(clip.duration, slot.end),
          });
        }
      }
    } else {
      if (promoCards?.enabled && promoCards.topCard) {
        topVirtualName = `top_card_${Date.now()}.png`;
        await this.ffmpeg.writeFile(topVirtualName, await fetchFile(promoCards.topCard.blob));
        createdVirtualFiles.push(topVirtualName);
        extraInputs.push('-i', topVirtualName);
        topIndex = nextIndex++;
      }

      if (promoCards?.enabled && promoCards.bottomCard) {
        botVirtualName = `bot_card_${Date.now()}.png`;
        await this.ffmpeg.writeFile(botVirtualName, await fetchFile(promoCards.bottomCard.blob));
        createdVirtualFiles.push(botVirtualName);
        extraInputs.push('-i', botVirtualName);
        botIndex = nextIndex++;
      }
    }

    if (onProgress) {
      this.ffmpeg.on('progress', ({ progress }: { progress: number }) => {
        onProgress(Math.min(100, Math.round(progress * 100)));
      });
    }

    let filterArgs: string[] = [];

    // If promo cards are attached, use promo card overlay
    if (targetRatio === '9:16' && timedBanners.length > 0) {
      filterArgs = getPromoCardsFilterArgs(null, null, promoCards?.adjustments, timedBanners);
    } else if (targetRatio === '9:16' && (topIndex !== null || botIndex !== null)) {
      filterArgs = getPromoCardsFilterArgs(topIndex, botIndex, promoCards?.adjustments);
    } else {
      filterArgs = getFilterArgs(targetRatio, fitMode);
    }

    const args = [
      '-i',
      inputName,
      ...extraInputs,
      ...filterArgs,
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-crf',
      '23',
      '-c:a',
      'copy',
      outName,
    ];

    let exitCode = await this.ffmpeg.exec(args);

    if (exitCode !== 0) {
      // Fallback
      const fallbackArgs = [
        '-i',
        inputName,
        '-vf',
        'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black',
        '-c:v',
        'libx264',
        '-preset',
        'ultrafast',
        '-crf',
        '23',
        '-c:a',
        'copy',
        outName,
      ];
      exitCode = await this.ffmpeg.exec(fallbackArgs);
    }

    if (exitCode !== 0) {
      throw new Error(`Aspect ratio conversion failed with exit code ${exitCode}`);
    }

    const outData = (await this.ffmpeg.readFile(outName)) as Uint8Array;
    const bufferCopy = new Uint8Array(outData.length);
    bufferCopy.set(outData);
    const blob = new Blob([bufferCopy], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);

    // Clean up temporary files
    try {
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outName);
      for (const vName of createdVirtualFiles) {
        await this.ffmpeg.deleteFile(vName);
      }
    } catch {
      // ignore
    }

    const suffix = targetRatio === '9:16' ? '_9x16' : '_1x1';
    const hasPromo = timedBanners.length > 0 || !!(topIndex !== null || botIndex !== null);
    const newFilename = clip.filename.replace(
      /\.([^.]+)$/,
      `${hasPromo ? '_promo' : ''}${suffix}.$1`
    );

    return {
      ...clip,
      id: `clip-${clip.index}-${targetRatio}-${Date.now()}`,
      filename: newFilename,
      blob,
      url,
      size: blob.size,
      aspectRatio: targetRatio,
      hasPromoCards: hasPromo,
    };
  }

  /**
   * Split a video into segments with optional aspect ratio and promo cards
   */
  async splitVideo(
    file: File,
    segments: VideoSegment[],
    useReencoding: boolean,
    targetAspectRatio: AspectRatioOption = 'original',
    verticalFitMode: VerticalFitMode = 'blur',
    promoCards?: PromoCardsConfig,
    onProgress?: (progress: Partial<ProcessingProgress>) => void
  ): Promise<ExportedClip[]> {
    this.isCancelled = false;

    if (!this.isLoaded || !this.ffmpeg) {
      onProgress?.({
        status: 'loading-ffmpeg',
        statusMessage: 'Loading FFmpeg WebAssembly engine...',
      });
      await this.load((log) => {
        onProgress?.({ logs: [log] });
      });
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg failed to initialize');
    }

    const hasStaticCards =
      promoCards?.enabled &&
      promoCards.bannerMode !== 'timeline' &&
      (!!promoCards.topCard || !!promoCards.bottomCard);
    const hasTimelineCards =
      promoCards?.enabled &&
      promoCards.bannerMode === 'timeline' &&
      ((promoCards.topSlots?.some((s) => !!s.card)) ||
        (promoCards.bottomSlots?.some((s) => !!s.card)));
    const hasCards = hasStaticCards || !!hasTimelineCards;
    const isConvertingRatio = targetAspectRatio !== 'original' || hasCards;
    const effectiveReencoding = useReencoding || isConvertingRatio;

    const inputExt = file.name.split('.').pop() || 'mp4';
    const inputVirtualName = `input_${Date.now()}.${inputExt}`;

    let topVirtualName: string | null = null;
    let botVirtualName: string | null = null;
    let topIndex: number | null = null;
    let botIndex: number | null = null;

    onProgress?.({
      status: 'preparing-file',
      statusMessage: `Loading video (${(file.size / (1024 * 1024)).toFixed(1)} MB) into memory...`,
      overallProgress: 5,
    });

    const fileData = await fetchFile(file);
    if (this.isCancelled) throw new Error('Operation cancelled by user');

    await this.ffmpeg.writeFile(inputVirtualName, fileData);

    const extraInputs: string[] = [];
    let nextIdx = 1;

    if (hasStaticCards && promoCards?.topCard) {
      topVirtualName = `top_card_${Date.now()}.png`;
      await this.ffmpeg.writeFile(topVirtualName, await fetchFile(promoCards.topCard.blob));
      extraInputs.push('-i', topVirtualName);
      topIndex = nextIdx++;
    }

    if (hasStaticCards && promoCards?.bottomCard) {
      botVirtualName = `bot_card_${Date.now()}.png`;
      await this.ffmpeg.writeFile(botVirtualName, await fetchFile(promoCards.bottomCard.blob));
      extraInputs.push('-i', botVirtualName);
      botIndex = nextIdx++;
    }

    const exportedClips: ExportedClip[] = [];
    const total = segments.length;
    const startTime = Date.now();

    try {
      for (let i = 0; i < total; i++) {
        if (this.isCancelled) {
          throw new Error('Operation cancelled by user');
        }

        const segment = segments[i];
        const clipNum = i + 1;
        const outVirtualName = `out_${clipNum}_${Date.now()}.${inputExt}`;

        onProgress?.({
          status: 'processing',
          currentClipIndex: clipNum,
          totalClips: total,
          statusMessage: `Processing clip ${clipNum} of ${total}: ${segment.outputFilename}${
            isConvertingRatio ? ` (${targetAspectRatio} vertical)` : ''
          }...`,
          currentClipProgress: 0,
          overallProgress: Math.round(5 + (i / total) * 90),
          startTime,
        });

        const progressHandler = ({ progress }: { progress: number }) => {
          if (this.isCancelled) return;
          const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
          const currentOverall = Math.round(5 + ((i + progress) / total) * 90);
          onProgress?.({
            currentClipProgress: pct,
            overallProgress: currentOverall,
          });
        };

        this.ffmpeg.on('progress', progressHandler);

        const segExtraInputs: string[] = [];
        const segTimedBanners: TimedBannerInput[] = [];
        const segFilesToClean: string[] = [];
        let segNextIdx = 1;

        if (hasTimelineCards) {
          const topSlots = promoCards?.topSlots || [];
          for (let sIdx = 0; sIdx < topSlots.length; sIdx++) {
            const slot = topSlots[sIdx];
            if (slot.card && slot.end > segment.start && slot.start < segment.end) {
              const relStart = Math.max(0, slot.start - segment.start);
              const relEnd = Math.min(segment.duration, slot.end - segment.start);
              if (relEnd > relStart) {
                const vName = `seg_${clipNum}_top_${sIdx}_${Date.now()}.png`;
                await this.ffmpeg.writeFile(vName, await fetchFile(slot.card.blob));
                segFilesToClean.push(vName);
                segExtraInputs.push('-i', vName);
                segTimedBanners.push({
                  inputIndex: segNextIdx++,
                  position: 'top',
                  start: relStart,
                  end: relEnd,
                });
              }
            }
          }

          const bottomSlots = promoCards?.bottomSlots || [];
          for (let sIdx = 0; sIdx < bottomSlots.length; sIdx++) {
            const slot = bottomSlots[sIdx];
            if (slot.card && slot.end > segment.start && slot.start < segment.end) {
              const relStart = Math.max(0, slot.start - segment.start);
              const relEnd = Math.min(segment.duration, slot.end - segment.start);
              if (relEnd > relStart) {
                const vName = `seg_${clipNum}_bot_${sIdx}_${Date.now()}.png`;
                await this.ffmpeg.writeFile(vName, await fetchFile(slot.card.blob));
                segFilesToClean.push(vName);
                segExtraInputs.push('-i', vName);
                segTimedBanners.push({
                  inputIndex: segNextIdx++,
                  position: 'bottom',
                  start: relStart,
                  end: relEnd,
                });
              }
            }
          }
        }

        let args: string[] = [];

        if (!effectiveReencoding) {
          // Fast Stream Copy
          args = [
            '-ss',
            segment.start.toFixed(3),
            '-i',
            inputVirtualName,
            '-t',
            segment.duration.toFixed(3),
            '-c',
            'copy',
            '-avoid_negative_ts',
            'make_zero',
            outVirtualName,
          ];
        } else {
          // Re-encoding with aspect ratio or promo cards
          let filterArgs: string[] = [];
          if (hasTimelineCards && segTimedBanners.length > 0) {
            filterArgs = getPromoCardsFilterArgs(null, null, promoCards?.adjustments, segTimedBanners);
          } else if (hasStaticCards && (topIndex !== null || botIndex !== null)) {
            filterArgs = getPromoCardsFilterArgs(topIndex, botIndex, promoCards?.adjustments);
          } else {
            filterArgs = getFilterArgs(targetAspectRatio, verticalFitMode);
          }

          const currentExtra = hasTimelineCards ? segExtraInputs : extraInputs;

          args = [
            '-ss',
            segment.start.toFixed(3),
            '-i',
            inputVirtualName,
            ...currentExtra,
            '-t',
            segment.duration.toFixed(3),
            ...filterArgs,
            '-c:v',
            'libx264',
            '-preset',
            'ultrafast',
            '-crf',
            '23',
            '-c:a',
            'aac',
            '-b:a',
            '192k',
            '-avoid_negative_ts',
            'make_zero',
            outVirtualName,
          ];
        }

        onProgress?.({
          logs: [`Executing: ffmpeg ${args.join(' ')}`],
        });

        let exitCode = await this.ffmpeg.exec(args);

        if (exitCode !== 0 && !effectiveReencoding) {
          onProgress?.({
            logs: [`Stream copy failed with exit code ${exitCode}. Retrying clip ${clipNum} with frame-accurate re-encode...`],
          });

          const fallbackArgs = [
            '-ss',
            segment.start.toFixed(3),
            '-i',
            inputVirtualName,
            '-t',
            segment.duration.toFixed(3),
            '-c:v',
            'libx264',
            '-preset',
            'ultrafast',
            '-crf',
            '23',
            '-c:a',
            'aac',
            '-b:a',
            '192k',
            '-avoid_negative_ts',
            'make_zero',
            outVirtualName,
          ];

          exitCode = await this.ffmpeg.exec(fallbackArgs);
        }

        if (exitCode !== 0) {
          throw new Error(`FFmpeg error cutting clip ${clipNum} (exit code ${exitCode})`);
        }

        const outData = (await this.ffmpeg.readFile(outVirtualName)) as Uint8Array;
        const mimeType = file.type || 'video/mp4';
        const bufferCopy = new Uint8Array(outData.length);
        bufferCopy.set(outData);
        const blob = new Blob([bufferCopy], { type: mimeType });
        const url = URL.createObjectURL(blob);

        exportedClips.push({
          id: `clip-${segment.index}-${Date.now()}`,
          index: segment.index,
          filename: segment.outputFilename,
          blob,
          url,
          duration: segment.duration,
          size: blob.size,
          start: segment.start,
          end: segment.end,
          aspectRatio: targetAspectRatio,
          hasPromoCards: hasCards,
        });

        try {
          await this.ffmpeg.deleteFile(outVirtualName);
          for (const f of segFilesToClean) {
            await this.ffmpeg.deleteFile(f);
          }
        } catch {
          // ignore
        }
      }

      onProgress?.({
        status: 'completed',
        overallProgress: 100,
        currentClipProgress: 100,
        statusMessage: `Successfully generated ${exportedClips.length} video clips!`,
      });

      return exportedClips;
    } finally {
      if (this.ffmpeg) {
        try {
          await this.ffmpeg.deleteFile(inputVirtualName);
          if (topVirtualName) await this.ffmpeg.deleteFile(topVirtualName);
          if (botVirtualName) await this.ffmpeg.deleteFile(botVirtualName);
        } catch {
          // ignore
        }
      }
    }
  }
}

export const ffmpegService = new FFmpegService();
