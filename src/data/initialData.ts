/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Muestra, 
  ChatMessage, 
  RevisionPrenda, 
  SolicitudAccesorios,
  SolicitudProveedor 
} from '../types';

// Colombian Technical Standards related to each textile test
export const NTC_STANDARDS = {
  encogimiento: { code: "NTC 230", desc: "Determinación del rendimiento lineal en metros por kilogramo (m/kg) y peso del tejido." },
  elasticidad: { code: "NTC 481", desc: "Ensayo de elasticidad y alargamiento para tejidos de punto y calada." },
  recuperacion: { code: "NTC 1599", desc: "Recuperación de la arruga o deformación en tejidos planos." },
  solidezColor: { code: "NTC 228", desc: "Solidez del color al frote y transferencia de pigmentos." },
  resistencia: { code: "NTC 456", desc: "Resistencia a la tracción y elongación de materiales textiles." },
  pilling: { code: "NTC 2054", desc: "Método para evaluar la resistencia al pilling o moteado en tejidos." }
};

// ----------------------------------------------------
// 1. MUESTRAS TEXTILES (COMPRAS & LABORATORIO)
// ----------------------------------------------------
export const INITIAL_MUESTRAS: Muestra[] = [
  {
    id: "M-2026-001",
    codigo: "SF-TEL-2026-001",
    referencia: "SF-DENIM-902-INDIGO",
    nombreTela: "DENIM ULTRA STRETCH 10.5 OZ",
    proveedor: "VICUNHA TEXTIL S.A.",
    nroLote: "L-9042",
    prioridad: "Alta",
    solicitudCompra: "SF_TEL_005978",
    ordenCompra: "OAC 1107",
    color: "001 INDIGO INTENSO",
    composicion: "98% Algodón 2% Elastano",
    paisOrigen: "Colombia",
    fechaIngreso: "2026-02-15",
    resultadoFinal: "Hallazgo",
    dictamenLaboratorio: "Hallazgo",
    observaciones: "Tela con alta elasticidad (18%) y encogimiento de -5.2% en largo. Aprobado con observaciones de compensación en moldes de patronaje y reposo crítico en corte.",
    registradoPor: "Compras Telas Studio F",
    fichaTecnica: {
      gramajeEsperado: 310,
      pesoMlEsperado: 460,
      anchoEsperado: 1.48,
      anchoTotalEsperado: 1.50,
      encogimientoEsperado: -3.0,
      composicion: "98% Algodón 2% Elastano",
      tipoTejido: "TEJIDO PLANO",
      anchoUtil: 1.48,
      pesoGsm: 310,
      encogimientoLargo: -3.0,
      encogimientoAncho: -2.0,
      rendimientoEsperado: 2.17,
      solidezLavadoEsperado: "4-5",
      solidezFroteSecoEsperado: "4",
      solidezFroteHumedoEsperado: "3-4"
    },
    pruebas: {
      gramajeMedido: 308,
      pesoMlMedido: 452,
      anchoMedido: 1.45,
      anchoTotalMedido: 1.48,
      encogimientoMedido: -5.2,
      encogimientoLargo: -5.2,
      encogimientoAncho: -2.1,
      elasticidadMedida: 18,
      recuperacion: 92,
      solidezColor: "4",
      solidezLavado: "4-5",
      solidezFroteSeco: "4",
      solidezFroteHumedo: "3",
      resistencia: "520 N",
      pilling: "4/5",
      conformeFT: false,
      conformePLM: false,
      solidezColorAptoPara: "COMBINAR",
      lavadoSugerido: "Lavado suave a 30°C con detergente neutro, no usar lejía."
    },
    decisionCompras: {
      id: "dec-001",
      decision: "Aprobar con observaciones",
      usuario: "Compras Studio F",
      fecha: "2026-02-16",
      hora: "10:30",
      observaciones: "Se aprueba el lote para producción aplicando escala en Patronaje y 48h de reposo en mesa de Corte."
    },
    alertasAreas: [
      {
        id: "alt-pat-001",
        muestraId: "M-2026-001",
        area: "patronaje",
        referencia: "SF-DENIM-902-INDIGO",
        nombreTela: "DENIM ULTRA STRETCH 10.5 OZ",
        proveedor: "VICUNHA TEXTIL S.A.",
        nroLote: "L-9042",
        instruccion: "COMPENSACIÓN REQUERIDA: Aplicar escala física en moldes Gerber/Optitex de +5.2% en largo (sentido hilo) y +2.1% en ancho.",
        leido: true,
        atendido: true,
        fecha: "2026-02-16",
        hora: "10:35",
        usuarioCreador: "Compras Studio F"
      },
      {
        id: "alt-cor-001",
        muestraId: "M-2026-001",
        area: "corte",
        referencia: "SF-DENIM-902-INDIGO",
        nombreTela: "DENIM ULTRA STRETCH 10.5 OZ",
        proveedor: "VICUNHA TEXTIL S.A.",
        nroLote: "L-9042",
        instruccion: "REPOSO CRÍTICO DE 48 HORAS: Tela con alta elasticidad (18%). Extender rollos en mesa de relajación sin tensión por un mínimo de 48 horas continuas antes de realizar el tendido y corte.",
        leido: true,
        atendido: false,
        fecha: "2026-02-16",
        hora: "10:35",
        usuarioCreador: "Compras Studio F"
      }
    ]
  },
  {
    id: "M-2026-002",
    codigo: "ELA-TEL-2026-002",
    referencia: "ELA-LINO-NAT-045",
    nombreTela: "LINO VISCOSA RÚSTICO ELA",
    proveedor: "TEJIDOS LAFAYETTE",
    nroLote: "L-8831",
    prioridad: "Media",
    solicitudCompra: "ELA_TEL_003063",
    color: "045 NATURAL CRUDO",
    composicion: "70% Viscosa 30% Lino",
    paisOrigen: "Colombia",
    fechaIngreso: "2026-02-20",
    resultadoFinal: "Aprobado",
    dictamenLaboratorio: "Aprobado",
    observaciones: "Cumple con todos los estándares de caída, gramaje y solidez al lavado.",
    registradoPor: "Compras ELA",
    fichaTecnica: {
      gramajeEsperado: 190,
      pesoMlEsperado: 270,
      anchoEsperado: 1.42,
      encogimientoEsperado: -2.0,
      composicion: "70% Viscosa 30% Lino",
      tipoTejido: "TEJIDO PLANO",
      anchoUtil: 1.42,
      pesoGsm: 190
    },
    pruebas: {
      gramajeMedido: 192,
      pesoMlMedido: 272,
      anchoMedido: 1.43,
      encogimientoMedido: -1.9,
      elasticidadMedida: 3,
      recuperacion: 95,
      solidezColor: "4-5",
      solidezLavado: "4-5",
      solidezFroteSeco: "4-5",
      solidezFroteHumedo: "4",
      resistencia: "430 N",
      pilling: "4",
      conformeFT: true,
      conformePLM: true
    },
    decisionCompras: {
      id: "dec-002",
      decision: "Aprobar para compra",
      usuario: "Compras ELA",
      fecha: "2026-02-21",
      hora: "15:10",
      observaciones: "Lote liberado en su totalidad para producción de blusas y vestidos Colección Primavera."
    }
  },
  {
    id: "M-2026-003",
    codigo: "STF-TEL-2026-003",
    referencia: "STF-SATIN-SEDA-010",
    nombreTela: "SATÍN SEDA BLUSA TOP CLASS",
    proveedor: "TEXTILES SUTEX",
    nroLote: "L-7740",
    prioridad: "Alta",
    color: "010 NEGRO NOCHE",
    composicion: "100% Poliéster Satén",
    paisOrigen: "Colombia",
    fechaIngreso: "2026-03-01",
    resultadoFinal: "Pendiente",
    dictamenLaboratorio: "Pendiente",
    observaciones: "Muestra física recibida en Laboratorio para ensayo urgente de solidez al lavado y desgarre.",
    registradoPor: "Compras Studio F",
    fichaTecnica: {
      gramajeEsperado: 125,
      pesoMlEsperado: 185,
      anchoEsperado: 1.50,
      encogimientoEsperado: -1.5,
      composicion: "100% Poliéster Satén",
      tipoTejido: "TEJIDO PLANO",
      anchoUtil: 1.50,
      pesoGsm: 125
    },
    pruebas: {
      gramajeMedido: 0,
      pesoMlMedido: 0,
      encogimientoMedido: 0,
      elasticidadMedida: 0,
      recuperacion: 0,
      solidezColor: "Pendiente",
      resistencia: "Pendiente",
      pilling: "Pendiente"
    }
  }
];

