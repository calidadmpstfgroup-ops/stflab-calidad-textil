import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useLanguage } from '../../context/LanguageContext';
import { MuestraTextil, DictamenType } from '../../types';
import { 
  Layers, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  FileText, 
  Building2,
  ChevronRight,
  Sparkles,
  Tag,
  Scissors
} from 'lucide-react';

export const InventarioDosColumnas: React.FC = () => {
  const { muestras, setMuestraSeleccionada, setModalFichaAbierto, solicitudesAccesorios } = useQuality();
  const { t } = useLanguage();
  const [busqueda, setBusqueda] = useState('');

  // Separar muestras en Telas vs. Insumos/Accesorios
  const muestrasTelas = muestras.filter(m => {
    const esTela = m.tipoMaterial !== 'Insumo / Accesorio';
    if (!esTela) return false;
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (m.codigoMT || '').toLowerCase().includes(q) ||
           (m.referencia || '').toLowerCase().includes(q) ||
           (m.proveedor || '').toLowerCase().includes(q);
  });

  const muestrasInsumos = muestras.filter(m => {
    const esInsumo = m.tipoMaterial === 'Insumo / Accesorio';
    if (!esInsumo) return false;
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (m.codigoMT || '').toLowerCase().includes(q) ||
           (m.referencia || '').toLowerCase().includes(q) ||
           (m.proveedor || '').toLowerCase().includes(q);
  });

  // Extraer también de solicitudes de accesorios mock
  const accesoriosItemsExtra = solicitudesAccesorios.flatMap(s => s.muestras || []);

  const getBadgeDictamen = (dictamen: DictamenType | string) => {
    const d = (dictamen || 'PENDIENTE').toUpperCase();
    if (d === 'APROBADO') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 font-mono">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Aprobado
        </span>
      );
    }
    if (d === 'HALLAZGO') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 font-mono">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Hallazgo
        </span>
      );
    }
    if (d === 'RECHAZADO') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 font-mono">
          <XCircle className="w-3 h-3 text-rose-600" />
          Rechazado
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#2B2B2E] text-[#AA9E80] border border-[#424246] flex items-center gap-1 font-mono">
        <Clock className="w-3 h-3 text-[#C6A466]" />
        En Proceso
      </span>
    );
  };

  const handleVerDetalleMuestra = (m: MuestraTextil) => {
    setMuestraSeleccionada(m);
    setModalFichaAbierto(true);
  };

  return (
    <div className="bg-[#2D2D30] border border-[#424246] rounded-3xl p-6 shadow-sm space-y-6 font-sans select-none animate-fade-in">
      
      {/* Encabezado del Inventario de Ensayos */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#424246] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2B2B2E] text-[#C6A466] border border-[#C6A466]/40 flex items-center justify-center shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#FBF8F2] font-serif tracking-wide">
              {t('Inventario de Ensayos Realizados — Módulo Dos Columnas', 'Tested Inventory — Two Columns Module')}
            </h3>
            <p className="text-xs text-[#AA9E80] font-medium">
              {t('Clasificación independiente de evaluaciones técnicas en Telas e Insumos / Accesorios', 'Independent classification of technical evaluations in Fabrics and Accessories')}
            </p>
          </div>
        </div>

        {/* Buscador Rápido */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-[#AA9E80] absolute left-3 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={t('Buscar por código, referencia o proveedor...', 'Search by code, ref or supplier...')}
            className="w-full bg-[#2B2B2E] border border-[#424246] rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-[#FBF8F2] placeholder-[#AA9E80]/70 focus:border-[#C6A466] outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Grid en Dos Columnas (Col 1: Telas | Col 2: Insumos) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUMNA 1: ENSAYOS EN TELAS */}
        <div className="bg-[#2B2B2E] border border-[#424246] rounded-2xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#424246] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#C6A466]"></span>
              <h4 className="font-extrabold text-xs text-[#FBF8F2] uppercase tracking-wider font-mono">
                🧵 {t('Columna 1: Ensayos en Telas (Planas, Punto, Denim)', 'Column 1: Fabric Tests')}
              </h4>
            </div>
            <span className="px-2.5 py-0.5 bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/40 rounded-full text-[10px] font-black font-mono">
              {muestrasTelas.length} {t('Telas', 'Fabrics')}
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-vertical-scroll pr-1">
            {muestrasTelas.length === 0 ? (
              <div className="p-8 text-center bg-[#2D2D30] rounded-xl border border-dashed border-[#424246] text-xs text-[#AA9E80]">
                {t('No se encontraron ensayos de telas registrados.', 'No fabric tests recorded.')}
              </div>
            ) : (
              muestrasTelas.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleVerDetalleMuestra(m)}
                  className="bg-[#2D2D30] border border-[#424246] hover:border-[#C6A466] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#2B2B2E] text-[#C6A466] text-[9px] font-black font-mono rounded-md border border-[#424246]">
                          {m.codigoMT || m.id}
                        </span>
                        <span className="text-[10px] text-[#AA9E80] font-bold uppercase tracking-wider">
                          {m.tipoMaterial}
                        </span>
                      </div>
                      <strong className="text-sm font-black text-[#FBF8F2] block mt-1 group-hover:text-[#C6A466] transition-colors">
                        {m.referencia}
                      </strong>
                    </div>

                    {getBadgeDictamen(m.dictamenFinal)}
                  </div>

                  {/* Ficha técnica compacta de la Tela */}
                  <div className="grid grid-cols-2 gap-2 bg-[#2B2B2E] p-2.5 rounded-xl border border-[#424246] text-[11px] text-[#AA9E80] font-mono">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#AA9E80]/70 block font-sans">{t('Proveedor:', 'Supplier:')}</span>
                      <strong className="text-[#C6A466] truncate block">{m.proveedor}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#AA9E80]/70 block font-sans">{t('Gramaje GSM:', 'GSM Weight:')}</span>
                      <strong className="text-[#FBF8F2] block">
                        {m.ensayos?.gramajeGsm?.valor || m.fichaProveedor?.gramajeGsm || 'N/A'} g/m²
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#AA9E80]/70 block font-sans">{t('Encogimiento Urdimbre:', 'Warp Shrinkage:')}</span>
                      <strong className="text-[#FBF8F2] block">
                        {m.ensayos?.encogimientoLargo?.valor ? `${m.ensayos.encogimientoLargo.valor}%` : 'N/A'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#AA9E80]/70 block font-sans">{t('Encogimiento Trama:', 'Weft Shrinkage:')}</span>
                      <strong className="text-[#FBF8F2] block">
                        {m.ensayos?.encogimientoAncho?.valor ? `${m.ensayos.encogimientoAncho.valor}%` : 'N/A'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#AA9E80] pt-1">
                    <span className="font-mono">{t('Fecha Ingreso:', 'Entry Date:')} {m.fechaIngreso}</span>
                    <span className="text-[#C6A466] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      {t('Ver Reporte', 'View Report')} <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA 2: ENSAYOS EN INSUMOS Y ACCESORIOS */}
        <div className="bg-[#2B2B2E] border border-[#424246] rounded-2xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#424246] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#C6A466]"></span>
              <h4 className="font-extrabold text-xs text-[#FBF8F2] uppercase tracking-wider font-mono">
                🔩 {t('Columna 2: Ensayos en Insumos y Accesorios', 'Column 2: Accessories Tests')}
              </h4>
            </div>
            <span className="px-2.5 py-0.5 bg-[#C6A466]/20 text-[#C6A466] border border-[#C6A466]/40 rounded-full text-[10px] font-black font-mono">
              {muestrasInsumos.length + accesoriosItemsExtra.length} {t('Insumos', 'Items')}
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-vertical-scroll pr-1">
            {muestrasInsumos.length === 0 && accesoriosItemsExtra.length === 0 ? (
              <div className="p-8 text-center bg-[#2D2D30] rounded-xl border border-dashed border-[#424246] text-xs text-[#AA9E80]">
                {t('No se encontraron ensayos de insumos registrados.', 'No accessories tests recorded.')}
              </div>
            ) : (
              <>
                {muestrasInsumos.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleVerDetalleMuestra(m)}
                    className="bg-[#2D2D30] border border-[#424246] hover:border-[#C6A466] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#2B2B2E] text-[#C6A466] text-[9px] font-black font-mono rounded-md border border-[#424246]">
                            {m.codigoMT || m.id}
                          </span>
                          <span className="text-[10px] text-[#AA9E80] font-bold uppercase tracking-wider">
                            {m.ensayos?.accesorios?.tipoAccesorio || 'Insumo Metal / Plástico'}
                          </span>
                        </div>
                        <strong className="text-sm font-black text-[#FBF8F2] block mt-1 group-hover:text-[#C6A466] transition-colors">
                          {m.referencia}
                        </strong>
                      </div>

                      {getBadgeDictamen(m.dictamenFinal)}
                    </div>

                    {/* Especificaciones compactas del Insumo */}
                    <div className="grid grid-cols-2 gap-2 bg-[#2B2B2E] p-2.5 rounded-xl border border-[#424246] text-[11px] text-[#AA9E80] font-mono">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#AA9E80]/70 block font-sans">{t('Proveedor:', 'Supplier:')}</span>
                        <strong className="text-[#C6A466] truncate block">{m.proveedor}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#AA9E80]/70 block font-sans">{t('Prueba Tracción / Cierre:', 'Tension Test:')}</span>
                        <strong className="text-[#FBF8F2] block">
                          {m.ensayos?.accesorios?.resistenciaCremalleraN?.valor ? `${m.ensayos.accesorios.resistenciaCremalleraN.valor} N` : 
                           m.ensayos?.accesorios?.traccionBotonN?.valor ? `${m.ensayos.accesorios.traccionBotonN.valor} N` : 'NTC Conforme'}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#AA9E80] pt-1">
                      <span className="font-mono">{t('Fecha Ingreso:', 'Entry Date:')} {m.fechaIngreso}</span>
                      <span className="text-[#C6A466] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        {t('Ver Reporte Insumo', 'View Accessories Report')} <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}

                {/* Items extra importados de accesorios */}
                {accesoriosItemsExtra.map((acc, idx) => (
                  <div
                    key={`acc-extra-${idx}`}
                    className="bg-[#2D2D30] border border-[#424246] rounded-2xl p-4 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 bg-[#2B2B2E] text-[#C6A466] text-[9px] font-black font-mono rounded-md border border-[#424246]">
                          REF: {acc.referencia}
                        </span>
                        <strong className="text-xs font-black text-[#FBF8F2] block mt-1">
                          {acc.descripcionInsumo || 'Insumo de Confección'}
                        </strong>
                      </div>
                      {getBadgeDictamen(acc.dictamen)}
                    </div>
                    {acc.resultado && (
                      <p className="text-[11px] text-[#AA9E80] font-mono bg-[#2B2B2E] p-2 rounded-lg border border-[#424246]">
                        {acc.resultado}
                      </p>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
