// Servicios para el sistema de administración de páginas
import { createClient } from '@supabase/supabase-js';
import {
  AdminPagina,
  PermisosAdminEmpresa,
  AdminEmpresaCompleto,
  AdminPaginaFormData,
  LoginData,
  AuthResponse
} from '../types/oftalmologia';

// Cliente de Supabase con service_role para operaciones administrativas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente administrativo (backend only)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Cliente público (para login de admins)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class AdminPaginasService {
  
  // ===== ADMINISTRADORES DE EMPRESAS =====
  
  /**
   * Crear administrador para una empresa
   */
  static async createAdminEmpresa(data: {
    empresa_id: number;
    email: string;
    password: string;
    nombre: string;
    login_habilitado: boolean;
    permisos: Partial<PermisosAdminEmpresa>;
  }): Promise<AdminEmpresaCompleto> {
    try {
      // Para desarrollo, usaremos hash simple. En producción usar bcrypt
      const password_hash = btoa(data.password); // Temporal para desarrollo

      // Crear administrador
      const { data: admin, error: adminError } = await supabaseAdmin
        .from('admin_paginas')
        .insert([{
          empresa_id: data.empresa_id,
          email: data.email.toLowerCase(),
          password_hash,
          nombre: data.nombre,
          login_habilitado: data.login_habilitado,
          activo: true
        }])
        .select()
        .single();

      if (adminError) {
        throw new Error(`Error creando administrador: ${adminError.message}`);
      }

      // Crear permisos
      const { data: permisos, error: permisosError } = await supabaseAdmin
        .from('permisos_admin_empresas')
        .insert([{
          admin_id: admin.id,
          puede_editar_info_basica: data.permisos.puede_editar_info_basica || false,
          puede_editar_contacto: data.permisos.puede_editar_contacto || false,
          puede_editar_modal: data.permisos.puede_editar_modal || false,
          puede_editar_categorias: data.permisos.puede_editar_categorias || false,
          puede_editar_sucursales: data.permisos.puede_editar_sucursales || false,
          puede_editar_contenido_hero: data.permisos.puede_editar_contenido_hero || false,
          puede_editar_videos: data.permisos.puede_editar_videos || false
        }])
        .select()
        .single();

      if (permisosError) {
        throw new Error(`Error creando permisos: ${permisosError.message}`);
      }

      return {
        ...admin,
        permisos
      };

    } catch (error) {
      console.error('Error en createAdminEmpresa:', error);
      throw error;
    }
  }

  /**
   * Obtener administrador de empresa por ID
   */
  static async getAdminEmpresa(adminId: string): Promise<AdminEmpresaCompleto | null> {
    try {
      const { data: admin, error: adminError } = await supabase
        .from('admin_paginas')
        .select(`
          *,
          permisos:permisos_admin_empresas(*),
          empresa:empresas(*)
        `)
        .eq('id', adminId)
        .single();

      if (adminError) {
        if (adminError.code === 'PGRST116') return null;
        throw new Error(`Error obteniendo administrador: ${adminError.message}`);
      }

      return admin;

    } catch (error) {
      console.error('Error en getAdminEmpresa:', error);
      throw error;
    }
  }

  /**
   * Obtener administrador por empresa
   */
  static async getAdminByEmpresa(empresaId: number): Promise<AdminEmpresaCompleto | null> {
    try {
      const { data: admin, error: adminError } = await supabase
        .from('admin_paginas')
        .select(`
          *,
          permisos:permisos_admin_empresas(*),
          empresa:empresas(*)
        `)
        .eq('empresa_id', empresaId)
        .single();

      if (adminError) {
        if (adminError.code === 'PGRST116') return null;
        throw new Error(`Error obteniendo administrador: ${adminError.message}`);
      }

      return admin;

    } catch (error) {
      console.error('Error en getAdminByEmpresa:', error);
      return null;
    }
  }

  /**
   * Actualizar administrador de empresa
   */
  static async updateAdminEmpresa(
    adminId: string, 
    data: Partial<AdminPaginaFormData>
  ): Promise<AdminEmpresaCompleto> {
    try {
      const updateData: any = {};
      
      if (data.email) updateData.email = data.email.toLowerCase();
      if (data.nombre) updateData.nombre = data.nombre;
      if (data.activo !== undefined) updateData.activo = data.activo;
      if (data.login_habilitado !== undefined) updateData.login_habilitado = data.login_habilitado;
      
      // Hash nueva contraseña si se proporciona (temporal para desarrollo)
      if (data.password && data.password.length > 0) {
        updateData.password_hash = btoa(data.password);
      }

      // Actualizar admin
      const { data: admin, error: adminError } = await supabaseAdmin
        .from('admin_paginas')
        .update(updateData)
        .eq('id', adminId)
        .select()
        .single();

      if (adminError) {
        throw new Error(`Error actualizando administrador: ${adminError.message}`);
      }

      // Actualizar permisos si se proporcionan
      if (data.permisos) {
        const { error: permisosError } = await supabaseAdmin
          .from('permisos_admin_empresas')
          .update(data.permisos)
          .eq('admin_id', adminId);

        if (permisosError) {
          throw new Error(`Error actualizando permisos: ${permisosError.message}`);
        }
      }

      // Obtener admin completo actualizado
      return await this.getAdminEmpresa(adminId) as AdminEmpresaCompleto;

    } catch (error) {
      console.error('Error en updateAdminEmpresa:', error);
      throw error;
    }
  }

  // ===== AUTENTICACIÓN =====

  /**
   * Iniciar sesión de administrador
   */
  static async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const { email, password, empresa_id } = loginData;

      const { data: admin, error } = await supabase
        .from('admin_paginas')
        .select(`
          *,
          permisos:permisos_admin_empresas(*),
          empresa:empresas(*)
        `)
        .eq('email', email.toLowerCase())
        .eq('empresa_id', empresa_id)
        .eq('activo', true)
        .eq('login_habilitado', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Credenciales inválidas' };
        }
        throw error;
      }

      if (!admin) {
        return { success: false, error: 'Credenciales inválidas' };
      }

      // Verificar contraseña (temporal para desarrollo)
      const isValidPassword = admin.password_hash === btoa(password);
      if (!isValidPassword) {
        return { success: false, error: 'Credenciales inválidas' };
      }

      // Generar token simple (en producción usar JWT)
      const token = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64');

      return {
        success: true,
        admin,
        token,
        message: 'Inicio de sesión exitoso'
      };

    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: 'Error interno del servidor' 
      };
    }
  }

  /**
   * Verificar si el login está habilitado para una empresa
   */
  static async isLoginEnabled(empresaId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_paginas')
        .select('login_habilitado')
        .eq('empresa_id', empresaId)
        .eq('activo', true)
        .single();

      if (error || !data) {
        return false;
      }

      return data.login_habilitado || false;

    } catch (error) {
      console.error('Error en isLoginEnabled:', error);
      return false;
    }
  }

  /**
   * Habilitar/deshabilitar login para una empresa
   */
  static async toggleLogin(empresaId: number, enabled: boolean): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('admin_paginas')
        .update({ login_habilitado: enabled })
        .eq('empresa_id', empresaId);

      if (error) {
        throw new Error(`Error actualizando estado de login: ${error.message}`);
      }

    } catch (error) {
      console.error('Error en toggleLogin:', error);
      throw error;
    }
  }

}

export default AdminPaginasService;
