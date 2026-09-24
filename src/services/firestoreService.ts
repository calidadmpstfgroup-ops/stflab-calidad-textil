import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  writeBatch 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { 
  SolicitudTelasCompleta, 
  SolicitudAccesoriosCompleta, 
  MuestraTextil, 
  FichaTecnicaHistoricaVersionada, 
  AuditLogEntry,
  UserRole
} from '../types';

// Nombres de Colecciones Oficiales en Firestore
export const COLECCIONES = {
  USERS: 'users',
  SOLICITUDES_TELAS: 'solicitudes_telas',
  SOLICITUDES_ACCESORIOS: 'solicitudes_accesorios',
  MUESTRAS_LABORATORIO: 'muestras_laboratorio',
  FICHAS_TECNICAS: 'fichas_tecnicas_historicas',
  AUDITORIA_LOGS: 'auditoria_logs'
} as const;

// =========================================================================
// --- 📜 1. SERVICIO DE AUDITORÍA & LOGS INMUTABLES (TRAZABILIDAD)      ---
// =========================================================================
const LOCAL_AUDIT_LOGS_KEY = 'stflab_auditoria_logs_v2';

export const obtenerLogsAuditoriaLocales = (): AuditLogEntry[] => {
  try {
    const saved = localStorage.getItem(LOCAL_AUDIT_LOGS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

export const registrarLogAuditoria = async (
  collectionName: string,
  documentId: string,
  action: AuditLogEntry['action'],
  user: string,
  userRole: UserRole,
  detalles?: string,
  previousValue?: any,
  newValue?: any,
  metaSesion?: {
    userId?: string;
    nombreCompleto?: string;
    area?: any;
    rolEspecifico?: string;
    fecha?: string;
    hora?: string;
    campoAfectado?: string;
  }
): Promise<AuditLogEntry> => {
  const ahora = new Date();
  const fecha = metaSesion?.fecha || ahora.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = metaSesion?.hora || ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });

  const logEntry: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    collectionName,
    documentId,
    action,
    user,
    userId: metaSesion?.userId || user,
    nombreCompleto: metaSesion?.nombreCompleto || user,
    area: metaSesion?.area || 'laboratorio',
    userRole,
    rolEspecifico: metaSesion?.rolEspecifico || userRole,
    timestamp: ahora.toISOString(),
    fecha,
    hora,
    previousValue: previousValue !== undefined ? previousValue : null,
    newValue: newValue !== undefined ? newValue : null,
    detalles: detalles || '',
    campoAfectado: metaSesion?.campoAfectado || ''
  };

  // 1. Guardar en almacenamiento local persistente
  try {
    const existentes = obtenerLogsAuditoriaLocales();
    existentes.unshift(logEntry);
    localStorage.setItem(LOCAL_AUDIT_LOGS_KEY, JSON.stringify(existentes.slice(0, 500)));
  } catch (e) {
    console.warn('Error en storage local de logs:', e);
  }

  // 2. Guardar en Firestore si está configurado
  try {
    if (isFirebaseConfigured) {
      const logRef = doc(db, COLECCIONES.AUDITORIA_LOGS, logEntry.id);
      await setDoc(logRef, {
        ...logEntry,
        serverTimestamp: serverTimestamp()
      });
    }
  } catch (e) {
    console.warn('Registro de auditoría guardado localmente:', logEntry.id);
  }

  return logEntry;
};

// =========================================================================
// --- 🧵 2. SERVICIOS SOLICITUDES TELAS                                 ---
// =========================================================================
export const firestoreGuardarSolicitudTelas = async (
  solicitud: SolicitudTelasCompleta, 
  usuario: string, 
  rol: UserRole
): Promise<void> => {
  const payload = {
    ...solicitud,
    createdAt: solicitud.fechaSolicitud || new Date().toISOString(),
    createdBy: usuario,
    updatedAt: new Date().toISOString(),
    updatedBy: usuario
  };

  if (isFirebaseConfigured) {
    const docRef = doc(db, COLECCIONES.SOLICITUDES_TELAS, solicitud.id);
    await setDoc(docRef, payload, { merge: true });
  }

  await registrarLogAuditoria(
    COLECCIONES.SOLICITUDES_TELAS,
    solicitud.id,
    'CREAR',
    usuario,
    rol,
    `Solicitud de Telas ${solicitud.numeroSolicitud} creada con ${solicitud.telas.length} telas.`
  );
};

