// Tipos TypeScript para WebGenerator Pro

export interface Empresa {
  id: number;
  nombre_empresa: string;
  slug_empresa: string;
  descripcion_empresa?: string | null;
  hero_fondo_tipo?: 'color' | 'imagen' | null;
  hero_imagen_fondo?: string | null;
  descripcion_fondo_tipo?: 'color' | 'imagen' | null;
  descripcion_imagen_fondo?: string | null;
  video_descripcion?: string | null;
  // Campos para el modal de consejo diario
  modal_activo?: boolean | null;
  modal_titulo?: string | null;
  modal_mensaje?: string | null;
  modal_imagen_url?: string | null;
  modal_video_url?: string | null;
  modal_fondo_tipo?: 'color' | 'imagen' | null;
  modal_fondo_color?: string | null;
  modal_fondo_imagen?: string | null;
  // Campo para sucursales/ubicaciones
  sucursales_activo?: boolean | null;
  correo_empresa?: string | null;
  telefono_empresa?: string | null;
  direccion_empresa?: string | null;
  tipo_negocio?: string | null;
  dominio_deseado?: string | null;
  subdominio_generado?: string | null;
  logo_url?: string | null;
  logo_tamano?: string | null;
  logo_tamano_px?: number | null;
  logo_posicion?: 'izquierda' | 'centro' | 'derecha' | null;
  titulo_tamano?: number | null;
  video_promocional_url?: string | null;
  color_primario?: string | null;
  color_secundario?: string | null;
  tipografia?: string | null;
  plantilla_id?: number | null;
  estado_sitio: 'creando' | 'publicado' | 'error' | 'mantenimiento';
  ssl_activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  creado_por?: number | null;
}

export interface Categoria {
  id: number;
  empresa_id: number;
  nombre: string;
  descripcion?: string | null;
  tipo_display?: 'horizontal' | 'vertical' | null;
  orden: number;
  visible: boolean;
  fecha_creacion: string;
  subcategorias?: Subcategoria[];
}

export interface Subcategoria {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion?: string | null;
  imagen_url?: string | null;
  enlace_externo?: string | null;
  orden: number;
  visible: boolean;
  fecha_creacion: string;
}

export interface Sucursal {
  id: number;
  empresa_id: number; // Cambiado de string a number para que coincida con Empresa.id
  nombre: string;
  direccion: string;
  telefono?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  horario_lunes?: string | null;
  horario_martes?: string | null;
  horario_miercoles?: string | null;
  horario_jueves?: string | null;
  horario_viernes?: string | null;
  horario_sabado?: string | null;
  horario_domingo?: string | null;
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface EmpresaCompleta extends Empresa {
  categorias?: Categoria[];
  subcategorias?: Subcategoria[];
  sucursales?: Sucursal[];
}

// Tipos para formularios
export interface EmpresaFormData {
  // Datos básicos de empresa
  nombre_empresa: string;
  slug_empresa?: string;
  descripcion_empresa?: string;
  // Campos para personalizar el hero/banner
  hero_fondo_tipo?: 'color' | 'imagen';
  hero_imagen_fondo?: string;
  // Campos para personalizar el fondo de la descripción
  descripcion_fondo_tipo?: 'color' | 'imagen';
  descripcion_imagen_fondo?: string;
  video_descripcion?: string;
  // Campos para el modal de consejo diario
  modal_activo?: boolean;
  modal_titulo?: string;
  modal_mensaje?: string;
  modal_imagen_url?: string;
  modal_video_url?: string;
  modal_fondo_tipo?: 'color' | 'imagen';
  modal_fondo_color?: string;
  modal_fondo_imagen?: string;
  // Campo para sucursales/ubicaciones
  sucursales_activo?: boolean;
  correo_empresa?: string;
  telefono_empresa?: string;
  direccion_empresa?: string;
  tipo_negocio?: string;
  dominio_deseado?: string;
  logo_url?: string;
  logo_tamano?: string;
  logo_tamano_px?: number;
  logo_posicion?: 'izquierda' | 'centro' | 'derecha';
  titulo_tamano?: number;
  video_promocional_url?: string;
  
  // Estilos y personalización
  color_primario?: string;
  color_secundario?: string;
  tipografia?: string;
  
  // Categorías y subcategorías
  categorias?: Array<{
    nombre: string;
    descripcion?: string;
    tipo_display?: 'horizontal' | 'vertical';
    orden: number;
    subcategorias?: Array<{
      nombre: string;
      descripcion?: string;
      imagen_url?: string;
      enlace_externo?: string;
      orden: number;
    }>;
  }>;
}

// Respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateEmpresaResponse {
  success: boolean;
  message: string;
  empresa_id: number;
  website_url: string;
}
