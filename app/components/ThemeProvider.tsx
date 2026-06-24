'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { SETTINGS_SYNCED_EVENT } from '../lib/v2/syncUserSettings';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  mounted: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    if (stored === 'dark' || stored === 'light') {
      document.documentElement.classList.toggle('dark', stored === 'dark');
      document.documentElement.classList.toggle('light', stored === 'light');
      setTheme(stored);
    } else {
      setTheme(prefersDark ? 'dark' : 'light');
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    const syncThemeFromStorage = () => {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') {
        setTheme(stored);
      }
    };

    window.addEventListener(SETTINGS_SYNCED_EVENT, syncThemeFromStorage);
    return () => {
      window.removeEventListener(SETTINGS_SYNCED_EVENT, syncThemeFromStorage);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.remove('light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('theme', theme);
    void import('../lib/v2/syncUserSettings').then(({ scheduleUserSettingsSync }) => {
      scheduleUserSettingsSync();
    });
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, mounted, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
