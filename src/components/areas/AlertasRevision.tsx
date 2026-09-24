import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Filter,
  Search,
  Download,
  Copy,
  Layers,
  Building2,
  ArrowRight,
  ShieldAlert,
  Flame,
  LayoutGrid,
  List,
  ChevronRight,
  Send,
  ExternalLink,
  Check
} from 'lucide-react';
import {
  AlertaRevision,
  PrendaRevision,
  RevisionPrenda
} from '../../types';

export interface AlertasRevisionProps {
  prendas?: (PrendaRevision | RevisionPrenda)[];
  alertas?: AlertaRevision[];
  onSelectReferencia?: (referencia: string) => void;
  onDiligenciarPrenda?: (referencia: string) => void;
  onEnviarReporteArea?: (area: 'Colecciones' | 'Laboratorio' | 'Calidad', alertas: AlertaRevision[]) => void;
  triggerToast?: (msg: string) => void;
  title?: string;
  subtitle?: string;
}

// Generador automático de alertas de consistencia de flujo
function generarAlertasInternas(prendas: PrendaRevision[]): AlertaRevision[] {
  const alertas: AlertaRevision[] = [];

  prendas.forEach((p, idx) => {
    const ref = p.referenciaPrenda || `PRENDA-${idx + 1}`;
    const marca = p.marca || 'STUDIO F';

    // 1. Inconsistencia: Carelabels entregadas pero sin revisión de Laboratorio
    if (p.fechaCarelabels && !p.fechaRevCompo) {
      alertas.push({
        id: `alt-inc-1-${ref}-${idx}`,
        referencia: ref,
        marca,
        tipo: 'inconsistencia',
        parametro: 'B. Revisión de Composiciones',
        area: 'Laboratorio',
        mensaje: 'Se emitieron Carelabels sin contar con la aprobación técnica de composición en Laboratorio.',
        accion: 'Solicitar revisión prioritaria de composición a Laboratorio antes de rotulado.',
        prioridad: 'alta'
      });
    }

    // 2. Información sin parámetro
    if (p.fechaInfoEmp && p.parametros?.empaque === false) {
      alertas.push({
        id: `alt-info-2-${ref}-${idx}`,
        referencia: ref,
        marca,
        tipo: 'informacion',
        parametro: 'F. Información de Empaque',
        area: 'Colecciones',
        mensaje: 'Existe fecha de empaque registrada pero el parámetro figura como no cumplido (FALSO).',
        accion: 'Verificar y marcar parámetro de empaque como VERDADERO en el documento maestro.',
        prioridad: 'media'
      });
    }

    // 3. Parámetro pendiente: Desarrollo aprobado pero falta composición
    if ((p.parametros?.desarrollo === true || p.parametros?.desarrollo === 'VERDADERO') && !p.fechaRevCompo) {
      alertas.push({
        id: `alt-param-3-${ref}-${idx}`,
        referencia: ref,
        marca,
        tipo: 'parametro',
        parametro: 'B. Revisión de Composiciones',
        area: 'Laboratorio',
        mensaje: 'Ficha en etapa de desarrollo aprobada. Pendiente dictamen de composición de Laboratorio.',
        accion: 'Enviar muestra física de la prenda a Laboratorio para análisis cualitativo.',
        prioridad: 'media'
      });
    }
  });

  return alertas;
}

