/**
 * Motor de Evaluación Automática de Calidad Textil STFLab
 * Cumplimiento de Normas Técnicas Colombianas e Internacionales (NTC / AATCC / ASTM)
 */

export interface ResultadoEvaluacionParametro {
  cumple: boolean;
  desviacionPct: number;
  mensaje: string;
  estado: 'CONFORME' | 'NO_CONFORME' | 'REQUIERE_PRECAUCION';
}

/**
 * Evalúa un parámetro numérico comparando el valor medido contra el nominal esperado y su % de tolerancia.
 */
export function evaluarParametroNumerico(
  valorMedido: number,
  valorEsperado: number,
  toleranciaPct: number = 5.0
): ResultadoEvaluacionParametro {
  if (!valorEsperado || valorEsperado === 0 || isNaN(valorMedido)) {
    return { cumple: true, desviacionPct: 0, mensaje: 'Sin valor nominal de referencia', estado: 'CONFORME' };
  }

  const desviacionPct = Math.abs((valorMedido - valorEsperado) / valorEsperado) * 100;
  const cumple = desviacionPct <= toleranciaPct;

  return {
    cumple,
    desviacionPct: Number(desviacionPct.toFixed(2)),
    mensaje: cumple 
      ? `Dentro de tolerancia (Desviación: ${desviacionPct.toFixed(2)}% ≤ ${toleranciaPct}%)`
      : `Fuera de tolerancia (Desviación: ${desviacionPct.toFixed(2)}% > ${toleranciaPct}%)`,
    estado: cumple ? 'CONFORME' : 'NO_CONFORME'
  };
}

/**
 * Evalúa el encogimiento textil (NTC 908 / AATCC 135).
 * Los encogimientos son típicamente valores negativos (ej: -3.0%).
 * Si el encogimiento medido es mayor (ej: -4.5%), se evalúa contra el margen de tolerancia permitido.
 */
export function evaluarEncogimiento(
  encogimientoMedidoPct: number,
  encogimientoEsperadoPct: number = -3.0,
  margenAdicionalPct: number = 2.0
): ResultadoEvaluacionParametro {
  const limiteMaxEncogimiento = encogimientoEsperadoPct - margenAdicionalPct; // ej: -3% - 2% = -5%
  const cumple = encogimientoMedidoPct >= limiteMaxEncogimiento;

  return {
    cumple,
    desviacionPct: Number(Math.abs(encogimientoMedidoPct - encogimientoEsperadoPct).toFixed(2)),
    mensaje: cumple
      ? `Encogimiento dentro de tolerancia (${encogimientoMedidoPct}% ≥ ${limiteMaxEncogimiento}%)`
      : `Encogimiento excesivo (${encogimientoMedidoPct}% < ${limiteMaxEncogimiento}%) — Requiere escalado en Patronaje`,
    estado: cumple ? 'CONFORME' : 'NO_CONFORME'
  };
}

/**
 * Evalúa sólido de color (Escala Gris 1-5).
 */
export function evaluarSolidezColor(
  gradoMedido: number,
  gradoMinimoExigido: number = 4.0
): ResultadoEvaluacionParametro {
  const cumple = gradoMedido >= gradoMinimoExigido;
  return {
    cumple,
    desviacionPct: 0,
    mensaje: cumple 
      ? `Solidez óptima (Grado ${gradoMedido} ≥ ${gradoMinimoExigido})`
      : `Solidez deficiente (Grado ${gradoMedido} < ${gradoMinimoExigido}) — Precaución en lavado/combinación`,
    estado: cumple ? 'CONFORME' : 'NO_CONFORME'
  };
}
