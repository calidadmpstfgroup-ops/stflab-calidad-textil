import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { MuestraTextil } from '../../types';
import { Badge } from '../common/Badge';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ArrowRight, 
  SlidersHorizontal, 
  FlaskConical, 
  Save,
  FileCheck,
  Building2,
  KeyRound
} from 'lucide-react';

export const HomologacionView: React.FC = () => {
  const { muestras, actualizarMuestra, setAreaActual } = useQuality();
  const [muestraSeleccionadaId, setMuestraSeleccionadaId] = useState<string>(muestras[0]?.id || '');

  const muestraActual = muestras.find((m) => m.id === muestraSeleccionadaId) || muestras[0];

  const [estadoHomologacion, setEstadoHomologacion] = useState<'APROBADA' | 'OBSERVADA' | 'RECHAZADA'>(
    muestraActual?.homologacion?.estado === 'PENDIENTE' ? 'APROBADA' : (muestraActual?.homologacion?.estado || 'APROBADA')
  );
  const [observaciones, setObservaciones] = useState(muestraActual?.homologacion?.observaciones || '');
  const [responsable, setResponsable] = useState(muestraActual?.homologacion?.responsable || 'Ing. Carlos Mendoza');

  const handleCambioMuestra = (m: MuestraTextil) => {
    setMuestraSeleccionadaId(m.id);
    setEstadoHomologacion(m.homologacion.estado === 'PENDIENTE' ? 'APROBADA' : m.homologacion.estado);
    setObservaciones(m.homologacion.observaciones || '');
    setResponsable(m.homologacion.responsable || 'Ing. Carlos Mendoza');
  };

  const handleGuardarPaseALab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muestraActual) return;

    const hoyStr = new Date().toISOString().split('T')[0];
    const muestraActualizada: MuestraTextil = {
      ...muestraActual,
      homologacion: {
        ...muestraActual.homologacion,
        estado: estadoHomologacion,
        fechaHomologacion: hoyStr,
        responsable,
        observaciones,
      },
      trazabilidad: {
        ...muestraActual.trazabilidad,
        laboratorio: {
          ...muestraActual.trazabilidad.laboratorio,
          estado: 'EN_PROCESO',
          fechaInicio: hoyStr,
          observaciones: `Homologación completada (${estadoHomologacion}). Listo para ensayos físicos.`,
        },
      },
    };

    actualizarMuestra(muestraActualizada);
    alert(`¡Homologación ${estadoHomologacion} guardada! Expediente pasado a Laboratorio de Ensayos.`);
    setAreaActual('laboratorio');
  };

  // Comparaciones lado a lado
  const stf = muestraActual?.fichaMaestraSTF;
  const prov = muestraActual?.fichaProveedor;

  const deltaGramaje = prov?.gramajeGsm && stf?.gramajeObjetivo
    ? Number((((prov.gramajeGsm - stf.gramajeObjetivo) / stf.gramajeObjetivo) * 100).toFixed(1))
    : 0;

  const esGramajeConforme = Math.abs(deltaGramaje) <= (stf?.toleranciaGramajePorc || 5);
  const esEncLargoConforme = (prov?.encogimientoLargoEstimado || 0) >= (stf?.encogimientoLargoMax || -3.0);
  const esEncAnchoConforme = (prov?.encogimientoAnchoEstimado || 0) >= (stf?.encogimientoAnchoMax || -3.5);
  const esSolidezConforme = (prov?.solidezLavadoEstimada || 4.5) >= (stf?.solidezLavadoMin || 4.0);

  return (
    <div className="space-y-6">
      
      {/* Banner de Área */}
      <div className="bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Revisión Técnica & Homologación</h2>
              <span className="text-xs bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded border border-teal-500/30">
                AUDITORÍA COMPARATIVA LADO A LADO
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Homologación técnica: Ficha Técnica Maestra de STF Group vs. Parámetros declarados por el fabricante con Token (#FT-...).
            </p>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lista Lateral de Expedientes */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col h-[750px]">
          <h3 className="text-sm font-bold text-white mb-3">
            Expedientes para Homologar ({muestras.length})
          </h3>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {muestras.map((m) => {
              const esSeleccionada = m.id === muestraActual?.id;
              const estadoHom = m.homologacion?.estado || 'PENDIENTE';

              return (
                <div
                  key={m.id}
                  onClick={() => handleCambioMuestra(m)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    esSeleccionada
                      ? 'bg-teal-950/40 border-teal-500/60 ring-1 ring-teal-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-white">{m.codigoMT}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      estadoHom === 'APROBADA' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      estadoHom === 'OBSERVADA' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      estadoHom === 'RECHAZADA' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {estadoHom}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 truncate">{m.referencia}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="truncate">{m.proveedor}</span>
                    <span className="text-amber-400 font-mono text-[10px]">{m.fichaProveedor?.tokenAcceso || '#FT-PND'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Comparativo Lado a Lado */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg h-[750px] overflow-y-auto space-y-6">
          {muestraActual ? (
            <form onSubmit={handleGuardarPaseALab} className="space-y-6 text-xs">
              
              {/* Header de Expediente */}
              <div className="border-b border-slate-800 pb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-amber-400">{muestraActual.codigoMT}</span>
                    <Badge tipo="marca" valor={muestraActual.marca} size="sm" />
                    <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Token: {muestraActual.fichaProveedor?.tokenAcceso || '#FT-2026'}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    {muestraActual.referencia}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Proveedor: <strong className="text-teal-300">{muestraActual.proveedor}</strong> • Lote: <strong className="text-slate-300 font-mono">{muestraActual.lote}</strong>
                  </p>
                </div>
              </div>

              {/* Tabla Comparativa LADO A LADO */}
              <div className="space-y-3">
                <h4 className="font-bold text-teal-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4" />
                  Homologación Lado a Lado: Estándar STF Group vs. Declarado Proveedor
                </h4>

                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Parámetro Técnico</th>
                        <th className="py-2.5 px-3 text-teal-400 font-bold">Estándar STF Group (Meta)</th>
                        <th className="py-2.5 px-3 text-amber-400 font-bold">Declarado Proveedor</th>
                        <th className="py-2.5 px-3 text-center">Delta / Variación</th>
                        <th className="py-2.5 px-3 text-center">Conformidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      
                      {/* Gramaje */}
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">Gramaje Nominal (g/m²)</td>
                        <td className="py-2.5 px-3 text-teal-300 font-bold">{stf?.gramajeObjetivo || 215} ±{stf?.toleranciaGramajePorc || 5}%</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">{prov?.gramajeGsm || 210} g/m²</td>
                        <td className="py-2.5 px-3 text-center font-mono">{deltaGramaje > 0 ? `+${deltaGramaje}%` : `${deltaGramaje}%`}</td>
                        <td className="py-2.5 px-3 text-center">
                          {esGramajeConforme ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                              <XCircle className="w-3.5 h-3.5" /> Fuera de Norma
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Encogimiento Largo */}
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">Encogimiento Largo (Urdimbre)</td>
                        <td className="py-2.5 px-3 text-teal-300 font-bold">Máx {stf?.encogimientoLargoMax || -3.0}%</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">{prov?.encogimientoLargoEstimado || -2.0}%</td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {((prov?.encogimientoLargoEstimado || 0) - (stf?.encogimientoLargoMax || -3.0)).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {esEncLargoConforme ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                              <XCircle className="w-3.5 h-3.5" /> No Conforme
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Encogimiento Ancho */}
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">Encogimiento Ancho (Trama)</td>
                        <td className="py-2.5 px-3 text-teal-300 font-bold">Máx {stf?.encogimientoAnchoMax || -3.5}%</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">{prov?.encogimientoAnchoEstimado || -3.0}%</td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {((prov?.encogimientoAnchoEstimado || 0) - (stf?.encogimientoAnchoMax || -3.5)).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {esEncAnchoConforme ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                              <AlertCircle className="w-3.5 h-3.5" /> En Límite
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Solidez al Lavado */}
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">Solidez al Lavado (Escala 1-5)</td>
                        <td className="py-2.5 px-3 text-teal-300 font-bold">Mínimo {stf?.solidezLavadoMin || 4.0}</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">{prov?.solidezLavadoEstimada || 4.5}</td>
                        <td className="py-2.5 px-3 text-center font-mono">-</td>
                        <td className="py-2.5 px-3 text-center">
                          {esSolidezConforme ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                              <XCircle className="w-3.5 h-3.5" /> Deficiente
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Ancho Útil */}
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">Ancho Útil Mínimo</td>
                        <td className="py-2.5 px-3 text-teal-300 font-bold">&ge; {stf?.anchoMinimoM || 1.45} m</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">{prov?.anchoUtilM || 1.45} m</td>
                        <td className="py-2.5 px-3 text-center font-mono">0.0 m</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
                          </span>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dictamen de Homologación y Pase a Lab */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="font-bold text-teal-400 uppercase tracking-wider text-xs">
                  Dictamen de Homologación Técnica
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Resultado de Homologación:</label>
                    <select
                      value={estadoHomologacion}
                      onChange={(e) => setEstadoHomologacion(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white"
                    >
                      <option value="APROBADA" className="text-emerald-400 font-bold">APROBADA (Pase Directo a Ensayos)</option>
                      <option value="OBSERVADA" className="text-amber-400 font-bold">OBSERVADA (Pase a Lab con Alerta)</option>
                      <option value="RECHAZADA" className="text-rose-400 font-bold">RECHAZADA (No Homologada)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Ingeniero de Homologación:</label>
                    <input
                      type="text"
                      value={responsable}
                      onChange={(e) => setResponsable(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Observaciones / Directrices para el Laboratorio:</label>
                  <textarea
                    rows={2}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Instrucciones específicas para el ensayo físico o químico..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Al confirmar, se creará el expediente formal y se habilitará el protocolo de laboratorio.
                </span>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Guardar Homologación & Pasar a Laboratorio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              Selecciona un expediente para realizar la homologación.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
