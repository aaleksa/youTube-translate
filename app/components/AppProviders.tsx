'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from './auth/AuthProvider';
import DevSessionRecovery from './DevSessionRecovery';
import { InterfaceLanguageProvider } from './InterfaceLanguageProvider';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <InterfaceLanguageProvider>
        <AuthProvider>
          <DevSessionRecovery />
          {children}
        </AuthProvider>
      </InterfaceLanguageProvider>
    </ThemeProvider>
  );
}
