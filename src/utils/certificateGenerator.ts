/**
 * Generador de Certificados Técnicos e Informes Oficiales STFLab
 * Formato Oficial STF GROUP - DMP-F-001 V01-2021 (Página 1 y Página 2)
 */

export function evaluateMuestraParametros(m: any) {
  const encLargo = parseFloat(String(m?.pruebas?.encogimientoLargo || m?.pruebas?.encogimientoMedido || -2.0));
  const encAncho = parseFloat(String(m?.pruebas?.encogimientoAncho || -2.0));
  const gramaje = parseFloat(String(m?.pruebas?.gramajeMedido || m?.fichaTecnica?.gramajeEsperado || 200));
  const ancho = parseFloat(String(m?.pruebas?.anchoMedido || m?.fichaTecnica?.anchoEsperado || 1.48));

  return {
    encLargo,
    encAncho,
    gramaje,
    ancho,
    aprobado: m?.resultadoFinal === 'Aprobado' || m?.resultadoFinal === 'APROBADO' || m?.dictamen === 'APROBADO',
    conObservacion: m?.resultadoFinal === 'Hallazgo' || m?.resultadoFinal === 'HALLAZGO'
  };
}

export function generateCertificateHTML(m: any): string {
  const ev = m?.evaluacionTecnica || {};
  const fecha = m?.fechaIngreso || ev?.fechaIngreso || new Date().toLocaleDateString('es-CO');
  const referencia = m?.referencia || ev?.referencia || 'TELA ALGODÓN STRECH SNOW JOYTEX';
  const proveedor = m?.proveedor || ev?.proveedor || 'SHANGHAI JOY TEX CO LTD';
  const color = m?.color || ev?.color || '020 - NEGRO';
  const ocCol = m?.ocCol || m?.ordenCompra || ev?.ocCol || 'OAC 1107';
  const solicitud = m?.solicitudCompra || ev?.solicitudCompra || 'SOL-comp';
  const consecutivo = ev?.consecutivoEnsayo || m?.consecutivoEnsayo || 'PENDIENTE';
  const loteProveedor = ev?.loteProveedor || m?.nroLote || ocCol;
  const rollo = ev?.rollo || m?.rollo || '1';
  const composicion = m?.composicion || ev?.composicion || 'Por verificar';
  const codigoMaterial = ev?.codigoMaterial || 'N/A';
  const importacion = ev?.importacion || 'Col';
  const shp = ev?.shp || ocCol;

  // Valores de ensayos
  const gramajeMed = ev?.gramaje?.medidoLab ?? m?.pruebas?.gramajeMedido ?? 230;
  const pesoLinealMed = ev?.pesoLineal?.medidoLab ?? 322;
  const anchoTotMed = ev?.anchoTotal?.medidoLab ?? 1.50;
  const anchoUtMed = ev?.anchoUtil?.medidoLab ?? 1.47;
  const rendMed = ev?.rendimiento?.medidoLab ?? (ev?.gramaje?.medidoLab ? parseFloat((1000 / ev.gramaje.medidoLab).toFixed(2)) : '');
  const encAnchoMed = ev?.encogimientoAncho?.medidoLab ?? -3.5;
  const encLargoMed = ev?.encogimientoLargo?.medidoLab ?? -2.2;
  const elongAnchoMed = ev?.elongacionAncho?.medidoLab ?? 17.5;
  const elongLargoMed = ev?.elongacionLargo?.medidoLab ?? 4.2;
  const desvTramaMed = ev?.desviacionTrama?.medidoLab ?? 1.2;
  const torqueMed = ev?.torqueViroPierna?.medidoLab ?? 1.5;
  const tensionMed = ev?.resistenciaTension?.medidoLab ?? 38.0;
  const desgarreMed = ev?.resistenciaDesgarre?.medidoLab ?? 1950;
  const deslizamientoMed = ev?.deslizamientoCostura?.medidoLab ?? 3.5;
  const pillingMed = ev?.resistenciaPilling?.medidoLab ?? 4.0;
  const solLavadoMed = ev?.solidezLavadoDomestico?.medidoLab ?? 4.5;
  const solFroteHumMed = ev?.solidezFroteHumedo?.medidoLab ?? 3.5;
  const solFroteSecoMed = ev?.solidezFroteSeco?.medidoLab ?? 4.0;
  const cambioColorMed = ev?.cambioColor?.medidoLab ?? 4.0;
  const fusionadoRes = ev?.pruebaFusionado?.resultado || 'CONFORME';

  // Tintorería y Rollos (Página 2)
  const tint = ev?.evaluacionTintoreria || {};
  const solFroteSecoT = tint?.solidezFroteSeco?.valorMedido || '4.0 (CUMPLE)';
  const solFroteHumT = tint?.solidezFroteHumedo?.valorMedido || '3.5 (CUMPLE)';
  const solLavadoT = tint?.solidezLavadoDomestico?.valorMedido || '4.0 (CUMPLE)';
  const solLavado2AT = tint?.solidezLavado2A?.valorMedido || '4.0 (CUMPLE)';
  const cambioColorPostT = tint?.cambioColorPostLavado?.valorMedido || '4.0 (CUMPLE)';
  const aptoCombinar = tint?.aptoCombinarPrendas || '⚠️ NO - REQUIERE PRECAUCIÓN DE LAVADO';
  const compFrote = tint?.comportamientoFrote || '✅ SOLIDEZ ESTABLE AL FROTE';

  const matrizRollos = tint?.matrizRollos || [
    { rolloNo: '001', loteTintoreria: loteProveedor, tonoEvaluado: `${color} (Standard)`, deltaE: 'DE = 0.25 (Excelente)', dictamenRollo: 'APROBADO' },
    { rolloNo: '002', loteTintoreria: loteProveedor, tonoEvaluado: `${color} (Subtono A)`, deltaE: 'DE = 0.42 (Tolerable)', dictamenRollo: 'APROBADO' },
    { rolloNo: '003', loteTintoreria: loteProveedor, tonoEvaluado: `${color} (Standard)`, deltaE: 'DE = 0.18 (Excelente)', dictamenRollo: 'APROBADO' }
  ];

  const dictamenFinal = (m?.dictamen || ev?.dictamenFinal || 'RECHAZADO').toUpperCase();
  const esAprobado = dictamenFinal === 'APROBADO';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>STFLab - Reporte de Calidad Oficial - ${referencia}</title>
  <style>
    @page {
      size: letter portrait;
      margin: 8mm 10mm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 10px;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 100%;
      box-sizing: border-box;
      page-break-after: always;
      margin-bottom: 20px;
    }
    .page:last-child {
      page-break-after: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0px;
    }
    th, td {
      border: 1px solid #000;
      padding: 3px 5px;
      vertical-align: middle;
    }
    .header-logo {
      background: #fff;
      font-weight: 900;
      font-size: 20px;
      font-family: Arial, sans-serif;
      letter-spacing: -1px;
      text-align: center;
      width: 25%;
    }
    .header-logo span {
      font-size: 12px;
      font-weight: normal;
    }
    .header-title {
      text-align: center;
      font-weight: bold;
      font-size: 12px;
      width: 45%;
    }
    .header-right {
      width: 30%;
      font-size: 9px;
      font-weight: bold;
    }
    .bg-light-gray {
      background-color: #f2f2f2;
    }
    .bg-yellow-header {
      background-color: #f59e0b;
      color: #000;
      font-weight: bold;
      text-align: center;
      font-size: 13px;
      padding: 6px;
    }
    .swatch-box {
      border: 1.5px dashed #475569;
      margin: 8px 15px;
      padding: 12px;
      text-align: center;
      background: #fafafa;
    }
    .swatch-icon {
      font-size: 18px;
      color: #ec4899;
    }
    .swatch-title {
      font-weight: bold;
      font-size: 11px;
      color: #000;
    }
    .swatch-sub {
      font-size: 9px;
      color: #475569;
      margin-top: 2px;
    }
    .sec-banner {
      background: #e2e8f0;
      font-weight: bold;
      text-align: center;
      font-size: 11px;
      padding: 4px;
      border: 1px solid #000;
      border-bottom: none;
      text-transform: uppercase;
    }
    .table-eval th {
      background: #e2e8f0;
      font-size: 8.5px;
      text-align: center;
      font-weight: bold;
    }
    .table-eval td {
      font-size: 8.5px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    
    .badge-pass { color: #047857; font-weight: bold; }
    .badge-fail { color: #b91c1c; font-weight: bold; }
    .badge-warn { color: #b45309; font-weight: bold; }

    .checkbox-box {
      display: inline-block;
      width: 10px;
      height: 10px;
      border: 1px solid #000;
      text-align: center;
      line-height: 9px;
      font-size: 9px;
      font-weight: bold;
      margin-left: 2px;
      margin-right: 4px;
    }
    @media print {
      body { background: #fff; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

  <!-- ========================================================================= -->
  <!-- PÁGINA 1: LABORATORIO MATERIAS PRIMAS (DMP-F-001 V01-2021)                -->
  <!-- ========================================================================= -->
  <div class="page">
    
    <!-- ENCABEZADO PRINCIPAL -->
    <table>
      <tr>
        <td class="header-logo">
          <strong>STF</strong>LAB
        </td>
        <td class="header-title">
          LABORATORIO MATERIAS PRIMAS<br>
          <span style="font-size: 9px; font-weight: normal;">DMP-F-001 V01-2021</span>
        </td>
        <td class="header-right">
          <strong>SHP:</strong> ${shp}<br>
          <strong>TELA:</strong> ${referencia}
        </td>
      </tr>
    </table>

    <!-- GRILLA DE DATOS GENERALES DE TRAZABILIDAD -->
    <table style="border-top: none;">
      <tr>
        <td style="width: 15%;" class="bold">COMPOSICIÓN</td>
        <td style="width: 35%;">${composicion}</td>
        <td style="width: 20%;" class="bold">CÓDIGO MATERIAL</td>
        <td style="width: 30%;">${codigoMaterial}</td>
      </tr>
      <tr>
        <td class="bold">PROVEEDOR</td>
        <td colspan="3">${proveedor}</td>
      </tr>
      <tr>
        <td class="bold">IMPORTACIÓN</td>
        <td>${importacion}</td>
        <td class="bold">OAC</td>
        <td>${ocCol} &nbsp;&nbsp;&nbsp; <strong>LOTE PROVEEDOR:</strong> ${loteProveedor}</td>
      </tr>
      <tr>
        <td class="bold">SOLICITUD</td>
        <td>${solicitud}</td>
        <td class="bold">CONSECUTIVO ENSAYO</td>
        <td>${consecutivo}</td>
      </tr>
      <tr>
        <td class="bold">FECHA INGRESO</td>
        <td>${fecha}</td>
        <td class="bold">ROLLO</td>
        <td>${rollo}</td>
      </tr>
    </table>

    <!-- RECISIÓN DE MUESTRA FÍSICA -->
    <div class="swatch-box">
      <div class="swatch-icon">✂</div>
      <div class="swatch-title">PEGAR MUESTRA FÍSICA AQUÍ</div>
      <div style="font-size: 8.5px; font-weight: bold; color: #334155; margin-top: 1px;">MEDIDA REQUERIDA: 8cm x 5cm</div>
      <div class="swatch-sub">Sujete aquí la grapa física de tejido para verificación táctil de tono y mano en Patronaje y Corte.</div>
    </div>

    <!-- SECCIÓN DE EVALUACIÓN TELAS -->
    <div class="sec-banner">EVALUACIÓN MATERIAS PRIMAS - TELAS</div>

    <table class="table-eval">
      <thead>
        <tr>
          <th style="width: 26%;">PRUEBAS</th>
          <th style="width: 14%;">NORMAS TÉCNICAS</th>
          <th style="width: 14%;">FICHA TÉCNICA</th>
          <th style="width: 10%;">ESTÁNDAR</th>
          <th style="width: 9%;">ANCHO TOTAL</th>
          <th style="width: 9%;">ANCHO ÚTIL<br>(MEDIDO)</th>
          <th style="width: 9%;">A. TOTAL<br>DESENGOME</th>
          <th style="width: 9%;">A. ÚTIL<br>DESENGOME</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="bold">Ancho (m)</td>
          <td class="text-center">NTC 228</td>
          <td class="text-center">Útil: N/Am / Tot: N/Am</td>
          <td class="text-center">±3%</td>
          <td class="text-center">${anchoTotMed}</td>
          <td class="text-center">${anchoUtMed}</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Peso (g/m²)</td>
          <td class="text-center">NTC 230</td>
          <td class="text-center">N/A</td>
          <td class="text-center">±3%</td>
          <td class="text-center">${gramajeMed}</td>
          <td class="text-center">${gramajeMed}</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Peso (g/ml)</td>
          <td class="text-center">NTC 230</td>
          <td class="text-center">N/A</td>
          <td class="text-center">±5%</td>
          <td class="text-center">${pesoLinealMed}</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Rendimiento (m/kg)</td>
          <td class="text-center">NTC 230</td>
          <td class="text-center">—</td>
          <td class="text-center">±5%</td>
          <td class="text-center">${rendMed}</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Encogimiento a lo ancho (%)</td>
          <td class="text-center">NTC 908</td>
          <td class="text-center">—</td>
          <td class="text-center">±5%</td>
          <td class="text-center">${encAnchoMed}%</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Encogimiento a lo largo (%)</td>
          <td class="text-center">NTC 908</td>
          <td class="text-center">—</td>
          <td class="text-center">±5%</td>
          <td class="text-center">${encLargoMed}%</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Elongación a lo ancho (%)</td>
          <td class="text-center">NTC 754-2</td>
          <td class="text-center">—</td>
          <td class="text-center">±5%</td>
          <td class="text-center">${elongAnchoMed}%</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Elongación a lo largo (%)</td>
          <td class="text-center">NTC 754-2</td>
          <td class="text-center">—</td>
          <td class="text-center">±5%</td>
          <td class="text-center">${elongLargoMed}%</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Desviación de trama (%)</td>
          <td class="text-center">NTC 5121</td>
          <td class="text-center">0%</td>
          <td class="text-center">±4%</td>
          <td class="text-center">${desvTramaMed}%</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Torque o vire (%)</td>
          <td class="text-center">NTC 5121 / AATCC 179</td>
          <td class="text-center">0%</td>
          <td class="text-center">±5%</td>
          <td class="text-center">${torqueMed}%</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Resistencia a la tensión N (lbf)</td>
          <td class="text-center">NTC 754-2</td>
          <td class="text-center">—</td>
          <td class="text-center">*</td>
          <td class="text-center">${tensionMed}</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Resistencia al desgarre N (lbf)</td>
          <td class="text-center">NTC 5634</td>
          <td class="text-center">—</td>
          <td class="text-center">*</td>
          <td class="text-center">${desgarreMed}</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Resistencia al deslizamiento de hilos - Costura</td>
          <td class="text-center">NTC 1382-1-2</td>
          <td class="text-center">—</td>
          <td class="text-center">**</td>
          <td class="text-center">${deslizamientoMed}</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Tendencia a la formación de motas (Pilling)</td>
          <td class="text-center">NTC 2051</td>
          <td class="text-center">—</td>
          <td class="text-center">3</td>
          <td class="text-center">${pillingMed}</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Solidez del color al lavado doméstico</td>
          <td class="text-center">NTC 1155</td>
          <td class="text-center">—</td>
          <td class="text-center">3-4</td>
          <td class="text-center">${solLavadoMed}</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Solidez del color al frote húmedo</td>
          <td class="text-center">NTC 786</td>
          <td class="text-center">—</td>
          <td class="text-center">3</td>
          <td class="text-center">${solFroteHumMed}</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Solidez del color al frote seco</td>
          <td class="text-center">NTC 786</td>
          <td class="text-center">—</td>
          <td class="text-center">4</td>
          <td class="text-center">${solFroteSecoMed}</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Cambio de color</td>
          <td class="text-center">NTC 4873-2</td>
          <td class="text-center">—</td>
          <td class="text-center">4</td>
          <td class="text-center">${cambioColorMed}</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold">Prueba de fusionado</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">${fusionadoRes}</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
          <td class="text-center">—</td>
        </tr>
        <tr>
          <td class="bold bg-light-gray" colspan="3">Lavado sugerido por características de la tela</td>
          <td class="bg-light-gray" colspan="5"><strong>Ciclo delicado, agua fría, no retorcer</strong></td>
        </tr>
      </tbody>
    </table>

    <!-- CONFORMIDAD Y CHECKBOXES -->
    <table>
      <tr>
        <td style="width: 35%;">
          <strong>FICHA TÉCNICA</strong> &nbsp;
          SÍ <div class="checkbox-box">X</div> &nbsp; NO <div class="checkbox-box"></div>
        </td>
        <td style="width: 35%;">
          CONFORME A FICHA TÉCNICA <div class="checkbox-box">${esAprobado ? 'X' : ''}</div><br>
          CONFORME A PLM <div class="checkbox-box">X</div>
        </td>
        <td style="width: 30%;">
          SOLIDEZ DEL COLOR ADECUADO PARA COMBINAR <div class="checkbox-box"></div><br>
          SUELTA COLOR CON FRICCIÓN <div class="checkbox-box">${!esAprobado ? 'X' : ''}</div>
        </td>
      </tr>
    </table>

    <!-- OBSERVACIONES -->
    <table>
      <tr>
        <td>
          <strong>OBSERVACIONES:</strong><br>
          <span style="font-size: 9.5px;">
            Solicitud de Compra: ${solicitud}. OC: ${ocCol}. Referencia: ${referencia}. Color: ${color}. ${m?.observaciones || ev?.observacionesRecomendaciones || ''}
          </span>
        </td>
      </tr>
      <tr>
        <td>
          <strong>EVALUACIÓN AUTOMÁTICA DEL SISTEMA:</strong> 
          <span class="${esAprobado ? 'badge-pass' : 'badge-fail'}">
            🟢 ${esAprobado ? 'TODOS LOS PARÁMETROS CUMPLEN LAS NORMAS NTC' : 'PARÁMETROS FUERA DE ESPECIFICACIÓN NORMATIVA NTC'}
          </span>
        </td>
      </tr>
    </table>

    <!-- FIRMAS DE APROBACIÓN -->
    <table>
      <tr class="text-center">
        <td style="width: 25%; font-size: 9px;" class="bold">FECHA</td>
        <td style="width: 45%; font-size: 9px;" class="bold">P. AUTORIZADO (REALIZA)</td>
        <td style="width: 15%; font-size: 9px;" class="bold">APRUEBA</td>
        <td style="width: 15%; font-size: 9px;" class="bold">APROBADO</td>
      </tr>
      <tr>
        <td class="text-center bold">${fecha}</td>
        <td class="text-center" style="padding-top: 15px;">
          ------------------- Laboratorio -------------------<br>
          <span style="font-size: 8.5px;">P. AUTORIZADO / RESPONSABLE</span>
        </td>
        <td class="text-center" style="padding-top: 15px;">--------------------</td>
        <td>
          APROBADO <div class="checkbox-box">${esAprobado ? 'X' : ''}</div><br>
          NO APROBADO <div class="checkbox-box">${!esAprobado ? 'X' : ''}</div>
        </td>
      </tr>
    </table>

  </div>

  <!-- ========================================================================= -->
  <!-- PÁGINA 2: LISTADO Y MATRIZ DE COLORES Y SOLIDEZ DE TINTORERÍA             -->
  <!-- ========================================================================= -->
  <div class="page">
    
    <!-- BANNER DERECHO AMARILLO DE TINTORERÍA -->
    <div class="bg-yellow-header">
      STF GROUP — LISTADO Y MATRIZ DE COLORES Y SOLIDEZ DE TINTORERÍA
    </div>

    <!-- ENCABEZADO PÁGINA 2 -->
    <table>
      <tr>
        <td style="width: 20%;" class="bold">CÓDIGO ENSAYO</td>
        <td style="width: 30%; font-family: monospace;">${consecutivo}</td>
        <td style="width: 20%;" class="bold">REFERENCIA TELA</td>
        <td style="width: 30%; font-weight: bold;">${referencia}</td>
      </tr>
      <tr>
        <td class="bold">COLOR EVALUADO</td>
        <td style="font-weight: bold;">${color}</td>
        <td class="bold">LOTE PROVEEDOR</td>
        <td style="font-family: monospace;">${loteProveedor}</td>
      </tr>
    </table>

    <!-- SECCIÓN 1: EVALUACIÓN DE SOLIDEZ -->
    <div class="sec-banner" style="background: #f1f5f9; text-align: left; padding-left: 8px;">
      1. EVALUACIÓN DE SOLIDEZ DEL COLOR Y SOLIDEZ AL LAVADO
    </div>

    <table class="table-eval">
      <thead>
        <tr>
          <th style="width: 30%;">PRUEBA DE SOLIDEZ</th>
          <th style="width: 25%;">NORMA TÉCNICA</th>
          <th style="width: 20%;">REQUERIMIENTO</th>
          <th style="width: 25%;">VALOR MEDIDO / EVALUACIÓN</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="bold">Solidez al Frote Seco</td>
          <td class="text-center">NTC 786 / AATCC 8</td>
          <td class="text-center">Mínimo 4.0</td>
          <td class="text-center badge-pass">${solFroteSecoT}</td>
        </tr>
        <tr>
          <td class="bold">Solidez al Frote Húmedo</td>
          <td class="text-center">NTC 786 / AATCC 8</td>
          <td class="text-center">Mínimo 3.0</td>
          <td class="text-center badge-pass">${solFroteHumT}</td>
        </tr>
        <tr>
          <td class="bold">Solidez al Lavado Doméstico</td>
          <td class="text-center">NTC 1155</td>
          <td class="text-center">3 - 4</td>
          <td class="text-center badge-pass">${solLavadoT}</td>
        </tr>
        <tr>
          <td class="bold">Solidez al Lavado 2A</td>
          <td class="text-center">NTC 1153-3 / AATCC 61</td>
          <td class="text-center">3 - 4</td>
          <td class="text-center badge-pass">${solLavado2AT}</td>
        </tr>
        <tr>
          <td class="bold">Cambio de Color Post-Lavado</td>
          <td class="text-center">NTC 4873-2</td>
          <td class="text-center">Mínimo 4.0</td>
          <td class="text-center badge-pass">${cambioColorPostT}</td>
        </tr>
      </tbody>
    </table>

    <!-- SECCIÓN 2: REQUISITOS EN PRENDA -->
    <div class="sec-banner" style="background: #f1f5f9; text-align: left; padding-left: 8px; margin-top: 10px;">
      2. REQUISITOS DE COMBINACIÓN Y APARIENCIA EN PRENDA
    </div>

    <table>
      <tr>
        <td style="width: 45%;" class="bold">Apto para combinar con prendas / contrastes claros</td>
        <td style="width: 55%; font-weight: bold; color: #b45309;">${aptoCombinar}</td>
      </tr>
      <tr>
        <td class="bold">Comportamiento al frote y transferencia de pigmento</td>
        <td style="font-weight: bold; color: #047857;">${compFrote}</td>
      </tr>
    </table>

    <!-- SECCIÓN 3: INSPECCIÓN DE ROLLOS -->
    <div class="sec-banner" style="background: #f1f5f9; text-align: left; padding-left: 8px; margin-top: 10px;">
      3. INSPECCIÓN DE ROLLOS DEL LOTE Y VARIACIÓN DE TONO
    </div>

    <table class="table-eval">
      <thead>
        <tr>
          <th style="width: 15%;">ROLLO #</th>
          <th style="width: 25%;">LOTE TINTORERÍA</th>
          <th style="width: 25%;">TONO EVALUADO</th>
          <th style="width: 20%;">DESVIACIÓN DE COLOR (DELTA E)</th>
          <th style="width: 15%;">DICTAMEN ROLLO</th>
        </tr>
      </thead>
      <tbody>
        ${matrizRollos.map((r: any) => `
          <tr>
            <td class="text-center font-mono bold">${r.rolloNo}</td>
            <td class="text-center font-mono">${r.loteTintoreria}</td>
            <td class="text-center">${r.tonoEvaluado}</td>
            <td class="text-center badge-pass">${r.deltaE}</td>
            <td class="text-center badge-pass">${r.dictamenRollo}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

  </div>

</body>
</html>
`;
}
