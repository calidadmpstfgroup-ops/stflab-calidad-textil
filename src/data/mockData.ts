import { MuestraTextil, SolicitudTelasCompleta, SolicitudAccesoriosCompleta, FichaTecnicaHistoricaVersionada, EvaluacionForrosCosturas } from '../types';

// Solicitudes iniciales activas para Telas y Accesorios (Vacías por defecto)
export const MOCK_MUESTRAS: MuestraTextil[] = [];
export const MOCK_SOLICITUDES_TELAS: SolicitudTelasCompleta[] = [];
export const MOCK_SOLICITUDES_ACCESORIOS: SolicitudAccesoriosCompleta[] = [];

// Base de Datos Histórica y Reutilizable de Fichas Técnicas de Proveedores con Versionamiento
export const MOCK_FICHAS_TECNICAS_HISTORICAS: FichaTecnicaHistoricaVersionada[] = [
  {
    id: 'ft-hist-001',
    codigoFT: 'FT-MEX-38770',
    referencia: 'CREPE VICTORIA',
    referenciaProveedor: 'CREPE VICTORIA',
    proveedor: 'TEXTIVISION, S.DE R.L. DE C.V.',
    contactoProveedor: 'ventas@textivision.com.mx',
    paisOrigen: 'MEXICO',
    versionActual: 1,
    createdAt: '2022-06-15',
    createdBy: 'Importación Oficial Fabricante',
    updatedAt: '2022-06-15',
    updatedBy: 'Laboratorio Calidad Textil',
    documentoOriginal: {
      nombreArchivo: 'ESPECIFICACIONES_TECNICAS_CREPE_VICTORIA_TEXTIVISION.pdf',
      tipo: 'PDF',
      fechaCarga: '2022-06-15'
    },
    historialVersiones: [
      {
        version: 1,
        fechaVersion: '2022-06-15',
        creadoPor: 'TEXTIVISION, S.DE R.L. DE C.V.',
        activo: true,
        nombreArchivoFT: 'ESPECIFICACIONES_TECNICAS_CREPE_VICTORIA_TEXTIVISION.pdf',
        especificaciones: {
          // 1. Encabezado y Trazabilidad (Datos Exactos del Documento)
          fechaProduccion: '01-15/JUN/22',
          stfPoNumber: 'MEX38770',
          numeroOrdenCompraSTF: 'MEX38770',
          nombreEmpresa: 'TEXTIVISION, S.DE R.L. DE C.V.',
          referenciaSTF: 'DESIGN 6341 A',
          nombreComercialTela: 'DESIGN 6341 A',
          colorShade: 'AZUL KLEIN 16936',
          referenciaProveedor: 'CREPE VICTORIA',
          paisOrigen: 'MEXICO',
          numeroLoteProduccion: '43254-1, 43313-1, 43367-1, 43463-1',
          subpartidaArancelaria: '',

          // 2. Información sobre Certificado de Origen
          aplicaCertificadoOrigen: false,

          // 3. Descripciones Básicas (Composición y Dimensiones)
          composicion: 'ACETATO 90%, ELASTANE 10%',
          composicionPorcentual: '90% ACETATO / 10% ELASTANE',
          tipoFibraFilamento: 'Continuo',
          tipoFibraTexturizado: 'Texturizado (Textured)',
          anchoTotalM: 1.40,
          anchoUtilM: 1.35,
          gramajeDeclaradoGsm: 286,
          pesoDenimOz: undefined,

          // 4. Acabados en el Textil
          acabadosTextiles: '100% Impregnado - 100% SOFTENER',

          // 5. Ensayos Técnicos del Textil
          tituloHiloUrdimbre: 'N/A',
          tituloHiloTrama: 'ACETATO=150/38 ELASTANO 40/1',
          resistenciaDesgarreMin: 0,
          encogimientoLargoMax: -1.8,
          encogimientoAnchoMax: -6.0,
          viroMax: 1.7,
          solidezLavadoMin: 4.5,
          solidezFroteSecoMin: 4.5,
          solidezFroteHumedoMin: 4.5,
          rendimientoMkg: 2.86,
          elongacionLargoMin: 150,
          elongacionAnchoMin: 127,
          recuperacionElasticidadMin: 0,
          desviacionTramaMax: 0,

          // 6. Clasificación de Tejido, Ligamento y Color
          tipoTejido: 'Punto',
          tipoLigamento: 'Tejido de punto por trama (Weft Knitted)',
          acabadoColorTintoreria: 'Teñido (Dyed)',

          // 7. Instrucciones de Cuidado
          lavadoSugerido: 'Machine Wash Cold, Normal Cycle, Separately, Do Not bleach, tumble dry low.',
          recomendacionesPlanchado: 'Do not Iron',
          observacionesFabricante: ''
        }
      }
    ]
  },
  {
    id: 'ft-hist-002',
    codigoFT: 'FT-2026-0841',
    referencia: 'LINO MOURA',
    referenciaProveedor: 'LM-9041',
    proveedor: 'SHANGHAI JOY TEX CO LTD',
    contactoProveedor: 'mr.chen@shanghaijoytex.com',
    paisOrigen: 'China',
    versionActual: 1,
    createdAt: '2026-02-01',
    createdBy: 'Compras Internacionales',
    updatedAt: '2026-02-01',
    updatedBy: 'Compras Internacionales',
    documentoOriginal: {
      nombreArchivo: 'FT_LinoMoura_ShanghaiJoyTex_Oficial.pdf',
      tipo: 'PDF',
      fechaCarga: '2026-02-01'
    },
    historialVersiones: [
      {
        version: 1,
        fechaVersion: '2026-02-01',
        creadoPor: 'Compras Internacionales',
        activo: true,
        nombreArchivoFT: 'FT_LinoMoura_ShanghaiJoyTex_Oficial.pdf',
        especificaciones: {
          // A. Información del Proveedor
          nombreEmpresa: 'SHANGHAI JOY TEX CO., LTD.',
          contactoTecnico: 'Mr. David Chen (Technical Quality Manager)',
          emailContacto: 'mr.chen@shanghaijoytex.com',
          telefonoWhatsapp: '+86 21 6888 9012',
          paisEmpresa: 'China',

          // B. Trazabilidad y Comercial
          stfPoNumber: 'OAC 1108',
          fechaProduccion: '2026-01-20',
          codigoMT: 'MT-88120',
          referenciaSTF: 'LINO MOURA',
          referenciaProveedor: 'LM-9041',
          codigoFabrica: 'SJT-LIN-401',
          nombreComercialTela: 'Natural Linen Blend Moura',
          molinoFabricante: 'Shanghai Joy Weaving Mill No. 4',
          paisOrigen: 'China',
          numeroLoteProduccion: 'LOT-CN-2026-08',
          colorShade: '045 CRUDO',
          subpartidaArancelaria: '5309.29.00.00',
          certificadoOrigen: 'FORM E - CN-2026-7819',

          // C. Composición
          composicion: '55% Lino, 45% Viscosa',
          composicionPorcentual: '55% Lino / 45% Viscosa',
          tipoFibraFilamento: 'Fibra Cortada Natural / Artificial',
          tipoFibraTexturizado: 'Hilatura Ring Spun Slub',
          tituloHiloUrdimbre: '21/1 Ne Lino/Viscosa',
          tituloHiloTrama: '21/1 Ne Lino/Viscosa Efecto Flame',
          sentidoTorsion: 'Z',
          mezclaIntima: '55/45 Blend Íntimo',

          // D. Dimensiones y Peso
          anchoTotalM: 1.52,
          anchoUtilM: 1.48,
          gramajeDeclaradoGsm: 210,
          pesoLinealGsm: 319,
          rendimientoMkg: 3.13,
          espesorMm: 0.45,

          // E. Construcción y Acabados
          tipoTejido: 'Plano',
          tipoLigamento: 'Tafetán Slub Flambé',
          densidadUrdimbreHilosCm: 26,
          densidadTramaPasadasCm: 22,
          acabadosTextiles: 'Desengome enzimático + Aero-finish suavizado',
          acabadoColorTintoreria: 'Blanqueo óptico fondo crudo',

          // Ensayos y Tolerancias
          encogimientoLargoMax: -2.0,
          encogimientoAnchoMax: -3.0,
          elongacionAnchoMin: 18.0,
          elongacionLargoMin: 4.0,
          recuperacionElasticidadMin: 90.0,
          desviacionTramaMax: 1.5,
          viroMax: 1.5,
          resistenciaTensionMin: 35.0,
          resistenciaDesgarreMin: 1800,
          deslizamientoCosturaMax: 4.0,
          resistenciaPillingMin: 4.0,
          solidezLavadoMin: 4.5,
          solidezFroteSecoMin: 4.0,
          solidezFroteHumedoMin: 3.5,
          cambioColorMin: 4.5,
          aptitudFrote: 'APTO PARA COMBINAR',
          pruebaFusionadoTemp: 150,
          observacionesFabricante: 'Lino pre-lavado con caída suave. Se recomienda aguja punta bola delgada en confección.'
        }
      }
    ]
  },
  {
    id: 'ft-hist-003',
    codigoFT: 'FT-000098',
    referencia: 'DENIM STRETCH 12OZ',
    referenciaProveedor: 'DS-1200',
    proveedor: 'COLTEJER S.A.',
    contactoProveedor: 'tecnica@coltejer.com.co',
    paisOrigen: 'Colombia',
    versionActual: 1,
    createdAt: '2026-02-10',
    createdBy: 'Importación Base Histórica',
    updatedAt: '2026-02-10',
    updatedBy: 'Importación Base Histórica',
    documentoOriginal: {
      nombreArchivo: 'FT_DenimStretch12oz_Coltejer.pdf',
      tipo: 'PDF',
      fechaCarga: '2026-02-10'
    },
    historialVersiones: [
      {
        version: 1,
        fechaVersion: '2026-02-10',
        creadoPor: 'Importación Base Histórica',
        activo: true,
        nombreArchivoFT: 'FT_DenimStretch12oz_Coltejer.pdf',
        especificaciones: {
          // A. Información del Proveedor
          nombreEmpresa: 'COLTEJER S.A.',
          contactoTecnico: 'Ing. Calidad Indigo & Acabados',
          emailContacto: 'tecnica@coltejer.com.co',
          telefonoWhatsapp: '+57 312 890 1122',
          paisEmpresa: 'Colombia',

          // B. Trazabilidad y Comercial
          stfPoNumber: 'OAC 1109',
          fechaProduccion: '2026-02-05',
          codigoMT: 'MT-77400',
          referenciaSTF: 'DENIM STRETCH 12OZ',
          referenciaProveedor: 'DS-1200',
          codigoFabrica: 'COL-DNM-12',
          nombreComercialTela: 'Denim Stretch Premium Ring Indigo',
          molinoFabricante: 'Coltejer Planta Itagüí',
          paisOrigen: 'Colombia',
          numeroLoteProduccion: 'LOT-COL-2026-55',
          colorShade: 'INDIGO PURO DEEP BLUE',
          subpartidaArancelaria: '5209.42.00.00',
          certificadoOrigen: 'CO-2026-3391',

          // C. Composición
          composicion: '98% Algodón, 2% Elastano',
          composicionPorcentual: '98% Algodón / 2% Elastano',
          tipoFibraFilamento: 'Fibra Cortada Natural + Filamento Elastano',
          tipoFibraTexturizado: 'Ring Spun Urdimbre / Core Spun Spandex Trama',
          tituloHiloUrdimbre: '8/1 Ne Ring Spun Índigo',
          tituloHiloTrama: '10/1 Ne Core Spun Spandex (70D)',
          sentidoTorsion: 'Z',
          mezclaIntima: 'Algodón Peinado + Spandex',

          // D. Dimensiones y Peso
          anchoTotalM: 1.52,
          anchoUtilM: 1.50,
          gramajeDeclaradoGsm: 410,
          pesoLinealGsm: 615,
          rendimientoMkg: 1.62,
          espesorMm: 0.72,
          pesoDenimOz: 12.0,

          // E. Construcción y Acabados
          tipoTejido: 'Índigo / Denim',
          tipoLigamento: 'Sarga 3/1 Z (Right Hand Twill)',
          densidadUrdimbreHilosCm: 28,
          densidadTramaPasadasCm: 18,
          acabadosTextiles: 'Sanforizado + Mercerizado + Flat Finish',
          acabadoColorTintoreria: 'Teñido Índigo Ring Dyeing en Cuerda',

          // Ensayos y Tolerancias
          encogimientoLargoMax: -3.5,
          encogimientoAnchoMax: -4.0,
          elongacionAnchoMin: 22.0,
          elongacionLargoMin: 3.0,
          recuperacionElasticidadMin: 88.0,
          desviacionTramaMax: 2.0,
          viroMax: 3.0,
          resistenciaTensionMin: 55.0,
          resistenciaDesgarreMin: 2800,
          deslizamientoCosturaMax: 2.5,
          resistenciaPillingMin: 4.5,
          solidezLavadoMin: 4.0,
          solidezFroteSecoMin: 3.5,
          solidezFroteHumedoMin: 2.5,
          cambioColorMin: 4.0,
          aptitudFrote: 'SUELTA COLOR CON LA FRICCIÓN',
          anchoTotalDesengome: 1.45,
          anchoUtilDesengome: 1.42,
          lavadoSugerido: 'Enzimático medio + Stone wash suave',
          observacionesFabricante: 'Índigo puro con anillo de teñido superficial para efectos de desgaste en lavandería.'
        }
      }
    ]
  }
];