// ----------------------------------------------------
// 2. SOLICITUDES DE ACCESORIOS (COMPRAS & LABORATORIO)
// ----------------------------------------------------
export const INITIAL_SOLICITUDES_ACCESORIOS: SolicitudAccesorios[] = [
  {
    id: "SOL-ACC-2026-0001",
    codigoSolicitud: "ACC-00001",
    titulo: "Botones Metálicos y Cremalleras Colección Denim Studio F",
    marca: "STUDIO F",
    prioridad: "Alta",
    fechaSolicitud: "2026-02-25",
    proveedorGeneral: "YKK COLOMBIA / HERRAJES ZAMAK",
    estadoGeneral: "Respondida por Laboratorio",
    solicitante: {
      nombre: "Compras Accesorios Studio F",
      area: "Compras",
      email: "compras@texlab.com"
    },
    observacionesGenerales: "Pruebas de solidez al frote húmedo y resistencia a la tensión para producción masiva de jeans tiro alto.",
    items: [
      {
        id: "acc-item-1",
        filaNumero: 1,
        referencia: "BOT-MET-ZAMAK-24L",
        descripcion: "Botón metálico níquel 24L personalizado Studio F",
        color: "Níquel Brillante",
        talla: "24L",
        cantidad: 10,
        unidad: "UNID",
        linea: "Denim Dama",
        observacionCompras: "Verificar retención en ojal con lavado agresivo",
        estadoLab: "Aprobado",
        resultadoLab: "Tracción 485 N (cumple > 350 N), solidez al frote seco 4-5",
        observacionLab: "Excelente anclaje y resistencia superficial.",
        fechaDictamen: "2026-02-27",
        responsableLab: "Laboratorio STF"
      },
      {
        id: "acc-item-2",
        filaNumero: 2,
        referencia: "CREM-MET-YKK-#5",
        descripcion: "Cremallera metálica latón dientes estándar 15cm",
        color: "Latón Envejecido",
        talla: "15 cm",
        cantidad: 6,
        unidad: "UNID",
        linea: "Denim Dama",
        observacionCompras: "Comprobar resistencia del deslizador y tope",
        estadoLab: "Aprobado",
        resultadoLab: "Fuerza de retención lateral 120 N, ciclo de fatiga 500 ciclos OK",
        observacionLab: "Apta para proceso de lavandería stone wash suave.",
        fechaDictamen: "2026-02-27",
        responsableLab: "Laboratorio STF"
      },
      {
        id: "acc-item-3",
        filaNumero: 3,
        referencia: "REMA-ZAMAK-01",
        descripcion: "Remache de bolsillo bolsillo delantero zamak",
        color: "Cobre Rústico",
        talla: "9 mm",
        cantidad: 20,
        unidad: "UNID",
        linea: "Denim Dama",
        observacionCompras: "Ensayo de resistencia a niebla salina",
        estadoLab: "Observado",
        resultadoLab: "Solidez al frote húmedo grado 3. Ligera transferencia de pátina.",
        observacionLab: "Novedad: Usar sellador o calibrar presión de troquel a 2.3 bar.",
        fechaDictamen: "2026-02-27",
        responsableLab: "Laboratorio STF"
      }
    ],
    respuestaLaboratorio: {
      fechaRespuesta: "2026-02-27",
      respondidoPor: "Laboratorio STF Group",
      dictamenGeneral: "Aprobado con Novedades",
      observacionesGenerales: "Botones y cremalleras cumplen rigurosamente los parámetros NTC. El remache presenta grado 3 en solidez al frote húmedo.",
      recomendaciones: "Calibrar la matriz de troquel a 2.3 bar para remaches y evitar contacto con agentes ácidos en lavandería.",
      totalAprobadas: 2,
      totalObservadas: 1,
      totalRechazadas: 0
    },
    creadoEn: "2026-02-25T14:20:00.000Z"
  },
  {
    id: "SOL-ACC-2026-0002",
    codigoSolicitud: "ACC-00002",
    titulo: "Cierres Invisibles y Elásticos Vestidos ELA 2026",
    marca: "ELA",
    prioridad: "Media",
    fechaSolicitud: "2026-03-01",
    proveedorGeneral: "CIERRES EKA / ELASTITEX",
    estadoGeneral: "Enviada a Laboratorio",
    solicitante: {
      nombre: "Compras Accesorios ELA",
      area: "Compras",
      email: "compras@texlab.com"
    },
    observacionesGenerales: "Verificar compatibilidad con planchado y resistencia de cinta.",
    items: [
      {
        id: "acc-item-4",
        filaNumero: 1,
        referencia: "CIERRE-INV-#3-NEGRO",
        descripcion: "Cremallera invisible poliéster #3 50cm",
        color: "000 Negro",
        talla: "50 cm",
        cantidad: 5,
        unidad: "UNID",
        linea: "Vestidos ELA",
        observacionCompras: "Prueba de deslizamiento continuo y calor",
        estadoLab: "Pendiente"
      },
      {
        id: "acc-item-5",
        filaNumero: 2,
        referencia: "ELAS-CROCHET-25MM",
        descripcion: "Elástico de crochet empretinar 25mm",
        color: "Blanco Óptico",
        talla: "25 mm",
        cantidad: 10,
        unidad: "METROS",
        linea: "Faldas ELA",
        observacionCompras: "Medir elongación y recuperación post-lavado",
        estadoLab: "Pendiente"
      }
    ],
    creadoEn: "2026-03-01T09:15:00.000Z"
  }
];

