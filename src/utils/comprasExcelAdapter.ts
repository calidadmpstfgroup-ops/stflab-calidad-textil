/**
 * Adaptador Inteligente de Importación de Excel de Compras para STFLab
 * Procesa archivos .xlsx, .xls, .csv, texto tabulado y capturas.
 */

import * as XLSX from 'xlsx';
import { Muestra } from '../types';

export interface RawComprasRow {
  filaOriginal?: number;
  solicitudCompra: string;
  referencia: string;
  color: string;
  proveedor: string;
  ordenCompraCol: string;
  observacion?: string;
  fotoUrl?: string;
}

export interface SolicitudCompraAgrupada {
  id: string;
  solicitudCompra: string;
  referencia: string;
  color: string;
  proveedor: string;
  ordenCompra: string;
  observacionPrincipal: string;
  totalLineas: number;
  seleccionadaParaImportar: boolean;
  usarUnaMuestraConfirmada: boolean;
  sugerenciaUnaMuestra: boolean;
  motivoSugerencia?: string;
  fotoUrl?: string;
  fotos?: string[];
  lineas: Array<{
    id: string;
    solicitudCompra: string;
    referencia: string;
    color: string;
    proveedor: string;
    ordenCompraCol: string;
    observacion?: string;
    fotoUrl?: string;
  }>;
}

export interface ResultadoImportacionCompras {
  exito: boolean;
  nombreArchivo: string;
  filasValidas: number;
  totalSolicitudesAgrupadas: number;
  totalImagenesDetectadas: number;
  solicitudesConSugerenciaUnaMuestra: number;
  hojasDisponibles?: string[];
  hojaSeleccionada?: string;
  mapeoColumnasDetectado?: { [colIdx: number]: string };
  filasCrudas: RawComprasRow[];
  grupos: SolicitudCompraAgrupada[];
  errores: string[];
}

