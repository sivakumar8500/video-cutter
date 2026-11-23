import React, { useEffect, useRef, useState } from 'react';
import {
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Play,
  Layers,
  X,
  Award,
} from 'lucide-react';
import { TEST_AD_CONFIG } from '../config/adsConfig';

interface AdBannerProps {
  slot?: string;
  client?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  className?: string;
  adUnitType?: keyof typeof TEST_AD_CONFIG;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slot = '7986346271',
  client = 'ca-pub-5783404252931950',
  format = 'auto',
  className = '',
  adUnitType = 'banner',
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const [adStatus, setAdStatus] = useState<'loading' | 'filled' | 'unfilled' | 'blocked'>('loading');
  const [activeModal, setActiveModal] = useState<'interstitial' | 'rewarded' | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  const activeUnit = TEST_AD_CONFIG[adUnitType] || TEST_AD_CONFIG.banner;

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Detect ad blockers
        setTimeout(() => {
          // @ts-expect-error Google AdSense global array
          if (typeof window.adsbygoogle === 'undefined' && !document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
            setAdStatus('blocked');
          }
        }, 1200);

        // Push ad request to Google AdSense queue
        if (adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
          // @ts-expect-error Google AdSense global array
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }

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
  }, [slot, client]);

  // Handle Interstitial / Rewarded Modal countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeModal) {
      setCountdown(5);
      setRewardClaimed(false);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (activeModal === 'rewarded') {
              setRewardClaimed(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeModal]);

  return (
    <div className={`w-full my-6 flex flex-col items-center justify-center overflow-hidden ${className}`}>
      {/* Top Ad Label & Format Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 w-full max-w-5xl mb-1.5 px-2 select-none">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-600 font-bold">
            Advertisement
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-700" />
            <span>TEST AD • {activeUnit.name}</span>
          </span>
        </div>

        {/* Quick Format Switchers for Testing */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveModal('interstitial')}
            className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
            title="Test Interstitial (ca-app-pub-3940256099942544/1033173712)"
          >
            <Layers className="w-3 h-3 text-emerald-600" />
            <span>Test Interstitial</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('rewarded')}
            className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors cursor-pointer flex items-center gap-1 font-bold"
            title="Test Rewarded Ad (ca-app-pub-3940256099942544/5224354917)"
          >
            <Play className="w-3 h-3 text-emerald-600" />
            <span>Test Rewarded</span>
          </button>
        </div>
      </div>

      {/* Ad Container Box */}
      <div className="relative w-full max-w-5xl min-h-[110px] bg-slate-50/90 rounded-2xl border border-slate-200 p-2 shadow-2xs overflow-hidden flex flex-col items-center justify-center">
        {/* Real Google AdSense Test Slot with exact Test Unit ID */}
        <ins
          ref={adRef}
          className="adsbygoogle relative z-10 w-full"
          style={{ display: 'block', width: '100%', minHeight: '100px' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
          data-ad-test="on"
        />

        {/* High-Fidelity Google Test Ad Creative (Shown during testing & review) */}
        {adStatus !== 'filled' && (
          <div className="w-full relative flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50/90 via-white to-amber-50/70 border-2 border-emerald-500/30">
            {/* Iconic Google Test Ad Floating Corner Ribbon */}
            <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 font-black text-[9px] uppercase px-3 py-0.5 rounded-bl-xl shadow-xs tracking-wider flex items-center gap-1 select-none">
              <span>Nice job! This is a test ad.</span>
            </div>

            <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative shrink-0 w-12 h-12 rounded-xl bg-slate-900 p-2 shadow-xs flex items-center justify-center text-white">
                <img
                  src="./app-icon.png"
                  alt="VidCuts App Icon"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
                <span className="absolute -top-1.5 -left-1.5 bg-emerald-600 text-white font-mono text-[8px] font-bold px-1 rounded-sm shadow-2xs">
                  Ad
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                    VidCuts Media Suite • Fast 4K Video Splitter &amp; 32 PDF Tools
                  </h4>
                  {adStatus === 'blocked' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      <span>AdBlocker Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Test Ad Active</span>
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-normal">
                  Cut videos losslessly, convert 16:9 to 9:16 vertical Shorts, compress PDFs, and build vector QR codes 100% in-browser.
                </p>

                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-600 pt-0.5">
                  <span className="font-bold text-slate-900 bg-slate-200/80 px-1.5 py-0.2 rounded">
                    ID: {activeUnit.id}
                  </span>
                  <span>•</span>
                  <span>Slot #{slot}</span>
                  <span>•</span>
                  <span>{client}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">status: 200 OK</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto flex items-center justify-end">
              <a
                href="https://www.reeyanshtech.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-transform hover:scale-105 cursor-pointer"
                title="Visit Reeyansh Tech Solutions Official Website"
              >
                <span>Visit Sponsor</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE FULL-SCREEN MODAL: Interstitial & Rewarded Video Test Ad */}
      {/* ========================================================================= */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl space-y-6">
            {/* Top Bar with Countdown and Close Button */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                  TEST AD
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {activeModal === 'interstitial' ? 'Interstitial Ad' : 'Rewarded Video Ad'}
                </span>
              </div>

              {countdown > 0 ? (
                <div className="text-xs font-mono text-slate-400">
                  Ad closes in <span className="font-bold text-amber-400">{countdown}s</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                >
                  <span>Skip Ad</span>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Simulated Ad Creative Content */}
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/40">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">
                  Reeyansh Tech Solutions
                </h3>
                <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Enterprise-grade cloud architectures, custom mobile/web applications, and WebAssembly multimedia pipelines.
                </p>
              </div>

              {/* Exact Google Ad Unit ID Tag */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-400 space-y-1">
                <div className="text-emerald-400 font-bold">
                  Unit ID: {TEST_AD_CONFIG[activeModal].id}
                </div>
                <div className="text-[11px] text-slate-500">
                  Slot #{TEST_AD_CONFIG[activeModal].slot} • {TEST_AD_CONFIG[activeModal].client}
                </div>
              </div>

              {/* Rewarded Status */}
              {activeModal === 'rewarded' && (
                <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 ${
                  rewardClaimed
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                }`}>
                  <Award className="w-4 h-4" />
                  <span>
                    {rewardClaimed
                      ? 'Reward Granted: 100% Free VIP 4K Processing Unlocked!'
                      : `Watch video to claim reward (${countdown}s remaining)`}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <a
                href="https://www.reeyanshtech.in/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
              >
                <span>Learn More (Visit Sponsor)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer border border-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
