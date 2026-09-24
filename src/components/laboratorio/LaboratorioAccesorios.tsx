import React, { useState, useEffect } from 'react';
import { 
  SolicitudAccesoriosCompleta, 
  ItemMuestraAccesorio, 
  DictamenType,
  ReporteEvaluacionInsumoData 
} from '../../types';
import { useQuality } from '../../context/QualityContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { TablaMaestraInsumos } from './TablaMaestraInsumos';
import { ReporteEvaluacionInsumoModal } from './ReporteEvaluacionInsumoModal';
import { GuiaMaestraInsumoItem } from '../../data/guiaMaestraInsumos';
import { 
  PackageCheck, 
  Search, 
  FlaskConical, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Save, 
  Send, 
  ArrowLeft, 
  FileText, 
  Paperclip, 
  Check, 
  Building2, 
  Tag, 
  Eye, 
  Sliders, 
  Calendar, 
  UserCheck, 
  ShieldCheck,
  Layers, 
  AlertCircle,
  BookOpen,
  CheckSquare,
  Square
} from 'lucide-react';

interface LaboratorioAccesoriosProps {
  solicitudes: SolicitudAccesoriosCompleta[];
  onActualizarItem: (solicitudId: string, itemId: string, datos: Partial<ItemMuestraAccesorio>) => void;
  onResponderSolicitud: (solicitudId: string, datos: { observacionesLab?: string; responsable?: string; muestrasEvaluadas?: ItemMuestraAccesorio[] }) => void;
}

