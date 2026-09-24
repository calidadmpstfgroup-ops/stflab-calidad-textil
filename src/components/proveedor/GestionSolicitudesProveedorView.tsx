import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Link, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  Clock, 
  FileText, 
  Sparkles, 
  Trash2, 
  Building, 
  ShieldCheck
} from 'lucide-react';
import { SolicitudProveedor, Muestra } from '../../types';
import { getPortalPublicUrl } from '../../utils/portalUrl';
import { ModalGenerarSolicitud } from './ModalGenerarSolicitud';
import { ModalRevisionProveedor } from './ModalRevisionProveedor';

export interface GestionSolicitudesProveedorViewProps {
  currentUser?: string;
  muestras?: Muestra[];
  solicitudes: SolicitudProveedor[];
  onAddSolicitud: (solicitud: SolicitudProveedor) => Promise<void> | void;
  onUpdateSolicitud: (id: string, campos: Partial<SolicitudProveedor>) => Promise<void> | void;
  onDeleteSolicitud?: (id: string) => Promise<void> | void;
  onHomologarConLab?: (
    solicitudIdOrSol: string | SolicitudProveedor, 
    muestraTargetId?: string, 
    datosAceptados?: Partial<Muestra>
  ) => Promise<void> | void;
}

export function GestionSolicitudesProveedorView({
  currentUser = 'Calidad STF',
  muestras = [],
  solicitudes = [],
  onAddSolicitud,
  onUpdateSolicitud,
  onDeleteSolicitud,
  onHomologarConLab
}: GestionSolicitudesProveedorViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [isModalGenerarOpen, setIsModalGenerarOpen] = useState(false);
  const [solicitudARevisar, setSolicitudARevisar] = useState<SolicitudProveedor | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyLink = (token: string) => {
    const url = getPortalPublicUrl(token);
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    showToast('¡Enlace del portal copiado al portapapeles!');
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // KPIs
  const stats = useMemo(() => {
    let enviadas = 0;
    let recibidas = 0;
    let homologadas = 0;
    let rechazadas = 0;

    solicitudes.forEach(s => {
      if (s.estado === 'enviado' || s.estado === 'pendiente') enviadas++;
      else if (s.estado === 'recibido') recibidas++;
      else if (s.estado === 'homologado') homologadas++;
      else if (s.estado === 'rechazado') rechazadas++;
    });

    return {
      total: solicitudes.length,
      enviadas,
      recibidas,
      homologadas,
      rechazadas
    };
  }, [solicitudes]);

  const filteredSolicitudes = useMemo(() => {
    return solicitudes.filter(s => {
      if (filtroEstado !== 'todos' && s.estado !== filtroEstado) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchToken = s.token?.toLowerCase().includes(query);
        const matchRef = s.referencia?.toLowerCase().includes(query);
        const matchTela = s.nombreTela?.toLowerCase().includes(query);
        const matchProv = s.proveedor?.toLowerCase().includes(query);
        if (!matchToken && !matchRef && !matchTela && !matchProv) return false;
      }
      return true;
    });
  }, [solicitudes, filtroEstado, searchTerm]);

  const handleHomologarSubmit = async (
    solicitudId: string, 
    muestraAsociadaId?: string, 
    datosAceptados?: Partial<Muestra>
  ) => {
    if (onHomologarConLab) {
      await onHomologarConLab(solicitudId, muestraAsociadaId, datosAceptados);
    } else {
      await onUpdateSolicitud(solicitudId, { estado: 'homologado' });
    }
    setSolicitudARevisar(null);
    showToast('Ficha técnica homologada y transferida con éxito al Laboratorio.');
  };

  const handleRechazarSubmit = async (solicitudId: string, motivo: string) => {
    await onUpdateSolicitud(solicitudId, {
      estado: 'rechazado'
    });
    setSolicitudARevisar(null);
    showToast('La solicitud ha sido marcada como rechazada.');
  };

  return (
    <div className="space-y-5 font-sans text-white">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-amber-300 px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-2 animate-fade-in text-xs font-medium">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-slate-900 text-white px-6 py-5 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏭</span>
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
              Gestión de Solicitudes a Proveedores Textiles
            </h2>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold uppercase border border-amber-500/30">
              PORTAL CON TOKEN
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1 font-light">
            Generación de enlaces seguros con token para recepción y homologación automática de especificaciones técnicas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalGenerarOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Solicitud a Proveedor</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Solicitudes</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-white">{stats.total}</span>
            <Users className="h-5 w-5 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">Enviadas / Esperando</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-sky-400">{stats.enviadas}</span>
            <Clock className="h-5 w-5 text-sky-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Fichas Recibidas</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-amber-400">{stats.recibidas}</span>
            <FileText className="h-5 w-5 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Homologadas</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-emerald-400">{stats.homologadas}</span>
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por proveedor, referencia textil o token..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase">Estado:</span>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
          >
            <option value="todos" className="bg-slate-900">Todos los Estados</option>
            <option value="enviado" className="bg-slate-900">Enviado (Esperando)</option>
            <option value="recibido" className="bg-slate-900">Recibido (Por Homologar)</option>
            <option value="homologado" className="bg-slate-900">Homologado</option>
            <option value="rechazado" className="bg-slate-900">Rechazado</option>
          </select>
        </div>
      </div>

      {/* Solicitudes Table */}
      {filteredSolicitudes.length === 0 ? (
        <div className="bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-800">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No hay solicitudes registradas</h3>
          <p className="text-xs text-slate-500 mt-1">Genere una nueva solicitud para enviar el enlace con token al fabricante.</p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Token & Enlace</th>
                  <th className="py-3 px-4">Proveedor</th>
                  <th className="py-3 px-4">Referencia & Tela</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredSolicitudes.map(sol => {
                  const isCopied = copiedToken === sol.token;
                  return (
                    <tr key={sol.id} className="hover:bg-slate-950/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {sol.token}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(sol.token)}
                            className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                            title="Copiar enlace del portal"
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-slate-500" />
                          <span>{sol.proveedor}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-200 block">{sol.referencia}</span>
                        <span className="text-[11px] text-slate-400">{sol.nombreTela}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${
                          sol.estado === 'recibido' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse' :
                          sol.estado === 'homologado' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {sol.estado === 'recibido' ? '📥 Recibido (Listo)' : sol.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {(sol.estado === 'recibido' || sol.estado === 'homologado' || sol.datosProveedor) && (
                            <button
                              type="button"
                              onClick={() => setSolicitudARevisar(sol)}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1 shadow transition-all cursor-pointer"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>{sol.estado === 'homologado' ? 'Ver Ficha' : 'Homologar'}</span>
                            </button>
                          )}
                          {onDeleteSolicitud && (
                            <button
                              type="button"
                              onClick={() => onDeleteSolicitud(sol.id)}
                              className="p-1 text-slate-500 hover:text-rose-400"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Generar */}
      {isModalGenerarOpen && (
        <ModalGenerarSolicitud
          muestras={muestras}
          currentUser={currentUser}
          onClose={() => setIsModalGenerarOpen(false)}
          onCreated={async (nueva) => {
            await onAddSolicitud(nueva);
            handleCopyLink(nueva.token);
          }}
        />
      )}

      {/* Modal Revisar */}
      {solicitudARevisar && (
        <ModalRevisionProveedor
          solicitud={solicitudARevisar}
          muestrasExistentes={muestras}
          onClose={() => setSolicitudARevisar(null)}
          onHomologar={handleHomologarSubmit}
          onRechazar={handleRechazarSubmit}
        />
      )}

    </div>
  );
}

export default GestionSolicitudesProveedorView;
