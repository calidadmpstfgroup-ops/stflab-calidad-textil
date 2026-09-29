import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { Badge } from '../common/Badge';
import { 
  SolicitudTelasCompleta, 
  ItemMuestraTela, 
  SolicitudAccesoriosCompleta, 
  ItemMuestraAccesorio, 
  EstadoSolicitudFlujo,
  DecisionCompraTela
} from '../../types';
import * as XLSX from 'xlsx';
import { 
  ShoppingCart, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Clock, 
  PlusCircle, 
  Search,
  Camera,
  ClipboardPaste,
  Trash2,
  FileText,
  PackageCheck,
  Eye,
  Check,
  Send,
  Paperclip,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
  ArrowRight,
  Upload,
  FlaskConical,
  Ban,
  Ruler,
  Scissors
} from 'lucide-react';

import { 
  extraerTextoDeImagenOCR, 
  parsearTextoAccesorios,
  parsearTextoTelas 
} from '../../utils/imageOcrExtractor';
import { 
  interpretarDocumentoTelas, 
  interpretarDocumentoAccesorios, 
  leerArchivoExcel,
  calcularResumenMuestrasFisicas
} from '../../utils/documentReader';
import { ModalDecisionCompraTela } from './ModalDecisionCompraTela';

export const ComprasView: React.FC = () => {
  const { 
    solicitudesTelas, 
    agregarSolicitudTelas, 
    enviarSolicitudTelasALaboratorio,
    registrarDecisionCompraTela,
    solicitudesAccesorios, 
    agregarSolicitudAccesorios,
    enviarSolicitudAccesoriosALaboratorio,
    consultarFichaTecnicaHistorica,
    subseccionCompras,
    setSubseccionCompras,
    eliminarSolicitudTelas,
    eliminarSolicitudAccesorios,
    papelera,
    setModalPapeleraAbierto
  } = useQuality();

  // Subsecciones de Compras: 🧵 Telas vs 🔩 Accesorios (sincronizada con QualityContext)
  const subseccionActiva = subseccionCompras || 'telas';
  const setSubseccionActiva = (sub: 'telas' | 'accesorios') => {
    setSubseccionCompras(sub);
  };

  // Modal de Decisión de Compra de Telas (con alertas funcionales a Patronaje y Corte)
  const [telaParaDecision, setTelaParaDecision] = useState<{ solicitud: SolicitudTelasCompleta; tela: ItemMuestraTela } | null>(null);

  // Estado de procesamiento OCR inteligente
  const [procesandoOcr, setProcesandoOcr] = useState(false);
  const [mensajeOcr, setMensajeOcr] = useState('');

  // =========================================================================
  // --- 1. SECCIÓN TELAS (SOLICITUD CON 1 O VARIAS TELAS)                 ---
  // =========================================================================
  const [filtroBusquedaTelas, setFiltroBusquedaTelas] = useState('');
  const [modalNuevaSolTelas, setModalNuevaSolTelas] = useState(false);
  const [solicitudTelaExpandidaId, setSolicitudTelaExpandidaId] = useState<string | null>(solicitudesTelas[0]?.id || null);
  const [solicitudTelaVerDetalle, setSolicitudTelaVerDetalle] = useState<SolicitudTelasCompleta | null>(null);

  // Formulario Solicitud Telas
  const [numSolTelaInput, setNumSolTelaInput] = useState(`SOL-TEL-${new Date().getFullYear()}-${String(solicitudesTelas.length + 1).padStart(3, '0')}`);
  const [solicitanteTelaInput, setSolicitanteTelaInput] = useState('Compras - Telas (Andrea Ramos)');
  const [proveedorTelaInput, setProveedorTelaInput] = useState('');
  const [ocTelaInput, setOcTelaInput] = useState('');
  const [obsGenTelaInput, setObsGenTelaInput] = useState('');
  const [formatoCargaTela, setFormatoCargaTela] = useState<'manual' | 'excel' | 'pegar' | 'captura'>('manual');

  // Muestras de telas en borrador (inicia en limpio para creación en tiempo real)
  const [telasEnCreacion, setTelasEnCreacion] = useState<ItemMuestraTela[]>([]);

  // Fila manual borrador tela
  const [borradorScTela, setBorradorScTela] = useState('');
  const [borradorRefTela, setBorradorRefTela] = useState('');
  const [borradorColorTela, setBorradorColorTela] = useState('');
  const [borradorProvTela, setBorradorProvTela] = useState('');
  const [borradorOcTela, setBorradorOcTela] = useState('');
  const [borradorObsTela, setBorradorObsTela] = useState('');

  const [textoPegadoTelas, setTextoPegadoTelas] = useState('');
  const [imagenAdjuntaTelas, setImagenAdjuntaTelas] = useState<string | null>(null);
  const [nombreArchivoTelas, setNombreArchivoTelas] = useState<string>('');

  const handleAgregarFilaTelaManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borradorRefTela.trim()) {
      alert('Por favor ingresa la REFERENCIA de la tela.');
      return;
    }

    const nuevaFila: ItemMuestraTela = {
      id: `tel-draft-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      solicitudCompra: borradorScTela || `SC-${new Date().getFullYear()}-${100 + telasEnCreacion.length}`,
      referencia: borradorRefTela.toUpperCase().trim(),
      color: borradorColorTela.toUpperCase().trim() || 'ESTÁNDAR',
      proveedor: (borradorProvTela || proveedorTelaInput || 'PROVEEDOR TELAS').toUpperCase().trim(),
      ocCol: borradorOcTela || `OAC ${1130 + telasEnCreacion.length}`,
      observacion: borradorObsTela || 'Revisión técnica de laboratorio solicitada por Compras.'
    };

    setTelasEnCreacion([...telasEnCreacion, nuevaFila]);
    setBorradorScTela('');
    setBorradorRefTela('');
    setBorradorColorTela('');
    setBorradorProvTela('');
    setBorradorOcTela('');
    setBorradorObsTela('');
  };

  const handleSubirExcelTelas = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNombreArchivoTelas(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      const json = leerArchivoExcel(buffer);
      const resultado = interpretarDocumentoTelas(json, proveedorTelaInput);

      if (resultado.items.length > 0) {
        setTelasEnCreacion([...telasEnCreacion, ...resultado.items]);
        alert(`¡Se interpretaron fielmente ${resultado.items.length} telas desde el archivo Excel!`);
      } else {
        alert('No se detectaron filas válidas en el archivo Excel.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleProcesarPegadoTelas = () => {
    if (!textoPegadoTelas.trim()) {
      alert('Por favor pega el texto o la tabla de la solicitud.');
      return;
    }

    const resultado = interpretarDocumentoTelas(textoPegadoTelas, proveedorTelaInput);

    if (resultado.items.length > 0) {
      setTelasEnCreacion([...telasEnCreacion, ...resultado.items]);
      const resM = resultado.resumenMuestras;
      if (resM) {
        alert(
          `¡Se interpretaron fielmente ${resM.totalReferencias} referencias!\n` +
          `• Muestras Físicas a Ensayar: ${resM.totalMuestrasFisicas}\n` +
          `• Agrupaciones por Muestra Única: ${resM.totalAgrupaciones}\n` +
          (resM.totalIncompletos > 0 ? `⚠️ ${resM.totalIncompletos} registro(s) incompleto(s) detectado(s).` : '✓ Todos los registros están completos.')
        );
      } else {
        alert(`¡Se interpretaron fielmente ${resultado.items.length} telas desde los datos pegados!`);
      }
      setTextoPegadoTelas('');
    } else {
      alert('No se pudieron extraer datos válidos. Verifica que el texto contenga información de telas en formato vertical o tabla.');
    }
  };

  const handleGuardarSolicitudTelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (telasEnCreacion.length === 0) {
      alert('Debes incluir al menos una tela en la solicitud.');
      return;
    }

    const incompletos = telasEnCreacion.filter(t => t.incompleto);
    if (incompletos.length > 0) {
      alert(
        `⚠️ No se puede enviar la solicitud porque hay ${incompletos.length} registro(s) incompleto(s).\n\n` +
        `Cada registro debe contar obligatoriamente con:\n` +
        `1. Código / SC\n` +
        `2. Nombre de Tela\n` +
        `3. Color\n` +
        `4. Proveedor\n` +
        `5. Orden de Compra\n\n` +
        `Por favor completa los datos faltantes o elimina los registros marcados como incompletos antes de enviar.`
      );
      return;
    }

    // 🚫 VALIDACIÓN OBLIGATORIA: Rechazar si alguna tela no tiene Ficha Técnica del Proveedor
    const telasSinFT: string[] = [];
    for (const t of telasEnCreacion) {
      const tieneFT = 
        (t.fichaProveedor && (t.fichaProveedor.completadaPorProveedor || Boolean(t.fichaProveedor.tokenAcceso) || Boolean(t.fichaProveedor.composicionDeclarada))) ||
        Boolean(t.fichaTecnica) ||
        Boolean(t.archivoFichaTecnica) ||
        consultarFichaTecnicaHistorica(t.referencia, t.proveedor || proveedorTelaInput) !== undefined;

      if (!tieneFT) {
        telasSinFT.push(`• ${t.referencia} (Proveedor: ${t.proveedor || proveedorTelaInput || 'No especificado'})`);
      }
    }

    if (telasSinFT.length > 0) {
      alert(
        `🚫 SOLICITUD RECHAZADA - FALTA FICHA TÉCNICA DEL PROVEEDOR\n\n` +
        `Las siguientes telas NO cuentan con la Ficha Técnica del Proveedor cargada o vinculada:\n\n` +
        `${telasSinFT.join('\n')}\n\n` +
        `⚠️ Requisito de Laboratorio: No se puede enviar una solicitud a laboratorio si la tela no tiene ficha técnica del proveedor. Por favor cargue o adjunte la ficha técnica en el sistema antes de enviar.`
      );
      return;
    }

    const tieneMuestraCompartida = telasEnCreacion.some(t => t.esMuestraCompartida) || 
      /aplica\s*1\s*sola\s*muestra|misma\s*tela/i.test(obsGenTelaInput || '') ||
      /aplica\s*1\s*sola\s*muestra|misma\s*tela/i.test(textoPegadoTelas || '');

    const todasSC = Array.from(new Set(telasEnCreacion.map(t => t.solicitudCompra).filter(Boolean)));
    const todasOC = Array.from(new Set(telasEnCreacion.map(t => t.ocCol).filter(Boolean)));

    const telasFinales = telasEnCreacion.map(t => ({
      ...t,
      solicitudesVinculadas: tieneMuestraCompartida ? todasSC : t.solicitudesVinculadas,
      ordenesCompraVinculadas: tieneMuestraCompartida ? todasOC : t.ordenesCompraVinculadas
    }));

    const nuevaSol: Omit<SolicitudTelasCompleta, 'id'> = {
      numeroSolicitud: numSolTelaInput || `SOL-TEL-2026-${String(solicitudesTelas.length + 1).padStart(3, '0')}`,
      fechaSolicitud: new Date().toISOString().split('T')[0],
      solicitante: solicitanteTelaInput || 'Compras - Telas',
      proveedor: proveedorTelaInput || telasEnCreacion[0]?.proveedor || 'PROVEEDOR DE TELAS',
      ordenCompra: ocTelaInput || todasOC.join(' / ') || 'N/A',
      esMuestraCompartida: tieneMuestraCompartida,
      solicitudesVinculadas: tieneMuestraCompartida ? todasSC : undefined,
      ordenesCompraVinculadas: tieneMuestraCompartida ? todasOC : undefined,
      notaMismaTela: tieneMuestraCompartida ? 'APLICA 1 SOLA MUESTRA PARA LAS DOS, ES LA MISMA TELA' : undefined,
      observacionesGenerales: obsGenTelaInput || (tieneMuestraCompartida ? 'APLICA 1 SOLA MUESTRA PARA LAS DOS, ES LA MISMA TELA' : 'Solicitud de compras de telas para revisión técnica.'),
      estadoFlujo: 'ENVIADA',
      documentoOriginal: {
        nombreArchivo: nombreArchivoTelas || 'SOLICITUD_TELAS.xlsx',
        tipoArchivo: formatoCargaTela === 'excel' ? 'EXCEL' : formatoCargaTela === 'captura' ? 'IMAGEN' : formatoCargaTela === 'pegar' ? 'TEXTO' : 'MANUAL',
        urlData: imagenAdjuntaTelas || undefined,
        contenidoTexto: textoPegadoTelas || undefined
      },
      telas: telasFinales,
      totalTelas: telasFinales.length,
      dictamenGlobal: 'EN_PROCESO'
    };

    agregarSolicitudTelas(nuevaSol);
    alert(
      tieneMuestraCompartida
        ? `¡Regla aplicada! Se creó 1 SOLA SOLICITUD (${nuevaSol.numeroSolicitud}) para Laboratorio con Muestra Compartida ("APLICA 1 SOLA MUESTRA PARA LAS DOS, ES LA MISMA TELA").`
        : `¡Solicitud de Telas ${nuevaSol.numeroSolicitud} con ${telasEnCreacion.length} telas creada y ENVIADA A LABORATORIO exitosamente!`
    );

    setModalNuevaSolTelas(false);
    setTelasEnCreacion([]);
    setTextoPegadoTelas('');
    setImagenAdjuntaTelas(null);
    setNombreArchivoTelas('');
  };

  // =========================================================================
  // --- 2. SECCIÓN ACCESORIOS (SOLICITUD CON MÚLTIPLES MUESTRAS)          ---
  // =========================================================================
  const [filtroBusquedaAcc, setFiltroBusquedaAcc] = useState('');
  const [modalNuevaSolicitudAcc, setModalNuevaSolicitudAcc] = useState(false);
  const [solicitudExpandidaId, setSolicitudExpandidaId] = useState<string | null>(solicitudesAccesorios[0]?.id || null);
  const [solicitudVerDetalle, setSolicitudVerDetalle] = useState<SolicitudAccesoriosCompleta | null>(null);

  // Formulario Solicitud Accesorios
  const [numeroSolAccInput, setNumeroSolAccInput] = useState(`ACC-${String(solicitudesAccesorios.length + 1).padStart(5, '0')}`);
  const [solicitanteAccInput, setSolicitanteAccInput] = useState('Compras - Accesorios (Marcela Gómez)');
  const [proveedorAccInput, setProveedorAccInput] = useState('');
  const [obsSolAccInput, setObsSolAccInput] = useState('');
  const [formatoCargaAcc, setFormatoCargaAcc] = useState<'excel' | 'captura' | 'pegar' | 'manual'>('manual');

  // Muestras en borrador Accesorios (inicia en limpio para creación en tiempo real)
  const [muestrasEnCreacion, setMuestrasEnCreacion] = useState<ItemMuestraAccesorio[]>([]);

  // Fila manual borrador accesorio (4 campos exactos: Referencia, Color, Talla, QYT)
  const [borradorRef, setBorradorRef] = useState('');
  const [borradorColor, setBorradorColor] = useState('');
  const [borradorTalla, setBorradorTalla] = useState('');
  const [borradorQty, setBorradorQty] = useState('1');

  const [textoPegadoAcc, setTextoPegadoAcc] = useState('');
  const [imagenAdjuntaAcc, setImagenAdjuntaAcc] = useState<string | null>(null);
  const [nombreArchivoAdjunto, setNombreArchivoAdjunto] = useState<string>('');

  const handleAgregarFilaManualAcc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borradorRef.trim()) {
      alert('Por favor ingresa la REFERENCIA del accesorio.');
      return;
    }

    const nuevaFila: ItemMuestraAccesorio = {
      id: `acc-draft-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      referencia: borradorRef.toUpperCase().trim(),
      color: borradorColor.toUpperCase().trim() || '000',
      talla: borradorTalla.trim() || 'U',
      qty: borradorQty || '1',
      fechaIngreso: new Date().toISOString().split('T')[0],
      dictamen: 'PENDIENTE',
      accion: 'Enviar a Laboratorio'
    };

    setMuestrasEnCreacion([...muestrasEnCreacion, nuevaFila]);
    setBorradorRef('');
    setBorradorColor('');
    setBorradorTalla('');
    setBorradorQty('1');
  };

  const handleSubirExcelAccesorios = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNombreArchivoAdjunto(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      const json = leerArchivoExcel(buffer);
      const resultado = interpretarDocumentoAccesorios(json);

      if (resultado.items.length > 0) {
        setMuestrasEnCreacion(resultado.items);
        alert(`¡Se interpretaron fielmente ${resultado.items.length} muestras de accesorios desde el Excel!`);
      } else {
        alert('No se detectaron filas válidas en el archivo Excel.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleProcesarPegadoAccesorios = () => {
    if (!textoPegadoAcc.trim()) {
      alert('Por favor pega la lista o tabla de accesorios.');
      return;
    }

    const resultado = interpretarDocumentoAccesorios(textoPegadoAcc);

    if (resultado.items.length > 0) {
      setMuestrasEnCreacion(resultado.items);
      alert(`¡Se interpretaron fielmente ${resultado.items.length} accesorios pegados para previsualización!`);
      setTextoPegadoAcc('');
    } else {
      alert('No se detectaron filas válidas en el texto pegado.');
    }
  };

  /**
   * Procesa cualquier imagen (base64 o file) con OCR y extrae las muestras automáticamente
   */
  const handleProcesarImagenConOCR = async (imagenSrc: string | File, nombreArchivo: string) => {
    try {
      setProcesandoOcr(true);
      setMensajeOcr('🧠 TEXLAB Vision OCR: Analizando captura y reconociendo columnas...');

      const resultado = await extraerTextoDeImagenOCR(imagenSrc);
      
      if (typeof imagenSrc === 'string') {
        setImagenAdjuntaAcc(imagenSrc);
      }
      setNombreArchivoAdjunto(nombreArchivo);
      setTextoPegadoAcc(resultado.textoCompleto);

      if (resultado.itemsDetectados.length > 0) {
        setMuestrasEnCreacion(resultado.itemsDetectados);
        setMensajeOcr(`✨ ¡Se detectaron y extrajeron automáticamente ${resultado.itemsDetectados.length} muestras de la captura!`);
      } else {
        setMensajeOcr('⚠️ No se detectaron filas tabulares claras. Puedes agregar las muestras manualmente o pegar texto.');
      }
    } catch (err) {
      console.error('Error procesando OCR:', err);
      setMensajeOcr('Error al procesar la imagen con OCR.');
    } finally {
      setProcesandoOcr(false);
    }
  };

  const handlePegarCapturaAcc = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const dataUrl = event.target?.result as string;
            const nombre = `CAPTURA_ACC_${new Date().toISOString().slice(0, 10)}.png`;
            await handleProcesarImagenConOCR(dataUrl, nombre);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleSubirImagenArchivoAcc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      await handleProcesarImagenConOCR(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleProbarCapturaMuestra = async () => {
    // Generar captura de muestra automática
    const dataUrlMuestra = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    await handleProcesarImagenConOCR(dataUrlMuestra, 'CAPTURA_FORMATO_ACCESORIOS_STUDIO_F.png');
  };

  const handleGuardarSolicitudAccesorios = (e: React.FormEvent) => {
    e.preventDefault();
    if (muestrasEnCreacion.length === 0) {
      alert('Debes incluir al menos una muestra en la solicitud.');
      return;
    }

    const nuevaSolicitud: Omit<SolicitudAccesoriosCompleta, 'id'> = {
      numeroSolicitud: numeroSolAccInput || `ACC-${String(solicitudesAccesorios.length + 1).padStart(5, '0')}`,
      fechaSolicitud: new Date().toISOString().split('T')[0],
      solicitante: solicitanteAccInput || 'Compras - Accesorios',
      proveedor: proveedorAccInput || 'PROVEEDOR DE ACCESORIOS',
      observacionesGenerales: obsSolAccInput || 'Solicitud de insumos enviada a Laboratorio.',
      estadoFlujo: 'ENVIADA',
      documentoOriginal: {
        nombreArchivo: nombreArchivoAdjunto || 'SOLICITUD_ACC.xlsx',
        tipoArchivo: formatoCargaAcc === 'excel' ? 'EXCEL' : formatoCargaAcc === 'captura' ? 'IMAGEN' : formatoCargaAcc === 'pegar' ? 'TEXTO' : 'MANUAL',
        urlData: imagenAdjuntaAcc || undefined,
        contenidoTexto: textoPegadoAcc || undefined
      },
      muestras: muestrasEnCreacion,
      estadoGlobal: 'PENDIENTE',
      totalMuestras: muestrasEnCreacion.length
    };

    agregarSolicitudAccesorios(nuevaSolicitud);
    alert(`¡Solicitud de Accesorios ${nuevaSolicitud.numeroSolicitud} con ${muestrasEnCreacion.length} muestras creada y ENVIADA A LABORATORIO exitosamente!`);

    setModalNuevaSolicitudAcc(false);
    setMuestrasEnCreacion([]);
    setTextoPegadoAcc('');
    setImagenAdjuntaAcc(null);
    setNombreArchivoAdjunto('');
  };

  // Filtrado de solicitudes Seguro
  const solicitudesTelasFiltradas = (solicitudesTelas || []).filter((sol) => {
    if (!sol) return false;
    if (!filtroBusquedaTelas) return true;
    const q = filtroBusquedaTelas.toLowerCase();
    const numSol = (sol.numeroSolicitud || '').toLowerCase();
    const prov = (sol.proveedor || '').toLowerCase();
    const solicitante = (sol.solicitante || '').toLowerCase();
    const matchSol = numSol.includes(q) || prov.includes(q) || solicitante.includes(q);
    const matchTela = (sol.telas || []).some(t => 
      (t.referencia || '').toLowerCase().includes(q) || 
      (t.color || '').toLowerCase().includes(q) || 
      (t.ocCol || '').toLowerCase().includes(q) ||
      (t.solicitudCompra || '').toLowerCase().includes(q)
    );
    return matchSol || matchTela;
  });

  const solicitudesAccFiltradas = (solicitudesAccesorios || []).filter((sol) => {
    if (!sol) return false;
    if (!filtroBusquedaAcc) return true;
    const q = filtroBusquedaAcc.toLowerCase();
    const numSol = (sol.numeroSolicitud || '').toLowerCase();
    const solicitante = (sol.solicitante || '').toLowerCase();
    const prov = (sol.proveedor || '').toLowerCase();
    const matchSol = numSol.includes(q) || solicitante.includes(q) || prov.includes(q);
    const matchMuestra = (sol.muestras || []).some(m => 
      (m.referencia || '').toLowerCase().includes(q) || 
      (m.color || '').toLowerCase().includes(q) ||
      (m.descripcionInsumo || '').toLowerCase().includes(q)
    );
    return matchSol || matchMuestra;
  });

  return (
    <div className="space-y-6">
      
      {/* Banner Principal de Compras */}
      <div className="bg-[#2B2B2E] border border-[#424246] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[#FBF8F2]">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-2xl bg-[#C6A466]/10 text-[#C6A466] border border-[#C6A466]/20 flex items-center justify-center shrink-0 shadow-md">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-sans">3. Módulo de Compras</h2>
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[#00b4d8]/15 text-[#008db0] dark:text-[#38bdf8] border border-[#00b4d8]/30 font-mono tracking-wider">
                GENERACIÓN & ENVÍO DE SOLICITUDES A LABORATORIO
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
              Compras genera y envía solicitudes para evaluación técnica. <strong className="text-slate-900 dark:text-white">No realiza ensayos ni administra fichas técnicas de proveedores.</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setModalPapeleraAbierto(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Ver solicitudes eliminadas"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Papelera ({papelera.length})</span>
          </button>

          {subseccionActiva === 'telas' ? (
            <button
              onClick={() => {
                setNumSolTelaInput(`SOL-TEL-${new Date().getFullYear()}-${String(solicitudesTelas.length + 1).padStart(3, '0')}`);
                setModalNuevaSolTelas(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#C6A466] hover:bg-[#B59355] text-[#1E1E21] font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nueva Solicitud Telas (Excel / Manual)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setNumeroSolAccInput(`ACC-${String(solicitudesAccesorios.length + 1).padStart(5, '0')}`);
                setModalNuevaSolicitudAcc(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#C6A466] hover:bg-[#B59355] text-[#1E1E21] font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nueva Solicitud Insumos (Excel / Captura / Manual)</span>
            </button>
          )}
        </div>
      </div>

      {/* Selector de Subsecciones: 🧵 Telas vs 🔩 Insumos */}
      <div className="flex justify-center sm:justify-start">
        <div className="inline-flex items-center p-1.5 bg-[#1E1E21] rounded-2xl border border-[#38383B] shadow-md gap-1">
          
          <button
            type="button"
            onClick={() => setSubseccionActiva('telas')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer ${
              subseccionActiva === 'telas'
                ? 'bg-[#C6A466] text-[#1E1E21] shadow-md font-extrabold'
                : 'text-[#A8A095] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <span className="text-base">🧵</span>
            <span>Telas ({solicitudesTelas.length} Solicitudes de Ensayos)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubseccionActiva('accesorios')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer ${
              subseccionActiva === 'accesorios'
                ? 'bg-[#C6A466] text-[#1E1E21] shadow-md font-extrabold'
                : 'text-[#A8A095] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <span className="text-base">🔩</span>
            <span>Insumos ({solicitudesAccesorios.length} Solicitudes de Insumos)</span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUBSECCIÓN: TELAS (1 SOLICITUD -> 1 O VARIAS TELAS)                    */}
      {/* ========================================================================= */}
      {subseccionActiva === 'telas' && (
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 shadow-xs space-y-5 text-[#2D2D30]">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EFECE6] dark:border-[#38383B] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🧵</span>
                  <span>Compras - Solicitudes de Ensayos para Telas</span>
                </h3>
                <span className="text-xs bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-500/30">
                  {solicitudesTelasFiltradas.length} Solicitudes Registradas
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                Una solicitud puede contener una o varias telas enviadas en el mismo formato. <strong className="text-blue-700 dark:text-blue-300">Flujo: Compras ➔ Solicitud ➔ Laboratorio ➔ Telas.</strong>
              </p>
            </div>

            <button
              onClick={() => {
                setNumSolTelaInput(`SOL-TEL-${new Date().getFullYear()}-${String(solicitudesTelas.length + 1).padStart(3, '0')}`);
                setModalNuevaSolTelas(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Crear Solicitud de Telas</span>
            </button>
          </div>

          {/* Barra de Búsqueda */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filtroBusquedaTelas}
              onChange={(e) => setFiltroBusquedaTelas(e.target.value)}
              placeholder="Buscar por # Solicitud, Referencia de Tela, Proveedor, #OC..."
              className="w-full pl-10 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* LISTA DE SOLICITUDES DE TELAS */}
          <div className="space-y-4">
            {solicitudesTelasFiltradas.map((sol) => {
              const estaExpandida = solicitudTelaExpandidaId === sol.id;

              return (
                <div key={sol.id} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg transition-all">
                  
                  {/* Cabecera de la Solicitud de Telas */}
                  <div 
                    onClick={() => setSolicitudTelaExpandidaId(estaExpandida ? null : sol.id)}
                    className="p-4 bg-slate-900/80 hover:bg-slate-850 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80"
                  >
                    <div className="flex items-center gap-3">
                      <button className="p-1 text-slate-400 hover:text-white">
                        {estaExpandida ? <ChevronDown className="w-5 h-5 text-blue-400" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-blue-300">
                            {sol.numeroSolicitud}
                          </span>
                          <span className="text-[11px] font-bold bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded-full border border-blue-500/30">
                            {sol.telas.length} Telas en este formato
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            sol.estadoFlujo === 'ENVIADA' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                            sol.estadoFlujo === 'RECIBIDA' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            sol.estadoFlujo === 'EN_PROCESO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            sol.estadoFlujo === 'FINALIZADA' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            Estado: {sol.estadoFlujo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Fecha: <strong className="text-slate-300 font-mono">{sol.fechaSolicitud}</strong> • Solicitante: <strong className="text-slate-300">{sol.solicitante}</strong> • Proveedor: <strong className="text-slate-300">{sol.proveedor}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {sol.documentoOriginal?.nombreArchivo && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                          <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                          {sol.documentoOriginal.nombreArchivo}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSolicitudTelaVerDetalle(sol);
                        }}
                        className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Ver Documento & Detalle
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`¿Enviar la solicitud de telas ${sol.numeroSolicitud} a la papelera de reciclaje?`)) {
                            eliminarSolicitudTelas(sol.id, 'compras');
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar solicitud de telas (enviar a papelera)"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>
                  </div>

                  {/* Tabla de Telas contenidas en la solicitud */}
                  {estaExpandida && (
                    <div className="p-4 bg-slate-950/90 overflow-x-auto space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                        <span className="font-bold text-slate-300">Telas enviadas a Laboratorio para ensayo:</span>
                        <span>{sol.telas.length} telas registradas en esta solicitud</span>
                      </div>

                      <table className="w-full text-left text-xs text-slate-200 border border-slate-800 rounded-lg overflow-hidden">
                        <thead className="bg-[#6ba3df] text-slate-950 font-black uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-2.5 px-3">SOLICITUD DE COMPRA</th>
                            <th className="py-2.5 px-3">REFERENCIA</th>
                            <th className="py-2.5 px-3">COLOR</th>
                            <th className="py-2.5 px-3">PROVEEDOR</th>
                            <th className="py-2.5 px-3"># OC COL</th>
                            <th className="py-2.5 px-4">OBSERVACIÓN</th>
                            <th className="py-2.5 px-4">RESULTADO LABORATORIO</th>
                            <th className="py-2.5 px-3 text-center">DICTAMEN LAB</th>
                            <th className="py-2.5 px-3 text-center">DECISIÓN COMPRAS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-medium">
                          {sol.telas.map((t) => {
                            const tieneRespuestaLab = t.dictamen && t.dictamen !== 'PENDIENTE' && t.dictamen !== 'EN_PROCESO';
                            const decision = t.decisionCompra?.decision;

                            return (
                              <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="py-2.5 px-3 font-mono font-bold text-amber-300">{t.solicitudCompra}</td>
                                <td className="py-2.5 px-3 font-extrabold text-white">{t.referencia}</td>
                                <td className="py-2.5 px-3 text-slate-300">{t.color}</td>
                                <td className="py-2.5 px-3 text-blue-300 font-semibold">{t.proveedor}</td>
                                <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{t.ocCol}</td>
                                <td className="py-2.5 px-4 text-slate-300 text-xs">{t.observacion}</td>
                                <td className="py-2.5 px-4 text-xs font-semibold text-amber-300 max-w-xs">
                                  {t.resultadoLab || <span className="text-slate-500 italic">En evaluación en Laboratorio</span>}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <Badge tipo="dictamen" valor={t.dictamen || 'EN_PROCESO'} size="sm" />
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  {tieneRespuestaLab ? (
                                    decision === 'COMPRAR' ? (
                                      <div className="flex flex-col items-center gap-1">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-black">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                          <span>COMPRA APROBADA</span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setTelaParaDecision({ solicitud: sol, tela: t })}
                                          className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-0.5"
                                        >
                                          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                          <span>Ver Alertas Emitidas</span>
                                        </button>
                                      </div>
                                    ) : decision === 'NO_COMPRAR' ? (
                                      <div className="flex flex-col items-center gap-1">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-black">
                                          <Ban className="w-3 h-3 text-rose-400" />
                                          <span>NO COMPRADA</span>
                                        </span>
                                        <span className="text-[9px] text-slate-400 italic">Proceso Detenido</span>
                                        <button
                                          type="button"
                                          onClick={() => setTelaParaDecision({ solicitud: sol, tela: t })}
                                          className="text-[9px] text-rose-400 hover:underline"
                                        >
                                          Ver Motivo
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setTelaParaDecision({ solicitud: sol, tela: t })}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-[11px] rounded-lg shadow-md transition-transform active:scale-95 animate-pulse"
                                        title="Laboratorio emitió dictamen. Decide si se compra o se descarta."
                                      >
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                        <span>DECIDIR COMPRA</span>
                                      </button>
                                    )
                                  ) : (
                                    <span className="text-[10px] text-slate-500 italic">Esperando Dictamen Lab</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUBSECCIÓN: ACCESORIOS (1 SOLICITUD -> MÚLTIPLES MUESTRAS)             */}
      {/* ========================================================================= */}
      {subseccionActiva === 'accesorios' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white flex items-center gap-2" style={{ color: '#ffffff' }}>
                  <span>🔩</span>
                  <span className="text-white font-black" style={{ color: '#ffffff' }}>Compras - Solicitudes de Insumos</span>
                </h3>
                <span className="text-xs bg-purple-500/25 text-purple-200 font-black px-2.5 py-0.5 rounded-full border border-purple-500/40">
                  {solicitudesAccFiltradas.length} Solicitudes Activas
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1 font-medium" style={{ color: '#e2e8f0' }}>
                Una sola solicitud de insumos agrupa múltiples muestras. ⚠️ <strong className="text-purple-300 font-bold">Si una referencia se repite, se conserva cada muestra de manera independiente con su ID.</strong>
              </p>
            </div>

            <button
              onClick={() => {
                setNumeroSolAccInput(`ACC-${String(solicitudesAccesorios.length + 1).padStart(5, '0')}`);
                setModalNuevaSolicitudAcc(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Crear Solicitud de Insumos</span>
            </button>
          </div>

          {/* Buscador de Solicitudes y Muestras */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filtroBusquedaAcc}
              onChange={(e) => setFiltroBusquedaAcc(e.target.value)}
              placeholder="Buscar por # Solicitud, Referencia (ej: MI00409922), Insumo..."
              className="w-full pl-10 pr-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* LISTA DE SOLICITUDES DE ACCESORIOS EXPANDIBLES */}
          <div className="space-y-4">
            {solicitudesAccFiltradas.map((sol) => {
              const estaExpandida = solicitudExpandidaId === sol.id;

              return (
                <div key={sol.id} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg transition-all text-slate-200">
                  
                  {/* Cabecera de la Solicitud */}
                  <div 
                    onClick={() => setSolicitudExpandidaId(estaExpandida ? null : sol.id)}
                    className="p-4 bg-slate-900/90 hover:bg-slate-850 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <button className="p-1 text-slate-400 hover:text-white">
                        {estaExpandida ? <ChevronDown className="w-5 h-5 text-purple-400" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-sm text-purple-300">
                            {sol.numeroSolicitud}
                          </span>
                          <span className="text-[11px] font-bold bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded-full border border-purple-500/30">
                            {sol.muestras.length} Insumos
                          </span>
                          
                          {/* 4 Estados Claros Solicitados por el Usuario */}
                          {sol.estadoGlobal === 'RECHAZADO' || sol.muestras.some(m => m.dictamen === 'RECHAZADO') ? (
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              🔴 NO OK
                            </span>
                          ) : sol.estadoFlujo === 'FINALIZADA' ? (
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              🟢 RESPONDIDA
                            </span>
                          ) : sol.estadoFlujo === 'EN_PROCESO' ? (
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase bg-sky-500/20 text-sky-300 border border-sky-500/40">
                              🔵 EN REVISIÓN
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              🟡 PENDIENTE DE LABORATORIO
                            </span>
                          )}

                          <Badge tipo="dictamen" valor={sol.estadoGlobal} size="sm" />
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Fecha: <strong className="text-white font-mono font-bold">{sol.fechaSolicitud}</strong> • Solicitante: <strong className="text-white font-bold">{sol.solicitante}</strong> • Proveedor: <strong className="text-white font-bold">{sol.proveedor || 'No especificado'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {sol.documentoOriginal?.nombreArchivo && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                          <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                          {sol.documentoOriginal.nombreArchivo}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSolicitudVerDetalle(sol);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-black transition-all shadow cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>[ VER RESPUESTA DE LABORATORIO ]</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`¿Enviar la solicitud de insumos ${sol.numeroSolicitud} a la papelera de reciclaje?`)) {
                            eliminarSolicitudAccesorios(sol.id, 'compras');
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar solicitud de insumos (enviar a papelera)"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>
                  </div>

                  {/* Tabla interna de Muestras contenidas en la solicitud */}
                  {estaExpandida && (
                    <div className="p-4 bg-slate-950/90 overflow-x-auto space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300 pb-1">
                        <span className="font-bold text-white">Muestras enviadas a Laboratorio:</span>
                        <span className="text-slate-300 font-medium">{sol.muestras.length} muestras independientes registradas</span>
                      </div>

                      <table className="w-full text-left text-xs text-slate-200 border border-slate-800 rounded-lg overflow-hidden">
                        <thead className="bg-[#6ba3df] text-slate-950 font-black uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-2.5 px-3">REFERENCIA</th>
                            <th className="py-2.5 px-3">COLOR</th>
                            <th className="py-2.5 px-2 text-center">TALLA</th>
                            <th className="py-2.5 px-2 text-center">QYT</th>
                            <th className="py-2.5 px-4">RESULTADO LAB (TEXTO LIBRE)</th>
                            <th className="py-2.5 px-3 text-center">F. INGRESO</th>
                            <th className="py-2.5 px-3 text-center">F. ENTREGA</th>
                            <th className="py-2.5 px-3 text-center">ESTADO</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-medium">
                          {sol.muestras.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-2 px-3 font-mono font-black text-amber-300">{m.referencia}</td>
                              <td className="py-2 px-3 font-bold text-slate-200">{m.color}</td>
                              <td className="py-2 px-2 text-center font-bold text-slate-300 font-mono">{m.talla}</td>
                              <td className="py-2 px-2 text-center font-mono font-bold text-purple-300">{m.qty}</td>
                              <td className="py-2 px-4 text-slate-300 text-xs">{m.descripcionInsumo || 'Insumo sin descripción'}</td>
                              <td className="py-2 px-4 text-xs font-semibold text-amber-300 max-w-xs">
                                {m.resultado || <span className="text-slate-500 italic">En evaluación en Laboratorio</span>}
                              </td>
                              <td className="py-2 px-3 text-center font-mono text-slate-400">{m.fechaIngreso}</td>
                              <td className="py-2 px-3 text-center font-mono text-slate-400">{m.fechaEntrega || '-'}</td>
                              <td className="py-2 px-3 text-center">
                                <Badge tipo="dictamen" valor={m.dictamen} size="sm" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CREAR SOLICITUD DE TELAS (CON PREVISUALIZACIÓN)                     */}
      {/* ========================================================================= */}
      {modalNuevaSolTelas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#2B2B2E] border border-[#424246] rounded-2xl shadow-2xl p-6 my-8 text-[#FBF8F2] space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#424246] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#C6A466] flex items-center gap-2">
                  <span>🧵</span>
                  <span>Crear Solicitud de Ensayos para Telas</span>
                </h3>
                <p className="text-xs text-[#AA9E80]">
                  Una solicitud agrupa las telas a ensayar. Revisa la vista previa antes de enviar a Laboratorio.
                </p>
              </div>
              <button onClick={() => setModalNuevaSolTelas(false)} className="p-1.5 text-[#AA9E80] hover:text-[#C6A466] rounded-lg">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Cabecera Solicitud Telas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#2D2D30] p-3.5 rounded-xl border border-[#424246] text-xs">
              <div>
                <label className="block text-[#AA9E80] font-bold mb-1"># NÚMERO SOLICITUD:</label>
                <input
                  type="text"
                  value={numSolTelaInput}
                  onChange={(e) => setNumSolTelaInput(e.target.value)}
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-lg p-2 text-[#C6A466] font-mono font-bold focus:border-[#C6A466] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#AA9E80] font-bold mb-1">SOLICITANTE:</label>
                <input
                  type="text"
                  value={solicitanteTelaInput}
                  onChange={(e) => setSolicitanteTelaInput(e.target.value)}
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-lg p-2 text-[#FBF8F2] font-semibold focus:border-[#C6A466] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#AA9E80] font-bold mb-1">PROVEEDOR PRINCIPAL:</label>
                <input
                  type="text"
                  value={proveedorTelaInput}
                  onChange={(e) => setProveedorTelaInput(e.target.value)}
                  placeholder="ej: SHANGHAI JOY TEX"
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-lg p-2 text-[#FBF8F2] font-semibold focus:border-[#C6A466] focus:outline-none"
                />
              </div>
            </div>

            {/* Métodos de Carga para Telas */}
            <div className="grid grid-cols-3 gap-2 bg-[#2D2D30] p-1.5 rounded-xl border border-[#424246] text-xs font-bold">
              <button
                type="button"
                onClick={() => setFormatoCargaTela('manual')}
                className={`py-2 rounded-lg transition-all ${formatoCargaTela === 'manual' ? 'bg-[#C6A466] text-[#2B2B2E] font-black shadow' : 'text-[#AA9E80] hover:text-[#FBF8F2]'}`}
              >
                1. Manual (Fila x Fila)
              </button>
              <button
                type="button"
                onClick={() => setFormatoCargaTela('excel')}
                className={`py-2 rounded-lg transition-all ${formatoCargaTela === 'excel' ? 'bg-[#C6A466] text-[#2B2B2E] font-black shadow' : 'text-[#AA9E80] hover:text-[#FBF8F2]'}`}
              >
                2. Subir Excel (.xlsx / .csv)
              </button>
              <button
                type="button"
                onClick={() => setFormatoCargaTela('pegar')}
                className={`py-2 rounded-lg transition-all ${formatoCargaTela === 'pegar' ? 'bg-[#C6A466] text-[#2B2B2E] font-black shadow' : 'text-[#AA9E80] hover:text-[#FBF8F2]'}`}
              >
                3. Copiar & Pegar Tabla
              </button>
            </div>

            {formatoCargaTela === 'manual' && (
              <div className="bg-[#2D2D30] p-4 rounded-xl border border-[#424246] space-y-3 text-xs">
                <span className="font-bold text-[#FBF8F2] block">Agregar tela a la solicitud:</span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  <input
                    placeholder="SOLICITUD COMPRA (SC)"
                    value={borradorScTela}
                    onChange={(e) => setBorradorScTela(e.target.value)}
                    className="bg-[#2B2B2E] border border-[#424246] p-2 rounded-lg text-[#FBF8F2] font-mono font-bold focus:border-[#C6A466] focus:outline-none"
                  />
                  <input
                    placeholder="REFERENCIA *"
                    value={borradorRefTela}
                    onChange={(e) => setBorradorRefTela(e.target.value)}
                    className="bg-[#2B2B2E] border border-[#424246] p-2 rounded-lg text-[#FBF8F2] font-bold focus:border-[#C6A466] focus:outline-none"
                  />
                  <input
                    placeholder="COLOR"
                    value={borradorColorTela}
                    onChange={(e) => setBorradorColorTela(e.target.value)}
                    className="bg-[#2B2B2E] border border-[#424246] p-2 rounded-lg text-[#FBF8F2] focus:border-[#C6A466] focus:outline-none"
                  />
                  <input
                    placeholder="PROVEEDOR"
                    value={borradorProvTela}
                    onChange={(e) => setBorradorProvTela(e.target.value)}
                    className="bg-[#2B2B2E] border border-[#424246] p-2 rounded-lg text-[#FBF8F2] focus:border-[#C6A466] focus:outline-none"
                  />
                  <input
                    placeholder="# OC COL"
                    value={borradorOcTela}
                    onChange={(e) => setBorradorOcTela(e.target.value)}
                    className="bg-[#2B2B2E] border border-[#424246] p-2 rounded-lg text-[#FBF8F2] font-mono font-bold focus:border-[#C6A466] focus:outline-none"
                  />
                  <input
                    placeholder="OBSERVACION"
                    value={borradorObsTela}
                    onChange={(e) => setBorradorObsTela(e.target.value)}
                    className="bg-[#2B2B2E] border border-[#424246] p-2 rounded-lg text-[#FBF8F2] focus:border-[#C6A466] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAgregarFilaTelaManual}
                  className="px-4 py-1.5 bg-[#C6A466] hover:bg-[#b59355] text-[#2B2B2E] font-black rounded-lg shadow text-xs flex items-center gap-1 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Agregar Tela a la Lista</span>
                </button>
              </div>
            )}

            {formatoCargaTela === 'excel' && (
              <div className="bg-[#2D2D30] p-4 rounded-xl border border-[#424246] space-y-2 text-xs">
                <label className="block font-bold text-[#FBF8F2]">
                  Selecciona archivo Excel con columnas: <strong className="text-[#C6A466]">SOLICITUD DE COMPRA | REFERENCIA | COLOR | PROVEEDOR | # OC COL | OBSERVACION</strong>
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleSubirExcelTelas}
                  className="block w-full text-xs text-[#AA9E80] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#C6A466] file:text-[#2B2B2E] hover:file:bg-[#b59355] cursor-pointer"
                />
              </div>
            )}

            {formatoCargaTela === 'pegar' && (
              <div className="bg-[#2D2D30] p-4 rounded-xl border border-[#424246] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#FBF8F2]">Pega los datos de la solicitud (formato vertical o tabla):</label>
                  <span className="text-[11px] text-[#C6A466] font-semibold">Soporta múltiples telas copiadas de texto o Excel</span>
                </div>
                <textarea
                  rows={6}
                  value={textoPegadoTelas}
                  onChange={(e) => setTextoPegadoTelas(e.target.value)}
                  placeholder={`SOLICITUD DE COMPRA: SF_TEL_005941\nREFERENCIA: TELA NYLON BORDADO LIBIA\nCOLOR: 246 - MOKA\nPROVEEDOR: SHAOXING  MING HEE EMBROIDERY CO., LTD \n# OC COL: 106782\nOBSERVACION:`}
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-lg p-2.5 text-xs font-mono text-[#FBF8F2] focus:border-white focus:shadow-[0_0_25px_rgba(255,255,255,0.5)] focus:shadow-[#C6A466]/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.35)] focus:outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={handleProcesarPegadoTelas}
                  className="px-4 py-2 bg-gradient-to-r from-[#C6A466] to-[#b59355] hover:from-[#e5c486] hover:to-[#c6a466] text-[#2B2B2E] font-black rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] hover:shadow-[#C6A466] transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  Extraer y Previsualizar Telas
                </button>
              </div>
            )}

            {/* PREVISUALIZACIÓN DE TELAS EN LA SOLICITUD */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#FBF8F2] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#C6A466]" />
                  Previsualización de Registros Detectados:
                </span>
                <span className="text-xs font-bold bg-[#C6A466]/20 text-[#C6A466] px-2.5 py-0.5 rounded-full border border-[#C6A466]/30 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  {telasEnCreacion.length} {telasEnCreacion.length === 1 ? 'Referencia cargada' : 'Referencias cargadas'}
                </span>
              </div>

              {/* Resumen Card de Datos Detectados & Muestras Físicas */}
              {telasEnCreacion.length > 0 && (() => {
                const resM = calcularResumenMuestrasFisicas(telasEnCreacion).resumen;
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-[#2D2D30] p-3 rounded-xl border border-[#424246] text-xs font-bold text-[#FBF8F2]">
                    <div className="flex items-center gap-2">
                      <span className="text-base text-[#C6A466]">📊</span>
                      <div>
                        <span className="block text-[9px] text-[#AA9E80] uppercase tracking-wider">Total Referencias (Filas):</span>
                        <span className="text-xs font-black text-[#FBF8F2]">{resM.totalReferencias} Referencias</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base text-emerald-400">🧪</span>
                      <div>
                        <span className="block text-[9px] text-[#AA9E80] uppercase tracking-wider">Muestras Físicas a Ensayar:</span>
                        <span className="text-xs font-black text-emerald-400">{resM.totalMuestrasFisicas} Muestras Físicas</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base text-amber-400">🔗</span>
                      <div>
                        <span className="block text-[9px] text-[#AA9E80] uppercase tracking-wider">Agrupaciones Muestra Única:</span>
                        <span className="text-xs font-black text-amber-400">{resM.totalAgrupaciones} Agrupación(es)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {resM.totalIncompletos > 0 ? '⚠️' : '✅'}
                      </span>
                      <div>
                        <span className="block text-[9px] text-[#AA9E80] uppercase tracking-wider">Estado Validación:</span>
                        {resM.totalIncompletos > 0 ? (
                          <span className="text-xs font-black text-rose-400">{resM.totalIncompletos} Incompleto(s)</span>
                        ) : (
                          <span className="text-xs font-black text-emerald-400">100% Completo y Válido</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Banner de Detección de Regla Misma Tela */}
              {telasEnCreacion.some(t => t.esMuestraCompartida || /aplica\s*1\s*sola\s*muestra|misma\s*tela/i.test(t.observacion || '')) && (
                <div className="bg-[#C6A466]/15 border border-[#C6A466]/40 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#FBF8F2] animate-fade-in hover:shadow-[0_0_25px_rgba(255,255,255,0.45)] hover:shadow-[#C6A466]/50 hover:border-white transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C6A466] shrink-0" />
                    <span>
                      <strong className="text-[#C6A466]">🔗 REGLA APLICADA:</strong> Se detectó <em>"APLICA 1 SOLA MUESTRA PARA LAS DOS, ES LA MISMA TELA"</em>. Se generará <strong>1 sola solicitud técnica consolidada</strong> para Laboratorio.
                    </span>
                  </div>
                  <span className="text-[10px] bg-[#C6A466]/30 text-[#C6A466] font-black px-2 py-0.5 rounded uppercase border border-[#C6A466]/40">
                    1 SOLA SOLICITUD
                  </span>
                </div>
              )}

              <div className="max-h-80 overflow-y-auto rounded-xl border border-[#424246] shadow-sm hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] hover:shadow-[#C6A466]/60 hover:border-white transition-all duration-300">
                <table className="w-full text-left text-xs text-[#FBF8F2]">
                  <thead className="bg-[#C6A466] text-[#2B2B2E] font-black uppercase text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-2 text-center w-8">#</th>
                      <th className="py-2.5 px-3">CÓDIGO (SC)</th>
                      <th className="py-2.5 px-3">TELA (REFERENCIA)</th>
                      <th className="py-2.5 px-3">COLOR</th>
                      <th className="py-2.5 px-3">PROVEEDOR</th>
                      <th className="py-2.5 px-3"># OC COL</th>
                      <th className="py-2.5 px-4">OBSERVACIÓN</th>
                      <th className="py-2.5 px-3 text-center">MUESTRA FÍSICA</th>
                      <th className="py-2.5 px-3 text-center">ESTADO</th>
                      <th className="py-2.5 px-2 text-center">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#424246] bg-[#2D2D30] font-medium">
                    {telasEnCreacion.map((t, idx) => {
                      const matchFT = consultarFichaTecnicaHistorica(t.referencia, t.proveedor);
                      const esMuestraUnica = t.esMuestraCompartida || /aplica\s*1\s*sola\s*muestra|misma\s*tela/i.test(t.observacion || '');

                      return (
                        <tr key={t.id} className={`hover:bg-[#353538] hover:shadow-[0_2px_12px_rgba(255,255,255,0.06)] transition-all duration-200 ${t.incompleto ? 'bg-rose-500/10 border-l-4 border-l-rose-500' : ''}`}>
                          <td className="py-2 px-2 text-center font-mono font-bold text-[#AA9E80] text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-[#C6A466]">
                            {t.solicitudCompra || <span className="text-rose-400 italic">Falta Código</span>}
                          </td>
                          <td className="py-2 px-3 font-extrabold text-[#FBF8F2]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span>{t.referencia || <span className="text-rose-400 italic">Falta Tela</span>}</span>
                              {matchFT && (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30" title={`Ficha Técnica ${matchFT.ficha.codigoFT} v${matchFT.version.version} disponible`}>
                                  FT v{matchFT.version.version}
                                </span>
                              )}
                              {esMuestraUnica && (
                                <span className="text-[9px] bg-[#C6A466]/20 text-[#C6A466] px-1.5 py-0.2 rounded border border-[#C6A466]/30 font-bold" title="Aplica 1 sola muestra para las dos, es la misma tela">
                                  🔗 Misma Tela
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-[#FBF8F2]">
                            {t.color || <span className="text-rose-400 italic">Falta Color</span>}
                          </td>
                          <td className="py-2 px-3 text-[#C6A466] font-semibold">
                            {t.proveedor || <span className="text-rose-400 italic">Falta Proveedor</span>}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-[#C6A466]">
                            {t.ocCol || <span className="text-rose-400 italic">Falta OC</span>}
                          </td>
                          <td className="py-2 px-4 text-xs max-w-xs truncate">
                            {t.observacion ? (
                              <span className={esMuestraUnica ? 'text-[#C6A466] font-bold' : 'text-[#AA9E80]'}>
                                {t.observacion}
                              </span>
                            ) : (
                              <span className="text-[#666668] italic">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.esMuestraCompartida 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {t.etiquetaMuestraFisica || `Muestra ${t.muestraFisicaNumero || idx + 1}`}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {t.incompleto ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[10px] font-black" title={t.motivoIncompleto}>
                                <AlertCircle className="w-3 h-3 text-rose-400" />
                                <span>Incompleto</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-black">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Válido</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => setTelasEnCreacion(telasEnCreacion.filter(x => x.id !== t.id))}
                              className="p-1 text-[#AA9E80] hover:text-rose-400 rounded transition-colors"
                              title="Eliminar de la lista"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#424246]">
              <button
                type="button"
                onClick={() => setModalNuevaSolTelas(false)}
                className="px-4 py-2 bg-[#2D2D30] text-[#AA9E80] hover:text-[#FBF8F2] font-bold text-xs rounded-xl border border-[#424246] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardarSolicitudTelas}
                disabled={telasEnCreacion.length === 0}
                className="px-6 py-2 bg-[#C6A466] hover:bg-[#b59355] text-[#2B2B2E] font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Confirmar y Enviar Solicitud ({telasEnCreacion.length} Telas) a Laboratorio</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CREAR SOLICITUD DE ACCESORIOS (CON PREVISUALIZACIÓN)               */}
      {/* ========================================================================= */}
      {modalNuevaSolicitudAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
          <div className="relative w-full max-w-4xl bg-[#2B2B2E] border border-[#424246] rounded-3xl shadow-2xl p-6 my-8 text-[#FBF8F2] space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#424246] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/40">
                  <span>🔩</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-black uppercase text-[#FBF8F2] flex items-center gap-2">
                    <span>Crear Solicitud de Accesorios (Una solicitud con múltiples muestras)</span>
                  </h3>
                  <p className="text-xs text-[#AA9E80] font-bold mt-0.5">
                    Carga tus muestras por Excel, captura de imagen, pegando tabla o ingresando fila por fila.
                  </p>
                </div>
              </div>
              <button onClick={() => setModalNuevaSolicitudAcc(false)} className="p-2 text-[#AA9E80] hover:text-white hover:bg-[#424246] rounded-xl cursor-pointer transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Cabecera Solicitud Accesorios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#2D2D30] p-4 rounded-2xl border border-[#424246] text-xs">
              <div>
                <label className="block text-[#AA9E80] font-black uppercase mb-1"># NÚMERO SOLICITUD:</label>
                <input
                  type="text"
                  value={numeroSolAccInput}
                  onChange={(e) => setNumeroSolAccInput(e.target.value)}
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-[#C6A466] font-mono font-bold focus:outline-none focus:border-[#C6A466]"
                />
              </div>
              <div>
                <label className="block text-[#AA9E80] font-black uppercase mb-1">SOLICITANTE:</label>
                <input
                  type="text"
                  value={solicitanteAccInput}
                  onChange={(e) => setSolicitanteAccInput(e.target.value)}
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466]"
                />
              </div>
              <div>
                <label className="block text-[#AA9E80] font-black uppercase mb-1">PROVEEDOR:</label>
                <input
                  type="text"
                  value={proveedorAccInput}
                  onChange={(e) => setProveedorAccInput(e.target.value)}
                  placeholder="ej: HERRAJES DEL VALLE"
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466] placeholder-[#AA9E80]"
                />
              </div>
            </div>

            {/* Métodos de Carga */}
            <div className="grid grid-cols-4 gap-2 bg-[#2D2D30] p-2 rounded-2xl border border-[#424246] text-xs font-black uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setFormatoCargaAcc('manual')}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${formatoCargaAcc === 'manual' ? 'bg-[#C6A466] text-[#1E1E21] shadow-md' : 'text-[#AA9E80] hover:text-white'}`}
              >
                1. Manual (Fila x Fila)
              </button>
              <button
                type="button"
                onClick={() => setFormatoCargaAcc('excel')}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${formatoCargaAcc === 'excel' ? 'bg-[#C6A466] text-[#1E1E21] shadow-md' : 'text-[#AA9E80] hover:text-white'}`}
              >
                2. Excel (.xlsx / .csv)
              </button>
              <button
                type="button"
                onClick={() => setFormatoCargaAcc('pegar')}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${formatoCargaAcc === 'pegar' ? 'bg-[#C6A466] text-[#1E1E21] shadow-md' : 'text-[#AA9E80] hover:text-white'}`}
              >
                3. Copiar & Pegar
              </button>
              <button
                type="button"
                onClick={() => setFormatoCargaAcc('captura')}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${formatoCargaAcc === 'captura' ? 'bg-[#C6A466] text-[#1E1E21] shadow-md' : 'text-[#AA9E80] hover:text-white'}`}
              >
                4. Captura (Ctrl+V)
              </button>
            </div>

            {formatoCargaAcc === 'manual' && (
              <div className="bg-[#2D2D30] p-4 rounded-2xl border border-[#424246] space-y-3 text-xs">
                <span className="font-black text-[#C6A466] uppercase tracking-wider block">Agregar muestra (4 campos exactos del formato):</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-black text-[#AA9E80] uppercase mb-1">REFERENCIA *</label>
                    <input
                      placeholder="ej: MI00409922"
                      value={borradorRef}
                      onChange={(e) => setBorradorRef(e.target.value)}
                      className="w-full bg-[#2B2B2E] border border-[#424246] p-2 rounded-xl text-[#FBF8F2] font-mono font-bold focus:outline-none focus:border-[#C6A466]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#AA9E80] uppercase mb-1">COLOR</label>
                    <input
                      placeholder="ej: 000, 71, 071"
                      value={borradorColor}
                      onChange={(e) => setBorradorColor(e.target.value)}
                      className="w-full bg-[#2B2B2E] border border-[#424246] p-2 rounded-xl text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#AA9E80] uppercase mb-1">TALLA</label>
                    <input
                      placeholder="ej: 6, 8, U"
                      value={borradorTalla}
                      onChange={(e) => setBorradorTalla(e.target.value)}
                      className="w-full bg-[#2B2B2E] border border-[#424246] p-2 rounded-xl text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#AA9E80] uppercase mb-1">QYT</label>
                    <input
                      placeholder="ej: 1, 2"
                      value={borradorQty}
                      onChange={(e) => setBorradorQty(e.target.value)}
                      className="w-full bg-[#2B2B2E] border border-[#424246] p-2 rounded-xl text-[#C6A466] font-bold font-mono focus:outline-none focus:border-[#C6A466]"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAgregarFilaManualAcc}
                  className="px-4 py-2 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#1E1E21] font-black rounded-xl shadow text-xs flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-all"
                >
                  <PlusCircle className="w-4 h-4 stroke-[3]" />
                  <span>+ Agregar Muestra a la Lista</span>
                </button>
              </div>
            )}

            {formatoCargaAcc === 'excel' && (
              <div className="bg-[#2D2D30] p-4 rounded-2xl border border-[#424246] space-y-2 text-xs">
                <label className="block font-black text-[#AA9E80] uppercase">
                  Selecciona archivo Excel con las 4 columnas del formato: <strong className="text-[#C6A466]">REFERENCIA | COLOR | TALLA | QYT</strong>
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleSubirExcelAccesorios}
                  className="block w-full text-xs text-[#AA9E80] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#C6A466] file:text-[#1E1E21] hover:file:bg-[#D6CDB8] cursor-pointer"
                />
              </div>
            )}

            {formatoCargaAcc === 'pegar' && (
              <div className="bg-[#2D2D30] p-4 rounded-2xl border border-[#424246] space-y-2 text-xs">
                <label className="block font-black text-[#AA9E80] uppercase">Pega la tabla copiada con las 4 columnas (REFERENCIA, COLOR, TALLA, QYT):</label>
                <textarea
                  rows={5}
                  value={textoPegadoAcc}
                  onChange={(e) => setTextoPegadoAcc(e.target.value)}
                  placeholder="REFERENCIA	COLOR	TALLA	QYT
MI00409922	000	6	1
MI00412604	71	6	1
MI00406583	280	6	1"
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-3 text-xs font-mono text-[#FBF8F2] focus:outline-none focus:border-white focus:shadow-[0_0_25px_rgba(255,255,255,0.5)] focus:shadow-[#C6A466]/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.35)] transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={handleProcesarPegadoAccesorios}
                  className="px-4 py-2 bg-[#C6A466] hover:bg-[#E5C486] text-[#1E1E21] font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] hover:shadow-[#C6A466] transition-all duration-200"
                >
                  Extraer Filas para Previsualización
                </button>
              </div>
            )}

            {formatoCargaAcc === 'captura' && (
              <div 
                onPaste={handlePegarCapturaAcc}
                className="bg-[#2D2D30] p-5 rounded-2xl border-2 border-dashed border-[#C6A466]/40 text-center space-y-3 text-xs focus:outline-none focus:border-white hover:border-white hover:shadow-[0_0_35px_rgba(255,255,255,0.45)] hover:shadow-[#C6A466]/50 transition-all duration-200 cursor-pointer"
                tabIndex={0}
              >
                <div className="flex items-center justify-center gap-2">
                  <Camera className="w-8 h-8 text-[#C6A466] animate-pulse" />
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>

                <div>
                  <p className="font-black text-[#FBF8F2] text-sm uppercase tracking-wide">
                    Reconocimiento Óptico Automático (TEXLAB Vision OCR)
                  </p>
                  <p className="text-[#AA9E80] text-xs font-bold mt-0.5">
                    Pega una captura con <kbd className="bg-[#2B2B2E] px-2 py-0.5 rounded text-[#C6A466] font-mono font-bold">Ctrl + V</kbd> o sube una imagen del formato de Accesorios.
                  </p>
                </div>

                {/* Acciones de carga de imagen */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <label className="flex items-center gap-1.5 px-4 py-2 bg-[#C6A466] hover:bg-[#E5C486] text-[#1E1E21] font-black rounded-xl cursor-pointer transition-colors shadow uppercase tracking-wider hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] hover:shadow-[#C6A466]">
                    <Upload className="w-4 h-4" />
                    <span>Seleccionar Archivo de Imagen</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleSubirImagenArchivoAcc} 
                      className="hidden" 
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleProbarCapturaMuestra}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#2B2B2E] hover:bg-[#38383B] text-[#C6A466] border border-[#C6A466]/40 font-black rounded-xl transition-colors uppercase tracking-wider hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] hover:shadow-[#C6A466]/40"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Probar con Captura de Muestra (Auto-Lectura)</span>
                  </button>
                </div>

                {/* Indicador de procesamiento OCR */}
                {procesandoOcr && (
                  <div className="p-3 bg-[#C6A466]/20 border border-[#C6A466]/50 rounded-xl flex items-center justify-center gap-2 text-[#C6A466] font-bold animate-pulse">
                    <Clock className="w-4 h-4 text-[#C6A466] animate-spin" />
                    <span>{mensajeOcr}</span>
                  </div>
                )}

                {/* Mensaje de resultado OCR */}
                {!procesandoOcr && mensajeOcr && (
                  <div className="p-2.5 bg-[#2B2B2E] border border-[#C6A466]/40 rounded-xl text-emerald-400 font-bold text-xs">
                    {mensajeOcr}
                  </div>
                )}

                {/* Previsualización de la imagen adjunta */}
                {imagenAdjuntaAcc && (
                  <div className="mt-2 space-y-1 bg-[#2B2B2E] p-3 rounded-xl border border-[#424246] text-left hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#AA9E80] flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5 text-[#C6A466]" />
                        Imagen Original Adjunta: <strong className="text-[#C6A466]">{nombreArchivoAdjunto}</strong>
                      </span>
                      <span className="text-[11px] text-emerald-400 font-bold">✔ Extraída con Éxito</span>
                    </div>
                    {imagenAdjuntaAcc.startsWith('data:image') && (
                      <img src={imagenAdjuntaAcc} alt="Captura" className="max-h-36 mx-auto rounded border border-[#424246] mt-2 shadow" />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PREVISUALIZACIÓN DE ACCESORIOS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#FBF8F2] uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  PREVISUALIZACIÓN DE INSUMOS A ENVIAR ({muestrasEnCreacion.length} FILAS):
                </span>
                <span className="text-[11px] text-[#C6A466] font-bold">
                  ⚠️ Cada fila se conserva independiente (duplicados permitidos).
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-xl border border-[#424246] custom-vertical-scroll hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] hover:shadow-[#C6A466]/60 hover:border-white transition-all duration-300">
                <table className="w-full text-left text-xs text-[#FBF8F2]">
                  <thead className="bg-[#252528] text-[#FBF8F2] font-black uppercase text-[10px] tracking-wider border-b border-[#424246]">
                    <tr>
                      <th className="py-2.5 px-3">REFERENCIA</th>
                      <th className="py-2.5 px-3 text-center">COLOR</th>
                      <th className="py-2.5 px-2 text-center">TALLA</th>
                      <th className="py-2.5 px-2 text-center">QYT</th>
                      <th className="py-2.5 px-2 text-center">ESTADO</th>
                      <th className="py-2.5 px-3 text-center">ELIMINAR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#424246] bg-[#2D2D30] font-mono font-bold">
                    {muestrasEnCreacion.map((m) => {
                      const esIncompleto = m.incompleto || m.color === '—' || m.talla === '—' || m.qty === '—';
                      return (
                        <tr key={m.id} className={`hover:bg-[#424246] hover:shadow-[0_0_25px_rgba(255,255,255,0.45)] hover:shadow-[#C6A466]/40 transition-all duration-200 cursor-pointer ${esIncompleto ? 'bg-amber-950/30 border-l-4 border-amber-500' : ''}`}>
                          <td className="py-2 px-3 font-bold text-[#C6A466]">
                            {m.referencia}
                          </td>
                          <td className={`py-2 px-3 text-center font-bold ${m.color === '—' ? 'text-amber-400 italic font-mono' : 'text-[#FBF8F2]'}`}>{m.color}</td>
                          <td className={`py-2 px-2 text-center font-bold ${m.talla === '—' ? 'text-amber-400 italic font-mono' : 'text-[#AA9E80]'}`}>{m.talla}</td>
                          <td className={`py-2 px-2 text-center font-black ${m.qty === '—' ? 'text-amber-400 italic font-mono' : 'text-[#C6A466]'}`}>{m.qty}</td>
                          <td className="py-2 px-2 text-center">
                            {esIncompleto ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1" title={m.motivoIncompleto || 'Registro incompleto'}>
                                ⚠️ Incompleto
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                OK
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => setMuestrasEnCreacion(muestrasEnCreacion.filter(x => x.id !== m.id))}
                              className="p-1 text-[#AA9E80] hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#424246]">
              <button
                type="button"
                onClick={() => setModalNuevaSolicitudAcc(false)}
                className="px-5 py-2.5 bg-[#2D2D30] hover:bg-[#38383B] text-[#AA9E80] font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardarSolicitudAccesorios}
                disabled={muestrasEnCreacion.length === 0}
                className="px-6 py-3 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#1E1E21] font-black text-xs uppercase rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer tracking-wider"
              >
                <Send className="w-4 h-4" />
                <span>Confirmar y Enviar Solicitud ({muestrasEnCreacion.length} Muestras) a Laboratorio</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DETALLE DE SOLICITUD TELAS */}
      {solicitudTelaVerDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-blue-500/40 rounded-2xl shadow-2xl p-6 my-8 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧵</span>
                  <h3 className="text-base font-extrabold text-white">
                    Expediente Técnico de Solicitud de Telas: {solicitudTelaVerDetalle.numeroSolicitud}
                  </h3>
                  <Badge tipo="dictamen" valor={solicitudTelaVerDetalle.dictamenGlobal || 'EN_PROCESO'} size="sm" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proveedor: <strong className="text-blue-300">{solicitudTelaVerDetalle.proveedor}</strong> • {solicitudTelaVerDetalle.telas.length} telas registradas.
                </p>
              </div>
              <button onClick={() => setSolicitudTelaVerDetalle(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Bloque Destacado de Respuesta Oficial de Laboratorio */}
            <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/30 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="font-extrabold text-blue-300 flex items-center gap-1.5 text-sm">
                  <FlaskConical className="w-4 h-4 text-blue-400" />
                  RESPUESTA OFICIAL DE LABORATORIO - TELAS
                </span>
                <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                  <span>Estado: <strong className="text-emerald-400">{solicitudTelaVerDetalle.estadoFlujo}</strong></span>
                  <span>•</span>
                  <span>Dictamen Global: <strong className="text-amber-300">{solicitudTelaVerDetalle.dictamenGlobal || 'EN PROCESO'}</strong></span>
                </div>
              </div>

              {solicitudTelaVerDetalle.observacionesGenerales && (
                <p className="text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 italic">
                  "{solicitudTelaVerDetalle.observacionesGenerales}"
                </p>
              )}
            </div>

            {solicitudTelaVerDetalle.documentoOriginal && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-blue-300 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-amber-400" />
                  Documento Original de Compras-Telas:
                </span>
                <p className="text-slate-300">
                  Tipo: <strong>{solicitudTelaVerDetalle.documentoOriginal.tipoArchivo}</strong> • Archivo: <strong>{solicitudTelaVerDetalle.documentoOriginal.nombreArchivo}</strong>
                </p>
                {solicitudTelaVerDetalle.documentoOriginal.contenidoTexto && (
                  <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto">
                    {solicitudTelaVerDetalle.documentoOriginal.contenidoTexto}
                  </pre>
                )}
              </div>
            )}

            {/* Tabla de Telas y Fichas Utilizadas */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-white">Telas Evaluadas y Dictamen Técnico:</span>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-[#6ba3df] text-slate-950 font-black uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">SOLICITUD COMPRA</th>
                      <th className="py-2 px-3">REFERENCIA</th>
                      <th className="py-2 px-3">COLOR</th>
                      <th className="py-2 px-3"># OC COL</th>
                      <th className="py-2 px-4">FICHA TÉCNICA APLICADA</th>
                      <th className="py-2 px-4">RESULTADOS DE LABORATORIO</th>
                      <th className="py-2 px-3 text-center">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950 font-medium">
                    {solicitudTelaVerDetalle.telas.map((t) => (
                      <tr key={t.id}>
                        <td className="py-2 px-3 font-mono font-bold text-amber-300">{t.solicitudCompra}</td>
                        <td className="py-2 px-3 font-extrabold text-white">{t.referencia}</td>
                        <td className="py-2 px-3">{t.color}</td>
                        <td className="py-2 px-3 font-mono text-emerald-400">{t.ocCol}</td>
                        <td className="py-2 px-4">
                          {t.fichaTecnicaUtilizada ? (
                            <span className="font-mono text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                              {t.fichaTecnicaUtilizada.codigoFT} v{t.fichaTecnicaUtilizada.version}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">Sin FT vinculada</span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-xs font-mono text-amber-300">
                          {t.resultadoLab || <span className="text-slate-500 italic">En evaluación en Laboratorio</span>}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Badge tipo="dictamen" valor={t.dictamen || 'EN_PROCESO'} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSolicitudTelaVerDetalle(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE SOLICITUD ACCESORIOS */}
      {solicitudVerDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl p-6 my-8 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>🔩</span>
                  <span>Expediente de Solicitud de Accesorios: {solicitudVerDetalle.numeroSolicitud}</span>
                  <Badge tipo="dictamen" valor={solicitudVerDetalle.estadoGlobal} size="sm" />
                </h3>
                <p className="text-xs text-slate-400">
                  {solicitudVerDetalle.muestras.length} muestras independientes contenidas.
                </p>
              </div>
              <button onClick={() => setSolicitudVerDetalle(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {solicitudVerDetalle.documentoOriginal && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-amber-400" />
                  Documento Original de Compras-Accesorios:
                </span>
                <p className="text-slate-300">
                  Tipo: <strong>{solicitudVerDetalle.documentoOriginal.tipoArchivo}</strong> • Archivo: <strong>{solicitudVerDetalle.documentoOriginal.nombreArchivo}</strong>
                </p>
                {solicitudVerDetalle.documentoOriginal.urlData && (
                  <img src={solicitudVerDetalle.documentoOriginal.urlData} alt="Documento original" className="max-h-64 mx-auto rounded-lg border border-slate-700 shadow" />
                )}
                {solicitudVerDetalle.documentoOriginal.contenidoTexto && (
                  <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto">
                    {solicitudVerDetalle.documentoOriginal.contenidoTexto}
                  </pre>
                )}
              </div>
            )}

            {/* Bloque Destacado de Respuesta Oficial de Laboratorio */}
            <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/30 space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="font-extrabold text-purple-300 flex items-center gap-1.5 text-sm">
                  <FlaskConical className="w-4 h-4 text-purple-400" />
                  RESPUESTA OFICIAL DE LABORATORIO
                </span>
                <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                  <span>Responsable: <strong className="text-white">{solicitudVerDetalle.responsableRespuestaLab || 'Laboratorio Accesorios'}</strong></span>
                  <span>•</span>
                  <span>Fecha Respuesta: <strong className="text-emerald-400">{solicitudVerDetalle.fechaRespuestaLab || 'En evaluación'}</strong></span>
                </div>
              </div>

              {solicitudVerDetalle.observacionesLabRespuesta && (
                <p className="text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 italic">
                  "{solicitudVerDetalle.observacionesLabRespuesta}"
                </p>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-white">Detalle de Insumos y Dictamen Individual por Línea:</span>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-[#6ba3df] text-slate-950 font-black uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">REFERENCIA</th>
                      <th className="py-2 px-3">DESCRIPCIÓN</th>
                      <th className="py-2 px-2 text-center">COLOR</th>
                      <th className="py-2 px-2 text-center">TALLA</th>
                      <th className="py-2 px-2 text-center">QTY</th>
                      <th className="py-2 px-4">RESULTADO / OBSERVACIÓN DETALLADA</th>
                      <th className="py-2 px-3 text-center">F. INGRESO</th>
                      <th className="py-2 px-3 text-center">F. ENTREGA</th>
                      <th className="py-2 px-3 text-center">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950 font-medium">
                    {solicitudVerDetalle.muestras.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2 px-3 font-mono font-bold text-amber-300">{m.referencia}</td>
                        <td className="py-2 px-3 text-slate-300">{m.descripcionInsumo || 'Insumo'}</td>
                        <td className="py-2 px-2 text-center text-slate-200">{m.color}</td>
                        <td className="py-2 px-2 text-center font-mono">{m.talla}</td>
                        <td className="py-2 px-2 text-center font-mono text-purple-300 font-bold">{m.qty}</td>
                        <td className="py-2 px-4 text-xs font-semibold text-amber-300 max-w-xs">
                          {m.observacion || m.resultado || <span className="text-slate-500 italic">En evaluación en Laboratorio</span>}
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-slate-400">{m.fechaIngreso}</td>
                        <td className="py-2 px-3 text-center font-mono text-slate-400">{m.fechaEntrega || '-'}</td>
                        <td className="py-2 px-3 text-center">
                          <Badge tipo="dictamen" valor={m.dictamen} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSolicitudVerDetalle(null)}
                className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Decisión de Compra (Telas) con Alertas Funcionales a Patronaje y Corte */}
      {telaParaDecision && (
        <ModalDecisionCompraTela
          abierto={!!telaParaDecision}
          onCerrar={() => setTelaParaDecision(null)}
          solicitud={telaParaDecision.solicitud}
          tela={telaParaDecision.tela}
          onGuardarDecision={(solId, tId, decisionData) => {
            registrarDecisionCompraTela(solId, tId, decisionData);
            setTelaParaDecision(null);
          }}
        />
      )}

    </div>
  );
};
