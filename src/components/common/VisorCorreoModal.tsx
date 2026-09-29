import React, { useState } from 'react';
import { RegistroHistorialCorreo, abrirClienteCorreoPredeterminado } from '../../services/emailNotificationService';
import { useTheme } from '../../context/ThemeContext';
import { 
  Mail, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Send, 
  FileText, 
  Calendar, 
  UserCheck, 
  ShieldCheck,
  Code
} from 'lucide-react';

interface VisorCorreoModalProps {
  correo: RegistroHistorialCorreo | null;
  abierto: boolean;
  onCerrar: () => void;
}

export const VisorCorreoModal: React.FC<VisorCorreoModalProps> = ({
  correo,
  abierto,
  onCerrar
}) => {
  const { theme } = useTheme();
  const esModoClaro = theme === 'light';
  const [copiado, setCopiado] = useState(false);
  const [vista, setVista] = useState<'preview' | 'html' | 'texto'>('preview');

  if (!abierto || !correo) return null;

  const handleCopiarTexto = () => {
    navigator.clipboard.writeText(correo.cuerpoTexto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleCopiarHtml = () => {
    navigator.clipboard.writeText(correo.cuerpoHtml);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const fechaFormateada = new Date(correo.timestamp).toLocaleString('es-CO', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in-50 duration-200">
      <div 
        className={`w-full max-w-4xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${
          esModoClaro 
            ? 'bg-white border-slate-300 text-slate-900' 
            : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-4 sm:p-5 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00b4d8]/20 border border-[#00b4d8]/40 flex items-center justify-center text-[#00b4d8]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#00b4d8] bg-[#00b4d8]/15 px-2 py-0.5 rounded-full border border-[#00b4d8]/30">
                  Notificación Formal Automatizada
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ✓ Registrado
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white mt-0.5 truncate max-w-xl">
                {correo.asunto}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadatos del Correo */}
        <div className={`p-4 border-b text-xs grid grid-cols-1 sm:grid-cols-3 gap-3 ${
          esModoClaro ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/70 border-slate-800 text-slate-300'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Remitente:</span>
            <span className="font-semibold text-xs truncate block">{correo.remitente}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Destinatario(s):</span>
            <span className="font-semibold text-xs text-[#00b4d8] truncate block">{correo.destinatarios.join(', ')}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Fecha de Emisión:</span>
            <span className="font-semibold text-xs">{fechaFormateada}</span>
          </div>
        </div>

        {/* Barra de pestañas de visualización */}
        <div className={`px-4 py-2 border-b flex items-center justify-between gap-2 flex-wrap ${
          esModoClaro ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setVista('preview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                vista === 'preview'
                  ? 'bg-[#00b4d8] text-white shadow-xs'
                  : esModoClaro ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Vista Previa Corporativa
            </button>
            <button
              type="button"
              onClick={() => setVista('texto')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                vista === 'texto'
                  ? 'bg-[#00b4d8] text-white shadow-xs'
                  : esModoClaro ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Texto Plano / RFC
            </button>
            <button
              type="button"
              onClick={() => setVista('html')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                vista === 'html'
                  ? 'bg-[#00b4d8] text-white shadow-xs'
                  : esModoClaro ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Código HTML
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopiarTexto}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                copiado
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : esModoClaro
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiado ? 'Copiado' : 'Copiar Texto'}</span>
            </button>

            <button
              type="button"
              onClick={() => abrirClienteCorreoPredeterminado(correo)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
              title="Abrir en Outlook / Gmail / Mail con datos pre-rellenados"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir en Outlook / Correo</span>
            </button>
          </div>
        </div>

        {/* Cuerpo del Mensaje */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950/80">
          {vista === 'preview' && (
            <div className="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-lg bg-white">
              <iframe
                title="Preview Correo"
                srcDoc={correo.cuerpoHtml}
                className="w-full min-h-[500px] border-0"
              />
            </div>
          )}

          {vista === 'texto' && (
            <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner">
              {correo.cuerpoTexto}
            </pre>
          )}

          {vista === 'html' && (
            <div className="relative">
              <button
                type="button"
                onClick={handleCopiarHtml}
                className="absolute right-4 top-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar HTML</span>
              </button>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sky-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner max-h-[500px]">
                {correo.cuerpoHtml}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
          esModoClaro ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-bold">Enlace Seguro de Acceso Directo:</span>
            <a 
              href={correo.enlaceApp} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#00b4d8] hover:underline font-mono text-[11px] truncate max-w-sm block"
            >
              {correo.enlaceApp}
            </a>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold transition-all cursor-pointer text-xs"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
};
