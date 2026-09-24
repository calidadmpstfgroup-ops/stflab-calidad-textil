import React from 'react';
import { useQuality } from '../../context/QualityContext';
import { useLanguage } from '../../context/LanguageContext';
import { MuestraTextil, DictamenType } from '../../types';
import { 
  LayoutGrid, 
  FilePlus, 
  FlaskConical, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  UserCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const KanbanFlujoDashboard: React.FC = () => {
  const { muestras, solicitudesTelas, solicitudesAccesorios, setMuestraSeleccionada, setModalFichaAbierto, actualizarDictamenArea } = useQuality();
  const { t } = useLanguage();

  // Mapear muestras en las 4 columnas requeridas del flujo Kanban:
  // 1. Solicitud Creada (PENDIENTE / Nuevas solicitudes)
  // 2. Evaluado Lab (EN_PROCESO / En pruebas de laboratorio)
  // 3. Aprobado / Hallazgo (APROBADO o HALLAZGO)
  // 4. Rechazado (RECHAZADO)

  const columna1SolicitudCreada = muestras.filter(m => 
    !m.dictamenFinal || m.dictamenFinal === 'PENDIENTE'
  );

  const columna2EvaluadoLab = muestras.filter(m => 
    m.dictamenFinal === 'EN_PROCESO'
  );

  const columna3AprobadoHallazgo = muestras.filter(m => 
    m.dictamenFinal === 'APROBADO' || m.dictamenFinal === 'HALLAZGO'
  );

  const columna4Rechazado = muestras.filter(m => 
    m.dictamenFinal === 'RECHAZADO'
  );

  const handleCardClick = (m: MuestraTextil) => {
    setMuestraSeleccionada(m);
    setModalFichaAbierto(true);
  };

  const handleMoverEstado = (e: React.MouseEvent, mId: string, nuevoDictamen: DictamenType) => {
    e.stopPropagation();
    actualizarDictamenArea(mId, 'laboratorio', nuevoDictamen, `Estado cambiado en Tablero Kanban a ${nuevoDictamen}`);
  };

  const columnasDef = [
    {
      id: 'creada',
      title: t('Solicitud Creada', 'Request Created'),
      subtitle: t('Muestras registradas pendientes por ingresar a laboratorio', 'Newly registered samples'),
      count: columna1SolicitudCreada.length,
      items: columna1SolicitudCreada,
      colorHeader: 'bg-[#2B2B2E] text-[#FBF8F2] border-[#424246]',
      colorBadge: 'bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/40',
      icon: FilePlus,
      accentBorder: 'border-l-4 border-l-[#AA9E80]'
    },
    {
      id: 'evaluado',
      title: t('Evaluado Lab', 'Lab Evaluated'),
      subtitle: t('Ensayos físico-mecánicos y de color en ejecución', 'Physical-mechanical tests in progress'),
      count: columna2EvaluadoLab.length,
      items: columna2EvaluadoLab,
      colorHeader: 'bg-[#2B2B2E] text-[#C6A466] border-[#424246]',
      colorBadge: 'bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/40',
      icon: FlaskConical,
      accentBorder: 'border-l-4 border-l-[#C6A466]'
    },
    {
      id: 'aprobado_hallazgo',
      title: t('Aprobado / Hallazgo', 'Approved / Finding'),
      subtitle: t('Dictamen técnico emitido: Liberado para producción o con observación', 'Technical verdict: Approved or with finding'),
      count: columna3AprobadoHallazgo.length,
      items: columna3AprobadoHallazgo,
      colorHeader: 'bg-[#2B2B2E] text-[#FBF8F2] border-[#424246]',
      colorBadge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      icon: CheckCircle2,
      accentBorder: 'border-l-4 border-l-emerald-500'
    },
    {
      id: 'rechazado',
      title: t('Rechazado', 'Rejected'),
      subtitle: t('Muestras fuera de tolerancia NTC devueltas a compras / proveedor', 'Samples out of tolerance returned to supplier'),
      count: columna4Rechazado.length,
      items: columna4Rechazado,
      colorHeader: 'bg-[#2B2B2E] text-[#FBF8F2] border-[#424246]',
      colorBadge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
      icon: XCircle,
      accentBorder: 'border-l-4 border-l-rose-500'
    }
  ];

  return (
    <div className="bg-[#2D2D30] border border-[#424246] rounded-3xl p-6 shadow-sm space-y-6 font-sans select-none animate-fade-in">
      
      {/* Kanban Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#424246] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2B2B2E] text-[#C6A466] border border-[#C6A466]/40 flex items-center justify-center shadow-md">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#FBF8F2] font-serif tracking-wide">
              {t('Flujo Kanban de Trazabilidad Técnica', 'Technical Traceability Kanban Flow')}
            </h3>
            <p className="text-xs text-[#AA9E80] font-medium">
              {t('Tablero de flujo operativo: Solicitud Creada → Evaluado Lab → Aprobado / Hallazgo → Rechazado', 'Operational workflow: Created → Evaluated → Approved/Finding → Rejected')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 bg-[#2B2B2E] text-[#C6A466] border border-[#C6A466]/40 rounded-full font-bold">
            {muestras.length} {t('Lotes Activos', 'Active Batches')}
          </span>
        </div>
      </div>

      {/* Grid Kanban (4 Columnas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columnasDef.map((col) => {
          const IconCol = col.icon;

          return (
            <div 
              key={col.id}
              className="bg-[#2B2B2E] border border-[#424246] rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xs min-h-[480px]"
            >
              {/* Header Columna */}
              <div className={`p-4 border-b flex items-center justify-between ${col.colorHeader}`}>
                <div className="flex items-center gap-2">
                  <IconCol className="w-4 h-4" />
                  <h4 className="font-extrabold text-xs uppercase tracking-wider font-mono">
                    {col.title}
                  </h4>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono border ${col.colorBadge}`}>
                  {col.count}
                </span>
              </div>

              {/* Lista de Tarjetas en Columna */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[520px] custom-vertical-scroll">
                {col.items.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-center p-4 bg-[#2D2D30] rounded-xl border border-dashed border-[#424246] text-xs text-[#AA9E80]">
                    {t('Sin solicitudes en este estado', 'No requests in this status')}
                  </div>
                ) : (
                  col.items.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleCardClick(m)}
                      className={`bg-[#2D2D30] border border-[#424246] hover:border-[#C6A466] rounded-xl p-3 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2 group ${col.accentBorder}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2 py-0.5 bg-[#2B2B2E] text-[#C6A466] text-[9px] font-black font-mono rounded border border-[#424246]">
                            {m.codigoMT || m.id}
                          </span>
                          <span className="text-[10px] text-[#AA9E80] font-bold block mt-1">
                            {m.tipoMaterial}
                          </span>
                        </div>
                        <span className="text-[10px] font-extrabold font-mono text-[#AA9E80] bg-[#2B2B2E] px-2 py-0.5 rounded border border-[#424246]">
                          {m.marca}
                        </span>
                      </div>

                      <strong className="text-xs font-black text-[#FBF8F2] block line-clamp-2 group-hover:text-[#C6A466] transition-colors">
                        {m.referencia}
                      </strong>

                      <div className="bg-[#2B2B2E] p-2 rounded-lg border border-[#424246] text-[10px] font-mono text-[#AA9E80] space-y-0.5">
                        <div className="truncate">
                          <span className="font-sans font-bold uppercase text-[9px]">Prov:</span> {m.proveedor}
                        </div>
                        {m.trazabilidad?.laboratorio?.responsable && (
                          <div className="truncate flex items-center gap-1 text-[#FBF8F2] font-bold">
                            <UserCheck className="w-3 h-3 text-[#C6A466]" />
                            <span>{m.trazabilidad.laboratorio.responsable}</span>
                          </div>
                        )}
                      </div>

                      {/* Botones para Mover Estado Rápidamente */}
                      <div className="pt-2 border-t border-[#424246] flex items-center justify-between text-[9px] font-mono">
                        <span className="text-[#AA9E80]">{m.fechaIngreso}</span>
                        
                        <div className="flex items-center gap-1">
                          {col.id === 'creada' && (
                            <button
                              type="button"
                              onClick={(e) => handleMoverEstado(e, m.id, 'EN_PROCESO')}
                              className="px-2 py-0.5 bg-[#2B2B2E] text-[#C6A466] hover:bg-[#3A3A3D] border border-[#C6A466]/40 rounded text-[9px] font-bold uppercase cursor-pointer"
                              title="Iniciar Ensayos en Lab"
                            >
                              → Lab
                            </button>
                          )}
                          {col.id === 'evaluado' && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleMoverEstado(e, m.id, 'APROBADO')}
                                className="px-2 py-0.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded text-[9px] font-bold uppercase cursor-pointer"
                                title="Aprobar Ensayo"
                              >
                                ✓ Aat.
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleMoverEstado(e, m.id, 'RECHAZADO')}
                                className="px-2 py-0.5 bg-rose-700 text-white hover:bg-rose-800 rounded text-[9px] font-bold uppercase cursor-pointer"
                                title="Rechazar Ensayo"
                              >
                                ✕ Rec.
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
