export interface GuiaMaestraInsumoItem {
  id: string;
  insumo: string;
  parametroCritico: string;
  metodoVerificacion: string;
  criterioAceptacion: string;
  categoria?: 'Botones & Broches' | 'Correas & Cintas' | 'Herrajes & Metálicos' | 'Textiles & Confección' | 'Decoración & Pedrería';
  palabrasClave?: string[];
  nivelRiesgo?: 'Alto' | 'Medio' | 'Crítico';
  normaReferencia?: string;
}

export const GUIA_MAESTRA_INSUMOS: GuiaMaestraInsumoItem[] = [
  {
    id: 'gmi-1',
    insumo: 'Botones',
    categoria: 'Botones & Broches',
    parametroCritico: 'Resistencia al impacto y hoyos limpios.',
    metodoVerificacion: 'Golpear con firmeza y pasar un hilo de prueba.',
    criterioAceptacion: 'No deben astillarse; hoyos sin bordes filosos.',
    palabrasClave: ['boton', 'botón', 'botones', 'botonería', 'pasta', 'poliéster', 'poliester', 'camisero', '4 ojos', '2 ojos', 'pantalonero'],
    nivelRiesgo: 'Medio',
    normaReferencia: 'ASTM D5171'
  },
  {
    id: 'gmi-2',
    insumo: 'Correas (Reatas/Cintas)',
    categoria: 'Correas & Cintas',
    parametroCritico: 'Ancho constante y bordes estables.',
    metodoVerificacion: 'Medir con calibrador en 3 puntos del rollo.',
    criterioAceptacion: 'Variación máxima de ±1 mm; bordes termosellados.',
    palabrasClave: ['correa', 'reata', 'cinta', 'cintas', 'reatas', 'galón', 'galon', 'hilado plano', 'webbing', 'elástico', 'elastico'],
    nivelRiesgo: 'Alto',
    normaReferencia: 'NTC 2280'
  },
  {
    id: 'gmi-3',
    insumo: 'Correas en Forma de Cadenas',
    categoria: 'Correas & Cintas',
    parametroCritico: 'Unión de eslabones, peso y torsión.',
    metodoVerificacion: 'Estirar con fuerza (tracción) y girar la cadena.',
    criterioAceptacion: 'Eslabones soldados o totalmente cerrados; no se deforman.',
    palabrasClave: ['cadena', 'cadenas', 'eslabon', 'eslabón', 'eslabones', 'chain'],
    nivelRiesgo: 'Alto',
    normaReferencia: 'ASTM B117'
  },
  {
    id: 'gmi-4',
    insumo: 'Correas de Imitación Cuero',
    categoria: 'Correas & Cintas',
    parametroCritico: 'Flexibilidad, adherencia y olor.',
    metodoVerificacion: 'Doblar a 180° repetidamente y raspar el borde.',
    criterioAceptacion: 'No debe cuartearse, pelarse ni oler a plástico quemado.',
    palabrasClave: ['sintético', 'sintetico', 'imitacion cuero', 'imitación cuero', 'pu', 'polipiel', 'cuerina', 'cuero sintetico', 'cuero sintético'],
    nivelRiesgo: 'Crítico',
    normaReferencia: 'ISO 5402'
  },
  {
    id: 'gmi-5',
    insumo: 'Pañoletas (Seda, Satén, Poliéster)',
    categoria: 'Textiles & Confección',
    parametroCritico: 'Calidad del dobladillo (pañuelo) y estampado.',
    metodoVerificacion: 'Revisar simetría de esquinas y estirar costuras.',
    criterioAceptacion: 'Sin hilos sueltos; costura "pañolera" recta y sin arrugas.',
    palabrasClave: ['pañoleta', 'panoleta', 'pañuelo', 'panuelo', 'seda', 'satén', 'saten', 'chal', 'bufanda', 'pashmina', 'fular'],
    nivelRiesgo: 'Medio',
    normaReferencia: 'AATCC 135'
  },
  {
    id: 'gmi-6',
    insumo: 'Botones Chinos (Pasamanería)',
    categoria: 'Botones & Broches',
    parametroCritico: 'Consistencia del nudo y remate de puntas.',
    metodoVerificacion: 'Presionar el nudo y jalar las colas de hilo.',
    criterioAceptacion: 'Nudo firme (no se desarma); puntas selladas sin deshilacharse.',
    palabrasClave: ['botón chino', 'boton chino', 'pasamaneria', 'pasamanería', 'nudo chino', 'alamar', 'alamates'],
    nivelRiesgo: 'Medio',
    normaReferencia: 'NTC 2300'
  },
  {
    id: 'gmi-7',
    insumo: 'Corbatas',
    categoria: 'Textiles & Confección',
    parametroCritico: 'Corte al bies (sesgo) y simetría de puntas.',
    metodoVerificacion: 'Colgar la corbata desde el centro; medir puntas.',
    criterioAceptacion: 'No debe girarse sobre su eje al colgar; puntas simétricas.',
    palabrasClave: ['corbata', 'corbatas', 'corbatín', 'corbatin', 'moño', 'pajarita'],
    nivelRiesgo: 'Medio',
    normaReferencia: 'Manual STF'
  },
  {
    id: 'gmi-8',
    insumo: 'Correas con Bolsos / Mini Bags Fijos (Cuero, Sintético o Gamuza)',
    categoria: 'Correas & Cintas',
    parametroCritico: 'Soporte de carga, dirección del pelo (gamuza), costuras de anclaje y sangrado de color.',
    metodoVerificacion: 'Cargar con 300g, abrir/cerrar broches, cepillar el pelo en ambas direcciones y frotar paño húmedo.',
    criterioAceptacion: 'Estructura simétrica (no cuelga torcido); costuras reforzadas; cero transferencia de tinte hacia la prenda.',
    palabrasClave: ['mini bag', 'minibag', 'bolso', 'canguro', 'riñonera', 'rinonera', 'gamuza', 'pouch'],
    nivelRiesgo: 'Crítico',
    normaReferencia: 'AATCC 8 / ISO 105-X12'
  },
  {
    id: 'gmi-9',
    insumo: 'Dijes Decorativos',
    categoria: 'Herrajes & Metálicos',
    parametroCritico: 'Calidad de la argolla de unión y esmalte.',
    metodoVerificacion: 'Jalar el dije suavemente y revisar bajo luz directa.',
    criterioAceptacion: 'Argolla soldada o doble vuelta; esmalte sin burbujas ni rayones.',
    palabrasClave: ['dije', 'dijes', 'colgante', 'colgantes', 'charm', 'charms', 'medallita', 'chapa decorativa'],
    nivelRiesgo: 'Medio',
    normaReferencia: 'ASTM F963'
  },
  {
    id: 'gmi-10',
    insumo: 'Broches a Presión (Snaps)',
    categoria: 'Botones & Broches',
    parametroCritico: 'Fuerza de agarre y fijación textil.',
    metodoVerificacion: 'Abrir y cerrar 10 veces consecutivas.',
    criterioAceptacion: 'No deben soltarse solos ni romper la tela al abrir.',
    palabrasClave: ['broche a presion', 'broche', 'snap', 'snaps', 'remache', 'automático', 'presión'],
    nivelRiesgo: 'Crítico',
    normaReferencia: 'ASTM D4846'
  },
  {
    id: 'gmi-11',
    insumo: 'Pines',
    categoria: 'Herrajes & Metálicos',
    parametroCritico: 'Firmeza del vástago y punta.',
    metodoVerificacion: 'Presionar la base del pin contra la muestra.',
    criterioAceptacion: 'El vástago no debe doblarse; punta sin rebabas.',
    palabrasClave: ['pin', 'pines', 'solapero', 'prendedor', 'badge'],
    nivelRiesgo: 'Medio',
    normaReferencia: 'ASTM F963'
  },
  {
    id: 'gmi-12',
    insumo: 'Hebillas',
    categoria: 'Herrajes & Metálicos',
    parametroCritico: 'Deslizamiento, freno y acabado.',
    metodoVerificacion: 'Pasar la correa bajo tensión mecánica.',
    criterioAceptacion: 'Traba firme; superficie 100% lisa sin rebabas.',
    palabrasClave: ['hebilla', 'hebillas', 'buckle', 'corredera', 'tensor'],
    nivelRiesgo: 'Alto',
    normaReferencia: 'ASTM B117'
  },
  {
    id: 'gmi-13',
    insumo: 'Cierres (Cremalleras)',
    categoria: 'Herrajes & Metálicos',
    parametroCritico: 'Traba del carro y simetría de dientes.',
    metodoVerificacion: 'Subir y bajar el carro; halar lateralmente.',
    criterioAceptacion: 'El carro se bloquea al bajar; dientes alineados.',
    palabrasClave: ['cierre', 'cierres', 'cremallera', 'cremalleras', 'zipper', 'diente de perro', 'nylon', 'invisible'],
    nivelRiesgo: 'Crítico',
    normaReferencia: 'ASTM D2061'
  },
  {
    id: 'gmi-14',
    insumo: 'Correas de Cuero (Lujo)',
    categoria: 'Correas & Cintas',
    parametroCritico: 'Migración de color y flexibilidad.',
    metodoVerificacion: 'Frotar paño húmedo/seco; doblar a 180°.',
    criterioAceptacion: 'Paño limpio (cero tinte); cuero sin grietas.',
    palabrasClave: ['cuero', 'cuero vacuno', 'cuero natural', 'carnaza', 'badana', 'cinturon cuero'],
    nivelRiesgo: 'Crítico',
    normaReferencia: 'AATCC 8 / ISO 105'
  },
  {
    id: 'gmi-15',
    insumo: 'Pedrería (En Cuero/Sintético)',
    categoria: 'Decoración & Pedrería',
    parametroCritico: 'Fijación de piedras bajo torsión.',
    metodoVerificacion: 'Pasar espátula plástica sobre las piedras.',
    criterioAceptacion: 'Ninguna piedra debe desprenderse ni aflojarse.',
    palabrasClave: ['pedrería', 'pedreria', 'strass', 'tachas', 'canutillo', 'mostacilla', 'lentejuela', 'piedras'],
    nivelRiesgo: 'Alto',
    normaReferencia: 'ASTM D4846'
  },
  {
    id: 'gmi-16',
    insumo: 'Broches Imperdibles (Lujo)',
    categoria: 'Botones & Broches',
    parametroCritico: 'Tensión del resorte y seguro de cierre.',
    metodoVerificacion: 'Abrir, cerrar y presionar el seguro.',
    criterioAceptacion: 'No se abre solo con el peso; punta oculta por completo.',
    palabrasClave: ['imperdible', 'imperdibles', 'gancho nodriza', 'safety pin', 'alfiler'],
    nivelRiesgo: 'Medio',
    normaReferencia: 'ASTM F963'
  },
  {
    id: 'gmi-17',
    insumo: 'Cristales (En Broches)',
    categoria: 'Decoración & Pedrería',
    parametroCritico: 'Engaste de garras y brillo uniforme.',
    metodoVerificacion: 'Golpear suave el broche en madera (Tap Test).',
    criterioAceptacion: 'Cristales inmóviles; garras planas (no enganchan).',
    palabrasClave: ['cristal', 'cristales', 'swarovski', 'circonio', 'circon', 'garras', 'engaste'],
    nivelRiesgo: 'Alto',
    normaReferencia: 'ASTM D4846'
  },
  {
    id: 'gmi-18',
    insumo: 'Baño Metálico (Cadenas/Dijes/Herrajes)',
    categoria: 'Herrajes & Metálicos',
    parametroCritico: 'Resistencia a la oxidación y alergias.',
    metodoVerificacion: 'Prueba de frote y validación de ficha técnica.',
    criterioAceptacion: 'Color homogéneo; 100% Libre de Níquel y Plomo.',
    palabrasClave: ['baño', 'bano', 'dorado', 'plateado', 'níquel', 'niquel', 'oro', 'plata', 'zamak', 'galvanico'],
    nivelRiesgo: 'Crítico',
    normaReferencia: 'EN 1811 (Nickel-free)'
  },
  {
    id: 'gmi-19',
    insumo: 'Borlas (Tassels / Flecos trenzados)',
    categoria: 'Decoración & Pedrería',
    parametroCritico: 'Desprendimiento de hilos, firmeza del cabezal y largo uniforme.',
    metodoVerificacion: 'Jalar suavemente los flecos inferiores y revisar el amarre superior.',
    criterioAceptacion: 'Cero desprendimiento de hilos al tirón; cabezal firme; flecos parejos sin deshilacharse.',
    palabrasClave: ['borla', 'borlas', 'tassel', 'tassels', 'fleco', 'flecos', 'borlón'],
    nivelRiesgo: 'Medio',
    normaReferencia: 'Manual STF'
  }
];

