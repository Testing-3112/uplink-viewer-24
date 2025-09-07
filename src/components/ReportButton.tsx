
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Flag, AlertTriangle } from 'lucide-react';
import { useReports } from '@/hooks/useReports';

interface ReportButtonProps {
  videoId: string;
  videoTitle: string;
}

export function ReportButton({ videoId, videoTitle }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { submitReport } = useReports();

  const handleSubmit = async () => {
    if (!reason) return;

    setSubmitting(true);
    try {
      await submitReport(videoId, videoTitle, reason, description);
      setOpen(false);
      setReason('');
      setDescription('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-400 border-red-400 hover:bg-red-400/10">
          <Flag className="h-3 w-3 mr-1" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Report Content
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason for reporting</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                <SelectItem value="copyright">Copyright Violation</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="violence">Violence</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about the issue..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
