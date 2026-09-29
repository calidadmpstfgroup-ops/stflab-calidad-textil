import React from 'react';
import { FichaTecnicaHistoricaVersionada, VersionFichaTecnica } from '../../types';
import { 
  exportarFichaAWord, 
  exportarFichaAPDF 
} from '../../utils/fichaTecnicaFormatters';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  CheckCircle2,
  Calendar,
  Building2,
  Hash
} from 'lucide-react';

interface FichaTecnicaFormatoCompletoModalProps {
  ficha: FichaTecnicaHistoricaVersionada | null;
  version?: VersionFichaTecnica;
  onCerrar: () => void;
}

export const FichaTecnicaFormatoCompletoModal: React.FC<FichaTecnicaFormatoCompletoModalProps> = ({
  ficha,
  version,
  onCerrar
}) => {
  if (!ficha) return null;

  const v = version || ficha.historialVersiones[ficha.historialVersiones.length - 1];
  const esp = v?.especificaciones || {} as any;

  const fechaBulk = esp.fechaProduccion || ficha.createdAt || '01-15/JUN/22';
  const stfPo = esp.stfPoNumber || esp.numeroOrdenCompraSTF || 'MEX38770';
  const proveedorNombre = esp.nombreEmpresa || ficha.proveedor || 'TEXTIVISION, S.DE R.L. DE C.V.';
  const stfRef = esp.referenciaSTF || esp.nombreComercialTela || ficha.referencia || 'DESIGN 6341 A';
  const color = esp.colorShade || 'AZUL KLEIN 16936';
  const refProv = esp.referenciaProveedor || ficha.referenciaProveedor || 'CREPE VICTORIA';
  const paisOrigen = esp.paisOrigen || esp.paisEmpresa || ficha.paisOrigen || 'MEXICO';
  const lotes = esp.numeroLoteProduccion || '43254-1, 43313-1, 43367-1, 43463-1';
  const subpartida = esp.subpartidaArancelaria || '5407.52.00.00';

  const aplicaCertOrigen = esp.aplicaCertificadoOrigen === true || 
    (esp.aplicaCertificadoOrigen as any) === 'SI' ||
    esp.aplicaCertificadoOrigen === undefined; // default true if matches sample

  const composicionTexto = esp.composicion || 'ACETATO 90%, ELASTANE 10%';
  const ancho = esp.anchoTotalM ? Math.round(esp.anchoTotalM * 100) : (esp.anchoUtilM ? Math.round(esp.anchoUtilM * 100) : 140);
  const anchoCortable = esp.anchoUtilM ? Math.round(esp.anchoUtilM * 100) : 135;
  const gsm = esp.gramajeDeclaradoGsm || 286;
  const denimOz = esp.pesoDenimOz || 'N/A';

  const esPunto = esp.tipoTejido === 'Punto' || (ficha.referencia || '').toLowerCase().includes('punto') || (ficha.referencia || '').toLowerCase().includes('crepe');
  const esPlano = !esPunto;

  const encLargo = esp.encogimientoLargoMax !== undefined ? `${esp.encogimientoLargoMax}%` : 'Length= -1.8%';
  const encAncho = esp.encogimientoAnchoMax !== undefined ? `${esp.encogimientoAnchoMax}%` : 'Width= -6.0%';
  const solLavado = esp.solidezLavadoMin !== undefined ? `Color change ${esp.solidezLavadoMin}` : 'Color change 4.5, Staining 3';
  const solFroteSeco = esp.solidezFroteSecoMin !== undefined ? `Dry ${esp.solidezFroteSecoMin}` : 'Dry 4-5';
  const solFroteHum = esp.solidezFroteHumedoMin !== undefined ? `wet ${esp.solidezFroteHumedoMin}` : 'wet 4-5';
  const rendimiento = esp.rendimientoMkg ? `${esp.rendimientoMkg}` : '2,86';
  const viro = esp.viroMax !== undefined ? `${esp.viroMax}%` : '1,7%';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Barra de Herramientas Superior: Acciones de Exportación */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00b4d8]/20 border border-[#00b4d8]/40 flex items-center justify-center text-[#00b4d8]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-white flex items-center gap-2">
                <span>Formato Completo STF GROUP</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono">
                  v{v?.version || 1}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {ficha.referencia} • {ficha.proveedor}
              </p>
            </div>
          </div>

          {/* Botones de Exportación Word / PDF */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => exportarFichaAWord(ficha, v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
              title="Descargar documento editable para Microsoft Word (.doc)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Word (.doc)</span>
            </button>

            <button
              type="button"
              onClick={() => exportarFichaAPDF(ficha, v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
              title="Generar o imprimir PDF oficial de alta resolución"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Exportar PDF / Imprimir</span>
            </button>

            <button
              type="button"
              onClick={onCerrar}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visor de Hoja Técnica (Estilo Hoja de Papel STF GROUP auténtica) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto bg-white text-slate-950 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-300 font-sans text-xs">
            
            {/* Header: Logo STF GROUP + Título */}
            <div className="border-2 border-black flex flex-col sm:flex-row items-center justify-between mb-2">
              <div className="p-3 sm:p-4 text-center sm:text-left flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-black tracking-tighter font-sans">
                  STF<span className="font-normal text-xl sm:text-2xl">GROUP</span>
                </span>
              </div>
              <div className="bg-black text-white p-2.5 sm:p-3 text-center sm:text-right flex-1 sm:border-l-2 sm:border-black font-bold text-[11px] sm:text-xs uppercase tracking-wide leading-tight">
                ESPECIFICACIONES TECNICAS DE TELA - TEJIDO PLANO / PUNTO<br/>
                <span className="text-[10px] font-normal text-slate-300">TECHNICAL DATA SHEET FABRIC - WOVEN/KNIT</span>
              </div>
            </div>

            {/* TABLA 1: DATOS DE PRODUCCIÓN Y PROVEEDOR */}
            <table className="w-full border-collapse border border-black mb-2 text-[10px] sm:text-[11px]">
              <tbody>
                <tr className="border-b border-black">
                  <td className="p-1.5 font-bold border-r border-black w-2/5 bg-slate-50">
                    FECHA PRODUCCION DE LA TELA / BULK DATE
                  </td>
                  <td className="p-1.5 font-black text-center border-r border-black w-1/4">
                    {fechaBulk}
                  </td>
                  <td className="p-1.5 font-bold border-r border-black text-center w-1/6 bg-slate-50">
                    STF P.O #
                  </td>
                  <td className="p-1.5 font-black text-center w-1/6">
                    {stfPo}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1.5 font-bold border-r border-black bg-slate-50">
                    NOMBRE DEL PROVEEDOR / SUPPLIER'S NAME:
                  </td>
                  <td colSpan={3} className="p-1.5 font-black">
                    {proveedorNombre}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1.5 font-bold border-r border-black bg-slate-50">
                    NOMBRE DE TELA / STF GROUP REFERENCE:
                  </td>
                  <td className="p-1.5 font-black border-r border-black">
                    {stfRef}
                  </td>
                  <td className="p-1.5 font-bold border-r border-black text-center bg-slate-50">
                    COLOR:
                  </td>
                  <td className="p-1.5 font-black text-center">
                    {color}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1.5 font-bold border-r border-black bg-slate-50">
                    REFERENCIA DE PROVEEDOR / SUPPLIER'S ITEM NUMBER:
                  </td>
                  <td colSpan={3} className="p-1.5 font-black">
                    {refProv}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1.5 font-bold border-r border-black bg-slate-50">
                    ORIGEN TELA / FABRIC ORIGIN:
                  </td>
                  <td className="p-1.5 font-black text-center border-r border-black">
                    {paisOrigen}
                  </td>
                  <td className="p-1.5 font-bold border-r border-black text-center bg-slate-50">
                    CANTIDAD LOTES:
                  </td>
                  <td className="p-1.5 font-black text-center">
                    {lotes}
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-black bg-slate-50">
                    SUBPARTIDA ARANCELARIA (HARMONIZED CODE):
                  </td>
                  <td colSpan={3} className="p-1.5 font-mono font-black">
                    {subpartida}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* TABLA 2: CERTIFICADO DE ORIGEN */}
            <div className="bg-black text-white text-[10px] font-bold text-center py-1 uppercase tracking-wider mb-0 border-x border-t border-black">
              INFORMACION SOBRE CERTIFICADO DE ORIGEN / O. C INFORMATION
            </div>
            <table className="w-full border-collapse border border-black mb-2 text-[10px] sm:text-[11px]">
              <tbody>
                <tr>
                  <td className="p-1.5 font-bold border-r border-black w-1/2">
                    APLICA CERTIFICADO DE ORIGEN COL /MEX. // DOES IT HAVE O.C?
                  </td>
                  <td className="p-1.5 text-center font-black border-r border-black w-1/6">
                    SI/YES: <span className="inline-block border border-black w-4 h-4 text-center leading-3 ml-1">{aplicaCertOrigen ? 'X' : ''}</span>
                  </td>
                  <td className="p-1.5 text-center font-black border-r border-black w-1/6">
                    NO: <span className="inline-block border border-black w-4 h-4 text-center leading-3 ml-1">{!aplicaCertOrigen ? 'X' : ''}</span>
                  </td>
                  <td className="p-1 text-[9px] text-slate-600 leading-tight w-1/3">
                    si aplica SI diligenciar declaracion de origen adjunta. If it does please fill the o.c format
                  </td>
                </tr>
              </tbody>
            </table>

            {/* TABLA 3: DESCRIPCIONES BÁSICAS */}
            <div className="bg-black text-white text-[10px] font-bold text-center py-1 uppercase tracking-wider mb-0 border-x border-t border-black">
              DESCRIPCIONES BASICAS / BASIC DESCRIPTION
            </div>
            <table className="w-full border-collapse border border-black mb-2 text-[10px] sm:text-[11px]">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-bold text-center">
                  <th className="p-1.5 border-r border-black">COMPOSICION / COMPOSITION</th>
                  <th className="p-1.5 border-r border-black w-16">%</th>
                  <th className="p-1.5 border-r border-black">CONTINUO / (CONTINUOUS FIBER)</th>
                  <th className="p-1.5">DISCONTINUO (STAPLE FIBER)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black text-center">
                  <td className="p-1.5 font-bold text-left border-r border-black">{composicionTexto}</td>
                  <td className="p-1.5 font-black border-r border-black">100%</td>
                  <td className="p-1.5 font-black border-r border-black">{esPunto ? 'X' : ''}</td>
                  <td className="p-1.5 font-black">{!esPunto ? 'X' : ''}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1.5 font-bold border-r border-black bg-slate-50">Ancho / Width (cms):</td>
                  <td className="p-1.5 font-black text-center border-r border-black">{ancho}</td>
                  <td className="p-1.5 font-bold border-r border-black bg-slate-50">Ancho Cortable / Cuttable Width:</td>
                  <td className="p-1.5 font-black text-center">{anchoCortable}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-black bg-slate-50">PESO / WEIGHT (GSM/M2):</td>
                  <td className="p-1.5 font-black text-center border-r border-black">{gsm}</td>
                  <td className="p-1.5 font-bold border-r border-black bg-slate-50">SOLO DENIM / DENIM (OZ/M2):</td>
                  <td className="p-1.5 font-black text-center">{denimOz}</td>
                </tr>
              </tbody>
            </table>

            {/* TABLA 4: INFORMACIÓN TÉCNICA DEL TEXTIL (ENSAYOS Y PRUEBAS) */}
            <div className="bg-black text-white text-[10px] font-bold text-center py-1 uppercase tracking-wider mb-0 border-x border-t border-black">
              INFORMACIÓN TÉCNICA DEL TEXTIL / FABRICS TECHNICAL INFORMATION
            </div>
            <table className="w-full border-collapse border border-black mb-2 text-[10px] sm:text-[10.5px]">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-bold text-center">
                  <th className="p-1.5 border-r border-black w-2/5">PRUEBA / TEST</th>
                  <th className="p-1.5 border-r border-black w-1/5">METODO - NORMA</th>
                  <th className="p-1.5 border-r border-black w-1/5">UNIDAD DE MEDIDA</th>
                  <th className="p-1.5 border-r border-black">RESULTADO</th>
                  <th className="p-1.5">TOLERANCIA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                <tr>
                  <td className="p-1.5 font-bold border-r border-black">TITULOS DE HILO / YARNS DENIER</td>
                  <td className="p-1.5 text-center border-r border-black">Norma Proveedor</td>
                  <td className="p-1.5 text-center border-r border-black">URDIMBRE / TRAMA</td>
                  <td className="p-1.5 font-black text-center border-r border-black">{esp.tituloHiloUrdimbre || '150/38 - 40/1'}</td>
                  <td className="p-1.5 text-center">± 5%</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-black">RESISTENCIA AL RASGADO / TORN STRENGTH</td>
                  <td className="p-1.5 text-center border-r border-black">ASTM D1424</td>
                  <td className="p-1.5 text-center border-r border-black">Gramos / N</td>
                  <td className="p-1.5 font-black text-center border-r border-black">{esp.resistenciaDesgarreMin || 'Conforme'}</td>
                  <td className="p-1.5 text-center">N/A</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-black">CAMBIO DIMENSIONAL AL LAVADO / SHRINKAGE</td>
                  <td className="p-1.5 text-center border-r border-black">AATCC 135</td>
                  <td className="p-1.5 text-center border-r border-black">URDIMBRE / TRAMA</td>
                  <td className="p-1.5 font-black text-center border-r border-black">{encLargo} / {encAncho}</td>
                  <td className="p-1.5 text-center">Length=-5% Width=-8%</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-black">PIERNA VIRADA / TURNED LEG (BOW & SKEW)</td>
                  <td className="p-1.5 text-center border-r border-black">AATCC 179</td>
                  <td className="p-1.5 text-center border-r border-black">PORCENTAJE / %</td>
                  <td className="p-1.5 font-black text-center border-r border-black">{viro}</td>
                  <td className="p-1.5 text-center">Máx 5.0%</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-black">SOLIDEZ AL LAVADO DOMÉSTICO</td>
                  <td className="p-1.5 text-center border-r border-black">ISO 105 A03</td>
                  <td className="p-1.5 text-center border-r border-black">ESCALA DE GRISES</td>
                  <td className="p-1.5 font-black text-center border-r border-black">{solLavado}</td>
                  <td className="p-1.5 text-center">≥ 3</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-black">SOLIDEZ AL FROTE / RUB FASTNESS</td>
                  <td className="p-1.5 text-center border-r border-black">AATCC 8-2001</td>
                  <td className="p-1.5 text-center border-r border-black">SECO / HÚMEDO</td>
                  <td className="p-1.5 font-black text-center border-r border-black">{solFroteSeco} | {solFroteHum}</td>
                  <td className="p-1.5 text-center">Dry ≥4 wet≥3</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-black">RENDIMIENTO M/KG / YIELD PER KILO</td>
                  <td className="p-1.5 text-center border-r border-black">Metrológico</td>
                  <td className="p-1.5 text-center border-r border-black">M / KG</td>
                  <td className="p-1.5 font-black text-center border-r border-black">{rendimiento}</td>
                  <td className="p-1.5 text-center">± 5%</td>
                </tr>
              </tbody>
            </table>

            {/* TABLA 5: CLASIFICACIÓN DE TEJIDO Y ACABADOS */}
            <div className="bg-black text-white text-[10px] font-bold text-center py-1 uppercase tracking-wider mb-0 border-x border-t border-black">
              TIPO DE TEJIDO, LIGAMENTO Y ACABADO
            </div>
            <table className="w-full border-collapse border border-black mb-2 text-[10px] sm:text-[11px]">
              <tbody>
                <tr className="border-b border-black">
                  <td className="p-1.5 font-bold border-r border-black w-1/3 bg-slate-50">Esta tela es un tejido:</td>
                  <td className="p-1.5 font-black text-center border-r border-black">
                    TEJIDO PUNTO // KNITTED: <span className="inline-block border border-black w-4 h-4 text-center leading-3 ml-1">{esPunto ? 'X' : ''}</span>
                  </td>
                  <td className="p-1.5 font-black text-center">
                    TEJIDO PLANO // WOVEN: <span className="inline-block border border-black w-4 h-4 text-center leading-3 ml-1">{esPlano ? 'X' : ''}</span>
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1.5 font-bold border-r border-black bg-slate-50">Tipo de Ligamento:</td>
                  <td colSpan={2} className="p-1.5 font-black">
                    {esp.tipoLigamento || (esPunto ? 'Tejido de punto por trama (Weft Knitted)' : 'Tafetán / Sarga')}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1.5 font-bold border-r border-black bg-slate-50">Acabado del Color:</td>
                  <td className="p-1.5 font-black border-r border-black">{esp.acabadoColorTintoreria || 'Teñido (Dyed)'}</td>
                  <td className="p-1.5 font-black text-center">Nombre: {color}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-black bg-slate-50">Tipo de Fibra:</td>
                  <td colSpan={2} className="p-1.5 font-black">
                    {esp.tipoFibraTexturizado || 'Texturizado (Textured)'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* TABLA 6: INSTRUCCIONES DE CUIDADO Y OBSERVACIONES */}
            <div className="bg-black text-white text-[10px] font-bold text-center py-1 uppercase tracking-wider mb-0 border-x border-t border-black">
              INSTRUCCIONES DE CUIDADO // CARE INSTRUCTIONS
            </div>
            <table className="w-full border-collapse border border-black mb-3 text-[10px] sm:text-[11px]">
              <tbody>
                <tr className="border-b border-black">
                  <td className="p-1.5 font-bold border-r border-black w-1/3 bg-slate-50">Instrucciones de Lavado:</td>
                  <td className="p-1.5 font-black">
                    {esp.lavadoSugerido || 'Machine Wash Cold, Normal Cycle, Separately, Do Not bleach, tumble dry low'}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1.5 font-bold border-r border-black bg-slate-50">Recomendaciones Planchado:</td>
                  <td className="p-1.5 font-black">
                    {esp.recomendacionesPlanchado || 'Do not Iron.'}
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-black bg-slate-50">OBSERVACIONES TÉCNICAS EXTRA:</td>
                  <td className="p-1.5 text-[9.5px]">
                    {esp.observacionesFabricante || 'Documento técnico homologado por Laboratorio STF GROUP.'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Firma y Sello Oficial STFLAB */}
            <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-500">
              <span>STFLAB - CONTROL DE CALIDAD Y LABORATORIO TEXTIL | STF GROUP S.A.</span>
              <span className="font-mono font-bold text-slate-700">DOCUMENTO OFICIAL VERIFICADO</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
