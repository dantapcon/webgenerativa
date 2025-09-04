// Tipos TypeScript para WebGenerator Pro

export interface Empresa {
  id: number;
  nombre_empresa: string;
  slug_empresa: string;
  descripcion_empresa?: string | null;
  correo_empresa?: string | null;
  telefono_empresa?: string | null;
  direccion_empresa?: string | null;
  tipo_negocio?: string | null;
  dominio_deseado?: string | null;
  subdominio_generado?: string | null;
  logo_url?: string | null;
  logo_tamano?: string | null;
  logo_posicion?: 'izquierda' | 'centro' | 'derecha' | null;
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

export interface EmpresaCompleta extends Empresa {
  categorias?: Categoria[];
  subcategorias?: Subcategoria[];
}

// Tipos para formularios
export interface EmpresaFormData {
  // Datos básicos de empresa
  nombre_empresa: string;
  slug_empresa?: string;
  descripcion_empresa?: string;
  correo_empresa?: string;
  telefono_empresa?: string;
  direccion_empresa?: string;
  tipo_negocio?: string;
  dominio_deseado?: string;
  logo_url?: string;
  logo_tamano?: string;
  logo_posicion?: 'izquierda' | 'centro' | 'derecha';
  video_promocional_url?: string;
  
  // Estilos y personalización
  color_primario?: string;
  color_secundario?: string;
  tipografia?: string;
  
  // Categorías y subcategorías
  categorias?: Array<{
    nombre: string;
    descripcion?: string;
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
