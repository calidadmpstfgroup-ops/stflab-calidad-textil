import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  ChevronDown,
  Sun,
  Moon,
  Menu,
  Calendar
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onAbrirBaseFT?: () => void;
  onAbrirPortalToken?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { areaActual, solicitudesTelas } = useQuality();
  const { idioma, setIdioma, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { usuario } = useAuth();
  const [dropdownUsuarioAbierto, setDropdownUsuarioAbierto] = useState(false);

  const pendientesLabCount = (solicitudesTelas || []).flatMap(s => s.telas || []).filter(t => !t.dictamen || t.dictamen === 'PENDIENTE' || t.dictamen === 'EN_PROCESO').length;

  const fechaActualFormateada = new Date().toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const toggleMobileSidebar = () => {
    window.dispatchEvent(new Event('stf_toggle_mobile_sidebar'));
  };

  const getAreaTitle = () => {
    switch (areaActual) {
      case 'dashboard': return t('Dashboard', 'Dashboard');
      case 'laboratorio': return t('Laboratorio', 'Laboratory');
      case 'compras': 
      case 'compras-decision': return t('Compras', 'Purchasing');
      case 'patronaje': return t('Patronaje', 'Patterning');
      case 'corte': return t('Corte', 'Cutting');
      case 'homologacion': return t('Evaluaciones', 'Evaluations');
      case 'configuracion': return t('Configuración', 'Settings');
      case 'chat': return t('Chat por Áreas', 'Area Chat');
      case 'biblioteca': return t('Biblioteca Técnica', 'Technical Library');
      case 'indicadores': return t('Indicadores', 'Indicators');
      case 'documentos': return t('Documentos', 'Documents');
      default: return t('Dashboard', 'Dashboard');
    }
  };

  return (
    <header className="bg-[#F4F3ED] border-b border-transparent sticky top-0 z-30 py-4 sm:py-5 px-4 sm:px-6 font-sans">
      <div className="w-full max-w-[1750px] mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Hamburger Menu Button, STF Group Logo, Page Title & Date Badge */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMobileSidebar}
            title={t('Abrir menú', 'Open menu')}
            className="relative p-2.5 rounded-xl bg-white border border-[#EFECE6] text-[#2D2D30] hover:bg-[#F9F8F5] transition-all cursor-pointer shadow-xs flex items-center justify-center"
          >
            <Menu className="w-5 h-5 text-[#2D2D30]" />
            {pendientesLabCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 text-white font-mono text-[9px] font-black items-center justify-center">
                  {pendientesLabCount}
                </span>
              </span>
            )}
          </button>

          {/* STF Group Official Logo */}
          <div className="flex items-center pl-1 sm:pl-2 pr-2 border-r border-[#EFECE6]/80">
            <img 
              src={theme === 'dark' ? "/stf-group-logo-gold.png" : "/stf-group-logo-dark.png"} 
              alt="STF Group S.A. - Studio F, ELA, STF MAN" 
              className="h-7 sm:h-9 w-auto object-contain transition-all hover:scale-105"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#2D2D30] tracking-tight truncate">
              {getAreaTitle()}
            </h1>

            {/* Current Date Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#EFECE6] rounded-full text-xs font-semibold text-[#2D2D30] shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#6B6256]" />
              <span className="capitalize">{fechaActualFormateada}</span>
            </div>
          </div>
        </div>

        {/* Right: Header Tools */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? "Modo Claro" : "Modo Oscuro"}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#EFECE6] flex items-center justify-center text-[#2D2D30] hover:bg-[#F9F8F5] transition-all cursor-pointer shadow-2xs"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-[#2D2D30]" />}
          </button>

          {/* Language Switcher Pill: [ ES | EN ] */}
          <div className="bg-[#EFECE6] p-0.5 sm:p-1 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setIdioma('es')}
              className={`px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                idioma === 'es'
                  ? 'bg-[#2D2D30] text-white shadow-xs'
                  : 'text-[#6B6256] hover:text-[#2D2D30]'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setIdioma('en')}
              className={`px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                idioma === 'en'
                  ? 'bg-[#2D2D30] text-white shadow-xs'
                  : 'text-[#6B6256] hover:text-[#2D2D30]'
              }`}
            >
              EN
            </button>
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownUsuarioAbierto(!dropdownUsuarioAbierto)}
              className="bg-white border border-[#EFECE6] hover:border-[#D6CDB8] text-[#2D2D30] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#F4F3ED] border border-[#EFECE6] flex items-center justify-center text-[#6B6256]">
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <span className="truncate max-w-[90px] sm:max-w-[140px] text-xs">
                {usuario?.displayName || 'Calidad / Quality'}
              </span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#6B6256]" />
            </button>

            {dropdownUsuarioAbierto && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#EFECE6] rounded-2xl shadow-xl py-2 z-50 animate-fade-in text-xs">
                <div className="px-4 py-2 border-b border-[#EFECE6]">
                  <p className="font-bold text-[#2D2D30]">{usuario?.displayName || 'Usuario Calidad'}</p>
                  <p className="text-[10px] text-[#6B6256] uppercase font-mono">{usuario?.role || 'ADMIN'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDropdownUsuarioAbierto(false)}
                  className="w-full text-left px-4 py-2 text-[#6B6256] hover:bg-[#F9F8F5] font-medium"
                >
                  Perfil de Usuario
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
