import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Paperclip, Send, CheckCheck, MoreVertical, 
  Phone, Video, AlertTriangle, FlaskConical, Ruler, Scissors, Bot,
  MessageSquare, Lock, Volume2, VolumeX, Bell, CheckCircle2,
  FileText, Image as ImageIcon, X, CornerDownRight, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuality } from '../../context/QualityContext';
import { soundEffects } from '../../utils/soundEffects';
import { NotasPrivadasSection } from '../chat/NotasPrivadasSection';

export interface MensajeChatWhatsApp {
  id: string | number;
  sender: string;
  isMe?: boolean;
  isSystem?: boolean;
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  adjuntoNombre?: string;
  adjuntoTipo?: 'imagen' | 'archivo';
  adjuntoUrl?: string;
}

export interface ConversacionChat {
  id: string;
  name: string;
  area: string;
  avatar: string;
  avatarBg: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: MensajeChatWhatsApp[];
}

const CHAT_WHATSAPP_STORAGE_KEY = 'stflab_chat_whatsapp_v2';

const CHATS_INICIALES_DEFAULT: ConversacionChat[] = [
  {
    id: 'chat-1',
    name: 'Patronaje - OT-2026-94',
    area: 'Patronaje',
    avatar: 'P',
    avatarBg: 'bg-indigo-600',
    lastMessage: 'Fue evaluado tras lavado estándar. Ajustar +1.5 cm.',
    time: '12:20 PM',
    unread: 0,
    online: true,
    messages: [
      {
        id: 101,
        sender: 'Sistema STFLab',
        isSystem: true,
        text: '⚠️ Alerta de Calidad: Encogimiento en largo -4.0% para Lote #8841 (Tolerancia: 2.5%).',
        time: '12:10 PM',
      },
      {
        id: 102,
        sender: 'Ana María (Patronaje)',
        isMe: false,
        text: 'Hola Carlos, ¿este porcentaje de encogimiento se midió después del vaporizado o del lavado industrial?',
        time: '12:15 PM',
      },
      {
        id: 103,
        sender: 'Tú (Laboratorio)',
        isMe: true,
        text: 'Fue evaluado tras lavado estándar a 40°C. Se recomienda ajustar +1.5 cm en el patrón de largo.',
        time: '12:20 PM',
        status: 'read',
      },
    ],
  },
  {
    id: 'chat-2',
    name: 'Corte - Lote Indigo #8841',
    area: 'Corte y Tendido',
    avatar: 'C',
    avatarBg: 'bg-amber-600',
    lastMessage: '¿Podemos liberar el tendido hoy a las 3:00 PM?',
    time: '11:45 AM',
    unread: 2,
    online: false,
    messages: [
      {
        id: 201,
        sender: 'Roberto (Corte)',
        isMe: false,
        text: 'Hola Lab, ¿podemos liberar el tendido hoy a las 3:00 PM?',
        time: '11:45 AM',
      },
    ],
  },
  {
    id: 'chat-3',
    name: 'Compras - Hilos & Avíos',
    area: 'Compras - Insumos',
    avatar: 'I',
    avatarBg: 'bg-[#00a8cc]',
    lastMessage: 'Recibida la muestra de hilo poliéster para solidez.',
    time: 'Ayer',
    unread: 0,
    online: true,
    messages: [
      {
        id: 301,
        sender: 'Soporte Compras',
        isMe: false,
        text: 'Recibida la muestra de hilo poliéster para solidez.',
        time: 'Ayer',
      },
    ],
  },
  {
    id: 'chat-4',
    name: 'Laboratorio - Ensayos Físicos',
    area: 'Laboratorio Textil',
    avatar: 'L',
    avatarBg: 'bg-emerald-600',
    lastMessage: 'Dictamen aprobado para solidez al frote seco/húmedo (Grado 4-5).',
    time: '09:30 AM',
    unread: 0,
    online: true,
    messages: [
      {
        id: 401,
        sender: 'Sistema STFLab',
        isSystem: true,
        text: '📋 Ensayo finalizado: Referencia STF-REF-9021 con Dictamen APROBADO.',
        time: '09:15 AM'
      },
      {
        id: 402,
        sender: 'Javier Ortiz (Jefe Lab)',
        isMe: false,
        text: 'Dictamen aprobado para solidez al frote seco/húmedo (Grado 4-5). Ficha técnica actualizada en el sistema.',
        time: '09:30 AM'
      }
    ]
  }
];

