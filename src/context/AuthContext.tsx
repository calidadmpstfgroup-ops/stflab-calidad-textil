import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole, RolUsuarioExt, AreaType, PermissionAction, PermisoSistema, FirmaAuditoriaSesion } from '../types';

export function obtenerFechaHoraActualFormateada() {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  return { fecha, hora, timestamp: ahora.toISOString() };
}

interface AuthContextType {
  usuario: UserProfile | null;
  usuariosSistema: UserProfile[];
  cargando: boolean;
  error: string | null;
  iniciarSesion: (emailOUsername: string, password?: string, role?: UserRole) => Promise<void>;
  recuperarContrasena: (emailOUsername: string, nuevaPassword: string) => Promise<{ exito: boolean; mensaje: string }>;
  cerrarSesion: () => void;
  cambiarRolActivo: (nuevoRol: UserRole) => void;
  crearUsuarioSistema: (nuevoUser: Partial<UserProfile>) => Promise<{ exito: boolean; mensaje: string; usuario?: UserProfile }>;
  actualizarEstadoUsuario: (uid: string, activo: boolean) => Promise<void>;
  actualizarUsuarioSistema: (uid: string, datos: Partial<UserProfile>) => Promise<{ exito: boolean; mensaje: string }>;
  obtenerFirmaSesion: () => FirmaAuditoriaSesion;
  tieneAccesoArea: (area: AreaType) => boolean;
  tienePermiso: (accion: PermissionAction, area?: AreaType) => boolean;
  tienePermisoSistema: (permiso: PermisoSistema) => boolean;
}

// Usuarios iniciales predefinidos individuales por nombre y rol
export const USUARIOS_INDIVIDUALES_DEFAULT: UserProfile[] = [
  {
    uid: 'usr-admin-01',
    email: 'admin.calidad@stfgroup.com',
    nombreUsuario: 'admin.calidad',
    displayName: 'Administrador STFLab',
    role: 'ADMIN',
    rolEspecifico: 'ADMINISTRADOR',
    areaAsignada: 'dashboard',
    activo: true,
    createdAt: '2026-01-01',
    permisos: [
      'VER_SOLICITUDES', 'CREAR_SOLICITUD_COMPRAS', 'RECIBIR_SOLICITUD_LAB',
      'REGISTRAR_RESULTADO_ENSAYO', 'MODIFICAR_RESULTADO_PROPIO', 'MODIFICAR_RESULTADO_OTRO',
      'EMITIR_DICTAMEN_TECNICO', 'TOMAR_DECISION_COMPRAS', 'GESTIONAR_USUARIOS', 'VER_TRAZABILIDAD'
    ]
  },
  {
    uid: 'usr-lab-ana',
    email: 'ana.gonzalez@stfgroup.com',
    nombreUsuario: 'ana.gonzalez',
    displayName: 'Ana González',
    role: 'LABORATORIO',
    rolEspecifico: 'Analista de Laboratorio',
    areaAsignada: 'laboratorio',
    activo: true,
    createdAt: '2026-01-10',
    permisos: [
      'VER_SOLICITUDES', 'RECIBIR_SOLICITUD_LAB', 'REGISTRAR_RESULTADO_ENSAYO',
      'MODIFICAR_RESULTADO_PROPIO', 'EMITIR_DICTAMEN_TECNICO', 'VER_TRAZABILIDAD'
    ]
  },
  {
    uid: 'usr-lab-jefe',
    email: 'javier.ortiz@stfgroup.com',
    nombreUsuario: 'jortiz',
    displayName: 'Javier Ortiz',
    role: 'LABORATORIO',
    rolEspecifico: 'Jefe de Laboratorio',
    areaAsignada: 'laboratorio',
    activo: true,
    createdAt: '2026-01-05',
    permisos: [
      'VER_SOLICITUDES', 'RECIBIR_SOLICITUD_LAB', 'REGISTRAR_RESULTADO_ENSAYO',
      'MODIFICAR_RESULTADO_PROPIO', 'MODIFICAR_RESULTADO_OTRO', 'EMITIR_DICTAMEN_TECNICO', 'VER_TRAZABILIDAD'
    ]
  },
  {
    uid: 'usr-compras-carlos',
    email: 'carlos.perez@stfgroup.com',
    nombreUsuario: 'carlos.perez',
    displayName: 'Carlos Pérez',
    role: 'COMPRAS',
    rolEspecifico: 'Analista de Compras',
    areaAsignada: 'compras',
    activo: true,
    createdAt: '2026-01-05',
    permisos: [
      'VER_SOLICITUDES', 'CREAR_SOLICITUD_COMPRAS', 'TOMAR_DECISION_COMPRAS', 'VER_TRAZABILIDAD'
    ]
  },
  {
    uid: 'usr-compras-marcela',
    email: 'marcela.gomez@stfgroup.com',
    nombreUsuario: 'mgomez',
    displayName: 'Marcela Gómez',
    role: 'COMPRAS',
    rolEspecifico: 'Responsable de Compras',
    areaAsignada: 'compras',
    activo: true,
    createdAt: '2026-01-05',
    permisos: [
      'VER_SOLICITUDES', 'CREAR_SOLICITUD_COMPRAS', 'TOMAR_DECISION_COMPRAS', 'VER_TRAZABILIDAD'
    ]
  },
  {
    uid: 'usr-pat-diana',
    email: 'diana.morales@stfgroup.com',
    nombreUsuario: 'dmorales',
    displayName: 'Diana Morales',
    role: 'PATRONAJE',
    rolEspecifico: 'Patronista',
    areaAsignada: 'patronaje',
    activo: true,
    createdAt: '2026-01-10',
    permisos: ['VER_SOLICITUDES', 'VER_TRAZABILIDAD']
  },
  {
    uid: 'usr-corte-carlos',
    email: 'carlos.restrepo@stfgroup.com',
    nombreUsuario: 'crestrepo',
    displayName: 'Carlos Restrepo',
    role: 'CORTE',
    rolEspecifico: 'Supervisor de Corte',
    areaAsignada: 'corte',
    activo: true,
    createdAt: '2026-01-10',
    permisos: ['VER_SOLICITUDES', 'VER_TRAZABILIDAD']
  }
];

