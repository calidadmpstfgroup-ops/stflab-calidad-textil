import { MuestraTextil, FiltrosDashboard, ResumenKPIs, RankingCausaNoConformidad, CalidadProveedor } from '../types';

/**
 * Calcula la diferencia en días enteros entre dos fechas en formato YYYY-MM-DD
 */
export function calcularDiasEntreFechas(fechaInicioStr: string, fechaFinStr?: string): number {
  if (!fechaInicioStr) return 0;
  const fechaInicio = new Date(fechaInicioStr);
  const fechaFin = fechaFinStr ? new Date(fechaFinStr) : new Date();
  
  // Normalizar horas a medianoche para cálculo estricto de días
  fechaInicio.setHours(0, 0, 0, 0);
  fechaFin.setHours(0, 0, 0, 0);
  
  const diffMs = fechaFin.getTime() - fechaInicio.getTime();
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, dias);
}

/**
 * Determina si una muestra excede el Tiempo de Respuesta límite (>48 Horas / >2 días hábiles sin dictamen final)
 * Detecta cuellos de botella en Laboratorio o Patronaje
 */
export function esAlertaLeadTime(muestra: MuestraTextil): boolean {
  // Si la muestra ya está cerrada con dictamen final definitivo y fecha de cierre, no es alerta activa
  const estaCerrada = (muestra.dictamenFinal === 'APROBADO' || muestra.dictamenFinal === 'RECHAZADO') && Boolean(muestra.fechaFinalizacion);
  if (estaCerrada) {
    return false;
  }
  
  const diasEnProceso = calcularDiasEntreFechas(muestra.fechaIngreso);
  return diasEnProceso > 2; // Más de 2 días (48 horas) en proceso
}

/**
 * Obtiene los días en proceso de la muestra
 */
export function obtenerDiasEnProceso(muestra: MuestraTextil): number {
  return calcularDiasEntreFechas(muestra.fechaIngreso, muestra.fechaFinalizacion);
}

/**
 * Calcula todos los KPIs del Dashboard General a partir de la lista de muestras
 */
export function calcularKPIs(muestras: MuestraTextil[]): ResumenKPIs {
  const totalMuestras = muestras.length;
  if (totalMuestras === 0) {
    return {
      totalMuestras: 0,
      totalAprobadas: 0,
      porcentajeAprobacion: 0,
      totalConHallazgos: 0,
      porcentajeHallazgos: 0,
      totalRechazadas: 0,
      porcentajeRechazadas: 0,
      totalEnProceso: 0,
      totalAlertasLeadTime: 0,
      leadTimePromedioDias: 0,
    };
  }

  let totalAprobadas = 0;
  let totalConHallazgos = 0;
  let totalRechazadas = 0;
  let totalEnProceso = 0;
  let totalAlertasLeadTime = 0;
  let sumaLeadTime = 0;

  muestras.forEach((m) => {
    if (m.dictamenFinal === 'APROBADO') totalAprobadas++;
    else if (m.dictamenFinal === 'HALLAZGO') totalConHallazgos++;
    else if (m.dictamenFinal === 'RECHAZADO') totalRechazadas++;
    else totalEnProceso++;

    if (esAlertaLeadTime(m)) {
      totalAlertasLeadTime++;
    }

    sumaLeadTime += obtenerDiasEnProceso(m);
  });

  const porcentajeAprobacion = Number(((totalAprobadas / totalMuestras) * 100).toFixed(1));
  const porcentajeHallazgos = Number(((totalConHallazgos / totalMuestras) * 100).toFixed(1));
  const porcentajeRechazadas = Number(((totalRechazadas / totalMuestras) * 100).toFixed(1));
  const leadTimePromedioDias = Number((sumaLeadTime / totalMuestras).toFixed(1));

  return {
    totalMuestras,
    totalAprobadas,
    porcentajeAprobacion,
    totalConHallazgos,
    porcentajeHallazgos,
    totalRechazadas,
    porcentajeRechazadas,
    totalEnProceso,
    totalAlertasLeadTime,
    leadTimePromedioDias,
  };
}

/**
 * Genera el ranking de causas principales de no conformidad
 */
export function calcularRankingNoConformidades(muestras: MuestraTextil[]): RankingCausaNoConformidad[] {
  const conteoMap: Record<string, number> = {};
  let totalCausas = 0;

  muestras.forEach((m) => {
    if (m.causasNoConformidad && m.causasNoConformidad.length > 0) {
      m.causasNoConformidad.forEach((causa) => {
        const limpia = causa.trim();
        if (limpia) {
          conteoMap[limpia] = (conteoMap[limpia] || 0) + 1;
          totalCausas++;
        }
      });
    }
  });

  const ranking: RankingCausaNoConformidad[] = Object.keys(conteoMap).map((causa) => {
    const conteo = conteoMap[causa];
    const porcentaje = totalCausas > 0 ? Number(((conteo / totalCausas) * 100).toFixed(1)) : 0;
    
    // Categorización automática de área
    let areaImpacto = 'Laboratorio';
    const cLower = causa.toLowerCase();
    if (cLower.includes('molde') || cLower.includes('calce') || cLower.includes('patron')) areaImpacto = 'Patronaje';
    else if (cLower.includes('corte') || cLower.includes('orillo') || cLower.includes('reposo')) areaImpacto = 'Corte';
    else if (cLower.includes('confeccion') || cLower.includes('costura') || cLower.includes('empaque') || cLower.includes('lavado')) areaImpacto = 'Prendas';
    else if (cLower.includes('entrega') || cLower.includes('despacho')) areaImpacto = 'Compras';

    return {
      causa,
      conteo,
      porcentaje,
      areaImpacto,
    };
  });

  // Ordenar de mayor a menor frecuencia
  return ranking.sort((a, b) => b.conteo - a.conteo);
}

