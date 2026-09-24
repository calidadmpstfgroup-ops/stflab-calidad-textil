import React, { useState, useMemo } from 'react';
import { SolicitudAccesorios } from '../../types';
import { ModalNuevaSolicitudAccesorios } from './ModalNuevaSolicitudAccesorios';
import * as XLSX from 'xlsx';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  FileSpreadsheet, 
  Clock, 
  Trash2, 
  Send,
  History,
  CheckCircle,
  AlertTriangle,
  Layers,
  Sparkles,
  ClipboardCheck
} from 'lucide-react';

interface ComprasAccesoriosViewProps {
  currentUser?: any;
  solicitudesAccesorios: SolicitudAccesorios[];
  onAddSolicitud: (sol: SolicitudAccesorios) => Promise<void> | void;
  onDeleteSolicitud?: (id: string) => Promise<void> | void;
}

export const ComprasAccesoriosView: React.FC<ComprasAccesoriosViewProps> = ({
  currentUser = null,
  solicitudesAccesorios = [],
  onAddSolicitud,
  onDeleteSolicitud
}) => {
  const [isModalNuevaOpen, setIsModalNuevaOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [subTab, setSubTab] = useState<'activas' | 'historial_respuestas'>('activas');

  const [expandedSolicitudId, setExpandedSolicitudId] = useState<string | null>(
    solicitudesAccesorios[0]?.id || null
  );

  // Clasificar solicitudes: Activas vs Respondidas por Laboratorio
  const solicitudesActivas = useMemo(() => {
    return solicitudesAccesorios.filter(s => 
      s.estadoGeneral !== 'Respondida por Laboratorio' && 
      s.estadoGeneral !== 'Completada / Entregada'
    );
  }, [solicitudesAccesorios]);

  const solicitudesRespondidas = useMemo(() => {
    return solicitudesAccesorios.filter(s => 
      s.estadoGeneral === 'Respondida por Laboratorio' || 
      s.estadoGeneral === 'Completada / Entregada' ||
      s.respuestaLaboratorio
    );
  }, [solicitudesAccesorios]);

  const baseSolicitudes = subTab === 'activas' ? solicitudesActivas : solicitudesRespondidas;

  const totalSolicitudes = solicitudesAccesorios.length;
  const totalMuestras = solicitudesAccesorios.reduce((acc, s) => acc + (s.items?.length || 0), 0);

  const solicitudesFiltradas = baseSolicitudes.filter(sol => {
    const term = searchTerm.toLowerCase().trim();
    const matchTerm = !term || 
      sol.codigoSolicitud?.toLowerCase().includes(term) ||
      sol.titulo?.toLowerCase().includes(term) ||
      (sol.items || []).some(it => 
        it.referencia?.toLowerCase().includes(term) ||
        it.color?.toLowerCase().includes(term) ||
        it.talla?.toLowerCase().includes(term)
      );

    const matchEstado = filtroEstado === 'todos' || sol.estadoGeneral === filtroEstado;
    return matchTerm && matchEstado;
  });

  const handleExportarExcel = (sol: SolicitudAccesorios) => {
    try {
      const rows = (sol.items || []).map((it, idx) => ({
        '# Fila': it.filaNumero || idx + 1,
        'Código Solicitud': sol.codigoSolicitud,
        'Marca': sol.marca || 'STUDIO F',
        'Fecha Solicitud': sol.fechaSolicitud,
        'Referencia': it.referencia,
        'Color': it.color || 'ESTÁNDAR',
        'Talla': it.talla || 'U',
        'QTY (Cantidad)': `${it.cantidad || 1} ${it.unidad || 'UNID'}`,
        'Descripción Insumo': it.descripcion || '',
        'Resultado Lab': it.resultadoLab || 'Pendiente',
        'Observación Lab': it.observacionLab || '',
        'Estado Muestra': it.estadoLab || 'Pendiente'
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Muestras Accesorios');
      XLSX.writeFile(workbook, `${sol.codigoSolicitud}_Accesorios.xlsx`);
    } catch (err) {
      console.error('Error exportando Excel:', err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-white">
      {/* Banner & Sub-Tab Switcher */}
      <div className="bg-[#2B2B2E] border border-[#424246] text-[#FBF8F2] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-[#C6A466]/10 text-[#C6A466] border border-[#C6A466]/20 flex items-center justify-center shrink-0 shadow-md">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest bg-[#C6A466]/15 text-[#C6A466] border border-[#C6A466]/30 px-2.5 py-0.5 rounded-full font-mono">
                MÓDULO COMPRAS • ACCESORIOS E INSUMOS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-[#FBF8F2] mt-1">
              Solicitudes de Muestras de Accesorios
            </h2>
            <p className="text-xs sm:text-sm text-[#A8A095] mt-1 font-medium">
              Datos primordiales: <strong className="text-[#FBF8F2]">Referencia • Color • Talla • QTY</strong>
            </p>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex bg-[#2B2B2E] p-1 rounded-2xl border border-[#3A3A3D]">
            <button
              type="button"
              onClick={() => {
                setSubTab('activas');
                setFiltroEstado('todos');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
                subTab === 'activas'
                  ? 'bg-[#B99B62] text-[#2B2B2E] shadow-md font-extrabold'
                  : 'text-[#A39180] hover:text-[#FBF8F2]'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>📥 Solicitudes Activas ({solicitudesActivas.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubTab('historial_respuestas');
                setFiltroEstado('todos');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
                subTab === 'historial_respuestas'
                  ? 'bg-[#B99B62] text-[#2B2B2E] shadow-md font-extrabold'
                  : 'text-[#A39180] hover:text-[#FBF8F2]'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>📜 Historial Respuestas Lab ({solicitudesRespondidas.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalNuevaOpen(true)}
            className="px-4 py-2 bg-[#2B2B2E] hover:bg-[#3A3A3D] text-[#B99B62] border border-[#B99B62]/40 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Solicitud</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
        <div className="bg-[#FAF7F2] border border-[#E3D9C7] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-[#6B5744] uppercase tracking-wider block mb-1">Total Solicitudes</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-[#2B2B2E]">{totalSolicitudes}</span>
            <Package className="h-5 w-5 text-[#B99B62]" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] border border-[#E3D9C7] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-[#6B5744] uppercase tracking-wider block mb-1">Total Muestras / QTY</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-[#2B2B2E]">{totalMuestras}</span>
            <Layers className="h-5 w-5 text-[#6B5744]" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] border border-[#E3D9C7] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-[#8A7444] uppercase tracking-wider block mb-1">En Evaluación Lab</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-[#8A7444]">{solicitudesActivas.length}</span>
            <Clock className="h-5 w-5 text-[#B99B62]" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] border border-[#E3D9C7] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-[#5F6E54] uppercase tracking-wider block mb-1">Respondidas por Lab</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-[#5F6E54]">{solicitudesRespondidas.length}</span>
            <ClipboardCheck className="h-5 w-5 text-[#8A9680]" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-[#FAF7F2] border border-[#E3D9C7] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-[#6B5744] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Referencia, Color, Talla, Código..."
            className="w-full bg-[#F8FAFC] border border-[#E3D9C7] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2B2B2E] focus:outline-none focus:border-[#B99B62]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#AA9E80] font-bold text-[11px]">Estado:</span>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-[#2B2B2E] border border-[#424246] rounded-xl px-3 py-1.5 text-xs text-[#FBF8F2] font-bold cursor-pointer focus:border-[#C6A466]"
          >
            <option value="todos">Todos los Estados</option>
            <option value="Enviada a Laboratorio">Enviada a Laboratorio</option>
            <option value="En Proceso Laboratorio">En Proceso Laboratorio</option>
            <option value="Respondida por Laboratorio">Respondida por Lab</option>
            <option value="Completada / Entregada">Completada / Entregada</option>
          </select>
        </div>
      </div>

      {/* Listado de Solicitudes de Accesorios */}
      {solicitudesFiltradas.length === 0 ? (
        <div className="bg-[#2D2D30] border border-[#424246] rounded-2xl p-10 text-center shadow-xs">
          <Package className="h-12 w-12 text-[#8A8172] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#FBF8F2] font-display">
            {subTab === 'activas' ? 'No hay solicitudes activas pendientes' : 'No hay respuestas en el historial'}
          </h3>
          <p className="text-xs text-[#AA9E80] mt-1 max-w-md mx-auto">
            {subTab === 'activas'
              ? 'Todas las solicitudes evaluadas por Laboratorio están guardadas en la pestaña "Historial Respuestas Lab".'
              : 'Las solicitudes que reciban respuesta por parte del Laboratorio aparecerán aquí automáticamente.'}
          </p>
          <button
            onClick={() => setIsModalNuevaOpen(true)}
            className="mt-4 px-4 py-2 bg-[#C6A466] hover:bg-[#b59356] text-[#2B2B2E] font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Crear Nueva Solicitud de Accesorios
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudesFiltradas.map((sol, index) => {
            const isExpanded = expandedSolicitudId === sol.id;
            const itemsCount = sol.items?.length || 0;
            const approvedCount = (sol.items || []).filter(i => i.estadoLab === 'Aprobado').length;
            const novedadesCount = (sol.items || []).filter(i => i.estadoLab === 'Novedad' || i.estadoLab === 'Observado').length;
            const tieneRespuestaLab = !!sol.respuestaLaboratorio;

            return (
              <div 
                key={sol.id || `sol-acc-${index}`}
                className={`bg-[#2D2D30] border rounded-2xl shadow-md overflow-hidden transition-all ${
                  tieneRespuestaLab ? 'border-[#C6A466]/40 ring-1 ring-[#C6A466]/20' : 'border-[#424246]'
                }`}
              >
                {/* Cabecera de la Solicitud */}
                <div 
                  onClick={() => setExpandedSolicitudId(isExpanded ? null : sol.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-[#2B2B2E]/60 transition-colors border-b border-[#424246] select-none"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      tieneRespuestaLab 
                        ? 'bg-[#C6A466]/10 border border-[#C6A466]/40 text-[#C6A466]' 
                        : 'bg-[#2B2B2E] border border-[#424246] text-[#C6A466]'
                    }`}>
                      {tieneRespuestaLab ? <ClipboardCheck className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-xs text-[#C6A466] bg-[#2B2B2E] px-2 py-0.5 rounded-md border border-[#424246]">
                          {sol.codigoSolicitud}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-[#FBF8F2]">
                          {sol.titulo || 'Solicitud de Muestras de Accesorios'}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2B2B2E] text-[#AA9E80] border border-[#424246]">
                          {sol.marca || 'STUDIO F'}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          tieneRespuestaLab ? 'bg-[#485C3E]/20 text-[#8ba87e] border-[#485C3E]/30' : 'bg-[#C6A466]/10 text-[#C6A466] border-[#C6A466]/30'
                        }`}>
                          {sol.estadoGeneral}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#AA9E80] mt-1.5">
                        <span>📅 Fecha: <strong className="text-[#FBF8F2]">{sol.fechaSolicitud}</strong></span>
                        <span>👤 Solicitante: <strong className="text-[#FBF8F2]">{sol.solicitante?.nombre || 'Compras'}</strong></span>
                        <span>🔩 Muestras: <strong className="text-[#FBF8F2] font-mono">{itemsCount} refs</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportarExcel(sol);
                      }}
                      className="p-1.5 bg-[#2B2B2E] hover:bg-[#424246] text-[#C6A466] rounded-xl border border-[#424246] transition-colors cursor-pointer"
                      title="Descargar Excel"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <div className="p-1 text-[#AA9E80]">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </div>

                {/* Contenido Expandido: Tabla con DATOS PRIMORDIALES (Referencia, Color, Talla, QTY) */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-[#2B2B2E] space-y-4">
                    
                    {/* Banner de Respuesta de Lab si existe */}
                    {sol.respuestaLaboratorio && (
                      <div className="p-3.5 bg-[#2D2D30] border border-[#C6A466]/40 rounded-xl text-xs space-y-1 text-[#FBF8F2]">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold uppercase text-[#C6A466]">
                            📢 Respuesta Oficial de Laboratorio: {sol.respuestaLaboratorio.dictamenGeneral}
                          </span>
                          <span className="font-mono text-[10px] text-[#AA9E80]">
                            {sol.respuestaLaboratorio.fechaRespuesta} por {sol.respuestaLaboratorio.respondidoPor}
                          </span>
                        </div>
                        <p className="italic text-[#AA9E80] text-[11px]">
                          &ldquo;{sol.respuestaLaboratorio.observacionesGenerales}&rdquo;
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-[#AA9E80]">
                      <span className="font-bold uppercase text-[10px] text-[#C6A466] tracking-wider">
                        Campos Primordiales Compras: Referencia • Color • Talla • QTY (Cantidad)
                      </span>
                    </div>

                    {/* Tabla Principal */}
                    <div className="overflow-x-auto border border-[#424246] rounded-2xl bg-[#2D2D30]">
                      <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                        <thead className="bg-[#2B2B2E] text-[#AA9E80] uppercase text-[10px] font-bold border-b border-[#424246]">
                          <tr>
                            <th className="p-3 w-10 text-center">#</th>
                            <th className="p-3 bg-[#C6A466]/10 text-[#C6A466] font-extrabold min-w-[140px]">1. REFERENCIA *</th>
                            <th className="p-3 bg-[#C6A466]/10 text-[#C6A466] font-extrabold min-w-[110px]">2. COLOR *</th>
                            <th className="p-3 bg-[#C6A466]/10 text-[#C6A466] font-extrabold min-w-[90px]">3. TALLA *</th>
                            <th className="p-3 bg-[#C6A466]/10 text-[#C6A466] font-extrabold min-w-[100px]">4. QTY (CANTIDAD) *</th>
                            <th className="p-3 min-w-[160px]">Descripción Insumo</th>
                            <th className="p-3 text-[#C6A466] min-w-[160px]">Resultado / Novedad Lab</th>
                            <th className="p-3 text-center min-w-[100px]">Estado Lab</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#424246] text-[#FBF8F2] font-medium">
                          {(sol.items || []).map((item, itIdx) => (
                            <tr key={item.id || `acc-item-${itIdx}`} className="hover:bg-[#2B2B2E]/60 transition-colors">
                              {/* # */}
                              <td className="p-3 text-center font-mono font-bold text-[#8A8172]">
                                {item.filaNumero || itIdx + 1}
                              </td>

                              {/* 1. REFERENCIA */}
                              <td className="p-3 font-mono font-black text-[#FBF8F2] text-xs">
                                {item.referencia}
                              </td>

                              {/* 2. COLOR */}
                              <td className="p-3 font-bold text-[#FBF8F2]">
                                {item.color || 'ESTÁNDAR'}
                              </td>

                              {/* 3. TALLA */}
                              <td className="p-3 font-bold text-[#FBF8F2]">
                                {item.talla || 'U'}
                              </td>

                              {/* 4. QTY (CANTIDAD) */}
                              <td className="p-3 font-mono font-bold text-[#C6A466] text-xs">
                                {item.cantidad || 1} {item.unidad || 'UNID'}
                              </td>

                              {/* Descripción */}
                              <td className="p-3 text-[#AA9E80] text-[11px]">
                                {item.descripcion || '—'}
                              </td>

                              {/* Resultado Lab */}
                              <td className="p-3 text-[#FBF8F2] italic text-[11px]">
                                {item.observacionLab || item.resultadoLab || <span className="text-[#8A8172]">Pendiente</span>}
                              </td>

                              {/* Estado Lab */}
                              <td className="p-3 text-center">
                                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${
                                  item.estadoLab === 'Aprobado' ? 'bg-[#485C3E]/20 text-[#8ba87e] border-[#485C3E]/30' :
                                  item.estadoLab === 'Rechazado' ? 'bg-[#8C3D35]/20 text-[#e07a70] border-[#8C3D35]/30' :
                                  'bg-[#2B2B2E] text-[#AA9E80] border-[#424246]'
                                }`}>
                                  {item.estadoLab || 'Pendiente'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isModalNuevaOpen && (
        <ModalNuevaSolicitudAccesorios
          currentUser={currentUser}
          solicitudesExistentes={solicitudesAccesorios}
          onSave={async (nueva) => {
            await onAddSolicitud(nueva);
            setExpandedSolicitudId(nueva.id);
          }}
          onClose={() => setIsModalNuevaOpen(false)}
        />
      )}
    </div>
  );
};

export default ComprasAccesoriosView;
