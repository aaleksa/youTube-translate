'use client';

import type { ReactNode } from 'react';
import AppShell from './components/AppShell';
import PwaProvider from './components/PwaProvider';

export default function RootClientLayout({ children }: { children: ReactNode }) {
  return (
    <PwaProvider>
      <AppShell>{children}</AppShell>
    </PwaProvider>
  );
}
