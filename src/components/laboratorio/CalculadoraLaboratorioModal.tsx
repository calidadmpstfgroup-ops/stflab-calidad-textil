import React, { useState, useEffect, useMemo } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Calculator, 
  Ruler, 
  Copy, 
  Check, 
  Layers, 
  ArrowUpDown, 
  ArrowLeftRight, 
  Sparkles, 
  Download, 
  X, 
  FileCheck, 
  KeyRound, 
  Save, 
  CheckCircle2, 
  AlertTriangle,
  Scale,
  RefreshCw,
  Gauge,
  Activity,
  FileSpreadsheet,
  HelpCircle,
  Scissors,
  Bookmark,
  Share2,
  Sliders,
  Maximize2
} from 'lucide-react';

export type TabCalculadora = 
  | 'gramaje' 
  | 'encogimiento' 
  | 'revirado' 
  | 'titulacion' 
  | 'densidad' 
  | 'elongacion' 
  | 'patronaje';

export type ProporcionPieza = '1/1' | '1/2' | '1/4';

export interface CalculadoraLaboratorioModalProps {
  abierto: boolean;
  onCerrar: () => void;
  tabInicial?: TabCalculadora;
  muestraInicialId?: string;
  onAbrirGestionUsuarios?: () => void;
  onAplicarValoresALab?: (valores: {
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
  }) => void;
  onAplicarValoresAPatronaje?: (valores: {
    factorX: number;
    factorY: number;
    largoCompensado: number;
    anchoCompensado: number;
    observacionCad: string;
    holguraSugerida: number;
  }) => void;
}

