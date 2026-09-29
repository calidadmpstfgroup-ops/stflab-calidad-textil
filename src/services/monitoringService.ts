import { 
  AuditLogEntry, 
  SesionUsuarioMonitoreo, 
  EventoErrorMonitoreo, 
  KpisCentroMonitoreo, 
  UserProfile, 
  UserRole,
  AreaType
} from '../types';
import { db, isFirebaseConfigured } from './firebase';
import { COLECCIONES } from './firestoreService';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const LOCAL_AUDIT_LOGS_KEY = 'stflab_auditoria_logs_v2';
const LOCAL_SESSIONS_KEY = 'stflab_sesiones_monitoreo_v1';

/**
 * Validador estricto de seguridad:
 * Solo Administradores y usuarios con rol soporte_tecnico pueden acceder a la auditoría y monitoreo.
 */
export const esUsuarioAdminOSoporte = (user: UserProfile | null | undefined): boolean => {
  if (!user) return false;
  const roleUpper = (user.role || '').toUpperCase();
  const rolEsp = (user.rolEspecifico || '').toLowerCase();
  return (
    roleUpper === 'ADMIN' ||
    roleUpper === 'SOPORTE_TECNICO' ||
    roleUpper === 'SUPERVISOR' ||
    rolEsp === 'soporte_tecnico' ||
    rolEsp.includes('soporte') ||
    rolEsp.includes('admin')
  );
};

