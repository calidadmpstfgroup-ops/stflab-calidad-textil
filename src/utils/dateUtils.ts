/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Returns the current date formatted as YYYY-MM-DD taking into account
 * the Colombia timezone (America/Bogota) to ensure consistency.
 */
export function getLocalDateString(): string {
  try {
    const d = new Date();
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(d);
  } catch (e) {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  }
}

export function parseDocumentDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (value instanceof Date && !isNaN(value.getTime())) {
    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate()
    );
  }

  const text = String(value).trim();

  // Excel serial date
  if (/^\d+(\.\d+)?$/.test(text)) {
    const serial = Number(text);
    if (serial > 20000 && serial < 60000) {
      const date = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
      return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
      );
    }
  }

  // DD/MM/YYYY o DD-MM-YYYY
  const match = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  // YYYY-MM-DD
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);

    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  return null;
}

export function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function findExactColumn(
  headers: unknown[],
  possibleNames: string[]
): number {
  const normalizedHeaders = headers.map(normalizeHeader);
  const normalizedNames = possibleNames.map(normalizeHeader);

  return normalizedHeaders.findIndex(header =>
    normalizedNames.includes(header)
  );
}

/**
 * Normalizes any date input into a clean YYYY-MM-DD string format
 */
export function normalizeDateString(val: any): string | null {
  if (val === null || val === undefined) return null;

  if (val === true) return 'VERDADERO';
  if (val === false) return null;

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  if (typeof val === 'number') {
    if (val > 25000 && val < 70000) {
      const dateObj = new Date((val - (25567 + 2)) * 86400 * 1000);
      if (!isNaN(dateObj.getTime())) {
        const y = dateObj.getUTCFullYear();
        const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }
    return null;
  }

  const str = String(val).trim();
  const strUpper = str.toUpperCase();

  if (!str || strUpper === 'FALSO' || strUpper === 'FALSE' || strUpper === '0' || strUpper === 'PENDIENTE' || strUpper === 'N/A' || strUpper === 'NULL' || strUpper === 'UNDEFINED') {
    return null;
  }

  const isoMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const mm = month < 10 ? `0${month}` : `${month}`;
      const dd = day < 10 ? `0${day}` : `${day}`;
      return `${year}-${mm}-${dd}`;
    }
  }

  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
  if (dmyMatch) {
    let day = parseInt(dmyMatch[1], 10);
    let month = parseInt(dmyMatch[2], 10);
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;
    if (month > 12 && day <= 12) {
      const temp = day;
      day = month;
      month = temp;
    }
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const mm = month < 10 ? `0${month}` : `${month}`;
      const dd = day < 10 ? `0${day}` : `${day}`;
      return `${year}-${mm}-${dd}`;
    }
  }

  if (/^\d{5}(\.\d+)?$/.test(str)) {
    const num = parseFloat(str);
    if (num > 25000 && num < 70000) {
      const dateObj = new Date((num - (25567 + 2)) * 86400 * 1000);
      if (!isNaN(dateObj.getTime())) {
        const y = dateObj.getUTCFullYear();
        const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }
  }

  if (strUpper.includes('VERDADERO') || strUpper.includes('TRUE') || strUpper === 'SI' || strUpper === 'OK' || strUpper === 'VERDADERA') {
    return 'VERDADERO';
  }

  return null;
}

export function parseToLocalDate(input: any): Date | null {
  if (!input) return null;

  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null;
    return new Date(input.getFullYear(), input.getMonth(), input.getDate(), 0, 0, 0, 0);
  }

  const norm = normalizeDateString(input);
  if (!norm || norm === 'VERDADERO') return null;

  const parts = norm.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day, 0, 0, 0, 0);
    }
  }

  return null;
}

export function isDiligenciado(val?: string | boolean | number | null): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'boolean') return val;
  const str = String(val).trim().toUpperCase();
  if (!str || str === 'FALSO' || str === 'FALSE' || str === '0' || str === 'PENDIENTE' || str === 'N/A' || str === 'NULL' || str === 'UNDEFINED') {
    return false;
  }
  return true;
}

export function isFechaReal(val?: string | boolean | number | null): boolean {
  if (val === null || val === undefined || typeof val === 'boolean') return false;
  const str = String(val).trim().toUpperCase();
  if (!str || str === 'VERDADERO' || str === 'TRUE' || str === 'FALSO' || str === 'FALSE' || str === '0' || str === 'PENDIENTE' || str === 'N/A' || str === 'NULL' || str === 'UNDEFINED') {
    return false;
  }
  return parseToLocalDate(val) !== null;
}

