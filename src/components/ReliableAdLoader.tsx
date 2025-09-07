import React, { useEffect, useRef, useState } from 'react';
import { getAdCode } from '@/config/adCodes';
import { useAdCodeManager } from '@/hooks/useAdCodeManager';

interface ReliableAdLoaderProps {
  slot: string;
  className?: string;
  fallbackContent?: React.ReactNode;
  style?: React.CSSProperties;
  triggerPopunder?: boolean;
}

/**
 * ReliableAdLoader - Fixed ad loading with proper script execution
 * Features:
 * - Sequential script loading to prevent conflicts
 * - Proper cleanup and re-initialization
 * - Special handling for popunder ads
 * - Error recovery mechanisms
 */
const ReliableAdLoader: React.FC<ReliableAdLoaderProps> = ({ 
  slot, 
  className = "", 
  fallbackContent,
  style = {},
  triggerPopunder = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'success' | 'error' | 'empty'>('loading');
  const [isVisible, setIsVisible] = useState(false);
  const { getAdCode: getEditedAdCode } = useAdCodeManager();
  const loadedScriptsRef = useRef<Set<string>>(new Set());

  // Cleanup function to remove scripts
  const cleanupScripts = () => {
    const scripts = document.querySelectorAll('script[data-ad-slot]');
    scripts.forEach(script => {
      if (script.getAttribute('data-ad-slot') === slot) {
        script.remove();
      }
    });
  };

  // Load script with proper error handling
  const loadScript = (src: string, inline?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.setAttribute('data-ad-slot', slot);
      
      if (src) {
        const fullSrc = src.startsWith('//') ? 'https:' + src : src;
        
        // Check if already loaded
        if (loadedScriptsRef.current.has(fullSrc)) {
          resolve();
          return;
        }
        
        script.src = fullSrc;
        script.async = true;
        script.onload = () => {
          loadedScriptsRef.current.add(fullSrc);
          console.log(`✅ [ReliableAdLoader] Script loaded for ${slot}:`, fullSrc);
          resolve();
        };
        script.onerror = () => {
          console.error(`❌ [ReliableAdLoader] Script failed for ${slot}:`, fullSrc);
          reject(new Error(`Failed to load ${fullSrc}`));
        };
      } else if (inline) {
        script.textContent = inline;
        console.log(`📝 [ReliableAdLoader] Inline script added for ${slot}`);
        setTimeout(resolve, 100); // Give inline scripts time to execute
      }
      
      document.head.appendChild(script);
    });
  };

  // Extract scripts and HTML from ad code
  const parseAdCode = (adCode: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = adCode;
    
    const scripts: Array<{src?: string; content?: string}> = [];
    const scriptElements = tempDiv.querySelectorAll('script');
    
    scriptElements.forEach(script => {
      if (script.src) {
        scripts.push({ src: script.src });
      } else if (script.textContent) {
        scripts.push({ content: script.textContent });
      }
      script.remove();
    });
    
    return {
      scripts,
      html: tempDiv.innerHTML
    };
  };

  // Load ad with improved error handling
  const loadAd = async () => {
    console.log(`🎯 [ReliableAdLoader] Loading ad for slot "${slot}"`);
    
    if (!containerRef.current) {
      console.warn(`⚠️ [ReliableAdLoader] Container not ready for slot "${slot}"`);
      return;
    }

    const originalCode = getAdCode(slot);
    const adCode = getEditedAdCode(slot, originalCode);
    
    if (!adCode?.trim()) {
      console.log(`❌ [ReliableAdLoader] No ad code found for slot "${slot}"`);
      setLoadStatus('empty');
      return;
    }

    console.log(`📋 [ReliableAdLoader] Ad code for "${slot}":`, adCode.substring(0, 100) + '...');

    try {
      const container = containerRef.current;
      
      // Clear container and cleanup old scripts
      container.innerHTML = '';
      cleanupScripts();
      
      // Parse ad code
      const { scripts, html } = parseAdCode(adCode);
      
      // Add HTML content first
      if (html.trim()) {
        container.innerHTML = html;
      }
      
      // Load scripts sequentially
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        try {
          if (script.src) {
            await loadScript(script.src);
          } else if (script.content) {
            await loadScript('', script.content);
          }
          
          // Add delay between scripts to prevent conflicts
          if (i < scripts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.warn(`⚠️ [ReliableAdLoader] Script ${i + 1} failed for slot "${slot}":`, error);
          // Continue with next script
        }
      }
      
      // Special handling for popunder ads
      if (slot === 'popupAd' && triggerPopunder) {
        console.log(`🚀 [ReliableAdLoader] Triggering popunder for slot "${slot}"`);
        // Force trigger popunder after a delay
        setTimeout(() => {
          try {
            // Try to find and trigger popunder functions
            const possibleTriggers = ['pop', 'popunder', 'popup', 'trigger'];
            possibleTriggers.forEach(trigger => {
              if ((window as any)[trigger] && typeof (window as any)[trigger] === 'function') {
                (window as any)[trigger]();
              }
            });
            
            // Force click events that might trigger popunders
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            document.body.dispatchEvent(clickEvent);
          } catch (error) {
            console.warn('⚠️ [ReliableAdLoader] Could not trigger popunder:', error);
          }
        }, 1000);
      }
      
      // Wait for ad content to render and force reload if needed
      setTimeout(() => {
        const hasContent = container.innerHTML.trim().length > 0 || 
                          container.querySelector('iframe, img, div[id], div[class]');
        
        if (hasContent || scripts.length > 0) {
          console.log(`🎉 [ReliableAdLoader] Ad loaded successfully for slot "${slot}"`);
          setLoadStatus('success');
        } else {
          console.log(`⚠️ [ReliableAdLoader] No content rendered for slot "${slot}", retrying...`);
          // Force a retry by reloading the page scripts
          if (scripts.length > 0) {
            scripts.forEach(script => {
              if (script.src) {
                const newScript = document.createElement('script');
                newScript.src = script.src.startsWith('//') ? 'https:' + script.src : script.src;
                newScript.async = true;
                document.head.appendChild(newScript);
              }
            });
          }
          setLoadStatus('error');
        }
      }, 3000);
      
    } catch (error) {
      console.error(`❌ [ReliableAdLoader] Error loading ad for slot "${slot}":`, error);
      setLoadStatus('error');
    }
  };

  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  // Load ad when visible
  useEffect(() => {
    if (isVisible) {
      loadAd();
    }
  }, [slot, isVisible, triggerPopunder]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupScripts();
    };
  }, []);

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
        return { ...baseStyle, minHeight: '90px', width: '100%' };
      case 'directLink':
        return { ...baseStyle, minHeight: '250px', width: '300px', margin: '0 auto' };
      case 'banner320x50':
        return { ...baseStyle, minHeight: '50px', width: '320px', margin: '0 auto' };
      case 'nativeAd':
        return { ...baseStyle, minHeight: '100px', width: '100%' };
      case 'popupAd':
      case 'socialBar':
        return { ...baseStyle, minHeight: '1px', width: '1px', opacity: 0 };
      default:
        return baseStyle;
    }
  };

  return (
    <div className={`reliable-ad-container ${className}`} style={getDefaultStyle()}>
      <div 
        ref={containerRef} 
        className="ad-content w-full h-full"
        style={{ opacity: slot === 'popupAd' || slot === 'socialBar' ? 0 : 1 }}
      />
      
      {/* Show fallback content for empty/error states */}
      {(loadStatus === 'empty' || loadStatus === 'error') && fallbackContent && (
        <div className="ad-fallback w-full h-full flex items-center justify-center">
          {fallbackContent}
        </div>
      )}
      
      {/* Loading indicator for visible ads */}
      {loadStatus === 'loading' && slot !== 'popupAd' && slot !== 'socialBar' && (
        <div className="ad-loading w-full h-full flex items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Loading ad...
          </div>
        </div>
      )}
    </div>
  );
};

export default ReliableAdLoader;