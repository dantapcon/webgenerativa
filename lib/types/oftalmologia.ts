// Tipos TypeScript para el sistema de oftalmología

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
  estilo_botones: 'rounded' | 'square' | 'pill';
  tema_general: 'moderno' | 'clasico' | 'minimalista' | 'corporativo';
  created_at: string;
  updated_at: string;
}

export interface ClinicaCompleta extends ClinicaOftalmologica {
  estilos?: EstilosClinica;
}

// Tipos para formularios
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
  // Estilos
  color_primario?: string;
  color_secundario?: string;
  color_acento?: string;
  color_texto?: string;
  color_fondo?: string;
  fuente_principal?: string;
  fuente_titulo?: string;
  tamano_fuente?: string;
  estilo_botones?: 'rounded' | 'square' | 'pill';
  tema_general?: 'moderno' | 'clasico' | 'minimalista' | 'corporativo';
}

// Respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateClinicaResponse {
  success: boolean;
  message: string;
  clinica_id: string;
  website_url: string;
}
