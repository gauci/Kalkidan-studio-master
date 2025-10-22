import { SecurityDashboard } from '@/components/admin/security-dashboard';

export default function SecurityPage() {
  return (
    <div className="container mx-auto py-6">
      <SecurityDashboard />
    </div>
  );
}

export const metadata = {
  title: 'Security Monitoring - Admin',
  description: 'Monitor security events and authentication attempts',
};