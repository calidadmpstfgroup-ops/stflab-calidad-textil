import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QualityProvider, useQuality } from './context/QualityContext';
import { LoginView } from './components/auth/LoginView';
import { Navbar } from './components/layout/Navbar';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { AreaSelectorModal } from './components/layout/AreaSelectorModal';
import { KpiCards } from './components/dashboard/KpiCards';
import { FiltersBar } from './components/dashboard/FiltersBar';
import { TraceabilityTable } from './components/dashboard/TraceabilityTable';
import { InventarioDosColumnas } from './components/dashboard/InventarioDosColumnas';
import { KanbanFlujoDashboard } from './components/dashboard/KanbanFlujoDashboard';
import { ChartsSection } from './components/dashboard/ChartsSection';
import { LeadTimeAlertModal } from './components/dashboard/LeadTimeAlertModal';
import { TechnicalSheetModal } from './components/technical-sheet/TechnicalSheetModal';
import { NewSampleModal } from './components/common/NewSampleModal';
import { BulkImportModal } from './components/common/BulkImportModal';
import { NotificationToastContainer } from './components/common/NotificationToastContainer';
import { PapeleraReciclajeModal } from './components/common/PapeleraReciclajeModal';
import { ExploradorFichasModal } from './components/fichas-tecnicas/ExploradorFichasModal';
import { PortalProveedorModal } from './components/portal-proveedor/PortalProveedorModal';
import { AsistenteIAModal } from './components/ai-assistant/AsistenteIAModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { LaboratorioView } from './components/areas/LaboratorioView';
import { ComprasView } from './components/areas/ComprasView';
import { PatronajeView } from './components/areas/PatronajeView';
import { CorteView } from './components/areas/CorteView';
import { HomologacionView } from './components/homologacion/HomologacionView';
import { ComprasDecisionView } from './components/areas/ComprasDecisionView';
import { BibliotecaView } from './components/areas/BibliotecaView';
import { ChatView } from './components/areas/ChatView';
import { ConfiguracionView } from './components/areas/ConfiguracionView';
import { DocumentosView } from './components/areas/DocumentosView';
import { CentroMonitoreoView } from './components/areas/CentroMonitoreoView';
import { UserRole, AreaType } from './types';
import { sincronizarSesionUsuarioActual, mapearAreaAModulo } from './services/monitoringService';

const MainContent: React.FC = () => {
  const { areaActual } = useQuality();

  return (
    <main className="w-full max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 transition-all font-sans">
      
      {/* Vistas Dinámicas según el Área Seleccionada */}
      {(areaActual === 'dashboard' || areaActual === 'indicadores') && <DashboardView />}

      {areaActual === 'homologacion' && <HomologacionView />}
      {areaActual === 'laboratorio' && <LaboratorioView />}
      {areaActual === 'compras' && <ComprasView />}
      {areaActual === 'compras-decision' && <ComprasDecisionView />}
      {areaActual === 'patronaje' && <PatronajeView />}
      {areaActual === 'corte' && <CorteView />}
      {areaActual === 'biblioteca' && <BibliotecaView />}
      {areaActual === 'chat' && <ChatView />}
      {areaActual === 'configuracion' && <ConfiguracionView />}
      {areaActual === 'documentos' && <DocumentosView />}
      {areaActual === 'soporte-tecnico' && <CentroMonitoreoView />}

      {/* Modales Globales */}
      <AreaSelectorModal />
      <LeadTimeAlertModal />
      <TechnicalSheetModal />
      <NewSampleModal />
      <BulkImportModal />
      <NotificationToastContainer />
      <PapeleraReciclajeModal />

    </main>
  );
};

const MainAppShell: React.FC = () => {
  const { usuario } = useAuth();
  const { areaActual, setAreaActual } = useQuality();
  const [modalBaseFTAbierto, setModalBaseFTAbierto] = useState(false);
  const [modalPortalTokenAbierto, setModalPortalTokenAbierto] = useState(false);

  // Redireccionar al área correspondiente según el usuario que inició sesión
  React.useEffect(() => {
    if (usuario) {
      const areaViewMapping: Record<string, AreaType> = {
        laboratorio: 'laboratorio',
        compras: 'compras',
        patronaje: 'patronaje',
        corte: 'corte',
        colecciones: 'compras',
        calidad: 'dashboard',
        dashboard: 'dashboard',
        admin: 'dashboard',
        proveedor: 'portal-proveedor',
        'soporte-tecnico': 'soporte-tecnico',
        'soporte_tecnico': 'soporte-tecnico',
        soporte: 'soporte-tecnico'
      };

      const keyArea = (usuario.areaAsignada || (usuario.role ? usuario.role.toLowerCase() : 'dashboard')).toLowerCase();
      const areaDestino = areaViewMapping[keyArea] || 'dashboard';
      setAreaActual(areaDestino);
    }
  }, [usuario?.uid]);

  // Sincronizar en tiempo real la sesión del usuario conectado real en el Centro de Monitoreo
  React.useEffect(() => {
    if (usuario && areaActual) {
      sincronizarSesionUsuarioActual(
        usuario,
        areaActual,
        areaActual === 'soporte-tecnico'
          ? 'Supervisión en Centro de Monitoreo'
          : `Consultó módulo ${mapearAreaAModulo(areaActual)}`
      );
    }
  }, [usuario, areaActual]);

  // Si no hay usuario autenticado, muestra el Panel de Acceso Obligatorio con Usuario y Contraseña
  if (!usuario) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] dark:bg-[#080e1e] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200 font-sans">
      <div>
        <Navbar 
          onAbrirBaseFT={() => setModalBaseFTAbierto(true)}
          onAbrirPortalToken={() => setModalPortalTokenAbierto(true)}
        />
        <LeftSidebar 
          onAbrirBaseFT={() => setModalBaseFTAbierto(true)}
          onAbrirPortalToken={() => setModalPortalTokenAbierto(true)}
        />
        <MainContent />
      </div>

      {/* Footer Institucional */}
      <footer className="bg-white dark:bg-[#0b1329] border-t border-slate-200 dark:border-[#17254e] py-6 mt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00b4d8] animate-pulse"></span>
            <span className="font-bold text-slate-900 dark:text-slate-100 font-display">
              STFLab 2.0 • Ecosistema de Calidad Textil & Confección (8 Fases)
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            <span>Normas: AATCC 135 • AATCC 179 • ASTM D3776 • ASTM D2061 • ISO 105 • NTC 228</span>
            <span>•</span>
            <span>STF Group S.A.</span>
          </div>
        </div>
      </footer>

      {/* Modales Compartidos & Asistente Flotante */}
      <AsistenteIAModal />
      {modalBaseFTAbierto && (
        <ExploradorFichasModal abierto={true} onCerrar={() => setModalBaseFTAbierto(false)} />
      )}
      {modalPortalTokenAbierto && (
        <PortalProveedorModal abierto={true} onCerrar={() => setModalPortalTokenAbierto(false)} />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <QualityProvider>
            <MainAppShell />
          </QualityProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
