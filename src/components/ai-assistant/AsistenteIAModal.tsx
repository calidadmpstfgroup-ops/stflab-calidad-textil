import React, { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useQuality } from '../../context/QualityContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { procesarConsultaIA, AIResponseButton } from '../../services/aiAssistantEngine';
import { AreaType } from '../../types';

interface MensajeChat {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  buttons?: AIResponseButton[];
  timestamp: string;
}

export const AsistenteIAModal: React.FC = () => {
  const [abierto, setAbierto] = useState(false);
  const [inputTexto, setInputTexto] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const botonRef = useRef<HTMLButtonElement | null>(null);
  const { theme } = useTheme();
  const esModoClaro = theme === 'light';

  // Posición movible del botón flotante
  const [posicion, setPosicion] = useState<{ x?: number; y?: number }>(() => {
    try {
      const guardada = localStorage.getItem('stflab_ia_btn_pos');
      if (guardada) {
        const parsed = JSON.parse(guardada);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    return {};
  });

  useEffect(() => {
    const handler = () => setAbierto(true);
    window.addEventListener('abrir-asistente-ia', handler);
    return () => window.removeEventListener('abrir-asistente-ia', handler);
  }, []);

  const arrastreRef = useRef<{
    arrastrando: boolean;
    inicioX: number;
    inicioY: number;
    posInicialX: number;
    posInicialY: number;
    distanciaRecorrida: number;
  }>({
    arrastrando: false,
    inicioX: 0,
    inicioY: 0,
    posInicialX: 0,
    posInicialY: 0,
    distanciaRecorrida: 0
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const rect = botonRef.current?.getBoundingClientRect();
    if (!rect) return;

    arrastreRef.current = {
      arrastrando: true,
      inicioX: e.clientX,
      inicioY: e.clientY,
      posInicialX: rect.left,
      posInicialY: rect.top,
      distanciaRecorrida: 0
    };

    const onMouseMove = (moveEvt: MouseEvent) => {
      if (!arrastreRef.current.arrastrando) return;
      const deltaX = moveEvt.clientX - arrastreRef.current.inicioX;
      const deltaY = moveEvt.clientY - arrastreRef.current.inicioY;
      arrastreRef.current.distanciaRecorrida = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      const btnW = botonRef.current?.offsetWidth || 150;
      const btnH = botonRef.current?.offsetHeight || 48;
      const maxX = window.innerWidth - btnW - 10;
      const maxY = window.innerHeight - btnH - 10;

      const nuevoX = Math.min(Math.max(10, arrastreRef.current.posInicialX + deltaX), maxX);
      const nuevoY = Math.min(Math.max(10, arrastreRef.current.posInicialY + deltaY), maxY);

      setPosicion({ x: nuevoX, y: nuevoY });
    };

    const onMouseUp = () => {
      arrastreRef.current.arrastrando = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (arrastreRef.current.distanciaRecorrida > 6 && botonRef.current) {
        const r = botonRef.current.getBoundingClientRect();
        try {
          localStorage.setItem('stflab_ia_btn_pos', JSON.stringify({ x: r.left, y: r.top }));
        } catch {}
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = botonRef.current?.getBoundingClientRect();
    if (!rect) return;

    arrastreRef.current = {
      arrastrando: true,
      inicioX: touch.clientX,
      inicioY: touch.clientY,
      posInicialX: rect.left,
      posInicialY: rect.top,
      distanciaRecorrida: 0
    };

    const onTouchMove = (moveEvt: TouchEvent) => {
      if (!arrastreRef.current.arrastrando) return;
      const t = moveEvt.touches[0];
      const deltaX = t.clientX - arrastreRef.current.inicioX;
      const deltaY = t.clientY - arrastreRef.current.inicioY;
      arrastreRef.current.distanciaRecorrida = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      const btnW = botonRef.current?.offsetWidth || 150;
      const btnH = botonRef.current?.offsetHeight || 48;
      const maxX = window.innerWidth - btnW - 10;
      const maxY = window.innerHeight - btnH - 10;

      const nuevoX = Math.min(Math.max(10, arrastreRef.current.posInicialX + deltaX), maxX);
      const nuevoY = Math.min(Math.max(10, arrastreRef.current.posInicialY + deltaY), maxY);

      setPosicion({ x: nuevoX, y: nuevoY });
    };

    const onTouchEnd = () => {
      arrastreRef.current.arrastrando = false;
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (arrastreRef.current.distanciaRecorrida > 6 && botonRef.current) {
        const r = botonRef.current.getBoundingClientRect();
        try {
          localStorage.setItem('stflab_ia_btn_pos', JSON.stringify({ x: r.left, y: r.top }));
        } catch {}
      }
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  };

  const handleClickBoton = (e: React.MouseEvent) => {
    if (arrastreRef.current.distanciaRecorrida > 6) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setAbierto(!abierto);
  };

  const {
    areaActual,
    setAreaActual,
    solicitudesTelas,
    solicitudesAccesorios,
    muestras,
    fichasTecnicasHistorial,
    kpis,
    calidadProveedores,
    analistaActivo,
    setModalFichaAbierto,
    setModalNuevaMuestraAbierto,
    setModalAlertasLeadTimeAbierto
  } = useQuality();

  const { usuario } = useAuth();

  const [mensajes, setMensajes] = useState<MensajeChat[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `👋 ¡Hola ${usuario?.displayName || 'analista'}! Soy la **Asistente IA de STFLab 2.0**.
      
¿En qué te puedo orientar hoy? Puedo ayudarte a **navegar por los módulos**, **explicarte cómo llenar un formulario**, **buscar fichas o solicitudes** y **solucionar problemas**.`,
      buttons: [
        { label: '🧪 ¿Cómo evalúo en Lab?', area: 'laboratorio' },
        { label: '📄 Buscar Ficha Técnica', modal: 'ficha' },
        { label: '📊 Ver Indicadores', area: 'dashboard' }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (abierto) {
      scrollToBottom();
    }
  }, [mensajes, abierto]);

  const contextoRef = useRef({
    areaActual,
    usuarioRole: usuario?.role,
    usuarioNombre: usuario?.displayName,
    analistaActivoNombre: analistaActivo?.nombreCompleto,
    solicitudesTelas,
    solicitudesAccesorios,
    muestras,
    fichasTecnicas: fichasTecnicasHistorial,
    kpis,
    calidadProveedores
  });

  useEffect(() => {
    contextoRef.current = {
      areaActual,
      usuarioRole: usuario?.role,
      usuarioNombre: usuario?.displayName,
      analistaActivoNombre: analistaActivo?.nombreCompleto,
      solicitudesTelas,
      solicitudesAccesorios,
      muestras,
      fichasTecnicas: fichasTecnicasHistorial,
      kpis,
      calidadProveedores
    };
  }, [
    areaActual,
    usuario,
    analistaActivo,
    solicitudesTelas,
    solicitudesAccesorios,
    muestras,
    fichasTecnicasHistorial,
    kpis,
    calidadProveedores
  ]);

  const enviarConsultaRef = useRef<(texto: string) => void>(() => {});

  const handleEnviarConsulta = (textoConsulta: string) => {
    if (!textoConsulta.trim()) return;

    const nuevoMensajeUsuario: MensajeChat = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textoConsulta,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMensajes(prev => [...prev, nuevoMensajeUsuario]);
    setInputTexto('');

    // Procesar con el motor IA
    setTimeout(() => {
      const respuesta = procesarConsultaIA(textoConsulta, contextoRef.current);

      const nuevoMensajeIA: MensajeChat = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: respuesta.text,
        buttons: respuesta.buttons,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMensajes(prev => [...prev, nuevoMensajeIA]);
    }, 250);
  };

  enviarConsultaRef.current = handleEnviarConsulta;

  // Escuchar eventos globales para abrir el Asistente IA (desde Dashboard u otras vistas)
  useEffect(() => {
    const handleAbrirIA = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      setAbierto(true);
      const prompt = customEvent.detail?.prompt;
      if (prompt && typeof prompt === 'string' && prompt.trim()) {
        setTimeout(() => {
          enviarConsultaRef.current(prompt.trim());
        }, 100);
      }
    };

    window.addEventListener('stf_abrir_ia', handleAbrirIA);
    return () => {
      window.removeEventListener('stf_abrir_ia', handleAbrirIA);
    };
  }, []);

  const handleBotonAccion = (btn: AIResponseButton) => {
    if (btn.area) {
      setAreaActual(btn.area);
    }
    if (btn.modal) {
      switch (btn.modal) {
        case 'ficha':
          setModalFichaAbierto(true);
          break;
        case 'nueva_muestra':
          setModalNuevaMuestraAbierto(true);
          break;
        case 'lead_time':
          setModalAlertasLeadTimeAbierto(true);
          break;
      }
    }
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
      const lineContent = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong
              key={pIdx}
              className={esModoClaro ? "font-bold text-slate-950" : "font-semibold text-[#F0DCA8]"}
              style={{ color: esModoClaro ? '#0f172a' : '#fde68a' }}
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={pIdx}
              className={esModoClaro
                ? "bg-slate-200 text-slate-900 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-300 font-bold"
                : "bg-[#1A1A1C] text-[#00b4d8] px-1.5 py-0.5 rounded font-mono text-xs border border-[#00b4d8]/30"}
              style={{ color: esModoClaro ? '#0f172a' : '#38bdf8' }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return (
          <span
            key={pIdx}
            className={esModoClaro ? "text-slate-800 font-medium" : "text-slate-200"}
            style={{ color: esModoClaro ? '#334155' : '#e2e8f0' }}
          >
            {part}
          </span>
        );
      });

      if (line.trim().startsWith('* ')) {
        return (
          <div
            key={idx}
            className={`flex items-start gap-2 ml-1 my-1 text-xs sm:text-sm ${esModoClaro ? 'text-slate-800 font-medium' : 'text-[#FBF8F2]/90'}`}
            style={{ color: esModoClaro ? '#334155' : '#e2e8f0' }}
          >
            <span
              className={esModoClaro ? "text-[#00b4d8] font-bold mt-0.5" : "text-[#38bdf8] font-bold mt-0.5"}
              style={{ color: esModoClaro ? '#00b4d8' : '#38bdf8' }}
            >
              •
            </span>
            <span style={{ color: esModoClaro ? '#334155' : '#e2e8f0' }}>{lineContent}</span>
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p
          key={idx}
          className={`text-xs sm:text-sm leading-relaxed my-0.5 ${esModoClaro ? 'text-slate-800 font-medium' : 'text-[#FBF8F2]/90'}`}
          style={{ color: esModoClaro ? '#334155' : '#e2e8f0' }}
        >
          {lineContent}
        </p>
      );
    });
  };

  const chipsSugeridos = [
    '¿Por qué se rechaza si no tiene ficha técnica?',
    '¿Cómo evalúo una solicitud en Lab?',
    '¿Dónde consulto una ficha técnica?',
    '¿Dónde veo los indicadores?'
  ];

  return (
    <>
      {/* Botón Flotante del Asistente IA (Movible / Draggable en Cyan STFLAB) */}
      <button
        ref={botonRef}
        onClick={handleClickBoton}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          backgroundColor: '#00b4d8',
          ...(typeof posicion.x === 'number' && typeof posicion.y === 'number'
            ? { left: `${posicion.x}px`, top: `${posicion.y}px`, bottom: 'auto', right: 'auto' }
            : {})
        }}
        className={`fixed ${typeof posicion.x === 'number' ? '' : 'bottom-6 right-6'} z-50 flex items-center gap-2.5 bg-gradient-to-r from-[#00b4d8] to-[#0096c7] hover:from-[#00c0f0] hover:to-[#00b4d8] text-white font-bold px-3.5 py-2.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-150 border border-cyan-200/60 group select-none cursor-grab active:cursor-grabbing touch-none`}
        title="Arrastra para mover a cualquier lugar • Haz clic para abrir Asistente IA"
      >
        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#00b4d8] shadow-sm group-hover:rotate-12 transition-transform shrink-0">
          <Sparkles className="w-4 h-4 fill-[#00b4d8]/20" />
        </div>
        <span className="font-display tracking-wider text-xs uppercase font-black text-white drop-shadow-xs">
          Asistente IA
        </span>
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
      </button>

      {/* Ventana Modal de Chat */}
      {abierto && (
        <div className={`fixed bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[420px] max-h-[620px] h-[78vh] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden font-sans backdrop-blur-lg animate-in fade-in slide-in-from-bottom-4 duration-200 border ${esModoClaro
            ? 'bg-white border-slate-300 text-slate-900 shadow-slate-400/20'
            : 'bg-[#2B2B2E] border-[#3A3A3D] text-[#FBF8F2]'
          }`}>

          {/* Header del Chat */}
          <div className={`p-4 border-b flex items-center justify-between ${esModoClaro
              ? 'bg-slate-100 border-slate-200 text-slate-900'
              : 'bg-gradient-to-r from-[#1A1A1C] via-[#252528] to-[#1A1A1C] border-[#3A3A3D] text-[#FBF8F2]'
            }`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#cffafe] border border-[#a5f3fc] flex items-center justify-center text-[#00b4d8] shadow-xs shrink-0">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-sm font-display ${esModoClaro ? 'text-slate-900' : 'text-[#FBF8F2]'}`}>Asistente IA STFLab</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-bold ${esModoClaro ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-[#C6A466]/20 text-[#C6A466]'
                    }`}>
                    Online
                  </span>
                </div>
                <p className={`text-[11px] ${esModoClaro ? 'text-slate-600' : 'text-[#F0DCA8]/70'}`} style={{ color: esModoClaro ? '#334155' : '#94a3b8' }}>Guía inteligente & Búsqueda de Calidad</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMensajes([mensajes[0]])}
                className={`p-1.5 rounded-lg transition-colors text-xs cursor-pointer ${esModoClaro ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-[#F0DCA8]/50 hover:text-[#F0DCA8] hover:bg-white/5'
                  }`}
                title="Limpiar chat"
              >
                🗑️
              </button>
              <button
                onClick={() => setAbierto(false)}
                className={`p-1.5 rounded-lg transition-colors text-base font-bold cursor-pointer ${esModoClaro ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-[#F0DCA8]/50 hover:text-[#FBF8F2] hover:bg-white/5'
                  }`}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Chips Sugeridos Rápidos */}
          <div className={`p-2 border-b overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin ${esModoClaro ? 'bg-slate-50 border-slate-200' : 'bg-[#222225] border-[#3A3A3D]'
            }`}>
            {chipsSugeridos.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleEnviarConsulta(chip)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors flex-shrink-0 cursor-pointer ${esModoClaro
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 font-semibold shadow-xs'
                    : 'bg-[#2B2B2E] hover:bg-[#00b4d8] hover:text-white text-[#F0DCA8] border-[#3A3A3D]'
                  }`}
                style={{ color: esModoClaro ? '#1e293b' : '#f8fafc' }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Feed de Mensajes */}
          <div className={`flex-1 p-4 overflow-y-auto space-y-4 ${esModoClaro ? 'bg-slate-100/70' : 'bg-[#1E1E21]/60'
            }`}>
            {mensajes.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl ${msg.sender === 'user'
                      ? 'bg-[#00b4d8] text-white rounded-br-none shadow-md font-medium'
                      : esModoClaro
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                        : 'bg-[#2B2B2E] border border-[#3A3A3D] text-[#FBF8F2] rounded-bl-none shadow-lg'
                    }`}
                  style={{ color: msg.sender === 'user' ? '#ffffff' : (esModoClaro ? '#1e293b' : '#f8fafc') }}
                >
                  {msg.sender === 'ai' ? (
                    <div>{renderFormattedText(msg.text)}</div>
                  ) : (
                    <p
                      className={`text-xs sm:text-sm font-sans whitespace-pre-wrap ${msg.sender === 'user' ? 'text-white' : esModoClaro ? 'text-slate-800' : 'text-[#FBF8F2]'}`}
                      style={{ color: msg.sender === 'user' ? '#ffffff' : (esModoClaro ? '#1e293b' : '#f8fafc') }}
                    >
                      {msg.text}
                    </p>
                  )}

                  {/* Botones de Acción Interactivos */}
                  {msg.buttons && msg.buttons.length > 0 && (
                    <div className={`mt-3 pt-2 border-t flex flex-wrap gap-2 ${esModoClaro ? 'border-slate-200' : 'border-[#3A3A3D]'}`}>
                      {msg.buttons.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          onClick={() => handleBotonAccion(btn)}
                          className={`font-semibold text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow cursor-pointer ${esModoClaro
                              ? 'bg-slate-50 hover:bg-cyan-50 text-slate-800 hover:text-[#0077b6] border-slate-300'
                              : 'bg-[#1A1A1C] hover:bg-[#00b4d8] text-[#00b4d8] hover:text-white border-[#00b4d8]/40'
                            }`}
                          style={{ color: esModoClaro ? '#1e293b' : undefined }}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 px-1 font-mono ${esModoClaro ? 'text-slate-600' : 'text-[#F0DCA8]/50'}`}
                  style={{ color: esModoClaro ? '#64748b' : '#94a3b8' }}
                >
                  {msg.timestamp}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Caja de Entrada de Texto */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEnviarConsulta(inputTexto);
            }}
            className={`p-3 border-t flex items-center gap-2 ${esModoClaro ? 'bg-white border-slate-200' : 'bg-[#252528] border-[#3A3A3D]'
              }`}
          >
            <input
              type="text"
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              placeholder="Haz una pregunta o busca una solicitud..."
              className={`flex-1 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border focus:outline-none transition-all ${esModoClaro
                  ? 'bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-400 focus:border-[#00b4d8] focus:bg-white'
                  : 'bg-[#1A1A1C] text-[#FBF8F2] border-[#3A3A3D] focus:border-[#00b4d8] placeholder-[#F0DCA8]/40'
                }`}
              style={{ color: esModoClaro ? '#0f172a' : '#f8fafc' }}
            />
            <button
              type="submit"
              disabled={!inputTexto.trim()}
              className="bg-[#C6A466] hover:bg-[#A88848] disabled:opacity-40 text-[#1A1A1C] font-bold p-2.5 rounded-xl transition-all flex items-center justify-center text-sm shadow-md cursor-pointer"
            >
              ➤
            </button>
          </form>

        </div>
      )}
    </>
  );
};

export default AsistenteIAModal;
