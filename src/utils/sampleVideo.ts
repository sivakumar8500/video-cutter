/**
 * Generate a synthetic test video (e.g., 30s) directly in the browser
 * with a countdown timer, moving gradient, bouncing badge, and audio tones.
 */
export async function generateSampleVideo(
  durationSeconds = 30,
  onProgress?: (pct: number) => void
): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      const width = 640;
      const height = 360;
      const fps = 30;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context not supported');
      }

      // Audio context for sound ticks
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const dest = audioCtx.createMediaStreamDestination();

      // Combine video stream and audio stream
      const stream = canvas.captureStream(fps);
      const audioTrack = dest.stream.getAudioTracks()[0];
      if (audioTrack) {
        stream.addTrack(audioTrack);
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
        videoBitsPerSecond: 2500000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        try {
          audioCtx.close();
        } catch {
          // ignore
        }
        const blob = new Blob(chunks, { type: mimeType });
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([blob], `sample_demo_${durationSeconds}s.${ext}`, { type: mimeType });
        resolve(file);
      };

      recorder.start(100);

      const totalFrames = durationSeconds * fps;
      let frame = 0;

      // Beep sound function
      const playBeep = (freq = 440) => {
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(dest);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.15);
        } catch {
          // ignore
        }
      };

      const renderInterval = setInterval(() => {
        frame++;
        const currentTimeSec = frame / fps;
        const progress = frame / totalFrames;

        if (onProgress) {
          onProgress(Math.min(100, Math.round(progress * 100)));
        }

        // Draw animated background
        const grad = ctx.createLinearGradient(0, 0, width, height);
        const hue1 = (frame * 1.5) % 360;
        const hue2 = (hue1 + 120) % 360;
        grad.addColorStop(0, `hsl(${hue1}, 65%, 18%)`);
        grad.addColorStop(1, `hsl(${hue2}, 70%, 10%)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Bouncing neon indicator
        const ballX = (Math.sin(frame * 0.05) * 0.5 + 0.5) * (width - 100) + 50;
        const ballY = (Math.cos(frame * 0.07) * 0.5 + 0.5) * (height - 100) + 50;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#6366f1';
        ctx.fillStyle = '#818cf8';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('VIDEO CUTTER DEMO CLIP', width / 2, 70);

        // Big Time Display
        const mins = Math.floor(currentTimeSec / 60);
        const secs = Math.floor(currentTimeSec % 60);
        const ms = Math.floor((currentTimeSec % 1) * 10);
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${ms}`;

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 54px monospace';
        ctx.fillText(timeStr, width / 2, height / 2 + 10);

        // Subtitle
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px system-ui, sans-serif';
        ctx.fillText(`Duration: ${durationSeconds}s • Ready for Splitting`, width / 2, height / 2 + 55);

        // Progress bar at bottom
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(40, height - 40, width - 80, 10);

        ctx.fillStyle = '#6366f1';
        ctx.fillRect(40, height - 40, (width - 80) * progress, 10);

        // Audio tick every full second
        if (frame % fps === 0) {
          playBeep(frame % (fps * 5) === 0 ? 880 : 440);
        }

        if (frame >= totalFrames) {
          clearInterval(renderInterval);
          setTimeout(() => {
            recorder.stop();
          }, 200);
        }
      }, 1000 / fps);
    } catch (err) {
      reject(err);
    }
  });
}
