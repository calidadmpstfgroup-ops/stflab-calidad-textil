import * as XLSX from 'xlsx';
import { MuestraTextil } from '../types';
import { obtenerDiasEnProceso, esAlertaLeadTime } from './calculations';

/**
 * Convierte un arreglo de Muestras Textiles a formato de filas planas para Excel / CSV
 */
export function prepararDatosParaExportacion(muestras: MuestraTextil[]) {
  return muestras.map((m, idx) => {
    const dias = obtenerDiasEnProceso(m);
    const alerta = esAlertaLeadTime(m) ? 'SÍ (>2 DÍAS)' : 'NO';

    return {
      'Ítem': idx + 1,
      'Código MT': m.codigoMT,
      'N° Reporte': m.numeroReporte,
      'Referencia Tela / Material': m.referencia,
      'Código Ref.': m.codigoReferencia || '-',
      'Tipo Material': m.tipoMaterial,
      'Marca': m.marca,
      'Proveedor / Confeccionista': m.proveedor,
      'País Origen': m.paisOrigen || 'N/A',
      'Orden de Compra / OP': m.ordenCompra,
      'Lote': m.lote,
      'Color / Tono': m.color,
      'Unidades': m.unidades || 1,
      'Fecha Ingreso': m.fechaIngreso,
      'Fecha Compromiso': m.fechaCompromiso || '-',
      'Fecha Dictamen Final': m.fechaFinalizacion || '-',
      'Días en Proceso (Lead Time)': dias,
      'Alerta Lead Time': alerta,
      
      // Dictámenes por Área
      'Dictamen Laboratorio': m.trazabilidad.laboratorio.dictamen,
      'Observación Laboratorio': m.trazabilidad.laboratorio.observaciones || '-',
      'Dictamen Compras': m.trazabilidad.compras.dictamen,
      'Dictamen Patronaje': m.trazabilidad.patronaje.dictamen,
      'Dictamen Corte': m.trazabilidad.corte.dictamen,
      
      // Dictamen Global y Causas
      'DICTAMEN FINAL GLOBAL': m.dictamenFinal,
      'Causas de No Conformidad': m.causasNoConformidad && m.causasNoConformidad.length > 0 
        ? m.causasNoConformidad.join(' | ') 
        : 'Ninguna (Conforme)',
      'Observaciones Generales': m.observacionesGenerales || '-',
      
      // Ensayos Clave
      'Composición Declarada': m.ensayos.composicion || '-',
      'Gramaje (g/m²)': m.ensayos.gramajeGsm?.valor || '-',
      'Encogimiento Largo (%)': m.ensayos.encogimientoLargo?.valor ? `${m.ensayos.encogimientoLargo.valor}%` : '-',
      'Encogimiento Ancho (%)': m.ensayos.encogimientoAncho?.valor ? `${m.ensayos.encogimientoAncho.valor}%` : '-',
      'Viro / Torque (%)': m.ensayos.viroPierna?.valor ? `${m.ensayos.viroPierna.valor}%` : '-',
      'Solidez Lavado (Cambio Color)': m.ensayos.solidezLavado?.cambioColor?.valor || '-',
      'Solidez Frote Seco': m.ensayos.solidezFrote?.seco?.valor || '-',
      'Solidez Frote Húmedo': m.ensayos.solidezFrote?.humedo?.valor || '-',
    };
  });
}

/**
 * Exporta las muestras filtradas a un archivo Excel (.xlsx) con auto-ajuste de columnas
 */
export function exportarAExcel(muestras: MuestraTextil[], nombreArchivo?: string) {
  const datos = prepararDatosParaExportacion(muestras);
  const worksheet = XLSX.utils.json_to_sheet(datos);

  // Auto-ajuste de anchos de columna
  const colWidths = Object.keys(datos[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...datos.map((row: any) => (row[key] ? String(row[key]).length : 0))
    );
    return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Consolidado Calidad');

  const fechaHoy = new Date().toISOString().split('T')[0];
  const filename = nombreArchivo || `STFLab_Control_Calidad_${fechaHoy}.xlsx`;

  XLSX.writeFile(workbook, filename);
}

/**
 * Exporta las muestras a un archivo CSV estándar con codificación UTF-8
 */
export function exportarACSV(muestras: MuestraTextil[], nombreArchivo?: string) {
  const datos = prepararDatosParaExportacion(muestras);
  if (datos.length === 0) return;

  const headers = Object.keys(datos[0]);
  const csvRows: string[] = [];

  // Encabezados
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(';'));

  // Filas
  datos.forEach((row: any) => {
    const values = headers.map((header) => {
      const val = row[header] ?? '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(';'));
  });

  const csvString = '\uFEFF' + csvRows.join('\r\n'); // UTF-8 BOM para apertura correcta en Excel en español
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  const fechaHoy = new Date().toISOString().split('T')[0];
  link.setAttribute('download', nombreArchivo || `STFLab_Control_Calidad_${fechaHoy}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
