import React, { useEffect, useRef } from 'react';
import { getAdCode } from '@/config/adCodes';
import AdScript from './AdScript';

interface SimpleAdLoaderProps {
  slot: string;
  className?: string;
  triggerPopunder?: boolean;
}

/**
 * Simple Ad Loader - Direct HTML injection without complex script handling
 */
const SimpleAdLoader: React.FC<SimpleAdLoaderProps> = ({ 
  slot, 
  className = "",
  triggerPopunder = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || loadedRef.current) return;

    const adCode = getAdCode(slot);
    if (!adCode?.trim()) {
      console.log(`No ad code for slot: ${slot}`);
      return;
    }

    console.log(`🎯 Loading ad for slot: ${slot}`);
    
    try {
      // Clear container first
      containerRef.current.innerHTML = '';
      
      // Parse the ad code to separate HTML and scripts
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = adCode;
      
      // Extract scripts
      const scripts = tempDiv.querySelectorAll('script');
      const scriptsArray = Array.from(scripts);
      
      // Remove scripts from HTML and inject remaining content
      scriptsArray.forEach(script => script.remove());
      containerRef.current.innerHTML = tempDiv.innerHTML;
      
      // Execute scripts properly
      scriptsArray.forEach((script, index) => {
        const newScript = document.createElement('script');
        
        if (script.src) {
          // External script
          const src = script.src.startsWith('//') ? 'https:' + script.src : script.src;
          newScript.src = src;
          newScript.async = true;
          newScript.onload = () => console.log(`✅ Script ${index + 1} loaded for ${slot}: ${src}`);
          newScript.onerror = () => console.error(`❌ Script ${index + 1} failed for ${slot}: ${src}`);
        } else if (script.textContent || script.innerHTML) {
          // Inline script
          newScript.textContent = script.textContent || script.innerHTML;
          console.log(`📝 Inline script ${index + 1} added for ${slot}`);
        }
        
        // Copy other attributes
        Array.from(script.attributes).forEach(attr => {
          if (attr.name !== 'src') {
            newScript.setAttribute(attr.name, attr.value);
          }
        });
        
        document.head.appendChild(newScript);
      });
      
      loadedRef.current = true;
      console.log(`🎉 Ad setup complete for ${slot} with ${scriptsArray.length} scripts`);

      // For popunder ads, try to trigger after scripts load
      if (slot === 'popupAd' && triggerPopunder) {
        setTimeout(() => {
          try {
            // Create a click event to trigger popunder
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            document.body.dispatchEvent(clickEvent);
            console.log(`🚀 Triggered popunder for slot: ${slot}`);
          } catch (error) {
            console.warn('Could not trigger popunder:', error);
          }
        }, 2000);
      }

    } catch (error) {
      console.error(`Error loading ad for ${slot}:`, error);
    }
  }, [slot, triggerPopunder]);

  // Reset when slot changes
  useEffect(() => {
    loadedRef.current = false;
  }, [slot]);

  const getContainerStyle = () => {
    const baseStyle: React.CSSProperties = {
      minHeight: '50px',
      textAlign: 'center'
    };

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
        return { ...baseStyle, minHeight: '1px', width: '1px', opacity: 0, position: 'absolute' as const };
      default:
        return baseStyle;
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`simple-ad-loader ${className}`}
      style={getContainerStyle()}
      data-ad-slot={slot}
    >
      <AdScript 
        adCode={getAdCode(slot)} 
        slot={slot}
        onLoad={() => console.log(`Ad loaded for slot: ${slot}`)}
        onError={(error) => console.error(`Ad error for slot ${slot}:`, error)}
      />
    </div>
  );
};

export default SimpleAdLoader;