import React, { useState, useEffect } from 'react';
import { 
  ItemMuestraTela, 
  SolicitudTelasCompleta, 
  DecisionCompraTela, 
  AlertaFuncionalArea 
} from '../../types';
import { Badge } from '../common/Badge';
import { 
  X, 
  ShoppingCart, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Ruler, 
  Scissors, 
  Sparkles, 
  Info, 
  FileText, 
  FlaskConical,
  Percent,
  Send,
  Ban
} from 'lucide-react';

interface ModalDecisionCompraTelaProps {
  abierto: boolean;
  onCerrar: () => void;
  solicitud: SolicitudTelasCompleta;
  tela: ItemMuestraTela;
  onGuardarDecision: (solicitudId: string, telaId: string, decisionData: DecisionCompraTela) => void;
}

export const ModalDecisionCompraTela: React.FC<ModalDecisionCompraTelaProps> = ({
  abierto,
  onCerrar,
  solicitud,
  tela,
  onGuardarDecision
}) => {
  const [decisionTipo, setDecisionTipo] = useState<'COMPRAR' | 'NO_COMPRAR'>('COMPRAR');
  const [responsable, setResponsable] = useState('Compras - Telas (Andrea Ramos)');
  const [motivoDecision, setMotivoDecision] = useState('');
  const [descuentoPorc, setDescuentoPorc] = useState<number>(0);

  // Alertas para Patronaje
  const [aplicaPatronaje, setAplicaPatronaje] = useState(true);
  const [tituloPatronaje, setTituloPatronaje] = useState('Compensación de Moldería por Encogimiento');
  const [descPatronaje, setDescPatronaje] = useState('');

  // Alertas para Corte
  const [aplicaCorte, setAplicaCorte] = useState(true);
  const [tituloCorte, setTituloCorte] = useState('Control de Reposo y Tensión en Mesa');
  const [descCorte, setDescCorte] = useState('');

  // Generar alertas funcionales inteligentes basadas en el dictamen y mediciones de laboratorio
  useEffect(() => {
    if (!tela) return;

    // Calcular compensaciones automáticas a partir de la evaluación técnica de lab
    const encLargo = parseFloat(String(tela.evaluacionTecnica?.encogimientoLargo?.medidoLab ?? -2.5)) || -2.5;
    const encAncho = parseFloat(String(tela.evaluacionTecnica?.encogimientoAncho?.medidoLab ?? -3.0)) || -3.0;
    const viro = parseFloat(String(tela.evaluacionTecnica?.torqueViroPierna?.medidoLab ?? 1.5)) || 1.5;

    const sugerenciaPatronaje = `Compensar molde base: +${Math.abs(encLargo)}% a lo largo (urdimbre) y +${Math.abs(encAncho)}% a lo ancho (trama). Verificar calce en maniquí para evitar deformación por textura/caída.`;
    setDescPatronaje(sugerenciaPatronaje);

    let sugerenciaCorte = `Reposo textil obligatorio de 24 a 48 horas previo al corte. Tendido libre de tensión en mesa.`;
    if (Math.abs(viro) > 2.0) {
      sugerenciaCorte += ` Atención: Viro detectado en laboratorio (${viro}%), cortar en un solo sentido.`;
    }
    sugerenciaCorte += ` Realizar prueba de fusionado/adhesivo antes de corte en serie.`;
    setDescCorte(sugerenciaCorte);

    if (tela.dictamen === 'HALLAZGO') {
      setMotivoDecision('Compra aprobada con observaciones técnicas bajo control y seguimiento de moldería.');
      setDescuentoPorc(3);
    } else if (tela.dictamen === 'RECHAZADO') {
      setDecisionTipo('NO_COMPRAR');
      setMotivoDecision('Tela rechazada técnicamente por laboratorio. No cumple con las tolerancias exigidas por calidad.');
    } else {
      setDecisionTipo('COMPRAR');
      setMotivoDecision('Tela conforme con especificaciones técnicas y ficha técnica.');
      setDescuentoPorc(0);
    }
  }, [tela]);

  if (!abierto) return null;

  const handleConfirmar = (e: React.FormEvent) => {
    e.preventDefault();

    const alertaPatronajeObj: AlertaFuncionalArea | undefined = aplicaPatronaje ? {
      aplica: true,
      titulo: tituloPatronaje,
      descripcion: descPatronaje,
      nivelAlerta: tela.dictamen === 'HALLAZGO' ? 'PRECAUCION' : 'INFORMATIVA'
    } : undefined;

    const alertaCorteObj: AlertaFuncionalArea | undefined = aplicaCorte ? {
      aplica: true,
      titulo: tituloCorte,
      descripcion: descCorte,
      nivelAlerta: tela.dictamen === 'HALLAZGO' ? 'PRECAUCION' : 'INFORMATIVA'
    } : undefined;

    const decisionFinal: DecisionCompraTela = {
      decision: decisionTipo,
      fechaDecision: new Date().toISOString().split('T')[0],
      responsable,
      motivoDecision,
      descuentoNegociadoPorc: decisionTipo === 'COMPRAR' ? descuentoPorc : 0,
      alertaPatronaje: decisionTipo === 'COMPRAR' ? alertaPatronajeObj : undefined,
      alertaCorte: decisionTipo === 'COMPRAR' ? alertaCorteObj : undefined,
      alertasGenerales: decisionTipo === 'COMPRAR' 
        ? `Decisión de Compra: ${decisionTipo}. Alertas generadas para Patronaje y Corte.` 
        : `Decisión de Compra: NO COMPRAR. Proceso detenido inmediatamente.`
    };

    onGuardarDecision(solicitud.id, tela.id, decisionFinal);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2B2B2E]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#2B2B2E] border border-[#424246] rounded-3xl shadow-2xl overflow-hidden my-6 text-[#FBF8F2] flex flex-col max-h-[90vh] font-sans">
        
        {/* Header Modal */}
        <div className="bg-[#2D2D30] px-6 py-4 border-b border-[#424246] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C6A466]/20 border border-[#C6A466]/40 flex items-center justify-center text-[#F0DCA8]">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold uppercase tracking-wider text-[#FBF8F2]">Decisión de Compra tras Dictamen de Laboratorio</h3>
                <span className="text-[10px] font-mono font-bold bg-[#C6A466]/20 text-[#F0DCA8] border border-[#C6A466]/40 px-2 py-0.5 rounded-full">
                  COMPRAS - TELAS
                </span>
              </div>
              <p className="text-xs text-[#AA9E80]">
                Evalúa el dictamen emitido por Laboratorio y decide si se procede con la compra o se detiene el proceso.
              </p>
            </div>
          </div>

          <button onClick={onCerrar} className="p-2 text-[#AA9E80] hover:text-[#FBF8F2] rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <form onSubmit={handleConfirmar} className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* 1. Resumen de la Tela y Dictamen de Laboratorio */}
          <div className="bg-[#2D2D30] p-4 rounded-2xl border border-[#424246] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#424246] pb-2.5">
              <div>
                <span className="text-[#AA9E80] text-[10px] block uppercase font-mono">Solicitud: {solicitud.numeroSolicitud}</span>
                <h4 className="text-sm font-serif font-bold uppercase text-[#FBF8F2]">{tela.referencia}</h4>
                <p className="text-[11px] text-[#AA9E80]">
                  Proveedor: <strong className="text-[#F0DCA8]">{tela.proveedor}</strong> • # OC COL: <strong className="text-[#94A786] font-mono">{tela.ocCol}</strong>
                </p>
              </div>

              <div className="text-right flex flex-col sm:items-end">
                <span className="text-[10px] text-[#AA9E80] uppercase font-bold block mb-1">Dictamen Laboratorio</span>
                <Badge tipo="dictamen" valor={tela.dictamen || 'EN_PROCESO'} size="md" />
              </div>
            </div>

            {/* Resultado de Laboratorio */}
            <div className="bg-[#2B2B2E] p-3 rounded-xl border border-[#424246] space-y-1 text-[#F0EFEB]">
              <span className="text-[10px] text-[#C6A466] font-mono font-bold uppercase flex items-center gap-1">
                <FlaskConical className="w-3.5 h-3.5 text-[#C6A466]" />
                Informe Técnico Emitido por Laboratorio:
              </span>
              <p className="text-xs text-[#FBF8F2] font-medium italic">
                "{tela.resultadoLab || tela.observacionesLabRespuesta || 'Evaluación técnica concluida por Laboratorio Textil.'}"
              </p>
              {tela.responsableLab && (
                <span className="text-[10px] text-[#AA9E80] block pt-1">
                  Evaluador: <strong className="text-[#F0DCA8]">{tela.responsableLab}</strong> • Fecha: <strong className="text-[#F0DCA8]">{tela.fechaRespuestaLab || 'Reciente'}</strong>
                </span>
              )}
            </div>
          </div>

          {/* 2. Selector de Decisión de Compra */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-[#FBF8F2] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯</span>
              <span>¿Se aprueba la compra de esta tela?</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Opción A: COMPRAR */}
              <div
                onClick={() => setDecisionTipo('COMPRAR')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                  decisionTipo === 'COMPRAR'
                    ? 'bg-[#485C3E]/20 border-[#94A786] ring-2 ring-[#94A786]/30 shadow-lg'
                    : 'bg-[#2D2D30] border-[#424246] hover:border-[#AA9E80]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-5 h-5 ${decisionTipo === 'COMPRAR' ? 'text-[#94A786]' : 'text-[#AA9E80]'}`} />
                    <span className="font-bold text-sm text-[#FBF8F2]">SÍ, COMPRAR TELA</span>
                  </div>
                  <span className="text-[9px] font-mono bg-[#485C3E]/30 text-[#94A786] font-bold px-2 py-0.5 rounded">
                    CONTINÚA FLUJO
                  </span>
                </div>
                <p className="text-[11px] text-[#AA9E80] leading-relaxed">
                  Se autoriza la compra del lote. <strong>Se emitirán alertas funcionales automáticas para Patronaje y Corte</strong> con las precauciones técnicas necesarias.
                </p>
              </div>

              {/* Opción B: NO COMPRAR */}
              <div
                onClick={() => setDecisionTipo('NO_COMPRAR')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                  decisionTipo === 'NO_COMPRAR'
                    ? 'bg-[#8C3D35]/20 border-[#DBA097] ring-2 ring-[#DBA097]/30 shadow-lg'
                    : 'bg-[#2D2D30] border-[#424246] hover:border-[#AA9E80]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ban className={`w-5 h-5 ${decisionTipo === 'NO_COMPRAR' ? 'text-[#DBA097]' : 'text-[#AA9E80]'}`} />
                    <span className="font-bold text-sm text-[#FBF8F2]">NO COMPRAR (DESCARTAR)</span>
                  </div>
                  <span className="text-[9px] font-mono bg-[#8C3D35]/30 text-[#DBA097] font-bold px-2 py-0.5 rounded">
                    PROCESO DETENIDO
                  </span>
                </div>
                <p className="text-[11px] text-[#AA9E80] leading-relaxed">
                  Se descarta la compra de esta tela. <strong>El proceso se detiene inmediatamente aquí y no avanza a Patronaje ni Corte.</strong>
                </p>
              </div>

            </div>
          </div>

          {/* 3. Motivo de la Decisión / Responsable */}
          <div className="bg-[#2D2D30] p-4 rounded-2xl border border-[#424246] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#F0EFEB] font-bold mb-1">Responsable de Decisión (Compras):</label>
                <input
                  type="text"
                  required
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2 text-[#FBF8F2] font-medium"
                />
              </div>

              {decisionTipo === 'COMPRAR' && tela.dictamen === 'HALLAZGO' && (
                <div>
                  <label className="block text-[#F0EFEB] font-bold mb-1">Descuento Negociado Comercial (%):</label>
                  <input
                    type="number"
                    value={descuentoPorc}
                    onChange={(e) => setDescuentoPorc(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2 text-[#F0DCA8] font-mono font-bold"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-[#F0EFEB] font-bold mb-1">Motivo / Justificación de la Decisión:</label>
              <textarea
                rows={2}
                required
                value={motivoDecision}
                onChange={(e) => setMotivoDecision(e.target.value)}
                placeholder={decisionTipo === 'COMPRAR' ? 'Indica el motivo de aprobación...' : 'Indica por qué se descarta la compra (ej: encogimiento excesivo, costo no viable)...'}
                className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2 text-[#FBF8F2]"
              />
            </div>
          </div>

          {/* 4. BLOQUE DE ALERTAS FUNCIONALES (SOLO SI SE COMPRA) */}
          {decisionTipo === 'COMPRAR' && (
            <div className="bg-gradient-to-r from-[#2D2D30] via-[#2B2B2E] to-[#2D2D30] border border-[#C6A466]/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#424246] pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C6A466]" />
                  <h4 className="font-serif font-bold text-[#FBF8F2] text-xs uppercase tracking-wider">
                    Alertas Funcionales a Generar para Producción
                  </h4>
                </div>
                <span className="text-[10px] bg-[#C6A466]/20 text-[#F0DCA8] font-mono font-bold px-2 py-0.5 rounded border border-[#C6A466]/30">
                  LLEGARÁN A PATRONAJE Y CORTE
                </span>
              </div>

              {/* Alerta A: PATRONAJE */}
              <div className="bg-[#2B2B2E] p-3.5 rounded-xl border border-[#485C3E]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="check-pat"
                      checked={aplicaPatronaje}
                      onChange={(e) => setAplicaPatronaje(e.target.checked)}
                      className="rounded bg-[#2D2D30] border-[#424246] text-[#94A786] focus:ring-0 w-4 h-4"
                    />
                    <label htmlFor="check-pat" className="font-bold text-[#94A786] text-xs flex items-center gap-1.5 cursor-pointer">
                      <Ruler className="w-3.5 h-3.5" />
                      1. Alerta Funcional para PATRONAJE (Moldería & Compensación)
                    </label>
                  </div>
                  <span className="text-[10px] font-mono text-[#94A786]">Área: Patronaje</span>
                </div>

                {aplicaPatronaje && (
                  <div className="space-y-2 pt-1 animate-fade-in">
                    <input
                      type="text"
                      value={tituloPatronaje}
                      onChange={(e) => setTituloPatronaje(e.target.value)}
                      placeholder="Título de la alerta..."
                      className="w-full bg-[#2D2D30] border border-[#424246] rounded-lg p-1.5 text-xs text-[#FBF8F2] font-semibold"
                    />
                    <textarea
                      rows={2}
                      value={descPatronaje}
                      onChange={(e) => setDescPatronaje(e.target.value)}
                      placeholder="Instrucciones precisas para patronaje..."
                      className="w-full bg-[#2D2D30] border border-[#424246] rounded-lg p-2 text-xs text-[#F0EFEB]"
                    />
                  </div>
                )}
              </div>

              {/* Alerta B: CORTE & TENDIDO */}
              <div className="bg-[#2B2B2E] p-3.5 rounded-xl border border-[#7A6428]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="check-cor"
                      checked={aplicaCorte}
                      onChange={(e) => setAplicaCorte(e.target.checked)}
                      className="rounded bg-[#2D2D30] border-[#424246] text-[#DEC987] focus:ring-0 w-4 h-4"
                    />
                    <label htmlFor="check-cor" className="font-bold text-[#DEC987] text-xs flex items-center gap-1.5 cursor-pointer">
                      <Scissors className="w-3.5 h-3.5" />
                      2. Alerta Funcional para CORTE (Reposo & Tendido)
                    </label>
                  </div>
                  <span className="text-[10px] font-mono text-[#DEC987]">Área: Corte</span>
                </div>

                {aplicaCorte && (
                  <div className="space-y-2 pt-1 animate-fade-in">
                    <input
                      type="text"
                      value={tituloCorte}
                      onChange={(e) => setTituloCorte(e.target.value)}
                      placeholder="Título de la alerta..."
                      className="w-full bg-[#2D2D30] border border-[#424246] rounded-lg p-1.5 text-xs text-[#FBF8F2] font-semibold"
                    />
                    <textarea
                      rows={2}
                      value={descCorte}
                      onChange={(e) => setDescCorte(e.target.value)}
                      placeholder="Instrucciones precisas para corte y reposo..."
                      className="w-full bg-[#2D2D30] border border-[#424246] rounded-lg p-2 text-xs text-[#F0EFEB]"
                    />
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 5. AVISO EN CASO DE NO COMPRA */}
          {decisionTipo === 'NO_COMPRAR' && (
            <div className="bg-[#8C3D35]/20 border border-[#8C3D35]/40 rounded-2xl p-4 text-xs text-[#DBA097] space-y-1.5 animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-[#DBA097]">
                <AlertTriangle className="w-4 h-4 text-[#DBA097] shrink-0" />
                <span>ATENCIÓN: EL PROCESO DE ESTA TELA SE DETENDRÁ</span>
              </div>
              <p className="text-[11px] text-[#F0EFEB]">
                Al confirmar <strong>NO COMPRAR</strong>, la tela quedará registrada como <strong>COMPRA CANCELADA</strong>. No se emitirán alertas ni avanzará a las bandejas operativas de Patronaje ni Corte.
              </p>
            </div>
          )}

          {/* Botones de Envío */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#424246]">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 bg-[#2D2D30] hover:bg-[#424246] text-[#AA9E80] font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-95 ${
                decisionTipo === 'COMPRAR'
                  ? 'bg-[#485C3E] hover:bg-[#3B4D32] text-white border border-[#94A786]/50'
                  : 'bg-[#8C3D35] hover:bg-[#73312A] text-white border border-[#DBA097]/50'
              }`}
            >
              {decisionTipo === 'COMPRAR' ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>🚀 CONFIRMAR COMPRA Y EMITIR ALERTAS</span>
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  <span>⛔ CONFIRMAR NO COMPRA (DETENER PROCESO)</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
