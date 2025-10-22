
'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { LanguageProvider } from '@/context/language-context';
import { AuthProvider } from '@/context/auth-context';
import { useMemo, useState, useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ConvexAuthWrapper>
        {children}
      </ConvexAuthWrapper>
    </LanguageProvider>
  );
}

function ConvexAuthWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const convexClient = useMemo(() => {
    if (!mounted) return null;
    
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    
    if (!convexUrl) {
      console.warn("NEXT_PUBLIC_CONVEX_URL is not set");
      return null;
    }

    try {
      return new ConvexReactClient(convexUrl);
    } catch (error) {
      console.error("Failed to create Convex client:", error);
      return null;
    }
  }, [mounted]);

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return null;
  }

  // If we have a Convex client, use it with auth
  if (convexClient) {
    return (
      <ConvexProvider client={convexClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ConvexProvider>
    );
  }

  // No Convex client - render without auth features
  return (
    <NoAuthProvider>
      {children}
    </NoAuthProvider>
  );
}

// Simple fallback provider when Convex is not available
function NoAuthProvider({ children }: { children: React.ReactNode }) {
  const authValue = {
    user: null,
    token: null,
    login: async () => {
      throw new Error('Authentication service is not available. Please check your configuration.');
    },
    register: async () => {
      throw new Error('Registration service is not available. Please check your configuration.');
    },
    logout: async () => {},
    isLoading: false,
  };

  return (
    <div>
      {/* Provide a minimal auth context for components that need it */}
      {children}
    </div>
  );
}
