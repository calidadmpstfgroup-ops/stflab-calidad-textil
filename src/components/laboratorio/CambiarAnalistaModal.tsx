import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { ShieldCheck, UserCheck, KeyRound, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface CambiarAnalistaModalProps {
  abierto: boolean;
  onCerrar: () => void;
}

export const CambiarAnalistaModal: React.FC<CambiarAnalistaModalProps> = ({
  abierto,
  onCerrar
}) => {
  const { analistas, analistaActivo, cambiarAnalistaConPin } = useQuality();
  const [analistaSeleccionadoId, setAnalistaSeleccionadoId] = useState<string>(analistaActivo.id);
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [exitoMsg, setExitoMsg] = useState<string>('');

  if (!abierto) return null;

  const procesarPin = (valorIngresado: string) => {
    const cleanPin = valorIngresado.replace(/\D/g, '').slice(0, 4);
    setPin(cleanPin);
    setErrorMsg('');
    setExitoMsg('');

    if (cleanPin.length === 4) {
      // 1. Verificar si coincide con el analista seleccionado o con CUALQUIER analista registrado
      let target = analistas.find(a => a.id === analistaSeleccionadoId && a.pinAcceso === cleanPin);
      if (!target) {
        target = analistas.find(a => a.pinAcceso === cleanPin);
      }

      if (target) {
        setAnalistaSeleccionadoId(target.id);
        const res = cambiarAnalistaConPin(target.id, cleanPin);
        if (res.exito) {
          setExitoMsg(`¡PIN verificado! Accediendo automáticamente como ${target.nombreCompleto}...`);
          setTimeout(() => {
            setPin('');
            setExitoMsg('');
            onCerrar();
          }, 450);
        } else {
          setErrorMsg(res.mensaje);
        }
      } else {
        setErrorMsg('PIN de 4 dígitos incorrecto. No corresponde a ningún usuario registrado.');
      }
    }
  };

  const handleCambiar = (e: React.FormEvent) => {
    e.preventDefault();
    procesarPin(pin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-fade-in">
      <div className="bg-[#FAF7F2] border border-[#E3D9C7] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-[#2B2B2E] relative">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onCerrar}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#6B5744] hover:text-[#2B2B2E] hover:bg-[#E3D9C7]/40 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2B2B2E] text-[#C6A466] flex items-center justify-center shadow-md border border-[#3A3A3D]">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold font-display text-[#2B2B2E] tracking-tight">
              CAMBIO RÁPIDO DE ANALISTA
            </h2>
            <p className="text-xs text-[#6B5744] font-medium">
              Selecciona el responsable e ingresa tu PIN de 4 dígitos
            </p>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 font-bold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {exitoMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{exitoMsg}</span>
          </div>
        )}

        {/* Select Analyst */}
        <form onSubmit={handleCambiar} className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6B5744] mb-2">
              SELECCIONA EL RESPONSABLE:
            </label>
            <div className="space-y-2">
              {analistas.map((an) => {
                const esSeleccionado = analistaSeleccionadoId === an.id;
                const esActivoActual = analistaActivo.id === an.id;

                return (
                  <div
                    key={an.id}
                    onClick={() => {
                      setAnalistaSeleccionadoId(an.id);
                      setErrorMsg('');
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      esSeleccionado
                        ? 'bg-[#2B2B2E] text-[#FBF8F2] border-[#3A3A3D] shadow-md'
                        : 'bg-[#F4EFE6] text-[#2B2B2E] border-[#E3D9C7] hover:bg-[#E3D9C7]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        esSeleccionado ? 'bg-[#C6A466] text-[#2B2B2E]' : 'bg-[#E3D9C7] text-[#2B2B2E]'
                      }`}>
                        {an.nombreCompleto.charAt(0)}
                      </div>
                      <div>
                        <strong className="text-xs block font-bold leading-tight">
                          {an.nombreCompleto}
                        </strong>
                        <span className={`text-[10px] block font-medium ${esSeleccionado ? 'text-[#F0DCA8]/80' : 'text-[#6B5744]'}`}>
                          {an.cargoEspecialidad}
                        </span>
                      </div>
                    </div>

                    {esActivoActual && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/40">
                        ACTIVO AHORA
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* PIN Input */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6B5744] mb-1.5">
              INGRESA TU PIN DE 4 DÍGITOS:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#6B6256] absolute left-3.5 top-3.5" />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => procesarPin(e.target.value)}
                placeholder="••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-center text-lg font-black tracking-[0.5em] text-[#2D2D30] focus:outline-none focus:border-[#AA9E80] font-mono"
                required
                autoFocus
              />
            </div>
            <p className="text-[10px] text-[#6B6256] mt-1 text-center font-mono">
              PINs de demostración: 1234 (María Fernanda), 5678 (Juan), 4321 (Carlos), 8888 (Ana Sofía)
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 py-3 px-4 bg-[#F5F4F0] hover:bg-[#E2E0D8]/50 text-[#2D2D30] border border-[#E2E0D8] font-bold text-xs rounded-2xl transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={pin.length < 4}
              className="flex-1 py-3 px-4 bg-[#2D2D30] hover:bg-[#2E2822] disabled:opacity-40 text-[#AA9E80] border border-[#424246] font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer"
            >
              Confirmar PIN
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
