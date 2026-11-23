import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slot = '7986346271',
  format = 'auto',
  className = '',
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const [adStatus, setAdStatus] = useState<'loading' | 'filled' | 'unfilled' | 'blocked'>('loading');

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Check if ad blocker blocked adsbygoogle.js
        setTimeout(() => {
          // @ts-expect-error Google AdSense global array
          if (typeof window.adsbygoogle === 'undefined' && !document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
            setAdStatus('blocked');
          }
        }, 1200);

        // Push ad slot request to AdSense queue if not initialized
        if (adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
          // @ts-expect-error Google AdSense global array
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }

        // Monitor whether Google AdSense injected an iframe or marked status
        const checkStatus = () => {
          if (adRef.current) {
            const hasIframe = adRef.current.querySelector('iframe') !== null;
            const googleStatus = adRef.current.getAttribute('data-ad-status');
            if (hasIframe || googleStatus === 'filled') {
              setAdStatus('filled');
            } else if (googleStatus === 'unfilled') {
              setAdStatus('unfilled');
            }
          }
        };

        const timer1 = setTimeout(checkStatus, 1500);
        const timer2 = setTimeout(checkStatus, 3500);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    } catch (err) {
      console.debug('AdSense status notice:', err);
    }
  }, [slot]);

  return (
    <div className={`w-full my-6 flex flex-col items-center justify-center overflow-hidden ${className}`}>
      {/* Top Ad Label */}
      <div className="flex items-center gap-2 mb-1.5 select-none">
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-600 font-semibold">
          Advertisement
        </span>
        <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          Slot #{slot}
        </span>
      </div>

      {/* Ad Container Box */}
      <div className="relative w-full max-w-5xl min-h-[110px] bg-slate-50/90 rounded-2xl border border-slate-200 p-2 shadow-2xs overflow-hidden flex flex-col items-center justify-center">
        {/* Canonical Google AdSense Tag */}
        <ins
          ref={adRef}
          className="adsbygoogle relative z-10 w-full"
          style={{ display: 'block', width: '100%', minHeight: '100px' }}
          data-ad-client="ca-pub-5783404252931950"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />

        {/* Informative Diagnostic & Sponsor Banner when Google ad is filling or in domain review */}
        {adStatus !== 'filled' && (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/80 border border-emerald-200/80">
            <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative shrink-0 w-11 h-11 rounded-xl bg-white p-1.5 border border-emerald-300 shadow-xs flex items-center justify-center">
                <img
                  src="./reeyansh-logo.png"
                  alt="Reeyansh Tech Solutions"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                />
                <span className="absolute -top-1.5 -left-1.5 bg-emerald-600 text-white font-mono text-[8px] font-bold px-1 rounded-sm shadow-2xs">
                  Ad
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                    Reeyansh Tech Solutions • Custom Cloud &amp; AI Media Apps
                  </h4>
                  {adStatus === 'blocked' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      <span>AdBlocker Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>AdSense Unit Active</span>
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-normal">
                  High-performance client-side WebAssembly tools, video engines &amp; cloud systems with zero server latency.
                </p>

                <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-mono text-slate-500 pt-0.5">
                  <span className="text-slate-700 font-semibold">ca-pub-5783404252931950</span>
                  <span>•</span>
                  <span>Slot: {slot}</span>
                  <span>•</span>
                  {adStatus === 'blocked' ? (
                    <span className="text-rose-600 font-bold">Pause ad-blocker to view Google ad network</span>
                  ) : adStatus === 'unfilled' ? (
                    <span className="text-amber-700 font-semibold">Google crawling inventory for vidcuts.online</span>
                  ) : (
                    <span className="text-emerald-700 font-semibold">Awaiting Google network response</span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto flex items-center justify-end">
              <a
                href="https://www.reeyanshtech.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-transform hover:scale-105 cursor-pointer"
                title="Visit Reeyansh Tech Solutions Official Site"
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
