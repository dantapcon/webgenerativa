// Tipos TypeScript para WebGenerator Pro

// Nuevos tipos para colorimetría
export interface Colorimetria {
  id: number;
  referencia_id: number;
  tipo_elemento: 'empresa' | 'categoria' | 'subcategoria' | 'ventana_flotante';
  subtipo: 'primario' | 'secundario' | 'terciario' | 'fondo';
  color: string;
  brillo: number; // 0-200%
  opacidad: number; // 0-100%
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ColoresElemento {
  primario?: Colorimetria;
  secundario?: Colorimetria;
  terciario?: Colorimetria;
  fondo?: Colorimetria;
}

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
  video_promocional_url?: string | null;
  // DEPRECATED: Usar tabla colorimetria
  color_primario?: string | null;
  color_secundario?: string | null;
  // Nuevos campos para colorimetría
  colores?: ColoresElemento;
  // REMOVIDO: tipografia y titulo_tamano (ya no existen en BD)
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
  fondo_tipo?: 'color' | 'imagen';
  // DEPRECATED: Usar tabla colorimetria
  fondo_color?: string;
  fondo_imagen?: string | null;
  // Nuevo campo para colorimetría
  colores?: ColoresElemento;
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
  // Nuevos campos de fondo
  fondo_tipo?: 'color' | 'imagen';
  fondo_color?: string;
  fondo_imagen?: string | null;
  // Nuevo campo para colorimetría
  colores?: ColoresElemento;
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

export interface VentanaFlotante {
  id: number;
  empresa_id: number;
  activo: boolean;
  titulo?: string | null;
  mensaje?: string | null;
  imagen_url?: string | null;
  video_url?: string | null;
  fondo_tipo?: 'color' | 'imagen' | null;
  // DEPRECATED: Usar tabla colorimetria
  fondo_color?: string | null;
  fondo_imagen?: string | null;
  // Nuevo campo para colorimetría
  colores?: ColoresElemento;
  created_at: string;
  updated_at: string;
}

export interface Producto {
  id: number;
  empresa_id: number;
  categoria_id?: number | null;
  subcategoria_id?: number | null;
  nombre: string;
  descripcion?: string | null;
  precio?: number | null;
  imagen_url?: string | null;
  orden: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  descuento_prom: number; // Descuento promocional (0-100)
  promocion_activa: boolean;
  // Relaciones
  categoria?: Categoria;
  subcategoria?: Subcategoria;
}

export interface EmpresaCompleta extends Empresa {
  colores?: ColoresElemento;
  categorias?: Categoria[];
  subcategorias?: Subcategoria[];
  sucursales?: Sucursal[];
  productos?: Producto[];
  ventana_flotante?: VentanaFlotante;
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
  video_promocional_url?: string;
  
  // Estilos y personalización (DEPRECATED: usar tabla colorimetria)
  color_primario?: string;
  color_secundario?: string;
  color_terciario?: string; // NUEVO: para regla 60-30-10
  // REMOVIDO: tipografia y titulo_tamano (ya no existen en BD)
  
  // Categorías y subcategorías
  categorias?: Array<{
    nombre: string;
    descripcion?: string;
    tipo_display?: 'horizontal' | 'vertical';
    orden: number;
    fondo_tipo?: 'color' | 'imagen';
    fondo_color?: string;
    fondo_imagen?: string;
    subcategorias?: Array<{
      nombre: string;
      descripcion?: string;
      imagen_url?: string;
      enlace_externo?: string;
      orden: number;
    }>;
  }>;