export const MOCK_EVALUACIONES_FORROS_COSTURAS: EvaluacionForrosCosturas[] = [
  {
    id: 'fc-001',
    codigoReporte: 'RPT-FC-2026-001',
    referencia: 'LINO MOURA',
    proveedor: 'SHANGHAI JOY TEX CO LTD',
    color: '045 CRUDO',
    ordenCompra: 'OAC 1107',
    pipin: {
      fechaIngreso: '2026-02-05',
      fechaEntrega: '2026-02-08',
      observaciones: 'Muestra preliminar Pipin recibida con forro de poliéster ligero 100% PES crudo. Se evidenció costura limpia con 12 puntadas por pulgada. El doblado de orillo cumple tolerancia inicial.',
      estado: 'CONFORME',
      tipoForro: 'Poliéster 100% Tafetán 50D',
      calidadCostura: 'Puntada 301 Doble Pespunte',
      puntadasPorPulgada: '12 SPI'
    },
    shipping: {
      fechaIngreso: '2026-02-20',
      fechaEntrega: '2026-02-22',
      observaciones: 'Muestra Shipping final en lote de producción. Se verifica forro con idéntica densidad y tono que el Pipin. Costuras de unión en sisa y pretina con refuerzo de seguridad adicional.',
      estado: 'APROBADO',
      tipoForro: 'Poliéster 100% Tafetán 50D',
      calidadCostura: 'Puntada 301 Doble Pespunte con Remate Sisa',
      puntadasPorPulgada: '12 SPI'
    },
    comparacion: {
      coincideForro: true,
      coincideCostura: true,
      variacionesDetectadas: 'Sin discrepancias críticas. La muestra Shipping mantiene la especificación aprobada en Pipin.',
      dictamenFinal: 'APROBADO',
      evaluador: 'Laura Morales (Ing. Calidad Textil)',
      fechaEvaluacion: '2026-02-22',
      observacionesGenerales: 'Lote autorizado para confección masiva en planta.'
    },
    correosEnviados: [
      {
        id: 'mail-001',
        destinatario: 'compras.calidad@stfgroup.com',
        asunto: '[STFLab 2.0] Reporte Técnico Forros y Costuras - Ref: LINO MOURA (Pipin vs Shipping)',
        cuerpo: 'Se adjunta reporte técnico APROBADO de Pipin vs Shipping para la referencia LINO MOURA.',
        fechaEnvio: '2026-02-22 10:30 AM',
        enviadoPor: 'Laura Morales'
      }
    ],
    createdAt: '2026-02-05',
    updatedAt: '2026-02-22'
  },
  {
    id: 'fc-002',
    codigoReporte: 'RPT-FC-2026-002',
    referencia: 'CREPE VICTORIA',
    proveedor: 'XYZ TEXTILES S.A.S.',
    color: '000 NEGRO',
    ordenCompra: 'OAC 1108',
    pipin: {
      fechaIngreso: '2026-02-10',
      fechaEntrega: '2026-02-12',
      observaciones: 'Forro acetato negro en muestra Pipin. Se observó fruncido leve en costura lateral por tensión excesiva del hilo de trama.',
      estado: 'CON NOVEDAD',
      tipoForro: 'Acetato / Viscosa 60/40',
      calidadCostura: 'Puntada Overlock 4 Hilos',
      puntadasPorPulgada: '10 SPI'
    },
    shipping: {
      fechaIngreso: '2026-02-26',
      fechaEntrega: '2026-02-28',
      observaciones: 'En la muestra Shipping se corrigió la tensión de hilado y se ajustaron a 12 SPI. Forro suave al tacto con excelente caída.',
      estado: 'APROBADO',
      tipoForro: 'Acetato / Viscosa 60/40',
      calidadCostura: 'Puntada Overlock 4 Hilos Corregida',
      puntadasPorPulgada: '12 SPI'
    },
    comparacion: {
      coincideForro: true,
      coincideCostura: true,
      variacionesDetectadas: 'La muestra Shipping resolvió el fruncido reportado en Pipin.',
      dictamenFinal: 'APROBADO',
      evaluador: 'Carlos Mendoza (Jefe Calidad)',
      fechaEvaluacion: '2026-02-28',
      observacionesGenerales: 'Corrección validada y aprobada para compras.'
    },
    createdAt: '2026-02-10',
    updatedAt: '2026-02-28'
  }
];
