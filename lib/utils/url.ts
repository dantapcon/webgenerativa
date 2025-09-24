/**
 * Obtiene la URL base de la aplicación según el entorno
 * - En desarrollo: http://localhost:3000
 * - En producción: https://webgenerativa.vercel.app o el dominio configurado
 */
export function getBaseUrl(): string {
  // En el servidor (SSR), usar variables de entorno
  if (typeof window === 'undefined') {
    // En Vercel, VERCEL_URL contiene el dominio de la aplicación
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // En desarrollo local
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  // En el cliente, usar window.location.origin
  return window.location.origin;
}

/**
 * Obtiene la URL de producción de la aplicación
 * Usar solo cuando necesites forzar la URL de producción
 */
export function getProductionUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://webgenerativa.vercel.app';
}

/**
 * Obtiene la URL de redirección completa para el reseteo de contraseña
 * @returns URL completa para redirección
 */
export function getPasswordResetRedirectUrl(): string {
  return `${getBaseUrl()}/auth/callback`;
}