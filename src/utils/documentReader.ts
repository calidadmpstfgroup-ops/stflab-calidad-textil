import * as XLSX from 'xlsx';
import { ItemMuestraTela, ItemMuestraAccesorio } from '../types';

/**
 * ============================================================================
 * MOTOR INTELIGENTE DE LECTURA E INTERPRETACIÓN DE DOCUMENTOS TEXTILES
 * TEXLAB AI Document Reader & Precision Parser
 * ============================================================================
 */

export interface ResumenMuestrasFisicas {
  totalReferencias: number;
  totalMuestrasFisicas: number;
  totalAgrupaciones: number;
  totalIncompletos: number;
}

export interface ResultadoLecturaDocumento<T> {
  exito: boolean;
  tipoDocumentoDetectado: 'TABLA_EXCEL' | 'TEXTO_PEGADO' | 'CLAVE_VALOR' | 'CSV_DELIMITADO' | 'FORMATO_VERTICAL' | 'DESCONOCIDO';
  items: T[];
  totalDetectados: number;
  camposDetectados: string[];
  advertencias: string[];
  textoCrudo?: string;
  resumenMuestras?: ResumenMuestrasFisicas;
}

/**
 * Valida si a un registro de tela le falta alguno de los 5 campos obligatorios
 */
export const validarRegistroTela = (item: Partial<ItemMuestraTela>): { incompleto: boolean; motivoIncompleto: string } => {
  const faltantes: string[] = [];
  if (!(item.solicitudCompra || '').trim()) faltantes.push('Código / SC');
  if (!(item.referencia || '').trim()) faltantes.push('Tela (Referencia)');
  if (!(item.color || '').trim()) faltantes.push('Color');
  if (!(item.proveedor || '').trim()) faltantes.push('Proveedor');
  if (!(item.ocCol || '').trim()) faltantes.push('Orden de Compra');

  return {
    incompleto: faltantes.length > 0,
    motivoIncompleto: faltantes.length > 0 ? `⚠️ Incompleto: Falta ${faltantes.join(', ')}` : ''
  };
};

/**
 * Calcula el resumen de muestras físicas reales y agrupaciones por regla explícita
 */
export const calcularResumenMuestrasFisicas = (items: ItemMuestraTela[]): {
  resumen: ResumenMuestrasFisicas;
  itemsConEtiqueta: ItemMuestraTela[];
} => {
  if (!items || items.length === 0) {
    return {
      resumen: { totalReferencias: 0, totalMuestrasFisicas: 0, totalAgrupaciones: 0, totalIncompletos: 0 },
      itemsConEtiqueta: []
    };
  }

  // Pre-pass: Identificar qué grupos (por SC o Referencia) contienen la regla explícita de muestra única compartida
  const gruposConCompartido = new Set<string>();
  items.forEach((item) => {
    const obs = (item.observacion || '').trim();
    const tieneRegla = item.esMuestraCompartida || 
      /aplica\s*1\s*sola\s*muestra|misma\s*tela|1\s*sola\s*muestra|misma\s*muestra/i.test(obs);
    
    if (tieneRegla) {
      const clave = (item.solicitudCompra || item.referencia || '').trim().toUpperCase();
      if (clave) {
        gruposConCompartido.add(clave);
      }
    }
  });

  let counterMuestra = 0;
  let totalAgrupaciones = 0;
  let totalIncompletos = 0;

  const mapaMuestraCompartida: Record<string, { numero: number; cantidadItems: number }> = {};

  const itemsConEtiqueta = items.map((item) => {
    const valRes = validarRegistroTela(item);
    if (valRes.incompleto) {
      totalIncompletos++;
    }

    const obs = (item.observacion || '').trim();
    const claveGrupo = (item.solicitudCompra || item.referencia || '').trim().toUpperCase();
    const esCompartidaPorGrupo = claveGrupo !== '' && gruposConCompartido.has(claveGrupo);
    const tieneReglaIndividual = item.esMuestraCompartida || 
      /aplica\s*1\s*sola\s*muestra|misma\s*tela|1\s*sola\s*muestra|misma\s*muestra/i.test(obs);

    const esCompartidaFinal = esCompartidaPorGrupo || tieneReglaIndividual;

    if (esCompartidaFinal) {
      const claveAgrupacion = claveGrupo || 'GRUPO_COMPARTIDO';
      
      if (!mapaMuestraCompartida[claveAgrupacion]) {
        counterMuestra++;
        mapaMuestraCompartida[claveAgrupacion] = { numero: counterMuestra, cantidadItems: 1 };
      } else {
        mapaMuestraCompartida[claveAgrupacion].cantidadItems++;
        totalAgrupaciones++;
      }

      const numMuestra = mapaMuestraCompartida[claveAgrupacion].numero;
      return {
        ...item,
        esMuestraCompartida: true,
        muestraFisicaNumero: numMuestra,
        etiquetaMuestraFisica: `Muestra ${numMuestra} (Compartida)`,
        incompleto: valRes.incompleto,
        motivoIncompleto: valRes.motivoIncompleto
      };
    } else {
      counterMuestra++;
      return {
        ...item,
        esMuestraCompartida: false,
        muestraFisicaNumero: counterMuestra,
        etiquetaMuestraFisica: `Muestra ${counterMuestra}`,
        incompleto: valRes.incompleto,
        motivoIncompleto: valRes.motivoIncompleto
      };
    }
  });

  return {
    resumen: {
      totalReferencias: items.length,
      totalMuestrasFisicas: counterMuestra,
      totalAgrupaciones,
      totalIncompletos
    },
    itemsConEtiqueta
  };
};

