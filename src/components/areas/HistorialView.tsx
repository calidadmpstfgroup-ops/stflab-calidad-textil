import React, { useState } from 'react';
import { MuestraTextil } from '../../types';
import { useQuality } from '../../context/QualityContext';
import { Search, Download, Printer, Filter, Calendar, Tag, HardDrive } from 'lucide-react';

export const HistorialView: React.FC = () => {
  const { muestras } = useQuality();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterOutcome, setFilterOutcome] = useState('');

  const distinctSuppliers = Array.from(new Set(muestras.map(m => m.proveedor).filter(Boolean)));

  const filteredMuestras = muestras.filter((m) => {
    const matchesSearch = 
      (m.codigoReferencia || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.color.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSupplier = filterSupplier === '' || m.proveedor === filterSupplier;
    const matchesDate = filterDate === '' || (m.fechaIngreso || '').includes(filterDate);
    const matchesOutcome = filterOutcome === '' || m.dictamenFinal === filterOutcome;

    return matchesSearch && matchesSupplier && matchesDate && matchesOutcome;
  });

  const handleExportCSV = () => {
    const headers = ['Código', 'Referencia', 'Proveedor', 'Color', 'Lote', 'Fecha Ingreso', 'Dictamen Final', 'Observaciones'];
    const rows = filteredMuestras.map(m => [
      `"${m.codigoReferencia || m.id}"`,
      `"${m.referencia}"`,
      `"${m.proveedor}"`,
      `"${m.color}"`,
      `"${m.lote}"`,
      `"${m.fechaIngreso}"`,
      `"${m.dictamenFinal}"`,
      `"${(m.observacionesGenerales || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Historial_Ensayos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans animate-fade-in text-[#FBF8F2]">
      
      {/* Header */}
      <div className="bg-[#2D2D30] p-6 rounded-3xl border border-[#424246] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-bold text-[#FBF8F2] tracking-wide uppercase flex items-center">
              <HardDrive className="h-6 w-6 text-[#C6A466] mr-2.5" />
              Base de Datos e Historial de Ensayos
            </h2>
            <span className="text-[10px] bg-[#C6A466]/20 text-[#C6A466] font-bold px-2 py-0.5 rounded-full border border-[#C6A466]/30 uppercase tracking-wider">
              ARCHIVOS CENTRALIZADOS
            </span>
          </div>
          <p className="text-[#AA9E80] text-xs mt-1">
            Archivo centralizado con buscador multicriterio y exportación directa.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#485C3E] hover:bg-[#5A734E] text-[#FBF8F2] text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Excel (CSV)</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 bg-[#2B2B2E] hover:bg-[#424246] text-[#FBF8F2] border border-[#424246] text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="h-4 w-4 text-[#C6A466]" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-[#2D2D30] rounded-3xl p-5 border border-[#424246] shadow-sm space-y-4 print:hidden">
        <div className="flex items-center space-x-2 text-[#FBF8F2] border-b border-[#424246] pb-2">
          <Filter className="h-4 w-4 text-[#C6A466]" />
          <h3 className="font-serif font-bold text-xs uppercase tracking-wider">Buscador y Filtros Avanzados</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[10px] font-bold text-[#AA9E80] uppercase tracking-wide mb-1">Buscar por palabra clave</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#AA9E80]">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Referencia, proveedor, color, código..."
                className="block w-full pl-9 pr-3 py-2 border border-[#424246] rounded-xl text-xs bg-[#2B2B2E] text-[#FBF8F2] placeholder-[#AA9E80]/50 focus:outline-none focus:border-[#C6A466]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#AA9E80] uppercase tracking-wide mb-1">Proveedor</label>
            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="block w-full border border-[#424246] rounded-xl px-2.5 py-2 text-xs bg-[#2B2B2E] text-[#FBF8F2] focus:outline-none focus:border-[#C6A466]"
            >
              <option value="">Todos los Proveedores</option>
              {distinctSuppliers.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#AA9E80] uppercase tracking-wide mb-1">Dictamen</label>
            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value)}
              className="block w-full border border-[#424246] rounded-xl px-2.5 py-2 text-xs bg-[#2B2B2E] text-[#FBF8F2] focus:outline-none focus:border-[#C6A466]"
            >
              <option value="">Todos los Dictámenes</option>
              <option value="APROBADO">Aprobado</option>
              <option value="HALLAZGO">Hallazgo</option>
              <option value="RECHAZADO">Rechazado</option>
              <option value="EN_PROCESO">En Proceso</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="bg-[#2D2D30] rounded-3xl border border-[#424246] shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-vertical-scroll">
          <table className="min-w-full divide-y divide-[#424246] text-xs text-left">
            <thead>
              <tr className="bg-[#2B2B2E] text-[#AA9E80] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Lote / Consecutivo</th>
                <th className="py-3 px-4">Referencia de Tela</th>
                <th className="py-3 px-4">Proveedor / Color</th>
                <th className="py-3 px-4 text-center">Gramaje (g/m²)</th>
                <th className="py-3 px-4 text-center">Encogimiento (%)</th>
                <th className="py-3 px-4 text-center">Dictamen</th>
                <th className="py-3 px-4">Observaciones Técnicas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#424246] text-[#FBF8F2]">
              {filteredMuestras.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#AA9E80]">
                    No se encontraron registros que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredMuestras.map((m) => {
                  const elargo = m.ensayos?.encogimientoLargo?.valor ?? -2.5;
                  const gram = m.ensayos?.gramajeGsm?.valor ?? 220;

                  return (
                    <tr key={m.id} className="hover:bg-[#2B2B2E]/60 transition-colors">
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-[#FBF8F2] block">{m.lote}</span>
                        <span className="text-[10px] text-[#AA9E80]">{m.codigoReferencia || m.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#FBF8F2] block">{m.referencia}</span>
                        <span className="text-[10px] text-[#AA9E80]">{m.tipoMaterial}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold block">{m.proveedor}</span>
                        <span className="text-[10px] text-[#AA9E80]">{m.color}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#C6A466]">
                        {gram} g/m²
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#C6A466]">
                        {elargo}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          m.dictamenFinal === 'APROBADO' ? 'bg-[#EEF3EA] text-[#485C3E] border-[#94A786]' :
                          m.dictamenFinal === 'HALLAZGO' ? 'bg-[#F9F3E3] text-[#7A6428] border-[#DEC987]' :
                          m.dictamenFinal === 'RECHAZADO' ? 'bg-[#FAF0EC] text-[#8C3D35] border-[#DBA097]' :
                          'bg-[#2B2B2E] text-[#AA9E80] border-[#424246]'
                        }`}>
                          {m.dictamenFinal}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs italic text-[#AA9E80] max-w-xs truncate">
                        "{m.observacionesGenerales || 'Sin observaciones registradas.'}"
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
