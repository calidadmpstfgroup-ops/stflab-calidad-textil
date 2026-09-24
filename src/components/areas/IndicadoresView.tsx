import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Activity, 
  Lock
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const IndicadoresView: React.FC = () => {
  const { muestras } = useQuality();
  const [selectedYearLocal, setSelectedYearLocal] = useState('Todos');

  const totalEnsayos = muestras.length;
  const totalAprobados = muestras.filter(m => m.dictamenFinal === 'APROBADO').length;
  const totalRechazados = muestras.filter(m => m.dictamenFinal === 'RECHAZADO').length;
  const totalHallazgos = muestras.filter(m => m.dictamenFinal === 'HALLAZGO').length;

  const approvalRate = totalEnsayos > 0 ? Math.round((totalAprobados / totalEnsayos) * 100) : 0;

  // 1. Muestras por mes (Dinamico según muestras ingresadas)
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const muestrasPorMesMap: Record<string, number> = {};
  meses.forEach(m => muestrasPorMesMap[m] = 0);
  muestras.forEach(m => {
    if (m.fechaIngreso) {
      const date = new Date(m.fechaIngreso);
      if (!isNaN(date.getTime())) {
        const mesNombre = meses[date.getMonth()];
        muestrasPorMesMap[mesNombre] = (muestrasPorMesMap[mesNombre] || 0) + 1;
      }
    }
  });

  const muestrasPorMesData = meses.slice(0, 6).map(name => ({
    name,
    Muestras: muestrasPorMesMap[name] || 0
  }));

  // 2. Ranking de Proveedores con más rechazos / hallazgos
  const rechazosPorProveedor: Record<string, number> = {};
  muestras.forEach(m => {
    if (m.dictamenFinal === 'RECHAZADO' || m.dictamenFinal === 'HALLAZGO') {
      const p = m.proveedor || 'Otros';
      rechazosPorProveedor[p] = (rechazosPorProveedor[p] || 0) + 1;
    }
  });

  const provRechazosData = Object.entries(rechazosPorProveedor).map(([name, count]) => ({
    name: name.split(' ')[0],
    Rechazos: count
  })).sort((a, b) => b.Rechazos - a.Rechazos);

  // 3. Encogimientos promedio por proveedor
  const encogimientoMap: Record<string, { suma: number; count: number }> = {};
  muestras.forEach(m => {
    const p = m.proveedor || 'Sin Proveedor';
    const val = m.ensayos?.encogimientoLargo?.valor;
    if (typeof val === 'number') {
      if (!encogimientoMap[p]) encogimientoMap[p] = { suma: 0, count: 0 };
      encogimientoMap[p].suma += Math.abs(val);
      encogimientoMap[p].count += 1;
    }
  });

  const encogimientosData = Object.entries(encogimientoMap).map(([name, data]) => ({
    name: name.split(' ')[0],
    'Encogimiento Promedio %': Number((data.suma / data.count).toFixed(1))
  }));

  // 4. SLA Tiempo de respuesta por mes
  const leadTimePorMesMap: Record<string, { suma: number; count: number }> = {};
  meses.forEach(m => leadTimePorMesMap[m] = { suma: 0, count: 0 });
  muestras.forEach(m => {
    if (m.fechaIngreso && m.fechaFinalizacion) {
      const dIngreso = new Date(m.fechaIngreso);
      const dFin = new Date(m.fechaFinalizacion);
      if (!isNaN(dIngreso.getTime()) && !isNaN(dFin.getTime())) {
        const mesNombre = meses[dIngreso.getMonth()];
        const dias = Math.max(0, Math.round((dFin.getTime() - dIngreso.getTime()) / (1000 * 60 * 60 * 24)));
        leadTimePorMesMap[mesNombre].suma += dias;
        leadTimePorMesMap[mesNombre].count += 1;
      }
    }
  });

  const tiempoRespuestaData = meses.slice(0, 6).map(name => {
    const item = leadTimePorMesMap[name];
    const avg = item.count > 0 ? Number((item.suma / item.count).toFixed(1)) : 0;
    return {
      name,
      'Días de Respuesta': avg
    };
  });

  // 5. Lotes Bloqueados
  const lotesBloqueados = muestras.filter(m => m.dictamenFinal === 'RECHAZADO');

  // 6. Alertas por criterio de falla
  const causasMap: Record<string, number> = {};
  muestras.forEach(m => {
    (m.causasNoConformidad || []).forEach(causa => {
      causasMap[causa] = (causasMap[causa] || 0) + 1;
    });
  });

  const coloresAlertas = ['#8C6D1F', '#7A6428', '#9E2B25', '#1D5C8A', '#2D5A27'];
  const alertasData = Object.entries(causasMap).map(([name, cantidad], idx) => ({
    name,
    cantidad,
    fill: coloresAlertas[idx % coloresAlertas.length]
  }));

  const promedioSLA = muestras.length > 0 && muestras.some(m => m.fechaFinalizacion)
    ? (muestras.reduce((acc, m) => {
        if (!m.fechaIngreso || !m.fechaFinalizacion) return acc;
        const d1 = new Date(m.fechaIngreso).getTime();
        const d2 = new Date(m.fechaFinalizacion).getTime();
        return acc + Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
      }, 0) / muestras.filter(m => m.fechaFinalizacion).length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6 font-sans select-none animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#EFECE6] p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#2D2D30] flex items-center">
              <BarChart3 className="h-6 w-6 text-[#2D2D30] mr-2.5" />
              Indicadores Estadísticos de Calidad Textil (SaaS)
            </h2>
            <span className="text-[10px] bg-[#EEF4ED] text-[#2D5A27] font-mono font-bold px-2.5 py-0.5 rounded-full">
              5 GRÁFICOS ANALÍTICOS
            </span>
          </div>
          <p className="text-[#6B6256] text-xs mt-1 font-medium">
            Control estadístico de conformidad, tiempos de respuesta SLA y ranking de proveedores de STF Group.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#F9F8F5] px-3.5 py-2 rounded-full border border-[#EFECE6] text-xs font-bold text-[#2D2D30]">
          <Calendar className="h-4 w-4 text-[#6B6256]" />
          <span>Año:</span>
          <select
            value={selectedYearLocal}
            onChange={(e) => setSelectedYearLocal(e.target.value)}
            className="bg-transparent border-none text-[#2D2D30] font-bold outline-none cursor-pointer"
          >
            <option value="Todos">Todos los Años</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Numerical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6256]">Total Ensayos</span>
            <Activity className="h-4 w-4 text-[#2D2D30]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-[#2D2D30] block leading-none font-sans">{totalEnsayos}</span>
            <span className="text-xs text-[#2D5A27] font-bold mt-2 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> 100% trazabilidad
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#EFECE6] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6256]">Lotes Conformes</span>
            <CheckCircle className="h-4 w-4 text-[#2D5A27]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-[#2D5A27] block leading-none font-sans">{totalAprobados}</span>
            <span className="text-xs text-[#6B6256] mt-2 block font-medium">Tasa de aprobación: <strong>{approvalRate}%</strong></span>
          </div>
        </div>

        <div className="bg-white border border-[#EFECE6] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6256]">Lotes Bloqueados</span>
            <Lock className="h-4 w-4 text-[#9E2B25]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-[#9E2B25] block leading-none font-sans">{lotesBloqueados.length}</span>
            <span className="text-xs text-[#6B6256] mt-2 block font-medium">Pausados en bodega</span>
          </div>
        </div>

        <div className="bg-white border border-[#EFECE6] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6256]">SLA Respuesta</span>
            <Clock className="h-4 w-4 text-[#1D5C8A]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-[#1D5C8A] block leading-none font-sans">{promedioSLA} d</span>
            <span className="text-xs text-[#6B6256] mt-2 block font-medium">Meta &lt; 2 días hábiles</span>
          </div>
        </div>
      </div>

      {/* Grid de los 6 Gráficos Analíticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        
        {/* GRÁFICO 1: Muestras por mes */}
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 shadow-xs space-y-4 text-[#2D2D30]">
          <div className="border-b border-[#EFECE6] pb-3">
            <h3 className="text-base font-bold text-[#2D2D30]">1. Muestras e Ingresos por Mes</h3>
            <p className="text-xs text-[#6B6256] font-medium">Volumen total de materias primas recibidas.</p>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={muestrasPorMesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFECE6" />
                <XAxis dataKey="name" stroke="#6B6256" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6B6256" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#252528', borderRadius: '12px', color: '#FFF', fontSize: '12px' }} />
                <Bar dataKey="Muestras" fill="#2D2D30" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 2: Ranking de Proveedores con Rechazos */}
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 shadow-xs space-y-4 text-[#2D2D30]">
          <div className="border-b border-[#EFECE6] pb-3">
            <h3 className="text-base font-bold text-[#2D2D30]">2. Ranking de Proveedores con Incidencias</h3>
            <p className="text-xs text-[#6B6256] font-medium">Fabricantes con mayor número de hallazgos/rechazos.</p>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provRechazosData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFECE6" />
                <XAxis dataKey="name" stroke="#6B6256" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6B6256" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#252528', borderRadius: '12px', color: '#FFF', fontSize: '12px' }} />
                <Bar dataKey="Rechazos" fill="#9E2B25" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 3: Encogimiento Promedio por Proveedor */}
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 shadow-xs space-y-4 text-[#2D2D30]">
          <div className="border-b border-[#EFECE6] pb-3">
            <h3 className="text-base font-bold text-[#2D2D30]">3. Encogimiento Promedio (%) por Fabricante</h3>
            <p className="text-xs text-[#6B6256] font-medium">Promedio de encogimiento a lo largo (Norma AATCC 135).</p>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={encogimientosData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFECE6" />
                <XAxis dataKey="name" stroke="#6B6256" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6B6256" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#252528', borderRadius: '12px', color: '#FFF', fontSize: '12px' }} />
                <Bar dataKey="Encogimiento Promedio %" fill="#8C6D1F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 4: SLA Tiempo de Respuesta Operativo */}
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 shadow-xs space-y-4 text-[#2D2D30]">
          <div className="border-b border-[#EFECE6] pb-3">
            <h3 className="text-base font-bold text-[#2D2D30]">4. Tiempo de Respuesta Operativa SLA (Días)</h3>
            <p className="text-xs text-[#6B6256] font-medium">Evolución del tiempo de dictamen final de laboratorio.</p>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tiempoRespuestaData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFECE6" />
                <XAxis dataKey="name" stroke="#6B6256" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6B6256" tick={{ fontSize: 11 }} domain={[0, 3]} />
                <Tooltip contentStyle={{ backgroundColor: '#252528', borderRadius: '12px', color: '#FFF', fontSize: '12px' }} />
                <Line type="monotone" dataKey="Días de Respuesta" stroke="#1D5C8A" strokeWidth={3} dot={{ r: 4, fill: '#1D5C8A' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 5: Distribución de Alertas por Criterio */}
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 shadow-xs space-y-4 text-[#2D2D30]">
          <div className="border-b border-[#EFECE6] pb-3">
            <h3 className="text-base font-bold text-[#2D2D30]">5. Distribución de Alertas por Criterio de Falla</h3>
            <p className="text-xs text-[#6B6256] font-medium">Principales parámetros fuera de especificación STF.</p>
          </div>

          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={alertasData} dataKey="cantidad" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {alertasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#252528', borderRadius: '12px', color: '#FFF', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
