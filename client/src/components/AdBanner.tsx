import React, { useEffect, useRef, useState } from 'react';
import { ADSENSE_CONFIG, shouldShowAds } from '@/config/adsense';

interface AdBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'banner';
  className?: string;
  style?: React.CSSProperties;
  isAuthenticated?: boolean;
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  adSlot, 
  adFormat = 'auto',
  className = '',
  style = {},
  isAuthenticated = false
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    // Check if ads should be shown
    if (!shouldShowAds(isAuthenticated)) {
      return;
    }

    // Check if AdSense is loaded
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      try {
        // Push the ad to AdSense
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
        setAdLoaded(true);
      } catch (error) {
        console.warn('AdSense error:', error);
        setAdError(true);
      }
    } else {
      // If AdSense is not loaded, try again after a delay
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
          try {
            (window as any).adsbygoogle = (window as any).adsbygoogle || [];
            (window as any).adsbygoogle.push({});
            setAdLoaded(true);
          } catch (error) {
            console.warn('AdSense error:', error);
            setAdError(true);
          }
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [adSlot, isAuthenticated]);

  // Don't render ads if they shouldn't be shown
  if (!shouldShowAds(isAuthenticated)) {
    return null;
  }

  // Show placeholder in development mode
  if (ADSENSE_CONFIG.DEVELOPMENT_MODE) {
    return (
      <div 
        ref={adRef}
        className={`ad-banner ad-placeholder ${className}`}
        style={{
          ...style,
          background: '#f0f0f0',
          border: '2px dashed #ccc',
          padding: '20px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
          borderRadius: '8px'
        }}
      >
        <div>📢 Ad Space</div>
        <div style={{ fontSize: '12px', marginTop: '5px' }}>
          Slot: {adSlot} | Format: {adFormat}
        </div>
        <div style={{ fontSize: '10px', marginTop: '5px', color: '#999' }}>
          (Development Mode)
        </div>
      </div>
    );
  }

  // Show error state
  if (adError) {
    return (
      <div 
        className={`ad-banner ad-error ${className}`}
        style={{
          ...style,
          background: '#fef2f2',
          border: '1px solid #fecaca',
          padding: '10px',
          textAlign: 'center',
          color: '#dc2626',
          fontSize: '12px',
          borderRadius: '4px'
        }}
      >
        Ad temporarily unavailable
      </div>
    );
  }

  return (
    <div 
      ref={adRef}
      className={`ad-banner ${className}`}
      style={{
        ...style,
        textAlign: 'center',
        margin: '20px 0',
        minHeight: '90px',
        opacity: adLoaded ? 1 : 0.7,
        transition: 'opacity 0.3s ease'
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CONFIG.PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner; 