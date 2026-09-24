import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useTheme } from '../../context/ThemeContext';
import { AreaType } from '../../types';
import { UserRoleBadge } from '../auth/UserRoleBadge';
import { 
  LayoutDashboard, 
  FlaskConical, 
  ShoppingCart, 
  Ruler, 
  Layers, 
  Shirt, 
  AlertTriangle, 
  FileSpreadsheet, 
  RotateCcw,
  KeyRound,
  BookOpen,
  MessageSquare,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Package,
  Activity
} from 'lucide-react';

interface RightSidebarProps {
  onAbrirBaseFT?: () => void;
  onAbrirPortalToken?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  onAbrirBaseFT,
  onAbrirPortalToken
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { 
    areaActual, 
    setAreaActual, 
    kpis, 
    setModalImportarAbierto,
    setModalAlertasLeadTimeAbierto,
    limpiarTodosLosDatos
  } = useQuality();

  const areasNav: Array<{ id: AreaType; numero: string; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', numero: '1', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 text-amber-400" /> },
    { id: 'laboratorio', numero: '2', label: 'Laboratorio', icon: <FlaskConical className="w-4 h-4 text-purple-400" /> },
    { id: 'compras', numero: '3', label: 'Compras', icon: <ShoppingCart className="w-4 h-4 text-blue-400" /> },
    { id: 'patronaje', numero: '4', label: 'Patronaje', icon: <Ruler className="w-4 h-4 text-emerald-400" /> },
    { id: 'corte', numero: '5', label: 'Corte', icon: <Layers className="w-4 h-4 text-orange-400" /> },
  ];

