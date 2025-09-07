import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, RefreshCw, Edit, Save } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from '@/hooks/use-toast';

interface DynamicAdSettings {
  footerBanner?: string;
  directLink?: string;
  nativeAd?: string;
  popupAd?: string;
  headerBanner?: string;
  [key: string]: string | undefined;
}

// Hook for dynamic ads
function useDynamicAds() {
  return useQuery({
    queryKey: ['dynamicAds'],
    queryFn: async (): Promise<DynamicAdSettings> => {
      try {
        const docRef = doc(db, 'adSettings', 'main');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return docSnap.data() as DynamicAdSettings;
        }
        
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

// Initialize function
async function initializeDynamicAdSettings() {
  const EXAMPLE_AD_CODES = {
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

    nativeAd: `<script type='text/javascript' src='//abdicateeffectlucky.com/7b/c3/27/7bc3271a7d97b8e5bf2c6a3a9d670106.js'></script>`,

    headerBanner: `<script type='text/javascript' src='//abdicateeffectlucky.com/bd/b0/34/bdb034c6bbb6dcb7f08c2c9a63f57a9f.js'></script>`,

    socialBar: `<script type="text/javascript">
	atOptions = {
		'key' : '4a98ba6a6da16d9081d6e12cca3a3743',
		'format' : 'iframe',
		'height' : 50,
		'width' : 320,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//abdicateeffectlucky.com/4a98ba6a6da16d9081d6e12cca3a3743/invoke.js"></script>`,

    popupAd: `<script async="async" data-cfasync="false" src="//abdicateeffectlucky.com/cd61435395a70ff02c61db7e95d4252b/invoke.js"></script>
<div id="container-cd61435395a70ff02c61db7e95d4252b"></div>`
  };

  try {
    const docRef = doc(db, 'adSettings', 'main');
    const adData = {
      ...EXAMPLE_AD_CODES,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      notes: 'Replace the example keys with your actual Adsterra ad keys'
    };
    
    await setDoc(docRef, adData, { merge: true });
    return true;
  } catch (error) {
    console.error('❌ Error initializing dynamic ad settings:', error);
    return false;
  }
}

const DynamicAdManager: React.FC = () => {
  const { data: ads, isLoading, refetch } = useDynamicAds();
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const adSlots = [
    { key: 'headerBanner', title: 'Header Banner' },
    { key: 'footerBanner', title: 'Footer Banner' },
    { key: 'directLink', title: 'Direct Link' },
    { key: 'nativeAd', title: 'Native Ad' },
    { key: 'socialBar', title: 'Social Bar' },
    { key: 'popupAd', title: 'Popup Ad' },
  ];

  const handleInitialize = async () => {
    try {
      await initializeDynamicAdSettings();
      toast({ title: "Initialized", description: "Dynamic ads initialized in Firestore adSettings/main." });
      refetch();
    } catch (error) {
      toast({ title: "Error", description: "Failed to initialize.", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!editingSlot) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'adSettings', 'main'), {
        [editingSlot]: editCode,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      queryClient.invalidateQueries({ queryKey: ['dynamicAds'] });
      toast({ title: "Saved", description: `${editingSlot} ad code updated successfully.` });
      setEditingSlot(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading dynamic ad settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Dynamic Ad Management (Firestore)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage ads stored in Firestore: <code>adSettings/main</code>
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={handleInitialize} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Initialize Firestore Structure
            </Button>
            
            <div className="text-sm">
              <p><strong>Status:</strong> {ads && Object.keys(ads).length > 0 ? 
                <Badge variant="default">Connected</Badge> : 
                <Badge variant="secondary">Not Initialized</Badge>
              }</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {ads && Object.keys(ads).length > 0 && adSlots.map((slot) => {
        const hasCode = ads[slot.key] && ads[slot.key]!.trim() !== '';
        const isEditing = editingSlot === slot.key;

        return (
          <Card key={slot.key}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{slot.title}</CardTitle>
                <Badge variant={hasCode ? "default" : "secondary"}>
                  {hasCode ? "Active" : "Empty"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    placeholder="Paste your Adsterra ad code here..."
                    className="min-h-[150px] font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingSlot(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {hasCode && (
                    <div className="bg-muted p-2 rounded text-xs font-mono">
                      {ads[slot.key]?.substring(0, 100)}...
                    </div>
                  )}
                  <Button size="sm" onClick={() => {
                    setEditingSlot(slot.key);
                    setEditCode(ads[slot.key] || '');
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DynamicAdManager;