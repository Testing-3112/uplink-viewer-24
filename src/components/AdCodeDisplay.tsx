
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdCodeDisplayProps {
  title: string;
  code: string;
  onEdit: () => void;
}

export function AdCodeDisplay({ title, code, onEdit }: AdCodeDisplayProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Ad code copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-slate-700/30 border-slate-600">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Code className="h-4 w-4 text-blue-400" />
            {title}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-400 hover:bg-slate-700"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="border-blue-600 text-blue-400 hover:bg-blue-700/20"
            >
              Edit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-800 rounded-md p-3 max-h-32 overflow-y-auto">
          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all">
            {code || 'No ad code configured'}
          </pre>
        </div>
        {code && (
          <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Active ({code.length} characters)
          </div>
        )}
      </CardContent>
    </Card>
  );
}
