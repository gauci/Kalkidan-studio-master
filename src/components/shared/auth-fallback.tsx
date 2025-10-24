'use client';

import React from 'react';

interface AuthFallbackProps {
  type?: 'loading' | 'error' | 'unauthorized' | 'forbidden';
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function AuthFallback({ 
  type = 'loading', 
  message,
  showRetry = false,
  onRetry 
}: AuthFallbackProps) {
  const getContent = () => {
    switch (type) {
      case 'loading':
        return {
          icon: (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          ),
          title: 'Verifying Access',
          description: message || 'Please wait while we verify your permissions...',
          showRetry: false
        };
      
      case 'error':
        return {
          icon: (
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          title: 'Authentication Error',
          description: message || 'There was a problem verifying your access. Please try again.',
          showRetry: true
        };
      
      case 'unauthorized':
        return {
          icon: (
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          title: 'Authentication Required',
          description: message || 'Please log in to access this page.',
          showRetry: false
        };
      
      case 'forbidden':
        return {
          icon: (
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          ),
          title: 'Access Denied',
          description: message || 'You do not have permission to access this page.',
          showRetry: false
        };
      
      default:
        return {
          icon: null,
          title: 'Loading',
          description: message || 'Please wait...',
          showRetry: false
        };
    }
  };

  const content = getContent();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-4 text-center max-w-md p-6">
        {content.icon && (
          <div className="flex items-center justify-center">
            {content.icon}
          </div>
        )}
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {content.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {content.description}
          </p>
        </div>

        {(showRetry || content.showRetry) && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        )}

        {type === 'unauthorized' && (
          <div className="flex space-x-2">
            <a
              href="/auth/login"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Log In
            </a>
            <a
              href="/auth/register"
              className="px-4 py-2 border border-border text-foreground rounded-md hover:bg-accent transition-colors"
            >
              Sign Up
            </a>
          </div>
        )}

        {type === 'forbidden' && (
          <a
            href="/dashboard"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Go to Dashboard
          </a>
        )}
      </div>
    </div>
  );
}

// Specific fallback components for common use cases
export function AuthLoadingFallback({ message }: { message?: string }) {
  return <AuthFallback type="loading" message={message} />;
}

export function AuthErrorFallback({ 
  message, 
  error, 
  onRetry 
}: { 
  message?: string; 
  error?: any; 
  onRetry?: () => void 
}) {
  // Safely extract error message from various error types
  const errorMessage = message || 
    (typeof error === 'string' ? error : 
     error?.message || 
     'An unknown authentication error occurred.');
  
  return <AuthFallback type="error" message={errorMessage} onRetry={onRetry} showRetry />;
}

export function UnauthorizedFallback({ message }: { message?: string }) {
  return <AuthFallback type="unauthorized" message={message} />;
}

export function ForbiddenFallback({ message }: { message?: string }) {
  return <AuthFallback type="forbidden" message={message} />;
}