export const CalculadoraLaboratorioModal: React.FC<CalculadoraLaboratorioModalProps> = ({
  abierto,
  onCerrar,
  tabInicial = 'gramaje',
  muestraInicialId,
  onAbrirGestionUsuarios,
  onAplicarValoresALab,
  onAplicarValoresAPatronaje
}) => {
  const { 
    muestras, 
    analistaActivo, 
    solicitudesTelas 
  } = useQuality();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabCalculadora>(tabInicial);

  // Sincronizar tabInicial cuando cambie o se abra
  useEffect(() => {
    if (tabInicial) {
      setActiveTab(tabInicial);
    }
  }, [tabInicial, abierto]);

  // Selección de Muestra o Solicitud del sistema
  const [muestraId, setMuestraId] = useState<string>(muestraInicialId || muestras[0]?.id || '');
  const muestraSeleccionada = useMemo(() => {
    return muestras.find(m => m.id === muestraId) || muestras[0];
  }, [muestras, muestraId]);

  // Toast / feedback temporal
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Copiado genérico
  const [copiadoGlobal, setCopiadoGlobal] = useState(false);
  const copiarTexto = (texto: string, label: string = 'Copiado al portapapeles') => {
    navigator.clipboard.writeText(texto);
    setCopiadoGlobal(true);
    showToast(`✓ ${label}`);
    setTimeout(() => setCopiadoGlobal(false), 2000);
  };

  // =========================================================================
  // 1. MÓDULO GRAMAJE, PESO LINEAL Y RENDIMIENTO (NTC 230 / ASTM D3776)
  // =========================================================================
  const [tipoProbetaGramaje, setTipoProbetaGramaje] = useState<'circular100' | 'rectangular' | 'personalizada'>('circular100');
  const [pesoProbetaG, setPesoProbetaG] = useState<number>(2.45);
  const [anchoProbetaCm, setAnchoProbetaCm] = useState<number>(10);
  const [largoProbetaCm, setLargoProbetaCm] = useState<number>(10);
  const [anchoUtilM, setAnchoUtilM] = useState<number>(1.48);
  const [anchoTotalM, setAnchoTotalM] = useState<number>(1.52);
  const [gramajeNominalFT, setGramajeNominalFT] = useState<number>(240);
  const [toleranciaGramajePct, setToleranciaGramajePct] = useState<number>(5.0);

  // Cálculo área probeta en m²
  const areaProbetaM2 = useMemo(() => {
    if (tipoProbetaGramaje === 'circular100') return 0.01; // 100 cm² estándar
    return (largoProbetaCm * anchoProbetaCm) / 10000;
  }, [tipoProbetaGramaje, largoProbetaCm, anchoProbetaCm]);

  // Gramaje en g/m²
  const gramajeCalculadoGsm = useMemo(() => {
    if (areaProbetaM2 <= 0 || pesoProbetaG <= 0) return 0;
    return parseFloat((pesoProbetaG / areaProbetaM2).toFixed(2));
  }, [pesoProbetaG, areaProbetaM2]);

  // Gramaje en oz/yd² (1 g/m² = 0.0294935 oz/yd²)
  const gramajeOzYd2 = useMemo(() => {
    return parseFloat((gramajeCalculadoGsm * 0.0294935).toFixed(2));
  }, [gramajeCalculadoGsm]);

  // Rendimiento lineal (m/kg) = 1000 / (gramaje * ancho_util_m)
  const rendimientoLinealMkg = useMemo(() => {
    if (gramajeCalculadoGsm <= 0 || anchoUtilM <= 0) return 0;
    return parseFloat((1000 / (gramajeCalculadoGsm * anchoUtilM)).toFixed(2));
  }, [gramajeCalculadoGsm, anchoUtilM]);

  // Peso lineal (g/m lineal) = gramaje * ancho_total_m
  const pesoLinealGml = useMemo(() => {
    if (gramajeCalculadoGsm <= 0 || anchoTotalM <= 0) return 0;
    return parseFloat((gramajeCalculadoGsm * anchoTotalM).toFixed(2));
  }, [gramajeCalculadoGsm, anchoTotalM]);

  // Desviación contra FT nominal
  const desviacionGramajePct = useMemo(() => {
    if (gramajeNominalFT <= 0 || gramajeCalculadoGsm <= 0) return 0;
    return parseFloat((((gramajeCalculadoGsm - gramajeNominalFT) / gramajeNominalFT) * 100).toFixed(2));
  }, [gramajeCalculadoGsm, gramajeNominalFT]);

  const cumpleToleranciaGramaje = useMemo(() => {
    return Math.abs(desviacionGramajePct) <= toleranciaGramajePct;
  }, [desviacionGramajePct, toleranciaGramajePct]);

  // =========================================================================
  // 2. MÓDULO ESTABILIDAD DIMENSIONAL / ENCOGIMIENTOS (AATCC 135 / NTC 908)
  // =========================================================================
  const [distanciaInicialCm, setDistanciaInicialCm] = useState<number>(35.0); // marcas a 35 cm o 50 cm
  // 3 Marcas en Urdimbre (Largo)
  const [uMarca1, setUMarca1] = useState<number>(33.8);
  const [uMarca2, setUMarca2] = useState<number>(33.7);
  const [uMarca3, setUMarca3] = useState<number>(33.9);
  const [encogimientoLargoMaxPermitido, setEncogimientoLargoMaxPermitido] = useState<number>(-3.0);

  // 3 Marcas en Trama (Ancho)
  const [tMarca1, setTMarca1] = useState<number>(34.4);
  const [tMarca2, setTMarca2] = useState<number>(34.3);
  const [tMarca3, setTMarca3] = useState<number>(34.5);
  const [encogimientoAnchoMaxPermitido, setEncogimientoAnchoMaxPermitido] = useState<number>(-2.5);

  // Cálculos promedios y porcentajes
  const promedioUrdimbreCm = useMemo(() => {
    return parseFloat(((uMarca1 + uMarca2 + uMarca3) / 3).toFixed(2));
  }, [uMarca1, uMarca2, uMarca3]);

  const varUrdimbrePct = useMemo(() => {
    if (distanciaInicialCm <= 0) return 0;
    return parseFloat((((promedioUrdimbreCm - distanciaInicialCm) / distanciaInicialCm) * 100).toFixed(2));
  }, [promedioUrdimbreCm, distanciaInicialCm]);

  const promedioTramaCm = useMemo(() => {
    return parseFloat(((tMarca1 + tMarca2 + tMarca3) / 3).toFixed(2));
  }, [tMarca1, tMarca2, tMarca3]);

  const varTramaPct = useMemo(() => {
    if (distanciaInicialCm <= 0) return 0;
    return parseFloat((((promedioTramaCm - distanciaInicialCm) / distanciaInicialCm) * 100).toFixed(2));
  }, [promedioTramaCm, distanciaInicialCm]);

  const cumpleUrdimbre = useMemo(() => {
    return varUrdimbrePct >= encogimientoLargoMaxPermitido;
  }, [varUrdimbrePct, encogimientoLargoMaxPermitido]);

  const cumpleTrama = useMemo(() => {
    return varTramaPct >= encogimientoAnchoMaxPermitido;
  }, [varTramaPct, encogimientoAnchoMaxPermitido]);

  // =========================================================================
  // 3. MÓDULO REVIRADO, SESGO & TORSIÓN (AATCC 179 / NTC 2564)
  // =========================================================================
  const [desviacionCosturaCm, setDesviacionCosturaCm] = useState<number>(1.2);
  const [longitudCosturaCm, setLongitudCosturaCm] = useState<number>(75.0);
  const [limiteReviradoMax, setLimiteReviradoMax] = useState<number>(3.0);

  const reviradoCalculadoPct = useMemo(() => {
    if (longitudCosturaCm <= 0) return 0;
    return parseFloat(((Math.abs(desviacionCosturaCm) / longitudCosturaCm) * 100).toFixed(2));
  }, [desviacionCosturaCm, longitudCosturaCm]);

  const estadoRevirado = useMemo(() => {
    if (reviradoCalculadoPct <= limiteReviradoMax) {
      return { nivel: 'CONFORME', color: 'emerald', texto: 'Dentro de norma (Sin espiralidad perceptible)' };
    }
    if (reviradoCalculadoPct <= limiteReviradoMax + 1.5) {
      return { nivel: 'OBSERVACIÓN', color: 'amber', texto: 'Revirado moderado - Requiere compensación en trazo' };
    }
    return { nivel: 'RECHAZADO', color: 'rose', texto: 'Torsión excesiva - Genera deformación en prenda lavada' };
  }, [reviradoCalculadoPct, limiteReviradoMax]);

  // =========================================================================
  // 4. MÓDULO TITULACIÓN Y CONVERSIÓN DE HILADOS (ASTM D1907 / NTC 2058)
  // =========================================================================
  const [modoTitulacion, setModoTitulacion] = useState<'calculoDevanadora' | 'conversor'>('calculoDevanadora');
  const [longitudDevanadoraM, setLongitudDevanadoraM] = useState<number>(100);
  const [pesoMadejaG, setPesoMadejaG] = useState<number>(2.0);

  // Valores interactivos para el conversor
  const [valorInputTitulo, setValorInputTitulo] = useState<number>(30);
  const [sistemaInputTitulo, setSistemaInputTitulo] = useState<'Ne' | 'Nm' | 'Tex' | 'Denier' | 'Dtex'>('Ne');

  // Conversión universal desde sistema seleccionado a Tex
  const texBase = useMemo(() => {
    if (modoTitulacion === 'calculoDevanadora') {
      if (longitudDevanadoraM <= 0) return 0;
      return (pesoMadejaG * 1000) / longitudDevanadoraM;
    }
    const val = valorInputTitulo || 0.0001;
    switch (sistemaInputTitulo) {
      case 'Ne': return 590.54 / val;
      case 'Nm': return 1000 / val;
      case 'Tex': return val;
      case 'Denier': return val / 9;
      case 'Dtex': return val / 10;
      default: return 20;
    }
  }, [modoTitulacion, longitudDevanadoraM, pesoMadejaG, valorInputTitulo, sistemaInputTitulo]);

  // Sistema de títulos calculados en vivo
  const titulosCalculados = useMemo(() => {
    const tex = Math.max(0.001, texBase);
    return {
      Tex: parseFloat(tex.toFixed(2)),
      Dtex: parseFloat((tex * 10).toFixed(1)),
      Denier: parseFloat((tex * 9).toFixed(1)),
      Ne: parseFloat((590.54 / tex).toFixed(2)),
      Nm: parseFloat((1000 / tex).toFixed(2)),
    };
  }, [texBase]);

  // Sugerencia de aguja para confección según el título
  const recomendacionAguja = useMemo(() => {
    const ne = titulosCalculados.Ne;
    if (ne >= 50) return { calibre: '65/9 - 70/10', tipo: 'Punta de bola fina (Tejido liviano / Seda / Blusa)' };
    if (ne >= 30) return { calibre: '75/11 - 80/12', tipo: 'Punta universal (Camisería / Popelina / Algodón)' };
    if (ne >= 16) return { calibre: '90/14 - 100/16', tipo: 'Punta regular pesada (Dril / Gabardina / Chaqueta)' };
    return { calibre: '110/18 - 120/19', tipo: 'Punta jeans / cortante (Denim pesado / Lona / Overlock grueso)' };
  }, [titulosCalculados.Ne]);

  // =========================================================================
  // 5. MÓDULO DENSIDAD & FACTOR DE COBERTURA (ASTM D3775 / NTC 428)
  // =========================================================================
  const [hilosPorCmUrdimbre, setHilosPorCmUrdimbre] = useState<number>(36);
  const [pasadasPorCmTrama, setPasadasPorCmTrama] = useState<number>(24);

  const epiCalculado = useMemo(() => parseFloat((hilosPorCmUrdimbre * 2.54).toFixed(1)), [hilosPorCmUrdimbre]);
  const ppiCalculado = useMemo(() => parseFloat((pasadasPorCmTrama * 2.54).toFixed(1)), [pasadasPorCmTrama]);
  const totalThreadCount = useMemo(() => Math.round(epiCalculado + ppiCalculado), [epiCalculado, ppiCalculado]);

  // Factor de cobertura de Peirce para tejido plano: K1 = n1 / sqrt(Ne1), K2 = n2 / sqrt(Ne2)
  const factorCoberturaPeirce = useMemo(() => {
    const ne = Math.max(1, titulosCalculados.Ne);
    const k1 = epiCalculado / Math.sqrt(ne);
    const k2 = ppiCalculado / Math.sqrt(ne);
    const kTotal = k1 + k2 - (k1 * k2) / 28;
    return parseFloat(kTotal.toFixed(2));
  }, [epiCalculado, ppiCalculado, titulosCalculados.Ne]);

  // =========================================================================
  // 6. MÓDULO ELONGACIÓN & RECUPERACIÓN ELÁSTICA (ASTM D3107 - STRETCH / DENIM)
  // =========================================================================
  const [l0InicialMm, setL0InicialMm] = useState<number>(250);
  const [l1BajoCargaMm, setL1BajoCargaMm] = useState<number>(325);
  const [l2Recuperado1MinMm, setL2Recuperado1MinMm] = useState<number>(260);
  const [l3Recuperado30MinMm, setL3Recuperado30MinMm] = useState<number>(254);

  const elongacionPct = useMemo(() => {
    if (l0InicialMm <= 0) return 0;
    return parseFloat((((l1BajoCargaMm - l0InicialMm) / l0InicialMm) * 100).toFixed(2));
  }, [l0InicialMm, l1BajoCargaMm]);

  const recuperacion1MinPct = useMemo(() => {
    const deltaCarga = l1BajoCargaMm - l0InicialMm;
    if (deltaCarga <= 0) return 100;
    return parseFloat((((l1BajoCargaMm - l2Recuperado1MinMm) / deltaCarga) * 100).toFixed(2));
  }, [l0InicialMm, l1BajoCargaMm, l2Recuperado1MinMm]);

  const recuperacion30MinPct = useMemo(() => {
    const deltaCarga = l1BajoCargaMm - l0InicialMm;
    if (deltaCarga <= 0) return 100;
    return parseFloat((((l1BajoCargaMm - l3Recuperado30MinMm) / deltaCarga) * 100).toFixed(2));
  }, [l0InicialMm, l1BajoCargaMm, l3Recuperado30MinMm]);

  const crecimientoResidualPct = useMemo(() => {
    if (l0InicialMm <= 0) return 0;
    return parseFloat((((l3Recuperado30MinMm - l0InicialMm) / l0InicialMm) * 100).toFixed(2));
  }, [l0InicialMm, l3Recuperado30MinMm]);

  const clasificacionStretch = useMemo(() => {
    if (elongacionPct >= 35) return { tipo: 'SUPER STRETCH / BI-STRETCH', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    if (elongacionPct >= 20) return { tipo: 'COMFORT STRETCH', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    if (elongacionPct >= 10) return { tipo: 'SEMI STRETCH (MECÁNICO)', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    return { tipo: 'RÍGIDO / TEJIDO ESTÁTICO', badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
  }, [elongacionPct]);

  // =========================================================================
  // 7. MÓDULO ESCALADO CAD / PATRONAJE
  // =========================================================================
  const [largoBaseCm, setLargoBaseCm] = useState<number>(72.5);
  const [anchoBaseCm, setAnchoBaseCm] = useState<number>(25.5);
  const [proporcion, setProporcion] = useState<ProporcionPieza>('1/4');

  // Factores de escala calculados a partir de los encogimientos del Módulo 2 o manuales
  const esEncogimientoLargo = varUrdimbrePct <= 0;
  const esEncogimientoAncho = varTramaPct <= 0;

  const factorEscalaX = useMemo(() => {
    return esEncogimientoLargo
      ? 1 + (Math.abs(varUrdimbrePct) / 100)
      : 1 - (Math.abs(varUrdimbrePct) / 100);
  }, [esEncogimientoLargo, varUrdimbrePct]);

  const factorEscalaY = useMemo(() => {
    return esEncogimientoAncho
      ? 1 + (Math.abs(varTramaPct) / 100)
      : 1 - (Math.abs(varTramaPct) / 100);
  }, [esEncogimientoAncho, varTramaPct]);

  const largoCompensadoCm = parseFloat((largoBaseCm * factorEscalaX).toFixed(2));
  const diffLargoCm = parseFloat((largoCompensadoCm - largoBaseCm).toFixed(2));
  const anchoCompensadoCm = parseFloat((anchoBaseCm * factorEscalaY).toFixed(2));
  const diffAnchoCm = parseFloat((anchoCompensadoCm - anchoBaseCm).toFixed(2));

  // Patronaje Avanzado: Presets de Prenda STF, Elasticidad Stretch y Márgenes
  const [tipoPrenda, setTipoPrenda] = useState<'pantalon' | 'chaqueta' | 'blusa' | 'falda' | 'personalizado'>('pantalon');
  const [sentidoCorte, setSentidoCorte] = useState<'hilo' | 'contrahilo' | 'sesgo'>('hilo');
  const [porcentajeDescuentoStretch, setPorcentajeDescuentoStretch] = useState<number>(0);
  const [margenCosturaCm, setMargenCosturaCm] = useState<number>(1.0);

  const [cotasPersonalizadas, setCotasPersonalizadas] = useState<Array<{
    id: string;
    nombre: string;
    baseCm: number;
    proporcion: ProporcionPieza;
    eje: 'largo' | 'ancho';
  }>>([
    { id: 'c1', nombre: 'Largo Entrepierna / Total', baseCm: 75.0, proporcion: '1/1', eje: 'largo' },
    { id: 'c2', nombre: '1/4 Contorno Cadera', baseCm: 25.5, proporcion: '1/4', eje: 'ancho' },
    { id: 'c3', nombre: '1/4 Contorno Cintura', baseCm: 20.0, proporcion: '1/4', eje: 'ancho' },
    { id: 'c4', nombre: '1/2 Ancho Bota', baseCm: 18.0, proporcion: '1/2', eje: 'ancho' },
    { id: 'c5', nombre: 'Tiro Delantero', baseCm: 24.0, proporcion: '1/1', eje: 'largo' }
  ]);

  const handleCambiarTipoPrenda = (tipo: 'pantalon' | 'chaqueta' | 'blusa' | 'falda' | 'personalizado') => {
    setTipoPrenda(tipo);
    if (tipo === 'pantalon') {
      setCotasPersonalizadas([
        { id: 'c1', nombre: 'Largo Entrepierna / Total', baseCm: 75.0, proporcion: '1/1', eje: 'largo' },
        { id: 'c2', nombre: '1/4 Contorno Cadera', baseCm: 25.5, proporcion: '1/4', eje: 'ancho' },
        { id: 'c3', nombre: '1/4 Contorno Cintura', baseCm: 20.0, proporcion: '1/4', eje: 'ancho' },
        { id: 'c4', nombre: '1/2 Ancho Bota', baseCm: 18.0, proporcion: '1/2', eje: 'ancho' },
        { id: 'c5', nombre: 'Tiro Delantero', baseCm: 24.0, proporcion: '1/1', eje: 'largo' }
      ]);
      setLargoBaseCm(75.0);
      setAnchoBaseCm(25.5);
    } else if (tipo === 'chaqueta') {
      setCotasPersonalizadas([
        { id: 'c1', nombre: 'Largo Espalda', baseCm: 62.0, proporcion: '1/1', eje: 'largo' },
        { id: 'c2', nombre: '1/4 Contorno Pecho', baseCm: 26.0, proporcion: '1/4', eje: 'ancho' },
        { id: 'c3', nombre: 'Largo Manga', baseCm: 60.0, proporcion: '1/1', eje: 'largo' },
        { id: 'c4', nombre: '1/2 Ancho Puño', baseCm: 12.5, proporcion: '1/2', eje: 'ancho' },
        { id: 'c5', nombre: 'Ancho Espalda (1/2)', baseCm: 20.5, proporcion: '1/2', eje: 'ancho' }
      ]);
      setLargoBaseCm(62.0);
      setAnchoBaseCm(26.0);
    } else if (tipo === 'blusa') {
      setCotasPersonalizadas([
        { id: 'c1', nombre: '1/4 Contorno Busto', baseCm: 24.0, proporcion: '1/4', eje: 'ancho' },
        { id: 'c2', nombre: 'Largo Talle Delantero', baseCm: 56.0, proporcion: '1/1', eje: 'largo' },
        { id: 'c3', nombre: '1/2 Ancho Espalda', baseCm: 19.0, proporcion: '1/2', eje: 'ancho' },
        { id: 'c4', nombre: 'Largo Manga', baseCm: 58.0, proporcion: '1/1', eje: 'largo' }
      ]);
      setLargoBaseCm(56.0);
      setAnchoBaseCm(24.0);
    } else if (tipo === 'falda') {
      setCotasPersonalizadas([
        { id: 'c1', nombre: '1/4 Cintura', baseCm: 18.5, proporcion: '1/4', eje: 'ancho' },
        { id: 'c2', nombre: '1/4 Cadera', baseCm: 25.0, proporcion: '1/4', eje: 'ancho' },
        { id: 'c3', nombre: 'Largo Total Falda', baseCm: 88.0, proporcion: '1/1', eje: 'largo' },
        { id: 'c4', nombre: '1/2 Ruedo / Vuelo', baseCm: 55.0, proporcion: '1/2', eje: 'ancho' }
      ]);
      setLargoBaseCm(88.0);
      setAnchoBaseCm(25.0);
    }
  };

  const cotasCalculadas = useMemo(() => {
    return cotasPersonalizadas.map(c => {
      const factorStretch = c.eje === 'ancho' ? (1 - Math.abs(porcentajeDescuentoStretch) / 100) : 1;
      const baseConStretch = c.baseCm * factorStretch;

      let factorLavado = 1;
      if (sentidoCorte === 'hilo') {
        factorLavado = c.eje === 'largo' ? factorEscalaX : factorEscalaY;
      } else if (sentidoCorte === 'contrahilo') {
        factorLavado = c.eje === 'largo' ? factorEscalaY : factorEscalaX;
      } else {
        factorLavado = Math.sqrt((factorEscalaX ** 2 + factorEscalaY ** 2) / 2);
      }

      const cotaEscalada = baseConStretch * factorLavado;
      const cotaFinalConMargen = cotaEscalada + (c.proporcion === '1/1' ? margenCosturaCm * 2 : margenCosturaCm);
      const delta = cotaFinalConMargen - c.baseCm;

      return {
        ...c,
        baseConStretch: parseFloat(baseConStretch.toFixed(2)),
        cotaEscalada: parseFloat(cotaEscalada.toFixed(2)),
        cotaFinalConMargen: parseFloat(cotaFinalConMargen.toFixed(2)),
        delta: parseFloat(delta.toFixed(2))
      };
    });
  }, [cotasPersonalizadas, porcentajeDescuentoStretch, sentidoCorte, factorEscalaX, factorEscalaY, margenCosturaCm]);

  // =========================================================================
  // CARGA REACTIVA DE MUESTRAS DEL SISTEMA
  // =========================================================================
  const cargarValoresDeMuestra = (id: string) => {
    setMuestraId(id);
    const m = muestras.find(x => x.id === id);
    if (!m) return;

    if (m.ensayos) {
      if (m.ensayos.gramajeGsm?.valor) setPesoProbetaG((m.ensayos.gramajeGsm.valor / 100));
      if (m.ensayos.encogimientoLargo?.valor) {
        const valLargo = m.ensayos.encogimientoLargo.valor;
        // proyectar a 35 cm
        const finalEst = 35 * (1 + valLargo / 100);
        setUMarca1(parseFloat(finalEst.toFixed(1)));
        setUMarca2(parseFloat(finalEst.toFixed(1)));
        setUMarca3(parseFloat(finalEst.toFixed(1)));
      }
      if (m.ensayos.encogimientoAncho?.valor) {
        const valAncho = m.ensayos.encogimientoAncho.valor;
        const finalEst = 35 * (1 + valAncho / 100);
        setTMarca1(parseFloat(finalEst.toFixed(1)));
        setTMarca2(parseFloat(finalEst.toFixed(1)));
        setTMarca3(parseFloat(finalEst.toFixed(1)));
      }
      if (m.ensayos.anchoTotal?.valor) setAnchoTotalM(m.ensayos.anchoTotal.valor);
      if (m.ensayos.anchoUtil?.valor) setAnchoUtilM(m.ensayos.anchoUtil.valor);
    }
    showToast(`✓ Datos sincronizados con muestra: ${m.referencia}`);
  };

  // Generación de Dictamen Técnico Consolidado para Copiar
  const generarDictamenTexto = () => {
    return `======================================================
MEMORIA DE CÁLCULO - LABORATORIO DE CALIDAD STF GROUP
Referencia: ${muestraSeleccionada?.referencia || 'Muestra de Ensayo'}
Analista: ${analistaActivo?.nombreCompleto || 'Laboratorio'}
Fecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
======================================================
1. GRAMAJE Y RENDIMIENTO (NTC 230 / ASTM D3776):
   • Gramaje Real: ${gramajeCalculadoGsm} g/m² (${gramajeOzYd2} oz/yd²)
   • Gramaje FT: ${gramajeNominalFT} g/m² | Desviación: ${desviacionGramajePct}% [${cumpleToleranciaGramaje ? 'APROBADO' : 'FUERA DE TOLERANCIA'}]
   • Ancho Útil: ${anchoUtilM} m | Ancho Total: ${anchoTotalM} m
   • Rendimiento Lineal: ${rendimientoLinealMkg} m/kg
   • Peso Lineal: ${pesoLinealGml} g/m lineal

2. ESTABILIDAD DIMENSIONAL (AATCC 135 / NTC 908):
   • Sentido Hilo / Urdimbre: ${varUrdimbrePct}% (Promedio: ${promedioUrdimbreCm} cm de ${distanciaInicialCm} cm) -> ${cumpleUrdimbre ? 'CONFORME' : 'ALERTA'}
   • Sentido Trama / Ancho: ${varTramaPct}% (Promedio: ${promedioTramaCm} cm de ${distanciaInicialCm} cm) -> ${cumpleTrama ? 'CONFORME' : 'ALERTA'}

3. REVIRADO / SESGO DE COSTURA (AATCC 179 / NTC 2564):
   • Torsión Medida: ${reviradoCalculadoPct}% (${desviacionCosturaCm} cm en ${longitudCosturaCm} cm) -> ${estadoRevirado.nivel}

4. TITULACIÓN DE HILADOS (ASTM D1907):
   • Título: ${titulosCalculados.Ne} Ne | ${titulosCalculados.Tex} Tex | ${titulosCalculados.Nm} Nm | ${titulosCalculados.Denier} Den
   • Aguja Recomendada: ${recomendacionAguja.calibre} (${recomendacionAguja.tipo})

5. DENSIDAD Y COBERTURA (ASTM D3775):
   • Densidad: ${hilosPorCmUrdimbre} h/cm x ${pasadasPorCmTrama} pas/cm (${epiCalculado} EPI x ${ppiCalculado} PPI)
   • Total Thread Count: ${totalThreadCount} | Factor Cobertura Peirce: ${factorCoberturaPeirce}

6. ELONGACIÓN & RECUPERACIÓN ELÁSTICA (ASTM D3107):
   • Elongación: ${elongacionPct}% [${clasificacionStretch.tipo}]
   • Recuperación (30 min): ${recuperacion30MinPct}% | Deformación Residual: ${crecimientoResidualPct}%

7. FACTORES ESCALADO CAD (PATRONAJE):
   • Factor X (Largo): ${factorEscalaX.toFixed(4)} (+${diffLargoCm} cm)
   • Factor Y (Ancho): ${factorEscalaY.toFixed(4)} (+${diffAnchoCm} cm)
======================================================`;
  };

  const handleAplicarALab = () => {
    if (onAplicarValoresALab) {
      onAplicarValoresALab({
        gramaje: gramajeCalculadoGsm,
        pesoLineal: pesoLinealGml,
        rendimiento: rendimientoLinealMkg,
        anchoUtil: anchoUtilM,
        anchoTotal: anchoTotalM,
        encogimientoLargo: varUrdimbrePct,
        encogimientoAncho: varTramaPct,
        viro: reviradoCalculadoPct,
        elongacionLargo: elongacionPct,
        elongacionAncho: varTramaPct
      });
      showToast('✓ Valores aplicados con éxito a la evaluación activa del Laboratorio');
    }
  };

  if (!abierto) return null;

  return (
    <div className="calculadora-laboratorio-modal fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans select-none animate-fade-in text-white">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden my-auto text-white max-h-[95vh] flex flex-col">
        
        {/* =========================================================================
            HEADER DE IDENTIDAD TÉCNICA STFLAB
           ========================================================================= */}
        <div className="bg-[#090d16] text-white px-5 py-4 border-b border-slate-700/70 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Título & Badge */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-lg shrink-0">
                <Calculator className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-wide text-white uppercase font-display">
                    Calculadora Técnica de Laboratorio Textil
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-slate-950 font-mono">
                    STFLAB PRO
                  </span>
                </div>
                <p className="text-xs text-white/90 mt-0.5 font-medium">
                  Ensayos según Normas ASTM, AATCC, ISO y NTC • Gramaje, Rendimiento, Encogimientos, Revirado, Títulos y CAD
                </p>
              </div>
            </div>

            {/* Selector de Muestra Activa & Botón Cerrar */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
              
              {/* Selector Muestra */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="text-[10px] font-bold text-white uppercase font-mono">Muestra:</span>
                <select
                  value={muestraId}
                  onChange={(e) => cargarValoresDeMuestra(e.target.value)}
                  className="bg-transparent text-white font-bold font-mono outline-none text-xs cursor-pointer max-w-[150px] truncate"
                >
                  {muestras.map(m => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                      {m.referencia} - {m.proveedor}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={onCerrar}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-950 text-white hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 flex items-center justify-center transition-all cursor-pointer shrink-0"
                title="Cerrar calculadora"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

          </div>

          {/* =========================================================================
              PESTAÑAS DE MÓDULOS TÉCNICOS
             ========================================================================= */}
          <div className="flex items-center gap-1.5 pt-3 overflow-x-auto custom-horizontal-scroll">
            <button
              type="button"
              onClick={() => setActiveTab('gramaje')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'gramaje'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/90 text-white font-bold hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>1. Gramaje & Rendimiento</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('encogimiento')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'encogimiento'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/90 text-white font-bold hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>2. Encogimientos (3 Marcas)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('revirado')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'revirado'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/90 text-white font-bold hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>3. Revirado & Sesgo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('titulacion')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'titulacion'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/90 text-white font-bold hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>4. Títulos de Hilo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('densidad')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'densidad'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/90 text-white font-bold hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>5. Densidad & Cobertura</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('elongacion')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'elongacion'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/90 text-white font-bold hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>6. Elongación & Stretch</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('patronaje')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'patronaje'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/90 text-white font-bold hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>7. Escalado CAD / Moldes</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            CUERPO PRINCIPAL CON CADA MÓDULO INTERACTIVO
           ========================================================================= */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-vertical-scroll">
          
          {/* TOAST FLOTANTE LOCAL */}
          {toastMsg && (
            <div className="fixed top-20 right-8 z-[9999] bg-cyan-950 text-cyan-300 border border-cyan-500/60 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* =====================================================================
              TAB 1: GRAMAJE, PESO LINEAL Y RENDIMIENTO
             ===================================================================== */}
          {activeTab === 'gramaje' && (
            <div className="space-y-6">
              
              {/* Header de norma */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-cyan-400" />
                    Ensayo de Masa por Unidad de Superficie & Rendimiento Lineal
                  </h3>
                  <p className="text-xs text-slate-400">
                    Norma Técnica Colombiana NTC 230 / ASTM D3776 (Opción C: Muestras cortadas de área fija)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                    Balanza Analítica ±0.01g
                  </span>
                </div>
              </div>

              {/* Grid 2 Columnas: Entradas de Balanza vs Resultados */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Entradas */}
                <div className="lg:col-span-6 bg-slate-800/40 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-slate-700 pb-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Parámetros de Ensayo y Balanza
                  </h4>

                  {/* Selector de Cortador / Probeta */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Método de Corte de Probeta:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTipoProbetaGramaje('circular100')}
                        className={`p-2 rounded-xl text-xs font-bold transition-all text-left border ${
                          tipoProbetaGramaje === 'circular100'
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="block font-black">Cortador Circular Estándar</span>
                        <span className="text-[10px] opacity-80">Área: 100 cm² (0.01 m²)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTipoProbetaGramaje('rectangular')}
                        className={`p-2 rounded-xl text-xs font-bold transition-all text-left border ${
                          tipoProbetaGramaje === 'rectangular'
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="block font-black">Probeta Rectangular</span>
                        <span className="text-[10px] opacity-80">Largo × Ancho (cm)</span>
                      </button>
                    </div>
                  </div>

                  {/* Medidas Rectangulares si aplica */}
                  {tipoProbetaGramaje === 'rectangular' && (
                    <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-700">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Largo Probeta (cm):</label>
                        <input
                          type="number"
                          step="0.1"
                          value={largoProbetaCm}
                          onChange={(e) => setLargoProbetaCm(parseFloat(e.target.value) || 1)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono font-bold text-white outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ancho Probeta (cm):</label>
                        <input
                          type="number"
                          step="0.1"
                          value={anchoProbetaCm}
                          onChange={(e) => setAnchoProbetaCm(parseFloat(e.target.value) || 1)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono font-bold text-white outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Peso medido en balanza */}
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white">Peso en Balanza Analítica (g):</label>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">1 probeta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.001"
                        value={pesoProbetaG}
                        onChange={(e) => setPesoProbetaG(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-base font-mono font-black text-cyan-300 outline-none focus:border-cyan-400"
                        placeholder="ej. 2.45"
                      />
                      <span className="font-mono font-bold text-slate-400">gramos</span>
                    </div>
                  </div>

                  {/* Ancho Útil y Total para Rendimiento */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Ancho Útil (m):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={anchoUtilM}
                        onChange={(e) => setAnchoUtilM(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold text-white outline-none focus:border-cyan-400"
                        placeholder="ej. 1.48"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Ancho Total (m):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={anchoTotalM}
                        onChange={(e) => setAnchoTotalM(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold text-white outline-none focus:border-cyan-400"
                        placeholder="ej. 1.52"
                      />
                    </div>
                  </div>

                  {/* Comparador contra FT Nominal */}
                  <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-700 space-y-2">
                    <span className="text-[11px] font-bold text-slate-300 uppercase block">
                      Especificación de Ficha Técnica (FT):
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400">Gramaje Nominal (g/m²):</label>
                        <input
                          type="number"
                          value={gramajeNominalFT}
                          onChange={(e) => setGramajeNominalFT(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono font-bold text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Tolerancia Permisible (±%):</label>
                        <input
                          type="number"
                          step="0.5"
                          value={toleranciaGramajePct}
                          onChange={(e) => setToleranciaGramajePct(parseFloat(e.target.value) || 5)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono font-bold text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Resultados y Tarjetas de Rendimiento */}
                <div className="lg:col-span-6 space-y-4">
                  
                  {/* Tarjeta Principal Gramaje Calculado */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-cyan-500/50 rounded-2xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                        Gramaje Medido en Laboratorio
                      </span>
                      <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border ${
                        cumpleToleranciaGramaje
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      }`}>
                        {cumpleToleranciaGramaje ? '✓ DENTRO DE TOLERANCIA' : '✕ FUERA DE TOLERANCIA'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Masa por m² (GSM):</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-4xl font-black font-mono text-white tracking-tight">
                            {gramajeCalculadoGsm.toFixed(1)}
                          </span>
                          <span className="text-xs font-mono text-cyan-400 font-bold">g/m²</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Equivalente Anglosajón:</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-black font-mono text-cyan-300 tracking-tight">
                            {gramajeOzYd2.toFixed(2)}
                          </span>
                          <span className="text-xs font-mono text-cyan-400 font-bold">oz/yd²</span>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Tolerancia Visual */}
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Desviación frente a FT ({gramajeNominalFT} g/m²):</span>
                        <span className={`font-mono font-bold ${
                          cumpleToleranciaGramaje ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {desviacionGramajePct > 0 ? `+${desviacionGramajePct}%` : `${desviacionGramajePct}%`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            cumpleToleranciaGramaje ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(15, (gramajeCalculadoGsm / (gramajeNominalFT || 1)) * 50))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>Mín: {(gramajeNominalFT * (1 - toleranciaGramajePct / 100)).toFixed(1)} g/m²</span>
                        <span>Nominal: {gramajeNominalFT} g/m²</span>
                        <span>Máx: {(gramajeNominalFT * (1 + toleranciaGramajePct / 100)).toFixed(1)} g/m²</span>
                      </div>
                    </div>
                  </div>

                  {/* Tarjetas Secundarias: Rendimiento Lineal y Peso Lineal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Rendimiento */}
                    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Rendimiento Lineal:</span>
                        <span className="text-[10px] text-cyan-400 font-mono">Ancho {anchoUtilM}m</span>
                      </div>
                      <div className="flex items-baseline gap-1 pt-1">
                        <span className="text-2xl font-black font-mono text-white">
                          {rendimientoLinealMkg.toFixed(2)}
                        </span>
                        <span className="text-xs font-mono text-cyan-400 font-bold">m/kg</span>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1">
                        Metros de tejido aprovechable obtenidos por cada kilogramo de tela.
                      </p>
                    </div>

                    {/* Peso Lineal */}
                    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Peso por Metro Lineal:</span>
                        <span className="text-[10px] text-cyan-400 font-mono">Ancho {anchoTotalM}m</span>
                      </div>
                      <div className="flex items-baseline gap-1 pt-1">
                        <span className="text-2xl font-black font-mono text-white">
                          {pesoLinealGml.toFixed(1)}
                        </span>
                        <span className="text-xs font-mono text-cyan-400 font-bold">g/m lineal</span>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1">
                        Peso exacto en gramos de un metro longitudinal completo de orillo a orillo.
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* =====================================================================
              TAB 2: ESTABILIDAD DIMENSIONAL / ENCOGIMIENTOS (AATCC 135 / NTC 908)
             ===================================================================== */}
          {activeTab === 'encogimiento' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-cyan-400" />
                    Ensayo de Variación Dimensional tras Lavado Doméstico / Industrial
                  </h3>
                  <p className="text-xs text-slate-400">
                    AATCC 135 / NTC 908 / ISO 6330 • Medición de 3 pares de marcas longitudinales y transversales
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-700">
                    Distancia Inicial: {distanciaInicialCm} cm
                  </span>
                </div>
              </div>

              {/* Selector de distancia inicial */}
              <div className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700 text-xs">
                <span className="text-slate-400 font-bold uppercase">Distancia Base entre Marcas:</span>
                <div className="flex gap-2">
                  {[25, 35, 50].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDistanciaInicialCm(d)}
                      className={`px-3 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                        distanciaInicialCm === d
                          ? 'bg-cyan-500 text-slate-950 shadow-xs'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      {d} cm
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuadrícula Urdimbre vs Trama */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Lado Urdimbre / Largo */}
                <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4 text-cyan-400" />
                      Urdimbre / Sentido Hilo (Largo)
                    </h4>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      cumpleUrdimbre ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {cumpleUrdimbre ? 'CONFORME' : 'EXCESIVO'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[11px] text-slate-400 block">Lectura de 3 marcas tras lavado (cm):</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Marca 1:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={uMarca1}
                          onChange={(e) => setUMarca1(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono font-bold text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Marca 2:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={uMarca2}
                          onChange={(e) => setUMarca2(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono font-bold text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Marca 3:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={uMarca3}
                          onChange={(e) => setUMarca3(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono font-bold text-white text-center"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Promedio Urdimbre:</span>
                        <span className="font-mono font-bold text-white">{promedioUrdimbreCm} cm</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">% Variación Calculada:</span>
                        <span className={`text-base font-mono font-black ${
                          varUrdimbrePct <= 0 ? 'text-cyan-400' : 'text-amber-400'
                        }`}>
                          {varUrdimbrePct}% {varUrdimbrePct <= 0 ? '(Contracción)' : '(Elongación)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-800">
                        <span>Límite Máximo Aceptable:</span>
                        <span className="font-mono text-slate-300">{encogimientoLargoMaxPermitido}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lado Trama / Ancho */}
                <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                      Trama / Sentido Ancho
                    </h4>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      cumpleTrama ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {cumpleTrama ? 'CONFORME' : 'EXCESIVO'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[11px] text-slate-400 block">Lectura de 3 marcas tras lavado (cm):</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Marca 1:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={tMarca1}
                          onChange={(e) => setTMarca1(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono font-bold text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Marca 2:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={tMarca2}
                          onChange={(e) => setTMarca2(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono font-bold text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Marca 3:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={tMarca3}
                          onChange={(e) => setTMarca3(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono font-bold text-white text-center"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Promedio Trama:</span>
                        <span className="font-mono font-bold text-white">{promedioTramaCm} cm</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">% Variación Calculada:</span>
                        <span className={`text-base font-mono font-black ${
                          varTramaPct <= 0 ? 'text-cyan-400' : 'text-amber-400'
                        }`}>
                          {varTramaPct}% {varTramaPct <= 0 ? '(Contracción)' : '(Elongación)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-800">
                        <span>Límite Máximo Aceptable:</span>
                        <span className="font-mono text-slate-300">{encogimientoAnchoMaxPermitido}%</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Botón directo para pasar a Escalado CAD */}
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs text-slate-300">
                    ¿Deseas escalar moldes en Patronaje con estos porcentajes ({varUrdimbrePct}% largo, {varTramaPct}% ancho)?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('patronaje')}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Abrir Escalado CAD con estos valores</span>
                  <Ruler className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

          {/* =====================================================================
              TAB 3: REVIRADO, SESGO & TORSIÓN (AATCC 179 / NTC 2564)
             ===================================================================== */}
          {activeTab === 'revirado' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-cyan-400" />
                    Ensayo de Revirado, Sesgo y Torsión de Costura en Tejido / Prenda
                  </h3>
                  <p className="text-xs text-slate-400">
                    AATCC 179 / NTC 2564 • Determinación del cambio de sesgo o espiralidad tras ciclos de lavado
                  </p>
                </div>
                <span className={`text-xs font-mono font-black px-3 py-1 rounded-lg border ${
                  estadoRevirado.nivel === 'CONFORME'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : estadoRevirado.nivel === 'OBSERVACIÓN'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}>
                  {estadoRevirado.nivel}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Entradas */}
                <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 border-b border-slate-700 pb-2">
                    Medición Física en Mesa
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                        Desviación Lateral de Costura (cm):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={desviacionCosturaCm}
                        onChange={(e) => setDesviacionCosturaCm(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-mono font-bold text-white outline-none focus:border-cyan-400"
                        placeholder="ej. 1.2"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Distancia perpendicular entre el orillo / costura y la línea de referencia
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                        Longitud de Referencia Evaluada (cm):
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={longitudCosturaCm}
                        onChange={(e) => setLongitudCosturaCm(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-mono font-bold text-white outline-none focus:border-cyan-400"
                        placeholder="ej. 75.0"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Largo de pierna, costado de prenda o probeta de laboratorio
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                        Límite Máximo Aceptable STF (%):
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={limiteReviradoMax}
                        onChange={(e) => setLimiteReviradoMax(parseFloat(e.target.value) || 3)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Diagnóstico */}
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
                      Resultado de Espiralidad / Viro
                    </span>

                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black font-mono text-white">
                        {reviradoCalculadoPct}%
                      </span>
                      <span className="text-sm font-mono text-slate-400">de revirado</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                      <span className="text-xs font-bold text-white block">Diagnóstico Técnico:</span>
                      <p className="text-xs text-slate-300 font-medium">
                        {estadoRevirado.texto}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">
                        Criterios de Aceptación STF Group:
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                        <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                          ≤ 3.0% Conforme
                        </div>
                        <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300">
                          3.1 - 4.5% Alerta
                        </div>
                        <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300">
                          &gt; 4.5% Rechazo
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-mono">
                    Fórmula: % Viro = (Desviación en cm / Longitud en cm) × 100
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* =====================================================================
              TAB 4: TITULACIÓN DE HILADOS (ASTM D1907 / NTC 2058)
             ===================================================================== */}
          {activeTab === 'titulacion' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-cyan-400" />
                    Titulación y Conversión Universal de Hilados Textil
                  </h3>
                  <p className="text-xs text-slate-400">
                    ASTM D1907 / NTC 2058 • Conversión en tiempo real entre Ne, Nm, Tex, Denier y Dtex
                  </p>
                </div>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setModoTitulacion('calculoDevanadora')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      modoTitulacion === 'calculoDevanadora' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Balanza / Devanadora
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoTitulacion('conversor')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      modoTitulacion === 'conversor' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Conversor Libre
                  </button>
                </div>
              </div>

              {/* Modo Devanadora vs Conversor */}
              {modoTitulacion === 'calculoDevanadora' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Longitud de la Madeja (metros):
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={longitudDevanadoraM}
                      onChange={(e) => setLongitudDevanadoraM(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Masa en Balanza Analítica (gramos):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={pesoMadejaG}
                      onChange={(e) => setPesoMadejaG(parseFloat(e.target.value) || 0.01)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700 space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase block">
                    Ingresa el valor y el sistema a convertir:
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="number"
                      step="0.5"
                      value={valorInputTitulo}
                      onChange={(e) => setValorInputTitulo(parseFloat(e.target.value) || 1)}
                      className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm font-mono font-black text-cyan-300 w-36 outline-none focus:border-cyan-400"
                    />
                    <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
                      {(['Ne', 'Nm', 'Tex', 'Denier', 'Dtex'] as const).map(sis => (
                        <button
                          key={sis}
                          type="button"
                          onClick={() => setSistemaInputTitulo(sis)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                            sistemaInputTitulo === sis ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {sis}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Matriz de Títulos Equivalentes */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block font-mono">Ne (Algodón Inglés)</span>
                  <span className="text-xl font-black font-mono text-cyan-300 mt-1 block">{titulosCalculados.Ne}</span>
                  <span className="text-[9px] text-slate-500">840 yd/lb</span>
                </div>

                <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block font-mono">Nm (Métrico)</span>
                  <span className="text-xl font-black font-mono text-white mt-1 block">{titulosCalculados.Nm}</span>
                  <span className="text-[9px] text-slate-500">m / g</span>
                </div>

                <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block font-mono">Tex (Universal)</span>
                  <span className="text-xl font-black font-mono text-cyan-300 mt-1 block">{titulosCalculados.Tex}</span>
                  <span className="text-[9px] text-slate-500">g / 1000m</span>
                </div>

                <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block font-mono">Denier (Sintéticos)</span>
                  <span className="text-xl font-black font-mono text-white mt-1 block">{titulosCalculados.Denier}</span>
                  <span className="text-[9px] text-slate-500">g / 9000m</span>
                </div>

                <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 block font-mono">Dtex (Decitex)</span>
                  <span className="text-xl font-black font-mono text-cyan-300 mt-1 block">{titulosCalculados.Dtex}</span>
                  <span className="text-[9px] text-slate-500">g / 10000m</span>
                </div>
              </div>

              {/* Recomendación de Confección */}
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase block">
                    Aguja e Hilo Recomendados en Confección:
                  </span>
                  <p className="text-xs text-white font-medium mt-0.5">
                    Calibre: <strong className="text-cyan-300 font-mono">{recomendacionAguja.calibre}</strong> • {recomendacionAguja.tipo}
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* =====================================================================
              TAB 5: DENSIDAD & FACTOR DE COBERTURA (ASTM D3775 / NTC 428)
             ===================================================================== */}
          {activeTab === 'densidad' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Densidad de Hilos y Factor de Cobertura de Peirce
                  </h3>
                  <p className="text-xs text-slate-400">
                    ASTM D3775 / NTC 428 • Conteo de Hilos/cm vs Hilos/Pulgada (EPI / PPI) y Cover Factor
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-900 text-cyan-400 border border-slate-700">
                  Total Count: {totalThreadCount}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Entradas */}
                <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 border-b border-slate-700 pb-2">
                    Conteo con Cuentahilos
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                        Urdimbre (Hilos / cm):
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={hilosPorCmUrdimbre}
                        onChange={(e) => setHilosPorCmUrdimbre(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-mono font-bold text-white outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                        Trama (Pasadas / cm):
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={pasadasPorCmTrama}
                        onChange={(e) => setPasadasPorCmTrama(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-mono font-bold text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Salidas */}
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono block border-b border-slate-800 pb-2">
                    Densidad Internacional
                  </span>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Ends Per Inch (EPI):</span>
                      <span className="text-2xl font-black font-mono text-cyan-300 block mt-1">{epiCalculado}</span>
                      <span className="text-[10px] text-slate-500">Hilos por pulgada</span>
                    </div>

                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Picks Per Inch (PPI):</span>
                      <span className="text-2xl font-black font-mono text-white block mt-1">{ppiCalculado}</span>
                      <span className="text-[10px] text-slate-500">Pasadas por pulgada</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Factor de Cobertura Peirce (K):</span>
                      <span className="text-base font-black font-mono text-cyan-400">{factorCoberturaPeirce}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {factorCoberturaPeirce >= 26
                        ? 'Tejido denso y tupido de alta opacidad (apto para pantalones / chaquetas).'
                        : 'Tejido liviano semi-transparente (apto para blusas / forros).'}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* =====================================================================
              TAB 6: ELONGACIÓN & STRETCH (ASTM D3107)
             ===================================================================== */}
          {activeTab === 'elongacion' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Ensayo de Elongación, Deformación y Recuperación Elástica
                  </h3>
                  <p className="text-xs text-slate-400">
                    ASTM D3107 / NTC 754-2 • Aplicación específica para Jeanswear, Denim Stretch y Telas con Spandex
                  </p>
                </div>
                <span className={`text-xs font-mono font-black px-3 py-1 rounded-lg border ${clasificacionStretch.badge}`}>
                  {clasificacionStretch.tipo}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Entradas del Banco de Prueba */}
                <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 border-b border-slate-700 pb-2">
                    Lecturas en Banco de Carga (mm o cm)
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                        L0 - Longitud Inicial de Banco (mm):
                      </label>
                      <input
                        type="number"
                        value={l0InicialMm}
                        onChange={(e) => setL0InicialMm(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                        L1 - Longitud Bajo Carga 1.8kg / 4lb (mm):
                      </label>
                      <input
                        type="number"
                        value={l1BajoCargaMm}
                        onChange={(e) => setL1BajoCargaMm(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold text-cyan-300 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                        L2 - Recuperado a 1 Minuto (mm):
                      </label>
                      <input
                        type="number"
                        value={l2Recuperado1MinMm}
                        onChange={(e) => setL2Recuperado1MinMm(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                        L3 - Recuperado Final a 30 Minutos (mm):
                      </label>
                      <input
                        type="number"
                        value={l3Recuperado30MinMm}
                        onChange={(e) => setL3Recuperado30MinMm(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Métricas Calculadas */}
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono block border-b border-slate-800 pb-2">
                    Comportamiento Elástico
                  </span>

                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">% Elongación Bajo Carga:</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black font-mono text-cyan-300">{elongacionPct}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Recuperación 1 min:</span>
                      <span className="text-xl font-black font-mono text-white mt-1 block">{recuperacion1MinPct}%</span>
                    </div>

                    <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Recuperación 30 min:</span>
                      <span className="text-xl font-black font-mono text-emerald-400 mt-1 block">{recuperacion30MinPct}%</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Deformación Remanente (Crecimiento / Rodillera):</span>
                      <span className={`font-mono font-bold ${
                        crecimientoResidualPct <= 3.5 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {crecimientoResidualPct}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {crecimientoResidualPct <= 3.5
                        ? '✓ Retención elástica óptima. No genera bolsas residuales.'
                        : '⚠️ Alerta de deformación en rodillas o cintura tras uso.'}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* =====================================================================
              TAB 7: ESCALADO CAD / MOLDERÍA PATRONAJE AVANZADO STF GROUP
             ===================================================================== */}
          {activeTab === 'patronaje' && (
            <div className="space-y-6">
              
              {/* Header de Patronaje */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-cyan-400" />
                    Ingeniería de Patrones: Escalado CAD, Descuento Stretch & Compensación de Moldes
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sincronizado con Optitex PDS, Gerber AccuMark, Lectra Modaris y Audaces • Normas STF Group
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-black px-3 py-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                    X (Hilo): {factorEscalaX.toFixed(4)} ({((factorEscalaX - 1) * 100).toFixed(2)}%)
                  </span>
                  <span className="text-xs font-mono font-black px-3 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Y (Trama): {factorEscalaY.toFixed(4)} ({((factorEscalaY - 1) * 100).toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* Barra de Ajustes Técnicos de Patronaje */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
                
                {/* 1. Selector Tipo de Prenda */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Preset Tipo de Prenda STF:
                  </label>
                  <select
                    value={tipoPrenda}
                    onChange={(e) => handleCambiarTipoPrenda(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-bold text-white outline-none cursor-pointer focus:border-cyan-400"
                  >
                    <option value="pantalon">👖 Pantalón / Jeanswear</option>
                    <option value="chaqueta">🧥 Chaqueta / Saco / Blazer</option>
                    <option value="blusa">👚 Blusa / Camisa / Top</option>
                    <option value="falda">👗 Falda / Vestido</option>
                    <option value="personalizado">📐 Molde Personalizado</option>
                  </select>
                </div>

                {/* 2. Sentido del Trazo */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Dirección de Trazo en Mesa:
                  </label>
                  <select
                    value={sentidoCorte}
                    onChange={(e) => setSentidoCorte(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-bold text-white outline-none cursor-pointer focus:border-cyan-400"
                  >
                    <option value="hilo">🧵 Al Hilo (Urdimbre Longitudinal)</option>
                    <option value="contrahilo">↔️ Al Contrahilo (Trama Transversal)</option>
                    <option value="sesgo">📐 Al Sesgo / Bies (45° Elíptico)</option>
                  </select>
                </div>

                {/* 3. Descuento por Elasticidad Stretch */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Descuento Elasticidad Stretch:
                  </label>
                  <select
                    value={porcentajeDescuentoStretch}
                    onChange={(e) => setPorcentajeDescuentoStretch(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-bold text-cyan-300 outline-none cursor-pointer focus:border-cyan-400"
                  >
                    <option value="0">0% (Tejido Rígido / Plano)</option>
                    <option value="5">-5% (Comfort Stretch)</option>
                    <option value="10">-10% (Medium Stretch Skinny)</option>
                    <option value="15">-15% (Super Stretch / Leggings)</option>
                    <option value="20">-20% (Bi-Stretch Extremo)</option>
                  </select>
                </div>

                {/* 4. Margen de Costura Añadido */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Margen de Costura a Sumar:
                  </label>
                  <select
                    value={margenCosturaCm}
                    onChange={(e) => setMargenCosturaCm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-bold text-white outline-none cursor-pointer focus:border-cyan-400"
                  >
                    <option value="0">0.0 cm (Medida Neta sin Costura)</option>
                    <option value="0.7">+0.7 cm (Overlock 3 hilos)</option>
                    <option value="1.0">+1.0 cm (Estándar Confección)</option>
                    <option value="1.2">+1.2 cm (Doble Pespunte / Jean)</option>
                    <option value="1.5">+1.5 cm (Costura Francesa / Sastrería)</option>
                  </select>
                </div>

              </div>

              {/* Tabla Multi-Cota Desglosada de Moldería */}
              <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                      Planilla de Cotas Base vs Medidas Compensadas a Trazar
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Incluye: Descuento Stretch + Factor de Lavado Lab ({varUrdimbrePct}% largo, {varTramaPct}% ancho) + Margen de Costura ({margenCosturaCm} cm)
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-800">
                    {cotasCalculadas.length} Cotas Analizadas
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/80 text-slate-300 font-mono text-[10px] uppercase border-b border-slate-700">
                      <tr>
                        <th className="p-2.5">Cota / Segmento</th>
                        <th className="p-2.5 text-center">Proporción</th>
                        <th className="p-2.5 text-center">Eje</th>
                        <th className="p-2.5 text-center">Medida Base</th>
                        {porcentajeDescuentoStretch > 0 && (
                          <th className="p-2.5 text-center text-cyan-300">-Stretch</th>
                        )}
                        <th className="p-2.5 text-center text-indigo-300">+Compensación</th>
                        <th className="p-2.5 text-center text-emerald-400 font-black">Cota Final Mesa</th>
                        <th className="p-2.5 text-center">Diferencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {cotasCalculadas.map((c, idx) => (
                        <tr key={c.id || idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5 font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                            <span>{c.nombre}</span>
                          </td>
                          <td className="p-2.5 text-center font-mono text-slate-400">{c.proporcion}</td>
                          <td className="p-2.5 text-center font-mono text-[10px] text-slate-400 uppercase">
                            {c.eje === 'largo' ? 'Largo (X)' : 'Ancho (Y)'}
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              step="0.1"
                              value={c.baseCm}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setCotasPersonalizadas(prev => prev.map(item => item.id === c.id ? { ...item, baseCm: val } : item));
                              }}
                              className="w-20 bg-slate-800 border border-slate-700 rounded-lg p-1 text-xs font-mono font-bold text-white text-center outline-none focus:border-cyan-400"
                            />
                            <span className="text-[10px] text-slate-500 ml-1">cm</span>
                          </td>
                          {porcentajeDescuentoStretch > 0 && (
                            <td className="p-2.5 text-center font-mono text-cyan-300 font-bold">
                              {c.baseConStretch} cm
                            </td>
                          )}
                          <td className="p-2.5 text-center font-mono text-indigo-300 font-bold">
                            {c.cotaEscalada} cm
                          </td>
                          <td className="p-2.5 text-center font-mono text-emerald-300 font-black text-sm bg-emerald-950/20 rounded-lg">
                            {c.cotaFinalConMargen} cm
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold text-cyan-400">
                            {c.delta >= 0 ? `+${c.delta}` : `${c.delta}`} cm
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Botonera de Exportación Específica para Softwares CAD */}
              <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Exportar Factores Directos a Softwares de Patronaje CAD
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">1 Clic para Copiar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  {/* Optitex */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Optitex PDS</span>
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">Scale%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        X: {(factorEscalaX * 100).toFixed(2)}% | Y: {(factorEscalaY * 100).toFixed(2)}%
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copiarTexto(`Optitex Rule: ScaleX=${(factorEscalaX * 100).toFixed(2)}%, ScaleY=${(factorEscalaY * 100).toFixed(2)}%`, 'Formato Optitex copiado')}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Optitex</span>
                    </button>
                  </div>

                  {/* Gerber */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Gerber AccuMark</span>
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">Shrinkage</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        L: {varUrdimbrePct.toFixed(2)}% | W: {varTramaPct.toFixed(2)}%
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copiarTexto(`Gerber Shrinkage Table: Length=${varUrdimbrePct.toFixed(2)}%, Width=${varTramaPct.toFixed(2)}%`, 'Formato Gerber copiado')}
                      className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Gerber</span>
                    </button>
                  </div>

                  {/* Lectra */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Lectra Modaris</span>
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">Coeff</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        L: {factorEscalaX.toFixed(4)} | W: {factorEscalaY.toFixed(4)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copiarTexto(`Lectra Modaris: Coeff Longueur=${factorEscalaX.toFixed(4)}, Largeur=${factorEscalaY.toFixed(4)}`, 'Formato Lectra copiado')}
                      className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Lectra</span>
                    </button>
                  </div>

                  {/* Audaces */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Audaces Vestuário</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">Escala</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        X: {factorEscalaX.toFixed(4)} | Y: {factorEscalaY.toFixed(4)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copiarTexto(`Audaces Vestuário: Escalar X=${factorEscalaX.toFixed(4)}, Y=${factorEscalaY.toFixed(4)}`, 'Formato Audaces copiado')}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Audaces</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Botón de Aplicar Directamente al Dictamen de Patronaje si existe callback */}
              {onAplicarValoresAPatronaje && (
                <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 p-4 rounded-2xl border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div>
                    <h5 className="text-xs font-black text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Sincronizar directamente con el Formulario de Patronaje
                    </h5>
                    <p className="text-[11px] text-slate-300">
                      Transfiere los factores CAD (X: {factorEscalaX.toFixed(4)}, Y: {factorEscalaY.toFixed(4)}) y holguras al registro activo de moldería.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onAplicarValoresAPatronaje({
                        factorX: factorEscalaX,
                        factorY: factorEscalaY,
                        largoCompensado: cotasCalculadas[0]?.cotaFinalConMargen || largoCompensadoCm,
                        anchoCompensado: cotasCalculadas[1]?.cotaFinalConMargen || anchoCompensadoCm,
                        observacionCad: `Prenda: ${tipoPrenda.toUpperCase()}. Trazo: ${sentidoCorte.toUpperCase()}. Descuento Stretch: ${porcentajeDescuentoStretch}%. Margen Costura: +${margenCosturaCm}cm.`,
                        holguraSugerida: margenCosturaCm
                      });
                      showToast('✓ Factores y cotas transferidos al formulario de Patronaje');
                    }}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95 shrink-0 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Aplicar a Ficha de Patronaje</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* =========================================================================
            FOOTER CON BOTONERA DE ACCIÓN Y EXPORTACIÓN
           ========================================================================= */}
        <div className="bg-[#090d16] px-5 py-3.5 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          
          <div className="flex items-center gap-3 text-white font-mono text-[11px]">
            <span className="text-white">Analista: <strong className="text-white font-bold">{analistaActivo?.nombreCompleto || 'Ana González'}</strong></span>
            <span className="hidden sm:inline text-white/50">•</span>
            <span className="hidden sm:inline text-white font-bold">STF Group Quality Lab</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            
            {/* Botón Aplicar a Evaluación Activa */}
            {onAplicarValoresALab && (
              <button
                type="button"
                onClick={handleAplicarALab}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                title="Transferir valores calculados al formulario activo de la muestra"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Aplicar a Lab</span>
              </button>
            )}

            {/* Botón Aplicar a Patronaje */}
            {onAplicarValoresAPatronaje && (
              <button
                type="button"
                onClick={() => {
                  onAplicarValoresAPatronaje({
                    factorX: factorEscalaX,
                    factorY: factorEscalaY,
                    largoCompensado: cotasCalculadas[0]?.cotaFinalConMargen || largoCompensadoCm,
                    anchoCompensado: cotasCalculadas[1]?.cotaFinalConMargen || anchoCompensadoCm,
                    observacionCad: `Prenda: ${tipoPrenda.toUpperCase()}. Trazo: ${sentidoCorte.toUpperCase()}. Descuento Stretch: ${porcentajeDescuentoStretch}%. Margen Costura: +${margenCosturaCm}cm.`,
                    holguraSugerida: margenCosturaCm
                  });
                  showToast('✓ Factores y cotas transferidos al formulario de Patronaje');
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                title="Transferir cotas y factores de escala directamente a Patronaje"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Aplicar a Patronaje</span>
              </button>
            )}

            {/* Botón Copiar Dictamen Formateado */}
            <button
              type="button"
              onClick={() => copiarTexto(generarDictamenTexto(), 'Dictamen técnico copiado completo')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title="Copiar resumen estructurado para pegar en el informe de laboratorio"
            >
              {copiadoGlobal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copiar Dictamen</span>
            </button>

            {/* Botón Imprimir / PDF */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            {/* Cerrar */}
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl shadow-md transition-all cursor-pointer"
            >
              Cerrar
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
