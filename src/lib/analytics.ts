export const analyticsConfig = {
  facebookPixel: {
    enabled: process.env.NEXT_PUBLIC_FB_PIXEL_ID !== undefined,
    pixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || '',
  },
  googleAnalytics: {
    enabled: process.env.NEXT_PUBLIC_GA_ID !== undefined,
    trackingId: process.env.NEXT_PUBLIC_GA_ID || '',
  },
};

export const facebookPixelEvents = {
  ViewContent: 'ViewContent',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  Purchase: 'Purchase',
  Lead: 'Lead',
};

export function trackEvent(eventName: string, params?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && analyticsConfig.facebookPixel.enabled) {
    (window as any).fbq?.('track', eventName, params);
  }
}