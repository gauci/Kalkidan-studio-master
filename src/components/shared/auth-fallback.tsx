'use client';

import { useEffect, useState } from 'react';

interface AuthFallbackProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthFallback({ children, fallback }: AuthFallbackProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return fallback || null;
  }

  return <>{children}</>;
}