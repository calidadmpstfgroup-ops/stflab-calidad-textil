/**
 * Helper module for Brand Normalization & Matching across STF Group
 * Exact 7 official brands:
 * - DOTACION
 * - ELA
 * - F STUDIO OUTLET
 * - HOMBRES STUDIO F
 * - NIÑOS ELA
 * - OUTLET ELA
 * - STUDIO F
 */

import { RevisionPrenda } from '../types';

export const STANDARD_BRANDS = [
  'DOTACION',
  'ELA',
  'F STUDIO OUTLET',
  'HOMBRES STUDIO F',
  'NIÑOS ELA',
  'OUTLET ELA',
  'STUDIO F'
] as const;

export function normalizeMarca(brandInput: string | null | undefined): string {
  if (!brandInput) return 'STUDIO F';
  const clean = brandInput.trim();
  const upper = clean.toUpperCase().replace(/\s+/g, ' ');

  // 1. DOTACION
  if (upper.includes('DOTAC') || upper.includes('UNIFORM')) {
    return 'DOTACION';
  }

  // 2. NIÑOS ELA
  if ((upper.includes('NIÑ') || upper.includes('NIN') || upper.includes('KID')) && upper.includes('ELA')) {
    return 'NIÑOS ELA';
  }

  // 3. OUTLET ELA
  if (upper.includes('OUTLET') && upper.includes('ELA')) {
    return 'OUTLET ELA';
  }

  // 4. F STUDIO OUTLET
  if (upper.includes('OUTLET') && (upper.includes('STUDIO') || upper.includes('STF') || upper.startsWith('F '))) {
    return 'F STUDIO OUTLET';
  }

  // 5. HOMBRES STUDIO F (Hombre / Men / Man / Masculino)
  if (
    upper.includes('HOMBRE') ||
    upper.includes('HOMBRES') ||
    upper.includes('MAN') ||
    upper.includes('MEN') ||
    upper.includes('CABALLERO') ||
    upper.includes('MASCULINO')
  ) {
    return 'HOMBRES STUDIO F';
  }

  // 6. ELA (escrito estrictamente como ELA)
  if (upper === 'ELA' || upper.startsWith('ELA ') || upper.endsWith(' ELA') || upper.includes(' ELA ') || upper.includes('ELA')) {
    return 'ELA';
  }

  // 7. STUDIO F (o F STUDIO)
  if (upper.includes('STUDIO') || upper.includes('STF') || upper.includes('SF') || upper.includes('F STUDIO')) {
    return 'STUDIO F';
  }

  return clean || 'STUDIO F';
}

/**
 * Checks if two brand names match (case, accent & synonym insensitive)
 */
export function isSameMarca(brandA: string | null | undefined, brandB: string | null | undefined): boolean {
  if (!brandA || !brandB) return false;
  const a = brandA.trim();
  const b = brandB.trim();
  if (a === 'Todas' || b === 'Todas' || a.toUpperCase() === 'TODAS' || b.toUpperCase() === 'TODAS') return true;

  const normA = normalizeMarca(a);
  const normB = normalizeMarca(b);

  return normA.toUpperCase() === normB.toUpperCase();
}

/**
 * Returns display label for brands
 */
export function getMarcaDisplayLabel(brand: string): string {
  return normalizeMarca(brand);
}

/**
 * Normalizes a reference code ensuring exact matching without removing suffixes, parentheses, or character variations.
 */
export function extractCleanRefCode(rawRef: string | null | undefined): string {
  if (!rawRef) return '';
  return String(rawRef).trim().toUpperCase();
}

/**
 * Helper to ensure items processed in the app are strictly evaluated.
 * Returns true for all items to ensure 100% of rows and references in files are calculated.
 */
export function esSoloPrenda(data: any): boolean {
  return true;
}

/**
 * Visual badge theme for each brand
 */
