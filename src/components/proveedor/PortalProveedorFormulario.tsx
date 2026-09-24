import React, { useState } from 'react';
import { DatosProveedorFormulario, ArchivoAdjuntoProveedor } from '../../types';
import {
  FileText,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building,
  Check,
  RefreshCw,
  Info,
  X,
  FileSpreadsheet,
  Image as ImageIcon,
  Paperclip,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Award,
  Trash2,
  Mail,
  Phone,
  User,
  Globe,
  Layers,
  Palette,
  CheckSquare,
  Activity
} from 'lucide-react';

interface PortalProveedorFormularioProps {
  initialData?: Partial<DatosProveedorFormulario>;
  referenciaDefault?: string;
  nombreTelaDefault?: string;
  proveedorDefault?: string;
  colorDefault?: string;
  token?: string;
  isStandalone?: boolean;
  onSubmit: (data: DatosProveedorFormulario, file?: { nombre: string; tipo: string; tamano: number; urlOData: string }) => Promise<void> | void;
  onCancel?: () => void;
}

export default function PortalProveedorFormulario({
  initialData = {},
  referenciaDefault = '',
  nombreTelaDefault = '',
  proveedorDefault = '',
  colorDefault = '',
  token = '',
  isStandalone = false,
  onSubmit,
  onCancel
}: PortalProveedorFormularioProps) {
  const [activeTab, setActiveTab] = useState<'formulario' | 'subir_directo'>('formulario');
  const [isExtractingIA, setIsExtractingIA] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const [archivosAdjuntos, setArchivosAdjuntos] = useState<ArchivoAdjuntoProveedor[]>([]);
  const [archivoPrincipal, setArchivoPrincipal] = useState<{ nombre: string; tipo: string; tamano: number; urlOData: string } | null>(null);

  const [formData, setFormData] = useState<DatosProveedorFormulario>({
    nombreEmpresa: initialData.nombreEmpresa || proveedorDefault || '',
    contactoNombre: initialData.contactoNombre || '',
    contactoCorreo: initialData.contactoCorreo || '',
    contactoTelefono: initialData.contactoTelefono || '',
    contactoPais: initialData.contactoPais || initialData.paisOrigen || 'Colombia',

    referencia: initialData.referencia || referenciaDefault || '',
    nombreComercial: initialData.nombreComercial || initialData.nombreTela || nombreTelaDefault || '',
    nombreTela: initialData.nombreTela || nombreTelaDefault || '',
    proveedor: initialData.proveedor || proveedorDefault || '',
    composicion: initialData.composicion || '',
    tipoTejido: initialData.tipoTejido || 'TEJIDO PLANO',
    tipoLigamento: initialData.tipoLigamento || '',
    anchoUtil: initialData.anchoUtil || undefined,
    anchoTotal: initialData.anchoTotal || undefined,
    pesoGsm: initialData.pesoGsm || undefined,
    pesoMl: initialData.pesoMl || undefined,
    color: initialData.color || colorDefault || 'ESTÁNDAR',
    acabadosTextiles: initialData.acabadosTextiles || '',

    encogimientoLargo: initialData.encogimientoLargo !== undefined ? initialData.encogimientoLargo : -3.0,
    encogimientoAncho: initialData.encogimientoAncho !== undefined ? initialData.encogimientoAncho : -2.0,
    solidezLavadoCambioColor: initialData.solidezLavadoCambioColor || '4-5',
    solidezFroteSeco: initialData.solidezFroteSeco || '4',
    solidezFroteHumedo: initialData.solidezFroteHumedo || '3-4',
    elongacionAncho: initialData.elongacionAncho || undefined,
    recuperacionAncho: initialData.recuperacionAncho || undefined,
    resistenciaPilling: initialData.resistenciaPilling || '4',
    resistenciaRasgadoUrdimbre: initialData.resistenciaRasgadoUrdimbre || '',
    resistenciaRasgadoTrama: initialData.resistenciaRasgadoTrama || '',
    deslizamientoCostura: initialData.deslizamientoCostura || '',
    piernaVirada: initialData.piernaVirada !== undefined ? initialData.piernaVirada : 2.0,
    rendimiento: initialData.rendimiento || undefined,

    lavadoSugerido: initialData.lavadoSugerido || 'Lavar a máquina temperatura máx 30°C.',
    observaciones: initialData.observaciones || '',

    fechaEnvio: new Date().toISOString(),
    metodoEnvio: 'formulario_manual'
  });

  const handleInputChange = (field: keyof DatosProveedorFormulario, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberChange = (field: keyof DatosProveedorFormulario, value: string) => {
    const num = value === '' ? undefined : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      [field]: isNaN(num as number) ? undefined : num
    }));
  };

  const handleFileUploadCategoria = async (
    e: React.ChangeEvent<HTMLInputElement>,
    categoria: 'ficha_tecnica' | 'certificado' | 'fotografia' | 'otro'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      const nuevoAdjunto: ArchivoAdjuntoProveedor = {
        id: `adj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        nombre: file.name,
        tipo: file.type || 'application/octet-stream',
        tamano: file.size,
        categoria,
        urlOData: base64Data,
        fechaCarga: new Date().toISOString()
      };

      setArchivosAdjuntos(prev => [...prev, nuevoAdjunto]);

      if (categoria === 'ficha_tecnica') {
        setArchivoPrincipal({
          nombre: file.name,
          tipo: file.type || 'application/octet-stream',
          tamano: file.size,
          urlOData: base64Data
        });
        setAiMessage('✨ Ficha técnica adjuntada y lista para homologación.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEnviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: DatosProveedorFormulario = {
        ...formData,
        referencia: formData.referencia || referenciaDefault || 'REFERENCIA PROVEEDOR',
        nombreTela: formData.nombreComercial || formData.nombreTela || nombreTelaDefault || formData.referencia || 'TELA',
        proveedor: formData.nombreEmpresa || formData.proveedor || proveedorDefault || 'PROVEEDOR TEXTIL',
        color: formData.color || colorDefault || 'ESTÁNDAR',
        archivosAdjuntos: archivosAdjuntos,
        fechaEnvio: new Date().toISOString(),
        metodoEnvio: archivosAdjuntos.length > 0 ? 'ambos' : 'formulario_manual'
      };

      await onSubmit(payload, archivoPrincipal || undefined);
      setIsSubmittedSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmittedSuccess) {
    return (
      <div className={`bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl p-8 text-center animate-fade-in ${isStandalone ? 'max-w-2xl mx-auto my-12' : 'w-full'}`}>
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          ¡Información Recibida en STF Group!
        </h2>
        <p className="text-slate-400 text-xs mt-2 max-w-md mx-auto">
          Hemos recibido exitosamente los datos técnicos para la referencia <strong className="text-amber-400">{formData.referencia || referenciaDefault}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden ${isStandalone ? 'max-w-4xl mx-auto my-6' : 'w-full'}`}>
      
      {/* Header Banner */}
      <div className="bg-slate-950 p-6 text-white border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>STF Group • Portal de Proveedores</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Ficha Técnica Solicitada: {formData.referencia || referenciaDefault}
          </h1>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-slate-400 hover:text-white p-2">
            ✕
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleEnviarFormulario} className="p-6 sm:p-8 space-y-6 text-xs">
        
        {/* 1. Proveedor */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-amber-400 uppercase tracking-wider">1. Información del Proveedor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Nombre Empresa *</label>
              <input
                type="text"
                required
                value={formData.nombreEmpresa || formData.proveedor}
                onChange={(e) => {
                  handleInputChange('nombreEmpresa', e.target.value);
                  handleInputChange('proveedor', e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Contacto</label>
              <input
                type="text"
                value={formData.contactoNombre || ''}
                onChange={(e) => handleInputChange('contactoNombre', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Email</label>
              <input
                type="email"
                value={formData.contactoCorreo || ''}
                onChange={(e) => handleInputChange('contactoCorreo', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* 2. Tela */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-amber-400 uppercase tracking-wider">2. Información de la Tela</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Referencia *</label>
              <input
                type="text"
                required
                value={formData.referencia}
                onChange={(e) => handleInputChange('referencia', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Composición *</label>
              <input
                type="text"
                required
                value={formData.composicion}
                onChange={(e) => handleInputChange('composicion', e.target.value)}
                placeholder="100% Algodón"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Ancho Útil (m) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.anchoUtil || ''}
                onChange={(e) => handleNumberChange('anchoUtil', e.target.value)}
                placeholder="1.48"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Gramaje (g/m²) *</label>
              <input
                type="number"
                step="1"
                required
                value={formData.pesoGsm || ''}
                onChange={(e) => handleNumberChange('pesoGsm', e.target.value)}
                placeholder="240"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold uppercase"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Tipo Tejido</label>
              <select
                value={formData.tipoTejido || 'TEJIDO PLANO'}
                onChange={(e) => handleInputChange('tipoTejido', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
              >
                <option value="TEJIDO PLANO">TEJIDO PLANO</option>
                <option value="TEJIDO PUNTO">TEJIDO PUNTO</option>
                <option value="DENIM / INDIGO">DENIM / ÍNDIGO</option>
                <option value="NO TEJIDO">NO TEJIDO</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Características Técnicas */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-amber-400 uppercase tracking-wider">3. Características Técnicas & Ensayos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Enc. Largo (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.encogimientoLargo ?? ''}
                onChange={(e) => handleNumberChange('encogimientoLargo', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Enc. Ancho (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.encogimientoAncho ?? ''}
                onChange={(e) => handleNumberChange('encogimientoAncho', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Solidez Lavado</label>
              <input
                type="text"
                value={formData.solidezLavadoCambioColor || ''}
                onChange={(e) => handleInputChange('solidezLavadoCambioColor', e.target.value)}
                placeholder="4-5"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Solidez Frote</label>
              <input
                type="text"
                value={formData.solidezFroteSeco || ''}
                onChange={(e) => handleInputChange('solidezFroteSeco', e.target.value)}
                placeholder="4"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* 4. Adjuntos */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-amber-400 uppercase tracking-wider">4. Adjuntar Documentación Oficial (PDF/Excel)</h3>
          <label className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-4 py-2 rounded-xl font-bold text-xs cursor-pointer">
            <Paperclip className="h-4 w-4" />
            <span>Subir Archivo de Ficha Técnica</span>
            <input
              type="file"
              accept=".pdf,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => handleFileUploadCategoria(e, 'ficha_tecnica')}
            />
          </label>
          {aiMessage && <p className="text-xs text-emerald-400">{aiMessage}</p>}
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center space-x-2 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>{isSubmitting ? 'Enviando...' : 'Enviar Información a STF Group'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
