import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system');

  // load saved theme
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
  }, []);

  // apply theme class
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let applied = theme;
    if (theme === 'system') applied = isDark ? 'dark' : 'light';
    root.classList.remove('light', 'dark');
    root.classList.add(applied);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}