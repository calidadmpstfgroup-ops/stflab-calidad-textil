import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { MuestraTextil, MarcaType } from '../../types';
import * as XLSX from 'xlsx';
import { 
  X, 
  FileSpreadsheet, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const BulkImportModal: React.FC = () => {
  const { modalImportarAbierto, setModalImportarAbierto, importarMuestrasMasivas, muestras } = useQuality();
  const [textoPegado, setTextoPegado] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [mensajeResultado, setMensajeResultado] = useState<string | null>(null);

  if (!modalImportarAbierto) return null;

  const normalizarMarca = (marcaStr: string): MarcaType => {
    const m = (marcaStr || '').toLowerCase();
    if (m.includes('ela')) return 'ELA';
    if (m.includes('men') || m.includes('hombre')) return 'Studio F Men';
    if (m.includes('outlet')) return 'Outlet';
    return 'Studio F';
  };

  const procesarFilasImportadas = (filas: any[]) => {
    const hoyStr = new Date().toISOString().split('T')[0];
    let contador = muestras.length + 1;

    const nuevasMuestras: MuestraTextil[] = filas
      .filter((fila) => fila.referencia || fila.Referencia || fila.Producto || fila.tela || fila.Tela)
      .map((fila) => {
        const ref = fila.referencia || fila.Referencia || fila.Producto || fila.PRODUCTO || fila.tela || fila.Tela || 'MATERIAL TEXTIL';
        const prov = fila.proveedor || fila.Proveedor || fila.vendor || fila.Vendor || fila.Confeccionista || 'PROVEEDOR IMPORTADO';
        const marcaRaw = fila.marca || fila.Marca || fila.brand || fila.Brand || 'Studio F';
        const marca = normalizarMarca(marcaRaw);
        const op = fila.ordenCompra || fila.oc || fila.OC || fila.op || fila.OP || `OAC ${1100 + contador}`;
        const lote = fila.lote || fila.Lote || `LOT-IMP-${contador}`;
        const color = fila.color || fila.Color || 'ESTÁNDAR';
        const unidades = parseInt(fila.unidades || fila.cantidad || fila.Qty || 2000, 10) || 2000;
        const comp = fila.composicion || fila.Composicion || '100% Algodón';
        const gramaje = parseFloat(fila.gramaje || fila.Gramaje || fila.gsm || 210) || 210;

        const codigoMT = `MT-2026-${String(contador).padStart(4, '0')}`;
        const numeroReporte = `LAB-${9400 + contador}`;
        contador++;

        return {
          id: `mt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          codigoMT,
          numeroReporte,
          referencia: String(ref).toUpperCase(),
          tipoMaterial: 'Tela Plana',
          proveedor: String(prov).toUpperCase(),
          ordenCompra: String(op),
          lote: String(lote),
          color: String(color).toUpperCase(),
          marca,
          unidades,
          fechaIngreso: hoyStr,
          dictamenFinal: 'EN_PROCESO',
          causasNoConformidad: [],
          observacionesGenerales: 'Lote importado masivamente.',
          prioridad: 'Media',
          fichaProveedor: {
            tokenAcceso: `#FT-2026-${String(contador).padStart(4, '0')}`,
            completadaPorProveedor: true,
            composicionDeclarada: comp,
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
              responsable: 'Carlos Mendoza (Lab)',
              observaciones: 'Programado para ensayo.',
            },
            compras: {
              estado: 'COMPLETO',
              dictamen: 'APROBADO',
              fechaInicio: hoyStr,
              responsable: 'Compras Import',
            },
            patronaje: { estado: 'PENDIENTE', dictamen: 'PENDIENTE' },
            corte: { estado: 'PENDIENTE', dictamen: 'PENDIENTE' },
            prendas: { estado: 'PENDIENTE', dictamen: 'PENDIENTE' },
          },
          ensayos: {
            composicion: comp,
            gramajeGsm: { valor: gramaje, unidad: 'g/m²', norma: 'ASTM D3776', resultado: 'CONFORME' },
          },
          historial: [
            {
              id: `h-${Date.now()}`,
              fecha: hoyStr,
              area: 'compras',
              usuario: 'Sistema Batch',
              accion: 'Importación Masiva',
              detalle: `Ingreso masivo de muestra ${codigoMT}.`,
            },
          ],
        };
      });

    if (nuevasMuestras.length > 0) {
      importarMuestrasMasivas(nuevasMuestras);
      setMensajeResultado(`¡Se importaron ${nuevasMuestras.length} muestras exitosamente!`);
      setTimeout(() => {
        setModalImportarAbierto(false);
      }, 1500);
    } else {
      setMensajeResultado('No se detectaron filas válidas con nombre de referencia.');
    }
  };

  const handleArchivoExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcesando(true);
    setMensajeResultado(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);
        procesarFilasImportadas(data);
      } catch (err) {
        console.error('Error procesando archivo Excel:', err);
        setMensajeResultado('Error al leer el archivo Excel.');
      } finally {
        setProcesando(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handlePegarTexto = () => {
    if (!textoPegado.trim()) return;
    setProcesando(true);
    setMensajeResultado(null);

    try {
      const lineas = textoPegado.trim().split('\n');
      const filas: any[] = [];

      lineas.forEach((linea) => {
        const cols = linea.split('\t');
        if (cols.length >= 2) {
          filas.push({
            referencia: cols[0]?.trim(),
            proveedor: cols[1]?.trim(),
            marca: cols[2]?.trim() || 'Studio F',
            ordenCompra: cols[3]?.trim() || 'OAC 1120',
          });
        } else {
          const comas = linea.split(';');
          if (comas.length >= 2) {
            filas.push({
              referencia: comas[0]?.trim(),
              proveedor: comas[1]?.trim(),
              marca: comas[2]?.trim() || 'Studio F',
              ordenCompra: comas[3]?.trim() || 'OAC 1120',
            });
          }
        }
      });

      procesarFilasImportadas(filas);
    } catch (e) {
      setMensajeResultado('Error parseando el texto pegado.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2B2E]/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#2B2B2E] border border-[#424246] rounded-3xl shadow-2xl p-6 sm:p-7 text-[#FBF8F2] my-8">
        
        <button
          onClick={() => setModalImportarAbierto(false)}
          className="absolute top-5 right-5 p-2 text-[#AA9E80] hover:text-white hover:bg-[#424246] rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#C6A466]/20 border border-[#C6A466]/30 flex items-center justify-center text-[#C6A466]">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-[#FBF8F2] tracking-wide uppercase">Importación Masiva de Muestras / Documentos</h3>
            <p className="text-xs text-[#AA9E80]">Carga archivos Excel (.xlsx, .csv) o pega tablas de compras.</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* Opción 1: Archivo Excel */}
          <div className="bg-[#2D2D30] p-4 rounded-2xl border border-dashed border-[#424246] hover:border-[#C6A466] transition-colors text-center">
            <Upload className="w-8 h-8 text-[#C6A466] mx-auto mb-2" />
            <p className="font-bold text-[#FBF8F2]">Subir archivo Excel (.xlsx / .csv)</p>
            <p className="text-[11px] text-[#AA9E80] mt-0.5">Detecta encabezados como Referencia, Proveedor, Marca, Orden de Compra.</p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleArchivoExcel}
              className="mt-3 text-xs text-[#AA9E80] file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#485C3E] file:text-[#FBF8F2] hover:file:bg-[#5A734E] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 my-2">
            <div className="h-px bg-[#424246] flex-1"></div>
            <span className="text-[11px] font-bold text-[#8A8172] uppercase tracking-wider">O PEGAR TABLA DIRECTA</span>
            <div className="h-px bg-[#424246] flex-1"></div>
          </div>

          {/* Opción 2: Pegar tabla */}
          <div>
            <label className="block font-semibold text-[#AA9E80] mb-1">
              Pegar filas copiadas de Excel (Referencia [TAB] Proveedor [TAB] Marca [TAB] OP):
            </label>
            <textarea
              rows={4}
              value={textoPegado}
              onChange={(e) => setTextoPegado(e.target.value)}
              placeholder="Ejemplo:
TELA LINO MOURA	SHANGHAI JOY	Studio F	OAC 1107
POPELINA PIMA	TEXTILES LAFAYETTE	Studio F Men	OAC 1108"
              className="w-full bg-[#2D2D30] border border-[#424246] rounded-xl p-3 text-xs text-[#FBF8F2] font-mono focus:outline-none focus:border-[#C6A466]"
            />
          </div>

          {mensajeResultado && (
            <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              mensajeResultado.includes('exitosamente')
                ? 'bg-[#EEF3EA] border-[#94A786] text-[#485C3E]'
                : 'bg-[#F9F3E3] border-[#DEC987] text-[#7A6428]'
            }`}>
              {mensajeResultado.includes('exitosamente') ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{mensajeResultado}</span>
            </div>
          )}

          <div className="pt-3 border-t border-[#424246] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalImportarAbierto(false)}
              className="px-4 py-2 bg-[#2D2D30] hover:bg-[#424246] border border-[#424246] text-[#AA9E80] font-bold rounded-xl cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              disabled={procesando || !textoPegado.trim()}
              onClick={handlePegarTexto}
              className="px-5 py-2 bg-[#485C3E] hover:bg-[#5A734E] disabled:opacity-50 text-[#FBF8F2] font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {procesando ? 'Procesando...' : 'Procesar e Importar Filas'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
