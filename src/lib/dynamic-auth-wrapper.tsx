'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

export function withAuthWrapper<T extends object>(
  Component: React.ComponentType<T>
) {
  const WrappedComponent = (props: T) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    if (!isClient) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  return WrappedComponent;
}

export const createDynamicAuthPage = <T extends object>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>
) => {
  return dynamic(importFn, {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    ),
  });
};