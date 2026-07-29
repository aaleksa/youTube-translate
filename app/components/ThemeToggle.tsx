'use client';

import { useTheme } from './ThemeProvider';
import { topBarIconButton } from './topBarStyles';

export default function ThemeToggle() {
  const { theme, mounted, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={topBarIconButton}
      suppressHydrationWarning
    >
      {!mounted ? '🌙' : theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
