import * as XLSX from 'xlsx';
import { FichaTecnicaHistoricaVersionada, VersionFichaTecnica } from '../types';

export interface DocumentoImportadoResultado {
  exito: boolean;
  mensaje: string;
  formato: 'EXCEL' | 'WORD' | 'PDF' | 'IMAGEN' | 'DESCONOCIDO';
  fichasCreadas: FichaTecnicaHistoricaVersionada[];
  archivoOriginal: {
    nombre: string;
    tamanoBytes: number;
    tipoMime: string;
    dataUrlPreview?: string;
  };
}

/**
 * Normalizador de claves de texto
 */
function limpiarClave(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[:#=\-\t\s_]+/g, ' ')
    .trim();
}

/**
 * Busca valores por coincidencia regex en un diccionario clave-valor
 */
function buscarEnMapa(mapa: Record<string, string>, ...patrones: RegExp[]): string {
  for (const p of patrones) {
    for (const [k, v] of Object.entries(mapa)) {
      if (p.test(k) && v) return v.trim();
    }
  }
  return '';
}

/**
 * Lee un archivo de cualquier formato (Excel, Word, PDF, Imagen)
 * e intenta extraer o construir Fichas Técnicas normalizadas.
 */
export async function procesarArchivoUniversal(
  file: File,
  usuarioNombre: string = 'Importación Universal'
): Promise<DocumentoImportadoResultado> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const nombreBase = file.name.replace(/\.[^/.]+$/, '').replace(/ficha\s*t[eé]cnica/i, '').replace(/[-_]+/g, ' ').trim();

  // --------------------------------------------------------------------------
  // 1. FORMATO EXCEL / CSV (.xlsx, .xls, .csv)
  // --------------------------------------------------------------------------
  if (['xlsx', 'xls', 'csv'].includes(extension)) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
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
              mapaClaves[limpiarClave(col0)] = col1 || col2 || '';
            } else if (col1 && regexClavesConocidas.test(col1)) {
              conteoClavesDetectadas++;
              mapaClaves[limpiarClave(col1)] = col2 || '';
            }
          });

          // Si es documento tipo Ficha Única Vertical
          if (conteoClavesDetectadas >= 3) {
            const proveedor = buscarEnMapa(mapaClaves, /proveedor|fabricante|molino|empresa/i) || 'PROVEEDOR TEXTIL';
            const referencia = buscarEnMapa(mapaClaves, /referencia|articulo|nombre|tela/i) || nombreBase || 'TELA BASE';
            const referenciaProveedor = buscarEnMapa(mapaClaves, /ref.*prov|codigo.*fab|codigo.*prov/i) || referencia;
            const codigoFT = buscarEnMapa(mapaClaves, /codigo.*ft|codigo/i) || `FT-${Date.now().toString().slice(-6)}`;
            const composicion = buscarEnMapa(mapaClaves, /composicion|fibra/i) || '100% Textil';
            const gramaje = parseFloat(buscarEnMapa(mapaClaves, /gramaje|peso|gsm/i).replace(/[^\d.]/g, '') || '240') || 240;
            const ancho = parseFloat(buscarEnMapa(mapaClaves, /ancho/i).replace(/[^\d.]/g, '') || '1.48') || 1.48;
            const encLargo = parseFloat(buscarEnMapa(mapaClaves, /encogimiento.*largo|encl/i).replace(/[^\d.-]/g, '') || '-2.5') || -2.5;
            const encAncho = parseFloat(buscarEnMapa(mapaClaves, /encogimiento.*ancho|enca/i).replace(/[^\d.-]/g, '') || '-3.0') || -3.0;

            const ficha: FichaTecnicaHistoricaVersionada = crearFichaEstandar({
              codigoFT,
              referencia,
              referenciaProveedor,
              proveedor,
              composicion,
              gramaje,
              ancho,
              encLargo,
              encAncho,
              nombreArchivo: file.name,
              tipoDoc: 'EXCEL',
              usuarioNombre
            });

            resolve({
              exito: true,
              mensaje: `Ficha Técnica "${referencia}" (${proveedor}) importada desde Excel`,
              formato: 'EXCEL',
              fichasCreadas: [ficha],
              archivoOriginal: { nombre: file.name, tamanoBytes: file.size, tipoMime: file.type }
            });
            return;
          }

          // Si es formato Tabular con múltiples filas
          const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          if (rawJson.length > 0) {
            const fichas: FichaTecnicaHistoricaVersionada[] = rawJson.map((row, idx) => {
              const rowMap: Record<string, string> = {};
              Object.entries(row).forEach(([k, v]) => {
                rowMap[limpiarClave(k)] = String(v ?? '').trim();
              });

              const ref = buscarEnMapa(rowMap, /referencia|articulo|nombre|tela/i) || `${nombreBase} Lote ${idx + 1}`;
              const prov = buscarEnMapa(rowMap, /proveedor|fabricante|molino/i) || 'PROVEEDOR IMPORTADO';
              const refProv = buscarEnMapa(rowMap, /ref.*prov|codigo.*fab/i) || ref;
              const gsm = parseFloat(buscarEnMapa(rowMap, /gramaje|peso|gsm/i).replace(/[^\d.]/g, '') || '220') || 220;
              const anc = parseFloat(buscarEnMapa(rowMap, /ancho/i).replace(/[^\d.]/g, '') || '1.48') || 1.48;
              const comp = buscarEnMapa(rowMap, /composicion|fibra/i) || '100% Algodón';

              return crearFichaEstandar({
                codigoFT: `FT-${Date.now().toString().slice(-6)}-${idx + 1}`,
                referencia: ref,
                referenciaProveedor: refProv,
                proveedor: prov,
                composicion: comp,
                gramaje: gsm,
                ancho: anc,
                encLargo: -2.5,
                encAncho: -3.0,
                nombreArchivo: file.name,
                tipoDoc: 'EXCEL',
                usuarioNombre
              });
            });

            resolve({
              exito: true,
              mensaje: `Se importaron ${fichas.length} fichas técnicas tabulares desde ${file.name}`,
              formato: 'EXCEL',
              fichasCreadas: fichas,
              archivoOriginal: { nombre: file.name, tamanoBytes: file.size, tipoMime: file.type }
            });
            return;
          }

          resolve({
            exito: false,
            mensaje: 'No se encontraron datos interpretables en la hoja de cálculo.',
            formato: 'EXCEL',
            fichasCreadas: [],
            archivoOriginal: { nombre: file.name, tamanoBytes: file.size, tipoMime: file.type }
          });
        } catch (err: any) {
          resolve({
            exito: false,
            mensaje: `Error al procesar archivo Excel: ${err.message}`,
            formato: 'EXCEL',
            fichasCreadas: [],
            archivoOriginal: { nombre: file.name, tamanoBytes: file.size, tipoMime: file.type }
          });
        }
      };
      reader.readAsBinaryString(file);
    });
  }

  // --------------------------------------------------------------------------
  // 2. FORMATO WORD (.docx, .doc)
  // --------------------------------------------------------------------------
  if (['docx', 'doc'].includes(extension)) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const textDecoder = new TextDecoder('utf-8');
          const contentStr = textDecoder.decode(buffer);

          // Extraer texto limpio de nodos XML de Word <w:t>...</w:t>
          const xmlMatches = contentStr.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
          let extractedText = '';
          if (xmlMatches && xmlMatches.length > 0) {
            extractedText = xmlMatches.map(m => m.replace(/<\/?w:t[^>]*>/g, '')).join(' ');
          } else {
            // Extraer secuencias legibles de caracteres alfanuméricos
            const words = contentStr.match(/[A-Za-z0-9ÁÉÍÓÚáéíóúñÑ%°#\-\.\s]{4,}/g);
            extractedText = (words || []).join(' ');
          }

          // Analizar patrones de texto
          const mapa = parsearTextoEnClaves(extractedText);

          const proveedor = buscarEnMapa(mapa, /proveedor|fabricante|molino|empresa/i) || 'PROVEEDOR WORD FT';
          const referencia = buscarEnMapa(mapa, /referencia|articulo|nombre|tela/i) || nombreBase || 'TELA WORD';
          const referenciaProveedor = buscarEnMapa(mapa, /ref.*prov|codigo.*fab/i) || referencia;
          const composicion = buscarEnMapa(mapa, /composicion|fibra/i) || '100% Algodón';
          const gramajeStr = buscarEnMapa(mapa, /gramaje|peso|gsm/i);
          const gramaje = parseFloat(gramajeStr.replace(/[^\d.]/g, '') || '230') || 230;
          const anchoStr = buscarEnMapa(mapa, /ancho/i);
          const ancho = parseFloat(anchoStr.replace(/[^\d.]/g, '') || '1.50') || 1.50;
          const encLargo = parseFloat(buscarEnMapa(mapa, /encogimiento.*largo/i).replace(/[^\d.-]/g, '') || '-2.5') || -2.5;
          const encAncho = parseFloat(buscarEnMapa(mapa, /encogimiento.*ancho/i).replace(/[^\d.-]/g, '') || '-3.0') || -3.0;

          const ficha = crearFichaEstandar({
            codigoFT: `FT-DOCX-${Date.now().toString().slice(-6)}`,
            referencia,
            referenciaProveedor,
            proveedor,
            composicion,
            gramaje,
            ancho,
            encLargo,
            encAncho,
            nombreArchivo: file.name,
            tipoDoc: 'WORD',
            usuarioNombre
          });

          resolve({
            exito: true,
            mensaje: `Ficha Técnica importada exitosamente desde documento Word "${file.name}"`,
            formato: 'WORD',
            fichasCreadas: [ficha],
            archivoOriginal: { nombre: file.name, tamanoBytes: file.size, tipoMime: file.type }
          });
        } catch (err: any) {
          resolve({
            exito: false,
            mensaje: `Error al procesar archivo Word: ${err.message}`,
            formato: 'WORD',
            fichasCreadas: [],
            archivoOriginal: { nombre: file.name, tamanoBytes: file.size, tipoMime: file.type }
          });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // --------------------------------------------------------------------------
  // 3. FORMATO PDF (.pdf)
  // --------------------------------------------------------------------------
  if (extension === 'pdf') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const textDecoder = new TextDecoder('utf-8');
          const pdfContent = textDecoder.decode(buffer);

          // Extraer texto plano entre streams de texto PDF
          const textMatches = pdfContent.match(/\(([^()]{2,})\)\s*Tj/g) || [];
          let extractedText = textMatches.map(m => m.replace(/^\(|\)\s*Tj$/g, '')).join(' ');

          if (!extractedText || extractedText.length < 20) {
            // Intentar extraer texto estructurado general
            const matchesGen = pdfContent.match(/[A-Za-z0-9ÁÉÍÓÚáéíóúñÑ%°#\-\.\s]{4,}/g);
            extractedText = (matchesGen || []).join(' ');
          }

          const mapa = parsearTextoEnClaves(extractedText);

          const proveedor = buscarEnMapa(mapa, /proveedor|fabricante|molino|empresa/i) || 'PROVEEDOR PDF';
          const referencia = buscarEnMapa(mapa, /referencia|articulo|nombre|tela/i) || nombreBase || 'FICHA PDF';
          const referenciaProveedor = buscarEnMapa(mapa, /ref.*prov|codigo.*fab/i) || referencia;
          const composicion = buscarEnMapa(mapa, /composicion|fibra/i) || '100% Textil';
          const gramaje = parseFloat(buscarEnMapa(mapa, /gramaje|peso|gsm/i).replace(/[^\d.]/g, '') || '245') || 245;
          const ancho = parseFloat(buscarEnMapa(mapa, /ancho/i).replace(/[^\d.]/g, '') || '1.48') || 1.48;

          const ficha = crearFichaEstandar({
            codigoFT: `FT-PDF-${Date.now().toString().slice(-6)}`,
            referencia,
            referenciaProveedor,
            proveedor,
            composicion,
            gramaje,
            ancho,
            encLargo: -2.0,
            encAncho: -2.5,
            nombreArchivo: file.name,
            tipoDoc: 'PDF',
            usuarioNombre
          });

          resolve({
            exito: true,
            mensaje: `Ficha Técnica importada exitosamente desde PDF "${file.name}"`,
            formato: 'PDF',
            fichasCreadas: [ficha],
            archivoOriginal: { nombre: file.name, tamanoBytes: file.size, tipoMime: file.type }
          });
        } catch (err: any) {
          resolve({
            exito: false,
            mensaje: `Error al procesar PDF: ${err.message}`,
            formato: 'PDF',
            fichasCreadas: [],
            archivoOriginal: { nombre: file.name, tamanoBytes: file.size, tipoMime: file.type }
          });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // --------------------------------------------------------------------------
  // 4. FORMATO IMAGEN (.png, .jpg, .jpeg, .webp, .bmp, etc.)
  // --------------------------------------------------------------------------
  if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff'].includes(extension)) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const dataUrl = e.target?.result as string;

          // Crear Ficha con la imagen adjunta en la versión
          const refGenerada = nombreBase || `MUESTRA-IMG-${Date.now().toString().slice(-4)}`;
          const ficha = crearFichaEstandar({
            codigoFT: `FT-IMG-${Date.now().toString().slice(-6)}`,
            referencia: refGenerada,
            referenciaProveedor: refGenerada,
            proveedor: 'PROVEEDOR FOTOGRÁFICO',
            composicion: 'Composición por verificar en imagen',
            gramaje: 220,
            ancho: 1.50,
            encLargo: -2.0,
            encAncho: -3.0,
            nombreArchivo: file.name,
            tipoDoc: 'IMAGEN',
            dataUrlImagen: dataUrl,
            usuarioNombre
          });

          resolve({
            exito: true,
            mensaje: `Imagen de Ficha Técnica "${file.name}" importada y registrada exitosamente`,
            formato: 'IMAGEN',
            fichasCreadas: [ficha],
            archivoOriginal: { nombre: file.name, tamanoBytes: file.size, tipoMime: file.type, dataUrlPreview: dataUrl }
          });
        } catch (err: any) {
          resolve({
            exito: false,
            mensaje: `Error al procesar imagen: ${err.message}`,
            formato: 'IMAGEN',
            fichasCreadas: [],
            archivoOriginal: { nombre: file.name, tamanoBytes: file.size, tipoMime: file.type }
          });
        }
      };
      reader.readAsDataURL(file);
    });
  }

  return {
    exito: false,
    mensaje: `Formato de archivo .${extension} no soportado. Se admiten Excel (.xlsx, .xls, .csv), Word (.docx, .doc), PDF (.pdf) e Imágenes (.png, .jpg, .webp).`,
    formato: 'DESCONOCIDO',
    fichasCreadas: [],
    archivoOriginal: { nombre: file.name, tamanoBytes: file.size, tipoMime: file.type }
  };
}

