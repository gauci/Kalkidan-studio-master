'use client';

import { useEffect, useState } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { AuthProvider } from '@/context/auth-context';

interface DynamicAuthWrapperProps {
  children: React.ReactNode;
}

export function DynamicAuthWrapper({ children }: DynamicAuthWrapperProps) {
  const [convexClient, setConvexClient] = useState<ConvexReactClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeConvex = () => {
      try {
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
        
        if (!convexUrl) {
          console.warn("NEXT_PUBLIC_CONVEX_URL is not set, CMS features will be disabled");
          setIsInitialized(true);
          return;
        }

        const client = new ConvexReactClient(convexUrl);
        setConvexClient(client);
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to create Convex client:", error);
        setIsInitialized(true);
      }
    };

    initializeConvex();
  }, []);

  if (!isInitialized) {
    return <div style={{ display: 'none' }}>Loading...</div>;
  }

  if (!convexClient) {
    return children;
  }

  return (
    <ConvexProvider client={convexClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ConvexProvider>
  );
}