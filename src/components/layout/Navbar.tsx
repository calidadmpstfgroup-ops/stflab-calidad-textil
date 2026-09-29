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
  Calendar,
  Sparkles,
  Type
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onAbrirBaseFT?: () => void;
  onAbrirPortalToken?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { areaActual, subseccionLaboratorio, subseccionCompras, pendientesLabTotal, solicitudesTelas } = useQuality();
  const { idioma, setIdioma, t } = useLanguage();
  const { theme, toggleTheme, fontSize, setFontSize } = useTheme();
  const { usuario, cerrarSesion } = useAuth();
  const [dropdownUsuarioAbierto, setDropdownUsuarioAbierto] = useState(false);

  const pendientesLabCount = pendientesLabTotal > 0
    ? pendientesLabTotal
    : (solicitudesTelas || []).flatMap(s => s.telas || []).filter(t => !t.dictamen || t.dictamen === 'PENDIENTE' || t.dictamen === 'EN_PROCESO').length;

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
      case 'laboratorio': 
        return subseccionLaboratorio === 'accesorios'
          ? t('Laboratorio • Insumos', 'Laboratory • Supplies')
          : subseccionLaboratorio === 'forros-costuras'
          ? t('Laboratorio • Forros & Costuras', 'Laboratory • Linings & Seams')
          : subseccionLaboratorio === 'historial'
          ? t('Laboratorio • Historial', 'Laboratory • History')
          : t('Laboratorio • Telas', 'Laboratory • Fabrics');
      case 'compras': 
      case 'compras-decision': 
        return subseccionCompras === 'accesorios'
          ? t('Compras • Insumos', 'Purchasing • Supplies')
          : t('Compras • Telas', 'Purchasing • Fabrics');
      case 'patronaje': return t('Patronaje', 'Patterning');
      case 'corte': return t('Corte', 'Cutting');
      case 'homologacion': return t('Evaluaciones', 'Evaluations');
      case 'configuracion': return t('Configuración', 'Settings');
      case 'chat': return t('Chat por Áreas', 'Area Chat');
      case 'biblioteca': return t('Biblioteca Técnica', 'Technical Library');
      case 'indicadores': return t('Indicadores', 'Indicators');
      case 'documentos': return t('Documentos', 'Documents');
      case 'soporte-tecnico': return t('Centro de Monitoreo • Soporte Técnico', 'Monitoring Center • Technical Support');
      default: return t('Dashboard', 'Dashboard');
    }
  };

  // Obtener iniciales para el avatar
  const getInitials = (name?: string) => {
    if (!name) return 'AM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white/90 dark:bg-[#0b1329]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#17254e] sticky top-0 z-30 py-3.5 sm:py-4 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="w-full max-w-[1750px] mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Botón de Hamburguesa, Logo STF, Título de Área & Chip de Fecha */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMobileSidebar}
            title={t('Abrir menú', 'Open menu')}
            className="relative p-2.5 rounded-xl bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#182c57] transition-all cursor-pointer shadow-2xs flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
            {pendientesLabCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 text-white font-mono text-[9px] font-black items-center justify-center">
                  {pendientesLabCount}
                </span>
              </span>
            )}
          </button>

          {/* Logo Oficial de STF Group */}
          <div className="flex items-center pl-1 sm:pl-2 pr-2 border-r border-slate-200 dark:border-[#17254e]">
            <img 
              src={theme === 'dark' ? "/stf-group-logo-gold.png" : "/stf-group-logo-dark.png"} 
              alt="STF Group S.A. - Studio F, ELA, STF MAN" 
              className="h-7 sm:h-9 w-auto object-contain transition-all hover:scale-105"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              {getAreaTitle()}
            </h1>

            {/* Chip de Fecha */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#00b4d8]" />
              <span className="capitalize">{fechaActualFormateada}</span>
            </div>
          </div>
        </div>

        {/* Right: Herramientas de Cabecera (Tema, Idioma y Perfil) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Selector de Tema Claro / Oscuro */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? "Modo Claro" : "Modo Oscuro"}
            className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182c57] transition-all cursor-pointer shadow-2xs"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Nivel de Tamaño de Letra Rápido */}
          <button
            type="button"
            onClick={() => {
              const next = fontSize === 'pequena' ? 'mediana' : fontSize === 'mediana' ? 'grande' : 'pequena';
              setFontSize(next);
            }}
            title={`Tamaño de Letra: ${fontSize === 'pequena' ? 'Pequeña (14px)' : fontSize === 'grande' ? 'Grande (17.5px)' : 'Mediana (16px)'} - Clic para cambiar`}
            className="h-9 px-2 sm:px-2.5 rounded-xl bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182c57] transition-all cursor-pointer shadow-2xs font-bold text-xs"
          >
            <Type className="w-3.5 h-3.5 text-[#00b4d8]" />
            <span className="text-[10px] uppercase font-mono font-bold hidden sm:inline">
              {fontSize === 'pequena' ? 'A-' : fontSize === 'grande' ? 'A+' : 'A'}
            </span>
          </button>

          {/* Selector de Idioma [ ES | EN ] */}
          <div className="bg-slate-100 dark:bg-[#132247] p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-[#1e3461] flex items-center gap-0.5 sm:gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setIdioma('es')}
              className={`px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                idioma === 'es'
                  ? 'bg-[#00b4d8] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setIdioma('en')}
              className={`px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                idioma === 'en'
                  ? 'bg-[#00b4d8] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Chip de Perfil de Usuario */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownUsuarioAbierto(!dropdownUsuarioAbierto)}
              className="bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] hover:border-[#00b4d8] text-slate-900 dark:text-white px-2.5 sm:px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 via-[#00b4d8] to-teal-400 flex items-center justify-center text-white font-extrabold text-[10px] shadow-xs">
                {getInitials(usuario?.displayName || 'Ana María')}
              </div>
              <span className="truncate max-w-[90px] sm:max-w-[140px] text-xs font-bold">
                {usuario?.displayName || 'Calidad / Quality'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
            </button>

            {dropdownUsuarioAbierto && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#0f1b35] border border-slate-200 dark:border-[#1e3461] rounded-2xl shadow-xl py-2 z-50 animate-fade-in text-xs">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-[#1e3461]">
                  <p className="font-bold text-slate-900 dark:text-white">{usuario?.displayName || 'Usuario Calidad'}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono mt-0.5">{usuario?.role || 'ADMIN'}</p>
                </div>
                
                <div className="py-1">
                  <div className="px-4 py-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#00b4d8]" />
                    <span>STFLab 2.0 • Online</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-[#1e3461] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownUsuarioAbierto(false);
                      cerrarSesion();
                    }}
                    className="w-full text-left px-4 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium transition-colors"
                  >
                    {t('Cerrar Sesión', 'Sign Out')}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