export function getMarcaBadgeStyle(brand: string): { bg: string; text: string; border: string } {
  const norm = normalizeMarca(brand);
  switch (norm) {
    case 'DOTACION':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' };
    case 'ELA':
      return { bg: 'bg-fuchsia-50', text: 'text-fuchsia-800', border: 'border-fuchsia-200' };
    case 'F STUDIO OUTLET':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
    case 'HOMBRES STUDIO F':
      return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' };
    case 'NIÑOS ELA':
      return { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' };
    case 'OUTLET ELA':
      return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' };
    case 'STUDIO F':
      return { bg: 'bg-slate-900', text: 'text-amber-400', border: 'border-slate-800' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' };
  }
}

/**
 * Consolidates all repeating references across documents into single unified records.
 * Merges dates, stage confirmations, compositions, purchase orders, status, and novedades.
 */
export function unifyAllRepeatingReferencesList(
  currentRevisiones: RevisionPrenda[]
): {
  unifiedList: RevisionPrenda[];
  itemsToUpdateInDb: RevisionPrenda[];
  idsToDeleteFromDb: string[];
  mergedCount: number;
  duplicateGroupsCount: number;
} {
  if (!currentRevisiones || currentRevisiones.length === 0) {
    return {
      unifiedList: [],
      itemsToUpdateInDb: [],
      idsToDeleteFromDb: [],
      mergedCount: 0,
      duplicateGroupsCount: 0
    };
  }

  const groups = new Map<string, RevisionPrenda[]>();

  currentRevisiones.forEach(item => {
    const cleanRef = extractCleanRefCode(item.referenciaPrenda);
    const brand = normalizeMarca(item.marca);
    const key = `${cleanRef}_${brand.toUpperCase()}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  });

  const unifiedList: RevisionPrenda[] = [];
  const itemsToUpdateInDb: RevisionPrenda[] = [];
  const idsToDeleteFromDb: string[] = [];
  let mergedCount = 0;
  let duplicateGroupsCount = 0;

  groups.forEach((items) => {
    if (items.length === 1) {
      unifiedList.push(items[0]);
    } else {
      duplicateGroupsCount++;
      mergedCount += (items.length - 1);

      // Score items to pick primary: item with highest field completion
      const score = (it: RevisionPrenda) => {
        let s = 0;
        if (it.fechaInfoEmp) s += 2;
        if (it.fechaDesarrollo) s += 2;
        if (it.fechaRevCompo) s += 2;
        if (it.fechaCarelabels) s += 2;
        if (it.composicionDeclarada) s += 1;
        if (it.ordenCompra) s += 1;
        if (it.referenciaPrenda?.includes('(')) s += 1;
        return s;
      };

      const sorted = [...items].sort((a, b) => score(b) - score(a));
      const primary: RevisionPrenda = { ...sorted[0] };
      const duplicates = sorted.slice(1);

      duplicates.forEach(d => idsToDeleteFromDb.push(d.id));

      duplicates.forEach(dup => {
        // Keep longer descriptive name if present
        if (dup.referenciaPrenda && dup.referenciaPrenda.length > primary.referenciaPrenda.length) {
          primary.referenciaPrenda = dup.referenciaPrenda;
        }

        // Merge stage dates
        if (!primary.fechaCreadoDocumento && dup.fechaCreadoDocumento) primary.fechaCreadoDocumento = dup.fechaCreadoDocumento;
        if (!primary.fechaInfoEmp && dup.fechaInfoEmp) primary.fechaInfoEmp = dup.fechaInfoEmp;
        if (!primary.fechaDesarrollo && dup.fechaDesarrollo) primary.fechaDesarrollo = dup.fechaDesarrollo;
        if (!primary.fechaRevCompo && dup.fechaRevCompo) primary.fechaRevCompo = dup.fechaRevCompo;
        if (!primary.fechaCarelabels && dup.fechaCarelabels) primary.fechaCarelabels = dup.fechaCarelabels;

        // Merge parameters
        if (dup.parametros) {
          const primP = primary.parametros || { desarrollo: null, empaque: null, composiciones: null, lavado: null };
          const dupP = dup.parametros;
          primary.parametros = {
            desarrollo: primP.desarrollo === 'VERDADERO' || dupP.desarrollo === 'VERDADERO' ? 'VERDADERO' : (primP.desarrollo ?? dupP.desarrollo ?? null),
            empaque: primP.empaque === 'VERDADERO' || dupP.empaque === 'VERDADERO' ? 'VERDADERO' : (primP.empaque ?? dupP.empaque ?? null),
            composiciones: primP.composiciones === 'VERDADERO' || dupP.composiciones === 'VERDADERO' ? 'VERDADERO' : (primP.composiciones ?? dupP.composiciones ?? null),
            lavado: primP.lavado === 'VERDADERO' || dupP.lavado === 'VERDADERO' ? 'VERDADERO' : (primP.lavado ?? dupP.lavado ?? null),
          };
        }

        // Merge stage confirmations
        const prevConf = primary.confirmacionesEtapas || {};
        const dupConf = dup.confirmacionesEtapas || {};
        primary.confirmacionesEtapas = {
          creado: Boolean(prevConf.creado || dupConf.creado || primary.fechaInfoEmp || dup.fechaInfoEmp),
          empaque: Boolean(prevConf.empaque || dupConf.empaque || primary.fechaInfoEmp || dup.fechaInfoEmp),
          desarrollo: Boolean(prevConf.desarrollo || dupConf.desarrollo || primary.fechaDesarrollo || dup.fechaDesarrollo),
          laboratorio: Boolean(prevConf.laboratorio || dupConf.laboratorio || primary.fechaRevCompo || dup.fechaRevCompo),
          carelabels: Boolean(prevConf.carelabels || dupConf.carelabels || primary.fechaCarelabels || dup.fechaCarelabels)
        };

        // Estado Aprobacion & Estado
        const isCancDup = Boolean((dup.estadoAprobacion && dup.estadoAprobacion.toUpperCase().includes('CANCELAD')) || (dup.estado === 'Cancelado'));
        const isCancPrimary = Boolean((primary.estadoAprobacion && primary.estadoAprobacion.toUpperCase().includes('CANCELAD')) || (primary.estado === 'Cancelado'));

        if (isCancDup || isCancPrimary) {
          primary.estado = 'Cancelado';
          primary.estadoAprobacion = 'CANCELADO';
        } else if (primary.fechaRevCompo || primary.confirmacionesEtapas.laboratorio) {
          primary.estado = 'Completado';
        }

        // Compositions
        if (!primary.composicionDeclarada && dup.composicionDeclarada) {
          primary.composicionDeclarada = dup.composicionDeclarada;
        }
        if (!primary.composicionLaboratorio && dup.composicionLaboratorio) {
          primary.composicionLaboratorio = dup.composicionLaboratorio;
        }

        // Purchase Orders
        if ((!primary.ordenCompra || primary.ordenCompra === '') && dup.ordenCompra) {
          primary.ordenCompra = dup.ordenCompra;
        } else if (primary.ordenCompra && dup.ordenCompra && !primary.ordenCompra.includes(dup.ordenCompra)) {
          primary.ordenCompra = `${primary.ordenCompra}, ${dup.ordenCompra}`;
        }

        // Confeccionista & Responsable & Lote
        if ((!primary.confeccionista || primary.confeccionista === 'Proveedor Importación') && dup.confeccionista) {
          primary.confeccionista = dup.confeccionista;
        }
        if ((!primary.responsable || primary.responsable === 'Analista Importaciones') && dup.responsable) {
          primary.responsable = dup.responsable;
        }
        if (!primary.lote && dup.lote) {
          primary.lote = dup.lote;
        }

        // Units
        primary.unidades = Math.max(primary.unidades || 1, dup.unidades || 1);

        // Novedades
        if (dup.novedades && dup.novedades.length > 0) {
          const existingNovIds = new Set((primary.novedades || []).map((n: any) => n.id));
          const toAdd = dup.novedades.filter((n: any) => !existingNovIds.has(n.id));
          if (toAdd.length > 0) {
            primary.novedades = [...(primary.novedades || []), ...toAdd];
          }
        }

        // Observaciones
        if (dup.observaciones && !primary.observaciones?.includes(dup.observaciones)) {
          primary.observaciones = primary.observaciones ? `${primary.observaciones} | ${dup.observaciones}` : dup.observaciones;
        }
      });

      // Audit novedad entry
      const nowStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      const novs = [...(primary.novedades || [])];
      novs.push({
        id: `nov-unif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fecha: nowStr,
        hora: timeStr,
        motivo: 'Unificación de Referencia Repetida',
        descripcion: `Información unificada de ${duplicates.length + 1} registros de documento.`,
        usuario: 'Sistema Unificación'
      });
      primary.novedades = novs;

      itemsToUpdateInDb.push(primary);
      unifiedList.push(primary);
    }
  });

  return {
    unifiedList,
    itemsToUpdateInDb,
    idsToDeleteFromDb,
    mergedCount,
    duplicateGroupsCount
  };
}
