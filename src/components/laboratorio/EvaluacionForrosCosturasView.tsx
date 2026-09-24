import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { EvaluacionForrosCosturas } from '../../types';
import {
  Scissors,
  Calendar,
  FileText,
  Mail,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Printer,
  ArrowRightLeft,
  UserCheck,
  Sparkles,
  Shirt,
  Send,
  X,
  Eye,
  Edit,
  Clock,
  Building2,
  Check,
  Link2,
  Package,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

type ModoEdicion = 'NUEVO' | 'PIPIN' | 'SHIPPING' | 'COMPARACION';

export const EvaluacionForrosCosturasView: React.FC = () => {
  const {
    evaluacionesForrosCosturas,
    agregarEvaluacionForrosCosturas,
    actualizarEvaluacionForrosCosturas,
    enviarCorreoReporteForrosCosturas,
    analistaActivo,
    solicitudesTelas
  } = useQuality();

  const [busqueda, setBusqueda] = useState('');
  const [filtroDictamen, setFiltroDictamen] = useState<string>('TODOS');
  
  // Expansión de filas en la tabla
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  // Modal de Edición - con modo para saber QUÉ estamos editando
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState<ModoEdicion>('NUEVO');
  const [itemEdicion, setItemEdicion] = useState<EvaluacionForrosCosturas | null>(null);

  // Modal de Reporte / Correo
  const [modalCorreoAbierto, setModalCorreoAbierto] = useState(false);
  const [itemReporte, setItemReporte] = useState<EvaluacionForrosCosturas | null>(null);
  const [emailDestinatario, setEmailDestinatario] = useState('compras.calidad@stfgroup.com');
  const [emailAsunto, setEmailAsunto] = useState('');
  const [emailCuerpo, setEmailCuerpo] = useState('');

  // ===========================================================================
  // ESTADO FORMULARIO: Datos generales de la referencia
  // ===========================================================================
  const [referencia, setReferencia] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [color, setColor] = useState('');
  const [ordenCompra, setOrdenCompra] = useState('');

  // PIPIN
  const [pipinFechaIngreso, setPipinFechaIngreso] = useState(new Date().toISOString().split('T')[0]);
  const [pipinFechaEntrega, setPipinFechaEntrega] = useState(new Date().toISOString().split('T')[0]);
  const [pipinObs, setPipinObs] = useState('');
  const [pipinEstado, setPipinEstado] = useState<'CONFORME' | 'CON NOVEDAD' | 'PENDIENTE'>('CONFORME');
  const [pipinTipoForro, setPipinTipoForro] = useState('Poliéster 100% Tafetán');
  const [pipinCalidadCostura, setPipinCalidadCostura] = useState('Puntada 301 Doble Pespunte');
  const [pipinPuntadas, setPipinPuntadas] = useState('12 SPI');

  // SHIPPING
  const [shippingFechaIngreso, setShippingFechaIngreso] = useState(new Date().toISOString().split('T')[0]);
  const [shippingFechaEntrega, setShippingFechaEntrega] = useState(new Date().toISOString().split('T')[0]);
  const [shippingObs, setShippingObs] = useState('');
  const [shippingEstado, setShippingEstado] = useState<'APROBADO' | 'RECHAZADO' | 'OBSERVADO' | 'PENDIENTE'>('APROBADO');
  const [shippingTipoForro, setShippingTipoForro] = useState('Poliéster 100% Tafetán');
  const [shippingCalidadCostura, setShippingCalidadCostura] = useState('Puntada 301 Doble Pespunte');
  const [shippingPuntadas, setShippingPuntadas] = useState('12 SPI');

  // COMPARACIÓN
  const [coincideForro, setCoincideForro] = useState(true);
  const [coincideCostura, setCoincideCostura] = useState(true);
  const [variacionesDetectadas, setVariacionesDetectadas] = useState('');
  const [dictamenFinal, setDictamenFinal] = useState<'APROBADO' | 'RECHAZADO' | 'CON HALLAZGOS' | 'PENDIENTE'>('APROBADO');
  const [obsGenerales, setObsGenerales] = useState('');

  // ===========================================================================
  // CARGAR DATOS EN EL FORMULARIO
  // ===========================================================================
  const cargarDatosEnForm = (item: EvaluacionForrosCosturas) => {
    setReferencia(item.referencia);
    setProveedor(item.proveedor);
    setColor(item.color || '');
    setOrdenCompra(item.ordenCompra || '');

    setPipinFechaIngreso(item.pipin.fechaIngreso);
    setPipinFechaEntrega(item.pipin.fechaEntrega);
    setPipinObs(item.pipin.observaciones);
    setPipinEstado(item.pipin.estado);
    setPipinTipoForro(item.pipin.tipoForro || '');
    setPipinCalidadCostura(item.pipin.calidadCostura || '');
    setPipinPuntadas(item.pipin.puntadasPorPulgada ? String(item.pipin.puntadasPorPulgada) : '12 SPI');

    setShippingFechaIngreso(item.shipping.fechaIngreso);
    setShippingFechaEntrega(item.shipping.fechaEntrega || item.shipping.fechaIngreso);
    setShippingObs(item.shipping.observaciones);
    setShippingEstado(item.shipping.estado);
    setShippingTipoForro(item.shipping.tipoForro || '');
    setShippingCalidadCostura(item.shipping.calidadCostura || '');
    setShippingPuntadas(item.shipping.puntadasPorPulgada ? String(item.shipping.puntadasPorPulgada) : '12 SPI');

    setCoincideForro(item.comparacion.coincideForro);
    setCoincideCostura(item.comparacion.coincideCostura);
    setVariacionesDetectadas(item.comparacion.variacionesDetectadas);
    setDictamenFinal(item.comparacion.dictamenFinal);
    setObsGenerales(item.comparacion.observacionesGenerales || '');
  };

  const resetForm = () => {
    setReferencia('');
    setProveedor('');
    setColor('');
    setOrdenCompra('');
    setPipinFechaIngreso(new Date().toISOString().split('T')[0]);
    setPipinFechaEntrega(new Date().toISOString().split('T')[0]);
    setPipinObs('');
    setPipinEstado('CONFORME');
    setPipinTipoForro('Poliéster 100% Tafetán');
    setPipinCalidadCostura('Puntada 301 Doble Pespunte');
    setPipinPuntadas('12 SPI');
    setShippingFechaIngreso(new Date().toISOString().split('T')[0]);
    setShippingFechaEntrega(new Date().toISOString().split('T')[0]);
    setShippingObs('');
    setShippingEstado('APROBADO');
    setShippingTipoForro('Poliéster 100% Tafetán');
    setShippingCalidadCostura('Puntada 301 Doble Pespunte');
    setShippingPuntadas('12 SPI');
    setCoincideForro(true);
    setCoincideCostura(true);
    setVariacionesDetectadas('Sin discrepancias críticas entre Pipin y Shipping.');
    setDictamenFinal('APROBADO');
    setObsGenerales('');
  };

  // Abrir formulario NUEVO (llena pipin y shipping juntos)
  const handleAbrirNuevo = () => {
    setItemEdicion(null);
    setModoEdicion('NUEVO');
    resetForm();
    setModalAbierto(true);
  };

  // Editar solo PIPIN
  const handleEditarPipin = (item: EvaluacionForrosCosturas) => {
    setItemEdicion(item);
    setModoEdicion('PIPIN');
    cargarDatosEnForm(item);
    setModalAbierto(true);
  };

  // Editar solo SHIPPING
  const handleEditarShipping = (item: EvaluacionForrosCosturas) => {
    setItemEdicion(item);
    setModoEdicion('SHIPPING');
    cargarDatosEnForm(item);
    setModalAbierto(true);
  };

  // Editar dictamen / comparación
  const handleEditarComparacion = (item: EvaluacionForrosCosturas) => {
    setItemEdicion(item);
    setModoEdicion('COMPARACION');
    cargarDatosEnForm(item);
    setModalAbierto(true);
  };

  // ===========================================================================
  // GUARDAR
  // ===========================================================================
  const handleGuardarFormulario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referencia.trim()) {
      alert('Por favor ingrese el nombre de la Referencia.');
      return;
    }

    if (itemEdicion && modoEdicion === 'PIPIN') {
      // Solo actualizar pipin, mantener shipping y comparacion intactos
      actualizarEvaluacionForrosCosturas(itemEdicion.id, {
        referencia: referencia.trim().toUpperCase(),
        proveedor: proveedor.trim() || 'PROVEEDOR TEXTIL',
        color: color.trim() || itemEdicion.color,
        ordenCompra: ordenCompra.trim() || itemEdicion.ordenCompra,
        pipin: {
          fechaIngreso: pipinFechaIngreso,
          fechaEntrega: pipinFechaEntrega,
          observaciones: pipinObs,
          estado: pipinEstado,
          tipoForro: pipinTipoForro,
          calidadCostura: pipinCalidadCostura,
          puntadasPorPulgada: pipinPuntadas
        }
      });
    } else if (itemEdicion && modoEdicion === 'SHIPPING') {
      // Solo actualizar shipping, mantener pipin y comparacion intactos
      actualizarEvaluacionForrosCosturas(itemEdicion.id, {
        referencia: referencia.trim().toUpperCase(),
        proveedor: proveedor.trim() || 'PROVEEDOR TEXTIL',
        color: color.trim() || itemEdicion.color,
        ordenCompra: ordenCompra.trim() || itemEdicion.ordenCompra,
        shipping: {
          fechaIngreso: shippingFechaIngreso,
          fechaEntrega: shippingFechaEntrega,
          observaciones: shippingObs,
          estado: shippingEstado,
          tipoForro: shippingTipoForro,
          calidadCostura: shippingCalidadCostura,
          puntadasPorPulgada: shippingPuntadas
        }
      });
    } else if (itemEdicion && modoEdicion === 'COMPARACION') {
      actualizarEvaluacionForrosCosturas(itemEdicion.id, {
        comparacion: {
          coincideForro,
          coincideCostura,
          variacionesDetectadas,
          dictamenFinal,
          evaluador: analistaActivo?.nombreCompleto || 'Laboratorio STFGroup',
          fechaEvaluacion: new Date().toISOString().split('T')[0],
          observacionesGenerales: obsGenerales
        }
      });
    } else {
      // NUEVO - crear registro completo con pipin + shipping + comparacion
      const payload = {
        referencia: referencia.trim().toUpperCase(),
        proveedor: proveedor.trim() || 'PROVEEDOR TEXTIL',
        color: color.trim() || 'ESTÁNDAR',
        ordenCompra: ordenCompra.trim() || 'N/A',
        pipin: {
          fechaIngreso: pipinFechaIngreso,
          fechaEntrega: pipinFechaEntrega,
          observaciones: pipinObs,
          estado: pipinEstado,
          tipoForro: pipinTipoForro,
          calidadCostura: pipinCalidadCostura,
          puntadasPorPulgada: pipinPuntadas
        },
        shipping: {
          fechaIngreso: shippingFechaIngreso,
          fechaEntrega: shippingFechaEntrega,
          observaciones: shippingObs,
          estado: shippingEstado,
          tipoForro: shippingTipoForro,
          calidadCostura: shippingCalidadCostura,
          puntadasPorPulgada: shippingPuntadas
        },
        comparacion: {
          coincideForro,
          coincideCostura,
          variacionesDetectadas,
          dictamenFinal,
          evaluador: analistaActivo?.nombreCompleto || 'Laboratorio STFGroup',
          fechaEvaluacion: new Date().toISOString().split('T')[0],
          observacionesGenerales: obsGenerales
        }
      };
      agregarEvaluacionForrosCosturas(payload);
    }

    setModalAbierto(false);
  };

  // ===========================================================================
  // CORREO
  // ===========================================================================
  const handlePrepararCorreo = (item: EvaluacionForrosCosturas) => {
    setItemReporte(item);
    setEmailDestinatario('compras.calidad@stfgroup.com');
    setEmailAsunto(`[STFLab 2.0] Reporte Técnico Forros y Costuras - Ref: ${item.referencia} (${item.codigoReporte})`);
    setEmailCuerpo(`Estimado Equipo de Compras y Calidad,\n\nAdjunto el Reporte Técnico Comparativo de FORROS Y COSTURAS (Muestra PIPIN vs Muestra SHIPPING) para la referencia:\n\n📌 REFERENCIA: ${item.referencia}\n🏭 PROVEEDOR: ${item.proveedor}\n🎨 COLOR: ${item.color || 'Crudo/Estándar'} | OC: ${item.ordenCompra || 'N/A'}\n\n--- 🪡 MUESTRA PIPIN ---\n- Fecha Ingreso: ${item.pipin.fechaIngreso} | Fecha Entrega: ${item.pipin.fechaEntrega}\n- Observaciones: ${item.pipin.observaciones}\n- Estado: ${item.pipin.estado}\n\n--- 📦 MUESTRA SHIPPING ---\n- Fecha Ingreso: ${item.shipping.fechaIngreso}\n- Observaciones: ${item.shipping.observaciones}\n- Estado: ${item.shipping.estado}\n\n--- ⚖️ DICTAMEN COMPARATIVO FINAL ---\n- ¿Coincide Forro?: ${item.comparacion.coincideForro ? 'SÍ (Conforme)' : 'NO (Variación detectada)'}\n- ¿Coincide Costura?: ${item.comparacion.coincideCostura ? 'SÍ (Conforme)' : 'NO (Variación detectada)'}\n- Variaciones: ${item.comparacion.variacionesDetectadas || 'Sin observaciones'}\n- DICTAMEN FINAL: [${item.comparacion.dictamenFinal}]\n\nEvaluado por: ${item.comparacion.evaluador}\nFecha de Evaluación: ${item.comparacion.fechaEvaluacion}\n\nAtentamente,\nLaboratorio de Calidad Textil - STFGroup`);
    setModalCorreoAbierto(true);
  };

  const handleEnviarCorreo = () => {
    if (!itemReporte) return;
    if (!emailDestinatario.trim() || !emailDestinatario.includes('@')) {
      alert('Por favor ingrese un correo electrónico válido.');
      return;
    }
    enviarCorreoReporteForrosCosturas(itemReporte.id, emailDestinatario.trim(), emailAsunto.trim(), emailCuerpo);
    setModalCorreoAbierto(false);
  };

  // Filtrado
  const evaluacionesFiltradas = evaluacionesForrosCosturas.filter(item => {
    const query = busqueda.toLowerCase().trim();
    const matchBusqueda = !query ||
      item.referencia.toLowerCase().includes(query) ||
      item.proveedor.toLowerCase().includes(query) ||
      item.codigoReporte.toLowerCase().includes(query) ||
      (item.color && item.color.toLowerCase().includes(query));
    const matchDictamen = filtroDictamen === 'TODOS' || item.comparacion.dictamenFinal === filtroDictamen;
    return matchBusqueda && matchDictamen;
  });

  const getBadgePipin = (estado: string) => {
    if (estado === 'CONFORME') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (estado === 'CON NOVEDAD') return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  const getBadgeShipping = (estado: string) => {
    if (estado === 'APROBADO') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (estado === 'RECHAZADO') return 'bg-red-100 text-red-800 border-red-300';
    if (estado === 'OBSERVADO') return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  const getBadgeDictamen = (d: string) => {
    if (d === 'APROBADO') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (d === 'RECHAZADO') return 'bg-red-100 text-red-800 border-red-300';
    if (d === 'CON HALLAZGOS') return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  // Título del modal según modo
  const tituloModal = () => {
    if (modoEdicion === 'NUEVO') return 'Nueva Evaluación — Forros & Costuras';
    if (modoEdicion === 'PIPIN') return `Editar Pipin — ${itemEdicion?.referencia}`;
    if (modoEdicion === 'SHIPPING') return `Editar Shipping — ${itemEdicion?.referencia}`;
    if (modoEdicion === 'COMPARACION') return `Editar Comparación & Dictamen — ${itemEdicion?.referencia}`;
    return 'Evaluación Forros & Costuras';
  };

  return (
    <div className="space-y-6 font-sans">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-950/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <Shirt className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-400/40 uppercase tracking-widest">
                  LABORATORIO TEXTIL • SUBSECCIÓN
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display mt-0.5">
                Evaluación de Forros & Costuras (Pipin vs Shipping)
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Cada referencia tiene <b>Pipin</b> y <b>Shipping</b> como ingresos independientes. Edítalos por separado y emite el dictamen comparativo final.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAbrirNuevo}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl transition-all shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>Nueva Evaluación Forros / Costuras</span>
          </button>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por referencia, proveedor, código de reporte..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-bold text-slate-500 shrink-0">Dictamen:</span>
          <select
            value={filtroDictamen}
            onChange={(e) => setFiltroDictamen(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="TODOS">Todos los Dictámenes</option>
            <option value="APROBADO">APROBADO</option>
            <option value="CON HALLAZGOS">CON HALLAZGOS</option>
            <option value="RECHAZADO">RECHAZADO</option>
            <option value="PENDIENTE">PENDIENTE</option>
          </select>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      {evaluacionesFiltradas.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Shirt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No se encontraron evaluaciones de Forros y Costuras</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Haga clic en <b>"Nueva Evaluación Forros / Costuras"</b> para registrar las muestras de Pipin y Shipping de una referencia.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {evaluacionesFiltradas.map((item) => {
            const estaExpandido = expandidoId === item.id;
            return (
              <div key={item.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

                {/* ---- ENCABEZADO DE LA REFERENCIA ---- */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandidoId(estaExpandido ? null : item.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {estaExpandido ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-mono font-black px-3 py-1 rounded-xl">
                      {item.codigoReporte}
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                        {item.referencia}
                        {item.color && (
                          <span className="ml-2 bg-slate-100 text-slate-600 text-xs font-normal px-2 py-0.5 rounded-full font-mono">
                            {item.color}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Proveedor: <b className="text-slate-700">{item.proveedor}</b> • OC: <b className="text-slate-700">{item.ordenCompra || 'N/A'}</b>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1.5 ${getBadgeDictamen(item.comparacion.dictamenFinal)}`}>
                      {item.comparacion.dictamenFinal === 'APROBADO' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {item.comparacion.dictamenFinal === 'RECHAZADO' && <XCircle className="w-3.5 h-3.5" />}
                      {item.comparacion.dictamenFinal === 'CON HALLAZGOS' && <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>DICTAMEN: {item.comparacion.dictamenFinal}</span>
                    </span>

                    <button
                      onClick={() => handleEditarComparacion(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
                      title="Editar Comparación & Dictamen"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Comparación</span>
                    </button>

                    <button
                      onClick={() => handlePrepararCorreo(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Correo</span>
                    </button>
                  </div>
                </div>

                {/* ---- DOS FILAS: PIPIN y SHIPPING (siempre visibles) ---- */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">

                  {/* FILA PIPIN */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-indigo-900 uppercase flex items-center gap-1.5 tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        Muestra PIPIN (Preliminar)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getBadgePipin(item.pipin.estado)}`}>
                          {item.pipin.estado}
                        </span>
                        <button
                          onClick={() => handleEditarPipin(item)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all cursor-pointer"
                          title="Editar Pipin"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">Fecha Ingreso:</span>
                        <strong className="text-slate-800 font-mono">{item.pipin.fechaIngreso || 'N/A'}</strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">Fecha Entrega:</span>
                        <strong className="text-slate-800 font-mono">{item.pipin.fechaEntrega || 'N/A'}</strong>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center gap-4 text-[11px] text-slate-500">
                        <span>Forro: <b>{item.pipin.tipoForro || 'Tafetán'}</b></span>
                        <span>Costura: <b>{item.pipin.calidadCostura || 'Puntada 301'}</b></span>
                        <span>SPI: <b>{item.pipin.puntadasPorPulgada || '12'}</b></span>
                      </div>
                      {item.pipin.observaciones && (
                        <p className="text-slate-700 italic text-[11px]">"{item.pipin.observaciones}"</p>
                      )}
                    </div>
                  </div>

                  {/* FILA SHIPPING */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-emerald-900 uppercase flex items-center gap-1.5 tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        Muestra SHIPPING (Final)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getBadgeShipping(item.shipping.estado)}`}>
                          {item.shipping.estado}
                        </span>
                        <button
                          onClick={() => handleEditarShipping(item)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-all cursor-pointer"
                          title="Editar Shipping"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">Fecha Ingreso:</span>
                        <strong className="text-slate-800 font-mono">{item.shipping.fechaIngreso || 'N/A'}</strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">Fecha Entrega:</span>
                        <strong className="text-slate-800 font-mono">{item.shipping.fechaEntrega || 'N/A'}</strong>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center gap-4 text-[11px] text-slate-500">
                        <span>Forro: <b>{item.shipping.tipoForro || 'Tafetán'}</b></span>
                        <span>Costura: <b>{item.shipping.calidadCostura || 'Puntada 301'}</b></span>
                        <span>SPI: <b>{item.shipping.puntadasPorPulgada || '12'}</b></span>
                      </div>
                      {item.shipping.observaciones && (
                        <p className="text-slate-700 italic text-[11px]">"{item.shipping.observaciones}"</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ---- COMPARACIÓN (expandible) ---- */}
                {estaExpandido && (
                  <div className="px-5 py-3 bg-indigo-50/50 border-t border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-6 font-bold text-slate-800">
                        <span>Coincidencia Forro: {item.comparacion.coincideForro ? <b className="text-emerald-700">✓ SÍ</b> : <b className="text-red-600">❌ NO</b>}</span>
                        <span>Coincidencia Costuras: {item.comparacion.coincideCostura ? <b className="text-emerald-700">✓ SÍ</b> : <b className="text-red-600">❌ NO</b>}</span>
                      </div>
                      <p className="text-slate-600">
                        <b>Análisis:</b> {item.comparacion.variacionesDetectadas}
                      </p>
                      {item.comparacion.observacionesGenerales && (
                        <p className="text-slate-500 italic">Obs: {item.comparacion.observacionesGenerales}</p>
                      )}
                      <p className="text-slate-400 text-[10px]">
                        Evaluado por: <b>{item.comparacion.evaluador}</b> el {item.comparacion.fechaEvaluacion}
                      </p>
                    </div>
                    {item.correosEnviados && item.correosEnviados.length > 0 && (
                      <div className="text-[10px] bg-white border border-indigo-200 text-indigo-900 font-bold px-3 py-1.5 rounded-xl shrink-0">
                        📧 Correos Enviados: <b>{item.correosEnviados.length}</b> (Último: {item.correosEnviados[item.correosEnviados.length - 1].fechaEnvio})
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* ===========================================================================
          MODAL FORMULARIO (NUEVO / EDITAR PIPIN / EDITAR SHIPPING / COMPARACIÓN)
      =========================================================================== */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl animate-fade-in my-8 max-h-[90vh] overflow-y-auto">

            {/* Header del modal */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                  modoEdicion === 'PIPIN' ? 'bg-indigo-100 text-indigo-800' :
                  modoEdicion === 'SHIPPING' ? 'bg-emerald-100 text-emerald-800' :
                  modoEdicion === 'COMPARACION' ? 'bg-slate-100 text-slate-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {modoEdicion === 'PIPIN' ? '🪡' : modoEdicion === 'SHIPPING' ? '📦' : modoEdicion === 'COMPARACION' ? '⚖️' : '🪡'}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{tituloModal()}</h3>
                  <p className="text-xs text-slate-500">
                    {modoEdicion === 'PIPIN' && 'Editar datos de la muestra preliminar PIPIN. Shipping y comparación se mantienen intactos.'}
                    {modoEdicion === 'SHIPPING' && 'Editar datos de la muestra de despacho SHIPPING. Pipin y comparación se mantienen intactos.'}
                    {modoEdicion === 'COMPARACION' && 'Editar el análisis comparativo y dictamen final entre Pipin y Shipping.'}
                    {modoEdicion === 'NUEVO' && 'Registre los datos iniciales de Pipin y Shipping para la referencia.'}
                  </p>
                </div>
              </div>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarFormulario} className="space-y-5">

              {/* Sección 1: Identificación (siempre visible) */}
              {(modoEdicion === 'NUEVO' || modoEdicion === 'PIPIN' || modoEdicion === 'SHIPPING') && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">1. Identificación de la Referencia</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Referencia *</label>
                      <input
                        type="text"
                        placeholder="Ej: LINO MOURA"
                        value={referencia}
                        onChange={(e) => setReferencia(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Proveedor</label>
                      <input
                        type="text"
                        placeholder="Ej: SHANGHAI JOY TEX"
                        value={proveedor}
                        onChange={(e) => setProveedor(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Color / Shade</label>
                      <input
                        type="text"
                        placeholder="Ej: 045 CRUDO"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1"># Orden Compra</label>
                      <input
                        type="text"
                        placeholder="Ej: OAC 1107"
                        value={ordenCompra}
                        onChange={(e) => setOrdenCompra(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sección PIPIN (visible en modo NUEVO o PIPIN) */}
              {(modoEdicion === 'NUEVO' || modoEdicion === 'PIPIN') && (
                <div className="bg-indigo-50/40 border border-indigo-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-extrabold text-xs text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <span>{modoEdicion === 'NUEVO' ? '2.' : '2.'} Muestra PIPIN (Preliminar)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Fecha Ingreso Pipin *</label>
                      <input type="date" value={pipinFechaIngreso} onChange={(e) => setPipinFechaIngreso(e.target.value)} required
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-800" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Fecha Entrega Pipin *</label>
                      <input type="date" value={pipinFechaEntrega} onChange={(e) => setPipinFechaEntrega(e.target.value)} required
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-800" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Estado Pipin</label>
                      <select value={pipinEstado} onChange={(e) => setPipinEstado(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800">
                        <option value="CONFORME">CONFORME</option>
                        <option value="CON NOVEDAD">CON NOVEDAD</option>
                        <option value="PENDIENTE">PENDIENTE</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Tipo de Forro</label>
                      <input type="text" value={pipinTipoForro} onChange={(e) => setPipinTipoForro(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Calidad Costura / Puntada</label>
                      <input type="text" value={pipinCalidadCostura} onChange={(e) => setPipinCalidadCostura(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Puntadas Por Pulgada (SPI)</label>
                      <input type="text" value={pipinPuntadas} onChange={(e) => setPipinPuntadas(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Observaciones Pipin</label>
                    <textarea rows={2} placeholder="Estado del forro, resistencia de costura preliminar, simetría y hallazgos..."
                      value={pipinObs} onChange={(e) => setPipinObs(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none" />
                  </div>
                </div>
              )}

              {/* Sección SHIPPING (visible en modo NUEVO o SHIPPING) */}
              {(modoEdicion === 'NUEVO' || modoEdicion === 'SHIPPING') && (
                <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-extrabold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>{modoEdicion === 'NUEVO' ? '3.' : '2.'} Muestra SHIPPING (Despacho / Final)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Fecha Ingreso Shipping *</label>
                      <input type="date" value={shippingFechaIngreso} onChange={(e) => setShippingFechaIngreso(e.target.value)} required
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-800" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Fecha Entrega Shipping</label>
                      <input type="date" value={shippingFechaEntrega} onChange={(e) => setShippingFechaEntrega(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-800" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Estado Shipping</label>
                      <select value={shippingEstado} onChange={(e) => setShippingEstado(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800">
                        <option value="APROBADO">APROBADO</option>
                        <option value="OBSERVADO">OBSERVADO</option>
                        <option value="RECHAZADO">RECHAZADO</option>
                        <option value="PENDIENTE">PENDIENTE</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Tipo de Forro</label>
                      <input type="text" value={shippingTipoForro} onChange={(e) => setShippingTipoForro(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Calidad Costura (Shipping)</label>
                      <input type="text" value={shippingCalidadCostura} onChange={(e) => setShippingCalidadCostura(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Puntadas Por Pulgada (SPI)</label>
                      <input type="text" value={shippingPuntadas} onChange={(e) => setShippingPuntadas(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Observaciones Shipping</label>
                    <textarea rows={2} placeholder="Observaciones del lote final de producción de Shipping..."
                      value={shippingObs} onChange={(e) => setShippingObs(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none" />
                  </div>
                </div>
              )}

              {/* Sección COMPARACIÓN (visible en modo NUEVO o COMPARACION) */}
              {(modoEdicion === 'NUEVO' || modoEdicion === 'COMPARACION') && (
                <div className="bg-slate-100 border border-slate-300 rounded-2xl p-4 space-y-3">
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                    {modoEdicion === 'NUEVO' ? '4.' : '2.'} Comparación (Pipin vs Shipping) & Dictamen Final
                  </h4>

                  <div className="flex flex-col sm:flex-row items-center gap-6 text-xs font-bold text-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={coincideForro} onChange={(e) => setCoincideForro(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded" />
                      <span>¿Coincide Forro en Pipin y Shipping?</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={coincideCostura} onChange={(e) => setCoincideCostura(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded" />
                      <span>¿Coinciden Costuras e Hilados?</span>
                    </label>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Variaciones Detectadas / Discrepancias</label>
                    <input type="text" placeholder="Indique variaciones de tono, gramaje o tensiones de hilado..."
                      value={variacionesDetectadas} onChange={(e) => setVariacionesDetectadas(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Dictamen Comparativo Final *</label>
                      <select value={dictamenFinal} onChange={(e) => setDictamenFinal(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-black text-xs text-slate-900">
                        <option value="APROBADO">APROBADO (Mismo estándar en Pipin y Shipping)</option>
                        <option value="CON HALLAZGOS">CON HALLAZGOS (Variación no crítica)</option>
                        <option value="RECHAZADO">RECHAZADO (Discrepancia crítica)</option>
                        <option value="PENDIENTE">PENDIENTE EVALUACIÓN</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Observaciones Generales / Recomendaciones</label>
                      <input type="text" placeholder="Conclusiones finales del analista..."
                        value={obsGenerales} onChange={(e) => setObsGenerales(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-3">
                <button type="button" onClick={() => setModalAbierto(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                  Cancelar
                </button>
                <button type="submit"
                  className={`text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2 ${
                    modoEdicion === 'PIPIN' ? 'bg-indigo-600 hover:bg-indigo-700' :
                    modoEdicion === 'SHIPPING' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    modoEdicion === 'COMPARACION' ? 'bg-slate-700 hover:bg-slate-900' :
                    'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}>
                  <Check className="w-4 h-4" />
                  <span>
                    {modoEdicion === 'PIPIN' && 'Guardar Pipin'}
                    {modoEdicion === 'SHIPPING' && 'Guardar Shipping'}
                    {modoEdicion === 'COMPARACION' && 'Guardar Dictamen'}
                    {modoEdicion === 'NUEVO' && 'Registrar Evaluación'}
                  </span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL CORREO */}
      {modalCorreoAbierto && itemReporte && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl animate-fade-in my-8 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">📧</div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Enviar Reporte Técnico por Correo</h3>
                  <p className="text-xs text-slate-500">Reporte: <b>{itemReporte.codigoReporte}</b> • Ref: <b>{itemReporte.referencia}</b></p>
                </div>
              </div>
              <button onClick={() => setModalCorreoAbierto(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-extrabold text-slate-700 uppercase block mb-1">Destinatario *</label>
                <input type="email" value={emailDestinatario} onChange={(e) => setEmailDestinatario(e.target.value)}
                  placeholder="ejemplo@stfgroup.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-900" />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-700 uppercase block mb-1">Asunto</label>
                <input type="text" value={emailAsunto} onChange={(e) => setEmailAsunto(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-900" />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-700 uppercase block mb-1">Mensaje</label>
                <textarea rows={8} value={emailCuerpo} onChange={(e) => setEmailCuerpo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono text-xs text-slate-800 leading-relaxed focus:outline-none" />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <button type="button" onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setModalCorreoAbierto(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                  Cancelar
                </button>
                <button type="button" onClick={handleEnviarCorreo}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer">
                  <Send className="w-4 h-4" />
                  <span>Enviar Correo</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
