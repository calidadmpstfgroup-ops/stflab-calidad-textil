import React, { useState, useEffect } from 'react';
import { 
  Building, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  Lock, 
  ExternalLink,
  Info,
  Clock
} from 'lucide-react';
import { SolicitudProveedor, DatosProveedorFormulario } from '../../types';
import { dbGetSolicitudByToken, dbUpdateSolicitudProveedor } from '../../services/firebase';
import PortalProveedorFormulario from './PortalProveedorFormulario';

export interface PortalProveedorViewProps {
  token: string;
  currentUser?: string;
  onVolver?: () => void;
  onFinalizado?: () => void;
}

export function PortalProveedorView({
  token,
  currentUser,
  onVolver,
  onFinalizado
}: PortalProveedorViewProps) {
  const [solicitud, setSolicitud] = useState<SolicitudProveedor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<DatosProveedorFormulario | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSolicitud() {
      setLoading(true);
      try {
        const found = await dbGetSolicitudByToken(token);
        if (isMounted) {
          if (found) {
            setSolicitud(found);
          } else {
            setSolicitud({
              id: `sol-${token}`,
              token,
              proveedor: 'Proveedor Textil',
              referencia: 'REF-DEMO-001',
              nombreTela: 'Tela de Prueba',
              color: 'ESTÁNDAR',
              estado: 'enviado',
              fechaCreacion: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.warn("Error cargando solicitud de proveedor por token:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (token) {
      loadSolicitud();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmitFormulario = async (
    data: DatosProveedorFormulario,
    archivo?: { nombre: string; tipo: string; tamano: number; urlOData: string }
  ) => {
    const today = new Date().toISOString();
    const updatePayload: Partial<SolicitudProveedor> = {
      estado: 'recibido',
      fechaRecepcion: today,
      datosProveedor: data
    };

    if (archivo) {
      updatePayload.documentoOriginal = {
        nombre: archivo.nombre,
        tipo: archivo.tipo,
        tamano: archivo.tamano,
        urlOData: archivo.urlOData
      };
    }

    const targetId = solicitud?.id || token;
    try {
      await dbUpdateSolicitudProveedor(targetId, updatePayload);
    } catch (err) {
      console.warn("Firestore update error in PortalProveedorView:", err);
    }

    setSubmittedData(data);
    setIsSubmittedSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 shadow-xl px-4 sm:px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg">
            STF
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Portal de Proveedores Textiles
            </h1>
            <p className="text-[10px] text-slate-400">
              Homologación de Fichas Técnicas & Control de Calidad STF Group
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-950 border border-amber-500/30 px-3 py-1 rounded-xl font-mono text-xs text-amber-400 font-bold">
            #{token}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl w-full mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
            <Sparkles className="h-8 w-8 text-amber-400 animate-spin" />
            <p className="text-sm font-medium text-slate-300">Cargando datos de la solicitud...</p>
          </div>
        ) : (
          <PortalProveedorFormulario
            token={token}
            referenciaDefault={solicitud?.referencia || ''}
            nombreTelaDefault={solicitud?.nombreTela || ''}
            proveedorDefault={solicitud?.proveedor || ''}
            colorDefault={solicitud?.color || ''}
            initialData={(solicitud?.datosProveedor as any) || {}}
            isStandalone={true}
            onSubmit={handleSubmitFormulario}
            onCancel={onVolver}
          />
        )}
      </main>
    </div>
  );
}

export default PortalProveedorView;
