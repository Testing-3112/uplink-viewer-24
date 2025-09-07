import React from 'react';
import { useAdCode } from '@/hooks/useWebsiteAds';

interface FirebaseAdLoaderProps {
  slot: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * FirebaseAdLoader - Loads ads from Firebase ad settings
 * This component loads ads from the Firebase 'settings/ads' collection
 * that are managed through the Admin Panel
 */
const FirebaseAdLoader: React.FC<FirebaseAdLoaderProps> = ({ 
  slot, 
  className = "", 
  fallback = null 
}) => {
  const { code, enabled, hasCode } = useAdCode(slot);

  // Don't render if ads are disabled or no code available
  if (!enabled || !hasCode) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <div 
      className={`firebase-ad-container ${className}`}
      data-ad-slot={slot}
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
};

export default FirebaseAdLoader;