// =========================================================================
// --- ⚡ MOTOR DE AUTOMATIZACIÓN INTELIGENTE DE LA GUÍA MAESTRA ---
// =========================================================================

/**
 * Identifica de forma automática cuál criterio de la Guía Maestra corresponde
 * a partir de la descripción, referencia o texto de cualquier accesorio.
 */
export function identificarInsumoGuiaMaestra(textoOReferencia: string): GuiaMaestraInsumoItem | null {
  if (!textoOReferencia || !textoOReferencia.trim()) return null;

  const normalizado = textoOReferencia
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  let mejorCoincidencia: GuiaMaestraInsumoItem | null = null;
  let maxPuntaje = 0;

  for (const item of GUIA_MAESTRA_INSUMOS) {
    let puntaje = 0;

    // 1. Coincidencia directa en el nombre del insumo
    const nombreNorm = item.insumo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalizado.includes(nombreNorm)) {
      puntaje += 15;
    }

    // 2. Coincidencia en palabras clave
    if (item.palabrasClave) {
      for (const kw of item.palabrasClave) {
        const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        // Palabra exacta o contenida
        const regex = new RegExp(`\\b${kwNorm}\\b`, 'i');
        if (regex.test(normalizado)) {
          puntaje += 10;
        } else if (normalizado.includes(kwNorm)) {
          puntaje += 5;
        }
      }
    }

    if (puntaje > maxPuntaje) {
      maxPuntaje = puntaje;
      mejorCoincidencia = item;
    }
  }

  // Si tiene un puntaje suficiente, retornar la regla correspondiente
  return maxPuntaje >= 5 ? mejorCoincidencia : null;
}

