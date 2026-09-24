import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuality } from '../../context/QualityContext';
import { 
  Lock, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Star, 
  Sparkles, 
  Check, 
  X, 
  FileText, 
  KeyRound, 
  ShieldCheck, 
  AlertTriangle,
  FlaskConical,
  ShoppingCart,
  Ruler,
  Scissors,
  User
} from 'lucide-react';

export interface NotaPrivada {
  id: string;
  pinKey: string;
  titulo: string;
  contenido: string;
  categoria: 'laboratorio' | 'compras' | 'patronaje' | 'corte' | 'personal' | 'urgente';
  fechaCreacion: string;
  fechaModificacion: string;
  destacada: boolean;
}

export const NotasPrivadasSection: React.FC = () => {
  const { usuario } = useAuth();
  const { analistaActivo } = useQuality();

  // El PIN o identificador único del analista en sesión
  const currentPin = analistaActivo?.pinAcceso || '1234';
  const currentNombre = analistaActivo?.nombreCompleto || usuario?.displayName || 'Analista STFLab';
  const currentCargo = analistaActivo?.cargoEspecialidad || usuario?.role || 'CONTROL DE CALIDAD';

  const STORAGE_KEY = `stf_notas_privadas_PIN_${currentPin}`;

  const [notas, setNotas] = useState<NotaPrivada[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      // Notas iniciales de bienvenida por PIN
      return [
        {
          id: `nota-init-1`,
          pinKey: currentPin,
          titulo: '📌 Bienvenida a tus Notas Privadas por PIN',
          contenido: `Hola ${currentNombre}, esta es tu libreta de notas personales. Toda nota creada aquí está vinculada a tu PIN (${currentPin}) y solo tú puedes visualizarla.`,
          categoria: 'personal',
          fechaCreacion: new Date().toISOString(),
          fechaModificacion: new Date().toISOString(),
          destacada: true
        }
      ];
    } catch {
      return [];
    }
  });

  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [notaEditando, setNotaEditando] = useState<NotaPrivada | null>(null);

  // Form state
  const [formTitulo, setFormTitulo] = useState('');
  const [formContenido, setFormContenido] = useState('');
  const [formCategoria, setFormCategoria] = useState<NotaPrivada['categoria']>('laboratorio');
  const [formDestacada, setFormDestacada] = useState(false);

  // Re-cargar notas cuando cambia el PIN del analista activo
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`stf_notas_privadas_PIN_${currentPin}`);
      if (saved) {
        setNotas(JSON.parse(saved));
      } else {
        const defaultNotes: NotaPrivada[] = [
          {
            id: `nota-init-${Date.now()}`,
            pinKey: currentPin,
            titulo: `📌 Notas de ${currentNombre}`,
            contenido: `Espacio de anotaciones confidenciales asignado al PIN ${currentPin}.`,
            categoria: 'personal',
            fechaCreacion: new Date().toISOString(),
            fechaModificacion: new Date().toISOString(),
            destacada: true
          }
        ];
        setNotas(defaultNotes);
      }
    } catch (e) {
      console.warn('Error cargando notas por PIN:', e);
    }
  }, [currentPin, currentNombre]);

  // Persistir notas al modificar
  useEffect(() => {
    try {
      localStorage.setItem(`stf_notas_privadas_PIN_${currentPin}`, JSON.stringify(notas));
    } catch (e) {
      console.warn('Error guardando notas por PIN:', e);
    }
  }, [notas, currentPin]);

  const abrirModalCrear = () => {
    setNotaEditando(null);
    setFormTitulo('');
    setFormContenido('');
    setFormCategoria('laboratorio');
    setFormDestacada(false);
    setModalAbierto(true);
  };

  const abrirModalEditar = (nota: NotaPrivada) => {
    setNotaEditando(nota);
    setFormTitulo(nota.titulo);
    setFormContenido(nota.contenido);
    setFormCategoria(nota.categoria);
    setFormDestacada(nota.destacada);
    setModalAbierto(true);
  };

  const handleGuardarNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim() || !formContenido.trim()) return;

    const ahora = new Date().toISOString();

    if (notaEditando) {
      setNotas(prev => prev.map(n => n.id === notaEditando.id ? {
        ...n,
        titulo: formTitulo.trim(),
        contenido: formContenido.trim(),
        categoria: formCategoria,
        destacada: formDestacada,
        fechaModificacion: ahora
      } : n));
    } else {
      const nuevaNota: NotaPrivada = {
        id: `nota-${Date.now()}`,
        pinKey: currentPin,
        titulo: formTitulo.trim(),
        contenido: formContenido.trim(),
        categoria: formCategoria,
        fechaCreacion: ahora,
        fechaModificacion: ahora,
        destacada: formDestacada
      };
      setNotas(prev => [nuevaNota, ...prev]);
    }

    setModalAbierto(false);
  };

  const handleEliminarNota = (id: string) => {
    if (window.confirm('¿Deseas eliminar esta nota privada permanentemente?')) {
      setNotas(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleToggleDestacada = (id: string) => {
    setNotas(prev => prev.map(n => n.id === id ? { ...n, destacada: !n.destacada } : n));
  };

  const usarPlantillaRapida = (plantillaTitulo: string, plantillaContenido: string, categoria: NotaPrivada['categoria']) => {
    setNotaEditando(null);
    setFormTitulo(plantillaTitulo);
    setFormContenido(plantillaContenido);
    setFormCategoria(categoria);
    setFormDestacada(false);
    setModalAbierto(true);
  };

  // Filtrado de notas
  const notasFiltradas = notas.filter(nota => {
    const coincideBusqueda = nota.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
                             nota.contenido.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === 'todas' || nota.categoria === categoriaFiltro;
    return coincideBusqueda && coincideCategoria;
  });

  const getCategoriaBadge = (cat: NotaPrivada['categoria']) => {
    switch (cat) {
      case 'laboratorio': return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', name: 'Laboratorio', icon: <FlaskConical className="w-3 h-3" /> };
      case 'compras': return { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', name: 'Compras', icon: <ShoppingCart className="w-3 h-3" /> };
      case 'patronaje': return { bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', name: 'Patronaje', icon: <Ruler className="w-3 h-3" /> };
      case 'corte': return { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', name: 'Corte', icon: <Scissors className="w-3 h-3" /> };
      case 'urgente': return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', name: 'Urgente', icon: <AlertTriangle className="w-3 h-3" /> };
      default: return { bg: 'bg-slate-700 text-slate-200 border-slate-600', name: 'Personal', icon: <User className="w-3 h-3" /> };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner de Seguridad por PIN */}
      <div className="bg-[#2D2D30] border border-[#C6A466]/40 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#C6A466]/20 border border-[#C6A466]/40 flex items-center justify-center text-[#C6A466] shrink-0">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-black text-[#FBF8F2] tracking-wide uppercase">
                Notas Privadas por PIN
              </h2>
              <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                ACCESO CONFIDENCIAL
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#AA9E80] mt-0.5">
              Analista Activo: <strong className="text-[#FBF8F2]">{currentNombre}</strong> ({currentCargo}) | PIN Activo: <strong className="text-[#C6A466]">****</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={abrirModalCrear}
          className="px-5 py-3 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#1E1E21] font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md cursor-pointer flex items-center gap-2 shrink-0 uppercase tracking-wider"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nueva Nota Privada</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-[#2B2B2E] border border-[#424246] p-4 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#AA9E80] absolute left-3.5 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en mis notas privadas..."
            className="w-full pl-10 pr-4 py-2 bg-[#2D2D30] border border-[#424246] rounded-xl text-xs sm:text-sm font-bold text-[#FBF8F2] placeholder-[#AA9E80] focus:outline-none focus:border-[#C6A466]"
          />
        </div>

        {/* Filtros de Categoría */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {['todas', 'laboratorio', 'compras', 'patronaje', 'corte', 'urgente', 'personal'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaFiltro(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                categoriaFiltro === cat
                  ? 'bg-[#C6A466] text-[#1E1E21] shadow-xs'
                  : 'bg-[#2D2D30] text-[#AA9E80] hover:text-white border border-[#424246]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Plantillas Rápidas de Anotación */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="text-xs font-black text-[#C6A466] uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          Plantillas Rápidas:
        </span>
        <button
          type="button"
          onClick={() => usarPlantillaRapida('Verificar Ensayo Pendiente', 'Realizar revisión de solidez al frote e hilo de muestra urgente.', 'laboratorio')}
          className="text-xs font-bold px-3 py-1 bg-[#2D2D30] hover:bg-[#38383B] text-[#FBF8F2] border border-[#424246] rounded-xl cursor-pointer transition-all"
        >
          + Pendiente Ensayo
        </button>
        <button
          type="button"
          onClick={() => usarPlantillaRapida('Alerta Moldería Patronaje', 'Verificar porcentaje de encogimiento térmico antes de autorizar el patrón.', 'patronaje')}
          className="text-xs font-bold px-3 py-1 bg-[#2D2D30] hover:bg-[#38383B] text-[#FBF8F2] border border-[#424246] rounded-xl cursor-pointer transition-all"
        >
          + Alerta Moldería
        </button>
        <button
          type="button"
          onClick={() => usarPlantillaRapida('Autorización de Compras', 'Coordinar con proveedor el reemplazo del lote rechazado.', 'compras')}
          className="text-xs font-bold px-3 py-1 bg-[#2D2D30] hover:bg-[#38383B] text-[#FBF8F2] border border-[#424246] rounded-xl cursor-pointer transition-all"
        >
          + Nota Compras
        </button>
      </div>

      {/* Lista / Grid de Notas Privadas */}
      {notasFiltradas.length === 0 ? (
        <div className="bg-[#2B2B2E] border border-[#424246] rounded-3xl p-12 text-center text-[#AA9E80] space-y-3">
          <FileText className="w-12 h-12 text-[#C6A466] mx-auto" />
          <h3 className="text-base font-black text-[#FBF8F2] uppercase">No hay notas privadas guardadas</h3>
          <p className="text-xs font-bold text-[#AA9E80] max-w-sm mx-auto">
            Usa el botón "Nueva Nota Privada" o las plantillas rápidas para guardar tus apuntes personales protegidos por tu PIN.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notasFiltradas.map((nota) => {
            const badge = getCategoriaBadge(nota.categoria);
            const fechaStr = new Date(nota.fechaModificacion).toLocaleDateString('es-CO', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={nota.id}
                className={`bg-[#2D2D30] border rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all hover:border-[#C6A466]/60 ${
                  nota.destacada ? 'border-[#C6A466] bg-[#2D2D30]' : 'border-[#424246]'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${badge.bg}`}>
                      {badge.icon}
                      {badge.name}
                    </span>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleToggleDestacada(nota.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          nota.destacada ? 'text-amber-400 bg-amber-400/10' : 'text-[#AA9E80] hover:text-amber-400'
                        }`}
                        title={nota.destacada ? "Desmarcar destacada" : "Marcar como destacada"}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                      <span className="text-[10px] font-mono text-[#AA9E80] font-bold">{fechaStr}</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-black text-[#FBF8F2] tracking-wide flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#C6A466] shrink-0" />
                    <span className="truncate">{nota.titulo}</span>
                  </h4>

                  <p className="text-xs font-semibold text-[#AA9E80] leading-relaxed whitespace-pre-wrap line-clamp-4">
                    {nota.contenido}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#424246] flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#C6A466]">PIN: {currentPin}</span>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => abrirModalEditar(nota)}
                      className="px-2.5 py-1 bg-[#2B2B2E] hover:bg-[#424246] text-[#FBF8F2] border border-[#424246] text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                      title="Editar nota"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#C6A466]" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminarNota(nota.id)}
                      className="px-2.5 py-1 bg-[#2B2B2E] hover:bg-rose-950/40 text-rose-400 border border-[#424246] hover:border-rose-500/40 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                      title="Eliminar nota"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Crear/Editar Nota Privada */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
          <div className="bg-[#2B2B2E] border border-[#C6A466] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto text-[#FBF8F2]">
            
            {/* Modal Header */}
            <div className="bg-[#2D2D30] px-6 py-4 border-b border-[#424246] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#C6A466]/20 border border-[#C6A466]/40 text-[#C6A466]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-black uppercase text-[#FBF8F2]">
                    {notaEditando ? 'Editar Nota Privada' : 'Nueva Nota Privada'}
                  </h3>
                  <span className="text-xs font-bold text-[#AA9E80]">
                    Protegida por PIN: <strong className="text-[#C6A466]">{currentPin}</strong> ({currentNombre})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="p-1.5 rounded-xl text-[#AA9E80] hover:text-white hover:bg-[#424246] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleGuardarNota} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-black uppercase text-[#AA9E80] mb-1">
                  Título de la Nota:
                </label>
                <input
                  type="text"
                  required
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder="Ej: Recordatorio de ensayo de encogimiento muestra #105"
                  className="w-full px-3.5 py-2.5 bg-[#2D2D30] border border-[#424246] rounded-xl text-xs sm:text-sm font-bold text-[#FBF8F2] focus:outline-none focus:border-[#C6A466]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#AA9E80] mb-1">
                  Categoría de la Nota:
                </label>
                <select
                  value={formCategoria}
                  onChange={(e) => setFormCategoria(e.target.value as NotaPrivada['categoria'])}
                  className="w-full px-3.5 py-2.5 bg-[#2D2D30] border border-[#424246] rounded-xl text-xs sm:text-sm font-bold text-[#FBF8F2] focus:outline-none focus:border-[#C6A466]"
                >
                  <option value="laboratorio">🧪 Laboratorio</option>
                  <option value="compras">🛍️ Compras</option>
                  <option value="patronaje">📏 Patronaje</option>
                  <option value="corte">✂️ Corte</option>
                  <option value="urgente">⚠️ Urgente</option>
                  <option value="personal">👤 Personal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#AA9E80] mb-1">
                  Contenido de la Nota:
                </label>
                <textarea
                  required
                  rows={4}
                  value={formContenido}
                  onChange={(e) => setFormContenido(e.target.value)}
                  placeholder="Escribe tus observaciones privadas, pendientes o datos técnicos..."
                  className="w-full px-3.5 py-2.5 bg-[#2D2D30] border border-[#424246] rounded-xl text-xs sm:text-sm font-bold text-[#FBF8F2] focus:outline-none focus:border-[#C6A466] resize-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="chkDestacada"
                  checked={formDestacada}
                  onChange={(e) => setFormDestacada(e.target.checked)}
                  className="w-4 h-4 rounded text-[#C6A466] focus:ring-0 bg-[#2D2D30] border-[#424246] cursor-pointer"
                />
                <label htmlFor="chkDestacada" className="text-xs font-bold text-[#FBF8F2] select-none cursor-pointer flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  Marcar como Nota Destacada / Importante
                </label>
              </div>

              <div className="pt-4 border-t border-[#424246] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 bg-[#2D2D30] hover:bg-[#38383B] text-[#AA9E80] font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C6A466] hover:bg-[#D6CDB8] text-[#1E1E21] font-black text-xs rounded-xl cursor-pointer shadow flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Guardar Nota Privada</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
