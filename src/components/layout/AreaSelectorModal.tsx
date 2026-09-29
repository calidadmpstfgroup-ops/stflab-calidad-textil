import { useQuality } from '../../context/QualityContext';
import { useAuth } from '../../context/AuthContext';
import { AreaType } from '../../types';
import { 
  FlaskConical, 
  ShoppingCart, 
  Ruler, 
  Layers, 
  LayoutDashboard, 
  X, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  BookOpen,
  MessageSquare,
  BarChart3,
  FileText,
  Activity
} from 'lucide-react';
import { esUsuarioAdminOSoporte } from '../../services/monitoringService';

export const AreaSelectorModal: React.FC = () => {
  const { 
    modalSelectorAreaAbierto, 
    setModalSelectorAreaAbierto, 
    setAreaActual, 
    muestras, 
    kpis 
  } = useQuality();
  const { tieneAccesoArea, usuario } = useAuth();

  if (!modalSelectorAreaAbierto) return null;

  const areas = [
    {
      id: 'dashboard' as AreaType,
      numero: '1',
      nombre: '1. Dashboard General',
      subtitulo: 'Monitoreo de KPIs, Trazabilidad Global & Alertas',
      icono: <LayoutDashboard className="w-8 h-8 text-amber-400" />,
      bgGradient: 'from-amber-500/10 via-amber-600/5 to-slate-900',
      borderColor: 'border-amber-500/30 hover:border-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-300',
      descripcion: 'Torre de control central con conteo de muestras, tasa de conformidad (% aprobación), alertas de lead time (>48h) y exportación a Excel.',
      stats: `${kpis.totalMuestras} Lotes Totales`,
      highlight: `${kpis.porcentajeAprobacion}% Conformidad`,
    },
    {
      id: 'laboratorio' as AreaType,
      numero: '2',
      nombre: '2. Laboratorio',
      subtitulo: 'Ensayos Telas (ASTM/AATCC) & Laboratorio Insumos',
      icono: <FlaskConical className="w-8 h-8 text-purple-400" />,
      bgGradient: 'from-purple-500/10 via-purple-600/5 to-slate-900',
      borderColor: 'border-purple-500/30 hover:border-purple-400',
      badgeColor: 'bg-purple-500/20 text-purple-300',
      descripcion: 'Ensayos de gramaje, encogimientos, viro, solidez para telas, y pruebas de tracción/corrosión para botones Zamak y cremalleras.',
      stats: `${muestras.filter(m => m.trazabilidad.laboratorio.dictamen === 'APROBADO').length} Aprobadas`,
      highlight: 'Telas + Insumos',
    },
    {
      id: 'compras' as AreaType,
      numero: '3',
      nombre: '3. Compras',
      subtitulo: 'Recepción, Tokens #FT, Homologación & Decisión Comercial',
      icono: <ShoppingCart className="w-8 h-8 text-blue-400" />,
      bgGradient: 'from-blue-500/10 via-blue-600/5 to-slate-900',
      borderColor: 'border-blue-500/30 hover:border-blue-400',
      badgeColor: 'bg-blue-500/20 text-blue-300',
      descripcion: 'Ingreso de órdenes de compra, portal para fabricantes con Token, homologación técnica lado a lado y negociación comercial.',
      stats: `${muestras.length} Solicitudes`,
      highlight: 'Gestión Proveedores',
    },
    {
      id: 'patronaje' as AreaType,
      numero: '4',
      nombre: '4. Patronaje',
      subtitulo: 'Encogimiento diferencial urdimbre/trama & Calce',
      icono: <Ruler className="w-8 h-8 text-emerald-400" />,
      bgGradient: 'from-emerald-500/10 via-emerald-600/5 to-slate-900',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
      descripcion: 'Calculadora de compensación automática de moldes base (+X% largo, +Y% ancho) y verificación de calce físico.',
      stats: `${muestras.filter(m => m.trazabilidad.patronaje.dictamen === 'APROBADO').length} Moldes Listos`,
      highlight: 'Compensación de Moldería',
    },
    {
      id: 'corte' as AreaType,
      numero: '5',
      nombre: '5. Corte',
      subtitulo: 'Corte & Tendido, Reposo Textil (24-48h) & Matiz de Rollos',
      icono: <Layers className="w-8 h-8 text-orange-400" />,
      bgGradient: 'from-orange-500/10 via-orange-600/5 to-slate-900',
      borderColor: 'border-orange-500/30 hover:border-orange-400',
      badgeColor: 'bg-orange-500/20 text-orange-300',
      descripcion: 'Control de relajación textil, orillos estables, verificación de matices entre rollos y autorización formal de tendido.',
      stats: `${muestras.filter(m => m.trazabilidad.corte.dictamen === 'APROBADO').length} Cortes Liberados`,
      highlight: 'Reposo & Control Matiz',
    },
    {
      id: 'biblioteca' as AreaType,
      numero: '6',
      nombre: '6. Biblioteca FT',
      subtitulo: 'Fichas Técnicas del Fabricante & Tolerancias Maestras',
      icono: <BookOpen className="w-8 h-8 text-emerald-400" />,
      bgGradient: 'from-emerald-500/10 via-emerald-600/5 to-slate-900',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
      descripcion: 'Repositorio maestro de especificaciones declaradas por proveedores, tolerancias normativas y exportación.',
      stats: 'Base Histórica',
      highlight: '7 Secciones FT',
    },
    {
      id: 'chat' as AreaType,
      numero: '7',
      nombre: '7. Chat Inter-Áreas',
      subtitulo: 'Canales Departamentales & Coordinación en Vivo',
      icono: <MessageSquare className="w-8 h-8 text-amber-400" />,
      bgGradient: 'from-amber-500/10 via-amber-600/5 to-slate-900',
      borderColor: 'border-amber-500/30 hover:border-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-300',
      descripcion: 'Canales dedicados en tiempo real para resolver novedades de calidad, compras, moldería y corte.',
      stats: '7 Canales',
      highlight: 'Coordinación Inmediata',
    },
    {
      id: 'documentos' as AreaType,
      numero: '8',
      nombre: '8. Certificados Oficiales',
      subtitulo: 'Informes Técnicos Oficiales en PDF y XLS Excel',
      icono: <FileText className="w-8 h-8 text-yellow-400" />,
      bgGradient: 'from-yellow-500/10 via-yellow-600/5 to-slate-900',
      borderColor: 'border-yellow-500/30 hover:border-yellow-400',
      badgeColor: 'bg-yellow-500/20 text-yellow-300',
      descripcion: 'Previsualización y exportación de certificados oficiales con sellos de laboratorio y compras.',
      stats: 'PDF & Excel',
      highlight: 'Formato Oficial',
    },
    ...(esUsuarioAdminOSoporte(usuario) ? [{
      id: 'soporte-tecnico' as AreaType,
      numero: '9',
      nombre: '9. Centro de Monitoreo',
      subtitulo: 'Supervisión en Vivo, Sesiones y Auditoría de STFLAB',
      icono: <Activity className="w-8 h-8 text-cyan-400" />,
      bgGradient: 'from-cyan-500/10 via-cyan-600/5 to-slate-900',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400',
      badgeColor: 'bg-cyan-500/20 text-cyan-300',
      descripcion: 'Módulo de supervisión exclusivo para Soporte Técnico y Administradores. Monitoreo de usuarios conectados, módulos en uso, actividad reciente y trazabilidad histórica.',
      stats: 'EN VIVO',
      highlight: 'Auditoría & Diagnóstico',
    }] : []),
  ];

  const handleSeleccionarArea = (id: AreaType) => {
    if (!tieneAccesoArea(id)) {
      alert(`Acceso Restringido: Tu rol actual (${usuario?.role}) no tiene permisos para acceder a esta área.`);
      return;
    }
    setAreaActual(id);
    setModalSelectorAreaAbierto(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        
        {/* Botón cerrar */}
        <button
          onClick={() => setModalSelectorAreaAbierto(false)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4" />
            PANEL DE ACCESO POR ÁREAS OPERATIVAS
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Selecciona el Área a Ingresar
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Ingresa directamente al Dashboard o a las áreas operativas de Laboratorio, Compras, Patronaje y Corte.
          </p>
        </div>

        {/* Grid de las 6 Áreas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((area) => (
            <div
              key={area.id}
              onClick={() => handleSeleccionarArea(area.id)}
              className={`group relative flex flex-col justify-between p-5 rounded-2xl border bg-gradient-to-br ${area.bgGradient} ${area.borderColor} transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 shadow-inner group-hover:scale-105 transition-transform">
                    {area.icono}
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${area.badgeColor}`}>
                    {area.stats}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
                    {area.nombre}
                  </h3>
                </div>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">
                  {area.subtitulo}
                </p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {area.descripcion}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {area.highlight}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                  Ingresar <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Trazabilidad interdepartamental sincronizada en tiempo real.</span>
          </div>
          <button 
            onClick={() => handleSeleccionarArea('dashboard')}
            className="text-amber-400 hover:text-amber-300 font-bold underline"
          >
            Ir al Dashboard General
          </button>
        </div>

      </div>
    </div>
  );
};
