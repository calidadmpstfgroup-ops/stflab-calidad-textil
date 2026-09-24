import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { 
  X, 
  Building2, 
  KeyRound, 
  FileText, 
  Upload, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  Copy,
  PlusCircle,
  Search,
  Layers,
  Link as LinkIcon
} from 'lucide-react';
import { FormularioFichaProveedor } from './FormularioFichaProveedor';
import { FichaTecnicaHistoricaVersionada, VersionFichaTecnica } from '../../types';

interface PortalProveedorModalProps {
  abierto: boolean;
  onCerrar: () => void;
}

export const PortalProveedorModal: React.FC<PortalProveedorModalProps> = ({ abierto, onCerrar }) => {
  const { fichasTecnicasHistorial, guardarFichaTecnicaProveedor } = useQuality();

  const [modoVista, setModoVista] = useState<'menu' | 'formulario_nuevo' | 'versionar_existente'>('menu');
  const [fichaSeleccionadaParaVersionar, setFichaSeleccionadaParaVersionar] = useState<FichaTecnicaHistoricaVersionada | null>(null);
  const [filtroBusquedaFT, setFiltroBusquedaFT] = useState('');
  const [enlaceCopiado, setEnlaceCopiado] = useState(false);

  if (!abierto) return null;

  const enlacePublicoProveedor = `${window.location.origin}/#portal-proveedores?auth=public_token_stf`;

  const handleCopiarEnlace = () => {
    navigator.clipboard.writeText(enlacePublicoProveedor);
    setEnlaceCopiado(true);
    setTimeout(() => setEnlaceCopiado(false), 2500);
  };

  const handleGuardarFicha = (nuevaFicha: FichaTecnicaHistoricaVersionada, nuevaVersion: VersionFichaTecnica) => {
    guardarFichaTecnicaProveedor(nuevaFicha, nuevaVersion);
  };

  const fichasFiltradas = (fichasTecnicasHistorial || []).filter((f) => {
    const term = filtroBusquedaFT.toLowerCase().trim();
    if (!term) return true;
    return (
      f.proveedor.toLowerCase().includes(term) ||
      f.referencia.toLowerCase().includes(term) ||
      f.referenciaProveedor.toLowerCase().includes(term) ||
      f.codigoFT.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2B2B2E]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#2B2B2E] border border-[#424246] rounded-3xl shadow-2xl overflow-hidden my-6 text-[#FBF8F2] flex flex-col max-h-[92vh]">
        
        {/* Header Portal */}
        <div className="bg-[#2D2D30] px-6 py-4 border-b border-[#424246] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C6A466]/20 border border-[#C6A466]/40 flex items-center justify-center text-[#C6A466] shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-[#FBF8F2] uppercase tracking-wide">Portal Autónomo de Proveedores</h3>
                <span className="text-[10px] font-bold bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Acceso Externo & Repositorio
                </span>
              </div>
              <p className="text-xs text-[#AA9E80]">
                Diligenciamiento de Ficha Técnica del Fabricante (7 Secciones Oficiales) sin requerir usuario interno.
              </p>
            </div>
          </div>

          <button
            onClick={onCerrar}
            className="p-2 text-[#AA9E80] hover:text-white hover:bg-[#424246] rounded-full transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Principal con Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs custom-vertical-scroll">
          
          {/* VISTA 1: MENÚ PRINCIPAL Y GENERACIÓN DE ENLACE */}
          {modoVista === 'menu' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Tarjeta de Enlace Externo para el Proveedor */}
              <div className="bg-[#2D2D30] border border-[#C6A466]/40 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#C6A466]/20 text-[#C6A466] flex items-center justify-center shrink-0 border border-[#C6A466]/30">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#FBF8F2]">Enlace Directo para Proveedores / Fabricantes</h4>
                      <p className="text-xs text-[#AA9E80] mt-0.5">
                        Envía este enlace seguro a los molinos y proveedores para que diligencien su Ficha Técnica oficial de forma autónoma.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopiarEnlace}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow cursor-pointer ${
                      enlaceCopiado 
                        ? 'bg-[#485C3E] text-[#FBF8F2]' 
                        : 'bg-[#C6A466] hover:bg-[#D6CDB8] text-[#2B2B2E]'
                    }`}
                  >
                    {enlaceCopiado ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{enlaceCopiado ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
                  </button>
                </div>

                <div className="bg-[#2B2B2E] p-3 rounded-xl border border-[#424246] flex items-center justify-between font-mono text-[11px] text-[#C6A466]">
                  <span className="truncate">{enlacePublicoProveedor}</span>
                  <span className="text-[10px] text-[#8A8172] uppercase tracking-wider ml-2 shrink-0">Autenticación por Token</span>
                </div>
              </div>

              {/* Botones de Acción Inmediata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Opción A: Diligenciar Nueva Ficha */}
                <div 
                  onClick={() => {
                    setFichaSeleccionadaParaVersionar(null);
                    setModoVista('formulario_nuevo');
                  }}
                  className="bg-[#2D2D30] hover:bg-[#424246]/80 border border-[#424246] hover:border-[#C6A466]/60 rounded-2xl p-5 cursor-pointer transition-all shadow-sm space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#C6A466]/20 text-[#C6A466] flex items-center justify-center border border-[#C6A466]/30 group-hover:scale-110 transition-transform">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] bg-[#C6A466]/20 text-[#C6A466] font-bold px-2 py-0.5 rounded-full border border-[#C6A466]/30">
                      7 SECCIONES OFICIALES
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-[#FBF8F2] group-hover:text-[#C6A466] transition-colors">
                      Diligenciar Nueva Ficha Técnica
                    </h4>
                    <p className="text-xs text-[#AA9E80] mt-1">
                      Completar el formulario completo con contacto, trazabilidad, fibras, peso, construcción, ensayos y adjuntos.
                    </p>
                  </div>
                  <div className="text-[#C6A466] font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Iniciar Formulario</span> →
                  </div>
                </div>

                {/* Opción B: Actualizar / Versionar Ficha Existente */}
                <div 
                  onClick={() => setModoVista('versionar_existente')}
                  className="bg-[#2D2D30] hover:bg-[#424246]/80 border border-[#424246] hover:border-[#AA9E80]/60 rounded-2xl p-5 cursor-pointer transition-all shadow-sm space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#AA9E80]/20 text-[#AA9E80] flex items-center justify-center border border-[#AA9E80]/30 group-hover:scale-110 transition-transform">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] bg-[#AA9E80]/20 text-[#AA9E80] font-bold px-2 py-0.5 rounded-full border border-[#AA9E80]/30">
                      VERSIONAMIENTO v2, v3...
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-[#FBF8F2] group-hover:text-[#AA9E80] transition-colors">
                      Actualizar Ficha Técnica Existente
                    </h4>
                    <p className="text-xs text-[#AA9E80] mt-1">
                      Crear una nueva versión técnica sin sobrescribir el registro histórico anterior.
                    </p>
                  </div>
                  <div className="text-[#AA9E80] font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Buscar en el Historial</span> →
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* VISTA 2: FORMULARIO DE CREACIÓN O ACTUALIZACIÓN (7 SECCIONES) */}
          {modoVista === 'formulario_nuevo' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#424246] pb-3">
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#FBF8F2] uppercase tracking-wide">
                    {fichaSeleccionadaParaVersionar 
                      ? `Nueva Versión v${fichaSeleccionadaParaVersionar.versionActual + 1}: ${fichaSeleccionadaParaVersionar.referencia}`
                      : 'Formulario Oficial de Ficha Técnica del Fabricante'}
                  </h4>
                  <p className="text-xs text-[#AA9E80]">
                    Diligencia los 7 bloques normativos garantizados por el fabricante.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModoVista('menu')}
                  className="px-3 py-1.5 bg-[#2D2D30] hover:bg-[#424246] text-[#AA9E80] font-bold border border-[#424246] rounded-xl text-xs transition-colors cursor-pointer"
                >
                  ← Volver al Menú
                </button>
              </div>

              <FormularioFichaProveedor
                onGuardarFicha={handleGuardarFicha}
                onCancelar={() => setModoVista('menu')}
                fichaExistenteParaVersionar={fichaSeleccionadaParaVersionar}
              />
            </div>
          )}

          {/* VISTA 3: BUSCADOR PARA VERSIONAR EXISTENTE */}
          {modoVista === 'versionar_existente' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#424246] pb-3">
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#FBF8F2] uppercase tracking-wide">
                    Selecciona una Ficha Técnica para Crear Nueva Versión
                  </h4>
                  <p className="text-xs text-[#AA9E80]">
                    La versión anterior se conservará intacta en el repositorio histórico.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModoVista('menu')}
                  className="px-3 py-1.5 bg-[#2D2D30] hover:bg-[#424246] text-[#AA9E80] font-bold border border-[#424246] rounded-xl text-xs transition-colors cursor-pointer"
                >
                  ← Volver
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-[#AA9E80] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={filtroBusquedaFT}
                  onChange={(e) => setFiltroBusquedaFT(e.target.value)}
                  placeholder="Buscar por Proveedor, Referencia del Proveedor o Código FT..."
                  className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#FBF8F2] focus:border-[#C6A466] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-vertical-scroll">
                {fichasFiltradas.map((f) => (
                  <div
                    key={f.id}
                    className="bg-[#2D2D30] p-4 rounded-2xl border border-[#424246] hover:border-[#C6A466]/50 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#C6A466] text-xs">{f.codigoFT}</span>
                      <span className="text-[10px] bg-[#C6A466]/20 text-[#C6A466] font-bold px-2 py-0.5 rounded-full border border-[#C6A466]/30">
                        v{f.versionActual}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-[#FBF8F2] text-xs">{f.referencia}</div>
                      <div className="text-[11px] text-[#AA9E80]">Ref Prov: <strong className="text-[#FBF8F2]">{f.referenciaProveedor}</strong></div>
                      <div className="text-[11px] text-[#C6A466] font-semibold">{f.proveedor}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFichaSeleccionadaParaVersionar(f);
                        setModoVista('formulario_nuevo');
                      }}
                      className="w-full py-1.5 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#2B2B2E] font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                    >
                      Crear Versión v{f.versionActual + 1}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
