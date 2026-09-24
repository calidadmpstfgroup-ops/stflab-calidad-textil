import React, { useState, useMemo } from 'react';
import { GUIA_MAESTRA_INSUMOS, GuiaMaestraInsumoItem } from '../../data/guiaMaestraInsumos';
import { 
  Search, 
  BookOpen, 
  CheckCircle2, 
  Copy, 
  Check, 
  Printer, 
  Filter, 
  Sparkles, 
  SlidersHorizontal,
  X,
  ShieldCheck,
  Zap,
  Info,
  Tag
} from 'lucide-react';

interface TablaMaestraInsumosProps {
  onSeleccionarCriterio?: (item: GuiaMaestraInsumoItem) => void;
  esModal?: boolean;
  onCerrarModal?: () => void;
}

export const TablaMaestraInsumos: React.FC<TablaMaestraInsumosProps> = ({
  onSeleccionarCriterio,
  esModal = false,
  onCerrarModal
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('TODAS');
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    GUIA_MAESTRA_INSUMOS.forEach(item => {
      if (item.categoria) set.add(item.categoria);
    });
    return ['TODAS', ...Array.from(set)];
  }, []);

  const itemsFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return GUIA_MAESTRA_INSUMOS.filter(item => {
      const coincideCat = categoriaSeleccionada === 'TODAS' || item.categoria === categoriaSeleccionada;
      if (!coincideCat) return false;

      if (!q) return true;
      return (
        item.insumo.toLowerCase().includes(q) ||
        item.parametroCritico.toLowerCase().includes(q) ||
        item.metodoVerificacion.toLowerCase().includes(q) ||
        item.criterioAceptacion.toLowerCase().includes(q) ||
        (item.categoria && item.categoria.toLowerCase().includes(q))
      );
    });
  }, [busqueda, categoriaSeleccionada]);

  const handleCopiar = (item: GuiaMaestraInsumoItem) => {
    const texto = `Insumo: ${item.insumo} | Parámetro: ${item.parametroCritico} | Método: ${item.metodoVerificacion} | Criterio: ${item.criterioAceptacion}`;
    navigator.clipboard.writeText(texto);
    setCopiadoId(item.id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className={`space-y-4 font-sans ${esModal ? 'p-1' : ''}`}>
      
      {/* Encabezado / Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-xl text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner shrink-0">
              <BookOpen className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-400/20 text-indigo-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-indigo-400/30 uppercase tracking-widest">
                  NORMATIVA & CALIDAD • LABORATORIO INSUMOS
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>18 Ensayos Estándar</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
                <span>Tabla Maestra: Guía de Ensayos para Insumos</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                Parámetros críticos, métodos de verificación rápida y tolerancias de aceptación aplicables en la inspección técnica de laboratorio.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              type="button"
              onClick={handleImprimir}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer shadow-sm"
              title="Imprimir Guía Maestra"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            {esModal && onCerrarModal && (
              <button
                type="button"
                onClick={onCerrarModal}
                className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                title="Cerrar Guía"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por insumo (ej: Botones, Cierres, Hebillas), parámetro, método o tolerancia..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner transition-all"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtro por Categoría */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          {categorias.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaSeleccionada(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                categoriaSeleccionada === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla Maestra */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 shadow-xl bg-slate-900/90">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-slate-100 uppercase text-[11px] tracking-wider border-b border-indigo-900/50">
                <th className="py-3.5 px-4 font-black w-1/5">
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Insumo</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 font-black w-1/4">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Parámetro Crítico a Revisar</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 font-black w-1/4">
                  <div className="flex items-center gap-1.5 text-blue-300">
                    <Info className="w-3.5 h-3.5" />
                    <span>Método de Verificación Rápida</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 font-black w-1/4">
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Criterio de Aceptación / Tolerancia</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 font-black text-center w-20">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/70">
              {itemsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
                    <p className="font-bold text-sm text-slate-400">No se encontraron insumos</p>
                    <p className="text-xs text-slate-500 mt-1">Prueba con otra palabra clave en el buscador o limpia los filtros.</p>
                  </td>
                </tr>
              ) : (
                itemsFiltrados.map((item, idx) => {
                  const esPar = idx % 2 === 0;
                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors hover:bg-indigo-950/20 ${
                        esPar ? 'bg-slate-900/40' : 'bg-slate-950/60'
                      }`}
                    >
                      {/* Insumo */}
                      <td className="py-3 px-4 align-top">
                        <div className="space-y-1">
                          <span className="font-black text-slate-100 text-xs block">
                            {item.insumo}
                          </span>
                          {item.categoria && (
                            <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                              {item.categoria}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Parámetro Crítico */}
                      <td className="py-3 px-4 align-top text-slate-200 font-medium leading-relaxed">
                        <div className="bg-amber-500/5 border-l-2 border-amber-500/60 pl-2.5 py-1 rounded-r">
                          {item.parametroCritico}
                        </div>
                      </td>

                      {/* Método de Verificación Rápida */}
                      <td className="py-3 px-4 align-top text-slate-300 font-medium leading-relaxed">
                        <div className="bg-blue-500/5 border-l-2 border-blue-500/60 pl-2.5 py-1 rounded-r">
                          {item.metodoVerificacion}
                        </div>
                      </td>

                      {/* Criterio de Aceptación / Tolerancia */}
                      <td className="py-3 px-4 align-top text-emerald-300 font-medium leading-relaxed">
                        <div className="bg-emerald-500/5 border-l-2 border-emerald-500/60 pl-2.5 py-1 rounded-r">
                          {item.criterioAceptacion}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-3 align-top text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopiar(item)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              copiadoId === item.id
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                            }`}
                            title="Copiar Criterio al Portapapeles"
                          >
                            {copiadoId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {onSeleccionarCriterio && (
                            <button
                              type="button"
                              onClick={() => onSeleccionarCriterio(item)}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black transition-all cursor-pointer shadow-xs"
                              title="Aplicar criterio a la evaluación"
                            >
                              Aplicar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>Mostrando <b>{itemsFiltrados.length}</b> de <b>{GUIA_MAESTRA_INSUMOS.length}</b> parámetros maestros de calidad textil</span>
          <span className="text-slate-500">STF Group • Laboratorio de Calidad de Insumos</span>
        </div>
      </div>

    </div>
  );
};
