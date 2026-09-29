import React, { useState, useEffect } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { KpiCards } from './KpiCards';
import { ChartsSection } from './ChartsSection';
import { FiltersBar } from './FiltersBar';
import { InventarioDosColumnas } from './InventarioDosColumnas';
import { KanbanFlujoDashboard } from './KanbanFlujoDashboard';
import { TraceabilityTable } from './TraceabilityTable';
import { IndicadoresView } from '../areas/IndicadoresView';
import { LayoutDashboard, BarChart3, Layers, Sparkles, Calendar, Eye, ChevronDown } from 'lucide-react';

interface DashboardViewProps {
  submoduloInicial?: 'general' | 'indicadores' | 'todos';
}

export const DashboardView: React.FC<DashboardViewProps> = ({ submoduloInicial = 'general' }) => {
  const { areaActual } = useQuality();
  const { usuario } = useAuth();
  const { t } = useLanguage();
  const [submodulo, setSubmodulo] = useState<'general' | 'indicadores' | 'todos'>(
    areaActual === 'indicadores' ? 'indicadores' : submoduloInicial
  );
  const [menuVistaAbierto, setMenuVistaAbierto] = useState(false);

  useEffect(() => {
    if (areaActual === 'indicadores') {
      setSubmodulo('indicadores');
    }
  }, [areaActual]);

  const fechaFormateada = new Date().toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const getNombreUsuario = () => {
    if (usuario?.displayName) return usuario.displayName.split(' ')[0];
    return 'Ana María';
  };

  return (
    <div className="space-y-6 font-sans select-none animate-fade-in">

      {/* ── HEADER PRINCIPAL: BIENVENIDA IDÉNTICA A LA IMAGEN DE REFERENCIA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Bienvenida, {getNombreUsuario()}</span>
            <span>👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aquí tienes un resumen del estado de tu laboratorio textil.
          </p>
        </div>

        {/* Herramientas de Cabecera: Fecha y Selector de Vista */}
        <div className="flex items-center gap-2.5 shrink-0">

          {/* Chip de Fecha */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#0f1b35] border border-slate-200 dark:border-[#1e3461] rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="capitalize">{fechaFormateada}</span>
          </div>

          {/* Selector de Vista ("Vista general ▾") */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuVistaAbierto(!menuVistaAbierto)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#0f1b35] border border-slate-200 dark:border-[#1e3461] hover:border-[#00b4d8] text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#00b4d8]" />
              <span>
                {submodulo === 'general' && 'Vista general'}
                {submodulo === 'indicadores' && 'Indicadores Estadísticos'}
                {submodulo === 'todos' && 'Vista Completa'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {menuVistaAbierto && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f1b35] border border-slate-200 dark:border-[#1e3461] rounded-2xl shadow-xl py-1.5 z-40 animate-fade-in text-xs">
                <button
                  type="button"
                  onClick={() => { setSubmodulo('general'); setMenuVistaAbierto(false); }}
                  className={`w-full text-left px-3.5 py-2 flex items-center gap-2 transition-colors ${submodulo === 'general'
                      ? 'bg-[#00b4d8]/10 text-[#00b4d8] font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#132247]'
                    }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Vista general (Referencia)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSubmodulo('indicadores'); setMenuVistaAbierto(false); }}
                  className={`w-full text-left px-3.5 py-2 flex items-center gap-2 transition-colors ${submodulo === 'indicadores'
                      ? 'bg-[#00b4d8]/10 text-[#00b4d8] font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#132247]'
                    }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Indicadores Estadísticos</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSubmodulo('todos'); setMenuVistaAbierto(false); }}
                  className={`w-full text-left px-3.5 py-2 flex items-center gap-2 transition-colors ${submodulo === 'todos'
                      ? 'bg-[#00b4d8]/10 text-[#00b4d8] font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#132247]'
                    }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Vista Completa & Operativa</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── VISTA GENERAL (IDÉNTICA A LA IMAGEN) ── */}
      {submodulo === 'general' && (
        <div className="space-y-5 animate-fade-in">
          {/* Fila de 5 Tarjetas KPI */}
          <KpiCards />

          {/* Grilla Principal de Gráficos, Asistente y Documentos */}
          <ChartsSection />

          {/* Panel Desplegable Opcional de Trazabilidad Operativa sin perder nada */}
          <div className="pt-2">
            <details className="group bg-white dark:bg-[#0f1b35] border border-slate-200/90 dark:border-[#1e3461] rounded-2xl shadow-xs transition-all">
              <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#00b4d8]" />
                  <span>Módulos de Trazabilidad, Kanban y Filtros Avanzados</span>
                </div>
                <span className="text-xs text-slate-400 font-normal group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-[#17254e] space-y-6">
                <FiltersBar />
                <InventarioDosColumnas />
                <KanbanFlujoDashboard />
                <TraceabilityTable />
              </div>
            </details>
          </div>
        </div>
      )}

      {/* ── SUBMÓDULO: INDICADORES ESTADÍSTICOS ── */}
      {submodulo === 'indicadores' && (
        <div className="animate-fade-in">
          <IndicadoresView />
        </div>
      )}

      {/* ── SUBMÓDULO: VISTA COMPLETA ── */}
      {submodulo === 'todos' && (
        <div className="space-y-6 animate-fade-in">
          <KpiCards />
          <ChartsSection />
          <FiltersBar />
          <InventarioDosColumnas />
          <KanbanFlujoDashboard />
          <TraceabilityTable />
          <div className="pt-6 border-t border-slate-200 dark:border-[#1e3461]">
            <IndicadoresView />
          </div>
        </div>
      )}

    </div>
  );
};