export const LaboratorioAccesorios: React.FC<LaboratorioAccesoriosProps> = ({
  solicitudes,
  onActualizarItem,
  onResponderSolicitud
}) => {
  const { usuario } = useAuth();
  const { analistas, analistaActivo } = useQuality();
  
  // Usuario ingresado / en sesión (responsable automático de ensayos)
  const usuarioLogueadoNombre = usuario?.displayName || usuario?.nombreUsuario || analistaActivo?.nombreCompleto || 'Laboratorista Textil';

  // Sub-pestañas: Bandeja de Solicitudes vs Tabla Maestra de Ensayos
  const [subTabActiva, setSubTabActiva] = useState<'solicitudes' | 'tabla-maestra'>('solicitudes');
  const [modalGuiaMaestra, setModalGuiaMaestra] = useState(false);
  const [idxMuestraParaGuia, setIdxMuestraParaGuia] = useState<number | null>(null);

  // Selección individual y grupal para responder a compras
  const [itemsSeleccionadosIds, setItemsSeleccionadosIds] = useState<string[]>([]);
  // Modal de Reporte Individual
  const [itemParaReporte, setItemParaReporte] = useState<ItemMuestraAccesorio | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  
  // Solicitud abierta para revisión detallada (null = ver bandeja general)
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudAccesoriosCompleta | null>(null);

  // Copia de trabajo de las líneas de accesorios para edición en bloque
  const [muestrasBorrador, setMuestrasBorrador] = useState<ItemMuestraAccesorio[]>([]);
  const [observacionesGeneralesLab, setObservacionesGeneralesLab] = useState('');
  const [responsableLabInput, setResponsableLabInput] = useState(usuarioLogueadoNombre);

  // Modal para ver el documento original enviado por Compras
  const [modalDocumentoOriginal, setModalDocumentoOriginal] = useState(false);

  // Sincronizar automáticamente el Responsable cuando cambia el usuario ingresado o analista activo
  useEffect(() => {
    const nombreActual = usuario?.displayName || usuario?.nombreUsuario || analistaActivo?.nombreCompleto;
    if (nombreActual) {
      setResponsableLabInput(nombreActual);
    }
  }, [usuario?.displayName, usuario?.nombreUsuario, analistaActivo?.id, analistaActivo?.nombreCompleto]);

  // Al seleccionar una solicitud, inicializamos los borradores asignando por defecto al usuario que ingresó
  useEffect(() => {
    if (solicitudSeleccionada) {
      // Sincronizar con la versión más reciente desde props
      const encontrada = solicitudes.find(s => s.id === solicitudSeleccionada.id);
      if (encontrada) {
        const responsableFinal = encontrada.responsableRespuestaLab || usuarioLogueadoNombre;
        const muestrasConResponsable = (encontrada.muestras || []).map(m => ({
          ...m,
          responsableLab: m.responsableLab || responsableFinal
        }));

        setMuestrasBorrador(JSON.parse(JSON.stringify(muestrasConResponsable)));
        setObservacionesGeneralesLab(encontrada.observacionesLabRespuesta || '');
        setResponsableLabInput(responsableFinal);
        setItemsSeleccionadosIds([]);
      }
    }
  }, [solicitudSeleccionada?.id, solicitudes, usuarioLogueadoNombre, analistaActivo?.nombreCompleto]);

  // Manejar cambio de datos en una fila/accesorio individual
  const handleCambioMuestra = (index: number, campo: keyof ItemMuestraAccesorio, valor: any) => {
    const nuevas = [...muestrasBorrador];
    nuevas[index] = {
      ...nuevas[index],
      [campo]: valor
    };

    // Si cambia el resultado o estado, ajustar el dictamen técnico
    if (campo === 'resultado' || campo === 'estadoAccesorio') {
      const valStr = String(valor).toUpperCase();
      if (valStr.includes('NO OK') || valStr.includes('RECHAZADO') || valStr.includes('DEFICIENTE') || valStr.includes('FALLA')) {
        nuevas[index].dictamen = 'RECHAZADO';
      } else if (valStr.includes('OBSERVACIÓN') || valStr.includes('NOVEDAD') || valStr.includes('HALLAZGO')) {
        nuevas[index].dictamen = 'HALLAZGO';
      } else if (valStr.includes('PENDIENTE') || valStr.includes('REVISIÓN')) {
        nuevas[index].dictamen = 'PENDIENTE';
      } else if (valStr.includes('OK') || valStr.includes('APROBADO') || valStr.includes('CONFORME')) {
        nuevas[index].dictamen = 'APROBADO';
      }
    }

    setMuestrasBorrador(nuevas);
  };

  // Calcular Estado General de la Solicitud según la regla del usuario
  const calcularEstadoGeneralSolicitud = (muestras: ItemMuestraAccesorio[]) => {
    if (!muestras || muestras.length === 0) return { texto: 'PENDIENTE', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };

    const dictamenes = muestras.map(m => (m.dictamen || 'PENDIENTE').toUpperCase());
    const tienePendientes = dictamenes.includes('PENDIENTE') || dictamenes.includes('EN_PROCESO');
    const tieneNoOk = dictamenes.includes('RECHAZADO');
    const tieneObservacion = dictamenes.includes('HALLAZGO');
    const todosOk = dictamenes.every(d => d === 'APROBADO');

    if (tienePendientes) {
      return { texto: '⚠️ PENDIENTE', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
    if (tieneNoOk) {
      return { texto: '⚠️ COMPLETADA CON NO OK', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    }
    if (tieneObservacion) {
      return { texto: 'ℹ️ COMPLETADA CON OBSERVACIÓN', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
    }
    if (todosOk) {
      return { texto: '✅ COMPLETADA (OK)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }

    return { texto: 'EN REVISIÓN', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
  };

  // Filtrado reactivo de la bandeja de solicitudes
  const solicitudesFiltradas = (solicitudes || []).filter((sol) => {
    if (!sol) return false;
    const q = (busqueda || '').toLowerCase().trim();
    
    const cumpleBusqueda = !q || (
      (sol.numeroSolicitud || '').toLowerCase().includes(q) ||
      (sol.solicitante || '').toLowerCase().includes(q) ||
      (sol.proveedor || '').toLowerCase().includes(q) ||
      (sol.muestras || []).some(m => 
        (m.referencia || '').toLowerCase().includes(q) || 
        (m.descripcionInsumo || '').toLowerCase().includes(q) ||
        (m.color || '').toLowerCase().includes(q)
      )
    );

    const estGen = calcularEstadoGeneralSolicitud(sol.muestras || []).texto;
    const cumpleEstado = filtroEstado === 'TODOS' || estGen.includes(filtroEstado);

    return cumpleBusqueda && cumpleEstado;
  });

  // Guardar resultados de todas las líneas sin cerrar
  // Guardar resultados de todas las líneas sin enviar
  const handleGuardarResultados = () => {
    if (!solicitudSeleccionada) return;

    muestrasBorrador.forEach((m) => {
      onActualizarItem(solicitudSeleccionada.id, m.id, {
        resultado: m.resultado,
        observacion: m.observacion,
        dictamen: m.dictamen,
        fechaIngreso: m.fechaIngreso,
        fechaEntrega: m.fechaEntrega,
        responsableLab: responsableLabInput,
        accion: m.dictamen === 'APROBADO' ? 'Liberado para Confección' : 'Retenido / No conforme'
      });
    });

    alert(`¡Resultados de los ${muestrasBorrador.length} accesorios de la solicitud ${solicitudSeleccionada.numeroSolicitud} guardados con éxito!`);
  };

  // Selección individual y grupal
  const handleToggleSeleccionarItem = (id: string) => {
    setItemsSeleccionadosIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleToggleSeleccionarTodos = () => {
    if (itemsSeleccionadosIds.length === muestrasBorrador.length) {
      setItemsSeleccionadosIds([]);
    } else {
      setItemsSeleccionadosIds(muestrasBorrador.map(m => m.id));
    }
  };

  // RESPONDER INDIVIDUALMENTE POR INSUMO
  const handleResponderItemIndividual = (m: ItemMuestraAccesorio) => {
    if (!solicitudSeleccionada) return;
    const fechaHoy = new Date().toISOString().split('T')[0];

    const datosActualizados: Partial<ItemMuestraAccesorio> = {
      respondidoACompras: true,
      fechaRespuestaACompras: fechaHoy,
      fechaEntrega: m.fechaEntrega || fechaHoy,
      responsableLab: m.responsableLab || responsableLabInput || usuarioLogueadoNombre,
      dictamen: m.dictamen,
      resultado: m.resultado,
      observacion: m.observacion,
      accion: m.dictamen === 'APROBADO' ? 'Liberado para Confección' : 'Retenido / No conforme'
    };

    onActualizarItem(solicitudSeleccionada.id, m.id, datosActualizados);

    // Actualizar estado local
    setMuestrasBorrador(prev => prev.map(item => item.id === m.id ? { ...item, ...datosActualizados } : item));

    alert(`✓ Respuesta de Laboratorio enviada a Compras para el insumo [${m.referencia}]. Puedes ver o generar su Reporte Oficial de Evaluación.`);
  };

  // RESPONDER EN GRUPO (A LOS SELECCIONADOS)
  const handleResponderSeleccionados = () => {
    if (!solicitudSeleccionada || itemsSeleccionadosIds.length === 0) return;
    const fechaHoy = new Date().toISOString().split('T')[0];

    const nuevasMuestras = muestrasBorrador.map(m => {
      if (itemsSeleccionadosIds.includes(m.id)) {
        const datos = {
          ...m,
          respondidoACompras: true,
          fechaRespuestaACompras: fechaHoy,
          fechaEntrega: m.fechaEntrega || fechaHoy,
          responsableLab: m.responsableLab || responsableLabInput || usuarioLogueadoNombre,
          accion: m.dictamen === 'APROBADO' ? 'Liberado para Confección' : 'Retenido / No conforme'
        };
        onActualizarItem(solicitudSeleccionada.id, m.id, datos);
        return datos;
      }
      return m;
    });

    setMuestrasBorrador(nuevasMuestras);
    const cant = itemsSeleccionadosIds.length;
    setItemsSeleccionadosIds([]);

    alert(`✓ ¡Respuesta en grupo enviada a Compras para los ${cant} insumos seleccionados!`);
  };

  // RESPONDER EN GRUPO (A TODOS LOS INSUMOS)
  const handleResponderTodos = () => {
    if (!solicitudSeleccionada) return;
    const fechaHoy = new Date().toISOString().split('T')[0];

    const nuevasMuestras = muestrasBorrador.map(m => ({
      ...m,
      respondidoACompras: true,
      fechaRespuestaACompras: fechaHoy,
      fechaEntrega: m.fechaEntrega || fechaHoy,
      responsableLab: m.responsableLab || responsableLabInput || usuarioLogueadoNombre,
      accion: m.dictamen === 'APROBADO' ? 'Liberado para Confección' : 'Retenido / No conforme'
    }));

    onResponderSolicitud(solicitudSeleccionada.id, {
      observacionesLab: observacionesGeneralesLab || 'Revisión técnica de insumos completada.',
      responsable: responsableLabInput || usuarioLogueadoNombre,
      muestrasEvaluadas: nuevasMuestras
    });

    setMuestrasBorrador(nuevasMuestras);
    setItemsSeleccionadosIds([]);

    alert(`✓ ¡Respuesta oficial enviada a Compras para TODOS los ${muestrasBorrador.length} insumos de la solicitud ${solicitudSeleccionada.numeroSolicitud}!`);
  };

  // GUARDAR REPORTE INDIVIDUAL (DESDE EL MODAL)
  const handleGuardarReporteIndividual = (reporte: ReporteEvaluacionInsumoData) => {
    if (!solicitudSeleccionada || !itemParaReporte) return;
    const dictamenDerivado: DictamenType = reporte.calificacion === 'No aprobado' 
      ? 'RECHAZADO' 
      : reporte.calificacion === 'APROBADO CON NOVEDAD' 
      ? 'HALLAZGO' 
      : 'APROBADO';

    const datos = {
      reporteEvaluacion: reporte,
      observacion: reporte.hallazgos || itemParaReporte.observacion,
      dictamen: dictamenDerivado,
      resultado: reporte.calificacion
    };

    onActualizarItem(solicitudSeleccionada.id, itemParaReporte.id, datos);

    setMuestrasBorrador(prev => prev.map(m => m.id === itemParaReporte.id ? { ...m, ...datos } : m));

    alert(`¡Reporte Oficial de Evaluación guardado con éxito para [${itemParaReporte.referencia}]!`);
    setItemParaReporte(null);
  };

  // ENVIAR REPORTE INDIVIDUAL Y RESPUESTA A COMPRAS (DESDE EL MODAL)
  const handleEnviarReporteACompras = (reporte: ReporteEvaluacionInsumoData) => {
    if (!solicitudSeleccionada || !itemParaReporte) return;
    const fechaHoy = new Date().toISOString().split('T')[0];
    const dictamenDerivado: DictamenType = reporte.calificacion === 'No aprobado' 
      ? 'RECHAZADO' 
      : reporte.calificacion === 'APROBADO CON NOVEDAD' 
      ? 'HALLAZGO' 
      : 'APROBADO';

    const datos = {
      reporteEvaluacion: reporte,
      respondidoACompras: true,
      fechaRespuestaACompras: fechaHoy,
      fechaEntrega: fechaHoy,
      responsableLab: responsableLabInput || usuarioLogueadoNombre,
      observacion: reporte.hallazgos || itemParaReporte.observacion,
      dictamen: dictamenDerivado,
      resultado: reporte.calificacion,
      accion: dictamenDerivado === 'APROBADO' ? 'Liberado para Confección' : 'Retenido / No conforme'
    };

    onActualizarItem(solicitudSeleccionada.id, itemParaReporte.id, datos);

    setMuestrasBorrador(prev => prev.map(m => m.id === itemParaReporte.id ? { ...m, ...datos } : m));

    alert(`✓ ¡Reporte oficial y respuesta técnica enviada a Compras para [${itemParaReporte.referencia}]!`);
    setItemParaReporte(null);
  };

  // Enviar Respuesta definitiva general a Compras
  const handleEnviarRespuestaACompras = () => {
    handleResponderTodos();
  };

  // Aplicar Criterio desde la Guía Maestra a la muestra seleccionada
  const handleAplicarCriterioGuia = (criterio: GuiaMaestraInsumoItem) => {
    if (idxMuestraParaGuia !== null && muestrasBorrador[idxMuestraParaGuia]) {
      const textoDetallado = `[${criterio.insumo}] Verif: ${criterio.metodoVerificacion} • Criterio: ${criterio.criterioAceptacion}`;
      handleCambioMuestra(idxMuestraParaGuia, 'observacion', textoDetallado);
      handleCambioMuestra(idxMuestraParaGuia, 'resultado', 'OK');
      handleCambioMuestra(idxMuestraParaGuia, 'dictamen', 'APROBADO');
    }
    setModalGuiaMaestra(false);
    setIdxMuestraParaGuia(null);
  };

  return (
    <div className="space-y-5">
      
      {/* Sub-navegación entre Bandeja de Solicitudes y Tabla Maestra */}
      {!solicitudSeleccionada && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSubTabActiva('solicitudes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTabActiva === 'solicitudes'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-black'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Bandeja de Solicitudes ({solicitudesFiltradas.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTabActiva('tabla-maestra')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTabActiva === 'tabla-maestra'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-black'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Tabla Maestra: Guía de Ensayos (18 Insumos)</span>
              <span className="bg-amber-400/20 text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-amber-400/30 uppercase">
                Oficial
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 px-2 font-medium">
            {subTabActiva === 'solicitudes' ? (
              <span>Revisa y responde técnicamente a compras</span>
            ) : (
              <span>Criterios de tolerancia y métodos de verificación</span>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. VISTA BANDEJA GENERAL DE SOLICITUDES DE ACCESORIOS O TABLA MAESTRA     */}
      {/* ========================================================================= */}
      {!solicitudSeleccionada ? (
        subTabActiva === 'tabla-maestra' ? (
          <TablaMaestraInsumos />
        ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          
          {/* Encabezado de la Bandeja */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-purple-400" />
                  <span>Bandeja de Solicitudes: Laboratorio Insumos</span>
                </h3>
                <span className="text-xs bg-purple-500/20 text-purple-300 font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30">
                  {solicitudesFiltradas.length} Solicitudes Reales
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Solicitudes de insumos enviadas desde Compras para revisión y respuesta técnica.
              </p>
            </div>

            {/* Filtro Rápido por Estado */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">Estado:</span>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-purple-500"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="PENDIENTE">⚠️ Pendiente</option>
                <option value="OK">✅ Completada (OK)</option>
                <option value="NO OK">⚠️ Completada con NO OK</option>
              </select>
            </div>
          </div>

          {/* Buscador */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por # Solicitud, Insumo, Ref, Proveedor..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-inner"
            />
          </div>

          {/* Tabla de Solicitudes */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-lg">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#6ba3df] text-slate-950 font-black uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3.5">NÚMERO SOLICITUD</th>
                  <th className="py-3 px-3">FECHA SOLICITUD</th>
                  <th className="py-3 px-3">ÁREA SOLICITANTE</th>
                  <th className="py-3 px-3">REFERENCIAS / INSUMOS</th>
                  <th className="py-3 px-2 text-center">CANTIDAD</th>
                  <th className="py-3 px-3 text-center">PRIORIDAD</th>
                  <th className="py-3 px-3 text-center">ESTADO GENERAL</th>
                  <th className="py-3 px-3">RESPONSABLE</th>
                  <th className="py-3 px-3 text-center">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/80 font-medium">
                {solicitudesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      No se encontraron solicitudes de accesorios enviadas desde Compras.
                    </td>
                  </tr>
                ) : (
                  solicitudesFiltradas.map((sol) => {
                    const estGen = calcularEstadoGeneralSolicitud(sol.muestras || []);
                    const totalItems = sol.muestras?.length || 0;
                    const resumenRefs = (sol.muestras || []).map(m => m.referencia).slice(0, 3).join(', ') + (totalItems > 3 ? '...' : '');

                    return (
                      <tr key={sol.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3 px-3.5 font-mono font-black text-purple-300">
                          {sol.numeroSolicitud}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">{sol.fechaSolicitud}</td>
                        <td className="py-3 px-3 font-semibold text-slate-200">{sol.solicitante}</td>
                        <td className="py-3 px-3 text-slate-300 font-mono text-[11px] truncate max-w-[200px]" title={resumenRefs}>
                          {resumenRefs || 'Sin referencias'}
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-amber-300 font-mono">
                          {totalItems} líneas
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {sol.prioridad || 'Alta'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${estGen.color}`}>
                            {estGen.texto}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-purple-300">
                          {sol.responsableRespuestaLab || usuarioLogueadoNombre}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSolicitudSeleccionada(sol)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5 mx-auto"
                          >
                            <FlaskConical className="w-3.5 h-3.5" />
                            <span>Revisar ({totalItems})</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
        )
      ) : (
        /* ========================================================================= */
        /* 2. DETALLE COMPLETO Y REVISIÓN DE LA SOLICITUD SELECCIONADA               */
        /* ========================================================================= */
        <div className="space-y-5">
          
          {/* Barra de Navegación Superior */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
            <button
              type="button"
              onClick={() => setSolicitudSeleccionada(null)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-purple-400" />
              <span>Volver a la Bandeja de Insumos</span>
            </button>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setIdxMuestraParaGuia(null);
                  setModalGuiaMaestra(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>📘 Consultar Guía Maestra de Ensayos</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Estado General:</span>
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${calcularEstadoGeneralSolicitud(muestrasBorrador).color}`}>
                  {calcularEstadoGeneralSolicitud(muestrasBorrador).texto}
                </span>
              </div>
            </div>
          </div>

          {/* Bloque 1: Información de Compras */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>INFORMACIÓN DE COMPRAS • Solicitud: {solicitudSeleccionada.numeroSolicitud}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fecha Solicitud: <strong className="text-slate-200 font-mono">{solicitudSeleccionada.fechaSolicitud}</strong> • Solicitante: <strong className="text-slate-200">{solicitudSeleccionada.solicitante}</strong>
                </p>
              </div>

              {/* Botón Ver Solicitud Original */}
              {solicitudSeleccionada.documentoOriginal && (
                <button
                  type="button"
                  onClick={() => setModalDocumentoOriginal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-black transition-all shadow"
                >
                  <Eye className="w-4 h-4" />
                  <span>[ 📄 VER SOLICITUD ORIGINAL ]</span>
                </button>
              )}
            </div>

            {solicitudSeleccionada.observacionesGenerales && (
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                <span className="font-bold text-amber-300 block mb-0.5">Observaciones de Compras:</span>
                {solicitudSeleccionada.observacionesGenerales}
              </div>
            )}
          </div>

          {/* Bloque 2: Tabla de Accesorios Solicitados y Respuestas de Laboratorio */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>ACCESORIOS SOLICITADOS ({muestrasBorrador.length} Líneas)</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Responde a Compras de forma individual o en grupo, y genera el Reporte Oficial de Evaluación por cada insumo.
                </span>
              </div>

              {/* Botón rápido para consultar la guía maestra */}
              <button
                type="button"
                onClick={() => {
                  setIdxMuestraParaGuia(null);
                  setModalGuiaMaestra(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>📘 Guía Maestra (18 Insumos)</span>
              </button>
            </div>

            {/* Barra de Respuestas en Grupo / Selección Múltiple */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">Selección:</span>
                <span className="font-mono text-purple-300 font-bold">
                  {itemsSeleccionadosIds.length} de {muestrasBorrador.length} insumos seleccionados
                </span>
                {itemsSeleccionadosIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setItemsSeleccionadosIds([])}
                    className="text-[10px] text-slate-400 hover:text-slate-200 underline ml-1 cursor-pointer"
                  >
                    Limpiar selección
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {itemsSeleccionadosIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResponderSeleccionados}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Responder Seleccionados ({itemsSeleccionadosIds.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResponderTodos}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Responder Todo el Grupo ({muestrasBorrador.length})</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-inner">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-[#6ba3df] text-slate-950 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-2.5 text-center w-9">
                      <input
                        type="checkbox"
                        checked={itemsSeleccionadosIds.length === muestrasBorrador.length && muestrasBorrador.length > 0}
                        onChange={handleToggleSeleccionarTodos}
                        className="w-3.5 h-3.5 rounded cursor-pointer accent-purple-600"
                        title="Seleccionar / Deseleccionar todos"
                      />
                    </th>
                    <th className="py-2.5 px-2">#</th>
                    <th className="py-2.5 px-3">REFERENCIA</th>
                    <th className="py-2.5 px-3">DESCRIPCIÓN</th>
                    <th className="py-2.5 px-2 text-center">COLOR</th>
                    <th className="py-2.5 px-2 text-center">TALLA</th>
                    <th className="py-2.5 px-2 text-center">QTY</th>
                    <th className="py-2.5 px-3">RESULTADO</th>
                    <th className="py-2.5 px-3">OBSERVACIÓN / RESULTADO DETALLADO</th>
                    <th className="py-2.5 px-3">RESPONSABLE</th>
                    <th className="py-2.5 px-2 text-center">F. INGRESO</th>
                    <th className="py-2.5 px-2 text-center">F. ENTREGA</th>
                    <th className="py-2.5 px-3 text-center">ACCIONES / REPORTE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950 font-medium">
                  {muestrasBorrador.map((m, idx) => {
                    const esNoOk = m.dictamen === 'RECHAZADO';
                    const esOk = m.dictamen === 'APROBADO';
                    const esObs = m.dictamen === 'HALLAZGO';
                    const estaSeleccionado = itemsSeleccionadosIds.includes(m.id);

                    return (
                      <tr 
                        key={m.id || idx} 
                        className={`transition-colors hover:bg-slate-900/60 ${
                          estaSeleccionado ? 'bg-purple-950/20' : ''
                        }`}
                      >
                        {/* Checkbox de Selección */}
                        <td className="py-3 px-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={estaSeleccionado}
                            onChange={() => handleToggleSeleccionarItem(m.id)}
                            className="w-3.5 h-3.5 rounded cursor-pointer accent-purple-600"
                          />
                        </td>

                        <td className="py-3 px-2 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-3 px-3 font-mono font-black text-amber-300">
                          <div>
                            <span>{m.referencia}</span>
                            {m.respondidoACompras && (
                              <span className="block text-[9px] text-emerald-400 font-sans font-bold">
                                ✓ Respondido
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-200">{m.descripcionInsumo || 'Insumo'}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-300">{m.color}</td>
                        <td className="py-3 px-2 text-center font-mono text-slate-400">{m.talla}</td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-purple-300">{m.qty}</td>
                        
                        {/* Selector de Resultado */}
                        <td className="py-3 px-3 min-w-[130px]">
                          <select
                            value={
                              m.resultado === 'Rechazado' || m.dictamen === 'RECHAZADO' ? 'Rechazado' :
                              m.resultado === 'Novedad' || m.dictamen === 'HALLAZGO' ? 'Novedad' :
                              m.resultado === 'OK' || m.dictamen === 'APROBADO' ? 'OK' :
                              'Pendiente'
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              let dict: DictamenType = 'APROBADO';
                              if (val === 'Rechazado') dict = 'RECHAZADO';
                              else if (val === 'Novedad') dict = 'HALLAZGO';
                              else if (val === 'Pendiente') dict = 'PENDIENTE';
                              else if (val === 'OK') dict = 'APROBADO';
                              
                              handleCambioMuestra(idx, 'dictamen', dict);
                              handleCambioMuestra(idx, 'resultado', val);
                              handleCambioMuestra(idx, 'responsableLab', m.responsableLab || responsableLabInput || usuarioLogueadoNombre);
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-black focus:outline-none ${
                              esNoOk ? 'bg-rose-950/80 border-rose-500 text-rose-300' :
                              esObs ? 'bg-yellow-950/80 border-yellow-500 text-yellow-300' :
                              esOk ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' :
                              'bg-slate-900 border-slate-700 text-slate-300'
                            }`}
                          >
                            <option value="OK">OK</option>
                            <option value="Novedad">Novedad</option>
                            <option value="Rechazado">Rechazado</option>
                            <option value="Pendiente">Pendiente</option>
                          </select>
                        </td>

                        {/* Campo de Observación / Resultado Detallado */}
                        <td className="py-3 px-3 min-w-[260px]">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={m.observacion || m.resultado || ''}
                              onChange={(e) => {
                                handleCambioMuestra(idx, 'observacion', e.target.value);
                                handleCambioMuestra(idx, 'resultado', e.target.value);
                                handleCambioMuestra(idx, 'responsableLab', m.responsableLab || responsableLabInput || usuarioLogueadoNombre);
                              }}
                              placeholder="Ej: AJUSTE DEFICIENTE CON UN SELLADO DEBIL..."
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setIdxMuestraParaGuia(idx);
                                setModalGuiaMaestra(true);
                              }}
                              className="p-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                              title="Buscar y aplicar criterio de la Guía Maestra"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                            </button>
                          </div>
                        </td>

                        {/* Persona Responsable por Item */}
                        <td className="py-3 px-3 min-w-[150px]">
                          <input
                            type="text"
                            value={m.responsableLab || responsableLabInput || usuarioLogueadoNombre}
                            onChange={(e) => handleCambioMuestra(idx, 'responsableLab', e.target.value)}
                            placeholder={usuarioLogueadoNombre}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-purple-300 font-bold focus:outline-none focus:border-purple-500"
                            title="Usuario que ingresó / Evaluador responsable"
                          />
                        </td>

                        {/* Fecha Ingreso */}
                        <td className="py-3 px-2 text-center">
                          <input
                            type="date"
                            value={m.fechaIngreso || new Date().toISOString().split('T')[0]}
                            onChange={(e) => handleCambioMuestra(idx, 'fechaIngreso', e.target.value)}
                            className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-slate-300 font-mono"
                          />
                        </td>

                        {/* Fecha Entrega */}
                        <td className="py-3 px-2 text-center">
                          <input
                            type="date"
                            value={m.fechaEntrega || new Date().toISOString().split('T')[0]}
                            onChange={(e) => handleCambioMuestra(idx, 'fechaEntrega', e.target.value)}
                            className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-slate-300 font-mono"
                          />
                        </td>

                        {/* Acciones: Responder Individual & Ver/Generar Reporte */}
                        <td className="py-3 px-3 min-w-[210px] text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Botón Responder Individual */}
                            <button
                              type="button"
                              onClick={() => handleResponderItemIndividual(m)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-sm ${
                                m.respondidoACompras
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-purple-600 hover:bg-purple-500 text-white'
                              }`}
                              title="Enviar respuesta técnica a Compras para este insumo"
                            >
                              <Send className="w-3 h-3" />
                              <span>{m.respondidoACompras ? '✓ Respondido' : 'Responder'}</span>
                            </button>

                            {/* Botón Ver / Generar Reporte Individual */}
                            <button
                              type="button"
                              onClick={() => setItemParaReporte(m)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-sm ${
                                m.reporteEvaluacion
                                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'
                              }`}
                              title="Generar o Ver Reporte Oficial de Evaluación"
                            >
                              <FileText className="w-3 h-3" />
                              <span>{m.reporteEvaluacion ? '📄 Ver Reporte' : '📄 Generar Reporte'}</span>
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Metadatos Generales de la Respuesta (SIN PIN - Usuario en Sesión Directo) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-300 font-bold">Persona Responsable (Usuario en sesión):</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-purple-300 font-bold flex items-center justify-between text-xs">
                    <span>{responsableLabInput || usuarioLogueadoNombre}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      <span>Sesión Activa</span>
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  👤 Los ensayos y reportes son firmados por el analista autenticado en el sistema.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Observaciones Generales de Respuesta a Compras:</label>
                <input
                  type="text"
                  value={observacionesGeneralesLab}
                  onChange={(e) => setObservacionesGeneralesLab(e.target.value)}
                  placeholder="Ej: Lote revisado conforme. Listo para emisión de OC definitiva."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Puedes responder individualmente por insumo arriba, o responder todo el grupo aquí.
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleGuardarResultados}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 shadow cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>[ 💾 GUARDAR BORRADOR ]</span>
                </button>

                <button
                  type="button"
                  onClick={handleResponderTodos}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-black shadow-xl transition-all active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>[ 🚀 RESPONDER TODOS LOS INSUMOS A COMPRAS ]</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VER SOLICITUD ORIGINAL (DOCUMENTO / IMAGEN / EXCEL)                */}
      {/* ========================================================================= */}
      {modalDocumentoOriginal && solicitudSeleccionada?.documentoOriginal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 my-8 text-slate-100 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  Documento Original Enviado por Compras: {solicitudSeleccionada.numeroSolicitud}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalDocumentoOriginal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Tipo de Archivo: <strong>{solicitudSeleccionada.documentoOriginal.tipoArchivo}</strong></span>
                <span>Nombre: <strong className="text-amber-300 font-mono">{solicitudSeleccionada.documentoOriginal.nombreArchivo || 'Captura_Compras'}</strong></span>
              </div>

              {/* Si es imagen */}
              {solicitudSeleccionada.documentoOriginal.urlData && (
                <div className="text-center p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <img
                    src={solicitudSeleccionada.documentoOriginal.urlData}
                    alt="Documento original"
                    className="max-h-96 mx-auto rounded-lg shadow-lg border border-slate-700"
                  />
                </div>
              )}

              {/* Si es texto o tabla pegada */}
              {solicitudSeleccionada.documentoOriginal.contenidoTexto && (
                <div>
                  <span className="font-bold text-slate-400 block mb-1">Contenido Crudo Registrado:</span>
                  <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto max-h-60">
                    {solicitudSeleccionada.documentoOriginal.contenidoTexto}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalDocumentoOriginal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                Cerrar Documento
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Guía Maestra de Ensayos */}
      {modalGuiaMaestra && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl animate-fade-in my-6 max-h-[92vh] overflow-y-auto">
            <TablaMaestraInsumos
              esModal={true}
              onCerrarModal={() => {
                setModalGuiaMaestra(false);
                setIdxMuestraParaGuia(null);
              }}
              onSeleccionarCriterio={handleAplicarCriterioGuia}
            />
          </div>
        </div>
      )}

      {/* Modal Reporte Oficial de Evaluación de Insumo Individual */}
      {itemParaReporte && solicitudSeleccionada && (
        <ReporteEvaluacionInsumoModal
          solicitud={solicitudSeleccionada}
          item={itemParaReporte}
          usuarioLogueadoNombre={usuarioLogueadoNombre}
          onGuardarReporte={handleGuardarReporteIndividual}
          onEnviarACompras={handleEnviarReporteACompras}
          onCerrar={() => setItemParaReporte(null)}
        />
      )}

    </div>
  );
};
