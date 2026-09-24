import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { MarcaType, DictamenType } from '../../types';
import { X, PlusCircle, Sparkles } from 'lucide-react';

export const NewSampleModal: React.FC = () => {
  const { modalNuevaMuestraAbierto, setModalNuevaMuestraAbierto, agregarMuestra, muestras } = useQuality();

  const [referencia, setReferencia] = useState('');
  const [proveedor, setProveedor] = useState('COLTEJER');
  const [marca, setMarca] = useState<MarcaType>('Studio F');
  const [tipoMaterial, setTipoMaterial] = useState<any>('Tela Plana');
  const [ordenCompra, setOrdenCompra] = useState('OAC 1115');
  const [lote, setLote] = useState('LOT-2026-01');
  const [color, setColor] = useState('001 CRUDO');
  const [unidades, setUnidades] = useState(2000);
  const [composicion, setComposicion] = useState('100% Algodón');
  const [gramaje, setGramaje] = useState(210);

  if (!modalNuevaMuestraAbierto) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referencia.trim()) {
      alert('Por favor ingresa la referencia de la tela o material.');
      return;
    }

    const consecutivo = muestras.length + 1;
    const codigoMT = `MT-2026-${String(consecutivo).padStart(4, '0')}`;
    const numeroReporte = `LAB-${9400 + consecutivo}`;
    const hoyStr = new Date().toISOString().split('T')[0];

    agregarMuestra({
      codigoMT,
      numeroReporte,
      referencia,
      tipoMaterial,
      proveedor,
      ordenCompra,
      lote,
      color,
      marca,
      unidades,
      fechaIngreso: hoyStr,
      dictamenFinal: 'EN_PROCESO',
      causasNoConformidad: [],
      observacionesGenerales: 'Muestra ingresada para proceso integral de control de calidad.',
      prioridad: 'Media',
      fichaProveedor: {
        tokenAcceso: `#FT-2026-${String(consecutivo).padStart(4, '0')}`,
        completadaPorProveedor: false,
        composicionDeclarada: composicion,
        gramajeGsm: gramaje,
        anchoUtilM: 1.48,
        encogimientoLargoEstimado: -2.0,
        encogimientoAnchoEstimado: -2.5,
      },
      fichaMaestraSTF: {
        gramajeObjetivo: gramaje,
        toleranciaGramajePorc: 5,
        encogimientoLargoMax: -3.0,
        encogimientoAnchoMax: -3.5,
        viroMax: 3.0,
        solidezLavadoMin: 4.0,
        solidezFroteSecoMin: 4.0,
        solidezFroteHumedoMin: 3.0,
        anchoMinimoM: 1.45,
      },
      homologacion: {
        estado: 'PENDIENTE',
        diferenciasDetectadas: [],
      },
      decisionCompras: {
        decision: 'PENDIENTE',
      },
      trazabilidad: {
        laboratorio: {
          estado: 'EN_PROCESO',
          dictamen: 'EN_PROCESO',
          fechaInicio: hoyStr,
          responsable: 'Ing. Carlos Mendoza (Lab)',
          observaciones: 'Muestra en cola para ensayos físico-mecánicos.',
        },
        compras: {
          estado: 'COMPLETO',
          dictamen: 'APROBADO',
          fechaInicio: hoyStr,
          fechaFin: hoyStr,
          responsable: 'Marcela Gómez (Compras)',
          observaciones: 'Muestra recibida de proveedor.',
        },
        patronaje: {
          estado: 'PENDIENTE',
          dictamen: 'PENDIENTE',
          responsable: 'Elena Restrepo (Patronaje)',
        },
        corte: {
          estado: 'PENDIENTE',
          dictamen: 'PENDIENTE',
          responsable: 'Javier Ortiz (Corte)',
        },
        prendas: {
          estado: 'PENDIENTE',
          dictamen: 'PENDIENTE',
          responsable: 'Auditoría Prendas',
        },
      },
      ensayos: {
        composicion,
        gramajeGsm: { valor: gramaje, unidad: 'g/m²', norma: 'ASTM D3776', resultado: 'CONFORME' },
      },
      historial: [
        {
          id: `h-${Date.now()}`,
          fecha: hoyStr,
          area: 'compras',
          usuario: 'Marcela Gómez',
          accion: 'Registro de Ingreso',
          detalle: `Ingreso de muestra ${codigoMT} - ${referencia}.`,
        },
      ],
    });

    setModalNuevaMuestraAbierto(false);
    alert(`¡Muestra ${codigoMT} registrada exitosamente!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-2xl bg-[#2B2B2E] border border-[#424246] rounded-3xl shadow-2xl p-6 sm:p-7 text-[#FBF8F2] my-8 font-sans">
        
        <button
          type="button"
          onClick={() => setModalNuevaMuestraAbierto(false)}
          className="absolute top-5 right-5 p-2 text-[#AA9E80] hover:text-white hover:bg-[#424246] rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#C6A466]/20 border border-[#C6A466]/40 flex items-center justify-center text-[#C6A466]">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-black uppercase tracking-wide text-[#FBF8F2]">Registrar Nueva Muestra de Calidad (Telas)</h3>
            <p className="text-xs text-[#AA9E80] font-bold mt-0.5">Ingreso de tela o insumo para inicio de trazabilidad multidepartamental.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs bg-[#2B2B2E]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block font-black uppercase text-[#AA9E80] mb-1">Referencia / Nombre de Tela *:</label>
              <input
                type="text"
                required
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ej. TELA DENIM STRETCH 10.5 OZ"
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl p-3 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466] placeholder-[#AA9E80]"
              />
            </div>

            <div>
              <label className="block font-black uppercase text-[#AA9E80] mb-1">Proveedor / Fabricante:</label>
              <input
                type="text"
                required
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                placeholder="Ej. COLTEJER / LAFAYETTE"
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl p-3 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466] placeholder-[#AA9E80]"
              />
            </div>

            <div>
              <label className="block font-black uppercase text-[#AA9E80] mb-1">Marca Destino:</label>
              <select
                value={marca}
                onChange={(e) => setMarca(e.target.value as MarcaType)}
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl p-3 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466]"
              >
                <option value="Studio F">Studio F</option>
                <option value="ELA">ELA</option>
                <option value="Studio F Men">Studio F Men</option>
                <option value="Outlet">Outlet</option>
                <option value="Otras marcas">Otras marcas</option>
              </select>
            </div>

            <div>
              <label className="block font-black uppercase text-[#AA9E80] mb-1">Tipo de Material:</label>
              <select
                value={tipoMaterial}
                onChange={(e) => setTipoMaterial(e.target.value)}
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl p-3 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466]"
              >
                <option value="Tela Plana">Tela Plana</option>
                <option value="Tejido Punto">Tejido Punto</option>
                <option value="Denim">Denim</option>
                <option value="Insumo / Accesorio">Insumo / Accesorio</option>
              </select>
            </div>

            <div>
              <label className="block font-black uppercase text-[#AA9E80] mb-1">Orden de Compra / OP:</label>
              <input
                type="text"
                value={ordenCompra}
                onChange={(e) => setOrdenCompra(e.target.value)}
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl p-3 text-[#FBF8F2] font-mono font-bold focus:outline-none focus:border-[#C6A466]"
              />
            </div>

            <div>
              <label className="block font-black uppercase text-[#AA9E80] mb-1">Lote / Batch:</label>
              <input
                type="text"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl p-3 text-[#FBF8F2] font-mono font-bold focus:outline-none focus:border-[#C6A466]"
              />
            </div>

            <div>
              <label className="block font-black uppercase text-[#AA9E80] mb-1">Color / Tono:</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl p-3 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466]"
              />
            </div>

            <div>
              <label className="block font-black uppercase text-[#AA9E80] mb-1">Unidades / Metros recibidos:</label>
              <input
                type="number"
                inputMode="decimal"
                value={unidades}
                onChange={(e) => setUnidades(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl p-3 text-[#C6A466] font-mono font-black focus:outline-none focus:border-[#C6A466]"
              />
            </div>

            <div>
              <label className="block font-black uppercase text-[#AA9E80] mb-1">Composición Declarada:</label>
              <input
                type="text"
                value={composicion}
                onChange={(e) => setComposicion(e.target.value)}
                placeholder="Ej. 98% Algodón, 2% Spandex"
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl p-3 text-[#FBF8F2] font-bold focus:outline-none focus:border-[#C6A466] placeholder-[#AA9E80]"
              />
            </div>

            <div>
              <label className="block font-black uppercase text-[#AA9E80] mb-1">Gramaje Aproximado (g/m²):</label>
              <input
                type="number"
                inputMode="decimal"
                value={gramaje}
                onChange={(e) => setGramaje(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl p-3 text-[#C6A466] font-mono font-black focus:outline-none focus:border-[#C6A466]"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-[#424246] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalNuevaMuestraAbierto(false)}
              className="px-5 py-2.5 bg-[#2D2D30] hover:bg-[#38383B] text-[#AA9E80] font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#1E1E21] font-black uppercase text-xs rounded-xl shadow-md transition-all cursor-pointer tracking-wider"
            >
              Registrar Muestra & Generar MT
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
