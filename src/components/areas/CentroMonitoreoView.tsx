import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuality } from '../../context/QualityContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  AuditLogEntry, 
  SesionUsuarioMonitoreo, 
  EventoErrorMonitoreo, 
  KpisCentroMonitoreo 
} from '../../types';
import { 
  esUsuarioAdminOSoporte,
  obtenerLogsAuditoria, 
  obtenerSesionesMonitoreo, 
  calcularKpisMonitoreo,
  calcularDistribucionModulosEnVivo,
  obtenerErroresRecientes,
  exportarAuditoriaCSV,
  calcularTiempoRelativo
} from '../../services/monitoringService';
import { 
  Activity, 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Grid, 
  AlertTriangle, 
  Lock, 
  RefreshCw, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock, 
  Calendar, 
  Server, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Laptop, 
  ChevronRight, 
  X, 
  ArrowUpRight, 
  Radio, 
  History, 
  Layers, 
  FileText, 
  Sparkles,
  User,
  Shield,
  Copy,
  Check
} from 'lucide-react';

export const CentroMonitoreoView: React.FC = () => {
  const { usuario } = useAuth();
  const { setAreaActual } = useQuality();
  const { t } = useLanguage();
  const { theme } = useTheme();

  // 1. CONTROL DE ACCESO ESTRICTO: Solo Administradores y rol soporte_tecnico
  const tieneAcceso = esUsuarioAdminOSoporte(usuario);

  // Estados de datos
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [sesiones, setSesiones] = useState<SesionUsuarioMonitoreo[]>([]);
  const [cargando, setCargando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());
  const [relojActual, setRelojActual] = useState<string>('');

  // Pestaña Principal: 'vivo' (EN VIVO) o 'historial' (HISTORIAL)
  const [vistaActiva, setVistaActiva] = useState<'vivo' | 'historial'>('vivo');

  // Buscador general de cabecera
  const [busquedaGeneral, setBusquedaGeneral] = useState<string>('');

  // Modales / Drawers de inspección
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<SesionUsuarioMonitoreo | null>(null);
  const [accionSeleccionada, setAccionSeleccionada] = useState<AuditLogEntry | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  // Filtros de la Vista HISTORIAL
  const [filtroFechaRango, setFiltroFechaRango] = useState<'hoy' | 'ayer' | 'semana' | 'todos'>('todos');
  const [filtroUsuario, setFiltroUsuario] = useState<string>('todos');
  const [filtroArea, setFiltroArea] = useState<string>('todos');
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [filtroModulo, setFiltroModulo] = useState<string>('todos');
  const [filtroTipoAccion, setFiltroTipoAccion] = useState<string>('todos');
  const [filtroResultado, setFiltroResultado] = useState<string>('todos');

  // Intervalo de auto-refresco en vivo (en segundos)
  const [intervaloAutoRefresco, setIntervaloAutoRefresco] = useState<number>(5);

  // Carga inicial y refresco manual
  const refrescarDatos = () => {
    setCargando(true);
    const logsActuales = obtenerLogsAuditoria();
    const sesionesActuales = obtenerSesionesMonitoreo();
    setLogs(logsActuales);
    setSesiones(sesionesActuales);
    setUltimaActualizacion(new Date());
    setTimeout(() => setCargando(false), 300);
  };

  useEffect(() => {
    refrescarDatos();
  }, []);

  // Reloj en tiempo real
  useEffect(() => {
    const actualizarReloj = () => {
      const ahora = new Date();
      setRelojActual(
        ahora.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    actualizarReloj();
    const timerId = setInterval(actualizarReloj, 1000);
    return () => clearInterval(timerId);
  }, []);

  // Auto-refresco periódico en vivo sin recargar la página
  useEffect(() => {
    if (intervaloAutoRefresco <= 0) return;
    const intervalId = setInterval(() => {
      // Actualizar tiempos relativos de las sesiones existentes
      setSesiones(prev =>
        prev.map(s => ({
          ...s,
          ultimaActividadRelativa: calcularTiempoRelativo(s.ultimaActividad)
        }))
      );
      setUltimaActualizacion(new Date());
    }, intervaloAutoRefresco * 1000);

    return () => clearInterval(intervalId);
  }, [intervaloAutoRefresco]);

  // Cálculos reactivos con datos reales de STFLAB
  const kpis: KpisCentroMonitoreo = useMemo(() => {
    return calcularKpisMonitoreo(sesiones, logs);
  }, [sesiones, logs]);

  const distribucionModulos = useMemo(() => {
    return calcularDistribucionModulosEnVivo(sesiones);
  }, [sesiones]);

  const erroresRecientes: EventoErrorMonitoreo[] = useMemo(() => {
    return obtenerErroresRecientes(logs);
  }, [logs]);

  // Filtrado de usuarios conectados en vivo
  const sesionesFiltradas = useMemo(() => {
    if (!busquedaGeneral.trim()) return sesiones;
    const q = busquedaGeneral.toLowerCase().trim();
    return sesiones.filter(s =>
      s.nombreCompleto.toLowerCase().includes(q) ||
      s.area.toLowerCase().includes(q) ||
      s.rol.toLowerCase().includes(q) ||
      s.moduloActual.toLowerCase().includes(q) ||
      s.accionRealizada.toLowerCase().includes(q)
    );
  }, [sesiones, busquedaGeneral]);

  // Filtrado de la vista Historial
  const logsHistorialFiltrados = useMemo(() => {
    const hoyStr = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const ayerStr = ayer.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hace7dias = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return logs.filter(log => {
      // Filtro de texto / buscador
      if (busquedaGeneral.trim()) {
        const q = busquedaGeneral.toLowerCase().trim();
        const coincideTexto =
          (log.nombreCompleto || '').toLowerCase().includes(q) ||
          (log.user || '').toLowerCase().includes(q) ||
          (log.modulo || '').toLowerCase().includes(q) ||
          (log.action || '').toLowerCase().includes(q) ||
          (log.idRegistro || '').toLowerCase().includes(q) ||
          (log.registroAfectado || '').toLowerCase().includes(q) ||
          (log.area || '').toLowerCase().includes(q);
        if (!coincideTexto) return false;
      }

      // Filtro por Rango de Fecha
      if (filtroFechaRango === 'hoy' && log.fecha !== hoyStr) return false;
      if (filtroFechaRango === 'ayer' && log.fecha !== ayerStr) return false;
      if (filtroFechaRango === 'semana') {
        const logDate = new Date(log.timestamp).getTime();
        if (logDate < hace7dias) return false;
      }

      // Filtro Usuario
      if (filtroUsuario !== 'todos' && log.userId !== filtroUsuario && log.user !== filtroUsuario) {
        return false;
      }

      // Filtro Área
      if (filtroArea !== 'todos' && log.area?.toLowerCase() !== filtroArea.toLowerCase()) {
        return false;
      }

      // Filtro Rol
      if (filtroRol !== 'todos' && log.userRole !== filtroRol && log.rolEspecifico !== filtroRol) {
        return false;
      }

      // Filtro Módulo
      if (filtroModulo !== 'todos' && log.modulo?.toLowerCase() !== filtroModulo.toLowerCase()) {
        return false;
      }

      // Filtro Tipo de Acción
      if (filtroTipoAccion !== 'todos' && log.tipoAccion !== filtroTipoAccion) {
        return false;
      }

      // Filtro Resultado
      if (filtroResultado !== 'todos') {
        if (filtroResultado === 'Exitoso' && log.resultado !== 'Exitoso') return false;
        if (filtroResultado === 'Error' && log.resultado !== 'Error') return false;
      }

      return true;
    });
  }, [
    logs,
    busquedaGeneral,
    filtroFechaRango,
    filtroUsuario,
    filtroArea,
    filtroRol,
    filtroModulo,
    filtroTipoAccion,
    filtroResultado
  ]);

  const copiarTextoPortapapeles = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  // 2. VISTA DE ACCESO DENEGADO SI NO ES ADMIN NI SOPORTE TÉCNICO
  if (!tieneAcceso) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#132247] rounded-3xl p-8 border border-rose-200 dark:border-rose-900/50 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wide">
              Acceso Restringido
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              El módulo <strong>Centro de Monitoreo</strong> y la auditoría de STFLAB están reservados exclusivamente para personal de <strong>Administración</strong> y <strong>Soporte Técnico</strong>.
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-[#091124] rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-mono">
            Tu rol actual: <span className="font-bold text-slate-800 dark:text-slate-200">{usuario?.rolEspecifico || usuario?.role || 'Consulta'}</span>
          </div>
          <button
            type="button"
            onClick={() => setAreaActual('dashboard')}
            className="w-full py-3 bg-[#00b4d8] hover:bg-[#0096c7] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* =========================================================================
          2. ENCABEZADO DEL CENTRO DE MONITOREO
         ========================================================================= */}
      <div className="bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-[#1e3461] rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 transition-all">
        
        {/* Identidad del Módulo */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <Activity className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase font-display">
                Centro de Monitoreo
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>En Vivo</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-mono">
                Soporte Técnico
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Supervisión de usuarios, sesiones y actividad de STFLAB en tiempo real
            </p>
          </div>
        </div>

        {/* Estado del Sistema, Reloj, Buscador & Acciones */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Chip de Estado del Sistema */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] text-xs font-bold text-slate-700 dark:text-slate-200">
            <Server className="w-4 h-4 text-emerald-500" />
            <div className="text-left">
              <div className="text-[10px] uppercase text-slate-400 font-mono">Estado Sistema</div>
              <div className="text-emerald-600 dark:text-emerald-400 text-xs font-black">Operativo 100%</div>
            </div>
          </div>

          {/* Fecha y Hora en Vivo */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
            <Clock className="w-4 h-4 text-cyan-500" />
            <div className="text-left">
              <div className="text-[10px] uppercase text-slate-400">Hora Actual</div>
              <div className="text-slate-900 dark:text-white font-black">{relojActual || '08:32:15 AM'}</div>
            </div>
          </div>

          {/* Buscador General */}
          <div className="relative min-w-[220px] sm:min-w-[260px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busquedaGeneral}
              onChange={(e) => setBusquedaGeneral(e.target.value)}
              placeholder="Buscar usuario, módulo, acción o código..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#00b4d8]"
            />
          </div>

          {/* Botón Actualizar */}
          <button
            type="button"
            onClick={refrescarDatos}
            disabled={cargando}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00b4d8] hover:bg-[#0096c7] text-white rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Refrescar estado de auditoría y sesiones en vivo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

        </div>

      </div>

      {/* =========================================================================
          3. TARJETAS SUPERIORES (KPIs EN TIEMPO REAL)
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* 1. Usuarios Conectados */}
        <div className="bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-[#1e3461] rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Usuarios Conectados
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {kpis.usuariosConectados}
            </span>
            <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              En línea ahora
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Supervisión simultánea STFLAB
          </div>
        </div>

        {/* 2. Usuarios Activos Hoy */}
        <div className="bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-[#1e3461] rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Usuarios Activos Hoy
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
              <UserCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {kpis.usuariosActivosHoy}
            </span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              usuarios únicos
            </span>
          </div>
          <div className="text-[11px] text-emerald-500 font-medium truncate">
            {kpis.totalSesionesDia} sesiones registradas hoy
          </div>
        </div>

        {/* 3. Módulos en Uso */}
        <div className="bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-[#1e3461] rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Módulos en Uso
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Grid className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {kpis.modulosEnUso}
            </span>
            <span className="text-[11px] font-bold text-indigo-400">
              en operación
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Top: <strong>{kpis.moduloMasUtilizado}</strong>
          </div>
        </div>

        {/* 4. Alertas / Errores */}
        <div className="bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-[#1e3461] rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Alertas / Errores
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {kpis.alertasErrores}
            </span>
            <span className={`text-[11px] font-bold ${kpis.alertasErrores > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {kpis.alertasErrores > 0 ? 'Requieren revisión' : 'Todo en orden'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            {kpis.erroresDelDia} eventos anómalos hoy
          </div>
        </div>

        {/* 5. Sesiones Activas */}
        <div className="bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-[#1e3461] rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-amber-500/50 transition-all col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sesiones Activas
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Lock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {kpis.sesionesActivas}
            </span>
            <span className="text-[11px] font-bold text-amber-500">
              sesiones abiertas
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Promedio: {kpis.tiempoPromedioSesionMin} min / sesión
          </div>
        </div>

      </div>

      {/* =========================================================================
          4. NAVEGADOR DE PESTAÑAS (EN VIVO vs HISTORIAL)
         ========================================================================= */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e3461] pb-2">
        <div className="flex items-center gap-2">
          
          {/* Pestaña 1: EN VIVO */}
          <button
            type="button"
            onClick={() => setVistaActiva('vivo')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              vistaActiva === 'vivo'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-[#132247] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <Radio className="w-4 h-4" />
            <span>Vista 1 — En Vivo</span>
          </button>

          {/* Pestaña 2: HISTORIAL */}
          <button
            type="button"
            onClick={() => setVistaActiva('historial')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              vistaActiva === 'historial'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-100 dark:bg-[#132247] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Vista 2 — Historial</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
              {logs.length}
            </span>
          </button>

        </div>

        {/* Frecuencia de Actualización en Tiempo Real */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>Actualización:</span>
          <select
            value={intervaloAutoRefresco}
            onChange={(e) => setIntervaloAutoRefresco(Number(e.target.value))}
            className="bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
          >
            <option value="3">Cada 3 s</option>
            <option value="5">Cada 5 s (Recomendado)</option>
            <option value="15">Cada 15 s</option>
            <option value="30">Cada 30 s</option>
            <option value="0">Pausado</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          CONTENIDO SEGÚN LA VISTA SELECCIONADA
         ========================================================================= */}

      {vistaActiva === 'vivo' ? (
        /* =========================================================================
            🟢 VISTA 1 — EN VIVO
           ========================================================================= */
        <div className="space-y-6">
          
          {/* TABLA PRINCIPAL: USUARIOS CONECTADOS AHORA */}
          <div className="bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-[#1e3461] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1e3461] pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500" />
                  Usuarios Conectados Ahora
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Supervisión activa con acción reciente obligatoria, módulo actual y tiempo de inactividad
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                {sesionesFiltradas.length} usuarios monitoreados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-[#132247] text-slate-600 dark:text-slate-300 uppercase text-[10px] font-black tracking-wider border-b border-slate-200 dark:border-[#1e3461]">
                  <tr>
                    <th className="p-3.5 text-center">Estado</th>
                    <th className="p-3.5">Usuario</th>
                    <th className="p-3.5">Área</th>
                    <th className="p-3.5">Rol</th>
                    <th className="p-3.5 text-center">Entrada</th>
                    <th className="p-3.5 text-center">Última Actividad</th>
                    <th className="p-3.5">Módulo Actual</th>
                    <th className="p-3.5">Acción Realizada</th>
                    <th className="p-3.5 text-center">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e3461]/60 font-medium">
                  {sesionesFiltradas.map((sesion) => {
                    const esConectado = sesion.estado === 'CONECTADO';
                    const esInactivo = sesion.estado === 'INACTIVO';

                    return (
                      <tr 
                        key={sesion.id} 
                        className="hover:bg-slate-50/80 dark:hover:bg-[#132247]/50 transition-colors"
                      >
                        {/* Estado */}
                        <td className="p-3.5 text-center">
                          <span 
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black shadow-xs ${
                              esConectado 
                                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
                                : esInactivo 
                                ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' 
                                : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                            }`}
                            title={esConectado ? '🟢 Conectado' : esInactivo ? '🟡 Inactivo' : '🔴 Desconectado'}
                          >
                            {esConectado ? '🟢' : esInactivo ? '🟡' : '🔴'}
                          </span>
                        </td>

                        {/* Usuario */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                              {sesion.nombreCompleto.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <div className="font-extrabold text-slate-900 dark:text-white truncate">
                                {sesion.nombreCompleto}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">
                                {sesion.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Área */}
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase bg-slate-100 dark:bg-[#132247] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3461]">
                            {sesion.area}
                          </span>
                        </td>

                        {/* Rol */}
                        <td className="p-3.5">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {sesion.rolEspecifico || sesion.rol}
                          </span>
                        </td>

                        {/* Entrada */}
                        <td className="p-3.5 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {sesion.horaEntrada}
                        </td>

                        {/* Última Actividad */}
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                            esConectado 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>
                            {sesion.ultimaActividadRelativa}
                          </span>
                        </td>

                        {/* Módulo Actual */}
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                            {sesion.moduloActual}
                          </span>
                        </td>

                        {/* Acción Realizada (OBLIGATORIA) */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"></span>
                            <span className="truncate max-w-[200px]" title={sesion.accionRealizada}>
                              {sesion.accionRealizada}
                            </span>
                          </div>
                        </td>

                        {/* Botón Ver Detalle */}
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => setUsuarioSeleccionado(sesion)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-cyan-500 hover:text-white dark:bg-[#132247] dark:hover:bg-cyan-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                            title="Ver detalles de sesión e historial de actividad"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver</span>
                          </button>
                        </td>

                      </tr>
                    );
                  })}

                  {sesionesFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Users className="w-8 h-8 text-slate-400 opacity-60" />
                          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No hay sesiones activas en este momento</p>
                          <p className="text-xs text-slate-400">Las sesiones de usuarios autenticados en STFLAB se mostrarán aquí en tiempo real.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* GRID: ACTIVIDAD POR MÓDULO (5) vs ACTIVIDAD RECIENTE (6) vs ERRORES (7) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 5. ACTIVIDAD POR MÓDULO — EN VIVO (4 cols) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-[#1e3461] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e3461] pb-3">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                  <Grid className="w-4 h-4 text-cyan-500" />
                  Actividad por Módulo
                </h4>
                <span className="text-[10px] font-mono text-slate-400">En Vivo</span>
              </div>

              <div className="space-y-3">
                {distribucionModulos.map((item) => (
                  <div key={item.modulo} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-200 truncate">{item.modulo}</span>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400">
                        {item.usuarios} {item.usuarios === 1 ? 'usuario' : 'usuarios'}
                      </span>
                    </div>
                    {/* Barra de Progreso */}
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-[#132247] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.usuarios > 0 ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        style={{ width: `${Math.max(item.usuarios > 0 ? 12 : 2, item.porcentaje)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. ACTIVIDAD RECIENTE — EN VIVO (4 cols) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-[#1e3461] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e3461] pb-3">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Actividad Reciente
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Cronológico</span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {logs.length > 0 ? (
                  logs.slice(0, 7).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setAccionSeleccionada(item)}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-[#132247]/70 border border-slate-200 dark:border-[#1e3461] hover:border-cyan-500/50 transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] text-slate-400 font-bold">{item.hora}</span>
                        <strong className="text-slate-900 dark:text-white truncate max-w-[130px]">{item.nombreCompleto}</strong>
                      </div>
                      <div className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400">
                        {item.modulo}
                      </div>
                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <span className="text-slate-700 dark:text-slate-200 truncate">{item.action}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          item.resultado === 'Error'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {item.resultado === 'Error' ? '🔴 Error' : '✓ Exitoso'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 font-medium">
                    <Activity className="w-8 h-8 text-cyan-500 mx-auto mb-2 opacity-80" />
                    No hay actividad reciente registrada en el sistema.
                  </div>
                )}
              </div>
            </div>

            {/* 7. ERRORES RECIENTES — EN VIVO (4 cols) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-[#1e3461] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e3461] pb-3">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Errores Recientes
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-rose-500/10 text-rose-500">
                  {erroresRecientes.length} Detectados
                </span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {erroresRecientes.length > 0 ? (
                  erroresRecientes.map((err) => (
                    <div
                      key={err.id}
                      onClick={() => {
                        const original = logs.find(l => l.id === err.id);
                        if (original) setAccionSeleccionada(original);
                      }}
                      className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 hover:border-rose-500 transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">{err.hora}</span>
                        <strong className="text-slate-900 dark:text-white">{err.usuario}</strong>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{err.modulo} • {err.accion}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          err.estado === 'CRITICO' 
                            ? 'bg-rose-500 text-white' 
                            : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                        }`}>
                          {err.estado === 'CRITICO' ? '🔴 Crítico' : '🟡 En revisión'}
                        </span>
                      </div>
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium truncate pt-1">
                        {err.error}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 font-medium">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    No se han registrado errores recientes en el sistema.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* =========================================================================
            🔵 VISTA 2 — HISTORIAL (AUDITORÍA COMPLETA)
           ========================================================================= */
        <div className="space-y-6">
          
          {/* BARRA DE FILTROS DEL HISTORIAL (Section 11) */}
          <div className="bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-[#1e3461] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1e3461] pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-500" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Filtros de Auditoría Histórica
                </h4>
              </div>

              {/* Botón Exportar CSV */}
              <button
                type="button"
                onClick={() => exportarAuditoriaCSV(logsHistorialFiltrados)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                title="Exportar registros filtrados a formato Excel CSV con UTF-8"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>

            {/* Selectores de Filtro */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              
              {/* Rango de Fecha */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rango Fecha:</label>
                <select
                  value={filtroFechaRango}
                  onChange={(e) => setFiltroFechaRango(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] rounded-xl p-2 font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="todos">Todas las Fechas</option>
                  <option value="hoy">Hoy</option>
                  <option value="ayer">Ayer</option>
                  <option value="semana">Últimos 7 días</option>
                </select>
              </div>

              {/* Usuario */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Usuario:</label>
                <select
                  value={filtroUsuario}
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] rounded-xl p-2 font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="todos">Todos los Usuarios</option>
                  {Array.from(new Set(logs.map(l => l.nombreCompleto || l.user))).map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Área */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Área:</label>
                <select
                  value={filtroArea}
                  onChange={(e) => setFiltroArea(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] rounded-xl p-2 font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="todos">Todas las Áreas</option>
                  <option value="laboratorio">Laboratorio</option>
                  <option value="compras">Compras</option>
                  <option value="patronaje">Patronaje</option>
                  <option value="corte">Corte</option>
                  <option value="biblioteca">Biblioteca</option>
                  <option value="documentos">Documentos</option>
                  <option value="dashboard">Dashboard</option>
                </select>
              </div>

              {/* Módulo */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Módulo:</label>
                <select
                  value={filtroModulo}
                  onChange={(e) => setFiltroModulo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] rounded-xl p-2 font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="todos">Todos los Módulos</option>
                  <option value="Ensayos">Ensayos</option>
                  <option value="Solicitudes de Compras">Solicitudes</option>
                  <option value="Muestras">Muestras</option>
                  <option value="Fichas Técnicas">Fichas Técnicas</option>
                  <option value="Documentos">Documentos</option>
                  <option value="Moldes y Patronaje">Patronaje</option>
                  <option value="Corte y Tendido">Corte</option>
                </select>
              </div>

              {/* Tipo de Acción */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo Acción:</label>
                <select
                  value={filtroTipoAccion}
                  onChange={(e) => setFiltroTipoAccion(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] rounded-xl p-2 font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="todos">Todos los Tipos</option>
                  <option value="CREACION">Creación</option>
                  <option value="EDICION">Edición</option>
                  <option value="ELIMINACION">Eliminación</option>
                  <option value="CONSULTA">Consulta</option>
                  <option value="REGISTRO_RESULTADO">Resultado</option>
                  <option value="APROBACION">Aprobación</option>
                  <option value="ERROR">Error</option>
                  <option value="LOGIN">Login</option>
                </select>
              </div>

              {/* Resultado */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Resultado:</label>
                <select
                  value={filtroResultado}
                  onChange={(e) => setFiltroResultado(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] rounded-xl p-2 font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="todos">Todos los Resultados</option>
                  <option value="Exitoso">✓ Exitoso</option>
                  <option value="Error">🔴 Error</option>
                </select>
              </div>

            </div>
          </div>

          {/* TABLA HISTORIAL (Section 10) */}
          <div className="bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-[#1e3461] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e3461] pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                Historial de Auditoría de STFLAB
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500">
                Mostrando {logsHistorialFiltrados.length} de {logs.length} eventos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-[#132247] text-slate-600 dark:text-slate-300 uppercase text-[10px] font-black tracking-wider border-b border-slate-200 dark:border-[#1e3461]">
                  <tr>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Hora</th>
                    <th className="p-3.5">Usuario</th>
                    <th className="p-3.5">Área</th>
                    <th className="p-3.5">Módulo</th>
                    <th className="p-3.5">Acción</th>
                    <th className="p-3.5">Registro</th>
                    <th className="p-3.5 text-center">Resultado</th>
                    <th className="p-3.5 text-center">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e3461]/60 font-medium">
                  {logsHistorialFiltrados.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setAccionSeleccionada(log)}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#132247]/50 transition-colors cursor-pointer"
                    >
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300 font-bold whitespace-nowrap">
                        {log.fecha || '29/09/2026'}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500 font-bold whitespace-nowrap">
                        {log.hora || '08:25:10'}
                      </td>
                      <td className="p-3.5 font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                        {log.nombreCompleto || log.user}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-[#132247] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3461]">
                          {log.area}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                        {log.modulo}
                      </td>
                      <td className="p-3.5 font-extrabold text-slate-800 dark:text-slate-100">
                        {log.action}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        {log.idRegistro || log.registroAfectado || '--'}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          log.resultado === 'Error'
                            ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {log.resultado === 'Error' ? 'Error' : 'Exitoso'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAccionSeleccionada(log);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#132247] text-slate-600 dark:text-slate-200 hover:bg-blue-600 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}

                  {logsHistorialFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-xs text-slate-400 font-medium">
                        No se encontraron registros de auditoría con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          14. INDICADORES DEL SISTEMA (PARTE INFERIOR)
         ========================================================================= */}
      <div className="bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-[#1e3461] rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-500" />
          Indicadores Globales del Sistema STFLAB
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461]">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Conectados</div>
            <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 font-mono mt-1">
              {kpis.usuariosConectados}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461]">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Activos Hoy</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {kpis.usuariosActivosHoy}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461]">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Sesiones Día</div>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">
              {kpis.totalSesionesDia}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461]">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Top Módulo</div>
            <div className="text-xs font-black text-indigo-500 truncate mt-2 font-display">
              {kpis.moduloMasUtilizado}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461]">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Errores Día</div>
            <div className={`text-xl font-black font-mono mt-1 ${kpis.erroresDelDia > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {kpis.erroresDelDia}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461]">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Actividades</div>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">
              {kpis.actividadesRegistradas}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#132247] border border-slate-200 dark:border-[#1e3461] col-span-2 sm:col-span-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Tiempo Prom.</div>
            <div className="text-xl font-black text-amber-500 font-mono mt-1">
              {kpis.tiempoPromedioSesionMin} min
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          8. DETALLE DE USUARIO — PANEL LATERAL / DRAWER (EN VIVO)
         ========================================================================= */}
      {usuarioSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0b1329] border-l border-slate-200 dark:border-[#17254e] shadow-2xl h-full flex flex-col justify-between overflow-hidden">
            
            {/* Header del Drawer */}
            <div className="p-6 border-b border-slate-100 dark:border-[#17254e] flex items-center justify-between bg-slate-50 dark:bg-[#091124]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-black text-base flex items-center justify-center shadow-md">
                  {usuarioSeleccionado.nombreCompleto.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {usuarioSeleccionado.nombreCompleto}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    🟢 Activa
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUsuarioSeleccionado(null)}
                className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-[#132247] hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadatos del Usuario */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <div className="bg-slate-50 dark:bg-[#132247] rounded-2xl p-4 border border-slate-200 dark:border-[#1e3461] space-y-2.5 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Área:</span>
                  <strong className="text-slate-900 dark:text-white capitalize">{usuarioSeleccionado.area}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Rol:</span>
                  <strong className="text-slate-900 dark:text-white">{usuarioSeleccionado.rolEspecifico || usuarioSeleccionado.rol}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Sesión iniciada:</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{usuarioSeleccionado.horaEntradaCompleta || usuarioSeleccionado.horaEntrada}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Última actividad:</span>
                  <strong className="text-cyan-600 dark:text-cyan-400 font-mono">{usuarioSeleccionado.ultimaActividadRelativa}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Módulo actual:</span>
                  <strong className="text-indigo-500 font-black">{usuarioSeleccionado.moduloActual}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Dispositivo:</span>
                  <strong className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{usuarioSeleccionado.dispositivo}</strong>
                </div>
              </div>

              {/* Historial de esta sesión */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#1e3461] pb-2">
                  Historial de esta sesión
                </h4>

                <div className="space-y-2 relative pl-4 border-l-2 border-cyan-500/30">
                  {usuarioSeleccionado.historialAcciones.map((h, idx) => (
                    <div key={h.id || idx} className="relative space-y-0.5 text-xs py-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 absolute -left-[21px] top-2 border-2 border-white dark:border-[#0b1329]"></div>
                      <div className="font-mono text-[11px] text-slate-400 font-bold">{h.hora}</div>
                      <div className="font-extrabold text-cyan-600 dark:text-cyan-400 text-xs">{h.modulo}</div>
                      <div className="text-slate-800 dark:text-slate-100 font-medium">{h.accion}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer del Drawer */}
            <div className="p-4 border-t border-slate-100 dark:border-[#17254e] bg-slate-50 dark:bg-[#091124] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setUsuarioSeleccionado(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-[#132247] hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Cerrar Panel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          9. DETALLE COMPLETO DE UNA ACCIÓN (MODAL TRAZABILIDAD)
         ========================================================================= */}
      {accionSeleccionada && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-lg w-full bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-[#1e3461] rounded-3xl p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e3461] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wide">
                    Detalle de la Acción
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID: {accionSeleccionada.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAccionSeleccionada(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#132247] text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Matriz Completa de Trazabilidad */}
            <div className="space-y-2.5 text-xs bg-slate-50 dark:bg-[#132247] p-4 rounded-2xl border border-slate-200 dark:border-[#1e3461]">
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400 font-bold">Usuario:</span>
                <strong className="text-slate-900 dark:text-white text-sm">{accionSeleccionada.nombreCompleto || accionSeleccionada.user}</strong>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400 font-bold">Área:</span>
                <strong className="text-slate-900 dark:text-white capitalize">{accionSeleccionada.area}</strong>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400 font-bold">Módulo:</span>
                <strong className="text-cyan-600 dark:text-cyan-400 font-bold">{accionSeleccionada.modulo}</strong>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400 font-bold">Acción:</span>
                <strong className="text-slate-900 dark:text-white font-black">{accionSeleccionada.action}</strong>
              </div>

              {accionSeleccionada.idRegistro && (
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                  <span className="text-slate-400 font-bold">Registro:</span>
                  <strong className="text-amber-500 font-mono font-bold">{accionSeleccionada.idRegistro}</strong>
                </div>
              )}

              {accionSeleccionada.campoAfectado && (
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                  <span className="text-slate-400 font-bold">Campo modificado:</span>
                  <strong className="text-slate-800 dark:text-slate-100">{accionSeleccionada.campoAfectado}</strong>
                </div>
              )}

              {accionSeleccionada.previousValue !== undefined && accionSeleccionada.previousValue !== null && (
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                  <span className="text-slate-400 font-bold">Valor anterior:</span>
                  <span className="font-mono text-rose-500 font-bold">{String(accionSeleccionada.previousValue)}</span>
                </div>
              )}

              {accionSeleccionada.newValue !== undefined && accionSeleccionada.newValue !== null && (
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                  <span className="text-slate-400 font-bold">Valor nuevo:</span>
                  <span className="font-mono text-emerald-500 font-bold">{String(accionSeleccionada.newValue)}</span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400 font-bold">Fecha:</span>
                <strong className="font-mono text-slate-700 dark:text-slate-300">{accionSeleccionada.fecha || '29/09/2026'}</strong>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400 font-bold">Hora:</span>
                <strong className="font-mono text-slate-700 dark:text-slate-300">{accionSeleccionada.hora || '08:25:10'}</strong>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400 font-bold">Resultado:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  accionSeleccionada.resultado === 'Error'
                    ? 'bg-rose-500/20 text-rose-500'
                    : 'bg-emerald-500/20 text-emerald-500'
                }`}>
                  {accionSeleccionada.resultado || 'Exitoso'}
                </span>
              </div>

              {accionSeleccionada.mensajeError && (
                <div className="py-1 border-b border-slate-200/50 dark:border-slate-800 text-rose-500">
                  <span className="text-slate-400 font-bold block mb-0.5">Mensaje de error:</span>
                  <div className="p-2 rounded bg-rose-500/10 font-mono text-[11px]">{accionSeleccionada.mensajeError}</div>
                </div>
              )}

              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-bold">Dispositivo:</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{accionSeleccionada.dispositivo || 'Chrome - Windows'}</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => copiarTextoPortapapeles(JSON.stringify(accionSeleccionada, null, 2), accionSeleccionada.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#132247] dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                {copiadoId === accionSeleccionada.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiadoId === accionSeleccionada.id ? 'Copiado JSON' : 'Copiar Registro'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAccionSeleccionada(null)}
                className="px-5 py-2 bg-[#00b4d8] hover:bg-[#0096c7] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CentroMonitoreoView;