export interface DiagnosticoInsumoAutomatico {
  criterio: GuiaMaestraInsumoItem;
  dictamen: 'APROBADO' | 'HALLAZGO' | 'RECHAZADO';
  resultadoTexto: string;
  observacionDetallada: string;
  resultado: string;
  observacion: string;
  accionSugerida: string;
  norma: string;
  resumenVerificacion: string;
}

/**
 * Genera el diagnóstico técnico completo listo para informe oficial y respuesta a Compras
 */
export function generarDiagnosticoInsumoAutomatico(
  criterio: GuiaMaestraInsumoItem,
  dictamenDeseado: 'APROBADO' | 'HALLAZGO' | 'RECHAZADO' = 'APROBADO'
): DiagnosticoInsumoAutomatico {
  const norma = criterio.normaReferencia || 'Estándar STF Group';
  
  if (dictamenDeseado === 'APROBADO') {
    const obs = `[VERIFICACIÓN AUTOMATIZADA: ${criterio.insumo}] Método: ${criterio.metodoVerificacion}. Parámetro: ${criterio.parametroCritico}. Criterio: ${criterio.criterioAceptacion} (Norma ${norma}: Conforme sin novedad).`;
    return {
      criterio,
      dictamen: 'APROBADO',
      resultadoTexto: 'OK',
      resultado: 'OK',
      observacionDetallada: obs,
      observacion: obs,
      accionSugerida: 'Liberado para Confección',
      norma,
      resumenVerificacion: `Inspección de ${criterio.insumo}: Cumple tolerancia estándar.`
    };
  }

  if (dictamenDeseado === 'HALLAZGO') {
    const obs = `[NOVEDAD EN ${criterio.insumo.toUpperCase()}] Parámetro crítico: ${criterio.parametroCritico}. Presenta desviación leve respecto al criterio (${criterio.criterioAceptacion}). Requiere visto bueno de Compras.`;
    return {
      criterio,
      dictamen: 'HALLAZGO',
      resultadoTexto: 'Novedad',
      resultado: 'Novedad',
      observacionDetallada: obs,
      observacion: obs,
      accionSugerida: 'Aprobado Condicionado a Muestra Física',
      norma,
      resumenVerificacion: `Novedad leve detectada en ${criterio.insumo}.`
    };
  }

  const obs = `[NO CONFORME: ${criterio.insumo.toUpperCase()}] Falla en método: ${criterio.metodoVerificacion}. No cumple tolerancia de aceptación: ${criterio.criterioAceptacion} (${norma}).`;
  return {
    criterio,
    dictamen: 'RECHAZADO',
    resultadoTexto: 'Rechazado',
    resultado: 'Rechazado',
    observacionDetallada: obs,
    observacion: obs,
    accionSugerida: 'Retenido / No conforme - Devolución a Proveedor',
    norma,
    resumenVerificacion: `Rechazo técnico: Falla en ${criterio.parametroCritico}.`
  };
}

