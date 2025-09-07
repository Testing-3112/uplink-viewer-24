import React, { useEffect, useRef, useState } from 'react';
import { getAdCode } from '@/config/adCodes';
import { useAdCodeManager } from '@/hooks/useAdCodeManager';

interface ImprovedAdLoaderProps {
  slot: string;
  className?: string;
  fallbackContent?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * ImprovedAdLoader - Enhanced ad loading with better script handling
 * Features:
 * - Better script execution timing
 * - Error handling and fallbacks 
 * - Multiple loading strategies
 * - Debugging information
 */
const ImprovedAdLoader: React.FC<ImprovedAdLoaderProps> = ({ 
  slot, 
  className = "", 
  fallbackContent,
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'success' | 'error' | 'empty'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const { getAdCode: getEditedAdCode } = useAdCodeManager();

  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  const loadAd = async () => {
    console.log(`🎯 [AdLoader] Loading ad for slot "${slot}" (attempt ${retryCount + 1})`);
    
    if (!containerRef.current) {
      console.warn(`⚠️ [AdLoader] Container not ready for slot "${slot}"`);
      return;
    }

    const originalCode = getAdCode(slot);
    const adCode = getEditedAdCode(slot, originalCode);
    
    if (!adCode?.trim()) {
      console.log(`❌ [AdLoader] No ad code found for slot "${slot}"`);
      setLoadStatus('empty');
      return;
    }

    try {
      const container = containerRef.current;
      
      // Clear previous content
      container.innerHTML = '';
      
      // Create a wrapper div for the ad
      const adWrapper = document.createElement('div');
      adWrapper.className = 'ad-content-wrapper';
      adWrapper.innerHTML = adCode;
      
      // Extract and handle scripts
      const scripts = adWrapper.querySelectorAll('script');
      const scriptPromises: Promise<void>[] = [];
      
      scripts.forEach((script, index) => {
        const newScript = document.createElement('script');
        
        // Copy attributes
        Array.from(script.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        if (script.src) {
          // External script - load with promise
          scriptPromises.push(new Promise((resolve, reject) => {
            newScript.onload = () => {
              console.log(`✅ [AdLoader] External script ${index + 1} loaded for slot "${slot}"`);
              resolve();
            };
            newScript.onerror = () => {
              console.error(`❌ [AdLoader] External script ${index + 1} failed for slot "${slot}"`);
              reject(new Error(`Script ${index + 1} failed to load`));
            };
            newScript.src = script.src.startsWith('//') ? 'https:' + script.src : script.src;
            newScript.async = false;
          }));
        } else {
          // Inline script
          newScript.textContent = script.textContent || script.innerHTML;
          console.log(`📝 [AdLoader] Inline script ${index + 1} added for slot "${slot}"`);
        }
        
        // Remove old script and add new one
        script.remove();
        document.head.appendChild(newScript);
      });
      
      // Add remaining HTML content to container
      container.appendChild(adWrapper);
      
      // Wait for external scripts to load
      if (scriptPromises.length > 0) {
        try {
          await Promise.all(scriptPromises);
          console.log(`✅ [AdLoader] All scripts loaded successfully for slot "${slot}"`);
        } catch (error) {
          console.warn(`⚠️ [AdLoader] Some scripts failed to load for slot "${slot}":`, error);
          // Continue anyway, some ads might still work
        }
      }
      
      // Give scripts time to execute and render
      setTimeout(() => {
        // Check if ad content was actually rendered
        const hasContent = container.querySelector('iframe, img, div[id], div[class]');
        if (hasContent) {
          console.log(`🎉 [AdLoader] Ad content detected for slot "${slot}"`);
          setLoadStatus('success');
        } else {
          console.log(`⚠️ [AdLoader] No visible ad content for slot "${slot}", but scripts executed`);
          setLoadStatus('success'); // Still consider it success if scripts ran
        }
      }, 1000);
      
    } catch (error) {
      console.error(`❌ [AdLoader] Error loading ad for slot "${slot}":`, error);
      setLoadStatus('error');
    }
  };

  // Retry mechanism
  const retryLoad = () => {
    if (retryCount < maxRetries) {
      console.log(`🔄 [AdLoader] Retrying ad load for slot "${slot}" in ${retryDelay}ms`);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setLoadStatus('loading');
      }, retryDelay);
    } else {
      console.log(`❌ [AdLoader] Max retries reached for slot "${slot}"`);
      setLoadStatus('error');
    }
  };

  useEffect(() => {
    loadAd();
  }, [slot, retryCount]);

  // Auto-retry on error
  useEffect(() => {
    if (loadStatus === 'error' && retryCount < maxRetries) {
      retryLoad();
    }
  }, [loadStatus, retryCount]);

  const getDefaultStyle = () => {
    const baseStyle: React.CSSProperties = {
      minHeight: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    };

    // Add specific dimensions based on slot
    switch (slot) {
      case 'headerBanner':
      case 'footerBanner':
        return { ...baseStyle, minHeight: '90px' };
      case 'directLink':
        return { ...baseStyle, minHeight: '250px', maxWidth: '300px' };
      case 'banner320x50':
        return { ...baseStyle, minHeight: '50px', maxWidth: '320px' };
      default:
        return baseStyle;
    }
  };

  return (
    <div className={`improved-ad-container ${className}`} style={getDefaultStyle()}>
      <div 
        ref={containerRef} 
        className="ad-content w-full h-full"
      />
      
      {/* Show fallback content for empty/error states */}
      {(loadStatus === 'empty' || (loadStatus === 'error' && retryCount >= maxRetries)) && fallbackContent && (
        <div className="ad-fallback w-full h-full flex items-center justify-center">
          {fallbackContent}
        </div>
      )}
      
      {/* Loading indicator */}
      {loadStatus === 'loading' && (
        <div className="ad-loading w-full h-full flex items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Loading ad... {retryCount > 0 && `(retry ${retryCount})`}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedAdLoader;