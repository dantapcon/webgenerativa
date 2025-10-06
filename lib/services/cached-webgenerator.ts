// Servicio de cache específico para datos de empresa
// Wrapper inteligente para WebGeneratorService con cache automático

import { WebGeneratorService } from './webgenerator';
import { ColorimetriaService } from './colorimetria';
import CacheService, { CacheKeys, CacheTags, CacheTTL } from './cache';
import { EmpresaCompleta, Empresa, Categoria, Subcategoria, Producto } from '../types/webgenerator';

export class CachedWebGeneratorService {
  
  /**
   * Obtener empresa por slug con cache inteligente
   * Esta es la función más crítica para performance
   */
  static async getEmpresaBySlug(slug: string): Promise<EmpresaCompleta | null> {
    const key = CacheKeys.empresaBySlug(slug);
    const tags = [CacheTags.slug(slug)];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando empresa "${slug}" desde BD`);
        const result = await WebGeneratorService.getEmpresaBySlug(slug);
        
        if (result) {
          // Agregar tags adicionales basados en la empresa encontrada
          tags.push(
            CacheTags.empresa(result.id),
            CacheTags.categoria(result.id),
            CacheTags.producto(result.id),
            CacheTags.colorimetria(result.id)
          );
        }
        
        return result;
      },
      CacheService.getTTL(CacheTTL.EMPRESA_COMPLETE),
      tags
    );
  }

  /**
   * Obtener empresa por ID con cache
   */
  static async getEmpresaById(id: number): Promise<EmpresaCompleta | null> {
    const key = CacheKeys.empresaById(id);
    const tags = [
      CacheTags.empresa(id),
      CacheTags.categoria(id),
      CacheTags.producto(id),
      CacheTags.colorimetria(id)
    ];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando empresa ID:${id} desde BD`);
        return WebGeneratorService.getEmpresaById(id);
      },
      CacheService.getTTL(CacheTTL.EMPRESA_COMPLETE),
      tags
    );
  }

  /**
   * Obtener datos básicos de empresa (sin relaciones) con cache
   */
  static async getEmpresaBasic(id: number): Promise<Empresa | null> {
    const key = CacheKeys.empresaBasic(id);
    const tags = [CacheTags.empresa(id)];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando empresa básica ID:${id} desde BD`);
        // Implementar método básico si no existe
        const empresaCompleta = await WebGeneratorService.getEmpresaById(id);
        if (!empresaCompleta) return null;
        
        // Extraer solo datos básicos sin relaciones
        const { categorias, productos, sucursales, ventana_flotante, colores, ...empresaBasica } = empresaCompleta;
        return empresaBasica;
      },
      CacheService.getTTL(CacheTTL.EMPRESA_BASIC),
      tags
    );
  }

  /**
   * Obtener estructura de navegación (categorías + subcategorías) con cache
   */
  static async getNavegacionEmpresa(empresaId: number): Promise<Categoria[] | null> {
    const key = CacheKeys.navegacion(empresaId);
    const tags = [CacheTags.categoria(empresaId)];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando navegación empresa ID:${empresaId} desde BD`);
        const empresa = await WebGeneratorService.getEmpresaById(empresaId);
        return empresa?.categorias || null;
      },
      CacheService.getTTL(CacheTTL.CATEGORIAS),
      tags
    );
  }

  /**
   * Obtener productos con cache (con filtros opcionales)
   */
  static async getProductos(
    empresaId: number, 
    categoriaId?: number, 
    subcategoriaId?: number
  ): Promise<Producto[]> {
    const key = CacheKeys.productos(empresaId, categoriaId, subcategoriaId);
    const tags = [CacheTags.producto(empresaId)];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando productos empresa ID:${empresaId}, cat:${categoriaId}, sub:${subcategoriaId} desde BD`);
        
        // Crear filtros para la consulta
        const filters: any = { empresa_id: empresaId, activo: true };
        if (categoriaId) filters.categoria_id = categoriaId;
        if (subcategoriaId) filters.subcategoria_id = subcategoriaId;
        
        // Usar servicio de supabase directamente para esta consulta específica
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase
          .from('productos')
          .select(`
            *,
            categorias (id, nombre, descripcion),
            subcategorias (id, nombre, descripcion)
          `)
          .match(filters)
          .order('orden', { ascending: true })
          .order('fecha_creacion', { ascending: false });
        
        if (error) {
          console.error('Error obteniendo productos:', error);
          return [];
        }
        
        return data || [];
      },
      CacheService.getTTL(CacheTTL.PRODUCTOS),
      tags
    );
  }

  /**
   * Obtener servicios con cache (con filtros opcionales)
   */
  static async getServicios(
    empresaId: number, 
    categoriaId?: number, 
    subcategoriaId?: number
  ): Promise<any[]> {
    const key = CacheKeys.servicios(empresaId, categoriaId, subcategoriaId);
    const tags = [CacheTags.servicio(empresaId)];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando servicios empresa ID:${empresaId}, cat:${categoriaId}, sub:${subcategoriaId} desde BD`);
        
        const filters: any = { empresa_id: empresaId, activo: true };
        if (categoriaId) filters.categoria_id = categoriaId;
        if (subcategoriaId) filters.subcategoria_id = subcategoriaId;
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase
          .from('servicios')
          .select(`
            *,
            categorias (id, nombre, descripcion),
            subcategorias (id, nombre, descripcion)
          `)
          .match(filters)
          .order('orden', { ascending: true })
          .order('fecha_creacion', { ascending: false });
        
        if (error) {
          console.error('Error obteniendo servicios:', error);
          return [];
        }
        
        return data || [];
      },
      CacheService.getTTL(CacheTTL.SERVICIOS),
      tags
    );
  }

  /**
   * Obtener colorimetría con cache
   */
  static async getColoresElemento(elementoId: number, tipoElemento: 'empresa' | 'categoria' | 'subcategoria' | 'ventana_flotante'): Promise<any> {
    const key = CacheKeys.colorimetria(elementoId, tipoElemento);
    const tags = [CacheTags.colorimetria(elementoId)];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando colores ${tipoElemento}:${elementoId} desde BD`);
        return ColorimetriaService.getColoresElemento(elementoId, tipoElemento);
      },
      CacheService.getTTL(CacheTTL.COLORIMETRIA),
      tags
    );
  }

  /**
   * Obtener ventana flotante con cache
   */
  static async getVentanaFlotante(empresaId: number): Promise<any> {
    const key = CacheKeys.ventanaFlotante(empresaId);
    const tags = [CacheTags.ventanaFlotante(empresaId)];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando ventana flotante empresa ID:${empresaId} desde BD`);
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase
          .from('ventana_flotante')
          .select('*')
          .eq('empresa_id', empresaId)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.warn('Error obteniendo ventana flotante:', error.message);
          return null;
        }
        
        return data;
      },
      CacheService.getTTL(CacheTTL.VENTANA_FLOTANTE),
      tags
    );
  }

  /**
   * Obtener sucursales con cache
   */
  static async getSucursales(empresaId: number): Promise<any[]> {
    const key = CacheKeys.sucursales(empresaId);
    const tags = [CacheTags.sucursal(empresaId)];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando sucursales empresa ID:${empresaId} desde BD`);
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase
          .from('sucursales')
          .select('*')
          .eq('empresa_id', empresaId)
          .eq('activo', true)
          .order('orden', { ascending: true });
        
        if (error) {
          console.warn('Error obteniendo sucursales:', error.message);
          return [];
        }
        
        return data || [];
      },
      CacheService.getTTL(CacheTTL.SUCURSALES),
      tags
    );
  }

  /**
   * Invalidar cache cuando se actualiza una empresa
   */
  static invalidateEmpresa(empresaId: number): void {
    console.log(`🗑️ Invalidando cache para empresa ID:${empresaId}`);
    CacheService.invalidateEmpresa(empresaId);
  }

  /**
   * Invalidar cache cuando se actualiza por slug
   */
  static invalidateBySlug(slug: string): void {
    console.log(`🗑️ Invalidando cache para slug:${slug}`);
    CacheService.invalidateBySlug(slug);
  }

  /**
   * Invalidar categorías específicas
   */
  static invalidateCategorias(empresaId: number): void {
    console.log(`🗑️ Invalidando cache de categorías para empresa ID:${empresaId}`);
    CacheService.invalidate([CacheTags.categoria(empresaId)]);
  }

  /**
   * Invalidar productos específicos
   */
  static invalidateProductos(empresaId: number): void {
    console.log(`🗑️ Invalidando cache de productos para empresa ID:${empresaId}`);
    CacheService.invalidate([CacheTags.producto(empresaId)]);
  }

  /**
   * Invalidar servicios específicos
   */
  static invalidateServicios(empresaId: number): void {
    console.log(`🗑️ Invalidando cache de servicios para empresa ID:${empresaId}`);
    CacheService.invalidate([CacheTags.servicio(empresaId)]);
  }

  // =================================================================
  // Métodos específicos para cache completo de datos de empresa
  // =================================================================

  /**
   * Obtener configuración completa de empresa con cache
   */
  static async getConfiguracionEmpresa(empresaId: number): Promise<any> {
    const key = `empresa-config:${empresaId}`;
    const tags = [CacheTags.empresa(empresaId)];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando configuración empresa ID:${empresaId} desde BD`);
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase
          .from('empresas')
          .select(`
            id, nombre, slug, descripcion, logo, favicon,
            telefono, email, direccion, redes_sociales,
            activo, fecha_creacion, fecha_actualizacion,
            configuracion_avanzada, seo_configuracion,
            productos_activo, servicios_activo, sucursales_activo,
            ventana_flotante_activo, mostrar_ubicaciones
          `)
          .eq('id', empresaId)
          .single();
        
        if (error) {
          console.error('Error obteniendo configuración empresa:', error);
          return null;
        }
        
        return data;
      },
      CacheService.getTTL(CacheTTL.EMPRESA_BASIC),
      tags
    );
  }

  /**
   * Obtener información SEO de empresa con cache
   */
  static async getSeoEmpresa(empresaId: number): Promise<any> {
    const key = `empresa-seo:${empresaId}`;
    const tags = [CacheTags.empresa(empresaId)];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando SEO empresa ID:${empresaId} desde BD`);
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase
          .from('empresas')
          .select(`
            seo_configuracion,
            nombre, descripcion, 
            meta_title, meta_description, meta_keywords
          `)
          .eq('id', empresaId)
          .single();
        
        if (error) {
          console.error('Error obteniendo SEO empresa:', error);
          return null;
        }
        
        return data;
      },
      CacheService.getTTL(CacheTTL.EMPRESA_BASIC),
      tags
    );
  }

  /**
   * Obtener redes sociales de empresa con cache
   */
  static async getRedesSociales(empresaId: number): Promise<any> {
    const key = `empresa-redes:${empresaId}`;
    const tags = [CacheTags.empresa(empresaId)];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando redes sociales empresa ID:${empresaId} desde BD`);
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase
          .from('empresas')
          .select(`
            redes_sociales,
            telefono, email, direccion
          `)
          .eq('id', empresaId)
          .single();
        
        if (error) {
          console.error('Error obteniendo redes sociales empresa:', error);
          return null;
        }
        
        return data;
      },
      CacheService.getTTL(CacheTTL.EMPRESA_BASIC),
      tags
    );
  }

  /**
   * Obtener estadísticas de empresa con cache
   */
  static async getEstadisticasEmpresa(empresaId: number): Promise<any> {
    const key = `empresa-stats:${empresaId}`;
    const tags = [
      CacheTags.empresa(empresaId),
      CacheTags.producto(empresaId),
      CacheTags.servicio(empresaId)
    ];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Calculando estadísticas empresa ID:${empresaId} desde BD`);
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        // Contar productos activos
        const { count: productosCount } = await supabase
          .from('productos')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', empresaId)
          .eq('activo', true);
        
        // Contar servicios activos
        const { count: serviciosCount } = await supabase
          .from('servicios')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', empresaId)
          .eq('activo', true);
        
        // Contar categorías
        const { count: categoriasCount } = await supabase
          .from('categorias')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', empresaId)
          .eq('activo', true);
        
        // Contar sucursales
        const { count: sucursalesCount } = await supabase
          .from('sucursales')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', empresaId)
          .eq('activo', true);
        
        return {
          productos: productosCount || 0,
          servicios: serviciosCount || 0,
          categorias: categoriasCount || 0,
          sucursales: sucursalesCount || 0,
          ultima_actualizacion: new Date().toISOString()
        };
      },
      CacheService.getTTL(CacheTTL.PRODUCTOS), // 5 minutos, cambia frecuentemente
      tags
    );
  }

  // =================================================================
  // Cache de navegación - estructura de categorías y subcategorías
  // =================================================================

  /**
   * Obtener estructura completa de navegación con cache
   */
  static async getEstructuraNavegacion(empresaId: number): Promise<any> {
    const key = `navegacion-completa:${empresaId}`;
    const tags = [CacheTags.categoria(empresaId)];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando estructura navegación empresa ID:${empresaId} desde BD`);
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase
          .from('categorias')
          .select(`
            id, nombre, descripcion, slug, icono, color_fondo,
            fondo_tipo, fondo_imagen, orden, activo,
            subcategorias (
              id, nombre, descripcion, slug, icono, 
              color_fondo, orden, activo
            )
          `)
          .eq('empresa_id', empresaId)
          .eq('activo', true)
          .order('orden', { ascending: true })
          .order('fecha_creacion', { ascending: true });
        
        if (error) {
          console.error('Error obteniendo estructura navegación:', error);
          return [];
        }
        
        // Ordenar subcategorías dentro de cada categoría
        return data?.map(categoria => ({
          ...categoria,
          subcategorias: categoria.subcategorias?.sort((a: any, b: any) => 
            (a.orden || 999) - (b.orden || 999)
          ) || []
        })) || [];
      },
      CacheService.getTTL(CacheTTL.CATEGORIAS),
      tags
    );
  }

  /**
   * Obtener categoría específica con sus productos/servicios
   */
  static async getCategoriaConContenido(empresaId: number, categoriaSlug: string): Promise<any> {
    const key = `categoria-contenido:${empresaId}:${categoriaSlug}`;
    const tags = [CacheTags.categoria(empresaId), CacheTags.producto(empresaId), CacheTags.servicio(empresaId)];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando categoría con contenido ${categoriaSlug} empresa ID:${empresaId} desde BD`);
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        // Obtener categoría base
        const { data: categoria, error: categoriaError } = await supabase
          .from('categorias')
          .select(`
            id, nombre, descripcion, slug, icono, color_fondo,
            fondo_tipo, fondo_imagen, seo_title, seo_description,
            subcategorias (
              id, nombre, descripcion, slug, icono, color_fondo, orden, activo
            )
          `)
          .eq('empresa_id', empresaId)
          .eq('slug', categoriaSlug)
          .eq('activo', true)
          .single();
        
        if (categoriaError || !categoria) {
          return null;
        }
        
        // Obtener productos de la categoría (sin subcategoría)
        const { data: productos } = await supabase
          .from('productos')
          .select(`
            id, nombre, descripcion, precio, moneda, imagen_principal,
            categoria_id, subcategoria_id, activo, orden
          `)
          .eq('empresa_id', empresaId)
          .eq('categoria_id', categoria.id)
          .is('subcategoria_id', null)
          .eq('activo', true)
          .order('orden', { ascending: true });
        
        // Obtener servicios de la categoría (sin subcategoría)
        const { data: servicios } = await supabase
          .from('servicios')
          .select(`
            id, nombre, descripcion, precio, moneda, imagen_principal,
            categoria_id, subcategoria_id, activo, orden
          `)
          .eq('empresa_id', empresaId)
          .eq('categoria_id', categoria.id)
          .is('subcategoria_id', null)
          .eq('activo', true)
          .order('orden', { ascending: true });
        
        return {
          ...categoria,
          productos: productos || [],
          servicios: servicios || [],
          subcategorias: categoria.subcategorias?.sort((a: any, b: any) => 
            (a.orden || 999) - (b.orden || 999)
          ) || []
        };
      },
      CacheService.getTTL(CacheTTL.CATEGORIAS),
      tags
    );
  }

  /**
   * Obtener productos destacados con cache
   */
  static async getProductosDestacados(empresaId: number, limite: number = 6): Promise<any[]> {
    const key = `productos-destacados:${empresaId}:${limite}`;
    const tags = [CacheTags.producto(empresaId)];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando productos destacados empresa ID:${empresaId} desde BD`);
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase
          .from('productos')
          .select(`
            id, nombre, descripcion, precio, moneda, imagen_principal,
            categoria_id, subcategoria_id, destacado, orden,
            categorias (nombre, slug),
            subcategorias (nombre, slug)
          `)
          .eq('empresa_id', empresaId)
          .eq('activo', true)
          .eq('destacado', true)
          .order('orden', { ascending: true })
          .order('fecha_creacion', { ascending: false })
          .limit(limite);
        
        if (error) {
          console.error('Error obteniendo productos destacados:', error);
          return [];
        }
        
        return data || [];
      },
      CacheService.getTTL(CacheTTL.PRODUCTOS),
      tags
    );
  }

  /**
   * Obtener servicios destacados con cache
   */
  static async getServiciosDestacados(empresaId: number, limite: number = 6): Promise<any[]> {
    const key = `servicios-destacados:${empresaId}:${limite}`;
    const tags = [CacheTags.servicio(empresaId)];
    
    return CacheService.getOrSet(
      key,
      async () => {
        console.log(`🔄 Cache MISS: Cargando servicios destacados empresa ID:${empresaId} desde BD`);
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase
          .from('servicios')
          .select(`
            id, nombre, descripcion, precio, moneda, imagen_principal,
            categoria_id, subcategoria_id, destacado, orden,
            categorias (nombre, slug),
            subcategorias (nombre, slug)
          `)
          .eq('empresa_id', empresaId)
          .eq('activo', true)
          .eq('destacado', true)
          .order('orden', { ascending: true })
          .order('fecha_creacion', { ascending: false })
          .limit(limite);
        
        if (error) {
          console.error('Error obteniendo servicios destacados:', error);
          return [];
        }
        
        return data || [];
      },
      CacheService.getTTL(CacheTTL.SERVICIOS),
      tags
    );
  }

  /**
   * Método de conveniencia: obtener empresa optimizada para navegación
   * Solo carga datos esenciales para navegación rápida
   */
  static async getEmpresaOptimizada(slug: string): Promise<{
    empresa: Empresa | null;
    categorias: Categoria[] | null;
    colores: any;
  }> {
    // Obtener empresa básica y categorías en paralelo desde cache
    const empresaCompleta = await this.getEmpresaBySlug(slug);
    
    if (!empresaCompleta) {
      return { empresa: null, categorias: null, colores: null };
    }

    // Extraer datos optimizados
    const { categorias, productos, sucursales, ventana_flotante, ...empresa } = empresaCompleta;
    
    return {
      empresa,
      categorias: categorias || null,
      colores: empresaCompleta.colores
    };
  }

  // =================================================================
  // Métodos de escritura con invalidación de cache
  // =================================================================

  /**
   * Crear nueva empresa
   */
  static async createEmpresa(data: any): Promise<any> {
    const result = await WebGeneratorService.createEmpresa(data);
    
    // Invalidar cache de lista de empresas
    CacheService.invalidate(['empresas']);
    
    return result;
  }

  /**
   * Actualizar empresa existente
   */
  static async updateEmpresa(id: number, data: any): Promise<any> {
    // Obtener empresa actual para invalidar cache por slug
    const empresaActual = await WebGeneratorService.getEmpresaById(id);
    
    const result = await WebGeneratorService.updateEmpresa(id, data);
    
    // Invalidar caches relacionados
    const tags = [
      `empresa:${id}`,
      'empresas'
    ];
    
    if ((empresaActual as any)?.slug) {
      tags.push(`empresa-slug:${(empresaActual as any).slug}`);
    }
    
    if ((result as any)?.slug && (result as any).slug !== (empresaActual as any)?.slug) {
      tags.push(`empresa-slug:${(result as any).slug}`);
    }
    
    CacheService.invalidate(tags);
    
    return result;
  }

  /**
   * Eliminar empresa
   */
  static async deleteEmpresa(id: number): Promise<void> {
    // Obtener empresa actual para invalidar cache por slug
    const empresaActual = await WebGeneratorService.getEmpresaById(id);
    
    await WebGeneratorService.deleteEmpresa(id);
    
    // Invalidar caches relacionados
    const tags = [
      `empresa:${id}`,
      'empresas'
    ];
    
    if ((empresaActual as any)?.slug) {
      tags.push(`empresa-slug:${(empresaActual as any).slug}`);
    }
    
    CacheService.invalidate(tags);
  }

  /**
   * Alternar estado de empresa
   */
  static async toggleEmpresaStatus(id: number): Promise<any> {
    // Obtener empresa actual para invalidar cache por slug
    const empresaActual = await WebGeneratorService.getEmpresaById(id);
    
    const result = await WebGeneratorService.toggleEmpresaStatus(id);
    
    // Invalidar caches relacionados
    const tags = [
      `empresa:${id}`,
      'empresas'
    ];
    
    if ((empresaActual as any)?.slug) {
      tags.push(`empresa-slug:${(empresaActual as any).slug}`);
    }
    
    CacheService.invalidate(tags);
    
    return result;
  }

  /**
   * Obtener todas las empresas (para administración)
   */
  static async getAllEmpresas(): Promise<any[]> {
    const key = 'all-empresas';
    const tags = ['empresas'];
    
    return CacheService.getOrSet(
      key,
      async () => {
        return WebGeneratorService.getAllEmpresas();
      },
      CacheService.getTTL(CacheTTL.EMPRESA_COMPLETE), // Cache para admin
      tags
    );
  }

  // =================================================================
  // Métodos de invalidación automática para operaciones específicas
  // =================================================================

  /**
   * Crear producto con invalidación automática de cache
   */
  static async createProducto(empresaId: number, data: any): Promise<any> {
    // Crear producto usando WebGeneratorService
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: result, error } = await supabase
      .from('productos')
      .insert([{ ...data, empresa_id: empresaId }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Invalidar caches relacionados
    this.invalidateProductos(empresaId);
    this.invalidateEmpresa(empresaId);
    
    console.log(`🔄 Cache invalidado por creación de producto empresa ID:${empresaId}`);
    
    return result;
  }

  /**
   * Actualizar producto con invalidación automática de cache
   */
  static async updateProducto(productoId: number, empresaId: number, data: any): Promise<any> {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: result, error } = await supabase
      .from('productos')
      .update(data)
      .eq('id', productoId)
      .eq('empresa_id', empresaId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Invalidar caches relacionados
    this.invalidateProductos(empresaId);
    this.invalidateEmpresa(empresaId);
    
    console.log(`🔄 Cache invalidado por actualización de producto ID:${productoId}`);
    
    return result;
  }

  /**
   * Crear servicio con invalidación automática de cache
   */
  static async createServicio(empresaId: number, data: any): Promise<any> {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: result, error } = await supabase
      .from('servicios')
      .insert([{ ...data, empresa_id: empresaId }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Invalidar caches relacionados
    this.invalidateServicios(empresaId);
    this.invalidateEmpresa(empresaId);
    
    console.log(`🔄 Cache invalidado por creación de servicio empresa ID:${empresaId}`);
    
    return result;
  }

  /**
   * Crear categoría con invalidación automática de cache
   */
  static async createCategoria(empresaId: number, data: any): Promise<any> {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: result, error } = await supabase
      .from('categorias')
      .insert([{ ...data, empresa_id: empresaId }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Invalidar caches relacionados
    this.invalidateCategorias(empresaId);
    this.invalidateEmpresa(empresaId);
    
    console.log(`🔄 Cache invalidado por creación de categoría empresa ID:${empresaId}`);
    
    return result;
  }

  /**
   * Precalentar cache para una empresa
   * Útil para mejorar performance en primera carga
   */
  static async precalentarCache(slug: string): Promise<void> {
    console.log(`🔥 Precalentando cache para empresa "${slug}"`);
    
    try {
      const empresa = await this.getEmpresaBySlug(slug);
      
      if (empresa) {
        // Precargar datos adicionales en paralelo
        await Promise.all([
          this.getNavegacionEmpresa(empresa.id),
          this.getProductos(empresa.id),
          this.getServicios(empresa.id),
          this.getVentanaFlotante(empresa.id),
          empresa.sucursales_activo ? this.getSucursales(empresa.id) : Promise.resolve([])
        ]);
        
        console.log(`✅ Cache precalentado exitosamente para "${slug}"`);
      }
    } catch (error) {
      console.error(`❌ Error precalentando cache para "${slug}":`, error);
    }
  }

  /**
   * Obtener estadísticas del cache
   */
  static getCacheStats() {
    return CacheService.getStats();
  }

  /**
   * Obtener información de debug del cache
   */
  static getCacheDebugInfo() {
    return CacheService.getDebugInfo();
  }

  // =================================================================
  // Monitoreo de performance y estadísticas
  // =================================================================

  /**
   * Obtener métricas detalladas del cache
   */
  static getCacheMetrics(): any {
    const stats = CacheService.getStats();
    const debugInfo = CacheService.getDebugInfo();
    
    const hitRate = stats.hits + stats.misses > 0 
      ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2)
      : 0;
    
    return {
      // Estadísticas básicas
      performance: {
        hits: stats.hits,
        misses: stats.misses,
        hitRate: `${hitRate}%`,
        totalOperations: stats.hits + stats.misses,
        sets: stats.sets,
        invalidations: stats.invalidations
      },
      
      // Uso de memoria
      memory: {
        usage: stats.memoryUsage,
        usageFormatted: this.formatBytes(stats.memoryUsage),
        entries: debugInfo.size,
        averageEntrySize: debugInfo.size > 0 
          ? Math.round(stats.memoryUsage / debugInfo.size)
          : 0
      },
      
      // Timestamp del reporte
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Limpiar cache de empresa específica (útil para debugging)
   */
  static clearEmpresaCache(empresaId: number): void {
    console.log(`🧹 Limpiando todo el cache de empresa ID:${empresaId}`);
    
    CacheService.invalidate([
      CacheTags.empresa(empresaId),
      CacheTags.categoria(empresaId),
      CacheTags.producto(empresaId),
      CacheTags.servicio(empresaId),
      CacheTags.colorimetria(empresaId),
      CacheTags.ventanaFlotante(empresaId),
      CacheTags.sucursal(empresaId)
    ]);
  }

  /**
   * Limpiar todo el cache (usar con precaución)
   */
  static clearAllCache(): void {
    console.log(`🧹 LIMPIANDO TODO EL CACHE - Esta operación afecta el rendimiento`);
    CacheService.clear();
  }

  /**
   * Formatear bytes a formato legible
   */
  private static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

export default CachedWebGeneratorService;