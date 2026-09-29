import React, { useState, useEffect } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useLanguage } from '../../context/LanguageContext';
import { MuestraTextil, DictamenType } from '../../types';
import { Badge } from '../common/Badge';
import { CalculadoraPatronajeModal } from '../patronaje/CalculadoraPatronajeModal';
import { 
  Ruler, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Scissors, 
  Calculator, 
  Save, 
  FileText,
  Sparkles,
  AlertTriangle,
  Clock,
  Check,
  Info,
  ShieldAlert,
  X,
  Copy,
  Layers,
  ArrowUpDown,
  ArrowLeftRight
} from 'lucide-react';

export const PatronajeView: React.FC = () => {
  const { muestras, solicitudesTelas, actualizarDictamenArea } = useQuality();
  const { t } = useLanguage();
  
  // Obtener alertas de compras para telas aprobadas
  const telasCompradasConAlerta = (solicitudesTelas || []).flatMap(s => 
    (s.telas || [])
      .filter(t => t.decisionCompra?.decision === 'COMPRAR' && t.decisionCompra?.alertaPatronaje?.aplica !== false)
      .map(t => ({
        solicitud: s,
        tela: t,
        alerta: t.decisionCompra?.alertaPatronaje
      }))
  );

  const [muestraSeleccionadaId, setMuestraSeleccionadaId] = useState<string>(muestras[0]?.id || '');
  const muestraActual = muestras.find((m) => m.id === muestraSeleccionadaId) || muestras[0];

  const [dictamenPatronaje, setDictamenPatronaje] = useState<DictamenType>(muestraActual?.trazabilidad.patronaje.dictamen || 'APROBADO');
  const [observacionPatronaje, setObservacionPatronaje] = useState(muestraActual?.trazabilidad.patronaje.observaciones || '');
  const [responsable, setResponsable] = useState(muestraActual?.trazabilidad.patronaje.responsable || 'María Fernanda López — Analista de Calidad');
  const [calceAprobado, setCalceAprobado] = useState(true);
  const [holguraAdicionalCm, setHolguraAdicionalCm] = useState(0.8);

  // Modal Calculadora Avanzada
  const [modalCalculadoraAbierto, setModalCalculadoraAbierto] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCambioMuestra = (m: MuestraTextil) => {
    setMuestraSeleccionadaId(m.id);
    setDictamenPatronaje(m.trazabilidad.patronaje.dictamen);
    setObservacionPatronaje(m.trazabilidad.patronaje.observaciones || '');
    setResponsable(m.trazabilidad.patronaje.responsable || 'María Fernanda López — Analista de Calidad');
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muestraActual) return;

    actualizarDictamenArea(
      muestraActual.id,
      'patronaje',
      dictamenPatronaje,
      observacionPatronaje,
      responsable,
      {
        calceAprobado,
        holguraAdicionalCm,
      }
    );
    showToast(`Dictamen de Patronaje guardado para ${muestraActual.referencia}`);
  };

  const getSemaforoInfo = (elargo: number, eancho: number) => {
    const lAbs = Math.abs(elargo || 0);
    const wAbs = Math.abs(eancho || 0);
    const maxVal = Math.max(lAbs, wAbs);

    if (maxVal >= 3.0) {
      return {
        label: 'CRÍTICO',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        dot: '🔴'
      };
    } else if (maxVal >= 1.5) {
      return {
        label: 'MODERADO',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        dot: '🟡'
      };
    } else {
      return {
        label: 'ESTABLE',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        dot: '🟢'
      };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans select-none">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#2B2B2E] text-[#C6A466] text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 border border-[#C6A466]/40 animate-bounce">
          <Sparkles className="h-4 w-4 text-[#C6A466]" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#2B2B2E] border border-[#424246] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-[#FBF8F2]">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-2xl bg-[#C6A466]/10 text-[#C6A466] border border-[#C6A466]/20 flex items-center justify-center shrink-0 shadow-md">
            <Ruler className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
                {t('4. Moldería & Patronaje', '4. Patternmaking & Grading')}
              </h2>
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[#00b4d8]/15 text-[#008db0] dark:text-[#38bdf8] border border-[#00b4d8]/30 font-mono tracking-wider">
                {t('FASE DE ESCALADO Y TRAZO', 'GRADING & DRAFTING PHASE')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
              {t('Ajuste proporcional de patrones y cálculo de factores de escala para Optitex, Gerber, Lectra y Audaces.', 'Proportional pattern adjustment and scale factor calculation for Optitex, Gerber, Lectra & Audaces.')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModalCalculadoraAbierto(true)}
          className="px-4 py-2.5 bg-[#C6A466] hover:bg-[#B59355] text-[#1E1E21] text-xs font-black rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer active:scale-95 shrink-0"
        >
          <Calculator className="h-4.5 w-4.5 text-[#1E1E21]" />
          <span>{t('Abrir Calculadora de Patronaje & CAD', 'Open Pattern & CAD Calculator')}</span>
        </button>
      </div>

      {/* ALERTAS FUNCIONALES RECIBIDAS DE COMPRAS */}
      {telasCompradasConAlerta.length > 0 && (
        <div className="bg-[#2D2D30] border-2 border-[#C6A466]/40 rounded-3xl p-5 shadow-xs space-y-3 animate-fade-in text-[#FBF8F2]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#C6A466] animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#C6A466]">
                {t('Alertas Funcionales Recibidas de Compras para Moldería', 'Functional Alerts Received from Purchasing')} ({telasCompradasConAlerta.length})
              </h3>
            </div>
            <span className="text-[10px] font-extrabold bg-[#C6A466]/20 text-[#C6A466] px-2.5 py-1 rounded-full border border-[#C6A466]/40 font-mono">
              DIRECTRICES DE ESCALADO
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {telasCompradasConAlerta.map((item, idx) => (
              <div key={idx} className="bg-[#2B2B2E] border border-[#424246] p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#C6A466] bg-[#2D2D30] px-2 py-0.5 rounded border border-[#424246]">
                    {item.tela.referencia}
                  </span>
                  <span className="text-[10px] font-bold text-[#C6A466] bg-[#C6A466]/15 px-2 py-0.5 rounded border border-[#C6A466]/30">
                    Sugerencia Escala
                  </span>
                </div>
                <p className="text-xs text-[#AA9E80] font-medium leading-snug">
                  {item.alerta?.descripcion || 'Aplicar compensación de moldería según encogimiento de urdimbre y trama.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Principal: Formulario de Calce vs Planilla de Estabilidad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Columna Izquierda: Formulario de Dictamen Patronaje (5 cols) */}
        <div className="lg:col-span-5 bg-[#2D2D30] border border-[#424246] rounded-3xl p-6 shadow-xs space-y-5 text-[#FBF8F2]">
          <h3 className="font-black text-xs uppercase tracking-wider text-[#C6A466] border-b border-[#424246] pb-3 flex items-center gap-2 font-display">
            <Scissors className="w-4 h-4 text-[#C6A466]" />
            {t('Dictamen Técnico de Calce & Moldería', 'Technical Fit & Pattern Verdict')}
          </h3>

          <div className="space-y-1.5">
            <label className="block text-[#AA9E80] text-xs font-bold">
              {t('Seleccionar Tela a Evaluar:', 'Select Fabric Sample:')}
            </label>
            <select
              value={muestraActual?.id}
              onChange={(e) => {
                const found = muestras.find(m => m.id === e.target.value);
                if (found) handleCambioMuestra(found);
              }}
              className="w-full bg-[#2B2B2E] border border-[#424246] text-[#FBF8F2] rounded-xl p-2.5 text-xs font-bold outline-none focus:border-[#C6A466]"
            >
              {muestras.map(m => (
                <option key={m.id} value={m.id} className="bg-[#2B2B2E] text-[#FBF8F2]">
                  {m.referencia} - {m.color} ({m.lote})
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleGuardar} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#AA9E80] font-bold mb-1">
                  {t('Holgura Adicional (cm):', 'Additional Ease (cm):')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={holguraAdicionalCm}
                  onChange={(e) => setHolguraAdicionalCm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-[#FBF8F2] font-black font-mono focus:border-[#C6A466] outline-none"
                />
              </div>
              <div>
                <label className="block text-[#AA9E80] font-bold mb-1">
                  {t('Responsable Patronaje:', 'Patternmaker Responsible:')}
                </label>
                <input
                  type="text"
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-[#FBF8F2] font-bold focus:border-[#C6A466] outline-none"
                />
              </div>
            </div>

            <div className="bg-[#2B2B2E] p-3.5 rounded-2xl border border-[#424246]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={calceAprobado}
                  onChange={(e) => setCalceAprobado(e.target.checked)}
                  className="w-4 h-4 text-[#C6A466] rounded border-[#424246] accent-[#C6A466]"
                />
                <span className="text-[#FBF8F2] font-bold">
                  {t('Calce y caída de silueta aprobados en maniquí', 'Fit and silhouette drape approved on mannequin')}
                </span>
              </label>
            </div>

            <div>
              <label className="block text-[#AA9E80] font-bold mb-1">
                {t('Dictamen de Patronaje:', 'Patternmaking Verdict:')}
              </label>
              <select
                value={dictamenPatronaje}
                onChange={(e) => setDictamenPatronaje(e.target.value as DictamenType)}
                className="w-full bg-[#2B2B2E] border border-[#424246] text-[#FBF8F2] rounded-xl p-2.5 font-extrabold outline-none focus:border-[#C6A466]"
              >
                <option value="APROBADO" className="bg-[#2B2B2E] text-[#FBF8F2]">🟢 APROBADO (Molde Liberado)</option>
                <option value="HALLAZGO" className="bg-[#2B2B2E] text-[#FBF8F2]">🟡 HALLAZGO (Compensación Requerida)</option>
                <option value="RECHAZADO" className="bg-[#2B2B2E] text-[#FBF8F2]">🔴 RECHAZADO (Deformación Crítica)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#AA9E80] font-bold mb-1">
                {t('Observaciones / Factores de Trazo:', 'Notes / Drafting Directives:')}
              </label>
              <textarea
                rows={3}
                value={observacionPatronaje}
                onChange={(e) => setObservacionPatronaje(e.target.value)}
                placeholder={t('Instrucciones para trazo, piquetes o ajuste de moldes...', 'Instructions for layout, notches, or pattern adjustment...')}
                className="w-full bg-[#2B2B2E] border border-[#424246] text-[#FBF8F2] rounded-xl p-2.5 font-medium outline-none focus:border-[#C6A466]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#C6A466] hover:bg-[#b59355] text-[#2B2B2E] font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
            >
              {t('Guardar Dictamen de Patronaje', 'Save Pattern Verdict')}
            </button>
          </form>
        </div>

        {/* Columna Derecha: Planilla de Estabilidad Dimensional (7 cols) */}
        <div className="lg:col-span-7 bg-[#2D2D30] border border-[#424246] rounded-3xl p-6 shadow-xs space-y-4 text-[#FBF8F2]">
          <div className="flex items-center justify-between border-b border-[#424246] pb-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#C6A466] flex items-center gap-2 font-display">
              <Ruler className="w-4 h-4 text-[#C6A466]" />
              {t('Planilla de Estabilidad Dimensional y Compensaciones', 'Dimensional Stability & Compensation Sheet')}
            </h4>
            <span className="text-[10px] bg-[#C6A466]/20 text-[#C6A466] font-mono font-extrabold px-2.5 py-0.5 rounded-full border border-[#C6A466]/30">
              OPTITEX / GERBER / LECTRA
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#C6A466] text-[#2B2B2E] uppercase text-[10px] border-b border-[#424246] font-black tracking-wider">
                <tr>
                  <th className="p-3">{t('Referencia', 'Reference')}</th>
                  <th className="p-3 text-center">{t('Var. Largo (Hilo)', 'Length Var')}</th>
                  <th className="p-3 text-center">{t('Var. Ancho (Trama)', 'Width Var')}</th>
                  <th className="p-3 text-center">{t('Factores CAD (X / Y)', 'CAD Factors (X / Y)')}</th>
                  <th className="p-3 text-center">{t('Acción', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#424246] bg-[#2D2D30]">
                {muestras.map((m) => {
                  const elargo = m.ensayos?.encogimientoLargo?.valor ?? -3.4;
                  const eancho = m.ensayos?.encogimientoAncho?.valor ?? -2.1;
                  const factorX = elargo <= 0 ? 1 + (Math.abs(elargo) / 100) : 1 - (Math.abs(elargo) / 100);
                  const factorY = eancho <= 0 ? 1 + (Math.abs(eancho) / 100) : 1 - (Math.abs(eancho) / 100);
                  const sem = getSemaforoInfo(elargo, eancho);

                  return (
                    <tr key={m.id} className="hover:bg-[#2B2B2E] transition-colors">
                      <td className="p-3">
                        <span className="font-bold text-[#FBF8F2] block">{m.referencia}</span>
                        <span className="text-[10px] text-[#AA9E80] font-medium">{m.proveedor}</span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#C6A466]">
                        {elargo > 0 ? `+${elargo}%` : `${elargo}%`}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#C6A466]">
                        {eancho > 0 ? `+${eancho}%` : `${eancho}%`}
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-block bg-[#2B2B2E] px-2.5 py-1 rounded-lg border border-[#424246] font-mono text-[10px] font-bold text-[#FBF8F2]">
                          <span>X: {factorX.toFixed(3)} | Y: {factorY.toFixed(3)}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setMuestraSeleccionadaId(m.id);
                            setModalCalculadoraAbierto(true);
                          }}
                          className="px-2.5 py-1 bg-[#C6A466] hover:bg-[#b59355] text-[#2B2B2E] text-[10px] font-extrabold uppercase rounded-lg shadow-xs transition-all cursor-pointer"
                        >
                          {t('Calcular CAD', 'Calculate CAD')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal Calculadora Avanzada de Patronaje */}
      <CalculadoraPatronajeModal
        abierto={modalCalculadoraAbierto}
        onCerrar={() => setModalCalculadoraAbierto(false)}
        muestraInicialId={muestraSeleccionadaId}
        onAplicarValoresAPatronaje={(valores) => {
          setHolguraAdicionalCm(valores.holguraSugerida);
          setObservacionPatronaje(valores.observacionCad);
          if (valores.factorX !== 1.0 || valores.factorY !== 1.0) {
            setDictamenPatronaje('HALLAZGO');
          }
          setModalCalculadoraAbierto(false);
        }}
      />

    </div>
  );
};
