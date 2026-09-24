import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useLanguage } from '../../context/LanguageContext';
import { DictamenType } from '../../types';
import { 
  Filter, 
  Search, 
  Edit2, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  History, 
  User, 
  Calendar 
} from 'lucide-react';

export const TraceabilityTable: React.FC = () => {
  const { muestrasFiltradas, setMuestraSeleccionada, setModalFichaAbierto } = useQuality();
  const { t } = useLanguage();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 8;

  const itemsFiltrados = muestrasFiltradas.filter(m => {
    const q = busqueda.toLowerCase().trim();
    const matchCod = (m.codigoMT || m.id || '').toLowerCase().includes(q);
    const matchRef = (m.referencia || '').toLowerCase().includes(q);
    const matchProv = (m.proveedor || '').toLowerCase().includes(q);
    const matchMat = (m.tipoMaterial || '').toLowerCase().includes(q);

    const matchTexto = !q || matchCod || matchRef || matchProv || matchMat;
    if (!matchTexto) return false;

    if (filtroEstado === 'TODOS') return true;
    const dict = m.dictamenFinal || 'PENDIENTE';
    return dict.toUpperCase() === filtroEstado.toUpperCase();
  });

  const totalPaginas = Math.ceil(itemsFiltrados.length / itemsPorPagina) || 1;
  const itemsPagina = itemsFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const getStatusBadge = (d: string) => {
    if (d === 'APROBADO' || d === 'COMPLETADO') {
      return (
        <span className="px-3 py-1 rounded-2xl text-[10px] font-extrabold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase inline-flex items-center gap-1 shadow-2xs">
          {t('Aprobado', 'Approved')}
        </span>
      );
    }
    if (d === 'RECHAZADO') {
      return (
        <span className="px-3 py-1 rounded-2xl text-[10px] font-extrabold tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase inline-flex items-center gap-1 shadow-2xs">
          {t('Rechazado', 'Rejected')}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-2xl text-[10px] font-extrabold tracking-wider bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/40 uppercase inline-flex items-center gap-1 shadow-2xs">
        {t('Pendiente', 'Pending')}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans select-none">
      
      {/* Main Table Card (75% / 8 Cols) */}
      <div className="lg:col-span-8 bg-[#2D2D30] border border-[#424246] rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
        
        <div>
          {/* Card Header & Tools */}
          <div className="p-5 border-b border-[#424246] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#2B2B2E]">
            <h2 className="text-base font-extrabold text-[#FBF8F2] font-display">
              {t('Estado de Evaluación de Muestras Textiles', 'Textile Sample Evaluation Status')}
            </h2>

            <div className="flex items-center gap-2">
              {/* Filter Button */}
              <button
                type="button"
                onClick={() => {
                  const estados = ['TODOS', 'APROBADO', 'PENDIENTE', 'RECHAZADO'];
                  const idx = estados.indexOf(filtroEstado);
                  setFiltroEstado(estados[(idx + 1) % estados.length]);
                }}
                className="px-3 py-1.5 bg-[#2D2D30] border border-[#424246] rounded-xl text-xs font-bold text-[#FBF8F2] hover:bg-[#3A3A3D] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5 text-[#C6A466]" />
                <span>{t('Filtrar', 'Filter')}: {filtroEstado}</span>
              </button>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#AA9E80] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder={t('Buscar muestra...', 'Search...')}
                  className="pl-8 pr-3 py-1.5 bg-[#2D2D30] border border-[#424246] rounded-xl text-xs font-bold text-[#FBF8F2] placeholder-[#AA9E80]/70 focus:outline-none focus:border-[#C6A466] transition-all w-36 sm:w-48 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#2B2B2E] text-[#C6A466] font-extrabold border-b border-[#424246] text-[11px] tracking-wide uppercase">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">
                    <input type="checkbox" className="rounded border-[#424246] bg-[#2B2B2E] accent-[#C6A466]" />
                  </th>
                  <th className="py-3 px-4 font-extrabold">{t('ID Muestra ↕', 'Sample ID ↕')}</th>
                  <th className="py-3 px-4 font-extrabold">{t('Referencia / Nombre ↕', 'Sample Name ↕')}</th>
                  <th className="py-3 px-4 font-extrabold">{t('Material ↕', 'Material ↕')}</th>
                  <th className="py-3 px-4 font-extrabold">{t('Proveedor ↕', 'Supplier ↕')}</th>
                  <th className="py-3 px-4 font-extrabold">{t('Tipo de Evaluación ↕', 'Evaluation Type ↕')}</th>
                  <th className="py-3 px-4 text-center font-extrabold">{t('Estado / Dictamen ↕', 'Status ↕')}</th>
                  <th className="py-3 px-4 text-center font-extrabold">{t('Acciones', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#424246] bg-[#2D2D30]">
                {itemsPagina.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-[#AA9E80] font-medium">
                      {t('No hay muestras registradas en este estado.', 'No samples registered in this status.')}
                    </td>
                  </tr>
                ) : (
                  itemsPagina.map((muestra, idx) => (
                    <tr
                      key={muestra.id}
                      onClick={() => {
                        setMuestraSeleccionada(muestra);
                        setModalFichaAbierto(true);
                      }}
                      className="hover:bg-[#2B2B2E] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-[#424246] accent-[#C6A466]" />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#C6A466]">
                        {muestra.codigoMT || `500000${idx}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#FBF8F2]">
                        {muestra.referencia || `Muestra #${idx + 1}`}
                      </td>
                      <td className="py-3.5 px-4 text-[#AA9E80]">
                        {muestra.tipoMaterial || t('Material Textil', 'Textile Material')}
                      </td>
                      <td className="py-3.5 px-4 text-[#AA9E80]">
                        {muestra.proveedor || 'STF Group Supplier'}
                      </td>
                      <td className="py-3.5 px-4 text-[#AA9E80]">
                        {t('Ensayo Físico & Encogimiento', 'Physical & Shrinkage Test')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(muestra.dictamenFinal || 'PENDIENTE')}
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setMuestraSeleccionada(muestra);
                              setModalFichaAbierto(true);
                            }}
                            className="p-1 text-[#AA9E80] hover:text-[#C6A466] transition-colors"
                            title={t('Editar Muestra', 'Edit Sample')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMuestraSeleccionada(muestra);
                              setModalFichaAbierto(true);
                            }}
                            className="p-1 text-[#AA9E80] hover:text-[#C6A466] transition-colors"
                            title={t('Opciones de Auditoría', 'Audit Options')}
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Pagination Bar */}
        <div className="p-4 border-t border-[#424246] flex items-center justify-between text-xs text-[#AA9E80] bg-[#2B2B2E]">
          <span>{t('Mostrando', 'Showing')} 1-{itemsPagina.length} {t('de', 'of')} {itemsFiltrados.length}</span>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
              className="p-1.5 bg-[#2D2D30] border border-[#424246] text-[#FBF8F2] rounded-lg disabled:opacity-40 hover:bg-[#3A3A3D] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-[#FBF8F2] px-2">{paginaActual} {t('de', 'of')} {totalPaginas}</span>
            <button
              type="button"
              disabled={paginaActual >= totalPaginas}
              onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
              className="p-1.5 bg-[#2D2D30] border border-[#424246] text-[#FBF8F2] rounded-lg disabled:opacity-40 hover:bg-[#3A3A3D] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Side Widgets (25% / 4 Cols) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Widget 1: Recent Activity */}
        <div className="bg-[#2D2D30] border border-[#424246] rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#FBF8F2] font-display">
            {t('Actividad Reciente', 'Recent Activity')}
          </h3>

          <div className="space-y-4">
            {/* Timeline Item 1 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C6A466]/20 text-[#C6A466] flex items-center justify-center shrink-0 border border-[#C6A466]/40">
                <History className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <strong className="text-[#FBF8F2] font-bold block">
                  {t('Ensayo de encogimiento registrado en laboratorio', 'Shrinkage test recorded in lab')}
                </strong>
                <span className="text-[#AA9E80] text-[11px] block mt-0.5 font-mono">
                  {t('Hace 17 horas', '17 hours ago')}
                </span>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/40">
                <User className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <strong className="text-[#FBF8F2] font-bold block">
                  {t('Nuevo analista asignado al equipo STFLab', 'New analyst assigned to STFLab team')}
                </strong>
                <span className="text-[#AA9E80] text-[11px] block mt-0.5 font-mono">
                  {t('Hace 3 meses', '3 months ago')}
                </span>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C6A466]/20 text-[#C6A466] flex items-center justify-center shrink-0 border border-[#C6A466]/40">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <strong className="text-[#FBF8F2] font-bold block">
                  {t('Emisión de dictamen aprobatorio para patronaje', 'Approval verdict issued for pattern team')}
                </strong>
                <span className="text-[#AA9E80] text-[11px] block mt-0.5 font-mono">
                  {t('Hace 2 horas', '2 hours ago')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 2: Upcoming Deadlines */}
        <div className="bg-[#2D2D30] border border-[#424246] rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#FBF8F2] font-display">
            {t('Próximos Vencimientos', 'Upcoming Deadlines')}
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-[#2B2B2E] rounded-xl border border-[#424246]">
              <strong className="text-[#FBF8F2] font-bold block">{t('Vencimiento Ensayos Denim', 'Denim Test Deadline')}</strong>
              <span className="text-[#AA9E80] text-[11px] block font-mono">19 de Septiembre, 2026 • {t('Hace 6 horas', '6 hours ago')}</span>
            </div>

            <div className="p-3 bg-[#2B2B2E] rounded-xl border border-[#424246]">
              <strong className="text-[#FBF8F2] font-bold block">{t('Revisión Ficha Técnica Tela Punto', 'Knit Fabric Spec Review')}</strong>
              <span className="text-[#AA9E80] text-[11px] block font-mono">25 de Septiembre, 2026 • {t('Hace 11 horas', '11 hours ago')}</span>
            </div>

            <div className="p-3 bg-[#2B2B2E] rounded-xl border border-[#424246]">
              <strong className="text-[#FBF8F2] font-bold block">{t('Verificación Solidez de Color', 'Color Fastness Verification')}</strong>
              <span className="text-[#AA9E80] text-[11px] block font-mono">28 de Septiembre, 2026 • {t('Hace 20 horas', '20 hours ago')}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