export function ChatEstiloWhatsAppSTFLab() {
  const { usuario } = useAuth();
  const { analistaActivo } = useQuality();

  const [activeTab, setActiveTab] = useState<'chat' | 'notas'>('chat');
  const [activeChatId, setActiveChatId] = useState('chat-1');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [llamadaActiva, setLlamadaActiva] = useState<{ tipo: 'audio' | 'video'; chatName: string } | null>(null);
  const [adjuntoTemporal, setAdjuntoTemporal] = useState<{ nombre: string; tipo: 'imagen' | 'archivo'; url?: string } | null>(null);

  // Control de sonido
  const [sonidoHabilitado, setSonidoHabilitado] = useState<boolean>(() => !soundEffects.getMuted());

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Nombre de usuario para el remitente
  const nombreRemitente = usuario?.displayName || analistaActivo?.nombreCompleto || 'Analista Lab';
  const rolRemitente = usuario?.rolEspecifico || usuario?.role || 'Laboratorio';

  // Lista de conversaciones estilo WhatsApp persistidas en localStorage
  const [chats, setChats] = useState<ConversacionChat[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_WHATSAPP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error leyendo chats de localStorage:', e);
    }
    return CHATS_INICIALES_DEFAULT;
  });

  // Guardar en localStorage cuando cambian los chats
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_WHATSAPP_STORAGE_KEY, JSON.stringify(chats));
    } catch (e) {
      console.error('Error guardando chats:', e);
    }
  }, [chats]);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [chats, activeChatId, activeTab]);

  const toggleSonido = () => {
    const nuevoEstado = !sonidoHabilitado;
    setSonidoHabilitado(nuevoEstado);
    soundEffects.setMuted(!nuevoEstado);
    if (nuevoEstado) {
      soundEffects.reproducir('chat');
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !adjuntoTemporal) return;

    const textoFinal = inputText.trim() || (adjuntoTemporal ? `[Archivo Adjunto] ${adjuntoTemporal.nombre}` : '');
    const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage: MensajeChatWhatsApp = {
      id: Date.now(),
      sender: `Tú (${rolRemitente})`,
      isMe: true,
      text: textoFinal,
      time: horaActual,
      status: 'read',
      ...(adjuntoTemporal ? {
        adjuntoNombre: adjuntoTemporal.nombre,
        adjuntoTipo: adjuntoTemporal.tipo,
        adjuntoUrl: adjuntoTemporal.url
      } : {})
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            lastMessage: `Tú: ${textoFinal}`,
            time: horaActual,
            unread: 0,
            messages: [...chat.messages, newMessage],
          };
        }
        return chat;
      })
    );

    if (sonidoHabilitado) {
      soundEffects.playSendChime();
    }

    setInputText('');
    setAdjuntoTemporal(null);
  };

  const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const esImg = file.type.startsWith('image/');
      const url = esImg ? URL.createObjectURL(file) : undefined;
      setAdjuntoTemporal({
        nombre: file.name,
        tipo: esImg ? 'imagen' : 'archivo',
        url
      });
    }
  };

  const handleAbrirAsistenteIA = () => {
    window.dispatchEvent(new CustomEvent('abrir-asistente-ia'));
  };

  const handlePlantillaRapida = (texto: string) => {
    setInputText(texto);
  };

  const filteredChats = chats.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const plantillasRapidas = [
    'Aprobado según NTC. Liberar para producción.',
    'Se detectó encogimiento fuera de tolerancia. Revisar compensación de molde.',
    'Muestra recibida en laboratorio. Ensayos en curso.',
    'Por favor compartir ficha técnica actualizada del fabricante.'
  ];

  return (
    <div className="w-full min-h-[calc(100vh-100px)] p-2 md:p-4 text-slate-800 font-sans flex flex-col gap-3">
      
      {/* Header Superior del Módulo */}
      <header className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#00a8cc] p-3 rounded-2xl text-white shadow-sm flex items-center justify-center">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-wide uppercase font-sans">
                Chat Inter-Áreas STFLab
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300 uppercase tracking-wider">
                Tiempo Real
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comunicaciones instantáneas tipo WhatsApp para dudas técnicas, tolerancias y moldería
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Pestañas: Chat WhatsApp vs Mis Notas Privadas */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#00a8cc]" />
              <span>Chat WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'notas'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Mis Notas</span>
            </button>
          </div>

          {/* Control de Sonido */}
          <button
            type="button"
            onClick={toggleSonido}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              sonidoHabilitado
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
            }`}
            title={sonidoHabilitado ? 'Sonido activado' : 'Sonido silenciado'}
          >
            {sonidoHabilitado ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-rose-600" />}
            <span className="hidden sm:inline">{sonidoHabilitado ? 'Sonido: ON' : 'Sonido: OFF'}</span>
          </button>

          {/* Badge Usuario Activo */}
          <span className="bg-[#e0f2fe] text-[#0369a1] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#bae6fd] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Usuario: {nombreRemitente}</span>
          </span>
        </div>
      </header>

      {/* Alerta de Llamada o Videollamada Técnica Inter-Áreas */}
      {llamadaActiva && (
        <div className="bg-[#00a8cc] text-white p-4 rounded-2xl shadow-lg border border-cyan-400 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 animate-pulse">
              {llamadaActiva.tipo === 'audio' ? <Phone className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h4 className="font-extrabold text-sm uppercase">
                {llamadaActiva.tipo === 'audio' ? 'Llamada de Voz Inter-Áreas' : 'Videollamada Técnica STFLab'}
              </h4>
              <p className="text-xs text-cyan-100">
                Conectando en directo con la mesa técnica de <strong>{llamadaActiva.chatName}</strong>...
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLlamadaActiva(null)}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            Finalizar
          </button>
        </div>
      )}

      {/* Contenido: Si está en notas, mostrar NotasPrivadasSection */}
      {activeTab === 'notas' ? (
        <NotasPrivadasSection />
      ) : (
        /* Interfaz Principal Estilo WhatsApp */
        <div className="w-full flex-1 flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-md border border-slate-300 bg-white min-h-[620px]">
          
          {/* PANEL IZQUIERDO: Lista de Chats / Conversaciones */}
          <aside className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50">
            
            {/* Header Izquierdo */}
            <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#00a8cc] text-white flex items-center justify-center font-black text-xs shadow-xs">
                  {nombreRemitente.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-800 block">Mis Mensajes</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">● Conectado a Red STF</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setChats(CHATS_INICIALES_DEFAULT)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
                title="Restablecer conversaciones"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Buscador de Chats */}
            <div className="p-2.5 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar chat u orden..."
                  className="w-full text-xs bg-transparent focus:outline-none text-slate-700"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Lista de Conversaciones */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredChats.map((chat) => {
                const isActive = chat.id === activeChatId;

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
                    }}
                    className={`p-3 cursor-pointer transition-colors flex items-center gap-3 ${
                      isActive ? 'bg-slate-200/80 border-l-4 border-l-[#00a8cc]' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full ${chat.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-xs`}>
                        {chat.avatar}
                      </div>
                      {chat.online && (
                        <span className="w-3 h-3 bg-emerald-500 border-2 border-white rounded-full absolute bottom-0 right-0"></span>
                      )}
                    </div>

                    {/* Detalle del Chat */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xs text-slate-800 truncate">{chat.name}</h3>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">{chat.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{chat.lastMessage}</p>
                    </div>

                    {/* Contador de no leídos */}
                    {chat.unread > 0 && (
                      <span className="bg-[#00a8cc] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-2xs">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                );
              })}

              {filteredChats.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  No se encontraron conversaciones con "{searchQuery}"
                </div>
              )}
            </div>
          </aside>

          {/* PANEL DERECHO: Ventana de Conversación Seleccionada */}
          <main className="flex-1 flex flex-col bg-[#e5ddd5] relative">
            
            {/* Header del Chat Activo */}
            <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between shadow-xs z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${activeChat?.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-xs`}>
                  {activeChat?.avatar}
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-800">{activeChat?.name}</h2>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${activeChat?.online ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    <span>{activeChat?.online ? 'En línea' : 'Desconectado'} · Área de {activeChat?.area}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <button
                  type="button"
                  onClick={() => setLlamadaActiva({ tipo: 'audio', chatName: activeChat.name })}
                  className="p-2 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
                  title="Llamada de voz"
                >
                  <Phone className="w-4 h-4 text-slate-600 hover:text-[#00a8cc]" />
                </button>
                <button
                  type="button"
                  onClick={() => setLlamadaActiva({ tipo: 'video', chatName: activeChat.name })}
                  className="p-2 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
                  title="Videollamada técnica"
                >
                  <Video className="w-4 h-4 text-slate-600 hover:text-[#00a8cc]" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`¿Limpiar el historial de mensajes de "${activeChat.name}"?`)) {
                      setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, messages: [], lastMessage: 'Historial vaciado' } : c));
                    }
                  }}
                  className="p-2 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
                  title="Opciones de chat"
                >
                  <MoreVertical className="w-4 h-4 text-slate-600 hover:text-slate-900" />
                </button>
              </div>
            </div>

            {/* Plantillas Rápidas (Chips de respuestas comunes) */}
            <div className="bg-slate-50/90 border-b border-slate-200 px-3 py-1.5 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="font-bold text-slate-400 uppercase text-[9px] shrink-0">Respuestas rápidas:</span>
              {plantillasRapidas.map((plantilla, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePlantillaRapida(plantilla)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-cyan-50 text-slate-700 hover:text-[#00a8cc] border border-slate-200 font-medium shrink-0 cursor-pointer transition-all shadow-2xs"
                >
                  {plantilla.length > 35 ? plantilla.slice(0, 35) + '...' : plantilla}
                </button>
              ))}
            </div>

            {/* Área de Mensajes con Fondo WhatsApp */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#efeae2]">
              {activeChat?.messages.map((msg) => {
                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="bg-amber-100 border border-amber-300 text-amber-900 text-xs px-3.5 py-1.5 rounded-xl max-w-md text-center shadow-xs font-semibold">
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md p-3 rounded-2xl shadow-xs text-xs relative leading-relaxed ${
                        msg.isMe
                          ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none border border-emerald-200'
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                      }`}
                    >
                      {!msg.isMe && (
                        <span className="font-bold text-[11px] text-[#00a8cc] block mb-1">
                          {msg.sender}
                        </span>
                      )}

                      {/* Vista previa de archivo adjunto si existe */}
                      {msg.adjuntoNombre && (
                        <div className="mb-2 p-2 bg-black/5 rounded-xl border border-black/10 flex items-center gap-2">
                          {msg.adjuntoTipo === 'imagen' ? (
                            <ImageIcon className="w-4 h-4 text-[#00a8cc]" />
                          ) : (
                            <FileText className="w-4 h-4 text-amber-600" />
                          )}
                          <span className="font-bold text-[11px] truncate flex-1">{msg.adjuntoNombre}</span>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400 font-medium">
                        <span>{msg.time}</span>
                        {msg.isMe && (
                          <CheckCheck className={`w-3.5 h-3.5 ${msg.status === 'read' ? 'text-sky-500' : 'text-slate-400'}`} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Vista previa de adjunto seleccionado antes de enviar */}
            {adjuntoTemporal && (
              <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-[#00a8cc]" />
                  <span className="font-bold text-slate-700">Adjunto: {adjuntoTemporal.nombre}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAdjuntoTemporal(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Barra para Enviar Mensajes */}
            <footer className="p-3 bg-slate-100 border-t border-slate-200 flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleSeleccionarArchivo}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xlsx"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-slate-500 hover:text-[#00a8cc] hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                title="Adjuntar foto o reporte técnico"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escribe un mensaje para responder la duda..."
                  className="w-full px-4 py-2.5 text-xs bg-white text-slate-800 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8cc] focus:border-transparent shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() && !adjuntoTemporal}
                  className="p-2.5 bg-[#00a8cc] hover:bg-[#0284c7] disabled:opacity-50 text-white rounded-full transition-all shadow-sm cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </footer>

          </main>
        </div>
      )}

      {/* Asistente IA Flotante */}
      <button 
        type="button"
        onClick={handleAbrirAsistenteIA}
        className="fixed bottom-6 right-6 bg-[#00a8cc] text-white px-4 py-2.5 rounded-full shadow-xl hover:bg-[#0284c7] flex items-center gap-2 font-bold text-xs border border-white/30 transition-all cursor-pointer hover:scale-105 active:scale-95 z-40"
      >
        <Bot className="w-4 h-4" />
        <span>ASISTENTE IA</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      </button>

    </div>
  );
}

// Compatibilidad de exportación tanto por defecto como con nombre
export const ChatView = ChatEstiloWhatsAppSTFLab;
export default ChatEstiloWhatsAppSTFLab;
