import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface UseThemeOptions {
  /** Default theme. Defaults to 'system' */
  defaultTheme?: Theme;
  /** Storage key for persisting theme preference. Set to null to disable persistence. */
  storageKey?: string | null;
  /** Target element to set data-theme attribute on. Defaults to document.documentElement */
  targetSelector?: string;
}

export interface UseThemeResult {
  /** Current theme setting ('light', 'dark', or 'system') */
  theme: Theme;
  /** Resolved theme based on system preference if theme is 'system' */
  resolvedTheme: ResolvedTheme;
  /** Set the theme */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark (ignores system) */
  toggleTheme: () => void;
}

/**
 * Hook for managing theme state with system preference support.
 *
 * Works with @chatter/themes/auto.css which responds to:
 * - data-theme="light" for forced light mode
 * - data-theme="dark" for forced dark mode
 * - No attribute for system preference
 *
 * @example
 * ```tsx
 * import { useTheme } from '@chatter/react';
 *
 * function ThemeToggle() {
 *   const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
 *
 *   return (
 *     <div>
 *       <p>Current: {resolvedTheme}</p>
 *       <button onClick={toggleTheme}>Toggle</button>
 *       <button onClick={() => setTheme('system')}>System</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme(options: UseThemeOptions = {}): UseThemeResult {
  const {
    defaultTheme = 'system',
    storageKey = 'chatter-theme',
    targetSelector,
  } = options;

  // Get initial theme from storage or default
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return defaultTheme;
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    }
    return defaultTheme;
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');

  // Detect system preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Set initial value
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const target = targetSelector
      ? document.querySelector(targetSelector)
      : document.documentElement;

    if (!target) return;

    if (theme === 'system') {
      // Remove attribute to let CSS media query handle it
      target.removeAttribute('data-theme');
    } else {
      // Set explicit theme
      target.setAttribute('data-theme', theme);
    }
  }, [theme, targetSelector]);

  // Persist to storage
  useEffect(() => {
    if (typeof window === 'undefined' || !storageKey) return;
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      // If system, resolve to current system theme then toggle
      const resolved = current === 'system' ? systemTheme : current;
      return resolved === 'light' ? 'dark' : 'light';
    });
  }, [systemTheme]);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}

export default useTheme;
