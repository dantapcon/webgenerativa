/**
 * Convierte una URL de Google Drive a una URL que se puede usar directamente en img src
 * @param driveUrl - URL de Google Drive (ejemplo: https://drive.google.com/file/d/FILE_ID/view)
 * @returns URL directa para usar en img src
 */
export function convertGoogleDriveUrl(driveUrl: string): string {
  // Extraer el ID del archivo de diferentes formatos de URL de Google Drive
  let fileId: string | null = null;
  
  // Formato: https://drive.google.com/file/d/FILE_ID/view
  const viewMatch = driveUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (viewMatch) {
    fileId = viewMatch[1];
  }
  
  // Formato: https://drive.google.com/open?id=FILE_ID
  const openMatch = driveUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (openMatch) {
    fileId = openMatch[1];
  }
  
  // Si encontramos el ID, convertirlo al formato directo
  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Si no es una URL de Google Drive, devolver la URL original
  return driveUrl;
}

/**
 * Determina si una URL es de Google Drive
 * @param url - URL a verificar
 * @returns true si es una URL de Google Drive
 */
export function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com');
}

/**
 * Procesa una URL de imagen para asegurar que sea mostrable
 * @param imageUrl - URL de la imagen
 * @returns URL procesada que se puede usar en img src
 */
export function processImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  // Si es una URL de Google Drive, convertirla
  if (isGoogleDriveUrl(imageUrl)) {
    return convertGoogleDriveUrl(imageUrl);
  }
  
  // Para otras URLs, devolver tal como están
  return imageUrl;
}