import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { 
  Trash2, 
  RotateCcw, 
  X, 
  AlertTriangle, 
  Calendar, 
  User, 
  Building2, 
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const PapeleraReciclajeModal: React.FC = () => {
  const { 
    papelera, 
    restaurarDePapelera, 
    eliminarPermanentePapelera, 
    vaciarPapelera, 
    modalPapeleraAbierto, 
    setModalPapeleraAbierto 
  } = useQuality();

  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'tela' | 'accesorio'>('todos');
  const [busqueda, setBusqueda] = useState('');

  if (!modalPapeleraAbierto) return null;

  const itemsFiltrados = papelera.filter(item => {
    if (filtroTipo !== 'todos' && item.tipo !== filtroTipo) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      const matchNum = item.numeroSolicitud.toLowerCase().includes(q);
      const matchSol = item.solicitante.toLowerCase().includes(q);
      const matchProv = (item.proveedor || '').toLowerCase().includes(q);
      return matchNum || matchSol || matchProv;
    }
    return true;
  });

  const formatearFecha = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('es-CO', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return iso;
    }
  };

  const handleVaciar = () => {
    if (papelera.length === 0) return;
    if (window.confirm('⚠️ ¿Estás seguro de que deseas VACIAR LA PAPELERA? Todos los elementos eliminados se perderán permanentemente y no podrán recuperarse.')) {
      vaciarPapelera();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans animate-fade-in select-none">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-[#1e3461] rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Encabezado del Modal */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-inner">
              <Trash2 className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white uppercase" style={{ color: '#ffffff' }}>
                  Papelera de Reciclaje
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black font-mono bg-rose-500/25 text-rose-200 border border-rose-500/40">
                  {papelera.length} Eliminados
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium" style={{ color: '#cbd5e1' }}>
                Solicitudes de Telas e Insumos eliminadas desde Compras o Laboratorio con opción de restauración
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {papelera.length > 0 && (
              <button
                type="button"
                onClick={handleVaciar}
                className="px-3.5 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all border border-rose-500/40 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                title="Vaciar todos los elementos permanentemente"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar Papelera</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setModalPapeleraAbierto(false)}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-[#0f1b35] border-b border-slate-200 dark:border-[#1e3461] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setFiltroTipo('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filtroTipo === 'todos'
                  ? 'bg-[#00c0f0] text-white shadow-xs font-black'
                  : 'bg-white dark:bg-[#132247] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              Todos ({papelera.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo('tela')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filtroTipo === 'tela'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'bg-white dark:bg-[#132247] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>🧵</span>
              <span>Telas ({papelera.filter(p => p.tipo === 'tela').length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo('accesorio')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filtroTipo === 'accesorio'
                  ? 'bg-purple-600 text-white shadow-xs font-black'
                  : 'bg-white dark:bg-[#132247] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>🔩</span>
              <span>Insumos ({papelera.filter(p => p.tipo === 'accesorio').length})</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por # solicitud, solicitante, proveedor..."
              className="w-full sm:w-64 pl-3 pr-3 py-1.5 bg-white dark:bg-[#132247] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#00c0f0]"
            />
          </div>
        </div>

        {/* Lista de Solicitudes Eliminadas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-vertical-scroll">
          {itemsFiltrados.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Trash2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200">
                La papelera de reciclaje está vacía
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Las solicitudes que elimines en <strong>Compras</strong> o <strong>Laboratorio</strong> aparecerán aquí para que puedas restaurarlas cuando lo necesites.
              </p>
            </div>
          ) : (
            itemsFiltrados.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#0f1b35] border border-slate-200 dark:border-[#1e3461] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 text-base ${
                    item.tipo === 'tela' 
                      ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600' 
                      : 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-600'
                  }`}>
                    {item.tipo === 'tela' ? '🧵' : '🔩'}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                        {item.numeroSolicitud}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        item.tipo === 'tela'
                          ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                          : 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                      }`}>
                        {item.tipo === 'tela' ? 'Solicitud de Telas' : 'Solicitud de Insumos'}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {item.cantidadItems} {item.tipo === 'tela' ? 'telas' : 'insumos'}
                      </span>
                      <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                        Eliminado desde {item.areaEliminacion.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
                      <span>Solicitante: <strong className="text-slate-800 dark:text-white">{item.solicitante}</strong></span>
                      {item.proveedor && <span>• Proveedor: <strong className="text-slate-800 dark:text-white">{item.proveedor}</strong></span>}
                      <span>• Eliminado por: <strong className="text-slate-800 dark:text-white">{item.eliminadoPor}</strong></span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-mono">
                      Fecha eliminación: {formatearFecha(item.fechaEliminacion)}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => restaurarDePapelera(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer"
                    title="Restaurar solicitud y devolverla a su lista activa"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar definitivamente la solicitud ${item.numeroSolicitud}? No se podrá recuperar.`)) {
                        eliminarPermanentePapelera(item.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                    title="Eliminar permanentemente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-[#0f1b35] border-t border-slate-200 dark:border-[#1e3461] flex items-center justify-between text-xs text-slate-500">
          <span>
            {papelera.length} {papelera.length === 1 ? 'elemento en papelera' : 'elementos en papelera'}
          </span>
          <button
            type="button"
            onClick={() => setModalPapeleraAbierto(false)}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