  // Productos de la empresa
  productos?: Array<{
    nombre: string;
    descripcion?: string;
    precio?: number | null;
    imagen_url?: string;
    orden: number;
    activo?: boolean;
    descuento_prom?: number;
    promocion_activa?: boolean;
    categoria_nombre?: string; // Para asociar con categoría por nombre
    subcategoria_nombre?: string; // Para asociar con subcategoría por nombre
  }>;
}

// Datos del formulario para ventana flotante
export interface VentanaFlotanteFormData {
  activo?: boolean;
  titulo?: string;
  mensaje?: string;
  imagen_url?: string;
  video_url?: string;
  fondo_tipo?: 'color' | 'imagen';
  fondo_color?: string;
  fondo_imagen?: string;
}

// Formulario para productos
export interface ProductoFormData {
  empresa_id?: number;
  categoria_id?: number | null;
  subcategoria_id?: number | null;
  nombre: string;
  descripcion?: string;
  precio?: number | null;
  imagen_url?: string;
  orden?: number;
  activo?: boolean;
  descuento_prom?: number; // 0-100
  promocion_activa?: boolean;
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

// ===== TIPOS PARA CLÍNICAS OFTALMOLÓGICAS =====

// Clínica oftalmológica base
export interface ClinicaOftalmologica {
  id: string;
  titulo: string;
  lema?: string | null;
  logo_url?: string | null;
  quienes_somos: string;
  mision: string;
  vision: string;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// Estilos de clínica
export interface EstilosClinica {
  id: string;
  clinica_id: string;
  color_primario: string;
  color_secundario: string;
  color_acento: string;
  color_texto: string;
  color_fondo: string;
  fuente_principal: string;
  fuente_titulo: string;
  tamano_fuente: string;
  estilo_botones: string;
  tema_general: string;
  created_at: string;
  updated_at: string;
}

// Clínica completa con estilos
export interface ClinicaCompleta extends ClinicaOftalmologica {
  estilos?: EstilosClinica;
}

// Formulario para clínicas
export interface ClinicaFormData {
  titulo: string;
  lema?: string;
  logo_url?: string;
  quienes_somos: string;
  mision: string;
  vision: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  // Estilos incluidos en el formulario
  color_primario?: string;
  color_secundario?: string;
  color_acento?: string;
  color_texto?: string;
  color_fondo?: string;
  fuente_principal?: string;
  fuente_titulo?: string;
  tamano_fuente?: string;
  estilo_botones?: string;
  tema_general?: string;
}

// ===== SISTEMA DE ADMINISTRACIÓN DE PÁGINAS =====

// Administrador de página de empresa
export interface AdminPagina {
  id: string;
  empresa_id: number;
  email: string;
  password_hash: string;
  nombre: string;
  activo: boolean;
  login_habilitado: boolean;
  created_at: string;
  updated_at: string;
}

// Permisos para administradores de empresas
export interface PermisosAdminEmpresa {
  id: string;
  admin_id: string;
  puede_editar_info_basica: boolean;
  puede_editar_contacto: boolean;
  puede_editar_modal: boolean;
  puede_editar_categorias: boolean;
  puede_editar_sucursales: boolean;
  puede_editar_contenido_hero: boolean;
  puede_editar_videos: boolean;
  created_at: string;
  updated_at: string;
}

// Datos completos del admin con permisos
export interface AdminEmpresaCompleto {
  id: number;
  user_id: string;
  empresa_id: number;
  nombres: string;
  apellidos?: string | null;
  email: string;
  telefono?: string | null;
  fecha_nacimiento?: string | null;
  activo: boolean;
  created_at: string;
  updated_at?: string | null;
  empresa?: Empresa;
  // Campos heredados para compatibilidad
  nombre: string; // Alias para nombres
}

// Formularios para crear/editar administradores
export interface AdminPaginaFormData {
  empresa_id?: number;
  email: string;
  password?: string; // Opcional para edición
  nombre: string;
  activo: boolean;
  login_habilitado: boolean;
  permisos: Partial<PermisosAdminEmpresa>;
}

// Datos de login
export interface LoginData {
  email: string;
  password: string;
  empresa_id: number; // ID de empresa
}

// Respuesta de autenticación
export interface AuthResponse {
  success: boolean;
  admin?: AdminEmpresaCompleto;
  token?: string;
  message?: string;
  error?: string;
}

// === CONFIGURACIÓN DE PERMISOS ===

// Descripción legible de permisos
export const PERMISOS_DESCRIPCION: Record<string, string> = {
  puede_editar_info_basica: 'Editar información básica (nombre, descripción, teléfono, email)',
  puede_editar_contacto: 'Editar información de contacto (dirección, ubicación, horarios)',
  puede_editar_modal: 'Editar contenido del modal (consejos, promociones)',
  puede_editar_categorias: 'Gestionar categorías de productos/servicios',
  puede_editar_sucursales: 'Gestionar múltiples ubicaciones',
  puede_editar_contenido_hero: 'Editar contenido principal (título, descripción, imagen)',
  puede_editar_videos: 'Gestionar videos promocionales'
};

// Estado del administrador
export type AdminStatus = 'activo' | 'inactivo' | 'login_deshabilitado';
