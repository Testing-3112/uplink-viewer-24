/**
 * Ad Code Configuration
 * 
 * This file contains all Adsterra ad codes for easy management.
 * To update ads, simply modify the codes in this file.
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
    code: `<script type="text/javascript">
	atOptions = {
		'key' : 'edbc0e88c4099d02175e1e3b024d8538',
		'format' : 'iframe',
		'height' : 250,
		'width' : 300,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//abdicateeffectlucky.com/edbc0e88c4099d02175e1e3b024d8538/invoke.js"></script>`
  },

  // Footer Banner Ad - 728x90 (Banner 728x90)
  footerBanner: {
    id: 'footerBanner',
    name: 'Banner 728x90',
    description: 'Leaderboard banner ad (728x90)',
    dimensions: { width: 728, height: 90 },
    code: `<script type="text/javascript">
	atOptions = {
		'key' : 'b903fa845297e51d387c03016df6531e',
		'format' : 'iframe',
		'height' : 90,
		'width' : 728,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//abdicateeffectlucky.com/b903fa845297e51d387c03016df6531e/invoke.js"></script>`
  },

  // Header Banner Ad - 728x90 (same as footer for header)
  headerBanner: {
    id: 'headerBanner',
    name: 'Header Banner 728x90', 
    description: 'Top banner advertisement (728x90)',
    dimensions: { width: 728, height: 90 },
    code: `<script type="text/javascript">
	atOptions = {
		'key' : 'b903fa845297e51d387c03016df6531e',
		'format' : 'iframe',
		'height' : 90,
		'width' : 728,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//abdicateeffectlucky.com/b903fa845297e51d387c03016df6531e/invoke.js"></script>`
  },

  // Banner 320x50 Ad - Mobile banner
  banner320x50: {
    id: 'banner320x50',
    name: 'Banner 320x50',
    description: 'Mobile banner ad (320x50)',
    dimensions: { width: 320, height: 50 },
    code: `<script type="text/javascript">
	atOptions = {
		'key' : '4a98ba6a6da16d9081d6e12cca3a3743',
		'format' : 'iframe',
		'height' : 50,
		'width' : 320,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//abdicateeffectlucky.com/4a98ba6a6da16d9081d6e12cca3a3743/invoke.js"></script>`
  },

  // Native Ad - Native Banner
  nativeAd: {
    id: 'nativeAd',
    name: 'Native Banner',
    description: 'Native content ad - blends with content',
    code: `<script async="async" data-cfasync="false" src="//abdicateeffectlucky.com/cd61435395a70ff02c61db7e95d4252b/invoke.js"></script>
<div id="container-cd61435395a70ff02c61db7e95d4252b"></div>`
  },

  // Popup Ad - Popunder
  popupAd: {
    id: 'popupAd',
    name: 'Popunder',
    description: 'Popup/overlay advertisement',
    code: `<script type='text/javascript' src='//abdicateeffectlucky.com/7b/c3/27/7bc3271a7d97b8e5bf2c6a3a9d670106.js'></script>`
  },

  // Social Bar Ad - External script
  socialBar: {
    id: 'socialBar',
    name: 'Social Bar',
    description: 'Social media banner ad',
    code: `<script type='text/javascript' src='//abdicateeffectlucky.com/bd/b0/34/bdb034c6bbb6dcb7f08c2c9a63f57a9f.js'></script>`
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
export default AD_CODES;