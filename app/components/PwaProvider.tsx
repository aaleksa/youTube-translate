'use client';

import { SerwistProvider } from '@serwist/next/react';
import type { ReactNode } from 'react';

interface PwaProviderProps {
  children: ReactNode;
}

export default function PwaProvider({ children }: PwaProviderProps) {
  return (
    <SerwistProvider
      swUrl="/sw.js"
      disable={process.env.NODE_ENV === 'development'}
      reloadOnOnline
      cacheOnNavigation
    >
      {children}
    </SerwistProvider>
  );
}
