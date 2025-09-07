import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface DynamicAdSettings {
  footerBanner?: string;
  directLink?: string;
  nativeAd?: string;
  popupAd?: string;
  headerBanner?: string;
  socialBar?: string;
  [key: string]: string | undefined;
}

export function useDynamicAds() {
  return useQuery({
    queryKey: ['dynamicAds'],
    queryFn: async (): Promise<DynamicAdSettings> => {
      try {
        const docRef = doc(db, 'adSettings', 'main');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return docSnap.data() as DynamicAdSettings;
        }
        
        console.log('⚠️ No ad settings found in Firestore');
        return {};
      } catch (error) {
        console.error('❌ Error loading ads:', error);
        return {};
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}