import React, { useState, useEffect, useRef } from 'react';
import { useQuality } from '../../context/QualityContext';
import { FichaTecnicaHistoricaVersionada, VersionFichaTecnica } from '../../types';
import { 
  BookOpen, 
  FileText, 
  Search, 
  Save, 
  Download, 
  FileSpreadsheet,
  CheckCircle,
  Eye,
  ChevronDown,
  Printer,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { ExploradorFichasModal } from '../fichas-tecnicas/ExploradorFichasModal';
import { FichaTecnicaFormatoCompletoModal } from '../fichas-tecnicas/FichaTecnicaFormatoCompletoModal';
import { exportarFichaAWord, exportarFichaAPDF } from '../../utils/fichaTecnicaFormatters';
import { 
  STFGroupDocumentSheet, 
  STFGroupDocumentData, 
  mapVersionToSTFGroupDocumentData, 
  mapSTFGroupDocumentDataToVersion 
} from '../fichas-tecnicas/STFGroupDocumentSheet';

export const BibliotecaView: React.FC = () => {
  const { fichasTecnicasHistorial, guardarFichaTecnicaProveedor, limpiarBaseDatosFichas } = useQuality();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFichaId, setSelectedFichaId] = useState<string>('');
  const [showToast, setShowToast] = useState<string | null>(null);

  const [isModalExploradorOpen, setIsModalExploradorOpen] = useState<boolean>(false);
  const [isModalFormatoCompletoOpen, setIsModalFormatoCompletoOpen] = useState<boolean>(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const handleLimpiarBaseDatos = async () => {
    const confirmar = window.confirm(
      '¿Confirmas que deseas limpiar la base de datos de la Biblioteca Técnica?\n\n' +
      'Esta acción eliminará cualquier registro antiguo o simulado y restablecerá la base de datos con la Ficha Técnica Oficial auténtica de STF GROUP (CREPE VICTORIA / TEXTIVISION).'
    );
    if (!confirmar) return;

    await limpiarBaseDatosFichas();
    setSelectedFichaId('ft-hist-001');
    triggerToast('Base de datos de Fichas Técnicas limpiada con éxito.');
  };

  // Cerrar menú de exportación al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrado de Fichas Técnicas
  const filteredFichas = (fichasTecnicasHistorial || []).filter(f => 
    (f.referencia || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.codigoFT || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.referenciaProveedor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.proveedor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentFicha = filteredFichas.find(f => f.id === selectedFichaId) || filteredFichas[0] || null;
  const currentVersion: VersionFichaTecnica | undefined = currentFicha?.historialVersiones?.[currentFicha.historialVersiones.length - 1];

  // Estado del documento oficial editable
  const [docData, setDocData] = useState<STFGroupDocumentData | null>(null);

  // Cargar datos oficiales exactos cuando cambie la ficha
  useEffect(() => {
    if (currentFicha && currentVersion) {
      setDocData(mapVersionToSTFGroupDocumentData(currentFicha, currentVersion));
    }
  }, [currentFicha?.id, currentVersion?.version]);

  const handleDocumentChange = (updated: Partial<STFGroupDocumentData>) => {
    setDocData(prev => prev ? { ...prev, ...updated } : null);
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleSaveAll = () => {
    if (!currentFicha || !currentVersion || !docData) return;

    const versionActualizada = mapSTFGroupDocumentDataToVersion(currentVersion, docData);
    
    // Actualizar también metadatos de primer nivel de la ficha
    const fichaActualizada: FichaTecnicaHistoricaVersionada = {
      ...currentFicha,
      referencia: docData.refProv || currentFicha.referencia,
      referenciaProveedor: docData.refProv || currentFicha.referenciaProveedor,
      proveedor: docData.proveedorNombre || currentFicha.proveedor,
      paisOrigen: docData.paisOrigen || currentFicha.paisOrigen,
      updatedAt: new Date().toISOString()
    };

    guardarFichaTecnicaProveedor(fichaActualizada, versionActualizada);
    triggerToast('Especificaciones oficiales de STF GROUP guardadas con éxito en Base FT.');
  };

  const handleExportCSV = () => {
    if (!currentFicha || !docData) return;
    const csvContent = 
      `\"PARAMETRO TECNICO\",\"VALOR DECLARADO / RESULTADO\",\"METODO / NORMA\",\"TOLERANCIA\"\n` +
      `\"Referencia Tela / STF Reference\",\"${docData.stfRef}\",\"--\",\"--\"\n` +
      `\"Referencia Proveedor\",\"${docData.refProv}\",\"--\",\"--\"\n` +
      `\"Proveedor / Fabricante\",\"${docData.proveedorNombre}\",\"--\",\"--\"\n` +
      `\"Fecha Bulk / Producción\",\"${docData.fechaBulk}\",\"--\",\"--\"\n` +
      `\"STF P.O #\",\"${docData.stfPo}\",\"--\",\"--\"\n` +
      `\"País Origen\",\"${docData.paisOrigen}\",\"--\",\"--\"\n` +
      `\"Lotes\",\"${docData.lotes}\",\"--\",\"--\"\n` +
      `\"Subpartida Arancelaria\",\"${docData.subpartida || 'N/A'}\",\"--\",\"--\"\n` +
      `\"Certificado Origen Col/Mex\",\"${docData.aplicaCertOrigen ? 'SI' : 'NO'}\",\"--\",\"--\"\n` +
      `\"Composición 1\",\"${docData.comp1Nombre} ${docData.comp1Pct}% (Continuo: ${docData.comp1Continuo ? 'SI' : 'NO'})\",\"--\",\"--\"\n` +
      `\"Composición 2\",\"${docData.comp2Nombre ? `${docData.comp2Nombre} ${docData.comp2Pct}% (Continuo: ${docData.comp2Continuo ? 'SI' : 'NO'})` : 'N/A'}\",\"--\",\"--\"\n` +
      `\"Ancho Total\",\"${docData.anchoCms} cm\",\"--\",\"--\"\n` +
      `\"Ancho Cortable\",\"${docData.anchoCortableCms} cm\",\"--\",\"--\"\n` +
      `\"Peso / Gramaje\",\"${docData.pesoGsm} GSM\",\"--\",\"--\"\n` +
      `\"Solo Denim\",\"${docData.denimOz}\",\"--\",\"--\"\n` +
      `\"Acabados - Impregnado\",\"${docData.impregnadoPct} - ${docData.impregnadoDesc}\",\"--\",\"--\"\n` +
      `\"Títulos de Hilo Trama\",\"${docData.titulosTrama}\",\"--\",\"${docData.titulosTol}\"\n` +
      `\"Resistencia al Rasgado\",\"${docData.rasgadoTrama}\",\"${docData.rasgadoNorma}\",\"${docData.rasgadoTol}\"\n` +
      `\"Cambio Dimensional al Lavado\",\"${docData.cambioDimTrama}\",\"${docData.cambioDimNorma}\",\"${docData.cambioDimTol}\"\n` +
      `\"Pierna Virada (Viro)\",\"${docData.piernaViradaRes}\",\"${docData.piernaViradaNorma}\",\"${docData.piernaViradaTol}\"\n` +
      `\"Solidez Lavado Doméstico\",\"${docData.solLavadoRes}\",\"${docData.solLavadoNorma}\",\"${docData.solLavadoTol}\"\n` +
      `\"Solidez al Frote\",\"${docData.solFroteRes}\",\"${docData.solFroteNorma}\",\"${docData.solFroteTol}\"\n` +
      `\"Rendimiento M/KG\",\"${docData.rendimientoRes}\",\"Metros x Kilo\",\"${docData.rendimientoTol}\"\n` +
      `\"Elongación\",\"${docData.elongacionTrama}\",\"--\",\"${docData.elongacionTol}\"\n` +
      `\"% Recuperación\",\"${docData.recuperacionTrama}\",\"--\",\"${docData.recuperacionTol}\"\n` +
      `\"Desviación de Trama\",\"${docData.desviacionRes}\",\"${docData.desviacionNorma}\",\"${docData.desviacionTol}\"\n` +
      `\"Tipo de Tejido\",\"${docData.esTejidoPunto ? 'Tejido Punto (Knitted)' : 'Tejido Plano (Woven)'}\",\"--\",\"--\"\n` +
      `\"Tipo de Ligamento\",\"${docData.tipoLigamento}\",\"--\",\"--\"\n` +
      `\"Acabado Color\",\"${docData.acabadoColor} - ${docData.color}\",\"--\",\"--\"\n` +
      `\"Tipo Fibra\",\"${docData.tipoFibra}\",\"--\",\"--\"\n` +
      `\"Instrucciones Lavado\",\"${docData.lavadoInstrucciones}\",\"--\",\"--\"\n` +
      `\"Recomendaciones Planchado\",\"${docData.planchadoInstrucciones}\",\"--\",\"--\"\n` +
      `\"Observaciones Extra\",\"${docData.observacionesExtra || ''}\",\"--\",\"--\"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Matriz_STF_${docData.stfPo || 'FT'}_${(docData.refProv || 'TELA').replace(/\s+/g, '_')}.csv`;
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
            <span className="text-xs bg-[#C6A466]/20 text-[#C6A466] font-bold px-2.5 py-0.5 rounded-full border border-[#C6A466]/30">
              FORMATO OFICIAL STF GROUP
            </span>
          </div>
          <p className="text-[#AA9E80] text-xs">
            Especificaciones técnicas de tela (tejido plano / punto) con parámetros oficiales del fabricante sin datos inventados.
          </p>
        </div>

        {/* Buscador y Botón Explorador */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AA9E80]" />
            <input
              type="text"
              placeholder="Buscar referencia o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#2B2B2E] border border-[#424246] rounded-xl text-xs text-[#FBF8F2] placeholder-[#AA9E80]/50 focus:outline-none focus:border-[#C6A466] w-full sm:w-64"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsModalExploradorOpen(true)}
            className="bg-[#485C3E] hover:bg-[#5A734E] text-white px-4 py-2 rounded-xl font-extrabold text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer border border-[#94A786]/60"
            title="Abrir Explorador Base Histórica de Fichas Técnicas"
          >
            <BookOpen className="h-4 w-4 text-white" />
            <span className="text-white">Explorador Base FT</span>
          </button>

          <button
            type="button"
            onClick={handleLimpiarBaseDatos}
            className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-700/50 px-3.5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            title="Limpiar base de datos y purgar datos no oficiales"
          >
            <Trash2 className="h-4 w-4 text-rose-400" />
            <span>Limpiar Base de Datos</span>
          </button>
        </div>
      </div>

      {currentFicha && currentVersion && docData ? (
        <>
          {/* Banner de Acciones y Guardado Superior */}
          <div className="bg-[#2D2D30] border border-[#424246] text-[#FBF8F2] rounded-3xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#C6A466] bg-[#C6A466]/20 px-2 py-0.5 rounded-full border border-[#C6A466]/30">
                  {currentFicha.codigoFT}
                </span>
                <span className="text-[10px] bg-[#2B2B2E] text-[#AA9E80] font-bold px-2 py-0.5 rounded-full border border-[#424246]">
                  Versión v{currentFicha.versionActual}
                </span>
                <span className="text-[10px] bg-[#485C3E]/20 text-[#485C3E] font-bold px-2 py-0.5 rounded-full border border-[#485C3E]/30">
                  P.O: {docData.stfPo || 'N/A'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                <h3 className="text-lg font-serif font-black text-[#FBF8F2] uppercase tracking-wide">
                  {docData.refProv || currentFicha.referencia} • {docData.stfRef}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalFormatoCompletoOpen(true)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                  title="Ver formato oficial completo de STF GROUP"
                >
                  <Eye className="h-3.5 w-3.5 text-zinc-950" />
                  <span>Ver Formato Completo</span>
                </button>
              </div>
              <p className="text-xs text-[#AA9E80] mt-0.5">
                Proveedor: <strong className="text-[#C6A466]">{docData.proveedorNombre}</strong> • Origen: <strong className="text-[#FBF8F2]">{docData.paisOrigen}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              
              {/* Botón Guardar Cambios */}
              <button
                type="button"
                onClick={handleSaveAll}
                className="bg-[#C6A466] hover:bg-[#D6CDB8] text-[#2B2B2E] font-extrabold text-xs uppercase tracking-wide py-2.5 px-4 rounded-xl flex items-center space-x-2 shadow-md transition-all active:scale-95 cursor-pointer"
                title="Guardar todos los cambios del documento en la Base de Datos Histórica"
              >
                <Save className="h-4 w-4" />
                <span>Guardar Cambios en Base FT</span>
              </button>

              {/* Menú de Exportación Unificado */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-2 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer border border-cyan-400/30"
                  title="Exportar documento oficial a Word, PDF o CSV"
                >
                  <Download className="h-4 w-4 text-cyan-300" />
                  <span>Exportar Formato</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-white/80 transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#1f2430]/95 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl p-1.5 z-50 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        const vActual = mapSTFGroupDocumentDataToVersion(currentVersion, docData);
                        exportarFichaAWord(currentFicha, vActual);
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-200 hover:text-white hover:bg-blue-600/30 transition-all cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Download className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left leading-tight">
                        <span className="block font-bold">Exportar Word</span>
                        <span className="text-[10px] text-blue-300/70">Documento .doc editable</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        const vActual = mapSTFGroupDocumentDataToVersion(currentVersion, docData);
                        exportarFichaAPDF(currentFicha, vActual);
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-200 hover:text-white hover:bg-rose-600/30 transition-all cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                        <Printer className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left leading-tight">
                        <span className="block font-bold">Exportar PDF</span>
                        <span className="text-[10px] text-rose-300/70">Impresión oficial vectorizada</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        handleExportCSV();
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-200 hover:text-white hover:bg-emerald-600/30 transition-all cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left leading-tight">
                        <span className="block font-bold">Exportar CSV</span>
                        <span className="text-[10px] text-emerald-300/70">Hoja de cálculo Excel / Matriz</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* DOCUMENTO OFICIAL STF GROUP RENDERIZADO EN PANTALLA */}
          <div className="overflow-x-auto">
            <STFGroupDocumentSheet
              data={docData}
              editable={true}
              onChange={handleDocumentChange}
            />
          </div>

          {/* Botón flotante inferior de Guardado */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveAll}
              className="bg-[#C6A466] hover:bg-[#D6CDB8] text-[#2B2B2E] font-black text-xs uppercase tracking-wider py-3 px-6 rounded-xl flex items-center space-x-2 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Guardar Cambios en Base de Datos de Fichas Técnicas</span>
            </button>
          </div>
        </>
      ) : (
        <div className="p-12 text-center bg-[#2D2D30] rounded-3xl border border-[#424246] text-[#AA9E80] text-xs">
          No hay fichas técnicas disponibles que coincidan con la búsqueda.
        </div>
      )}

      {/* Explorador Modal */}
      <ExploradorFichasModal
        abierto={isModalExploradorOpen}
        onCerrar={() => setIsModalExploradorOpen(false)}
        onSeleccionarFichaParaUso={(f) => {
          setSelectedFichaId(f.id);
          setIsModalExploradorOpen(false);
        }}
      />

      {/* Modal de Formato Completo STF GROUP */}
      {isModalFormatoCompletoOpen && currentFicha && (
        <FichaTecnicaFormatoCompletoModal
          ficha={currentFicha}
          version={currentVersion}
          onCerrar={() => setIsModalFormatoCompletoOpen(false)}
        />
      )}

    </div>
  );
};
