import React from 'react';
import { useQuality } from '../../context/QualityContext';
import { useLanguage } from '../../context/LanguageContext';

export const KpiCards: React.FC = () => {
  const { kpis, muestras, setFiltros } = useQuality();
  const { t } = useLanguage();

  const totalMuestras = muestras.length;
  const proveedoresUnicos = new Set(muestras.map(m => m.proveedor).filter(Boolean)).size;
  const muestrasAprobadas = muestras.filter(m => m.dictamenFinal === 'APROBADO').length;
  const tasaConformidad = totalMuestras > 0 ? Math.round((muestrasAprobadas / totalMuestras) * 100) : 0;
  const totalHallazgosAlertas = muestras.filter(m => m.dictamenFinal === 'HALLAZGO' || m.dictamenFinal === 'RECHAZADO').length;
  const leadTimePromedio = totalMuestras > 0 ? (kpis.leadTimePromedioDias || 1.5) : 0;

  const currentYearMonth = new Date().toISOString().substring(0, 7);
  const informesMes = muestras.filter(m => m.fechaIngreso && m.fechaIngreso.startsWith(currentYearMonth)).length;

  const cardsData = [
    {
      id: 'muestras-evaluadas',
      title: t('Muestras Evaluadas', 'Evaluated Samples'),
      value: `${totalMuestras}`,
      subtitle: `${proveedoresUnicos} ${t('proveedores activos en lab', 'active suppliers in lab')}`,
      badgeText: totalMuestras > 0 ? 'ACTIVO' : 'SIN DATOS',
      badgeClass: totalMuestras > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-[#2B2B2E] text-[#AA9E80]',
      actionFilter: () => setFiltros(prev => ({ ...prev, dictamen: 'TODOS' }))
    },
    {
      id: 'conformidad-stf',
      title: t('Tasa de Conformidad', 'Conformity Rate'),
      value: `${tasaConformidad}%`,
      subtitle: t('Conformidad Especificación STF', 'STF Spec Compliance'),
      badgeText: tasaConformidad > 0 ? 'EXITO' : 'SIN DATOS',
      badgeClass: tasaConformidad > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-[#2B2B2E] text-[#AA9E80]',
      actionFilter: () => setFiltros(prev => ({ ...prev, dictamen: 'APROBADO' }))
    },
    {
      id: 'alertas-hallazgos',
      title: t('Alertas y Hallazgos', 'Alerts & Findings'),
      value: `${totalHallazgosAlertas}`,
      subtitle: t('Hallazgos técnicos + Lead time', 'Technical findings + Lead time'),
      badgeText: totalHallazgosAlertas > 0 ? 'ALERTA' : 'AL DIA',
      badgeClass: totalHallazgosAlertas > 0 ? 'bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/30' : 'bg-emerald-500/20 text-emerald-300',
      actionFilter: () => setFiltros(prev => ({ ...prev, dictamen: 'HALLAZGO' }))
    },
    {
      id: 'tiempo-respuesta',
      title: t('Tiempo de Respuestas', 'Response Time'),
      value: `${leadTimePromedio}d`,
      subtitle: t('Meta operativa < 2.0 días', 'Operational target < 2.0 days'),
      badgeText: 'SLA',
      badgeClass: 'bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/30',
      actionFilter: () => setFiltros(prev => ({ ...prev, soloAlertasLeadTime: false }))
    },
    {
      id: 'informes-calidad',
      title: t('Informes de Calidad', 'Quality Reports'),
      value: `${informesMes}`,
      subtitle: t('Generados Este Mes', 'Generated This Month'),
      badgeText: 'REPORTE',
      badgeClass: 'bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/30',
      actionFilter: () => setFiltros(prev => ({ ...prev, soloAlertasLeadTime: false }))
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 font-sans select-none animate-fade-in">
      {cardsData.map((card) => {
        return (
          <div 
            key={card.id}
            onClick={card.actionFilter}
            className="bg-[#2D2D30] border border-[#424246] hover:border-[#C6A466] rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#FBF8F2] tracking-tight group-hover:text-[#C6A466] transition-colors">
                {card.title}
              </h3>
              
              <div className="mt-2.5 sm:mt-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#C6A466] font-sans tracking-tight block">
                  {card.value}
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#AA9E80] mt-0.5 sm:mt-1 block truncate">
                  {card.subtitle}
                </span>
              </div>
            </div>

            <div className="mt-4 sm:mt-5 flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold ${card.badgeClass}`}>
                <span className="opacity-70 mr-1 font-normal">Status:</span> {card.badgeText}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
