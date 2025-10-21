'use client';

import { useEffect, useState } from 'react';

export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}