import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface WebsiteAdSettings {
  banner300x250?: string;
  banner728x90?: string;
  banner320x50?: string;
  popunder?: string;
  socialBar?: string;
  nativeBanner?: string;
  enabled?: boolean;
  [key: string]: string | boolean | undefined;
}

// Map the website slots to Firebase ad settings keys
const SLOT_MAPPING: Record<string, string> = {
  'footerBanner': 'banner728x90',
  'directLink': 'banner300x250', 
  'nativeAd': 'nativeBanner',
  'popupAd': 'popunder',
  'headerBanner': 'banner728x90',
  'socialBar': 'socialBar'
};

export function useWebsiteAds() {
  return useQuery({
    queryKey: ['websiteAds'],
    queryFn: async (): Promise<WebsiteAdSettings> => {
      try {
        const docRef = doc(db, 'settings', 'ads');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as WebsiteAdSettings;
          return {
            ...data,
            enabled: data.enabled !== false // Default to true if not set
          };
        }
        
        console.log('⚠️ No website ad settings found in Firebase');
        return { enabled: true }; // Default enabled
      } catch (error) {
        console.error('❌ Error loading website ads:', error);
        return { enabled: true }; // Default enabled on error
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Helper function to get ad code for a specific slot
export function useAdCode(slot: string) {
  const { data: adSettings } = useWebsiteAds();
  
  const mappedKey = SLOT_MAPPING[slot] || slot;
  const adCode = adSettings?.[mappedKey] as string;
  const enabled = adSettings?.enabled !== false;
  
  return {
    code: adCode || '',
    enabled,
    hasCode: Boolean(adCode)
  };
}