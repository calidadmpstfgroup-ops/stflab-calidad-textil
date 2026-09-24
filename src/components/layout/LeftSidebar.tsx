import React, { useState, useEffect, useRef } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useLanguage } from '../../context/LanguageContext';
import { AreaType } from '../../types';
import { 
  LayoutDashboard, 
  FlaskConical, 
  FileText, 
  ShoppingBag, 
  Ruler, 
  Scissors, 
  MessageSquare,
  BookOpen,
  FolderKanban,
  Settings,
  LogOut,
  X,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reproducirSonidoCampanaLab } from '../../utils/soundNotifier';

interface LeftSidebarProps {
  onAbrirBaseFT?: () => void;
  onAbrirPortalToken?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = () => {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const { areaActual, setAreaActual, solicitudesTelas } = useQuality();
  const { cerrarSesion } = useAuth();
  const prevCountRef = useRef<number>(0);

  // Calcular total de solicitudes/muestras pendientes para Laboratorio
  const pendientesLabCount = (solicitudesTelas || []).flatMap(s => s.telas || []).filter(t => !t.dictamen || t.dictamen === 'PENDIENTE' || t.dictamen === 'EN_PROCESO').length;

  // Notificar con sonido cuando aumenta o existen solicitudes pendientes para laboratorio
  useEffect(() => {
    if (pendientesLabCount > prevCountRef.current && pendientesLabCount > 0) {
      reproducirSonidoCampanaLab();
    }
    prevCountRef.current = pendientesLabCount;
  }, [pendientesLabCount]);

  useEffect(() => {
    const handleToggle = () => setOpen(prev => !prev);
    window.addEventListener('stf_toggle_mobile_sidebar', handleToggle);
    return () => window.removeEventListener('stf_toggle_mobile_sidebar', handleToggle);
  }, []);

  const navItems: Array<{ id: AreaType; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: t('Dashboard', 'Dashboard'), icon: <LayoutDashboard className="w-4.5 h-4.5 shrink-0" /> },
    { id: 'laboratorio', label: t('Laboratorio', 'Laboratory'), icon: <FlaskConical className="w-4.5 h-4.5 shrink-0" /> },
    { id: 'homologacion', label: t('Evaluaciones', 'Evaluations'), icon: <FileText className="w-4.5 h-4.5 shrink-0" /> },
    { id: 'compras', label: t('Compras', 'Purchasing'), icon: <ShoppingBag className="w-4.5 h-4.5 shrink-0" /> },
    { id: 'patronaje', label: t('Patronaje', 'Patterning'), icon: <Ruler className="w-4.5 h-4.5 shrink-0" /> },
    { id: 'corte', label: t('Corte', 'Cutting'), icon: <Scissors className="w-4.5 h-4.5 shrink-0" /> },
    { id: 'chat', label: t('Chat por Áreas', 'Area Chat'), icon: <MessageSquare className="w-4.5 h-4.5 shrink-0" /> },
    { id: 'biblioteca', label: t('Biblioteca Técnica', 'Technical Library'), icon: <BookOpen className="w-4.5 h-4.5 shrink-0" /> },
    { id: 'documentos', label: t('Documentos', 'Documents'), icon: <FolderKanban className="w-4.5 h-4.5 shrink-0" /> },
  ];

  const handleSeleccionarArea = (id: AreaType) => {
    setAreaActual(id);
    setOpen(false);
  };

  return (
    <>
      {/* Backdrop overlay para menú lateral desplegable */}
      {open && (
        <div 
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs transition-opacity animate-fade-in"
        />
      )}

      {/* Menú Drawer Desplegable por Hamburguesa */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 bg-[#252528] text-[#C8C2B8] shadow-2xl transition-transform duration-300 flex flex-col font-sans select-none w-72 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Botón Cerrar Drawer */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          title={t('Cerrar menú', 'Close menu')}
          className="absolute right-4 top-5 text-[#C8C2B8] hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-[#38383B]">
          <img 
            src="/stf-group-logo-gold.png" 
            alt="STF Group S.A. - Studio F, ELA, STF MAN" 
            className="h-8 sm:h-9 w-auto object-contain"
          />
          <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#C6A466] bg-[#C6A466]/10 px-2.5 py-1 rounded-lg border border-[#C6A466]/30">v2.0</span>
        </div>

        {/* Main Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-vertical-scroll">
          {navItems.map((item) => {
            const esActivo = areaActual === item.id || 
              (item.id === 'compras' && (areaActual === 'compras-decision' || areaActual === 'homologacion'));

            const esLab = item.id === 'laboratorio';
            const tienePendientesLab = esLab && pendientesLabCount > 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSeleccionarArea(item.id)}
                title={item.label}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  esActivo
                    ? 'bg-[#C6A466] text-[#1E1E21] font-bold shadow-md'
                    : tienePendientesLab
                    ? 'bg-[#38383B] text-white border border-rose-500/40'
                    : 'text-[#C8C2B8] hover:text-white hover:bg-[#38383B]'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={tienePendientesLab ? 'text-rose-400 animate-pulse' : ''}>
                    {item.icon}
                  </span>
                  <span className="truncate tracking-wide text-xs">{item.label}</span>
                </div>

                {/* NOTIFICACIÓN ANIMADA PARA LABORATORIO */}
                {tienePendientesLab && (
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                    <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse shadow-sm font-mono">
                      {pendientesLabCount}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#38383B] space-y-1 bg-[#15110E]">
          <button
            type="button"
            onClick={() => handleSeleccionarArea('configuracion')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer justify-start ${
              areaActual === 'configuracion' 
                ? 'bg-[#C6A466] text-[#1E1E21] font-bold' 
                : 'text-[#C8C2B8] hover:text-white hover:bg-[#38383B]'
            }`}
          >
            <Settings className="w-4.5 h-4.5 shrink-0" />
            <span>{t('Configuración', 'Settings')}</span>
          </button>

          <button
            type="button"
            onClick={cerrarSesion}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-all cursor-pointer justify-start"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            <span>{t('Cerrar Sesión', 'Sign Out')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
