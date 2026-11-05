'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  /** What the user picked (may be "system"). */
  preference: ThemePreference;
  /** What is actually applied. */
  theme: ResolvedTheme;
  setPreference: (p: ThemePreference) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'theme';
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const systemTheme = (): ResolvedTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const readPreference = (): ThemePreference => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {}
  return 'system';
};

const apply = (theme: ResolvedTheme) => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b0f17' : '#f6f7fb');
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [theme, setTheme] = useState<ResolvedTheme>('dark');

  // Initial value is set before paint by the inline script in layout.tsx; sync React state with it.
  useEffect(() => {
    const pref = readPreference();
    setPreferenceState(pref);
    const resolved = pref === 'system' ? systemTheme() : pref;
    setTheme(resolved);
    apply(resolved);
  }, []);

  // Follow OS changes while on "system".
  useEffect(() => {
    if (preference !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const t = systemTheme();
      setTheme(t);
      apply(t);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
    } catch {}
    const resolved = p === 'system' ? systemTheme() : p;
    setTheme(resolved);
    apply(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setPreference]);

  return (
    <ThemeContext.Provider value={{ preference, theme, setPreference, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
