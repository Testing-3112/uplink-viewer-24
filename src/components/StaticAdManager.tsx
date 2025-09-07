import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Copy, Check, Eye, Settings, Download, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AD_CODES, AdCodeConfig } from '@/config/adCodes';
import { AdCodeEditor } from './AdCodeEditor';
import { useAdCodeManager } from '@/hooks/useAdCodeManager';
import { useFileUpdater } from '@/hooks/useFileUpdater';

export function StaticAdManager() {
  const [copied, setCopied] = useState<string | null>(null);
  const [editingAd, setEditingAd] = useState<{
    key: string;
    title: string;
    code: string;
  } | null>(null);
  const [editedCodes, setEditedCodes] = useState<Record<string, string>>({});
  const { setAdCode, getAdCode } = useAdCodeManager();
  const { updateAdCodesFile, updating } = useFileUpdater();

  const copyToClipboard = async (code: string, adName: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(adName);
      setTimeout(() => setCopied(null), 2000);
      toast({
        title: "Copied",
        description: `${adName} code copied to clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAdCode = async (key: string, newCode: string) => {
    try {
      // Update both local state and global store
      setEditedCodes(prev => ({ ...prev, [key]: newCode }));
      setAdCode(key, newCode);
      
      toast({
        title: "Ad Code Updated! ✅",
        description: "The ad code has been updated and will be used immediately on the website.",
      });
      
      setEditingAd(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ad code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateConfigFile = async () => {
    if (Object.keys(editedCodes).length === 0) {
      toast({
        title: "No Changes",
        description: "No ad codes have been modified to save to the configuration file.",
        variant: "default",
      });
      return;
    }

    await updateAdCodesFile(editedCodes);
  };

  const getCurrentAdCode = (key: string) => {
    return editedCodes[key] || getAdCode(key, AD_CODES[key]?.code || '');
  };

  const adEntries = Object.entries(AD_CODES);

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5 text-blue-400" />
            Static Ad Configuration
          </CardTitle>
          <p className="text-sm text-slate-400">
            Current ad codes loaded directly from configuration. These ads are always active.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-900/20 rounded-lg border border-green-700">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-700 text-green-100">
                  ACTIVE
                </Badge>
                <span className="text-green-400 font-medium">All ads are currently enabled</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                {adEntries.length} ad slots configured and displaying on website
              </p>
              {Object.keys(editedCodes).length > 0 && (
                <p className="text-xs text-yellow-400 mt-1">
                  {Object.keys(editedCodes).length} ad code(s) modified - Click "Update Config File" to make permanent
                </p>
              )}
            </div>
            
            {Object.keys(editedCodes).length > 0 && (
              <Button
                onClick={handleUpdateConfigFile}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                size="sm"
              >
                {updating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {updating ? "Generating..." : "Update Config File"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {adEntries.map(([key, config]: [string, AdCodeConfig]) => (
          <Card key={key} className="bg-slate-700/30 border-slate-600">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Code className="h-4 w-4 text-blue-400" />
                    {config.name}
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-1">{config.description}</p>
                  {config.dimensions && (
                    <p className="text-xs text-slate-500 mt-1">
                      Size: {config.dimensions.width}x{config.dimensions.height}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(getCurrentAdCode(key), config.name)}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-400 hover:bg-slate-700"
                  >
                    {copied === config.name ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    onClick={() => setEditingAd({
                      key,
                      title: config.name,
                      code: getCurrentAdCode(key)
                    })}
                    variant="outline" 
                    size="sm"
                    className="border-blue-600 text-blue-400 hover:bg-blue-700/20"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-800 rounded-md p-3 max-h-32 overflow-y-auto">
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all">
                  {getCurrentAdCode(key)}
                </pre>
              </div>
              <div className="text-xs mt-2 flex items-center gap-1">
                {editedCodes[key] ? (
                  <>
                    <Check className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">Modified & Active ({getCurrentAdCode(key).length} characters)</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">Active ({getCurrentAdCode(key).length} characters)</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Eye className="h-5 w-5 text-purple-400" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-slate-300">
              <h4 className="font-medium mb-3 text-blue-400">Current Status:</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• All ads are <strong className="text-green-400">ALWAYS ENABLED</strong></li>
                <li>• No database dependency - loads instantly</li>
                <li>• {adEntries.length} ad slots configured</li>
                <li>• Ads load directly from static configuration</li>
              </ul>
            </div>
            
            <div className="text-slate-300">
              <h4 className="font-medium mb-3 text-green-400">Ad Management:</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Copy any ad code for backup</li>
                <li>• <strong className="text-blue-400">Edit codes directly in admin panel</strong></li>
                <li>• Changes take effect immediately on website</li>
                <li>• Use "Update Config File" for permanent storage</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700">
            <p className="text-blue-300 text-sm">
              <strong>Auto-Update Feature:</strong> Changes made in the admin panel are applied immediately to the website. 
              Click "Update Config File" to generate the updated <code className="bg-slate-700 px-1 rounded">src/config/adCodes.ts</code> content 
              for permanent storage.
            </p>
          </div>
        </CardContent>
      </Card>

      {editingAd && (
        <AdCodeEditor
          open={!!editingAd}
          onOpenChange={(open) => !open && setEditingAd(null)}
          title={editingAd.title}
          code={editingAd.code}
          onSave={(code) => {
            handleSaveAdCode(editingAd.key, code);
          }}
        />
      )}
    </div>
  );
}