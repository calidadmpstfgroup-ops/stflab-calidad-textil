import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Layers, 
  Ruler, 
  Sparkles, 
  FlaskConical, 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  Eye, 
  FileCheck,
  AlertCircle,
  HelpCircle,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react';
import { 
  VersionFichaTecnica, 
  FichaTecnicaHistoricaVersionada, 
  ParametroTecnicoProveedor,
  DocumentosAdjuntosFichaProveedor 
} from '../../types';

interface FormularioFichaProveedorProps {
  onGuardarFicha: (nuevaFicha: FichaTecnicaHistoricaVersionada, nuevaVersion: VersionFichaTecnica) => void;
  onCancelar?: () => void;
  fichaExistenteParaVersionar?: FichaTecnicaHistoricaVersionada | null;
}

export const FormularioFichaProveedor: React.FC<FormularioFichaProveedorProps> = ({
  onGuardarFicha,
  onCancelar,
  fichaExistenteParaVersionar
}) => {
  // Pestaña o Sección Activa (1 a 7) o Modo Revisión
  const [seccionActiva, setSeccionActiva] = useState<number>(1);
  const [modoRevision, setModoRevision] = useState<boolean>(false);
  const [enviadoExitoso, setEnviadoExitoso] = useState<boolean>(false);

  // =========================================================================
  // 1. INFORMACIÓN DE CONTACTO Y EMPRESA
  // =========================================================================
  const [nombreEmpresa, setNombreEmpresa] = useState(fichaExistenteParaVersionar?.proveedor || '');
  const [contactoTecnico, setContactoTecnico] = useState(fichaExistenteParaVersionar?.contactoProveedor || '');
  const [emailContacto, setEmailContacto] = useState('');
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState('');
  const [paisEmpresa, setPaisEmpresa] = useState(fichaExistenteParaVersionar?.paisOrigen || 'Colombia');

  // =========================================================================
  // 2. TRAZABILIDAD, COMERCIAL Y ADUANAS
  // =========================================================================
  const [numeroOrdenCompraSTF, setNumeroOrdenCompraSTF] = useState('');
  const [stfPoNumber, setStfPoNumber] = useState('');
  const [fechaProduccion, setFechaProduccion] = useState(new Date().toISOString().split('T')[0]);
  const [codigoMT, setCodigoMT] = useState('');
  const [referenciaSTF, setReferenciaSTF] = useState(fichaExistenteParaVersionar?.referencia || '');
  const [referenciaProveedor, setReferenciaProveedor] = useState(fichaExistenteParaVersionar?.referenciaProveedor || '');
  const [codigoFabrica, setCodigoFabrica] = useState('');
  const [nombreComercialTela, setNombreComercialTela] = useState(fichaExistenteParaVersionar?.referencia || '');
  const [molinoFabricante, setMolinoFabricante] = useState(fichaExistenteParaVersionar?.proveedor || '');
  const [paisOrigen, setPaisOrigen] = useState(fichaExistenteParaVersionar?.paisOrigen || 'Colombia');
  const [numeroLoteProduccion, setNumeroLoteProduccion] = useState('');
  const [colorShade, setColorShade] = useState('');
  const [subpartidaArancelaria, setSubpartidaArancelaria] = useState('5407.52.00.00');
  const [aplicaCertificadoOrigen, setAplicaCertificadoOrigen] = useState<'SI' | 'NO' | 'EN_TRAMITE'>('SI');
  const [acuerdoComercial, setAcuerdoComercial] = useState('Alianza del Pacífico / Mercosur / CAN');

  // =========================================================================
  // 3. FIBRAS, HILOS Y COMPOSICIÓN
  // =========================================================================
  const [composicionPorcentual, setComposicionPorcentual] = useState('100% Poliéster');
  const [tipoFibraFilamento, setTipoFibraFilamento] = useState('Filamento Continuo');
  const [continuoDiscontinuoCortada, setContinuoDiscontinuoCortada] = useState<'Continuo' | 'Discontinuo' | 'Cortada'>('Continuo');
  const [tipoFibraTexturizado, setTipoFibraTexturizado] = useState('Texturizado DTY');
  const [tituloHiloUrdimbre, setTituloHiloUrdimbre] = useState('75D/72F');
  const [tituloHiloTrama, setTituloHiloTrama] = useState('150D/144F');
  const [sentidoTorsion, setSentidoTorsion] = useState<'S' | 'Z' | 'S+Z' | 'Sin Torsión'>('Z');
  const [mezclaIntima, setMezclaIntima] = useState('No Aplica');

  // =========================================================================
  // 4. DIMENSIONES, PESO Y RENDIMIENTO (Valor, Unidad, Tolerancia, Norma)
  // =========================================================================
  const [anchoTotal, setAnchoTotal] = useState<ParametroTecnicoProveedor<number>>({ valor: 1.50, unidad: 'm', tolerancia: '± 2 cm', norma: 'ASTM D3774' });
  const [anchoUtil, setAnchoUtil] = useState<ParametroTecnicoProveedor<number>>({ valor: 1.48, unidad: 'm', tolerancia: '± 2 cm', norma: 'ASTM D3774' });
  const [gramajeGSM, setGramajeGSM] = useState<ParametroTecnicoProveedor<number>>({ valor: 220, unidad: 'GSM (g/m²)', tolerancia: '± 5%', norma: 'ASTM D3776 / NTC 230' });
  const [pesoDenimOz, setPesoDenimOz] = useState<ParametroTecnicoProveedor<number>>({ valor: 0, unidad: 'oz/yd²', tolerancia: '± 0.5 oz', norma: 'ASTM D3776' });
  const [pesoMetroLineal, setPesoMetroLineal] = useState<ParametroTecnicoProveedor<number>>({ valor: 325, unidad: 'g/m lineal', tolerancia: '± 5%', norma: 'Calculado' });
  const [rendimientoTeorico, setRendimientoTeorico] = useState<ParametroTecnicoProveedor<number>>({ valor: 3.07, unidad: 'm/kg', tolerancia: '± 3%', norma: 'Calculado' });
  const [espesorTela, setEspesorTela] = useState<ParametroTecnicoProveedor<number>>({ valor: 0.45, unidad: 'mm', tolerancia: '± 0.05 mm', norma: 'ASTM D1777' });

  // =========================================================================
  // 5. ESTRUCTURA, CONSTRUCCIÓN Y ACABADOS
  // =========================================================================
  const [tipoTejido, setTipoTejido] = useState<'Plano' | 'Punto' | 'Índigo / Denim' | 'No Tejido'>('Plano');
  const [tipoLigamento, setTipoLigamento] = useState('Tafetán');
  const [densidadUrdimbre, setDensidadUrdimbre] = useState<ParametroTecnicoProveedor<number>>({ valor: 36, unidad: 'hilos/cm', tolerancia: '± 2', norma: 'ASTM D3775' });
  const [densidadTrama, setDensidadTrama] = useState<ParametroTecnicoProveedor<number>>({ valor: 28, unidad: 'pasadas/cm', tolerancia: '± 2', norma: 'ASTM D3775' });
  const [acabadosTextiles, setAcabadosTextiles] = useState('Sanforizado + Suavizado');
  const [acabadoColorTintoreria, setAcabadoColorTintoreria] = useState('Teñido en Pieza');

  // =========================================================================
  // 6. PARÁMETROS DE LABORATORIO, ENSAYOS FÍSICOS Y TOLERANCIAS
  // =========================================================================
  const [encogimientoLargo, setEncogimientoLargo] = useState<ParametroTecnicoProveedor<number>>({ valor: -2.0, unidad: '%', tolerancia: 'Máx. -3.0%', norma: 'AATCC 135 / ISO 6330' });
  const [encogimientoAncho, setEncogimientoAncho] = useState<ParametroTecnicoProveedor<number>>({ valor: -2.5, unidad: '%', tolerancia: 'Máx. -3.5%', norma: 'AATCC 135 / ISO 6330' });
  const [torqueViroPierna, setTorqueViroPierna] = useState<ParametroTecnicoProveedor<number>>({ valor: 1.5, unidad: '%', tolerancia: 'Máx. 2.5%', norma: 'AATCC 179' });
  const [solidezLavadoCambioColor, setSolidezLavadoCambioColor] = useState<ParametroTecnicoProveedor<number>>({ valor: 4.5, unidad: 'Escala 1-5', tolerancia: 'Mín. Grado 4.0', norma: 'AATCC 61 / ISO 105-C06' });
  const [solidezLavadoManchado, setSolidezLavadoManchado] = useState<ParametroTecnicoProveedor<number>>({ valor: 4.0, unidad: 'Escala 1-5', tolerancia: 'Mín. Grado 3.5', norma: 'AATCC 61 / ISO 105-C06' });
  const [solidezFroteSeco, setSolidezFroteSeco] = useState<ParametroTecnicoProveedor<number>>({ valor: 4.0, unidad: 'Escala 1-5', tolerancia: 'Mín. Grado 4.0', norma: 'AATCC 8 / ISO 105-X12' });
  const [solidezFroteHumedo, setSolidezFroteHumedo] = useState<ParametroTecnicoProveedor<number>>({ valor: 3.5, unidad: 'Escala 1-5', tolerancia: 'Mín. Grado 3.0', norma: 'AATCC 8 / ISO 105-X12' });
  const [elongacionLargo, setElongacionLargo] = useState<ParametroTecnicoProveedor<number>>({ valor: 4.0, unidad: '%', tolerancia: '± 1%', norma: 'ASTM D5034' });
  const [elongacionAncho, setElongacionAncho] = useState<ParametroTecnicoProveedor<number>>({ valor: 18.0, unidad: '%', tolerancia: '± 2%', norma: 'ASTM D3107' });
  const [recuperacionElasticidad, setRecuperacionElasticidad] = useState<ParametroTecnicoProveedor<number>>({ valor: 90.0, unidad: '%', tolerancia: 'Mín. 85%', norma: 'ASTM D3107' });
  const [resistenciaDesgarre, setResistenciaDesgarre] = useState<ParametroTecnicoProveedor<number>>({ valor: 1950, unidad: 'gf', tolerancia: 'Mín. 1600 gf', norma: 'ASTM D1424' });
  const [resistenciaDesgarreUrdimbre, setResistenciaDesgarreUrdimbre] = useState<ParametroTecnicoProveedor<number>>({ valor: 2100, unidad: 'gf', tolerancia: 'Mín. 1800 gf', norma: 'ASTM D1424' });
  const [resistenciaDesgarreTrama, setResistenciaDesgarreTrama] = useState<ParametroTecnicoProveedor<number>>({ valor: 1850, unidad: 'gf', tolerancia: 'Mín. 1500 gf', norma: 'ASTM D1424' });
  const [resistenciaPilling, setResistenciaPilling] = useState<ParametroTecnicoProveedor<number>>({ valor: 4.0, unidad: 'Escala 1-5', tolerancia: 'Mín. Grado 3-4', norma: 'ASTM D3512' });
  const [deslizamientoCostura, setDeslizamientoCostura] = useState<ParametroTecnicoProveedor<number>>({ valor: 3.0, unidad: 'mm', tolerancia: 'Máx. 4.0 mm', norma: 'ASTM D434' });

  // =========================================================================
  // 7. CUIDADOS, RECOMENDACIONES Y DOCUMENTACIÓN
  // =========================================================================
  const [instruccionesLavado, setInstruccionesLavado] = useState('Lavado en máquina ciclo normal máx. 40°C. No usar blanqueador clorado. Secado a la sombra.');
  const [recomendacionesPlanchado, setRecomendacionesPlanchado] = useState('Planchar a temperatura media máx. 150°C. No planchar sobre estampados.');
  const [observacionesAdvertencias, setObservacionesAdvertencias] = useState('Tela apta para confección de prendas exteriores. Probar fusión antes de corte en serie.');
  const [nombreArchivoPDF, setNombreArchivoPDF] = useState<string>('FICHA_TECNICA_FABRICANTE.pdf');
  const [nombreArchivoCertificado, setNombreArchivoCertificado] = useState<string>('CERTIFICADO_CALIDAD_OEKO_TEX.pdf');
  const [nombreFotoTela, setNombreFotoTela] = useState<string>('MUESTRA_TELA_HD.jpg');

  const secciones = [
    { id: 1, titulo: '1. Contacto y Empresa', icono: Building2 },
    { id: 2, titulo: '2. Trazabilidad y Comercial', icono: FileText },
    { id: 3, titulo: '3. Fibras y Composición', icono: Layers },
    { id: 4, titulo: '4. Dimensiones y Peso', icono: Ruler },
    { id: 5, titulo: '5. Construcción y Acabados', icono: Sparkles },
    { id: 6, titulo: '6. Parámetros de Laboratorio', icono: FlaskConical },
    { id: 7, titulo: '7. Cuidados y Documentos', icono: ShieldCheck }
  ];

  const handleSubirPDFOriginal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setNombreArchivoPDF(f.name);
    }
  };

  const handleSubirCertificado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setNombreArchivoCertificado(f.name);
    }
  };

  const handleSubirFotoTela = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setNombreFotoTela(f.name);
    }
  };

  const handleConfirmarYEnviar = () => {
    const versionNumero = fichaExistenteParaVersionar 
      ? fichaExistenteParaVersionar.versionActual + 1 
      : 1;

    const codigoFTGenerado = fichaExistenteParaVersionar?.codigoFT || `FT-PROV-${Date.now().toString().slice(-6)}`;

    const nuevaVersion: VersionFichaTecnica = {
      version: versionNumero,
      fechaVersion: new Date().toISOString().split('T')[0],
      creadoPor: contactoTecnico || nombreEmpresa || 'Proveedor',
      activo: true,
      especificaciones: {
        // 1. Contacto y Empresa
        nombreEmpresa,
        contactoTecnico,
        emailContacto,
        telefonoWhatsapp,
        paisEmpresa,

        // 2. Trazabilidad
        numeroOrdenCompraSTF,
        stfPoNumber,
        fechaProduccion,
        codigoMT: codigoMT || referenciaSTF,
        referenciaSTF: referenciaSTF || nombreComercialTela,
        referenciaProveedor,
        codigoFabrica: codigoFabrica || referenciaProveedor,
        nombreComercialTela: nombreComercialTela || referenciaSTF || referenciaProveedor,
        molinoFabricante: molinoFabricante || nombreEmpresa,
        paisOrigen,
        numeroLoteProduccion,
        colorShade,
        subpartidaArancelaria,
        certificadoOrigen: aplicaCertificadoOrigen === 'SI' ? 'CO-2026-PROV' : undefined,
        aplicaCertificadoOrigen,
        acuerdoComercial,

        // 3. Fibras
        composicion: composicionPorcentual,
        composicionPorcentual,
        tipoFibraFilamento,
        continuoDiscontinuoCortada,
        tipoFibraTexturizado,
        tituloHiloUrdimbre,
        tituloHiloTrama,
        sentidoTorsion,
        mezclaIntima,

        // 4. Dimensiones y Peso
        anchoTotalM: anchoTotal.valor,
        anchoTotalDetalle: anchoTotal,
        anchoUtilM: anchoUtil.valor,
        anchoUtilDetalle: anchoUtil,
        gramajeDeclaradoGsm: gramajeGSM.valor,
        gramajeDetalle: gramajeGSM,
        pesoLinealGsm: pesoMetroLineal.valor,
        pesoLinealDetalle: pesoMetroLineal,
        rendimientoMkg: rendimientoTeorico.valor,
        rendimientoDetalle: rendimientoTeorico,
        espesorMm: espesorTela.valor,
        espesorDetalle: espesorTela,
        pesoDenimOz: pesoDenimOz.valor > 0 ? pesoDenimOz.valor : undefined,
        pesoDenimDetalle: pesoDenimOz.valor > 0 ? pesoDenimOz : undefined,

        // 5. Construcción
        tipoTejido,
        tipoLigamento,
        densidadUrdimbreHilosCm: densidadUrdimbre.valor,
        densidadUrdimbreDetalle: densidadUrdimbre,
        densidadTramaPasadasCm: densidadTrama.valor,
        densidadTramaDetalle: densidadTrama,
        acabadosTextiles,
        acabadoColorTintoreria,

        // 6. Laboratorio
        encogimientoLargoMax: encogimientoLargo.valor,
        encogimientoLargoDetalle: encogimientoLargo,
        encogimientoAnchoMax: encogimientoAncho.valor,
        encogimientoAnchoDetalle: encogimientoAncho,
        torqueViroPiernaDetalle: torqueViroPierna,
        viroMax: torqueViroPierna.valor,
        solidezLavadoMin: solidezLavadoCambioColor.valor,
        solidezLavadoCambioColorDetalle: solidezLavadoCambioColor,
        solidezLavadoManchadoDetalle: solidezLavadoManchado,
        solidezFroteSecoMin: solidezFroteSeco.valor,
        solidezFroteSecoDetalle: solidezFroteSeco,
        solidezFroteHumedoMin: solidezFroteHumedo.valor,
        solidezFroteHumedoDetalle: solidezFroteHumedo,
        elongacionLargoMin: elongacionLargo.valor,
        elongacionLargoDetalle: elongacionLargo,
        elongacionAnchoMin: elongacionAncho.valor,
        elongacionAnchoDetalle: elongacionAncho,
        recuperacionElasticidadMin: recuperacionElasticidad.valor,
        recuperacionElasticidadDetalle: recuperacionElasticidad,
        resistenciaDesgarreMin: resistenciaDesgarre.valor,
        resistenciaDesgarreDetalle: resistenciaDesgarre,
        resistenciaDesgarreUrdimbreDetalle: resistenciaDesgarreUrdimbre,
        resistenciaDesgarreTramaDetalle: resistenciaDesgarreTrama,
        resistenciaPillingMin: resistenciaPilling.valor,
        resistenciaPillingDetalle: resistenciaPilling,
        deslizamientoCosturaMax: deslizamientoCostura.valor,
        deslizamientoCosturaDetalle: deslizamientoCostura,

        // 7. Cuidados y Documentos
        instruccionesLavadoSugerido: instruccionesLavado,
        recomendacionesPlanchado,
        observacionesAdvertencias,
        observacionesFabricante: observacionesAdvertencias,
        documentosAdjuntos: {
          pdfFichaOriginal: { nombre: nombreArchivoPDF, urlData: '', fecha: new Date().toISOString().split('T')[0] },
          certificadosCalidad: [{ nombre: nombreArchivoCertificado, urlData: '', fecha: new Date().toISOString().split('T')[0] }],
          fotosTela: [{ nombre: nombreFotoTela, urlData: '', fecha: new Date().toISOString().split('T')[0] }]
        }
      }
    };

    const fichaHistorica: FichaTecnicaHistoricaVersionada = {
      id: fichaExistenteParaVersionar?.id || `ft-prov-${Date.now()}`,
      codigoFT: codigoFTGenerado,
      referencia: nombreComercialTela || referenciaSTF || referenciaProveedor || 'TELA PROVEEDOR',
      referenciaProveedor,
      proveedor: nombreEmpresa,
      contactoProveedor: contactoTecnico,
      paisOrigen,
      versionActual: versionNumero,
      estadoRevision: 'PENDIENTE_REVISION',
      createdAt: fichaExistenteParaVersionar?.createdAt || new Date().toISOString().split('T')[0],
      createdBy: contactoTecnico || nombreEmpresa || 'Proveedor',
      updatedAt: new Date().toISOString().split('T')[0],
      updatedBy: contactoTecnico || nombreEmpresa || 'Proveedor',
      documentoOriginal: {
        nombreArchivo: nombreArchivoPDF,
        tipo: 'PDF',
        fechaCarga: new Date().toISOString().split('T')[0]
      },
      historialVersiones: fichaExistenteParaVersionar
        ? [...fichaExistenteParaVersionar.historialVersiones, nuevaVersion]
        : [nuevaVersion]
    };

    onGuardarFicha(fichaHistorica, nuevaVersion);
    setEnviadoExitoso(true);
  };

  if (enviadoExitoso) {
    return (
      <div className="bg-white border-2 border-emerald-500/50 rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto my-6 shadow-xl animate-fade-in font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-black text-[#0F172A]">¡Ficha Técnica Enviada Exitosamente!</h3>
        <p className="text-xs text-[#334155] font-bold leading-relaxed">
          La información técnica declarada por <strong className="text-[#0F172A]">{nombreEmpresa}</strong> ha sido almacenada en el <strong className="text-[#0F172A]">Historial de Fichas Técnicas</strong> con estado <span className="text-[#8C6D1F] font-black bg-amber-100 px-2 py-0.5 rounded border border-amber-300">PENDIENTE DE REVISIÓN</span>.
        </p>
        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#CBD5E1] text-left text-xs space-y-2 font-mono text-[#0F172A]">
          <div><strong className="text-[#64748B]">Referencia Proveedor:</strong> <span className="text-[#8C6D1F] font-black">{referenciaProveedor}</span></div>
          <div><strong className="text-[#64748B]">Tela / Nombre:</strong> <span className="text-[#0F172A] font-bold">{nombreComercialTela || referenciaSTF}</span></div>
          <div><strong className="text-[#64748B]">Fabricante:</strong> <span className="text-blue-700 font-bold">{nombreEmpresa}</span></div>
          <div><strong className="text-[#64748B]">Documento Adjunto:</strong> <span className="text-emerald-700 font-bold">{nombreArchivoPDF}</span></div>
        </div>
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="px-6 py-2.5 bg-[#8C6D1F] hover:bg-[#735817] text-white font-black rounded-xl text-xs shadow-md transition-colors cursor-pointer"
          >
            Cerrar Formulario
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 text-[#0F172A] font-sans">
      
      {/* Selector de Pasos / Secciones */}
      {!modoRevision && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-[#CBD5E1] scrollbar-thin">
          {secciones.map((sec) => {
            const Icono = sec.icono;
            const activo = seccionActiva === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSeccionActiva(sec.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  activo
                    ? 'bg-[#0F172A] text-white shadow-lg border border-[#0F172A] scale-[1.02]'
                    : 'bg-white text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A] border border-[#CBD5E1]'
                }`}
              >
                <Icono className={`w-4 h-4 shrink-0 ${activo ? 'text-amber-400' : 'text-[#8C6D1F]'}`} />
                <span>{sec.titulo}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 1: FORMULARIO INTERACTIVO (7 SECCIONES)                            */}
      {/* ========================================================================= */}
      {!modoRevision && (
        <div className="space-y-5">
          
          {/* SECCIÓN 1: INFORMACIÓN DE CONTACTO Y EMPRESA */}
          {seccionActiva === 1 && (
            <div className="bg-white border-2 border-[#CBD5E1] rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in shadow-md">
              <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#8C6D1F] flex items-center justify-center border border-amber-300">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-[#0F172A] uppercase tracking-wide">1. Información de Contacto y Empresa</h4>
                    <p className="text-xs text-[#64748B] font-bold">Datos corporativos del fabricante o proveedor que declara la ficha técnica.</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black bg-amber-100 text-[#8C6D1F] px-3 py-1 rounded-full border border-amber-300">Paso 1 de 7</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Nombre de la Empresa / Fabricante <span className="text-rose-600 font-black">*</span></label>
                  <input
                    type="text"
                    value={nombreEmpresa}
                    onChange={(e) => setNombreEmpresa(e.target.value)}
                    placeholder="Ej: SHAOXING TEXTILE MILL CO., LTD"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Nombre del Contacto Técnico / Comercial <span className="text-rose-600 font-black">*</span></label>
                  <input
                    type="text"
                    value={contactoTecnico}
                    onChange={(e) => setContactoTecnico(e.target.value)}
                    placeholder="Ej: Ing. David Chen / Representante"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Correo Electrónico de Contacto</label>
                  <input
                    type="email"
                    value={emailContacto}
                    onChange={(e) => setEmailContacto(e.target.value)}
                    placeholder="contacto@textilemill.com"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={telefonoWhatsapp}
                    onChange={(e) => setTelefonoWhatsapp(e.target.value)}
                    placeholder="+86 138 0000 0000 / +57 300 000 0000"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">País de la Empresa</label>
                  <input
                    type="text"
                    value={paisEmpresa}
                    onChange={(e) => setPaisEmpresa(e.target.value)}
                    placeholder="China, Colombia, India, Turquía, etc."
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 2: TRAZABILIDAD, COMERCIAL Y ADUANAS */}
          {seccionActiva === 2 && (
            <div className="bg-white border-2 border-[#CBD5E1] rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in shadow-md">
              <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-300">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-[#0F172A] uppercase tracking-wide">2. Trazabilidad, Comercial y Aduanas</h4>
                    <p className="text-xs text-[#64748B] font-bold">Identificación comercial, números de orden, lote y aranceles.</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full border border-indigo-300">Paso 2 de 7</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Referencia Comercial Proveedor / Código Fábrica <span className="text-rose-600 font-black">*</span></label>
                  <input
                    type="text"
                    value={referenciaProveedor}
                    onChange={(e) => setReferenciaProveedor(e.target.value)}
                    placeholder="Ej: SH-2026-BORD-01"
                    className="w-full bg-[#F8FAFC] border-2 border-amber-500/60 rounded-xl px-3.5 py-2.5 text-[#8C6D1F] font-mono font-black focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Nombre de la Tela / Denominación Comercial</label>
                  <input
                    type="text"
                    value={nombreComercialTela}
                    onChange={(e) => setNombreComercialTela(e.target.value)}
                    placeholder="Ej: NYLON BORDADO LIBIA"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Referencia STF / Código MT</label>
                  <input
                    type="text"
                    value={referenciaSTF}
                    onChange={(e) => setReferenciaSTF(e.target.value)}
                    placeholder="Ej: STF-TEL-005941"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">STF PO Number / # OC COL</label>
                  <input
                    type="text"
                    value={stfPoNumber}
                    onChange={(e) => setStfPoNumber(e.target.value)}
                    placeholder="Ej: 106782 / OAC 1107"
                    className="w-full bg-[#F8FAFC] border border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-emerald-800 font-mono font-black focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Número de Lote de Producción</label>
                  <input
                    type="text"
                    value={numeroLoteProduccion}
                    onChange={(e) => setNumeroLoteProduccion(e.target.value)}
                    placeholder="Ej: LOT-2026-A1"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Color / Variante / Shade</label>
                  <input
                    type="text"
                    value={colorShade}
                    onChange={(e) => setColorShade(e.target.value)}
                    placeholder="Ej: 246 - MOKA / 000 NEGRO"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">País de Origen / Fabricación</label>
                  <input
                    type="text"
                    value={paisOrigen}
                    onChange={(e) => setPaisOrigen(e.target.value)}
                    placeholder="China, Colombia, etc."
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Subpartida Arancelaria</label>
                  <input
                    type="text"
                    value={subpartidaArancelaria}
                    onChange={(e) => setSubpartidaArancelaria(e.target.value)}
                    placeholder="5407.52.00.00"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#8C6D1F] font-mono font-bold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Aplica Certificado de Origen</label>
                  <select
                    value={aplicaCertificadoOrigen}
                    onChange={(e) => setAplicaCertificadoOrigen(e.target.value as any)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-bold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm"
                  >
                    <option value="SI">SÍ - Aplica</option>
                    <option value="NO">NO - No Aplica</option>
                    <option value="EN_TRAMITE">EN TRÁMITE</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 3: FIBRAS, HILOS Y COMPOSICIÓN */}
          {seccionActiva === 3 && (
            <div className="bg-white border-2 border-[#CBD5E1] rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in shadow-md">
              <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center border border-cyan-300">
                    <Layers className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-[#0F172A] uppercase tracking-wide">3. Fibras, Hilos y Composición</h4>
                    <p className="text-xs text-[#64748B] font-bold">Composición porcentual exacta, tipo de hilado y torsión.</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full border border-cyan-300">Paso 3 de 7</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Composición Porcentual <span className="text-rose-600 font-black">*</span></label>
                  <input
                    type="text"
                    value={composicionPorcentual}
                    onChange={(e) => setComposicionPorcentual(e.target.value)}
                    placeholder="Ej: 95% Poliéster, 5% Spandex / 100% Algodón"
                    className="w-full bg-[#F8FAFC] border-2 border-cyan-500/60 rounded-xl px-3.5 py-2.5 text-cyan-950 font-black text-xs sm:text-sm focus:border-amber-500 focus:bg-white outline-none shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Tipo de Fibra / Filamento</label>
                  <input
                    type="text"
                    value={tipoFibraFilamento}
                    onChange={(e) => setTipoFibraFilamento(e.target.value)}
                    placeholder="Filamento Continuo, Fibra Cortada..."
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Continuo / Discontinuo / Cortada</label>
                  <select
                    value={continuoDiscontinuoCortada}
                    onChange={(e) => setContinuoDiscontinuoCortada(e.target.value as any)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-bold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm"
                  >
                    <option value="Continuo">Continuo</option>
                    <option value="Discontinuo">Discontinuo</option>
                    <option value="Cortada">Cortada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Tipo de Fibra Texturizado</label>
                  <input
                    type="text"
                    value={tipoFibraTexturizado}
                    onChange={(e) => setTipoFibraTexturizado(e.target.value)}
                    placeholder="DTY, FDY, ATY, Liso..."
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Título de Hilo en Urdimbre / Mallas</label>
                  <input
                    type="text"
                    value={tituloHiloUrdimbre}
                    onChange={(e) => setTituloHiloUrdimbre(e.target.value)}
                    placeholder="Ej: 75D/72F, 30/1 Ne, 150 Dtex"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-mono font-bold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Título de Hilo en Trama / Columnas</label>
                  <input
                    type="text"
                    value={tituloHiloTrama}
                    onChange={(e) => setTituloHiloTrama(e.target.value)}
                    placeholder="Ej: 150D/144F, 24/1 Ne"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-mono font-bold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Sentido de Torsión</label>
                  <select
                    value={sentidoTorsion}
                    onChange={(e) => setSentidoTorsion(e.target.value as any)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-bold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm"
                  >
                    <option value="Z">Torsión Z</option>
                    <option value="S">Torsión S</option>
                    <option value="S+Z">Torsión S + Z</option>
                    <option value="Sin Torsión">Sin Torsión</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 4: DIMENSIONES, PESO Y RENDIMIENTO */}
          {seccionActiva === 4 && (
            <div className="bg-white border-2 border-[#CBD5E1] rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in shadow-md">
              <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
                    <Ruler className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-[#0F172A] uppercase tracking-wide">4. Dimensiones, Peso y Rendimiento</h4>
                    <p className="text-xs text-[#64748B] font-bold">Valor Declarado, Unidad, Tolerancia y Norma de ensayo.</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">Paso 4 de 7</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Gramaje GSM */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-emerald-400 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0F172A] text-xs uppercase">Gramaje / Peso Superficial (GSM) <span className="text-rose-600 font-black">*</span></span>
                    <span className="text-[10px] text-emerald-700 font-mono font-black">ASTM D3776 / NTC 230</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Valor Declarado</label>
                      <input
                        type="number"
                        value={gramajeGSM.valor}
                        onChange={(e) => setGramajeGSM({ ...gramajeGSM, valor: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-emerald-800 font-black text-center text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Unidad</label>
                      <input
                        type="text"
                        value={gramajeGSM.unidad}
                        onChange={(e) => setGramajeGSM({ ...gramajeGSM, unidad: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#0F172A] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Tolerancia</label>
                      <input
                        type="text"
                        value={gramajeGSM.tolerancia || '± 5%'}
                        onChange={(e) => setGramajeGSM({ ...gramajeGSM, tolerancia: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#8C6D1F] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Ancho Útil */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1] space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0F172A] text-xs uppercase">Ancho Útil / Cortable <span className="text-rose-600 font-black">*</span></span>
                    <span className="text-[10px] text-[#64748B] font-mono">ASTM D3774</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Valor Declarado</label>
                      <input
                        type="number"
                        step="0.01"
                        value={anchoUtil.valor}
                        onChange={(e) => setAnchoUtil({ ...anchoUtil, valor: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[#0F172A] font-black text-center text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Unidad</label>
                      <input
                        type="text"
                        value={anchoUtil.unidad}
                        onChange={(e) => setAnchoUtil({ ...anchoUtil, unidad: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#0F172A] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Tolerancia</label>
                      <input
                        type="text"
                        value={anchoUtil.tolerancia || '± 2 cm'}
                        onChange={(e) => setAnchoUtil({ ...anchoUtil, tolerancia: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#8C6D1F] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Ancho Total */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1] space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0F172A] text-xs uppercase">Ancho Total (Orilla a Orilla)</span>
                    <span className="text-[10px] text-[#64748B] font-mono">ASTM D3774</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Valor</label>
                      <input
                        type="number"
                        step="0.01"
                        value={anchoTotal.valor}
                        onChange={(e) => setAnchoTotal({ ...anchoTotal, valor: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[#0F172A] font-black text-center text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Unidad</label>
                      <input
                        type="text"
                        value={anchoTotal.unidad}
                        onChange={(e) => setAnchoTotal({ ...anchoTotal, unidad: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#0F172A] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Tolerancia</label>
                      <input
                        type="text"
                        value={anchoTotal.tolerancia || '± 2 cm'}
                        onChange={(e) => setAnchoTotal({ ...anchoTotal, tolerancia: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#8C6D1F] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Peso por Metro Lineal */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1] space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0F172A] text-xs uppercase">Peso por Metro Lineal</span>
                    <span className="text-[10px] text-[#64748B] font-mono">Calculado</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Valor</label>
                      <input
                        type="number"
                        value={pesoMetroLineal.valor}
                        onChange={(e) => setPesoMetroLineal({ ...pesoMetroLineal, valor: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[#0F172A] font-black text-center text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Unidad</label>
                      <input
                        type="text"
                        value={pesoMetroLineal.unidad}
                        onChange={(e) => setPesoMetroLineal({ ...pesoMetroLineal, unidad: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#0F172A] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Tolerancia</label>
                      <input
                        type="text"
                        value={pesoMetroLineal.tolerancia || '± 5%'}
                        onChange={(e) => setPesoMetroLineal({ ...pesoMetroLineal, tolerancia: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#8C6D1F] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Rendimiento Teórico */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1] space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0F172A] text-xs uppercase">Rendimiento Teórico</span>
                    <span className="text-[10px] text-[#64748B] font-mono">m / kg</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Valor</label>
                      <input
                        type="number"
                        step="0.01"
                        value={rendimientoTeorico.valor}
                        onChange={(e) => setRendimientoTeorico({ ...rendimientoTeorico, valor: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[#0F172A] font-black text-center text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Unidad</label>
                      <input
                        type="text"
                        value={rendimientoTeorico.unidad}
                        onChange={(e) => setRendimientoTeorico({ ...rendimientoTeorico, unidad: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#0F172A] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Tolerancia</label>
                      <input
                        type="text"
                        value={rendimientoTeorico.tolerancia || '± 3%'}
                        onChange={(e) => setRendimientoTeorico({ ...rendimientoTeorico, tolerancia: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#8C6D1F] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Espesor Tela */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1] space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0F172A] text-xs uppercase">Espesor de la Tela</span>
                    <span className="text-[10px] text-[#64748B] font-mono">ASTM D1777</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Valor</label>
                      <input
                        type="number"
                        step="0.01"
                        value={espesorTela.valor}
                        onChange={(e) => setEspesorTela({ ...espesorTela, valor: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[#0F172A] font-black text-center text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Unidad</label>
                      <input
                        type="text"
                        value={espesorTela.unidad}
                        onChange={(e) => setEspesorTela({ ...espesorTela, unidad: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#0F172A] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Tolerancia</label>
                      <input
                        type="text"
                        value={espesorTela.tolerancia || '± 0.05 mm'}
                        onChange={(e) => setEspesorTela({ ...espesorTela, tolerancia: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#8C6D1F] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECCIÓN 5: ESTRUCTURA, CONSTRUCCIÓN Y ACABADOS */}
          {seccionActiva === 5 && (
            <div className="bg-white border-2 border-[#CBD5E1] rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in shadow-md">
              <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-800 flex items-center justify-center border border-pink-300">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-[#0F172A] uppercase tracking-wide">5. Estructura, Construcción y Acabados</h4>
                    <p className="text-xs text-[#64748B] font-bold">Tipo de ligamento, densidad de hilos y procesos de tintorería/acabado.</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black bg-pink-100 text-pink-800 px-3 py-1 rounded-full border border-pink-300">Paso 5 de 7</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Tipo de Tejido <span className="text-rose-600 font-black">*</span></label>
                  <select
                    value={tipoTejido}
                    onChange={(e) => setTipoTejido(e.target.value as any)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-bold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm"
                  >
                    <option value="Plano">Tejido Plano (Woven)</option>
                    <option value="Punto">Tejido de Punto (Knit)</option>
                    <option value="Índigo / Denim">Índigo / Denim</option>
                    <option value="No Tejido">No Tejido (Non-woven)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Tipo de Ligamento / Construcción</label>
                  <input
                    type="text"
                    value={tipoLigamento}
                    onChange={(e) => setTipoLigamento(e.target.value)}
                    placeholder="Tafetán, Sarga 3/1, Satén, Jersey, Rib..."
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Densidad Urdimbre / Columnas (hilos/cm)</label>
                  <input
                    type="number"
                    value={densidadUrdimbre.valor}
                    onChange={(e) => setDensidadUrdimbre({ ...densidadUrdimbre, valor: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-mono font-bold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Densidad Trama / Pasadas (pasadas/cm)</label>
                  <input
                    type="number"
                    value={densidadTrama.valor}
                    onChange={(e) => setDensidadTrama({ ...densidadTrama, valor: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-mono font-bold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Acabados Textiles</label>
                  <input
                    type="text"
                    value={acabadosTextiles}
                    onChange={(e) => setAcabadosTextiles(e.target.value)}
                    placeholder="Sanforizado, Mercerizado, Suavizado..."
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Acabado de Color / Tintorería</label>
                  <input
                    type="text"
                    value={acabadoColorTintoreria}
                    onChange={(e) => setAcabadoColorTintoreria(e.target.value)}
                    placeholder="Teñido en Pieza, Teñido en Hilo, Estampado..."
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 6: PARÁMETROS DE LABORATORIO, ENSAYOS FÍSICOS Y TOLERANCIAS */}
          {seccionActiva === 6 && (
            <div className="bg-white border-2 border-[#CBD5E1] rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in shadow-md">
              <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#8C6D1F] flex items-center justify-center border border-amber-300">
                    <FlaskConical className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-[#0F172A] uppercase tracking-wide">6. Parámetros de Laboratorio, Ensayos Físicos y Tolerancias</h4>
                    <p className="text-xs text-[#64748B] font-bold">Valores declarados por el fabricante que servirán de referencia en Laboratorio.</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black bg-amber-100 text-[#8C6D1F] px-3 py-1 rounded-full border border-amber-300">Paso 6 de 7</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Encogimiento Largo */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1] space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0F172A] text-xs uppercase">Encogimiento a lo Largo (%)</span>
                    <span className="text-[10px] text-[#64748B] font-mono">AATCC 135</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Valor (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={encogimientoLargo.valor}
                        onChange={(e) => setEncogimientoLargo({ ...encogimientoLargo, valor: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[#0F172A] font-black text-center text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Unidad</label>
                      <input type="text" value="%" disabled className="w-full bg-[#E2E8F0] border border-[#CBD5E1] rounded-lg p-2 text-[#475569] font-bold text-center text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Tolerancia Máx</label>
                      <input
                        type="text"
                        value={encogimientoLargo.tolerancia || 'Máx. -3.0%'}
                        onChange={(e) => setEncogimientoLargo({ ...encogimientoLargo, tolerancia: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#8C6D1F] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Encogimiento Ancho */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1] space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0F172A] text-xs uppercase">Encogimiento a lo Ancho (%)</span>
                    <span className="text-[10px] text-[#64748B] font-mono">AATCC 135</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Valor (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={encogimientoAncho.valor}
                        onChange={(e) => setEncogimientoAncho({ ...encogimientoAncho, valor: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[#0F172A] font-black text-center text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Unidad</label>
                      <input type="text" value="%" disabled className="w-full bg-[#E2E8F0] border border-[#CBD5E1] rounded-lg p-2 text-[#475569] font-bold text-center text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Tolerancia Máx</label>
                      <input
                        type="text"
                        value={encogimientoAncho.tolerancia || 'Máx. -3.5%'}
                        onChange={(e) => setEncogimientoAncho({ ...encogimientoAncho, tolerancia: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#8C6D1F] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Torque / Pierna Virada */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1] space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0F172A] text-xs uppercase">Torque / Pierna Virada (%)</span>
                    <span className="text-[10px] text-[#64748B] font-mono">AATCC 179</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Valor (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={torqueViroPierna.valor}
                        onChange={(e) => setTorqueViroPierna({ ...torqueViroPierna, valor: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[#0F172A] font-black text-center text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Unidad</label>
                      <input type="text" value="%" disabled className="w-full bg-[#E2E8F0] border border-[#CBD5E1] rounded-lg p-2 text-[#475569] font-bold text-center text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Tolerancia Máx</label>
                      <input
                        type="text"
                        value={torqueViroPierna.tolerancia || 'Máx. 2.5%'}
                        onChange={(e) => setTorqueViroPierna({ ...torqueViroPierna, tolerancia: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#8C6D1F] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Solidez Lavado Doméstico */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1] space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0F172A] text-xs uppercase">Solidez al Lavado (Cambio de Color)</span>
                    <span className="text-[10px] text-[#64748B] font-mono">AATCC 61 / ISO 105</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Grado (1-5)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={solidezLavadoCambioColor.valor}
                        onChange={(e) => setSolidezLavadoCambioColor({ ...solidezLavadoCambioColor, valor: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[#0F172A] font-black text-center text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Escala</label>
                      <input type="text" value="Escala 1-5" disabled className="w-full bg-[#E2E8F0] border border-[#CBD5E1] rounded-lg p-2 text-[#475569] font-bold text-center text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Tolerancia Mín</label>
                      <input
                        type="text"
                        value={solidezLavadoCambioColor.tolerancia || 'Mín. Grado 4.0'}
                        onChange={(e) => setSolidezLavadoCambioColor({ ...solidezLavadoCambioColor, tolerancia: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#8C6D1F] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Solidez Frote Seco */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1] space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0F172A] text-xs uppercase">Solidez al Frote en Seco</span>
                    <span className="text-[10px] text-[#64748B] font-mono">AATCC 8</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Grado (1-5)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={solidezFroteSeco.valor}
                        onChange={(e) => setSolidezFroteSeco({ ...solidezFroteSeco, valor: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[#0F172A] font-black text-center text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Escala</label>
                      <input type="text" value="Escala 1-5" disabled className="w-full bg-[#E2E8F0] border border-[#CBD5E1] rounded-lg p-2 text-[#475569] font-bold text-center text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Tolerancia Mín</label>
                      <input
                        type="text"
                        value={solidezFroteSeco.tolerancia || 'Mín. Grado 4.0'}
                        onChange={(e) => setSolidezFroteSeco({ ...solidezFroteSeco, tolerancia: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#8C6D1F] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Solidez Frote Húmedo */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1] space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0F172A] text-xs uppercase">Solidez al Frote en Húmedo</span>
                    <span className="text-[10px] text-[#64748B] font-mono">AATCC 8</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Grado (1-5)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={solidezFroteHumedo.valor}
                        onChange={(e) => setSolidezFroteHumedo({ ...solidezFroteHumedo, valor: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[#0F172A] font-black text-center text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Escala</label>
                      <input type="text" value="Escala 1-5" disabled className="w-full bg-[#E2E8F0] border border-[#CBD5E1] rounded-lg p-2 text-[#475569] font-bold text-center text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Tolerancia Mín</label>
                      <input
                        type="text"
                        value={solidezFroteHumedo.tolerancia || 'Mín. Grado 3.0'}
                        onChange={(e) => setSolidezFroteHumedo({ ...solidezFroteHumedo, tolerancia: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#8C6D1F] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Resistencia al Pilling */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1] space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0F172A] text-xs uppercase">Resistencia al Pilling / Frisado</span>
                    <span className="text-[10px] text-[#64748B] font-mono">ASTM D3512</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Grado (1-5)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={resistenciaPilling.valor}
                        onChange={(e) => setResistenciaPilling({ ...resistenciaPilling, valor: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[#0F172A] font-black text-center text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Escala</label>
                      <input type="text" value="Escala 1-5" disabled className="w-full bg-[#E2E8F0] border border-[#CBD5E1] rounded-lg p-2 text-[#475569] font-bold text-center text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Tolerancia Mín</label>
                      <input
                        type="text"
                        value={resistenciaPilling.tolerancia || 'Mín. Grado 3-4'}
                        onChange={(e) => setResistenciaPilling({ ...resistenciaPilling, tolerancia: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#8C6D1F] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Deslizamiento Costura */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1] space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0F172A] text-xs uppercase">Deslizamiento de Hilos en Costura</span>
                    <span className="text-[10px] text-[#64748B] font-mono">ASTM D434</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Apertura (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={deslizamientoCostura.valor}
                        onChange={(e) => setDeslizamientoCostura({ ...deslizamientoCostura, valor: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-mono text-[#0F172A] font-black text-center text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Unidad</label>
                      <input type="text" value="mm" disabled className="w-full bg-[#E2E8F0] border border-[#CBD5E1] rounded-lg p-2 text-[#475569] font-bold text-center text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-bold mb-1 block">Tolerancia Máx</label>
                      <input
                        type="text"
                        value={deslizamientoCostura.tolerancia || 'Máx. 4.0 mm'}
                        onChange={(e) => setDeslizamientoCostura({ ...deslizamientoCostura, tolerancia: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#8C6D1F] font-bold text-center text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECCIÓN 7: CUIDADOS, RECOMENDACIONES Y DOCUMENTACIÓN */}
          {seccionActiva === 7 && (
            <div className="bg-white border-2 border-[#CBD5E1] rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in shadow-md">
              <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-[#0F172A] uppercase tracking-wide">7. Cuidados, Recomendaciones y Documentación</h4>
                    <p className="text-xs text-[#64748B] font-bold">Instrucciones de lavado, planchado y carga de archivos PDF / fotos.</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">Paso 7 de 7</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Instrucciones y Tipo de Lavado Sugerido</label>
                  <textarea
                    rows={2}
                    value={instruccionesLavado}
                    onChange={(e) => setInstruccionesLavado(e.target.value)}
                    placeholder="Lavado en ciclo normal máx 40°C..."
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-3 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Recomendaciones de Planchado y Temperatura</label>
                  <input
                    type="text"
                    value={recomendacionesPlanchado}
                    onChange={(e) => setRecomendacionesPlanchado(e.target.value)}
                    placeholder="Plancha tibia máx 150°C..."
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[#1E293B] font-black text-xs uppercase tracking-wider mb-1.5">Observaciones y Advertencias Técnicas Especiales</label>
                  <textarea
                    rows={2}
                    value={observacionesAdvertencias}
                    onChange={(e) => setObservacionesAdvertencias(e.target.value)}
                    placeholder="Observaciones de almacenamiento, corte, manipulación o fusionado..."
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-3 text-[#0F172A] font-extrabold focus:border-amber-500 focus:bg-white outline-none text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
                  />
                </div>

                {/* Archivos Adjuntos */}
                <div className="pt-3 border-t border-[#CBD5E1]">
                  <h5 className="font-black text-[#0F172A] mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-[#8C6D1F]" />
                    Documentos y Fotografías Adjuntas del Fabricante:
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* PDF Original */}
                    <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-dashed border-[#CBD5E1] flex flex-col items-center justify-center text-center space-y-2">
                      <FileText className="w-6 h-6 text-purple-700" />
                      <span className="font-black text-xs text-[#0F172A] uppercase">PDF Ficha Original</span>
                      <span className="text-[10px] text-emerald-800 font-mono font-bold truncate max-w-full">{nombreArchivoPDF}</span>
                      <label className="cursor-pointer px-3 py-1.5 bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#0F172A] text-xs font-extrabold rounded-lg transition-colors border border-[#CBD5E1]">
                        Seleccionar PDF
                        <input type="file" accept=".pdf" onChange={handleSubirPDFOriginal} className="hidden" />
                      </label>
                    </div>

                    {/* Certificados */}
                    <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-dashed border-[#CBD5E1] flex flex-col items-center justify-center text-center space-y-2">
                      <ShieldCheck className="w-6 h-6 text-emerald-700" />
                      <span className="font-black text-xs text-[#0F172A] uppercase">Certificados Calidad</span>
                      <span className="text-[10px] text-[#475569] font-mono font-bold truncate max-w-full">{nombreArchivoCertificado}</span>
                      <label className="cursor-pointer px-3 py-1.5 bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#0F172A] text-xs font-extrabold rounded-lg transition-colors border border-[#CBD5E1]">
                        Seleccionar Certificado
                        <input type="file" accept=".pdf,.png,.jpg" onChange={handleSubirCertificado} className="hidden" />
                      </label>
                    </div>

                    {/* Fotografías */}
                    <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-dashed border-[#CBD5E1] flex flex-col items-center justify-center text-center space-y-2">
                      <ImageIcon className="w-6 h-6 text-amber-700" />
                      <span className="font-black text-xs text-[#0F172A] uppercase">Fotografía / Carta Color</span>
                      <span className="text-[10px] text-[#475569] font-mono font-bold truncate max-w-full">{nombreFotoTela}</span>
                      <label className="cursor-pointer px-3 py-1.5 bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#0F172A] text-xs font-extrabold rounded-lg transition-colors border border-[#CBD5E1]">
                        Seleccionar Foto
                        <input type="file" accept="image/*" onChange={handleSubirFotoTela} className="hidden" />
                      </label>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Barra de Navegación de Pasos */}
          <div className="flex items-center justify-between pt-4 border-t border-[#CBD5E1]">
            <button
              type="button"
              disabled={seccionActiva === 1}
              onClick={() => setSeccionActiva(prev => Math.max(1, prev - 1))}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                seccionActiva === 1
                  ? 'bg-[#E2E8F0] text-slate-400 cursor-not-allowed border border-[#CBD5E1]'
                  : 'bg-white hover:bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <div className="flex items-center gap-2">
              {seccionActiva < 7 ? (
                <button
                  type="button"
                  onClick={() => setSeccionActiva(prev => Math.min(7, prev + 1))}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#8C6D1F] hover:bg-[#735817] text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <span>Siguiente Paso</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setModoRevision(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#8C6D1F] hover:bg-[#735817] text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>REVISAR FICHA TÉCNICA</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: PANTALLA DE REVISIÓN PREVIA ("REVISAR FICHA TÉCNICA")            */}
      {/* ========================================================================= */}
      {modoRevision && (
        <div className="space-y-5 animate-fade-in font-sans">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-500/50 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-black text-[#8C6D1F] bg-amber-100 px-2.5 py-1 rounded border border-amber-300">
                PANTALLA DE CONFIRMACIÓN
              </span>
              <h3 className="text-base font-black text-[#0F172A] mt-1.5">Revisión de Ficha Técnica Declarada por el Fabricante</h3>
              <p className="text-xs text-[#64748B] font-bold mt-0.5">Verifica la información antes del envío oficial a TEXLAB.</p>
            </div>
            <button
              type="button"
              onClick={() => setModoRevision(false)}
              className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded-xl text-xs font-black border border-[#CBD5E1] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Corregir Datos</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            {/* Bloque Empresa y Trazabilidad */}
            <div className="bg-white p-4 rounded-xl border border-[#CBD5E1] space-y-2.5 shadow-sm">
              <h4 className="font-black text-[#8C6D1F] text-xs uppercase border-b border-[#CBD5E1] pb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" />
                1. Empresa & Trazabilidad
              </h4>
              <div className="space-y-1.5 text-[#0F172A]">
                <div><span className="text-[#64748B] font-bold">Fabricante:</span> <strong className="text-[#0F172A]">{nombreEmpresa || '—'}</strong></div>
                <div><span className="text-[#64748B] font-bold">Contacto:</span> <span className="font-semibold">{contactoTecnico} ({emailContacto || 'Sin email'})</span></div>
                <div><span className="text-[#64748B] font-bold">Ref Proveedor:</span> <strong className="text-[#8C6D1F] font-mono font-black">{referenciaProveedor || '—'}</strong></div>
                <div><span className="text-[#64748B] font-bold">Nombre Tela:</span> <strong className="text-[#0F172A]">{nombreComercialTela || '—'}</strong></div>
                <div><span className="text-[#64748B] font-bold"># OC STF:</span> <span className="text-emerald-700 font-mono font-bold">{stfPoNumber || 'N/A'}</span></div>
                <div><span className="text-[#64748B] font-bold">País Origen:</span> <span className="font-semibold">{paisOrigen}</span></div>
                <div><span className="text-[#64748B] font-bold">Arancel / Certificado:</span> <span className="font-semibold">{subpartidaArancelaria} • Certificado: {aplicaCertificadoOrigen}</span></div>
              </div>
            </div>

            {/* Bloque Composición y Construcción */}
            <div className="bg-white p-4 rounded-xl border border-[#CBD5E1] space-y-2.5 shadow-sm">
              <h4 className="font-black text-cyan-800 text-xs uppercase border-b border-[#CBD5E1] pb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-700" />
                2. Fibras, Construcción & Dimensiones
              </h4>
              <div className="space-y-1.5 text-[#0F172A]">
                <div><span className="text-[#64748B] font-bold">Composición:</span> <strong className="text-cyan-900 font-black">{composicionPorcentual}</strong></div>
                <div><span className="text-[#64748B] font-bold">Tipo Tejido:</span> <span className="text-[#0F172A] font-bold">{tipoTejido} ({tipoLigamento})</span></div>
                <div><span className="text-[#64748B] font-bold">Gramaje GSM:</span> <strong className="text-emerald-700 font-mono font-black">{gramajeGSM.valor} {gramajeGSM.unidad}</strong> (Tol: {gramajeGSM.tolerancia})</div>
                <div><span className="text-[#64748B] font-bold">Ancho Útil:</span> <strong className="text-[#0F172A] font-mono font-black">{anchoUtil.valor} {anchoUtil.unidad}</strong> (Tol: {anchoUtil.tolerancia})</div>
                <div><span className="text-[#64748B] font-bold">Densidad Hilos:</span> <span className="font-semibold">Urdimbre: {densidadUrdimbre.valor} hilos/cm • Trama: {densidadTrama.valor} pasadas/cm</span></div>
                <div><span className="text-[#64748B] font-bold">Acabados:</span> <span className="font-semibold">{acabadosTextiles} • {acabadoColorTintoreria}</span></div>
              </div>
            </div>

            {/* Bloque Ensayos y Tolerancias */}
            <div className="bg-white p-4 rounded-xl border border-[#CBD5E1] space-y-2.5 md:col-span-2 shadow-sm">
              <h4 className="font-black text-[#8C6D1F] text-xs uppercase border-b border-[#CBD5E1] pb-2 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-600" />
                3. Parámetros de Laboratorio & Tolerancias Declaradas
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[#0F172A]">
                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#CBD5E1]">
                  <div className="text-[#64748B] font-bold text-[10px] uppercase">Encogimiento Largo</div>
                  <div className="font-mono font-black text-[#0F172A] text-sm">{encogimientoLargo.valor} %</div>
                  <div className="text-[10px] text-[#8C6D1F] font-bold">Tol: {encogimientoLargo.tolerancia}</div>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#CBD5E1]">
                  <div className="text-[#64748B] font-bold text-[10px] uppercase">Encogimiento Ancho</div>
                  <div className="font-mono font-black text-[#0F172A] text-sm">{encogimientoAncho.valor} %</div>
                  <div className="text-[10px] text-[#8C6D1F] font-bold">Tol: {encogimientoAncho.tolerancia}</div>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#CBD5E1]">
                  <div className="text-[#64748B] font-bold text-[10px] uppercase">Solidez Lavado</div>
                  <div className="font-mono font-black text-[#0F172A] text-sm">Grado {solidezLavadoCambioColor.valor}</div>
                  <div className="text-[10px] text-[#8C6D1F] font-bold">Tol: {solidezLavadoCambioColor.tolerancia}</div>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#CBD5E1]">
                  <div className="text-[#64748B] font-bold text-[10px] uppercase">Solidez Frote Húmedo</div>
                  <div className="font-mono font-black text-[#0F172A] text-sm">Grado {solidezFroteHumedo.valor}</div>
                  <div className="text-[10px] text-[#8C6D1F] font-bold">Tol: {solidezFroteHumedo.tolerancia}</div>
                </div>
              </div>
            </div>

            {/* Documentos Adjuntos */}
            <div className="bg-white p-4 rounded-xl border border-[#CBD5E1] space-y-2.5 md:col-span-2 shadow-sm">
              <h4 className="font-black text-purple-800 text-xs uppercase border-b border-[#CBD5E1] pb-2 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-purple-600" />
                4. Documentos Originales Adjuntos
              </h4>
              <div className="flex items-center gap-4 flex-wrap text-[#0F172A]">
                <span className="flex items-center gap-2 bg-[#F8FAFC] px-3.5 py-2 rounded-lg border border-[#CBD5E1] font-mono text-purple-900 font-bold text-xs">
                  <FileText className="w-4 h-4 text-purple-700" /> {nombreArchivoPDF}
                </span>
                <span className="flex items-center gap-2 bg-[#F8FAFC] px-3.5 py-2 rounded-lg border border-[#CBD5E1] font-mono text-emerald-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> {nombreArchivoCertificado}
                </span>
                <span className="flex items-center gap-2 bg-[#F8FAFC] px-3.5 py-2 rounded-lg border border-[#CBD5E1] font-mono text-amber-900 font-bold text-xs">
                  <ImageIcon className="w-4 h-4 text-amber-700" /> {nombreFotoTela}
                </span>
              </div>
            </div>

          </div>

          {/* Botones Finales de Envío */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#CBD5E1]">
            <button
              type="button"
              onClick={() => setModoRevision(false)}
              className="px-5 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] font-black rounded-xl text-xs transition-colors border border-[#CBD5E1] cursor-pointer"
            >
              ← Modificar Información
            </button>

            <button
              type="button"
              onClick={handleConfirmarYEnviar}
              className="flex items-center gap-2 px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
              <span>🚀 CONFIRMAR Y ENVIAR FICHA TÉCNICA</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
