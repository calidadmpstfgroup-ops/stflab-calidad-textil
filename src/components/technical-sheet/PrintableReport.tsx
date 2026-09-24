import React from 'react';
import { MuestraTextil } from '../../types';
import { obtenerDiasEnProceso } from '../../utils/calculations';
import { Printer, ArrowLeft, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface PrintableReportProps {
  muestra: MuestraTextil;
  onCerrar: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ muestra: m, onCerrar }) => {
  const handleImprimir = () => {
    window.print();
  };

  const renderResultadoTexto = (resultado?: 'CONFORME' | 'NO_CONFORME' | 'OBSERVACION') => {
    if (resultado === 'CONFORME') return 'CONFORME';
    if (resultado === 'OBSERVACION') return 'CON OBSERVACIÓN';
    if (resultado === 'NO_CONFORME') return 'NO CONFORME';
    return 'N/A';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
      
      {/* Barra de control flotante (no se imprime) */}
      <div className="no-print w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl p-3 mb-4 flex items-center justify-between shadow-xl">
        <button
          onClick={onCerrar}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Ficha Técnica</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleImprimir}
            className="flex items-center gap-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar como PDF</span>
          </button>
        </div>
      </div>

      {/* Hoja de Reporte Imprimible (A4 style) */}
      <div className="w-full max-w-4xl bg-white text-slate-900 rounded-lg shadow-2xl p-8 sm:p-12 font-sans border border-slate-300 print:border-none print:shadow-none print:p-0">
        
        {/* Encabezado Oficial */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded bg-slate-900 text-amber-400 flex items-center justify-center font-black text-lg">
                STF
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  STF GROUP S.A.
                </h1>
                <p className="text-xs font-bold text-slate-600 uppercase">
                  Laboratorio de Control de Calidad Textil & Confección
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Studio F • ELA • Studio F Men • Top Class • Outlet
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block bg-slate-100 border border-slate-300 px-3 py-1 rounded text-xs font-mono font-bold text-slate-800">
              REPORTE: {m.numeroReporte}
            </span>
            <p className="text-xs font-mono font-bold text-amber-800 mt-1">
              CÓDIGO MT: {m.codigoMT}
            </p>
            <p className="text-[11px] text-slate-500">
              Fecha de Emisión: {new Date().toLocaleDateString('es-CO')}
            </p>
          </div>
        </div>

        {/* Título del Documento */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 underline decoration-amber-500 decoration-2">
            Certificado de Ensayo de Calidad Textil
          </h2>
          <p className="text-xs text-slate-600">
            Ficha Técnica y Dictamen de Conformidad Multidepartamental
          </p>
        </div>

        {/* 1. Datos Generales de la Muestra */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase bg-slate-100 border-l-4 border-amber-500 px-2 py-1 mb-2 text-slate-800">
            1. Información General de la Muestra
          </h3>
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-bold text-slate-700 w-1/4">Referencia de Tela:</td>
                <td className="py-1.5 text-slate-900 font-semibold w-1/4">{m.referencia}</td>
                <td className="py-1.5 font-bold text-slate-700 w-1/4">Marca Destino:</td>
                <td className="py-1.5 text-slate-900 font-semibold w-1/4">{m.marca}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-bold text-slate-700">Proveedor / Fabricante:</td>
                <td className="py-1.5 text-slate-900 font-semibold">{m.proveedor}</td>
                <td className="py-1.5 font-bold text-slate-700">País de Origen:</td>
                <td className="py-1.5 text-slate-900">{m.paisOrigen || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-bold text-slate-700">Orden de Compra (OP):</td>
                <td className="py-1.5 text-slate-900 font-mono">{m.ordenCompra}</td>
                <td className="py-1.5 font-bold text-slate-700">Lote / Partida:</td>
                <td className="py-1.5 text-slate-900 font-mono">{m.lote}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-bold text-slate-700">Composición Declarada:</td>
                <td className="py-1.5 text-slate-900">{m.ensayos.composicion || 'N/A'}</td>
                <td className="py-1.5 font-bold text-slate-700">Fecha de Ingreso:</td>
                <td className="py-1.5 text-slate-900">{m.fechaIngreso}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Resultados de Ensayos Técnicos */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase bg-slate-100 border-l-4 border-amber-500 px-2 py-1 mb-2 text-slate-800">
            2. Resultados de Ensayos Físico-Mecánicos & Químicos
          </h3>
          <table className="w-full text-xs border border-slate-300 border-collapse text-left">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                <th className="p-2 border-r border-slate-300">Parámetro / Ensayo</th>
                <th className="p-2 border-r border-slate-300">Norma Aplicada</th>
                <th className="p-2 border-r border-slate-300">Tolerancia Estándar</th>
                <th className="p-2 border-r border-slate-300">Resultado Obtenido</th>
                <th className="p-2 text-center">Dictamen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2 font-semibold border-r border-slate-300">Gramaje / Peso</td>
                <td className="p-2 border-r border-slate-300">ASTM D3776 / NTC 230</td>
                <td className="p-2 border-r border-slate-300">{m.ensayos.gramajeGsm?.tolerancia || '± 5%'}</td>
                <td className="p-2 font-bold border-r border-slate-300">{m.ensayos.gramajeGsm?.valor ? `${m.ensayos.gramajeGsm.valor} g/m²` : '-'}</td>
                <td className="p-2 text-center font-bold">{renderResultadoTexto(m.ensayos.gramajeGsm?.resultado)}</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold border-r border-slate-300">Encogimiento Urdimbre (Largo)</td>
                <td className="p-2 border-r border-slate-300">AATCC 135 / NTC 908</td>
                <td className="p-2 border-r border-slate-300">{m.ensayos.encogimientoLargo?.tolerancia || '± 3.0%'}</td>
                <td className="p-2 font-bold border-r border-slate-300">{m.ensayos.encogimientoLargo?.valor ? `${m.ensayos.encogimientoLargo.valor}%` : '-'}</td>
                <td className="p-2 text-center font-bold">{renderResultadoTexto(m.ensayos.encogimientoLargo?.resultado)}</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold border-r border-slate-300">Encogimiento Trama (Ancho)</td>
                <td className="p-2 border-r border-slate-300">AATCC 135 / NTC 908</td>
                <td className="p-2 border-r border-slate-300">{m.ensayos.encogimientoAncho?.tolerancia || '± 3.5%'}</td>
                <td className="p-2 font-bold border-r border-slate-300">{m.ensayos.encogimientoAncho?.valor ? `${m.ensayos.encogimientoAncho.valor}%` : '-'}</td>
                <td className="p-2 text-center font-bold">{renderResultadoTexto(m.ensayos.encogimientoAncho?.resultado)}</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold border-r border-slate-300">Viro / Pierna Virada</td>
                <td className="p-2 border-r border-slate-300">AATCC 179</td>
                <td className="p-2 border-r border-slate-300">{m.ensayos.viroPierna?.tolerancia || 'Máx 3.0%'}</td>
                <td className="p-2 font-bold border-r border-slate-300">{m.ensayos.viroPierna?.valor ? `${m.ensayos.viroPierna.valor}%` : '-'}</td>
                <td className="p-2 text-center font-bold">{renderResultadoTexto(m.ensayos.viroPierna?.resultado)}</td>
              </tr>
              {m.ensayos.solidezLavado && (
                <tr>
                  <td className="p-2 font-semibold border-r border-slate-300">Solidez al Lavado</td>
                  <td className="p-2 border-r border-slate-300">ISO 105 A03</td>
                  <td className="p-2 border-r border-slate-300">Min 4.0</td>
                  <td className="p-2 font-bold border-r border-slate-300">
                    Cambio: {m.ensayos.solidezLavado.cambioColor?.valor || '-'} / Manch: {m.ensayos.solidezLavado.manchado?.valor || '-'}
                  </td>
                  <td className="p-2 text-center font-bold">{renderResultadoTexto(m.ensayos.solidezLavado.cambioColor?.resultado)}</td>
                </tr>
              )}
              {m.ensayos.solidezFrote && (
                <tr>
                  <td className="p-2 font-semibold border-r border-slate-300">Solidez al Frote</td>
                  <td className="p-2 border-r border-slate-300">AATCC 8</td>
                  <td className="p-2 border-r border-slate-300">Seco &ge; 4 • Húmedo &ge; 3</td>
                  <td className="p-2 font-bold border-r border-slate-300">
                    Seco: {m.ensayos.solidezFrote.seco?.valor || '-'} / Húm: {m.ensayos.solidezFrote.humedo?.valor || '-'}
                  </td>
                  <td className="p-2 text-center font-bold">{renderResultadoTexto(m.ensayos.solidezFrote.humedo?.resultado)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Dictamen por Áreas y Trazabilidad */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase bg-slate-100 border-l-4 border-amber-500 px-2 py-1 mb-2 text-slate-800">
            3. Dictamen por Departamentos & Trazabilidad
          </h3>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { label: 'Laboratorio', data: m.trazabilidad.laboratorio },
              { label: 'Compras', data: m.trazabilidad.compras },
              { label: 'Patronaje', data: m.trazabilidad.patronaje },
              { label: 'Corte', data: m.trazabilidad.corte },
            ].map((d) => (
              <div key={d.label} className="border border-slate-300 p-2 rounded bg-slate-50">
                <span className="block text-[10px] font-bold uppercase text-slate-600">{d.label}</span>
                <span className={`block font-bold text-xs mt-1 ${
                  d.data.dictamen === 'APROBADO' ? 'text-emerald-700' :
                  d.data.dictamen === 'HALLAZGO' ? 'text-amber-700' :
                  d.data.dictamen === 'RECHAZADO' ? 'text-rose-700' : 'text-slate-600'
                }`}>
                  {d.data.dictamen}
                </span>
                <span className="block text-[9px] text-slate-500 mt-0.5 truncate" title={d.data.responsable}>
                  {d.data.responsable || 'Auditor'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Dictamen Final y Firmas */}
        <div className="border-2 border-slate-900 p-4 rounded-lg bg-slate-50 mb-8 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
              Dictamen Final Consolidado
            </span>
            <div className={`text-2xl font-black tracking-tight mt-0.5 ${
              m.dictamenFinal === 'APROBADO' ? 'text-emerald-700' :
              m.dictamenFinal === 'HALLAZGO' ? 'text-amber-700' :
              m.dictamenFinal === 'RECHAZADO' ? 'text-rose-700' : 'text-slate-700'
            }`}>
              {m.dictamenFinal === 'APROBADO' && '✔ LOTE APROBADO (CONFORME)'}
              {m.dictamenFinal === 'HALLAZGO' && '⚠ APROBADO CON OBSERVACIONES (HALLAZGO)'}
              {m.dictamenFinal === 'RECHAZADO' && '✖ LOTE RECHAZADO (NO CONFORME)'}
              {m.dictamenFinal === 'EN_PROCESO' && '⏳ EN PROCESO DE EVALUACIÓN'}
            </div>
            {m.observacionesGenerales && (
              <p className="text-xs text-slate-700 mt-1 font-medium">
                <strong>Observaciones:</strong> {m.observacionesGenerales}
              </p>
            )}
          </div>

          <div className="text-right text-[11px] font-mono text-slate-600 border-l border-slate-300 pl-4">
            <p>Lead Time Total: <strong>{obtenerDiasEnProceso(m)} días</strong></p>
            <p>Estado Sincronizado: <strong>OK</strong></p>
          </div>
        </div>

        {/* Firmas de Autorización */}
        <div className="grid grid-cols-3 gap-6 pt-12 text-center text-xs text-slate-700 border-t border-slate-300">
          <div>
            <div className="border-t border-slate-400 w-4/5 mx-auto mb-1"></div>
            <p className="font-bold">Ingeniero de Laboratorio</p>
            <p className="text-[10px] text-slate-500">Control Físico-Químico</p>
          </div>
          <div>
            <div className="border-t border-slate-400 w-4/5 mx-auto mb-1"></div>
            <p className="font-bold">Jefe de Patronaje & Corte</p>
            <p className="text-[10px] text-slate-500">Validación Moldería / Mesa</p>
          </div>
          <div>
            <div className="border-t border-slate-400 w-4/5 mx-auto mb-1"></div>
            <p className="font-bold">Dirección de Calidad STF</p>
            <p className="text-[10px] text-slate-500">Aprobación Final de Producción</p>
          </div>
        </div>

      </div>

    </div>
  );
};
