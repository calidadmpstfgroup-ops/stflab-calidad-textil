import React, { useState } from 'react';
import { Muestra } from '../../types';
import {
  FileText,
  Plus,
  X,
  Sparkles,
  Link2,
  Building,
  Layers,
  CheckCircle2,
  Info
} from 'lucide-react';

interface ModalCrearFichaTecnicaProps {
  isOpen: boolean;
  onClose: () => void;
  onCrearFicha: (nuevaMuestra: Muestra, generarSolicitudProveedor: boolean) => Promise<void> | void;
  proveedoresSugeridos?: string[];
}

export const ModalCrearFichaTecnica: React.FC<ModalCrearFichaTecnicaProps> = ({
  isOpen,
  onClose,
  onCrearFicha,
  proveedoresSugeridos = ['LAFAYETTE', 'FABRICATO', 'VICUNHA', 'SUTEX', 'TEXTILES DEL PACIFICO', 'COLTEJER']
}) => {
  const [referencia, setReferencia] = useState<string>('');
  const [nombreTela, setNombreTela] = useState<string>('');
  const [proveedor, setProveedor] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [tipoTejido, setTipoTejido] = useState<string>('TEJIDO PLANO');
  const [composicion, setComposicion] = useState<string>('');
  const [gramajeEstimado, setGramajeEstimado] = useState<string>('');
  const [anchoEstimado, setAnchoEstimado] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [generarSolicitudInmediata, setGenerarSolicitudInmediata] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referencia.trim() || !proveedor.trim()) return;

    setIsSubmitting(true);
    try {
      const timestamp = Date.now();
      const codigoAuto = `FT-${new Date().getFullYear()}-${timestamp.toString().slice(-4)}`;

      const nuevaMuestra: Muestra = {
        id: `muestra-ft-${timestamp}`,
        codigo: codigoAuto,
        referencia: referencia.trim().toUpperCase(),
        nombreTela: (nombreTela.trim() || referencia.trim()).toUpperCase(),
        proveedor: proveedor.trim().toUpperCase(),
        color: color.trim() ? color.trim().toUpperCase() : 'ESTÁNDAR',
        nroLote: 'LOTE PENDIENTE',
        composicion: composicion.trim() || 'POR DEFINIR / PENDIENTE FICHA',
        paisOrigen: 'Colombia',
        fechaIngreso: new Date().toISOString().split('T')[0],
        resultadoFinal: 'Pendiente',
        dictamenLaboratorio: 'Pendiente',
        observaciones: observaciones.trim() 
          ? `[Expediente Ficha Creado]: ${observaciones.trim()}` 
          : 'Ficha técnica creada en Textiles. Pendiente recepción y homologación de datos del proveedor.',
        registradoPor: 'Textiles / Desarrollo STF Group',
        fichaTecnica: {
          gramajeEsperado: gramajeEstimado ? parseFloat(gramajeEstimado) : 0,
          anchoEsperado: anchoEstimado ? parseFloat(anchoEstimado) : 0,
          pesoMlEsperado: 0,
          encogimientoEsperado: -3.0,
          solidezLavadoEsperado: '4-5',
          pillingEsperado: '4'
        },
        pruebas: {
          encogimientoMedido: 0,
          elasticidadMedida: 0,
          recuperacion: 0,
          solidezColor: 'Pendiente ensayo',
          resistencia: 'Pendiente ensayo',
          pilling: 'Pendiente ensayo'
        }
      };

      await onCrearFicha(nuevaMuestra, generarSolicitudInmediata);
      onClose();
    } catch (err) {
      console.error('Error al crear ficha técnica:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#2B2B2E]/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-[#2B2B2E] rounded-3xl border border-[#424246] shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] relative m-auto text-[#FBF8F2]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-[#2D2D30] p-6 border-b border-[#424246] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#C6A466]/20 text-[#C6A466] rounded-2xl border border-[#C6A466]/30">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#FBF8F2] uppercase tracking-wide">Crear Nueva Ficha Técnica</h3>
              <p className="text-xs text-[#AA9E80]">Expediente maestro de materia prima para homologación y laboratorio.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#AA9E80] hover:text-white rounded-xl hover:bg-[#424246] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs custom-vertical-scroll">
          
          <div className="bg-[#2D2D30] border border-[#C6A466]/30 rounded-2xl p-3 flex items-start space-x-2 text-[#AA9E80]">
            <Info className="h-4 w-4 text-[#C6A466] mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              La ficha técnica registra los parámetros esperados de la tela para que el Laboratorio pueda compararlos y Compras decida la viabilidad del lote.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-[#AA9E80] mb-1">
                Referencia Textil <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ej. TELA LINO MOURA"
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl px-3 py-2 text-[#FBF8F2] font-mono font-bold uppercase focus:outline-none focus:border-[#C6A466]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#AA9E80] mb-1">
                Nombre Comercial de la Tela
              </label>
              <input
                type="text"
                value={nombreTela}
                onChange={(e) => setNombreTela(e.target.value)}
                placeholder="Ej. Lino Rústico Slub"
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl px-3 py-2 text-[#FBF8F2] focus:outline-none focus:border-[#C6A466]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#AA9E80] mb-1">
                Proveedor / Fabricante <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                list="proveedores-datalist"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                placeholder="Ej. LAFAYETTE, SUTEX..."
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl px-3 py-2 text-[#FBF8F2] font-bold uppercase focus:outline-none focus:border-[#C6A466]"
              />
              <datalist id="proveedores-datalist">
                {proveedoresSugeridos.map(p => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block font-semibold text-[#AA9E80] mb-1">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ej. 045 NATURAL CRUDO"
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl px-3 py-2 text-[#FBF8F2] uppercase focus:outline-none focus:border-[#C6A466]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#AA9E80] mb-1">
                Tipo de Tejido
              </label>
              <select
                value={tipoTejido}
                onChange={(e) => setTipoTejido(e.target.value)}
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl px-3 py-2 text-[#FBF8F2] font-semibold focus:outline-none focus:border-[#C6A466]"
              >
                <option value="TEJIDO PLANO">TEJIDO PLANO</option>
                <option value="TEJIDO DE PUNTO">TEJIDO DE PUNTO</option>
                <option value="DENIM / ÍNDIGO">DENIM / ÍNDIGO</option>
                <option value="NO TEJIDO">NO TEJIDO</option>
                <option value="OTRO">OTRO</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#AA9E80] mb-1">
                Composición Preliminar
              </label>
              <input
                type="text"
                value={composicion}
                onChange={(e) => setComposicion(e.target.value)}
                placeholder="Ej. 100% Lino / 98% Alg, 2% Ela"
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl px-3 py-2 text-[#FBF8F2] focus:outline-none focus:border-[#C6A466]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#AA9E80] mb-1">
                Ancho Útil (m)
              </label>
              <input
                type="number"
                step="0.01"
                value={anchoEstimado}
                onChange={(e) => setAnchoEstimado(e.target.value)}
                placeholder="Ej. 1.48"
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl px-3 py-2 text-[#FBF8F2] font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#AA9E80] mb-1">
                Gramaje (g/m²)
              </label>
              <input
                type="number"
                step="1"
                value={gramajeEstimado}
                onChange={(e) => setGramajeEstimado(e.target.value)}
                placeholder="Ej. 240"
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl px-3 py-2 text-[#FBF8F2] font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#AA9E80] mb-1">
              Observaciones Iniciales
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Detalles sobre uso previsto, temporada o contacto..."
              className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl p-2.5 text-[#FBF8F2] focus:outline-none focus:border-[#C6A466]"
            />
          </div>

          <div className="pt-3 border-t border-[#424246] flex justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#424246] text-[#AA9E80] hover:bg-[#424246] font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !referencia.trim() || !proveedor.trim()}
              className="px-5 py-2 rounded-xl bg-[#C6A466] hover:bg-[#D6CDB8] text-[#2B2B2E] font-bold shadow flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? 'Creando Ficha...' : 'Crear Ficha Técnica'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
