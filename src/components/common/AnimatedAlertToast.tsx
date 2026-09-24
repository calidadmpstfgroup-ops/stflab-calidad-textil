import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Bell, 
  Sparkles, 
  X, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Send, 
  AlertTriangle,
  ClipboardCheck,
  MessageSquare,
  Lightbulb,
  Layers,
  FileText,
  Check,
  Ruler,
  Scissors
} from 'lucide-react';
import { AlertNotificationData, SeccionRespondidaLab } from '../../types';
import { soundEffects } from '../../utils/soundEffects';

interface AnimatedAlertToastProps {
  notification: AlertNotificationData | null;
  onClose: () => void;
}

export const AnimatedAlertToast: React.FC<AnimatedAlertToastProps> = ({ notification, onClose }) => {
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.getMuted());
  const [progress, setProgress] = useState<number>(100);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (!notification) return;

    // Play sound based on alert type
    if (notification.type === 'solicitud_enviada') {
      soundEffects.playSendChime();
    } else if (notification.type === 'solicitud_recibida' || notification.type === 'patronaje' || notification.type === 'corte') {
      soundEffects.playAlertBell();
    } else if (notification.type === 'solicitud_respondida' || notification.type === 'solicitud_aprobada') {
      soundEffects.playSuccessTone();
    } else {
      soundEffects.playSuccessTone();
    }

    const duration = notification.duration || (notification.type === 'solicitud_respondida' ? 10000 : 7000);
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    setProgress(100);
    const progressInterval = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(progressInterval);
            return 0;
          }
          return prev - step;
        });
      }
    }, intervalTime);

    let autoCloseTimer: any = null;
    if (!isPaused) {
      autoCloseTimer = setTimeout(() => {
        onClose();
      }, duration);
    }

    return () => {
      clearInterval(progressInterval);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
    };
  }, [notification, onClose, isPaused]);

  if (!notification) return null;

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEffects.setMuted(nextMuted);
    if (!nextMuted) {
      soundEffects.playSuccessTone();
    }
  };

  const getStyleByType = () => {
    switch (notification.type) {
      case 'solicitud_respondida':
        return {
          bgGradient: 'from-purple-950 via-slate-900 to-indigo-950',
          borderColor: 'border-purple-500/60',
          shadowGlow: 'shadow-[0_10px_35px_-5px_rgba(168,85,247,0.4)]',
          badgeBg: 'bg-purple-500/30 text-purple-200 border-purple-400/40',
          iconBg: 'bg-purple-600 text-white shadow-purple-900/50',
          progressBar: 'bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400',
          icon: <ClipboardCheck className="w-5 h-5" />
        };
      case 'patronaje':
        return {
          bgGradient: 'from-emerald-950 via-slate-900 to-slate-950',
          borderColor: 'border-emerald-500/60',
          shadowGlow: 'shadow-[0_10px_35px_-5px_rgba(16,185,129,0.4)]',
          badgeBg: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40',
          iconBg: 'bg-emerald-600 text-white',
          progressBar: 'bg-gradient-to-r from-emerald-400 to-teal-400',
          icon: <Ruler className="w-5 h-5" />
        };
      case 'corte':
        return {
          bgGradient: 'from-orange-950 via-slate-900 to-slate-950',
          borderColor: 'border-orange-500/60',
          shadowGlow: 'shadow-[0_10px_35px_-5px_rgba(249,115,22,0.4)]',
          badgeBg: 'bg-orange-500/30 text-orange-200 border-orange-400/40',
          iconBg: 'bg-orange-600 text-white',
          progressBar: 'bg-gradient-to-r from-orange-400 to-amber-500',
          icon: <Scissors className="w-5 h-5" />
        };
      case 'solicitud_enviada':
        return {
          bgGradient: 'from-amber-950 via-slate-900 to-slate-950',
          borderColor: 'border-amber-500/50',
          shadowGlow: 'shadow-[0_10px_35px_-5px_rgba(245,158,11,0.35)]',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          iconBg: 'bg-amber-500 text-slate-950',
          progressBar: 'bg-gradient-to-r from-amber-400 to-amber-600',
          icon: <Send className="w-5 h-5" />
        };
      case 'solicitud_recibida':
        return {
          bgGradient: 'from-emerald-950 via-slate-900 to-slate-950',
          borderColor: 'border-emerald-500/50',
          shadowGlow: 'shadow-[0_10px_35px_-5px_rgba(16,185,129,0.35)]',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          iconBg: 'bg-emerald-500 text-slate-950',
          progressBar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
          icon: <Bell className="w-5 h-5 animate-bounce" />
        };
      case 'solicitud_aprobada':
        return {
          bgGradient: 'from-blue-950 via-slate-900 to-slate-950',
          borderColor: 'border-blue-500/50',
          shadowGlow: 'shadow-[0_10px_35px_-5px_rgba(59,130,246,0.35)]',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          iconBg: 'bg-blue-500 text-white',
          progressBar: 'bg-gradient-to-r from-blue-400 to-indigo-500',
          icon: <CheckCircle2 className="w-5 h-5" />
        };
      case 'solicitud_rechazada':
        return {
          bgGradient: 'from-rose-950 via-slate-900 to-slate-950',
          borderColor: 'border-rose-500/50',
          shadowGlow: 'shadow-[0_10px_35px_-5px_rgba(244,63,94,0.35)]',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          iconBg: 'bg-rose-500 text-white',
          progressBar: 'bg-gradient-to-r from-rose-400 to-red-600',
          icon: <AlertTriangle className="w-5 h-5" />
        };
      default:
        return {
          bgGradient: 'from-slate-900 via-slate-900 to-slate-950',
          borderColor: 'border-amber-500/50',
          shadowGlow: 'shadow-[0_10px_35px_-5px_rgba(217,119,6,0.3)]',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          iconBg: 'bg-amber-500 text-slate-950',
          progressBar: 'bg-gradient-to-r from-amber-400 to-amber-600',
          icon: <Sparkles className="w-5 h-5" />
        };
    }
  };

  const style = getStyleByType();

  const renderIconForSection = (icono?: string) => {
    switch (icono) {
      case 'dictamen':
        return <ClipboardCheck className="w-3.5 h-3.5 text-purple-300 flex-shrink-0 mt-0.5" />;
      case 'observaciones':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-300 flex-shrink-0 mt-0.5" />;
      case 'recomendaciones':
        return <Lightbulb className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5" />;
      case 'muestras':
        return <Layers className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0 mt-0.5" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" />;
    }
  };

  return (
    <aside
      aria-label="Alerta de Solicitud"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="fixed top-5 right-5 z-50 max-w-lg w-full sm:w-[460px] transition-all duration-300 transform translate-y-0"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border ${style.borderColor} bg-gradient-to-br ${style.bgGradient} p-4 sm:p-5 text-white ${style.shadowGlow} backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300`}
      >
        {/* Animated Glow Rings */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-purple-500/15 blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none animate-pulse" />

        {/* Header row */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3">
            {/* Animated Icon */}
            <div className="relative flex-shrink-0 mt-0.5">
              <div className="absolute -inset-1 rounded-xl bg-purple-400/30 animate-ping opacity-60 pointer-events-none" />
              <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl font-bold shadow-md ${style.iconBg}`}>
                {style.icon}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {notification.title}
                </h4>
                {notification.codigo && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${style.badgeBg}`}>
                    {notification.codigo}
                  </span>
                )}
                {notification.dictamen && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    notification.dictamen === 'Aprobado Total' || notification.dictamen === 'APROBADO'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : notification.dictamen === 'Aprobado con Observaciones' || notification.dictamen === 'HALLAZGO'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {notification.dictamen}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {notification.message}
              </p>
            </div>
          </div>

          {/* Action buttons (Mute & Close) */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={toggleSound}
              type="button"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title={isMuted ? 'Activar sonido de alertas' : 'Silenciar sonido de alertas'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Breakdown of Sections Answered by Laboratorio */}
        {notification.seccionesRespondidas && notification.seccionesRespondidas.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-white/15 relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5 text-purple-400" />
                Secciones Respondidas por Laboratorio ({notification.seccionesRespondidas.length}):
              </span>
              {notification.responsableLab && (
                <span className="text-[10px] text-slate-400">
                  Por: <strong className="text-slate-200">{notification.responsableLab}</strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {notification.seccionesRespondidas.map((sec) => (
                <div 
                  key={sec.id}
                  className="bg-slate-950/60 border border-purple-500/25 hover:border-purple-500/50 rounded-xl p-2 sm:p-2.5 transition-all text-xs flex items-start gap-2.5"
                >
                  {renderIconForSection(sec.icono)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-white text-[11px]">
                        {sec.titulo}
                      </span>
                      {sec.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${sec.badgeColor || 'bg-purple-500/20 text-purple-300'}`}>
                          {sec.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-snug">
                      {sec.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumen de Muestras Badges */}
        {notification.resumenItems && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="bg-white/10 px-2 py-0.5 rounded-md text-slate-200 border border-white/10 font-semibold">
              Total Muestras: {notification.resumenItems.total}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> {notification.resumenItems.aprobadas} Aprobadas
            </span>
            {notification.resumenItems.observadas > 0 && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-semibold">
                ⚠️ {notification.resumenItems.observadas} Observadas
              </span>
            )}
            {notification.resumenItems.rechazadas > 0 && (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md font-semibold">
                ⛔ {notification.resumenItems.rechazadas} Rechazadas
              </span>
            )}
          </div>
        )}

        {/* Metadata Badges (ItemCount, Destino, Origen) */}
        {!notification.seccionesRespondidas && (notification.itemCount !== undefined || notification.areaDestino || notification.areaOrigen) && (
          <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
            {notification.itemCount !== undefined && (
              <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                <span className="font-semibold text-white">{notification.itemCount}</span> {notification.itemCount === 1 ? 'ítem / referencia' : 'ítems / referencias'}
              </span>
            )}
            {notification.areaDestino && (
              <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/20">
                Destino: <strong className="text-white">{notification.areaDestino}</strong>
              </span>
            )}
            {notification.areaOrigen && (
              <span className="inline-flex items-center gap-1 bg-white/5 text-slate-300 px-2 py-0.5 rounded-md border border-white/10">
                Origen: <strong className="text-white">{notification.areaOrigen}</strong>
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        {notification.actionLabel && notification.onAction && (
          <div className="mt-3 pt-2">
            <button
              onClick={() => {
                notification.onAction?.();
                onClose();
              }}
              type="button"
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer ${
                notification.type === 'solicitud_respondida'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-900/40'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
              }`}
            >
              <span>{notification.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Progress timer bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/80">
          <div
            className={`h-full ${style.progressBar} transition-all duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
