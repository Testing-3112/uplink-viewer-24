
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAdSettings, useAdManagement } from '@/hooks/useAdManagement';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Save, Settings, RefreshCw, Download, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { initializeAdSettings } from '@/utils/initializeAdSettings';
import { AdCodeDisplay } from './AdCodeDisplay';
import { AdCodeEditor } from './AdCodeEditor';

export function AdManager() {
  const { data: adSettings, isLoading, refetch } = useAdSettings();
  const { updateAdSettings, saving } = useAdManagement();
  const { user } = useAuth();

  const [enabled, setEnabled] = useState(false);
  const [editingAd, setEditingAd] = useState<{
    key: string;
    title: string;
    code: string;
  } | null>(null);

  const adTypes = [
    { key: 'banner300x250', title: 'Banner 300x250 (Sidebar)' },
    { key: 'banner728x90', title: 'Banner 728x90 (Header)' },
    { key: 'banner320x50', title: 'Banner 320x50 (Mobile)' },
    { key: 'popunder', title: 'Popunder' },
    { key: 'socialBar', title: 'Social Bar' },
    { key: 'nativeBanner', title: 'Native Banner' }
  ];

  // Update local state when data loads and auto-initialize if needed
  React.useEffect(() => {
    if (adSettings) {
      setEnabled(adSettings.enabled !== false); // Default to true
    }
  }, [adSettings]);

  // Auto-initialize ad settings if none exist
  React.useEffect(() => {
    const autoInitialize = async () => {
      if (!isLoading && (!adSettings || adTypes.every(type => !adSettings[type.key as keyof typeof adSettings]))) {
        console.log('🔄 Auto-initializing ad settings...');
        await handleInitialize();
      }
    };
    
    autoInitialize();
  }, [isLoading, adSettings]);

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: "Refreshed",
      description: "Ad settings have been refreshed.",
    });
  };

  const handleInitialize = async () => {
    try {
      const success = await initializeAdSettings();
      if (success) {
        await refetch();
        toast({
          title: "Initialized",
          description: "Current ad codes have been loaded into the system.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to initialize ad settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error initializing ads:', error);
      toast({
        title: "Error",
        description: "Failed to initialize ad settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAdCode = async (key: string, code: string) => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "User email not available.",
        variant: "destructive",
      });
      return;
    }

    await updateAdSettings({
      [key]: code
    }, user.email);
  };

  const handleToggleEnabled = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "User email not available.",
        variant: "destructive",
      });
      return;
    }

    const newEnabled = !enabled;
    setEnabled(newEnabled);
    await updateAdSettings({ enabled: newEnabled }, user.email);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const hasNoAds = !adSettings || adTypes.every(type => !adSettings[type.key as keyof typeof adSettings]);

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5 text-blue-400" />
              Ad Configuration
            </CardTitle>
            <div className="flex gap-2">
              {hasNoAds && (
                <Button
                  onClick={handleInitialize}
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-400 hover:bg-green-700/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Load Current Ads
                </Button>
              )}
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div>
              <Label className="text-slate-300 font-medium text-lg">Enable Ads Site-Wide</Label>
              <p className="text-sm text-slate-400">Toggle to show/hide all ads across the platform</p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={handleToggleEnabled}
              className="scale-125"
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {adTypes.map(({ key, title }) => (
              <AdCodeDisplay
                key={key}
                title={title}
                code={adSettings?.[key as keyof typeof adSettings] as string || ''}
                onEdit={() => setEditingAd({
                  key,
                  title,
                  code: adSettings?.[key as keyof typeof adSettings] as string || ''
                })}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Eye className="h-5 w-5 text-purple-400" />
            Ad Management Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-slate-300">
              <h4 className="font-medium mb-3 text-blue-400">Current Status:</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Ads are currently <strong className={enabled ? 'text-green-400' : 'text-red-400'}>{enabled ? 'ENABLED' : 'DISABLED'}</strong></li>
                <li>• {adTypes.filter(type => adSettings?.[type.key as keyof typeof adSettings]).length} of {adTypes.length} ad slots configured</li>
                <li>• Click "Edit" on any ad slot to update codes</li>
                <li>• Changes apply instantly across the website</li>
              </ul>
            </div>
            
            <div className="text-slate-300">
              <h4 className="font-medium mb-3 text-green-400">Quick Actions:</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Use "Load Current Ads" to initialize with existing codes</li>
                <li>• Copy existing ad codes for backup</li>
                <li>• Test new ad codes before saving</li>
                <li>• Monitor ad performance regularly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {editingAd && (
        <AdCodeEditor
          open={!!editingAd}
          onOpenChange={(open) => !open && setEditingAd(null)}
          title={editingAd.title}
          code={editingAd.code}
          onSave={(code) => handleSaveAdCode(editingAd.key, code)}
        />
      )}
    </div>
  );
}
