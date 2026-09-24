import React, { useState, useEffect } from 'react';
import { useQuality } from '../../context/QualityContext';
import { FichaTecnicaHistoricaVersionada, VersionFichaTecnica } from '../../types';
import { 
  BookOpen, 
  FileText, 
  Info, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  Save, 
  Download, 
  FileSpreadsheet,
  Camera,
  Plus,
  Trash2,
  CheckCircle,
  Link2,
  Sparkles,
  ArrowRight,
  Eye,
  Sliders,
  Paperclip
} from 'lucide-react';
import { ExploradorFichasModal } from '../fichas-tecnicas/ExploradorFichasModal';

export const BibliotecaView: React.FC = () => {
  const { fichasTecnicasHistorial, guardarFichaTecnicaProveedor } = useQuality();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFichaId, setSelectedFichaId] = useState<string>('');
  const [showToast, setShowToast] = useState<string | null>(null);

  const [isModalExploradorOpen, setIsModalExploradorOpen] = useState<boolean>(false);

  // Filtrado de Fichas Técnicas
  const filteredFichas = (fichasTecnicasHistorial || []).filter(f => 
    (f.referencia || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.codigoFT || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.referenciaProveedor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.proveedor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentFicha = filteredFichas.find(f => f.id === selectedFichaId) || filteredFichas[0] || null;
  const currentVersion: VersionFichaTecnica | undefined = currentFicha?.historialVersiones?.[currentFicha.historialVersiones.length - 1];

  // Estados editables de calibración
  const [editGramaje, setEditGramaje] = useState<number>(200);
  const [editAncho, setEditAncho] = useState<number>(1.48);
  const [editEncLargo, setEditEncLargo] = useState<number>(-2.5);
  const [editEncAncho, setEditEncAncho] = useState<number>(-3.0);
  const [editComposicion, setEditComposicion] = useState<string>('');
  const [editObservaciones, setEditObservaciones] = useState<string>('');

  useEffect(() => {
    if (currentVersion) {
      setEditGramaje(currentVersion.especificaciones?.gramajeDeclaradoGsm || 200);
      setEditAncho(currentVersion.especificaciones?.anchoUtilM || 1.48);
      setEditEncLargo(currentVersion.especificaciones?.encogimientoLargoMax || -2.5);
      setEditEncAncho(currentVersion.especificaciones?.encogimientoAnchoMax || -3.0);
      setEditComposicion(currentVersion.especificaciones?.composicion || '100% Algodón');
      setEditObservaciones(currentVersion.especificaciones?.observacionesFabricante || '');
    }
  }, [currentFicha?.id]);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleSaveAll = () => {
    if (!currentFicha || !currentVersion) return;

    const versionActualizada: VersionFichaTecnica = {
      ...currentVersion,
      especificaciones: {
        ...currentVersion.especificaciones,
        gramajeDeclaradoGsm: editGramaje,
        anchoUtilM: editAncho,
        encogimientoLargoMax: editEncLargo,
        encogimientoAnchoMax: editEncAncho,
        composicion: editComposicion,
        observacionesFabricante: editObservaciones
      }
    };

    guardarFichaTecnicaProveedor(currentFicha, versionActualizada);
    triggerToast('Ficha técnica y tolerancias actualizadas en la Base Histórica.');
  };

  const handleDownloadPDF = () => {
    if (!currentFicha) return;
    const reportContent = `
========================================
   FICHA TÉCNICA MAESTRA - STFLAB
========================================
Referencia: ${currentFicha.referencia}
Código FT: ${currentFicha.codigoFT}
Proveedor / Molino: ${currentFicha.proveedor}
Ref. Proveedor: ${currentFicha.referenciaProveedor}
Versión Actual: v${currentFicha.versionActual}
Fecha: ${new Date().toLocaleDateString('es-CO')}
----------------------------------------
ESPECIFICACIONES Y TOLERANCIAS:
- Composición Declarada: ${editComposicion}
- Gramaje Declarado: ${editGramaje} g/m²
- Ancho Útil: ${editAncho} m
- Encogimiento Largo Máx: ${editEncLargo}%
- Encogimiento Ancho Máx: ${editEncAncho}%
----------------------------------------
OBSERVACIONES DEL FABRICANTE:
"${editObservaciones || 'Sin observaciones adicionales.'}"
========================================
    STFLAB QUALITY 2.0 - STF GROUP
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Ficha_Tecnica_${currentFicha.codigoFT}_${currentFicha.referencia.replace(/\s+/g, '_')}.txt`;
    link.click();
    triggerToast('Reporte técnico descargado con éxito.');
  };

  const handleExportExcel = () => {
    if (!currentFicha) return;
    const csvContent = 
      `\"Propiedad\",\"Especificación Declarada\",\"Unidad\",\"Norma\"\n` +
      `\"Material / Tela\",\"${currentFicha.referencia}\",\"--\",\"--\"\n` +
      `\"Código FT\",\"${currentFicha.codigoFT}\",\"--\",\"--\"\n` +
      `\"Proveedor\",\"${currentFicha.proveedor}\",\"--\",\"--\"\n` +
      `\"Ref Proveedor\",\"${currentFicha.referenciaProveedor}\",\"--\",\"--\"\n` +
      `\"Composición\",\"${editComposicion}\",\"%\",\"AATCC 20A\"\n` +
      `\"Gramaje\",\"${editGramaje}\",\"g/m²\",\"ASTM D3776\"\n` +
      `\"Ancho Útil\",\"${editAncho}\",\"m\",\"ASTM D3774\"\n` +
      `\"Encogimiento Largo\",\"${editEncLargo}\",\"%\",\"AATCC 135\"\n` +
      `\"Encogimiento Ancho\",\"${editEncAncho}\",\"%\",\"AATCC 135\"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Matriz_Ficha_${currentFicha.codigoFT}.csv`;
    link.click();
    triggerToast('Matriz técnica exportada en CSV exitosamente.');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-5 right-5 bg-[#2B2B2E] text-[#FBF8F2] text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 border border-[#94A786] z-50 animate-bounce">
          <CheckCircle className="h-4.5 w-4.5 text-[#485C3E]" />
          <span className="font-semibold">{showToast}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-[#2D2D30] p-6 rounded-3xl border border-[#424246] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-[#FBF8F2]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-bold text-[#FBF8F2] tracking-wide uppercase flex items-center">
              <BookOpen className="h-5.5 w-5.5 text-[#C6A466] mr-2" />
              Biblioteca Técnica de Fichas del Fabricante
            </h2>
            <span className="text-xs bg-[#C6A466]/20 text-[#C6A466] font-bold px-2 py-0.5 rounded-full border border-[#C6A466]/30">
              7 SECCIONES NORMATIVAS
            </span>
          </div>
          <p className="text-[#AA9E80] text-xs">
            Repositorio centralizado de especificaciones, tolerancias y documentos originales de los proveedores textiles.
          </p>
        </div>

        {/* Buscador y Acciones */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AA9E80]" />
            <input
              type="text"
              placeholder="Buscar por referencia, código o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#2B2B2E] border border-[#424246] rounded-xl text-xs text-[#FBF8F2] placeholder-[#AA9E80]/50 focus:outline-none focus:border-[#C6A466] w-full sm:w-64"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsModalExploradorOpen(true)}
            className="bg-[#485C3E] hover:bg-[#5A734E] text-[#FBF8F2] px-3.5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            <span>Explorador Base FT</span>
          </button>
        </div>
      </div>

      {currentFicha && currentVersion ? (
        <>
          {/* Banner de la Ficha Seleccionada */}
          <div className="bg-[#2D2D30] border border-[#424246] text-[#FBF8F2] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#C6A466] bg-[#C6A466]/20 px-2 py-0.5 rounded-full border border-[#C6A466]/30">
                  {currentFicha.codigoFT}
                </span>
                <span className="text-[10px] bg-[#2B2B2E] text-[#AA9E80] font-bold px-2 py-0.5 rounded-full border border-[#424246]">
                  Versión v{currentFicha.versionActual}
                </span>
                <span className="text-[10px] bg-[#485C3E]/20 text-[#485C3E] font-bold px-2 py-0.5 rounded-full border border-[#485C3E]/30">
                  ALIMENTA BLOQUE 1 LAB
                </span>
              </div>

              <h3 className="text-xl font-serif font-bold text-[#FBF8F2] mt-1.5 uppercase tracking-wide">{currentFicha.referencia}</h3>
              <p className="text-xs text-[#AA9E80] mt-1">
                Fabricante: <strong className="text-[#C6A466]">{currentFicha.proveedor}</strong> • Ref. Fabricante: <strong className="text-[#FBF8F2] font-mono">{currentFicha.referenciaProveedor}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="bg-[#2B2B2E] hover:bg-[#424246] text-[#FBF8F2] font-bold text-xs py-2 px-3.5 rounded-xl flex items-center space-x-1.5 border border-[#424246] shadow-sm cursor-pointer"
              >
                <Download className="h-4 w-4 text-[#C6A466]" />
                <span>Descargar TXT</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                className="bg-[#485C3E] hover:bg-[#5A734E] text-[#FBF8F2] font-bold text-xs py-2 px-3.5 rounded-xl flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          {/* Grid de Edición y Calibración */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Columna Izquierda: Especificaciones Principales (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-[#2D2D30] rounded-3xl border border-[#424246] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#424246] pb-3">
                  <h3 className="font-serif font-bold text-[#FBF8F2] text-xs uppercase tracking-wider flex items-center">
                    <Info className="h-4 w-4 text-[#C6A466] mr-2" />
                    Parámetros Declarados por el Proveedor
                  </h3>
                  <span className="text-[10px] bg-[#C6A466]/20 text-[#C6A466] font-bold px-2 py-0.5 rounded-full border border-[#C6A466]/30">
                    Tolerancias Garantizadas
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[#AA9E80] font-semibold mb-1">Composición Textil Declarada:</label>
                    <input
                      type="text"
                      value={editComposicion}
                      onChange={(e) => setEditComposicion(e.target.value)}
                      className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-[#FBF8F2] font-semibold focus:outline-none focus:border-[#C6A466]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#AA9E80] font-semibold mb-1">Gramaje Superficial (GSM):</label>
                    <input
                      type="number"
                      value={editGramaje}
                      onChange={(e) => setEditGramaje(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-[#C6A466] font-mono font-bold focus:outline-none focus:border-[#C6A466]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
                  <div>
                    <label className="block text-[#AA9E80] font-semibold mb-1">Ancho Útil Cortable (m):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editAncho}
                      onChange={(e) => setEditAncho(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-[#485C3E] font-mono font-bold focus:outline-none focus:border-[#C6A466]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#AA9E80] font-semibold mb-1">Encogimiento Largo Máx (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editEncLargo}
                      onChange={(e) => setEditEncLargo(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-[#C6A466] font-mono font-bold focus:outline-none focus:border-[#C6A466]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#AA9E80] font-semibold mb-1">Encogimiento Ancho Máx (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editEncAncho}
                      onChange={(e) => setEditEncAncho(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-[#C6A466] font-mono font-bold focus:outline-none focus:border-[#C6A466]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[#AA9E80] font-semibold mb-1 text-xs">Observaciones y Recomendaciones Técnicas:</label>
                  <textarea
                    rows={3}
                    value={editObservaciones}
                    onChange={(e) => setEditObservaciones(e.target.value)}
                    placeholder="Instrucciones de lavado, termofijado, reposo y cuidados del fabricante..."
                    className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-3 text-xs text-[#FBF8F2] focus:outline-none focus:border-[#C6A466]"
                  />
                </div>
              </div>

            </div>

            {/* Columna Derecha: Guardado y Documentos (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-[#2D2D30] p-5 rounded-3xl border border-[#C6A466]/40 shadow-sm space-y-4">
                <div>
                  <h4 className="font-serif font-bold text-[#FBF8F2] text-xs uppercase tracking-wider flex items-center">
                    <ShieldCheck className="h-4 w-4 text-[#C6A466] mr-1.5" />
                    Actualizar Ficha Técnica
                  </h4>
                  <p className="text-[#AA9E80] text-xs mt-1">
                    Guarda los cambios de especificaciones y tolerancias para que se sincronicen de inmediato con el Laboratorio.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="w-full bg-[#C6A466] hover:bg-[#D6CDB8] text-[#2B2B2E] font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar Cambios en Base FT</span>
                </button>
              </div>

              {/* Documento Original Adjunto */}
              <div className="bg-[#2D2D30] p-5 rounded-3xl border border-[#424246] shadow-sm space-y-3">
                <h4 className="font-serif font-bold text-[#FBF8F2] text-xs uppercase tracking-wider flex items-center">
                  <Paperclip className="h-4 w-4 text-[#AA9E80] mr-1.5" />
                  Documento Original del Molino
                </h4>
                
                <div className="p-3 bg-[#2B2B2E] rounded-2xl border border-[#424246] space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C6A466] shrink-0" />
                    <span className="font-mono text-[#FBF8F2] truncate text-[11px]">
                      {currentFicha.documentoOriginal?.nombreArchivo || currentVersion.nombreArchivoFT || 'FICHA_TECNICA_FABRICANTE.pdf'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`📄 Visualizando Documento Original:\n\nArchivo: ${currentFicha.documentoOriginal?.nombreArchivo || currentVersion.nombreArchivoFT || 'FICHA_TECNICA_FABRICANTE.pdf'}\nProveedor: ${currentFicha.proveedor}\nReferencia: ${currentFicha.referenciaProveedor}\n\nDocumento oficial conservado íntegro en TEXLAB.`)}
                    className="w-full py-1.5 bg-[#2D2D30] hover:bg-[#424246] text-[#AA9E80] hover:text-white rounded-xl text-xs font-bold border border-[#424246] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>[ VER DOCUMENTO ORIGINAL ]</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </>
      ) : (
        <div className="p-12 text-center bg-[#2D2D30] rounded-3xl border border-[#424246] text-[#AA9E80] text-xs">
          No hay fichas técnicas que coincidan con la búsqueda.
        </div>
      )}

      {/* Modales */}

      <ExploradorFichasModal
        abierto={isModalExploradorOpen}
        onCerrar={() => setIsModalExploradorOpen(false)}
      />

    </div>
  );
};
