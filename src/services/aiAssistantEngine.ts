import { AreaType, UserRole } from '../types';

export interface AIResponseButton {
  label: string;
  area?: AreaType;
  modal?: 'ficha' | 'nueva_muestra' | 'importar' | 'lead_time';
}

export interface AIResponse {
  text: string;
  buttons?: AIResponseButton[];
  intentFound: string;
}

export interface AIContextData {
  areaActual: AreaType;
  usuarioRole?: UserRole | string;
  usuarioNombre?: string;
  analistaActivoNombre?: string;
  solicitudesTelas: any[];
  solicitudesAccesorios: any[];
  muestras: any[];
  fichasTecnicas: any[];
  kpis: any;
  calidadProveedores: any[];
}

/**
 * Normaliza un texto removiendo tildes y caracteres especiales para facilitar la búsqueda.
 */
function normalizarTexto(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,:;…"'()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Genera la respuesta inteligente de la Asistente IA basada en la consulta exacta del usuario y el contexto actual de la app.
 */
export function procesarConsultaIA(
  consulta: string,
  contexto: AIContextData
): AIResponse {
  const queryNorm = normalizarTexto(consulta);
  const area = contexto.areaActual;

  // 1. SALUDOS Y BIENVENIDA
  if (
    queryNorm === 'hola' ||
    queryNorm === 'buenas' ||
    queryNorm.includes('buenos dias') ||
    queryNorm.includes('buenas noches') ||
    queryNorm.includes('buenas tardes') ||
    queryNorm.includes('quien eres') ||
    queryNorm.includes('quien es usted') ||
    queryNorm === 'ayuda'
  ) {
    return {
      intentFound: 'saludo',
      text: `👋 ¡Hola ${contexto.usuarioNombre || 'analista'}! Soy la **Asistente IA de STFLab 2.0**.

Puedo ayudarte a resolver dudas sobre:
* **Fichas Técnicas obligatorias del proveedor** (regla de envío desde Compras a Laboratorio).
* **Evaluaciones sin datos inventados** (solo se precargan especificaciones declaradas por el proveedor).
* **Firma automática con PIN de laboratorio**.
* **Búsqueda directa** de solicitudes (\`SOL-TEL...\`, \`ACC...\`), telas o proveedores.
* **Navegación** entre Dashboard, Laboratorio, Compras, Homologación y Biblioteca.

¿En qué te colaboro en este momento?`,
      buttons: [
        { label: '🧪 Ir a Laboratorio', area: 'laboratorio' },
        { label: '📄 Buscar Ficha Técnica', modal: 'ficha' },
        { label: '📊 Ver Indicadores', area: 'dashboard' }
      ]
    };
  }

  // 2. REGLA OBLIGATORIA: RECHAZO POR FALTA DE FICHA TÉCNICA DEL PROVEEDOR
  if (
    queryNorm.includes('sin ficha') ||
    queryNorm.includes('falta ficha') ||
    queryNorm.includes('no tiene ficha') ||
    queryNorm.includes('rechazar') ||
    queryNorm.includes('rechazo') ||
    queryNorm.includes('requisito ficha') ||
    (queryNorm.includes('compras') && queryNorm.includes('ficha'))
  ) {
    return {
      intentFound: 'regla_rechazo_ficha',
      text: `🚫 **Regla Obligatoria de Envíos de Compras a Laboratorio**:

Si una tela **no cuenta con la Ficha Técnica del Proveedor** vinculada o adjunta en el sistema:
1. **La solicitud es rechazada automáticamente** al momento en que Compras intenta enviarla a Laboratorio.
2. **Se notifica de inmediato a Compras**: *"La tela [referencia] no cuenta con la Ficha Técnica del Proveedor"*.
3. **Solución**: Compras o el Administrador debe cargar previamente la ficha técnica en la **Biblioteca / Explorador de Fichas Técnicas** antes de poder transferir la solicitud al laboratorio.`,
      buttons: [
        { label: '📄 Abrir Explorador de Fichas', modal: 'ficha' },
        { label: '🛍️ Ir a Compras', area: 'compras' }
      ]
    };
  }

  // 2.1 SUBSECCIÓN: FORROS Y COSTURAS (PIPIN VS SHIPPING)
  if (
    queryNorm.includes('forro') ||
    queryNorm.includes('forros') ||
    queryNorm.includes('costura') ||
    queryNorm.includes('costuras') ||
    queryNorm.includes('pipin') ||
    queryNorm.includes('shipping') ||
    queryNorm.includes('comparacion pipin')
  ) {
    return {
      intentFound: 'subseccion_forros_costuras',
      text: `🪡 **Subsección de Evaluación de Forros y Costuras (Pipin vs Shipping)**:

Esta subsección se encuentra en la pestaña **"Forros & Costuras (Pipin / Shipping)"** del Módulo de Laboratorio.

**Funciones Principales**:
1. **Muestra PIPIN (Preliminar)**: Registra la fecha de ingreso, fecha de entrega, tipo de forro, calidad de costura (SPI) y observaciones iniciales de la muestra preliminar.
2. **Muestra SHIPPING (Despacho)**: Para la **misma Referencia**, ingresa la fecha de ingreso, tipo de forro, observaciones de despacho y estado final.
3. **Comparativo Lado a Lado**: Genera el dictamen comparativo (APROBADO / CON HALLAZGOS / RECHAZADO) evaluando si coincide el forro e hilados.
4. **Envío por Correo Electrónico (📧)**: Permite enviar el **Reporte Técnico Oficial por correo** directamente a Compras o Calidad con un mensaje redactado automáticamente y archivo PDF adjunto.`,
      buttons: [
        { label: '🪡 Ir a Forros & Costuras', area: 'laboratorio' },
        { label: '🧪 Ir a Laboratorio', area: 'laboratorio' }
      ]
    };
  }

  // 3. REGLA: RESULTADOS DE EVALUACIÓN Y NO INVENTAR INFORMACIÓN
  if (
    queryNorm.includes('inventar') ||
    queryNorm.includes('resultados') ||
    queryNorm.includes('campos vacios') ||
    queryNorm.includes('valores iniciales') ||
    queryNorm.includes('precargar') ||
    queryNorm.includes('datos ensayo')
  ) {
    return {
      intentFound: 'regla_no_inventar_datos',
      text: `🧪 **Política de Integridad de Resultados en Laboratorio**:

* **Sin Datos Inventados**: Los campos de mediciones reales de laboratorio (Grupos A a H) **NO se pre-llenan con números ficticios**.
* **Precarga Automática Única**: Únicamente se precargan de forma automática los parámetros que estén **declarados formalmente en la Ficha Técnica del Proveedor**.
* **Campos Vacíos**: Cualquier parámetro que el proveedor no haya especificado permanecerá en blanco (\`""\`) hasta que el analista de laboratorio registre el valor real medido.`,
      buttons: [
        { label: '🧪 Ir a Módulo de Laboratorio', area: 'laboratorio' },
        { label: '📄 Consultar Fichas Técnicas', modal: 'ficha' }
      ]
    };
  }

  // 4. FIRMA AUTOMÁTICA Y USO DEL PIN DE LABORATORIO
  if (
    queryNorm.includes('pin') ||
    queryNorm.includes('responsable') ||
    queryNorm.includes('analista') ||
    queryNorm.includes('firmar') ||
    queryNorm.includes('firma') ||
    queryNorm.includes('sello')
  ) {
    return {
      intentFound: 'firma_pin',
      text: `🔑 **Firma de Responsable con PIN en Laboratorio**:

1. En la **Sección 1** del formulario de laboratorio o al final en el **Dictamen (Punto 4)**, se ingresa el **PIN de 4 dígitos**.
2. Al ingresar el PIN correcto, el sistema valida la identidad y asigna automáticamente a esa persona como **"Responsable del Dictamen de Laboratorio"**.
3. *Operador Activo Actual*: **${contexto.analistaActivoNombre || 'Laboratorio'}**.`,
      buttons: [
        { label: '🧪 Ir a Laboratorio', area: 'laboratorio' }
      ]
    };
  }

  // 5. CONTEXTO DE LA PANTALLA ACTUAL ("¿Qué hago aquí?", "¿Para qué sirve este módulo?")
  if (
    queryNorm.includes('que hago aqui') ||
    queryNorm.includes('para que sirve esta pantalla') ||
    queryNorm.includes('explicar este modulo') ||
    queryNorm.includes('donde estoy') ||
    queryNorm.includes('esta pantalla')
  ) {
    switch (area) {
      case 'laboratorio':
        return {
          intentFound: 'contexto_laboratorio',
          text: `🧪 **Estás en el Módulo de Laboratorio**:
Aquí realizas y registras las evaluaciones técnicas y ensayos textiles.
* **Bandeja Solicitudes**: Solicitudes pendientes por evaluar enviadas por Compras.
* **Historial**: Solicitudes que el laboratorio ya respondió y finalizó.
* **Cambiar Analista (PIN)**: Asigna la firma del laboratorista activo.
* **Evaluar Solicitud**: Accede al formulario completo de 4 secciones y 8 grupos de ensayos (A-H).`,
          buttons: [{ label: '📄 Explorar Fichas Técnicas', modal: 'ficha' }]
        };
      case 'dashboard':
      case 'indicadores':
        return {
          intentFound: 'contexto_dashboard',
          text: `📊 **Estás en el Dashboard & Indicadores**:
Aquí visualizas la salud general del control de calidad textil.
* **KPIs**: Tasa de aprobación %, Lead Time promedio en días, total de muestras.
* **Ranking de Causas**: Motivos principales de no conformidad.
* **Cumplimiento Proveedores**: % de muestras aprobadas por proveedor.`,
          buttons: [{ label: '🧪 Ir a Laboratorio', area: 'laboratorio' }, { label: '🛍️ Ir a Compras', area: 'compras' }]
        };
      case 'compras':
      case 'compras-decision':
        return {
          intentFound: 'contexto_compras',
          text: `🛍️ **Estás en el Módulo de Compras**:
Aquí Compras genera nuevas solicitudes de telas o accesorios, verifica que tengan ficha técnica del proveedor y toma la decisión comercial final.`,
          buttons: [{ label: '➕ Crear Nueva Muestra', modal: 'nueva_muestra' }]
        };
      case 'homologacion':
        return {
          intentFound: 'contexto_homologacion',
          text: `🔄 **Estás en el Módulo de Homologación de Proveedores**:
Compara muestras de dos proveedores lado a lado para evaluar alternativas de insumos con mismos parámetros técnicos.`,
          buttons: [{ label: '📊 Ir a Indicadores', area: 'dashboard' }]
        };
      default:
        return {
          intentFound: 'contexto_general',
          text: `📌 Te encuentras en el módulo **${area.toUpperCase()}**.
Usa el menú lateral para desplazarte entre las secciones de la app.`,
          buttons: [{ label: '📊 Ir al Dashboard', area: 'dashboard' }]
        };
    }
  }

  // 6. ¿CÓMO CREAR UNA SOLICITUD O MUESTRA?
  if (
    queryNorm.includes('crear solicitud') ||
    queryNorm.includes('como creo una solicitud') ||
    queryNorm.includes('nueva solicitud') ||
    queryNorm.includes('crear muestra') ||
    queryNorm.includes('nueva muestra') ||
    queryNorm.includes('como registro una muestra')
  ) {
    return {
      intentFound: 'crear_solicitud',
      text: `📝 **Pasos para crear una Solicitud en Compras**:

1. Ve a **Compras** y haz clic en **"+ Nueva Solicitud de Telas"** o **"+ Nueva Muestra"**.
2. Ingresa los 5 campos obligatorios: **Código SC, Nombre de Tela, Color, Proveedor, Orden de Compra**.
3. **Verificación de Ficha Técnica**: Cada tela debe tener registrada su Ficha Técnica del Proveedor. Si falta, la app rechazará la solicitud y te notificará.
4. Haz clic en **Guardar y Enviar a Laboratorio**.`,
      buttons: [
        { label: '🛍️ Ir a Compras', area: 'compras' },
        { label: '➕ Abrir Formulario Muestra', modal: 'nueva_muestra' }
      ]
    };
  }

  // 7. ¿CÓMO / DÓNDE EVALUAR UN ENSAYO EN LABORATORIO?
  if (
    queryNorm.includes('donde registro') ||
    queryNorm.includes('como registro') ||
    queryNorm.includes('donde evaluo') ||
    queryNorm.includes('como evaluo') ||
    queryNorm.includes('evaluar') ||
    queryNorm.includes('ensayo') ||
    queryNorm.includes('registrar ensayo') ||
    queryNorm.includes('dictamen') ||
    queryNorm.includes('solideces') ||
    queryNorm.includes('encogimiento')
  ) {
    return {
      intentFound: 'evaluar_ensayo',
      text: `🧪 **Dónde y cómo registrar un ensayo en STFLab**:

1. **Ingresa a Laboratorio**: Dirígete al módulo de **Laboratorio** (Bandeja de Solicitudes).
2. **Ubica la Solicitud**: En la pestaña **"Solicitudes"**, haz clic en el botón **"Evaluar"** correspondiente a la tela o insumo recibido de Compras.
3. **Diligencia los Ensayos Técnicos**: Registra los 8 grupos de ensayos (A-H). Los datos reales no se inventan; solo se precargan los valores declarados formalmente en la Ficha Técnica del Proveedor.
4. **Firma con PIN**: Ingresa tu **PIN de 4 dígitos** para firmar de manera digital e infalsificable como responsable del dictamen.
5. **Emite el Dictamen**: Asigna el resultado final (**APROBADO, CON HALLAZGO, RECHAZADO**) y haz clic en **Guardar y Enviar a Compras**.`,
      buttons: [
        { label: '🧪 Ir a Laboratorio', area: 'laboratorio' },
        { label: '📄 Consultar Fichas', modal: 'ficha' }
      ]
    };
  }

  // 7.1 PROVEEDOR SHAOXING (TELAS Y ESPECIFICACIONES)
  if (queryNorm.includes('shaoxing')) {
    return {
      intentFound: 'proveedor_shaoxing',
      text: `🏭 **Telas y Resultados del Proveedor "Shaoxing"**:

En el sistema STFLab se encuentran vinculados registros de **Shaoxing Ming He Embroidery** y **Shaoxing Keqiao**:

* **SF_TEL_005941** | **TELA NYLON BORDADO LIBIA**
  - **Color**: 246 - MOKA | **# OC COL**: 106782
  - **Proveedor**: SHAOXING MING HE EMBROIDERY CO., LTD
  - **Ficha Técnica**: ✅ FT Oficial Vigente vinculada en el sistema
  - **Composición / Gramaje**: 100% Nylon Bordado | 185 g/m² | Ancho 1.48 m
  - **Estado en Laboratorio**: Solidez al frote y estabilidad dimensional conformes.

* **Desempeño y Cumplimiento de Calidad**:
  - **Shaoxing Ming He**: 37% de participación de volumen de muestras con **92% de aprobación**.
  - **Shaoxing Keqiao**: 26% de participación de volumen con estabilidad dimensional certificada según **AATCC 135**.`,
      buttons: [
        { label: '🧪 Ver en Laboratorio', area: 'laboratorio' },
        { label: '🛍️ Ver en Compras', area: 'compras' },
        { label: '📄 Abrir Fichas Técnicas', modal: 'ficha' }
      ]
    };
  }

  // 7.2 FICHA TÉCNICA SF_TEL_005941 (O BÚSQUEDA ESPECÍFICA)
  if (queryNorm.includes('005941') || queryNorm.includes('sf_tel_005941') || (queryNorm.includes('libia') && queryNorm.includes('nylon'))) {
    return {
      intentFound: 'ficha_sf_tel_005941',
      text: `📄 **Ficha Técnica: SF_TEL_005941 (Tela Nylon Bordado Libia)**:

* **Solicitud de Compra**: \`SF_TEL_005941\`
* **Referencia STF**: **TELA NYLON BORDADO LIBIA**
* **Color**: \`246 - MOKA\`
* **Proveedor**: SHAOXING MING HE EMBROIDERY CO., LTD
* **Orden de Compra**: # OC COL 106782
* **Composición**: 100% Poliamida / Nylon Bordado Premium
* **Ancho Total / Útil**: 1.50 m / 1.46 m
* **Gramaje Declarado**: 185 g/m²
* **Tipo de Tejido**: Plano Bordado Calado
* **Parámetros Clave de Laboratorio**:
  - Encogimiento largo/ancho: máx -2.0% (Norma AATCC 135)
  - Solidez al frote seco: 4.0 / Solidez húmedo: 3.5 (AATCC 8)
  - Resistencia al rasgado: > 1600 gf (ASTM D1424)

✅ **Estado**: Ficha técnica del proveedor vinculada y disponible en el Explorador de Fichas.`,
      buttons: [
        { label: '📄 Abrir Fichas Técnicas', modal: 'ficha' },
        { label: '🧪 Ir a Laboratorio', area: 'laboratorio' },
        { label: '🛍️ Ir a Compras', area: 'compras' }
      ]
    };
  }

  // 7.3 SOLICITUDES DE COMPRAS PENDIENTES
  if (
    (queryNorm.includes('solicitud') || queryNorm.includes('solicitudes')) &&
    (queryNorm.includes('pendiente') || queryNorm.includes('pendientes') || queryNorm.includes('compras'))
  ) {
    const telasPendientes = (contexto.solicitudesTelas || []).filter(s => s.estadoFlujo !== 'completado');
    const accPendientes = (contexto.solicitudesAccesorios || []).filter(s => s.estadoFlujo !== 'completado');

    let detalle = `🛍️ **Solicitudes de Compras Pendientes en STFLab**:\n\n`;

    if (telasPendientes.length > 0) {
      detalle += `🧵 **Solicitudes de Telas en Proceso (${telasPendientes.length})**:\n`;
      telasPendientes.slice(0, 3).forEach(s => {
        const refs = (s.telas || []).map((t: any) => t.referencia).filter(Boolean).join(', ') || 'Telas varias';
        detalle += `* **${s.numeroSolicitud || s.id}** | Prov: **${s.proveedor}** | Refs: ${refs} | Estado: \`${s.estadoFlujo}\`\n`;
      });
      detalle += `\n`;
    } else {
      detalle += `🧵 **Telas**: Todas las solicitudes de telas se encuentran al día o procesadas en Laboratorio.\n\n`;
    }

    if (accPendientes.length > 0) {
      detalle += `🔩 **Solicitudes de Accesorios en Proceso (${accPendientes.length})**:\n`;
      accPendientes.slice(0, 3).forEach(s => {
        detalle += `* **${s.numeroSolicitud || s.id}** | Prov: **${s.proveedor}** | Estado: \`${s.estadoFlujo}\`\n`;
      });
      detalle += `\n`;
    }

    detalle += `💡 **Regla STFLab**: Toda solicitud enviada por Compras debe contar obligatoriamente con su **Ficha Técnica del Proveedor** cargada para habilitar la evaluación técnica en Laboratorio.`;

    return {
      intentFound: 'solicitudes_pendientes',
      text: detalle,
      buttons: [
        { label: '🛍️ Ir a Compras', area: 'compras' },
        { label: '🧪 Ir a Laboratorio', area: 'laboratorio' },
        { label: '➕ Crear Solicitud', modal: 'nueva_muestra' }
      ]
    };
  }

  // 8. BUSCAR DENTRO DE LA APP (SOLICITUDES, TELAS, ACCESORIOS, FICHAS, PROVEEDORES)
  const terminoBusqueda = queryNorm
    .replace(/\bbusca(r)?\b/g, '')
    .replace(/\bmuestrame\b/g, '')
    .replace(/\bmuestra\b/g, '')
    .replace(/\bver\b/g, '')
    .replace(/\bdonde esta\b/g, '')
    .replace(/\bencuentra\b/g, '')
    .replace(/\bl(as|os|a|el)\b/g, '')
    .replace(/\btelas\b/g, '')
    .replace(/\bde(l)?\b/g, '')
    .replace(/\bproveedor\b/g, '')
    .replace(/\bsolicitud(es)?\b/g, '')
    .replace(/\bficha(s)?\b/g, '')
    .replace(/\btecnica(s)?\b/g, '')
    .trim();

  const esTerminoDirecto = queryNorm.startsWith('sol-') || queryNorm.startsWith('acc-') || queryNorm.startsWith('ft-') || queryNorm.startsWith('oc-');

  if (queryNorm.includes('buscar') || queryNorm.includes('donde esta') || esTerminoDirecto || (terminoBusqueda.length >= 3)) {
    const termino = terminoBusqueda || queryNorm;

    // Buscar en solicitudes de telas
    const coincidenciaTelas = (contexto.solicitudesTelas || []).filter(s => {
      const telasTxt = (s.telas || []).map((t: any) => `${t.referencia || ''} ${t.color || ''} ${t.proveedor || ''} ${t.solicitudCompra || ''} ${t.ocCol || ''} ${t.dictamen || ''}`).join(' ');
      const txt = normalizarTexto(`${s.numeroSolicitud || ''} ${s.ordenCompra || ''} ${s.proveedor || ''} ${telasTxt}`);
      return txt.includes(termino);
    });

    // Buscar en solicitudes de accesorios
    const coincidenciaAcc = (contexto.solicitudesAccesorios || []).filter(s => {
      const muestrasTxt = (s.muestras || []).map((m: any) => `${m.referencia || ''} ${m.color || ''} ${m.talla || ''} ${m.descripcionInsumo || ''} ${m.dictamen || ''}`).join(' ');
      const txt = normalizarTexto(`${s.numeroSolicitud || ''} ${s.proveedor || ''} ${muestrasTxt}`);
      return txt.includes(termino);
    });

    // Buscar en fichas técnicas
    const coincidenciaFichas = (contexto.fichasTecnicas || []).filter(f => {
      const txt = normalizarTexto(`${f.codigoFT || ''} ${f.referencia || ''} ${f.referenciaProveedor || ''} ${f.proveedor || ''}`);
      return txt.includes(termino);
    });

    // Buscar en ranking de proveedores
    const coincidenciaProveedores = (contexto.calidadProveedores || []).filter(p => 
      normalizarTexto(p.nombre).includes(termino)
    );

    if (coincidenciaTelas.length > 0 || coincidenciaAcc.length > 0 || coincidenciaFichas.length > 0 || coincidenciaProveedores.length > 0) {
      let rta = `🔍 **Resultados de Búsqueda para "${termino}"**:\n\n`;

      if (coincidenciaTelas.length > 0) {
        rta += `🧵 **Solicitudes de Telas (${coincidenciaTelas.length})**:\n`;
        coincidenciaTelas.slice(0, 3).forEach(s => {
          const dictamenes = (s.telas || []).map((t: any) => t.dictamen || 'PENDIENTE').join(', ');
          rta += `* **${s.numeroSolicitud || s.id}** | Prov: ${s.proveedor} | Estado: \`${s.estadoFlujo}\` | Dictamen: \`${dictamenes}\`\n`;
        });
        rta += `\n`;
      }

      if (coincidenciaAcc.length > 0) {
        rta += `🔩 **Solicitudes de Accesorios (${coincidenciaAcc.length})**:\n`;
        coincidenciaAcc.slice(0, 3).forEach(s => {
          rta += `* **${s.numeroSolicitud || s.id}** | Prov: ${s.proveedor} | Estado: \`${s.estadoFlujo}\`\n`;
        });
        rta += `\n`;
      }

      if (coincidenciaFichas.length > 0) {
        rta += `📄 **Fichas Técnicas (${coincidenciaFichas.length})**:\n`;
        coincidenciaFichas.slice(0, 3).forEach(f => {
          rta += `* Código: **${f.codigoFT}** | Ref: **${f.referencia}** | Prov: ${f.proveedor}\n`;
        });
        rta += `\n`;
      }

      if (coincidenciaProveedores.length > 0) {
        rta += `🏭 **Proveedores (${coincidenciaProveedores.length})**:\n`;
        coincidenciaProveedores.slice(0, 2).forEach(p => {
          rta += `* **${p.nombre}**: ${p.porcentajeAprobacion}% Aprobados (${p.muestrasAprobadas}/${p.totalMuestras})\n`;
        });
      }

      return {
        intentFound: 'busqueda_exitosa',
        text: rta,
        buttons: [
          { label: '🧪 Ir a Laboratorio', area: 'laboratorio' },
          { label: '📄 Ver Fichas Técnicas', modal: 'ficha' }
        ]
      };
    }
  }

  // 9. NAVEGACIÓN DIRECTA A MÓDULOS DE LA APP
  if (queryNorm.includes('ir a') || queryNorm.includes('donde veo') || queryNorm.includes('donde esta') || queryNorm.includes('como llego')) {
    if (queryNorm.includes('laboratorio')) {
      return { intentFound: 'nav_lab', text: '🧪 Te dirijo al Módulo de Laboratorio.', buttons: [{ label: 'Ir a Laboratorio', area: 'laboratorio' }] };
    }
    if (queryNorm.includes('compras')) {
      return { intentFound: 'nav_compras', text: '🛍️ Te dirijo al Módulo de Compras.', buttons: [{ label: 'Ir a Compras', area: 'compras' }] };
    }
    if (queryNorm.includes('homologacion')) {
      return { intentFound: 'nav_homo', text: '🔄 Te dirijo a Homologación.', buttons: [{ label: 'Ir a Homologación', area: 'homologacion' }] };
    }
    if (queryNorm.includes('patronaje')) {
      return { intentFound: 'nav_patro', text: '✂️ Te dirijo a Patronaje.', buttons: [{ label: 'Ir a Patronaje', area: 'patronaje' }] };
    }
    if (queryNorm.includes('corte')) {
      return { intentFound: 'nav_corte', text: '📐 Te dirijo a Corte.', buttons: [{ label: 'Ir a Corte', area: 'corte' }] };
    }
    if (queryNorm.includes('biblioteca') || queryNorm.includes('ficha')) {
      return { intentFound: 'nav_biblio', text: '📄 Te dirijo al Explorador de Fichas Técnicas.', buttons: [{ label: 'Abrir Fichas Técnicas', modal: 'ficha' }] };
    }
    if (queryNorm.includes('indicadores') || queryNorm.includes('dashboard')) {
      return { intentFound: 'nav_dash', text: '📊 Te dirijo al Dashboard de Indicadores.', buttons: [{ label: 'Ir a Dashboard', area: 'dashboard' }] };
    }
  }

  // 10. RESPUESTA FALLBACK GENERAL INTELIGENTE Y CLARA
  return {
    intentFound: 'fallback',
    text: `🤖 Comprendo tu inquietud sobre **"${consulta}"**.

Puedo ayudarte de forma concreta en cualquiera de los siguientes aspectos:
* **Fichas Técnicas Obligatorias**: Explica por qué se rechaza una solicitud si la tela no tiene ficha técnica del proveedor.
* **Búsquedas Rápidas**: Escribe el número de solicitud (ej. \`SOL-TEL-2026-001\`), la referencia o el proveedor.
* **Módulos del Sistema**: Navega entre Compras, Laboratorio, Evaluaciones e Indicadores.

¿Sobre cuál de estos temas deseas mayor información?`,
    buttons: [
      { label: '🧪 Ir a Laboratorio', area: 'laboratorio' },
      { label: '🛍️ Ir a Compras', area: 'compras' },
      { label: '📄 Abrir Fichas', modal: 'ficha' }
    ]
  };
}
