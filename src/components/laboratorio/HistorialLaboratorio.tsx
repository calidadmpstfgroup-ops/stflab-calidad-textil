import React, { useState } from 'react';
import { SolicitudTelasCompleta, ItemMuestraTela, DictamenType } from '../../types';
import { Badge } from '../common/Badge';
import { History, Search, Filter, ShieldCheck, Check, Calendar, Building2, Tag, Layers, FlaskConical, Printer, FileText } from 'lucide-react';
import { ReporteCalidadPDFModal } from './ReporteCalidadPDFModal';

interface HistorialLaboratorioProps {
  solicitudesTelas: SolicitudTelasCompleta[];
}

export const HistorialLaboratorio: React.FC<HistorialLaboratorioProps> = ({
  solicitudesTelas
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroDictamen, setFiltroDictamen] = useState<string>('TODOS');
  const [modalPDF, setModalPDF] = useState<{ solicitud: SolicitudTelasCompleta; tela: ItemMuestraTela } | null>(null);

  // Obtener todas las telas evaluadas históricamente
  const evaluacionesHistoricas = (solicitudesTelas || []).flatMap((sol) => {
    return (sol.telas || [])
      .filter((t) => t.dictamen && t.dictamen !== 'PENDIENTE')
      .map((t) => ({
        solicitud: sol,
        tela: t
      }));
  });

  const filtradas = evaluacionesHistoricas.filter(({ solicitud, tela }) => {
    const q = (busqueda || '').toLowerCase().trim();
    const numSol = (solicitud.numeroSolicitud || '').toLowerCase();
    const prov = (tela.proveedor || solicitud.proveedor || '').toLowerCase();
    const ref = (tela.referencia || '').toLowerCase();
    const ftCod = (tela.fichaTecnicaUtilizada?.codigoFT || '').toLowerCase();
    const res = (tela.resultadoLab || '').toLowerCase();

    const coincideTexto = !q || numSol.includes(q) || prov.includes(q) || ref.includes(q) || ftCod.includes(q) || res.includes(q);

    if (!coincideTexto) return false;

    if (filtroDictamen === 'TODOS') return true;
    return (tela.dictamen || '').toUpperCase() === filtroDictamen.toUpperCase();
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col space-y-4 p-5">
      
      {/* Encabezado del Historial */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Historial de Evaluaciones y Trazabilidad Técnica ({filtradas.length})
            </h3>
            <p className="text-xs text-slate-400">
              Registro histórico inmutable de ensayos realizados y versiones de Fichas Técnicas aplicadas.
            </p>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar Referencia, FT, Proveedor..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Tabla del Historial */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-inner">
        <table className="w-full text-left text-xs text-slate-200">
          <thead className="bg-[#6ba3df] text-slate-950 font-black uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-3">SOLICITUD</th>
              <th className="py-3 px-3">TELA / REFERENCIA</th>
              <th className="py-3 px-3">PROVEEDOR</th>
              <th className="py-3 px-3">FICHA TÉCNICA UTILIZADA</th>
              <th className="py-3 px-4">RESULTADO DE LABORATORIO</th>
              <th className="py-3 px-3 text-center">DICTAMEN</th>
              <th className="py-3 px-3 text-center">FECHA EVALUACIÓN</th>
              <th className="py-3 px-3 text-center">REPORTE OFICIAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/90 font-medium">
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <FlaskConical className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-bold text-slate-400">No hay registros en el historial con los filtros aplicados</p>
                </td>
              </tr>
            ) : (
              filtradas.map(({ solicitud, tela }) => (
                <tr key={tela.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-amber-300">
                    {tela.solicitudCompra || solicitud.numeroSolicitud}
                  </td>
                  <td className="py-3 px-3 font-extrabold text-white">
                    {tela.referencia}
                  </td>
                  <td className="py-3 px-3 text-blue-300 font-semibold">
                    {tela.proveedor || solicitud.proveedor}
                  </td>
                  <td className="py-3 px-3">
                    {tela.fichaTecnicaUtilizada ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black text-amber-300">
                          {tela.fichaTecnicaUtilizada.codigoFT}
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold border border-emerald-500/30">
                          v{tela.fichaTecnicaUtilizada.version}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">Estándar General</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-300 max-w-sm truncate">
                    {tela.resultadoLab || 'Conforme'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge tipo="dictamen" valor={tela.dictamen || 'APROBADO'} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-400 text-[11px]">
                    {tela.fechaEntrega || tela.fechaIngreso || 'Registrada'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setModalPDF({ solicitud, tela })}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 mx-auto cursor-pointer"
                    >
                      <Printer className="w-3 h-3 text-amber-400" />
                      <span>PDF (DMP-F-001)</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalPDF && (
        <ReporteCalidadPDFModal
          solicitud={modalPDF.solicitud}
          tela={modalPDF.tela}
          onClose={() => setModalPDF(null)}
        />
      )}

    </div>
  );
};
