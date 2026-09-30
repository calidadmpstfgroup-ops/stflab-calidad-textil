import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useAuth } from '../../context/AuthContext';
import { FichaTecnicaHistoricaVersionada, VersionFichaTecnica } from '../../types';
import { FormularioFichaProveedor } from '../portal-proveedor/FormularioFichaProveedor';
import { exportarFichaAWord, exportarFichaAPDF } from '../../utils/fichaTecnicaFormatters';
import { FichaTecnicaFormatoCompletoModal } from './FichaTecnicaFormatoCompletoModal';
import { procesarArchivoUniversal } from '../../utils/universalDocumentImporter';
import * as XLSX from 'xlsx';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Upload, 
  FileText, 
  CheckCircle2, 
  History, 
  X, 
  Eye, 
  Sparkles, 
  Sliders, 
  Calendar, 
  User, 
  Paperclip,
  Download,
  AlertCircle,
  Building2,
  Tag,
  Layers,
  Ruler,
  FlaskConical,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface ExploradorFichasModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onSeleccionarFichaParaUso?: (ficha: FichaTecnicaHistoricaVersionada, version: VersionFichaTecnica) => void;
  filtroInicialTexto?: string;
  filtroInicialProveedor?: string;
}

export const ExploradorFichasModal: React.FC<ExploradorFichasModalProps> = ({
  abierto,
  onCerrar,
  onSeleccionarFichaParaUso,
  filtroInicialTexto = '',
  filtroInicialProveedor = ''
}) => {
  const { fichasTecnicasHistorial, guardarFichaTecnicaProveedor } = useQuality();
  const { usuario } = useAuth();

  const [busquedaTexto, setBusquedaTexto] = useState(filtroInicialTexto);
  const [busquedaProveedor, setBusquedaProveedor] = useState(filtroInicialProveedor);
  const [fichaSeleccionada, setFichaSeleccionada] = useState<FichaTecnicaHistoricaVersionada | null>(null);
  const [versionSeleccionadaIndex, setVersionSeleccionadaIndex] = useState<number>(0);
  const [tabDetalle7, setTabDetalle7] = useState<number>(1);

  // Modales de creación/actualización con las 7 Secciones
  const [modalFormularioCompleto, setModalFormularioCompleto] = useState<boolean>(false);
  const [fichaParaVersionarForm, setFichaParaVersionarForm] = useState<FichaTecnicaHistoricaVersionada | null>(null);
  
  // Modal de visualización en Formato Completo Oficial STF GROUP (Word / PDF)
  const [modalFormatoCompletoAbierto, setModalFormatoCompletoAbierto] = useState<boolean>(false);
  const [fichaParaFormatoCompleto, setFichaParaFormatoCompleto] = useState<FichaTecnicaHistoricaVersionada | null>(null);

  // Estado de carga para importación universal
  const [cargandoArchivo, setCargandoArchivo] = useState<boolean>(false);

  if (!abierto) return null;

  // Filtrado inteligente por Proveedor + Referencia Proveedor + Nombre Comercial
  const fichasFiltradas = (fichasTecnicasHistorial || []).filter((ficha: FichaTecnicaHistoricaVersionada) => {
    if (!ficha) return false;
    const qTexto = (busquedaTexto || '').toLowerCase().trim();
    const qProv = (busquedaProveedor || '').toLowerCase().trim();

    const fichaProv = (ficha.proveedor || '').toLowerCase();
    const matchProv = !qProv || fichaProv.includes(qProv);
    if (!matchProv) return false;

    if (!qTexto) return true;

    const matchRefNombre = (ficha.referencia || '').toLowerCase().includes(qTexto);
    const matchRefProv = (ficha.referenciaProveedor || '').toLowerCase().includes(qTexto);
    const matchCodigo = (ficha.codigoFT || '').toLowerCase().includes(qTexto);
    const matchComp = (ficha.historialVersiones?.[0]?.especificaciones?.composicion || '').toLowerCase().includes(qTexto);

    return matchRefNombre || matchRefProv || matchCodigo || matchComp;
  });

  const fichaActiva = fichaSeleccionada || fichasFiltradas[0] || null;
  const versionActiva: VersionFichaTecnica | undefined = fichaActiva?.historialVersiones?.[versionSeleccionadaIndex] || 
    fichaActiva?.historialVersiones?.[(fichaActiva?.historialVersiones?.length || 1) - 1];

  // Manejo de Importación de Cualquier Documento o Imagen (Excel, Word, PDF, Imagen)
  const handleImportarCualquierDocumento = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCargandoArchivo(true);
    try {
      const res = await procesarArchivoUniversal(file, usuario?.displayName || 'Importación Documento');
      if (res.exito && res.fichasCreadas.length > 0) {
        res.fichasCreadas.forEach((f) => guardarFichaTecnicaProveedor(f));
        setFichaSeleccionada(res.fichasCreadas[0]);
        alert(`✓ ¡Documento importado con éxito!\n\nFormato detectado: ${res.formato}\nArchivo: ${file.name}\n${res.mensaje}`);
      } else {
        alert(`Aviso: ${res.mensaje}`);
      }
    } catch (err: any) {
      alert(`Error al procesar el archivo: ${err.message || err}`);
    } finally {
      setCargandoArchivo(false);
      e.target.value = '';
    }
  };

  // Carga de Excel de Fichas Técnicas (Manejo inteligente de Ficha Única vs Múltiples)
  const handleCargarExcelFichas = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // 1. Obtener filas crudas como arreglos para detectar estructura vertical / clave-valor
        const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        // Normalizador de texto para claves
        const limpiarClave = (str: string) => 
          str.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[:#=\-\t\s_]+/g, ' ')
            .trim();

        // 2. Extraer mapa de clave-valor vertical
        const mapaClaves: Record<string, string> = {};
        let conteoClavesDetectadas = 0;

        const regexClavesConocidas = /(?:proveedor|fabricante|molino|empresa|contacto|email|correo|telefono|referencia|ref proveedor|codigo fabrica|codigo ft|codigo|tela|articulo|nombre|composicion|fibra|ancho|peso|gramaje|gsm|ligamento|tejido|densidad|urdimbre|trama|encogimiento|solidez|lavado|cuidados|lote|color|po|oc)/i;

        rawRows.forEach((fila) => {
          if (!Array.isArray(fila) || fila.length === 0) return;
          const col0 = String(fila[0] ?? '').trim();
          const col1 = String(fila[1] ?? '').trim();
          const col2 = String(fila[2] ?? '').trim();

          if (col0 && regexClavesConocidas.test(col0)) {
            conteoClavesDetectadas++;
            const claveNorm = limpiarClave(col0);
            mapaClaves[claveNorm] = col1 || col2 || '';
          } else if (col1 && regexClavesConocidas.test(col1)) {
            conteoClavesDetectadas++;
            const claveNorm = limpiarClave(col1);
            mapaClaves[claveNorm] = col2 || '';
          }
        });

        const buscarValorVertical = (...patrones: RegExp[]): string => {
          for (const p of patrones) {
            for (const [k, v] of Object.entries(mapaClaves)) {
              if (p.test(k) && v) return v;
            }
          }
          return '';
        };

        const nombreLimpio = file.name.replace(/\.[^/.]+$/, '').replace(/ficha\s*t[eé]cnica/i, '').replace(/[-_]+/g, ' ').trim();

        // 3. Si detecta 3 o más campos clave en formato vertical, es UN SOLO DOCUMENTO DE FICHA TÉCNICA
        if (conteoClavesDetectadas >= 3) {
          const proveedor = (buscarValorVertical(/proveedor|fabricante|molino|empresa/i) || 'PROVEEDOR GENERAL').trim();
          const referencia = (buscarValorVertical(/referencia|articulo|nombre|tela/i) || nombreLimpio || 'TELA PROVEEDOR').trim();
          const referenciaProveedor = (buscarValorVertical(/ref.*prov|codigo.*fab|codigo.*prov/i) || referencia).trim();
          const codigoFT = (buscarValorVertical(/codigo.*ft|codigo/i) || `FT-${Date.now().toString().slice(-6)}`).trim();
          const composicion = (buscarValorVertical(/composicion|fibra/i) || '100% Textil').trim();
          const gramajeStr = buscarValorVertical(/gramaje|peso|gsm/i);
          const gramaje = parseFloat(gramajeStr.replace(/[^\d.]/g, '') || '200') || 200;
          const anchoStr = buscarValorVertical(/ancho/i);
          const ancho = parseFloat(anchoStr.replace(/[^\d.]/g, '') || '1.48') || 1.48;
          const encLargo = parseFloat(buscarValorVertical(/encogimiento.*largo|encl/i).replace(/[^\d.-]/g, '') || '-2.5') || -2.5;
          const encAncho = parseFloat(buscarValorVertical(/encogimiento.*ancho|enca/i).replace(/[^\d.-]/g, '') || '-3.0') || -3.0;

          const fichaUnica: FichaTecnicaHistoricaVersionada = {
            id: `ft-doc-${Date.now()}`,
            codigoFT,
            referencia,
            referenciaProveedor,
            proveedor,
            contactoProveedor: buscarValorVertical(/contacto|email|correo/i),
            paisOrigen: buscarValorVertical(/pais/i) || 'Colombia',
            versionActual: 1,
            estadoRevision: 'APROBADA_HISTORICO',
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: usuario?.displayName || 'Importación Documento',
            updatedAt: new Date().toISOString().split('T')[0],
            updatedBy: usuario?.displayName || 'Importación Documento',
            documentoOriginal: {
              nombreArchivo: file.name,
              tipo: 'EXCEL',
              fechaCarga: new Date().toISOString().split('T')[0]
            },
            historialVersiones: [
              {
                version: 1,
                fechaVersion: new Date().toISOString().split('T')[0],
                creadoPor: usuario?.displayName || 'Importación Documento',
                activo: true,
                cambiosRespectoAnterior: 'Carga oficial de Ficha Técnica del Fabricante.',
                nombreArchivoFT: file.name,
                especificaciones: {
                  nombreEmpresa: proveedor,
                  contactoTecnico: buscarValorVertical(/contacto/i),
                  emailContacto: buscarValorVertical(/email|correo/i),
                  telefonoWhatsapp: buscarValorVertical(/telefono|tel|celular/i),
                  paisEmpresa: buscarValorVertical(/pais/i) || 'Colombia',
                  stfPoNumber: buscarValorVertical(/po|oc|orden.*compra/i) || 'OAC 1107',
                  fechaProduccion: new Date().toISOString().split('T')[0],
                  codigoMT: codigoFT,
                  referenciaSTF: referencia,
                  referenciaProveedor: referenciaProveedor,
                  codigoFabrica: referenciaProveedor,
                  nombreComercialTela: referencia,
                  molinoFabricante: proveedor,
                  paisOrigen: buscarValorVertical(/pais/i) || 'Colombia',
                  numeroLoteProduccion: buscarValorVertical(/lote/i) || 'LOT-2026-01',
                  colorShade: buscarValorVertical(/color|shade/i) || '000 ESTÁNDAR',
                  subpartidaArancelaria: buscarValorVertical(/subpartida/i) || '5407.52.00.00',
                  certificadoOrigen: buscarValorVertical(/certificado/i) || 'CO-2026-001',
                  composicion,
                  composicionPorcentual: composicion,
                  tipoFibraFilamento: 'Filamento Continuo',
                  tipoFibraTexturizado: 'Normal',
                  tituloHiloUrdimbre: buscarValorVertical(/titulo.*urdimbre/i) || '30/1 Ne',
                  tituloHiloTrama: buscarValorVertical(/titulo.*trama/i) || '30/1 Ne',
                  sentidoTorsion: 'Z',
                  mezclaIntima: composicion,
                  anchoTotalM: ancho + 0.04,
                  anchoUtilM: ancho,
                  gramajeDeclaradoGsm: gramaje,
                  pesoLinealGsm: Math.round(gramaje * ancho),
                  rendimientoMkg: parseFloat((1000 / (gramaje * ancho)).toFixed(2)),
                  espesorMm: 0.40,
                  tipoTejido: 'Plano',
                  tipoLigamento: buscarValorVertical(/ligamento|tejido/i) || 'Tafetán',
                  densidadUrdimbreHilosCm: 36,
                  densidadTramaPasadasCm: 28,
                  acabadosTextiles: 'Sanforizado + Suavizado',
                  acabadoColorTintoreria: 'Teñido en Pieza',
                  encogimientoLargoMax: encLargo,
                  encogimientoAnchoMax: encAncho,
                  viroMax: 1.5,
                  solidezLavadoMin: 4.0,
                  solidezFroteSecoMin: 4.0,
                  solidezFroteHumedoMin: 3.5,
                  lavadoSugerido: buscarValorVertical(/lavado|cuidado/i) || 'Lavado doméstico máx. 40°C.',
                  observacionesFabricante: `Ficha técnica importada desde el documento ${file.name}.`
                }
              }
            ]
          };

          guardarFichaTecnicaProveedor(fichaUnica);
          alert(`✓ ¡Ficha Técnica "${referencia}" (${proveedor}) importada exitosamente como 1 solo documento!`);
          return;
        }

        // 4. Si es formato tabular con múltiples filas:
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        
        // Agrupar filas válidas por proveedor + referencia para evitar duplicar la misma ficha 27 veces
        const mapaTelasUnicas = new Map<string, any>();

        rawJson.forEach((row, idx) => {
          const rowNorm: Record<string, any> = {};
          Object.keys(row).forEach((k) => {
            rowNorm[k.trim().toUpperCase()] = row[k];
          });

          // Solo filas con nombre o referencia explícita (NO inventar TELA-1, TELA-2...)
          const refReal = String(rowNorm['NOMBRE'] || rowNorm['TELA'] || rowNorm['REFERENCIA'] || rowNorm['ARTICULO'] || '').trim();
          if (!refReal) return;

          const provReal = String(rowNorm['PROVEEDOR'] || rowNorm['FABRICANTE'] || rowNorm['MOLINO'] || 'PROVEEDOR GENERAL').trim();
          const clave = `${provReal.toLowerCase()}::${refReal.toLowerCase()}`;

          if (!mapaTelasUnicas.has(clave)) {
            mapaTelasUnicas.set(clave, { rowNorm, refReal, provReal, idx });
          }
        });

        if (mapaTelasUnicas.size === 0) {
          // Si no se detectaron referencias tabulares claras, crear 1 sola ficha con el nombre del archivo
          const fichaUnicaFallback: FichaTecnicaHistoricaVersionada = {
            id: `ft-doc-${Date.now()}`,
            codigoFT: `FT-${Date.now().toString().slice(-6)}`,
            referencia: nombreLimpio || 'TELA PROVEEDOR',
            referenciaProveedor: nombreLimpio || 'TELA PROVEEDOR',
            proveedor: 'PROVEEDOR GENERAL',
            contactoProveedor: '',
            paisOrigen: 'Colombia',
            versionActual: 1,
            estadoRevision: 'APROBADA_HISTORICO',
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: usuario?.displayName || 'Importación Documento',
            updatedAt: new Date().toISOString().split('T')[0],
            updatedBy: usuario?.displayName || 'Importación Documento',
            documentoOriginal: {
              nombreArchivo: file.name,
              tipo: 'EXCEL',
              fechaCarga: new Date().toISOString().split('T')[0]
            },
            historialVersiones: [
              {
                version: 1,
                fechaVersion: new Date().toISOString().split('T')[0],
                creadoPor: usuario?.displayName || 'Importación Documento',
                activo: true,
                cambiosRespectoAnterior: 'Carga inicial desde documento.',
                nombreArchivoFT: file.name,
                especificaciones: {
                  nombreEmpresa: 'PROVEEDOR GENERAL',
                  referenciaSTF: nombreLimpio || 'TELA PROVEEDOR',
                  referenciaProveedor: nombreLimpio || 'TELA PROVEEDOR',
                  composicion: '100% Textil',
                  anchoUtilM: 1.48,
                  gramajeDeclaradoGsm: 200,
                  encogimientoLargoMax: -2.5,
                  encogimientoAnchoMax: -3.0,
                  viroMax: 1.5,
                  solidezLavadoMin: 4.0,
                  solidezFroteSecoMin: 4.0,
                  solidezFroteHumedoMin: 3.5
                }
              }
            ]
          };

          guardarFichaTecnicaProveedor(fichaUnicaFallback);
          alert(`✓ ¡Ficha Técnica "${fichaUnicaFallback.referencia}" importada exitosamente como 1 solo documento!`);
          return;
        }

        const fichasImportadas: FichaTecnicaHistoricaVersionada[] = Array.from(mapaTelasUnicas.values()).map(({ rowNorm, refReal, provReal, idx }) => {
          const referenciaProveedor = String(rowNorm['REF PROVEEDOR'] || rowNorm['REFERENCIA PROVEEDOR'] || rowNorm['CODIGO PROVEEDOR'] || rowNorm['CODIGO FABRICA'] || refReal).trim();
          const codigoFT = String(rowNorm['CODIGO FT'] || rowNorm['CODIGO'] || `FT-${String(idx + 100).padStart(6, '0')}`).trim();
          const composicion = String(rowNorm['COMPOSICION'] || rowNorm['COMPOSICIÓN'] || '100% Textil').trim();
          const gramaje = parseFloat(rowNorm['GRAMAJE'] || rowNorm['PESO'] || rowNorm['GSM'] || 200) || 200;
          const ancho = parseFloat(rowNorm['ANCHO'] || rowNorm['ANCHO UTIL'] || 1.48) || 1.48;

          return {
            id: `ft-import-${Date.now()}-${idx}`,
            codigoFT,
            referencia: refReal,
            referenciaProveedor,
            proveedor: provReal,
            contactoProveedor: String(rowNorm['CONTACTO'] || rowNorm['EMAIL'] || ''),
            paisOrigen: String(rowNorm['PAIS'] || rowNorm['PAIS ORIGEN'] || 'Colombia'),
            versionActual: 1,
            estadoRevision: 'APROBADA_HISTORICO',
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: usuario?.displayName || 'Importación Excel',
            updatedAt: new Date().toISOString().split('T')[0],
            updatedBy: usuario?.displayName || 'Importación Excel',
            documentoOriginal: {
              nombreArchivo: file.name,
              tipo: 'EXCEL',
              fechaCarga: new Date().toISOString().split('T')[0]
            },
            historialVersiones: [
              {
                version: 1,
                fechaVersion: new Date().toISOString().split('T')[0],
                creadoPor: usuario?.displayName || 'Importación Base Histórica',
                activo: true,
                cambiosRespectoAnterior: 'Carga inicial desde base de datos de proveedores.',
                nombreArchivoFT: file.name,
                especificaciones: {
                  nombreEmpresa: provReal,
                  contactoTecnico: String(rowNorm['CONTACTO'] || rowNorm['CONTACTO TECNICO'] || ''),
                  emailContacto: String(rowNorm['EMAIL'] || ''),
                  telefonoWhatsapp: String(rowNorm['TELEFONO'] || rowNorm['WHATSAPP'] || ''),
                  paisEmpresa: String(rowNorm['PAIS EMPRESA'] || rowNorm['PAIS'] || 'Colombia'),
                  stfPoNumber: String(rowNorm['PO'] || rowNorm['OC'] || rowNorm['STF PO'] || 'OAC 1107'),
                  fechaProduccion: String(rowNorm['FECHA PRODUCCION'] || new Date().toISOString().split('T')[0]),
                  codigoMT: String(rowNorm['CODIGO MT'] || rowNorm['REF STF'] || codigoFT),
                  referenciaSTF: refReal,
                  referenciaProveedor: referenciaProveedor,
                  codigoFabrica: String(rowNorm['CODIGO FABRICA'] || referenciaProveedor),
                  nombreComercialTela: refReal,
                  molinoFabricante: provReal,
                  paisOrigen: String(rowNorm['PAIS ORIGEN'] || rowNorm['PAIS'] || 'Colombia'),
                  numeroLoteProduccion: String(rowNorm['LOTE'] || rowNorm['NUMERO LOTE'] || 'LOT-2026-01'),
                  colorShade: String(rowNorm['COLOR'] || rowNorm['SHADE'] || '000 NEGRO'),
                  subpartidaArancelaria: String(rowNorm['SUBPARTIDA'] || '5407.52.00.00'),
                  certificadoOrigen: String(rowNorm['CERTIFICADO'] || 'CO-2026-001'),
                  composicion,
                  composicionPorcentual: composicion,
                  tipoFibraFilamento: 'Filamento Continuo',
                  tipoFibraTexturizado: 'Normal',
                  tituloHiloUrdimbre: String(rowNorm['TITULO URDIMBRE'] || '30/1 Ne'),
                  tituloHiloTrama: String(rowNorm['TITULO TRAMA'] || '30/1 Ne'),
                  sentidoTorsion: 'Z',
                  mezclaIntima: composicion,
                  anchoTotalM: ancho + 0.04,
                  anchoUtilM: ancho,
                  gramajeDeclaradoGsm: gramaje,
                  pesoLinealGsm: Math.round(gramaje * ancho),
                  rendimientoMkg: parseFloat((1000 / (gramaje * ancho)).toFixed(2)),
                  espesorMm: 0.40,
                  tipoTejido: 'Plano',
                  tipoLigamento: String(rowNorm['LIGAMENTO'] || 'Tafetán'),
                  densidadUrdimbreHilosCm: 36,
                  densidadTramaPasadasCm: 28,
                  acabadosTextiles: 'Sanforizado + Suavizado',
                  acabadoColorTintoreria: 'Teñido en Pieza',
                  encogimientoLargoMax: parseFloat(rowNorm['ENCOGIMIENTO LARGO'] || rowNorm['ENCL'] || -2.5),
                  encogimientoAnchoMax: parseFloat(rowNorm['ENCOGIMIENTO ANCHO'] || rowNorm['ENCA'] || -3.0),
                  viroMax: 1.5,
                  solidezLavadoMin: 4.0,
                  solidezFroteSecoMin: 4.0,
                  solidezFroteHumedoMin: 3.5,
                  lavadoSugerido: 'Lavado doméstico máx. 40°C.',
                  observacionesFabricante: 'Ficha importada desde archivo Excel.'
                }
              }
            ]
          };
        });

        fichasImportadas.forEach(f => guardarFichaTecnicaProveedor(f));
        alert(`¡${fichasImportadas.length} Ficha(s) Técnica(s) importada(s) exitosamente a la Base Histórica!`);
      } catch (err) {
        alert('Error al leer el archivo Excel.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const seccionesTabs = [
    { id: 1, label: '1. Prov', icon: Building2, title: '1. Contacto y Empresa' },
    { id: 2, label: '2. Com', icon: Tag, title: '2. Trazabilidad y Comercial' },
    { id: 3, label: '3. Fib', icon: Layers, title: '3. Fibras y Composición' },
    { id: 4, label: '4. Dim', icon: Ruler, title: '4. Dimensiones y Peso' },
    { id: 5, label: '5. Tej', icon: Sparkles, title: '5. Estructura y Construcción' },
    { id: 6, label: '6. Ens', icon: FlaskConical, title: '6. Ensayos y Tolerancias' },
    { id: 7, label: '7. Doc', icon: ShieldCheck, title: '7. Cuidados y Documento Original' }
  ];

  const esp = versionActiva?.especificaciones;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#2B2B2E]/85 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-6xl bg-[#2B2B2E] border border-[#424246] rounded-3xl shadow-2xl p-6 text-[#FBF8F2] my-6 max-h-[92vh] flex flex-col justify-between">
        
        {/* Cabecera del Explorador */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#424246] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#C6A466]/20 border border-[#C6A466]/40 flex items-center justify-center text-[#F0DCA8]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-serif font-black uppercase tracking-wider text-white">
                  Base Histórica de Fichas Técnicas del Fabricante
                </h3>
                <span className="text-[10px] font-mono font-black bg-[#C6A466]/20 text-[#F0DCA8] px-2.5 py-0.5 rounded-full border border-[#C6A466]/40">
                  ALIMENTA BLOQUE 1 (ESPECIFICACIÓN PROVEEDOR)
                </span>
              </div>
              <p className="text-xs font-bold text-[#E6DCB8] mt-0.5">
                Repositorio centralizado de tolerancias y especificaciones declaradas por los proveedores (7 Secciones Normativas).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Botón Único Unificado: Importar Todos los Formatos de Documentos e Imágenes (Excel, Word, PDF, Imagen) */}
            <label 
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 hover:from-blue-600 hover:to-cyan-600 text-white font-extrabold text-xs rounded-xl shadow-md border border-cyan-400/40 transition-all cursor-pointer active:scale-95 shrink-0" 
              title="Importar Ficha Técnica desde cualquier formato: Excel (.xlsx, .xls, .csv), Word (.docx, .doc), PDF (.pdf) o Imágenes (.png, .jpg, .webp)"
            >
              <Upload className="w-4 h-4 text-cyan-200 animate-pulse" />
              <span>{cargandoArchivo ? 'Leyendo documento...' : 'Importar Ficha (Excel, Word, PDF, Imagen)'}</span>
              <input 
                type="file" 
                accept=".xlsx,.xls,.csv,.doc,.docx,.pdf,image/*,.png,.jpg,.jpeg,.webp" 
                onChange={handleImportarCualquierDocumento} 
                disabled={cargandoArchivo}
                className="hidden" 
              />
            </label>

            <button
              onClick={() => {
                setFichaParaVersionarForm(null);
                setModalFormularioCompleto(true);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#485C3E] hover:bg-[#3B4D32] text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer border border-[#94A786]/50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Ficha (7 Secciones)</span>
            </button>

            <button onClick={onCerrar} className="p-2 text-[#AA9E80] hover:text-[#FBF8F2] rounded-xl bg-[#2D2D30] hover:bg-[#424246] cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Buscadores Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 border-b border-[#424246] bg-[#2D2D30] p-3 rounded-2xl my-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C6A466]" />
            <input
              type="text"
              value={busquedaTexto}
              onChange={(e) => setBusquedaTexto(e.target.value)}
              placeholder="Buscar Referencia STF, Ref. Proveedor (ej: CV-001, TEL-4587), Código FT..."
              className="w-full pl-10 pr-3.5 py-2 bg-[#2B2B2E] border border-[#424246] rounded-xl text-xs font-bold text-white placeholder-[#AA9E80] focus:outline-none focus:border-[#C6A466]"
            />
          </div>

          <div className="relative">
            <input
              type="text"
              value={busquedaProveedor}
              onChange={(e) => setBusquedaProveedor(e.target.value)}
              placeholder="Filtrar por Proveedor / Fabricante (ej: TEXTILES ABC, SHANGHAI JOY TEX)..."
              className="w-full px-3.5 py-2 bg-[#2B2B2E] border border-[#424246] rounded-xl text-xs font-bold text-white placeholder-[#AA9E80] focus:outline-none focus:border-[#C6A466]"
            />
          </div>
        </div>

        {/* Banner de Conexión: Base FT alimenta a Bloque 1 */}
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-white font-bold">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              <strong className="text-emerald-300">Flujo Conectado:</strong> Cualquier Ficha Técnica registrada aquí alimenta automáticamente las 7 pestañas del <strong>BLOQUE 1: ESPECIFICACIÓN DEL PROVEEDOR</strong> en Laboratorio.
            </span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-mono font-bold">
            Sincronizado
          </span>
        </div>

        {/* Cuerpo: Lista de Fichas a la izquierda, Detalle y 7 Pestañas a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto flex-1 pr-1 my-3">
          
          {/* Columna Izquierda: Lista de Fichas (5 cols) */}
          <div className="lg:col-span-5 space-y-2 max-h-[460px] overflow-y-auto pr-1">
            <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider block mb-1">
              Fichas Técnicas Registradas ({fichasFiltradas.length})
            </span>

            {fichasFiltradas.map((ficha: FichaTecnicaHistoricaVersionada) => {
              const esActiva = ficha.id === fichaActiva?.id;

              return (
                <div
                  key={ficha.id}
                  onClick={() => {
                    setFichaSeleccionada(ficha);
                    setVersionSeleccionadaIndex(ficha.historialVersiones.length - 1);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    esActiva
                      ? 'bg-[#C6A466]/20 border-[#C6A466] shadow-sm'
                      : 'bg-[#2D2D30] border-[#424246] hover:border-[#AA9E80]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-emerald-300">{ficha.codigoFT}</span>
                    <span className="text-[10px] bg-[#2B2B2E] text-[#F0DCA8] font-bold px-2 py-0.5 rounded-full border border-[#424246]">
                      v{ficha.versionActual}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm sm:text-base font-black text-white tracking-wide truncate">{ficha.referencia}</h4>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFichaSeleccionada(ficha);
                        setVersionSeleccionadaIndex(ficha.historialVersiones.length - 1);
                        setFichaParaFormatoCompleto(ficha);
                        setModalFormatoCompletoAbierto(true);
                      }}
                      className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-sm transition-all"
                      title="Ver formato oficial completo de STF GROUP"
                    >
                      <Eye className="w-3 h-3 text-amber-400" />
                      <span>Ver Formato</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs mt-1 flex-wrap gap-1">
                    <span className="text-[#F0DCA8] font-extrabold">{ficha.proveedor}</span>
                    <span className="font-mono text-amber-300 font-black text-xs">Ref Prov: {ficha.referenciaProveedor || 'N/A'}</span>
                  </div>

                  {ficha.documentoOriginal?.nombreArchivo && (
                    <div className="flex items-center gap-1.5 text-xs text-[#E6DCB8] font-bold mt-1.5 truncate">
                      <Paperclip className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      <span className="truncate">{ficha.documentoOriginal.nombreArchivo}</span>
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-[#424246]/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFichaSeleccionada(ficha);
                        setVersionSeleccionadaIndex(ficha.historialVersiones.length - 1);
                        setFichaParaFormatoCompleto(ficha);
                        setModalFormatoCompletoAbierto(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl text-[11px] font-bold border border-amber-500/30 transition-all cursor-pointer"
                      title="Ver ficha técnica en formato completo oficial STF GROUP (con opciones de exportación Word y PDF)"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-300" />
                      <span>Ver Formato Completo STF</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {fichasFiltradas.length === 0 && (
              <div className="p-8 text-center bg-[#2D2D30] rounded-2xl border border-[#424246] text-[#E6DCB8] text-xs font-bold">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
                No se encontraron fichas técnicas con ese criterio de búsqueda.
              </div>
            )}
          </div>

          {/* Columna Derecha: Detalle con las 7 Secciones Exactas (7 cols) */}
          <div className="lg:col-span-7 bg-[#2D2D30] border border-[#424246] rounded-2xl p-5 space-y-4 max-h-[460px] overflow-y-auto">
            {fichaActiva && versionActiva ? (
              <div className="space-y-4">
                
                {/* Cabecera de la Ficha Seleccionada */}
                <div className="flex items-start justify-between border-b border-[#424246] pb-3 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-emerald-300">{fichaActiva.codigoFT}</span>
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                        Versión {versionActiva.version} de {fichaActiva.versionActual}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 mt-1">
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">{fichaActiva.referencia}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setFichaParaFormatoCompleto(fichaActiva);
                          setModalFormatoCompletoAbierto(true);
                        }}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                        title="Ver formato oficial completo de STF GROUP"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ver Formato Completo</span>
                      </button>
                    </div>
                    <p className="text-xs font-bold text-[#E6DCB8] mt-0.5">
                      Fabricante: <strong className="text-[#F0DCA8] font-black text-sm">{fichaActiva.proveedor}</strong> • Ref. Fabricante: <strong className="text-amber-300 font-mono font-black text-sm">{fichaActiva.referenciaProveedor}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setFichaParaFormatoCompleto(fichaActiva);
                        setModalFormatoCompletoAbierto(true);
                      }}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/50 hover:to-amber-500/40 text-amber-200 border border-amber-500/50 rounded-lg text-xs font-black flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      title="Abrir en formato completo idéntico al PDF oficial de STF GROUP (Word y PDF)"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-300" />
                      <span>Ver Formato Completo STF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFichaParaVersionarForm(fichaActiva);
                        setModalFormularioCompleto(true);
                      }}
                      className="px-3 py-1.5 bg-[#2B2B2E] hover:bg-[#38383B] text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Crear Versión v{fichaActiva.versionActual + 1}</span>
                    </button>
                  </div>
                </div>

                {/* Selector de Historial de Versiones */}
                {fichaActiva.historialVersiones.length > 1 && (
                  <div className="bg-[#2B2B2E] p-2 rounded-xl border border-[#424246] flex items-center gap-2 overflow-x-auto text-xs">
                    <span className="text-[#E6DCB8] font-black text-xs uppercase">Versiones:</span>
                    {fichaActiva.historialVersiones.map((v: VersionFichaTecnica, idx: number) => (
                      <button
                        key={v.version}
                        onClick={() => setVersionSeleccionadaIndex(idx)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          versionActiva.version === v.version
                            ? 'bg-[#C6A466] text-[#120F0D] font-black shadow'
                            : 'bg-[#2D2D30] text-[#E6DCB8] hover:text-white border border-[#424246]'
                        }`}
                      >
                        v{v.version} ({v.fechaVersion})
                      </button>
                    ))}
                  </div>
                )}

                {/* 7 Pestañas Idénticas al Bloque 1 de Laboratorio */}
                <div className="grid grid-cols-7 gap-1 bg-[#2B2B2E] p-1 rounded-xl border border-[#424246] text-[10px] font-bold text-center">
                  {seccionesTabs.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setTabDetalle7(sec.id)}
                      className={`py-1.5 rounded-lg transition-all font-black ${
                        tabDetalle7 === sec.id
                          ? 'bg-[#C6A466] text-[#120F0D] shadow'
                          : 'text-[#FBF8F2] hover:bg-[#38383B]'
                      }`}
                      title={sec.title}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>

                {/* Panel 1: Contacto y Empresa */}
                {tabDetalle7 === 1 && (
                  <div className="bg-[#2B2B2E] p-3.5 rounded-xl border border-[#424246] space-y-2 text-xs">
                    <h4 className="font-black text-amber-300 text-[11px] uppercase pb-1 border-b border-[#424246]">1. Información de la Empresa Fabricante</h4>
                    <div className="space-y-1.5 text-white font-bold">
                      <div><span className="text-[#E6DCB8] font-extrabold inline-block w-28">Empresa:</span> <strong className="text-white font-black text-sm">{esp?.nombreEmpresa || fichaActiva.proveedor}</strong></div>
                      <div><span className="text-[#E6DCB8] font-extrabold inline-block w-28">Contacto:</span> <span className="text-white font-bold">{esp?.contactoTecnico || fichaActiva.contactoProveedor || 'N/A'}</span></div>
                      <div><span className="text-[#E6DCB8] font-extrabold inline-block w-28">Email:</span> <span className="text-[#F0DCA8] font-mono font-bold">{esp?.emailContacto || 'N/A'}</span></div>
                      <div><span className="text-[#E6DCB8] font-extrabold inline-block w-28">Tel / WhatsApp:</span> <span className="text-emerald-300 font-mono font-bold">{esp?.telefonoWhatsapp || 'N/A'}</span></div>
                      <div><span className="text-[#E6DCB8] font-extrabold inline-block w-28">País:</span> <span className="text-white font-bold">{esp?.paisEmpresa || fichaActiva.paisOrigen || 'N/A'}</span></div>
                    </div>
                  </div>
                )}

                {/* Panel 2: Trazabilidad y Comercial */}
                {tabDetalle7 === 2 && (
                  <div className="bg-[#2B2B2E] p-3.5 rounded-xl border border-[#424246] space-y-2 text-xs">
                    <h4 className="font-black text-amber-300 text-[11px] uppercase pb-1 border-b border-[#424246]">2. Trazabilidad y Datos Comerciales</h4>
                    <div className="grid grid-cols-2 gap-2 text-white font-bold">
                      <div><span className="text-[#E6DCB8] block text-[10px] font-extrabold">Ref Fabricante:</span><strong className="text-amber-300 font-mono font-black">{fichaActiva.referenciaProveedor}</strong></div>
                      <div><span className="text-[#E6DCB8] block text-[10px] font-extrabold">Ref STF / MT:</span><strong className="text-white font-mono font-black">{esp?.codigoMT || esp?.referenciaSTF || fichaActiva.referencia}</strong></div>
                      <div><span className="text-[#E6DCB8] block text-[10px] font-extrabold"># OC STF / PO:</span><strong className="text-emerald-300 font-mono font-black">{esp?.stfPoNumber || 'OAC 1107'}</strong></div>
                      <div><span className="text-[#E6DCB8] block text-[10px] font-extrabold">Fecha Producción:</span><strong className="text-white font-bold">{esp?.fechaProduccion || '2026-05-10'}</strong></div>
                      <div><span className="text-[#E6DCB8] block text-[10px] font-extrabold">Subpartida:</span><span className="font-mono text-[#F0DCA8] font-bold">{esp?.subpartidaArancelaria || '5407.52.00.00'}</span></div>
                      <div><span className="text-[#E6DCB8] block text-[10px] font-extrabold">Certificado Origen:</span><span className="text-emerald-300 font-bold">{esp?.aplicaCertificadoOrigen || 'SÍ'}</span></div>
                    </div>
                  </div>
                )}

                {/* Panel 3: Fibras y Composición */}
                {tabDetalle7 === 3 && (
                  <div className="bg-[#2B2B2E] p-3.5 rounded-xl border border-[#424246] space-y-2 text-xs">
                    <h4 className="font-black text-amber-300 text-[11px] uppercase pb-1 border-b border-[#424246]">3. Fibras, Hilos y Composición</h4>
                    <div className="space-y-1.5 text-white font-bold">
                      <div><span className="text-[#E6DCB8] font-extrabold">Composición Declarada:</span> <strong className="text-[#F0DCA8] font-black text-sm block mt-0.5">{esp?.composicion}</strong></div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div><span className="text-[#E6DCB8] block text-[10px] font-extrabold">Tipo Fibra:</span><span className="text-white font-bold">{esp?.tipoFibraFilamento || 'Filamento Continuo'}</span></div>
                        <div><span className="text-[#E6DCB8] block text-[10px] font-extrabold">Torsión:</span><span className="text-white font-bold">{esp?.sentidoTorsion || 'Z'}</span></div>
                        <div><span className="text-[#E6DCB8] block text-[10px] font-extrabold">Título Urdimbre:</span><span className="font-mono text-amber-300 font-bold">{esp?.tituloHiloUrdimbre || '75D/72F'}</span></div>
                        <div><span className="text-[#E6DCB8] block text-[10px] font-extrabold">Título Trama:</span><span className="font-mono text-amber-300 font-bold">{esp?.tituloHiloTrama || '150D/144F'}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel 4: Dimensiones y Peso */}
                {tabDetalle7 === 4 && (
                  <div className="bg-[#2B2B2E] p-3.5 rounded-xl border border-[#424246] space-y-2 text-xs">
                    <h4 className="font-black text-amber-300 text-[11px] uppercase pb-1 border-b border-[#424246]">4. Dimensiones, Gramaje y Peso</h4>
                    <div className="grid grid-cols-2 gap-2 text-white font-bold">
                      <div className="bg-[#2D2D30] p-2.5 rounded-xl border border-[#424246]">
                        <span className="text-[10px] text-[#E6DCB8] font-extrabold block">Gramaje Declarado</span>
                        <strong className="text-amber-300 font-mono text-sm font-black">{esp?.gramajeDeclaradoGsm} GSM</strong>
                      </div>
                      <div className="bg-[#2D2D30] p-2.5 rounded-xl border border-[#424246]">
                        <span className="text-[10px] text-[#E6DCB8] font-extrabold block">Ancho Útil</span>
                        <strong className="text-emerald-300 font-mono text-sm font-black">{esp?.anchoUtilM} m</strong>
                      </div>
                      <div className="bg-[#2D2D30] p-2.5 rounded-xl border border-[#424246]">
                        <span className="text-[10px] text-[#E6DCB8] font-extrabold block">Peso Lineal</span>
                        <strong className="text-white font-mono font-black">{esp?.pesoLinealGsm || 320} g/ml</strong>
                      </div>
                      <div className="bg-[#2D2D30] p-2.5 rounded-xl border border-[#424246]">
                        <span className="text-[10px] text-[#E6DCB8] font-extrabold block">Rendimiento</span>
                        <strong className="text-[#F0DCA8] font-mono font-black">{esp?.rendimientoMkg ? `${esp.rendimientoMkg} m/kg` : 'N/E'}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel 5: Estructura y Construcción */}
                {tabDetalle7 === 5 && (
                  <div className="bg-[#2B2B2E] p-3.5 rounded-xl border border-[#424246] space-y-2 text-xs">
                    <h4 className="font-black text-amber-300 text-[11px] uppercase pb-1 border-b border-[#424246]">5. Construcción, Ligamento y Acabados</h4>
                    <div className="grid grid-cols-2 gap-2 text-white font-bold">
                      <div><span className="text-[#E6DCB8] block text-[10px] font-extrabold">Tipo Tejido:</span><strong className="text-white font-black">{esp?.tipoTejido || 'Plano'}</strong></div>
                      <div><span className="text-[#E6DCB8] block text-[10px] font-extrabold">Ligamento:</span><span className="text-white font-bold">{esp?.tipoLigamento || 'Tafetán'}</span></div>
                      <div><span className="text-[#E6DCB8] block text-[10px] font-extrabold">Densidad Urdimbre:</span><span className="font-mono text-amber-300 font-bold">{esp?.densidadUrdimbreHilosCm || 36} hilos/cm</span></div>
                      <div><span className="text-[#E6DCB8] block text-[10px] font-extrabold">Densidad Trama:</span><span className="font-mono text-amber-300 font-bold">{esp?.densidadTramaPasadasCm || 28} pasadas/cm</span></div>
                      <div className="col-span-2 bg-[#2D2D30] p-2.5 rounded-xl border border-[#424246] mt-1">
                        <span className="text-[#E6DCB8] block text-[10px] font-extrabold">Acabados Textiles:</span>
                        <span className="text-white font-bold">{esp?.acabadosTextiles || 'Sanforizado + Suavizado'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel 6: Ensayos y Tolerancias */}
                {tabDetalle7 === 6 && (
                  <div className="bg-[#2B2B2E] p-3.5 rounded-xl border border-[#424246] space-y-2 text-xs">
                    <h4 className="font-black text-amber-300 text-[11px] uppercase pb-1 border-b border-[#424246]">6. Parámetros de Laboratorio y Tolerancias Declaradas</h4>
                    <div className="grid grid-cols-2 gap-2 text-white font-bold">
                      <div className="bg-[#2D2D30] p-2.5 rounded-xl border border-[#424246]">
                        <span className="text-[10px] text-[#E6DCB8] font-extrabold block">Encogimiento Largo</span>
                        <strong className="text-amber-400 font-mono text-sm font-black">{esp?.encogimientoLargoMax}%</strong> (AATCC 135)
                      </div>
                      <div className="bg-[#2D2D30] p-2.5 rounded-xl border border-[#424246]">
                        <span className="text-[10px] text-[#E6DCB8] font-extrabold block">Encogimiento Ancho</span>
                        <strong className="text-amber-400 font-mono text-sm font-black">{esp?.encogimientoAnchoMax}%</strong> (AATCC 135)
                      </div>
                      <div className="bg-[#2D2D30] p-2.5 rounded-xl border border-[#424246]">
                        <span className="text-[10px] text-[#E6DCB8] font-extrabold block">Solidez Lavado</span>
                        <strong className="text-emerald-300 font-mono text-sm font-black">≥ Grado {esp?.solidezLavadoMin}</strong>
                      </div>
                      <div className="bg-[#2D2D30] p-2.5 rounded-xl border border-[#424246]">
                        <span className="text-[10px] text-[#E6DCB8] font-extrabold block">Solidez Frote Húmedo</span>
                        <strong className="text-emerald-300 font-mono text-sm font-black">≥ Grado {esp?.solidezFroteHumedoMin}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel 7: Cuidados y Documento Original */}
                {tabDetalle7 === 7 && (
                  <div className="bg-[#2B2B2E] p-3.5 rounded-xl border border-[#424246] space-y-2 text-xs">
                    <h4 className="font-black text-amber-300 text-[11px] uppercase pb-1 border-b border-[#424246]">7. Cuidados y Documentación Original</h4>
                    <div className="space-y-2 text-white font-bold">
                      <div><span className="text-[#E6DCB8] font-extrabold">Lavado Sugerido:</span> <span className="text-white font-bold block mt-0.5">{esp?.lavadoSugerido || esp?.instruccionesLavadoSugerido || 'Lavado normal máx 40°C'}</span></div>
                      <div><span className="text-[#E6DCB8] font-extrabold">Planchado:</span> <span className="text-white font-bold block mt-0.5">{esp?.recomendacionesPlanchado || 'Plancha tibia máx 150°C'}</span></div>
                      <div className="pt-2.5 border-t border-[#424246] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-mono text-emerald-300 font-bold flex items-center gap-1.5 text-xs truncate">
                          <FileText className="w-4 h-4 text-[#F0DCA8] shrink-0" />
                          <span className="truncate">{fichaActiva.documentoOriginal?.nombreArchivo || versionActiva.nombreArchivoFT || 'FICHA_TECNICA_FABRICANTE.pdf'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => alert(`📄 Visualizando Documento Original del Proveedor:\n\nArchivo: ${fichaActiva.documentoOriginal?.nombreArchivo || versionActiva.nombreArchivoFT || 'FICHA_TECNICA_FABRICANTE.pdf'}\nProveedor: ${fichaActiva.proveedor}\nReferencia: ${fichaActiva.referenciaProveedor}\nFecha: ${versionActiva.fechaVersion}\n\nDocumento oficial conservado íntegro en TEXLAB.`)}
                          className="px-3.5 py-1.5 bg-[#C6A466] hover:bg-[#F0DCA8] text-[#120F0D] rounded-xl text-xs font-black shadow border border-white/40 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>VER DOCUMENTO ORIGINAL</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* BOTÓN DE AUTOCOMPLETADO Y USO */}
                {onSeleccionarFichaParaUso && (
                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onSeleccionarFichaParaUso(fichaActiva, versionActiva);
                        onCerrar();
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>USAR FICHA TÉCNICA (ALIMENTAR BLOQUE 1 EN LABORATORIO)</span>
                    </button>
                  </div>
                )}

              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Selecciona una ficha técnica histórica para ver sus versiones y especificaciones.
              </div>
            )}
          </div>

        </div>

        {/* MODAL COMPLETO DE 7 SECCIONES PARA NUEVA FICHA O NUEVA VERSIÓN */}
        {modalFormularioCompleto && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-md overflow-y-auto font-sans">
            <div className="w-full max-w-5xl bg-[#F8FAFC] border-2 border-[#CBD5E1] rounded-3xl shadow-2xl p-5 sm:p-7 text-[#0F172A] space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-4">
                <div>
                  <h4 className="font-black text-[#0F172A] text-base sm:text-lg tracking-wide uppercase flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#8C6D1F]" />
                    <span>
                      {fichaParaVersionarForm 
                        ? `Nueva Versión v${fichaParaVersionarForm.versionActual + 1}: ${fichaParaVersionarForm.referencia}`
                        : 'Registrar Nueva Ficha Técnica en la Base Histórica (7 Secciones)'}
                    </span>
                  </h4>
                  <p className="text-xs text-[#475569] font-bold mt-1">
                    La información registrada quedará disponible para alimentar el BLOQUE 1 en Laboratorio.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setModalFormularioCompleto(false);
                    setFichaParaVersionarForm(null);
                  }} 
                  className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <FormularioFichaProveedor
                onGuardarFicha={(nuevaFicha, nuevaVersion) => {
                  guardarFichaTecnicaProveedor(nuevaFicha, nuevaVersion);
                  setFichaSeleccionada(nuevaFicha);
                  setVersionSeleccionadaIndex(nuevaFicha.historialVersiones.length - 1);
                  setModalFormularioCompleto(false);
                  setFichaParaVersionarForm(null);
                }}
                onCancelar={() => {
                  setModalFormularioCompleto(false);
                  setFichaParaVersionarForm(null);
                }}
                fichaExistenteParaVersionar={fichaParaVersionarForm}
              />
            </div>
          </div>
        )}

        {/* MODAL DE FORMATO COMPLETO OFICIAL STF GROUP */}
        {modalFormatoCompletoAbierto && (
          <FichaTecnicaFormatoCompletoModal
            ficha={fichaParaFormatoCompleto || fichaActiva}
            version={versionActiva}
            onCerrar={() => {
              setModalFormatoCompletoAbierto(false);
              setFichaParaFormatoCompleto(null);
            }}
          />
        )}

      </div>
    </div>
  );
};
