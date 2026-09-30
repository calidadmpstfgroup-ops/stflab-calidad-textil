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
    proveedor: 'TEXTIVISION, S.DE R.L. DE C.V.',
    color: 'AZUL KLEIN 16936',
    ordenCompra: 'MEX38770',
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
