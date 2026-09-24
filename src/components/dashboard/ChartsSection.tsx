import React from 'react';
import { useQuality } from '../../context/QualityContext';
import { useLanguage } from '../../context/LanguageContext';
import { MoreHorizontal, FlaskConical } from 'lucide-react';

export const ChartsSection: React.FC = () => {
  const { muestras } = useQuality();
  const { t } = useLanguage();

  const total = muestras.length;
  const fisicosCount = muestras.filter(m => m.dictamenFinal === 'APROBADO' || m.dictamenFinal === 'HALLAZGO' || m.dictamenFinal === 'RECHAZADO').length;
  const fisicosAprobados = muestras.filter(m => m.dictamenFinal === 'APROBADO').length;
  const fisicosRate = fisicosCount > 0 ? ((fisicosAprobados / fisicosCount) * 100).toFixed(1) : '0.0';

  const solidezCount = muestras.filter(m => m.dictamenFinal === 'APROBADO' || m.dictamenFinal === 'HALLAZGO').length;
  const solidezAprobadas = muestras.filter(m => m.dictamenFinal === 'APROBADO').length;
  const solidezRate = solidezCount > 0 ? ((solidezAprobadas / solidezCount) * 100).toFixed(1) : '0.0';

  return (
    <div className="w-full font-sans select-none animate-fade-in">
      
      {/* CARD UNICA: Rendimiento de Laboratorio */}
      <div className="bg-[#2D2D30] border border-[#424246] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#424246]">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#C6A466]" />
              <h3 className="text-base font-bold text-[#FBF8F2]">
                {t('Rendimiento de Laboratorio', 'Lab Performance')}
              </h3>
            </div>
            <button type="button" className="text-[#AA9E80] hover:text-[#C6A466] cursor-pointer transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="bg-[#2B2B2E] text-[#C6A466] font-extrabold uppercase text-[10px] border-b border-[#424246] tracking-wider">
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4 text-right">Rendimiento (Lotes)</th>
                  <th className="py-3 px-4 text-right">Conformidad (%)</th>
                  <th className="py-3 px-4 text-right">Estado SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#424246] text-[#FBF8F2] font-medium bg-[#2D2D30]">
                <tr className="hover:bg-[#2B2B2E] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#FBF8F2]">Ensayos Físicos & Encogimiento</td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#FBF8F2]">{fisicosCount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#C6A466]">{fisicosRate}%</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${fisicosCount > 0 ? 'bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/30' : 'bg-[#2B2B2E] text-[#AA9E80]'}`}>
                      {fisicosCount > 0 ? 'ÓPTIMO' : 'SIN REGISTROS'}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#2B2B2E] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#FBF8F2]">Pruebas de Solidez & Frote</td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#FBF8F2]">{solidezCount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#C6A466]">{solidezRate}%</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${solidezCount > 0 ? 'bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/30' : 'bg-[#2B2B2E] text-[#AA9E80]'}`}>
                      {solidezCount > 0 ? 'ÓPTIMO' : 'SIN REGISTROS'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