/**
 * Ejecuta la auto-evaluación en lote de un conjunto de insumos
 */
export function autoEvaluarListaInsumos<T extends { 
  id: string; 
  descripcionInsumo?: string; 
  referencia: string;
  dictamen?: any;
  resultado?: any;
  observacion?: any;
  accion?: any;
  responsableLab?: any;
  fechaRevision?: any;
  fechaEntrega?: any;
  respondidoACompras?: boolean;
}>(
  items: T[], 
  responsableNombre: string = 'Laboratorio Insumos'
): { 
  itemsActualizados: T[]; 
  itemsEvaluados: T[];
  evaluadosContador: number; 
  noDetectadosContador: number;
  reporteResumen: Array<{ referencia: string; insumoDetectado: string; dictamen: string }>;
  resumen: {
    total: number;
    identificadosConGuia: number;
    noDetectados: number;
    aprobados: number;
    rechazados: number;
    observados: number;
  };
} {
  const hoyStr = new Date().toISOString().split('T')[0];
  let evaluadosContador = 0;
  let noDetectadosContador = 0;
  const reporteResumen: Array<{ referencia: string; insumoDetectado: string; dictamen: string }> = [];

  const itemsActualizados = items.map((item) => {
    const textoParaBuscar = `${item.descripcionInsumo || ''} ${item.referencia || ''}`;
    const criterio = identificarInsumoGuiaMaestra(textoParaBuscar);

    if (criterio) {
      evaluadosContador++;
      const diag = generarDiagnosticoInsumoAutomatico(criterio, 'APROBADO');
      reporteResumen.push({
        referencia: item.referencia,
        insumoDetectado: criterio.insumo,
        dictamen: 'APROBADO'
      });

      return {
        ...item,
        dictamen: 'APROBADO',
        resultado: 'OK',
        observacion: diag.observacionDetallada,
        accion: diag.accionSugerida,
        responsableLab: item.responsableLab || responsableNombre,
        fechaRevision: item.fechaRevision || hoyStr,
        fechaEntrega: item.fechaEntrega || hoyStr,
        respondidoACompras: true
      };
    } else {
      noDetectadosContador++;
      return item;
    }
  });

  return {
    itemsActualizados,
    itemsEvaluados: itemsActualizados,
    evaluadosContador,
    noDetectadosContador,
    reporteResumen,
    resumen: {
      total: items.length,
      identificadosConGuia: evaluadosContador,
      noDetectados: noDetectadosContador,
      aprobados: evaluadosContador,
      rechazados: 0,
      observados: 0
    }
  };
}
