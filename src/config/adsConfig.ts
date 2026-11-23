/**
 * Google Test Ad Units Configuration
 * Standard Google test ad IDs for temporary testing and validation
 */

export interface TestAdUnit {
  id: string;
  client: string;
  slot: string;
  name: string;
  format: 'banner' | 'interstitial' | 'rewarded' | 'native' | 'appOpen';
  description: string;
}

export const TEST_AD_CONFIG = {
  banner: {
    id: 'ca-app-pub-3940256099942544/6300978111',
    client: 'ca-pub-3940256099942544',
    slot: '6300978111',
    name: 'Banner Test Ad',
    format: 'banner' as const,
    description: 'Standard 320x50 / 728x90 adaptive responsive banner',
  },
  interstitial: {
    id: 'ca-app-pub-3940256099942544/1033173712',
    client: 'ca-pub-3940256099942544',
    slot: '1033173712',
    name: 'Interstitial Test Ad',
    format: 'interstitial' as const,
    description: 'Full-screen overlay interstitial with skip timer',
  },
  rewarded: {
    id: 'ca-app-pub-3940256099942544/5224354917',
    client: 'ca-pub-3940256099942544',
    slot: '5224354917',
    name: 'Rewarded Video Test Ad',
    format: 'rewarded' as const,
    description: 'Opt-in reward video ad with completion callback',
  },
  native: {
    id: 'ca-app-pub-3940256099942544/2247696110',
    client: 'ca-pub-3940256099942544',
    slot: '2247696110',
    name: 'Native Advanced Test Ad',
    format: 'native' as const,
    description: 'Custom styled in-feed native card matching app theme',
  },
  appOpen: {
    id: 'ca-app-pub-3940256099942544/9257395921',
    client: 'ca-pub-3940256099942544',
    slot: '9257395921',
    name: 'App Open Test Ad',
    format: 'appOpen' as const,
    description: 'Splash screen app foreground transition ad',
  },
};