/**
 * Calcula el índice de calidad y desempeño por proveedor
 */
export function calcularCalidadProveedores(muestras: MuestraTextil[]): CalidadProveedor[] {
  const provMap: Record<string, { total: number; aprobadas: number; hallazgos: number; rechazadas: number }> = {};

  muestras.forEach((m) => {
    const p = m.proveedor || 'Sin Proveedor';
    if (!provMap[p]) {
      provMap[p] = { total: 0, aprobadas: 0, hallazgos: 0, rechazadas: 0 };
    }
    provMap[p].total++;
    if (m.dictamenFinal === 'APROBADO') provMap[p].aprobadas++;
    else if (m.dictamenFinal === 'HALLAZGO') provMap[p].hallazgos++;
    else if (m.dictamenFinal === 'RECHAZADO') provMap[p].rechazadas++;
  });

  const resultado: CalidadProveedor[] = Object.keys(provMap).map((proveedor) => {
    const stats = provMap[proveedor];
    const indiceCalidad = stats.total > 0 ? Number(((stats.aprobadas / stats.total) * 100).toFixed(1)) : 0;
    return {
      proveedor,
      totalMuestras: stats.total,
      aprobadas: stats.aprobadas,
      hallazgos: stats.hallazgos,
      rechazadas: stats.rechazadas,
      indiceCalidad,
    };
  });

  return resultado.sort((a, b) => b.totalMuestras - a.totalMuestras);
}

/**
 * Filtra las muestras según los criterios seleccionados en la barra de filtros
 */
export function filtrarMuestras(muestras: MuestraTextil[], filtros: FiltrosDashboard): MuestraTextil[] {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return muestras.filter((m) => {
    // 1. Búsqueda directa por texto
    if (filtros.busqueda && filtros.busqueda.trim() !== '') {
      const q = filtros.busqueda.toLowerCase().trim();
      const matchCodigo = m.codigoMT.toLowerCase().includes(q);
      const matchReporte = m.numeroReporte.toLowerCase().includes(q);
      const matchReferencia = m.referencia.toLowerCase().includes(q);
      const matchProveedor = m.proveedor.toLowerCase().includes(q);
      const matchLote = m.lote.toLowerCase().includes(q);
      const matchOrden = m.ordenCompra.toLowerCase().includes(q);
      const matchColor = (m.color || '').toLowerCase().includes(q);

      if (!matchCodigo && !matchReporte && !matchReferencia && !matchProveedor && !matchLote && !matchOrden && !matchColor) {
        return false;
      }
    }

    // 2. Filtro por proveedor
    if (filtros.proveedor && filtros.proveedor !== 'TODOS') {
      if (m.proveedor !== filtros.proveedor) return false;
    }

    // 3. Filtro por marca
    if (filtros.marca && filtros.marca !== 'TODAS') {
      if (m.marca !== filtros.marca) return false;
    }

    // 4. Filtro por dictamen
    if (filtros.dictamen && filtros.dictamen !== 'TODOS') {
      if (m.dictamenFinal !== filtros.dictamen) return false;
    }

    // 5. Filtro exclusivo de Alertas Lead Time (> 2 días)
    if (filtros.soloAlertasLeadTime) {
      if (!esAlertaLeadTime(m)) return false;
    }

    // 6. Filtro por rango de fecha
    if (m.fechaIngreso) {
      const fechaMuestra = new Date(m.fechaIngreso);
      fechaMuestra.setHours(0, 0, 0, 0);

      if (filtros.rangoFecha === 'HOY') {
        if (fechaMuestra.getTime() !== hoy.getTime()) return false;
      } else if (filtros.rangoFecha === 'ULTIMOS_5_DIAS') {
        const hace5Dias = new Date(hoy);
        hace5Dias.setDate(hace5Dias.getDate() - 5);
        if (fechaMuestra < hace5Dias || fechaMuestra > hoy) return false;
      } else if (filtros.rangoFecha === 'ULTIMOS_7_DIAS') {
        const hace7Dias = new Date(hoy);
        hace7Dias.setDate(hace7Dias.getDate() - 7);
        if (fechaMuestra < hace7Dias || fechaMuestra > hoy) return false;
      } else if (filtros.rangoFecha === 'ESTE_MES') {
        if (fechaMuestra.getMonth() !== hoy.getMonth() || fechaMuestra.getFullYear() !== hoy.getFullYear()) {
          return false;
        }
      } else if (filtros.rangoFecha === 'PERSONALIZADO') {
        if (filtros.fechaInicio) {
          const fIni = new Date(filtros.fechaInicio);
          fIni.setHours(0, 0, 0, 0);
          if (fechaMuestra < fIni) return false;
        }
        if (filtros.fechaFin) {
          const fFin = new Date(filtros.fechaFin);
          fFin.setHours(0, 0, 0, 0);
          if (fechaMuestra > fFin) return false;
        }
      }
    }

    return true;
  });
}
