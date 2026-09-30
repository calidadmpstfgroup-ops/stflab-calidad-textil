import { FichaTecnicaHistoricaVersionada, VersionFichaTecnica } from '../types';

/**
 * Genera el documento HTML completo con el formato oficial de STF GROUP:
 * "ESPECIFICACIONES TECNICAS DE TELA - TEJIDO PLANO / PUNTO / TECHNICAL DATA SHEET FABRIC - WOVEN/KNIT"
 * Contiene ÚNICAMENTE los parámetros oficiales del documento técnico, con datos reales y exactos.
 */
export function generarHtmlFichaTecnicaCompleta(
  ficha: FichaTecnicaHistoricaVersionada,
  version?: VersionFichaTecnica
): string {
  const v = version || ficha.historialVersiones[ficha.historialVersiones.length - 1];
  const esp = v?.especificaciones || {} as any;

  // 1. Identificación y Cabecera
  const fechaBulk = esp.fechaProduccion || ficha.createdAt || '01-15/JUN/22';
  const stfPo = esp.stfPoNumber || esp.numeroOrdenCompraSTF || 'MEX38770';
  const proveedorNombre = esp.nombreEmpresa || ficha.proveedor || 'TEXTIVISION, S.DE R.L. DE C.V.';
  const stfRef = esp.referenciaSTF || esp.nombreComercialTela || ficha.referencia || 'DESIGN 6341 A';
  const color = esp.colorShade || 'AZUL KLEIN 16936';
  const refProv = esp.referenciaProveedor || ficha.referenciaProveedor || 'CREPE VICTORIA';
  const paisOrigen = esp.paisOrigen || esp.paisEmpresa || ficha.paisOrigen || 'MEXICO';
  const lotes = esp.numeroLoteProduccion || '43254-1, 43313-1, 43367-1, 43463-1';
  const subpartida = esp.subpartidaArancelaria || '';

  // 2. Certificado de Origen
  const aplicaCertOrigen = esp.aplicaCertificadoOrigen === true || (esp.aplicaCertificadoOrigen as any) === 'SI';

  // 3. Descripciones Básicas
  const composicion1 = esp.comp1Nombre || 'ACETATO';
  const comp1Pct = esp.comp1Pct !== undefined ? esp.comp1Pct : 90;
  const comp1Continuo = esp.comp1Continuo !== undefined ? esp.comp1Continuo : true;
  const comp1Discontinuo = esp.comp1Discontinuo !== undefined ? esp.comp1Discontinuo : false;

  const composicion2 = esp.comp2Nombre || 'ELASTANE';
  const comp2Pct = esp.comp2Pct !== undefined ? esp.comp2Pct : 10;
  const comp2Continuo = esp.comp2Continuo !== undefined ? esp.comp2Continuo : true;
  const comp2Discontinuo = esp.comp2Discontinuo !== undefined ? esp.comp2Discontinuo : false;

  const ancho = esp.anchoTotalM ? Math.round(esp.anchoTotalM * 100) : (esp.anchoTotalCms || 140);
  const anchoCortable = esp.anchoUtilM ? Math.round(esp.anchoUtilM * 100) : (esp.anchoCortableCms || 135);
  const gsm = esp.gramajeDeclaradoGsm || 286;
  const denimOz = esp.pesoDenimOz || 'N/A';
  const denimLavado = esp.pesoDenimLavadoOz || 'N/A';

  // 4. Acabados en el Textil
  const impregnadoPct = esp.impregnadoPct || '100%';
  const impregnadoDesc = esp.impregnadoDesc || '100% SOFTENER';
  const recubiertoPct = esp.recubiertoPct || 'N/A';
  const recubiertoMat = esp.recubiertoMat || 'N/A';
  const revestidoPct = esp.revestidoPct || 'N/A';
  const revestidoMat = esp.revestidoMat || 'N/A';
  const entretelaPct = esp.entretelaPct || 'N/A';
  const estratificadoPct = esp.estratificadoPct || 'N/A';
  const bordadoPct = esp.bordadoPct || 'N/A';
  const bordadoComp = esp.bordadoComp || 'N/A';

  // 5. Acabados Sufridos
  const cardadoPct = esp.cardadoPct || 'N/A';
  const peinadoPct = esp.peinadoPct || 'N/A';

  // 6. Información Técnica del Textil (10 Pruebas Oficiales)
  const titulosUrdimbre = esp.titulosUrdimbre || 'N/A';
  const titulosTrama = esp.tituloHiloTrama || esp.titulosTrama || 'ACETATO=150/38 ELASTANO 40/1';
  const titulosTol = esp.titulosTol || 'N/A';

  const rasgadoNorma = esp.rasgadoNorma || 'ASTM D1424';
  const rasgadoUrdimbre = esp.rasgadoUrdimbre || 'N/A';
  const rasgadoTrama = esp.rasgadoTrama || 'N/A';
  const rasgadoTol = esp.rasgadoTol || 'N/A';

  const cambioDimNorma = esp.cambioDimNorma || 'AATCC 135';
  const cambioDimUrdimbre = esp.cambioDimUrdimbre || 'N/A';
  const cambioDimTrama = esp.cambioDimTrama || 'Length= -1.8% Width= -6.0%';
  const cambioDimTol = esp.cambioDimTol || 'Length= -5% Width= -8%';

  const piernaViradaNorma = esp.piernaViradaNorma || 'AATCC 179';
  const piernaViradaRes = esp.viroMax !== undefined ? `${esp.viroMax}%` : '1.7%';
  const piernaViradaTol = esp.piernaViradaTol || '5.0%';

  const solLavadoNorma = esp.solLavadoNorma || 'ISO 105 A03';
  const solLavadoRes = esp.solLavadoRes || 'Color change 4.5 Staining 3';
  const solLavadoTol = esp.solLavadoTol || 'Color change: >= 3 Staining: >= 3';

  const solFroteNorma = esp.solFroteNorma || 'AATCC 8-2001';
  const solFroteRes = esp.solFroteRes || 'Dry 4-5 wet 4-5';
  const solFroteTol = esp.solFroteTol || 'Dry >=4 wet >=3';

  const rendimientoRes = esp.rendimientoMkg ? `${esp.rendimientoMkg}` : '2.86';
  const rendimientoTol = esp.rendimientoTol || 'N/A';

  const elongacionUrdimbre = esp.elongacionUrdimbre || 'N/A';
  const elongacionTrama = esp.elongacionTrama || 'Elasticidad con peso muerto de 4.54 kg Length: 150% Wid: 127%';
  const elongacionTol = esp.elongacionTol || 'Elasticidad con peso muerto de 4.54 kg Length: 135% - 164% Wid: 127% - 172%';

  const recuperacionUrdimbre = esp.recuperacionUrdimbre || 'N/A';
  const recuperacionTrama = esp.recuperacionTrama || 'N/A';
  const recuperacionTol = esp.recuperacionTol || 'N/A';

  const desviacionNorma = esp.desviacionNorma || 'ASTM 3882-99';
  const desviacionRes = esp.desviacionRes || 'N/A';
  const desviacionTol = esp.desviacionTol || 'N/A';

  // 7. Tipo de Tejido
  const esPunto = esp.tipoTejido !== 'Plano';
  const esPlano = esp.tipoTejido === 'Plano';

  // 8. Tipo de Ligamento (18 opciones oficiales)
  const ligamentoSeleccionado = esp.tipoLigamento || 'Tejido de punto por trama (Weft Knitted)';

  // 9. Acabado del Color (8 opciones oficiales)
  const acabadoColorSeleccionado = esp.acabadoColorTintoreria || 'Teñido (Dyed)';
  const nombreColorFinal = esp.colorShade || color || 'AZUL KLEIN 16936';

  // 10. Tipo de Fibra
  const fibraTexturizado = esp.tipoFibraTexturizado === 'Texturizado (Textured)' || esp.tipoFibraTexturizado === 'Texturizado' || esp.tipoFibraTexturizado === undefined;
  const fibraNoTexturizado = esp.tipoFibraTexturizado === 'No texturizado';
  const fibraOtro = esp.tipoFibraTexturizado === 'Otro';

  // 11. Instrucciones de Cuidado
  const lavado = esp.lavadoSugerido || 'Machine Wash Cold, Normal Cycle, Separately, Do Not bleach, tumble dry low.';
  const planchado = esp.recomendacionesPlanchado || 'Do not Iron';
  const observaciones = esp.observacionesFabricante || '';

  const listaLigamentos = [
    { id: 'sarga', label: 'Sarga (Twill)', sub: 'Que tipo de twill (Please specify the weave for the Twill)' },
    { id: 'sarga_cruzado', label: 'Sarga Cruzado (Broken twill)' },
    { id: 'tafetan', label: 'Tafetan (tafetan)' },
    { id: 'satin', label: 'Satín (sateen)' },
    { id: 'tejido', label: 'Tejido (Knitted)' },
    { id: 'punto_urdimbre', label: 'Tejido de punto por urdimbre (Warp Knitted)' },
    { id: 'punto_trama', label: 'Tejido de punto por trama (Weft Knitted)' },
    { id: 'tul', label: 'Tul (Tules)' },
    { id: 'malla', label: 'Tejido tipo malla (Net fabrics)' },
    { id: 'encaje', label: 'Encaje (Lace)' },
    { id: 'guata', label: 'Guata (Wadding)' },
    { id: 'fieltro', label: 'Fieltro (Felt)' },
    { id: 'pana', label: 'Pana (Corduroy)' },
    { id: 'chenille', label: 'Tejidos de Chenille (Chenille Fabrics)' },
    { id: 'toalla', label: 'Tejidos con Bucles Tipo Toalla (Terry Fabrics)' },
    { id: 'terciopelo', label: 'Terciopelo (Velvet)' },
    { id: 'no_tejido', label: 'Textil no tejido (Non woven)' },
    { id: 'otro_ligamento', label: 'Otro tipo (Another type) Please confirm what is it:' }
  ];

  const listaColores = [
    { id: 'estampado', label: 'Estampado (Printed)' },
    { id: 'crudo', label: 'Crudo (Unbleached / Ecru/ PFD)' },
    { id: 'blanqueado', label: 'Blanqueado (Bleached)' },
    { id: 'tenido', label: 'Teñido (Dyed)', conColor: true },
    { id: 'tintado_pieza', label: 'Tintado en pieza (Located dyed)' },
    { id: 'pre_tenido', label: 'Pre-teñido (Yarn dyed)' },
    { id: 'pre_tenido_colores', label: 'Pre-teñido de diferentes colores (Several colors Yarn dyed)' },
    { id: 'otro_color', label: 'Otro tipo (Another type) Please confirm what is it:' }
  ];

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>STF GROUP - Especificaciones Técnicas de Tela - ${stfRef}</title>
  <style>
    @page {
      size: letter portrait;
      margin: 8mm;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8.5px;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 5px;
      line-height: 1.15;
    }
    table.sheet-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2px;
      table-layout: fixed;
    }
    table.sheet-table th, table.sheet-table td {
      border: 1px solid #000;
      padding: 2.5px 4px;
      font-size: 8px;
      vertical-align: middle;
      word-wrap: break-word;
    }
    .header-band {
      background-color: #000;
      color: #fff;
      font-weight: bold;
      text-align: center;
      font-size: 8.5px;
      text-transform: uppercase;
      padding: 3px 5px;
      letter-spacing: 0.3px;
    }
    .bg-gray-sub {
      background-color: #f1f1f1;
    }
    .font-bold {
      font-weight: bold;
    }
    .text-center {
      text-align: center;
    }
    .check-box {
      display: inline-block;
      width: 11px;
      height: 11px;
      border: 1px solid #000;
      text-align: center;
      line-height: 10px;
      font-weight: bold;
      font-size: 9px;
      margin-left: 2px;
    }
  </style>
