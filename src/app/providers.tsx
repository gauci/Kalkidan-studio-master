
'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { LanguageProvider } from '@/context/language-context';
import { AuthProvider } from '@/context/auth-context';
import { useMemo, useState, useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ConvexProviderWrapper>
        {children}
      </ConvexProviderWrapper>
    </LanguageProvider>
  );
}

function ConvexProviderWrapper({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const convexClient = useMemo(() => {
    if (!isClient) return null;
    
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    
    if (!convexUrl) {
      console.warn("NEXT_PUBLIC_CONVEX_URL is not set, CMS features will be disabled");
      return null;
    }

    try {
      return new ConvexReactClient(convexUrl);
    } catch (error) {
      console.error("Failed to create Convex client:", error);
      return null;
    }
  }, [isClient]);

  // Render without Convex on server-side or if client not ready
  if (!isClient || !convexClient) {
    return <>{children}</>;
  }

  return (
    <ConvexProvider client={convexClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ConvexProvider>
  );
}