  return (
    <aside
      className={`fixed right-0 top-16 bottom-0 z-30 bg-[#FBF8F2] border-l border-[#E3D9C7] shadow-2xl transition-all duration-300 flex flex-col font-sans select-none ${
        collapsed ? 'w-14' : 'w-72'
      }`}
    >
      {/* Toggle Button on Left Edge of Sidebar */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expandir panel derecho' : 'Colapsar panel derecho'}
        className="absolute -left-3.5 top-5 w-7 h-7 rounded-full bg-[#2B2B2E] text-[#C6A466] border border-[#3A3A3D] flex items-center justify-center shadow-lg hover:scale-105 transition-all cursor-pointer z-40"
      >
        {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#E3D9C7] flex items-center justify-between bg-[#F4EFE6]">
        {!collapsed && (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#C6A466]" />
              <span className="font-extrabold text-xs uppercase tracking-wider text-[#2B2B2E] font-display">
                PANEL LATERAL REPOSITORIO
              </span>
            </div>
            <p className="text-[10px] text-[#6B5744] font-medium">Información & Accesos de Encabezado</p>
          </div>
        )}
        {collapsed && (
          <Activity className="w-5 h-5 text-[#C6A466] mx-auto" />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">

        {/* 1. Muestras & Resumen KPI */}
        {!collapsed ? (
          <div className="bg-[#F4EFE6] border border-[#E3D9C7] rounded-xl p-3 space-y-2">
            <span className="text-[10px] font-extrabold text-[#6B5744] uppercase tracking-wider block">
              MÉTRICAS DEL ENCABEZADO
            </span>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-[#FBF8F2] p-2 rounded-lg border border-[#E3D9C7]">
                <span className="text-[10px] text-[#6B5744] block">Muestras Total</span>
                <span className="text-base font-bold font-mono text-[#2B2B2E]">{kpis.totalMuestras || 0}</span>
              </div>
              <div className="bg-[#FBF8F2] p-2 rounded-lg border border-[#E3D9C7]">
                <span className="text-[10px] text-[#6B5744] block">Lead Time &gt; 48h</span>
                <span className={`text-base font-bold font-mono ${kpis.totalAlertasLeadTime > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {kpis.totalAlertasLeadTime || 0}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <Package className="w-5 h-5 text-[#6B5744]" />
            <span className="text-[10px] font-mono font-bold text-[#2B2B2E]">{kpis.totalMuestras || 0}</span>
          </div>
        )}

        {/* 2. Áreas de Trabajo / Módulos */}
        <div className="space-y-1.5">
          {!collapsed && (
            <span className="text-[10px] font-extrabold text-[#6B5744] uppercase tracking-wider block px-1">
              ÁREAS DE TRABAJO
            </span>
          )}
          {areasNav.map((item) => {
            const esActivo = areaActual === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setAreaActual(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  esActivo
                    ? 'bg-[#2B2B2E] text-[#C6A466] shadow-md border border-[#3A3A3D]'
                    : 'text-[#6B5744] hover:text-[#2B2B2E] hover:bg-[#F4EFE6]'
                } ${collapsed ? 'justify-center' : 'justify-start'}`}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="truncate">{item.numero}. {item.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. Acciones Rápidas & Herramientas del Encabezado */}
        <div className="space-y-2 pt-2 border-t border-[#E3D9C7]">
          {!collapsed && (
            <span className="text-[10px] font-extrabold text-[#6B5744] uppercase tracking-wider block px-1">
              ACCIONES RÁPIDAS
            </span>
          )}

          {/* User Role Badge inside Sidebar */}
          {!collapsed && (
            <div className="p-1">
              <UserRoleBadge />
            </div>
          )}

          {/* Modo Claro / Modo Oscuro Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-xs ${
              theme === 'dark'
                ? 'bg-[#2B2B2E] text-[#C6A466] border-[#3A3A3D]'
                : 'bg-[#F4EFE6] text-[#2B2B2E] border-[#E3D9C7] hover:bg-[#E3D9C7]/50'
            } ${collapsed ? 'justify-center' : 'justify-start'}`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-[#2B2B2E] shrink-0" />
            )}
            {!collapsed && (
              <span>{theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}</span>
            )}
          </button>

          {/* Base Histórica FT */}
          <button
            type="button"
            onClick={() => onAbrirBaseFT?.()}
            title="Base Histórica de Fichas Técnicas"
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer ${
              collapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
            {!collapsed && <span>Base Fichas Técnicas</span>}
          </button>

          {/* Chat Inter-Áreas */}
          <button
            type="button"
            onClick={() => setAreaActual('chat')}
            title="Chat Inter-Áreas STFLab"
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold bg-[#F4EFE6] text-[#2B2B2E] border border-[#E3D9C7] hover:bg-[#E3D9C7]/50 transition-all cursor-pointer ${
              collapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#C6A466] shrink-0" />
            {!collapsed && <span>Chat Coordinación</span>}
          </button>

          {/* Alert Lead Time > 48h */}
          <button
            type="button"
            onClick={() => setModalAlertasLeadTimeAbierto(true)}
            title="Alertas de Lead Time > 48 Horas"
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-800 border border-rose-500/30 hover:bg-rose-500/20 transition-all cursor-pointer ${
              collapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            {!collapsed && <span>Lead Time &gt; 48h ({kpis.totalAlertasLeadTime || 0})</span>}
          </button>

          {/* Importar Excel */}
          <button
            type="button"
            onClick={() => setModalImportarAbierto(true)}
            title="Importar Ficha Excel o PDF"
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold bg-[#F4EFE6] text-[#2B2B2E] border border-[#E3D9C7] hover:bg-[#E3D9C7]/50 transition-all cursor-pointer ${
              collapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            {!collapsed && <span>Importar Ficha Excel</span>}
          </button>

          {/* Limpiar Todos los Datos */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Deseas reiniciar todos los registros para pruebas en tiempo real desde cero?')) {
                limpiarTodosLosDatos();
              }
            }}
            title="Reiniciar datos de prueba"
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer ${
              collapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-rose-600 shrink-0" />
            {!collapsed && <span>Reiniciar Datos</span>}
          </button>

        </div>
      </div>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-[#E3D9C7] bg-[#F4EFE6] text-center">
          <span className="text-[10px] font-extrabold text-[#6B5744] uppercase tracking-widest block font-display">
            STUDIO F • ELA
          </span>
          <span className="text-[9px] text-[#6B5744]/80 block font-mono">
            STFLab Quality v2.0
          </span>
        </div>
      )}
    </aside>
  );
};
