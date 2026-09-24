import React, { useState, useMemo } from 'react';
import { 
  Package, 
  FlaskConical,
  Search, 
  Filter, 
  Download, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Sparkles,
  Layers,
  Send,
  Building,
  Save,
  CheckCircle2,
  Check,
  History,
  X,
  Printer,
  Calendar,
  Tag
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  SolicitudAccesorios, 
  MuestraAccesorioItem, 
  EstadoMuestraAccesorio, 
  User, 
  RespuestaLaboratorioAccesorios 
} from '../../types';

interface LaboratorioAccesoriosViewProps {
  currentUser: User | null;
  solicitudesAccesorios: SolicitudAccesorios[];
  onUpdateItemResultado: (
    solicitudId: string, 
    itemId: string, 
    datosResultado: Partial<MuestraAccesorioItem>
  ) => Promise<void> | void;
  onUpdateSolicitud: (
    id: string, 
    campos: Partial<SolicitudAccesorios>
  ) => Promise<void> | void;
}

export const LaboratorioAccesoriosView: React.FC<LaboratorioAccesoriosViewProps> = ({
  currentUser,
  solicitudesAccesorios = [],
  onUpdateItemResultado,
  onUpdateSolicitud
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroMarca, setFiltroMarca] = useState<string>('todas');
  
  // Sub-tab: 'pendientes' (Bandeja por evaluar) vs 'historial_respuestas' (Respuestas enviadas a Compras)
  const [subTab, setSubTab] = useState<'pendientes' | 'historial_respuestas'>('pendientes');

  const [expandedSolicitudId, setExpandedSolicitudId] = useState<string | null>(
    solicitudesAccesorios[0]?.id || null
  );

  // Modal para Dictamen General de la Solicitud
  const [dictamenModalSol, setDictamenModalSol] = useState<SolicitudAccesorios | null>(null);
  const [dictamenGeneral, setDictamenGeneral] = useState<'Aprobado Total' | 'Aprobado con Novedades' | 'Aprobado con Observaciones' | 'Rechazado / No Conforme' | 'Parcialmente Evaluado'>('Aprobado Total');
  const [observacionesDictamen, setObservacionesDictamen] = useState('');
  const [recomendacionesDictamen, setRecomendacionesDictamen] = useState('');
  const [isSubmittingDictamen, setIsSubmittingDictamen] = useState(false);

  // Modal para visor de inspección de respuesta guardada
  const [respuestaModalSol, setRespuestaModalSol] = useState<SolicitudAccesorios | null>(null);

  // Modal para visor de documento original
  const [documentoModalUrl, setDocumentoModalUrl] = useState<{ url: string; nombre: string } | null>(null);

  // Feedback temporal de guardado
  const [savedItemId, setSavedItemId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // KPIs
  const stats = useMemo(() => {
    let totalMuestras = 0;
    let muestrasPendientes = 0;
    let muestrasAprobadas = 0;
    let muestrasNovedades = 0;

    solicitudesAccesorios.forEach(sol => {
      (sol.items || []).forEach(it => {
        totalMuestras++;
        if (!it.estadoLab || it.estadoLab === 'Pendiente' || it.estadoLab === 'En Análisis') {
          muestrasPendientes++;
        } else if (it.estadoLab === 'Aprobado') {
          muestrasAprobadas++;
        } else if (it.estadoLab === 'Observado' || it.estadoLab === 'Rechazado' || it.estadoLab === 'Novedad') {
          muestrasNovedades++;
        }
      });
    });

    return {
      totalSolicitudes: solicitudesAccesorios.length,
      totalMuestras,
      muestrasPendientes,
      muestrasAprobadas,
      muestrasNovedades
    };
  }, [solicitudesAccesorios]);

  // Clasificar Solicitudes: Pendientes vs Respondidas a Compras
  const solicitudesPendientes = useMemo(() => {
    return solicitudesAccesorios.filter(sol => {
      // Si la solicitud está respondida o completada, sale de la bandeja de pendientes
      if (sol.estadoGeneral === 'Respondida por Laboratorio' || sol.estadoGeneral === 'Completada / Entregada') {
        return false;
      }
      return true;
    });
  }, [solicitudesAccesorios]);

  const solicitudesRespondidas = useMemo(() => {
    return solicitudesAccesorios.filter(sol => {
      if (sol.estadoGeneral === 'Respondida por Laboratorio' || sol.estadoGeneral === 'Completada / Entregada' || sol.respuestaLaboratorio) {
        return true;
      }
      // O si todas sus muestras ya tienen dictamen emitido
      const items = sol.items || [];
      const evaluadas = items.filter(i => i.estadoLab && i.estadoLab !== 'Pendiente' && i.estadoLab !== 'En Análisis');
      return items.length > 0 && evaluadas.length === items.length;
    });
  }, [solicitudesAccesorios]);

  // Solicitudes activas según la pestaña elegida
  const solicitudesBase = subTab === 'pendientes' ? solicitudesPendientes : solicitudesRespondidas;

  // Filtered Solicitudes por texto y marca
  const filteredSolicitudes = useMemo(() => {
    return solicitudesBase.filter(sol => {
      if (filtroEstado !== 'todos' && sol.estadoGeneral !== filtroEstado) return false;
      if (filtroMarca !== 'todas' && sol.marca !== filtroMarca) return false;

      if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase();
        const matchCodigo = sol.codigoSolicitud?.toLowerCase().includes(s);
        const matchTitulo = sol.titulo?.toLowerCase().includes(s);
        const matchProveedor = sol.proveedorGeneral?.toLowerCase().includes(s);
        const matchItem = sol.items?.some(it => 
          it.referencia?.toLowerCase().includes(s) || 
          it.descripcion?.toLowerCase().includes(s) ||
          it.color?.toLowerCase().includes(s) ||
          it.talla?.toLowerCase().includes(s)
        );
        if (!matchCodigo && !matchTitulo && !matchItem) return false;
      }

      return true;
    });
  }, [solicitudesBase, filtroEstado, filtroMarca, searchTerm]);

  const handleItemFieldChange = async (
    solicitudId: string, 
    itemId: string, 
    fields: Partial<MuestraAccesorioItem>
  ) => {
    const today = new Date().toISOString().split('T')[0];
    await onUpdateItemResultado(solicitudId, itemId, {
      ...fields,
      responsableLab: currentUser?.name || 'Laboratorio',
      fechaDictamen: today,
      fechaEntregaLab: fields.fechaEntregaLab || today,
      fechaIngresoLab: fields.fechaIngresoLab || today
    });
    setSavedItemId(itemId);
    setTimeout(() => setSavedItemId(null), 2000);
  };

  const handleOpenDictamenModal = (sol: SolicitudAccesorios) => {
    setDictamenModalSol(sol);
    const hasRechazado = sol.items.some(i => i.estadoLab === 'Rechazado');
    const hasObservado = sol.items.some(i => i.estadoLab === 'Observado' || i.estadoLab === 'Novedad');
    const allAprobadas = sol.items.length > 0 && sol.items.every(i => i.estadoLab === 'Aprobado');

    if (hasRechazado) {
      setDictamenGeneral('Rechazado / No Conforme');
    } else if (hasObservado) {
      setDictamenGeneral('Aprobado con Novedades');
    } else if (allAprobadas) {
      setDictamenGeneral('Aprobado Total');
    } else {
      setDictamenGeneral('Parcialmente Evaluado');
    }

    setObservacionesDictamen(sol.respuestaLaboratorio?.observacionesGenerales || '');
    setRecomendacionesDictamen(sol.respuestaLaboratorio?.recomendaciones || '');
  };

  const handleSaveDictamenGeneral = async () => {
    if (!dictamenModalSol) return;
    setIsSubmittingDictamen(true);

    try {
      const hoy = new Date().toISOString().split('T')[0];
      const aprobadasCount = dictamenModalSol.items.filter(i => i.estadoLab === 'Aprobado').length;
      const observadasCount = dictamenModalSol.items.filter(i => i.estadoLab === 'Observado' || i.estadoLab === 'Novedad').length;
      const rechazadasCount = dictamenModalSol.items.filter(i => i.estadoLab === 'Rechazado').length;

      const respuesta: RespuestaLaboratorioAccesorios = {
        fechaRespuesta: hoy,
        respondidoPor: currentUser?.name || 'Laboratorio STF',
        dictamenGeneral,
        observacionesGenerales: observacionesDictamen.trim() || 'Evaluación de laboratorio concluida satisfactoriamente según requerimientos STF Group.',
        recomendaciones: recomendacionesDictamen.trim() || undefined,
        totalAprobadas: aprobadasCount,
        totalObservadas: observadasCount,
        totalRechazadas: rechazadasCount
      };

      // Actualizar fecha de entrega en todos los items si no la tienen
      const itemsActualizados = dictamenModalSol.items.map(it => ({
        ...it,
        fechaEntregaLab: it.fechaEntregaLab || hoy,
        fechaDictamen: it.fechaDictamen || hoy,
        fechaIngresoLab: it.fechaIngresoLab || dictamenModalSol.fechaSolicitud || hoy
      }));

      await onUpdateSolicitud(dictamenModalSol.id, {
        estadoGeneral: 'Respondida por Laboratorio',
        respuestaLaboratorio: respuesta,
        fechaUltimoDictamen: hoy,
        items: itemsActualizados
      });

      setDictamenModalSol(null);
      showToast(`¡Respuesta de Laboratorio enviada a Compras! La solicitud ${dictamenModalSol.codigoSolicitud} se guardó en el Historial.`);
    } catch (err) {
      console.error("Error guardando dictamen general:", err);
    } finally {
      setIsSubmittingDictamen(false);
    }
  };

  const handleExportExcel = (solicitud?: SolicitudAccesorios) => {
    const dataToExport: any[] = [];
    const list = solicitud ? [solicitud] : solicitudesAccesorios;

    list.forEach(sol => {
      (sol.items || []).forEach(it => {
        dataToExport.push({
          'Código Solicitud': sol.codigoSolicitud,
          'Título': sol.titulo,
          'Marca': sol.marca,
          'Solicitante': sol.solicitante?.nombre,
          'Fecha Solicitud': sol.fechaSolicitud,
          'Estado Solicitud': sol.estadoGeneral,
          'Fila #': it.filaNumero,
          'Referencia': it.referencia,
          'Color': it.color || 'ESTÁNDAR',
          'Talla / Medida': it.talla || 'U',
          'QTY (Cantidad)': `${it.cantidad || 1} ${it.unidad || 'UNID'}`,
          'Resultados (Observaciones Lab)': it.observacionLab || it.resultadoLab || '',
          'Fecha Ingreso': it.fechaIngresoLab || sol.fechaSolicitud || '',
          'Fecha Entrega': it.fechaEntregaLab || it.fechaDictamen || sol.fechaUltimoDictamen || '',
          'Estado Lab': it.estadoLab || 'Pendiente',
          'Responsable Lab': it.responsableLab || ''
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ensayos_Accesorios');
    const fileName = solicitud 
      ? `Ensayos_Accesorios_${solicitud.codigoSolicitud}.xlsx`
      : `Ensayos_Accesorios_STF_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-5 font-sans">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-amber-300 px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-2 animate-fade-in text-xs font-medium">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Sub-Tabs Switcher */}
      <div className="bg-[#FBF8F2] text-[#2B2B2E] px-6 py-4 rounded-2xl shadow-sm border border-[#E3D9C7] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-brand-gold" />
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-[#2B2B2E] font-display">
              Laboratorio — Evaluación de Insumos
            </h2>
            <span className="text-[10px] bg-brand-gold/20 text-brand-gold px-2.5 py-0.5 rounded-full font-bold uppercase border border-brand-gold/30">
              STF Group
            </span>
          </div>
          <p className="text-[#6B5744] text-xs mt-1 font-medium">
            Al evaluar y responder a Compras, las solicitudes salen de pendientes y se resguardan en el Historial de Respuestas.
          </p>
        </div>

        {/* Sub-Tab Navigation Bar - Exact DESIGN Spec */}
        <div className="flex bg-[#FBF8F2] p-1 rounded-xl border border-[#E3D9C7] self-start md:self-auto gap-1">
          <button
            type="button"
            onClick={() => {
              setSubTab('pendientes');
              setFiltroEstado('todos');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
              subTab === 'pendientes'
                ? 'bg-brand-950 text-brand-gold shadow-md font-extrabold'
                : 'text-moca hover:text-negro'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Solicitudes Pendientes ({solicitudesPendientes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubTab('historial_respuestas');
              setFiltroEstado('todos');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
              subTab === 'historial_respuestas'
                ? 'bg-brand-950 text-brand-gold shadow-md font-extrabold'
                : 'text-moca hover:text-negro'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Historial Respuestas Lab ({solicitudesRespondidas.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 font-sans">
        <div className="bg-[#FAF7F2] border border-[#E3D9C7] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-[#6B5744] uppercase tracking-wider block mb-1">Total Solicitudes</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-[#2B2B2E]">{stats.totalSolicitudes}</span>
            <Package className="h-5 w-5 text-[#B99B62]" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] border border-[#E3D9C7] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-[#6B5744] uppercase tracking-wider block mb-1">Muestras Totales</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-[#2B2B2E]">{stats.totalMuestras}</span>
            <Layers className="h-5 w-5 text-[#6B5744]" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] border border-[#E3D9C7] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-[#8A7444] uppercase tracking-wider block mb-1">Pendientes por Evaluar</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-[#8A7444]">{stats.muestrasPendientes}</span>
            <Clock className="h-5 w-5 text-[#B99B62]" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] border border-[#E3D9C7] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-[#5F6E54] uppercase tracking-wider block mb-1">Aprobadas</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-[#5F6E54]">{stats.muestrasAprobadas}</span>
            <CheckCircle className="h-5 w-5 text-[#8A9680]" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] border border-[#E3D9C7] rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-[#966C5C] uppercase tracking-wider block mb-1">Con Novedad / Rechazo</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-[#966C5C]">{stats.muestrasNovedades}</span>
            <AlertTriangle className="h-5 w-5 text-[#BE8A79]" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E3D9C7] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-[#2B2B2E]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B5744]" />
          <input
            type="text"
            placeholder="Buscar por código, referencia (ej: MI00409922), color o talla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E3D9C7] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2B2B2E] placeholder-[#A6927A] focus:outline-none focus:border-[#B99B62]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E3D9C7] rounded-xl px-2.5 py-1.5">
            <Filter className="h-3.5 w-3.5 text-[#6B5744]" />
            <span className="text-[10px] font-bold text-[#6B5744] uppercase">Estado:</span>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#2B2B2E] focus:outline-none cursor-pointer"
            >
              <option value="todos" className="bg-[#FAF7F2]">Todos los Estados</option>
              {subTab === 'pendientes' ? (
                <>
                  <option value="Enviada a Laboratorio" className="bg-[#FAF7F2]">Enviada a Laboratorio</option>
                  <option value="En Proceso Laboratorio" className="bg-[#FAF7F2]">En Proceso Laboratorio</option>
                </>
              ) : (
                <>
                  <option value="Respondida por Laboratorio" className="bg-[#FAF7F2]">Respondida por Lab</option>
                  <option value="Completada / Entregada" className="bg-[#FAF7F2]">Completada / Entregada</option>
                </>
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={() => handleExportExcel()}
            className="px-3.5 py-2 bg-[#2B2B2E] hover:bg-[#424246] text-[#C6A466] border border-[#424246] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Solicitudes List (Pendientes o Historial) */}
      {filteredSolicitudes.length === 0 ? (
        <div className="bg-[#2D2D30] rounded-3xl p-12 text-center border border-dashed border-[#424246] text-[#FBF8F2]">
          <Package className="h-12 w-12 text-[#8A8172] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#FBF8F2] font-display">
            {subTab === 'pendientes' ? '¡No hay solicitudes pendientes en la bandeja!' : 'No hay respuestas guardadas en el historial'}
          </h3>
          <p className="text-xs text-[#AA9E80] mt-1">
            {subTab === 'pendientes' 
              ? 'Todas las evaluaciones de accesorios completadas han sido enviadas a Compras y están guardadas en el Historial.'
              : 'Al evaluar solicitudes de accesorios y emitir dictamen, aparecerán guardadas aquí permanentemente.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSolicitudes.map((sol) => {
            const isExpanded = expandedSolicitudId === sol.id;
            const items = sol.items || [];
            const aprobadasCount = items.filter(i => i.estadoLab === 'Aprobado').length;
            const pendientesCount = items.filter(i => !i.estadoLab || i.estadoLab === 'Pendiente' || i.estadoLab === 'En Análisis').length;
            const novedadesCount = items.filter(i => i.estadoLab === 'Observado' || i.estadoLab === 'Rechazado' || i.estadoLab === 'Novedad').length;

            return (
              <div 
                key={sol.id} 
                className="bg-[#2D2D30] rounded-2xl border border-[#424246] shadow-md overflow-hidden text-[#FBF8F2]"
              >
                {/* Header */}
                <div 
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-[#2B2B2E]/60 transition-colors border-b border-[#424246]"
                  onClick={() => setExpandedSolicitudId(isExpanded ? null : sol.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#2B2B2E] text-[#C6A466] font-mono font-bold text-xs border border-[#424246] shrink-0">
                      {sol.codigoSolicitud}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-bold text-[#FBF8F2]">
                          {sol.titulo || `Solicitud ${sol.codigoSolicitud}`}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#2B2B2E] text-[#AA9E80] border border-[#424246]">
                          {sol.marca || 'STUDIO F'}
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${
                          sol.estadoGeneral === 'Respondida por Laboratorio' || sol.estadoGeneral === 'Completada / Entregada'
                            ? 'border-[#485C3E]/40 text-[#8ba87e] bg-[#485C3E]/20'
                            : 'border-[#C6A466]/30 text-[#C6A466] bg-[#C6A466]/10'
                        }`}>
                          {sol.estadoGeneral}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#AA9E80] mt-1 flex-wrap">
                        <span>Solicitante: <strong className="text-[#FBF8F2]">{sol.solicitante?.nombre || 'Compras'}</strong></span>
                        <span>•</span>
                        <span>Fecha: {sol.fechaSolicitud}</span>
                        {sol.fechaUltimoDictamen && (
                          <>
                            <span>•</span>
                            <span className="text-[#C6A466] font-semibold">Respuesta Lab: {sol.fechaUltimoDictamen}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end md:self-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-[#485C3E]/20 text-[#8ba87e] border border-[#485C3E]/30 font-bold">
                        ✓ {aprobadasCount}
                      </span>
                      {novedadesCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-[#8C3D35]/20 text-[#e07a70] border border-[#8C3D35]/30 font-bold">
                          ! {novedadesCount}
                        </span>
                      )}
                      {pendientesCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/30 font-bold">
                          ⏳ {pendientesCount}
                        </span>
                      )}
                    </div>

                    {subTab === 'pendientes' ? (
                      <button
                        type="button"
                        onClick={() => handleOpenDictamenModal(sol)}
                        className="px-3 py-1.5 bg-[#C6A466] hover:bg-[#b59356] text-[#2B2B2E] font-black text-xs rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Emitir Dictamen</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setRespuestaModalSol(sol)}
                        className="px-3 py-1.5 bg-[#2B2B2E] hover:bg-[#424246] text-[#C6A466] font-bold text-xs rounded-xl flex items-center gap-1.5 border border-[#424246] transition-all cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Ver Respuesta</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedSolicitudId(isExpanded ? null : sol.id)}
                      className="p-1 text-[#AA9E80] hover:text-[#FBF8F2]"
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Tabla de Items con Columnas Primordiales solicitadas: Referencia, Color, Talla, QTY, Resultados (Observaciones Analista), Fecha Ingreso, Fecha Entrega */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-[#2B2B2E] space-y-4">
                    <div className="flex items-center justify-between text-xs text-[#AA9E80]">
                      <span className="font-bold text-[#FBF8F2] uppercase text-[10px] tracking-wider">
                        Campos Primordiales: Referencia • Color • Talla • QTY • Resultados (Observaciones Analista) • Fecha Ingreso • Fecha Entrega
                      </span>
                      <span className="text-[10px] text-[#C6A466] font-mono font-bold">
                        {items.length} Referencias de Insumos
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-[#424246] rounded-2xl">
                      <table className="w-full text-left text-xs border-collapse min-w-[950px]">
                        <thead className="bg-[#2D2D30] text-[#AA9E80] font-bold border-b border-[#424246] text-[10px] uppercase tracking-wider">
                          <tr>
                            <th className="py-2.5 px-3 w-10 text-center">#</th>
                            <th className="py-2.5 px-3 bg-[#C6A466]/10 text-[#C6A466] font-extrabold min-w-[130px]">1. REFERENCIA *</th>
                            <th className="py-2.5 px-3 bg-[#C6A466]/10 text-[#C6A466] font-extrabold min-w-[100px]">2. COLOR *</th>
                            <th className="py-2.5 px-3 bg-[#C6A466]/10 text-[#C6A466] font-extrabold min-w-[90px]">3. TALLA *</th>
                            <th className="py-2.5 px-3 bg-[#C6A466]/10 text-[#C6A466] font-extrabold min-w-[90px]">4. QTY *</th>
                            <th className="py-2.5 px-3 bg-[#2B2B2E] text-[#FBF8F2] font-extrabold min-w-[220px]">5. RESULTADOS (OBSERVACIÓN ANALISTA) *</th>
                            <th className="py-2.5 px-3 bg-[#2D2D30] text-[#AA9E80] font-extrabold min-w-[100px]">6. F. INGRESO *</th>
                            <th className="py-2.5 px-3 bg-[#485C3E]/20 text-[#8ba87e] font-extrabold min-w-[100px]">7. F. ENTREGA *</th>
                            <th className="py-2.5 px-3 text-center min-w-[110px]">ESTADO LAB</th>
                            <th className="py-2.5 px-2 w-10 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#424246] text-[#FBF8F2] font-medium">
                          {items.map((item, idx) => {
                            const isSaved = savedItemId === item.id;
                            const today = new Date().toISOString().split('T')[0];
                            const fechaIngreso = item.fechaIngresoLab || sol.fechaSolicitud || today;
                            const fechaEntrega = item.fechaEntregaLab || item.fechaDictamen || sol.fechaUltimoDictamen || (item.estadoLab && item.estadoLab !== 'Pendiente' ? today : '');

                            return (
                              <tr key={item.id || idx} className="hover:bg-[#2D2D30]/70 transition-colors">
                                {/* # */}
                                <td className="py-2.5 px-3 text-center font-mono text-[#8A8172] font-bold">{item.filaNumero || idx + 1}</td>

                                {/* 1. REFERENCIA */}
                                <td className="py-2.5 px-3 font-mono font-black text-[#FBF8F2] text-xs">
                                  {item.referencia}
                                </td>

                                {/* 2. COLOR */}
                                <td className="py-2.5 px-3 text-[#FBF8F2] font-bold">
                                  {item.color || 'ESTÁNDAR'}
                                </td>

                                {/* 3. TALLA */}
                                <td className="py-2.5 px-3 text-[#FBF8F2] font-bold">
                                  {item.talla || 'U'}
                                </td>

                                {/* 4. QTY */}
                                <td className="py-2.5 px-3 font-mono font-bold text-[#C6A466]">
                                  {item.cantidad || 1} {item.unidad || 'UNID'}
                                </td>

                                {/* 5. RESULTADOS (OBSERVACIÓN ANALISTA) */}
                                <td className="py-2 px-3">
                                  {subTab === 'pendientes' ? (
                                    <input
                                      type="text"
                                      placeholder="Escriba la observación técnica del analista de laboratorio..."
                                      value={item.observacionLab || item.resultadoLab || ''}
                                      onChange={(e) => handleItemFieldChange(sol.id, item.id, { 
                                        observacionLab: e.target.value,
                                        resultadoLab: e.target.value
                                      })}
                                      className="w-full bg-[#2D2D30] border border-[#424246] rounded-lg px-2.5 py-1 text-xs text-[#FBF8F2] focus:outline-none focus:border-[#C6A466] font-medium"
                                    />
                                  ) : (
                                    <span className="text-[#FBF8F2] italic">
                                      {item.observacionLab || item.resultadoLab || 'Conforme a estándar'}
                                    </span>
                                  )}
                                </td>

                                {/* 6. FECHA INGRESO */}
                                <td className="py-2 px-3">
                                  {subTab === 'pendientes' ? (
                                    <input
                                      type="date"
                                      value={fechaIngreso}
                                      onChange={(e) => handleItemFieldChange(sol.id, item.id, { fechaIngresoLab: e.target.value })}
                                      className="w-full bg-[#2D2D30] border border-[#424246] rounded-lg px-2 py-1 text-xs text-[#AA9E80] font-mono"
                                    />
                                  ) : (
                                    <span className="font-mono text-[#AA9E80] text-[11px]">{fechaIngreso}</span>
                                  )}
                                </td>

                                {/* 7. FECHA ENTREGA */}
                                <td className="py-2 px-3">
                                  {subTab === 'pendientes' ? (
                                    <input
                                      type="date"
                                      value={fechaEntrega}
                                      onChange={(e) => handleItemFieldChange(sol.id, item.id, { fechaEntregaLab: e.target.value })}
                                      className="w-full bg-[#2D2D30] border border-[#424246] rounded-lg px-2 py-1 text-xs text-[#8ba87e] font-mono font-bold"
                                    />
                                  ) : (
                                    <span className="font-mono text-[#8ba87e] font-bold text-[11px]">{fechaEntrega || 'Entregado'}</span>
                                  )}
                                </td>

                                {/* ESTADO LAB */}
                                <td className="py-2 px-3 text-center">
                                  {subTab === 'pendientes' ? (
                                    <select
                                      value={
                                        item.estadoLab === 'OK' || item.estadoLab === 'Aprobado' ? 'OK' :
                                        item.estadoLab === 'Novedad' || item.estadoLab === 'Observado' ? 'Novedad' :
                                        item.estadoLab === 'Rechazado' || (item.estadoLab as any) === 'NO OK' ? 'Rechazado' :
                                        'Pendiente'
                                      }
                                      onChange={(e) => handleItemFieldChange(sol.id, item.id, { estadoLab: e.target.value as any })}
                                      className="w-full bg-[#2D2D30] border border-[#424246] rounded-lg px-2 py-1 text-xs font-bold text-[#FBF8F2] focus:outline-none cursor-pointer"
                                    >
                                      <option value="OK">OK</option>
                                      <option value="Novedad">Novedad</option>
                                      <option value="Rechazado">Rechazado</option>
                                      <option value="Pendiente">Pendiente</option>
                                    </select>
                                  ) : (
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase border ${
                                      item.estadoLab === 'Aprobado' || item.estadoLab === 'OK' ? 'bg-[#485C3E]/20 text-[#8ba87e] border-[#485C3E]/30' :
                                      item.estadoLab === 'Rechazado' ? 'bg-[#8C3D35]/20 text-[#e07a70] border-[#8C3D35]/30' :
                                      'bg-[#C6A466]/20 text-[#C6A466] border-[#C6A466]/30'
                                    }`}>
                                      {item.estadoLab || 'Evaluado'}
                                    </span>
                                  )}
                                </td>

                                {/* SAVED ICON */}
                                <td className="py-2 px-2 text-center">
                                  {isSaved ? <Check className="h-4 w-4 text-[#8ba87e] mx-auto animate-bounce" /> : <span className="text-[#8A8172] font-mono">—</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: EMITIR DICTAMEN GENERAL */}
      {dictamenModalSol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#2B2B2E] text-[#FBF8F2] rounded-3xl w-full max-w-xl border border-[#424246] p-6 space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#424246] pb-3">
              <h3 className="font-bold text-sm text-[#FBF8F2] font-display">Emitir Dictamen — {dictamenModalSol.codigoSolicitud}</h3>
              <button onClick={() => setDictamenModalSol(null)} className="text-[#AA9E80] hover:text-[#FBF8F2]">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#AA9E80] font-bold mb-1">Dictamen General del Laboratorio *</label>
                <select
                  value={dictamenGeneral}
                  onChange={(e) => setDictamenGeneral(e.target.value as any)}
                  className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl p-2.5 text-[#FBF8F2] font-bold cursor-pointer"
                >
                  <option value="Aprobado Total">Aprobado Total (Todas las muestras cumplen)</option>
                  <option value="Aprobado con Novedades">Aprobado con Novedades (Observaciones técnicas)</option>
                  <option value="Aprobado con Observaciones">Aprobado con Observaciones</option>
                  <option value="Rechazado / No Conforme">Rechazado / No Conforme</option>
                  <option value="Parcialmente Evaluado">Parcialmente Evaluado</option>
                </select>
              </div>

              <div>
                <label className="block text-[#AA9E80] font-bold mb-1">Observaciones Técnicas Generales (Respuesta a Compras)</label>
                <textarea
                  rows={3}
                  value={observacionesDictamen}
                  onChange={(e) => setObservacionesDictamen(e.target.value)}
                  placeholder="Detalle las observaciones de tracción, solidez, fijación, etc."
                  className="w-full p-2.5 bg-[#2D2D30] border border-[#424246] rounded-xl text-[#FBF8F2] resize-none"
                />
              </div>

              <div>
                <label className="block text-[#AA9E80] font-bold mb-1">Recomendaciones para Producción / Taller</label>
                <textarea
                  rows={2}
                  value={recomendacionesDictamen}
                  onChange={(e) => setRecomendacionesDictamen(e.target.value)}
                  placeholder="Ej: Calibrar troquel a 2.5 bar para evitar deformación..."
                  className="w-full p-2.5 bg-[#2D2D30] border border-[#424246] rounded-xl text-[#FBF8F2] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#424246]">
                <button
                  type="button"
                  onClick={() => setDictamenModalSol(null)}
                  className="px-4 py-2 text-[#AA9E80] hover:text-[#FBF8F2]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSubmittingDictamen}
                  onClick={handleSaveDictamenGeneral}
                  className="px-5 py-2.5 bg-[#C6A466] hover:bg-[#b59356] text-[#2B2B2E] font-black uppercase rounded-xl shadow cursor-pointer"
                >
                  {isSubmittingDictamen ? 'Enviando...' : 'Emitir Dictamen & Enviar a Compras'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VER DETALLE DE RESPUESTA ENVIADA A COMPRAS (HISTORIAL ACCESORIOS) */}
      {respuestaModalSol && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setRespuestaModalSol(null)}
        >
          <div 
            className="bg-[#2B2B2E] text-[#FBF8F2] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[#424246] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#2D2D30] px-6 py-4 border-b border-[#424246] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/30">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/30 px-2 py-0.5 rounded">
                    Respuesta de Laboratorio de Accesorios
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-[#FBF8F2] mt-0.5 font-mono">
                    {respuestaModalSol.codigoSolicitud} — {respuestaModalSol.titulo}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRespuestaModalSol(null)}
                className="p-1.5 text-[#AA9E80] hover:text-[#FBF8F2]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs custom-vertical-scroll">
              <div className="bg-[#2D2D30] p-4 rounded-2xl border border-[#424246] space-y-2">
                <div className="flex items-center justify-between border-b border-[#424246] pb-2">
                  <span className="font-bold text-[#FBF8F2] uppercase text-[10px]">Dictamen Emitido:</span>
                  <span className="font-extrabold uppercase text-xs px-2.5 py-0.5 rounded bg-[#C6A466] text-[#2B2B2E]">
                    {respuestaModalSol.respuestaLaboratorio?.dictamenGeneral || respuestaModalSol.estadoGeneral}
                  </span>
                </div>
                <p className="text-[#AA9E80] italic pt-1">
                  &ldquo;{respuestaModalSol.respuestaLaboratorio?.observacionesGenerales || respuestaModalSol.observacionesGenerales || 'Evaluación de insumos concluida.'}&rdquo;
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase text-[#AA9E80] text-[10px]">Muestras e Insumos Evaluados:</h4>
                <div className="border border-[#424246] rounded-xl overflow-hidden bg-[#2D2D30]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#2B2B2E] text-[#AA9E80] font-bold text-[10px] uppercase">
                      <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">Referencia</th>
                        <th className="p-2">Color</th>
                        <th className="p-2">Talla</th>
                        <th className="p-2">QTY</th>
                        <th className="p-2">Resultado / Observaciones Analista</th>
                        <th className="p-2">F. Ingreso</th>
                        <th className="p-2">F. Entrega</th>
                        <th className="p-2 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#424246] text-[#FBF8F2] font-medium">
                      {(respuestaModalSol.items || []).map((it, idx) => (
                        <tr key={it.id || idx}>
                          <td className="p-2 text-center font-mono text-[#8A8172]">{it.filaNumero || idx + 1}</td>
                          <td className="p-2 font-mono font-bold text-[#FBF8F2]">{it.referencia}</td>
                          <td className="p-2">{it.color || '—'}</td>
                          <td className="p-2">{it.talla || '—'}</td>
                          <td className="p-2 font-mono text-[#C6A466]">{it.cantidad || 1} {it.unidad || 'UNID'}</td>
                          <td className="p-2 text-[#FBF8F2]">{it.observacionLab || it.resultadoLab || 'Conforme'}</td>
                          <td className="p-2 font-mono text-[#AA9E80] text-[11px]">{it.fechaIngresoLab || respuestaModalSol.fechaSolicitud || '—'}</td>
                          <td className="p-2 font-mono text-[#8ba87e] font-bold text-[11px]">{it.fechaEntregaLab || respuestaModalSol.fechaUltimoDictamen || '—'}</td>
                          <td className="p-2 text-center">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#485C3E]/20 text-[#8ba87e] border border-[#485C3E]/30 uppercase">
                              {it.estadoLab || 'Evaluado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#2D2D30] border-t border-[#424246] flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleExportExcel(respuestaModalSol)}
                className="px-4 py-2 bg-[#485C3E] hover:bg-[#3d4f34] text-[#FBF8F2] font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Exportar Excel</span>
              </button>
              <button
                type="button"
                onClick={() => setRespuestaModalSol(null)}
                className="px-4 py-2 bg-[#2B2B2E] hover:bg-[#424246] text-[#AA9E80] font-bold text-xs rounded-xl border border-[#424246]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
