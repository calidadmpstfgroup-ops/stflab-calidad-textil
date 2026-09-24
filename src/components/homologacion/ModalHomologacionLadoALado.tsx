import React, { useState } from 'react';
import { Muestra, SolicitudProveedor, DatosProveedorFormulario } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Check,
  RotateCcw,
  Layers,
  Maximize2,
  FlaskConical,
  HeartHandshake,
  Download,
  FileText,
  X
} from 'lucide-react';

interface ModalHomologacionLadoALadoProps {
  isOpen: boolean;
  onClose: () => void;
  muestra: Muestra;
  solicitud: SolicitudProveedor;
  onHomologar: (muestraId: string, updatedFields: Partial<Muestra>, solicitudId: string) => Promise<void> | void;
}

export const ModalHomologacionLadoALado: React.FC<ModalHomologacionLadoALadoProps> = ({
  isOpen,
  onClose,
  muestra,
  solicitud,
  onHomologar
}) => {
  const d = solicitud.datosProveedor || {} as Partial<DatosProveedorFormulario>;

  const comparisonFields = [
    {
      id: 'composicion',
      label: 'Composición Textil',
      category: 'Fibras & Hilos',
      currentValue: muestra.composicion || 'Sin especificar',
      providerValue: d.composicion,
      applyToMuestra: (m: Muestra, val: any) => ({ composicion: String(val) })
    },
    {
      id: 'pesoGsm',
      label: 'Gramaje Esperado (g/m²)',
      category: 'Dimensiones & Rendimiento',
      unit: 'g/m²',
      currentValue: muestra.fichaTecnica?.gramajeEsperado ?? '-',
      providerValue: d.pesoGsm,
      applyToMuestra: (m: Muestra, val: any) => ({
        fichaTecnica: { ...m.fichaTecnica, gramajeEsperado: Number(val) },
        pruebas: { ...m.pruebas, gramajeMedido: Number(val) }
      })
    },
    {
      id: 'anchoUtil',
      label: 'Ancho Útil / Cortable (m)',
      category: 'Dimensiones & Rendimiento',
      unit: 'm',
      currentValue: muestra.fichaTecnica?.anchoEsperado ?? '-',
      providerValue: d.anchoUtil,
      applyToMuestra: (m: Muestra, val: any) => ({
        fichaTecnica: { ...m.fichaTecnica, anchoEsperado: Number(val) },
        pruebas: { ...m.pruebas, anchoMedido: Number(val) }
      })
    },
    {
      id: 'encogimientoLargo',
      label: 'Encogimiento Largo (AATCC 135)',
      category: 'Laboratorio & Tolerancias',
      unit: '%',
      currentValue: muestra.fichaTecnica?.encogimientoLargoEsperado ?? muestra.fichaTecnica?.encogimientoEsperado ?? '-',
      providerValue: d.encogimientoLargo,
      applyToMuestra: (m: Muestra, val: any) => ({
        fichaTecnica: { ...m.fichaTecnica, encogimientoLargoEsperado: Number(val), encogimientoEsperado: Number(val) },
        pruebas: { ...m.pruebas, encogimientoLargo: Number(val), encogimientoMedido: Number(val) }
      })
    },
    {
      id: 'encogimientoAncho',
      label: 'Encogimiento Ancho (AATCC 135)',
      category: 'Laboratorio & Tolerancias',
      unit: '%',
      currentValue: muestra.fichaTecnica?.encogimientoAnchoEsperado ?? '-',
      providerValue: d.encogimientoAncho,
      applyToMuestra: (m: Muestra, val: any) => ({
        fichaTecnica: { ...m.fichaTecnica, encogimientoAnchoEsperado: Number(val) },
        pruebas: { ...m.pruebas, encogimientoAncho: Number(val) }
      })
    },
    {
      id: 'solidezLavado',
      label: 'Solidez al Lavado (ISO 105)',
      category: 'Laboratorio & Tolerancias',
      currentValue: muestra.fichaTecnica?.solidezLavadoEsperado ?? muestra.pruebas?.solidezLavado ?? '-',
      providerValue: d.solidezLavadoCambioColor,
      applyToMuestra: (m: Muestra, val: any) => ({
        fichaTecnica: { ...m.fichaTecnica, solidezLavadoEsperado: String(val) },
        pruebas: { ...m.pruebas, solidezLavado: String(val), solidezColor: String(val) }
      })
    }
  ];

  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>(() => {
    return comparisonFields
      .filter(f => f.providerValue !== undefined && f.providerValue !== null && f.providerValue !== '')
      .map(f => f.id);
  });

  const [isHomologating, setIsHomologating] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    const available = comparisonFields
      .filter(f => f.providerValue !== undefined && f.providerValue !== null && f.providerValue !== '')
      .map(f => f.id);

    if (selectedFieldIds.length === available.length) {
      setSelectedFieldIds([]);
    } else {
      setSelectedFieldIds(available);
    }
  };

  const toggleField = (id: string) => {
    setSelectedFieldIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleConfirmar = async () => {
    setIsHomologating(true);
    try {
      let updated: any = {
        observaciones: `${muestra.observaciones || ''}\n[Homologado Proveedor ${solicitud.proveedor}]: Lote ${d.nroLote || 'N/A'}`.trim()
      };

      for (const field of comparisonFields) {
        if (selectedFieldIds.includes(field.id) && field.providerValue !== undefined && field.providerValue !== null && field.providerValue !== '') {
          const applied = field.applyToMuestra(muestra, field.providerValue);
          updated = {
            ...updated,
            ...applied,
            fichaTecnica: {
              ...(muestra.fichaTecnica || {}),
              ...(updated.fichaTecnica || {}),
              ...((applied as any).fichaTecnica || {})
            },
            pruebas: {
              ...(muestra.pruebas || {}),
              ...(updated.pruebas || {}),
              ...((applied as any).pruebas || {})
            }
          };
        }
      }

      await onHomologar(muestra.id, updated, solicitud.id);
      onClose();
    } finally {
      setIsHomologating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2B2B2E]/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#2B2B2E] text-[#FBF8F2] rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-[#424246] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#2D2D30] p-5 border-b border-[#424246] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#C6A466]/20 rounded-2xl border border-[#C6A466]/30 text-[#C6A466]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase text-[#C6A466] bg-[#C6A466]/10 px-2 py-0.5 rounded-full border border-[#C6A466]/30">
                  Homologación Lado a Lado
                </span>
                <span className="text-xs text-[#AA9E80] font-mono">Token: {solicitud.token}</span>
              </div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#FBF8F2] mt-0.5 uppercase tracking-wide">
                Comparar & Homologar: {muestra.referencia}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#AA9E80] hover:text-white rounded-xl hover:bg-[#424246] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="bg-[#2D2D30]/60 border-b border-[#424246] px-6 py-3 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="px-3 py-1.5 bg-[#2D2D30] hover:bg-[#424246] text-[#AA9E80] font-bold border border-[#424246] rounded-xl transition-colors cursor-pointer"
          >
            {selectedFieldIds.length > 0 ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
          </button>
          <span className="text-[#AA9E80]">
            {selectedFieldIds.length} campos seleccionados para actualizar en la ficha oficial
          </span>
        </div>

        {/* Comparison Table */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs custom-vertical-scroll">
          <div className="border border-[#424246] rounded-2xl overflow-hidden bg-[#2D2D30]">
            <table className="w-full text-left">
              <thead className="bg-[#2B2B2E] text-[#AA9E80] font-bold uppercase text-[10px] border-b border-[#424246]">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">Act.</th>
                  <th className="py-3 px-4">Parámetro</th>
                  <th className="py-3 px-4">Valor Actual STFLab</th>
                  <th className="py-3 px-4 text-[#C6A466]">Ficha del Proveedor</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#424246]">
                {comparisonFields.map((field) => {
                  const hasProviderVal = field.providerValue !== undefined && field.providerValue !== null && field.providerValue !== '';
                  const isSelected = selectedFieldIds.includes(field.id);
                  const isDifferent = String(field.currentValue).trim() !== String(field.providerValue).trim();

                  return (
                    <tr 
                      key={field.id}
                      onClick={() => hasProviderVal && toggleField(field.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#C6A466]/10' : 'hover:bg-[#2B2B2E]/60'
                      }`}
                    >
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          disabled={!hasProviderVal}
                          checked={isSelected}
                          onChange={() => toggleField(field.id)}
                          className="rounded bg-[#2B2B2E] border-[#424246] text-[#C6A466]"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-[#FBF8F2]">{field.label}</div>
                        <div className="text-[10px] text-[#8A8172]">{field.category}</div>
                      </td>

                      <td className="py-3 px-4 text-[#AA9E80]">
                        {field.currentValue !== undefined && field.currentValue !== null && field.currentValue !== ''
                          ? `${field.currentValue} ${field.unit || ''}`
                          : <span className="text-[#8A8172] italic">No registrado</span>}
                      </td>

                      <td className="py-3 px-4 font-bold text-[#C6A466]">
                        {hasProviderVal ? `${field.providerValue} ${field.unit || ''}` : <span className="text-[#8A8172] italic font-normal">Sin dato</span>}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isDifferent ? (
                          <span className="text-[#C6A466] bg-[#C6A466]/10 px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#C6A466]/30">
                            Actualizar
                          </span>
                        ) : (
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20">
                            Idéntico
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#2D2D30] p-4 px-6 border-t border-[#424246] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[#AA9E80] hover:text-white text-xs font-bold cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={selectedFieldIds.length === 0 || isHomologating}
            onClick={handleConfirmar}
            className="px-5 py-2.5 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#2B2B2E] text-xs font-bold uppercase rounded-xl transition-all shadow-sm flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Homologar {selectedFieldIds.length} Campos a la Ficha Oficial</span>
          </button>
        </div>
      </div>
    </div>
  );
};
