import React, { useEffect, useRef } from 'react';
import { getAdCode } from '@/config/adCodes';
import { useAdCodeManager } from '@/hooks/useAdCodeManager';

interface StaticAdLoaderProps {
  slot: string;
  className?: string;
  fallbackContent?: React.ReactNode;
}

/**
 * Simplified StaticAdLoader - Direct script injection
 */
const StaticAdLoader: React.FC<StaticAdLoaderProps> = ({ 
  slot, 
  className = "", 
  fallbackContent 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptInjectedRef = useRef(false);
  const { getAdCode: getEditedAdCode } = useAdCodeManager();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || scriptInjectedRef.current) return;

    const originalCode = getAdCode(slot);
    const adCode = getEditedAdCode(slot, originalCode);
    
    console.log(`🎯 Loading ad for slot "${slot}":`, { hasCode: !!adCode, codeLength: adCode?.length });
    
    if (!adCode?.trim()) {
      console.log(`⚠️ No ad code found for slot "${slot}"`);
      return;
    }

    try {
      // Create a temporary container to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = adCode;
      
      // Extract and execute scripts first
      const scripts = tempDiv.getElementsByTagName('script');
      const scriptsArray = Array.from(scripts);
      
      scriptsArray.forEach((script) => {
        const newScript = document.createElement('script');
        
        if (script.src) {
          // External script
          newScript.src = script.src.startsWith('//') ? 'https:' + script.src : script.src;
          newScript.async = false;
          newScript.defer = false;
        } else {
          // Inline script
          newScript.textContent = script.textContent || script.innerHTML;
        }
        
        // Copy other attributes
        Array.from(script.attributes).forEach(attr => {
          if (attr.name !== 'src') {
            newScript.setAttribute(attr.name, attr.value);
          }
        });
        
        document.head.appendChild(newScript);
      });
      
      // Remove scripts from temp div and inject remaining HTML
      scriptsArray.forEach(script => script.remove());
      container.innerHTML = tempDiv.innerHTML;
      
      scriptInjectedRef.current = true;
      console.log(`✅ Ad successfully loaded for slot "${slot}" with ${scriptsArray.length} scripts`);
      
    } catch (error) {
      console.error(`❌ Error loading ad for ${slot}:`, error);
    }

  }, [slot, getEditedAdCode]);

  // Reset when slot changes
  useEffect(() => {
    scriptInjectedRef.current = false;
  }, [slot]);

  return (
    <div className={`static-ad-container ${className}`}>
      <div 
        ref={containerRef} 
        className="ad-content"
        style={{ 
          minHeight: '50px',
          textAlign: 'center'
        }}
      />
      {!getAdCode(slot) && fallbackContent && (
        <div className="ad-fallback">
          {fallbackContent}
        </div>
      )}
    </div>
  );
};

export default StaticAdLoader;