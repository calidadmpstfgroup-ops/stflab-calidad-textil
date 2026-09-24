import React, { useState, useMemo, useEffect } from 'react';
import { FichaTecnicaHistoricaVersionada, VersionFichaTecnica } from '../../types';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  History, 
  X, 
  Plus, 
  Send, 
  Sliders, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  Check,
  Building2,
  Tag,
  FileText,
  Layers
} from 'lucide-react';

interface BuscarFichaLaboratorioModalProps {
  abierto: boolean;
  onCerrar: () => void;
  referenciaInicial: string;
  proveedorInicial: string;
  fichasDisponibles: FichaTecnicaHistoricaVersionada[];
  onSeleccionarFicha: (ficha: FichaTecnicaHistoricaVersionada, version: VersionFichaTecnica) => void;
  onAbrirPortalToken?: (proveedor: string) => void;
  onAbrirCrearFicha?: () => void;
}

export const BuscarFichaLaboratorioModal: React.FC<BuscarFichaLaboratorioModalProps> = ({
  abierto,
  onCerrar,
  referenciaInicial,
  proveedorInicial,
  fichasDisponibles,
  onSeleccionarFicha,
  onAbrirPortalToken,
  onAbrirCrearFicha
}) => {
  const [busquedaRef, setBusquedaRef] = useState(referenciaInicial || '');
  const [busquedaProv, setBusquedaProv] = useState(proveedorInicial || '');
  const [fichaSeleccionada, setFichaSeleccionada] = useState<FichaTecnicaHistoricaVersionada | null>(null);
  const [versionSeleccionada, setVersionSeleccionada] = useState<VersionFichaTecnica | null>(null);
  const [vistaDetalleCompleto, setVistaDetalleCompleto] = useState(false);

  useEffect(() => {
    if (abierto) {
      setBusquedaRef(referenciaInicial || '');
      setBusquedaProv(proveedorInicial || '');
      setVistaDetalleCompleto(false);
    }
  }, [abierto, referenciaInicial, proveedorInicial]);

  // Algoritmo de búsqueda inteligente y jerárquica
  const coincidencias = useMemo(() => {
    const qRef = (busquedaRef || '').trim().toLowerCase();
    const qProv = (busquedaProv || '').trim().toLowerCase();

    return (fichasDisponibles || []).filter((ft: FichaTecnicaHistoricaVersionada) => {
      if (!ft) return false;
      const ftProv = (ft.proveedor || '').toLowerCase();
      // 1. Filtrar por Proveedor si está especificado
      if (qProv) {
        const provMatch = ftProv.includes(qProv) || qProv.includes(ftProv);
        if (!provMatch) return false;
      }

      // 2. Si no hay texto de referencia, retornar los de ese proveedor
      if (!qRef) return true;

      // 3. Coincidencia por Referencia de Proveedor (ej: CV-001, TEL-4587)
      const refProv = (ft.referenciaProveedor || '').toLowerCase();
      const matchRefProv = refProv && (refProv.includes(qRef) || qRef.includes(refProv));

      // 4. Coincidencia por Nombre Comercial / Referencia Tela (ej: CREPE VICTORIA)
      const refNombre = (ft.referencia || '').toLowerCase();
      const matchRefNombre = refNombre.includes(qRef) || qRef.includes(refNombre);

      // 5. Coincidencia por Código de Ficha (ej: FT-000125)
      const codigoFT = (ft.codigoFT || '').toLowerCase();
      const matchCodigo = codigoFT.includes(qRef);

      // 6. Coincidencia por Composición
      const comp = (ft.historialVersiones?.[0]?.especificaciones?.composicion || '').toLowerCase();
      const matchComp = comp.includes(qRef);

      return matchRefProv || matchRefNombre || matchCodigo || matchComp;
    });
  }, [fichasDisponibles, busquedaRef, busquedaProv]);

  // Actualizar ficha seleccionada cuando cambian las coincidencias
  useEffect(() => {
    if (coincidencias.length > 0) {
      const primera = coincidencias[0];
      setFichaSeleccionada(primera);
      const versionVigente = (primera.historialVersiones || []).find((v: VersionFichaTecnica) => v.activo) || 
        primera.historialVersiones?.[(primera.historialVersiones?.length || 1) - 1] || null;
      setVersionSeleccionada(versionVigente);
    } else {
      setFichaSeleccionada(null);
      setVersionSeleccionada(null);
    }
  }, [coincidencias]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto font-sans">
      <div className="bg-[#2B2B2E] border border-[#424246] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#FBF8F2]">
        
        {/* Encabezado del Modal */}
        <div className="p-5 border-b border-[#424246] bg-[#2B2B2E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">🔎 Búsqueda de Ficha Técnica del Proveedor</h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-black border border-amber-500/40 font-mono">
                  BASE HISTÓRICA REUTILIZABLE
                </span>
              </div>
              <p className="text-xs text-[#F0DCA8] font-bold mt-0.5">
                Localiza la ficha técnica declarada por el proveedor para autocargar sus tolerancias normativas.
              </p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="p-2 text-[#AA9E80] hover:text-white hover:bg-[#424246] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Filtros de Búsqueda */}
        <div className="p-4 bg-[#1E1E24] border-b border-[#424246] grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-black text-[#FFF8E7] mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              1. Proveedor / Molino:
            </label>
            <input
              type="text"
              value={busquedaProv}
              onChange={(e) => setBusquedaProv(e.target.value)}
              placeholder="Ej: SHANGHAI JOY TEX, PROVEEDOR A..."
              className="w-full px-3.5 py-2.5 bg-[#141417] border border-[#424246] rounded-xl text-xs text-white font-extrabold placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-[#FFF8E7] mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              2. Referencia Comercial / Tela:
            </label>
            <input
              type="text"
              value={busquedaRef}
              onChange={(e) => setBusquedaRef(e.target.value)}
              placeholder="Ej: CV-001, CREPE VICTORIA, LINO..."
              className="w-full px-3.5 py-2.5 bg-[#141417] border border-[#424246] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 font-extrabold shadow-inner"
            />
          </div>
        </div>

        {/* Contenido Principal: Fichas Encontradas vs Sin Resultados */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {coincidencias.length === 0 ? (
            /* Estado Sin Resultados */
            <div className="bg-[#1E1E24] border border-amber-500/40 rounded-2xl p-6 text-center space-y-4 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-sm font-black text-white uppercase tracking-wider">⚠️ NO SE ENCONTRÓ FICHA TÉCNICA HISTÓRICA</h4>
                <p className="text-xs text-[#F0DCA8] font-bold">
                  No existen fichas previas registradas para <strong>{busquedaProv || 'este proveedor'}</strong> con referencia <strong>{busquedaRef || 'especificada'}</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setBusquedaProv('');
                    setBusquedaRef('');
                  }}
                  className="px-4 py-2 bg-[#36363B] hover:bg-[#424246] text-white rounded-xl text-xs font-black transition-colors border border-[#424246] cursor-pointer"
                >
                  Limpiar Filtros y Buscar Nuevamente
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tarjeta de Ficha Seleccionada */}
              {fichaSeleccionada && versionSeleccionada && (
                <div className="bg-[#1E1E24] border border-[#424246] rounded-2xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-[#424246] pb-3">
                    <div>
                      <span className="font-mono text-xs font-black text-emerald-300">{fichaSeleccionada.codigoFT}</span>
                      <h4 className="text-base font-black text-white uppercase tracking-wide mt-0.5">{fichaSeleccionada.referencia}</h4>
                      <p className="text-xs text-[#F0DCA8] font-bold">
                        Fabricante: <strong className="text-white">{fichaSeleccionada.proveedor}</strong> • Ref. Fabricante: <strong className="text-amber-300 font-mono font-black">{fichaSeleccionada.referenciaProveedor || 'N/A'}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSeleccionarFicha(fichaSeleccionada, versionSeleccionada)}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>USAR FICHA TÉCNICA</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
                    <div className="bg-[#141417] p-3 rounded-xl border border-[#424246]">
                      <span className="text-[#F0DCA8] block text-[11px] font-black uppercase mb-1">Gramaje:</span>
                      <strong className="text-white font-black text-sm">{versionSeleccionada.especificaciones.gramajeDeclaradoGsm} GSM</strong>
                    </div>

                    <div className="bg-[#141417] p-3 rounded-xl border border-[#424246]">
                      <span className="text-[#F0DCA8] block text-[11px] font-black uppercase mb-1">Ancho Útil:</span>
                      <strong className="text-emerald-300 font-black text-sm">{versionSeleccionada.especificaciones.anchoUtilM} m</strong>
                    </div>

                    <div className="bg-[#141417] p-3 rounded-xl border border-[#424246]">
                      <span className="text-[#F0DCA8] block text-[11px] font-black uppercase mb-1">Encogimiento:</span>
                      <strong className="text-amber-300 font-black text-sm">{versionSeleccionada.especificaciones.encogimientoLargoMax}% / {versionSeleccionada.especificaciones.encogimientoAnchoMax}%</strong>
                    </div>

                    <div className="bg-[#141417] p-3 rounded-xl border border-[#424246]">
                      <span className="text-[#F0DCA8] block text-[11px] font-black uppercase mb-1">Solidez Lavado:</span>
                      <strong className="text-emerald-300 font-black text-sm">≥ Grado {versionSeleccionada.especificaciones.solidezLavadoMin}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#424246] bg-[#2B2B2E] flex items-center justify-between">
          <button
            type="button"
            onClick={onCerrar}
            className="px-5 py-2.5 bg-[#36363B] hover:bg-[#424246] text-white font-black text-xs rounded-xl border border-[#424246] transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