export function parseCSVorTSVGrid(text: string): { grid: string[][] } {
  if (!text.trim()) return { grid: [] };
  const lines = text.trim().split(/\r?\n/);
  const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
  const grid = lines.map(line => line.split(delimiter).map(cell => cell.trim().replace(/^["']|["']$/g, '')));
  return { grid };
}

export function parseHtmlTableGrid(html: string): string[][] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const table = doc.querySelector('table');
  if (!table) return [];
  const rows = Array.from(table.querySelectorAll('tr'));
  return rows.map(r => Array.from(r.querySelectorAll('th, td')).map(c => c.textContent?.trim() || ''));
}

export function agruparFilasCompras(rows: RawComprasRow[], nombreOrigen: string): ResultadoImportacionCompras {
  const gruposMap: Map<string, SolicitudCompraAgrupada> = new Map();
  let sugerenciasUnaMuestra = 0;

  rows.forEach((row, idx) => {
    const solCode = (row.solicitudCompra || `SOL-AUTO-${idx + 1}`).trim().toUpperCase();
    const existing = gruposMap.get(solCode);

    const obsText = (row.observacion || '').toUpperCase();
    const tieneSugerencia = obsText.includes('1 SOLA MUESTRA') || obsText.includes('MISMA TELA') || obsText.includes('UNA SOLA MUESTRA');

    const lineaItem = {
      id: `linea-${idx}-${Date.now()}`,
      solicitudCompra: solCode,
      referencia: row.referencia || 'TELA SIN REFERENCIA',
      color: row.color || 'ESTÁNDAR',
      proveedor: row.proveedor || 'PROVEEDOR GENERAL',
      ordenCompraCol: row.ordenCompraCol || 'OAC',
      observacion: row.observacion || '',
      fotoUrl: row.fotoUrl
    };

    if (existing) {
      existing.totalLineas += 1;
      existing.lineas.push(lineaItem);
      if (row.fotoUrl && !existing.fotoUrl) {
        existing.fotoUrl = row.fotoUrl;
      }
      if (tieneSugerencia) {
        existing.sugerenciaUnaMuestra = true;
        existing.usarUnaMuestraConfirmada = true;
        existing.motivoSugerencia = row.observacion;
      }
    } else {
      if (tieneSugerencia) sugerenciasUnaMuestra++;

      gruposMap.set(solCode, {
        id: `grupo-${solCode}-${idx}`,
        solicitudCompra: solCode,
        referencia: row.referencia || 'TELA SIN REFERENCIA',
        color: row.color || 'ESTÁNDAR',
        proveedor: row.proveedor || 'PROVEEDOR GENERAL',
        ordenCompra: row.ordenCompraCol || 'OAC',
        observacionPrincipal: row.observacion || '',
        totalLineas: 1,
        seleccionadaParaImportar: true,
        usarUnaMuestraConfirmada: tieneSugerencia,
        sugerenciaUnaMuestra: tieneSugerencia,
        motivoSugerencia: tieneSugerencia ? row.observacion : undefined,
        fotoUrl: row.fotoUrl,
        fotos: row.fotoUrl ? [row.fotoUrl] : [],
        lineas: [lineaItem]
      });
    }
  });

  const grupos = Array.from(gruposMap.values());

  return {
    exito: grupos.length > 0,
    nombreArchivo: nombreOrigen,
    filasValidas: rows.length,
    totalSolicitudesAgrupadas: grupos.length,
    totalImagenesDetectadas: rows.filter(r => Boolean(r.fotoUrl)).length,
    solicitudesConSugerenciaUnaMuestra: sugerenciasUnaMuestra,
    filasCrudas: rows,
    grupos,
    errores: []
  };
}

export async function procesarExcelCompras(
  buffer: ArrayBuffer,
  fileName: string,
  sheetNameOverride?: string,
  customMapping?: { [colIdx: number]: string }
): Promise<ResultadoImportacionCompras> {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheetNames = wb.SheetNames;
  const targetSheet = sheetNameOverride || sheetNames[0];
  const ws = wb.Sheets[targetSheet];

  const jsonData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (!jsonData || jsonData.length === 0) {
    return {
      exito: false,
      nombreArchivo: fileName,
      filasValidas: 0,
      totalSolicitudesAgrupadas: 0,
      totalImagenesDetectadas: 0,
      solicitudesConSugerenciaUnaMuestra: 0,
      hojasDisponibles: sheetNames,
      hojaSeleccionada: targetSheet,
      filasCrudas: [],
      grupos: [],
      errores: ['La hoja de Excel se encuentra vacía.']
    };
  }

  const rawRows: RawComprasRow[] = [];
  const rows = jsonData.slice(1);

  rows.forEach((r, idx) => {
    if (!r || r.length === 0) return;
    const sol = String(r[0] || '').trim();
    const ref = String(r[1] || '').trim();
    const col = String(r[2] || '').trim();
    const prov = String(r[3] || '').trim();
    const oc = String(r[4] || '').trim();
    const obs = String(r[5] || '').trim();

    if (!sol && !ref) return;

    rawRows.push({
      filaOriginal: idx + 2,
      solicitudCompra: sol || `SOL-${idx + 1}`,
      referencia: ref || 'TELA',
      color: col || 'ESTÁNDAR',
      proveedor: prov || 'PROVEEDOR',
      ordenCompraCol: oc || 'OAC',
      observacion: obs
    });
  });

  const res = agruparFilasCompras(rawRows, fileName);
  res.hojasDisponibles = sheetNames;
  res.hojaSeleccionada = targetSheet;
  return res;
}

export function procesarTextoPegadoCompras(
  text: string,
  title: string = 'Texto Pegado',
  html?: string,
  mapping?: { [colIdx: number]: string }
): ResultadoImportacionCompras {
  let grid: string[][] = [];
  if (html && html.includes('<table')) {
    grid = parseHtmlTableGrid(html);
  }
  if (grid.length === 0 && text.trim()) {
    grid = parseCSVorTSVGrid(text).grid;
  }

  if (grid.length === 0) {
    return {
      exito: false,
      nombreArchivo: title,
      filasValidas: 0,
      totalSolicitudesAgrupadas: 0,
      totalImagenesDetectadas: 0,
      solicitudesConSugerenciaUnaMuestra: 0,
      filasCrudas: [],
      grupos: [],
      errores: ['No se detectó contenido estructurado en la tabla.']
    };
  }

  const rawRows: RawComprasRow[] = [];
  const dataRows = grid.length > 1 ? grid.slice(1) : grid;

  dataRows.forEach((r, idx) => {
    if (!r || r.length === 0) return;
    const sol = String(r[0] || '').trim();
    const ref = String(r[1] || '').trim();
    const col = String(r[2] || '').trim();
    const prov = String(r[3] || '').trim();
    const oc = String(r[4] || '').trim();
    const obs = String(r[5] || '').trim();

    if (!sol && !ref) return;

    rawRows.push({
      filaOriginal: idx + 2,
      solicitudCompra: sol || `SOL-${idx + 1}`,
      referencia: ref || 'TELA',
      color: col || 'ESTÁNDAR',
      proveedor: prov || 'PROVEEDOR',
      ordenCompraCol: oc || 'OAC',
      observacion: obs
    });
  });

  return agruparFilasCompras(rawRows, title);
}

export function procesarFilasCapturaCompras(
  filas: any[],
  nombreOrigen: string,
  imageSrc?: string
): ResultadoImportacionCompras {
  const rawRows: RawComprasRow[] = filas.map((r, idx) => ({
    filaOriginal: idx + 1,
    solicitudCompra: r.solicitudCompra || r.solicitud || `SOL-OCR-${idx + 1}`,
    referencia: r.referencia || r.tela || 'TELA CAPTURA',
    color: r.color || 'ESTÁNDAR',
    proveedor: r.proveedor || 'PROVEEDOR',
    ordenCompraCol: r.ordenCompra || r.oc || 'OAC',
    observacion: r.observacion || '',
    fotoUrl: imageSrc
  }));

  return agruparFilasCompras(rawRows, nombreOrigen);
}

export function generarMuestrasDesdeGrupos(
  grupos: SolicitudCompraAgrupada[],
  archivoOrigen: string,
  userName: string = 'Compras'
): Muestra[] {
  const muestrasNuevas: Muestra[] = [];
  const fechaHoy = new Date().toISOString().split('T')[0];

  grupos.forEach((grupo, idx) => {
    const timestamp = Date.now() + idx;
    const codigoAuto = `STF-${new Date().getFullYear()}-${String(timestamp).slice(-6)}`;

    const nuevaMuestra: Muestra = {
      id: `m-imp-${timestamp}`,
      codigo: codigoAuto,
      codigoMaterial: `MAT-${grupo.solicitudCompra}`,
      referencia: grupo.referencia.toUpperCase(),
      nombreTela: `${grupo.referencia} (${grupo.color})`.toUpperCase(),
      proveedor: grupo.proveedor.toUpperCase(),
      nroLote: grupo.ordenCompra,
      ordenCompra: grupo.ordenCompra,
      color: grupo.color.toUpperCase(),
      prioridad: 'Media',
      solicitudCompra: grupo.solicitudCompra,
      observaciones: grupo.observacionPrincipal || `Solicitud importada desde ${archivoOrigen}. Total telas: ${grupo.totalLineas}.`,
      registradoPor: userName,
      fechaIngreso: fechaHoy,
      composicion: '100% Algodón',
      paisOrigen: 'Colombia',
      resultadoFinal: 'Pendiente',
      dictamenLaboratorio: 'Pendiente',
      fotoUrl: grupo.fotoUrl,
      fotos: grupo.fotos,
      lineasCompra: grupo.lineas,
      archivoOrigen,
      esMuestraConsolidada: grupo.usarUnaMuestraConfirmada,
      fichaTecnica: {
        gramajeEsperado: 220,
        pesoMlEsperado: 330,
        anchoEsperado: 1.48,
        anchoTotalEsperado: 1.50,
        encogimientoEsperado: -2.5
      },
      pruebas: {
        encogimientoMedido: 0,
        elasticidadMedida: 0,
        recuperacion: 0,
        solidezColor: 'Pendiente',
        resistencia: 'Pendiente',
        pilling: 'Pendiente'
      }
    };

    muestrasNuevas.push(nuevaMuestra);
  });

  return muestrasNuevas;
}