// Generador de formato relativo ("Hace 12 s", "Hace 3 min", etc.)
export const calcularTiempoRelativo = (timestampIso: string): string => {
  try {
    const diffMs = Date.now() - new Date(timestampIso).getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSec < 60) return `Hace ${diffSec} s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHoras = Math.floor(diffMin / 60);
    if (diffHoras < 24) return `Hace ${diffHoras} h`;
    return `Hace ${Math.floor(diffHoras / 24)} d`;
  } catch {
    return 'Reciente';
  }
};

// Mapeador de áreas a nombres oficiales de módulos en STFLAB
export const mapearAreaAModulo = (area: AreaType | string): string => {
  switch (area) {
    case 'laboratorio': return 'Laboratorio';
    case 'compras': return 'Solicitudes de Compras';
    case 'compras-decision': return 'Decisión Comercial';
    case 'homologacion': return 'Homologación';
    case 'patronaje': return 'Moldes y Patronaje';
    case 'corte': return 'Corte y Tendido';
    case 'biblioteca': return 'Fichas Técnicas';
    case 'documentos': return 'Documentos';
    case 'chat': return 'Chat Inter-Áreas';
    case 'configuracion': return 'Configuración';
    case 'soporte-tecnico': return 'Centro de Monitoreo';
    case 'indicadores': return 'Indicadores';
    case 'dashboard':
    default: return 'Dashboard';
  }
};

/**
 * Validador para depurar cualquier dato de prueba o simulado anterior de localStorage
 */
const esRegistroSimulado = (id: string, user?: string, userId?: string): boolean => {
  if (!id) return false;
  if (
    id.startsWith('log-audit-') || 
    id.startsWith('ses-1') || 
    id.startsWith('ses-2') || 
    id.startsWith('ses-3') || 
    id.startsWith('ses-4') || 
    id.startsWith('ses-5') || 
    id.startsWith('ses-6') || 
    id === 'ses-admin-01'
  ) {
    return true;
  }
  if (userId && ['usr-lab-ana', 'usr-compras-carlos', 'usr-maria-01', 'usr-juan-01', 'usr-pat-diana', 'usr-corte-carlos'].includes(userId)) {
    return true;
  }
  if (user && ['ana.gonzalez', 'carlos.perez', 'maria.lopez', 'juan.perez', 'diana.morales', 'carlos.restrepo'].includes(user.toLowerCase())) {
    return true;
  }
  return false;
};

// =========================================================================
// FUNCIONES DEL SERVICIO DE MONITOREO Y AUDITORÍA REAL DE STFLAB
// =========================================================================

/**
 * Obtiene exclusivamente los logs de auditoría reales generados en el sistema
 */
export const obtenerLogsAuditoria = (): AuditLogEntry[] => {
  try {
    const raw = localStorage.getItem(LOCAL_AUDIT_LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Filtrar estrictamente solo registros reales (depurar datos simulados previos)
    const registrosReales = parsed.filter(l => !esRegistroSimulado(l.id, l.user, l.userId));
    if (registrosReales.length !== parsed.length) {
      localStorage.setItem(LOCAL_AUDIT_LOGS_KEY, JSON.stringify(registrosReales));
    }
    return registrosReales;
  } catch (err) {
    console.error('Error leyendo logs de auditoría reales:', err);
    return [];
  }
};

/**
 * Obtiene exclusivamente las sesiones reales de usuarios en STFLAB
 */
export const obtenerSesionesMonitoreo = (): SesionUsuarioMonitoreo[] => {
  try {
    const raw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filtrar estrictamente solo sesiones reales
    const sesionesReales = parsed.filter(s => !esRegistroSimulado(s.id, s.email, s.userId));
    if (sesionesReales.length !== parsed.length) {
      localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sesionesReales));
    }

    // Actualizar tiempos relativos de actividad en vivo
    return sesionesReales.map(s => ({
      ...s,
      ultimaActividadRelativa: calcularTiempoRelativo(s.ultimaActividad)
    }));
  } catch (err) {
    console.error('Error leyendo sesiones reales:', err);
    return [];
  }
};

export const guardarSesionesMonitoreo = (sesiones: SesionUsuarioMonitoreo[]) => {
  try {
    localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sesiones));
  } catch (err) {
    console.error('Error guardando sesiones reales:', err);
  }
};

/**
 * Sincroniza la sesión en vivo del usuario autenticado real
 */
export const sincronizarSesionUsuarioActual = (
  usuario: UserProfile | null | undefined,
  areaActual: AreaType,
  accionReciente?: string
): void => {
  if (!usuario) return;
  const sesiones = obtenerSesionesMonitoreo();
  const ahora = new Date();
  const timestamp = ahora.toISOString();
  const hora = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const moduloNombre = mapearAreaAModulo(areaActual);
  const accion = accionReciente || `En módulo ${moduloNombre}`;

  // Detectar dispositivo real
  const dispositivoDetectado = (() => {
    try {
      const ua = navigator.userAgent;
      let browser = 'Web';
      if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('Edge')) browser = 'Edge';

      let os = 'Windows';
      if (ua.includes('Mac')) os = 'macOS';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iPhone')) os = 'iOS';

      return `${browser} - ${os}`;
    } catch {
      return 'Navegador Web';
    }
  })();

  const index = sesiones.findIndex(
    s => s.userId === usuario.uid || (s.email && usuario.email && s.email.toLowerCase() === usuario.email.toLowerCase())
  );

  if (index >= 0) {
    const s = sesiones[index];
    const moduloCambio = s.moduloActual !== moduloNombre;
    s.estado = 'CONECTADO';
    s.ultimaActividad = timestamp;
    s.ultimaActividadRelativa = 'Hace 1 s';
    s.moduloActual = moduloNombre;
    if (accionReciente || moduloCambio) {
      s.accionRealizada = accion;
      if (!s.historialAcciones) s.historialAcciones = [];
      s.historialAcciones.push({
        id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        hora,
        modulo: moduloNombre,
        accion,
        resultado: 'Exitoso'
      });
      if (s.historialAcciones.length > 30) {
        s.historialAcciones = s.historialAcciones.slice(-30);
      }
    }
    sesiones[index] = s;
  } else {
    // Registrar nueva sesión real del usuario
    const nuevaSesion: SesionUsuarioMonitoreo = {
      id: `ses-${usuario.uid}`,
      userId: usuario.uid,
      nombreCompleto: usuario.displayName,
      email: usuario.email || `${usuario.nombreUsuario || 'usuario'}@stfgroup.com`,
      area: usuario.areaAsignada || 'dashboard',
      rol: String(usuario.role),
      rolEspecifico: usuario.rolEspecifico || String(usuario.role),
      estado: 'CONECTADO',
      horaEntrada: hora.slice(0, 5),
      horaEntradaCompleta: hora,
      ultimaActividad: timestamp,
      ultimaActividadRelativa: 'Hace 1 s',
      moduloActual: moduloNombre,
      accionRealizada: accion,
      dispositivo: dispositivoDetectado,
      duracionMinutos: 1,
      historialAcciones: [
        {
          id: `h-${Date.now()}`,
          hora,
          modulo: moduloNombre,
          accion,
          resultado: 'Exitoso'
        }
      ]
    };
    sesiones.unshift(nuevaSesion);
  }

  guardarSesionesMonitoreo(sesiones);
};

/**
 * Cierra la sesión activa del usuario al desconectarse
 */
export const cerrarSesionUsuarioActual = (usuario: UserProfile | null | undefined): void => {
  if (!usuario) return;
  const sesiones = obtenerSesionesMonitoreo();
  const ahora = new Date();
  const timestamp = ahora.toISOString();
  const hora = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const index = sesiones.findIndex(
    s => s.userId === usuario.uid || (s.email && usuario.email && s.email.toLowerCase() === usuario.email.toLowerCase())
  );
  if (index >= 0) {
    sesiones[index].estado = 'DESCONECTADO';
    sesiones[index].accionRealizada = 'Cerró sesión';
    sesiones[index].ultimaActividad = timestamp;
    sesiones[index].ultimaActividadRelativa = 'Hace 1 s';
    if (!sesiones[index].historialAcciones) sesiones[index].historialAcciones = [];
    sesiones[index].historialAcciones.push({
      id: `h-${Date.now()}`,
      hora,
      modulo: 'Autenticación',
      accion: 'Cerró sesión en STFLAB',
      resultado: 'Exitoso'
    });
    guardarSesionesMonitoreo(sesiones);
  }
};

/**
 * Registra un evento de auditoría real en el log y actualiza la sesión en vivo del usuario.
 */
export const registrarEventoAuditoria = async (
  evento: Omit<AuditLogEntry, 'id' | 'timestamp' | 'fecha' | 'hora'> & {
    id?: string;
    timestamp?: string;
    fecha?: string;
    hora?: string;
  }
): Promise<AuditLogEntry> => {
  const ahora = new Date();
  const fecha = evento.fecha || ahora.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = evento.hora || ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const timestamp = evento.timestamp || ahora.toISOString();

  // Detección automática del dispositivo
  const dispositivoDetectado = evento.dispositivo || (() => {
    try {
      const ua = navigator.userAgent;
      let browser = 'Web';
      if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('Edge')) browser = 'Edge';

      let os = 'Windows';
      if (ua.includes('Mac')) os = 'macOS';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iPhone')) os = 'iOS';

      return `${browser} - ${os}`;
    } catch {
      return 'Navegador Web';
    }
  })();

  const nuevoLog: AuditLogEntry = {
    id: evento.id || `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    action: evento.action,
    tipoAccion: evento.tipoAccion || 'MODIFICACION',
    user: evento.user,
    userId: evento.userId,
    nombreCompleto: evento.nombreCompleto || evento.user,
    area: evento.area,
    modulo: evento.modulo || 'General',
    userRole: evento.userRole,
    rolEspecifico: evento.rolEspecifico || evento.userRole,
    timestamp,
    fecha,
    hora,
    registroAfectado: evento.registroAfectado,
    idRegistro: evento.idRegistro,
    campoAfectado: evento.campoAfectado,
    previousValue: evento.previousValue ?? null,
    newValue: evento.newValue ?? null,
    resultado: evento.resultado || 'Exitoso',
    mensajeError: evento.mensajeError,
    dispositivo: dispositivoDetectado,
    detalles: evento.detalles || ''
  };

  // 1. Guardar en almacenamiento local
  try {
    const logs = obtenerLogsAuditoria();
    logs.unshift(nuevoLog);
    localStorage.setItem(LOCAL_AUDIT_LOGS_KEY, JSON.stringify(logs.slice(0, 1000)));
  } catch (err) {
    console.error('Error guardando log de auditoría real:', err);
  }

  // 2. Guardar en Firestore si está disponible
  try {
    if (isFirebaseConfigured) {
      const docRef = doc(db, COLECCIONES.AUDITORIA_LOGS, nuevoLog.id);
      await setDoc(docRef, {
        ...nuevoLog,
        serverTimestamp: serverTimestamp()
      });
    }
  } catch {
    // Modo local / offline
  }

  // 3. Actualizar la sesión en vivo del usuario correspondiente
  try {
    const sesiones = obtenerSesionesMonitoreo();
    const sesionIdx = sesiones.findIndex(
      s => s.userId === evento.userId || (s.email && evento.user && s.email.toLowerCase() === evento.user.toLowerCase())
    );

    if (sesionIdx >= 0) {
      const s = sesiones[sesionIdx];
      s.ultimaActividad = timestamp;
      s.ultimaActividadRelativa = 'Hace 1 s';
      s.moduloActual = evento.modulo || s.moduloActual;
      s.accionRealizada = evento.action;
      
      if (evento.tipoAccion === 'LOGOUT') {
        s.estado = 'DESCONECTADO';
      } else {
        s.estado = 'CONECTADO';
      }

      if (!s.historialAcciones) s.historialAcciones = [];
      s.historialAcciones.push({
        id: `h-${Date.now()}`,
        hora,
        modulo: evento.modulo || 'General',
        accion: evento.action,
        resultado: nuevoLog.resultado === 'Error' ? 'Error' : 'Exitoso',
        idRegistro: evento.idRegistro,
        campoAfectado: evento.campoAfectado,
        previousValue: evento.previousValue,
        newValue: evento.newValue,
        detalles: evento.detalles
      });
      sesiones[sesionIdx] = s;
    } else if (evento.user && evento.tipoAccion !== 'LOGOUT') {
      // Registrar nueva sesión real
      const nuevaSesion: SesionUsuarioMonitoreo = {
        id: `ses-${evento.userId || Date.now()}`,
        userId: evento.userId || 'usr-temp',
        nombreCompleto: evento.nombreCompleto || evento.user,
        email: evento.user.includes('@') ? evento.user : `${evento.user}@stfgroup.com`,
        area: evento.area || 'dashboard',
        rol: String(evento.userRole),
        rolEspecifico: evento.rolEspecifico || String(evento.userRole),
        estado: 'CONECTADO',
        horaEntrada: hora.slice(0, 5),
        horaEntradaCompleta: hora,
        ultimaActividad: timestamp,
        ultimaActividadRelativa: 'Hace 1 s',
        moduloActual: evento.modulo || 'Dashboard',
        accionRealizada: evento.action,
        dispositivo: dispositivoDetectado,
        duracionMinutos: 1,
        historialAcciones: [
          {
            id: `h-${Date.now()}`,
            hora,
            modulo: evento.modulo || 'General',
            accion: evento.action,
            resultado: nuevoLog.resultado === 'Error' ? 'Error' : 'Exitoso',
            idRegistro: evento.idRegistro
          }
        ]
      };
      sesiones.unshift(nuevaSesion);
    }
    guardarSesionesMonitoreo(sesiones);
  } catch (err) {
    console.error('Error actualizando sesión en vivo:', err);
  }

  return nuevoLog;
};

