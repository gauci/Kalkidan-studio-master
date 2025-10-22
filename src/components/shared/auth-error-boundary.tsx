'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export class AuthErrorBoundary extends React.Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log authentication errors without exposing sensitive information
    console.error('Authentication error caught by boundary:', {
      message: error.message,
      name: error.name,
      // Don't log the full stack trace in production
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error);
    }

    // Clear any potentially corrupted authentication data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionToken');
      sessionStorage.clear();
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI without exposing system details
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center space-y-4 text-center max-w-md">
            <div className="text-destructive">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground">Authentication Error</h2>
            <p className="text-sm text-muted-foreground">
              There was a problem with your session. Please try logging in again.
            </p>
            <button
              onClick={() => {
                // Clear error state and redirect to login
                this.setState({ hasError: false, error: null });
                window.location.href = '/auth/login';
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useAuthErrorHandler() {
  const router = useRouter();

  const handleAuthError = React.useCallback((error: Error) => {
    console.error('Authentication error:', error.message);
    
    // Clear authentication data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionToken');
      sessionStorage.clear();
    }

    // Redirect to login
    router.push('/auth/login');
  }, [router]);

  return handleAuthError;
}

// Wrapper component for easier usage
export function AuthErrorWrapper({ children }: { children: React.ReactNode }) {
  const handleError = useAuthErrorHandler();

  return (
    <AuthErrorBoundary onError={handleError}>
      {children}
    </AuthErrorBoundary>
  );
}