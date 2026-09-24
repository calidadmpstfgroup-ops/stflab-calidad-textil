/**
 * Utilidades de URL pública para el Portal de Proveedores con Token
 */

export function getPortalPublicUrl(token: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  return `${origin}/?portal_proveedor=${encodeURIComponent(token)}`;
}