export function getLocalTimeString(): string {
  try {
    return new Date().toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (e) {
    return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  }
}

export const COLOMBIAN_HOLIDAYS = new Set([
  '2025-01-01', '2025-01-06', '2025-03-24', '2025-04-17', '2025-04-18', '2025-05-01',
  '2025-06-02', '2025-06-23', '2025-06-30', '2025-07-20', '2025-08-07', '2025-08-18',
  '2025-10-13', '2025-11-03', '2025-11-17', '2025-12-08', '2025-12-25',
  '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03', '2026-05-01',
  '2026-05-18', '2026-06-08', '2026-06-15', '2026-07-20', '2026-08-07', '2026-08-17',
  '2026-10-12', '2026-11-02', '2026-11-16', '2026-12-08', '2026-12-25',
  '2027-01-01', '2027-01-11', '2027-03-22', '2027-03-25', '2027-03-26', '2027-05-01',
  '2027-05-10', '2027-05-31', '2027-06-07', '2027-07-20', '2027-08-07', '2027-08-16',
  '2027-10-18', '2027-11-01', '2027-11-15', '2027-12-08', '2027-12-25',
]);

export function isNonWorkingDay(date: Date | string): boolean {
  const parsed = parseToLocalDate(date);
  if (!parsed) return false;

  const dayOfWeek = parsed.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return true;
  }
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  const isoDate = `${y}-${m}-${d}`;
  return COLOMBIAN_HOLIDAYS.has(isoDate);
}

export function calcularDiasCalendario(fechaInicio: any, fechaFin: any): number {
  if (!fechaInicio || !fechaFin) return 0;
  const normStart = normalizeDateString(fechaInicio);
  const normEnd = normalizeDateString(fechaFin);
  if (!normStart || normStart === 'VERDADERO' || !normEnd || normEnd === 'VERDADERO') return 0;

  const startDate = parseToLocalDate(normStart);
  const endDate = parseToLocalDate(normEnd);
  if (!startDate || !endDate) return 0;
  if (endDate < startDate) return 0;

  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function calcularDiasHabiles(fechaIngreso: any, fechaSalida?: any): number {
  if (!fechaIngreso || !fechaSalida) return 0;

  let normStart = normalizeDateString(fechaIngreso);
  if (!normStart || normStart === 'VERDADERO' || normStart === 'TRUE') return 0;

  let normEnd = normalizeDateString(fechaSalida);
  if (!normEnd || normEnd === 'VERDADERO' || normEnd === 'TRUE') return 0;

  const startDate = parseToLocalDate(normStart);
  const endDate = parseToLocalDate(normEnd);

  if (!startDate || !endDate) return 0;
  if (endDate < startDate) return 0;

  let diasHabiles = 0;
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
  const target = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0, 0);

  while (current <= target) {
    const dayOfWeek = current.getDay();
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    const dateString = `${y}-${m}-${d}`;

    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !COLOMBIAN_HOLIDAYS.has(dateString)) {
      diasHabiles++;
    }
    current.setDate(current.getDate() + 1);
  }

  return Math.max(0, diasHabiles - 1);
}

export function calcularDiasPorModo(fechaInicio: any, fechaFin: any, modo: 'CALENDARIO' | 'HABILES' = 'CALENDARIO'): number {
  if (modo === 'HABILES') {
    return calcularDiasHabiles(fechaInicio, fechaFin);
  }
  return calcularDiasCalendario(fechaInicio, fechaFin);
}

export function formatFechaColombiana(val: any): string | null {
  if (!val) return null;
  const norm = normalizeDateString(val);
  if (!norm || norm === 'VERDADERO') return null;
  const parts = norm.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return String(val);
}

export function differenceInDays(
  start: Date | null,
  end: Date | null
): number | null {
  if (!start || !end) {
    return null;
  }

  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const milliseconds = endDay.getTime() - startDay.getTime();

  return Math.round(milliseconds / (1000 * 60 * 60 * 24));
}

export interface ResultadoTiempoEtapa {
  dias: number | null;
  diasCalendario: number | null;
  diasHabiles: number | null;
  estado: 'Calculado' | 'En proceso' | 'Por registrar';
  fechaInicial: string | null;
  fechaFinal: string | null;
  etiqueta: string;
}

export interface TiemposProcesoResultado {
  tiempoColecciones: ResultadoTiempoEtapa;
  tiempoLaboratorio: ResultadoTiempoEtapa;
  tiempoTotal: ResultadoTiempoEtapa;
  estadoColecciones: 'Calculado' | 'En proceso' | 'Por registrar';
  estadoLaboratorio: 'Calculado' | 'En proceso' | 'Por registrar';
  estadoTotal: 'Calculado' | 'En proceso' | 'Por registrar';
}

