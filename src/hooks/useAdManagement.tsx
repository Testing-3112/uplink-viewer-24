import React, { useState } from 'react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from './use-toast';

export interface AdSettings {
  banner300x250: string;
  banner728x90: string;
  banner320x50: string;
  popunder: string;
  socialBar: string;
  nativeBanner: string;
  enabled: boolean;
  updatedAt: any;
  updatedBy: string;
}

export function useAdSettings() {
  return useQuery({
    queryKey: ['adSettings'],
    queryFn: async () => {
      const docRef = doc(db, 'settings', 'ads');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as AdSettings;
      }
      
      // Return default settings if none exist
      return {
        banner300x250: '',
        banner728x90: '',
        banner320x50: '',
        popunder: '',
        socialBar: '',
        nativeBanner: '',
        enabled: true, // Changed default to enabled
        updatedAt: null,
        updatedBy: ''
      } as AdSettings;
    }
  });
}

export function useAdManagement() {
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const updateAdSettings = async (settings: Partial<AdSettings>, userEmail: string) => {
    setSaving(true);
    try {
      const docRef = doc(db, 'settings', 'ads');
      await setDoc(docRef, {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: userEmail
      }, { merge: true });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['adSettings'] });

      toast({
        title: "Ad settings updated",
        description: "The ad configuration has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating ad settings:', error);
      toast({
        title: "Error",
        description: "Failed to update ad settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return { updateAdSettings, saving };
}
