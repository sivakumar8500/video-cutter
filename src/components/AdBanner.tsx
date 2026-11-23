import React, { useEffect, useRef } from 'react';

export interface AdBannerProps {
  slot?: string;
  client?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  layoutKey?: string;
  variant?: 'display' | 'in-feed';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slot,
  client = 'ca-pub-5783404252931950',
  format,
  layoutKey,
  variant = 'display',
  className = '',
}) => {
  const adRef = useRef<HTMLModElement>(null);

  // Determine active parameters based on variant or provided props
  const isInFeed = variant === 'in-feed' || format === 'fluid' || Boolean(layoutKey) || slot === '6721366060';
  const activeSlot = slot || (isInFeed ? '6721366060' : '7986346271');
  const activeFormat = format || (isInFeed ? 'fluid' : 'auto');
  const activeLayoutKey = layoutKey || (isInFeed ? '-fb+5w+4e-db+86' : undefined);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Only trigger AdSense push if this element has not been initialized yet
        if (adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
          // @ts-expect-error Google AdSense global array
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      }
    } catch (err) {
      console.debug('AdSense notice:', err);
    }
  }, [activeSlot, client]);

  return (
    <div className={`w-full my-6 flex flex-col items-center justify-center overflow-hidden ${className}`}>
      {/* Top Ad Label */}
      <span className="text-[10px] uppercase font-mono tracking-widest text-slate-600 mb-1 select-none font-semibold">
        Advertisement
      </span>

      {/* Official AdSense Container */}
      <div className={`w-full max-w-5xl ${isInFeed ? 'min-h-[120px]' : 'min-h-[90px] sm:min-h-[100px]'} flex justify-center items-center bg-slate-50/70 rounded-2xl border border-slate-200/60 p-2 shadow-2xs`}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            minHeight: isInFeed ? '120px' : '90px',
          }}
          data-ad-client={client}
          data-ad-slot={activeSlot}
          data-ad-format={activeFormat}
          {...(activeLayoutKey ? { 'data-ad-layout-key': activeLayoutKey } : {})}
          {...(!isInFeed ? { 'data-full-width-responsive': 'true' } : {})}
        />
      </div>
    </div>
  );
};
