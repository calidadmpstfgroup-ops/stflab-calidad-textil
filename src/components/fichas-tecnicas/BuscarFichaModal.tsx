import React, { useState, useMemo, useEffect } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useAuth } from '../../context/AuthContext';
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
  Check
} from 'lucide-react';

interface BuscarFichaModalProps {
  abierto: boolean;
  onCerrar: () => void;
  referenciaInicial: string;
  proveedorInicial: string;
  onSeleccionarFicha: (ficha: FichaTecnicaHistoricaVersionada, version: VersionFichaTecnica) => void;
  onAbrirPortalToken?: () => void;
  onAbrirCrearFicha?: () => void;
}

export const BuscarFichaModal: React.FC<BuscarFichaModalProps> = ({
  abierto,
  onCerrar,
  referenciaInicial,
  proveedorInicial,
  onSeleccionarFicha,
  onAbrirPortalToken,
  onAbrirCrearFicha
}) => {
  const { fichasTecnicasHistorial } = useQuality() as any;
  const [busquedaRef, setBusquedaRef] = useState(referenciaInicial);
  const [busquedaProv, setBusquedaProv] = useState(proveedorInicial);

  const [fichaSeleccionada, setFichaSeleccionada] = useState<FichaTecnicaHistoricaVersionada | null>(null);
  const [versionSeleccionada, setVersionSeleccionada] = useState<VersionFichaTecnica | null>(null);
  const [vistaDetalleCompleto, setVistaDetalleCompleto] = useState(false);

  useEffect(() => {
    if (abierto) {
      setBusquedaRef(referenciaInicial);
      setBusquedaProv(proveedorInicial);
      setVistaDetalleCompleto(false);
    }
  }, [abierto, referenciaInicial, proveedorInicial]);

  // Algoritmo de búsqueda inteligente en base histórica
  const coincidencias = useMemo(() => {
    const qRef = (busquedaRef || '').trim().toLowerCase();
    const qProv = (busquedaProv || '').trim().toLowerCase();

    return (fichasTecnicasHistorial || []).filter((ft: FichaTecnicaHistoricaVersionada) => {
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
  }, [fichasTecnicasHistorial, busquedaRef, busquedaProv]);

  // Inicializar selección con la primera coincidencia y su versión más reciente
  useEffect(() => {
    if (coincidencias.length > 0) {
      const primera = coincidencias[0];
      setFichaSeleccionada(primera);
      const versionVigente = primera.historialVersiones.find((v: VersionFichaTecnica) => v.activo) || 
        primera.historialVersiones[primera.historialVersiones.length - 1];
      setVersionSeleccionada(versionVigente);
    } else {
      setFichaSeleccionada(null);
      setVersionSeleccionada(null);
    }
  }, [coincidencias]);

  if (!abierto) return null;

  const handleAplicarFicha = () => {
    if (!fichaSeleccionada || !versionSeleccionada) return;
    onSeleccionarFicha(fichaSeleccionada, versionSeleccionada);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-4xl bg-[#2B2B2E] border border-[#424246] rounded-3xl shadow-2xl p-6 text-[#FBF8F2] my-6 max-h-[92vh] flex flex-col justify-between">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-[#424246] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                <span>Buscar Ficha Técnica del Proveedor</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-black px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-mono">
                  BASE HISTÓRICA REUTILIZABLE
                </span>
              </h3>
              <p className="text-xs text-[#F0DCA8] font-bold mt-0.5">
                Consulta automática por Proveedor + Referencia del Fabricante para autocompletar especificaciones.
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

        {/* Barra de Búsqueda y Filtros Activos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#1E1E24] p-4 rounded-2xl border border-[#424246] my-3 shadow-md">
          <div>
            <label className="block text-xs font-black text-[#FFF8E7] mb-1.5 uppercase tracking-wider">Proveedor / Fabricante:</label>
            <input
              type="text"
              value={busquedaProv}
              onChange={(e) => setBusquedaProv(e.target.value)}
              placeholder="ej: XYZ TEXTILES, SHANGHAI JOY TEX, COLTEJER..."
              className="w-full px-3.5 py-2.5 bg-[#141417] border border-[#424246] rounded-xl text-xs text-white font-extrabold placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-[#FFF8E7] mb-1.5 uppercase tracking-wider">Referencia o Ref. Proveedor:</label>
            <input
              type="text"
              value={busquedaRef}
              onChange={(e) => setBusquedaRef(e.target.value)}
              placeholder="ej: CV-001, TEL-4587, CREPE VICTORIA, LINO MOURA..."
              className="w-full px-3.5 py-2.5 bg-[#141417] border border-[#424246] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 font-extrabold shadow-inner"
            />
          </div>
        </div>

        {/* Contenido: Coincidencias Encontradas vs. Estado No Encontrado */}
        <div className="flex-1 overflow-y-auto pr-1 my-2">
          {coincidencias.length > 0 && fichaSeleccionada && versionSeleccionada ? (
            <div className="space-y-4">
              
              {/* Notificación de Éxito */}
              <div className="bg-[#142B1F] border-2 border-emerald-400 rounded-2xl p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      Ficha Técnica Encontrada: <span className="text-emerald-300">{fichaSeleccionada.referencia}</span>
                    </h4>
                    <p className="text-xs text-[#F0DCA8] font-bold mt-0.5">
                      Proveedor: <strong className="text-blue-300 font-black">{fichaSeleccionada.proveedor}</strong> • Ref. Fabricante: <strong className="text-amber-300 font-mono font-black">{fichaSeleccionada.referenciaProveedor || 'N/A'}</strong>
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs bg-[#1E1E24] px-3 py-1.5 rounded-lg text-emerald-300 font-black border border-emerald-400/50">
                  {fichaSeleccionada.codigoFT}
                </span>
              </div>

              {/* Selector de Versiones de la Ficha (Regla: destacar vigente y permitir anteriores) */}
              <div className="bg-[#1E1E24] p-4 rounded-2xl border border-[#424246] space-y-3 shadow-md">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
                  Selecciona la Versión Histórica a Utilizar:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {fichaSeleccionada.historialVersiones.map((v: VersionFichaTecnica) => {
                    const esVigente = v.version === fichaSeleccionada.versionActual;
                    const estaSeleccionada = versionSeleccionada.version === v.version;

                    return (
                      <div
                        key={v.version}
                        onClick={() => setVersionSeleccionada(v)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          estaSeleccionada
                            ? 'bg-[#142B1F] border-2 border-emerald-400 shadow-md ring-1 ring-emerald-400/50'
                            : 'bg-[#141417] border-[#424246] hover:border-[#AA9E80]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs text-white flex items-center gap-1.5">
                              <span>Versión {v.version}</span>
                              {esVigente && (
                                <span className="text-[10px] bg-emerald-500 text-zinc-950 px-2 py-0.2 rounded font-black">
                                  VIGENTE
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-[#F0DCA8] font-mono font-bold">{v.fechaVersion}</span>
                          </div>

                          <p className="text-xs text-[#E6DCB8] font-semibold line-clamp-2">
                            {v.cambiosRespectoAnterior || 'Especificaciones declaradas por el fabricante.'}
                          </p>
                        </div>

                        <div className="mt-2 pt-2 border-t border-[#424246] flex items-center justify-between text-xs font-bold">
                          <span className="text-amber-300 font-black">{v.especificaciones.gramajeDeclaradoGsm} g/m²</span>
                          <span className="text-emerald-300 font-bold">{v.especificaciones.anchoUtilM} m</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen de Datos que se cargarán en las ESPECIFICACIONES DE LABORATORIO */}
              <div className="bg-[#1E1E24] p-4 rounded-2xl border border-[#424246] space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-[#424246] pb-2">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Datos Técnicos que se autocompletarán en Laboratorio (Versión {versionSeleccionada.version}):
                  </span>
                  <span className="text-[10px] text-[#F0DCA8] font-bold italic">
                    * No modificará resultados medidos de laboratorio
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-[#141417] p-3 rounded-xl border border-[#424246]">
                    <span className="text-[#F0DCA8] block text-[11px] font-black uppercase mb-1">Gramaje Declarado:</span>
                    <strong className="text-white font-black text-sm">{versionSeleccionada.especificaciones.gramajeDeclaradoGsm} g/m²</strong>
                  </div>

                  <div className="bg-[#141417] p-3 rounded-xl border border-[#424246]">
                    <span className="text-[#F0DCA8] block text-[11px] font-black uppercase mb-1">Ancho Útil Declarado:</span>
                    <strong className="text-emerald-300 font-black text-sm">{versionSeleccionada.especificaciones.anchoUtilM} m</strong>
                  </div>

                  <div className="bg-[#141417] p-3 rounded-xl border border-[#424246]">
                    <span className="text-[#F0DCA8] block text-[11px] font-black uppercase mb-1">Encogimiento Largo:</span>
                    <strong className="text-amber-300 font-black text-sm">{versionSeleccionada.especificaciones.encogimientoLargoMax}%</strong>
                  </div>

                  <div className="bg-[#141417] p-3 rounded-xl border border-[#424246]">
                    <span className="text-[#F0DCA8] block text-[11px] font-black uppercase mb-1">Encogimiento Ancho:</span>
                    <strong className="text-amber-300 font-black text-sm">{versionSeleccionada.especificaciones.encogimientoAnchoMax}%</strong>
                  </div>

                  <div className="bg-[#141417] p-3 rounded-xl border border-[#424246]">
                    <span className="text-[#F0DCA8] block text-[11px] font-black uppercase mb-1">Torque / Viro Máx:</span>
                    <strong className="text-white font-black text-sm">{versionSeleccionada.especificaciones.viroMax}%</strong>
                  </div>

                  <div className="bg-[#141417] p-3 rounded-xl border border-[#424246]">
                    <span className="text-[#F0DCA8] block text-[11px] font-black uppercase mb-1">Solidez Lavado Mín:</span>
                    <strong className="text-emerald-300 font-black text-sm">≥ Grado {versionSeleccionada.especificaciones.solidezLavadoMin}</strong>
                  </div>

                  <div className="bg-[#141417] p-3 rounded-xl border border-[#424246]">
                    <span className="text-[#F0DCA8] block text-[11px] font-black uppercase mb-1">Solidez Frote Seco:</span>
                    <strong className="text-emerald-300 font-black text-sm">≥ Grado {versionSeleccionada.especificaciones.solidezFroteSecoMin}</strong>
                  </div>

                  <div className="bg-[#141417] p-3 rounded-xl border border-[#424246]">
                    <span className="text-[#F0DCA8] block text-[11px] font-black uppercase mb-1">Solidez Frote Húmedo:</span>
                    <strong className="text-emerald-300 font-black text-sm">≥ Grado {versionSeleccionada.especificaciones.solidezFroteHumedoMin}</strong>
                  </div>
                </div>

                <div className="bg-[#141417] p-3 rounded-xl border border-[#424246] text-xs">
                  <span className="text-[#F0DCA8] block text-[11px] font-black uppercase mb-1">Composición Porcentual Declarada:</span>
                  <strong className="text-cyan-200 font-black text-sm">{versionSeleccionada.especificaciones.composicion}</strong>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#1E1E24] p-8 rounded-2xl border border-[#424246] text-center space-y-4 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  ⚠️ No se encontró una Ficha Técnica para esta referencia y proveedor.
                </h4>
                <p className="text-xs text-[#F0DCA8] font-bold mt-1 max-w-md mx-auto">
                  No hay un registro histórico que coincida con "{busquedaRef || 'Referencia'}" del proveedor "{busquedaProv || 'Proveedor'}".
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setBusquedaRef('');
                    setBusquedaProv('');
                  }}
                  className="px-4 py-2 bg-[#36363B] hover:bg-[#424246] text-white text-xs font-black rounded-xl border border-[#424246] transition-colors cursor-pointer"
                >
                  🔄 BUSCAR NUEVAMENTE (VER TODAS)
                </button>

                {onAbrirPortalToken && (
                  <button
                    type="button"
                    onClick={() => {
                      onCerrar();
                      onAbrirPortalToken();
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>SOLICITAR FICHA AL PROVEEDOR</span>
                  </button>
                )}

                {onAbrirCrearFicha && (
                  <button
                    type="button"
                    onClick={() => {
                      onCerrar();
                      onAbrirCrearFicha();
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>CREAR NUEVA FICHA</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer con Acciones Claras */}
        <div className="pt-4 border-t border-[#424246] flex items-center justify-between">
          <button
            type="button"
            onClick={onCerrar}
            className="px-5 py-2.5 bg-[#36363B] hover:bg-[#424246] text-white font-black text-xs rounded-xl border border-[#424246] transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          {fichaSeleccionada && versionSeleccionada && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAplicarFicha}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs rounded-xl shadow-xl transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>USAR ESTA FICHA (CARGAR DATOS TÉCNICOS)</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
