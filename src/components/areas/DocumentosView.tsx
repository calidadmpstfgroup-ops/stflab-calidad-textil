import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  CheckCircle,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Trash2,
  FileDown,
  Sparkles
} from 'lucide-react';
import { Muestra } from '../../types';
import { useQuality } from '../../context/QualityContext';
import { generateCertificateHTML, evaluateMuestraParametros } from '../../utils/certificateGenerator';

export const DocumentosView: React.FC = () => {
  const { muestras } = useQuality();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYearLocal, setSelectedYearLocal] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  // Selected ficha for preview
  const [previewFicha, setPreviewFicha] = useState<any | null>(null);

  // ResizeObserver for scale
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [previewFicha]);

  const targetWidth = 820;
  const scale = containerWidth && containerWidth < targetWidth ? (containerWidth - 8) / targetWidth : 1;

  // Filter fichas
  const filteredFichas = (muestras || []).filter(f => {
    const term = searchTerm.toLowerCase();
    const ref = (f.referencia || '').toLowerCase();
    const prov = (f.proveedor || '').toLowerCase();
    const lote = ((f as any).nroLote || f.lote || '').toLowerCase();

    const matchesSearch = ref.includes(term) || prov.includes(term) || lote.includes(term);
    const year = f.fechaIngreso ? f.fechaIngreso.split('-')[0] : '2026';
    const matchesYear = selectedYearLocal === 'Todos' || year === selectedYearLocal;

    return matchesSearch && matchesYear;
  });

  useEffect(() => {
    if (filteredFichas.length > 0 && !previewFicha) {
      setPreviewFicha(filteredFichas[0]);
    }
  }, [muestras]);

  const triggerToast = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  };

  const handleDownloadPDF = (m: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      triggerToast('Habilite ventanas emergentes para abrir el reporte imprimible.');
      return;
    }
    printWindow.document.write(generateCertificateHTML(m));
    printWindow.document.close();
    printWindow.focus();
    triggerToast('Reporte técnico abierto para impresión o guardado PDF.');
  };

  const handleExportExcel = (m: any) => {
    const htmlContent = generateCertificateHTML(m);
    const blob = new Blob(['\uFEFF', htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `STFLab_${(m.referencia || 'Material').replace(/\s+/g, '_')}_${m.nroLote || m.lote || 'LOTE'}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('¡Certificado exportado en formato XLS de Excel!');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Toast */}
      {notif && (
        <div className="fixed bottom-5 right-5 bg-[#2B2B2E] text-[#C6A466] text-xs px-4.5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-2 border border-[#C6A466]/40 z-50 animate-bounce">
          <CheckCircle className="h-4.5 w-4.5 text-[#485C3E]" />
          <span className="font-semibold">{notif}</span>
        </div>
      )}

      {/* Top Title Panel */}
      <div className="bg-[#2B2B2E] border border-[#424246] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#FBF8F2]">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-2xl bg-[#C6A466]/10 text-[#C6A466] border border-[#C6A466]/20 flex items-center justify-center shrink-0 shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-[#FBF8F2] tracking-tight font-sans">
                Certificados e Informes Técnicos STFLab (Excel & PDF)
              </h2>
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[#C6A466]/15 text-[#C6A466] border border-[#C6A466]/30 font-mono tracking-wider">
                INFORMES TÉCNICOS & REPOSITORIO
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#A8A095] mt-1 font-medium leading-relaxed">
              Visualice, valide y exporte certificados de calidad textil en formato oficial listo para impresión PDF o libro de Excel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#AA9E80]" />
            <input
              type="text"
              placeholder="Buscar por referencia o lote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#2B2B2E] border border-[#424246] rounded-xl text-[#FBF8F2] placeholder-[#AA9E80]/50 focus:outline-none focus:border-[#C6A466]"
            />
          </div>
        </div>
      </div>

      {/* Grid Principal: Lista a la Izquierda vs Previsualizador a la Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Columna Izquierda: Lista de Ensayos (5 cols) */}
        <div className="lg:col-span-5 bg-[#2D2D30] border border-[#424246] rounded-3xl p-5 shadow-sm space-y-4 text-[#FBF8F2]">
          <div className="flex items-center justify-between border-b border-[#424246] pb-3">
            <span className="text-xs font-serif font-bold uppercase text-[#C6A466] tracking-wider">Lotes con Ensayos Registrados</span>
            <span className="text-[10px] bg-[#2B2B2E] text-[#AA9E80] px-2.5 py-0.5 rounded-full font-bold border border-[#424246]">
              {filteredFichas.length} Muestras
            </span>
          </div>

          <div className="divide-y divide-[#424246] max-h-[600px] overflow-y-auto pr-1 custom-vertical-scroll">
            {filteredFichas.length === 0 ? (
              <div className="py-12 text-center text-[#AA9E80] text-xs">
                No hay muestras registradas para este filtro.
              </div>
            ) : (
              filteredFichas.map((m) => {
                const isSelected = previewFicha?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setPreviewFicha(m)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isSelected ? 'bg-[#2B2B2E] border border-[#C6A466]/40 shadow-sm' : 'hover:bg-[#2B2B2E]/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#FBF8F2] text-xs truncate">{m.referencia}</span>
                        <span className="font-mono text-[9px] bg-[#2B2B2E] text-[#C6A466] px-1.5 py-0.2 rounded border border-[#424246]">
                          {(m as any).nroLote || m.lote || 'S/L'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#AA9E80] mt-1 truncate">
                        {m.proveedor} • {m.color}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPDF(m);
                        }}
                        className="p-1.5 rounded-lg bg-[#2B2B2E] hover:bg-[#424246] text-[#FBF8F2] transition-colors cursor-pointer border border-[#424246]"
                        title="Imprimir / PDF"
                      >
                        <FileDown className="h-3.5 w-3.5 text-[#C6A466]" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportExcel(m);
                        }}
                        className="p-1.5 rounded-lg bg-[#485C3E] hover:bg-[#5A734E] text-[#FBF8F2] transition-colors cursor-pointer"
                        title="Descargar Excel XLS"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Columna Derecha: Vista Previa del Certificado (7 cols) */}
        <div className="lg:col-span-7 bg-[#2D2D30] border border-[#424246] rounded-3xl p-5 shadow-sm flex flex-col space-y-4 text-[#FBF8F2]">
          {previewFicha ? (
            <>
              <div className="flex items-center justify-between border-b border-[#424246] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-serif font-bold text-[#FBF8F2] uppercase tracking-wide">
                    Vista Previa: {previewFicha.referencia}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadPDF(previewFicha)}
                    className="px-3 py-1.5 bg-[#2B2B2E] hover:bg-[#424246] border border-[#424246] text-[#FBF8F2] font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C6A466]" />
                    <span>Imprimir / PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportExcel(previewFicha)}
                    className="px-3 py-1.5 bg-[#485C3E] hover:bg-[#5A734E] text-[#FBF8F2] font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel (XLS)</span>
                  </button>
                </div>
              </div>

              {/* Iframe Preview */}
              <div 
                ref={containerRef}
                className="w-full bg-[#2B2B2E] rounded-2xl border border-[#424246] p-2 overflow-hidden flex justify-center min-h-[520px]"
              >
                <div 
                  style={{ 
                    zoom: scale,
                    width: '820px',
                    margin: '0 auto',
                    transformOrigin: 'top center'
                  }}
                  className="flex justify-center w-full"
                >
                  <iframe
                    title="Certificado STFLab"
                    srcDoc={generateCertificateHTML(previewFicha)}
                    className="w-[820px] h-[750px] bg-white rounded-xl shadow-xl border border-slate-300"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-[#AA9E80] text-xs">
              Seleccione una muestra para visualizar su certificado oficial.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
