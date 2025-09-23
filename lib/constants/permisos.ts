// Constantes de permisos para administradores de empresas
// Basado en las secciones existentes del editor de empresa

export const SECCIONES_EDITABLES = {
  // Información básica de la empresa
  'info_basica': {
    id: 'info_basica',
    nombre: 'Información Básica',
    descripcion: 'Editar nombre, descripción y datos generales de la empresa',
    icono: '📝',
    campos: ['nombre_empresa', 'descripcion_empresa', 'tipo_negocio']
  },
  
  // Información de contacto
  'info_contacto': {
    id: 'info_contacto', 
    nombre: 'Información de Contacto',
    descripcion: 'Editar teléfono, email, dirección y datos de contacto',
    icono: '📞',
    campos: ['telefono_empresa', 'correo_empresa', 'direccion_empresa']
  },
  
  // Personalización visual (colores, tipografía, logo)
  'personalizacion_visual': {
    id: 'personalizacion_visual',
    nombre: 'Personalización Visual', 
    descripcion: 'Editar colores, tipografía, logo y elementos visuales',
    icono: '🎨',
    campos: ['color_primario', 'color_secundario', 'tipografia', 'logo_url', 'logo_tamano', 'logo_posicion']
  },
  
  // Configuración adicional (hero, fondos)
  'configuracion_adicional': {
    id: 'configuracion_adicional',
    nombre: 'Configuración Adicional',
    descripcion: 'Editar sección hero, fondos y configuraciones avanzadas',
    icono: '⚙️',
    campos: ['hero_fondo_tipo', 'hero_imagen_fondo', 'descripcion_fondo_tipo', 'descripcion_imagen_fondo', 'video_promocional_url']
  },
  
  // Ventana flotante
  'ventana_flotante': {
    id: 'ventana_flotante',
    nombre: 'Ventana Flotante de Bienvenida',
    descripcion: 'Configurar y editar la ventana flotante promocional',
    icono: '💬',
    campos: ['activo', 'titulo', 'mensaje', 'imagen_url', 'video_url', 'fondo_tipo', 'fondo_color', 'fondo_imagen']
  },
  
  // Sucursales y ubicaciones
  'sucursales': {
    id: 'sucursales',
    nombre: 'Sucursales y Ubicaciones',
    descripcion: 'Gestionar sucursales, direcciones y ubicaciones',
    icono: '📍',
    campos: ['sucursales_activo'] // Los datos específicos están en tabla sucursales
  },
  
  // Categorías y productos/servicios
  'categorias': {
    id: 'categorias',
    nombre: 'Categorías',
    descripcion: 'Gestionar categorías, productos y servicios',
    icono: '📂', 
    campos: [] // Los datos específicos están en tablas categorias, productos, servicios
  },

  // Fondos personalizados de categorías
  'fondos_categorias': {
    id: 'fondos_categorias',
    nombre: 'Fondos de Categorías',
    descripcion: 'Configurar colores e imágenes de fondo para cada categoría',
    icono: '🖼️',
    campos: ['fondo_tipo', 'fondo_color', 'fondo_imagen'] // Campos específicos de tabla categorias
  }
} as const;

// Tipo TypeScript para los permisos
export type SeccionEditable = keyof typeof SECCIONES_EDITABLES;

// Array con todas las secciones disponibles
export const TODAS_LAS_SECCIONES = Object.values(SECCIONES_EDITABLES);

// Helper para verificar si una sección existe
export const esSeccionValida = (seccion: string): seccion is SeccionEditable => {
  return seccion in SECCIONES_EDITABLES;
};

// Helper para obtener información de una sección
export const obtenerSeccion = (id: SeccionEditable) => {
  return SECCIONES_EDITABLES[id];
};

// Para uso en la base de datos - IDs de permisos
export const IDS_PERMISOS = Object.keys(SECCIONES_EDITABLES) as SeccionEditable[];