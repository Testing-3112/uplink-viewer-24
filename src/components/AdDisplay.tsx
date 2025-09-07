import React from 'react';
import SimpleAdLoader from './SimpleAdLoader';
import { getAdConfig } from '@/config/adCodes';

interface AdDisplayProps {
  slot: 'footerBanner' | 'directLink' | 'nativeAd' | 'popupAd' | 'headerBanner' | 'socialBar' | 'banner320x50';
  className?: string;
  showPlaceholder?: boolean;
  triggerPopunder?: boolean;
}

/**
 * AdDisplay - Main component for displaying ads with reliable loading
 */
const AdDisplay: React.FC<AdDisplayProps> = ({ 
  slot, 
  className = "",
  showPlaceholder = false,
  triggerPopunder = false
}) => {
  const adConfig = getAdConfig(slot);
  
  const placeholderContent = showPlaceholder ? (
    <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center text-slate-500 dark:text-slate-400">
      <p className="text-sm font-medium">
        {adConfig?.name || `Ad Slot: ${slot}`}
      </p>
      <p className="text-xs mt-1 opacity-60">
        {adConfig?.description || 'Advertisement will load here'}
      </p>
      {adConfig?.dimensions && (
        <p className="text-xs mt-1 opacity-40">
          Size: {adConfig.dimensions.width}x{adConfig.dimensions.height}
        </p>
      )}
    </div>
  ) : null;

  return (
    <div className={className}>
      <SimpleAdLoader 
        slot={slot}
        triggerPopunder={triggerPopunder}
      />
      {showPlaceholder && !getAdConfig(slot)?.code && placeholderContent}
    </div>
  );
};

export default AdDisplay;