import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StaticAdManager } from './StaticAdManager';

export function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Ad Management
          </h1>
          <p className="text-slate-300 mt-2">Manage and update advertisement codes across your website</p>
        </div>

        <StaticAdManager />
      </div>
    </div>
  );
}