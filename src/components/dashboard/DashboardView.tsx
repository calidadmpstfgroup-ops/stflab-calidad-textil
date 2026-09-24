import React, { useState, useEffect } from 'react';
import { useQuality } from '../../context/QualityContext';
import { KpiCards } from './KpiCards';
import { ChartsSection } from './ChartsSection';
import { FiltersBar } from './FiltersBar';
import { InventarioDosColumnas } from './InventarioDosColumnas';
import { KanbanFlujoDashboard } from './KanbanFlujoDashboard';
import { TraceabilityTable } from './TraceabilityTable';
import { IndicadoresView } from '../areas/IndicadoresView';
import { LayoutDashboard, BarChart3, Layers, Sparkles } from 'lucide-react';

interface DashboardViewProps {
  submoduloInicial?: 'general' | 'indicadores' | 'todos';
}

export const DashboardView: React.FC<DashboardViewProps> = ({ submoduloInicial = 'general' }) => {
  const { areaActual } = useQuality();
  const [submodulo, setSubmodulo] = useState<'general' | 'indicadores' | 'todos'>(
    areaActual === 'indicadores' ? 'indicadores' : submoduloInicial
  );

  useEffect(() => {
    if (areaActual === 'indicadores') {
      setSubmodulo('indicadores');
    }
  }, [areaActual]);

  return (
    <div className="space-y-6 font-sans select-none animate-fade-in">
      
      {/* Header del Dashboard con Selector de Submódulos */}
      <div className="bg-[#2B2B2E] border border-[#424246] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#C6A466]/10 text-[#C6A466] border border-[#C6A466]/20">
              <LayoutDashboard className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#FBF8F2] tracking-tight">
              Dashboard Principal STFLAB
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#A8A095] mt-1">
            Centro de Mando: Monitoreo de Trazabilidad e Indicadores Estadísticos de Calidad Textil.
          </p>
        </div>

        {/* Pestañas de Submódulos */}
        <div className="flex items-center p-1.5 bg-[#1E1E21] border border-[#38383B] rounded-2xl gap-1 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSubmodulo('general')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              submodulo === 'general'
                ? 'bg-[#C6A466] text-[#1E1E21] shadow-md'
                : 'text-[#A8A095] hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Visión General & Trazabilidad</span>
          </button>

          <button
            type="button"
            onClick={() => setSubmodulo('indicadores')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              submodulo === 'indicadores'
                ? 'bg-[#C6A466] text-[#1E1E21] shadow-md'
                : 'text-[#A8A095] hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Indicadores Estadísticos</span>
          </button>

          <button
            type="button"
            onClick={() => setSubmodulo('todos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              submodulo === 'todos'
                ? 'bg-[#C6A466] text-[#1E1E21] shadow-md'
                : 'text-[#A8A095] hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Vista Completa</span>
          </button>
        </div>
      </div>

      {/* Renderizado de Submódulos según la Pestaña Seleccionada */}
      {submodulo === 'general' && (
        <div className="space-y-6 animate-fade-in">
          <KpiCards />
          <ChartsSection />
          <FiltersBar />
          <InventarioDosColumnas />
          <KanbanFlujoDashboard />
          <TraceabilityTable />
        </div>
      )}

      {submodulo === 'indicadores' && (
        <div className="animate-fade-in">
          <IndicadoresView />
        </div>
      )}

      {submodulo === 'todos' && (
        <div className="space-y-8 animate-fade-in">
          <KpiCards />
          
          <div className="border-t border-[#424246] pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#C6A466]" />
              <h2 className="text-lg font-bold text-[#FBF8F2]">Submódulo: Indicadores Estadísticos de Calidad</h2>
            </div>
            <IndicadoresView />
          </div>

          <div className="border-t border-[#424246] pt-6 space-y-6">
            <ChartsSection />
            <FiltersBar />
            <InventarioDosColumnas />
            <KanbanFlujoDashboard />
            <TraceabilityTable />
          </div>
        </div>
      )}

    </div>
  );
};
