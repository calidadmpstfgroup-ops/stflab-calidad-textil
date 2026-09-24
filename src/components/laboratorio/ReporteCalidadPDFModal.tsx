import React, { useEffect, useRef } from 'react';
import { ItemMuestraTela, SolicitudTelasCompleta } from '../../types';
import { generateCertificateHTML } from '../../utils/certificateGenerator';
import { X, Printer, Download, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ReporteCalidadPDFModalProps {
  solicitud?: SolicitudTelasCompleta;
  tela: ItemMuestraTela;
  onClose: () => void;
}

export const ReporteCalidadPDFModal: React.FC<ReporteCalidadPDFModalProps> = ({
  solicitud,
  tela,
  onClose
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const htmlContent = generateCertificateHTML({
    ...tela,
    solicitudCompra: tela.solicitudCompra || solicitud?.numeroSolicitud,
    proveedor: tela.proveedor || solicitud?.proveedor
  });

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    } else {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(htmlContent);
        win.document.close();
        win.focus();
        win.print();
      }
    }
  };

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header de Modal */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 font-black text-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  DMP-F-001 V01-2021
                </span>
                <h3 className="text-sm font-black text-white">
                  REPORTE OFICIAL DE CALIDAD DE LABORATORIO (2 PÁGINAS)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Referencia: <strong className="text-white">{tela.referencia}</strong> • Proveedor: <strong className="text-blue-300">{tela.proveedor || solicitud?.proveedor}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ IMPRIMIR / DESCARGAR PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visor de Documento PDF/HTML */}
        <div className="flex-1 bg-slate-950 p-4 overflow-auto flex justify-center">
          <iframe
            ref={iframeRef}
            title="Reporte de Calidad STFLab"
            className="w-full max-w-[850px] h-full bg-white rounded-lg shadow-2xl border border-slate-300"
          />
        </div>

        {/* Footer info modal */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Formato homologado oficialmente para el Grupo STF (Studio F / ELA).</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">Pág 1: Ensayos Físicos NTC • Pág 2: Matriz Tintorería & Rollos</span>
        </div>

      </div>
    </div>
  );
};
