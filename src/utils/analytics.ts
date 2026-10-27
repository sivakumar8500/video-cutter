/**
 * Google Tag / Google Analytics Event Helper
 * Dispatches custom events to gtag.js if present in window
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  action: string,
  params: Record<string, string | number | boolean | null | undefined> = {}
): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
}
