import React, { useEffect, useRef } from 'react';

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
  const isPushed = useRef(false);

  useEffect(() => {
    // Only push if not already pushed for this ad instance
    if (!isPushed.current && typeof window !== 'undefined') {
      try {
        // @ts-expect-error Google AdSense global array
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushed.current = true;
      } catch (err) {
        // AdSense already initialized or blocked by browser extensions
        console.debug('AdSense push note:', err);
      }
    }
  }, []);

  return (
    <div className={`w-full my-6 flex flex-col items-center justify-center overflow-hidden ${className}`}>
      <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-1 select-none">
        Advertisement
      </span>
      <div className="w-full max-w-5xl flex justify-center items-center min-h-[100px] bg-slate-50/70 rounded-2xl border border-slate-200/60 p-2 shadow-2xs">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '90px' }}
          data-ad-client="ca-pub-5783404252931950"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
