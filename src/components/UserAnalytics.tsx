
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserAnalytics } from '@/hooks/useUserTracking';
import { Loader2, Users, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export function UserAnalytics() {
  const { data: userStats, isLoading } = useUserAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-300">
            <Users className="h-5 w-5 text-blue-400" />
            Total Registered Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-white mb-4">
            {userStats?.totalUsers || 0}
          </div>
          <p className="text-slate-400">All time user registrations on the platform</p>
        </CardContent>
      </Card>
    </div>
  );
}
