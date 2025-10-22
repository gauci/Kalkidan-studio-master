'use client';

import { useAuthSafe } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthLoadingFallback, AuthErrorFallback } from './auth-fallback';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
  redirectTo?: string;
  fallback?: React.ReactNode;
  strictMode?: boolean; // Never render during uncertain states
}

interface AuthState {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRequiredRole: boolean;
  error: string | null;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'user', 
  redirectTo = '/auth/login',
  fallback,
  strictMode = true
}: ProtectedRouteProps) {
  const { user, isLoading, token, verifyRole, authError } = useAuthSafe();
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    hasRequiredRole: false,
    error: null
  });
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState(redirectTo);
  const [roleVerified, setRoleVerified] = useState(false);
  const [roleVerificationInProgress, setRoleVerificationInProgress] = useState(false);

  // Server-side role verification for admin routes
  useEffect(() => {
    const performRoleVerification = async () => {
      if (!user || !token || isLoading || roleVerificationInProgress) {
        return;
      }

      // For admin routes, perform server-side verification
      if (requiredRole === 'admin' && !roleVerified) {
        setRoleVerificationInProgress(true);
        try {
          const hasRole = await verifyRole('admin');
          setRoleVerified(hasRole);
          if (!hasRole) {
            setShouldRedirect(true);
            setRedirectPath('/dashboard');
          }
        } catch (error) {
          console.error('Role verification failed:', error);
          setRoleVerified(false);
          setShouldRedirect(true);
          setRedirectPath('/auth/login');
        } finally {
          setRoleVerificationInProgress(false);
        }
      } else if (requiredRole === 'user') {
        // For user routes, client-side check is sufficient
        setRoleVerified(true);
      }
    };

    performRoleVerification();
  }, [user, token, isLoading, requiredRole, verifyRole, roleVerified, roleVerificationInProgress]);

  // Update auth state based on context
  useEffect(() => {
    const newAuthState: AuthState = {
      user,
      isLoading: isLoading || roleVerificationInProgress,
      isAuthenticated: !!user && !!token,
      hasRequiredRole: false,
      error: authError
    };

    // Only check role if user is authenticated and role verification is complete
    if (newAuthState.isAuthenticated && user && !roleVerificationInProgress) {
      if (requiredRole === 'admin') {
        newAuthState.hasRequiredRole = user.role === 'admin' && roleVerified;
      } else {
        newAuthState.hasRequiredRole = (user.role === 'user' || user.role === 'admin') && roleVerified;
      }
    }

    setAuthState(newAuthState);
  }, [user, isLoading, token, requiredRole, authError, roleVerified, roleVerificationInProgress]);

  // Handle redirects based on authentication state with proper error handling
  useEffect(() => {
    // Don't redirect while still loading or during role verification
    if (authState.isLoading || roleVerificationInProgress) {
      return;
    }

    // Handle authentication errors
    if (authState.error) {
      console.warn('Authentication error:', authState.error);
      setShouldRedirect(true);
      setRedirectPath('/auth/login');
      return;
    }

    // Redirect if not authenticated
    if (!authState.isAuthenticated) {
      setShouldRedirect(true);
      setRedirectPath(redirectTo);
      return;
    }

    // Redirect if authenticated but doesn't have required role
    if (authState.isAuthenticated && !authState.hasRequiredRole) {
      setShouldRedirect(true);
      if (requiredRole === 'admin') {
        setRedirectPath('/dashboard'); // Non-admin users go to dashboard
      } else {
        setRedirectPath('/auth/login'); // Fallback to login
      }
      return;
    }

    // Clear redirect if all checks pass
    setShouldRedirect(false);
  }, [authState, requiredRole, redirectTo, roleVerificationInProgress]);

  // Perform actual redirect with proper cleanup
  useEffect(() => {
    if (shouldRedirect && !authState.isLoading && !roleVerificationInProgress) {
      // Immediate cleanup of authentication data on errors
      if (!authState.isAuthenticated || authState.error) {
        // Clear localStorage and any cached data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sessionToken');
          // Clear any other cached auth data
          sessionStorage.clear();
        }
      }

      // Perform redirect without showing UI
      const performRedirect = async () => {
        try {
          router.push(redirectPath);
        } catch (error) {
          console.error('Redirect failed:', error);
          // Fallback redirect
          router.push('/auth/login');
        }
      };

      performRedirect();
    }
  }, [shouldRedirect, redirectPath, router, authState.isLoading, authState.isAuthenticated, authState.error, roleVerificationInProgress]);

  // STRICT SECURITY: Never render protected content during uncertain states
  
  // Show loading state - no protected content
  if (authState.isLoading || roleVerificationInProgress) {
    return fallback || (
      <AuthLoadingFallback 
        message={roleVerificationInProgress ? 'Verifying permissions...' : 'Verifying access...'}
      />
    );
  }

  // Show nothing while redirecting - no protected content
  if (shouldRedirect) {
    return null;
  }

  // Show nothing if authentication error - no protected content
  if (authState.error) {
    return null;
  }

  // Show nothing if not authenticated - no protected content
  if (!authState.isAuthenticated) {
    return null;
  }

  // Show nothing if doesn't have required role - no protected content
  if (!authState.hasRequiredRole) {
    return null;
  }

  // Only render protected content if ALL security checks pass
  if (strictMode) {
    // In strict mode, triple-check everything before rendering
    if (!user || !token || !authState.isAuthenticated || !authState.hasRequiredRole || authState.error) {
      return null;
    }

    // Additional check for admin routes
    if (requiredRole === 'admin' && (!roleVerified || user.role !== 'admin')) {
      return null;
    }
  }

  // All security checks passed - safe to render protected content
  return <>{children}</>;
}