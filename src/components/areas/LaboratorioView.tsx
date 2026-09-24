import React, { useState, useMemo } from 'react';
import { useQuality } from '../../context/QualityContext';
import { SolicitudTelasCompleta, ItemMuestraTela, FichaTecnicaHistoricaVersionada, VersionFichaTecnica } from '../../types';

import { LaboratorioHeader } from '../laboratorio/LaboratorioHeader';
import { SolicitudesTelasTable } from '../laboratorio/SolicitudesTelasTable';
import { DetalleSolicitudTela } from '../laboratorio/DetalleSolicitudTela';
import { BuscarFichaLaboratorioModal } from '../laboratorio/BuscarFichaLaboratorioModal';
import { LaboratorioAccesorios } from '../laboratorio/LaboratorioAccesorios';
import { HistorialLaboratorio } from '../laboratorio/HistorialLaboratorio';
import { EvaluacionForrosCosturasView } from '../laboratorio/EvaluacionForrosCosturasView';

import { Sparkles, Bot } from 'lucide-react';

export const LaboratorioView: React.FC = () => {
  const {
    solicitudesTelas,
    actualizarItemTelaLab,
    responderSolicitudTelas,
    solicitudesAccesorios,
    actualizarItemAccesorioLab,
    responderSolicitudAccesorios,
    fichasTecnicasHistorial,
    consultarFichaTecnicaHistorica
  } = useQuality();

  // Pestaña activa principal: Telas | Accesorios | Forros & Costuras | Historial
  const [tabActiva, setTabActiva] = useState<'telas' | 'accesorios' | 'forros-costuras' | 'historial'>('telas');

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
      />

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

      {/* FLOATING IA ASSISTANT WIDGET */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => alert('🤖 ASISTENTE IA STFGROUP LAB:\n\nDiagnóstico de Ensayos Técnicos:\n• Recuerda evaluar Pilling (NTC 2051), Solidez Lavado (NTC 1155), Frote Húmedo/Seco (NTC 786) y Prueba Fusionado (NTC 4873).\n• En Grupo G puedes ingresar Ancho Total y Útil Desengome.\n• Al hacer clic en "Enviar a Compras", la solicitud se moverá automáticamente al Historial.')}
          className="bg-slate-900 hover:bg-slate-800 border border-amber-400/40 text-amber-300 font-black text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
        >
          <Bot className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>🤖 ASISTENTE IA</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </button>
      </div>

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

    </div>
  );
};
