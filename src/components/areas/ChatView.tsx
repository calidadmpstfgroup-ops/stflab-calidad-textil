import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AreaType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useQuality } from '../../context/QualityContext';
import { soundEffects } from '../../utils/soundEffects';
import { NotasPrivadasSection } from '../chat/NotasPrivadasSection';
import { 
  Send, 
  Users, 
  Shield, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  Globe, 
  FlaskConical, 
  ShoppingCart, 
  Ruler, 
  Scissors, 
  Layers, 
  ShieldCheck,
  Tag,
  Volume2,
  VolumeX,
  Lock,
  Bell,
  BellOff
} from 'lucide-react';

interface ChatViewProps {
  messages?: ChatMessage[];
  onSendMessage?: (text: string, canal?: string) => void;
  onClearChat?: () => void;
}

const CHAT_STORAGE_KEY = 'stf_chat_messages_v2';

export const ChatView: React.FC<ChatViewProps> = ({ 
  messages: externalMessages, 
  onSendMessage: externalOnSend, 
  onClearChat: externalOnClear 
}) => {
  const { usuario } = useAuth();
  const { analistaActivo } = useQuality();

  const [activeTab, setActiveTab] = useState<'chat' | 'notas'>('chat');

  // Estado de notificaciones sonoras (Sonido Habilitado por defecto)
  const [sonidoHabilitado, setSonidoHabilitado] = useState<boolean>(() => {
    return !soundEffects.getMuted();
  });

  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [
        {
          id: 'msg-init-1',
          remitente: 'Sistema STFLab',
          area: 'laboratorio' as AreaType,
          mensaje: '¡Bienvenidos al Chat de Coordinación Inter-Áreas de STFLab Calidad & Trazabilidad!',
          timestamp: new Date().toISOString(),
          canal: 'general'
        }
      ];
    } catch {
      return [];
    }
  });

  const [newText, setNewText] = useState('');
  const [activeCanal, setActiveCanal] = useState<string>('general');
  const [mobileView, setMobileView] = useState<'channels' | 'chat'>('channels');
  const [notificacionFlotante, setNotificacionFlotante] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesCountRef = useRef<number>(0);

  const messages = externalMessages || internalMessages;

  const currentRemitente = analistaActivo?.nombreCompleto || usuario?.displayName || 'Usuario STFLab';
  const currentArea = usuario?.areaAsignada || 'laboratorio';
  const currentPin = analistaActivo?.pinAcceso || usuario?.uid || '1234';

  useEffect(() => {
    if (!externalMessages) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(internalMessages));
    }
  }, [internalMessages, externalMessages]);

  // Reproducir sonido cuando llega un nuevo mensaje de otra área / remitente
  useEffect(() => {
    if (prevMessagesCountRef.current > 0 && messages.length > prevMessagesCountRef.current) {
      const ultimoMensaje = messages[messages.length - 1];
      const esMensajePropio = ultimoMensaje.remitente === currentRemitente || ultimoMensaje.remitente.includes(currentRemitente.split(' ')[0]);

      if (!esMensajePropio && sonidoHabilitado) {
        soundEffects.reproducir('chat');
        setNotificacionFlotante(`🔔 Nuevo mensaje de ${ultimoMensaje.remitente} (${ultimoMensaje.area.toUpperCase()}) en canal #${ultimoMensaje.canal || 'general'}`);
        
        setTimeout(() => {
          setNotificacionFlotante(null);
        }, 4500);
      }
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages, currentRemitente, sonidoHabilitado]);

  const toggleSonido = () => {
    const nuevoEstado = !sonidoHabilitado;
    setSonidoHabilitado(nuevoEstado);
    soundEffects.setMuted(!nuevoEstado);
    if (nuevoEstado) {
      soundEffects.reproducir('chat');
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const msgCanal = msg.canal || 'general';
    return msgCanal === activeCanal;
  });

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    if (externalOnSend) {
      externalOnSend(newText.trim(), activeCanal);
    } else {
      const nuevoMensaje: ChatMessage = {
        id: `msg-${Date.now()}`,
        remitente: currentRemitente,
        area: currentArea as AreaType,
        mensaje: newText.trim(),
        timestamp: new Date().toISOString(),
        canal: activeCanal
      };
      setInternalMessages(prev => [...prev, nuevoMensaje]);
    }

    if (sonidoHabilitado) {
      soundEffects.playSendChime();
    }

    setNewText('');
  };

  const handleClear = () => {
    if (window.confirm(`¿Limpiar historial del canal "${activeCanal}"?`)) {
      if (externalOnClear) {
        externalOnClear();
      } else {
        setInternalMessages(prev => prev.filter(m => (m.canal || 'general') !== activeCanal));
      }
    }
  };

  const getAreaLabelStyle = (area: string) => {
    switch (area) {
      case 'colecciones': return { bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', name: 'Colecciones' };
      case 'laboratorio': return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', name: 'Laboratorio' };
      case 'calidad': return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', name: 'Calidad' };
      case 'compras': return { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', name: 'Compras' };
      case 'patronaje': return { bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', name: 'Patronaje' };
      case 'corte': return { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30', name: 'Corte' };
      default: return { bg: 'bg-slate-800 text-slate-300 border-slate-700', name: 'General' };
    }
  };

  const getQuickTemplatesForCanal = (canal: string) => {
    switch (canal) {
      case 'laboratorio':
        return [
          { text: 'Solicito prioridad para ensayo de encogimiento y solidez de muestra urgente.', label: 'Priorizar Ensayo' },
          { text: 'Resultados de laboratorio registrados y ficha técnica homologada.', label: 'Resultados Listos' }
        ];
      case 'compras':
        return [
          { text: 'Nueva solicitud de telas y accesorios enviada al laboratorio.', label: 'Nueva Solicitud' },
          { text: 'Compra autorizada con alertas operativas para patronaje y corte.', label: 'Compra Autorizada' }
        ];
      case 'patronaje':
        return [
          { text: 'Compensación de moldería calculada por encogimiento térmico.', label: 'Compensación Molde' },
          { text: 'Patrón liberado para inicio de trazo y tendido.', label: 'Molde Liberado' }
        ];
      case 'corte':
        return [
          { text: 'Iniciado reposo obligatorio de 24 horas en mesa de relajación.', label: 'Reposo en Mesa' },
          { text: 'Tendido verificado sin tensión y corte liberado.', label: 'Corte Liberado' }
        ];
      default:
        return [
          { text: 'Coordinemos mesa técnica para revisar tolerancias críticas.', label: 'Mesa Técnica' },
          { text: 'Lote de tela inspeccionado y validado en planta.', label: 'Validación Lote' }
        ];
    }
  };

  const channelsList = [
    { id: 'general', name: 'Canal General', desc: 'Coordinación global inter-áreas', icon: <Globe className="h-4 w-4" />, color: 'text-slate-400' },
    { id: 'compras', name: 'Área Compras', desc: 'Lotes de tela, órdenes y proveedores', icon: <ShoppingCart className="h-4 w-4" />, color: 'text-blue-400' },
    { id: 'laboratorio', name: 'Área Laboratorio', desc: 'Ensayos técnicos, solideces y tolerancias', icon: <FlaskConical className="h-4 w-4" />, color: 'text-emerald-400' },
    { id: 'patronaje', name: 'Área Patronaje', desc: 'Moldes, encogimientos y escalado', icon: <Ruler className="h-4 w-4" />, color: 'text-indigo-400' },
    { id: 'corte', name: 'Área Corte y Tendido', desc: 'Tendido, reposo 24-48h y consumo', icon: <Scissors className="h-4 w-4" />, color: 'text-orange-400' }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Alerta / Toast Flotante de Sonido cuando llega mensaje de otra área */}
      {notificacionFlotante && (
        <div className="bg-[#C6A466] text-[#1E1E21] border-2 border-white px-5 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wide">
            <Bell className="w-5 h-5 text-[#1E1E21] animate-spin" />
            <span>{notificacionFlotante}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificacionFlotante(null)}
            className="text-xs font-black hover:opacity-75 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Pestañas Superiores: Chat Inter-Áreas vs Mis Notas Privadas por PIN */}
      <div className="bg-[#2B2B2E] border border-[#424246] p-2 rounded-3xl shadow-md flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${
              activeTab === 'chat'
                ? 'bg-[#C6A466] text-[#1E1E21] shadow-md'
                : 'text-[#E6DCB8] hover:text-white hover:bg-[#38383B]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>💬 Chat Inter-Áreas (Público)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notas')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${
              activeTab === 'notas'
                ? 'bg-[#C6A466] text-[#1E1E21] shadow-md'
                : 'text-[#E6DCB8] hover:text-white hover:bg-[#38383B]'
            }`}
          >
            <Lock className={`w-4 h-4 ${activeTab === 'notas' ? 'text-[#1E1E21]' : 'text-emerald-400'}`} />
            <span>Mis Notas</span>
          </button>
        </div>

        {/* Botón Control Notificación Sonora */}
        <button
          type="button"
          onClick={toggleSonido}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black border flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${
            sonidoHabilitado
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
          }`}
          title={sonidoHabilitado ? "Notificaciones audibles activas (Click para silenciar)" : "Sonido silenciado (Click para activar)"}
        >
          {sonidoHabilitado ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          <span className="hidden sm:inline">{sonidoHabilitado ? 'Sonido: ON 🔔' : 'Sonido: OFF 🔕'}</span>
        </button>
      </div>

      {/* Contenido según la Pestaña Seleccionada */}
      {activeTab === 'notas' ? (
        <NotasPrivadasSection />
      ) : (
        <>
          {/* Banner Superior Chat */}
          <div className="bg-[#2D2D30] border border-[#424246] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C6A466]/20 border border-[#C6A466]/30 flex items-center justify-center text-[#C6A466]">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-serif font-black text-[#FBF8F2] tracking-wide uppercase">Chat de Coordinación Inter-Áreas</h2>
                  <span className="text-[10px] font-black bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    STFLab COMUNICACIÓN
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#E6DCB8] mt-0.5">
                  Canales departamentales en tiempo real para coordinar calidad, decisiones de compra, moldería y corte.
                </p>
              </div>
            </div>

            {filteredMessages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="self-start md:self-center px-4 py-2 bg-[#2B2B2E] hover:bg-rose-950/40 text-[#AA9E80] hover:text-rose-300 border border-[#424246] hover:border-rose-500/30 text-xs font-black rounded-xl transition-all cursor-pointer uppercase tracking-wider"
              >
                Limpiar Canal Activo
              </button>
            )}
          </div>

          {/* Grid Principal del Chat */}
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-[#2B2B2E] rounded-3xl border border-[#424246] shadow-2xl overflow-hidden h-[680px]">
            
            {/* Columna Izquierda: Canales (4 cols) */}
            <div className={`lg:col-span-4 border-r border-[#424246] bg-[#2D2D30]/80 p-4 flex flex-col justify-between ${
              mobileView === 'channels' ? 'flex' : 'hidden lg:flex'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-[#424246]">
                  <Users className="h-4 w-4 text-[#C6A466]" />
                  <span className="text-xs font-black text-[#FBF8F2] uppercase tracking-wider">Canales de Comunicación</span>
                </div>

                <div className="space-y-2">
                  {channelsList.map((canal) => {
                    const isActive = activeCanal === canal.id;
                    const count = messages.filter(m => (m.canal || 'general') === canal.id).length;

                    return (
                      <button
                        key={canal.id}
                        type="button"
                        onClick={() => {
                          setActiveCanal(canal.id);
                          setMobileView('chat');
                        }}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center space-x-3.5 cursor-pointer ${
                          isActive 
                            ? 'bg-[#C6A466]/25 border-[#C6A466] shadow-[0_0_18px_rgba(198,164,102,0.3)] ring-2 ring-[#C6A466]/70' 
                            : 'bg-[#2D2D30] border-[#424246] hover:bg-[#353538] hover:border-[#C6A466]/50 shadow-sm'
                        }`}
                      >
                        <div className={`p-3 rounded-xl shrink-0 transition-colors ${
                          isActive 
                            ? 'bg-[#C6A466] text-[#120F0D] font-black shadow-md' 
                            : 'bg-[#1E1E21] text-[#FBF8F2] border border-[#424246]'
                        }`}>
                          <span className={isActive ? 'text-[#120F0D]' : canal.color}>{canal.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm sm:text-base font-black tracking-wide ${
                              isActive ? 'text-[#FFF8E7] drop-shadow-md' : 'text-white'
                            }`}>
                              {canal.name}
                            </span>
                            {count > 0 && (
                              <span className="bg-[#C6A466] text-[#120F0D] border border-white/60 text-xs font-mono font-black px-2.5 py-0.5 rounded-full shadow-md">
                                {count}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs font-bold truncate mt-0.5 ${
                            isActive ? 'text-[#F0DCA8]' : 'text-[#D4C8B0]'
                          }`}>
                            {canal.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 bg-[#2B2B2E] rounded-2xl border border-[#424246] text-xs font-bold text-[#E6DCB8] space-y-1">
                <span className="text-[#C6A466] font-black flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Sincronización en Vivo
                </span>
                <p className="font-semibold text-xs text-[#FBF8F2]/90">Los mensajes se comparten al instante entre todos los módulos activos.</p>
              </div>
            </div>

            {/* Columna Derecha: Panel de Conversación (8 cols) */}
            <div className={`lg:col-span-8 flex flex-col h-full bg-[#2B2B2E]/60 ${
              mobileView === 'chat' ? 'flex' : 'hidden lg:flex'
            }`}>
              
              {/* Cabecera del Canal */}
              <div className="bg-[#2D2D30] px-5 py-4 flex items-center justify-between border-b border-[#424246] shrink-0">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setMobileView('channels')}
                    className="lg:hidden px-3 py-1.5 rounded-lg bg-[#2B2B2E] text-xs font-black text-[#C6A466]"
                  >
                    ← Canales
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-serif font-black text-[#FBF8F2] uppercase tracking-wide">
                      Canal: {channelsList.find(c => c.id === activeCanal)?.name}
                    </span>
                    <span className="text-xs font-bold bg-[#2B2B2E] text-[#C6A466] px-2.5 py-0.5 rounded-full border border-[#424246]">
                      {filteredMessages.length} Mensajes
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black text-[#C6A466] bg-[#C6A466]/10 px-3 py-1 rounded-lg border border-[#C6A466]/30 uppercase tracking-wider">
                  Usuario: {currentRemitente.split(' ')[0]} ({currentArea.toUpperCase()})
                </span>
              </div>

              {/* Mensajes con Scroll */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-vertical-scroll">
                {filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center text-[#AA9E80] space-y-2">
                    <MessageSquare className="h-12 w-12 text-[#C6A466]" />
                    <h4 className="text-sm font-black text-[#FBF8F2] uppercase tracking-wide">Canal sin mensajes</h4>
                    <p className="text-xs font-bold text-[#AA9E80] max-w-xs">
                      Sé el primero en enviar una novedad o selecciona una respuesta rápida abajo.
                    </p>
                  </div>
                ) : (
                  filteredMessages.map((msg) => {
                    const isMe = currentRemitente && (currentRemitente === msg.remitente || currentRemitente.includes(msg.remitente.split(' ')[0]));
                    const style = getAreaLabelStyle(msg.area);
                    const dateObj = new Date(msg.timestamp);
                    const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[88%] sm:max-w-[80%] animate-fade-in ${
                          isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <div className="flex items-center space-x-2 text-xs text-[#AA9E80] mb-1.5 px-1 font-bold">
                          <span className="font-black text-[#FBF8F2]">{msg.remitente}</span>
                          <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-black tracking-wider ${style.bg}`}>
                            {msg.area}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-[#AA9E80]">{formattedTime}</span>
                        </div>

                        <div 
                          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border shadow-md font-bold ${
                            isMe 
                              ? 'bg-[#C6A466] text-[#1E1E21] border-[#C6A466] rounded-tr-none font-extrabold' 
                              : 'bg-[#2D2D30] text-[#FBF8F2] border-[#424246] rounded-tl-none font-bold'
                          }`}
                        >
                          <p className="whitespace-pre-wrap font-bold text-xs sm:text-sm tracking-wide">{msg.mensaje}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Plantillas de Respuestas Rápidas */}
              <div className="px-4 py-2.5 bg-[#2D2D30]/80 border-t border-[#424246] flex flex-wrap gap-2 items-center shrink-0">
                <span className="text-xs font-black text-[#C6A466] uppercase tracking-wider mr-1">
                  ⚡ Respuestas Rápidas:
                </span>
                {getQuickTemplatesForCanal(activeCanal).map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewText(template.text)}
                    className="text-xs px-3 py-1.5 rounded-full font-bold bg-[#2B2B2E] hover:bg-[#424246] text-[#FBF8F2] hover:text-white border border-[#424246] transition-all cursor-pointer shadow-2xs"
                  >
                    {template.label}
                  </button>
                ))}
              </div>

              {/* Formulario de Envío */}
              <form 
                onSubmit={handleSend} 
                className="p-3.5 bg-[#2D2D30] border-t border-[#424246] flex items-center space-x-3 shrink-0"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder={`Escribir novedad en canal ${channelsList.find(c => c.id === activeCanal)?.name}...`}
                    className="w-full py-3.5 pl-4 pr-12 bg-[#2B2B2E] border border-[#424246] rounded-xl text-xs sm:text-sm font-bold text-[#FBF8F2] placeholder-[#AA9E80] focus:outline-none focus:border-[#C6A466]"
                  />
                  <button
                    type="submit"
                    disabled={!newText.trim()}
                    className={`absolute right-2 top-2 p-2.5 rounded-lg transition-all ${
                      newText.trim() 
                        ? 'bg-[#C6A466] hover:bg-[#D6CDB8] text-[#1E1E21] font-black shadow cursor-pointer' 
                        : 'bg-[#424246] text-[#AA9E80] cursor-not-allowed'
                    }`}
                    title="Enviar mensaje"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>

            </div>
          </div>
        </>
      )}
    </div>
  );
};
