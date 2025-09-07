
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminReports, useReportActions } from '@/hooks/useReports';
import { Loader2, CheckCircle, XCircle, Trash2, Flag, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export function ReportsManager() {
  const { data: reports, isLoading } = useAdminReports();
  const { resolveReport, deleteReport } = useReportActions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const pendingReports = reports?.filter(r => r.status === 'pending') || [];
  const resolvedReports = reports?.filter(r => r.status !== 'pending') || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'dismissed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const ReportCard = ({ report, showActions = true }: { report: any, showActions?: boolean }) => (
    <Card key={report.id} className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-white mb-2">{report.videoTitle}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {report.reportedBy}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {report.createdAt?.toDate ? 
                  format(report.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 
                  'Unknown'
                }
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(report.status)}>
            {report.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-slate-300">Reason:</p>
            <p className="text-white capitalize">{report.reason.replace('_', ' ')}</p>
          </div>
          
          {report.description && (
            <div>
              <p className="text-sm font-medium text-slate-300">Description:</p>
              <p className="text-white">{report.description}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-slate-300">Video ID:</p>
            <p className="text-slate-400 font-mono text-sm">{report.videoId}</p>
          </div>

          {showActions && report.status === 'pending' && (
            <div className="flex gap-2 pt-4 border-t border-slate-700">
              <Button
                onClick={() => resolveReport(report.id, 'resolved')}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Resolve
              </Button>
              <Button
                onClick={() => resolveReport(report.id, 'dismissed')}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Dismiss
              </Button>
              <Button
                onClick={() => deleteReport(report.id)}
                variant="outline"
                size="sm"
                className="border-red-600 text-red-400 hover:bg-red-600/10"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          )}

          {report.status !== 'pending' && report.resolvedBy && (
            <div className="pt-3 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                {report.status === 'resolved' ? 'Resolved' : 'Dismissed'} by {report.resolvedBy} on{' '}
                {report.resolvedAt?.toDate ? 
                  format(report.resolvedAt.toDate(), 'MMM dd, yyyy HH:mm') : 
                  'Unknown'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Pending Reports */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Flag className="h-5 w-5 text-red-400" />
          Pending Reports ({pendingReports.length})
        </h2>
        
        {pendingReports.length > 0 ? (
          <div className="space-y-4">
            {pendingReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-slate-300 text-lg">No pending reports</p>
              <p className="text-slate-400">All reports have been handled</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resolved Reports */}
      {resolvedReports.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent Actions ({resolvedReports.length})
          </h2>
          
          <div className="space-y-4">
            {resolvedReports.slice(0, 10).map(report => (
              <ReportCard key={report.id} report={report} showActions={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
