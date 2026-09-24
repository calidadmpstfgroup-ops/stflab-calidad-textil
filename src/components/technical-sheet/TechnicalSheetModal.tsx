import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { Badge } from '../common/Badge';
import { PrintableReport } from './PrintableReport';
import { TrazabilidadSolicitudSection } from '../common/TrazabilidadSolicitudSection';
import { obtenerDiasEnProceso, esAlertaLeadTime } from '../../utils/calculations';
import { 
  X, 
  Printer, 
  FlaskConical, 
  Ruler, 
  Layers, 
  Shirt, 
  ShoppingCart, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Clock, 
  History, 
  FileText,
  Building2,
  Calendar,
  Sparkles,
  AlertTriangle,
  Download
} from 'lucide-react';

export const TechnicalSheetModal: React.FC = () => {
  const { 
    modalFichaAbierto, 
    setModalFichaAbierto, 
    muestraSeleccionada 
  } = useQuality();

  const [tabActiva, setTabActiva] = useState<'trazabilidad' | 'ensayos' | 'historial'>('ensayos');
  const [modoImpresion, setModoImpresion] = useState(false);

  if (!modalFichaAbierto || !muestraSeleccionada) return null;

  const m = muestraSeleccionada;
  const dias = obtenerDiasEnProceso(m);
  const alerta = esAlertaLeadTime(m);

  if (modoImpresion) {
    return (
      <PrintableReport 
        muestra={m} 
        onCerrar={() => setModoImpresion(false)} 
      />
    );
  }

  const renderConformidad = (resultado?: 'CONFORME' | 'NO_CONFORME' | 'OBSERVACION', observacion?: string) => {
    if (!resultado) return <span className="text-slate-500">-</span>;
    if (resultado === 'CONFORME') {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
          <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
        </span>
      );
    }
    if (resultado === 'OBSERVACION') {
      return (
        <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-xs" title={observacion}>
          <AlertCircle className="w-3.5 h-3.5" /> Observación
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-xs" title={observacion}>
        <XCircle className="w-3.5 h-3.5" /> No Conforme
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2B2B2E]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#2B2B2E] border border-[#424246] rounded-3xl shadow-2xl overflow-hidden my-6 text-[#FBF8F2] flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="bg-[#2D2D30] px-6 py-4 border-b border-[#424246] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#F0DCA8] bg-[#C6A466]/20 px-2 py-0.5 rounded border border-[#C6A466]/30">
                {m.codigoMT}
              </span>
              <span className="font-mono text-xs text-[#AA9E80] font-bold">
                Reporte: {m.numeroReporte}
              </span>
              <Badge tipo="marca" valor={m.marca} size="sm" />
              <Badge tipo="dictamen" valor={m.dictamenFinal} size="md" />
              {alerta && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8C3D35]/20 text-[#DBA097] border border-[#8C3D35]/40 text-xs font-mono font-bold animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> Lead Time &gt; 2 días
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-serif tracking-wide uppercase text-[#FBF8F2]">
              {m.referencia}
            </h2>
            <p className="text-xs text-[#AA9E80] flex items-center gap-3">
              <span>Proveedor: <strong className="text-[#FBF8F2]">{m.proveedor}</strong></span>
              <span>•</span>
              <span>Lote: <strong className="text-[#FBF8F2] font-mono">{m.lote}</strong></span>
              <span>•</span>
              <span>OP: <strong className="text-[#FBF8F2] font-mono">{m.ordenCompra}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModoImpresion(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2D2D30] hover:bg-[#424246] text-[#F0DCA8] text-xs font-bold rounded-xl border border-[#AA9E80]/40 transition-colors shadow-sm cursor-pointer"
              title="Imprimir Certificado de Calidad"
            >
              <Printer className="w-4 h-4 text-[#C6A466]" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>

            <button
              onClick={() => setModalFichaAbierto(false)}
              className="p-1.5 text-[#AA9E80] hover:text-[#FBF8F2] hover:bg-[#424246] rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-[#2D2D30]/80 border-b border-[#424246] text-xs font-bold">
          <button
            onClick={() => setTabActiva('ensayos')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
              tabActiva === 'ensayos'
                ? 'border-[#C6A466] text-[#F0DCA8] bg-[#C6A466]/10'
                : 'border-transparent text-[#AA9E80] hover:text-[#FBF8F2]'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-[#C6A466]" />
            <span>Ensayos de Laboratorio ({m.ensayos.construccion || 'Físico-Mecánicos'})</span>
          </button>

          <button
            onClick={() => setTabActiva('trazabilidad')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
              tabActiva === 'trazabilidad'
                ? 'border-[#C6A466] text-[#F0DCA8] bg-[#C6A466]/10'
                : 'border-transparent text-[#AA9E80] hover:text-[#FBF8F2]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#C6A466]" />
            <span>Trazabilidad por 5 Áreas</span>
          </button>

          <button
            onClick={() => setTabActiva('historial')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
              tabActiva === 'historial'
                ? 'border-[#C6A466] text-[#F0DCA8] bg-[#C6A466]/10'
                : 'border-transparent text-[#AA9E80] hover:text-[#FBF8F2]'
            }`}
          >
            <History className="w-4 h-4 text-[#C6A466]" />
            <span>Bitácora & Historial ({m.historial?.length || 0})</span>
          </button>
        </div>

        {/* Contenido Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: ENSAYOS DE LABORATORIO */}
          {tabActiva === 'ensayos' && (
            <div className="space-y-6">
              
              {/* Tarjeta de Especificación General */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block mb-0.5">Composición Declarada:</span>
                  <strong className="text-slate-200 text-sm font-semibold">{m.ensayos.composicion || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Tipo de Construcción:</span>
                  <strong className="text-slate-200 text-sm font-semibold">{m.ensayos.construccion || m.tipoMaterial}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Ancho Útil / Total:</span>
                  <strong className="text-slate-200 text-sm font-semibold">
                    {m.ensayos.anchoUtil?.valor ? `${m.ensayos.anchoUtil.valor} m` : '-'} / {m.ensayos.anchoTotal?.valor ? `${m.ensayos.anchoTotal.valor} m` : '-'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">País de Origen:</span>
                  <strong className="text-slate-200 text-sm font-semibold">{m.paisOrigen || 'N/A'}</strong>
                </div>
              </div>

              {/* Tabla de Parámetros Normados */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 font-bold text-slate-200 flex items-center justify-between">
                  <span>Ensayos Físico-Mecánicos y Solideces Textil</span>
                  <span className="text-[11px] text-slate-400 font-normal">Normas AATCC / ASTM / NTC</span>
                </div>

                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                    <tr>
                      <th className="py-2.5 px-4">Ensayo / Parámetro</th>
                      <th className="py-2.5 px-3">Norma Técnica</th>
                      <th className="py-2.5 px-3">Tolerancia / Estándar</th>
                      <th className="py-2.5 px-3">Resultado Obtenido</th>
                      <th className="py-2.5 px-4 text-center">Conformidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    
                    {/* Gramaje */}
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-200">Gramaje / Peso</td>
                      <td className="py-2.5 px-3 text-slate-400">ASTM D3776 / NTC 230</td>
                      <td className="py-2.5 px-3 text-slate-400">{m.ensayos.gramajeGsm?.tolerancia || '± 5%'}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-300">
                        {m.ensayos.gramajeGsm?.valor ? `${m.ensayos.gramajeGsm.valor} g/m²` : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {renderConformidad(m.ensayos.gramajeGsm?.resultado, m.ensayos.gramajeGsm?.observacion)}
                      </td>
                    </tr>

                    {/* Encogimiento Largo */}
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-200">Encogimiento en Largo (Urdimbre)</td>
                      <td className="py-2.5 px-3 text-slate-400">AATCC 135 / NTC 908</td>
                      <td className="py-2.5 px-3 text-slate-400">{m.ensayos.encogimientoLargo?.tolerancia || '± 3.0%'}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-100">
                        {m.ensayos.encogimientoLargo?.valor ? `${m.ensayos.encogimientoLargo.valor}%` : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {renderConformidad(m.ensayos.encogimientoLargo?.resultado, m.ensayos.encogimientoLargo?.observacion)}
                      </td>
                    </tr>

                    {/* Encogimiento Ancho */}
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-200">Encogimiento en Ancho (Trama)</td>
                      <td className="py-2.5 px-3 text-slate-400">AATCC 135 / NTC 908</td>
                      <td className="py-2.5 px-3 text-slate-400">{m.ensayos.encogimientoAncho?.tolerancia || '± 3.5%'}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-100">
                        {m.ensayos.encogimientoAncho?.valor ? `${m.ensayos.encogimientoAncho.valor}%` : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {renderConformidad(m.ensayos.encogimientoAncho?.resultado, m.ensayos.encogimientoAncho?.observacion)}
                      </td>
                    </tr>

                    {/* Viro / Pierna Virada */}
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-200">Viro / Torque de Pierna</td>
                      <td className="py-2.5 px-3 text-slate-400">AATCC 179</td>
                      <td className="py-2.5 px-3 text-slate-400">{m.ensayos.viroPierna?.tolerancia || 'Máx 3.0%'}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-100">
                        {m.ensayos.viroPierna?.valor ? `${m.ensayos.viroPierna.valor}%` : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {renderConformidad(m.ensayos.viroPierna?.resultado, m.ensayos.viroPierna?.observacion)}
                      </td>
                    </tr>

                    {/* Solidez al Lavado */}
                    {m.ensayos.solidezLavado && (
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-200">Solidez al Lavado Doméstico</td>
                        <td className="py-2.5 px-3 text-slate-400">ISO 105 A03 / NTC 1155</td>
                        <td className="py-2.5 px-3 text-slate-400">Mínimo 4.0 / 5.0</td>
                        <td className="py-2.5 px-3 font-bold text-slate-100">
                          Cambio: {m.ensayos.solidezLavado.cambioColor?.valor || '-'} • Manchado: {m.ensayos.solidezLavado.manchado?.valor || '-'}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {renderConformidad(m.ensayos.solidezLavado.cambioColor?.resultado)}
                        </td>
                      </tr>
                    )}

                    {/* Solidez al Frote */}
                    {m.ensayos.solidezFrote && (
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-200">Solidez al Frote (Crocking)</td>
                        <td className="py-2.5 px-3 text-slate-400">AATCC 8 / NTC 786</td>
                        <td className="py-2.5 px-3 text-slate-400">Seco &ge; 4.0 • Húmedo &ge; 3.0</td>
                        <td className="py-2.5 px-3 font-bold text-slate-100">
                          Seco: {m.ensayos.solidezFrote.seco?.valor || '-'} • Húmedo: {m.ensayos.solidezFrote.humedo?.valor || '-'}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {renderConformidad(m.ensayos.solidezFrote.humedo?.resultado, m.ensayos.solidezFrote.humedo?.observacion)}
                        </td>
                      </tr>
                    )}

                    {/* Pilling */}
                    {m.ensayos.pilling && (
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-200">Resistencia al Pilling (Motoseo)</td>
                        <td className="py-2.5 px-3 text-slate-400">ASTM D3512 / NTC 2051</td>
                        <td className="py-2.5 px-3 text-slate-400">Mínimo Grado 3-4</td>
                        <td className="py-2.5 px-3 font-bold text-slate-100">
                          Grado {m.ensayos.pilling.valor}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {renderConformidad(m.ensayos.pilling.resultado, m.ensayos.pilling.observacion)}
                        </td>
                      </tr>
                    )}

                    {/* Deslizamiento de costuras */}
                    {m.ensayos.deslizamientoCostura && (
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-200">Deslizamiento de Costuras</td>
                        <td className="py-2.5 px-3 text-slate-400">NTC 1382</td>
                        <td className="py-2.5 px-3 text-slate-400">Máximo 4.0 mm a 60N</td>
                        <td className="py-2.5 px-3 font-bold text-slate-100">
                          {m.ensayos.deslizamientoCostura.valor} mm
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {renderConformidad(m.ensayos.deslizamientoCostura.resultado, m.ensayos.deslizamientoCostura.observacion)}
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              </div>

              {/* Recomendaciones y Cuidados */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-300 block mb-1 text-xs">Instrucción y Recomendación de Cuidado Textil:</span>
                <p className="text-slate-400 leading-relaxed">
                  {m.ensayos.lavadoSugerido || 'Lavar con colores similares en agua fría, no retorcer, no usar blanqueadores con cloro, secado a sombra.'}
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: TRAZABILIDAD POR 5 ÁREAS */}
          {tabActiva === 'trazabilidad' && (
            <div className="space-y-4">
              
              {/* Stepper / Tarjetas de las 4 áreas */}
              {[
                { key: 'laboratorio', label: '1. Laboratorio Textil & Ensayos', icon: <FlaskConical className="w-4 h-4 text-purple-400" /> },
                { key: 'compras', label: '2. Compras & Validación Proveedor', icon: <ShoppingCart className="w-4 h-4 text-blue-400" /> },
                { key: 'patronaje', label: '3. Patronaje & Escalado de Moldes', icon: <Ruler className="w-4 h-4 text-emerald-400" /> },
                { key: 'corte', label: '4. Corte & Reposo de Mesa', icon: <Layers className="w-4 h-4 text-orange-400" /> },
              ].map((etapa) => {
                const dataEtapa = m.trazabilidad[etapa.key as keyof typeof m.trazabilidad];
                if (!dataEtapa) return null;
                return (
                  <div 
                    key={etapa.key}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {etapa.icon}
                        <h4 className="font-bold text-white text-sm">{etapa.label}</h4>
                        <Badge tipo="dictamen" valor={dataEtapa.dictamen} size="sm" />
                      </div>
                      <p className="text-xs text-slate-400">
                        {dataEtapa.observaciones || 'Sin observaciones registradas por el departamento.'}
                      </p>
                    </div>

                    <div className="text-right text-xs text-slate-400 shrink-0 space-y-1">
                      <p>Responsable: <strong className="text-slate-200">{dataEtapa.responsable || 'No asignado'}</strong></p>
                      {dataEtapa.fechaFin && (
                        <p className="text-slate-500">Dictaminado el: {dataEtapa.fechaFin}</p>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>
          )}

          {/* TAB 3: BITÁCORA E HISTORIAL */}
          {tabActiva === 'historial' && (
            <div className="space-y-3">
              {m.historial && m.historial.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {m.historial.map((ev) => (
                    <div key={ev.id} className="relative group">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-slate-950 group-hover:scale-125 transition-transform"></div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{ev.accion}</span>
                          <span className="text-[11px] text-slate-400">{ev.fecha}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{ev.detalle}</p>
                        <p className="text-[10px] text-amber-400/90 font-semibold">
                          Por: {ev.usuario} ({ev.area.toUpperCase()})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Sin eventos registrados en la bitácora.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Días en proceso: <strong className="text-white">{dias} días</strong></span>
            <span>•</span>
            <span>Estado Final: <strong className="text-amber-300">{m.dictamenFinal}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModoImpresion(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Vista de Impresión</span>
            </button>
            <button
              onClick={() => setModalFichaAbierto(false)}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
