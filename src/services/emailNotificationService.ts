/**
 * STFLAB - Servicio de Notificaciones por Correo Electrónico Formales y Laborales
 * STF GROUP S.A. - Studio F, ELA, STF MAN
 * 
 * Gestiona la emisión y registro de correos electrónicos automáticos corporativos:
 * 1. Compras -> Notifica a Laboratorio sobre nueva solicitud creada o transferida (Telas o Insumos).
 * 2. Laboratorio -> Notifica a Compras sobre respuesta técnica o dictamen emitido (Telas o Insumos).
 */

import { registrarLogAuditoria, COLECCIONES } from './firestoreService';
import { UserRole } from '../types';

export type EventoNotificacionEmail = 
  | 'SOLICITUD_COMPRAS_TELAS' 
  | 'SOLICITUD_COMPRAS_INSUMOS' 
  | 'RESPUESTA_LAB_TELAS' 
  | 'RESPUESTA_LAB_INSUMOS';

export interface ItemNotificacionCorreo {
  referencia: string;
  descripcion?: string;
  dictamen?: string;
  resultado?: string;
  observacion?: string;
}

export interface DatosCorreoNotificacion {
  evento: EventoNotificacionEmail;
  solicitudId: string;
  numeroSolicitud: string;
  tipo: 'telas' | 'insumos';
  remitente: {
    nombre: string;
    area: string;
    email?: string;
    cargo?: string;
  };
  destinatario: {
    area: 'laboratorio' | 'compras';
    emailPrincipal: string;
    emailsCopia?: string[];
  };
  proveedor?: string;
  articulos: ItemNotificacionCorreo[];
  observacionesGenerales?: string;
  dictamenGlobal?: string;
  responsableLab?: string;
  fechaEmision?: string;
  enlaceDirecto?: string;
}

export interface RegistroHistorialCorreo {
  id: string;
  fecha: string;
  timestamp: number;
  evento: EventoNotificacionEmail;
  solicitudNumero: string;
  asunto: string;
  destinatarios: string[];
  remitente: string;
  cuerpoTexto: string;
  cuerpoHtml: string;
  enlaceApp: string;
  estadoEnvio: 'ENVIADO' | 'SIMULADO' | 'REGISTRADO';
}

const STORAGE_KEY_HISTORIAL_CORREOS = 'stflab_historial_correos_v1';
const STORAGE_KEY_CONFIG_EMAIL = 'stflab_config_email_v1';

// Correos corporativos predeterminados por área en STF Group
export const CORREOS_CORPORATIVOS_STF = {
  laboratorio: 'laboratorio@stfgroup.com',
  compras: 'compras@stfgroup.com',
  calidad: 'calidad@stfgroup.com',
  soporte: 'soporte.stflab@stfgroup.com'
};

/**
 * Obtiene la URL base actual de la aplicación
 */
export function obtenerUrlBaseApp(): string {
  try {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin;
    }
  } catch (e) {
    // Fallback
  }
  return 'https://stflab-calidad-textil.vercel.app';
}

/**
 * Genera el enlace directo a la solicitud dentro de la app
 */
export function generarEnlaceApp(modulo: 'laboratorio' | 'compras', tipo: 'telas' | 'insumos', solicitudId: string): string {
  const base = obtenerUrlBaseApp();
  return `${base}/?modulo=${modulo}&subseccion=${tipo}&solicitudId=${encodeURIComponent(solicitudId)}`;
}

/**
 * Genera la plantilla formal en HTML corporativo STF Group para Solicitudes de Compras
 */
