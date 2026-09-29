import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'dark' | 'light';
export type FontSizeLevel = 'pequena' | 'mediana' | 'grande';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  fontSize: FontSizeLevel;
  setFontSize: (size: FontSizeLevel) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'stflab_app_theme';
const FONT_SIZE_STORAGE_KEY = 'stflab_app_font_size';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
      // Default to dark mode
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  const [fontSize, setFontSizeState] = useState<FontSizeLevel>(() => {
    try {
      const stored = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
      if (stored === 'pequena' || stored === 'mediana' || stored === 'grande') {
        return stored;
      }
      return 'mediana';
    } catch {
      return 'mediana';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      const root = document.documentElement;
      if (theme === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
      }
    } catch (e) {
      console.warn('Error aplicando tema:', e);
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, fontSize);
      const root = document.documentElement;
      root.setAttribute('data-font-size', fontSize);
      root.classList.remove('font-pequena', 'font-mediana', 'font-grande');
      root.classList.add(`font-${fontSize}`);
    } catch (e) {
      console.warn('Error aplicando tamaño de fuente:', e);
    }
  }, [fontSize]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setFontSize = (newSize: FontSizeLevel) => {
    setFontSizeState(newSize);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};
