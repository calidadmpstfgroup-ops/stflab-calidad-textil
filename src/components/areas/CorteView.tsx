import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { MuestraTextil, DictamenType } from '../../types';
import { Badge } from '../common/Badge';
import { 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Clock, 
  Save, 
  Scissors,
  CheckSquare,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  Plus,
  Trash2,
  SlidersHorizontal,
  X,
  Info,
  ShieldAlert,
  Check
} from 'lucide-react';

interface DefectoTendido {
  id: string;
  tipo: 'Hueco' | 'Mancha' | 'Falla de tejido' | 'Otro';
  metraje: number;
  ubicacionRollo: string;
}

interface RolloMatiz {
  rolloId: string;
  resultado: 'Igual' | 'Diferente' | 'No evaluado';
}

export const CorteView: React.FC = () => {
  const { muestras, solicitudesTelas, actualizarDictamenArea } = useQuality();

  // Obtener alertas de compras para telas aprobadas dirigidas a Corte
  const telasCompradasConAlerta = (solicitudesTelas || []).flatMap(s => 
    (s.telas || [])
      .filter(t => t.decisionCompra?.decision === 'COMPRAR' && t.decisionCompra?.alertaCorte?.aplica !== false)
      .map(t => ({
        solicitud: s,
        tela: t,
        alerta: t.decisionCompra?.alertaCorte
      }))
  );

  const [muestraSeleccionadaId, setMuestraSeleccionadaId] = useState<string>(muestras[0]?.id || '');
  const muestraActual = muestras.find((m) => m.id === muestraSeleccionadaId) || muestras[0];

  const [dictamenCorte, setDictamenCorte] = useState<DictamenType>(muestraActual?.trazabilidad.corte.dictamen || 'APROBADO');
  const [observacionCorte, setObservacionCorte] = useState(muestraActual?.trazabilidad.corte.observaciones || '');
  const [responsable, setResponsable] = useState(muestraActual?.trazabilidad.corte.responsable || 'Carlos E. Restrepo');
  const [horasReposo, setHorasReposo] = useState(24);
  const [viroEnMesa, setViroEnMesa] = useState(false);
  const [orillosEstables, setOrillosEstables] = useState(true);

  // Estados locales para Control de Matiz y Defectos de Tendido
  const [controlRollos, setControlRollos] = useState<Record<string, RolloMatiz[]>>({});
  const [controlDefectos, setControlDefectos] = useState<Record<string, DefectoTendido[]>>({});
  const [nuevoRolloId, setNuevoRolloId] = useState('');
  const [tipoDefecto, setTipoDefecto] = useState<'Hueco' | 'Mancha' | 'Falla de tejido' | 'Otro'>('Falla de tejido');
  const [metrajeDefecto, setMetrajeDefecto] = useState<string>('');
  const [ubicacionDefecto, setUbicacionDefecto] = useState('');
  const [metrajeNominal, setMetrajeNominal] = useState<number>(100);

  const [showGuia, setShowGuia] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCambioMuestra = (m: MuestraTextil) => {
    setMuestraSeleccionadaId(m.id);
    setDictamenCorte(m.trazabilidad.corte.dictamen);
    setObservacionCorte(m.trazabilidad.corte.observaciones || '');
    setResponsable(m.trazabilidad.corte.responsable || 'Carlos E. Restrepo');
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muestraActual) return;

    actualizarDictamenArea(
      muestraActual.id,
      'corte',
      dictamenCorte,
      observacionCorte,
      responsable,
      {
        horasReposo,
        viroEnMesa,
        orillosEstables,
      }
    );
    showToast(`Dictamen de Corte guardado para ${muestraActual.referencia}`);
  };

  // 1. Control de Matiz (Tono)
  const rollosActuales = controlRollos[muestraActual?.id] || [
    { rolloId: 'Rollo R-1 (Master)', resultado: 'Igual' },
    { rolloId: 'Rollo R-2', resultado: 'Igual' }
  ];

  const handleAddRollo = () => {
    if (!nuevoRolloId.trim() || !muestraActual) return;
    const current = controlRollos[muestraActual.id] || rollosActuales;
    setControlRollos({
      ...controlRollos,
      [muestraActual.id]: [...current, { rolloId: nuevoRolloId.trim(), resultado: 'No evaluado' }]
    });
    setNuevoRolloId('');
    showToast(`Rollo "${nuevoRolloId.trim()}" agregado para comparación de tono.`);
  };

  const handleChangeRolloResult = (rolloId: string, res: 'Igual' | 'Diferente' | 'No evaluado') => {
    if (!muestraActual) return;
    const current = controlRollos[muestraActual.id] || rollosActuales;
    setControlRollos({
      ...controlRollos,
      [muestraActual.id]: current.map(r => r.rolloId === rolloId ? { ...r, resultado: res } : r)
    });
  };

  const handleRemoveRollo = (rolloId: string) => {
    if (!muestraActual) return;
    const current = controlRollos[muestraActual.id] || rollosActuales;
    setControlRollos({
      ...controlRollos,
      [muestraActual.id]: current.filter(r => r.rolloId !== rolloId)
    });
  };

  // 2. Defectos y Rendimiento
  const defectosActuales = controlDefectos[muestraActual?.id] || [];

  const handleAddDefecto = () => {
    if (!muestraActual || !metrajeDefecto.trim()) return;
    const met = parseFloat(metrajeDefecto);
    if (isNaN(met) || met <= 0) return;

    const current = controlDefectos[muestraActual.id] || [];
    setControlDefectos({
      ...controlDefectos,
      [muestraActual.id]: [
        ...current,
        {
          id: `def-${Date.now()}`,
          tipo: tipoDefecto,
          metraje: met,
          ubicacionRollo: ubicacionDefecto.trim() || 'No especificada'
        }
      ]
    });
    setMetrajeDefecto('');
    setUbicacionDefecto('');
    showToast(`Defecto registrado: -${met}m descartados.`);
  };

  const handleRemoveDefecto = (id: string) => {
    if (!muestraActual) return;
    const current = controlDefectos[muestraActual.id] || [];
    setControlDefectos({
      ...controlDefectos,
      [muestraActual.id]: current.filter(d => d.id !== id)
    });
  };

  const totalMetrosDescartados = defectosActuales.reduce((acc, d) => acc + d.metraje, 0);
  const metrajeUtil = Math.max(0, metrajeNominal - totalMetrosDescartados);
  const porcentajePerdida = (totalMetrosDescartados / metrajeNominal) * 100;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#2B2B2E] text-[#C6A466] text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 border border-[#C6A466]/40 animate-bounce">
          <Sparkles className="h-4 w-4 text-[#C6A466]" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#2B2B2E] border border-[#424246] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-[#FBF8F2]">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-2xl bg-[#C6A466]/10 text-[#C6A466] border border-[#C6A466]/20 flex items-center justify-center shrink-0 shadow-md">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-[#FBF8F2] tracking-tight font-sans">5. Corte & Tendido</h2>
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[#C6A466]/15 text-[#C6A466] border border-[#C6A466]/30 font-mono tracking-wider">
                FASE OPERATIVA
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#A8A095] mt-1 font-medium leading-relaxed">
              Control de tiempo de reposo textil (24h - 48h), alineación de orillos y descarte de metros no conformes antes de pasar a confección.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowGuia(!showGuia)}
          className="px-4 py-2 bg-[#2B2B2E] hover:bg-[#424246] border border-[#424246] text-[#C6A466] text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <Info className="h-4 w-4" />
          <span>{showGuia ? 'Ocultar Guía' : 'Guía de Reposo 24-48h'}</span>
        </button>
      </div>

      {/* Guía de Reposo */}
      {showGuia && (
        <div className="bg-[#2D2D30] rounded-3xl p-5 border-2 border-[#C6A466]/40 shadow-sm space-y-4 animate-fade-in text-[#FBF8F2] text-xs">
          <div className="flex items-center justify-between border-b border-[#424246] pb-2">
            <h4 className="font-serif font-bold text-[#C6A466] uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-4 w-4" />
              Protocolo de Reposo y Relajación Textil
            </h4>
            <button onClick={() => setShowGuia(false)} className="text-[#AA9E80] hover:text-white font-bold cursor-pointer">✕</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#2B2B2E] p-4 rounded-2xl border border-[#424246] space-y-1.5">
              <span className="font-bold text-[#C6A466]">⏱️ Tejidos con Spandex / Licra (&ge;15% Elongación)</span>
              <p className="text-[#AA9E80] leading-relaxed">
                Desenrolle el lote completo en ondas libres de tensión durante un mínimo de <strong>48 horas continuas</strong> antes del tendido para evitar deformaciones post-corte.
              </p>
            </div>
            <div className="bg-[#2B2B2E] p-4 rounded-2xl border border-[#424246] space-y-1.5">
              <span className="font-bold text-emerald-400">📏 Tejidos Planos / Rígidos</span>
              <p className="text-[#AA9E80] leading-relaxed">
                Reposo estándar de <strong>24 horas</strong> en mesa de relajación para liberar la tensión residual de bobinado y garantizar orillos estables.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ALERTAS FUNCIONALES RECIBIDAS DE COMPRAS */}
      {telasCompradasConAlerta.length > 0 && (
        <div className="bg-rose-950/30 border-2 border-rose-500/40 rounded-3xl p-5 shadow-sm space-y-3 animate-fade-in text-[#FBF8F2]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
              <h3 className="text-sm font-serif font-bold text-[#FBF8F2] uppercase tracking-wider">
                Alertas Funcionales Recibidas de Compras para Tendido ({telasCompradasConAlerta.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/30">
              DIRECTRICES DE TENDIDO
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {telasCompradasConAlerta.map((item, idx) => (
              <div key={idx} className="bg-[#2D2D30] border border-rose-500/30 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#C6A466] bg-[#2B2B2E] px-2 py-0.5 rounded border border-[#424246]">
                    {item.tela.referencia}
                  </span>
                  <span className="text-[10px] font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    Reposo: {(item.alerta as any)?.horasReposo || 24}h
                  </span>
                </div>
                <p className="text-xs text-[#AA9E80] leading-snug">
                  {item.alerta?.descripcion || 'Reposo textil y tendido libre de tensión obligatorio.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Principal: Formulario de Corte vs Control de Matiz / Defectos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Columna Izquierda: Aprobación de Tendido (5 cols) */}
        <div className="lg:col-span-5 bg-[#2D2D30] border border-[#424246] rounded-3xl p-6 shadow-sm space-y-5 text-[#FBF8F2]">
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#FBF8F2] border-b border-[#424246] pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C6A466]" />
            Dictamen Técnico de Tendido
          </h3>

          <div className="space-y-1.5">
            <label className="block text-[#AA9E80] text-xs font-semibold">Seleccionar Lote / Tela:</label>
            <select
              value={muestraActual?.id}
              onChange={(e) => {
                const found = muestras.find(m => m.id === e.target.value);
                if (found) handleCambioMuestra(found);
              }}
              className="w-full bg-[#2B2B2E] border border-[#424246] text-[#FBF8F2] rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-[#C6A466]"
            >
              {muestras.map(m => (
                <option key={m.id} value={m.id}>
                  {m.referencia} - {m.color} ({m.lote})
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleGuardar} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#AA9E80] font-semibold mb-1">Horas de Reposo:</label>
                <input
                  type="number"
                  value={horasReposo}
                  onChange={(e) => setHorasReposo(parseInt(e.target.value) || 24)}
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-[#FBF8F2] font-mono font-bold focus:outline-none focus:border-[#C6A466]"
                />
              </div>
              <div>
                <label className="block text-[#AA9E80] font-semibold mb-1">Responsable Corte:</label>
                <input
                  type="text"
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-[#FBF8F2] focus:outline-none focus:border-[#C6A466]"
                />
              </div>
            </div>

            <div className="space-y-2 bg-[#2B2B2E] p-3.5 rounded-2xl border border-[#424246]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={orillosEstables}
                  onChange={(e) => setOrillosEstables(e.target.checked)}
                  className="w-4 h-4 text-[#485C3E] rounded bg-[#2D2D30] border-[#424246]"
                />
                <span className="text-[#AA9E80] font-semibold">Orillos estables y cortables</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={viroEnMesa}
                  onChange={(e) => setViroEnMesa(e.target.checked)}
                  className="w-4 h-4 text-[#7A6428] rounded bg-[#2D2D30] border-[#424246]"
                />
                <span className="text-[#AA9E80] font-semibold">Viro detectado en tendido (cortar en un sentido)</span>
              </label>
            </div>

            <div>
              <label className="block text-[#AA9E80] font-semibold mb-1">Dictamen de Tendido:</label>
              <select
                value={dictamenCorte}
                onChange={(e) => setDictamenCorte(e.target.value as DictamenType)}
                className="w-full bg-[#2B2B2E] border border-[#424246] text-[#FBF8F2] rounded-xl p-2.5 font-bold focus:outline-none focus:border-[#C6A466]"
              >
                <option value="APROBADO">🟢 APROBADO (Liberado para Corte)</option>
                <option value="HALLAZGO">🟡 HALLAZGO (Tendido con Precaución)</option>
                <option value="RECHAZADO">🔴 RECHAZADO (No Cortar)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#AA9E80] font-semibold mb-1">Observaciones de Tendido:</label>
              <textarea
                rows={3}
                value={observacionCorte}
                onChange={(e) => setObservacionCorte(e.target.value)}
                placeholder="Observaciones de relajamiento, sentido de hilo o comportamiento..."
                className="w-full bg-[#2B2B2E] border border-[#424246] text-[#FBF8F2] rounded-xl p-2.5 focus:outline-none focus:border-[#C6A466]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#2B2B2E] font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Guardar Dictamen de Corte
            </button>
          </form>
        </div>

        {/* Columna Derecha: Control de Matiz y Defectos Puntuales (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Bloque 1: Control de Matiz (Shade Control) */}
          <div className="bg-[#2D2D30] border border-[#424246] rounded-3xl p-6 shadow-sm space-y-4 text-[#FBF8F2]">
            <div className="flex items-center justify-between border-b border-[#424246] pb-3">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#FBF8F2] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#C6A466]" />
                Control de Matiz entre Rollos (Shade Control)
              </h4>
              <span className="text-[10px] bg-[#C6A466]/20 text-[#C6A466] font-bold px-2 py-0.5 rounded-full border border-[#C6A466]/30">
                EVALUACIÓN EN MESA
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nuevoRolloId}
                onChange={(e) => setNuevoRolloId(e.target.value)}
                placeholder="ID de Rollo a Comparar (ej: Rollo R-3)..."
                className="flex-1 bg-[#2B2B2E] border border-[#424246] rounded-xl p-2.5 text-xs text-[#FBF8F2] focus:outline-none focus:border-[#C6A466]"
              />
              <button
                type="button"
                onClick={handleAddRollo}
                className="px-4 py-2.5 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#2B2B2E] rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-vertical-scroll">
              {rollosActuales.map((roll) => (
                <div key={roll.rolloId} className="flex items-center justify-between p-3 bg-[#2B2B2E] border border-[#424246] rounded-2xl text-xs">
                  <span className="font-bold text-[#FBF8F2]">{roll.rolloId}</span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleChangeRolloResult(roll.rolloId, 'Igual')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        roll.resultado === 'Igual'
                          ? 'bg-[#485C3E] text-[#FBF8F2]'
                          : 'bg-[#2D2D30] text-[#AA9E80] hover:text-white border border-[#424246]'
                      }`}
                    >
                      Igual
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChangeRolloResult(roll.rolloId, 'Diferente')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        roll.resultado === 'Diferente'
                          ? 'bg-[#8C3D35] text-[#FBF8F2]'
                          : 'bg-[#2D2D30] text-[#AA9E80] hover:text-white border border-[#424246]'
                      }`}
                    >
                      Diferente
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveRollo(roll.rolloId)}
                      className="p-1 text-[#8A8172] hover:text-rose-400 transition-colors ml-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bloque 2: Defectos Puntuales y Rendimiento */}
          <div className="bg-[#2D2D30] border border-[#424246] rounded-3xl p-6 shadow-sm space-y-4 text-[#FBF8F2]">
            <div className="flex items-center justify-between border-b border-[#424246] pb-3">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#FBF8F2] flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#C6A466]" />
                Defectos Puntuales y Rendimiento Real (m/kg)
              </h4>
              <span className="text-[10px] bg-[#C6A466]/20 text-[#C6A466] font-bold px-2 py-0.5 rounded-full border border-[#C6A466]/30">
                DESCARTE EN TENDIDO
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <select
                value={tipoDefecto}
                onChange={(e) => setTipoDefecto(e.target.value as any)}
                className="bg-[#2B2B2E] border border-[#424246] text-[#FBF8F2] rounded-xl p-2.5 font-semibold focus:outline-none focus:border-[#C6A466]"
              >
                <option value="Falla de tejido">Falla de tejido</option>
                <option value="Hueco">Hueco</option>
                <option value="Mancha">Mancha</option>
                <option value="Otro">Otro</option>
              </select>

              <input
                type="number"
                step="0.1"
                value={metrajeDefecto}
                onChange={(e) => setMetrajeDefecto(e.target.value)}
                placeholder="Metros (ej: 1.5m)..."
                className="bg-[#2B2B2E] border border-[#424246] text-[#FBF8F2] rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-[#C6A466]"
              />

              <button
                type="button"
                onClick={handleAddDefecto}
                className="bg-[#C6A466] hover:bg-[#D6CDB8] text-[#2B2B2E] font-bold text-xs uppercase rounded-xl p-2.5 flex items-center justify-center gap-1 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar</span>
              </button>
            </div>

            {/* Resumen de Pérdida */}
            <div className="p-3.5 bg-[#2B2B2E] border border-[#424246] rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[#AA9E80] block text-[10px] uppercase font-bold">Metros Descartados:</span>
                <span className="font-mono font-bold text-[#8C3D35] text-base">-{totalMetrosDescartados.toFixed(1)}m</span>
              </div>
              <div>
                <span className="text-[#AA9E80] block text-[10px] uppercase font-bold">Metraje Útil:</span>
                <span className="font-mono font-bold text-[#485C3E] text-base">{metrajeUtil.toFixed(1)}m</span>
              </div>
              <div>
                <span className="text-[#AA9E80] block text-[10px] uppercase font-bold">% Descarte:</span>
                <span className={`font-mono font-bold text-base ${porcentajePerdida > 3 ? 'text-[#8C3D35]' : 'text-[#FBF8F2]'}`}>
                  {porcentajePerdida.toFixed(1)}%
                </span>
              </div>
            </div>

            {defectosActuales.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 text-xs custom-vertical-scroll">
                {defectosActuales.map((def) => (
                  <div key={def.id} className="flex items-center justify-between p-2.5 bg-[#2B2B2E] border border-[#424246] rounded-xl">
                    <span className="text-[#AA9E80] font-semibold">{def.tipo}</span>
                    <span className="text-[#8C3D35] font-bold font-mono">-{def.metraje.toFixed(1)}m</span>
                    <button onClick={() => handleRemoveDefecto(def.id)} className="text-[#8A8172] hover:text-rose-400 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