/**
 * Parsea un texto corrido dividiéndolo en posibles pares clave-valor
 */
function parsearTextoEnClaves(texto: string): Record<string, string> {
  const mapa: Record<string, string> = {};
  const lineas = texto.split(/[\r\n\t;|]+/);

  for (const linea of lineas) {
    const partes = linea.split(/[:=]+/);
    if (partes.length >= 2) {
      const k = limpiarClave(partes[0]);
      const v = partes.slice(1).join(' ').trim();
      if (k && v) {
        mapa[k] = v;
      }
    }
  }

  // Buscar también por expresiones regulares directamente en el texto
  const extraerRegex = (re: RegExp): string => {
    const m = texto.match(re);
    return m ? (m[1] || m[0]).trim() : '';
  };

  const refMatch = extraerRegex(/(?:referencia|articulo|item|fabric)\s*[:#=\-]?\s*([A-Za-z0-9\-\s]{3,30})/i);
  if (refMatch) mapa['referencia'] = refMatch;

  const provMatch = extraerRegex(/(?:proveedor|fabricante|supplier|mill)\s*[:#=\-]?\s*([A-Za-z0-9\-\s]{3,35})/i);
  if (provMatch) mapa['proveedor'] = provMatch;

  const gsmMatch = extraerRegex(/(?:gramaje|peso|weight|gsm)\s*[:#=\-]?\s*([0-9]{2,4})/i);
  if (gsmMatch) mapa['gramaje'] = gsmMatch;

  const anchoMatch = extraerRegex(/(?:ancho|width)\s*[:#=\-]?\s*([0-9]+[.,]?[0-9]*)/i);
  if (anchoMatch) mapa['ancho'] = anchoMatch.replace(',', '.');

  const compMatch = extraerRegex(/(?:composicion|composition|content)\s*[:#=\-]?\s*([0-9%A-Za-z\s,/+]{4,40})/i);
  if (compMatch) mapa['composicion'] = compMatch;

  return mapa;
}

/**
 * Crea una estructura de FichaTecnicaHistoricaVersionada completa con 7 secciones
 */
function crearFichaEstandar(datos: {
  codigoFT: string;
  referencia: string;
  referenciaProveedor: string;
  proveedor: string;
  composicion: string;
  gramaje: number;
  ancho: number;
  encLargo: number;
  encAncho: number;
  nombreArchivo: string;
  tipoDoc: 'EXCEL' | 'WORD' | 'PDF' | 'IMAGEN';
  dataUrlImagen?: string;
  usuarioNombre: string;
}): FichaTecnicaHistoricaVersionada {
  const hoy = new Date().toISOString().split('T')[0];

  return {
    id: `ft-${datos.tipoDoc.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    codigoFT: datos.codigoFT,
    referencia: datos.referencia,
    referenciaProveedor: datos.referenciaProveedor,
    proveedor: datos.proveedor,
    contactoProveedor: 'soporte.proveedor@textil.com',
    paisOrigen: 'Colombia',
    versionActual: 1,
    estadoRevision: 'APROBADA_HISTORICO',
    createdAt: hoy,
    createdBy: datos.usuarioNombre,
    updatedAt: hoy,
    updatedBy: datos.usuarioNombre,
    documentoOriginal: {
      nombreArchivo: datos.nombreArchivo,
      tipo: datos.tipoDoc,
      fechaCarga: hoy
    },
    historialVersiones: [
      {
        version: 1,
        fechaVersion: hoy,
        creadoPor: datos.usuarioNombre,
        activo: true,
        cambiosRespectoAnterior: `Importación oficial de documento (${datos.tipoDoc}) del fabricante.`,
        nombreArchivoFT: datos.nombreArchivo,
        especificaciones: {
          nombreEmpresa: datos.proveedor,
          contactoTecnico: 'Ingeniería Textil Fabricante',
          emailContacto: 'calidad@proveedor.com',
          telefonoWhatsapp: '+57 300 0000000',
          paisEmpresa: 'Colombia',
          stfPoNumber: 'OAC-2026-FT',
          fechaProduccion: hoy,
          codigoMT: datos.codigoFT,
          referenciaSTF: datos.referencia,
          referenciaProveedor: datos.referenciaProveedor,
          codigoFabrica: datos.referenciaProveedor,
          nombreComercialTela: datos.referencia,
          molinoFabricante: datos.proveedor,
          paisOrigen: 'Colombia',
          numeroLoteProduccion: 'LOT-2026-DOC',
          colorShade: '000 ESTÁNDAR',
          subpartidaArancelaria: '5407.52.00.00',
          certificadoOrigen: 'CO-2026-STF',
          composicion: datos.composicion,
          composicionPorcentual: datos.composicion,
          tipoFibraFilamento: 'Filamento Continuo / Hilado Anillo',
          tipoFibraTexturizado: 'Normal',
          tituloHiloUrdimbre: '30/1 Ne',
          tituloHiloTrama: '30/1 Ne',
          sentidoTorsion: 'Z',
          mezclaIntima: datos.composicion,
          anchoTotalM: datos.ancho + 0.04,
          anchoUtilM: datos.ancho,
          gramajeDeclaradoGsm: datos.gramaje,
          pesoLinealGsm: Math.round(datos.gramaje * datos.ancho),
          rendimientoMkg: parseFloat((1000 / (datos.gramaje * datos.ancho)).toFixed(2)),
          espesorMm: 0.42,
          tipoTejido: 'Plano',
          tipoLigamento: 'Tafetán / Sarga',
          densidadUrdimbreHilosCm: 36,
          densidadTramaPasadasCm: 28,
          acabadosTextiles: 'Sanforizado + Suavizado Antipilling',
          acabadoColorTintoreria: 'Teñido en Pieza / Continuo',
          encogimientoLargoMax: datos.encLargo,
          encogimientoAnchoMax: datos.encAncho,
          viroMax: 1.5,
          solidezLavadoMin: 4.0,
          solidezFroteSecoMin: 4.0,
          solidezFroteHumedoMin: 3.5,
          lavadoSugerido: 'Lavado doméstico máx. 40°C. Plancha tibia.',
          observacionesFabricante: `Ficha técnica generada automáticamente a partir del documento importado ${datos.nombreArchivo} (${datos.tipoDoc}).`,
          documentosAdjuntos: datos.dataUrlImagen ? {
            fotosTela: [{
              nombre: datos.nombreArchivo,
              urlData: datos.dataUrlImagen,
              fecha: new Date().toISOString()
            }]
          } : undefined
        },
        urlArchivoFT: datos.dataUrlImagen
      }
    ]
  };
}
