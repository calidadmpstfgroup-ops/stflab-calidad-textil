import React from 'react';
import { useQuality } from '../../context/QualityContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Folder, 
  FlaskConical, 
  FileCheck, 
  ShieldCheck, 
  XCircle,
  ChevronRight 
} from 'lucide-react';

export const KpiCards: React.FC = () => {
  const { muestras, totalComprasTelas, pendientesLabTotal, setFiltros, navegarA, setAreaActual } = useQuality();
  const { t } = useLanguage();

  const totalMuestras = muestras.length;
  const muestrasAprobadas = muestras.filter(m => m.dictamenFinal === 'APROBADO').length;
  const muestrasRechazadas = muestras.filter(m => m.dictamenFinal === 'RECHAZADO').length;

  const cardsData = [
    {
      id: 'compras',
      title: t('Solicitudes de Compras', 'Purchase Requests'),
      value: totalComprasTelas,
      statusLabel: t('Pendientes', 'Pending'),
      statusColor: 'text-sky-600 dark:text-sky-400',
      icon: <Folder className="w-5 h-5 text-sky-500" />,
      iconBg: 'bg-sky-100 dark:bg-sky-950/60 border border-sky-200/50 dark:border-sky-800/40',
      action: () => navegarA('compras', 'telas')
    },
    {
      id: 'ensayos',
      title: t('Ensayos', 'Tests'),
      value: pendientesLabTotal,
      statusLabel: t('En proceso', 'In process'),
      statusColor: 'text-purple-600 dark:text-purple-400',
      icon: <FlaskConical className="w-5 h-5 text-purple-500" />,
      iconBg: 'bg-purple-100 dark:bg-purple-950/60 border border-purple-200/50 dark:border-purple-800/40',
      action: () => navegarA('laboratorio', 'telas')
    },
    {
      id: 'resultados',
      title: t('Resultados Registrados', 'Registered Results'),
      value: totalMuestras,
      statusLabel: t('Completados', 'Completed'),
      statusColor: 'text-emerald-600 dark:text-emerald-400',
      icon: <FileCheck className="w-5 h-5 text-emerald-500" />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/40',
      action: () => setFiltros(prev => ({ ...prev, dictamen: 'TODOS' }))
    },
    {
      id: 'aprobadas',
      title: t('Telas Aprobadas', 'Approved Fabrics'),
      value: muestrasAprobadas,
      statusLabel: t('Aprobadas', 'Approved'),
      statusColor: 'text-emerald-600 dark:text-emerald-400',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/40',
      action: () => setFiltros(prev => ({ ...prev, dictamen: 'APROBADO' }))
    },
    {
      id: 'rechazadas',
      title: t('Telas Rechazadas', 'Rejected Fabrics'),
      value: muestrasRechazadas,
      statusLabel: t('Rechazadas', 'Rejected'),
      statusColor: 'text-rose-600 dark:text-rose-400',
      icon: <XCircle className="w-5 h-5 text-rose-500" />,
      iconBg: 'bg-rose-100 dark:bg-rose-950/60 border border-rose-200/50 dark:border-rose-800/40',
      action: () => setFiltros(prev => ({ ...prev, dictamen: 'RECHAZADO' }))
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4 font-sans select-none animate-fade-in">
      {cardsData.map((card) => {
        return (
          <div 
            key={card.id}
            onClick={card.action}
            className="bg-white dark:bg-[#0f1b35] border border-slate-200/90 dark:border-[#1e3461] hover:border-[#00b4d8] dark:hover:border-[#00b4d8] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Cabecera de la tarjeta: Icono y Título */}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                {card.icon}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block truncate leading-tight">
                  {card.title}
                </span>

                {/* Número Grande Destacado */}
                <div className="mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    {card.value}
                  </span>
                </div>
              </div>
            </div>

            {/* Pie de la tarjeta: Estado y Flecha Chevron */}
            <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-[#17254e] flex items-center justify-between">
              <span className={`text-xs font-bold ${card.statusColor}`}>
                {card.statusLabel}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00b4d8] group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
