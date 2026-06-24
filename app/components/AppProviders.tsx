'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from './auth/AuthProvider';
import { InterfaceLanguageProvider } from './InterfaceLanguageProvider';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <InterfaceLanguageProvider>
        <AuthProvider>{children}</AuthProvider>
      </InterfaceLanguageProvider>
    </ThemeProvider>
  );
}
