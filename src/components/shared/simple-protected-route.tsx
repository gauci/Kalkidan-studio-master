'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface SimpleProtectedRouteProps {
  children: React.ReactNode;
}

export function SimpleProtectedRoute({ children }: SimpleProtectedRouteProps) {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 SimpleProtectedRoute - Auth State:', {
      user: !!user,
      isLoading,
      token: !!token,
      userRole: user?.role
    });

    // Simple check: if not loading and no user, redirect to login
    if (!isLoading && !user) {
      console.log('❌ No user found, redirecting to login');
      router.push('/auth/login');
      return;
    }

    // If we have a user, allow access
    if (user) {
      console.log('✅ User authenticated, allowing access');
    }
  }, [user, isLoading, token, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}