import React from 'react';
import { FichaTecnicaHistoricaVersionada, VersionFichaTecnica } from '../../types';
import { 
  exportarFichaAWord, 
  exportarFichaAPDF 
} from '../../utils/fichaTecnicaFormatters';
import { 
  X, 
  Download, 
  Printer, 
  FileText
} from 'lucide-react';
import { 
  STFGroupDocumentSheet, 
  mapVersionToSTFGroupDocumentData 
} from './STFGroupDocumentSheet';

interface FichaTecnicaFormatoCompletoModalProps {
  ficha: FichaTecnicaHistoricaVersionada | null;
  version?: VersionFichaTecnica;
  onCerrar: () => void;
}

export const FichaTecnicaFormatoCompletoModal: React.FC<FichaTecnicaFormatoCompletoModalProps> = ({
  ficha,
  version,
  onCerrar
}) => {
  if (!ficha) return null;

  const v = version || ficha.historialVersiones?.[ficha.historialVersiones.length - 1];
  const docData = mapVersionToSTFGroupDocumentData(ficha, v);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Barra de Herramientas Superior: Acciones de Exportación */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00b4d8]/20 border border-[#00b4d8]/40 flex items-center justify-center text-[#00b4d8]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-white flex items-center gap-2">
                <span>Formato Oficial STF GROUP S.A.</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono">
                  v{v?.version || 1}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {ficha.referencia} • {ficha.proveedor}
              </p>
            </div>
          </div>

          {/* Botones de Exportación Word / PDF */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => exportarFichaAWord(ficha, v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
              title="Descargar documento editable para Microsoft Word (.doc)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Word (.doc)</span>
            </button>

            <button
              type="button"
              onClick={() => exportarFichaAPDF(ficha, v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
              title="Generar o imprimir PDF oficial de alta resolución"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Exportar PDF / Imprimir</span>
            </button>

            <button
              type="button"
              onClick={onCerrar}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visor de Hoja Técnica STF GROUP Oficial */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <STFGroupDocumentSheet data={docData} editable={false} />
          </div>
        </div>

      </div>
    </div>
  );
};
