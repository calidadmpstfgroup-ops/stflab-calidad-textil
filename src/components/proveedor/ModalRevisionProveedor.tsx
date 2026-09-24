import React, { useState } from 'react';
import { SolicitudProveedor, Muestra, DatosProveedorFicha, DatosProveedorFormulario } from '../../types';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  FileText, 
  Activity, 
  Building, 
  Download, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
  Clock,
  Send,
  Eye
} from 'lucide-react';

interface ModalRevisionProveedorProps {
  solicitud: SolicitudProveedor;
  muestrasExistentes?: Muestra[];
  onClose: () => void;
  onHomologar: (solicitudId: string, muestraAsociadaId?: string, datosAceptados?: Partial<Muestra>) => Promise<void> | void;
  onRechazar: (solicitudId: string, motivo: string) => Promise<void> | void;
}

export function ModalRevisionProveedor({
  solicitud,
  muestrasExistentes = [],
  onClose,
  onHomologar,
  onRechazar
}: ModalRevisionProveedorProps) {
  const datos = (solicitud.datosProveedor || {}) as (DatosProveedorFicha & DatosProveedorFormulario);
  
  const muestraAsociada = muestrasExistentes.find(
    m => m.id === solicitud.muestraId || 
         (m.referencia && m.referencia.toLowerCase() === solicitud.referencia.toLowerCase() &&
          m.proveedor && m.proveedor.toLowerCase() === solicitud.proveedor.toLowerCase())
  );

  const [muestraTargetId, setMuestraTargetId] = useState<string>(muestraAsociada?.id || '');
  const [motivoRechazo, setMotivoRechazo] = useState<string>('');
  const [mostrarDialogoRechazo, setMostrarDialogoRechazo] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [camposSeleccionados, setCamposSeleccionados] = useState<Record<string, boolean>>({
    composicion: true,
    anchoUtil: true,
    pesoGsm: true,
    tipoTejido: true,
    encogimientoLargo: true,
    encogimientoAncho: true,
    piernaVirada: true,
    solidezLavado: true,
    solidezFrote: true
  });

  const toggleCampo = (campo: string) => {
    setCamposSeleccionados(prev => ({
      ...prev,
      [campo]: !prev[campo]
    }));
  };

  const handleAprobarYHomologar = async () => {
    setIsProcessing(true);
    try {
      const datosParaMuestra: Partial<Muestra> = {
        proveedor: datos.nombreEmpresa || datos.proveedor || solicitud.proveedor,
        referencia: datos.referencia || solicitud.referencia,
        nombreTela: datos.nombreComercial || datos.nombreTela || solicitud.nombreTela,
        color: datos.color || solicitud.color || 'ESTÁNDAR',
        composicion: camposSeleccionados.composicion ? (datos.composicion || '') : '',
        fichaTecnica: {
          gramajeEsperado: camposSeleccionados.pesoGsm ? (datos.pesoGsm || 200) : 200,
          pesoMlEsperado: datos.pesoMl || 300,
          anchoEsperado: camposSeleccionados.anchoUtil ? (datos.anchoUtil || 1.48) : 1.48,
          anchoTotalEsperado: datos.anchoTotal,
          encogimientoEsperado: camposSeleccionados.encogimientoLargo ? (datos.encogimientoLargo ?? -3.0) : -3.0,
          composicion: camposSeleccionados.composicion ? (datos.composicion || '') : '',
          anchoUtil: camposSeleccionados.anchoUtil ? (datos.anchoUtil || 1.48) : 1.48,
          pesoGsm: camposSeleccionados.pesoGsm ? (datos.pesoGsm || 200) : 200,
          rendimientoEsperado: datos.rendimiento,
          tipoTejido: camposSeleccionados.tipoTejido ? (datos.tipoTejido || 'TEJIDO PLANO') : 'TEJIDO PLANO',
          encogimientoLargoEsperado: camposSeleccionados.encogimientoLargo ? (datos.encogimientoLargo ?? -3.0) : -3.0,
          encogimientoAnchoEsperado: camposSeleccionados.encogimientoAncho ? (datos.encogimientoAncho ?? -2.0) : -2.0,
          torqueEsperado: camposSeleccionados.piernaVirada ? (datos.piernaVirada ?? 2.0) : 2.0,
          solidezLavadoEsperado: camposSeleccionados.solidezLavado ? String(datos.solidezLavadoCambioColor || '4-5') : '4-5',
          solidezFroteSecoEsperado: camposSeleccionados.solidezFrote ? String(datos.solidezFroteSeco || '4') : '4',
          solidezFroteHumedoEsperado: camposSeleccionados.solidezFrote ? String(datos.solidezFroteHumedo || '3-4') : '3-4',
          elongacionAnchoEsperado: datos.elongacionAncho,
          lavadoSugerido: datos.lavadoSugerido || ''
        }
      };

      await onHomologar(solicitud.id, muestraTargetId || undefined, datosParaMuestra);
      onClose();
    } catch (err) {
      console.error('Error al homologar solicitud:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEjecutarRechazo = async () => {
    if (!motivoRechazo.trim()) {
      alert('Por favor especifique el motivo del rechazo.');
      return;
    }
    setIsProcessing(true);
    try {
      await onRechazar(solicitud.id, motivoRechazo.trim());
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-fade-in font-sans"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-slate-950 p-6 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 rounded-2xl text-amber-400 border border-amber-500/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Token: #{solicitud.token}
              </span>
              <h2 className="text-lg font-black text-white mt-1">
                Auditoría y Homologación: {solicitud.referencia} — {solicitud.proveedor}
              </h2>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Parámetros Declarados */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3 w-12 text-center">Incluir</th>
                  <th className="p-3">Parámetro</th>
                  <th className="p-3 text-amber-300">Valor Declarado Proveedor</th>
                  <th className="p-3">Estándar Actual en STFLab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr className="hover:bg-slate-900/60">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={camposSeleccionados.composicion}
                      onChange={() => toggleCampo('composicion')}
                      className="rounded bg-slate-900 border-slate-700 text-amber-500"
                    />
                  </td>
                  <td className="p-3 font-bold text-white">Composición</td>
                  <td className="p-3 font-bold text-amber-300">{datos.composicion || 'No declarada'}</td>
                  <td className="p-3 text-slate-400">{muestraAsociada?.composicion || '—'}</td>
                </tr>
                <tr className="hover:bg-slate-900/60">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={camposSeleccionados.anchoUtil}
                      onChange={() => toggleCampo('anchoUtil')}
                      className="rounded bg-slate-900 border-slate-700 text-amber-500"
                    />
                  </td>
                  <td className="p-3 font-bold text-white">Ancho Útil (m)</td>
                  <td className="p-3 font-bold text-amber-300">{datos.anchoUtil ? `${datos.anchoUtil} m` : 'No declarado'}</td>
                  <td className="p-3 text-slate-400">{muestraAsociada?.fichaTecnica?.anchoEsperado ? `${muestraAsociada.fichaTecnica.anchoEsperado} m` : '—'}</td>
                </tr>
                <tr className="hover:bg-slate-900/60">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={camposSeleccionados.pesoGsm}
                      onChange={() => toggleCampo('pesoGsm')}
                      className="rounded bg-slate-900 border-slate-700 text-amber-500"
                    />
                  </td>
                  <td className="p-3 font-bold text-white">Gramaje (g/m²)</td>
                  <td className="p-3 font-bold text-amber-300">{datos.pesoGsm ? `${datos.pesoGsm} g/m²` : 'No declarado'}</td>
                  <td className="p-3 text-slate-400">{muestraAsociada?.fichaTecnica?.gramajeEsperado ? `${muestraAsociada.fichaTecnica.gramajeEsperado} g/m²` : '—'}</td>
                </tr>
                <tr className="hover:bg-slate-900/60">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={camposSeleccionados.encogimientoLargo}
                      onChange={() => toggleCampo('encogimientoLargo')}
                      className="rounded bg-slate-900 border-slate-700 text-amber-500"
                    />
                  </td>
                  <td className="p-3 font-bold text-white">Encogimiento (Largo x Ancho)</td>
                  <td className="p-3 font-bold text-amber-300">L: {datos.encogimientoLargo ?? -3.0}% | A: {datos.encogimientoAncho ?? -2.0}%</td>
                  <td className="p-3 text-slate-400">L: -3.0% | A: -2.0%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {mostrarDialogoRechazo && (
            <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-4 space-y-3 animate-fade-in">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
                <AlertTriangle className="h-4 w-4" />
                <span>Motivo del Rechazo de Ficha Técnica:</span>
              </div>
              <textarea
                rows={2}
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Indique por qué no cumple con los estándares STF Group..."
                className="w-full bg-slate-900 border border-rose-500/40 rounded-xl p-2.5 text-white text-xs"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setMostrarDialogoRechazo(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEjecutarRechazo}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMostrarDialogoRechazo(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 border border-rose-500/30 transition-colors"
          >
            Rechazar Ficha
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleAprobarYHomologar}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer"
            >
              {isProcessing ? 'Homologando...' : 'Homologar y Guardar en STFLab'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ModalRevisionProveedor;
