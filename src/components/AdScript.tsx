import React, { useEffect } from 'react';

interface AdScriptProps {
  adCode: string;
  slot: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * AdScript - Simple component that directly executes ad code
 */
const AdScript: React.FC<AdScriptProps> = ({ adCode, slot, onLoad, onError }) => {
  useEffect(() => {
    if (!adCode?.trim()) {
      console.log(`No ad code for slot: ${slot}`);
      return;
    }

    console.log(`🎯 Executing ad code for slot: ${slot}`);
    
    try {
      // Create a temporary container to parse the ad code
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = adCode;
      
      // Find all script elements
      const scripts = tempDiv.querySelectorAll('script');
      
      if (scripts.length === 0) {
        console.warn(`No scripts found in ad code for slot: ${slot}`);
        return;
      }
      
      scripts.forEach((script, index) => {
        if (script.textContent?.trim()) {
          // Execute inline scripts directly
          try {
            const scriptFunction = new Function(script.textContent);
            scriptFunction();
            console.log(`✅ Executed inline script ${index + 1} for slot: ${slot}`);
          } catch (scriptError) {
            console.error(`❌ Error executing inline script ${index + 1} for slot ${slot}:`, scriptError);
          }
        }
        
        if (script.src) {
          // Load external scripts
          const newScript = document.createElement('script');
          const src = script.src.startsWith('//') ? 'https:' + script.src : script.src;
          
          newScript.src = src;
          newScript.async = true;
          newScript.defer = false;
          
          // Copy attributes
          Array.from(script.attributes).forEach(attr => {
            if (attr.name !== 'src') {
              newScript.setAttribute(attr.name, attr.value);
            }
          });
          
          newScript.onload = () => {
            console.log(`✅ External script loaded for slot ${slot}: ${src}`);
            onLoad?.();
          };
          
          newScript.onerror = (error) => {
            console.error(`❌ External script failed for slot ${slot}: ${src}`, error);
            onError?.(new Error(`Failed to load ${src}`));
          };
          
          document.head.appendChild(newScript);
        }
      });
      
      // Insert any remaining HTML content
      const htmlContent = tempDiv.innerHTML;
      if (htmlContent.trim()) {
        const targetContainer = document.querySelector(`[data-ad-slot="${slot}"]`);
        if (targetContainer) {
          targetContainer.innerHTML = htmlContent;
          console.log(`📝 HTML content inserted for slot: ${slot}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error processing ad code for slot ${slot}:`, error);
      onError?.(error as Error);
    }
  }, [adCode, slot, onLoad, onError]);

  return null;
};

export default AdScript;