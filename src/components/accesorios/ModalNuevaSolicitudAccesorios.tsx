import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  FileSpreadsheet, 
  Camera, 
  FileText, 
  Sparkles, 
  AlertCircle,
  Package,
  Layers,
  Send,
  ClipboardList
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SolicitudAccesorios, MuestraAccesorioItem, User } from '../../types';

interface ModalNuevaSolicitudAccesoriosProps {
  currentUser: User | null;
  solicitudesExistentes: SolicitudAccesorios[];
  onSave: (nueva: SolicitudAccesorios) => Promise<void> | void;
  onClose: () => void;
}

export const ModalNuevaSolicitudAccesorios: React.FC<ModalNuevaSolicitudAccesoriosProps> = ({
  currentUser,
  solicitudesExistentes = [],
  onSave,
  onClose
}) => {
  const nextNum = solicitudesExistentes.length + 1;
  const codigoAutogenerado = `ACC-${String(nextNum).padStart(5, '0')}`;

  const [codigoSolicitud, setCodigoSolicitud] = useState(codigoAutogenerado);
  const [titulo, setTitulo] = useState('');
  const [marca, setMarca] = useState<'STUDIO F' | 'ELA' | 'STF MAN' | 'TOP CLASS' | 'OTRA'>('STUDIO F');
  const [prioridad, setPrioridad] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  const [fechaEsperada, setFechaEsperada] = useState('');
  const [observacionesGenerales, setObservacionesGenerales] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [items, setItems] = useState<MuestraAccesorioItem[]>([
    {
      id: `item-${Date.now()}-1`,
      filaNumero: 1,
      referencia: '',
      color: '',
      talla: '',
      cantidad: 1,
      unidad: 'UNID',
      descripcion: '',
      linea: 'Dama',
      observacionCompras: '',
      estadoLab: 'Pendiente'
    }
  ]);

  const handleAddItem = () => {
    const nextRow = items.length + 1;
    setItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}-${nextRow}`,
        filaNumero: nextRow,
        referencia: '',
        color: '',
        talla: '',
        cantidad: 1,
        unidad: 'UNID',
        descripcion: '',
        linea: 'Dama',
        observacionCompras: '',
        estadoLab: 'Pendiente'
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      setErrorMsg('La solicitud debe contener al menos un accesorio.');
      return;
    }
    setItems(prev => {
      const filtered = prev.filter(it => it.id !== id);
      return filtered.map((it, idx) => ({ ...it, filaNumero: idx + 1 }));
    });
  };

  const handleItemChange = (id: string, field: keyof MuestraAccesorioItem, value: any) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validItems = items.filter(it => it.referencia.trim() !== '');
    if (validItems.length === 0) {
      setErrorMsg('Debe registrar al menos una muestra con referencia válida.');
      return;
    }

    setIsSubmitting(true);

    try {
      const nuevaSolicitud: SolicitudAccesorios = {
        id: `SOL-ACC-${Date.now()}`,
        codigoSolicitud: codigoSolicitud.trim() || codigoAutogenerado,
        titulo: titulo.trim() || `Lote de Accesorios ${marca} - ${new Date().toLocaleDateString('es-CO')}`,
        solicitante: {
          nombre: currentUser?.name || 'Compras',
          area: 'Compras',
          email: currentUser?.username || ''
        },
        fechaSolicitud: new Date().toISOString().split('T')[0],
        fechaEsperada: fechaEsperada || undefined,
        prioridad,
        marca,
        estadoGeneral: 'Enviada a Laboratorio',
        observacionesGenerales: observacionesGenerales.trim() || undefined,
        items: validItems.map((it, idx) => ({
          ...it,
          filaNumero: idx + 1
        })),
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString()
      };

      await onSave(nuevaSolicitud);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al guardar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto font-sans">
      <div className="bg-[#2B2B2E] text-[#FBF8F2] rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-[#424246] overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-[#2D2D30] px-6 py-4 flex items-center justify-between border-b border-[#424246] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/40">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-black uppercase tracking-wider text-[#FBF8F2]">
                Nueva Solicitud de Ensayos — Insumos
              </h2>
              <p className="text-[#AA9E80] text-xs font-bold mt-0.5">
                Registro de botones, cremalleras, herrajes y pasamanería para evaluación en Laboratorio
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#AA9E80] hover:text-white hover:bg-[#424246] cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs bg-[#2B2B2E] custom-vertical-scroll">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1 */}
          <div className="bg-[#2D2D30] border border-[#424246] rounded-2xl p-5 space-y-4 shadow-md">
            <h3 className="text-xs font-black text-[#C6A466] uppercase tracking-wider">
              1. Información General de la Solicitud
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[#AA9E80] font-black uppercase mb-1">Marca *</label>
                <select
                  value={marca}
                  onChange={(e) => setMarca(e.target.value as any)}
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl px-3.5 py-2.5 text-[#FBF8F2] font-bold cursor-pointer focus:outline-none focus:border-[#C6A466]"
                >
                  <option value="STUDIO F">STUDIO F</option>
                  <option value="ELA">ELA</option>
                  <option value="STF MAN">STF MAN</option>
                  <option value="TOP CLASS">TOP CLASS</option>
                  <option value="OTRA">OTRA</option>
                </select>
              </div>

              <div>
                <label className="block text-[#AA9E80] font-black uppercase mb-1">Prioridad</label>
                <select
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value as any)}
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl px-3.5 py-2.5 text-[#FBF8F2] font-bold cursor-pointer focus:outline-none focus:border-[#C6A466]"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-[#AA9E80] font-black uppercase mb-1">Fecha Esperada</label>
                <input
                  type="date"
                  value={fechaEsperada}
                  onChange={(e) => setFechaEsperada(e.target.value)}
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl px-3.5 py-2.5 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#AA9E80] font-black uppercase mb-1">Título / Motivo</label>
              <input
                type="text"
                placeholder="Ej: Evaluación botones metálicos Colección Denim"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl px-3.5 py-2.5 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466] placeholder-[#AA9E80]"
              />
            </div>
          </div>

          {/* Section 2: Items */}
          <div className="bg-[#2D2D30] border border-[#424246] rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-[#C6A466] uppercase tracking-wider">
                2. Listado de Muestras / Accesorios ({items.length}) — Referencia • Color • Talla • QTY
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3.5 py-2 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#1E1E21] font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm uppercase tracking-wider"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Agregar Fila</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-[#424246] rounded-xl max-h-[300px] custom-vertical-scroll">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#252528] text-[#FBF8F2] font-black border-b border-[#424246] sticky top-0 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3 min-w-[140px] text-[#C6A466]">Referencia *</th>
                    <th className="py-3 px-3 min-w-[110px] text-[#C6A466]">Color</th>
                    <th className="py-3 px-3 min-w-[90px] text-[#C6A466]">Talla / Medida</th>
                    <th className="py-3 px-3 min-w-[80px] text-[#C6A466]">Cantidad</th>
                    <th className="py-3 px-3 min-w-[80px]">Unidad</th>
                    <th className="py-3 px-3 min-w-[180px]">Descripción</th>
                    <th className="py-3 px-3 min-w-[120px]">Observación Compras</th>
                    <th className="py-3 px-2 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#424246] text-[#FBF8F2] font-bold">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-[#38383B] hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[#C6A466]/20 transition-all">
                      <td className="py-2.5 px-3 text-center font-mono text-[#AA9E80] font-bold">{index + 1}</td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          required
                          placeholder="MI00409922"
                          value={item.referencia}
                          onChange={(e) => handleItemChange(item.id, 'referencia', e.target.value)}
                          className="w-full bg-[#2B2B2E] border border-[#424246] rounded-lg px-2.5 py-1.5 text-[#FBF8F2] font-mono font-bold focus:outline-none focus:border-[#C6A466]"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          placeholder="000 NEGRO"
                          value={item.color || ''}
                          onChange={(e) => handleItemChange(item.id, 'color', e.target.value)}
                          className="w-full bg-[#2B2B2E] border border-[#424246] rounded-lg px-2.5 py-1.5 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466]"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          placeholder="24L"
                          value={item.talla || ''}
                          onChange={(e) => handleItemChange(item.id, 'talla', e.target.value)}
                          className="w-full bg-[#2B2B2E] border border-[#424246] rounded-lg px-2.5 py-1.5 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466]"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad || 1}
                          onChange={(e) => handleItemChange(item.id, 'cantidad', Number(e.target.value) || 1)}
                          className="w-full bg-[#2B2B2E] border border-[#424246] rounded-lg px-2.5 py-1.5 text-[#C6A466] font-mono font-black text-center focus:outline-none focus:border-[#C6A466]"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={item.unidad || 'UNID'}
                          onChange={(e) => handleItemChange(item.id, 'unidad', e.target.value)}
                          className="w-full bg-[#2B2B2E] border border-[#424246] rounded-lg px-2.5 py-1.5 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466]"
                        >
                          <option value="UNID">UNID</option>
                          <option value="PARES">PARES</option>
                          <option value="JUEGOS">JUEGOS</option>
                          <option value="METROS">METROS</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          placeholder="Botón zamak niquelado"
                          value={item.descripcion || ''}
                          onChange={(e) => handleItemChange(item.id, 'descripcion', e.target.value)}
                          className="w-full bg-[#2B2B2E] border border-[#424246] rounded-lg px-2.5 py-1.5 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466]"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          placeholder="Nota compras..."
                          value={item.observacionCompras || ''}
                          onChange={(e) => handleItemChange(item.id, 'observacionCompras', e.target.value)}
                          className="w-full bg-[#2B2B2E] border border-[#424246] rounded-lg px-2.5 py-1.5 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466]"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-[#AA9E80] hover:text-rose-400 cursor-pointer transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-[#2D2D30] border border-[#424246] rounded-2xl p-5 space-y-2 shadow-md">
            <label className="block text-[#AA9E80] font-black uppercase mb-1">
              Observaciones Generales para el Laboratorio
            </label>
            <textarea
              rows={2}
              placeholder="Indique requerimientos especiales de laboratorio..."
              value={observacionesGenerales}
              onChange={(e) => setObservacionesGenerales(e.target.value)}
              className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-3 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466] placeholder-[#AA9E80]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#424246]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#2D2D30] hover:bg-[#38383B] text-[#AA9E80] font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#1E1E21] font-black text-xs uppercase rounded-xl shadow-md transition-all cursor-pointer tracking-wider"
            >
              {isSubmitting ? 'Enviando...' : `Enviar Solicitud (${items.filter(i => i.referencia.trim()).length} Muestras)`}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
