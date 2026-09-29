import React, { useState, useEffect, useMemo } from 'react';
import { useQuality } from '../../context/QualityContext';
import { 
  SolicitudTelasCompleta, 
  ItemMuestraTela, 
  DictamenType, 
  FichaTecnicaHistoricaVersionada, 
  VersionFichaTecnica,
  EvaluacionCompletaLaboratorioTela 
} from '../../types';
import { Badge } from '../common/Badge';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Save, 
  ArrowLeft, 
  FileText, 
  Send, 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  Printer, 
  Trash2, 
  CheckSquare, 
  Square, 
  Link as LinkIcon,
  SearchCode,
  Calculator
} from 'lucide-react';
import { ReporteCalidadPDFModal } from './ReporteCalidadPDFModal';
import { CalculadoraLaboratorioModal } from './CalculadoraLaboratorioModal';

interface DetalleSolicitudTelaProps {
  solicitud: SolicitudTelasCompleta;
  tela: ItemMuestraTela;
  onVolver: () => void;
  onAbrirBuscarFicha: () => void;
  fichaAplicada: { ficha: FichaTecnicaHistoricaVersionada; version: VersionFichaTecnica } | null;
  onDesvincularFicha: () => void;
  onGuardarEvaluacion: (datos: {
    resultadoTexto: string;
    dictamen: DictamenType;
    fechaIngreso: string;
    fechaEntrega: string;
    evaluacionTecnica: EvaluacionCompletaLaboratorioTela;
    fichaUtilizada?: {
      id: string;
      codigoFT: string;
      version: number;
      referencia: string;
      proveedor: string;
      referenciaProveedor?: string;
      fechaVersion: string;
      fechaUso: string;
      usuarioUso: string;
    };
    enviarACompras?: boolean;
  }) => void;
}