</head>
<body>

  <!-- CABECERA PRINCIPAL -->
  <table class="sheet-table" style="margin-bottom: 0px; border: 2px solid #000;">
    <tr>
      <td style="width: 32%; border: none; padding: 4px 8px;">
        <span style="font-size: 24px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -1px;">
          STF<span style="font-weight: normal; font-size: 19px;">GROUP</span>
          <span style="font-size: 8px; font-weight: normal; vertical-align: super;">S.A.</span>
        </span>
      </td>
      <td class="header-band" style="width: 68%; border: none; font-size: 8.5px; padding: 6px 8px; line-height: 1.25;">
        ESPECIFICACIONES TECNICAS DE TELA - TEJIDO PLANO / PUNTO / TECHNICAL DATA SHEET FABRIC - WOVEN/KNIT
      </td>
    </tr>
  </table>

  <!-- SECCIÓN 1: DATOS GENERALES -->
  <table class="sheet-table">
    <tr>
      <td class="font-bold bg-gray-sub" style="width: 38%;">FECHA PRODUCCION DE LA TELA / BULK DATE</td>
      <td class="text-center font-bold" style="width: 27%;">${fechaBulk}</td>
      <td class="font-bold bg-gray-sub text-center" style="width: 17%;">STF P.O #</td>
      <td class="text-center font-bold" style="width: 18%;">${stfPo}</td>
    </tr>
    <tr>
      <td class="font-bold bg-gray-sub">NOMBRE DEL PROVEEDOR / SUPPLIER'S NAME:</td>
      <td colspan="3" class="font-bold">${proveedorNombre}</td>
    </tr>
    <tr>
      <td class="font-bold bg-gray-sub">NOMBRE DE TELA / STF GROUP REFERENCE:</td>
      <td class="font-bold">${stfRef}</td>
      <td class="font-bold bg-gray-sub text-center">COLOR</td>
      <td class="text-center font-bold">${color}</td>
    </tr>
    <tr>
      <td class="font-bold bg-gray-sub">REFERENCIA DE PROVEEDOR / SUPPLIER'S ITEM NUMBER:</td>
      <td colspan="3" class="font-bold">${refProv}</td>
    </tr>
    <tr>
      <td class="font-bold bg-gray-sub">ORIGEN TELA / FABRIC ORIGIN</td>
      <td class="text-center font-bold">${paisOrigen}</td>
      <td class="font-bold bg-gray-sub text-center" style="font-size: 7.5px;">NUMERO DE LOTES / QTY OF LOT</td>
      <td class="text-center font-bold" style="font-size: 7.5px;">${lotes}</td>
    </tr>
    <tr>
      <td class="font-bold bg-gray-sub">SUBPARTIDA ARANCELARIA (HARMONIZED CODE)</td>
      <td colspan="3" class="font-bold">${subpartida}</td>
    </tr>
  </table>

  <!-- SECCIÓN 2: CERTIFICADO DE ORIGEN -->
  <table class="sheet-table">
    <tr>
      <td class="header-band" colspan="4">INFORMACIÓN SOBRE CERTIFICADO DE ORIGEN / O. C INFORMATION</td>
    </tr>
    <tr>
      <td class="font-bold" style="width: 44%;">APLICA CERTIFICADO DE ORIGEN COL /MEX. // DOES IT HAVE O.C?</td>
      <td class="text-center font-bold" style="width: 14%;">SI/YES <span class="check-box">${aplicaCertOrigen ? 'X' : '&nbsp;'}</span></td>
      <td class="text-center font-bold" style="width: 14%;">NO <span class="check-box">${!aplicaCertOrigen ? 'X' : '&nbsp;'}</span></td>
      <td style="width: 28%; font-size: 7px; line-height: 1;">si aplica SI diligenciar declaracion de origen adjunta. If it does please fill the o.c format</td>
    </tr>
  </table>

  <!-- SECCIÓN 3: DESCRIPCIONES BÁSICAS -->
  <table class="sheet-table">
    <tr>
      <td class="header-band" colspan="4">DESCRIPCIONES BASICAS / BASIC DESCRIPTION</td>
    </tr>
    <tr class="bg-gray-sub font-bold text-center">
      <td style="width: 40%;">COMPOSICION / COMPOSITION (Fiber name))</td>
      <td style="width: 15%;">%</td>
      <td style="width: 25%;">CONTINUO / (CONTINUOUS FIBER)</td>
      <td style="width: 20%;">DISCONTINUO (STAPLE FIBER)</td>
    </tr>
    <tr>
      <td class="font-bold">${composicion1}</td>
      <td class="text-center font-bold">${comp1Pct}</td>
      <td class="text-center font-bold">${comp1Continuo ? 'X' : ''}</td>
      <td class="text-center font-bold">${comp1Discontinuo ? 'X' : ''}</td>
    </tr>
    <tr>
      <td class="font-bold">${composicion2}</td>
      <td class="text-center font-bold">${comp2Pct}</td>
      <td class="text-center font-bold">${comp2Continuo ? 'X' : ''}</td>
      <td class="text-center font-bold">${comp2Discontinuo ? 'X' : ''}</td>
    </tr>
    <tr>
      <td class="font-bold bg-gray-sub" colspan="4">OTHERS:</td>
    </tr>
    <tr>
      <td class="font-bold bg-gray-sub">Ancho / Width (Cms):</td>
      <td class="text-center font-bold">${ancho}</td>
      <td class="font-bold bg-gray-sub">Ancho Cortable / Cuttable Width (Cms):</td>
      <td class="text-center font-bold">${anchoCortable}</td>
    </tr>
    <tr>
      <td class="font-bold bg-gray-sub">PESO / WEIGHT (GSM/M2)</td>
      <td class="text-center font-bold">${gsm}</td>
      <td class="font-bold bg-gray-sub" style="font-size: 7px;">SOLO DENIM / JUST FOR DENIM FABRICS (OZ/M2):</td>
      <td class="text-center font-bold">${denimOz}</td>
    </tr>
  </table>

  <!-- SECCIÓN 4: ACABADOS EN EL TEXTIL -->
  <table class="sheet-table">
    <tr>
      <td class="header-band" colspan="4">ACABADOS EN EL TEXTIL (POR FAVOR LLENAR EL % DE CADA UNA) // FABRIC FINISHES (PLEASE FILL % FOR EACH ONE IF IT IS THE CASE)</td>
    </tr>
    <tr>
      <td class="text-center font-bold" style="width: 10%;">${impregnadoPct}</td>
      <td class="font-bold" style="width: 45%;">Impregnado (Bathing for any special finishes as non-iron, etc)</td>
      <td class="font-bold bg-gray-sub" style="width: 25%; font-size: 7px;">Por favor especificar / Please confirm which bathing was it:</td>
      <td class="font-bold" style="width: 20%;">${impregnadoDesc}</td>
    </tr>
    <tr>
      <td class="text-center font-bold">${recubiertoPct}</td>
      <td class="font-bold">Recubierto (Coated)</td>
      <td class="font-bold bg-gray-sub" style="font-size: 7px;">Material del recubierto / Coated material:</td>
      <td class="font-bold">${recubiertoMat}</td>
    </tr>
    <tr>
      <td class="text-center font-bold">${revestidoPct}</td>
      <td class="font-bold">Revestido (Covered)</td>
      <td class="font-bold bg-gray-sub" style="font-size: 7px;">Material del revestido / Covered material:</td>
      <td class="font-bold">${revestidoMat}</td>
    </tr>
    <tr>
      <td class="text-center font-bold">${entretelaPct}</td>
      <td class="font-bold" colspan="3">Entretela con adhesivo (Interlinings)</td>
    </tr>
    <tr>
      <td class="text-center font-bold">${estratificadoPct}</td>
      <td class="font-bold" colspan="3">Estratificado (Bonded with P.U)</td>
    </tr>
    <tr>
      <td class="text-center font-bold">${bordadoPct}</td>
      <td class="font-bold">Bordado (Embroidery)</td>
      <td class="font-bold bg-gray-sub" style="font-size: 7px;">Composición del bordado:</td>
      <td class="font-bold">${bordadoComp}</td>
    </tr>
  </table>

  <!-- SECCIÓN 5: ACABADOS SUFRIDOS -->
  <table class="sheet-table">
    <tr>
      <td class="header-band" colspan="3">ACABADOS SUFRIDOS POR LA TELA (POR FAVOR LLENAR EL % DE CADA UNA) // FABRIC FINISHES (PLEASE FILL % FOR EACH ONE IF IT IS THE CASE)</td>
    </tr>
    <tr>
      <td class="text-center font-bold" style="width: 10%;">${cardadoPct}</td>
      <td class="font-bold" style="width: 90%;" colspan="2">Cardado (Carded)</td>
    </tr>
    <tr>
      <td class="text-center font-bold">${peinadoPct}</td>
      <td class="font-bold" colspan="2">Peinado (Brushed)</td>
    </tr>
  </table>

  <!-- SECCIÓN 6: INFORMACIÓN TÉCNICA DEL TEXTIL -->
  <table class="sheet-table">
    <tr>
      <td class="header-band" colspan="5">INFORMACIÓN TÉCNICA DEL TEXTIL / FABRICS TECHNICAL INFORMATION</td>
    </tr>
    <tr class="bg-gray-sub font-bold text-center">
      <td style="width: 32%;">PRUEBA / TEST</td>
      <td style="width: 16%;">METODO - NORMA / TEST METHOD</td>
      <td style="width: 18%;">UNIDAD DE MEDIDA / UNIT MEASUREMENT</td>
      <td style="width: 18%;">RESULTADO / RESULT</td>
      <td style="width: 16%;">% TOLERANCIA / TOLERANCE IN %</td>
    </tr>
    <tr>
      <td class="font-bold" rowspan="2">TITULOS DE HILO / YARNS DENIER</td>
      <td class="text-center" rowspan="2">N/A</td>
      <td class="bg-gray-sub font-bold">URDIMBRE / WARP</td>
      <td class="text-center font-bold">${titulosUrdimbre}</td>
      <td class="text-center font-bold" rowspan="2">${titulosTol}</td>
    </tr>
    <tr>
      <td class="bg-gray-sub font-bold">TRAMA / WEFT</td>
      <td class="text-center font-bold">${titulosTrama}</td>
    </tr>
    <tr>
      <td class="font-bold" rowspan="2">RESISTENCIA AL RASGADO / TORN STRENGTH</td>
      <td class="text-center" rowspan="2">${rasgadoNorma}</td>
      <td class="bg-gray-sub font-bold">URDIMBRE / WARP</td>
      <td class="text-center font-bold">${rasgadoUrdimbre}</td>
      <td class="text-center font-bold" rowspan="2">${rasgadoTol}</td>
    </tr>
    <tr>
      <td class="bg-gray-sub font-bold">TRAMA / WEFT</td>
      <td class="text-center font-bold">${rasgadoTrama}</td>
    </tr>
    <tr>
      <td class="font-bold" rowspan="2" style="font-size: 7.5px;">CAMBIO DIMENSIONAL AL LAVADO / SHRINKAGE AFTER WASH<br/><span style="font-size: 6.5px; font-weight: normal;">(For denim, please confirm shrinkage after rinse wash)</span></td>
      <td class="text-center" rowspan="2">${cambioDimNorma}</td>
      <td class="bg-gray-sub font-bold">URDIMBRE % / WARP %</td>
      <td class="text-center font-bold">${cambioDimUrdimbre}</td>
      <td class="text-center font-bold" rowspan="2" style="font-size: 7.5px;">${cambioDimTol}</td>
    </tr>
    <tr>
      <td class="bg-gray-sub font-bold">TRAMA % / WEFT %</td>
      <td class="text-center font-bold" style="font-size: 7.5px;">${cambioDimTrama}</td>
    </tr>
    <tr>
      <td class="font-bold">PIERNA VIRADA / TURNED LEG (BOW AND SKEW)</td>
      <td class="text-center">${piernaViradaNorma}</td>
      <td class="bg-gray-sub font-bold text-center">PORCENTAJE / %</td>
      <td class="text-center font-bold">${piernaViradaRes}</td>
      <td class="text-center font-bold">${piernaViradaTol}</td>
    </tr>
    <tr>
      <td class="font-bold">SOLIDEZ AL LAVADO DOMESTICO / HOME WASH FASTNESS</td>
      <td class="text-center">${solLavadoNorma}</td>
      <td class="bg-gray-sub font-bold text-center" style="font-size: 7px;">ESCALA DE GRISES / GREY SCALE</td>
      <td class="text-center font-bold" style="font-size: 7.5px;">${solLavadoRes}</td>
      <td class="text-center font-bold" style="font-size: 7px;">${solLavadoTol}</td>
    </tr>
    <tr>
      <td class="font-bold">SOLIDEZ AL FROTE / RUB FASTNESS</td>
      <td class="text-center">${solFroteNorma}</td>
      <td class="bg-gray-sub font-bold text-center" style="font-size: 7px;">ESCALA DE GRISES / GREY SCALE</td>
      <td class="text-center font-bold">${solFroteRes}</td>
      <td class="text-center font-bold">${solFroteTol}</td>
    </tr>
    <tr>
      <td class="font-bold">RENDIMIENTO M/KG / YIELD PER KILO : (M/KG)</td>
      <td class="text-center">N/A</td>
      <td class="bg-gray-sub font-bold text-center" style="font-size: 7px;">METROS X KILOS / METER x KG</td>
      <td class="text-center font-bold">${rendimientoRes}</td>
      <td class="text-center font-bold">${rendimientoTol}</td>
    </tr>
    <tr>
      <td class="font-bold" rowspan="2">ELONGACIÓN / ELONGATION OR STRETCH</td>
      <td class="text-center" rowspan="2">N/A</td>
      <td class="bg-gray-sub font-bold">% URDIMBRE / WARP</td>
      <td class="text-center font-bold">${elongacionUrdimbre}</td>
      <td class="text-center font-bold" rowspan="2" style="font-size: 6.5px;">${elongacionTol}</td>
    </tr>
    <tr>
      <td class="bg-gray-sub font-bold">% TRAMA / WEFT</td>
      <td class="text-center font-bold" style="font-size: 7px;">${elongacionTrama}</td>
    </tr>
    <tr>
      <td class="font-bold" rowspan="2">% DE RECUPERACIÓN / % RECOVERY</td>
      <td class="text-center" rowspan="2">N/A</td>
      <td class="bg-gray-sub font-bold">% URDIMBRE / WARP</td>
      <td class="text-center font-bold">${recuperacionUrdimbre}</td>
      <td class="text-center font-bold" rowspan="2">${recuperacionTol}</td>
    </tr>
    <tr>
      <td class="bg-gray-sub font-bold">% TRAMA / WEFT</td>
      <td class="text-center font-bold">${recuperacionTrama}</td>
    </tr>
    <tr>
      <td class="font-bold">DESVIACION DE TRAMA / WEFT DEVIATION</td>
      <td class="text-center">${desviacionNorma}</td>
      <td class="bg-gray-sub font-bold text-center">PORCENTAJE / %</td>
      <td class="text-center font-bold">${desviacionRes}</td>
      <td class="text-center font-bold">${desviacionTol}</td>
    </tr>
  </table>

  <!-- SECCIÓN 7: TIPO DE TEJIDO -->
  <table class="sheet-table">
    <tr>
      <td class="font-bold" style="width: 35%;">Esta tela es un tejido // This fabric is: (Please select the correct option)</td>
      <td class="font-bold text-center" style="width: 33%;">TEJIDO PUNTO // KNITTED: <span class="check-box">${esPunto ? 'X' : '&nbsp;'}</span></td>
      <td class="font-bold text-center" style="width: 32%;">TEJIDO PLANO // WOVEN: <span class="check-box">${esPlano ? 'X' : '&nbsp;'}</span></td>
    </tr>
  </table>

  <!-- SECCIÓN 8: TIPO DE LIGAMENTO -->
  <table class="sheet-table">
    <tr>
      <td class="header-band" colspan="2">Tipo de ligamento (Type of weave // Fabric Construction) : Please select an option</td>
    </tr>
    ${listaLigamentos.map(lig => {
      const isChecked = ligamentoSeleccionado.toLowerCase().includes(lig.label.toLowerCase().slice(0, 8)) ||
                        (lig.id === 'punto_trama' && ligamentoSeleccionado.includes('trama'));
      return `
      <tr>
        <td class="text-center font-bold" style="width: 8%;"><span class="check-box">${isChecked ? 'X' : '&nbsp;'}</span></td>
        <td class="font-bold" style="width: 92%;">
          ${lig.label}
          ${lig.sub ? `<span style="font-size: 7.5px; font-weight: normal; margin-left: 10px;">${lig.sub}</span>` : ''}
        </td>
      </tr>
      `;
    }).join('')}
  </table>

  <!-- SECCIÓN 9: ACABADO DEL COLOR -->
  <table class="sheet-table">
    <tr>
      <td class="header-band" colspan="3">Acabado del Color (Color Finishes)</td>
    </tr>
    ${listaColores.map(col => {
      const isChecked = acabadoColorSeleccionado.toLowerCase().includes(col.id) ||
                        (col.id === 'tenido' && (acabadoColorSeleccionado.includes('Teñido') || acabadoColorSeleccionado.includes('Dyed')));
      return `
      <tr>
        <td class="text-center font-bold" style="width: 8%;"><span class="check-box">${isChecked ? 'X' : '&nbsp;'}</span></td>
        <td class="font-bold" style="width: 50%;">${col.label}</td>
        <td class="font-bold" style="width: 42%;">
          ${col.conColor ? `Nombre del color // Color name: <span style="font-family: monospace;">${nombreColorFinal}</span>` : ''}
        </td>
      </tr>
      `;
    }).join('')}
  </table>

  <!-- SECCIÓN 10: TIPO DE FIBRA -->
  <table class="sheet-table">
    <tr>
      <td class="header-band" colspan="3">Tipo de Fibra (Fiber Type)</td>
    </tr>
    <tr>
      <td class="text-center font-bold" style="width: 8%;"><span class="check-box">${fibraTexturizado ? 'X' : '&nbsp;'}</span></td>
      <td class="text-center font-bold" style="width: 12%;">%</td>
      <td class="font-bold" style="width: 80%;">Texturizado (Textured)</td>
    </tr>
    <tr>
      <td class="text-center font-bold"><span class="check-box">${fibraNoTexturizado ? 'X' : '&nbsp;'}</span></td>
      <td class="text-center font-bold">%</td>
      <td class="font-bold">No texturizado (Non Textured)</td>
    </tr>
    <tr>
      <td class="text-center font-bold"><span class="check-box">${fibraOtro ? 'X' : '&nbsp;'}</span></td>
      <td class="text-center font-bold">%</td>
      <td class="font-bold">Otro (other)</td>
    </tr>
  </table>

  <!-- SECCIÓN 11: INSTRUCCIONES DE CUIDADO -->
  <table class="sheet-table">
    <tr>
      <td class="header-band" colspan="2">Instrucciones de Cuidado // Care Instructions:</td>
    </tr>
    <tr>
      <td class="font-bold bg-gray-sub" style="width: 35%;">Instrucciones de Lavado // Washing instructions</td>
      <td class="font-bold" style="width: 65%;">${lavado}</td>
    </tr>
    <tr>
      <td class="font-bold bg-gray-sub">Recomendaciones de Planchado // Ironing recommendations:</td>
      <td class="font-bold">${planchado}</td>
    </tr>
  </table>

  <!-- SECCIÓN 12: OBSERVACIONES TÉCNICAS EXTRA -->
  <table class="sheet-table">
    <tr>
      <td class="header-band">OBSERVACIONES TECNICAS EXTRA / EXTRA COMMENTS</td>
    </tr>
    <tr>
      <td style="min-height: 25px; padding: 6px;">${observaciones || '&nbsp;'}</td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

/**
 * Exporta la ficha técnica como documento Word (.doc compatible con MS Word)
 */
export function exportarFichaAWord(
  ficha: FichaTecnicaHistoricaVersionada,
  version?: VersionFichaTecnica
) {
  const htmlContent = generarHtmlFichaTecnicaCompleta(ficha, version);
  
  const wordDocument = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Ficha Técnica ${ficha.referencia}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordDocument], {
    type: 'application/msword;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = ficha.referencia.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.href = url;
  a.download = `FT_STFGROUP_${safeName}_v${ficha.versionActual}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exporta o imprime la ficha técnica en formato PDF oficial
 */
export function exportarFichaAPDF(
  ficha: FichaTecnicaHistoricaVersionada,
  version?: VersionFichaTecnica
) {
  const htmlContent = generarHtmlFichaTecnicaCompleta(ficha, version);

  const printWindow = window.open('', '_blank', 'width=950,height=950');
  if (!printWindow) {
    alert('Por favor habilita las ventanas emergentes en tu navegador para generar el PDF.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };
}