export function calculateProcessTimes(
  fechaCreadoRaw?: unknown,
  fechaDesarrolloRaw?: unknown,
  fechaInfoEmpRaw?: unknown,
  fechaRevCompoRaw?: unknown,
  fechaCarelabelsRaw?: unknown,
  modo: 'CALENDARIO' | 'HABILES' = 'CALENDARIO'
): TiemposProcesoResultado {
  const fechaCreado = isFechaReal(fechaCreadoRaw as any) ? normalizeDateString(fechaCreadoRaw as any) : null;
  const fechaDesarrollo = isFechaReal(fechaDesarrolloRaw as any) ? normalizeDateString(fechaDesarrolloRaw as any) : null;
  const fechaInfoEmp = isFechaReal(fechaInfoEmpRaw as any) ? normalizeDateString(fechaInfoEmpRaw as any) : null;
  const fechaRevCompo = isFechaReal(fechaRevCompoRaw as any) ? normalizeDateString(fechaRevCompoRaw as any) : null;
  const fechaCarelabels = isFechaReal(fechaCarelabelsRaw as any) ? normalizeDateString(fechaCarelabelsRaw as any) : null;

  const evalStage = (
    fInicio: string | null,
    fFin: string | null,
    nombreStage: 'colecciones' | 'laboratorio' | 'total'
  ): ResultadoTiempoEtapa => {
    if (!fInicio) {
      return {
        dias: null,
        diasCalendario: null,
        diasHabiles: null,
        estado: 'Por registrar',
        fechaInicial: null,
        fechaFinal: fFin ? formatFechaColombiana(fFin) : null,
        etiqueta: 'Por registrar',
      };
    }

    if (!fFin) {
      const estadoMissing = nombreStage === 'total' ? 'Por registrar' : 'En proceso';
      return {
        dias: null,
        diasCalendario: null,
        diasHabiles: null,
        estado: estadoMissing,
        fechaInicial: formatFechaColombiana(fInicio),
        fechaFinal: null,
        etiqueta: estadoMissing === 'En proceso' ? 'En proceso' : 'Por registrar',
      };
    }

    const dCal = calcularDiasCalendario(fInicio, fFin);
    const dHab = calcularDiasHabiles(fInicio, fFin);
    const isLab = nombreStage === 'laboratorio';
    const dVal = isLab ? dHab : (modo === 'HABILES' ? dHab : dCal);
    const unitStr = (isLab || modo === 'HABILES') 
      ? (dVal === 1 ? 'día hábil' : 'días hábiles') 
      : (dVal === 1 ? 'día' : 'días');

    return {
      dias: dVal,
      diasCalendario: dCal,
      diasHabiles: dHab,
      estado: 'Calculado',
      fechaInicial: formatFechaColombiana(fInicio),
      fechaFinal: formatFechaColombiana(fFin),
      etiqueta: `${dVal} ${unitStr}`,
    };
  };

  const tiempoColecciones = evalStage(fechaCreado, fechaDesarrollo, 'colecciones');
  const tiempoLaboratorio = evalStage(fechaInfoEmp, fechaRevCompo, 'laboratorio');
  const tiempoTotal = evalStage(fechaCreado, fechaCarelabels, 'total');

  return {
    tiempoColecciones,
    tiempoLaboratorio,
    tiempoTotal,
    estadoColecciones: tiempoColecciones.estado === 'Calculado' ? 'Calculado' : 'Por registrar',
    estadoLaboratorio: tiempoLaboratorio.estado === 'Calculado' ? 'Calculado' : fechaInfoEmp ? 'En proceso' : 'Por registrar',
    estadoTotal: tiempoTotal.estado === 'Calculado' ? 'Calculado' : fechaCreado ? 'En proceso' : 'Por registrar'
  };
}

export const calcularTiemposProceso = calculateProcessTimes;

export function evaluarAlerta2Dias(
  fechaInfoEmpStr: any,
  fechaRevCompoStr?: any,
  fechaCarelabelsStr?: any
): { diasHabiles: number; esDemorado: boolean } {
  const fechaFin = fechaCarelabelsStr || fechaRevCompoStr;
  const diasHabiles = calcularDiasHabiles(fechaInfoEmpStr, fechaFin);
  const esDemorado = diasHabiles > 2;

  return { diasHabiles, esDemorado };
}
