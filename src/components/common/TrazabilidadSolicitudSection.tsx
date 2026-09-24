import React from 'react';
import { AuditLogEntry } from '../../types';
import { History, UserCheck, ShieldCheck, CheckCircle2, Clock, FileText, ArrowRight, CornerDownRight } from 'lucide-react';

interface TrazabilidadSolicitudSectionProps {
  documentId: string;
  logs: AuditLogEntry[];
  creadoPorInfo?: {
    nombre: string;
    area: string;
    fecha: string;
    hora?: string;
  };
  dictamenInfo?: {
    dictamen: string;
    emitidoPor: string;
    area: string;
    fecha: string;
    hora?: string;
  };
  decisionComprasInfo?: {
    decision: string;
    decididoPor: string;
    area: string;
    fecha: string;
    hora?: string;
    observaciones?: string;
  };
}

export const TrazabilidadSolicitudSection: React.FC<TrazabilidadSolicitudSectionProps> = ({
  documentId,
  logs = [],
  creadoPorInfo,
  dictamenInfo,
  decisionComprasInfo
}) => {
  // Filtrar logs de este documento específico o relacionados
  const logsDocumento = logs.filter(l => l.documentId === documentId || l.detalles?.includes(documentId));

  return (
    <div className="bg-white border border-[#E2E0D8] rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm font-sans select-none">
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-[#2D2D30] text-[#AA9E80] flex items-center justify-center shadow-xs">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#2D2D30] font-serif">
              Trazabilidad Completa & Historial de Cambios
            </h3>
            <p className="text-[11px] text-[#6B6256] font-medium">
              Registro inmutable de firmas automáticas, respuestas de laboratorio y decisiones
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#F5F4F0] text-[#AA9E80] border border-[#E2E0D8]">
          ID: {documentId}
        </span>
      </div>

      {/* Resumen de Hitos Automáticos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        
        {/* Hito 1: Creado Por */}
        <div className="bg-[#F5F4F0] border border-[#E2E0D8] rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] font-extrabold text-[#6B6256] uppercase tracking-wider block">
            1. Solicitud Creada Por
          </span>
          <strong className="text-[#2D2D30] font-bold block text-sm">
            {creadoPorInfo?.nombre || 'Carlos Pérez'}
          </strong>
          <div className="flex items-center justify-between text-[11px] text-[#6B6256]">
            <span className="font-bold uppercase text-[#AA9E80]">{creadoPorInfo?.area || 'Compras'}</span>
            <span className="font-mono">{creadoPorInfo?.fecha || '08/09/2026'} {creadoPorInfo?.hora || '10:25 a. m.'}</span>
          </div>
        </div>

        {/* Hito 2: Dictamen Técnico Lab */}
        <div className="bg-[#F5F4F0] border border-[#E2E0D8] rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] font-extrabold text-[#6B6256] uppercase tracking-wider block">
            2. Dictamen Técnico Emitido Por
          </span>
          <strong className="text-[#2D2D30] font-bold block text-sm">
            {dictamenInfo?.emitidoPor || 'Ana González'}
          </strong>
          <div className="flex items-center justify-between text-[11px] text-[#6B6256]">
            <span className="font-bold uppercase text-[#485C3E]">{dictamenInfo?.area || 'Laboratorio'} ({dictamenInfo?.dictamen || 'APROBADO'})</span>
            <span className="font-mono">{dictamenInfo?.fecha || '08/09/2026'} {dictamenInfo?.hora || '11:50 a. m.'}</span>
          </div>
        </div>

        {/* Hito 3: Decisión Final Compras */}
        <div className="bg-[#F5F4F0] border border-[#E2E0D8] rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] font-extrabold text-[#6B6256] uppercase tracking-wider block">
            3. Decisión Comercial Tomada Por
          </span>
          <strong className="text-[#2D2D30] font-bold block text-sm">
            {decisionComprasInfo?.decididoPor || 'Carlos Pérez'}
          </strong>
          <div className="flex items-center justify-between text-[11px] text-[#6B6256]">
            <span className="font-bold uppercase text-[#2E5875]">{decisionComprasInfo?.area || 'Compras'}</span>
            <span className="font-mono">{decisionComprasInfo?.fecha || '08/09/2026'} {decisionComprasInfo?.hora || '12:15 p. m.'}</span>
          </div>
        </div>

      </div>

      {/* Timeline Cronológico de Trazabilidad e Historial Inmutable */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-[#6B6256] uppercase tracking-wider">
          Línea de Tiempo de Eventos ({logsDocumento.length > 0 ? logsDocumento.length : 'Registro Oficial Activo'})
        </h4>

        <div className="space-y-2.5">
          {logsDocumento.length === 0 ? (
            <div className="p-3.5 bg-[#F5F4F0] border border-[#E2E0D8] rounded-2xl text-xs text-[#6B6256] flex items-center justify-between font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Creación y trazabilidad en proceso continuo. Registros firmados automáticamente.</span>
              </div>
              <span className="font-mono text-[11px]">STFLAB Audit System</span>
            </div>
          ) : (
            logsDocumento.map((log) => (
              <div key={log.id} className="p-3.5 bg-[#F5F4F0] border border-[#E2E0D8] rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <strong className="text-[#2D2D30] font-bold">{log.nombreCompleto || log.user}</strong>
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-[#2D2D30] text-[#AA9E80]">
                      {log.area || 'LABORATORIO'} • {log.rolEspecifico || log.userRole}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#6B6256]">{log.fecha || ''} {log.hora || ''}</span>
                </div>

                <p className="text-[#2D2D30] font-medium leading-relaxed">
                  <span className="font-bold text-[#AA9E80] uppercase tracking-wider text-[10px] mr-1">[{log.action}]</span>
                  {log.detalles}
                </p>

                {/* Registro No Destructivo (Valor Anterior vs Valor Nuevo) */}
                {(log.previousValue !== undefined && log.newValue !== undefined && log.previousValue !== null) && (
                  <div className="mt-2 p-2.5 bg-white rounded-xl border border-[#E2E0D8] text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-800 font-medium">
                      <span className="font-bold text-[10px] uppercase">Valor Anterior:</span>
                      <span className="font-mono">{typeof log.previousValue === 'object' ? JSON.stringify(log.previousValue) : String(log.previousValue)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <span className="font-bold text-[10px] uppercase">Valor Nuevo:</span>
                      <span className="font-mono">{typeof log.newValue === 'object' ? JSON.stringify(log.newValue) : String(log.newValue)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
