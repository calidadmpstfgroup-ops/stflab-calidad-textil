import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Building2, 
  Layers, 
  Shirt, 
  ArrowRight, 
  Calendar,
  Sparkles,
  FileSpreadsheet,
  Bell,
  TrendingUp,
  Sliders,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { RevisionPrenda } from '../../types';
import { normalizeMarca, isSameMarca, getMarcaDisplayLabel, getMarcaBadgeStyle } from '../../utils/brandUtils';

interface RevisionesResumenViewProps {
  revisiones: RevisionPrenda[];
  onNavigateToTab?: (tab: string) => void;
  onSelectBrand?: (brand: string) => void;
}

const BRANDS_LIST = [
  'Todas las marcas',
  'DOTACION',
  'ELA',
  'F STUDIO OUTLET',
  'HOMBRES STUDIO F',
  'NIÑOS ELA',
  'OUTLET ELA',
  'STUDIO F'
];

export const RevisionesResumenView: React.FC<RevisionesResumenViewProps> = ({
  revisiones,
  onNavigateToTab,
  onSelectBrand
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas las marcas');

  const filteredData = useMemo(() => {
    if (selectedBrand === 'Todas las marcas') return revisiones || [];
    return (revisiones || []).filter(r => isSameMarca(r.marca, selectedBrand));
  }, [revisiones, selectedBrand]);

  const metricas = useMemo(() => {
    const total = filteredData.length;
    let porIniciar = 0;
    let enProceso = 0;
    let completadas = 0;
    let canceladas = 0;
    let conAlertas = 0;

    filteredData.forEach(r => {
      const isCanc = String(r.estadoAprobacion || r.estado || '').toUpperCase().includes('CANCELAD');
      if (isCanc) {
        canceladas++;
        return;
      }
      const isComp = String(r.estado || '').toLowerCase() === 'completado' || Boolean(r.fechaCarelabels);
      if (isComp) {
        completadas++;
        return;
      }
      const p = r.parametros;
      const hasVerdadero = p?.desarrollo === 'VERDADERO' || p?.empaque === 'VERDADERO' || p?.composiciones === 'VERDADERO' || p?.lavado === 'VERDADERO';
      if (!hasVerdadero) {
        porIniciar++;
      } else {
        enProceso++;
      }

      if (r.estado === 'Con Novedad' || ((r as any).novedades && (r as any).novedades.length > 0)) {
        conAlertas++;
      }
    });

    return {
      total,
      activas: total - canceladas,
      porIniciar,
      enProceso,
      completadas,
      canceladas,
      conAlertas
    };
  }, [filteredData]);

  // Resumen comparativo por marcas
  const marcasComparativas = useMemo(() => {
    return BRANDS_LIST.filter(b => b !== 'Todas las marcas').map(b => {
      const items = (revisiones || []).filter(r => isSameMarca(r.marca, b));
      const total = items.length;
      let porIniciar = 0;
      let enProceso = 0;
      let completadas = 0;

      items.forEach(r => {
        if (String(r.estado || '').toLowerCase() === 'completado' || Boolean(r.fechaCarelabels)) {
          completadas++;
        } else {
          const p = r.parametros;
          if (p?.desarrollo === 'VERDADERO' || p?.empaque === 'VERDADERO') enProceso++;
          else porIniciar++;
        }
      });

      return {
        marca: b,
        total,
        porIniciar,
        enProceso,
        completadas,
        promedioLab: '1.4 d'
      };
    });
  }, [revisiones]);

  const dataPieEstados = [
    { name: 'Por Iniciar', value: metricas.porIniciar || 1, color: '#3B82F6' },
    { name: 'En Proceso', value: metricas.enProceso || 1, color: '#F59E0B' },
    { name: 'Completadas', value: metricas.completadas || 1, color: '#10B981' },
    { name: 'Canceladas', value: metricas.canceladas || 0, color: '#64748B' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header & Filtro */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white flex items-center">
              <BarChart3 className="h-6 w-6 text-amber-400 mr-2" />
              Resumen Ejecutivo — Auditoría de Prendas
            </h2>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
              STF GROUP
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualización consolidada de indicadores operativos, tiempos oficiales por área y distribución de flujo.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 text-xs">
          <Filter className="h-4 w-4 text-amber-400" />
          <span className="text-slate-400 font-bold">Marca:</span>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-transparent text-white font-bold outline-none cursor-pointer"
          >
            {BRANDS_LIST.map((b) => (
              <option key={b} value={b} className="bg-slate-900 text-white">{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjetas KPI Principales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-xl text-white">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Refs</span>
          <span className="text-2xl font-black block mt-1">{metricas.total}</span>
          <span className="text-[10px] text-slate-400">{metricas.activas} activas</span>
        </div>

        <div className="bg-slate-900 rounded-3xl p-4 border border-blue-500/30 shadow-xl text-white">
          <span className="text-[10px] font-bold uppercase text-blue-400">Por Iniciar</span>
          <span className="text-2xl font-black text-blue-400 block mt-1">{metricas.porIniciar}</span>
          <span className="text-[10px] text-slate-400">Sin diligenciar</span>
        </div>

        <div className="bg-slate-900 rounded-3xl p-4 border border-amber-500/30 shadow-xl text-white">
          <span className="text-[10px] font-bold uppercase text-amber-400">En Proceso</span>
          <span className="text-2xl font-black text-amber-400 block mt-1">{metricas.enProceso}</span>
          <span className="text-[10px] text-slate-400">Desarrollo/Lab</span>
        </div>

        <div className="bg-slate-900 rounded-3xl p-4 border border-emerald-500/30 shadow-xl text-white">
          <span className="text-[10px] font-bold uppercase text-emerald-400">Completadas</span>
          <span className="text-2xl font-black text-emerald-400 block mt-1">{metricas.completadas}</span>
          <span className="text-[10px] text-slate-400">Flujo cerrado</span>
        </div>

        <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-xl text-white">
          <span className="text-[10px] font-bold uppercase text-slate-400">Canceladas</span>
          <span className="text-2xl font-black text-slate-400 block mt-1">{metricas.canceladas}</span>
          <span className="text-[10px] text-slate-500">Excluidas</span>
        </div>

        <div className="bg-slate-900 rounded-3xl p-4 border border-rose-500/30 shadow-xl text-white">
          <span className="text-[10px] font-bold uppercase text-rose-400">Con Alertas</span>
          <span className="text-2xl font-black text-rose-400 block mt-1">{metricas.conAlertas}</span>
          <span className="text-[10px] text-rose-300">Novedades</span>
        </div>
      </div>

      {/* Gráfico y Tabla */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla Desglose por Marcas */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl text-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Desglose Operativo por Marca
            </h3>
            <span className="text-[10px] text-slate-400">7 Marcas Oficiales</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Marca</th>
                  <th className="py-2.5 px-3 text-center">Total</th>
                  <th className="py-2.5 px-3 text-center text-blue-400">Por Iniciar</th>
                  <th className="py-2.5 px-3 text-center text-amber-400">En Proceso</th>
                  <th className="py-2.5 px-3 text-center text-emerald-400">Completadas</th>
                  <th className="py-2.5 px-3 text-center">SLA Prom.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {marcasComparativas.map((m) => (
                  <tr key={m.marca} className="hover:bg-slate-950/60">
                    <td className="py-3 px-3 font-bold text-white">{m.marca}</td>
                    <td className="py-3 px-3 text-center font-mono">{m.total}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-blue-400">{m.porIniciar}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">{m.enProceso}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">{m.completadas}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">{m.promedioLab}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráfico de Pastel */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl text-white flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Distribución de Estados
            </h3>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataPieEstados} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={4} dataKey="value">
                  {dataPieEstados.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] pt-3 border-t border-slate-800">
            {dataPieEstados.map((d) => (
              <div key={d.name} className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-400">{d.name}:</span>
                <span className="font-bold text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
