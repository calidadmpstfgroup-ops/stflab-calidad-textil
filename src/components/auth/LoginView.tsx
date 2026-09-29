import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { User as UserType } from '../../types';
import { 
  Key, 
  UserCheck, 
  ShieldAlert, 
  Loader2, 
  LogIn, 
  HelpCircle, 
  CheckCircle2, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  User as UserIcon, 
  Lock,
  Sun,
  Moon
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess?: (user: UserType) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { iniciarSesion, recuperarContrasena, cargando } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const esModoClaro = theme === 'light';
  
  const [modo, setModo] = useState<'login' | 'recuperar'>('login');

  // Login inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);

  // Recovery inputs
  const [recupUsuario, setRecupUsuario] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarNuevaPassword, setConfirmarNuevaPassword] = useState('');

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setMensajeExito('');

    if (!username.trim()) {
      setLocalError('Por favor ingresa tu nombre de usuario o correo.');
      return;
    }

    if (!password.trim()) {
      setLocalError('Por favor ingresa tu contraseña.');
      return;
    }

    setLoadingLocal(true);
    try {
      await iniciarSesion(username.trim(), password.trim());
      if (onLoginSuccess) {
        onLoginSuccess({
          username: username.trim(),
          name: username.trim(),
          area: 'laboratorio'
        });
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Usuario o contraseña incorrectos. Verifica tus credenciales.');
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleSubmitRecuperar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setMensajeExito('');

    if (!recupUsuario.trim()) {
      setLocalError('Por favor ingresa tu usuario o correo para recuperar.');
      return;
    }

    if (!nuevaPassword.trim() || nuevaPassword.trim().length < 4) {
      setLocalError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (nuevaPassword !== confirmarNuevaPassword) {
      setLocalError('Las contraseñas no coinciden. Intenta de nuevo.');
      return;
    }

    setLoadingLocal(true);
    try {
      const res = await recuperarContrasena(recupUsuario.trim(), nuevaPassword.trim());
      if (res.exito) {
        setMensajeExito(res.mensaje);
        setUsername(recupUsuario.trim());
        setPassword(nuevaPassword.trim());
        setTimeout(() => {
          setModo('login');
          setMensajeExito('¡Contraseña restablecida! Ingresa tus nuevas credenciales para acceder.');
        }, 1500);
      } else {
        setLocalError(res.mensaje);
      }
    } catch (err: any) {
      setLocalError(err?.message || 'No se pudo restablecer la contraseña.');
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans select-none transition-colors duration-200 relative ${
      esModoClaro 
        ? 'bg-[#f3f6fb] text-slate-900' 
        : 'bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white'
    }`}>
      
      {/* Botón flotante para alternar Modo Claro / Oscuro en Login */}
      <button
        type="button"
        onClick={toggleTheme}
        title={theme === 'dark' ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
        className={`absolute top-5 right-5 p-2.5 rounded-2xl border transition-all cursor-pointer shadow-md flex items-center gap-2 text-xs font-bold ${
          esModoClaro
            ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
        }`}
      >
        {theme === 'dark' ? (
          <>
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Modo Claro</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-slate-700" />
            <span className="hidden sm:inline">Modo Oscuro</span>
          </>
        )}
      </button>

      <div className={`max-w-md w-full rounded-3xl shadow-2xl border p-8 space-y-7 animate-fade-in relative overflow-hidden transition-colors ${
        esModoClaro
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        
        {/* Branding header STUDIO F / STF GROUP */}
        <div className={`text-center border rounded-2xl p-6 shadow-inner relative z-10 transition-colors ${
          esModoClaro ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex flex-col items-center justify-center select-none py-1">
            <span className="font-sans font-light text-2xl sm:text-3xl tracking-[0.25em] text-amber-400 uppercase leading-none pl-[0.25em]">
              STUDIO F
            </span>
            <span className={`font-sans font-bold text-[9px] tracking-[0.35em] uppercase mt-2.5 pl-[0.35em] ${
              esModoClaro ? 'text-slate-500' : 'text-amber-200/70'
            }`}>
              STF GROUP
            </span>
          </div>
          <div className={`h-[1px] w-12 mx-auto my-3 ${esModoClaro ? 'bg-slate-200' : 'bg-slate-800'}`} />
          <h2 className={`text-xs font-sans font-bold uppercase tracking-widest ${esModoClaro ? 'text-slate-700' : 'text-slate-300'}`}>
            STFLab 2.0
          </h2>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-amber-400">
            {modo === 'login' ? 'Laboratorio Materias Primas & Calidad' : 'Restablecer Clave de Acceso'}
          </p>
        </div>

        {/* Feedback messages */}
        {localError && (
          <div className="bg-rose-500/10 border-l-4 border-rose-500 p-3.5 rounded-r-xl flex items-start space-x-2.5 text-rose-500 dark:text-rose-300 text-xs font-semibold animate-fade-in">
            <ShieldAlert className="h-5 w-5 text-rose-500 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <p>{localError}</p>
          </div>
        )}

        {mensajeExito && (
          <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-3.5 rounded-r-xl flex items-start space-x-2.5 text-emerald-600 dark:text-emerald-300 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <p>{mensajeExito}</p>
          </div>
        )}

        {modo === 'login' ? (
          /* Login Form - Username & Password (No Area Tabs) */
          <form className="space-y-6 relative z-10" onSubmit={handleSubmitLogin}>
            <div className="space-y-5 text-xs">
              
              {/* Field 1: Nombre de usuario */}
              <div>
                <label htmlFor="username" className={`block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ${
                  esModoClaro ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <UserIcon className="h-4 w-4 text-[#00b4d8]" />
                  </span>
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`block w-full pl-10 pr-4 py-3 border rounded-2xl transition-all font-mono text-xs font-semibold focus:outline-none ${
                      esModoClaro
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#00b4d8]'
                        : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-[#00b4d8]'
                    }`}
                    placeholder="ej: ana.gonzalez, carlos.perez..."
                  />
                </div>
              </div>

              {/* Field 2: Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className={`block text-[11px] font-extrabold uppercase tracking-widest ${
                    esModoClaro ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Contraseña
                  </label>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    USUARIO → ÁREA → ROL
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="h-4 w-4 text-[#00b4d8]" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-2xl transition-all font-mono text-xs font-semibold focus:outline-none ${
                      esModoClaro
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#00b4d8]'
                        : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-[#00b4d8]'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Actions & Recovery link */}
            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={cargando || loadingLocal}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#0096c7] hover:to-[#0077b6] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-cyan-500/25 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {(cargando || loadingLocal) ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <LogIn className="w-4 h-4 text-white stroke-[2.5]" />
                )}
                <span>Ingresar al Aplicativo</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setRecupUsuario(username);
                    setLocalError('');
                    setMensajeExito('');
                    setModo('recuperar');
                  }}
                  className={`text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto ${
                    esModoClaro ? 'text-slate-500 hover:text-[#00b4d8]' : 'text-slate-400 hover:text-[#00b4d8]'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#00b4d8]" />
                  <span>¿Olvidaste tu contraseña? Restablecer aquí</span>
                </button>
              </div>
            </div>

          </form>
        ) : (
          /* Formulario de Recuperación de Contraseña */
          <form className="space-y-5 relative z-10" onSubmit={handleSubmitRecuperar}>
            <div className="space-y-4 text-xs">
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                  esModoClaro ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  Nombre de Usuario o Correo Institucional *
                </label>
                <input
                  type="text"
                  required
                  value={recupUsuario}
                  onChange={(e) => setRecupUsuario(e.target.value)}
                  className={`block w-full px-3.5 py-2.5 border rounded-xl font-medium text-xs font-mono focus:outline-none ${
                    esModoClaro
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#00b4d8]'
                      : 'bg-slate-950 border-slate-700 text-white focus:border-[#00b4d8]'
                  }`}
                  placeholder="ej: ana.gonzalez"
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                  esModoClaro ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  Nueva Contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  className={`block w-full px-3.5 py-2.5 border rounded-xl font-medium text-xs font-mono focus:outline-none ${
                    esModoClaro
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#00b4d8]'
                      : 'bg-slate-950 border-slate-700 text-white focus:border-[#00b4d8]'
                  }`}
                  placeholder="Mínimo 4 caracteres"
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                  esModoClaro ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={confirmarNuevaPassword}
                  onChange={(e) => setConfirmarNuevaPassword(e.target.value)}
                  className={`block w-full px-3.5 py-2.5 border rounded-xl font-medium text-xs font-mono focus:outline-none ${
                    esModoClaro
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#00b4d8]'
                      : 'bg-slate-950 border-slate-700 text-white focus:border-[#00b4d8]'
                  }`}
                  placeholder="Repite la contraseña"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loadingLocal}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#0096c7] hover:to-[#0077b6] text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loadingLocal ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-white" />
                )}
                <span>Guardar Nueva Contraseña</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLocalError('');
                  setMensajeExito('');
                  setModo('login');
                }}
                className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  esModoClaro ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Volver a Iniciar Sesión
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};