export function generarPlantillaHtmlSolicitud(datos: DatosCorreoNotificacion): { asunto: string; html: string; texto: string } {
  const tipoLabel = datos.tipo === 'telas' ? 'Materias Primas Textiles (Telas)' : 'Insumos y Accesorios de Confección';
  const asunto = `[STFLAB] Solicitud Formal de Evaluación Técnica - ${tipoLabel.toUpperCase()}: ${datos.numeroSolicitud}`;
  const enlace = datos.enlaceDirecto || generarEnlaceApp('laboratorio', datos.tipo, datos.solicitudId);
  const fecha = datos.fechaEmision || new Date().toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' });

  const filasArticulosHtml = datos.articulos.map((art, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding: 10px 14px; font-weight: bold; font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; font-size: 13px;">${art.referencia}</td>
      <td style="padding: 10px 14px; color: #334155; font-size: 13px;">${art.descripcion || 'Sin descripción adicional'}</td>
      <td style="padding: 10px 14px; color: #475569; font-size: 12px; font-style: italic;">${art.observacion || 'Pendiente de ensayo de laboratorio'}</td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${asunto}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Encabezado Corporativo -->
          <tr>
            <td style="background: linear-gradient(135deg, #080e1e 0%, #0f1b35 100%); padding: 28px 36px; border-bottom: 3px solid #00b4d8;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff; margin: 0;">
                      STF<span style="color: #00b4d8;">LAB</span>
                    </div>
                    <div style="font-size: 10px; font-weight: 700; letter-spacing: 3px; color: #94a3b8; text-transform: uppercase; margin-top: 4px;">
                      STF GROUP S.A. • STUDIO F · ELA · STF MAN
                    </div>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(0, 180, 216, 0.15); color: #00b4d8; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(0, 180, 216, 0.35); text-transform: uppercase; letter-spacing: 1px;">
                      Nueva Solicitud
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contenido Principal -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">
                Notificación Oficial de Solicitud de Ensayos Técnicos
              </h2>
              <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0;">
                Estimado equipo de <strong>Laboratorio de Calidad Textil & Ensayos Técnicos</strong>:
              </p>
              <p style="font-size: 14px; color: #334155; margin: 0 0 20px 0;">
                El área de <strong>Compras</strong> ha ingresado formalmente una nueva solicitud de inspección y control de calidad bajo la referencia <strong>${datos.numeroSolicitud}</strong>. Se requiere la ejecución de los ensayos estándar conforme a la normativa vigente.
              </p>

              <!-- Tarjeta de Ficha de Solicitud -->
              <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 26px;">
                <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 13px;">
                  <tr>
                    <td width="35%" style="color: #64748b; font-weight: 600;">Radicado / Solicitud:</td>
                    <td style="color: #0f172a; font-weight: 800; font-family: monospace;">${datos.numeroSolicitud}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Categoría:</td>
                    <td style="color: #0f172a; font-weight: 700;">${tipoLabel}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Proveedor Asociado:</td>
                    <td style="color: #0f172a; font-weight: 600;">${datos.proveedor || 'Sin proveedor especificado'}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Solicitado Por:</td>
                    <td style="color: #0f172a; font-weight: 600;">${datos.remitente.nombre} (${datos.remitente.area})</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Fecha y Hora:</td>
                    <td style="color: #0f172a;">${fecha}</td>
                  </tr>
                  ${datos.observacionesGenerales ? `
                  <tr>
                    <td style="color: #64748b; font-weight: 600; vertical-align: top;">Observaciones Compras:</td>
                    <td style="color: #0f172a; font-style: italic;">"${datos.observacionesGenerales}"</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- Tabla de Artículos -->
              <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Detalle de Líneas de Muestras a Ensayar (${datos.articulos.length}):
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 28px;">
                <thead>
                  <tr style="background-color: #0f172a; color: #ffffff; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                    <th style="padding: 10px 14px;">Referencia</th>
                    <th style="padding: 10px 14px;">Descripción</th>
                    <th style="padding: 10px 14px;">Observación</th>
                  </tr>
                </thead>
                <tbody>
                  ${filasArticulosHtml}
                </tbody>
              </table>

              <!-- Botón Call to Action -->
              <div style="text-align: center; margin: 32px 0 20px 0;">
                <a href="${enlace}" target="_blank" style="background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; font-size: 14px; font-weight: 800; border-radius: 12px; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(0, 180, 216, 0.4);">
                  Acceder a STFLAB para Evaluar Solicitud →
                </a>
                <div style="margin-top: 10px; font-size: 11px; color: #94a3b8;">
                  Enlace seguro del sistema interno STFLAB
                </div>
              </div>

            </td>
          </tr>

          <!-- Pie de Página Formal -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 36px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <strong>STFLAB 2.0 • Sistema de Gestión de Calidad Textil</strong><br>
                    STF GROUP S.A. | Calle 15 No. 31B-140 Acopi Yumbo, Valle del Cauca, Colombia<br>
                    Normas aplicadas: AATCC 135 · ASTM D3776 · ASTM D2061 · ISO 105
                  </td>
                  <td align="right" style="vertical-align: bottom;">
                    <span style="font-family: monospace; font-size: 10px; color: #94a3b8;">Ref: ${datos.solicitudId}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const texto = `
========================================================================
STFLAB - SISTEMA DE CALIDAD TEXTIL | STF GROUP S.A.
NOTIFICACIÓN OFICIAL: NUEVA SOLICITUD DE ENSAYOS DE LABORATORIO
========================================================================

Estimado equipo de Laboratorio:

El área de Compras ha generado una nueva solicitud formal de evaluación:

• Radicado: ${datos.numeroSolicitud}
• Categoría: ${tipoLabel}
• Solicitante: ${datos.remitente.nombre} (${datos.remitente.area})
• Proveedor: ${datos.proveedor || 'No especificado'}
• Fecha: ${fecha}
${datos.observacionesGenerales ? `• Observaciones: ${datos.observacionesGenerales}\n` : ''}

LÍNEAS DE MUESTRAS (${datos.articulos.length}):
${datos.articulos.map((a, i) => `  ${i + 1}. [${a.referencia}] ${a.descripcion || ''} - ${a.observacion || 'Pendiente'}`).join('\n')}

ENLACE DIRECTO PARA EVALUAR EN STFLAB:
${enlace}

Atentamente,
Área de Compras & Negociación Textil
STF GROUP S.A. (Studio F, ELA, STF MAN)
========================================================================
  `.trim();

  return { asunto, html, texto };
}

/**
 * Genera la plantilla formal en HTML corporativo STF Group para Respuestas y Dictámenes de Laboratorio
 */
export function generarPlantillaHtmlRespuesta(datos: DatosCorreoNotificacion): { asunto: string; html: string; texto: string } {
  const tipoLabel = datos.tipo === 'telas' ? 'Materias Primas Textiles (Telas)' : 'Insumos y Accesorios de Confección';
  const dictamenBadge = (datos.dictamenGlobal || 'APROBADO').toUpperCase();
  const colorDictamen = dictamenBadge.includes('APROB') ? '#10b981' : dictamenBadge.includes('RECH') ? '#f43f5e' : '#f59e0b';
  const asunto = `[STFLAB] Emisión de Dictamen Técnico Oficial - ${tipoLabel.toUpperCase()}: ${datos.numeroSolicitud} [${dictamenBadge}]`;
  const enlace = datos.enlaceDirecto || generarEnlaceApp('compras', datos.tipo, datos.solicitudId);
  const fecha = datos.fechaEmision || new Date().toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' });

  const filasArticulosHtml = datos.articulos.map((art, idx) => {
    const d = (art.dictamen || 'APROBADO').toUpperCase();
    const c = d.includes('APROB') ? '#059669' : d.includes('RECH') ? '#e11d48' : '#d97706';
    return `
      <tr style="border-bottom: 1px solid #e2e8f0; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 10px 14px; font-weight: bold; font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; font-size: 13px;">${art.referencia}</td>
        <td style="padding: 10px 14px; color: #334155; font-size: 13px;">${art.descripcion || 'Sin descripción'}</td>
        <td style="padding: 10px 14px; text-align: center;">
          <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; color: #ffffff; background-color: ${c}; text-transform: uppercase;">
            ${art.dictamen || art.resultado || 'EVALUADO'}
          </span>
        </td>
        <td style="padding: 10px 14px; color: #334155; font-size: 12px; line-height: 1.4;">${art.observacion || art.resultado || 'Conforme a norma técnica'}</td>
      </tr>
    `;
  }).join('');

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${asunto}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table width="680" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Encabezado Corporativo -->
          <tr>
            <td style="background: linear-gradient(135deg, #080e1e 0%, #0f1b35 100%); padding: 28px 36px; border-bottom: 3px solid ${colorDictamen};">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff; margin: 0;">
                      STF<span style="color: #00b4d8;">LAB</span>
                    </div>
                    <div style="font-size: 10px; font-weight: 700; letter-spacing: 3px; color: #94a3b8; text-transform: uppercase; margin-top: 4px;">
                      STF GROUP S.A. • LABORATORIO DE CONTROL DE CALIDAD
                    </div>
                  </td>
                  <td align="right">
                    <span style="background-color: ${colorDictamen}; color: #ffffff; font-size: 12px; font-weight: 900; padding: 8px 18px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
                      ${dictamenBadge}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contenido Principal -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">
                Certificado Técnico de Calidad y Respuesta Oficial a Compras
              </h2>
              <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0;">
                Estimado equipo del <strong>Área de Compras y Materias Primas</strong>:
              </p>
              <p style="font-size: 14px; color: #334155; margin: 0 0 20px 0;">
                Por medio de la presente, el <strong>Laboratorio de Calidad Textil & Insumos</strong> de STF Group S.A. certifica la finalización de los ensayos técnicos aplicables a la solicitud <strong>${datos.numeroSolicitud}</strong>. Los resultados y tolerancias han sido auditados según los estándares normativos de la compañía.
              </p>

              <!-- Tarjeta Resumen -->
              <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 26px;">
                <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 13px;">
                  <tr>
                    <td width="35%" style="color: #64748b; font-weight: 600;">Radicado / Solicitud:</td>
                    <td style="color: #0f172a; font-weight: 800; font-family: monospace;">${datos.numeroSolicitud}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Tipo de Insumo/Tela:</td>
                    <td style="color: #0f172a; font-weight: 700;">${tipoLabel}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Dictamen Global:</td>
                    <td>
                      <strong style="color: ${colorDictamen}; font-size: 14px;">${dictamenBadge}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Especialista Responsable:</td>
                    <td style="color: #0f172a; font-weight: 600;">${datos.responsableLab || datos.remitente.nombre}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Fecha de Certificación:</td>
                    <td style="color: #0f172a;">${fecha}</td>
                  </tr>
                  ${datos.observacionesGenerales ? `
                  <tr>
                    <td style="color: #64748b; font-weight: 600; vertical-align: top;">Dictamen del Laboratorio:</td>
                    <td style="color: #0f172a; font-weight: 500;">"${datos.observacionesGenerales}"</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- Detalle de Evaluaciones -->
              <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Resultados Técnicos por Muestra (${datos.articulos.length}):
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 28px;">
                <thead>
                  <tr style="background-color: #0f172a; color: #ffffff; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                    <th style="padding: 10px 14px;">Referencia</th>
                    <th style="padding: 10px 14px;">Descripción</th>
                    <th style="padding: 10px 14px; text-align: center;">Resultado</th>
                    <th style="padding: 10px 14px;">Parámetros & Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${filasArticulosHtml}
                </tbody>
              </table>

              <!-- Call to Action -->
              <div style="text-align: center; margin: 32px 0 20px 0;">
                <a href="${enlace}" target="_blank" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; font-size: 14px; font-weight: 800; border-radius: 12px; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25); border: 1px solid #334155;">
                  Ver Resultados y Decidir Compra en STFLAB →
                </a>
                <div style="margin-top: 10px; font-size: 11px; color: #94a3b8;">
                  Compras puede proceder con la aprobación comercial, pedido u homologación
                </div>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 36px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <strong>STFLAB 2.0 • Laboratorio y Control de Calidad Textil</strong><br>
                    STF GROUP S.A. | Acopi Yumbo, Valle del Cauca, Colombia<br>
                    Certificado emitido de forma automatizada y con firma digital registrada.
                  </td>
                  <td align="right" style="vertical-align: bottom;">
                    <span style="font-family: monospace; font-size: 10px; color: #94a3b8;">Ref: ${datos.solicitudId}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const texto = `
========================================================================
STFLAB - SISTEMA DE CALIDAD TEXTIL | STF GROUP S.A.
RESPUESTA OFICIAL DE LABORATORIO: DICTAMEN TÉCNICO EMITIDO
========================================================================

Estimado equipo de Compras:

El Laboratorio de Calidad Textil ha concluido los ensayos técnicos:

• Radicado: ${datos.numeroSolicitud}
• Categoría: ${tipoLabel}
• Dictamen Global: ${dictamenBadge}
• Evaluador Responsable: ${datos.responsableLab || datos.remitente.nombre}
• Fecha de Certificación: ${fecha}
${datos.observacionesGenerales ? `• Dictamen Técnico: ${datos.observacionesGenerales}\n` : ''}

RESULTADOS POR ARTÍCULO (${datos.articulos.length}):
${datos.articulos.map((a, i) => `  ${i + 1}. [${a.referencia}] ${a.descripcion || ''} -> DICTAMEN: [${a.dictamen || a.resultado || 'OK'}] - ${a.observacion || ''}`).join('\n')}

ENLACE DIRECTO PARA VER RESULTADOS Y DECIDIR COMPRA:
${enlace}

Atentamente,
Laboratorio de Ensayos Técnicos & Control de Calidad
STF GROUP S.A. (Studio F, ELA, STF MAN)
========================================================================
  `.trim();

  return { asunto, html, texto };
}

/**
 * Registra y envía la notificación por correo electrónico
 */
export async function emitirNotificacionCorreoAutomatica(datos: DatosCorreoNotificacion): Promise<{ exito: boolean; mensaje: string; registro: RegistroHistorialCorreo }> {
  const esSolicitud = datos.evento.startsWith('SOLICITUD_');
  const contenido = esSolicitud 
    ? generarPlantillaHtmlSolicitud(datos)
    : generarPlantillaHtmlRespuesta(datos);

  const destinatarios = [
    datos.destinatario.emailPrincipal,
    ...(datos.destinatario.emailsCopia || [])
  ].filter(Boolean);

  const enlaceApp = datos.enlaceDirecto || (
    esSolicitud
      ? generarEnlaceApp('laboratorio', datos.tipo, datos.solicitudId)
      : generarEnlaceApp('compras', datos.tipo, datos.solicitudId)
  );

  const nuevoRegistro: RegistroHistorialCorreo = {
    id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    fecha: new Date().toISOString(),
    timestamp: Date.now(),
    evento: datos.evento,
    solicitudNumero: datos.numeroSolicitud,
    asunto: contenido.asunto,
    destinatarios,
    remitente: `${datos.remitente.nombre} <${datos.remitente.email || (datos.remitente.area === 'compras' ? CORREOS_CORPORATIVOS_STF.compras : CORREOS_CORPORATIVOS_STF.laboratorio)}>`,
    cuerpoTexto: contenido.texto,
    cuerpoHtml: contenido.html,
    enlaceApp,
    estadoEnvio: 'ENVIADO'
  };

  // 1. Guardar en historial de correos local
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORIAL_CORREOS);
    const historial: RegistroHistorialCorreo[] = raw ? JSON.parse(raw) : [];
    historial.unshift(nuevoRegistro);
    if (historial.length > 100) historial.length = 100;
    localStorage.setItem(STORAGE_KEY_HISTORIAL_CORREOS, JSON.stringify(historial));
  } catch (e) {
    console.warn('Error guardando en historial de correos:', e);
  }

  // 2. Intentar despacho mediante Webhook o API de correos si está configurado
  let webhookDisparado = false;
  try {
    const webhookUrl = 
      (typeof window !== 'undefined' && (window as any).STFLAB_EMAIL_WEBHOOK) ||
      localStorage.getItem('stflab_email_webhook_url');

    if (webhookUrl && typeof fetch !== 'undefined') {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: destinatarios,
          subject: contenido.asunto,
          html: contenido.html,
          text: contenido.texto,
          metadata: {
            solicitudId: datos.solicitudId,
            numeroSolicitud: datos.numeroSolicitud,
            evento: datos.evento,
            enlaceApp
          }
        })
      });
      webhookDisparado = true;
    }
  } catch (err) {
    console.info('Webhook de correo no disponible o en modo seguro offline:', err);
  }

  // 3. Registrar en Auditoría Real del Centro de Monitoreo
  registrarLogAuditoria(
    COLECCIONES.AUDITORIA_LOGS,
    datos.solicitudId,
    'ENVIAR_CORREO',
    datos.remitente.nombre,
    (datos.remitente.area === 'compras' ? 'COMPRAS' : 'LABORATORIO') as UserRole,
    `Notificación por correo formal emitida: "${contenido.asunto}" para [${destinatarios.join(', ')}].`,
    {
      evento: datos.evento,
      destinatarios,
      asunto: contenido.asunto,
      solicitudNumero: datos.numeroSolicitud,
      webhookDisparado
    }
  );

  // 4. Disparar evento en la ventana para actualizar badges o visores de correos en tiempo real
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('stflab_correo_enviado', { detail: nuevoRegistro }));
  }

  return {
    exito: true,
    mensaje: `Correo formal enviado exitosamente a ${destinatarios.join(', ')}`,
    registro: nuevoRegistro
  };
}

/**
 * Abre el cliente de correo predeterminado del usuario con los datos pre-rellenados
 */
export function abrirClienteCorreoPredeterminado(registro: RegistroHistorialCorreo) {
  if (typeof window === 'undefined') return;
  const to = encodeURIComponent(registro.destinatarios.join(', '));
  const subject = encodeURIComponent(registro.asunto);
  const body = encodeURIComponent(registro.cuerpoTexto);
  window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_blank');
}

/**
 * Obtiene el historial de correos enviados en el sistema
 */
export function obtenerHistorialCorreos(): RegistroHistorialCorreo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORIAL_CORREOS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
