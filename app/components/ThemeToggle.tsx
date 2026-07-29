'use client';

import { useTheme } from './ThemeProvider';
import { topBarIconButton } from './topBarStyles';

export default function ThemeToggle() {
  const { theme, mounted, toggleTheme } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      onClick={toggleTheme}
      aria-label={
        nextTheme === 'light' ? 'Switch to light mode' : 'Switch to dark mode'
      }
      title={
        nextTheme === 'light' ? 'Switch to light mode' : 'Switch to dark mode'
      }
      className={topBarIconButton}
      suppressHydrationWarning
    >
      {!mounted ? '🌙' : theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
