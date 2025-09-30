// Utilidades para manejo de colores

/**
 * Convierte un color base + brillo + opacidad a un valor CSS RGBA
 * @param colorBase - Color en formato hex (#ffffff)
 * @param brillo - Brillo de 0 a 200% (100% es normal)
 * @param opacidad - Opacidad de 0 a 100%
 * @returns Color en formato RGBA
 */
export function aplicarBrilloOpacidad(colorBase: string, brillo: number, opacidad: number): string {
  // Convertir hex a RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb = hexToRgb(colorBase);
  if (!rgb) return colorBase;

  // Aplicar brillo (0-200%, donde 100% es normal)
  const factor = brillo / 100;
  const r = Math.min(255, Math.round(rgb.r * factor));
  const g = Math.min(255, Math.round(rgb.g * factor));
  const b = Math.min(255, Math.round(rgb.b * factor));
  
  // Aplicar opacidad (0-100%)
  const alpha = opacidad / 100;
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}