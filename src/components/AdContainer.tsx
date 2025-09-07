import React from 'react';
import DynamicAdLoader from './DynamicAdLoader';

// Ad container component for dynamic ad loading
interface AdContainerProps {
  slot: 'footerBanner' | 'directLink' | 'nativeAd' | 'popupAd' | 'headerBanner' | 'socialBar';
  className?: string;
  showPlaceholder?: boolean;
}

const AdContainer: React.FC<AdContainerProps> = ({ 
  slot, 
  className = "",
  showPlaceholder = false 
}) => {
  const placeholderContent = showPlaceholder ? (
    <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center text-slate-500 dark:text-slate-400">
      <p className="text-sm">Ad Slot: {slot}</p>
      <p className="text-xs mt-1 opacity-60">Content will load from Firestore</p>
    </div>
  ) : null;

  return (
    <DynamicAdLoader 
      slot={slot}
      className={className}
      fallbackContent={placeholderContent}
    />
  );
};

export default AdContainer;