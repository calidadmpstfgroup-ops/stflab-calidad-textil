import React, { useState, useRef, useEffect } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useAuth } from '../../context/AuthContext';
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
      const respuesta = procesarConsultaIA(textoConsulta, {
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

      const nuevoMensajeIA: MensajeChat = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: respuesta.text,
        buttons: respuesta.buttons,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMensajes(prev => [...prev, nuevoMensajeIA]);
    }, 300);
  };

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
            <strong key={pIdx} className="font-semibold text-[#F0DCA8]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={pIdx}
              className="bg-[#1A1A1C] text-[#C6A466] px-1.5 py-0.5 rounded font-mono text-xs border border-[#C6A466]/30"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      if (line.trim().startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-2 ml-1 my-1 text-xs sm:text-sm text-[#FBF8F2]/90">
            <span className="text-[#C6A466] font-bold mt-0.5">•</span>
            <span>{lineContent}</span>
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="text-xs sm:text-sm leading-relaxed text-[#FBF8F2]/90 my-0.5">
          {lineContent}
        </p>
      );
    });
  };

  const chipsSugeridos = [
    '¿Por qué se rechaza si no tiene ficha técnica?',
    '¿Cómo se evalúa sin inventar datos?',
    '¿Cómo evalúo una solicitud en Lab?',
    '¿Dónde consulto una ficha técnica?',
    '¿Cómo firmo con PIN de laboratorista?',
    '¿Dónde veo los indicadores?'
  ];

  return (
    <>
      {/* Botón Flotante del Asistente IA */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gradient-to-r from-[#C6A466] to-[#A88848] text-[#1A1A1C] font-bold px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border border-[#F0DCA8]/50 group"
        title="Asistente IA STFLab"
      >
        <span className="text-xl group-hover:rotate-12 transition-transform duration-300">🤖</span>
        <span className="font-display tracking-wider text-xs uppercase hidden sm:inline">Asistente IA</span>
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A1A1C] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1A1A1C]"></span>
        </span>
      </button>

      {/* Ventana Modal de Chat */}
      {abierto && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[420px] max-h-[620px] h-[78vh] bg-[#2B2B2E] border border-[#3A3A3D] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden font-sans backdrop-blur-lg animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header del Chat */}
          <div className="bg-gradient-to-r from-[#1A1A1C] via-[#252528] to-[#1A1A1C] p-4 border-b border-[#3A3A3D] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C6A466]/20 border border-[#C6A466] flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#FBF8F2] text-sm font-display">Asistente IA STFLab</h3>
                  <span className="bg-[#C6A466]/20 text-[#C6A466] text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-[#F0DCA8]/70">Guía inteligente & Búsqueda de Calidad</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMensajes([mensajes[0]])}
                className="text-[#F0DCA8]/50 hover:text-[#F0DCA8] p-1.5 rounded-lg hover:bg-white/5 transition-colors text-xs"
                title="Limpiar chat"
              >
                🗑️
              </button>
              <button
                onClick={() => setAbierto(false)}
                className="text-[#F0DCA8]/50 hover:text-[#FBF8F2] p-1.5 rounded-lg hover:bg-white/5 transition-colors text-base font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Chips Sugeridos Rápidos */}
          <div className="bg-[#222225] p-2 border-b border-[#3A3A3D] overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin">
            {chipsSugeridos.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleEnviarConsulta(chip)}
                className="bg-[#2B2B2E] hover:bg-[#C6A466] hover:text-[#1A1A1C] text-[#F0DCA8] text-[11px] px-2.5 py-1 rounded-full border border-[#3A3A3D] transition-colors flex-shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Feed de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#1E1E21]/60">
            {mensajes.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-[#C6A466] text-[#1A1A1C] rounded-br-none shadow-md font-medium'
                      : 'bg-[#2B2B2E] border border-[#3A3A3D] text-[#FBF8F2] rounded-bl-none shadow-lg'
                  }`}
                >
                  {msg.sender === 'ai' ? (
                    <div>{renderFormattedText(msg.text)}</div>
                  ) : (
                    <p className="text-xs sm:text-sm font-sans whitespace-pre-wrap">{msg.text}</p>
                  )}

                  {/* Botones de Acción Interactivos */}
                  {msg.buttons && msg.buttons.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-[#3A3A3D] flex flex-wrap gap-2">
                      {msg.buttons.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          onClick={() => handleBotonAccion(btn)}
                          className="bg-[#1A1A1C] hover:bg-[#C6A466] text-[#C6A466] hover:text-[#1A1A1C] font-semibold text-xs px-3 py-1.5 rounded-lg border border-[#C6A466]/40 transition-all flex items-center gap-1.5 shadow"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[#F0DCA8]/40 mt-1 px-1 font-mono">
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
            className="p-3 bg-[#252528] border-t border-[#3A3A3D] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              placeholder="Haz una pregunta o busca una solicitud..."
              className="flex-1 bg-[#1A1A1C] text-[#FBF8F2] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-[#3A3A3D] focus:border-[#C6A466] focus:outline-none placeholder-[#F0DCA8]/40"
            />
            <button
              type="submit"
              disabled={!inputTexto.trim()}
              className="bg-[#C6A466] hover:bg-[#A88848] disabled:opacity-40 text-[#1A1A1C] font-bold p-2.5 rounded-xl transition-all flex items-center justify-center text-sm shadow-md"
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