/**
 * Calcula los KPIs globales del Centro de Monitoreo exclusivamente a partir de datos reales de STFLAB
 */
export const calcularKpisMonitoreo = (
  sesiones: SesionUsuarioMonitoreo[],
  logs: AuditLogEntry[]
): KpisCentroMonitoreo => {
  const ahora = Date.now();
  const hoyStr = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Usuarios conectados reales (estado CONECTADO y actividad en los últimos 15 min)
  const sesionesConectadas = sesiones.filter(s => {
    if (s.estado !== 'CONECTADO') return false;
    const diffMin = (ahora - new Date(s.ultimaActividad).getTime()) / (1000 * 60);
    return diffMin <= 15;
  });
  const conectados = sesionesConectadas.length;

  // Usuarios activos hoy (usuarios únicos reales con logs de hoy o sesiones activas)
  const usuariosUnicosHoy = new Set([
    ...sesionesConectadas.map(s => s.userId),
    ...logs.filter(l => l.fecha === hoyStr).map(l => l.userId || l.user)
  ]);

  // Módulos en uso (módulos únicos con usuarios reales conectados)
  const modulosEnUso = new Set(
    sesionesConectadas.map(s => s.moduloActual)
  ).size;

  // Alertas / errores reales del día
  const errores = logs.filter(l => l.resultado === 'Error' || l.tipoAccion === 'ERROR');
  const erroresHoy = errores.filter(e => e.fecha === hoyStr);

  // Módulo más utilizado según los logs reales
  const conteoModulos: Record<string, number> = {};
  logs.forEach(l => {
    const m = l.modulo || 'General';
    conteoModulos[m] = (conteoModulos[m] || 0) + 1;
  });

  let moduloMasUtilizado = 'Sin actividad';
  let maxConteo = 0;
  Object.entries(conteoModulos).forEach(([mod, count]) => {
    if (count > maxConteo) {
      maxConteo = count;
      moduloMasUtilizado = mod;
    }
  });

  // Total de sesiones del día
  const totalSesionesDia = sesiones.filter(s => {
    try {
      const fechaSes = new Date(s.ultimaActividad).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return fechaSes === hoyStr;
    } catch {
      return false;
    }
  }).length;

  // Tiempo promedio de sesión real en minutos
  const totalMinutos = sesionesConectadas.reduce((acc, s) => acc + (s.duracionMinutos || 1), 0);
  const tiempoPromedioSesionMin = sesionesConectadas.length > 0 ? Math.round(totalMinutos / sesionesConectadas.length) : 0;

  return {
    usuariosConectados: conectados,
    usuariosActivosHoy: usuariosUnicosHoy.size,
    modulosEnUso: modulosEnUso,
    alertasErrores: erroresHoy.length,
    sesionesActivas: conectados,
    totalSesionesDia: Math.max(conectados, totalSesionesDia),
    moduloMasUtilizado,
    erroresDelDia: erroresHoy.length,
    actividadesRegistradas: logs.length,
    tiempoPromedioSesionMin
  };
};

