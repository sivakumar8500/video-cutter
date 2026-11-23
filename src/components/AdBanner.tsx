import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Sparkles, Info } from 'lucide-react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  className?: string;
  testMode?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slot = '7986346271',
  format = 'auto',
  className = '',
  testMode = true,
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const [hasGoogleAd, setHasGoogleAd] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Only trigger AdSense push if this element has not been initialized yet
        if (adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
          // @ts-expect-error Google AdSense global array
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }

        // Check if Google AdSense injected an iframe or filled the ad
        const checkAdStatus = () => {
          if (adRef.current) {
            const hasIframe = adRef.current.querySelector('iframe') !== null;
            const status = adRef.current.getAttribute('data-ad-status');
            if (hasIframe || status === 'filled') {
              setHasGoogleAd(true);
            }
          }
        };

        const timer = setTimeout(checkAdStatus, 1500);
        const interval = setInterval(checkAdStatus, 3000);

        return () => {
          clearTimeout(timer);
          clearInterval(interval);
        };
      }
    } catch (err) {
      console.debug('AdSense test note:', err);
    }
  }, [slot]);

  return (
    <div className={`w-full my-6 flex flex-col items-center justify-center overflow-hidden ${className}`}>
      {/* Top Ad Label */}
      <div className="flex items-center gap-2 mb-1 select-none">
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-600 font-semibold">
          Advertisement
        </span>
        {testMode && (
          <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.2 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold">
            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
            <span>TEST ADS ACTIVE (data-ad-test=&quot;on&quot;)</span>
          </span>
        )}
      </div>

      {/* Ad Container Box */}
      <div className="relative w-full max-w-5xl min-h-[100px] bg-slate-50/80 rounded-2xl border border-slate-200/80 p-2 shadow-2xs overflow-hidden flex flex-col items-center justify-center">
        {/* Real Google AdSense Test Slot */}
        <ins
          ref={adRef}
          className="adsbygoogle relative z-10 w-full"
          style={{ display: 'block', width: '100%', minHeight: hasGoogleAd ? '90px' : 'auto' }}
          data-ad-client="ca-pub-5783404252931950"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
          data-ad-test="on"
        />

        {/* High-Fidelity Test Ad Banner (Rendered when Google Ad is loading or unfilled in test mode) */}
        {!hasGoogleAd && (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50/70 via-slate-50 to-teal-50/70 border border-emerald-200/60">
            <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative shrink-0 w-10 h-10 rounded-xl bg-white p-1 border border-emerald-300 shadow-xs flex items-center justify-center">
                <img
                  src="./reeyansh-logo.png"
                  alt="Reeyansh Tech Solutions"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
                <span className="absolute -top-1.5 -left-1.5 bg-emerald-600 text-white font-mono text-[8px] font-bold px-1 rounded-sm shadow-2xs">
                  Ad
                </span>
              </div>

              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                    Reeyansh Tech Solutions • Custom Cloud &amp; AI Media Apps
                  </h4>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-800 font-medium">
                    <Info className="w-3 h-3 text-emerald-600" />
                    <span>Sponsored Test Creative</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  High-performance client-side WebAssembly tools, video engines &amp; cloud systems with zero latency.
                </p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 pt-0.5">
                  <span>Slot #{slot}</span>
                  <span>•</span>
                  <span>ca-pub-5783404252931950</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">status: active</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto flex items-center justify-end">
              <a
                href="https://www.reeyanshtech.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-transform hover:scale-105 cursor-pointer"
                title="Visit Reeyansh Tech Solutions"
              >
                <span>Visit Sponsor</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
