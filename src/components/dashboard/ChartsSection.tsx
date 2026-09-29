import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Clock,
  FileText,
  FlaskConical,
  Sparkles,
  ArrowRight,
  Download,
  Mail,
  Calendar,
  Send,
  ChevronRight,
  TrendingDown,
  CheckCircle2,
  ShoppingCart,
  ShieldCheck,
  Folder
} from 'lucide-react';

export const ChartsSection: React.FC = () => {
  const { 
    muestras, 
    solicitudesTelas, 
    fichasTecnicasHistorial, 
    kpis, 
    pendientesLabTotal, 
    navegarA, 
    setAreaActual, 
    setFiltros 
  } = useQuality();
  const { t } = useLanguage();
  const { usuario } = useAuth();
  const [iaPromptInput, setIaPromptInput] = useState('');
  const [sugActiva, setSugActiva] = useState<string | null>(null);

  // 1. Datos para "Ensayos por mes" (Calculados dinámicamente con base en muestras reales)
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];
  const dataEnsayosPorMes = React.useMemo(() => {
    const counts: Record<string, number> = {};
    meses.forEach(m => { counts[m] = 0; });
    (muestras || []).forEach(m => {
      const f = m.fechaIngreso || (m as any).createdAt;
      if (f) {
        const d = new Date(f);
        if (!isNaN(d.getTime())) {
          const mIdx = d.getMonth();
          if (mIdx < meses.length) {
            counts[meses[mIdx]] = (counts[meses[mIdx]] || 0) + 1;
          }
        }
      }
    });
    return meses.map(mes => ({ mes, cantidad: counts[mes] || 0 }));
  }, [muestras]);

  // 2. Datos para "Resultados por proveedor" (Gráfico de Dona con total real al centro)
  const totalMuestras = muestras ? muestras.length : 0;
  const dataProveedores = React.useMemo(() => {
    if (!muestras || muestras.length === 0) {
      return [];
    }
    const provCount: Record<string, number> = {};
    muestras.forEach(m => {
      const p = m.proveedor?.trim() || 'Sin proveedor';
      provCount[p] = (provCount[p] || 0) + 1;
    });
    const palette = ['#00b4d8', '#0284c7', '#a855f7', '#f59e0b', '#10b981', '#ec4899', '#64748b'];
    return Object.entries(provCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => {
        const pct = totalMuestras > 0 ? Math.round((count / totalMuestras) * 100) : 0;
        return {
          name,
          value: pct,
          count,
          color: palette[idx % palette.length]
        };
      });
  }, [muestras, totalMuestras]);

  // 3. Actividad reciente real
  const actividadesRecientes = React.useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      sub: string;
      time: string;
      icon: React.ReactNode;
      iconBg: string;
    }> = [];

    (muestras || []).slice(0, 5).forEach((m, idx) => {
      list.push({
        id: `act-m-${m.id || idx}`,
        title: m.dictamenFinal && m.dictamenFinal !== 'PENDIENTE' ? `Ensayo ${m.dictamenFinal.toLowerCase()}` : 'Muestra registrada',
        sub: `${m.codigoMT || m.codigoReferencia || 'Muestra'} - ${m.proveedor || m.referencia || 'Textil'}`,
        time: m.fechaIngreso || 'Reciente',
        icon: m.dictamenFinal === 'APROBADO' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <FlaskConical className="w-4 h-4 text-purple-500" />
        ),
        iconBg: m.dictamenFinal === 'APROBADO' ? 'bg-emerald-100 dark:bg-emerald-950/60' : 'bg-purple-100 dark:bg-purple-950/60'
      });
    });

    (solicitudesTelas || []).slice(0, 3).forEach((s, idx) => {
      list.push({
        id: `act-s-${s.id || idx}`,
        title: 'Solicitud de compras',
        sub: `${s.numeroSolicitud || 'Solicitud'} - ${s.proveedor || 'Proveedor'}`,
        time: s.fechaSolicitud || 'Reciente',
        icon: <ShoppingCart className="w-4 h-4 text-sky-500" />,
        iconBg: 'bg-sky-100 dark:bg-sky-950/60'
      });
    });

    return list.slice(0, 5);
  }, [muestras, solicitudesTelas]);

  // 4. Documentos recientes reales
  const documentosRecientes = React.useMemo(() => {
    if (!fichasTecnicasHistorial || fichasTecnicasHistorial.length === 0) {
      return [];
    }
    return fichasTecnicasHistorial.slice(0, 5).map((ft, idx) => ({
      nombre: ft.referencia ? `Ficha técnica - ${ft.referencia}` : (ft.codigoFT ? `Ficha técnica - ${ft.codigoFT}` : (ft.documentoOriginal?.nombreArchivo || `Ficha técnica #${idx + 1}`)),
      tipo: 'Ficha técnica',
      fecha: ft.updatedAt || ft.createdAt || 'Disponible',
      estado: 'Disponible'
    }));
  }, [fichasTecnicasHistorial]);

  const handleEnviarConsultaIA = (texto: string) => {
    if (texto && texto.trim()) {
      setSugActiva(texto);
      setTimeout(() => setSugActiva(null), 1200);
      window.dispatchEvent(new CustomEvent('stf_abrir_ia', { detail: { prompt: texto.trim() } }));
      setIaPromptInput('');
    } else {
      window.dispatchEvent(new CustomEvent('stf_abrir_ia', { detail: {} }));
    }
  };

  return (
    <div className="space-y-5 font-sans select-none animate-fade-in">
      
      {/* GRID PRINCIPAL: 4 Columnas / Bloques Visuales Clave */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

        {/* ── COLUMNA 1: ACTIVIDAD RECIENTE (Span 3) ── */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0f1b35] border border-slate-200/90 dark:border-[#1e3461] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#17254e]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Actividad reciente
              </h3>
              <button 
                type="button"
                onClick={() => setAreaActual('dashboard')}
                className="text-xs font-semibold text-[#00b4d8] hover:text-[#0096c7] cursor-pointer"
              >
                Ver todas
              </button>
            </div>

            {actividadesRecientes.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-[#132247] flex items-center justify-center text-slate-400 mb-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sin actividad reciente
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] leading-tight">
                  No hay muestras ni solicitudes registradas (0)
                </p>
              </div>
            ) : (
              <div className="mt-3.5 space-y-3.5">
                {actividadesRecientes.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 group">
                    <div className={`w-8 h-8 rounded-xl ${act.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                      {act.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-[#00b4d8] transition-colors">
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {act.sub}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap font-medium">
                      {act.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── COLUMNA 2: ENSAYOS POR MES + 3 SUB-TARJETAS KPI (Span 4) ── */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Card: Ensayos por mes */}
          <div className="bg-white dark:bg-[#0f1b35] border border-slate-200/90 dark:border-[#1e3461] rounded-2xl p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ensayos por mes
              </h3>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#132247] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#1e3461]">
                {totalMuestras > 0 ? `${totalMuestras} registrados` : '0 registrados'}
              </span>
            </div>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataEnsayosPorMes} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis 
                    dataKey="mes" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0, 180, 216, 0.08)' }}
                    contentStyle={{ 
                      backgroundColor: '#0f1b35', 
                      borderColor: '#1e3461',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      fontSize: '11px'
                    }}
                  />
                  <Bar 
                    dataKey="cantidad" 
                    fill="#00c0f0" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fila de 3 Sub-Tarjetas KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* 1. Tiempo promedio de respuesta */}
            <div className="bg-white dark:bg-[#0f1b35] border border-slate-200/90 dark:border-[#1e3461] rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span className="truncate">Tiempo promedio</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {kpis?.leadTimePromedioDias ? kpis.leadTimePromedioDias.toFixed(1).replace('.', ',') : '0'}
                </span>
                <span className="text-xs text-slate-500">días</span>
                {kpis?.leadTimePromedioDias && kpis.leadTimePromedioDias > 0 ? (
                  <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full">
                    <TrendingDown className="w-3 h-3" />
                    Normal
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {totalMuestras > 0 ? 'Lead time registrado' : 'Sin ensayos concluidos'}
              </span>
            </div>

            {/* 2. Documentos */}
            <div 
              onClick={() => setAreaActual('documentos')}
              className="bg-white dark:bg-[#0f1b35] border border-slate-200/90 dark:border-[#1e3461] hover:border-[#00b4d8] rounded-2xl p-3.5 shadow-xs flex flex-col justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Documentos</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {fichasTecnicasHistorial?.length || 0}
                  </span>
                  <p className="text-[10px] text-slate-500">Disponibles</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00b4d8] transition-colors" />
              </div>
            </div>

            {/* 3. Muestras en laboratorio */}
            <div 
              onClick={() => navegarA('laboratorio', 'telas')}
              className="bg-white dark:bg-[#0f1b35] border border-slate-200/90 dark:border-[#1e3461] hover:border-[#00b4d8] rounded-2xl p-3.5 shadow-xs flex flex-col justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                <FlaskConical className="w-3.5 h-3.5 text-purple-500" />
                <span className="truncate">En laboratorio</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {pendientesLabTotal || 0}
                  </span>
                  <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">En proceso</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00b4d8] transition-colors" />
              </div>
            </div>

          </div>
        </div>

        {/* ── COLUMNA 3: RESULTADOS POR PROVEEDOR (DONUT) (Span 3) ── */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0f1b35] border border-slate-200/90 dark:border-[#1e3461] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-100 dark:border-[#17254e]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Resultados por proveedor
            </h3>
          </div>

          {/* Gráfico de Dona con Total real en el centro */}
          <div className="relative h-44 w-full flex items-center justify-center my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataProveedores.length > 0 ? dataProveedores : [{ name: 'Sin datos', value: 1, color: '#334155' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={dataProveedores.length > 0 ? 3 : 0}
                  dataKey="value"
                >
                  {(dataProveedores.length > 0 ? dataProveedores : [{ name: 'Sin datos', color: '#64748b' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {dataProveedores.length > 0 && (
                  <Tooltip 
                    formatter={(val: any) => [`${val}%`, 'Participación']}
                    contentStyle={{ 
                      backgroundColor: '#0f1b35', 
                      borderColor: '#1e3461',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      fontSize: '11px'
                    }}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
            
            {/* Texto Central con Total Real */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
              <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                {totalMuestras}
              </span>
            </div>
          </div>

          {/* Leyenda con porcentajes */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#17254e]">
            {dataProveedores.length === 0 ? (
              <p className="text-xs text-center text-slate-400 dark:text-slate-500 py-3">
                Sin proveedores registrados (0)
              </p>
            ) : (
              dataProveedores.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white ml-2">{item.value}%</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── COLUMNA 4: PANEL DERECHO (ASISTENTE IA + PERFIL) (Span 2) ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Card: Asistente STFLAB IA */}
          <div className="bg-white dark:bg-[#0f1b35] border border-slate-200/90 dark:border-[#1e3461] rounded-2xl p-4 shadow-xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#17254e]">
                <div 
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => handleEnviarConsultaIA('')}
                  title="Haz clic para abrir el Asistente IA STFLab"
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center text-[#00b4d8] group-hover:scale-110 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900 transition-all shadow-xs">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#00b4d8] transition-colors flex items-center gap-1.5">
                      Asistente STFLAB IA
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      ¿En qué puedo ayudarte?
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleEnviarConsultaIA('')}
                  className="text-[10px] font-semibold text-[#00b4d8] hover:text-[#0096c7] px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/80 dark:border-cyan-800/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition-colors cursor-pointer"
                  title="Abrir ventana de chat completa"
                >
                  Abrir ↗
                </button>
              </div>

              {/* Botones de sugerencias rápidas con clic interactivo */}
              <div className="mt-2.5 space-y-1.5">
                {[
                  '¿Dónde registro una nueva muestra?',
                  '¿Dónde registro un ensayo de calidad?',
                  '¿Cómo consultar fichas técnicas?',
                  '¿Qué solicitudes de Compras están pendientes?'
                ].map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleEnviarConsultaIA(sug)}
                    className={`w-full text-left text-[11px] p-2 rounded-xl border transition-all truncate block cursor-pointer ${
                      sugActiva === sug
                        ? 'bg-cyan-100/70 dark:bg-[#00b4d8]/20 border-[#00b4d8] text-[#00b4d8] font-bold scale-[0.98] shadow-xs'
                        : 'bg-slate-50 dark:bg-[#132247] hover:bg-cyan-50/70 dark:hover:bg-[#182c57] hover:border-[#00b4d8]/50 border-slate-200/80 dark:border-[#1e3461] text-slate-700 dark:text-slate-200'
                    }`}
                    title={`Preguntar: ${sug}`}
                  >
                    {sugActiva === sug ? `✨ Abriendo: ${sug}` : sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Input interactivo del Asistente */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleEnviarConsultaIA(iaPromptInput);
              }}
              className="mt-3 relative"
            >
              <input 
                type="text"
                value={iaPromptInput}
                onChange={(e) => setIaPromptInput(e.target.value)}
                placeholder="Escribe tu pregunta o búsqueda..."
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 w-6 h-6 rounded-lg bg-[#00b4d8] hover:bg-[#0096c7] text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Enviar consulta a Asistente IA"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Card: Mi Perfil */}
          <div className="bg-white dark:bg-[#0f1b35] border border-slate-200/90 dark:border-[#1e3461] rounded-2xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2.5">
              Mi perfil
            </h4>
            
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 via-[#00b4d8] to-teal-400 flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
                AM
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {usuario?.displayName || 'Ana María González'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {usuario?.role || 'Administradora'}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#17254e] space-y-1.5 text-[10px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  Correo
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {usuario?.email || 'ana@stflab.com'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Último acceso
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Hoy, 10:12 a. m.
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── SECCIÓN INFERIOR: DOCUMENTOS RECIENTES (TABLA) ── */}
      <div className="bg-white dark:bg-[#0f1b35] border border-slate-200/90 dark:border-[#1e3461] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#17254e]">
          <div className="flex items-center gap-2">
            <Folder className="w-4.5 h-4.5 text-[#00b4d8]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Documentos recientes
            </h3>
          </div>
          <button 
            type="button"
            onClick={() => setAreaActual('documentos')}
            className="text-xs font-semibold text-[#00b4d8] hover:text-[#0096c7] cursor-pointer"
          >
            Ver todos
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 text-[11px] font-semibold border-b border-slate-100 dark:border-[#17254e]">
                <th className="py-2.5 px-3">Nombre</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#17254e]">
              {documentosRecientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
                    No hay documentos registrados actualmente (0)
                  </td>
                </tr>
              ) : (
                documentosRecientes.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#132247] transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>{doc.nombre}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-medium">
                      {doc.tipo}
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {doc.fecha}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {doc.estado}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button 
                        type="button" 
                        title="Descargar documento"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#00b4d8] hover:bg-slate-100 dark:hover:bg-[#1e3461] transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
