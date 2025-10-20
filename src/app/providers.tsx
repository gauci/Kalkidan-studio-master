
'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { LanguageProvider } from '@/context/language-context';
import { AuthProvider } from '@/context/auth-context';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </AuthProvider>
    </ConvexProvider>
  );
}
