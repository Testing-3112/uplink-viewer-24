
import { AdminRoute } from '@/components/AdminRoute';
import { AdminDashboard } from '@/components/AdminDashboard';
import { useUserTracking } from '@/hooks/useUserTracking';

export default function AdminPage() {
  useUserTracking(); // Track admin user activity

  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}
