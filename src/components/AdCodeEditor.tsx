
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, X, Copy, RotateCcw, MousePointer } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdCodeEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  code: string;
  onSave: (code: string) => void;
}

export function AdCodeEditor({ open, onOpenChange, title, code, onSave }: AdCodeEditorProps) {
  const [editedCode, setEditedCode] = React.useState(code);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setEditedCode(code);
  }, [code, open]);

  const handleSave = () => {
    onSave(editedCode);
    onOpenChange(false);
  };

  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      textareaRef.current.focus();
      toast({
        title: "Text Selected",
        description: "All ad code text has been selected. You can now copy or replace it.",
      });
    }
  };

  const handleReset = () => {
    setEditedCode(code);
    toast({
      title: "Reset",
      description: "Ad code has been reset to original value.",
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedCode);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit {title} Code</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="adCode" className="text-sm font-medium">
                Ad Code
              </Label>
              <div className="flex gap-2">
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <MousePointer className="h-3 w-3 mr-1" />
                  Select All
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
            <Textarea
              ref={textareaRef}
              id="adCode"
              value={editedCode}
              onChange={(e) => setEditedCode(e.target.value)}
              placeholder={`<script>...</script> (${title.toLowerCase()} code)`}
              className="min-h-64 bg-slate-700 border-slate-600 text-white font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              spellCheck={false}
            />
            <p className="text-xs text-slate-400 mt-1">
              Tip: Use "Select All" button to easily select the entire ad code, then paste your new code to replace it.
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