/**
 * Normaliza nombres de encabezados para coincidencia flexible (fuzzy header matching)
 */
export const normalizarEncabezado = (header: string): string => {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/\b(?:es\s*igual\s*a|igual\s*a|igual)\b/gi, '') // Quitar "ES IGUAL A"
    .replace(/[^a-z0-9]/g, '') // Quitar caracteres especiales
    .trim();
};

/**
 * Detecta qué columna representa cada encabezado en base a diccionarios de sinónimos textiles
 */
export const identificarColumna = (encabezado: string): string => {
  const norm = normalizarEncabezado(encabezado);

  // Referencia
  if (['referencia', 'ref', 'referencias', 'codigo', 'cod', 'item', 'insumo', 'articulo', 'producto', 'codigomt', 'referenciastf', 'material'].includes(norm)) {
    return 'referencia';
  }

  // Solicitud de Compra / SC
  if (['solicituddecompra', 'solicitudcompra', 'solicitud', 'sc', 'numsolicitud', 'numerosolicitud', 'sctel', 'nrosolicitud'].includes(norm)) {
    return 'solicitudCompra';
  }

  // Color / Tono
  if (['color', 'tono', 'variante', 'shade', 'colornombre', 'codigocolor', 'col', 'matiz'].includes(norm)) {
    return 'color';
  }

  // Talla / Medida
  if (['talla', 'tallas', 'size', 'medida', 'dimension', 'tamano'].includes(norm)) {
    return 'talla';
  }

  // QTY / Cantidad
  if (['qty', 'cantidad', 'cant', 'unidades', 'un', 'piezas', 'und', 'cantpedida'].includes(norm)) {
    return 'qty';
  }

  // Proveedor / Fabricante
  if (['proveedor', 'fabricante', 'molino', 'vendor', 'supplier', 'nombreproveedor', 'empresa'].includes(norm)) {
    return 'proveedor';
  }

  // # OC COL / Orden de Compra / STF PO / #OC. COL
  if (['occol', 'oc', 'ordendecompra', 'ordencompra', 'oacol', 'oac', 'stfpo', 'ponumber', 'po', 'nrooc', 'pedido', 'numoccol', 'nrooccol', 'occolumna', 'ocdotcol'].includes(norm)) {
    return 'ocCol';
  }

  // Descripción / Detalle
  if (['descripcion', 'descripcioninsumo', 'detalle', 'nombre', 'nombredelatela', 'denominacion', 'tipo'].includes(norm)) {
    return 'descripcionInsumo';
  }

  // Observación / Notas
  if (['observacion', 'observaciones', 'nota', 'notas', 'comentario', 'comentarios', 'obs'].includes(norm)) {
    return 'observacion';
  }

  return 'desconocido';
};

/**
 * Detecta si en las observaciones o texto se indica la regla de muestra única compartida
 */
export const detectarReglaMismaTela = (texto: string): { esMismaTela: boolean; nota: string } => {
  if (!texto) return { esMismaTela: false, nota: '' };
  const patron = /(?:aplica\s*1\s*sola\s*muestra|misma\s*tela|1\s*sola\s*muestra\s*para\s*(?:las\s*dos|ambas|todas)|una\s*sola\s*muestra\s*para\s*(?:las\s*dos|ambas)|1\s*sola\s*muestra|una\s*sola\s*muestra)/i;
  const match = patron.test(texto);
  return {
    esMismaTela: match,
    nota: match ? 'APLICA 1 SOLA MUESTRA PARA LAS DOS, ES LA MISMA TELA' : ''
  };
};

/**
 * Pre-normaliza texto pegado en bloque o línea continua insertando saltos de línea
 * antes de encabezados de claves conocidos.
 */
export const normalizarTextoPegadoTelas = (texto: string): string => {
  if (!texto) return '';
  let norm = texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const patronClaves = /(?:^|\s+)(SOLICITUD\s*(?:DE\s*COMPRA)?|SC|#?\s*SC|REFERENCIA|REF\b|COLOR|TONO|PROVEEDOR|FABRICANTE|#?\s*OC\.?\s*COL|ORDEN\s*(?:DE\s*COMPRA)?|OBSERVACI[OÓ]N|OBSERVACIONES|NOTAS?)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t]|\s(?=[A-Z0-9]))/gi;

  norm = norm.replace(patronClaves, (match) => {
    return `\n${match.trim()}`;
  });

  return norm.trim();
};

export const normalizarTextoPegadoAccesorios = (texto: string): string => {
  if (!texto) return '';
  let norm = texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const patronClavesAcc = /(?:^|\s+)(REFERENCIA|REF\b|CODIGO|INSUMO|ITEM|ARTICULO|COLOR|TALLA|SIZE|QTY|CANTIDAD|CANT|DESCRIPCI[OÓ]N|DETALLE|OBSERVACI[OÓ]N|OBSERVACIONES|NOTAS?)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t]|\s(?=[A-Z0-9]))/gi;

  norm = norm.replace(patronClavesAcc, (match) => {
    return `\n${match.trim()}`;
  });

  return norm.trim();
};

