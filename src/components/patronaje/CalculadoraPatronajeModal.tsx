import React, { useState, useEffect } from 'react';
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
  UserCheck,
  KeyRound,
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface CalculadoraPatronajeModalProps {
  abierto: boolean;
  onCerrar: () => void;
  muestraInicialId?: string;
  onAbrirGestionUsuarios?: () => void;
}

export type ProporcionPieza = '1/1' | '1/2' | '1/4';

export const CalculadoraPatronajeModal: React.FC<CalculadoraPatronajeModalProps> = ({
  abierto,
  onCerrar,
  muestraInicialId,
  onAbrirGestionUsuarios
}) => {
  const { muestras, analistaActivo, cambiarAnalistaConPin } = useQuality();
  const { t } = useLanguage();

  const [muestraId, setMuestraId] = useState<string>(muestraInicialId || muestras[0]?.id || '');
  
  // Medidas Base del Molde
  const [largoBaseCm, setLargoBaseCm] = useState<number>(72.5);
  const [anchoBaseCm, setAnchoBaseCm] = useState<number>(25.5);
  const [proporcion, setProporcion] = useState<ProporcionPieza>('1/4'); // Default 1/4 para trazo

  // Dictamen de Laboratorio (% Variación)
  const [modoOrigen, setModoOrigen] = useState<'laboratorio' | 'manual'>('laboratorio');
  const [varLargoPct, setVarLargoPct] = useState<number>(-3.63); // Encogimiento largo por defecto (-3.63%)
  const [varAnchoPct, setVarAnchoPct] = useState<number>(-1.83); // Encogimiento ancho por defecto (-1.83%)

  // Estado de copiado y acciones
  const [copiadoX, setCopiadoX] = useState(false);
  const [copiadoY, setCopiadoY] = useState(false);
  const [copiadoTodo, setCopiadoTodo] = useState(false);
  const [guardadoOp, setGuardadoOp] = useState(false);

  // Al seleccionar una muestra del sistema, cargar sus valores reales de laboratorio
  useEffect(() => {
    if (muestraId && modoOrigen === 'laboratorio') {
      const muestra = muestras.find(m => m.id === muestraId);
      if (muestra && muestra.ensayos) {
        const elargo = muestra.ensayos.encogimientoLargo?.valor ?? -3.63;
        const eancho = muestra.ensayos.encogimientoAncho?.valor ?? -1.83;
        setVarLargoPct(elargo);
        setVarAnchoPct(eancho);
      }
    }
  }, [muestraId, modoOrigen, muestras]);

  if (!abierto) return null;

  const muestraSeleccionada = muestras.find(m => m.id === muestraId) || muestras[0];

  // Comportamiento (Encogimiento vs Elongación)
  const esEncogimientoLargo = varLargoPct <= 0;
  const esEncogimientoAncho = varAnchoPct <= 0;

  // 1. Factores de Escala CAD
  const factorEscalaX = esEncogimientoLargo
    ? 1 + (Math.abs(varLargoPct) / 100)
    : 1 - (Math.abs(varLargoPct) / 100);

  const factorEscalaY = esEncogimientoAncho
    ? 1 + (Math.abs(varAnchoPct) / 100)
    : 1 - (Math.abs(varAnchoPct) / 100);

  // 2. Medidas Compensadas Finales (cm)
  const largoCompensadoCm = parseFloat((largoBaseCm * factorEscalaX).toFixed(2));
  const diffLargoCm = parseFloat((largoCompensadoCm - largoBaseCm).toFixed(2));

  const anchoCompensadoCm = parseFloat((anchoBaseCm * factorEscalaY).toFixed(2));
  const diffAnchoCm = parseFloat((anchoCompensadoCm - anchoBaseCm).toFixed(2));

  // Alertas de Contracción
  const esAlertaCriticaLargo = Math.abs(varLargoPct) > 4.0;
  const esAlertaCriticaAncho = Math.abs(varAnchoPct) > 3.5;

  // Funciones de Copiado para CAD
  const copiarAlPortapapeles = (texto: string, tipo: 'x' | 'y' | 'todo') => {
    navigator.clipboard.writeText(texto);
    if (tipo === 'x') {
      setCopiadoX(true);
      setTimeout(() => setCopiadoX(false), 2000);
    } else if (tipo === 'y') {
      setCopiadoY(true);
      setTimeout(() => setCopiadoY(false), 2000);
    } else {
      setCopiadoTodo(true);
      setTimeout(() => setCopiadoTodo(false), 2000);
    }
  };

  const handleGuardarEnOp = () => {
    setGuardadoOp(true);
    setTimeout(() => setGuardadoOp(false), 2500);
  };

  const handleExportarPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans select-none animate-fade-in">
      <div className="bg-[#2B2B2E] border border-[#424246] rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto text-[#FBF8F2] max-h-[92vh] flex flex-col">
        
        {/* HEADER DE SESIÓN Y USUARIO ACTIVO (Paleta Esencia Studio F #120F0D / #C6A466) */}
        <div className="bg-[#120F0D] text-[#FBF8F2] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#424246] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C6A466]/20 border border-[#C6A466]/40 flex items-center justify-center text-[#C6A466] shadow-sm">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-normal font-serif tracking-[0.15em] text-[#E5E4DF] uppercase">
                  Calculadora de Escalado CAD / Patronaje
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#C6A466] text-[#2D2D30]">
                  STUDIO F
                </span>
              </div>
              <p className="text-xs text-[#AA9E80] mt-0.5">
                Cálculo de factores X/Y, dimensiones compensadas y dictamen técnico de laboratorio
              </p>
            </div>
          </div>

          {/* Badge de Usuario Activo con Estado Verde y Botón CAMBIAR PIN */}
          <div className="flex items-center gap-3 bg-[#2E2822] px-3.5 py-1.5 rounded-2xl border border-[#424246]">
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-[#C6A466] text-[#2D2D30] font-bold text-xs flex items-center justify-center">
                {analistaActivo.nombreCompleto.charAt(0)}
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#2D2D30] absolute -bottom-0.5 -right-0.5"></span>
            </div>

            <div className="text-left">
              <span className="text-[9px] font-bold text-[#AA9E80] uppercase block tracking-wider font-mono">
                OPERADOR ACTIVO:
              </span>
              <strong className="text-xs font-bold text-[#FBF8F2] block truncate max-w-[140px]">
                {analistaActivo.nombreCompleto}
              </strong>
            </div>

            {onAbrirGestionUsuarios && (
              <button
                type="button"
                onClick={onAbrirGestionUsuarios}
                className="px-2.5 py-1 bg-[#C6A466] hover:bg-[#b59355] text-[#2D2D30] font-mono font-extrabold text-[9px] uppercase tracking-wider rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0 ml-1"
                title="Cambiar operador de laboratorio rápidamente con PIN"
              >
                <KeyRound className="w-3 h-3" />
                <span>CAMBIAR PIN</span>
              </button>
            )}

            <button
              type="button"
              onClick={onCerrar}
              className="w-7 h-7 rounded-full bg-[#424246] text-[#AA9E80] hover:text-[#C6A466] flex items-center justify-center transition-all cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-vertical-scroll">
          
          {/* CINTA DE CONTEXTO DE PRODUCCIÓN (REF STRIP) */}
          <div className="bg-[#2D2D30] border border-[#424246] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-[10px] font-bold text-[#AA9E80] uppercase font-sans">REFERENCIA / OP:</span>
                <span className="px-2.5 py-1 bg-[#2B2B2E] text-[#C6A466] font-black rounded-lg text-xs border border-[#424246]">
                  {muestraSeleccionada?.referencia || '#JEAN-2026-89'}
                </span>
              </div>

              <div className="h-4 w-[1px] bg-[#424246] hidden sm:block"></div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#AA9E80] uppercase">TRATAMIENTO LAVANDERÍA:</span>
                <span className="font-bold text-[#FBF8F2] bg-[#2B2B2E] px-2.5 py-1 rounded-lg border border-[#424246]">
                  Stone Wash + Enzyme (Industrial)
                </span>
              </div>

              <div className="h-4 w-[1px] bg-[#424246] hidden sm:block"></div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#AA9E80] uppercase">PROVEEDOR:</span>
                <span className="font-bold text-[#C6A466]">
                  {muestraSeleccionada?.proveedor || 'SHANGHAI JOY TEX'}
                </span>
              </div>
            </div>

            <span className="px-3 py-1 bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/40 font-mono font-black text-xs rounded-full flex items-center gap-1 shrink-0 self-start md:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C6A466]" />
              DICTAMEN: APROBADO
            </span>
          </div>

          {/* CUADRÍCULA DE ENTRADA DE DATOS (MÓDULO DOBLE) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LADO IZQUIERDO: PATRONAJE BASE */}
            <div className="bg-[#2D2D30] border border-[#424246] rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#424246] pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#C6A466] flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#C6A466]" />
                  Patronaje Base (Molde Original)
                </h4>
                <span className="text-[10px] text-[#AA9E80] font-mono font-bold">LADO A</span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Largo Original del Molde */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#AA9E80] mb-1">
                    Largo del Patrón Original (cm):
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="0"
                    value={largoBaseCm}
                    onChange={(e) => setLargoBaseCm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-3 text-sm font-black font-mono text-[#FBF8F2] focus:border-[#C6A466] outline-none transition-all shadow-2xs"
                    placeholder="ej. 72.5"
                  />
                  <span className="text-[10px] text-[#AA9E80] mt-1 block font-medium">
                    Cota vertical original de la pieza antes de lavado
                  </span>
                </div>

                {/* Contorno / Ancho del Molde */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#AA9E80] mb-1">
                    Contorno / Ancho del Patrón Original (cm):
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="0"
                    value={anchoBaseCm}
                    onChange={(e) => setAnchoBaseCm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-3 text-sm font-black font-mono text-[#FBF8F2] focus:border-[#C6A466] outline-none transition-all shadow-2xs"
                    placeholder="ej. 25.5"
                  />
                  <span className="text-[10px] text-[#AA9E80] mt-1 block font-medium">
                    Cota horizontal original de la pieza trazada
                  </span>
                </div>

                {/* Botonera de Proporción de Pieza (1/1, 1/2, 1/4) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#AA9E80] mb-1.5">
                    Proporción de la Pieza Trazada:
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-[#2B2B2E] p-1.5 border border-[#424246] rounded-xl">
                    <button
                      type="button"
                      onClick={() => setProporcion('1/1')}
                      className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer font-mono ${
                        proporcion === '1/1'
                          ? 'bg-[#C6A466] text-[#2B2B2E] shadow-xs'
                          : 'text-[#AA9E80] hover:text-[#FBF8F2]'
                      }`}
                    >
                      1/1 (Total)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProporcion('1/2')}
                      className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer font-mono ${
                        proporcion === '1/2'
                          ? 'bg-[#C6A466] text-[#2B2B2E] shadow-xs'
                          : 'text-[#AA9E80] hover:text-[#FBF8F2]'
                      }`}
                    >
                      1/2 (Medio)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProporcion('1/4')}
                      className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer font-mono ${
                        proporcion === '1/4'
                          ? 'bg-[#C6A466] text-[#2B2B2E] shadow-xs'
                          : 'text-[#AA9E80] hover:text-[#FBF8F2]'
                      }`}
                    >
                      1/4 (Cuarto)
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* LADO DERECHO: DICTAMEN LAB & PORCENTAJES */}
            <div className="bg-[#2D2D30] border border-[#424246] rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#424246] pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#C6A466] flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#C6A466]" />
                  Dictamen de Laboratorio (% Variación)
                </h4>
                
                {/* Selector Modo Origen */}
                <div className="flex items-center bg-[#2B2B2E] border border-[#424246] rounded-lg p-0.5 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setModoOrigen('laboratorio')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                      modoOrigen === 'laboratorio' ? 'bg-[#C6A466] text-[#2B2B2E]' : 'text-[#AA9E80]'
                    }`}
                  >
                    Lab Sync
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoOrigen('manual')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                      modoOrigen === 'manual' ? 'bg-[#C6A466] text-[#2B2B2E]' : 'text-[#AA9E80]'
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Variación Largo (Sentido Hilo) */}
                <div className="bg-[#2B2B2E] border border-[#424246] rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FBF8F2] flex items-center gap-1">
                      <ArrowUpDown className="w-3.5 h-3.5 text-[#C6A466]" />
                      % Variación Largo (Sentido Hilo / Urdimbre):
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${
                      esAlertaCriticaLargo
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : esEncogimientoLargo
                        ? 'bg-[#C6A466]/20 text-[#C6A466] border-[#C6A466]/40'
                        : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    }`}>
                      {esEncogimientoLargo ? 'Contracción (+Largo)' : 'Elongación (-Largo)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={varLargoPct}
                      onChange={(e) => setVarLargoPct(parseFloat(e.target.value) || 0)}
                      disabled={modoOrigen === 'laboratorio'}
                      className="w-full bg-[#2D2D30] border border-[#424246] rounded-lg p-2 text-sm font-black font-mono text-[#FBF8F2] outline-none disabled:opacity-85"
                    />
                    <span className="font-mono font-bold text-[#C6A466]">%</span>
                  </div>
                </div>

                {/* Variación Ancho (Sentido Trama) */}
                <div className="bg-[#2B2B2E] border border-[#424246] rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FBF8F2] flex items-center gap-1">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-[#C6A466]" />
                      % Variación Ancho (Sentido Trama):
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${
                      esAlertaCriticaAncho
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : esEncogimientoAncho
                        ? 'bg-[#C6A466]/20 text-[#C6A466] border-[#C6A466]/40'
                        : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    }`}>
                      {esEncogimientoAncho ? 'Contracción (+Ancho)' : 'Elongación (-Ancho)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={varAnchoPct}
                      onChange={(e) => setVarAnchoPct(parseFloat(e.target.value) || 0)}
                      disabled={modoOrigen === 'laboratorio'}
                      className="w-full bg-[#2D2D30] border border-[#424246] rounded-lg p-2 text-sm font-black font-mono text-[#FBF8F2] outline-none disabled:opacity-85"
                    />
                    <span className="font-mono font-bold text-[#C6A466]">%</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* BLOQUE DE SALIDA (COTAS FINALES A TRAZAR) */}
          <div className="bg-[#2B2B2E] border-2 border-[#C6A466] rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#424246] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C6A466]" />
                <h4 className="font-black text-xs uppercase tracking-wider text-[#C6A466] font-mono">
                  Medidas Finales Compensadas a Trazar en Mesa
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[#C6A466] font-bold bg-[#C6A466]/20 px-2.5 py-0.5 rounded-full border border-[#C6A466]/40">
                Cotas Exactas de Corte
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Largo Final Compensado */}
              <div className="bg-[#2D2D30] border border-[#424246] rounded-2xl p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-extrabold text-[#C6A466] uppercase block">
                  Largo Final Compensado (Hilo):
                </span>

                <div className="flex items-baseline justify-between gap-2 pt-1">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-[#FBF8F2] tracking-tight">
                    {largoCompensadoCm.toFixed(2)} cm
                  </span>
                  <span className="text-xs font-black font-mono px-2.5 py-1 rounded-full bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/40">
                    +{diffLargoCm.toFixed(2)} cm
                  </span>
                </div>

                <p className="text-[11px] text-[#AA9E80] font-medium pt-1">
                  Cota exacta en vertical a trazar (+{diffLargoCm.toFixed(2)} cm agregados para absorción en lavado).
                </p>
              </div>

              {/* Ancho / Contorno Final Compensado */}
              <div className="bg-[#2D2D30] border border-[#424246] rounded-2xl p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-extrabold text-[#C6A466] uppercase block">
                  Ancho Final Compensado ({proporcion}):
                </span>

                <div className="flex items-baseline justify-between gap-2 pt-1">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-[#FBF8F2] tracking-tight">
                    {anchoCompensadoCm.toFixed(2)} cm
                  </span>
                  <span className="text-xs font-black font-mono px-2.5 py-1 rounded-full bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/40">
                    +{diffAnchoCm.toFixed(2)} cm
                  </span>
                </div>

                <p className="text-[11px] text-[#AA9E80] font-medium pt-1">
                  Cota exacta en horizontal para {proporcion} de pieza (+{diffAnchoCm.toFixed(2)} cm agregados).
                </p>
              </div>

            </div>
          </div>

          {/* PANEL CAD Y BOTONERA DE ACCIÓN */}
          <div className="bg-[#2D2D30] border border-[#424246] rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#424246] pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#C6A466] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C6A466]" />
                Factores de Escala Digital (Optitex / Gerber / Lectra / Audaces)
              </h4>
              <span className="text-[10px] font-mono text-[#AA9E80] font-bold">CAD Scale Engine</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Factor X Box (Borde punteado) */}
              <div className="bg-[#2B2B2E] border-2 border-dashed border-[#424246] rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#AA9E80] uppercase block font-sans">
                    FACTOR X (LARGO / HILO):
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black font-mono text-[#FBF8F2]">
                      {factorEscalaX.toFixed(4)}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#C6A466] bg-[#C6A466]/20 px-2 py-0.5 rounded border border-[#C6A466]/30">
                      {(factorEscalaX * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copiarAlPortapapeles(factorEscalaX.toFixed(4), 'x')}
                  className="px-3 py-2 bg-[#C6A466] hover:bg-[#b59355] text-[#2B2B2E] rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
                >
                  {copiadoX ? <Check className="w-3.5 h-3.5 text-[#2B2B2E]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiadoX ? 'Copiado' : 'Copiar X'}</span>
                </button>
              </div>

              {/* Factor Y Box (Borde punteado) */}
              <div className="bg-[#2B2B2E] border-2 border-dashed border-[#424246] rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#AA9E80] uppercase block font-sans">
                    FACTOR Y (ANCHO / TRAMA):
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black font-mono text-[#FBF8F2]">
                      {factorEscalaY.toFixed(4)}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#C6A466] bg-[#C6A466]/20 px-2 py-0.5 rounded border border-[#C6A466]/30">
                      {(factorEscalaY * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copiarAlPortapapeles(factorEscalaY.toFixed(4), 'y')}
                  className="px-3 py-2 bg-[#C6A466] hover:bg-[#b59355] text-[#2B2B2E] rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
                >
                  {copiadoY ? <Check className="w-3.5 h-3.5 text-[#2B2B2E]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiadoY ? 'Copiado' : 'Copiar Y'}</span>
                </button>
              </div>

            </div>

            {/* BOTONERA DE ACCIÓN PRINCIPAL (3 Botones Específicos) */}
            <div className="pt-3 border-t border-[#424246] flex flex-col sm:flex-row items-center justify-end gap-3">
              
              {/* Botón 1: Copiar Factores CAD */}
              <button
                type="button"
                onClick={() => copiarAlPortapapeles(`FACTOR X: ${factorEscalaX.toFixed(4)} | FACTOR Y: ${factorEscalaY.toFixed(4)}`, 'todo')}
                className="w-full sm:w-auto px-5 py-3 bg-[#C6A466] hover:bg-[#b59355] text-[#2B2B2E] font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                {copiadoTodo ? <Check className="w-4 h-4 text-[#2B2B2E]" /> : <Copy className="w-4 h-4" />}
                <span>{copiadoTodo ? '¡Factores CAD Copiados!' : 'Copiar Factores CAD'}</span>
              </button>

              {/* Botón 2: Guardar en Ficha OP */}
              <button
                type="button"
                onClick={handleGuardarEnOp}
                className="w-full sm:w-auto px-5 py-3 bg-[#2B2B2E] hover:bg-[#3A3A3D] text-[#C6A466] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 border border-[#C6A466]/40"
              >
                {guardadoOp ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-[#C6A466]" />}
                <span>{guardadoOp ? '¡Guardado en Ficha OP!' : 'Guardar en Ficha OP'}</span>
              </button>

              {/* Botón 3: Exportar PDF */}
              <button
                type="button"
                onClick={handleExportarPdf}
                className="w-full sm:w-auto px-5 py-3 bg-[#2D2D30] hover:bg-[#3A3A3D] text-[#FBF8F2] border-2 border-[#424246] font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#C6A466]" />
                <span>Exportar PDF</span>
              </button>

            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-[#2D2D30] px-6 py-4 border-t border-[#424246] flex items-center justify-between text-xs text-[#AA9E80] font-mono shrink-0">
          <span>STFLAB Industrial Standard • STF Group S.A.</span>
          
          <button
            type="button"
            onClick={onCerrar}
            className="px-5 py-2 bg-[#2B2B2E] hover:bg-[#3A3A3D] text-[#C6A466] border border-[#C6A466]/40 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
          >
            Cerrar Módulo
          </button>
        </div>

      </div>
    </div>
  );
};