// ----------------------------------------------------
// 3. SOLICITUDES A PROVEEDORES (PORTAL EXTERNO)
// ----------------------------------------------------
export const INITIAL_SOLICITUDES_PROVEEDOR: SolicitudProveedor[] = [
  {
    id: "sol-prov-001",
    token: "STF-PROV-102938-VICU",
    referencia: "REF-DENIM-VIC-11OZ",
    nombreTela: "Denim Stretch 11 Oz Indigo",
    proveedor: "VICUNHA TEXTIL S.A.",
    color: "INDIGO WASH",
    estado: "recibido",
    fechaCreacion: "2026-02-18T10:00:00.000Z",
    fechaRecepcion: "2026-02-22T16:30:00.000Z",
    datosProveedor: {
      nombreEmpresa: "VICUNHA TEXTIL S.A.",
      contactoNombre: "Ing. Carlos Mendoza",
      contactoCorreo: "cmendoza@vicunha.com.co",
      referencia: "REF-DENIM-VIC-11OZ",
      nombreTela: "Denim Stretch 11 Oz Indigo",
      proveedor: "VICUNHA TEXTIL S.A.",
      composicion: "98% Algodón 2% Elastano",
      anchoUtil: 1.48,
      anchoTotal: 1.51,
      pesoGsm: 315,
      encogimientoLargo: -3.2,
      encogimientoAncho: -2.0,
      piernaVirada: 1.8,
      solidezLavadoCambioColor: "4-5",
      solidezFroteSeco: "4",
      solidezFroteHumedo: "3-4",
      tipoTejido: "TEJIDO PLANO",
      lavadoSugerido: "Lavado doméstico suave 30°C",
      fechaEnvio: "2026-02-22"
    }
  }
];

