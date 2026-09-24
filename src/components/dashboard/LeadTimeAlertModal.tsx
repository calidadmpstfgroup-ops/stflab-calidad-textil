import React from 'react';
import { useQuality } from '../../context/QualityContext';
import { MuestraTextil } from '../../types';
import { esAlertaLeadTime, obtenerDiasEnProceso } from '../../utils/calculations';
import { Badge } from '../common/Badge';
import { 
  AlertTriangle, 
  X, 
  Clock, 
  ArrowRight, 
  FileText, 
  Building2, 
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const LeadTimeAlertModal: React.FC = () => {
  const { 
    modalAlertasLeadTimeAbierto, 
    setModalAlertasLeadTimeAbierto, 
    muestras,
    setMuestraSeleccionada,
    setModalFichaAbierto 
  } = useQuality();

  if (!modalAlertasLeadTimeAbierto) return null;

  const muestrasCriticas = muestras
    .filter(esAlertaLeadTime)
    .sort((a, b) => obtenerDiasEnProceso(b) - obtenerDiasEnProceso(a));

  const handleAbrirFicha = (m: MuestraTextil) => {
    setMuestraSeleccionada(m);
    setModalAlertasLeadTimeAbierto(false);
    setModalFichaAbierto(true);
  };

  const getEtapaActualBloqueada = (m: MuestraTextil): string => {
    const traz = m.trazabilidad;
    if (traz.laboratorio.estado === 'EN_PROCESO' || traz.laboratorio.estado === 'PENDIENTE') return 'Laboratorio Textil';
    if (traz.patronaje.estado === 'EN_PROCESO' || traz.patronaje.estado === 'PENDIENTE') return 'Patronaje & Calce';
    if (traz.corte.estado === 'EN_PROCESO' || traz.corte.estado === 'PENDIENTE') return 'Corte & Reposo';
    return 'Revisión Final';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2B2E]/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#2B2B2E] border border-rose-500/40 rounded-3xl shadow-2xl p-6 sm:p-7 my-8 text-[#FBF8F2]">
        
        {/* Botón cerrar */}
        <button
          onClick={() => setModalAlertasLeadTimeAbierto(false)}
          className="absolute top-5 right-5 p-2 text-[#AA9E80] hover:text-white hover:bg-[#424246] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Alerta */}
        <div className="flex items-start gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-serif font-bold text-[#FBF8F2] tracking-wide uppercase">
                Alerta Automática de Lead Time (&gt; 2 Días en Proceso)
              </h3>
              <span className="bg-rose-900/80 text-rose-200 border border-rose-700/50 text-xs font-black px-2.5 py-0.5 rounded-full">
                {muestrasCriticas.length} Muestras
              </span>
            </div>
            <p className="text-xs text-[#AA9E80] mt-1">
              Las siguientes muestras han superado el tiempo máximo de respuesta técnica de 48 horas sin dictamen definitivo.
            </p>
          </div>
        </div>

        {/* Lista de Muestras Críticas */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-vertical-scroll">
          {muestrasCriticas.length === 0 ? (
            <div className="py-12 text-center text-[#AA9E80] bg-[#2D2D30] rounded-2xl border border-[#424246]">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
              <p className="text-sm font-bold text-[#FBF8F2]">¡Excelente! No hay muestras con más de 2 días en proceso.</p>
              <p className="text-xs text-[#AA9E80] mt-1">Todos los lotes se encuentran dentro del lead time normado de 48h.</p>
            </div>
          ) : (
            muestrasCriticas.map((m) => {
              const dias = obtenerDiasEnProceso(m);
              const etapaBloqueada = getEtapaActualBloqueada(m);

              return (
                <div 
                  key={m.id}
                  className="bg-[#2D2D30] border border-rose-500/30 hover:border-rose-500/60 rounded-2xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[#C6A466] text-sm">{m.codigoMT}</span>
                      <span className="text-xs text-[#AA9E80] font-mono">({m.numeroReporte})</span>
                      <Badge tipo="marca" valor={m.marca} size="sm" />
                      <Badge tipo="dictamen" valor={m.dictamenFinal} size="sm" />
                    </div>

                    <h4 className="font-semibold text-[#FBF8F2] text-sm">
                      {m.referencia}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#AA9E80]">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#C6A466]" />
                        {m.proveedor}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#8A8172]" />
                        Ingreso: {m.fechaIngreso}
                      </span>
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Etapa actual: <strong>{etapaBloqueada}</strong>
                      </span>
                    </div>

                    {m.observacionesGenerales && (
                      <p className="text-[11px] text-[#AA9E80] italic bg-[#2B2B2E] p-2 rounded-xl border border-[#424246] line-clamp-2">
                        "{m.observacionesGenerales}"
                      </p>
                    )}
                  </div>

                  {/* Columna Derecha: Contador de días y acción */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#424246]">
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black">
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                        {dias} DÍAS EN PROCESO
                      </span>
                      <p className="text-[10px] text-rose-400/90 font-bold mt-0.5">
                        +{dias - 2} días de retraso
                      </p>
                    </div>

                    <button
                      onClick={() => handleAbrirFicha(m)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#2B2B2E] font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Gestionar Ficha</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#424246] flex items-center justify-between text-xs text-[#AA9E80]">
          <span>El objetivo operativo del laboratorio es &le; 48h desde el arribo físico.</span>
          <button
            onClick={() => setModalAlertasLeadTimeAbierto(false)}
            className="px-4 py-2 bg-[#2D2D30] hover:bg-[#424246] text-[#FBF8F2] font-semibold border border-[#424246] rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Alerta
          </button>
        </div>

      </div>
    </div>
  );
};
