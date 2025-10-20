'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'user', 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Check role requirements
      if (requiredRole === 'admin' && user.role !== 'admin') {
        router.push('/dashboard'); // Redirect non-admin users to dashboard
        return;
      }
    }
  }, [user, isLoading, router, requiredRole, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  // Check role access
  if (requiredRole === 'admin' && user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}