// ----------------------------------------------------
// 4. REVISIONES DE PRENDAS IMPORTADAS
// ----------------------------------------------------
export const INITIAL_REVISION_PRENDAS: RevisionPrenda[] = [
  {
    id: "REV-PRENDA-001",
    referenciaPrenda: "STF-PANT-78192",
    referencia: "STF-PANT-78192",
    nombrePrenda: "PANTALON WIDE LEG DENIM",
    marca: "STUDIO F",
    proveedor: "CONFECCIONES DEL VALLE",
    ordenCompra: "OC-2026-901",
    unidades: 2400,
    fechaCreadoDocumento: "2026-02-10",
    fechaDesarrollo: "2026-02-12",
    fechaInfoEmp: "2026-02-14",
    fechaRevCompo: "2026-02-18",
    fechaCarelabels: "2026-02-20",
    etapaActual: "Carelabels",
    estado: "Completado",
    estadoAprobacion: "Aprobado",
    parametros: {
      desarrollo: "VERDADERO",
      empaque: "VERDADERO",
      composiciones: "VERDADERO",
      lavado: "VERDADERO"
    },
    registradoPor: "Colecciones STF",
    creadoEn: "2026-02-10T08:00:00.000Z"
  },
  {
    id: "REV-PRENDA-002",
    referenciaPrenda: "ELA-BLUS-34012",
    referencia: "ELA-BLUS-34012",
    nombrePrenda: "BLUSA MANGA BOMBACHA POPELINA",
    marca: "ELA",
    proveedor: "TEXTILES & MODA SAS",
    ordenCompra: "OC-2026-845",
    unidades: 1800,
    fechaCreadoDocumento: "2026-02-22",
    fechaDesarrollo: "2026-02-24",
    fechaInfoEmp: "2026-02-25",
    etapaActual: "Revisión Lab",
    estado: "En Revisión",
    estadoAprobacion: "En Proceso",
    parametros: {
      desarrollo: "VERDADERO",
      empaque: "VERDADERO",
      composiciones: "FALSO",
      lavado: null
    },
    registradoPor: "Colecciones ELA",
    creadoEn: "2026-02-22T09:00:00.000Z"
  },
  {
    id: "REV-PRENDA-003",
    referenciaPrenda: "MAN-POLO-55102",
    referencia: "MAN-POLO-55102",
    nombrePrenda: "CAMISETA POLO PIQUE STF MAN",
    marca: "HOMBRES STUDIO F",
    proveedor: "CONFECCIONES ANDINAS",
    ordenCompra: "OC-2026-610",
    unidades: 1200,
    fechaCreadoDocumento: "2026-03-01",
    fechaInfoEmp: "2026-03-01",
    etapaActual: "Creado",
    estado: "Pendiente",
    estadoAprobacion: "Pendiente",
    parametros: {
      desarrollo: null,
      empaque: null,
      composiciones: null,
      lavado: null
    },
    registradoPor: "Colecciones STF MAN",
    creadoEn: "2026-03-01T11:00:00.000Z"
  }
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: "msg-init-1",
    remitente: "Sistema STFLab",
    area: "compras",
    mensaje: "Bienvenido a STFLab Connect (STF Group). Sistema de control de calidad textil y trazabilidad inter-áreas.",
    timestamp: new Date().toISOString(),
    canal: "general"
  }
];