/**
 * ============================================================================
 * 1. INTERPRETADOR AVANZADO PARA TELAS (Excel, CSV, Pegado Vertical, OCR)
 * ============================================================================
 */
export const interpretarDocumentoTelas = (
  contenido: string | ArrayBuffer | any[],
  proveedorPorDefecto = ''
): ResultadoLecturaDocumento<ItemMuestraTela> => {
  const advertencias: string[] = [];
  const itemsBrutos: ItemMuestraTela[] = [];

  // A. Si es un array de objetos (de XLSX ya parseado)
  if (Array.isArray(contenido)) {
    contenido.forEach((row, idx) => {
      const mapa: Record<string, string> = {};
      Object.keys(row).forEach((key) => {
        const colId = identificarColumna(key);
        if (colId !== 'desconocido') {
          mapa[colId] = String(row[key] ?? '').trim();
        }
      });

      const obsTexto = (mapa['observacion'] || String(row['OBSERVACION'] || row['Observaciones'] || '')).trim();
      const reglaMismaTela = detectarReglaMismaTela(obsTexto);

      const ref = (mapa['referencia'] || String(row['REFERENCIA'] || row['Referencia'] || row['Ref'] || '')).trim();
      if (ref) {
        itemsBrutos.push({
          id: `tel-doc-${Date.now()}-${idx + 1}-${Math.random().toString(36).substr(2, 4)}`,
          solicitudCompra: (mapa['solicitudCompra'] || String(row['SOLICITUD DE COMPRA'] || row['Solicitud'] || row['SC'] || '')).trim(),
          referencia: ref,
          color: (mapa['color'] || String(row['COLOR'] || row['Color'] || '')).trim(),
          proveedor: (mapa['proveedor'] || String(row['PROVEEDOR'] || row['Proveedor'] || proveedorPorDefecto)).trim(),
          ocCol: (mapa['ocCol'] || String(row['# OC COL'] || row['OC COL'] || row['OC'] || '')).trim(),
          observacion: obsTexto,
          esMuestraCompartida: reglaMismaTela.esMismaTela,
          notaMismaTela: reglaMismaTela.nota || undefined
        });
      }
    });

    const { resumen, itemsConEtiqueta } = calcularResumenMuestrasFisicas(itemsBrutos);

    return {
      exito: itemsConEtiqueta.length > 0,
      tipoDocumentoDetectado: 'TABLA_EXCEL',
      items: itemsConEtiqueta,
      totalDetectados: itemsConEtiqueta.length,
      camposDetectados: ['solicitudCompra', 'referencia', 'color', 'proveedor', 'ocCol', 'observacion'],
      advertencias,
      resumenMuestras: resumen
    };
  }

  // B. Si es texto plano o texto extraído de OCR
  const textoRaw = String(contenido || '').trim();
  if (!textoRaw) {
    return {
      exito: false,
      tipoDocumentoDetectado: 'DESCONOCIDO',
      items: [],
      totalDetectados: 0,
      camposDetectados: [],
      advertencias: ['El documento o texto proporcionado está vacío.']
    };
  }

  const lineasRaw = textoRaw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Detección de Formato Tabular (Si la mayoría de líneas tienen tabuladores \t, pipes | o CSV ;)
  const lineasTabuladas = lineasRaw.filter(l => l.includes('\t') || l.includes('|') || l.split(';').length >= 3);
  const esTablaMatriz = lineasTabuladas.length >= Math.ceil(lineasRaw.length / 2) && lineasRaw.length > 0;

  if (esTablaMatriz) {
    let encabezadosMapeados: string[] = [];
    let esPrimeraFilaEncabezado = false;

    for (let idx = 0; idx < lineasRaw.length; idx++) {
      const linea = lineasRaw[idx];
      let partes: string[] = [];

      if (linea.includes('\t')) partes = linea.split('\t').map(p => p.trim());
      else if (linea.includes('|')) partes = linea.split('|').map(p => p.trim());
      else if (linea.includes(';') || (linea.includes(',') && !/\d,\d/.test(linea))) partes = linea.split(/[,;]/).map(p => p.trim());
      else partes = linea.split(/\s{2,}/).map(p => p.trim());

      if (partes.every(p => p === '')) continue;

      if (idx === 0 || encabezadosMapeados.length === 0) {
        const posiblesEncabezados = partes.map(p => identificarColumna(p));
        const columnasReconocidas = posiblesEncabezados.filter(c => c !== 'desconocido');

        if (columnasReconocidas.length >= 2) {
          encabezadosMapeados = posiblesEncabezados;
          esPrimeraFilaEncabezado = true;
          continue;
        }
      }

      if (esPrimeraFilaEncabezado && idx === 0) continue;

      if (encabezadosMapeados.length > 0) {
        const filaDict: Record<string, string> = {};
        partes.forEach((val, pIdx) => {
          const colNombre = encabezadosMapeados[pIdx] || `col_${pIdx}`;
          filaDict[colNombre] = val;
        });

        const ref = (filaDict['referencia'] || '').trim();
        const sc = (filaDict['solicitudCompra'] || '').trim();
        const obs = (filaDict['observacion'] || '').trim();
        const regla = detectarReglaMismaTela(obs);

        if (ref || sc) {
          itemsBrutos.push({
            id: `tel-doc-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            solicitudCompra: sc,
            referencia: ref || 'TELA SIN REF',
            color: (filaDict['color'] || '').trim(),
            proveedor: (filaDict['proveedor'] || proveedorPorDefecto).trim(),
            ocCol: (filaDict['ocCol'] || '').trim(),
            observacion: obs,
            esMuestraCompartida: regla.esMismaTela,
            notaMismaTela: regla.nota || undefined
          });
        }
        continue;
      }

      // Posicional para tabla sin encabezados
      if (partes.length >= 1) {
        let sc = partes[0] || '';
        let ref = partes[1] || '';
        let col = partes[2] || '';
        let prov = partes[3] || proveedorPorDefecto;
        let oc = partes[4] || '';
        let obs = partes[5] || '';

        const regla = detectarReglaMismaTela(obs);
        if (ref || sc) {
          itemsBrutos.push({
            id: `tel-doc-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            solicitudCompra: sc.trim(),
            referencia: ref.trim(),
            color: col.trim(),
            proveedor: prov.trim(),
            ocCol: oc.trim(),
            observacion: obs.trim(),
            esMuestraCompartida: regla.esMismaTela,
            notaMismaTela: regla.nota || undefined
          });
        }
      }
    }

    const { resumen, itemsConEtiqueta } = calcularResumenMuestrasFisicas(itemsBrutos);
    return {
      exito: itemsConEtiqueta.length > 0,
      tipoDocumentoDetectado: 'TABLA_EXCEL',
      items: itemsConEtiqueta,
      totalDetectados: itemsConEtiqueta.length,
      camposDetectados: ['solicitudCompra', 'referencia', 'color', 'proveedor', 'ocCol', 'observacion'],
      advertencias,
      resumenMuestras: resumen
    };
  }

  // 2. Detección de Formato Vertical por Código (5 líneas obligatorias + 6ta opcional)
  const esInicioCodigo = (linea: string): boolean => {
    if (!linea) return false;
    const str = linea.trim();
    // 1. Prefijos de código explícitos con guión/guión bajo seguidos de números (ej: SF_TEL_005972, ELA_TEL_003063)
    if (/^(?:SF_TEL|ELA_TEL|SOL_TEL|SF_ACC|SOL_ACC|MT_2026|SF|ELA|SOL|ACC|INS|MT|SC)[_\-]+\d+/i.test(str)) return true;
    // 2. Código estructurado estándar (ej: SF_TEL_005972)
    if (/^[A-Z]{2,4}_[A-Z]{3,4}_\d{4,8}$/i.test(str)) return true;
    // 3. Encabezado de clave explícito (ej: SOLICITUD DE COMPRA ES IGUAL A SF_TEL_005941, SOLICITUD DE COMPRA)
    if (/^(?:SOLICITUD\s*(?:DE\s*COMPRA)?|SC|#?\s*SC)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|[:#=\-\t\s])/i.test(str) && /SF_TEL|ELA_TEL|SOL_TEL|\d{4,}/i.test(str)) return true;
    if (/^(?:SOLICITUD\s*(?:DE\s*COMPRA)?|SC|#?\s*SC)\s*$/i.test(str)) return true;
    return false;
  };

  const indicesCodigo: number[] = [];
  for (let i = 0; i < lineasRaw.length; i++) {
    if (esInicioCodigo(lineasRaw[i])) {
      indicesCodigo.push(i);
    }
  }

  // Función helper para limpiar prefijos de clave si existen (ej: "SOLICITUD DE COMPRA: SF_TEL_005972" -> "SF_TEL_005972")
  const limpiarValorVertical = (linea: string, tipo: 'SC' | 'REF' | 'COLOR' | 'PROV' | 'OC' | 'OBS'): string => {
    if (!linea) return '';
    let res = linea.trim();
    if (tipo === 'SC') res = res.replace(/^(?:SOLICITUD\s*(?:DE\s*COMPRA)?|SC|#?\s*SC)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])?\s*/i, '');
    else if (tipo === 'REF') res = res.replace(/^(?:REFERENCIA|REF|ARTICULO|PRODUCTO|NOMBRE\s*(?:DE\s*TELA)?|MATERIAL|INSUMO)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])?\s*/i, '');
    else if (tipo === 'COLOR') res = res.replace(/^(?:COLOR|TONO|VARIANTE|SHADE)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])?\s*/i, '');
    else if (tipo === 'PROV') res = res.replace(/^(?:PROVEEDOR|FABRICANTE|MOLINO|VENDOR|SUPPLIER)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])?\s*/i, '');
    else if (tipo === 'OC') res = res.replace(/^(?:#?\s*OC\.?\s*COL|#?\s*OC|ORDEN\s*(?:DE\s*COMPRA)?|STF\s*PO)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])?\s*/i, '');
    else if (tipo === 'OBS') res = res.replace(/^(?:OBSERVACI[OÓ]N|OBSERVACIONES|NOTA|NOTAS|COMENTARIO)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])?\s*/i, '');
    return res.trim();
  };

  if (indicesCodigo.length > 0) {
    for (let k = 0; k < indicesCodigo.length; k++) {
      const idxInicio = indicesCodigo[k];
      const idxFin = k + 1 < indicesCodigo.length ? indicesCodigo[k + 1] : lineasRaw.length;
      const lineasBloque = lineasRaw.slice(idxInicio, idxFin);

      if (lineasBloque.length >= 1) {
        const codigo = limpiarValorVertical(lineasBloque[0] || '', 'SC');
        const tela = limpiarValorVertical(lineasBloque[1] || '', 'REF');
        const color = limpiarValorVertical(lineasBloque[2] || '', 'COLOR');
        const proveedor = limpiarValorVertical(lineasBloque[3] || '', 'PROV');
        const ocCol = limpiarValorVertical(lineasBloque[4] || '', 'OC');
        const observacion = lineasBloque.slice(5).map(l => limpiarValorVertical(l, 'OBS')).join(' ').trim();

        const regla = detectarReglaMismaTela(observacion);

        itemsBrutos.push({
          id: `tel-doc-${Date.now()}-${itemsBrutos.length + 1}-${Math.random().toString(36).substr(2, 4)}`,
          solicitudCompra: codigo,
          referencia: tela,
          color: color,
          proveedor: proveedor || proveedorPorDefecto,
          ocCol: ocCol,
          observacion: observacion,
          esMuestraCompartida: regla.esMismaTela,
          notaMismaTela: regla.nota || undefined
        });
      }
    }

    const { resumen, itemsConEtiqueta } = calcularResumenMuestrasFisicas(itemsBrutos);
    return {
      exito: itemsConEtiqueta.length > 0,
      tipoDocumentoDetectado: 'FORMATO_VERTICAL',
      items: itemsConEtiqueta,
      totalDetectados: itemsConEtiqueta.length,
      camposDetectados: ['solicitudCompra', 'referencia', 'color', 'proveedor', 'ocCol', 'observacion'],
      advertencias,
      resumenMuestras: resumen
    };
  }

  // 3. Fallback: Detección Clave-Valor en línea o Bloques de 5 líneas continuas
  const textoNorm = normalizarTextoPegadoTelas(textoRaw);
  const lineasNorm = textoNorm.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  if (lineasNorm.length >= 5 && lineasNorm.length % 5 === 0) {
    for (let b = 0; b < lineasNorm.length; b += 5) {
      const codigo = limpiarValorVertical(lineasNorm[b], 'SC');
      const tela = limpiarValorVertical(lineasNorm[b + 1], 'REF');
      const color = limpiarValorVertical(lineasNorm[b + 2], 'COLOR');
      const proveedor = limpiarValorVertical(lineasNorm[b + 3], 'PROV');
      const ocCol = limpiarValorVertical(lineasNorm[b + 4], 'OC');

      itemsBrutos.push({
        id: `tel-doc-${Date.now()}-${itemsBrutos.length + 1}-${Math.random().toString(36).substr(2, 4)}`,
        solicitudCompra: codigo,
        referencia: tela,
        color: color,
        proveedor: proveedor || proveedorPorDefecto,
        ocCol: ocCol,
        observacion: '',
        esMuestraCompartida: false
      });
    }

    const { resumen, itemsConEtiqueta } = calcularResumenMuestrasFisicas(itemsBrutos);
    return {
      exito: itemsConEtiqueta.length > 0,
      tipoDocumentoDetectado: 'FORMATO_VERTICAL',
      items: itemsConEtiqueta,
      totalDetectados: itemsConEtiqueta.length,
      camposDetectados: ['solicitudCompra', 'referencia', 'color', 'proveedor', 'ocCol'],
      advertencias,
      resumenMuestras: resumen
    };
  }

  // Interpretador Clave-Valor genérico
  let itemActual: Partial<ItemMuestraTela> = {};
  let tieneClaveValor = false;

  const guardarTelaActual = () => {
    if (itemActual.referencia || itemActual.solicitudCompra) {
      const obs = (itemActual.observacion || '').trim();
      const regla = detectarReglaMismaTela(obs);

      itemsBrutos.push({
        id: `tel-doc-${Date.now()}-${itemsBrutos.length + 1}-${Math.random().toString(36).substr(2, 4)}`,
        solicitudCompra: (itemActual.solicitudCompra || '').trim(),
        referencia: (itemActual.referencia || '').trim(),
        color: (itemActual.color || '').trim(),
        proveedor: (itemActual.proveedor || proveedorPorDefecto).trim(),
        ocCol: (itemActual.ocCol || '').trim(),
        observacion: obs,
        esMuestraCompartida: regla.esMismaTela,
        notaMismaTela: regla.nota || undefined
      });
      itemActual = {};
      tieneClaveValor = false;
    }
  };

  const regexSC = /^(?:SOLICITUD\s*(?:DE\s*COMPRA)?|SC|#?\s*SC)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])?\s*(.*)$/i;
  const regexRef = /^(?:REFERENCIA|REF|ARTICULO|PRODUCTO|NOMBRE\s*(?:DE\s*TELA)?|MATERIAL|INSUMO)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])?\s*(.*)$/i;
  const regexColor = /^(?:COLOR|TONO|VARIANTE|SHADE)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])?\s*(.*)$/i;
  const regexProv = /^(?:PROVEEDOR|FABRICANTE|MOLINO|VENDOR|SUPPLIER)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])?\s*(.*)$/i;
  const regexOC = /^(?:#?\s*OC\.?\s*COL|#?\s*OC|ORDEN\s*(?:DE\s*COMPRA)?|PO|OAC|STF\s*PO)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])?\s*(.*)$/i;
  const regexObs = /^(?:OBSERVACI[OÓ]N|OBSERVACIONES|NOTA|NOTAS|COMENTARIO)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])?\s*(.*)$/i;

  const esInicioClaveTelas = (str: string): boolean => {
    return regexSC.test(str) || regexRef.test(str) || regexColor.test(str) || regexProv.test(str) || regexOC.test(str) || regexObs.test(str);
  };

  for (let i = 0; i < lineasNorm.length; i++) {
    const linea = lineasNorm[i];

    if (/^(?:item\s*\d+|\d+[\.\)\-]|[-=_]{3,})$/i.test(linea)) {
      if (tieneClaveValor) guardarTelaActual();
      continue;
    }

    let matchKey: 'SC' | 'REF' | 'COLOR' | 'PROV' | 'OC' | 'OBS' | null = null;
    let rawVal = '';

    const matchSC = linea.match(regexSC);
    const matchRef = linea.match(regexRef);
    const matchColor = linea.match(regexColor);
    const matchProv = linea.match(regexProv);
    const matchOC = linea.match(regexOC);
    const matchObs = linea.match(regexObs);

    if (matchSC) { matchKey = 'SC'; rawVal = matchSC[1]; }
    else if (matchRef) { matchKey = 'REF'; rawVal = matchRef[1]; }
    else if (matchColor) { matchKey = 'COLOR'; rawVal = matchColor[1]; }
    else if (matchProv) { matchKey = 'PROV'; rawVal = matchProv[1]; }
    else if (matchOC) { matchKey = 'OC'; rawVal = matchOC[1]; }
    else if (matchObs) { matchKey = 'OBS'; rawVal = matchObs[1]; }

    if (matchKey) {
      if ((matchKey === 'SC' && itemActual.solicitudCompra) || (matchKey === 'REF' && itemActual.referencia)) {
        guardarTelaActual();
      }

      let valExtraido = rawVal.trim();

      while (i + 1 < lineasNorm.length) {
        const sigLinea = lineasNorm[i + 1];
        if (/^(?:item\s*\d+|\d+[\.\)\-]|[-=_]{3,})$/i.test(sigLinea) || esInicioClaveTelas(sigLinea)) {
          break;
        }
        valExtraido = valExtraido ? `${valExtraido} ${sigLinea}` : sigLinea;
        i++;
      }

      switch (matchKey) {
        case 'SC': itemActual.solicitudCompra = valExtraido; break;
        case 'REF': itemActual.referencia = valExtraido; break;
        case 'COLOR': itemActual.color = valExtraido; break;
        case 'PROV': itemActual.proveedor = valExtraido; break;
        case 'OC': itemActual.ocCol = valExtraido; break;
        case 'OBS': itemActual.observacion = valExtraido; break;
      }

      tieneClaveValor = true;
    }
  }

  if (tieneClaveValor && (itemActual.referencia || itemActual.solicitudCompra)) {
    guardarTelaActual();
  }

  const { resumen, itemsConEtiqueta } = calcularResumenMuestrasFisicas(itemsBrutos);

  return {
    exito: itemsConEtiqueta.length > 0,
    tipoDocumentoDetectado: 'CLAVE_VALOR',
    items: itemsConEtiqueta,
    totalDetectados: itemsConEtiqueta.length,
    camposDetectados: ['solicitudCompra', 'referencia', 'color', 'proveedor', 'ocCol', 'observacion'],
    advertencias,
    resumenMuestras: resumen
  };
};

