import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/shared/protected-route';

export const metadata: Metadata = {
  title: 'Dashboard - Kalkidan CMS',
  description: 'User dashboard for file management and content access',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}