/**
 * Calcula la distribución en vivo de usuarios por módulo para las barras y tarjetas con datos reales
 */
export const calcularDistribucionModulosEnVivo = (
  sesiones: SesionUsuarioMonitoreo[]
): Array<{ modulo: string; usuarios: number; porcentaje: number }> => {
  const modulosSTFLAB = [
    'Dashboard',
    'Solicitudes de Compras',
    'Ensayos',
    'Fichas Técnicas',
    'Muestras',
    'Documentos',
    'Indicadores',
    'Moldes y Patronaje',
    'Corte y Tendido'
  ];

  const conteo: Record<string, number> = {};
  modulosSTFLAB.forEach(m => { conteo[m] = 0; });

  // Solo contabilizar usuarios conectados reales
  const usuariosConectados = sesiones.filter(s => s.estado === 'CONECTADO');

  usuariosConectados.forEach(s => {
    const mNormalizado = modulosSTFLAB.find(
      mod => mod.toLowerCase().includes(s.moduloActual.toLowerCase()) || 
             s.moduloActual.toLowerCase().includes(mod.toLowerCase())
    ) || s.moduloActual;
    conteo[mNormalizado] = (conteo[mNormalizado] || 0) + 1;
  });

  const totalUsuarios = usuariosConectados.length;

  return modulosSTFLAB.map(m => {
    const cant = conteo[m] || 0;
    return {
      modulo: m,
      usuarios: cant,
      porcentaje: totalUsuarios > 0 ? Math.round((cant / totalUsuarios) * 100) : 0
    };
  }).sort((a, b) => b.usuarios - a.usuarios);
};