/**
 * ============================================================================
 * 2. INTERPRETADOR AVANZADO PARA ACCESORIOS (Excel, CSV, Pegado, OCR)
 * ============================================================================
 */
export const interpretarDocumentoAccesorios = (
  contenido: string | ArrayBuffer | any[]
): ResultadoLecturaDocumento<ItemMuestraAccesorio> => {
  const advertencias: string[] = [];
  const items: ItemMuestraAccesorio[] = [];

  // A. Si es un array de objetos (de XLSX ya parseado)
  if (Array.isArray(contenido)) {
    contenido.forEach((row, idx) => {
      const mapa: Record<string, string> = {};
      Object.keys(row).forEach((key) => {
        const colId = identificarColumna(key);
        if (colId !== 'desconocido') {
          mapa[colId] = String(row[key] ?? '').trim();
        }
      });

      const ref = (mapa['referencia'] || String(row['REFERENCIA'] || row['Referencia'] || row['Ref'] || '')).toUpperCase().trim();
      if (ref) {
        const colorVal = mapa['color'] || (row['COLOR'] !== undefined ? String(row['COLOR']) : (row['Color'] !== undefined ? String(row['Color']) : '000'));
        const tallaVal = mapa['talla'] || (row['TALLA'] !== undefined ? String(row['TALLA']) : (row['Talla'] !== undefined ? String(row['Talla']) : 'U'));
        const qtyVal = mapa['qty'] || (row['QTY'] !== undefined ? String(row['QTY']) : (row['QYT'] !== undefined ? String(row['QYT']) : (row['Cantidad'] !== undefined ? String(row['Cantidad']) : '1')));

        items.push({
          id: `acc-doc-${Date.now()}-${idx + 1}-${Math.random().toString(36).substr(2, 4)}`,
          referencia: ref,
          color: String(colorVal).trim(),
          talla: String(tallaVal).trim(),
          qty: String(qtyVal).trim(),
          descripcionInsumo: String(mapa['descripcionInsumo'] || row['DESCRIPCION'] || row['Descripcion'] || 'Insumo').trim(),
          observacion: String(mapa['observacion'] || row['OBSERVACION'] || '').trim(),
          fechaIngreso: new Date().toISOString().split('T')[0],
          dictamen: 'PENDIENTE',
          accion: 'Enviar a Laboratorio'
        });
      }
    });

    return {
      exito: items.length > 0,
      tipoDocumentoDetectado: 'TABLA_EXCEL',
      items,
      totalDetectados: items.length,
      camposDetectados: ['referencia', 'color', 'talla', 'qty', 'descripcionInsumo'],
      advertencias
    };
  }

  // B. Si es texto plano o texto extraído de OCR
  const textoRaw = String(contenido || '').trim();
  if (!textoRaw) {
    return {
      exito: false,
      tipoDocumentoDetectado: 'DESCONOCIDO',
      items: [],
      totalDetectados: 0,
      camposDetectados: [],
      advertencias: ['El documento o texto proporcionado está vacío.']
    };
  }

  const lineas = textoRaw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Detección Clave-Valor (ej: REFERENCIA: MI00409922 / COLOR: 000 / TALLA: 6 / QTY: 1)
  const regexRefAcc = /^(?:REFERENCIA|REF|CODIGO|INSUMO|ITEM|ARTICULO)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])\s*(.*)$/i;
  const regexColAcc = /^(?:COLOR|TONO|VARIANTE|SHADE)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])\s*(.*)$/i;
  const regexTallaAcc = /^(?:TALLA|SIZE|MEDIDA|TAMANO)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])\s*(.*)$/i;
  const regexQtyAcc = /^(?:QTY|QYT|CANTIDAD|CANT|UNIDADES|UN|UND|PIEZAS)\s*(?:ES\s*IGUAL\s*A|IGUAL\s*A|IGUAL|[:#=\-\t])\s*(.*)$/i;

  const tieneClavesExplicitas = lineas.some(l => regexRefAcc.test(l) || regexColAcc.test(l));

  if (tieneClavesExplicitas) {
    let itemActual: Partial<ItemMuestraAccesorio> = {};
    let tieneClaveValor = false;

    const guardarAccesorioActual = () => {
      if (itemActual.referencia) {
        items.push({
          id: `acc-doc-${Date.now()}-${items.length + 1}-${Math.random().toString(36).substr(2, 4)}`,
          referencia: (itemActual.referencia || '').toUpperCase().trim(),
          color: String(itemActual.color || '000').trim(),
          talla: String(itemActual.talla || 'U').trim(),
          qty: String(itemActual.qty || '1').trim(),
          descripcionInsumo: String(itemActual.descripcionInsumo || 'Insumo').trim(),
          observacion: String(itemActual.observacion || '').trim(),
          fechaIngreso: new Date().toISOString().split('T')[0],
          dictamen: 'PENDIENTE',
          accion: 'Enviar a Laboratorio'
        });
        itemActual = {};
        tieneClaveValor = false;
      }
    };

    for (let i = 0; i < lineas.length; i++) {
      const linea = lineas[i];
      const matchRef = linea.match(regexRefAcc);
      const matchCol = linea.match(regexColAcc);
      const matchTalla = linea.match(regexTallaAcc);
      const matchQty = linea.match(regexQtyAcc);

      if (matchRef) {
        if (itemActual.referencia) guardarAccesorioActual();
        itemActual.referencia = matchRef[1].trim();
        tieneClaveValor = true;
      } else if (matchCol) {
        itemActual.color = matchCol[1].trim();
        tieneClaveValor = true;
      } else if (matchTalla) {
        itemActual.talla = matchTalla[1].trim();
        tieneClaveValor = true;
      } else if (matchQty) {
        itemActual.qty = matchQty[1].trim();
        tieneClaveValor = true;
      }
    }
    if (tieneClaveValor && itemActual.referencia) {
      guardarAccesorioActual();
    }

    if (items.length > 0) {
      return {
        exito: true,
        tipoDocumentoDetectado: 'CLAVE_VALOR',
        items,
        totalDetectados: items.length,
        camposDetectados: ['referencia', 'color', 'talla', 'qty'],
        advertencias
      };
    }
  }

  // 2. Detección de Formato Tabular Horizontal vs Formato Vertical (4 líneas por fila)
  const esTabularMulticolumna = lineas.some(l => l.includes('\t') || l.includes('|') || l.includes(';'));

  if (esTabularMulticolumna) {
    let lineasProcesar = [...lineas];
    if (lineasProcesar.length > 0) {
      const primera = lineasProcesar[0].toUpperCase();
      if (primera.includes('REFERENCIA') || primera.includes('COLOR') || primera.includes('TALLA') || primera.includes('QYT') || primera.includes('QTY')) {
        lineasProcesar = lineasProcesar.slice(1);
      }
    }

    lineasProcesar.forEach((linea, idx) => {
      let partes: string[] = [];
      if (linea.includes('\t')) partes = linea.split('\t').map(p => p.trim());
      else if (linea.includes('|')) partes = linea.split('|').map(p => p.trim());
      else if (linea.includes(';')) partes = linea.split(';').map(p => p.trim());
      else partes = linea.split(/\s{2,}/).map(p => p.trim());

      partes = partes.filter(Boolean);
      if (partes.length === 0) return;

      const ref = partes[0] ? partes[0].toUpperCase().trim() : '';
      const col = partes[1] !== undefined ? partes[1].trim() : '—';
      const talla = partes[2] !== undefined ? partes[2].trim() : '—';
      const qty = partes[3] !== undefined ? partes[3].trim() : '—';
      const isIncompleto = !ref || partes.length < 4 || col === '—' || talla === '—' || qty === '—';

      if (ref) {
        items.push({
          id: `acc-doc-${Date.now()}-${idx + 1}-${Math.random().toString(36).substr(2, 4)}`,
          referencia: ref,
          color: col,
          talla: talla,
          qty: qty,
          incompleto: isIncompleto,
          motivoIncompleto: isIncompleto ? '⚠️ Registro incompleto: Faltan columnas en la fila tabular' : undefined,
          descripcionInsumo: 'Insumo',
          fechaIngreso: new Date().toISOString().split('T')[0],
          dictamen: 'PENDIENTE',
          accion: 'Enviar a Laboratorio'
        });
      }
    });

    return {
      exito: items.length > 0,
      tipoDocumentoDetectado: 'TABLA_EXCEL',
      items,
      totalDetectados: items.length,
      camposDetectados: ['referencia', 'color', 'talla', 'qty'],
      advertencias
    };
  }

  // 3. Formato Vertical Linea por Linea (4 líneas = 1 Registro: REFERENCIA, COLOR, TALLA, QYT)
  let lineasVerticales = [...lineas];

  if (lineasVerticales.length >= 4) {
    const p0 = lineasVerticales[0].toUpperCase();
    const p1 = lineasVerticales[1].toUpperCase();
    const p2 = lineasVerticales[2].toUpperCase();
    const p3 = lineasVerticales[3].toUpperCase();

    if (
      (p0 === 'REFERENCIA' || p0 === 'REF' || p0 === 'CODIGO') &&
      (p1 === 'COLOR' || p1 === 'TONO') &&
      (p2 === 'TALLA' || p2 === 'SIZE') &&
      (p3 === 'QYT' || p3 === 'QTY' || p3 === 'CANTIDAD' || p3 === 'CANT')
    ) {
      lineasVerticales = lineasVerticales.slice(4);
    }
  }

  for (let i = 0; i < lineasVerticales.length; i += 4) {
    const valRef = lineasVerticales[i];
    const valCol = lineasVerticales[i + 1];
    const valTalla = lineasVerticales[i + 2];
    const valQty = lineasVerticales[i + 3];

    if (!valRef) continue;

    const ref = valRef.toUpperCase().trim();
    const col = valCol !== undefined ? valCol.trim() : '—';
    const talla = valTalla !== undefined ? valTalla.trim() : '—';
    const qty = valQty !== undefined ? valQty.trim() : '—';

    const isIncompleto = valCol === undefined || valTalla === undefined || valQty === undefined || col === '—' || talla === '—' || qty === '—';

    items.push({
      id: `acc-doc-${Date.now()}-${items.length + 1}-${Math.random().toString(36).substr(2, 4)}`,
      referencia: ref,
      color: col,
      talla: talla,
      qty: qty,
      incompleto: isIncompleto,
      motivoIncompleto: isIncompleto ? '⚠️ Registro incompleto: Faltan campos en la secuencia vertical de 4 filas' : undefined,
      descripcionInsumo: 'Insumo',
      fechaIngreso: new Date().toISOString().split('T')[0],
      dictamen: 'PENDIENTE',
      accion: 'Enviar a Laboratorio'
    });
  }

  return {
    exito: items.length > 0,
    tipoDocumentoDetectado: 'FORMATO_VERTICAL',
    items,
    totalDetectados: items.length,
    camposDetectados: ['referencia', 'color', 'talla', 'qty'],
    advertencias
  };
};

/**
 * Lee un archivo Excel binario y devuelve las filas convertidas
 */
export const leerArchivoExcel = (fileData: ArrayBuffer): any[] => {
  try {
    const data = new Uint8Array(fileData);
    const workbook = XLSX.read(data, { type: 'array' });
    const primerSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[primerSheet];
    return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  } catch (err) {
    console.error('Error leyendo archivo Excel:', err);
    return [];
  }
};
