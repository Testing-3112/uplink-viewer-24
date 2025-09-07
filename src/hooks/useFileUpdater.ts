import { useState } from 'react';
import { toast } from './use-toast';

export interface FileUpdateResult {
  success: boolean;
  message: string;
}

export function useFileUpdater() {
  const [updating, setUpdating] = useState(false);

  const updateAdCodesFile = async (editedCodes: Record<string, string>): Promise<FileUpdateResult> => {
    setUpdating(true);
    
    try {
      // In a real implementation, this would make an API call to a backend service
      // that can write to the filesystem. For now, we'll simulate the functionality
      // and provide clear feedback to the user.
      
      console.log('🔄 Attempting to update ad codes file...');
      console.log('📝 Edited codes:', editedCodes);
      
      // Generate the new file content
      const updatedFileContent = generateAdCodesFileContent(editedCodes);
      console.log('📄 Generated file content:', updatedFileContent.substring(0, 500) + '...');
      
      // Simulate the file update process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Since we can't actually write to the file system in the browser,
      // we'll provide the user with the updated content to copy manually
      await navigator.clipboard.writeText(updatedFileContent);
      
      toast({
        title: "File Content Generated! 📋",
        description: "The updated adCodes.ts content has been copied to your clipboard. Please replace the content of src/config/adCodes.ts with the copied content to make changes permanent.",
        duration: 8000,
      });
      
      return {
        success: true,
        message: "File content generated and copied to clipboard. Please update src/config/adCodes.ts manually."
      };
      
    } catch (error) {
      console.error('❌ Error updating ad codes file:', error);
      
      toast({
        title: "Error",
        description: "Failed to generate updated file content. Please try again.",
        variant: "destructive",
      });
      
      return {
        success: false,
        message: "Failed to generate updated file content."
      };
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateAdCodesFile,
    updating
  };
}

function generateAdCodesFileContent(editedCodes: Record<string, string>): string {
  // Get the current date for the comment
  const currentDate = new Date().toISOString().split('T')[0];
  
  return `/**
 * Ad Code Configuration
 * 
 * This file contains all Adsterra ad codes for easy management.
 * To update ads, simply modify the codes in this file.
 * 
 * Last updated: ${currentDate}
 */

export interface AdCodeConfig {
  id: string;
  name: string;
  description: string;
  code: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

// All Adsterra Ad Codes - Updated with current website codes
export const AD_CODES: Record<string, AdCodeConfig> = {
  // Direct Link Ad - 300x250 (Banner 300x250)
  directLink: {
    id: 'directLink',
    name: 'Banner 300x250',
    description: 'Medium rectangle banner ad (300x250)',
    dimensions: { width: 300, height: 250 },
    code: \`${escapeBackticks(editedCodes.directLink || getDefaultAdCode('directLink'))}\`
  },

  // Footer Banner Ad - 728x90 (Banner 728x90)
  footerBanner: {
    id: 'footerBanner',
    name: 'Banner 728x90',
    description: 'Leaderboard banner ad (728x90)',
    dimensions: { width: 728, height: 90 },
    code: \`${escapeBackticks(editedCodes.footerBanner || getDefaultAdCode('footerBanner'))}\`
  },

  // Header Banner Ad - 728x90 (same as footer for header)
  headerBanner: {
    id: 'headerBanner',
    name: 'Header Banner 728x90', 
    description: 'Top banner advertisement (728x90)',
    dimensions: { width: 728, height: 90 },
    code: \`${escapeBackticks(editedCodes.headerBanner || getDefaultAdCode('headerBanner'))}\`
  },

  // Social Bar Ad - 320x50 (Banner 320x50)
  socialBar: {
    id: 'socialBar',
    name: 'Banner 320x50',
    description: 'Mobile banner ad (320x50)',
    dimensions: { width: 320, height: 50 },
    code: \`${escapeBackticks(editedCodes.socialBar || getDefaultAdCode('socialBar'))}\`
  },

  // Native Ad - Native Banner
  nativeAd: {
    id: 'nativeAd',
    name: 'Native Banner',
    description: 'Native content ad - blends with content',
    code: \`${escapeBackticks(editedCodes.nativeAd || getDefaultAdCode('nativeAd'))}\`
  },

  // Popup Ad - Popunder
  popupAd: {
    id: 'popupAd',
    name: 'Popunder',
    description: 'Popup/overlay advertisement',
    code: \`${escapeBackticks(editedCodes.popupAd || getDefaultAdCode('popupAd'))}\`
  }
};

// Helper function to get ad code by slot
export const getAdCode = (slot: string): string => {
  const adConfig = AD_CODES[slot];
  return adConfig ? adConfig.code : '';
};

// Helper function to get all available ad slots
export const getAvailableAdSlots = (): string[] => {
  return Object.keys(AD_CODES);
};

// Helper function to get ad configuration
export const getAdConfig = (slot: string): AdCodeConfig | null => {
  return AD_CODES[slot] || null;
};

// Export for easy importing
export default AD_CODES;`;
}

function escapeBackticks(str: string): string {
  return str.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function getDefaultAdCode(slot: string): string {
  const defaultCodes: Record<string, string> = {
    directLink: `<script type="text/javascript">
	atOptions = {
		'key' : 'edbc0e88c4099d02175e1e3b024d8538',
		'format' : 'iframe',
		'height' : 250,
		'width' : 300,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//abdicateeffectlucky.com/edbc0e88c4099d02175e1e3b024d8538/invoke.js"></script>`,
    
    footerBanner: `<script type="text/javascript">
	atOptions = {
		'key' : 'b903fa845297e51d387c03016df6531e',
		'format' : 'iframe',
		'height' : 90,
		'width' : 728,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//abdicateeffectlucky.com/b903fa845297e51d387c03016df6531e/invoke.js"></script>`,
    
    headerBanner: `<script type="text/javascript">
	atOptions = {
		'key' : 'b903fa845297e51d387c03016df6531e',
		'format' : 'iframe',
		'height' : 90,
		'width' : 728,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//abdicateeffectlucky.com/b903fa845297e51d387c03016df6531e/invoke.js"></script>`,
    
    socialBar: `<script type='text/javascript' src='//abdicateeffectlucky.com/bd/b0/34/bdb034c6bbb6dcb7f08c2c9a63f57a9f.js'></script>`,
    
    nativeAd: `<script async="async" data-cfasync="false" src="//abdicateeffectlucky.com/cd61435395a70ff02c61db7e95d4252b/invoke.js"></script>
<div id="container-cd61435395a70ff02c61db7e95d4252b"></div>`,
    
    popupAd: `<script type='text/javascript' src='//abdicateeffectlucky.com/7b/c3/27/7bc3271a7d97b8e5bf2c6a3a9d670106.js'></script>`
  };
  
  return defaultCodes[slot] || '';
}