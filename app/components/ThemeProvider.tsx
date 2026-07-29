'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  scheduleUserSettingsSync,
  SETTINGS_SYNCED_EVENT,
} from '../lib/v2/syncUserSettings';

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

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}

function readStoredTheme(): Theme | null {
  const stored = localStorage.getItem('theme');
  return stored === 'dark' || stored === 'light' ? stored : null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  // Ignore remote settings overwrites for a short window after the user
  // toggles — otherwise bootstrap/sync can snap the theme back.
  const ignoreRemoteUntilRef = useRef(0);

  useEffect(() => {
    const stored = readStoredTheme();
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const initial: Theme = stored ?? (prefersDark ? 'dark' : 'light');

    applyThemeClass(initial);
    localStorage.setItem('theme', initial);
    setTheme(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    const syncThemeFromStorage = () => {
      if (Date.now() < ignoreRemoteUntilRef.current) return;
      const stored = readStoredTheme();
      if (!stored) return;
      setTheme((current) => {
        if (current === stored) return current;
        applyThemeClass(stored);
        return stored;
      });
    };

    window.addEventListener(SETTINGS_SYNCED_EVENT, syncThemeFromStorage);
    return () => {
      window.removeEventListener(SETTINGS_SYNCED_EVENT, syncThemeFromStorage);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyThemeClass(theme);
    localStorage.setItem('theme', theme);
    scheduleUserSettingsSync();
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    ignoreRemoteUntilRef.current = Date.now() + 5000;
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      applyThemeClass(next);
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, mounted, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
