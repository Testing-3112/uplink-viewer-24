import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getAdCode } from '@/config/adCodes';
import { useAdCodeManager } from '@/hooks/useAdCodeManager';

interface RobustAdLoaderProps {
  slot: string;
  className?: string;
  fallbackContent?: React.ReactNode;
  style?: React.CSSProperties;
  showFallbackOnBlock?: boolean;
}

/**
 * RobustAdLoader - Enhanced ad loading with ad blocker detection and graceful handling
 * Features:
 * - Ad blocker detection
 * - Graceful fallback for blocked ads
 * - Better error handling
 * - Silent failure when ads are blocked
 * - Improved script loading mechanism
 */
const RobustAdLoader: React.FC<RobustAdLoaderProps> = ({ 
  slot, 
  className = "", 
  fallbackContent,
  style = {},
  showFallbackOnBlock = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'success' | 'blocked' | 'error' | 'empty'>('loading');
  const [isAdBlocked, setIsAdBlocked] = useState(false);
  const { getAdCode: getEditedAdCode } = useAdCodeManager();

  // Detect ad blocker by trying to load a known ad domain
  const detectAdBlocker = useCallback(async (): Promise<boolean> => {
    try {
      // Create a test element that ad blockers typically block
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.position = 'absolute';
      testAd.style.left = '-10000px';
      testAd.style.width = '1px';
      testAd.style.height = '1px';
      
      document.body.appendChild(testAd);
      
      // Check if the element is hidden/blocked
      await new Promise(resolve => setTimeout(resolve, 100));
      const isBlocked = testAd.offsetHeight === 0;
      
      document.body.removeChild(testAd);
      
      return isBlocked;
    } catch (error) {
      // If we can't detect, assume not blocked
      return false;
    }
  }, []);

  const loadAd = async () => {
    if (!containerRef.current) return;

    const originalCode = getAdCode(slot);
    const adCode = getEditedAdCode(slot, originalCode);
    
    console.log(`🔍 [RobustAdLoader] Loading ad for slot "${slot}"`);
    console.log(`📋 [RobustAdLoader] Original code found:`, !!originalCode);
    console.log(`📋 [RobustAdLoader] Final code length: ${adCode?.length || 0}`);
    console.log(`📋 [RobustAdLoader] Ad code preview:`, adCode?.substring(0, 100) + "...");
    
    if (!adCode?.trim()) {
      console.warn(`⚠️ [RobustAdLoader] No ad code found for slot "${slot}"`);
      console.warn(`⚠️ [RobustAdLoader] Available slots:`, Object.keys(getAdCode('')));
      setLoadStatus('empty');
      return;
    }

    // Check for ad blocker first
    const isBlocked = await detectAdBlocker();
    if (isBlocked) {
      setIsAdBlocked(true);
      setLoadStatus('blocked');
      console.log(`🚫 [AdLoader] Ad blocker detected for slot "${slot}"`);
      return;
    }

    try {
      const container = containerRef.current;
      container.innerHTML = '';
      
      // Create ad wrapper
      const adWrapper = document.createElement('div');
      adWrapper.className = 'ad-content-wrapper';
      adWrapper.innerHTML = adCode;
      
      // Handle scripts with improved error handling
      const scripts = adWrapper.querySelectorAll('script');
      let scriptsLoaded = 0;
      let scriptsTotal = scripts.length;
      
      if (scriptsTotal === 0) {
        // No scripts, just add content
        container.appendChild(adWrapper);
        console.log(`✅ [RobustAdLoader] Ad loaded successfully for slot "${slot}" (no scripts)`);
        setLoadStatus('success');
        return;
      }

      scripts.forEach((script, index) => {
        const newScript = document.createElement('script');
        
        // Copy attributes
        Array.from(script.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        if (script.src) {
          // External script with timeout and error handling
          const timeoutId = setTimeout(() => {
            console.warn(`⏰ [AdLoader] Script timeout for slot "${slot}"`);
            scriptsLoaded++;
            if (scriptsLoaded === scriptsTotal) {
              setLoadStatus('success');
            }
          }, 5000); // 5 second timeout

          newScript.onload = () => {
            clearTimeout(timeoutId);
            scriptsLoaded++;
            console.log(`✅ [RobustAdLoader] Script loaded ${scriptsLoaded}/${scriptsTotal} for slot "${slot}"`);
            if (scriptsLoaded === scriptsTotal) {
              console.log(`🎉 [RobustAdLoader] All scripts loaded for slot "${slot}"`);
              setLoadStatus('success');
            }
          };
          
          newScript.onerror = () => {
            clearTimeout(timeoutId);
            console.warn(`⚠️ [AdLoader] Script failed to load for slot "${slot}"`);
            // Don't treat as complete failure, just increment counter
            scriptsLoaded++;
            if (scriptsLoaded === scriptsTotal) {
              setLoadStatus(isAdBlocked ? 'blocked' : 'success');
            }
          };
          
          // Ensure HTTPS for secure loading
          newScript.src = script.src.startsWith('//') ? 'https:' + script.src : script.src;
          newScript.async = true;
        } else {
          // Inline script
          newScript.textContent = script.textContent || script.innerHTML;
          scriptsLoaded++;
        }
        
        script.remove();
        
        // Add script to head to avoid blocking
        try {
          document.head.appendChild(newScript);
        } catch (error) {
          console.warn(`⚠️ [AdLoader] Failed to append script for slot "${slot}"`);
          scriptsLoaded++;
        }
      });
      
      // Add remaining HTML content
      container.appendChild(adWrapper);
      
      // If all scripts were inline, mark as success
      if (scriptsTotal === scriptsLoaded) {
        setLoadStatus('success');
      }
      
    } catch (error) {
      console.warn(`⚠️ [AdLoader] Error loading ad for slot "${slot}":`, error);
      setLoadStatus('error');
    }
  };

  useEffect(() => {
    loadAd();
  }, [slot]);

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

  // Don't render anything if ads are blocked and no fallback requested
  if (loadStatus === 'blocked' && !showFallbackOnBlock) {
    return null;
  }

  // Don't render anything if no ad code available
  if (loadStatus === 'empty') {
    return null;
  }

  return (
    <div className={`robust-ad-container ${className}`} style={getDefaultStyle()}>
      <div 
        ref={containerRef} 
        className="ad-content w-full h-full"
      />
      
      {/* Show fallback content only for error states or when requested for blocked ads */}
      {((loadStatus === 'error') || (loadStatus === 'blocked' && showFallbackOnBlock)) && fallbackContent && (
        <div className="ad-fallback w-full h-full flex items-center justify-center">
          {fallbackContent}
        </div>
      )}
      
      {/* Minimal loading indicator */}
      {loadStatus === 'loading' && (
        <div className="ad-loading w-full h-full flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default RobustAdLoader;