import React, { useState } from 'react';
import { SolicitudTelasCompleta, ItemMuestraTela, DictamenType } from '../../types';
import { Badge } from '../common/Badge';
import { 
  Search, 
  FlaskConical, 
  Eye, 
  Sparkles, 
  FileSpreadsheet, 
  Printer, 
  Building2, 
  Calendar, 
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Send,
  Layers,
  Trash2
} from 'lucide-react';
import { useQuality } from '../../context/QualityContext';
import { generateCertificateHTML } from '../../utils/certificateGenerator';

interface SolicitudesTelasTableProps {
  solicitudes: SolicitudTelasCompleta[];
  onSeleccionarTela: (solicitud: SolicitudTelasCompleta, tela: ItemMuestraTela) => void;
  telaSeleccionadaId?: string;
  consultarFichaHistorica: (ref: string, prov: string) => any;
}

export const SolicitudesTelasTable: React.FC<SolicitudesTelasTableProps> = ({
  solicitudes,
  onSeleccionarTela,
  telaSeleccionadaId,
  consultarFichaHistorica
}) => {
  const { eliminarSolicitudTelas } = useQuality();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  
  // Pestaña principal: 'solicitudes' (Pendientes por dar respuesta) vs 'historial' (Responded por Laboratorio)
  const [subTab, setSubTab] = useState<'solicitudes' | 'historial'>('solicitudes');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Aplanar todas las muestras con su solicitud padre
  const todasLasMuestras = (solicitudes || []).flatMap((sol) => {
    return (sol.telas || []).map((tela, idx) => ({
      solicitud: sol,
      tela: tela,
      indiceEnSol: idx + 1
    }));
  });

  // Clasificar: Solicitudes (Por dar respuesta) vs Historial (Ya respondidas por laboratorio)
  const muestrasSolicitudes = todasLasMuestras.filter(({ tela }) => {
    const d = (tela.dictamen || 'PENDIENTE').toUpperCase();
    return d === 'PENDIENTE' || d === 'EN_PROCESO';
  });

  const muestrasHistorial = todasLasMuestras.filter(({ tela }) => {
    const d = (tela.dictamen || '').toUpperCase();
    return d === 'APROBADO' || d === 'HALLAZGO' || d === 'RECHAZADO' || d === 'COMPLETADO';
  });

  // Muestras activas según pestaña
  const muestrasActivas = subTab === 'solicitudes' ? muestrasSolicitudes : muestrasHistorial;

  // Filtrado por búsqueda y dictamen
  const itemsFiltrados = muestrasActivas.filter(({ solicitud, tela }) => {
    const q = (busqueda || '').toLowerCase().trim();
    const numSol = (solicitud.numeroSolicitud || '').toLowerCase();
    const prov = (tela.proveedor || solicitud.proveedor || '').toLowerCase();
    const ref = (tela.referencia || '').toLowerCase();
    const col = (tela.color || '').toLowerCase();
    const oc = (tela.ocCol || solicitud.ordenCompra || '').toLowerCase();
    const solCompra = (tela.solicitudCompra || '').toLowerCase();

    const coincideTexto = !q || numSol.includes(q) || prov.includes(q) || ref.includes(q) || col.includes(q) || oc.includes(q) || solCompra.includes(q);

    if (!coincideTexto) return false;

    if (filtroEstado === 'TODOS') return true;
    const estadoTela = (tela.dictamen || 'PENDIENTE').toUpperCase();
    return estadoTela === filtroEstado.toUpperCase();
  });

  // Exportar Certificado XLS
  const handleExportExcel = (m: any) => {
    const htmlContent = generateCertificateHTML(m);
    const blob = new Blob(['\uFEFF', htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `STFLab_${(m.referencia || 'Material').replace(/\s+/g, '_')}_${m.nroLote || m.ocCol || 'LOTE'}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('¡Certificado exportado en formato XLS de Excel!');
  };

  return (
    <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden flex flex-col font-sans text-slate-800">
      
      {/* Toast alert */}
      {toastMsg && (
        <div className="fixed top-16 right-6 z-[9999] bg-slate-900 text-amber-300 px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-2 text-xs font-bold animate-fade-in">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner & Tab Switcher */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200 shrink-0">
            <FlaskConical className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">
                BANDEJA DE ENTRADA LABORATORIO
              </h2>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                STF GROUP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              En <strong>Solicitudes</strong> están los ensayos pendientes por respuesta. En <strong>Historial</strong> las solicitudes ya respondidas a Compras.
            </p>
          </div>
        </div>

        {/* Tab Selector Bar */}
        <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl font-bold text-xs">
          <button
            type="button"
            onClick={() => {
              setSubTab('solicitudes');
              setFiltroEstado('TODOS');
            }}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'solicitudes'
                ? 'bg-white text-blue-900 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>SOLICITUDES POR RESPONDER</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border border-blue-200">
              {muestrasSolicitudes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubTab('historial');
              setFiltroEstado('TODOS');
            }}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'historial'
                ? 'bg-white text-emerald-900 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>HISTORIAL DE RESPUESTAS</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border border-emerald-200">
              {muestrasHistorial.length}
            </span>
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtro Dictamen */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar Solicitud, Referencia, Proveedor, OC..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 font-bold text-[10px] uppercase">Filtro Estado:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(subTab === 'solicitudes' 
              ? ['TODOS', 'PENDIENTE', 'EN_PROCESO'] 
              : ['TODOS', 'APROBADO', 'HALLAZGO', 'RECHAZADO']
            ).map((est) => (
              <button
                key={est}
                type="button"
                onClick={() => setFiltroEstado(est)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                  filtroEstado === est
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {est === 'TODOS' ? 'Todos' : est}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Muestras */}
      <div className="overflow-x-auto max-h-[580px] overflow-y-auto custom-vertical-scroll">
        <table className="w-full text-left text-xs text-slate-800 border-collapse min-w-[900px]">
          <thead className="bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th className="py-3 px-3">SOLICITUD</th>
              <th className="py-3 px-3">FECHA INGRESO</th>
              <th className="py-3 px-3">TELA / REFERENCIA</th>
              <th className="py-3 px-3">PROVEEDOR</th>
              <th className="py-3 px-3">ORDEN COMPRA / LOTE</th>
              <th className="py-3 px-3">COLOR</th>
              <th className="py-3 px-3 text-center">DICTAMEN LAB</th>
              <th className="py-3 px-3 text-center">ACCIÓN</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {itemsFiltrados.length > 0 ? (
              itemsFiltrados.map(({ solicitud, tela, indiceEnSol }, idx) => {
                const dictamen = (tela.dictamen || 'PENDIENTE').toUpperCase();

                return (
                  <tr 
                    key={`${solicitud.id}-${tela.id}-${idx}`}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                        {solicitud.numeroSolicitud}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {tela.fechaIngreso || solicitud.fechaSolicitud || '2026-09-08'}
                    </td>

                    <td className="py-3.5 px-3">
                      <strong className="text-slate-900 font-black block uppercase text-xs">
                        {tela.referencia}
                      </strong>
                      <span className="text-[10px] text-slate-500 font-mono">
                        CÓD: {tela.evaluacionTecnica?.codigoMaterial || 'TEL-001'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-slate-700">
                      {tela.proveedor || solicitud.proveedor}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-emerald-700 font-bold">
                      {tela.ocCol || solicitud.ordenCompra || 'OAC 1107'}
                    </td>

                    <td className="py-3.5 px-3 text-slate-700 font-semibold">
                      {tela.color || 'SNOW'}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase ${
                        dictamen === 'APROBADO'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : dictamen === 'RECHAZADO'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : dictamen === 'HALLAZGO'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}>
                        {dictamen === 'PENDIENTE' ? 'POR EVALUAR' : dictamen}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {subTab === 'solicitudes' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSeleccionarTela(solicitud, tela)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <FlaskConical className="w-3.5 h-3.5" />
                            <span>EVALUAR MUESTRA</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`¿Enviar la solicitud de telas ${solicitud.numeroSolicitud} a la papelera de reciclaje?`)) {
                                eliminarSolicitudTelas(solicitud.id, 'laboratorio');
                              }
                            }}
                            title="Eliminar solicitud (enviar a papelera)"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSeleccionarTela(solicitud, tela)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>VER DETALLE</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExportExcel(tela)}
                            title="Descargar Certificado XLS Excel"
                            className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg border border-emerald-300 transition-all cursor-pointer"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`¿Enviar la solicitud de telas ${solicitud.numeroSolicitud} a la papelera de reciclaje?`)) {
                                eliminarSolicitudTelas(solicitud.id, 'laboratorio');
                              }
                            }}
                            title="Eliminar solicitud (enviar a papelera)"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                  No hay solicitudes de telas en esta pestaña.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
