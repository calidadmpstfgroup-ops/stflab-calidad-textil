import React, { useState, useEffect } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useLanguage } from '../../context/LanguageContext';
import { GestionUsuariosModal } from '../usuarios/GestionUsuariosModal';
import { 
  Settings, 
  User, 
  Users,
  UserPlus,
  Shield, 
  CheckCircle, 
  Smartphone, 
  Database, 
  Download, 
  RefreshCw, 
  Layers,
  Sparkles,
  Info,
  Plus,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  X,
  CheckCircle2,
  Building2,
  KeyRound,
  BadgeCheck
} from 'lucide-react';
import { AreaType, AnalistaLaboratorio } from '../../types';

export interface AreaResponsable {
  id: string;
  area: AreaType;
  nombre: string;
  cargo: string;
  email: string;
  esPrincipal?: boolean;
}

export const ConfiguracionView: React.FC = () => {
  const { 
    analistas,
    analistaActivo
  } = useQuality();
  const { t } = useLanguage();
  const [notif, setNotif] = useState<string | null>(null);
  const [storageSize, setStorageSize] = useState<string>("0 KB");
  const [activeSettingsTab, setActiveSettingsTab] = useState<'usuarios' | 'tolerancias' | 'pwa' | 'almacenamiento'>('usuarios');
  const [modalUsuariosAbierto, setModalUsuariosAbierto] = useState(false);

  // Calculate local storage size
  useEffect(() => {
    let totalBytes = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalBytes += (localStorage[key].length + key.length) * 2;
      }
    }
    setStorageSize((totalBytes / 1024).toFixed(2) + " KB");
  }, [notif]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Configuración del laboratorio guardada correctamente.");
  };

  const showToast = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        analistas,
        backupDate: new Date().toISOString(),
        platform: 'STFLab Quality 2.0'
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `STFLab_Backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      showToast("Copia de seguridad exportada en JSON correctamente.");
    } catch (e) {
      showToast("Fallo al exportar copia de seguridad.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Toast Notif */}
      {notif && (
        <div className="fixed bottom-4 right-4 bg-[#2B2B2E] text-[#C6A466] text-xs px-4 py-3 rounded-xl shadow-lg flex items-center space-x-2 border border-[#C6A466]/30 z-50 animate-bounce">
          <CheckCircle className="h-4 w-4 text-[#485C3E]" />
          <span>{notif}</span>
        </div>
      )}

      {/* Title block */}
      <div className="bg-[#2B2B2E] border border-[#424246] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#FBF8F2]">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-2xl bg-[#C6A466]/10 text-[#C6A466] border border-[#C6A466]/20 flex items-center justify-center shrink-0 shadow-md">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-[#FBF8F2] tracking-tight font-sans">
                Configuración de la Plataforma STFLab 2.0
              </h2>
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[#C6A466]/15 text-[#C6A466] border border-[#C6A466]/30 font-mono tracking-wider">
                SISTEMA & RBAC
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#A8A095] mt-1 font-medium leading-relaxed">
              Gestión de usuarios laboratoristas, firmas digitales, parámetros de seguridad y copias de respaldo.
            </p>
          </div>
        </div>

        <span className="bg-[#1E1E21] text-[#C6A466] font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl border border-[#C6A466]/30 flex items-center space-x-2 self-start sm:self-center shrink-0">
          <Smartphone className="h-4 w-4 text-[#C6A466]" />
          <span>PWA Activa & Offline</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Options Navigation */}
        <div className="lg:col-span-4 bg-[#2D2D30] rounded-3xl border border-[#424246] shadow-sm p-4 space-y-1.5 h-fit text-[#FBF8F2]">
          <span className="text-[9px] font-bold text-[#AA9E80] uppercase tracking-widest px-3 block mb-1">Módulos del Sistema</span>
          
          <button 
            type="button"
            onClick={() => setActiveSettingsTab('usuarios')}
            className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeSettingsTab === 'usuarios' 
                ? 'bg-[#C6A466] text-[#2B2B2E] font-bold shadow-sm' 
                : 'text-[#AA9E80] hover:bg-[#2B2B2E] hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Users className="h-4 w-4" />
              <span>Gestión de Usuarios y Perfiles</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold font-mono bg-[#2B2B2E] text-[#C6A466] border border-[#424246]">
              {analistas.length}
            </span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveSettingsTab('tolerancias')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeSettingsTab === 'tolerancias' 
                ? 'bg-[#C6A466] text-[#2B2B2E] font-bold shadow-sm' 
                : 'text-[#AA9E80] hover:bg-[#2B2B2E] hover:text-white'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Tolerancias Técnicas (NTC)</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveSettingsTab('pwa')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeSettingsTab === 'pwa' 
                ? 'bg-[#C6A466] text-[#2B2B2E] font-bold shadow-sm' 
                : 'text-[#AA9E80] hover:bg-[#2B2B2E] hover:text-white'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Configurar Acceso PWA Móvil</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveSettingsTab('almacenamiento')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeSettingsTab === 'almacenamiento' 
                ? 'bg-[#C6A466] text-[#2B2B2E] font-bold shadow-sm' 
                : 'text-[#AA9E80] hover:bg-[#2B2B2E] hover:text-white'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>LocalStorage y Backups</span>
          </button>
        </div>

        {/* Right Settings Content Form */}
        <div className="lg:col-span-8 bg-[#2D2D30] text-[#FBF8F2] rounded-3xl border border-[#424246] shadow-sm p-6 space-y-6 text-xs">
          
          {/* MÓDULO ÚNICO: GESTIÓN INTEGRAL DE USUARIOS Y PERFILES */}
          {activeSettingsTab === 'usuarios' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Header de Módulo Único */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#424246] pb-4">
                <div>
                  <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#FBF8F2] flex items-center space-x-2">
                    <Users className="h-5 w-5 text-[#C6A466]" />
                    <span>Gestión Integral de Usuarios y Perfiles</span>
                  </h3>
                  <p className="text-[#AA9E80] text-[11px] mt-1">
                    Módulo centralizado para administrar analistas emisores, firmas digitales y credenciales de acceso.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setModalUsuariosAbierto(true)}
                    className="px-3.5 py-2 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#2B2B2E] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Gestionar Perfiles</span>
                  </button>
                </div>
              </div>



              {/* Módulo de Gestión RBAC */}
              <div className="bg-[#2B2B2E] border border-[#424246] rounded-2xl p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#C6A466]/10 text-[#C6A466] border border-[#C6A466]/20 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-sm font-bold text-[#FBF8F2] font-serif uppercase tracking-wider">
                    Administración de Usuarios y Permisos del Sistema
                  </h4>
                  <p className="text-xs text-[#AA9E80]">
                    Haga clic en el botón inferior para abrir el panel interactivo de creación y edición de usuarios, asignación de áreas y roles RBAC.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalUsuariosAbierto(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#2B2B2E] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Gestionar Usuarios & Permisos RBAC</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: TOLERANCIAS */}
          {activeSettingsTab === 'tolerancias' && (
            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#FBF8F2] border-b border-[#424246] pb-2">
                  Tolerancias Técnicas e Indicadores de Rechazo
                </h3>
                <p className="text-[#AA9E80] text-[11px] mt-1">
                  Alineado con Normas Técnicas Colombianas (NTC 228, NTC 230, NTC 481, NTC 1599) y AATCC 135.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#AA9E80] uppercase tracking-wide mb-1">Límite Encogimiento Crítico Máximo (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue="3.0"
                      className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-xs text-[#FBF8F2] font-mono font-bold outline-none focus:border-[#C6A466]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#AA9E80] uppercase tracking-wide mb-1">Tolerancia de Desviación de Ancho Útil (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue="1.5"
                      className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-xs text-[#FBF8F2] font-mono font-bold outline-none focus:border-[#C6A466]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#AA9E80] uppercase tracking-wide mb-1">Límite de Elasticidad Trama Máxima (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue="15.0"
                      className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-xs text-[#FBF8F2] font-mono font-bold outline-none focus:border-[#C6A466]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#AA9E80] uppercase tracking-wide mb-1">Calificación de Pilling Mínima (Escala 1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      defaultValue="4"
                      className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-xs text-[#FBF8F2] font-mono font-bold outline-none focus:border-[#C6A466]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#424246]">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#2B2B2E] font-bold rounded-xl tracking-wider text-xs uppercase transition-colors cursor-pointer shadow-sm"
                >
                  Guardar Tolerancias Técnicas
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PWA */}
          {activeSettingsTab === 'pwa' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#FBF8F2] border-b border-[#424246] pb-2 flex items-center space-x-2">
                  <Smartphone className="h-4.5 w-4.5 text-[#C6A466]" />
                  <span>Configuración e Instalación PWA (Acceso Directo Celular)</span>
                </h3>
                
                <p className="text-[#AA9E80] text-[11px] leading-relaxed mt-2">
                  Plataforma web de <strong>Studio F Group</strong> optimizada como <strong>PWA (Progressive Web App)</strong> para funcionar a pantalla completa con persistencia sin conexión.
                </p>

                <div className="bg-[#2B2B2E] border border-[#424246] rounded-2xl p-4 mt-4 space-y-3">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-[#C6A466] block">📱 Cómo instalar en Dispositivo Móvil</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-[#2D2D30] border border-[#424246] rounded-xl space-y-1">
                      <span className="font-serif font-bold text-[#FBF8F2] text-[10px] uppercase block">En iOS (Apple Safari)</span>
                      <ol className="list-decimal list-inside text-[10px] text-[#AA9E80] space-y-1">
                        <li>Abra la plataforma en su navegador Safari.</li>
                        <li>Toque el botón de <strong>Compartir</strong> en la barra inferior.</li>
                        <li>Desplace y seleccione <strong>"Agregar a Inicio"</strong>.</li>
                      </ol>
                    </div>

                    <div className="p-3 bg-[#2D2D30] border border-[#424246] rounded-xl space-y-1">
                      <span className="font-serif font-bold text-[#FBF8F2] text-[10px] uppercase block">En Android (Chrome / Edge)</span>
                      <ol className="list-decimal list-inside text-[10px] text-[#AA9E80] space-y-1">
                        <li>Abra la app en Google Chrome.</li>
                        <li>Toque el menú de <strong>3 puntos</strong> superior.</li>
                        <li>Presione <strong>"Instalar Aplicación"</strong>.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ALMACENAMIENTO */}
          {activeSettingsTab === 'almacenamiento' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#FBF8F2] border-b border-[#424246] pb-2 flex items-center space-x-2">
                  <Database className="h-4.5 w-4.5 text-[#C6A466]" />
                  <span>Almacenamiento LocalStorage & Copias de Seguridad</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-[#2B2B2E] border border-[#424246] rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-[#AA9E80] uppercase tracking-wide block">Almacenamiento Consumido</span>
                    <span className="text-2xl font-bold text-[#FBF8F2] font-mono block">{storageSize}</span>
                  </div>

                  <div className="p-4 bg-[#2B2B2E] border border-[#424246] rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-[#AA9E80] uppercase tracking-wide block">Estado del Sistema</span>
                    <span className="text-[#485C3E] font-bold text-sm block">Sincronizado en Tiempo Real</span>
                  </div>
                </div>

                <div className="border-t border-[#424246] pt-4 mt-4">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="bg-[#C6A466] hover:bg-[#D6CDB8] text-[#2B2B2E] px-4 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Exportar Copia de Seguridad JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal de Gestión de Usuarios & Roles */}
      <GestionUsuariosModal
        abierto={modalUsuariosAbierto}
        onCerrar={() => setModalUsuariosAbierto(false)}
      />

    </div>
  );
};
