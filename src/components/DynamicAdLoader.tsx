import React, { useEffect, useRef } from 'react';
import { useDynamicAds } from '@/hooks/useDynamicAds';

interface DynamicAdLoaderProps {
  slot: string;
  className?: string;
  fallbackContent?: React.ReactNode;
}

const DynamicAdLoader: React.FC<DynamicAdLoaderProps> = ({ 
  slot, 
  className = "", 
  fallbackContent 
}) => {
  const { data: ads, isLoading, error } = useDynamicAds();
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptInjectedRef = useRef(false);

  useEffect(() => {
    if (!ads || isLoading || !containerRef.current) return;

    const adCode = ads[slot];
    if (adCode && !scriptInjectedRef.current) {
      try {
        // Clear any existing content
        containerRef.current.innerHTML = '';
        
        // Create a temporary div to parse the ad code
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = adCode;
        
        // Extract and execute scripts
        const scripts = tempDiv.querySelectorAll('script');
        scripts.forEach((script) => {
          const newScript = document.createElement('script');
          
          // Copy attributes
          Array.from(script.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          
          // Copy script content
          newScript.textContent = script.textContent;
          
          // Remove the script from temp div and add to container
          script.remove();
          containerRef.current?.appendChild(newScript);
        });
        
        // Add any remaining HTML content
        containerRef.current.appendChild(tempDiv);
        
        scriptInjectedRef.current = true;
        console.log(`✅ Ad loaded for slot: ${slot}`);
      } catch (error) {
        console.error(`❌ Error injecting ad for slot ${slot}:`, error);
      }
    }
  }, [ads, slot, isLoading]);

  // Reset script injection when ads change
  useEffect(() => {
    scriptInjectedRef.current = false;
  }, [ads]);

  if (isLoading) {
    return (
      <div className={`ad-loading ${className}`}>
        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-20 flex items-center justify-center">
          <span className="text-slate-500 text-sm">Loading ad...</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading ads:', error);
    return fallbackContent || null;
  }

  const adCode = ads?.[slot];
  if (!adCode) {
    return fallbackContent || null;
  }

  return (
    <div 
      ref={containerRef}
      className={`dynamic-ad ${className}`}
      id={slot}
      data-ad-slot={slot}
    />
  );
};

export default DynamicAdLoader;