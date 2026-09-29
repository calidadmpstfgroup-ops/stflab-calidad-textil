import React, { useState, useMemo, useEffect } from 'react';
import { useQuality } from '../../context/QualityContext';
import { SolicitudTelasCompleta, ItemMuestraTela, FichaTecnicaHistoricaVersionada, VersionFichaTecnica } from '../../types';

import { LaboratorioHeader } from '../laboratorio/LaboratorioHeader';
import { SolicitudesTelasTable } from '../laboratorio/SolicitudesTelasTable';
import { DetalleSolicitudTela } from '../laboratorio/DetalleSolicitudTela';
import { BuscarFichaLaboratorioModal } from '../laboratorio/BuscarFichaLaboratorioModal';
import { LaboratorioAccesorios } from '../laboratorio/LaboratorioAccesorios';
import { HistorialLaboratorio } from '../laboratorio/HistorialLaboratorio';
import { EvaluacionForrosCosturasView } from '../laboratorio/EvaluacionForrosCosturasView';
import { CalculadoraLaboratorioModal } from '../laboratorio/CalculadoraLaboratorioModal';
import { Sparkles } from 'lucide-react';


export const LaboratorioView: React.FC = () => {
  const {
    solicitudesTelas,
    actualizarItemTelaLab,
    responderSolicitudTelas,
    solicitudesAccesorios,
    actualizarItemAccesorioLab,
    responderSolicitudAccesorios,
    fichasTecnicasHistorial,
    consultarFichaTecnicaHistorica,
    subseccionLaboratorio,
    setSubseccionLaboratorio,
    pendientesLabTelas,
    pendientesLabInsumos
  } = useQuality();

  // Pestaña activa principal: Telas | Accesorios | Forros & Costuras | Historial (sincronizada con QualityContext)
  const tabActiva = subseccionLaboratorio || 'telas';
  const setTabActiva = (tab: 'telas' | 'accesorios' | 'forros-costuras' | 'historial') => {
    setSubseccionLaboratorio(tab);
    setTelaSeleccionada(null);
  };

  // Muestra de tela seleccionada para ver detalle y evaluar
  const [telaSeleccionada, setTelaSeleccionada] = useState<{
    solicitud: SolicitudTelasCompleta;
    tela: ItemMuestraTela;
  } | null>(null);

  // Ficha técnica vinculada a la evaluación en curso
  const [fichaAplicada, setFichaAplicada] = useState<{
    ficha: FichaTecnicaHistoricaVersionada;
    version: VersionFichaTecnica;
  } | null>(null);

  // Modal de búsqueda de Ficha Técnica
  const [modalBuscarFichaAbierto, setModalBuscarFichaAbierto] = useState(false);

  // Modal de Calculadora Técnica de Laboratorio
  const [modalCalculadoraAbierto, setModalCalculadoraAbierto] = useState(false);

  // Event listener global para abrir la calculadora desde cualquier parte
  useEffect(() => {
    const handleAbrirCalc = () => setModalCalculadoraAbierto(true);
    window.addEventListener('abrir-calculadora-lab', handleAbrirCalc);
    return () => window.removeEventListener('abrir-calculadora-lab', handleAbrirCalc);
  }, []);

  // Toast Notif
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Cálculo reactivo de estadísticas para el encabezado
  const stats = useMemo(() => {
    const todasLasTelas = (solicitudesTelas || []).flatMap(s => s.telas || []);
    const pendientes = todasLasTelas.filter(t => !t.dictamen || t.dictamen === 'PENDIENTE').length;
    const enProceso = todasLasTelas.filter(t => t.dictamen === 'EN_PROCESO').length;
    const completadas = todasLasTelas.filter(t => t.dictamen === 'APROBADO').length;
    const hallazgos = todasLasTelas.filter(t => t.dictamen === 'HALLAZGO').length;
    const rechazadas = todasLasTelas.filter(t => t.dictamen === 'RECHAZADO').length;

    return {
      totalSolicitudes: (solicitudesTelas || []).length,
      pendientes,
      enProceso,
      completadas,
      hallazgos,
      rechazadas
    };
  }, [solicitudesTelas]);

  // Manejar selección de una tela en la bandeja
  const handleSeleccionarTela = (solicitud: SolicitudTelasCompleta, tela: ItemMuestraTela) => {
    setTelaSeleccionada({ solicitud, tela });

    // Verificar si ya tiene ficha vinculada o si existe una coincidencia histórica
    if (tela.fichaTecnicaUtilizada) {
      const ftOriginal = (fichasTecnicasHistorial || []).find(f => f.id === tela.fichaTecnicaUtilizada?.id);
      const versionOriginal = ftOriginal?.historialVersiones?.find(v => v.version === tela.fichaTecnicaUtilizada?.version);
      if (ftOriginal && versionOriginal) {
        setFichaAplicada({ ficha: ftOriginal, version: versionOriginal });
      } else {
        setFichaAplicada(null);
      }
    } else {
      const matchFT = consultarFichaTecnicaHistorica(tela.referencia, tela.proveedor || solicitud.proveedor);
      if (matchFT) {
        setFichaAplicada(matchFT);
      } else {
        setFichaAplicada(null);
      }
    }
  };

  // Manejar guardado de evaluación y dictamen
  const handleGuardarEvaluacionTela = (datos: any) => {
    if (!telaSeleccionada) return;

    if (datos.enviarACompras) {
      responderSolicitudTelas(telaSeleccionada.solicitud.id, telaSeleccionada.tela.id, {
        resultadoLab: datos.resultadoTexto,
        dictamen: datos.dictamen,
        fechaIngreso: datos.fechaIngreso,
        fechaEntrega: datos.fechaEntrega,
        evaluacionTecnica: datos.evaluacionTecnica,
        fichaTecnicaUtilizada: datos.fichaUtilizada,
        responsableLab: datos.fichaUtilizada?.usuarioUso || 'Laboratorio',
        observacionesLabRespuesta: datos.evaluacionTecnica?.observacionesRecomendaciones
      });
      
      showToast(`¡Respuesta y dictamen [${datos.dictamen}] para "${telaSeleccionada.tela.referencia}" enviados a Compras! Se movió al Historial.`);
      setTelaSeleccionada(null);
      setFichaAplicada(null);
    } else {
      actualizarItemTelaLab(telaSeleccionada.solicitud.id, telaSeleccionada.tela.id, {
        resultadoLab: datos.resultadoTexto,
        dictamen: datos.dictamen,
        fechaIngreso: datos.fechaIngreso,
        fechaEntrega: datos.fechaEntrega,
        evaluacionTecnica: datos.evaluacionTecnica,
        fichaTecnicaUtilizada: datos.fichaUtilizada
      });
      showToast(`Borrador guardado para "${telaSeleccionada.tela.referencia}".`);
    }
  };

  return (
    <div className="space-y-5 font-sans bg-slate-100/60 p-2 sm:p-4 rounded-3xl min-h-screen">
      
      {/* Toast alert */}
      {toastMsg && (
        <div className="fixed top-16 right-6 z-[9999] bg-slate-900 text-amber-300 px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-2 text-xs font-bold animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Encabezado General & Resumen de Estado */}
      <LaboratorioHeader
        tabActiva={tabActiva}
        onCambiarTab={(tab) => {
          setTabActiva(tab);
          setTelaSeleccionada(null);
        }}
        stats={stats}
        dictamenActual={telaSeleccionada?.tela.dictamen || 'APROBADA'}
        onAbrirCalculadora={() => setModalCalculadoraAbierto(true)}
      />

      {/* Banner de Notificación Animada: Solicitudes de Compras - Telas */}
      {tabActiva === 'telas' && pendientesLabTelas > 0 && !telaSeleccionada && (
        <div className="bg-gradient-to-r from-blue-900/90 via-slate-900/95 to-slate-900 border border-blue-500/40 rounded-2xl p-3.5 shadow-lg flex items-center justify-between gap-3 text-white animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <div>
              <p className="text-xs font-bold text-blue-200">
                🧵 Notificación Compras - Telas: <span className="text-white font-extrabold">{pendientesLabTelas} telas pendientes de ensayo técnico</span> enviadas por Compras.
              </p>
              <p className="text-[11px] text-slate-300">Selecciona una tela para vincular ficha técnica y emitir dictamen.</p>
            </div>
          </div>
          <span className="bg-blue-600/30 text-blue-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-blue-500/30 shrink-0">
            {pendientesLabTelas} PENDIENTES
          </span>
        </div>
      )}

      {/* Banner de Notificación Animada: Solicitudes de Compras - Insumos */}
      {tabActiva === 'accesorios' && pendientesLabInsumos > 0 && (
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-slate-900 border border-amber-500/40 rounded-2xl p-3.5 shadow-lg flex items-center justify-between gap-3 text-white animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div>
              <p className="text-xs font-bold text-amber-200">
                🔩 Notificación Compras - Insumos: <span className="text-white font-extrabold">{pendientesLabInsumos} insumos pendientes de evaluación</span> enviados por Compras.
              </p>
              <p className="text-[11px] text-slate-300">Evalúa los parámetros técnicos y dictamen en la bandeja de insumos.</p>
            </div>
          </div>
          <span className="bg-amber-600/30 text-amber-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-amber-500/30 shrink-0">
            {pendientesLabInsumos} PENDIENTES
          </span>
        </div>
      )}

      {/* 2. Sección Telas */}
      {tabActiva === 'telas' && (
        <>
          {!telaSeleccionada ? (
            <SolicitudesTelasTable
              solicitudes={solicitudesTelas}
              onSeleccionarTela={handleSeleccionarTela}
              telaSeleccionadaId={undefined}
              consultarFichaHistorica={consultarFichaTecnicaHistorica}
            />
          ) : (
            <DetalleSolicitudTela
              solicitud={telaSeleccionada.solicitud}
              tela={telaSeleccionada.tela}
              onVolver={() => {
                setTelaSeleccionada(null);
                setFichaAplicada(null);
              }}
              onAbrirBuscarFicha={() => setModalBuscarFichaAbierto(true)}
              fichaAplicada={fichaAplicada}
              onDesvincularFicha={() => setFichaAplicada(null)}
              onGuardarEvaluacion={handleGuardarEvaluacionTela}
            />
          )}
        </>
      )}

      {/* 3. Sección Accesorios */}
      {tabActiva === 'accesorios' && (
        <LaboratorioAccesorios
          solicitudes={solicitudesAccesorios}
          onActualizarItem={actualizarItemAccesorioLab}
          onResponderSolicitud={responderSolicitudAccesorios}
        />
      )}

      {/* 4. Sección Forros & Costuras (Pipin vs Shipping) */}
      {tabActiva === 'forros-costuras' && (
        <EvaluacionForrosCosturasView />
      )}

      {/* 5. Sección Historial */}
      {tabActiva === 'historial' && (
        <HistorialLaboratorio
          solicitudesTelas={solicitudesTelas}
        />
      )}


      {/* Modal de Búsqueda de Ficha Técnica */}
      <BuscarFichaLaboratorioModal
        abierto={modalBuscarFichaAbierto}
        onCerrar={() => setModalBuscarFichaAbierto(false)}
        referenciaInicial={telaSeleccionada?.tela.referencia || ''}
        proveedorInicial={telaSeleccionada?.tela.proveedor || telaSeleccionada?.solicitud.proveedor || ''}
        fichasDisponibles={fichasTecnicasHistorial}
        onSeleccionarFicha={(ficha, version) => {
          setFichaAplicada({ ficha, version });
          showToast(`¡Ficha Técnica ${ficha.codigoFT} v${version.version} vinculada con éxito!`);
        }}
        onAbrirPortalToken={(proveedor) => {
          setModalBuscarFichaAbierto(false);
          showToast(`Enlace con Token generado para solicitar Ficha Técnica a ${proveedor}.`);
        }}
        onAbrirCrearFicha={() => {
          setModalBuscarFichaAbierto(false);
          showToast('Redirigiendo a creación de nueva Ficha Técnica.');
        }}
      />

      {/* Modal Calculadora Técnica de Laboratorio Textil */}
      <CalculadoraLaboratorioModal
        abierto={modalCalculadoraAbierto}
        onCerrar={() => setModalCalculadoraAbierto(false)}
        muestraInicialId={telaSeleccionada?.tela.id}
        tabInicial="gramaje"
      />

    </div>
  );
};
