import React from 'react';
import { DictamenType, EstadoEtapa } from '../../types';

interface BadgeProps {
  tipo?: 'dictamen' | 'estado' | 'marca' | 'leadTime' | 'prioridad';
  valor?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ tipo = 'dictamen', valor = '', className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size];

  const valSeguro = String(valor || '').toUpperCase();

  if (tipo === 'dictamen') {
    switch (valSeguro) {
      case 'OK':
      case 'APROBADO':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 ${sizeClasses} ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            OK
          </span>
        );
      case 'NOVEDAD':
      case 'HALLAZGO':
      case 'OK CON OBSERVACIÓN':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 ${sizeClasses} ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Novedad
          </span>
        );
      case 'RECHAZADO':
      case 'NO OK':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 ${sizeClasses} ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Rechazado
          </span>
        );
      case 'EN_PROCESO':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 ${sizeClasses} ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            En Proceso
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-700/50 border border-slate-600 text-slate-300 ${sizeClasses} ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Pendiente
          </span>
        );
    }
  }

  if (tipo === 'leadTime') {
    const dias = parseInt(valor, 10);
    const esCritico = dias > 2;

    if (esCritico) {
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-bold ${sizeClasses} ${className}`}>
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
          {dias}d (Lead Time &gt; 2d)
        </span>
      );
    }

    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 ${sizeClasses} ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        {dias}d en tiempo
      </span>
    );
  }

  if (tipo === 'marca') {
    const colorMap: Record<string, string> = {
      'Studio F': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      'ELA': 'bg-pink-500/10 text-pink-300 border-pink-500/20',
      'Studio F Men': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      'Outlet': 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    };
    const c = colorMap[valor] || 'bg-slate-800 text-slate-300 border-slate-700';

    return (
      <span className={`inline-flex items-center rounded-md border font-medium ${c} ${sizeClasses} ${className}`}>
        {valor}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-md bg-slate-800 border border-slate-700 text-slate-300 ${sizeClasses} ${className}`}>
      {valor}
    </span>
  );
};
