import React, { useState } from 'react';
import { 
  ReporteEvaluacionInsumoData, 
  ItemMuestraAccesorio, 
  SolicitudAccesoriosCompleta,
  ReporteSeguimientoAccion 
} from '../../types';
import { 
  Printer, 
  Save, 
  X, 
  Check, 
  Plus, 
  Trash2, 
  Camera, 
  Image as ImageIcon, 
  FileText,
  Building2,
  Calendar,
  UserCheck,
  Send
} from 'lucide-react';

interface ReporteEvaluacionInsumoModalProps {
  solicitud: SolicitudAccesoriosCompleta;
  item: ItemMuestraAccesorio;
  usuarioLogueadoNombre: string;
  onGuardarReporte: (reporte: ReporteEvaluacionInsumoData) => void;
  onCerrar: () => void;
  onEnviarACompras?: (reporte: ReporteEvaluacionInsumoData) => void;
}

export const ReporteEvaluacionInsumoModal: React.FC<ReporteEvaluacionInsumoModalProps> = ({
  solicitud,
  item,
  usuarioLogueadoNombre,
  onGuardarReporte,
  onCerrar,
  onEnviarACompras
}) => {
  const hoyStr = new Date().toISOString().split('T')[0];

  // Helper para determinar la calificación predeterminada según el dictamen
  const califPredeterminada = (): 'Aprobado' | 'APROBADO CON NOVEDAD' | 'No aprobado' | 'Otro' => {
    if (item.dictamen === 'RECHAZADO' || item.resultado === 'Rechazado' || item.resultado === 'NO OK') return 'No aprobado';
    if (item.dictamen === 'HALLAZGO' || item.resultado === 'Novedad' || item.resultado === 'OK CON OBSERVACIÓN') return 'APROBADO CON NOVEDAD';
    return 'Aprobado';
  };

  // Estado del reporte (inicializado si ya existía o con los datos del item)
  const repExistente = item.reporteEvaluacion;

  const [etapaMuestra, setEtapaMuestra] = useState<'PP' | 'SHP' | 'MI'>(repExistente?.etapaMuestra || 'PP');
  const [proveedor, setProveedor] = useState(repExistente?.proveedor || solicitud.proveedor || 'PROVEEDOR GENERAL');
  const [oc, setOc] = useState(repExistente?.oc || solicitud.numeroSolicitud || 'N/A');
  const [origen, setOrigen] = useState(repExistente?.origen || 'NACIONAL');
  const [fechaRecibidoContraMuestra, setFechaRecibidoContraMuestra] = useState(repExistente?.fechaRecibidoContraMuestra || hoyStr);

  // 1. Información del Insumo y Proveedor
  const [fechaRecepcion, setFechaRecepcion] = useState(repExistente?.fechaRecepcion || item.fechaIngreso || hoyStr);
  const [referencia, setReferencia] = useState(repExistente?.referencia || item.referencia || '');
  const [nombreInsumo, setNombreInsumo] = useState(repExistente?.nombreInsumo || item.descripcionInsumo || 'Insumo Textil');
  const [loteOC, setLoteOC] = useState(repExistente?.loteOC || solicitud.numeroSolicitud || 'N/A');
  const [cantidadRevisada, setCantidadRevisada] = useState(repExistente?.cantidadRevisada || item.qty || '1');
  const [fechaRevision, setFechaRevision] = useState(repExistente?.fechaRevision || item.fechaRevision || hoyStr);
  const [fechaEntrega, setFechaEntrega] = useState(repExistente?.fechaEntrega || item.fechaEntrega || hoyStr);

  const [muestraFisicaAprobada, setMuestraFisicaAprobada] = useState(repExistente?.muestraFisicaAprobada || 'SÍ');
  const [colorTono, setColorTono] = useState(repExistente?.colorTono || item.color || '');
  const [cantidadRecibida, setCantidadRecibida] = useState(repExistente?.cantidadRecibida || item.qty || '1');
  const [unidadMedida, setUnidadMedida] = useState<'Metros' | 'Unidades' | 'Kg' | string>(repExistente?.unidadMedida || 'Unidades');
  const [tallas, setTallas] = useState(repExistente?.tallas || item.talla || 'U');
  const [fichaTecnicaProveedor, setFichaTecnicaProveedor] = useState(repExistente?.fichaTecnicaProveedor || 'SÍ (Adjunta)');

  // 2. Clasificación del Defecto / Hallazgo
  const [defectos, setDefectos] = useState(repExistente?.defectos || {
    solidez: false,
    diferenciaColorTono: false,
    defectosTejeduriaTrama: false,
    insumoTrozadoQuebrado: false,
    insumoNoConcuerdaMuestraFisica: false,
    incompleto: item.incompleto || false,
    durezaFirmeza: false,
    medidaAnchoLargo: false,
    medidaAncho: '',
    medidaLargo: '',
    manchasCintasImpurezas: false,
    aparienciaSinRayonesDeformaciones: false,
    resistenciaCalidadDeficiente: false,
    otro: false,
    otroTexto: ''
  });

  // 3. Descripción Detallada y Hallazgos
  const [descripcionDetallada, setDescripcionDetallada] = useState(
    repExistente?.descripcionDetallada || 
    `Insumo: ${item.descripcionInsumo || 'Accesorio textil'} | Ref: ${item.referencia} | Color: ${item.color} | Talla: ${item.talla} | Cant: ${item.qty}`
  );
  const [hallazgos, setHallazgos] = useState(
    repExistente?.hallazgos || 
    item.observacion || item.resultado || 'Ensayos y verificación de laboratorio realizados según especificación técnica.'
  );

  // 4. Registro Fotográfico
  const [registroFotografico, setRegistroFotografico] = useState<string[]>(repExistente?.registroFotografico || []);
  const [fotoUrlInput, setFotoUrlInput] = useState('');

  // 5. Calificación
  const [calificacion, setCalificacion] = useState<'Aprobado' | 'APROBADO CON NOVEDAD' | 'No aprobado' | 'Otro'>(
    repExistente?.calificacion || califPredeterminada()
  );
  const [calificacionOtroTexto, setCalificacionOtroTexto] = useState(repExistente?.calificacionOtroTexto || '');

  // 6. Seguimiento y Acciones
  const [seguimientoAcciones, setSeguimientoAcciones] = useState<ReporteSeguimientoAccion[]>(
    repExistente?.seguimientoAcciones || [
      {
        id: 'seg-1',
        fecha: hoyStr,
        responsable: item.responsableLab || usuarioLogueadoNombre,
        accionDecision: item.dictamen === 'RECHAZADO' ? 'Rechazo técnico del lote de insumos' : 'Aprobación para producción',
        estado: item.dictamen === 'RECHAZADO' ? 'En proceso' : 'Cerrado',
        fechaCierre: hoyStr,
        observaciones: item.observacion || 'Revisión final de laboratorio completada.'
      }
    ]
  );

  // 7. Control
  const [control, setControl] = useState(repExistente?.control || {
    elaboroReviso: {
      nombre: item.responsableLab || usuarioLogueadoNombre,
      cargo: 'Revisor Laboratorio Textil',
      fecha: hoyStr
    },
    notificadoA1: {
      nombre: 'Edwin Diaz',
      cargo: 'Calidad Materias Primas - Insumos',
      fecha: hoyStr
    },
    notificadoA2: {
      nombre: 'Hector Ariel Ramirez',
      cargo: 'Jefe Compras y Desarrollo insumos',
      fecha: hoyStr
    }
  });

  const toggleDefecto = (key: keyof typeof defectos) => {
    setDefectos(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAgregarFoto = () => {
    if (!fotoUrlInput.trim()) return;
    setRegistroFotografico(prev => [...prev, fotoUrlInput.trim()]);
    setFotoUrlInput('');
  };

  const handleEliminarFoto = (idx: number) => {
    setRegistroFotografico(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubirArchivoFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        const base64 = uploadEvt.target?.result as string;
        if (base64) {
          setRegistroFotografico(prev => [...prev, base64]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAgregarFilaSeguimiento = () => {
    setSeguimientoAcciones(prev => [
      ...prev,
      {
        id: `seg-${Date.now()}`,
        fecha: hoyStr,
        responsable: usuarioLogueadoNombre,
        accionDecision: '',
        estado: 'Abierto',
        fechaCierre: '',
        observaciones: ''
      }
    ]);
  };

  const handleEliminarFilaSeguimiento = (idx: number) => {
    setSeguimientoAcciones(prev => prev.filter((_, i) => i !== idx));
  };

  const handleModificarSeguimiento = (idx: number, campo: keyof ReporteSeguimientoAccion, valor: any) => {
    setSeguimientoAcciones(prev => prev.map((s, i) => i === idx ? { ...s, [campo]: valor } : s));
  };

  const construirDataReporte = (): ReporteEvaluacionInsumoData => {
    return {
      solicitudId: solicitud.id,
      numeroSolicitud: solicitud.numeroSolicitud,
      itemId: item.id,
      etapaMuestra,
      proveedor,
      oc,
      origen,
      fechaRecibidoContraMuestra,
      fechaRecepcion,
      referencia,
      nombreInsumo,
      loteOC,
      cantidadRevisada,
      fechaRevision,
      fechaEntrega,
      muestraFisicaAprobada,
      colorTono,
      cantidadRecibida,
      unidadMedida,
      tallas,
      fichaTecnicaProveedor,
      defectos,
      descripcionDetallada,
      hallazgos,
      registroFotografico,
      calificacion,
      calificacionOtroTexto,
      seguimientoAcciones,
      control
    };
  };

  const handleGuardar = () => {
    const rep = construirDataReporte();
    onGuardarReporte(rep);
  };

  const handleEnviar = () => {
    const rep = construirDataReporte();
    if (onEnviarACompras) {
      onEnviarACompras(rep);
    } else {
      onGuardarReporte(rep);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white text-slate-900 border border-slate-300 rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl animate-fade-in my-4 max-h-[94vh] overflow-y-auto print:max-h-none print:overflow-visible print:border-none print:shadow-none print:m-0 print:p-0">
        
        {/* Barra superior de herramientas (oculta al imprimir) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-xl">
              REPORTE INDIVIDUAL • {item.referencia}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Solicitud: <strong className="text-slate-800 font-mono">{solicitud.numeroSolicitud}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleImprimir}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-300"
              title="Imprimir o Guardar como PDF"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleGuardar}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              title="Guardar Datos del Reporte"
            >
              <Save className="w-4 h-4" />
              <span>Guardar</span>
            </button>

            <button
              type="button"
              onClick={handleEnviar}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-md"
              title="Enviar respuesta a Compras"
            >
              <Send className="w-4 h-4" />
              <span>Responder a Compras</span>
            </button>

            <button
              type="button"
              onClick={onCerrar}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DOCUMENTO OFICIAL: CALIDAD MATERIAS PRIMAS - REPORTE DE EVALUACIÓN INSUMOS*/}
        {/* ========================================================================= */}
        <div className="border-2 border-slate-900 text-slate-900 bg-white font-sans text-xs print:text-[11px] leading-tight">
          
          {/* ENCABEZADO PRINCIPAL */}
          <div className="text-center py-2.5 px-4 border-b-2 border-slate-900 bg-slate-50">
            <h1 className="text-sm sm:text-base font-black tracking-wide uppercase">
              CALIDAD MATERIAS PRIMAS - LABORATORIO TEXTIL
            </h1>
            <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase mt-0.5 text-slate-800">
              REPORTE DE EVALUACIÓN – INSUMOS
            </h2>
          </div>

          {/* BARRA SUPERIOR: PP / SHP / MI / PROVEEDOR / OC / ORIGEN / FECHA RECIBIDO */}
          <div className="grid grid-cols-12 border-b-2 border-slate-900 text-center font-bold">
            <div className="col-span-1 border-r border-slate-900 p-1.5 flex flex-col justify-center items-center bg-slate-100">
              <span className="text-[10px] block">PP</span>
              <input
                type="radio"
                name="etapaMuestra"
                checked={etapaMuestra === 'PP'}
                onChange={() => setEtapaMuestra('PP')}
                className="w-3.5 h-3.5 mt-0.5 cursor-pointer"
              />
            </div>
            <div className="col-span-1 border-r border-slate-900 p-1.5 flex flex-col justify-center items-center bg-slate-100">
              <span className="text-[10px] block">SHP</span>
              <input
                type="radio"
                name="etapaMuestra"
                checked={etapaMuestra === 'SHP'}
                onChange={() => setEtapaMuestra('SHP')}
                className="w-3.5 h-3.5 mt-0.5 cursor-pointer"
              />
            </div>
            <div className="col-span-1 border-r border-slate-900 p-1.5 flex flex-col justify-center items-center bg-slate-100">
              <span className="text-[10px] block">MI</span>
              <input
                type="radio"
                name="etapaMuestra"
                checked={etapaMuestra === 'MI'}
                onChange={() => setEtapaMuestra('MI')}
                className="w-3.5 h-3.5 mt-0.5 cursor-pointer"
              />
            </div>
            <div className="col-span-3 border-r border-slate-900 p-1.5 text-left">
              <span className="text-[9px] uppercase text-slate-500 block">PROVEEDOR</span>
              <input
                type="text"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                className="w-full font-black text-slate-900 bg-transparent outline-none uppercase text-xs"
              />
            </div>
            <div className="col-span-2 border-r border-slate-900 p-1.5 text-left">
              <span className="text-[9px] uppercase text-slate-500 block">OC</span>
              <input
                type="text"
                value={oc}
                onChange={(e) => setOc(e.target.value)}
                className="w-full font-mono font-bold text-slate-900 bg-transparent outline-none text-xs"
              />
            </div>
            <div className="col-span-2 border-r border-slate-900 p-1.5 text-left">
              <span className="text-[9px] uppercase text-slate-500 block">ORIGEN</span>
              <input
                type="text"
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                className="w-full font-bold text-slate-900 bg-transparent outline-none uppercase text-xs"
              />
            </div>
            <div className="col-span-2 p-1.5 text-left">
              <span className="text-[8px] uppercase text-slate-500 block leading-none">FECHA RECIBIDO CONTRA MUESTRA</span>
              <input
                type="date"
                value={fechaRecibidoContraMuestra}
                onChange={(e) => setFechaRecibidoContraMuestra(e.target.value)}
                className="w-full font-mono font-bold text-slate-900 bg-transparent outline-none text-[11px]"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 1. INFORMACIÓN DEL INSUMO Y PROVEEDOR                                     */}
          {/* ========================================================================= */}
          <div className="bg-[#b9d2ea] text-slate-950 font-black px-3 py-1 border-b border-slate-900 uppercase text-[11px]">
            1. INFORMACIÓN DEL INSUMO Y PROVEEDOR
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-900 border-b-2 border-slate-900 text-[11px]">
            
            {/* Columna Izquierda */}
            <div className="divide-y divide-slate-300">
              <div className="grid grid-cols-3 p-1.5">
                <span className="font-bold text-slate-700">Fecha de recepción</span>
                <input
                  type="date"
                  value={fechaRecepcion}
                  onChange={(e) => setFechaRecepcion(e.target.value)}
                  className="col-span-2 font-mono font-bold bg-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-3 p-1.5">
                <span className="font-bold text-slate-700">Referencia / Código</span>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="col-span-2 font-black font-mono bg-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-3 p-1.5">
                <span className="font-bold text-slate-700">Nombre del insumo</span>
                <input
                  type="text"
                  value={nombreInsumo}
                  onChange={(e) => setNombreInsumo(e.target.value)}
                  className="col-span-2 font-bold bg-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-3 p-1.5">
                <span className="font-bold text-slate-700">Lote / Orden de compra</span>
                <input
                  type="text"
                  value={loteOC}
                  onChange={(e) => setLoteOC(e.target.value)}
                  className="col-span-2 font-bold bg-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-3 p-1.5">
                <span className="font-bold text-slate-700">Cantidad revisada</span>
                <input
                  type="text"
                  value={cantidadRevisada}
                  onChange={(e) => setCantidadRevisada(e.target.value)}
                  className="col-span-2 font-bold bg-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-3 p-1.5">
                <span className="font-bold text-slate-700">Fecha de revisión</span>
                <input
                  type="date"
                  value={fechaRevision}
                  onChange={(e) => setFechaRevision(e.target.value)}
                  className="col-span-2 font-mono font-bold bg-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-3 p-1.5">
                <span className="font-bold text-slate-700">Fecha de entrega</span>
                <input
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  className="col-span-2 font-mono font-bold bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="divide-y divide-slate-300">
              <div className="grid grid-cols-3 p-1.5">
                <span className="font-bold text-slate-700">Muestra física aprobada</span>
                <input
                  type="text"
                  value={muestraFisicaAprobada}
                  onChange={(e) => setMuestraFisicaAprobada(e.target.value)}
                  className="col-span-2 font-bold bg-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-3 p-1.5">
                <span className="font-bold text-slate-700">Color / Tono</span>
                <input
                  type="text"
                  value={colorTono}
                  onChange={(e) => setColorTono(e.target.value)}
                  className="col-span-2 font-bold bg-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-3 p-1.5">
                <span className="font-bold text-slate-700">Lote / Orden de compra</span>
                <input
                  type="text"
                  value={loteOC}
                  onChange={(e) => setLoteOC(e.target.value)}
                  className="col-span-2 font-bold bg-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-3 p-1.5">
                <span className="font-bold text-slate-700">Cantidad recibida</span>
                <input
                  type="text"
                  value={cantidadRecibida}
                  onChange={(e) => setCantidadRecibida(e.target.value)}
                  className="col-span-2 font-bold bg-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-3 p-1.5 items-center">
                <span className="font-bold text-slate-700">Unidad de medida</span>
                <div className="col-span-2 flex items-center gap-3">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="unidadMedida"
                      checked={unidadMedida === 'Metros'}
                      onChange={() => setUnidadMedida('Metros')}
                      className="cursor-pointer"
                    />
                    <span>Metros</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="unidadMedida"
                      checked={unidadMedida === 'Unidades'}
                      onChange={() => setUnidadMedida('Unidades')}
                      className="cursor-pointer"
                    />
                    <span>Unidades</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="unidadMedida"
                      checked={unidadMedida === 'Kg'}
                      onChange={() => setUnidadMedida('Kg')}
                      className="cursor-pointer"
                    />
                    <span>Kg</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 p-1.5">
                <span className="font-bold text-slate-700">Tallas</span>
                <input
                  type="text"
                  value={tallas}
                  onChange={(e) => setTallas(e.target.value)}
                  className="col-span-2 font-bold bg-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-3 p-1.5">
                <span className="font-bold text-slate-700">Ficha técnica -proveedor</span>
                <input
                  type="text"
                  value={fichaTecnicaProveedor}
                  onChange={(e) => setFichaTecnicaProveedor(e.target.value)}
                  className="col-span-2 font-bold bg-transparent outline-none"
                />
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 2. CLASIFICACIÓN DEL DEFECTO / HALLAZGO                                   */}
          {/* ========================================================================= */}
          <div className="bg-[#b9d2ea] text-slate-950 font-black px-3 py-1 border-b border-slate-900 uppercase text-[11px]">
            2. CLASIFICACIÓN DEL DEFECTO / HALLAZGO
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-900 border-b-2 border-slate-900 p-2.5 text-[11px] gap-y-1">
            
            {/* Columna Izquierda de Checkboxes */}
            <div className="space-y-1.5 pr-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={defectos.solidez}
                  onChange={() => toggleDefecto('solidez')}
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span className={defectos.solidez ? 'font-black text-rose-700' : ''}>Solidez</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={defectos.diferenciaColorTono}
                  onChange={() => toggleDefecto('diferenciaColorTono')}
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span className={defectos.diferenciaColorTono ? 'font-black text-rose-700' : ''}>Diferencia de color / tono</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={defectos.defectosTejeduriaTrama}
                  onChange={() => toggleDefecto('defectosTejeduriaTrama')}
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span className={defectos.defectosTejeduriaTrama ? 'font-black text-rose-700' : ''}>Defectos de tejeduría / trama</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={defectos.insumoTrozadoQuebrado}
                  onChange={() => toggleDefecto('insumoTrozadoQuebrado')}
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span className={defectos.insumoTrozadoQuebrado ? 'font-black text-rose-700' : ''}>Insumo trozado / quebrado</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={defectos.insumoNoConcuerdaMuestraFisica}
                  onChange={() => toggleDefecto('insumoNoConcuerdaMuestraFisica')}
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span className={defectos.insumoNoConcuerdaMuestraFisica ? 'font-black text-rose-700' : ''}>Insumo no concuerda con la M. física</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={defectos.incompleto}
                  onChange={() => toggleDefecto('incompleto')}
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span className={defectos.incompleto ? 'font-black text-rose-700' : ''}>Incompleto</span>
              </label>
            </div>

            {/* Columna Derecha de Checkboxes */}
            <div className="space-y-1.5 pl-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={defectos.durezaFirmeza}
                  onChange={() => toggleDefecto('durezaFirmeza')}
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span className={defectos.durezaFirmeza ? 'font-black text-rose-700' : ''}>Dureza-firmeza</span>
              </label>

              <div className="flex items-center gap-2 flex-wrap">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={defectos.medidaAnchoLargo}
                    onChange={() => toggleDefecto('medidaAnchoLargo')}
                    className="w-3.5 h-3.5 rounded cursor-pointer"
                  />
                  <span>Medida / ancho</span>
                </label>
                <input
                  type="text"
                  placeholder="ancho..."
                  value={defectos.medidaAncho || ''}
                  onChange={(e) => setDefectos(prev => ({ ...prev, medidaAncho: e.target.value }))}
                  className="w-20 px-1 border-b border-slate-400 bg-transparent text-[11px] outline-none"
                />
                <span className="ml-2 font-bold">Medida/Largo</span>
                <input
                  type="text"
                  placeholder="largo..."
                  value={defectos.medidaLargo || ''}
                  onChange={(e) => setDefectos(prev => ({ ...prev, medidaLargo: e.target.value }))}
                  className="w-20 px-1 border-b border-slate-400 bg-transparent text-[11px] outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={defectos.manchasCintasImpurezas}
                  onChange={() => toggleDefecto('manchasCintasImpurezas')}
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span className={defectos.manchasCintasImpurezas ? 'font-black text-rose-700' : ''}>Manchas / cintas / impurezas</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={defectos.aparienciaSinRayonesDeformaciones}
                  onChange={() => toggleDefecto('aparienciaSinRayonesDeformaciones')}
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span className={defectos.aparienciaSinRayonesDeformaciones ? 'font-black text-rose-700' : ''}>Apariencia Sin rayones /deformaciones</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={defectos.resistenciaCalidadDeficiente}
                  onChange={() => toggleDefecto('resistenciaCalidadDeficiente')}
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                />
                <span className={defectos.resistenciaCalidadDeficiente ? 'font-black text-rose-700' : ''}>Resistencia / calidad deficiente</span>
              </label>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={defectos.otro}
                    onChange={() => toggleDefecto('otro')}
                    className="w-3.5 h-3.5 rounded cursor-pointer"
                  />
                  <span>Otro:</span>
                </label>
                <input
                  type="text"
                  value={defectos.otroTexto || ''}
                  onChange={(e) => setDefectos(prev => ({ ...prev, otroTexto: e.target.value, otro: true }))}
                  className="flex-1 border-b border-slate-400 bg-transparent text-[11px] outline-none"
                  placeholder="especifique otro hallazgo..."
                />
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 3. DESCRIPCIÓN DETALLADA DEL PRODUCTO & HALLAZGOS                         */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 divide-x divide-slate-900 border-b-2 border-slate-900">
            <div className="bg-[#b9d2ea] text-slate-950 font-black px-3 py-1 uppercase text-[11px] text-center">
              3. DESCRIPCIÓN DETALLADA DEL PRODUCTO
            </div>
            <div className="bg-[#b9d2ea] text-slate-950 font-black px-3 py-1 uppercase text-[11px] text-center">
              HALLAZGOS
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-900 border-b-2 border-slate-900">
            <div className="p-2">
              <textarea
                rows={4}
                value={descripcionDetallada}
                onChange={(e) => setDescripcionDetallada(e.target.value)}
                className="w-full h-full p-1 bg-transparent border-0 resize-none outline-none font-medium text-[11px] leading-relaxed"
                placeholder="Descripción técnica del insumo, material, dimensiones..."
              />
            </div>
            <div className="p-2">
              <textarea
                rows={4}
                value={hallazgos}
                onChange={(e) => setHallazgos(e.target.value)}
                className="w-full h-full p-1 bg-transparent border-0 resize-none outline-none font-medium text-[11px] leading-relaxed text-slate-800"
                placeholder="Hallazgos del laboratorio, discrepancias con la muestra física o conformidad..."
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. REGISTRO FOTOGRÁFICO / MUESTRA FÍSICO-VISUAL                           */}
          {/* ========================================================================= */}
          <div className="bg-[#b9d2ea] text-slate-950 font-black px-3 py-1 border-b border-slate-900 uppercase text-[11px]">
            4. REGISTRO FOTOGRÁFICO / MUESTRA FÍSICO-VISUAL
          </div>

          <div className="p-3 border-b-2 border-slate-900 min-h-[140px] bg-slate-50/50">
            {registroFotografico.length === 0 ? (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center space-y-2">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-slate-500 text-xs">Sin registros fotográficos adjuntos</p>
                <div className="flex items-center justify-center gap-2 print:hidden">
                  <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Subir Foto de Muestra</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSubirArchivoFoto}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {registroFotografico.map((url, i) => (
                    <div key={i} className="relative group rounded-xl border border-slate-300 overflow-hidden bg-white shadow-sm">
                      <img
                        src={url}
                        alt={`Muestra ${i + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleEliminarFoto(i)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer print:hidden"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 print:hidden pt-2">
                  <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Agregar Otra Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSubirArchivoFoto}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 5. CALIFICACIÓN DEL INSUMO                                                */}
          {/* ========================================================================= */}
          <div className="bg-[#b9d2ea] text-slate-950 font-black px-3 py-1 border-b border-slate-900 uppercase text-[11px]">
            5. CALIFICACIÓN DEL INSUMO
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 border-b-2 border-slate-900 text-xs font-bold items-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="calificacionInsumo"
                checked={calificacion === 'Aprobado'}
                onChange={() => setCalificacion('Aprobado')}
                className="w-4 h-4 cursor-pointer text-emerald-600"
              />
              <span className={calificacion === 'Aprobado' ? 'text-emerald-700 font-black' : ''}>Aprobado</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="calificacionInsumo"
                checked={calificacion === 'APROBADO CON NOVEDAD'}
                onChange={() => setCalificacion('APROBADO CON NOVEDAD')}
                className="w-4 h-4 cursor-pointer text-amber-600"
              />
              <span className={calificacion === 'APROBADO CON NOVEDAD' ? 'text-amber-700 font-black' : ''}>APROBADO CON NOVEDAD</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="calificacionInsumo"
                checked={calificacion === 'No aprobado'}
                onChange={() => setCalificacion('No aprobado')}
                className="w-4 h-4 cursor-pointer text-rose-600"
              />
              <span className={calificacion === 'No aprobado' ? 'text-rose-700 font-black' : ''}>No aprobado</span>
            </label>

            <div className="flex items-center gap-1.5">
              <label className="flex items-center gap-1 cursor-pointer select-none shrink-0">
                <input
                  type="radio"
                  name="calificacionInsumo"
                  checked={calificacion === 'Otro'}
                  onChange={() => setCalificacion('Otro')}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>Otro:</span>
              </label>
              <input
                type="text"
                value={calificacionOtroTexto}
                onChange={(e) => {
                  setCalificacionOtroTexto(e.target.value);
                  setCalificacion('Otro');
                }}
                className="flex-1 border-b border-slate-400 bg-transparent text-xs outline-none"
                placeholder="especifique..."
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 6. SEGUIMIENTO Y ACCIONES                                                 */}
          {/* ========================================================================= */}
          <div className="bg-[#b9d2ea] text-slate-950 font-black px-3 py-1 border-b border-slate-900 uppercase text-[11px] flex items-center justify-between">
            <span>6. SEGUIMIENTO Y ACCIONES</span>
            <button
              type="button"
              onClick={handleAgregarFilaSeguimiento}
              className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-bold print:hidden hover:bg-slate-800 cursor-pointer"
            >
              + Agregar Acción
            </button>
          </div>

          <div className="border-b-2 border-slate-900 overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-900 text-slate-800 font-bold text-center">
                  <th className="p-1.5 border-r border-slate-900 w-24">Fecha</th>
                  <th className="p-1.5 border-r border-slate-900 w-36">Responsable</th>
                  <th className="p-1.5 border-r border-slate-900">Acción / decisión</th>
                  <th className="p-1.5 border-r border-slate-900 w-44">Estado</th>
                  <th className="p-1.5 border-r border-slate-900 w-24">Fecha de cierre</th>
                  <th className="p-1.5">Observaciones</th>
                  <th className="p-1.5 w-8 print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {seguimientoAcciones.map((acc, idx) => (
                  <tr key={acc.id || idx}>
                    <td className="p-1 border-r border-slate-900">
                      <input
                        type="date"
                        value={acc.fecha}
                        onChange={(e) => handleModificarSeguimiento(idx, 'fecha', e.target.value)}
                        className="w-full font-mono bg-transparent outline-none text-[10px]"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-900">
                      <input
                        type="text"
                        value={acc.responsable}
                        onChange={(e) => handleModificarSeguimiento(idx, 'responsable', e.target.value)}
                        className="w-full font-bold bg-transparent outline-none text-[11px]"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-900">
                      <input
                        type="text"
                        value={acc.accionDecision}
                        onChange={(e) => handleModificarSeguimiento(idx, 'accionDecision', e.target.value)}
                        className="w-full bg-transparent outline-none text-[11px]"
                        placeholder="Acción tomada..."
                      />
                    </td>
                    <td className="p-1 border-r border-slate-900">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <label className="flex items-center gap-0.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`estadoAcc-${idx}`}
                            checked={acc.estado === 'Abierto'}
                            onChange={() => handleModificarSeguimiento(idx, 'estado', 'Abierto')}
                          />
                          <span>Abierto</span>
                        </label>
                        <label className="flex items-center gap-0.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`estadoAcc-${idx}`}
                            checked={acc.estado === 'En proceso'}
                            onChange={() => handleModificarSeguimiento(idx, 'estado', 'En proceso')}
                          />
                          <span>En proceso</span>
                        </label>
                        <label className="flex items-center gap-0.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`estadoAcc-${idx}`}
                            checked={acc.estado === 'Cerrado'}
                            onChange={() => handleModificarSeguimiento(idx, 'estado', 'Cerrado')}
                          />
                          <span>Cerrado</span>
                        </label>
                      </div>
                    </td>
                    <td className="p-1 border-r border-slate-900">
                      <input
                        type="date"
                        value={acc.fechaCierre}
                        onChange={(e) => handleModificarSeguimiento(idx, 'fechaCierre', e.target.value)}
                        className="w-full font-mono bg-transparent outline-none text-[10px]"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={acc.observaciones}
                        onChange={(e) => handleModificarSeguimiento(idx, 'observaciones', e.target.value)}
                        className="w-full bg-transparent outline-none text-[11px]"
                        placeholder="Observaciones..."
                      />
                    </td>
                    <td className="p-1 text-center print:hidden">
                      {seguimientoAcciones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleEliminarFilaSeguimiento(idx)}
                          className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ========================================================================= */}
          {/* 7. CONTROL (FIRMAS)                                                       */}
          {/* ========================================================================= */}
          <div className="bg-[#b9d2ea] text-slate-950 font-black px-3 py-1 border-b border-slate-900 uppercase text-[11px]">
            7. Control
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-900 text-[11px]">
            
            {/* Columna 1: ELABORÓ Y REVISÓ */}
            <div className="p-3 flex flex-col justify-between min-h-[110px]">
              <div>
                <div className="font-black text-slate-900 uppercase text-[10px] mb-1">
                  ELABORÓ Y REVISÓ
                </div>
                <div className="text-slate-600 font-medium">Revisor</div>
                <div className="font-bold text-slate-900">Laboratorio Textil</div>
                <div className="font-extrabold text-blue-900 mt-1">
                  {control.elaboroReviso.nombre || usuarioLogueadoNombre}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-300 mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Fecha:</span>
                <input
                  type="date"
                  value={control.elaboroReviso.fecha}
                  onChange={(e) => setControl(prev => ({
                    ...prev,
                    elaboroReviso: { ...prev.elaboroReviso, fecha: e.target.value }
                  }))}
                  className="font-mono bg-transparent outline-none text-[10px]"
                />
              </div>
            </div>

            {/* Columna 2: NOTIFICADO A (Edwin Diaz) */}
            <div className="p-3 flex flex-col justify-between min-h-[110px]">
              <div>
                <div className="font-black text-slate-900 uppercase text-[10px] mb-1">
                  NOTIFICADO A
                </div>
                <div className="font-extrabold text-slate-900">Edwin Diaz</div>
                <div className="text-slate-600">Calidad Materias Primas - Insumos</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1 italic">
                  Firma de enterado / recibido: [Firma Registrada]
                </div>
              </div>
              <div className="pt-2 border-t border-slate-300 mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Fecha:</span>
                <input
                  type="date"
                  value={control.notificadoA1.fecha}
                  onChange={(e) => setControl(prev => ({
                    ...prev,
                    notificadoA1: { ...prev.notificadoA1, fecha: e.target.value }
                  }))}
                  className="font-mono bg-transparent outline-none text-[10px]"
                />
              </div>
            </div>

            {/* Columna 3: NOTIFICADO A (Hector Ariel Ramirez) */}
            <div className="p-3 flex flex-col justify-between min-h-[110px]">
              <div>
                <div className="font-black text-slate-900 uppercase text-[10px] mb-1">
                  NOTIFICADO A
                </div>
                <div className="font-extrabold text-slate-900">Hector Ariel Ramirez</div>
                <div className="text-slate-600">Jefe Compras y Desarrollo insumos</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1 italic">
                  Firma de enterado / recibido: [Firma Registrada]
                </div>
              </div>
              <div className="pt-2 border-t border-slate-300 mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Fecha:</span>
                <input
                  type="date"
                  value={control.notificadoA2.fecha}
                  onChange={(e) => setControl(prev => ({
                    ...prev,
                    notificadoA2: { ...prev.notificadoA2, fecha: e.target.value }
                  }))}
                  className="font-mono bg-transparent outline-none text-[10px]"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Barra inferior de acciones (oculta al imprimir) */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 print:hidden">
          <div className="text-xs text-slate-500">
            Responsable del Laboratorio: <strong className="text-slate-800">{usuarioLogueadoNombre}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Reporte</span>
            </button>
            <button
              type="button"
              onClick={handleEnviar}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Responder a Compras</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
