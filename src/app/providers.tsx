
'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { LanguageProvider } from '@/context/language-context';
import { AuthProvider } from '@/context/auth-context';
import { ClientOnly } from '@/lib/client-utils';
import { useMemo } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ClientOnly>
        <ConvexProviderWrapper>
          {children}
        </ConvexProviderWrapper>
      </ClientOnly>
    </LanguageProvider>
  );
}

function ConvexProviderWrapper({ children }: { children: React.ReactNode }) {
  const convexClient = useMemo(() => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    
    if (!convexUrl) {
      console.error("NEXT_PUBLIC_CONVEX_URL is not set");
      return null;
    }

    try {
      return new ConvexReactClient(convexUrl);
    } catch (error) {
      console.error("Failed to create Convex client:", error);
      return null;
    }
  }, []);

  if (!convexClient) {
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
