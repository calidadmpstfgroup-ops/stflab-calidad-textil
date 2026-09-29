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
  ChevronDown,
  Trash2,
  X,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { reproducirSonidoCampanaLab } from '../../utils/soundNotifier';
import { esUsuarioAdminOSoporte } from '../../services/monitoringService';

interface LeftSidebarProps {
  onAbrirBaseFT?: () => void;
  onAbrirPortalToken?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = () => {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { 
    areaActual, 
    setAreaActual, 
    subseccionLaboratorio,
    subseccionCompras,
    navegarA,
    pendientesLabTelas, 
    pendientesLabInsumos,
    pendientesLabTotal, 
    totalComprasTelas,
    totalComprasInsumos,
    solicitudesTelas,
    solicitudesAccesorios,
    evaluacionesForrosCosturas,
    papelera,
    setModalPapeleraAbierto
  } = useQuality();
  const { cerrarSesion, usuario } = useAuth();
  const esAdminOSoporte = esUsuarioAdminOSoporte(usuario);
  const prevCountRef = useRef<number>(0);

  // Estados de apertura de los menús desplegables
  const [openLab, setOpenLab] = useState<boolean>(true);
  const [openCompras, setOpenCompras] = useState<boolean>(true);

  // Mantener desplegado el menú cuando el usuario está en el área correspondiente
  useEffect(() => {
    if (areaActual === 'laboratorio') setOpenLab(true);
    if (areaActual === 'compras' || areaActual === 'compras-decision') setOpenCompras(true);
  }, [areaActual]);

  // Total de solicitudes/muestras pendientes para Laboratorio
  const pendientesLabCount = pendientesLabTotal > 0 
    ? pendientesLabTotal 
    : (solicitudesTelas || []).flatMap(s => s.telas || []).filter(t => !t.dictamen || t.dictamen === 'PENDIENTE' || t.dictamen === 'EN_PROCESO').length;

  // Notificar con sonido cuando aumentan las solicitudes pendientes para laboratorio
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

  const handleSeleccionarArea = (id: AreaType) => {
    setAreaActual(id);
    setOpen(false);
  };

  const handleNavegarSubArea = (area: AreaType, subseccion: string) => {
    navegarA(area, subseccion);
    setOpen(false);
  };

  // Conteo de items para subáreas
  const cantLabTelas = pendientesLabTelas || (solicitudesTelas || []).flatMap(s => s.telas || []).filter(t => !t.dictamen || t.dictamen === 'PENDIENTE' || t.dictamen === 'EN_PROCESO').length;
  const cantLabInsumos = pendientesLabInsumos || (solicitudesAccesorios || []).flatMap(s => s.muestras || []).filter(m => !m.dictamen || m.dictamen === 'PENDIENTE' || m.dictamen === 'EN_PROCESO').length;
  const cantLabForros = evaluacionesForrosCosturas?.length || 1;

  const cantComprasTelas = totalComprasTelas || (solicitudesTelas?.length ?? 0);
  const cantComprasInsumos = totalComprasInsumos || (solicitudesAccesorios?.length ?? 0);

  return (
    <>
      {/* Backdrop overlay para menú lateral desplegable */}
      {open && (
        <div 
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
        />
      )}

      {/* Menú Drawer Desplegable por Hamburguesa */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 bg-white dark:bg-[#0b1329] text-slate-800 dark:text-slate-100 shadow-2xl transition-transform duration-300 flex flex-col font-sans select-none w-72 border-r border-slate-200 dark:border-[#17254e] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Botón Cerrar Drawer */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          title={t('Cerrar menú', 'Close menu')}
          className="absolute right-4 top-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#132247] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-[#17254e]">
          <img 
            src={theme === 'dark' ? "/stf-group-logo-gold.png" : "/stf-group-logo-dark.png"} 
            alt="STF Group S.A. - Studio F, ELA, STF MAN" 
            className="h-8 sm:h-9 w-auto object-contain"
          />
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#00b4d8] bg-[#00b4d8]/10 px-2.5 py-1 rounded-lg border border-[#00b4d8]/30">
            v2.0
          </span>
        </div>

        {/* Main Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-vertical-scroll">
          
          {/* 1. DASHBOARD GENERAL */}
          <button
            type="button"
            onClick={() => handleSeleccionarArea('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
              areaActual === 'dashboard'
                ? 'bg-[#00c0f0] text-white font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132247]'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <LayoutDashboard className={`w-4.5 h-4.5 shrink-0 ${areaActual === 'dashboard' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate tracking-wide text-xs">{t('Dashboard General', 'General Dashboard')}</span>
            </div>
          </button>

          {/* 2. LABORATORIO (MENÚ DESPLEGABLE) */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                setOpenLab(prev => !prev);
                if (areaActual !== 'laboratorio') {
                  navegarA('laboratorio', 'telas');
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                areaActual === 'laboratorio'
                  ? 'bg-slate-100 dark:bg-[#132247] text-slate-900 dark:text-white font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132247]'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <FlaskConical className={`w-4.5 h-4.5 shrink-0 ${
                  areaActual === 'laboratorio' ? 'text-[#00c0f0]' : 'text-slate-500 dark:text-slate-400'
                }`} />
                <span className="truncate uppercase font-black tracking-wider text-xs">
                  {t('LABORATORIO', 'LABORATORY')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Badge global animado si hay pendientes */}
                {cantLabTelas + cantLabInsumos > 0 && (
                  <span className="bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[10px] px-2 py-0.5 rounded-full font-black font-mono">
                    {cantLabTelas + cantLabInsumos}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openLab ? 'rotate-180 text-[#00c0f0]' : ''
                }`} />
              </div>
            </button>

            {/* Sub-áreas de Laboratorio con Guía Vertical */}
            {openLab && (
              <div className="ml-5 pl-3 border-l-2 border-slate-200 dark:border-slate-800/80 space-y-1 py-1">
                
                {/* Sub-área: Telas */}
                <button
                  type="button"
                  onClick={() => handleNavegarSubArea('laboratorio', 'telas')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    areaActual === 'laboratorio' && (subseccionLaboratorio === 'telas' || !subseccionLaboratorio)
                      ? 'bg-[#00c0f0]/15 dark:bg-[#00c0f0]/25 text-[#008db0] dark:text-[#38bdf8] font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-[#132247]/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">🧵</span>
                    <span className="truncate">Telas</span>
                  </div>
                  {cantLabTelas > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                      {cantLabTelas}
                    </span>
                  )}
                </button>

                {/* Sub-área: Insumos */}
                <button
                  type="button"
                  onClick={() => handleNavegarSubArea('laboratorio', 'accesorios')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    areaActual === 'laboratorio' && (subseccionLaboratorio === 'accesorios' || (subseccionLaboratorio as string) === 'insumos')
                      ? 'bg-[#00c0f0]/15 dark:bg-[#00c0f0]/25 text-[#008db0] dark:text-[#38bdf8] font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-[#132247]/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">🔩</span>
                    <span className="truncate">Insumos</span>
                  </div>
                  {cantLabInsumos > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                      {cantLabInsumos}
                    </span>
                  )}
                </button>

                {/* Sub-área: Forros costuras */}
                <button
                  type="button"
                  onClick={() => handleNavegarSubArea('laboratorio', 'forros-costuras')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    areaActual === 'laboratorio' && subseccionLaboratorio === 'forros-costuras'
                      ? 'bg-[#00c0f0]/15 dark:bg-[#00c0f0]/25 text-[#008db0] dark:text-[#38bdf8] font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-[#132247]/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">🪡</span>
                    <span className="truncate">Forros & Costura (PNP)</span>
                  </div>
                  {cantLabForros > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-[#00c0f0]/20 text-[#008db0] dark:text-[#38bdf8] border border-[#00c0f0]/30">
                      {cantLabForros}
                    </span>
                  )}
                </button>

              </div>
            )}
          </div>

          {/* 3. COMPRAS (MENÚ DESPLEGABLE) */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                setOpenCompras(prev => !prev);
                if (areaActual !== 'compras' && areaActual !== 'compras-decision') {
                  navegarA('compras', 'telas');
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                areaActual === 'compras' || areaActual === 'compras-decision'
                  ? 'bg-slate-100 dark:bg-[#132247] text-slate-900 dark:text-white font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132247]'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <ShoppingBag className={`w-4.5 h-4.5 shrink-0 ${
                  areaActual === 'compras' || areaActual === 'compras-decision' ? 'text-[#00c0f0]' : 'text-slate-500 dark:text-slate-400'
                }`} />
                <span className="truncate uppercase font-black tracking-wider text-xs">
                  {t('COMPRAS', 'PURCHASING')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {cantComprasTelas + cantComprasInsumos > 0 && (
                  <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 text-[10px] px-2 py-0.5 rounded-full font-black font-mono">
                    {cantComprasTelas + cantComprasInsumos}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openCompras ? 'rotate-180 text-[#00c0f0]' : ''
                }`} />
              </div>
            </button>

            {/* Sub-áreas de Compras con Guía Vertical */}
            {openCompras && (
              <div className="ml-5 pl-3 border-l-2 border-slate-200 dark:border-slate-800/80 space-y-1 py-1">
                
                {/* Sub-área: Telas */}
                <button
                  type="button"
                  onClick={() => handleNavegarSubArea('compras', 'telas')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    (areaActual === 'compras' || areaActual === 'compras-decision') && (subseccionCompras === 'telas' || !subseccionCompras)
                      ? 'bg-[#00c0f0]/15 dark:bg-[#00c0f0]/25 text-[#008db0] dark:text-[#38bdf8] font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-[#132247]/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">🧵</span>
                    <span className="truncate">Telas</span>
                  </div>
                  {cantComprasTelas > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                      {cantComprasTelas}
                    </span>
                  )}
                </button>

                {/* Sub-área: Insumos */}
                <button
                  type="button"
                  onClick={() => handleNavegarSubArea('compras', 'accesorios')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    (areaActual === 'compras' || areaActual === 'compras-decision') && subseccionCompras === 'accesorios'
                      ? 'bg-[#00c0f0]/15 dark:bg-[#00c0f0]/25 text-[#008db0] dark:text-[#38bdf8] font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-[#132247]/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">🔩</span>
                    <span className="truncate">Insumos</span>
                  </div>
                  {cantComprasInsumos > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                      {cantComprasInsumos}
                    </span>
                  )}
                </button>

              </div>
            )}
          </div>

          {/* 4. MOLDES Y PATRONAJE */}
          <button
            type="button"
            onClick={() => handleSeleccionarArea('patronaje')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
              areaActual === 'patronaje'
                ? 'bg-[#00c0f0] text-white font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132247]'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <Ruler className={`w-4.5 h-4.5 shrink-0 ${areaActual === 'patronaje' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate tracking-wide text-xs">{t('Moldes y Patronaje', 'Grading & Patterning')}</span>
            </div>
          </button>

          {/* 5. CORTE & TENDIDO */}
          <button
            type="button"
            onClick={() => handleSeleccionarArea('corte')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
              areaActual === 'corte'
                ? 'bg-[#00c0f0] text-white font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132247]'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <Scissors className={`w-4.5 h-4.5 shrink-0 ${areaActual === 'corte' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate tracking-wide text-xs">{t('Corte y Tendido', 'Cutting & Laying')}</span>
            </div>
          </button>

          {/* 6. EVALUACIONES */}
          <button
            type="button"
            onClick={() => handleSeleccionarArea('homologacion')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
              areaActual === 'homologacion'
                ? 'bg-[#00c0f0] text-white font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132247]'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <FileText className={`w-4.5 h-4.5 shrink-0 ${areaActual === 'homologacion' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate tracking-wide text-xs">{t('Evaluaciones', 'Evaluations')}</span>
            </div>
          </button>

          {/* 7. CHAT POR ÁREAS */}
          <button
            type="button"
            onClick={() => handleSeleccionarArea('chat')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
              areaActual === 'chat'
                ? 'bg-[#00c0f0] text-white font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132247]'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <MessageSquare className={`w-4.5 h-4.5 shrink-0 ${areaActual === 'chat' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate tracking-wide text-xs">{t('Chat por Áreas', 'Area Chat')}</span>
            </div>
          </button>

          {/* 8. BIBLIOTECA TÉCNICA */}
          <button
            type="button"
            onClick={() => handleSeleccionarArea('biblioteca')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
              areaActual === 'biblioteca'
                ? 'bg-[#00c0f0] text-white font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132247]'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <BookOpen className={`w-4.5 h-4.5 shrink-0 ${areaActual === 'biblioteca' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate tracking-wide text-xs">{t('Biblioteca Técnica', 'Technical Library')}</span>
            </div>
          </button>

          {/* 9. DOCUMENTOS */}
          <button
            type="button"
            onClick={() => handleSeleccionarArea('documentos')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
              areaActual === 'documentos'
                ? 'bg-[#00c0f0] text-white font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132247]'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <FolderKanban className={`w-4.5 h-4.5 shrink-0 ${areaActual === 'documentos' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate tracking-wide text-xs">{t('Documentos', 'Documents')}</span>
            </div>
          </button>

          {/* 10. CENTRO DE MONITOREO (Solo Administrador y Soporte Técnico) */}
          {esAdminOSoporte && (
            <button
              type="button"
              onClick={() => handleSeleccionarArea('soporte-tecnico')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                areaActual === 'soporte-tecnico'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132247]'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Activity className={`w-4.5 h-4.5 shrink-0 ${areaActual === 'soporte-tecnico' ? 'text-white' : 'text-cyan-500'}`} />
                <span className="truncate tracking-wide text-xs font-bold">Centro de Monitoreo</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 font-mono border border-emerald-500/30">
                EN VIVO
              </span>
            </button>
          )}

          {/* 11. PAPELERA DE RECICLAJE */}
          <button
            type="button"
            onClick={() => {
              setModalPapeleraAbierto(true);
              setOpen(false);
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 truncate">
              <Trash2 className="w-4.5 h-4.5 shrink-0 text-rose-500 dark:text-rose-400" />
              <span className="truncate tracking-wide text-xs">Papelera de Reciclaje</span>
            </div>
            {papelera.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white font-mono shadow-xs">
                {papelera.length}
              </span>
            )}
          </button>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-[#17254e] space-y-1 bg-slate-50/60 dark:bg-[#091124]">
          <button
            type="button"
            onClick={() => handleSeleccionarArea('configuracion')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer justify-start ${
              areaActual === 'configuracion' 
                ? 'bg-[#00c0f0] text-white font-bold shadow-md shadow-cyan-500/20' 
                : 'text-slate-600 dark:text-[#1e3a8a] hover:text-slate-900 dark:hover:text-[#172554] hover:bg-slate-100 dark:hover:bg-blue-950/20'
            }`}
            style={
              theme === 'dark' && areaActual !== 'configuracion'
                ? { color: '#1e3a8a' }
                : undefined
            }
          >
            <Settings 
              className="w-4.5 h-4.5 shrink-0" 
              style={theme === 'dark' && areaActual !== 'configuracion' ? { color: '#1e3a8a' } : undefined}
            />
            <span 
              className="font-semibold"
              style={theme === 'dark' && areaActual !== 'configuracion' ? { color: '#1e3a8a' } : undefined}
            >
              {t('Configuración', 'Settings')}
            </span>
          </button>

          <button
            type="button"
            onClick={cerrarSesion}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer justify-start"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            <span>{t('Cerrar Sesión', 'Sign Out')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