export const DetalleSolicitudTela: React.FC<DetalleSolicitudTelaProps> = ({
  solicitud,
  tela,
  onVolver,
  onAbrirBuscarFicha,
  fichaAplicada,
  onDesvincularFicha,
  onGuardarEvaluacion
}) => {
  const { analistas, analistaActivo, cambiarAnalistaConPin } = useQuality();

  // --- MODAL REPORTE PDF (DMP-F-001) ---
  const [mostrarReportePDF, setMostrarReportePDF] = useState(false);

  // --- SECCIÓN 1: IDENTIFICACIÓN TÉCNICA DE MUESTRA ---
  const [consecutivoEnsayo, setConsecutivoEnsayo] = useState<string>(tela.evaluacionTecnica?.consecutivoEnsayo || `2026-${tela.id.slice(-6).padStart(6, '0')}`);
  const [codigoMaterial, setCodigoMaterial] = useState<string>(tela.evaluacionTecnica?.codigoMaterial || `TEL-${tela.referencia.slice(0, 3).toUpperCase()}-03`);
  const [refNombre, setRefNombre] = useState<string>(tela.referencia || '');
  const [nombreTelaColor, setNombreTelaColor] = useState<string>(`${tela.referencia} ${tela.color || 'SNOW'}`);
  const [proveedorTela, setProveedorTela] = useState<string>(tela.proveedor || solicitud.proveedor || 'SHANGHAI JOY TEX CO LTD');
  const [ordenCompraLote, setOrdenCompraLote] = useState<string>(tela.ocCol || 'OAC 1107');
  const [fIngresoTela, setFIngresoTela] = useState<string>(tela.fechaIngreso || new Date().toISOString().split('T')[0]);
  const [fEntregaTela, setFEntregaTela] = useState<string>(tela.fechaEntrega || new Date().toISOString().split('T')[0]);
  const [composicionTextil, setComposicionTextil] = useState<string>(tela.evaluacionTecnica?.composicion || 'Por verificar');
  const [paisOrigen, setPaisOrigen] = useState<string>(tela.evaluacionTecnica?.paisOrigen || 'Colombia');
  const [responsableLab, setResponsableLab] = useState<string>(tela.responsableLab || analistaActivo?.nombreCompleto || 'Laboratorio');
  const [pinAccesoTelaInput, setPinAccesoTelaInput] = useState('');
  const [pinFeedbackTelaMsg, setPinFeedbackTelaMsg] = useState<string | null>(null);

  // Sincronizar automáticamente el Responsable cuando cambia el analista activo (ej. por PIN)
  useEffect(() => {
    if (analistaActivo?.nombreCompleto) {
      setResponsableLab(analistaActivo.nombreCompleto);
    }
  }, [analistaActivo?.id, analistaActivo?.nombreCompleto]);

  const handleVerificarPinRapidoTela = (valor: string) => {
    const cleanPin = valor.replace(/\D/g, '').slice(0, 4);
    setPinAccesoTelaInput(cleanPin);

    if (cleanPin.length === 4) {
      const analistaEncontrado = analistas.find(a => a.pinAcceso === cleanPin);
      if (analistaEncontrado) {
        cambiarAnalistaConPin(analistaEncontrado.id, cleanPin);
        setResponsableLab(analistaEncontrado.nombreCompleto);
        setPinFeedbackTelaMsg(`✓ PIN Validado: ${analistaEncontrado.nombreCompleto}`);
      } else {
        setPinFeedbackTelaMsg('❌ PIN Incorrecto');
      }
    } else {
      setPinFeedbackTelaMsg(null);
    }
  };

  // --- SECCIÓN 2: REQUISITOS DE FICHA TÉCNICA DEL PROVEEDOR (PLM) ---
  const espProv = fichaAplicada?.version.especificaciones;

  const [gramajeReq, setGramajeReq] = useState<number | string>(espProv?.gramajeDeclaradoGsm ?? '');
  const [pesoLinealReq, setPesoLinealReq] = useState<number | string>(espProv?.pesoLinealGsm ?? '');
  const [anchoUtilReq, setAnchoUtilReq] = useState<number | string>(espProv?.anchoUtilM ?? '');
  const [anchoTotalReq, setAnchoTotalReq] = useState<number | string>(espProv?.anchoTotalM ?? '');
  const [rendimientoReq, setRendimientoReq] = useState<number | string>(espProv?.rendimientoMkg ?? '');
  const [encAnchoReq, setEncAnchoReq] = useState<number | string>(espProv?.encogimientoAnchoMax ?? '');
  const [encLargoReq, setEncLargoReq] = useState<number | string>(espProv?.encogimientoLargoMax ?? '');
  const [elongAnchoReq, setElongAnchoReq] = useState<number | string>(espProv?.elongacionAnchoMin ?? '');
  const [elongLargoReq, setElongLargoReq] = useState<number | string>(espProv?.elongacionLargoMin ?? '');
  const [desviacionTramaReq, setDesviacionTramaReq] = useState<number | string>(espProv?.desviacionTramaMax ?? '');
  const [torqueViroReq, setTorqueViroReq] = useState<number | string>(espProv?.viroMax ?? '');
  const [tensionReq, setTensionReq] = useState<number | string>(espProv?.resistenciaTensionMin ?? '');
  const [desgarreReq, setDesgarreReq] = useState<number | string>(espProv?.resistenciaDesgarreMin ?? '');
  const [lavadoSugeridoReq, setLavadoSugeridoReq] = useState<string>(espProv?.lavadoSugerido || 'Ciclo delicado, agua fría');

  // Actualizar valores de PLM si cambia la ficha vinculada
  useEffect(() => {
    if (espProv) {
      if (espProv.gramajeDeclaradoGsm !== undefined) setGramajeReq(espProv.gramajeDeclaradoGsm);
      if (espProv.pesoLinealGsm !== undefined) setPesoLinealReq(espProv.pesoLinealGsm);
      if (espProv.anchoUtilM !== undefined) setAnchoUtilReq(espProv.anchoUtilM);
      if (espProv.anchoTotalM !== undefined) setAnchoTotalReq(espProv.anchoTotalM);
      if (espProv.rendimientoMkg !== undefined) setRendimientoReq(espProv.rendimientoMkg);
      if (espProv.encogimientoAnchoMax !== undefined) setEncAnchoReq(espProv.encogimientoAnchoMax);
      if (espProv.encogimientoLargoMax !== undefined) setEncLargoReq(espProv.encogimientoLargoMax);
      if (espProv.elongacionAnchoMin !== undefined) setElongAnchoReq(espProv.elongacionAnchoMin);
      if (espProv.elongacionLargoMin !== undefined) setElongLargoReq(espProv.elongacionLargoMin);
      if (espProv.desviacionTramaMax !== undefined) setDesviacionTramaReq(espProv.desviacionTramaMax);
      if (espProv.viroMax !== undefined) setTorqueViroReq(espProv.viroMax);
      if (espProv.resistenciaTensionMin !== undefined) setTensionReq(espProv.resistenciaTensionMin);
      if (espProv.resistenciaDesgarreMin !== undefined) setDesgarreReq(espProv.resistenciaDesgarreMin);
      if (espProv.lavadoSugerido) setLavadoSugeridoReq(espProv.lavadoSugerido);
    }
  }, [espProv]);

  // --- SECCIÓN 3: PARÁMETROS DE ENSAYOS REGISTRADOS (MEDICIONES REALES DE LAB - GRUPOS A-H) ---
  // NOTA: No se inventan datos. Solo se precargan los valores de la Ficha Técnica del Proveedor si existe; de resto permanecen vacíos.
  
  // Grupo A: Dimensiones y Rendimiento (NTC 228, NTC 230)
  const [gramajeLab, setGramajeLab] = useState<number | string>(tela.evaluacionTecnica?.gramaje?.medidoLab ?? espProv?.gramajeDeclaradoGsm ?? '');
  const [pesoLinealLab, setPesoLinealLab] = useState<number | string>(tela.evaluacionTecnica?.pesoLineal?.medidoLab ?? espProv?.pesoLinealGsm ?? '');
  const [anchoUtilLab, setAnchoUtilLab] = useState<number | string>(tela.evaluacionTecnica?.anchoUtil?.medidoLab ?? espProv?.anchoUtilM ?? '');
  const [anchoTotalLab, setAnchoTotalLab] = useState<number | string>(tela.evaluacionTecnica?.anchoTotal?.medidoLab ?? espProv?.anchoTotalM ?? '');
  const [rendimientoLab, setRendimientoLab] = useState<number | string>(tela.evaluacionTecnica?.rendimiento?.medidoLab ?? espProv?.rendimientoMkg ?? '');

  const handleGramajeLabChange = (val: string) => {
    setGramajeLab(val);
    const num = Number(val);
    if (num > 0) {
      setRendimientoLab((1000 / num).toFixed(2));
    } else if (val === '') {
      setRendimientoLab('');
    }
  };

  // Grupo B: Estabilidad Dimensional - Encogimiento (NTC 908)
  const [encLargoLab, setEncLargoLab] = useState<number | string>(tela.evaluacionTecnica?.encogimientoLargo?.medidoLab ?? espProv?.encogimientoLargoMax ?? '');
  const [encAnchoLab, setEncAnchoLab] = useState<number | string>(tela.evaluacionTecnica?.encogimientoAncho?.medidoLab ?? espProv?.encogimientoAnchoMax ?? '');

  // Grupo C: Elongación y Estiramiento (NTC 754-2)
  const [elongLargoLab, setElongLargoLab] = useState<number | string>(tela.evaluacionTecnica?.elongacionLargo?.medidoLab ?? espProv?.elongacionLargoMin ?? '');
  const [elongAnchoLab, setElongAnchoLab] = useState<number | string>(tela.evaluacionTecnica?.elongacionAncho?.medidoLab ?? espProv?.elongacionAnchoMin ?? '');
  const [recuperacionLab, setRecuperacionLab] = useState<number | string>(tela.evaluacionTecnica?.recuperacionElasticidad?.medidoLab ?? espProv?.recuperacionElasticidadMin ?? '');

  // Grupo D: Torque y Viro (NTC 5121, AATCC 179)
  const [torqueViroLab, setTorqueViroLab] = useState<number | string>(tela.evaluacionTecnica?.torqueViroPierna?.medidoLab ?? espProv?.viroMax ?? '');
  const [desviacionTramaLab, setDesviacionTramaLab] = useState<number | string>(tela.evaluacionTecnica?.desviacionTrama?.medidoLab ?? espProv?.desviacionTramaMax ?? '');

  // Grupo E: Resistencias Mecánicas (NTC 754-2, NTC 5634, NTC 1382)
  const [tensionLab, setTensionLab] = useState<number | string>(tela.evaluacionTecnica?.resistenciaTension?.medidoLab ?? espProv?.resistenciaTensionMin ?? '');
  const [desgarreLab, setDesgarreLab] = useState<number | string>(tela.evaluacionTecnica?.resistenciaDesgarre?.medidoLab ?? espProv?.resistenciaDesgarreMin ?? '');
  const [deslizamientoLab, setDeslizamientoLab] = useState<number | string>(tela.evaluacionTecnica?.deslizamientoCostura?.medidoLab ?? espProv?.deslizamientoCosturaMax ?? '');

  // Grupo F: Solideces del Color y Desempeño
  const [pillingLab, setPillingLab] = useState<number | string>(tela.evaluacionTecnica?.resistenciaPilling?.medidoLab ?? espProv?.resistenciaPillingMin ?? '');
  const [solLavadoLab, setSolLavadoLab] = useState<number | string>(tela.evaluacionTecnica?.solidezLavadoDomestico?.medidoLab ?? espProv?.solidezLavadoMin ?? '');
  const [solFroteHumLab, setSolFroteHumLab] = useState<number | string>(tela.evaluacionTecnica?.solidezFroteHumedo?.medidoLab ?? espProv?.solidezFroteHumedoMin ?? '');
  const [solFroteSecoLab, setSolFroteSecoLab] = useState<number | string>(tela.evaluacionTecnica?.solidezFroteSeco?.medidoLab ?? espProv?.solidezFroteSecoMin ?? '');
  const [cambioColorLab, setCambioColorLab] = useState<number | string>(tela.evaluacionTecnica?.cambioColor?.medidoLab ?? espProv?.cambioColorMin ?? '');
  const [pruebaFusionadoLab, setPruebaFusionadoLab] = useState<string>(tela.evaluacionTecnica?.pruebaFusionado?.resultado || '');

  // Grupo G: Características para Índigo (Twitter / Twill)
  const [anchoTotalDesengome, setAnchoTotalDesengome] = useState<number | string>(tela.evaluacionTecnica?.anchoTotalDesengome?.medidoLab ?? '');
  const [anchoUtilDesengome, setAnchoUtilDesengome] = useState<number | string>(tela.evaluacionTecnica?.anchoUtilDesengome?.medidoLab ?? '');

  // Grupo H: Evaluaciones Directas de Conformidad
  const [aptoSolidezDropdown, setAptoSolidezDropdown] = useState<'No Combinar' | 'Adecuado para combinar' | 'Suelta color con fricción'>(
    tela.evaluacionTecnica?.aptitudFroteCombinacion === 'APTO PARA COMBINAR' ? 'Adecuado para combinar' :
    tela.evaluacionTecnica?.aptitudFroteCombinacion === 'SUELTA COLOR CON LA FRICCIÓN' ? 'Suelta color con fricción' : 'No Combinar'
  );
  const [conformeFT, setConformeFT] = useState<boolean>(tela.evaluacionTecnica?.conformeFT ?? true);
  const [conformePLM, setConformePLM] = useState<boolean>(tela.evaluacionTecnica?.conformePLM ?? true);

  // --- SECCIÓN 4: DICTAMEN DEL LABORATORIO (RECOMENDACIÓN TÉCNICA) ---
  const [dictamenLab, setDictamenLab] = useState<DictamenType>(tela.dictamen || 'PENDIENTE');
  const [obsRecomendaciones, setObsRecomendaciones] = useState<string>(
    tela.observacionesLabRespuesta || tela.evaluacionTecnica?.observacionesRecomendaciones || ''
  );

  // Modal Calculadora Técnica de Laboratorio
  const [modalCalculadoraAbierto, setModalCalculadoraAbierto] = useState(false);

  const handleAplicarDesdeCalculadora = (valores: {
    gramaje?: number;
    pesoLineal?: number;
    rendimiento?: number;
    anchoUtil?: number;
    anchoTotal?: number;
    encogimientoLargo?: number;
    encogimientoAncho?: number;
    viro?: number;
    elongacionLargo?: number;
    elongacionAncho?: number;
  }) => {
    if (valores.gramaje !== undefined) setGramajeLab(valores.gramaje);
    if (valores.pesoLineal !== undefined) setPesoLinealLab(valores.pesoLineal);
    if (valores.rendimiento !== undefined) setRendimientoLab(valores.rendimiento);
    if (valores.anchoUtil !== undefined) setAnchoUtilLab(valores.anchoUtil);
    if (valores.anchoTotal !== undefined) setAnchoTotalLab(valores.anchoTotal);
    if (valores.encogimientoLargo !== undefined) setEncLargoLab(valores.encogimientoLargo);
    if (valores.encogimientoAncho !== undefined) setEncAnchoLab(valores.encogimientoAncho);
    if (valores.viro !== undefined) setTorqueViroLab(valores.viro);
    if (valores.elongacionLargo !== undefined) setElongLargoLab(valores.elongacionLargo);
    if (valores.elongacionAncho !== undefined) setElongAnchoLab(valores.elongacionAncho);
    setModalCalculadoraAbierto(false);
  };

  // --- EJECUTAR GUARDADO / ENVÍO ---
  const ejecutarGuardado = (enviarACompras: boolean) => {
    const aNum = (v: number | string) => (v === '' || v === null || v === undefined || isNaN(Number(v))) ? 0 : Number(v);

    const partesResumen = [
      gramajeLab !== '' ? `Gramaje: ${gramajeLab} g/m²` : null,
      encLargoLab !== '' ? `Encog. L: ${encLargoLab}%` : null,
      encAnchoLab !== '' ? `Encog. A: ${encAnchoLab}%` : null,
      torqueViroLab !== '' ? `Viro: ${torqueViroLab}%` : null,
      pillingLab !== '' ? `Pilling: ${pillingLab}` : null,
      solLavadoLab !== '' ? `Solidez: ${solLavadoLab}/5` : null,
      `Apto Solidez: ${aptoSolidezDropdown}`
    ].filter(Boolean);

    const resumenResultado = partesResumen.join(' | ');

    const evaluacionTecnica: EvaluacionCompletaLaboratorioTela = {
      consecutivoEnsayo,
      codigoMaterial,
      codigoMuestra: consecutivoEnsayo,
      codigoMT: fichaAplicada?.ficha.codigoFT || 'MT-90412',
      referencia: refNombre || tela.referencia,
      proveedor: proveedorTela || tela.proveedor,
      numeroLote: ordenCompraLote,
      numeroRollo: '1',
      color: tela.color || 'ESTÁNDAR',
      composicion: composicionTextil,
      tipoTejido: 'Plano',
      paisOrigen,
      prioridad: 'Alta',
      fechaIngreso: fIngresoTela,

      anchoUtil: { esperadoFT: aNum(anchoUtilReq), medidoLab: aNum(anchoUtilLab), unidad: 'm', norma: 'NTC 228', cumple: true },
      anchoTotal: { esperadoFT: aNum(anchoTotalReq), medidoLab: aNum(anchoTotalLab), unidad: 'm', norma: 'NTC 228', cumple: true },
      anchoTotalDesengome: { medidoLab: aNum(anchoTotalDesengome), unidad: 'm', norma: 'NTC 228' },
      anchoUtilDesengome: { medidoLab: aNum(anchoUtilDesengome), unidad: 'm', norma: 'NTC 228' },
      gramaje: { esperadoFT: aNum(gramajeReq), medidoLab: aNum(gramajeLab), unidad: 'g/m²', norma: 'NTC 230', cumple: true },
      pesoLineal: { esperadoFT: aNum(pesoLinealReq), medidoLab: aNum(pesoLinealLab), unidad: 'g/ml', norma: 'NTC 230', cumple: true },
      rendimiento: { esperadoFT: aNum(rendimientoReq), medidoLab: aNum(rendimientoLab), unidad: 'm/kg', norma: 'NTC 230', cumple: true },
      encogimientoAncho: { esperadoFT: aNum(encAnchoReq), medidoLab: aNum(encAnchoLab), unidad: '%', norma: 'NTC 908', cumple: true },
      encogimientoLargo: { esperadoFT: aNum(encLargoReq), medidoLab: aNum(encLargoLab), unidad: '%', norma: 'NTC 908', cumple: true },
      elongacionAncho: { esperadoFT: aNum(elongAnchoReq), medidoLab: aNum(elongAnchoLab), unidad: '%', norma: 'NTC 754-2', cumple: true },
      elongacionLargo: { esperadoFT: aNum(elongLargoReq), medidoLab: aNum(elongLargoLab), unidad: '%', norma: 'NTC 754-2', cumple: true },
      recuperacionElasticidad: { medidoLab: aNum(recuperacionLab), unidad: '%', norma: 'ASTM D3107', cumple: true },
      desviacionTrama: { esperadoFT: aNum(desviacionTramaReq), medidoLab: aNum(desviacionTramaLab), unidad: '%', norma: 'NTC 5121', cumple: true },
      torqueViroPierna: { esperadoFT: aNum(torqueViroReq), medidoLab: aNum(torqueViroLab), unidad: '%', norma: 'AATCC 179', cumple: true },

      resistenciaTension: { esperadoFT: aNum(tensionReq), medidoLab: aNum(tensionLab), unidad: 'N', norma: 'NTC 754-2', cumple: true },
      resistenciaDesgarre: { esperadoFT: aNum(desgarreReq), medidoLab: aNum(desgarreLab), unidad: 'gf', norma: 'NTC 5634', cumple: true },
      deslizamientoCostura: { medidoLab: aNum(deslizamientoLab), unidad: 'mm', norma: 'NTC 1382-1-2', cumple: true },
      resistenciaPilling: { medidoLab: aNum(pillingLab), unidad: 'Escala 1-5', norma: 'NTC 2051', cumple: true },

      solidezLavadoDomestico: { medidoLab: aNum(solLavadoLab), unidad: 'Escala 1-5', norma: 'NTC 1155', cumple: true },
      solidezFroteSeco: { medidoLab: aNum(solFroteSecoLab), unidad: 'Escala 1-5', norma: 'NTC 786', cumple: true },
      solidezFroteHumedo: { medidoLab: aNum(solFroteHumLab), unidad: 'Escala 1-5', norma: 'NTC 786', cumple: true },
      cambioColor: { medidoLab: aNum(cambioColorLab), unidad: 'Escala 1-5', norma: 'NTC 786', cumple: true },
      aptitudFroteCombinacion: aptoSolidezDropdown === 'Adecuado para combinar' ? 'APTO PARA COMBINAR' : aptoSolidezDropdown === 'Suelta color con fricción' ? 'SUELTA COLOR CON LA FRICCIÓN' : 'NINGUNO',
      pruebaFusionado: {
        resultado: (pruebaFusionadoLab || 'N/A') as any,
        norma: 'NTC 4873'
      },
      lavadoSugerido: lavadoSugeridoReq || 'Según ficha técnica',

      conformeFT,
      conformePLM,
      dictamenFinal: dictamenLab,
      observacionesRecomendaciones: obsRecomendaciones
    };

    onGuardarEvaluacion({
      resultadoTexto: resumenResultado,
      dictamen: dictamenLab,
      fechaIngreso: fIngresoTela,
      fechaEntrega: fEntregaTela,
      evaluacionTecnica,
      fichaUtilizada: fichaAplicada ? {
        id: fichaAplicada.ficha.id,
        codigoFT: fichaAplicada.ficha.codigoFT,
        version: fichaAplicada.version.version,
        referencia: fichaAplicada.ficha.referencia,
        proveedor: fichaAplicada.ficha.proveedor,
        referenciaProveedor: fichaAplicada.ficha.referenciaProveedor,
        fechaVersion: fichaAplicada.version.fechaVersion,
        fechaUso: new Date().toISOString().split('T')[0],
        usuarioUso: responsableLab
      } : undefined,
      enviarACompras
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border border-slate-300 rounded-2xl p-6 shadow-sm space-y-6 font-sans text-slate-800 animate-fade-in">
      
      {/* Botón Superior de Navegación "Volver a Solicitudes" */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={onVolver}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-300 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700" />
          <span>← Volver a la Bandeja de Solicitudes</span>
        </button>

        <div className="flex items-center gap-2">
          <Badge tipo="dictamen" valor={dictamenLab} size="md" />

          {/* Botón Calculadora de Laboratorio */}
          <button
            type="button"
            onClick={() => setModalCalculadoraAbierto(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 text-cyan-900 font-black text-xs rounded-xl border border-cyan-300 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Abrir Calculadora Técnica para calcular masa, rendimiento, encogimiento, etc."
          >
            <Calculator className="w-4 h-4 text-cyan-700" />
            <span>CALCULADORA LAB</span>
          </button>

          <button
            type="button"
            onClick={() => setMostrarReportePDF(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs rounded-xl border border-amber-300 transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-700" />
            <span>DESCARGAR REPORTE (DMP-F-001)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 1: IDENTIFICACIÓN TÉCNICA DE MUESTRA                             */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        
        {/* Title & Status Badge Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-display">
              1. IDENTIFICACIÓN TÉCNICA DE MUESTRA
            </h3>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <span>⏰ Solicitud por evaluar de Compras</span>
            </span>
          </div>
        </div>

        {/* Action Pills Row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onAbrirBuscarFicha}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-full shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Vincular Ficha Técnica de Proveedor</span>
          </button>

          <button
            type="button"
            onClick={onAbrirBuscarFicha}
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-full shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Solicitar Ficha</span>
          </button>
        </div>

        {/* Form Inputs Grid - 3 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              CONSECUTIVO DE ENSAYO (LAB) *
            </label>
            <input
              type="text"
              value={consecutivoEnsayo}
              onChange={(e) => setConsecutivoEnsayo(e.target.value)}
              className="w-full bg-transparent font-mono font-bold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                CÓDIGO DE MATERIAL (PLM) *
              </label>
              <span className="text-[9px] text-blue-600 font-bold flex items-center gap-0.5 cursor-pointer hover:underline">
                <SearchCode className="w-3 h-3" /> CONSULTAR PLM
              </span>
            </div>
            <input
              type="text"
              placeholder="Ej: MAT-DRIL-03"
              value={codigoMaterial}
              onChange={(e) => setCodigoMaterial(e.target.value)}
              className="w-full bg-transparent font-mono font-bold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              NOMBRE (REFERENCIA COMERCIAL) *
            </label>
            <input
              type="text"
              value={refNombre}
              onChange={(e) => setRefNombre(e.target.value)}
              className="w-full bg-transparent font-bold text-slate-900 uppercase focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              NOMBRE DE TELA / COLOR *
            </label>
            <input
              type="text"
              value={nombreTelaColor}
              onChange={(e) => setNombreTelaColor(e.target.value)}
              className="w-full bg-transparent font-semibold text-slate-900 uppercase focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              PROVEEDOR *
            </label>
            <input
              type="text"
              value={proveedorTela}
              onChange={(e) => setProveedorTela(e.target.value)}
              className="w-full bg-transparent font-bold text-slate-900 uppercase focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              ORDEN DE COMPRA / LOTE
            </label>
            <input
              type="text"
              value={ordenCompraLote}
              onChange={(e) => setOrdenCompraLote(e.target.value)}
              className="w-full bg-transparent font-mono font-bold text-slate-900 uppercase focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              FECHA INGRESO
            </label>
            <input
              type="date"
              value={fIngresoTela}
              onChange={(e) => setFIngresoTela(e.target.value)}
              className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              COMPOSICIÓN TEXTIL
            </label>
            <input
              type="text"
              value={composicionTextil}
              onChange={(e) => setComposicionTextil(e.target.value)}
              className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              PAÍS ORIGEN
            </label>
            <input
              type="text"
              value={paisOrigen}
              onChange={(e) => setPaisOrigen(e.target.value)}
              className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 lg:col-span-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                P. AUTORIZADO O RESPONSABLE
              </label>
              <span className="text-[9px] text-amber-700 font-mono font-bold flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> PIN RÁPIDO:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={responsableLab}
                onChange={(e) => setResponsableLab(e.target.value)}
                className="flex-1 bg-transparent font-bold text-slate-900 focus:outline-none"
              />
              <input
                type="password"
                maxLength={4}
                placeholder="PIN"
                value={pinAccesoTelaInput}
                onChange={(e) => handleVerificarPinRapidoTela(e.target.value)}
                className="w-20 bg-white border border-amber-300 rounded-lg p-1.5 text-center font-mono font-black text-amber-800 text-xs tracking-widest"
              />
            </div>
            {pinFeedbackTelaMsg && (
              <p className={`text-[10px] font-bold mt-1 ${pinFeedbackTelaMsg.includes('✓') ? 'text-emerald-700' : 'text-rose-700'}`}>
                {pinFeedbackTelaMsg}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: REQUISITOS DE FICHA TÉCNICA DEL PROVEEDOR (PLM)               */}
      {/* ========================================================================= */}
      <div className="border-t border-slate-200 pt-5 space-y-3">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display">
          2. REQUISITOS DE FICHA TÉCNICA DEL PROVEEDOR (PLM)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase block mb-1">
              GRAMAJE REQUERIDO (G/M²)
            </span>
            <input
              type="number"
              value={gramajeReq}
              onChange={(e) => setGramajeReq(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-center font-mono font-bold text-slate-900"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase block mb-1">
              PESO ML REQUERIDO (G/ML)
            </span>
            <input
              type="number"
              value={pesoLinealReq}
              onChange={(e) => setPesoLinealReq(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-center font-mono font-bold text-slate-900"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase block mb-1">
              ANCHO ÚTIL REQUERIDO (M)
            </span>
            <input
              type="number"
              step="0.01"
              value={anchoUtilReq}
              onChange={(e) => setAnchoUtilReq(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-center font-mono font-bold text-slate-900"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase block mb-1">
              ANCHO TOTAL REQUERIDO (M)
            </span>
            <input
              type="number"
              step="0.01"
              value={anchoTotalReq}
              onChange={(e) => setAnchoTotalReq(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-center font-mono font-bold text-slate-900"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase block mb-1">
              RENDIMIENTO ESP. (M/KG)
            </span>
            <input
              type="number"
              step="0.01"
              value={rendimientoReq}
              onChange={(e) => setRendimientoReq(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-center font-mono font-bold text-slate-900"
            />
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 3: PARÁMETROS DE ENSAYOS REGISTRADOS (MEDICIONES REALES OFICIALES)*/}
      {/* ========================================================================= */}
      <div className="border-t border-slate-200 pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display">
            3. PARÁMETROS DE ENSAYOS REGISTRADOS (MEDICIONES REALES DE LABORATORIO)
          </h3>
          <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
            NTC & AATCC
          </span>
        </div>

        {/* Grupo A: Dimensiones y Rendimiento */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
              <span className="bg-blue-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">GRUPO A</span>
              <span>Dimensiones y Rendimiento (NTC 228, NTC 230)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 text-xs">
            <div>
              <span className="text-[9px] text-slate-500 font-bold block mb-0.5">Gramaje Real (g/m²)</span>
              <input
                type="number"
                value={gramajeLab}
                onChange={(e) => handleGramajeLabChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-center font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold block mb-0.5">Peso Lineal (g/ml)</span>
              <input
                type="number"
                value={pesoLinealLab}
                onChange={(e) => setPesoLinealLab(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-center font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold block mb-0.5">Ancho Útil Real (m)</span>
              <input
                type="number"
                step="0.01"
                value={anchoUtilLab}
                onChange={(e) => setAnchoUtilLab(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-center font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold block mb-0.5">Ancho Total Real (m)</span>
              <input
                type="number"
                step="0.01"
                value={anchoTotalLab}
                onChange={(e) => setAnchoTotalLab(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-center font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold block mb-0.5">Rendimiento Real (m/kg)</span>
              <input
                type="number"
                step="0.01"
                value={rendimientoLab}
                onChange={(e) => setRendimientoLab(e.target.value)}
                placeholder="Ej: 3.80"
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-center font-mono font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Grupo B: Encogimiento */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <span className="font-extrabold text-slate-800 text-xs uppercase flex items-center gap-1.5">
            <span className="bg-amber-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">GRUPO B</span>
            <span>Estabilidad Dimensional / Encogimiento (NTC 908 / AATCC 135)</span>
          </span>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-600 block mb-1">Encogimiento Largo Real (%):</span>
              <input
                type="number"
                step="0.1"
                value={encLargoLab}
                onChange={(e) => setEncLargoLab(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-center font-mono font-bold text-amber-900"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-600 block mb-1">Encogimiento Ancho Real (%):</span>
              <input
                type="number"
                step="0.1"
                value={encAnchoLab}
                onChange={(e) => setEncAnchoLab(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-center font-mono font-bold text-amber-900"
              />
            </div>
          </div>
        </div>

        {/* Grupos C, D, E */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
            <span className="font-extrabold text-slate-800 block text-[11px] uppercase">GRUPO C: Elongación (NTC 754-2)</span>
            <div className="grid grid-cols-3 gap-1.5">
              <input type="number" value={elongLargoLab} onChange={(e) => setElongLargoLab(e.target.value)} className="bg-white border rounded p-1 text-center font-mono font-bold" title="Largo %" />
              <input type="number" value={elongAnchoLab} onChange={(e) => setElongAnchoLab(e.target.value)} className="bg-white border rounded p-1 text-center font-mono font-bold" title="Ancho %" />
              <input type="number" value={recuperacionLab} onChange={(e) => setRecuperacionLab(e.target.value)} className="bg-white border rounded p-1 text-center font-mono font-bold text-emerald-800" title="Recuperación %" />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
            <span className="font-extrabold text-slate-800 block text-[11px] uppercase">GRUPO D: Torque & Viro (AATCC 179)</span>
            <div className="grid grid-cols-2 gap-1.5">
              <input type="number" value={torqueViroLab} onChange={(e) => setTorqueViroLab(e.target.value)} className="bg-white border rounded p-1 text-center font-mono font-bold" title="Torque %" />
              <input type="number" value={desviacionTramaLab} onChange={(e) => setDesviacionTramaLab(e.target.value)} className="bg-white border rounded p-1 text-center font-mono font-bold" title="Desviación %" />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
            <span className="font-extrabold text-slate-800 block text-[11px] uppercase">GRUPO E: Resistencias Mecánicas</span>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <input type="number" value={tensionLab} onChange={(e) => setTensionLab(e.target.value)} className="bg-white border rounded p-1 text-center font-mono font-bold" title="Tensión N" />
              <input type="number" value={desgarreLab} onChange={(e) => setDesgarreLab(e.target.value)} className="bg-white border rounded p-1 text-center font-mono font-bold" title="Desgarre gf" />
              <input type="number" value={deslizamientoLab} onChange={(e) => setDeslizamientoLab(e.target.value)} className="bg-white border rounded p-1 text-center font-mono font-bold" title="Deslizamiento mm" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GRUPO F: SOLIDECES DEL COLOR Y DESEMPEÑO (REPLICADO DE CAPTURA DEL USUARIO) */}
        {/* ========================================================================= */}
        <div className="border border-slate-300 rounded-2xl p-4 bg-white space-y-3">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display">
            GRUPO F: SOLIDECES DEL COLOR Y DESEMPEÑO
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            {/* PILLING */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">PILLING</label>
                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">NTC 2051</span>
              </div>
              <input
                type="text"
                placeholder="Ej: 4"
                value={pillingLab}
                onChange={(e) => setPillingLab(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* SOLIDEZ LAVADO */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">SOLIDEZ LAVADO</label>
                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">NTC 1155</span>
              </div>
              <input
                type="text"
                placeholder="Ej: 4.5"
                value={solLavadoLab}
                onChange={(e) => setSolLavadoLab(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* FROTE HÚMEDO */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">FROTE HÚMEDO</label>
                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">NTC 786</span>
              </div>
              <input
                type="text"
                placeholder="Ej: 3.5"
                value={solFroteHumLab}
                onChange={(e) => setSolFroteHumLab(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* FROTE SECO */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">FROTE SECO</label>
                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">NTC 786</span>
              </div>
              <input
                type="text"
                placeholder="Ej: 4.5"
                value={solFroteSecoLab}
                onChange={(e) => setSolFroteSecoLab(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* CAMBIO COLOR FROTE */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">CAMBIO COLOR FROTE</label>
                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">NTC 786</span>
              </div>
              <input
                type="text"
                placeholder="Ej: 4.5"
                value={cambioColorLab}
                onChange={(e) => setCambioColorLab(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* PRUEBA FUSIONADO */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">PRUEBA FUSIONADO</label>
                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">NTC 4873</span>
              </div>
              <input
                type="text"
                placeholder="Ej: Cumple"
                value={pruebaFusionadoLab}
                onChange={(e) => setPruebaFusionadoLab(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* GRUPO G: CARACTERÍSTICAS PARA ÍNDIGO (TWITTER / TWILL) (REPLICADO DE CAPTURA) */}
        {/* ========================================================================= */}
        <div className="border border-slate-300 rounded-2xl p-4 bg-white space-y-3">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display">
            GRUPO G: CARACTERÍSTICAS PARA ÍNDIGO (TWITTER / TWILL)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* ANCHO TOTAL DESENGOME (M) */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                ANCHO TOTAL DESENGOME (M)
              </label>
              <input
                type="text"
                placeholder="Ej: 1.50"
                value={anchoTotalDesengome}
                onChange={(e) => setAnchoTotalDesengome(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* ANCHO ÚTIL DESENGOME (M) */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                ANCHO ÚTIL DESENGOME (M)
              </label>
              <input
                type="text"
                placeholder="Ej: 1.47"
                value={anchoUtilDesengome}
                onChange={(e) => setAnchoUtilDesengome(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* GRUPO H: EVALUACIONES DIRECTAS DE CONFORMIDAD (EXACTO A LA CAPTURA)       */}
        {/* ========================================================================= */}
        <div className="border border-slate-300 rounded-2xl p-4 bg-white space-y-3">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display">
            GRUPO H: EVALUACIONES DIRECTAS DE CONFORMIDAD
          </h4>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-xs">
            
            {/* APTO PARA SOLIDEZ DROPDOWN */}
            <div className="w-full sm:w-64 space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                APTO PARA SOLIDEZ
              </label>
              <select
                value={aptoSolidezDropdown}
                onChange={(e) => setAptoSolidezDropdown(e.target.value as any)}
                className="w-full bg-white border border-blue-500 rounded-xl p-2.5 font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs cursor-pointer"
              >
                <option value="No Combinar">No Combinar</option>
                <option value="Adecuado para combinar">Adecuado para combinar</option>
                <option value="Suelta color con fricción">Suelta color con fricción</option>
              </select>
            </div>

            {/* CHECKBOXES */}
            <div className="flex items-center gap-6 pt-2 sm:pt-4">
              <label className="flex items-center gap-2 cursor-pointer font-extrabold text-xs text-blue-900 select-none">
                <input
                  type="checkbox"
                  checked={conformeFT}
                  onChange={(e) => setConformeFT(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="uppercase tracking-wider">CONFORME FICHA TÉCNICA</span>
              </label>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 4: DICTAMEN DEL LABORATORIO (RECOMENDACIÓN TÉCNICA)              */}
      {/* ========================================================================= */}
      <div className="border-t border-slate-200 pt-5 space-y-4">
        
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display">
            4. DICTAMEN DEL LABORATORIO (RECOMENDACIÓN TÉCNICA)
          </h3>
          <span className="text-xs font-mono font-bold text-slate-600">
            Responsable: <strong>{responsableLab}</strong>
          </span>
        </div>

        {/* Dictamen Pill Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => setDictamenLab('APROBADO')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              dictamenLab === 'APROBADO'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-102'
                : 'bg-slate-50 hover:bg-slate-100 text-emerald-700 border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>APROBADO</span>
          </button>

          <button
            type="button"
            onClick={() => setDictamenLab('RECHAZADO')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              dictamenLab === 'RECHAZADO'
                ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-102'
                : 'bg-slate-50 hover:bg-slate-100 text-rose-700 border-slate-200'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>RECHAZADO</span>
          </button>

          <button
            type="button"
            onClick={() => setDictamenLab('HALLAZGO')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              dictamenLab === 'HALLAZGO'
                ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-102'
                : 'bg-slate-50 hover:bg-slate-100 text-amber-800 border-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>HALLAZGO</span>
          </button>

          <button
            type="button"
            onClick={() => setDictamenLab('PENDIENTE')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              dictamenLab === 'PENDIENTE'
                ? 'bg-slate-700 text-white border-slate-700 shadow-md scale-102'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>PENDIENTE / PAUSADA</span>
          </button>
        </div>

        {/* Textarea */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
            Observación del Analista para Moldería y Corte:
          </label>
          <textarea
            rows={3}
            value={obsRecomendaciones}
            onChange={(e) => setObsRecomendaciones(e.target.value)}
            placeholder="Redacta las observaciones técnicas o recomendaciones para producción..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onVolver}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← VOLVER A LA BANDEJA</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => ejecutarGuardado(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4 text-blue-600" />
              <span>💾 GUARDAR</span>
            </button>

            <button
              type="button"
              onClick={() => ejecutarGuardado(true)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>🚀 ENVIAR A COMPRAS</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODAL IMPRESIÓN / DESCARGA REPORTE OFICIAL PDF (DMP-F-001) */}
      {mostrarReportePDF && (
        <ReporteCalidadPDFModal
          solicitud={solicitud}
          tela={{
            ...tela,
            referencia: refNombre || tela.referencia,
            proveedor: proveedorTela || tela.proveedor,
            color: tela.color || 'SNOW',
            dictamen: dictamenLab,
            evaluacionTecnica: {
              shp: ordenCompraLote,
              codigoMaterial,
              importacion: 'Col',
              consecutivoEnsayo,
              loteProveedor: ordenCompraLote,
              rollo: '1',
              codigoMuestra: consecutivoEnsayo,
              codigoMT: fichaAplicada?.ficha.codigoFT || 'MT-90412',
              referencia: refNombre || tela.referencia,
              proveedor: proveedorTela || tela.proveedor,
              numeroLote: ordenCompraLote,
              numeroRollo: '1',
              color: tela.color || 'SNOW',
              composicion: composicionTextil,
              tipoTejido: 'Plano',
              paisOrigen,
              prioridad: 'Alta',
              fechaIngreso: fIngresoTela,

              anchoUtil: { medidoLab: Number(anchoUtilLab) || 1.47, unidad: 'm', norma: 'NTC 228', cumple: true },
              anchoTotal: { medidoLab: Number(anchoTotalLab) || 1.50, unidad: 'm', norma: 'NTC 228', cumple: true },
              gramaje: { medidoLab: Number(gramajeLab) || 230, unidad: 'g/m²', norma: 'NTC 230', cumple: true },
              pesoLineal: { medidoLab: Number(pesoLinealLab) || 322, unidad: 'g/ml', norma: 'NTC 230', cumple: true },
              rendimiento: { medidoLab: Number(rendimientoLab) || 0, unidad: 'm/kg', norma: 'NTC 230', cumple: true },
              encogimientoAncho: { medidoLab: Number(encAnchoLab) || -3.5, unidad: '%', norma: 'NTC 908', cumple: true },
              encogimientoLargo: { medidoLab: Number(encLargoLab) || -2.2, unidad: '%', norma: 'NTC 908', cumple: true },
              elongacionAncho: { medidoLab: Number(elongAnchoLab) || 17.5, unidad: '%', norma: 'NTC 754-2', cumple: true },
              elongacionLargo: { medidoLab: Number(elongLargoLab) || 4.2, unidad: '%', norma: 'NTC 754-2', cumple: true },
              recuperacionElasticidad: { medidoLab: Number(recuperacionLab) || 89.5, unidad: '%', norma: 'ASTM D3107', cumple: true },
              desviacionTrama: { medidoLab: Number(desviacionTramaLab) || 1.2, unidad: '%', norma: 'NTC 5121', cumple: true },
              torqueViroPierna: { medidoLab: Number(torqueViroLab) || 1.5, unidad: '%', norma: 'AATCC 179', cumple: true },

              resistenciaTension: { medidoLab: Number(tensionLab) || 38.0, unidad: 'N', norma: 'NTC 754-2', cumple: true },
              resistenciaDesgarre: { medidoLab: Number(desgarreLab) || 1950, unidad: 'gf', norma: 'NTC 5634', cumple: true },
              deslizamientoCostura: { medidoLab: Number(deslizamientoLab) || 3.5, unidad: 'mm', norma: 'NTC 1382-1-2', cumple: true },
              resistenciaPilling: { medidoLab: Number(pillingLab) || 4.0, unidad: 'Escala 1-5', norma: 'NTC 2051', cumple: true },

              solidezLavadoDomestico: { medidoLab: Number(solLavadoLab) || 4.5, unidad: 'Escala 1-5', norma: 'NTC 1155', cumple: true },
              solidezFroteSeco: { medidoLab: Number(solFroteSecoLab) || 4.0, unidad: 'Escala 1-5', norma: 'NTC 786', cumple: true },
              solidezFroteHumedo: { medidoLab: Number(solFroteHumLab) || 3.5, unidad: 'Escala 1-5', norma: 'NTC 786', cumple: true },
              cambioColor: { medidoLab: Number(cambioColorLab) || 4.0, unidad: 'Escala 1-5', norma: 'NTC 786', cumple: true },
              aptitudFroteCombinacion: aptoSolidezDropdown === 'Adecuado para combinar' ? 'APTO PARA COMBINAR' : 'SUELTA COLOR CON LA FRICCIÓN',
              pruebaFusionado: {
                resultado: pruebaFusionadoLab as any,
                norma: 'NTC 4873'
              },
              lavadoSugerido: 'Ciclo delicado, agua fría',

              conformeFT,
              conformePLM,
              dictamenFinal: dictamenLab,
              observacionesRecomendaciones: obsRecomendaciones
            }
          }}
          onClose={() => setMostrarReportePDF(false)}
        />
      )}

      {/* Modal Calculadora Técnica de Laboratorio Textil */}
      {modalCalculadoraAbierto && (
        <CalculadoraLaboratorioModal
          abierto={modalCalculadoraAbierto}
          onCerrar={() => setModalCalculadoraAbierto(false)}
          tabInicial="gramaje"
          muestraInicialId={tela.id}
          onAplicarValoresALab={handleAplicarDesdeCalculadora}
        />
      )}

    </div>
  );
};
