import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, RolUsuarioExt, AreaType, UserProfile } from '../../types';
import { UserPlus, Users, X, ShieldCheck, CheckCircle2, AlertCircle, Edit3, Crown, Eye, EyeOff, Lock, User as UserIcon, Mail } from 'lucide-react';

interface GestionUsuariosModalProps {
  abierto: boolean;
  onCerrar: () => void;
  usuarioInicialEditar?: UserProfile | null;
}

export const GestionUsuariosModal: React.FC<GestionUsuariosModalProps> = ({ abierto, onCerrar, usuarioInicialEditar }) => {
  const { usuariosSistema, crearUsuarioSistema, actualizarEstadoUsuario, actualizarUsuarioSistema } = useAuth();
  
  const [modo, setModo] = useState<'lista' | 'formulario'>('lista');
  const [usuarioEditar, setUsuarioEditar] = useState<UserProfile | null>(usuarioInicialEditar || null);

  // Form Fields matching media_1789078903242.png
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [area, setArea] = useState<AreaType>('dashboard');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [rolEspecifico, setRolEspecifico] = useState<RolUsuarioExt>('ADMINISTRADOR');
  const [email, setEmail] = useState('');
  const [activo, setActivo] = useState(true);
  const [esResponsableArea, setEsResponsableArea] = useState(false);

  const [feedback, setFeedback] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);

  if (!abierto) return null;

  const abrirFormularioCrear = () => {
    setUsuarioEditar(null);
    setNombreCompleto('');
    setNombreUsuario('');
    setPassword('admin123');
    setEmail('');
    setArea('laboratorio');
    setRole('LABORATORIO');
    setRolEspecifico('ANALISTA_LABORATORIO');
    setEsResponsableArea(false);
    setActivo(true);
    setModo('formulario');
  };

  const abrirFormularioEditar = (u: UserProfile) => {
    setUsuarioEditar(u);
    setNombreCompleto(u.displayName);
    setNombreUsuario(u.nombreUsuario || u.email.split('@')[0]);
    setPassword(u.password || 'admin123');
    setEmail(u.email);
    setArea(u.areaAsignada || 'laboratorio');
    setRole(u.role || 'LABORATORIO');
    setRolEspecifico((u.rolEspecifico as RolUsuarioExt) || 'ANALISTA_LABORATORIO');
    setEsResponsableArea(!!u.esResponsableArea);
    setActivo(u.activo);
    setModo('formulario');
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const emailFinal = email.trim() || `${(nombreUsuario || 'usuario').toLowerCase()}@stfgroup.com`;

    if (usuarioEditar) {
      const res = await actualizarUsuarioSistema(usuarioEditar.uid, {
        displayName: nombreCompleto,
        nombreUsuario,
        email: emailFinal,
        areaAsignada: area,
        role,
        rolEspecifico,
        esResponsableArea,
        activo,
        ...(password ? { password } : {})
      });

      if (res.exito) {
        setFeedback({ tipo: 'exito', mensaje: `Usuario "${nombreCompleto}" actualizado correctamente.` });
        setTimeout(() => {
          setModo('lista');
          setFeedback(null);
        }, 1200);
      } else {
        setFeedback({ tipo: 'error', mensaje: res.mensaje });
      }
    } else {
      const res = await crearUsuarioSistema({
        displayName: nombreCompleto,
        nombreUsuario,
        email: emailFinal,
        password,
        areaAsignada: area,
        role,
        rolEspecifico,
        esResponsableArea,
        activo
      });

      if (res.exito) {
        setFeedback({ tipo: 'exito', mensaje: res.mensaje });
        setTimeout(() => {
          setModo('lista');
          setFeedback(null);
        }, 1200);
      } else {
        setFeedback({ tipo: 'error', mensaje: res.mensaje });
      }
    }
  };

  const getPermisosDescripcion = (r: UserRole) => {
    switch (r) {
      case 'ADMIN':
        return 'Acceso total, gestión de usuarios, auditoría, configuración y aprobación global.';
      case 'LABORATORIO':
        return 'Recepción de solicitudes, ensayo técnico de telas/accesorios y emisión de dictamen.';
      case 'COMPRAS':
        return 'Creación de solicitudes de prueba, decisión sobre muestras y gestión de proveedores.';
      case 'PATRONAJE':
        return 'Calibración de moldería, escalado Gerber/Optitex y planilla dimensional.';
      case 'CORTE':
        return 'Verificación de trazabilidad, rendimiento de extendido y tendido en mesa.';
      default:
        return 'Consulta general de datos, emisión de reportes e indicadores estadísticos.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans overflow-y-auto">
      <div className="bg-[#FAF8F5] rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto border border-[#E5E0D8]">
        
        {/* Header Modal (Exact match media_1789078903242.png) */}
        <div className="bg-[#1C1714] text-white p-5 flex items-center justify-between border-b border-[#2D2622]">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C6A466]/15 border border-[#C6A466]/40 flex items-center justify-center text-[#C6A466] shadow-sm">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#FBF8F2] tracking-wide">
                {modo === 'formulario'
                  ? (usuarioEditar ? `Editar Usuario: ${usuarioEditar.displayName}` : 'Crear Nuevo Usuario')
                  : 'Gestión de Usuarios & Responsables de Área'}
              </h3>
              <p className="text-xs text-[#AA9E80] font-medium">
                Definición de Usuario → Área → Rol → Permisos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="p-1.5 rounded-xl text-[#AA9E80] hover:text-white hover:bg-[#2D2622] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">

          {/* Feedback Alert */}
          {feedback && (
            <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 font-bold ${
              feedback.tipo === 'exito' 
                ? 'bg-[#EEF3EA] border-[#94A786] text-[#485C3E]' 
                : 'bg-[#FAF0EC] border-[#DBA097] text-[#8C3D35]'
            }`}>
              {feedback.tipo === 'exito' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{feedback.mensaje}</span>
            </div>
          )}

          {modo === 'lista' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B6256] uppercase tracking-wider">
                  Usuarios Registrados ({usuariosSistema.length})
                </span>
                <button
                  type="button"
                  onClick={abrirFormularioCrear}
                  className="px-3.5 py-2 bg-[#1C1714] hover:bg-[#2D2622] text-[#C6A466] font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Nuevo Usuario</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-[#E5E0D8] rounded-2xl bg-white shadow-xs max-h-[360px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#1C1714] text-[#AA9E80] font-bold uppercase text-[10px] tracking-wider border-b border-[#2D2622] sticky top-0">
                    <tr>
                      <th className="py-3 px-4">Usuario</th>
                      <th className="py-3 px-4">Nombre Completo</th>
                      <th className="py-3 px-4">Área</th>
                      <th className="py-3 px-4">Rol</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {usuariosSistema.map((u) => (
                      <tr key={u.uid} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#1C1714]">
                          {u.nombreUsuario || u.email.split('@')[0]}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#1C1714]">
                          {u.displayName}
                        </td>
                        <td className="py-3 px-4 uppercase font-bold text-[#6B6256]">{u.areaAsignada || 'laboratorio'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#E5E0D8] text-[#1C1714]">
                            {u.rolEspecifico || u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            u.activo ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {u.activo ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => abrirFormularioEditar(u)}
                            className="px-2.5 py-1 bg-[#1C1714] hover:bg-[#2D2622] text-[#C6A466] rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* FORMULARIO EDITAR / CREAR (Pixel Perfect Matching media_1789078903242.png) */
            <form onSubmit={handleGuardar} className="space-y-4">
              
              {/* Field 1: Nombre Completo */}
              <div>
                <label className="block text-xs font-bold text-[#1C1714] mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  placeholder="ej: Edwin Diaz"
                  className="w-full bg-white border border-[#E5E0D8] rounded-xl p-2.5 text-xs text-[#1C1714] font-semibold focus:outline-none focus:border-[#C6A466] shadow-xs"
                />
              </div>

              {/* Row 2: Nombre de usuario (Login) + Nueva Contraseña */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1714] mb-1">
                    Nombre de Usuario (Login) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombreUsuario}
                    onChange={(e) => setNombreUsuario(e.target.value.toLowerCase().trim())}
                    placeholder="administracion"
                    className="w-full bg-white border border-[#E5E0D8] rounded-xl p-2.5 text-xs font-mono text-[#1C1714] font-semibold focus:outline-none focus:border-[#C6A466] shadow-xs"
                  />
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                    Identificador único para iniciar sesión en minúsculas
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1714] mb-1">
                    Nueva Contraseña {usuarioEditar ? '(opcional)' : '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="admin123"
                      className="w-full bg-white border border-[#E5E0D8] rounded-xl p-2.5 pr-9 text-xs font-mono text-[#1C1714] font-semibold focus:outline-none focus:border-[#C6A466] shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Área de Trabajo + Rol Asignado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1714] mb-1">
                    Área de Trabajo *
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value as AreaType)}
                    className="w-full bg-white border border-[#E5E0D8] rounded-xl p-2.5 text-xs font-bold text-[#1C1714] focus:outline-none focus:border-[#C6A466] shadow-xs cursor-pointer"
                  >
                    <option value="dashboard">Administración</option>
                    <option value="laboratorio">Laboratorio</option>
                    <option value="compras">Compras</option>
                    <option value="patronaje">Patronaje</option>
                    <option value="corte">Corte</option>
                    <option value="calidad">Calidad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1714] mb-1">
                    Rol Asignado *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const selectedRole = e.target.value as UserRole;
                      setRole(selectedRole);
                      const mapRolExt: Record<UserRole, RolUsuarioExt> = {
                        ADMIN: 'ADMINISTRADOR',
                        LABORATORIO: 'ANALISTA_LABORATORIO',
                        COMPRAS: 'ANALISTA_COMPRAS',
                        PATRONAJE: 'PATRONISTA',
                        CORTE: 'SUPERVISOR_CORTE',
                        SUPERVISOR: 'CONSULTA',
                        PROVEEDOR: 'CONSULTA'
                      };
                      setRolEspecifico(mapRolExt[selectedRole] || 'ANALISTA_LABORATORIO');
                    }}
                    className="w-full bg-white border border-[#E5E0D8] rounded-xl p-2.5 text-xs font-bold text-[#1C1714] focus:outline-none focus:border-[#C6A466] shadow-xs cursor-pointer"
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="LABORATORIO">Laboratorista</option>
                    <option value="COMPRAS">Analista de Compras</option>
                    <option value="PATRONAJE">Patronista</option>
                    <option value="CORTE">Supervisor de Corte</option>
                    <option value="SUPERVISOR">Supervisor General</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Correo Electrónico + Estado de Acceso */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1714] mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin.lab@stfgroup.com"
                    className="w-full bg-white border border-[#E5E0D8] rounded-xl p-2.5 text-xs font-medium text-[#1C1714] focus:outline-none focus:border-[#C6A466] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1714] mb-1">
                    Estado de Acceso
                  </label>
                  <select
                    value={activo ? 'activo' : 'inactivo'}
                    onChange={(e) => setActivo(e.target.value === 'activo')}
                    className="w-full bg-white border border-[#E5E0D8] rounded-xl p-2.5 text-xs font-bold text-[#1C1714] focus:outline-none focus:border-[#C6A466] shadow-xs cursor-pointer"
                  >
                    <option value="activo">Activo (Permite Login)</option>
                    <option value="inactivo">Inactivo (Acceso Bloqueado)</option>
                  </select>
                </div>
              </div>

              {/* Highlight Box: Permisos derivados para [Rol] */}
              <div className="bg-[#EBE7E1] border border-[#DDD8D0] p-3.5 rounded-2xl space-y-1">
                <strong className="text-xs font-bold text-[#1C1714] block">
                  Permisos derivados para {role === 'ADMIN' ? 'Administrador' : role === 'LABORATORIO' ? 'Laboratorista' : role}:
                </strong>
                <p className="text-xs text-[#5C554D] leading-relaxed">
                  ✓ {getPermisosDescripcion(role)}
                </p>
              </div>

              {/* Buttons Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => {
                    setModo('lista');
                    setUsuarioEditar(null);
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-[#6B6256] hover:text-[#1C1714] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1C1714] hover:bg-[#2D2622] text-[#C6A466] rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {usuarioEditar ? 'Actualizar Usuario' : 'Crear Usuario'}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
