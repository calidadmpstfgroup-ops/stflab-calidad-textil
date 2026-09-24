import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { MuestraTextil } from '../../types';
import { Badge } from '../common/Badge';
import { 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  FileText, 
  Building2, 
  Save, 
  Printer, 
  Percent,
  CheckSquare
} from 'lucide-react';

export const ComprasDecisionView: React.FC = () => {
  const { muestras, actualizarMuestra } = useQuality();
  
  // Priorizar muestras con hallazgos o rechazadas
  const muestrasConNovedad = muestras.filter(
    (m) => m.dictamenFinal === 'HALLAZGO' || m.dictamenFinal === 'RECHAZADO' || m.trazabilidad.laboratorio.dictamen === 'HALLAZGO'
  );

  const [muestraSeleccionadaId, setMuestraSeleccionadaId] = useState<string>(
    muestrasConNovedad[0]?.id || muestras[0]?.id || ''
  );

  const muestraActual = muestras.find((m) => m.id === muestraSeleccionadaId) || muestras[0];

  const [decision, setDecision] = useState<'APROBADO_COMERCIAL' | 'DESCUENTO_NEGOCIADO' | 'DEVOLUCION_PROVEEDOR'>(
    muestraActual?.decisionCompras?.decision === 'PENDIENTE' ? 'DESCUENTO_NEGOCIADO' : (muestraActual?.decisionCompras?.decision || 'DESCUENTO_NEGOCIADO')
  );
  const [descuentoPorc, setDescuentoPorc] = useState<number>(muestraActual?.decisionCompras?.porcentajeDescuento || 5);
  const [motivo, setMotivo] = useState<string>(muestraActual?.decisionCompras?.motivoDecision || '');
  const [responsable, setResponsable] = useState<string>(muestraActual?.decisionCompras?.responsableCompras || 'Marcela Gómez (Compras)');
  const [mostrarCartaRechazo, setMostrarCartaRechazo] = useState(false);

  const handleCambioMuestra = (m: MuestraTextil) => {
    setMuestraSeleccionadaId(m.id);
    setDecision(m.decisionCompras.decision === 'PENDIENTE' ? 'DESCUENTO_NEGOCIADO' : m.decisionCompras.decision);
    setDescuentoPorc(m.decisionCompras.porcentajeDescuento || 5);
    setMotivo(m.decisionCompras.motivoDecision || '');
    setResponsable(m.decisionCompras.responsableCompras || 'Marcela Gómez (Compras)');
    setMostrarCartaRechazo(false);
  };

  const handleGuardarDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muestraActual) return;

    const hoyStr = new Date().toISOString().split('T')[0];
    const muestraActualizada: MuestraTextil = {
      ...muestraActual,
      decisionCompras: {
        decision,
        porcentajeDescuento: decision === 'DESCUENTO_NEGOCIADO' ? descuentoPorc : 0,
        motivoDecision: motivo,
        fechaDecision: hoyStr,
        responsableCompras: responsable,
        cartaNoConformidadGenerada: decision === 'DEVOLUCION_PROVEEDOR' || decision === 'DESCUENTO_NEGOCIADO',
      },
      historial: [
        ...muestraActual.historial,
        {
          id: `h-${Date.now()}`,
          fecha: hoyStr,
          area: 'compras-decision',
          usuario: responsable,
          accion: `Decisión Comercial: ${decision}`,
          detalle: motivo || `Decisión de compras registrada. Descuento: ${descuentoPorc}%.`,
        },
      ],
    };

    actualizarMuestra(muestraActualizada);
    alert(`¡Decisión comercial de Compras guardada exitosamente (${decision})!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner de Área */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Gestión & Decisión Comercial de Compras</h2>
              <span className="text-xs bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-500/30">
                RESOLUCIÓN COMERCIAL DE PARTIDAS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Evaluación de partidas con observaciones de laboratorio para aprobación comercial, negociación de descuento o devolución.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Partidas con novedad:</span>
          <p className="text-lg font-black text-amber-400">
            {muestrasConNovedad.length} Lotes
          </p>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lista de Partidas con Novedades */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col h-[700px]">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
            <span>Partidas con Novedades ({muestras.length})</span>
          </h3>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {muestras.map((m) => {
              const esSeleccionada = m.id === muestraActual?.id;
              const tieneAlerta = m.dictamenFinal === 'HALLAZGO' || m.dictamenFinal === 'RECHAZADO';

              return (
                <div
                  key={m.id}
                  onClick={() => handleCambioMuestra(m)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    esSeleccionada
                      ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-white">{m.codigoMT}</span>
                    <Badge tipo="dictamen" valor={m.dictamenFinal} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 truncate">{m.referencia}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="text-cyan-300 font-semibold truncate">{m.proveedor}</span>
                    <span className="font-mono">{m.ordenCompra}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Decisión Comercial */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg h-[700px] overflow-y-auto space-y-6">
          {muestraActual ? (
            <form onSubmit={handleGuardarDecision} className="space-y-6 text-xs">
              
              <div className="border-b border-slate-800 pb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-amber-400">{muestraActual.codigoMT}</span>
                    <Badge tipo="marca" valor={muestraActual.marca} size="sm" />
                    <Badge tipo="dictamen" valor={muestraActual.dictamenFinal} size="sm" />
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    {muestraActual.referencia}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Proveedor: <strong className="text-slate-200">{muestraActual.proveedor}</strong> • Lote: <strong className="text-slate-200 font-mono">{muestraActual.lote}</strong>
                  </p>
                </div>
              </div>

              {/* Dictamen Técnico de Laboratorio y Causas */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] block">
                  Informe Técnico Emitido por Laboratorio:
                </span>
                <p className="text-slate-300 italic">
                  "{muestraActual.trazabilidad.laboratorio.observaciones || muestraActual.observacionesGenerales || 'Sin observaciones técnicas adicionales.'}"
                </p>
                {muestraActual.causasNoConformidad && muestraActual.causasNoConformidad.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="font-bold text-rose-400 text-xs block mb-1">Causas de No Conformidad:</span>
                    <ul className="space-y-1">
                      {muestraActual.causasNoConformidad.map((c, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-rose-300 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Selección de Decisión Comercial */}
              <div className="space-y-3">
                <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-xs">
                  Decisión de Negocio & Resolución Comercial
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Opción 1: Aprobación Comercial */}
                  <div 
                    onClick={() => setDecision('APROBADO_COMERCIAL')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      decision === 'APROBADO_COMERCIAL'
                        ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-emerald-400 text-xs">Aprobación Comercial</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Aceptar lote en condiciones actuales. No genera penalidad.
                    </p>
                  </div>

                  {/* Opción 2: Negociación de Descuento */}
                  <div 
                    onClick={() => setDecision('DESCUENTO_NEGOCIADO')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      decision === 'DESCUENTO_NEGOCIADO'
                        ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-400 text-xs">Negociar Descuento</span>
                      <Percent className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Aceptar lote aplicando % de descuento comercial por merma.
                    </p>
                  </div>

                  {/* Opción 3: Devolución a Fábrica */}
                  <div 
                    onClick={() => setDecision('DEVOLUCION_PROVEEDOR')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      decision === 'DEVOLUCION_PROVEEDOR'
                        ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-rose-400 text-xs">Devolución / Rechazo</span>
                      <RotateCcw className="w-4 h-4 text-rose-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Rechazar lote y emitir reclamo formal / carta de no conformidad.
                    </p>
                  </div>

                </div>

                {/* Campo de Descuento si aplica */}
                {decision === 'DESCUENTO_NEGOCIADO' && (
                  <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-amber-300 block text-xs">Porcentaje de Descuento Negociado:</span>
                      <span className="text-[11px] text-slate-400">Compensación por mayor consumo de tela o ajuste operativo.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={descuentoPorc}
                        onChange={(e) => setDescuentoPorc(parseFloat(e.target.value) || 0)}
                        className="w-20 bg-slate-900 border border-amber-500/40 rounded px-2.5 py-1 text-sm font-black text-amber-300 text-right"
                      />
                      <span className="font-black text-amber-400 text-sm">%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Justificación y Responsable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Comprador Responsable:</label>
                  <input
                    type="text"
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Acta / Justificación Comercial:</label>
                  <textarea
                    rows={2}
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Acuerdo comercial alcanzado con el proveedor..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              {/* Vista Previa de Carta de No Conformidad */}
              {(decision === 'DEVOLUCION_PROVEEDOR' || decision === 'DESCUENTO_NEGOCIADO') && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      Carta Formal de Notificación al Proveedor ({muestraActual.proveedor})
                    </span>
                    <button
                      type="button"
                      onClick={() => setMostrarCartaRechazo(!mostrarCartaRechazo)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold text-xs"
                    >
                      {mostrarCartaRechazo ? 'Ocultar Carta' : 'Ver Borrador de Carta'}
                    </button>
                  </div>

                  {mostrarCartaRechazo && (
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-700 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
{`CARTA DE RECLAMO TÉCNICO & NOTIFICACIÓN COMERCIAL
Para: ${muestraActual.proveedor}
De: Departamento de Compras & Calidad - STF Group S.A.
Fecha: ${new Date().toLocaleDateString('es-CO')}
Referencia: ${muestraActual.referencia} | OP: ${muestraActual.ordenCompra} | Lote: ${muestraActual.lote}

Estimado proveedor:
Por medio de la presente, informamos que tras la evaluación físico-mecánica realizada en STFLab bajo normas NTC/AATCC, la partida en referencia presentó las siguientes novedades técnicas:
${muestraActual.causasNoConformidad.map((c) => `- ${c}`).join('\n') || '- Parámetros fuera de tolerancia garantizada'}

DECISIÓN COMERCIAL ADOPTADA:
${decision === 'DEVOLUCION_PROVEEDOR' ? '-> DEVOLUCIÓN TOTAL DEL LOTE Y BLOQUEO PARA PRODUCCIÓN.' : `-> APROBACIÓN CONDICIONADA CON APLICACIÓN DEL ${descuentoPorc}% DE DESCUENTO COMERCIAL POR MERMA.`}

Agradecemos su atención inmediata para la emisión de la respectiva nota crédito o reemplazo del lote.

Atentamente,
${responsable}
Departamento de Compras Textil - STF Group S.A.`}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Decisión Comercial de Compras</span>
                </button>
              </div>

            </form>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              Selecciona una partida para gestionar la decisión comercial.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