export const firestoreActualizarItemTela = async (
  solicitudId: string,
  itemId: string,
  datosActualizados: any,
  usuario: string,
  rol: UserRole
): Promise<void> => {
  if (isFirebaseConfigured) {
    const docRef = doc(db, COLECCIONES.SOLICITUDES_TELAS, solicitudId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as SolicitudTelasCompleta;
      const telasModificadas = data.telas.map(t => t.id === itemId ? { ...t, ...datosActualizados } : t);
      await updateDoc(docRef, {
        telas: telasModificadas,
        updatedAt: new Date().toISOString(),
        updatedBy: usuario
      });
    }
  }

  await registrarLogAuditoria(
    COLECCIONES.SOLICITUDES_TELAS,
    solicitudId,
    'EDITAR',
    usuario,
    rol,
    `Evaluación de tela ${itemId} en solicitud ${solicitudId} actualizada.`
  );
};

// =========================================================================
// --- 🔩 3. SERVICIOS SOLICITUDES ACCESORIOS (4 CAMPOS EXACTOS)         ---
// =========================================================================
export const firestoreGuardarSolicitudAccesorios = async (
  solicitud: SolicitudAccesoriosCompleta, 
  usuario: string, 
  rol: UserRole
): Promise<void> => {
  const payload = {
    ...solicitud,
    createdAt: solicitud.fechaSolicitud || new Date().toISOString(),
    createdBy: usuario,
    updatedAt: new Date().toISOString(),
    updatedBy: usuario
  };

  if (isFirebaseConfigured) {
    const docRef = doc(db, COLECCIONES.SOLICITUDES_ACCESORIOS, solicitud.id);
    await setDoc(docRef, payload, { merge: true });
  }

  await registrarLogAuditoria(
    COLECCIONES.SOLICITUDES_ACCESORIOS,
    solicitud.id,
    'CREAR',
    usuario,
    rol,
    `Solicitud de Accesorios ${solicitud.numeroSolicitud} creada con ${solicitud.muestras.length} muestras independientes.`
  );
};

export const firestoreActualizarItemAccesorio = async (
  solicitudId: string,
  itemId: string,
  datosActualizados: any,
  usuario: string,
  rol: UserRole
): Promise<void> => {
  if (isFirebaseConfigured) {
    const docRef = doc(db, COLECCIONES.SOLICITUDES_ACCESORIOS, solicitudId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as SolicitudAccesoriosCompleta;
      const muestrasModificadas = data.muestras.map(m => m.id === itemId ? { ...m, ...datosActualizados } : m);
      await updateDoc(docRef, {
        muestras: muestrasModificadas,
        updatedAt: new Date().toISOString(),
        updatedBy: usuario
      });
    }
  }

  await registrarLogAuditoria(
    COLECCIONES.SOLICITUDES_ACCESORIOS,
    solicitudId,
    'EDITAR',
    usuario,
    rol,
    `Muestra de accesorio ${itemId} en solicitud ${solicitudId} actualizada.`
  );
};

// =========================================================================
// --- 📑 4. SERVICIOS FICHAS TÉCNICAS HISTÓRICAS VERSIONADAS            ---
// =========================================================================
export const firestoreGuardarVersionFichaTecnica = async (
  ficha: FichaTecnicaHistoricaVersionada,
  usuario: string,
  rol: UserRole
): Promise<void> => {
  const payload = {
    ...ficha,
    updatedAt: new Date().toISOString(),
    updatedBy: usuario
  };

  if (isFirebaseConfigured) {
    const docRef = doc(db, COLECCIONES.FICHAS_TECNICAS, ficha.id);
    await setDoc(docRef, payload, { merge: true });
  }

  await registrarLogAuditoria(
    COLECCIONES.FICHAS_TECNICAS,
    ficha.id,
    'CREAR',
    usuario,
    rol,
    `Ficha técnica ${ficha.codigoFT} (${ficha.referencia}) versionada a v${ficha.versionActual}.`
  );
};