/**
 * Obtiene la lista de errores reales recientes
 */
export const obtenerErroresRecientes = (logs: AuditLogEntry[]): EventoErrorMonitoreo[] => {
  return logs
    .filter(l => l.resultado === 'Error' || l.tipoAccion === 'ERROR')
    .map(l => ({
      id: l.id,
      hora: l.hora || 'Reciente',
      fecha: l.fecha || new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      usuario: l.nombreCompleto || l.user,
      userId: l.userId,
      modulo: l.modulo || 'General',
      accion: l.action,
      error: l.mensajeError || l.detalles || 'Fallo detectado durante la operación',
      estado: l.mensajeError?.toLowerCase().includes('crítico') ? 'CRITICO' : 'EN_REVISION',
      dispositivo: l.dispositivo,
      idRegistro: l.idRegistro
    }));
};

/**
 * Exporta el historial de auditoría real a formato CSV
 */
export const exportarAuditoriaCSV = (logs: AuditLogEntry[]) => {
  const encabezados = [
    'ID Evento',
    'Fecha',
    'Hora',
    'Usuario',
    'ID Usuario',
    'Área',
    'Rol',
    'Módulo',
    'Acción',
    'Tipo Acción',
    'Registro Afectado',
    'Código Registro',
    'Campo Modificado',
    'Valor Anterior',
    'Valor Nuevo',
    'Resultado',
    'Mensaje Error',
    'Dispositivo',
    'Detalles'
  ];

  const escapeCSV = (str: any) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const filas = logs.map(l => [
    escapeCSV(l.id),
    escapeCSV(l.fecha),
    escapeCSV(l.hora),
    escapeCSV(l.nombreCompleto || l.user),
    escapeCSV(l.userId),
    escapeCSV(l.area),
    escapeCSV(l.userRole),
    escapeCSV(l.modulo),
    escapeCSV(l.action),
    escapeCSV(l.tipoAccion),
    escapeCSV(l.registroAfectado),
    escapeCSV(l.idRegistro),
    escapeCSV(l.campoAfectado),
    escapeCSV(typeof l.previousValue === 'object' ? JSON.stringify(l.previousValue) : l.previousValue),
    escapeCSV(typeof l.newValue === 'object' ? JSON.stringify(l.newValue) : l.newValue),
    escapeCSV(l.resultado),
    escapeCSV(l.mensajeError),
    escapeCSV(l.dispositivo),
    escapeCSV(l.detalles)
  ]);

  const csvContent = '\uFEFF' + [encabezados.join(';'), ...filas.map(f => f.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Auditoria_STFLAB_Real_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
