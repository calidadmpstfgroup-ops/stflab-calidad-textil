import { FichaTecnicaHistoricaVersionada, VersionFichaTecnica } from '../types';

/**
 * Genera el documento HTML completo con el diseño idéntico al PDF de STF GROUP:
 * "ESPECIFICACIONES TECNICAS DE TELA - TEJIDO PLANO / PUNTO / TECHNICAL DATA SHEET FABRIC - WOVEN/KNIT"
 */
export function generarHtmlFichaTecnicaCompleta(
  ficha: FichaTecnicaHistoricaVersionada,
  version?: VersionFichaTecnica
): string {
  const v = version || ficha.historialVersiones[ficha.historialVersiones.length - 1];
  const esp = v?.especificaciones || {} as any;

  const fechaBulk = esp.fechaProduccion || ficha.createdAt || 'N/A';
  const stfPo = esp.stfPoNumber || esp.numeroOrdenCompraSTF || 'N/A';
  const proveedorNombre = esp.nombreEmpresa || ficha.proveedor || 'N/A';
  const stfRef = esp.referenciaSTF || esp.nombreComercialTela || ficha.referencia || 'N/A';
  const color = esp.colorShade || 'N/A';
  const refProv = esp.referenciaProveedor || ficha.referenciaProveedor || 'N/A';
  const paisOrigen = esp.paisOrigen || esp.paisEmpresa || ficha.paisOrigen || 'N/A';
  const lotes = esp.numeroLoteProduccion || 'N/A';
  const subpartida = esp.subpartidaArancelaria || 'N/A';

  const aplicaCertOrigen = esp.aplicaCertificadoOrigen === true || 
    (esp.aplicaCertificadoOrigen as any) === 'SI';

  // Composición
  const composicionTexto = esp.composicion || 'N/A';
  const continuo = esp.tipoFibraFilamento?.toLowerCase().includes('continuo') || esp.continuoDiscontinuoCortada === 'Continuo';
  const discontinuo = esp.tipoFibraFilamento?.toLowerCase().includes('discontinuo') || esp.continuoDiscontinuoCortada === 'Discontinuo';

  // Ancho y Peso
  const ancho = esp.anchoTotalM ? Math.round(esp.anchoTotalM * 100) : (esp.anchoUtilM ? Math.round(esp.anchoUtilM * 100) : 'N/A');
  const anchoCortable = esp.anchoUtilM ? Math.round(esp.anchoUtilM * 100) : 'N/A';
  const gsm = esp.gramajeDeclaradoGsm || 'N/A';
  const denimOz = esp.pesoDenimOz || 'N/A';

  // Tipo de Tejido
  const esPunto = esp.tipoTejido === 'Punto' || (ficha.referencia || '').toLowerCase().includes('punto') || (ficha.referencia || '').toLowerCase().includes('crepe');
  const esPlano = !esPunto;

  // Ensayos
  const encLargo = esp.encogimientoLargoMax !== undefined ? `${esp.encogimientoLargoMax}%` : 'N/A';
  const encAncho = esp.encogimientoAnchoMax !== undefined ? `${esp.encogimientoAnchoMax}%` : 'N/A';
  const solLavado = esp.solidezLavadoMin !== undefined ? `Grado ${esp.solidezLavadoMin}` : 'N/A';
  const solFroteSeco = esp.solidezFroteSecoMin !== undefined ? `Grado ${esp.solidezFroteSecoMin}` : 'N/A';
  const solFroteHum = esp.solidezFroteHumedoMin !== undefined ? `Grado ${esp.solidezFroteHumedoMin}` : 'N/A';
  const rendimiento = esp.rendimientoMkg ? `${esp.rendimientoMkg}` : 'N/A';
  const viro = esp.viroMax !== undefined ? `${esp.viroMax}%` : 'N/A';
  const tituloUrdimbre = esp.tituloHiloUrdimbre || 'N/A';
  const tituloTrama = esp.tituloHiloTrama || 'N/A';

  // Cuidados
  const lavado = esp.lavadoSugerido || esp.instruccionesLavadoSugerido || 'Machine Wash Cold, Normal Cycle, Separately, Do Not bleach, tumble dry low';
  const planchado = esp.recomendacionesPlanchado || 'Do not Iron.';
  const observaciones = esp.observacionesFabricante || (esp as any).observacionesTecnicasGenerales || 'Sin observaciones técnicas adicionales.';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>STF GROUP - Ficha Técnica ${stfRef}</title>
  <style>
    @page {
      size: letter portrait;
      margin: 10mm;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9px;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 10px;
      line-height: 1.2;
    }
    .header-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 2px solid #000;
      padding: 6px 12px;
      margin-bottom: 4px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -1px;
      font-family: 'Arial Black', Arial, sans-serif;
    }
    .doc-title {
      font-size: 11px;
      font-weight: bold;
      text-align: right;
      line-height: 1.3;
    }
    table.stf-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 4px;
      table-layout: fixed;
    }
    table.stf-table th, table.stf-table td {
      border: 1px solid #000;
      padding: 3px 5px;
      font-size: 8.5px;
      vertical-align: middle;
      word-wrap: break-word;
    }
    .bg-header {
      background-color: #000;
      color: #fff;
      font-weight: bold;
      text-align: center;
      font-size: 8.5px;
      text-transform: uppercase;
      padding: 3px;
    }
    .bg-sub {
      background-color: #e5e7eb;
      font-weight: bold;
    }
    .label-cell {
      font-weight: bold;
      font-size: 8px;
    }
    .value-cell {
      font-weight: bold;
      font-size: 9px;
    }
    .center {
      text-align: center;
    }
    .bold {
      font-weight: bold;
    }
    .section-title {
      background: #000;
      color: #fff;
      font-weight: bold;
      text-align: center;
      font-size: 9px;
      padding: 3px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .checkbox-box {
      display: inline-block;
      width: 13px;
      height: 13px;
      border: 1px solid #000;
      text-align: center;
      line-height: 12px;
      font-weight: bold;
      font-size: 10px;
      margin-left: 4px;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <!-- CABECERA PRINCIPAL -->
  <table class="stf-table" style="margin-bottom: 0px; border: 2px solid #000;">
    <tr>
      <td style="width: 35%; border: none; padding: 6px 10px;">
        <span class="brand-title">STF<span style="font-weight: normal; font-size: 20px;">GROUP</span></span>
      </td>
      <td class="bg-header" style="width: 65%; border: none; font-size: 10px; padding: 8px; text-align: center;">
        ESPECIFICACIONES TECNICAS DE TELA - TEJIDO PLANO / PUNTO / TECHNICAL DATA SHEET FABRIC - WOVEN/KNIT
      </td>
    </tr>
  </table>

  <!-- SECCIÓN 1: IDENTIFICACIÓN GENERAL -->
  <table class="stf-table">
    <tr>
      <td class="label-cell" style="width: 35%;">FECHA PRODUCCION DE LA TELA / BULK DATE</td>
      <td class="value-cell center" style="width: 25%;">${fechaBulk}</td>
      <td class="label-cell center" style="width: 20%;">STF P.O #</td>
      <td class="value-cell center" style="width: 20%;">${stfPo}</td>
    </tr>
    <tr>
      <td class="label-cell">NOMBRE DEL PROVEEDOR / SUPPLIER'S NAME:</td>
      <td class="value-cell" colspan="3">${proveedorNombre}</td>
    </tr>
    <tr>
      <td class="label-cell">NOMBRE DE TELA / STF GROUP REFERENCE</td>
      <td class="value-cell">${stfRef}</td>
      <td class="label-cell center">COLOR</td>
      <td class="value-cell center">${color}</td>
    </tr>
    <tr>
      <td class="label-cell">REFERENCIA DE PROVEEDOR / SUPPLIER´S ITEM NUMBER:</td>
      <td class="value-cell" colspan="3">${refProv}</td>
    </tr>
    <tr>
      <td class="label-cell">ORIGEN TELA / FABRIC ORIGIN</td>
      <td class="value-cell center">${paisOrigen}</td>
      <td class="label-cell center">NUMERO DE LOTES / QTY OF LOTS</td>
      <td class="value-cell center">${lotes}</td>
    </tr>
    <tr>
      <td class="label-cell">SUBPARTIDA ARANCELARIA (HARMONIZED CODE)</td>
      <td class="value-cell" colspan="3">${subpartida}</td>
    </tr>
  </table>

  <!-- SECCIÓN 2: CERTIFICADO DE ORIGEN -->
  <table class="stf-table">
    <tr>
      <td class="section-title" colspan="4">INFORMACION SOBRE CERTIFICADO DE ORIGEN / O. C INFORMATION</td>
    </tr>
    <tr>
      <td class="label-cell" style="width: 45%;">APLICA CERTIFICADO DE ORIGEN COL /MEX. // DOES IT HAVE O.C?</td>
      <td class="center bold" style="width: 15%;">SI/YES: <span class="checkbox-box">${aplicaCertOrigen ? 'X' : '&nbsp;'}</span></td>
      <td class="center bold" style="width: 15%;">NO: <span class="checkbox-box">${!aplicaCertOrigen ? 'X' : '&nbsp;'}</span></td>
      <td style="width: 25%; font-size: 7.5px; line-height: 1;">si aplica SI diligenciar declaracion de origen adjunta. If it does please fill the o.c format</td>
    </tr>
  </table>

  <!-- SECCIÓN 3: DESCRIPCIONES BÁSICAS -->
  <table class="stf-table">
    <tr>
      <td class="section-title" colspan="4">DESCRIPCIONES BASICAS / BASIC DESCRIPTION</td>
    </tr>
    <tr class="bg-sub">
      <td class="center bold" style="width: 45%;">COMPOSICION / COMPOSITION (Fiber name)</td>
      <td class="center bold" style="width: 15%;">%</td>
      <td class="center bold" style="width: 20%;">CONTINUO / (CONTINUOUS FIBER)</td>
      <td class="center bold" style="width: 20%;">DISCONTINUO (STAPLE FIBER)</td>
    </tr>
    <tr>
      <td class="bold">${composicionTexto}</td>
      <td class="center bold">100%</td>
      <td class="center bold">${continuo ? 'X' : ''}</td>
      <td class="center bold">${discontinuo ? 'X' : ''}</td>
    </tr>
    <tr>
      <td class="label-cell">Ancho / Width (cms) :</td>
      <td class="center bold">${ancho}</td>
      <td class="label-cell">Ancho Cortable / Cuttable Width (Cms):</td>
      <td class="center bold">${anchoCortable}</td>
    </tr>
    <tr>
      <td class="label-cell">PESO / WEIGHT (GSM/M2)</td>
      <td class="center bold">${gsm}</td>
      <td class="label-cell">SOLO DENIM / JUST FOR DENIM FABRICS (OZ/M2)</td>
      <td class="center bold">${denimOz}</td>
    </tr>
  </table>

  <!-- SECCIÓN 4: ACABADOS EN EL TEXTIL -->
  <table class="stf-table">
    <tr>
      <td class="section-title" colspan="4">ACABADOS EN EL TEXTIL (POR FAVOR LLENAR EL % DE CADA UNA) // FABRIC FINISHES</td>
    </tr>
    <tr>
      <td class="label-cell" style="width: 25%;">Impregnado (Bathing for special finishes)</td>
      <td class="bold center" style="width: 15%;">${esp.acabadosTextiles || '100% SOFTENER'}</td>
      <td class="label-cell" style="width: 25%;">Por favor especificar / Please confirm bathing:</td>
      <td class="bold" style="width: 35%;">${esp.acabadosTextiles || 'Suavizado Estándar Textil'}</td>
    </tr>
    <tr>
      <td class="label-cell">Recubierto (Coated)</td>
      <td class="center">N/A</td>
      <td class="label-cell">Material del recubierto / Coated material:</td>
      <td>N/A</td>
    </tr>
    <tr>
      <td class="label-cell">Revestido (Covered)</td>
      <td class="center">N/A</td>
      <td class="label-cell">Material del revestido / Covered material:</td>
      <td>N/A</td>
    </tr>
  </table>

  <!-- SECCIÓN 5: INFORMACIÓN TÉCNICA DEL TEXTIL -->
  <table class="stf-table">
    <tr>
      <td class="section-title" colspan="5">INFORMACIÓN TÉCNICA DEL TEXTIL / FABRICS TECHNICAL INFORMATION</td>
    </tr>
    <tr class="bg-sub center bold">
      <td style="width: 32%;">PRUEBA / TEST</td>
      <td style="width: 18%;">METODO - NORMA / TEST METHOD</td>
      <td style="width: 18%;">UNIDAD DE MEDIDA / UNIT MEASUREMENT</td>
      <td style="width: 16%;">RESULTADO / RESULT</td>
      <td style="width: 16%;">% TOLERANCIA / TOLERANCE IN %</td>
    </tr>
    <tr>
      <td class="bold" rowspan="2">TITULOS DE HILO / YARNS DENIER</td>
      <td class="center" rowspan="2">Norma de Fabricante</td>
      <td class="label-cell">URDIMBRE / WARP</td>
      <td class="center bold">${tituloUrdimbre}</td>
      <td class="center">± 5%</td>
    </tr>
    <tr>
      <td class="label-cell">TRAMA / WEFT</td>
      <td class="center bold">${tituloTrama}</td>
      <td class="center">± 5%</td>
    </tr>
    <tr>
      <td class="bold">RESISTENCIA AL RASGADO / TORN STRENGTH</td>
      <td class="center">ASTM D1424</td>
      <td class="center">URDIMBRE / TRAMA (g)</td>
      <td class="center bold">${esp.resistenciaDesgarreMin || 'Conforme'}</td>
      <td class="center">Mínimo Norma</td>
    </tr>
    <tr>
      <td class="bold" rowspan="2">CAMBIO DIMENSIONAL AL LAVADO / SHRINKAGE AFTER WASH</td>
      <td class="center" rowspan="2">AATCC 135</td>
      <td class="label-cell">URDIMBRE % / WARP %</td>
      <td class="center bold">${encLargo}</td>
      <td class="center">Máx -3.0%</td>
    </tr>
    <tr>
      <td class="label-cell">TRAMA % / WEFT %</td>
      <td class="center bold">${encAncho}</td>
      <td class="center">Máx -4.0%</td>
    </tr>
    <tr>
      <td class="bold">PIERNA VIRADA / TURNED LEG (BOW AND SKEW)</td>
      <td class="center">AATCC 179</td>
      <td class="center">PORCENTAJE / %</td>
      <td class="center bold">${viro}</td>
      <td class="center">Máx 3.0%</td>
    </tr>
    <tr>
      <td class="bold">SOLIDEZ AL LAVADO DOMESTICO / HOME WASH FASTNESS</td>
      <td class="center">ISO 105 A03</td>
      <td class="center">ESCALA DE GRISES / GREY SCALE</td>
      <td class="center bold">${solLavado}</td>
      <td class="center">≥ Grado 4.0</td>
    </tr>
    <tr>
      <td class="bold">SOLIDEZ AL FROTE / RUB FASTNESS</td>
      <td class="center">AATCC 8-2001</td>
      <td class="center">SECO / HÚMEDO</td>
      <td class="center bold">Seco: ${solFroteSeco} | Húm: ${solFroteHum}</td>
      <td class="center">Dry ≥4 | Wet ≥3</td>
    </tr>
    <tr>
      <td class="bold">RENDIMIENTO M/KG / YIELD PER KILO</td>
      <td class="center">Cálculo Metrológico</td>
      <td class="center">METROS X KILOS / (M/KG)</td>
      <td class="center bold">${rendimiento}</td>
      <td class="center">± 5%</td>
    </tr>
    <tr>
      <td class="bold">DESVIACION DE TRAMA / WEFT DEVIATION</td>
      <td class="center">ASTM 3882-99</td>
      <td class="center">PORCENTAJE / %</td>
      <td class="center bold">${esp.desviacionTramaMax ? `${esp.desviacionTramaMax}%` : 'N/A'}</td>
      <td class="center">Máx 2.5%</td>
    </tr>
  </table>

  <!-- SECCIÓN 6: TIPO DE LIGAMENTO, COLOR Y FIBRA -->
  <table class="stf-table">
    <tr>
      <td class="section-title" colspan="4">TIPO DE TEJIDO, LIGAMENTO Y ACABADO DEL COLOR</td>
    </tr>
    <tr>
      <td class="label-cell" colspan="2">Esta tela es un tejido // This fabric is:</td>
      <td class="bold center">TEJIDO PUNTO // KNITTED: <span class="checkbox-box">${esPunto ? 'X' : '&nbsp;'}</span></td>
      <td class="bold center">TEJIDO PLANO // WOVEN: <span class="checkbox-box">${esPlano ? 'X' : '&nbsp;'}</span></td>
    </tr>
    <tr>
      <td class="label-cell">Tipo de Ligamento:</td>
      <td class="bold">${esp.tipoLigamento || (esPunto ? 'Tejido de punto por trama' : 'Tafetán / Sarga')}</td>
      <td class="label-cell">Acabado del Color:</td>
      <td class="bold">${esp.acabadoColorTintoreria || 'Teñido (Dyed)'}</td>
    </tr>
    <tr>
      <td class="label-cell">Tipo de Fibra:</td>
      <td class="bold">${esp.tipoFibraTexturizado || 'Texturizado (Textured)'}</td>
      <td class="label-cell">Nombre del Color:</td>
      <td class="bold">${color}</td>
    </tr>
  </table>

  <!-- SECCIÓN 7: CUIDADOS Y OBSERVACIONES -->
  <table class="stf-table">
    <tr>
      <td class="section-title" colspan="2">INSTRUCCIONES DE CUIDADO // CARE INSTRUCTIONS & OBSERVACIONES</td>
    </tr>
    <tr>
      <td class="label-cell" style="width: 30%;">Instrucciones de Lavado // Washing instructions:</td>
      <td class="bold" style="width: 70%;">${lavado}</td>
    </tr>
    <tr>
      <td class="label-cell">Recomendaciones de Planchado // Ironing recommendations:</td>
      <td class="bold">${planchado}</td>
    </tr>
    <tr>
      <td class="label-cell">OBSERVACIONES TECNICAS EXTRA / EXTRA COMMENTS:</td>
      <td style="font-size: 8.5px;">${observaciones}</td>
    </tr>
  </table>

  <!-- PIE DE PÁGINA OFICIAL -->
  <div style="margin-top: 10px; border-top: 1px dashed #666; padding-top: 5px; display: flex; justify-content: space-between; font-size: 8px; color: #444;">
    <span>STFLAB - CONTROL DE CALIDAD Y LABORATORIO TEXTIL | STF GROUP S.A.</span>
    <span>DOCUMENTO TÉCNICO OFICIAL | Versión v${v?.version || 1} (${v?.fechaVersion || fechaBulk})</span>
  </div>

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
  
  // Encabezado Word XML para compatibilidad nativa con Microsoft Word
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
 * Exporta o imprime la ficha técnica en formato PDF oficial de alta resolución
 */
export function exportarFichaAPDF(
  ficha: FichaTecnicaHistoricaVersionada,
  version?: VersionFichaTecnica
) {
  const htmlContent = generarHtmlFichaTecnicaCompleta(ficha, version);

  const printWindow = window.open('', '_blank', 'width=900,height=900');
  if (!printWindow) {
    alert('Por favor habilita las ventanas emergentes en tu navegador para generar el PDF.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Esperar a que el contenido cargue para invocar el diálogo de impresión / Guardar como PDF
  printWindow.onload = () => {
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };
}
