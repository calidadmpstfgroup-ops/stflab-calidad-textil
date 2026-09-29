import React, { useState, useEffect } from 'react';
import { useQuality } from '../../context/QualityContext';
import { AreaType } from '../../types';
import { soundEffects } from '../../utils/soundEffects';
import { 
  Bell, 
  ShoppingCart, 
  Ruler, 
  Layers, 
  FlaskConical, 
  Volume2, 
  VolumeX, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  Mail
} from 'lucide-react';

export interface NotificacionItem {
  id: string;
  tipo: 'solicitud' | 'patronaje' | 'corte' | 'aprobado' | 'alerta';
  titulo: string;
  mensaje: string;
  areaDestino?: AreaType;
  subseccion?: string; // ej: 'telas' | 'accesorios'
  accionLabel?: string;
  onAccion?: () => void;
  tiempo?: string;
  leido?: boolean;
}


export const NotificationToastContainer: React.FC = () => {
  const { notificacionesActivas, eliminarNotificacion, setAreaActual, navegarA } = useQuality() as any;
  const [sonidoActivo, setSonidoActivo] = useState(true);

  const toggleSonido = () => {
    soundEffects.sonidoHabilitado = !sonidoActivo;
    setSonidoActivo(!sonidoActivo);
  };

  if (!notificacionesActivas || notificacionesActivas.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      
      {/* Botón flotante para alternar Sonido */}
      <div className="self-end pointer-events-auto">
        <button
          onClick={toggleSonido}
          title={sonidoActivo ? 'Desactivar Sonidos de Notificación' : 'Activar Sonidos de Notificación'}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-full text-[11px] font-bold shadow-lg backdrop-blur-md transition-all"
        >
          {sonidoActivo ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px]">Sonido ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] text-slate-400">Sonido OFF</span>
            </>
          )}
        </button>
      </div>

      {/* Lista de Toasts Animados */}
      {notificacionesActivas.map((notif: NotificacionItem) => {
        const estiloPorTipo = {
          solicitud: {
            bg: 'bg-gradient-to-r from-blue-950/95 via-slate-900/95 to-slate-900/95',
            border: 'border-blue-500/50',
            iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            icono: <ShoppingCart className="w-5 h-5 animate-pulse" />,
            badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            badgeTexto: 'NUEVA SOLICITUD',
            btnColor: 'bg-blue-600 hover:bg-blue-500 text-white'
          },
          patronaje: {
            bg: 'bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-slate-900/95',
            border: 'border-emerald-500/50',
            iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            icono: <Ruler className="w-5 h-5 animate-bounce" />,
            badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            badgeTexto: 'ALERTA PATRONAJE',
            btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white'
          },
          corte: {
            bg: 'bg-gradient-to-r from-orange-950/95 via-slate-900/95 to-slate-900/95',
            border: 'border-orange-500/50',
            iconBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            icono: <Layers className="w-5 h-5 animate-pulse" />,
            badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
            badgeTexto: 'ALERTA CORTE',
            btnColor: 'bg-orange-600 hover:bg-orange-500 text-white'
          },
          aprobado: {
            bg: 'bg-gradient-to-r from-purple-950/95 via-slate-900/95 to-slate-900/95',
            border: 'border-purple-500/50',
            iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            icono: <CheckCircle2 className="w-5 h-5" />,
            badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            badgeTexto: 'DICTAMEN LAB',
            btnColor: 'bg-purple-600 hover:bg-purple-500 text-white'
          },
          alerta: {
            bg: 'bg-gradient-to-r from-amber-950/95 via-slate-900/95 to-slate-900/95',
            border: 'border-amber-500/50',
            iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            icono: <AlertTriangle className="w-5 h-5" />,
            badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            badgeTexto: 'ATENCIÓN',
            btnColor: 'bg-amber-600 hover:bg-amber-500 text-white'
          }
        }[notif.tipo] || {
          bg: 'bg-slate-900/95',
          border: 'border-slate-700',
          iconBg: 'bg-purple-500/20 text-purple-400',
          icono: <Bell className="w-5 h-5" />,
          badge: 'bg-slate-800 text-slate-300',
          badgeTexto: 'NOTIFICACIÓN',
          btnColor: 'bg-purple-600 text-white'
        };

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${estiloPorTipo.bg} ${estiloPorTipo.border} transition-all transform animate-in fade-in slide-in-from-right duration-300 ring-1 ring-white/10`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${estiloPorTipo.iconBg}`}>
                {estiloPorTipo.icono}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${estiloPorTipo.badge}`}>
                    {estiloPorTipo.badgeTexto}
                  </span>
                  <button
                    onClick={() => eliminarNotificacion(notif.id)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-xs font-black text-white leading-snug">{notif.titulo}</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{notif.mensaje}</p>

                {/* Botón de Acción Rápida si tiene área destino o callback */}
                {(notif.areaDestino || notif.onAccion) && (
                  <div className="mt-2.5 flex items-center justify-end">
                    <button
                      onClick={() => {
                        if (notif.onAccion) {
                          notif.onAccion();
                        } else if (navegarA) {
                          navegarA(notif.areaDestino!, notif.subseccion);
                        } else if (notif.areaDestino) {
                          setAreaActual(notif.areaDestino);
                        }
                        eliminarNotificacion(notif.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black shadow transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer text-white ${estiloPorTipo.btnColor}`}
                    >
                      <span className="text-white font-bold">{notif.accionLabel || (notif.areaDestino ? `Ir a ${notif.areaDestino.toUpperCase()}` : 'Ver')}</span>
                      <ArrowRight className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

    </div>
  );
};