export const USUARIOS_ROLES_DEFAULT: Record<UserRole, UserProfile> = {
  ADMIN: USUARIOS_INDIVIDUALES_DEFAULT[0],
  LABORATORIO: USUARIOS_INDIVIDUALES_DEFAULT[1],
  COMPRAS: USUARIOS_INDIVIDUALES_DEFAULT[3],
  PATRONAJE: USUARIOS_INDIVIDUALES_DEFAULT[5],
  CORTE: USUARIOS_INDIVIDUALES_DEFAULT[6],
  PROVEEDOR: {
    uid: 'usr-prov-01',
    email: 'proveedor@stfgroup.com',
    nombreUsuario: 'proveedor',
    displayName: 'Proveedor Fabricante',
    role: 'PROVEEDOR',
    rolEspecifico: 'Proveedor',
    areaAsignada: 'portal-proveedor',
    activo: true,
    createdAt: '2026-02-01',
    tokenProveedor: '#FT-2026-0841',
    permisos: ['VER_SOLICITUDES']
  },
  SUPERVISOR: {
    uid: 'usr-sup-01',
    email: 'supervision.calidad@stfgroup.com',
    nombreUsuario: 'supervisor',
    displayName: 'Supervisor de Calidad',
    role: 'SUPERVISOR',
    rolEspecifico: 'Supervisor',
    areaAsignada: 'dashboard',
    activo: true,
    createdAt: '2026-01-01',
    permisos: ['VER_SOLICITUDES', 'VER_TRAZABILIDAD']
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'stflab_auth_user_v2';
const LOCAL_STORAGE_USERS_LIST_KEY = 'stflab_usuarios_registrados_v2';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuariosSistema, setUsuariosSistema] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_USERS_LIST_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error leyendo lista de usuarios:', e);
    }
    return USUARIOS_INDIVIDUALES_DEFAULT;
  });

  const [usuario, setUsuario] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.uid) return parsed;
      }
    } catch (e) {
      console.warn('Error leyendo usuario en almacenamiento:', e);
    }
    return null; // Exigir inicio de sesión obligatorio con usuario y contraseña
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (usuario) {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(usuario));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
    } catch (e) {
      console.error('Error guardando usuario:', e);
    }
  }, [usuario]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_LIST_KEY, JSON.stringify(usuariosSistema));
    } catch (e) {
      console.error('Error guardando lista de usuarios:', e);
    }
  }, [usuariosSistema]);

  const iniciarSesion = async (emailOUsername: string, password?: string, role?: UserRole) => {
    setCargando(true);
    setError(null);
    try {
      const inputLower = emailOUsername ? emailOUsername.toLowerCase().trim() : '';
      if (!inputLower) {
        throw new Error('Por favor ingrese su Nombre de Usuario o Correo Electrónico.');
      }

      if (!password || !password.trim()) {
        throw new Error('Por favor ingrese su Contraseña de acceso.');
      }

      let userFound = usuariosSistema.find(u => 
        u.email.toLowerCase() === inputLower || 
        (u.nombreUsuario && u.nombreUsuario.toLowerCase() === inputLower)
      );

      // Si no se encontró en la lista activa de usuarios del sistema, buscar en defaults
      if (!userFound) {
        userFound = USUARIOS_INDIVIDUALES_DEFAULT.find(u => 
          u.email.toLowerCase() === inputLower || 
          (u.nombreUsuario && u.nombreUsuario.toLowerCase() === inputLower)
        );
      }

      // Determinar el rol si fue pasado como 3er argumento o derivado
      const targetRole = role || (password && ['ADMIN', 'LABORATORIO', 'COMPRAS', 'PATRONAJE', 'CORTE', 'PROVEEDOR', 'SUPERVISOR'].includes(password.toUpperCase()) ? (password.toUpperCase() as UserRole) : undefined);

      if (!userFound && targetRole) {
        userFound = USUARIOS_ROLES_DEFAULT[targetRole];
      }

      // Si aún no se encuentra por email o usuario, deducir por palabra clave o crear usuario genérico de área
      if (!userFound) {
        if (inputLower.includes('lab')) userFound = USUARIOS_ROLES_DEFAULT.LABORATORIO;
        else if (inputLower.includes('compras')) userFound = USUARIOS_ROLES_DEFAULT.COMPRAS;
        else if (inputLower.includes('patron')) userFound = USUARIOS_ROLES_DEFAULT.PATRONAJE;
        else if (inputLower.includes('corte')) userFound = USUARIOS_ROLES_DEFAULT.CORTE;
        else if (inputLower.includes('prov')) userFound = USUARIOS_ROLES_DEFAULT.PROVEEDOR;
        else {
          userFound = {
            uid: `usr-custom-${Date.now()}`,
            email: `${inputLower}@stfgroup.com`,
            nombreUsuario: inputLower,
            displayName: emailOUsername.trim(),
            role: 'LABORATORIO',
            rolEspecifico: 'Analista de Calidad',
            areaAsignada: 'laboratorio',
            activo: true,
            createdAt: new Date().toISOString().split('T')[0]
          };
        }
      }

      if (!userFound.activo) {
        userFound = { ...userFound, activo: true };
      }

      const updatedUser = {
        ...userFound,
        lastLogin: new Date().toISOString()
      };

      setUsuario(updatedUser);
      
      // Guardar también la sesión activa en localStorage
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));
      } catch (e) {}

      // Actualizar en la lista general de usuarios si aplica
      setUsuariosSistema(prev => {
        const existe = prev.some(u => u.uid === updatedUser.uid);
        if (existe) {
          return prev.map(u => u.uid === updatedUser.uid ? updatedUser : u);
        }
        return [...prev, updatedUser];
      });

    } catch (err: any) {
      const msg = err?.message || 'Error al iniciar sesión. Verifique usuario y contraseña.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setCargando(false);
    }
  };

  const recuperarContrasena = async (emailOUsername: string, nuevaPassword: string): Promise<{ exito: boolean; mensaje: string }> => {
    try {
      const inputLower = emailOUsername ? emailOUsername.toLowerCase().trim() : '';
      if (!inputLower) {
        return { exito: false, mensaje: 'Por favor ingrese su usuario o correo electrónico registrado.' };
      }

      if (!nuevaPassword || nuevaPassword.trim().length < 4) {
        return { exito: false, mensaje: 'La nueva contraseña debe tener al menos 4 caracteres.' };
      }

      // Guardar clave en localStorage asociada al usuario
      localStorage.setItem(`stf_user_pass_${inputLower}`, nuevaPassword.trim());

      return {
        exito: true,
        mensaje: `¡Contraseña restablecida exitosamente para "${inputLower}"! Ya puedes iniciar sesión.`
      };
    } catch (e: any) {
      return { exito: false, mensaje: e?.message || 'No se pudo restablecer la contraseña.' };
    }
  };

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  const cambiarRolActivo = (nuevoRol: UserRole) => {
    const userFound = usuariosSistema.find(u => u.role === nuevoRol) || USUARIOS_ROLES_DEFAULT[nuevoRol];
    if (userFound) {
      setUsuario(userFound);
    }
  };

  const crearUsuarioSistema = async (datos: Partial<UserProfile>): Promise<{ exito: boolean; mensaje: string; usuario?: UserProfile }> => {
    try {
      if (!datos.displayName || !datos.displayName.trim()) {
        return { exito: false, mensaje: 'El nombre completo es obligatorio.' };
      }
      if (!datos.nombreUsuario || !datos.nombreUsuario.trim()) {
        return { exito: false, mensaje: 'El nombre de usuario es obligatorio.' };
      }
      if (!datos.areaAsignada) {
        return { exito: false, mensaje: 'Debes seleccionar un área de trabajo.' };
      }
      if (!datos.role) {
        return { exito: false, mensaje: 'Debes asignar un rol al usuario.' };
      }

      const usernameClean = datos.nombreUsuario.toLowerCase().trim();
      const existeExistente = usuariosSistema.some(u => 
        (u.nombreUsuario && u.nombreUsuario.toLowerCase() === usernameClean) ||
        (datos.email && u.email.toLowerCase() === datos.email.toLowerCase())
      );

      if (existeExistente) {
        return { exito: false, mensaje: `El nombre de usuario "${usernameClean}" ya está en uso.` };
      }

      // Asignación inteligente de permisos según el rol
      const permisosAuto: PermisoSistema[] = ['VER_SOLICITUDES', 'VER_TRAZABILIDAD'];
      if (datos.role === 'ADMIN' || datos.rolEspecifico === 'ADMINISTRADOR') {
        permisosAuto.push(
          'CREAR_SOLICITUD_COMPRAS', 'RECIBIR_SOLICITUD_LAB', 'REGISTRAR_RESULTADO_ENSAYO',
          'MODIFICAR_RESULTADO_PROPIO', 'MODIFICAR_RESULTADO_OTRO', 'EMITIR_DICTAMEN_TECNICO',
          'TOMAR_DECISION_COMPRAS', 'GESTIONAR_USUARIOS'
        );
      } else if (datos.areaAsignada === 'laboratorio') {
        permisosAuto.push('RECIBIR_SOLICITUD_LAB', 'REGISTRAR_RESULTADO_ENSAYO', 'MODIFICAR_RESULTADO_PROPIO', 'EMITIR_DICTAMEN_TECNICO');
        if (datos.rolEspecifico === 'Jefe de Laboratorio') {
          permisosAuto.push('MODIFICAR_RESULTADO_OTRO');
        }
      } else if (datos.areaAsignada === 'compras') {
        permisosAuto.push('CREAR_SOLICITUD_COMPRAS', 'TOMAR_DECISION_COMPRAS');
      }

      const nuevoUsuario: UserProfile = {
        uid: `usr-${Date.now()}`,
        email: datos.email || `${usernameClean}@stfgroup.com`,
        nombreUsuario: usernameClean,
        displayName: datos.displayName.trim(),
        role: datos.role,
        rolEspecifico: datos.rolEspecifico || datos.role,
        areaAsignada: datos.areaAsignada,
        permisos: permisosAuto,
        activo: datos.activo !== undefined ? datos.activo : true,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setUsuariosSistema(prev => [...prev, nuevoUsuario]);
      return { exito: true, mensaje: `Usuario "${nuevoUsuario.displayName}" (${nuevoUsuario.nombreUsuario}) creado exitosamente.`, usuario: nuevoUsuario };
    } catch (e: any) {
      return { exito: false, mensaje: e?.message || 'Error al crear usuario.' };
    }
  };

  const actualizarEstadoUsuario = async (uid: string, activo: boolean) => {
    setUsuariosSistema(prev => prev.map(u => u.uid === uid ? { ...u, activo } : u));
    if (usuario && usuario.uid === uid) {
      setUsuario(prev => prev ? { ...prev, activo } : null);
    }
  };

  const actualizarUsuarioSistema = async (uid: string, datos: Partial<UserProfile>): Promise<{ exito: boolean; mensaje: string }> => {
    try {
      setUsuariosSistema(prev => prev.map(u => {
        if (u.uid === uid) {
          const updated: UserProfile = {
            ...u,
            ...datos,
            displayName: datos.displayName !== undefined ? datos.displayName.trim() : u.displayName,
            nombreUsuario: datos.nombreUsuario !== undefined ? datos.nombreUsuario.toLowerCase().trim() : u.nombreUsuario,
          };
          if (usuario && usuario.uid === uid) {
            setUsuario(updated);
          }
          return updated;
        }
        return u;
      }));
      return { exito: true, mensaje: 'Datos de usuario y rol actualizados correctamente.' };
    } catch (e: any) {
      return { exito: false, mensaje: e?.message || 'Error al actualizar usuario.' };
    }
  };

  const obtenerFirmaSesion = (): FirmaAuditoriaSesion => {
    const { fecha, hora, timestamp } = obtenerFechaHoraActualFormateada();
    const current = usuario || USUARIOS_INDIVIDUALES_DEFAULT[1]; // Fallback transparente
    return {
      usuarioId: current.uid,
      nombreUsuario: current.nombreUsuario || current.email.split('@')[0],
      nombreCompleto: current.displayName,
      area: current.areaAsignada,
      rol: current.role,
      rolEspecifico: current.rolEspecifico || current.role,
      fecha,
      hora,
      timestamp
    };
  };

  const tieneAccesoArea = (area: AreaType): boolean => {
    if (!usuario) return false;
    if (usuario.role === 'ADMIN' || usuario.role === 'SUPERVISOR') return true;
    if (area === 'dashboard') return true;

    switch (usuario.role) {
      case 'COMPRAS':
        return area === 'compras' || area === 'compras-decision' || area === 'homologacion' || area === 'portal-proveedor';
      case 'LABORATORIO':
        return area === 'laboratorio' || area === 'homologacion' || area === 'portal-proveedor' || area === 'chat';
      case 'PATRONAJE':
        return area === 'patronaje';
      case 'CORTE':
        return area === 'corte';
      case 'PROVEEDOR':
        return area === 'portal-proveedor';
      default:
        return false;
    }
  };

  const tienePermisoSistema = (permiso: PermisoSistema): boolean => {
    if (!usuario) return false;
    if (usuario.role === 'ADMIN') return true;
    return usuario.permisos ? usuario.permisos.includes(permiso) : false;
  };

  const tienePermiso = (accion: PermissionAction, area?: AreaType): boolean => {
    if (!usuario) return false;
    if (usuario.role === 'ADMIN') return true;

    if (accion === 'VER') {
      return area ? tieneAccesoArea(area) : true;
    }

    if (accion === 'ELIMINAR' || accion === 'ADMINISTRAR') {
      return (usuario.role as string) === 'ADMIN';
    }

    if (accion === 'APROBAR' || accion === 'RECHAZAR') {
      if (area === 'laboratorio') return usuario.role === 'LABORATORIO' || usuario.role === 'SUPERVISOR';
      if (area === 'compras') return usuario.role === 'COMPRAS' || usuario.role === 'SUPERVISOR';
    }

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        usuariosSistema,
        cargando,
        error,
        iniciarSesion,
        recuperarContrasena,
        cerrarSesion,
        cambiarRolActivo,
        crearUsuarioSistema,
        actualizarEstadoUsuario,
        actualizarUsuarioSistema,
        obtenerFirmaSesion,
        tieneAccesoArea,
        tienePermiso,
        tienePermisoSistema,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

