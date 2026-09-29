import React from 'react';
import { useQuality } from '../../context/QualityContext';
import { FlaskConical, PackageCheck, Layers, CheckCircle2, ShieldCheck, Shirt, Trash2, Calculator } from 'lucide-react';

interface LaboratorioHeaderProps {
  tabActiva: 'telas' | 'accesorios' | 'forros-costuras' | 'historial';
  onCambiarTab: (tab: 'telas' | 'accesorios' | 'forros-costuras' | 'historial') => void;
  stats: {
    totalSolicitudes: number;
    pendientes: number;
    enProceso: number;
    completadas: number;
    hallazgos: number;
    rechazadas: number;
  };
  dictamenActual?: string;
  onAbrirCalculadora?: () => void;
}

export const LaboratorioHeader: React.FC<LaboratorioHeaderProps> = ({
  tabActiva,
  onCambiarTab,
  stats,
  dictamenActual = 'APROBADO',
  onAbrirCalculadora
}) => {
  const { analistaActivo, pendientesLabTelas, pendientesLabInsumos, papelera, setModalPapeleraAbierto } = useQuality();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 font-sans">
      
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shrink-0 shadow-xs">
            <FlaskConical className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight font-display">
                STFGROUP LAB
              </h1>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full border border-blue-200 uppercase">
                V01-2026
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              GESTIÓN DE CALIDAD TEXTIL & ENSAYOS
            </p>
          </div>
        </div>

        {/* Dynamic Badge: ¿Cumple Calidad? */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-slate-600">¿Cumple Calidad?:</span>
            <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-lg border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>SÍ ({dictamenActual || 'APROBADA'})</span>
            </div>
          </div>

          {/* Active Analyst Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs">
              <span>Analista: {analistaActivo?.nombreCompleto || 'Ana González'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Sub-Tabs Bar */}
      <div className="flex items-center justify-between gap-3 pt-1 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCambiarTab('telas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tabActiva === 'telas'
                ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Telas</span>
            {pendientesLabTelas > 0 && (
              <span className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  tabActiva === 'telas' ? 'bg-blue-800 text-white' : 'bg-rose-100 text-rose-700 border border-rose-200'
                }`}>
                  {pendientesLabTelas}
                </span>
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onCambiarTab('accesorios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tabActiva === 'accesorios'
                ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Insumos</span>
            {pendientesLabInsumos > 0 && (
              <span className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  tabActiva === 'accesorios' ? 'bg-blue-800 text-white' : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {pendientesLabInsumos}
                </span>
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onCambiarTab('forros-costuras')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tabActiva === 'forros-costuras'
                ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'
            }`}
          >
            <Shirt className="w-4 h-4 text-amber-500" />
            <span>Forros & Costura (PNP)</span>
          </button>

          <button
            type="button"
            onClick={() => onCambiarTab('historial')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tabActiva === 'historial'
                ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Historial</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Botón Calculadora Técnica de Laboratorio */}
          <button
            type="button"
            onClick={onAbrirCalculadora}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300/80 dark:border-cyan-700/60 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
            title="Abrir Calculadora Técnica de Laboratorio (Gramaje, Rendimiento, Encogimientos, Revirado, Títulos, Densidad, Elongación y CAD)"
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Calculadora Lab</span>
            <span className="text-[9px] bg-cyan-600 text-white font-mono px-1.5 py-0.5 rounded-full uppercase">PRO</span>
          </button>

          {/* Botón Papelera de Reciclaje */}
          <button
            type="button"
            onClick={() => setModalPapeleraAbierto(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
            title="Ver solicitudes eliminadas"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Papelera ({papelera.length})</span>
          </button>
        </div>
      </div>

    </div>
  );
};
