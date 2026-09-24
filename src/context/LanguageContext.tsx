import React, { createContext, useContext, useState, useEffect } from 'react';

export type Idioma = 'es' | 'en';

interface LanguageContextType {
  idioma: Idioma;
  setIdioma: (idioma: Idioma) => void;
  toggleIdioma: () => void;
  t: (es: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [idioma, setIdiomaState] = useState<Idioma>(() => {
    const saved = localStorage.getItem('stflab_language');
    return (saved === 'en' || saved === 'es') ? saved : 'es'; // Default to Spanish
  });

  const setIdioma = (nuevoIdioma: Idioma) => {
    setIdiomaState(nuevoIdioma);
    localStorage.setItem('stflab_language', nuevoIdioma);
  };

  const toggleIdioma = () => {
    setIdioma(idioma === 'es' ? 'en' : 'es');
  };

  // Translation helper function
  const t = (es: string, en: string): string => {
    return idioma === 'es' ? es : en;
  };

  return (
    <LanguageContext.Provider value={{ idioma, setIdioma, toggleIdioma, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  }
  return context;
};
