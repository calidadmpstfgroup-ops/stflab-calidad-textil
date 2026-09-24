import React from 'react';
import { useQuality } from '../../context/QualityContext';
import { useLanguage } from '../../context/LanguageContext';
import { exportarAExcel, exportarACSV } from '../../utils/exportUtils';
import { 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  Tag, 
  CheckSquare, 
  RotateCcw, 
  FileSpreadsheet, 
  FileText,
  AlertTriangle,
  Clock,
  X,
  Sparkles
} from 'lucide-react';

export const FiltersBar: React.FC = () => {
  const { 
    filtros, 
    setFiltros, 
    resetearFiltros, 
    muestrasFiltradas, 
    listaProveedoresUnicos, 
    listaMarcasUnicas 
  } = useQuality();
  const { t } = useLanguage();

  const handleRangoFechaChange = (val: 'TODOS' | 'HOY' | 'ULTIMOS_5_DIAS' | 'ULTIMOS_7_DIAS' | 'ESTE_MES' | 'PERSONALIZADO') => {
    setFiltros((prev) => ({
      ...prev,
      rangoFecha: val,
      fechaInicio: val === 'PERSONALIZADO' ? prev.fechaInicio : '',
      fechaFin: val === 'PERSONALIZADO' ? prev.fechaFin : '',
    }));
  };

  const hayFiltrosActivos = 
    filtros.busqueda !== '' ||
    filtros.rangoFecha !== 'TODOS' ||
    filtros.proveedor !== 'TODOS' ||
    filtros.marca !== 'TODAS' ||
    filtros.dictamen !== 'TODOS' ||
    filtros.soloAlertasLeadTime;

  const botonesFechaRapida = [
    { id: 'HOY', label: t('Por Día (Hoy)', 'By Day (Today)'), icon: '📅' },
    { id: 'ULTIMOS_5_DIAS', label: t('Últimos 5 Días', 'Last 5 Days'), icon: '🗓️' },
    { id: 'ESTE_MES', label: t('Por Mes', 'By Month'), icon: '📆' },
    { id: 'TODOS', label: t('Todas las Fechas', 'All Dates'), icon: '🌍' }
  ] as const;

  return (
    <div className="bg-[#2D2D30] border border-[#424246] rounded-3xl p-5 shadow-sm space-y-4 font-sans select-none animate-fade-in">
      
      {/* Fila Principal: Botones de Rango de Fecha Rápido (Por Día / Últimos 5 Días / Por Mes) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#2B2B2E] p-3 rounded-2xl border border-[#424246]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#C6A466]" />
          <span className="text-xs font-black uppercase text-[#FBF8F2] font-mono tracking-wider">
            {t('Filtro de Período:', 'Time Period Filter:')}
          </span>
        </div>

        {/* Selector de Píldoras de Período */}
        <div className="flex flex-wrap items-center gap-2">
          {botonesFechaRapida.map((btn) => {
            const esActivo = filtros.rangoFecha === btn.id;

            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleRangoFechaChange(btn.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer font-mono ${
                  esActivo
                    ? 'bg-[#C6A466] text-[#2B2B2E] font-black shadow-sm'
                    : 'bg-[#2D2D30] text-[#AA9E80] border border-[#424246] hover:text-[#FBF8F2]'
                }`}
              >
                <span>{btn.icon}</span>
                <span>{btn.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => handleRangoFechaChange('PERSONALIZADO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer font-mono ${
              filtros.rangoFecha === 'PERSONALIZADO'
                ? 'bg-[#C6A466] text-[#2B2B2E] font-black'
                : 'bg-[#2D2D30] text-[#AA9E80] border border-[#424246] hover:text-[#FBF8F2]'
            }`}
          >
            ⚙️ {t('Personalizado...', 'Custom...')}
          </button>
        </div>
      </div>

      {/* Fila 2: Búsqueda Rápida + Acciones de Exportación */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        
        {/* Buscador Global Predictivo */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AA9E80]" />
          <input
            type="text"
            value={filtros.busqueda}
            onChange={(e) => setFiltros((prev) => ({ ...prev, busqueda: e.target.value }))}
            placeholder={t('Búsqueda por código MT, reporte, tela, proveedor o lote...', 'Search by MT code, report, fabric, supplier...')}
            className="w-full pl-10 pr-10 py-2.5 bg-[#2B2B2E] border border-[#424246] rounded-xl text-xs sm:text-sm font-bold text-[#FBF8F2] placeholder-[#AA9E80]/70 focus:outline-none focus:border-[#C6A466] transition-all shadow-2xs"
          />
          {filtros.busqueda && (
            <button
              onClick={() => setFiltros((prev) => ({ ...prev, busqueda: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AA9E80] hover:text-[#FBF8F2]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Botones de Exportación */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
          <button
            onClick={() => exportarAExcel(muestrasFiltradas)}
            title="Exportar registros filtrados a Excel (.xlsx)"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('Exportar Excel', 'Export Excel')}</span>
          </button>

          <button
            onClick={() => exportarACSV(muestrasFiltradas)}
            title="Exportar registros filtrados a CSV"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#2B2B2E] hover:bg-[#3A3A3D] text-[#C6A466] border border-[#C6A466]/40 font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>CSV</span>
          </button>

          {hayFiltrosActivos && (
            <button
              onClick={resetearFiltros}
              title="Limpiar todos los filtros"
              className="flex items-center gap-1 px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('Limpiar', 'Reset')}</span>
            </button>
          )}
        </div>

      </div>

      {/* Fila 3: Filtros Selectores Multicriterio */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2 border-t border-[#424246] text-xs">
        
        {/* Proveedor */}
        <div className="flex items-center gap-1.5 bg-[#2B2B2E] px-3 py-2 rounded-xl border border-[#424246]">
          <Building2 className="w-3.5 h-3.5 text-[#C6A466] shrink-0" />
          <select
            value={filtros.proveedor}
            onChange={(e) => setFiltros((prev) => ({ ...prev, proveedor: e.target.value }))}
            className="bg-transparent text-[#FBF8F2] font-bold w-full focus:outline-none cursor-pointer truncate text-xs"
          >
            <option value="TODOS" className="bg-[#2B2B2E] text-[#FBF8F2]">{t('Todos los Proveedores', 'All Suppliers')}</option>
            {listaProveedoresUnicos.map((prov) => (
              <option key={prov} value={prov} className="bg-[#2B2B2E] text-[#FBF8F2]">{prov}</option>
            ))}
          </select>
        </div>

        {/* Marca */}
        <div className="flex items-center gap-1.5 bg-[#2B2B2E] px-3 py-2 rounded-xl border border-[#424246]">
          <Tag className="w-3.5 h-3.5 text-[#C6A466] shrink-0" />
          <select
            value={filtros.marca}
            onChange={(e) => setFiltros((prev) => ({ ...prev, marca: e.target.value }))}
            className="bg-transparent text-[#FBF8F2] font-bold w-full focus:outline-none cursor-pointer text-xs"
          >
            <option value="TODAS" className="bg-[#2B2B2E] text-[#FBF8F2]">{t('Todas las Marcas', 'All Brands')}</option>
            {listaMarcasUnicas.map((marca) => (
              <option key={marca} value={marca} className="bg-[#2B2B2E] text-[#FBF8F2]">{marca}</option>
            ))}
          </select>
        </div>

        {/* Dictamen Final */}
        <div className="flex items-center gap-1.5 bg-[#2B2B2E] px-3 py-2 rounded-xl border border-[#424246]">
          <CheckSquare className="w-3.5 h-3.5 text-[#C6A466] shrink-0" />
          <select
            value={filtros.dictamen}
            onChange={(e) => setFiltros((prev) => ({ ...prev, dictamen: e.target.value }))}
            className="bg-transparent text-[#FBF8F2] font-bold w-full focus:outline-none cursor-pointer text-xs"
          >
            <option value="TODOS" className="bg-[#2B2B2E] text-[#FBF8F2]">{t('Todos los Dictámenes', 'All Verdicts')}</option>
            <option value="APROBADO" className="bg-[#2B2B2E] text-[#FBF8F2]">{t('Aprobado', 'Approved')}</option>
            <option value="HALLAZGO" className="bg-[#2B2B2E] text-[#FBF8F2]">{t('Con Hallazgo', 'With Finding')}</option>
            <option value="RECHAZADO" className="bg-[#2B2B2E] text-[#FBF8F2]">{t('Rechazado', 'Rejected')}</option>
            <option value="EN_PROCESO" className="bg-[#2B2B2E] text-[#FBF8F2]">{t('En Proceso', 'In Progress')}</option>
          </select>
        </div>

        {/* Toggle Alertas Lead Time */}
        <button
          onClick={() => setFiltros((prev) => ({ ...prev, soloAlertasLeadTime: !prev.soloAlertasLeadTime }))}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-extrabold border transition-colors cursor-pointer text-xs ${
            filtros.soloAlertasLeadTime
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-[#2B2B2E] text-[#AA9E80] border-[#424246] hover:text-[#FBF8F2]'
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${filtros.soloAlertasLeadTime ? 'text-rose-400' : 'text-[#C6A466]'}`} />
          <span>{t('Lead Time > 2d', 'Lead Time > 2d')}</span>
        </button>

      </div>

      {/* Inputs para fecha personalizada si se seleccionó */}
      {filtros.rangoFecha === 'PERSONALIZADO' && (
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs bg-[#2B2B2E] p-3 rounded-2xl border border-[#424246]">
          <span className="text-[#FBF8F2] font-extrabold">{t('Rango personalizado:', 'Custom range:')}</span>
          <div className="flex items-center gap-2">
            <label className="text-[#AA9E80] font-bold">{t('Desde:', 'From:')}</label>
            <input
              type="date"
              value={filtros.fechaInicio || ''}
              onChange={(e) => setFiltros((prev) => ({ ...prev, fechaInicio: e.target.value }))}
              className="bg-[#2D2D30] border border-[#424246] rounded-xl px-2.5 py-1 text-[#FBF8F2] font-bold focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[#AA9E80] font-bold">{t('Hasta:', 'To:')}</label>
            <input
              type="date"
              value={filtros.fechaFin || ''}
              onChange={(e) => setFiltros((prev) => ({ ...prev, fechaFin: e.target.value }))}
              className="bg-[#2D2D30] border border-[#424246] rounded-xl px-2.5 py-1 text-[#FBF8F2] font-bold focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-xs text-[#AA9E80] px-1 pt-1 font-mono">
        <span>{t('Mostrando', 'Showing')} <strong className="text-[#C6A466]">{muestrasFiltradas.length}</strong> {t('muestras filtradas', 'filtered samples')}</span>
        {hayFiltrosActivos && (
          <span className="text-[#C6A466] font-extrabold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> {t('Filtros aplicados', 'Filters applied')}
          </span>
        )}
      </div>

    </div>
  );
};
