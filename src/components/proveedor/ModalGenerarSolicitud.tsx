import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Link, 
  Copy, 
  Check, 
  Building, 
  FileText, 
  Layers,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { SolicitudProveedor, Muestra } from '../../types';
import { getPortalPublicUrl } from '../../utils/portalUrl';

interface ModalGenerarSolicitudProps {
  muestras?: Muestra[];
  currentUser?: string;
  onClose: () => void;
  onCreated: (nueva: SolicitudProveedor) => Promise<void> | void;
}

export function ModalGenerarSolicitud({
  muestras = [],
  currentUser = 'Calidad STF',
  onClose,
  onCreated
}: ModalGenerarSolicitudProps) {
  const [selectedMuestraId, setSelectedMuestraId] = useState<string>('');
  const [proveedor, setProveedor] = useState<string>('');
  const [referencia, setReferencia] = useState<string>('');
  const [nombreTela, setNombreTela] = useState<string>('');
  const [color, setColor] = useState<string>('ESTÁNDAR');
  const [fechaVencimiento, setFechaVencimiento] = useState<string>('');
  const [observacionesInternas, setObservacionesInternas] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [token] = useState<string>(
    `STF-PROV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  );

  const handleSelectMuestra = (mId: string) => {
    setSelectedMuestraId(mId);
    if (!mId) return;

    const m = muestras.find(x => x.id === mId);
    if (m) {
      setProveedor(m.proveedor || '');
      setReferencia(m.referencia || '');
      setNombreTela(m.nombreTela || m.referencia || '');
      setColor(m.color || 'ESTÁNDAR');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!proveedor.trim() || !referencia.trim()) {
      setErrorMsg('Debe especificar el Proveedor y la Referencia.');
      return;
    }

    setIsSubmitting(true);
    try {
      const nuevaSolicitud: SolicitudProveedor = {
        id: `sol-prov-${Date.now()}`,
        token,
        muestraId: selectedMuestraId || undefined,
        proveedor: proveedor.trim(),
        referencia: referencia.trim(),
        nombreTela: nombreTela.trim() || referencia.trim(),
        color: color.trim() || 'ESTÁNDAR',
        creadoPor: currentUser,
        fechaCreacion: new Date().toISOString(),
        fechaVencimiento: fechaVencimiento || undefined,
        estado: 'enviado'
      };

      await onCreated(nuevaSolicitud);
      onClose();
    } catch (err: any) {
      console.error("Error creando solicitud de proveedor:", err);
      setErrorMsg(err?.message || 'Error al generar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto font-sans">
      <div className="bg-[#2B2B2E] text-[#FBF8F2] rounded-3xl w-full max-w-xl shadow-2xl border border-[#424246] overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-[#2D2D30] px-6 py-4 flex items-center justify-between border-b border-[#424246]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/40">
              <Link className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-black uppercase tracking-wider text-[#FBF8F2]">
                Generar Solicitud a Proveedor
              </h3>
              <p className="text-xs text-[#AA9E80] font-bold mt-0.5">
                Crea un enlace seguro con token para que el fabricante diligencie la Ficha Técnica.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#AA9E80] hover:text-white hover:bg-[#424246] rounded-xl cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs bg-[#2B2B2E]">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500 text-rose-300 rounded-xl font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {muestras.length > 0 && (
            <div>
              <label className="block font-black uppercase text-[#AA9E80] mb-1">
                Vincular a Muestra Existente (Opcional)
              </label>
              <select
                value={selectedMuestraId}
                onChange={(e) => handleSelectMuestra(e.target.value)}
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl px-3.5 py-2.5 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466]"
              >
                <option value="">-- Ingresar datos manualmente --</option>
                {muestras.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.referencia} — {m.proveedor} ({m.color})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black uppercase text-[#AA9E80] mb-1">
                Empresa Proveedora *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Tejidos Lafayette, Vicunha"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl px-3.5 py-2.5 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466] placeholder-[#AA9E80]"
              />
            </div>

            <div>
              <label className="block font-black uppercase text-[#AA9E80] mb-1">
                Referencia Textil *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: REF-DENIM-902"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl px-3.5 py-2.5 text-[#FBF8F2] font-mono font-bold focus:outline-none focus:border-[#C6A466] placeholder-[#AA9E80]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black uppercase text-[#AA9E80] mb-1">
                Nombre de la Tela
              </label>
              <input
                type="text"
                placeholder="Ej: Denim Stretch 11 Oz"
                value={nombreTela}
                onChange={(e) => setNombreTela(e.target.value)}
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl px-3.5 py-2.5 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466] placeholder-[#AA9E80]"
              />
            </div>

            <div>
              <label className="block font-black uppercase text-[#AA9E80] mb-1">
                Color
              </label>
              <input
                type="text"
                placeholder="Ej: 001 INDIGO INTENSO"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl px-3.5 py-2.5 text-[#FBF8F2] font-bold uppercase focus:outline-none focus:border-[#C6A466] placeholder-[#AA9E80]"
              />
            </div>
          </div>

          <div className="p-4 bg-[#2D2D30] border border-[#C6A466]/40 rounded-2xl">
            <span className="text-[10px] uppercase font-black tracking-wider text-[#C6A466] block mb-1">
              Token Seguro a Generar:
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#FBF8F2] text-xs">{token}</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">Enlace público directo</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#424246]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-[#AA9E80] hover:text-white bg-[#2D2D30] hover:bg-[#38383B] rounded-xl transition-all"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#1E1E21] font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all"
            >
              {isSubmitting ? 'Generando...' : 'Generar Solicitud'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default ModalGenerarSolicitud;