export const AlertasRevision: React.FC<AlertasRevisionProps> = ({
  prendas = [],
  alertas: alertasExternas,
  onSelectReferencia,
  onDiligenciarPrenda,
  onEnviarReporteArea,
  triggerToast = (msg: string) => alert(msg),
  title = 'Sistema de Alertas y Auditoría de Parámetros',
  subtitle = 'Monitoreo preventivo de secuencia de flujo, integridad documental y parámetros pendientes'
}) => {
  const [selectedArea, setSelectedArea] = useState<string>('Todas');
  const [selectedTipo, setSelectedTipo] = useState<string>('Todas');
  const [selectedPrioridad, setSelectedPrioridad] = useState<string>('Todas');
  const [selectedMarca, setSelectedMarca] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const prendasNormalizadas = useMemo<PrendaRevision[]>(() => {
    return (prendas || []).map((p) => {
      const asPrenda = p as PrendaRevision;
      const asRev = p as RevisionPrenda;

      return {
        id: asPrenda.id || asRev.id || '',
        referenciaPrenda: asPrenda.referenciaPrenda || asRev.referenciaPrenda || asRev.referencia || 'Sin Referencia',
        marca: asPrenda.marca || asRev.marca || 'STUDIO F',
        estadoAprobacion: asPrenda.estadoAprobacion || asRev.estadoAprobacion || asRev.estado || '',
        parametros: asPrenda.parametros || {
          desarrollo: asRev.parametros?.desarrollo,
          empaque: asRev.parametros?.empaque,
          composiciones: asRev.parametros?.composiciones,
          lavado: asRev.parametros?.lavado
        },
        fechaInfoEmp: asPrenda.fechaInfoEmp || asRev.fechaInfoEmp || null,
        fechaRevCompo: asPrenda.fechaRevCompo || asRev.fechaRevCompo || null,
        fechaCarelabels: asPrenda.fechaCarelabels || asRev.fechaCarelabels || null
      };
    });
  }, [prendas]);

  const rawAlertas = useMemo<AlertaRevision[]>(() => {
    if (alertasExternas && alertasExternas.length > 0) {
      return alertasExternas;
    }
    return generarAlertasInternas(prendasNormalizadas);
  }, [alertasExternas, prendasNormalizadas]);

  const uniqueBrands = useMemo(() => {
    const set = new Set<string>();
    rawAlertas.forEach((a) => {
      if (a.marca && a.marca !== 'Sin marca') {
        set.add(a.marca.trim().toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [rawAlertas]);

  const countsByArea = useMemo(() => {
    return {
      Colecciones: rawAlertas.filter((a) => a.area === 'Colecciones').length,
      Laboratorio: rawAlertas.filter((a) => a.area === 'Laboratorio').length,
      Calidad: rawAlertas.filter((a) => a.area === 'Calidad').length
    };
  }, [rawAlertas]);

  const metrics = useMemo(() => {
    return {
      total: rawAlertas.length,
      inconsistencias: rawAlertas.filter((a) => a.tipo === 'inconsistencia').length,
      informacion: rawAlertas.filter((a) => a.tipo === 'informacion').length,
      parametros: rawAlertas.filter((a) => a.tipo === 'parametro').length,
      alta: rawAlertas.filter((a) => a.prioridad === 'alta').length,
      media: rawAlertas.filter((a) => a.prioridad === 'media').length
    };
  }, [rawAlertas]);

  const alertasFiltradas = useMemo(() => {
    return rawAlertas.filter((a) => {
      if (selectedArea !== 'Todas' && a.area !== selectedArea) return false;
      if (selectedTipo !== 'Todas' && a.tipo !== selectedTipo) return false;
      if (selectedPrioridad !== 'Todas' && a.prioridad !== selectedPrioridad) return false;
      if (selectedMarca !== 'Todas' && a.marca.trim().toUpperCase() !== selectedMarca) return false;

      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase().trim();
        const refMatch = a.referencia.toLowerCase().includes(query);
        const marcaMatch = a.marca.toLowerCase().includes(query);
        const msgMatch = a.mensaje.toLowerCase().includes(query);
        const actMatch = a.accion.toLowerCase().includes(query);
        const paramMatch = (a.parametro || '').toLowerCase().includes(query);

        if (!refMatch && !marcaMatch && !msgMatch && !actMatch && !paramMatch) {
          return false;
        }
      }

      return true;
    });
  }, [rawAlertas, selectedArea, selectedTipo, selectedPrioridad, selectedMarca, searchTerm]);

  const handleCopyAlert = (alerta: AlertaRevision) => {
    const text = `⚠️ [ALERTA ${alerta.prioridad.toUpperCase()}] Área: ${alerta.area}\nRef: ${alerta.referencia} (${alerta.marca})\nParámetro: ${alerta.parametro || 'N/A'}\nProblema: ${alerta.mensaje}\nAcción requerida: ${alerta.accion}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(alerta.id);
      triggerToast('Alerta copiada al portapapeles.');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleExportCSV = () => {
    if (alertasFiltradas.length === 0) {
      triggerToast('No hay alertas para exportar.');
      return;
    }

    const headers = ['ID Alerta', 'Prioridad', 'Área Responsable', 'Tipo Alerta', 'Referencia', 'Marca', 'Parámetro', 'Mensaje de Alerta', 'Acción Requerida'];
    const rows = alertasFiltradas.map((a) => [
      `"${a.id}"`,
      `"${a.prioridad.toUpperCase()}"`,
      `"${a.area}"`,
      `"${a.tipo}"`,
      `"${a.referencia}"`,
      `"${a.marca}"`,
      `"${a.parametro || ''}"`,
      `"${a.mensaje.replace(/"/g, '""')}"`,
      `"${a.accion.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Reporte_Alertas_Revision_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(`Exportadas ${alertasFiltradas.length} alertas a Excel/CSV exitosamente.`);
  };

  return (
    <div className="w-full space-y-6" id="alertas-revision-container">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#120F0D] p-6 rounded-3xl border border-[#B99B62]/30 shadow-xl text-white">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#B99B62]/20 text-[#F0DCA8] border border-[#B99B62]/30 rounded-2xl">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight font-serif-studio">{title}</h2>
              <p className="text-xs text-[#A69788] mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#B99B62] hover:bg-[#F0DCA8] active:scale-95 text-[#120F0D] text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
            title="Exportar alertas visibles a formato Excel (CSV)"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Excel ({alertasFiltradas.length})</span>
          </button>

          <div className="flex items-center bg-[#171310] p-1 rounded-xl border border-[#38383B]">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 px-2.5 text-xs font-bold ${
                viewMode === 'list' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
              <span>Lista</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 px-2.5 text-xs font-bold ${
                viewMode === 'table' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Tabla</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Inconsistencias */}
        <div
          onClick={() => setSelectedTipo(selectedTipo === 'inconsistencia' ? 'Todas' : 'inconsistencia')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer select-none ${
            selectedTipo === 'inconsistencia'
              ? 'bg-red-950/40 border-red-500 ring-2 ring-red-500/30'
              : 'bg-slate-900 border-slate-800 hover:border-red-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-red-400 flex items-center space-x-1.5">
              <Flame className="h-4 w-4 text-red-500" />
              <span>Inconsistencias</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/30">
              Alta Prioridad
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{metrics.inconsistencias}</span>
            <span className="text-xs text-red-400 font-semibold">
              {metrics.total > 0 ? Math.round((metrics.inconsistencias / metrics.total) * 100) : 0}% del total
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Fases posteriores aprobadas sin fase previa</p>
        </div>

        {/* KPI 2: Info sin Parámetro */}
        <div
          onClick={() => setSelectedTipo(selectedTipo === 'informacion' ? 'Todas' : 'informacion')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer select-none ${
            selectedTipo === 'informacion'
              ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
              : 'bg-slate-900 border-slate-800 hover:border-blue-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-blue-400 flex items-center space-x-1.5">
              <Info className="h-4 w-4 text-blue-500" />
              <span>Info sin Parámetro</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Media Prioridad
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{metrics.informacion}</span>
            <span className="text-xs text-blue-400 font-semibold">
              {metrics.total > 0 ? Math.round((metrics.informacion / metrics.total) * 100) : 0}% del total
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Existe fecha pero parámetro en FALSO</p>
        </div>

        {/* KPI 3: Parámetros Pendientes */}
        <div
          onClick={() => setSelectedTipo(selectedTipo === 'parametro' ? 'Todas' : 'parametro')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer select-none ${
            selectedTipo === 'parametro'
              ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
              : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400 flex items-center space-x-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Parámetros Pendientes</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Media Prioridad
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{metrics.parametros}</span>
            <span className="text-xs text-amber-400 font-semibold">
              {metrics.total > 0 ? Math.round((metrics.parametros / metrics.total) * 100) : 0}% del total
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Parámetros en FALSO tras iniciar etapa previa</p>
        </div>

        {/* KPI 4: Total Alertas */}
        <div
          onClick={() => {
            setSelectedTipo('Todas');
            setSelectedArea('Todas');
            setSelectedPrioridad('Todas');
          }}
          className="p-5 rounded-3xl border bg-slate-950 text-white border-slate-800 shadow cursor-pointer select-none hover:bg-slate-900 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 flex items-center space-x-1.5">
              <Layers className="h-4 w-4 text-slate-400" />
              <span>Total Alertas</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
              {alertasFiltradas.length} Visibles
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{metrics.total}</span>
            <span className="text-xs text-slate-400 font-medium">Activas</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Clic para reiniciar todos los filtros</p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-black text-slate-200 uppercase tracking-wider">Área Responsable:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedArea('Todas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedArea === 'Todas' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Todas las Áreas ({rawAlertas.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedArea('Colecciones')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedArea === 'Colecciones' ? 'bg-purple-600 text-white shadow' : 'bg-purple-950/40 text-purple-300 border border-purple-500/30'
              }`}
            >
              <span>Colecciones</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{countsByArea.Colecciones}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedArea('Laboratorio')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedArea === 'Laboratorio' ? 'bg-amber-600 text-white shadow' : 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
              }`}
            >
              <span>Laboratorio</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{countsByArea.Laboratorio}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedArea('Calidad')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedArea === 'Calidad' ? 'bg-emerald-600 text-white shadow' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <span>Calidad</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{countsByArea.Calidad}</span>
            </button>
          </div>
        </div>

        {/* Búsqueda y Marca */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-400">Marca:</span>
              <select
                value={selectedMarca}
                onChange={(e) => setSelectedMarca(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none"
              >
                <option value="Todas">Todas las Marcas</option>
                {uniqueBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-400">Prioridad:</span>
              <select
                value={selectedPrioridad}
                onChange={(e) => setSelectedPrioridad(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none"
              >
                <option value="Todas">Todas</option>
                <option value="alta">🔴 Alta Prioridad</option>
                <option value="media">🟡 Media Prioridad</option>
              </select>
            </div>
          </div>

          <div className="relative min-w-[240px] max-w-sm w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar referencia, marca, mensaje..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Lista de Alertas */}
      {alertasFiltradas.length === 0 ? (
        <div className="bg-slate-900 p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-white">No se detectaron alertas con los filtros seleccionados</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Todas las prendas revisadas cumplen con las reglas de consistencia de secuencia y parámetros del flujo documental.
          </p>
        </div>
      ) : (
        <div className="space-y-3 w-full">
          {alertasFiltradas.map((alerta) => {
            const isHigh = alerta.prioridad === 'alta';
            const isCopied = copiedId === alerta.id;

            return (
              <div
                key={alerta.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 w-full bg-slate-900/90 ${
                  isHigh
                    ? 'border-red-500/40 hover:border-red-500'
                    : alerta.tipo === 'informacion'
                    ? 'border-blue-500/40 hover:border-blue-500'
                    : 'border-amber-500/40 hover:border-amber-500'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        isHigh ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {alerta.prioridad === 'alta' ? '🔴 Alta' : '🟡 Media'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {alerta.area}
                    </span>
                  </div>

                  <div className="shrink-0 max-w-[160px] min-w-0">
                    <h4 className="text-xs font-black text-white truncate font-mono">{alerta.referencia}</h4>
                    <span className="text-[10px] font-bold text-slate-400 block truncate">{alerta.marca}</span>
                  </div>

                  <div className="flex-1 min-w-0 pr-1 space-y-0.5">
                    {alerta.parametro && (
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[10px] font-bold text-amber-300">
                        <Layers className="h-2.5 w-2.5" />
                        <span>{alerta.parametro}</span>
                      </span>
                    )}
                    <p className="text-xs text-slate-200 font-medium">{alerta.mensaje}</p>
                    <p className="text-[11px] text-slate-400">
                      <strong className="text-slate-300">Acción:</strong> {alerta.accion}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                  <button
                    type="button"
                    onClick={() => handleCopyAlert(alerta)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Copiar alerta"
                  >
                    {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>

                  {onSelectReferencia && (
                    <button
                      type="button"
                      onClick={() => onSelectReferencia(alerta.referencia)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center space-x-1"
                    >
                      <span>Ver</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
