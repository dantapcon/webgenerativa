// Servicios para las operaciones de base de datos del generador web
import { createClient } from '@supabase/supabase-js';
import { 
  Empresa, 
  Categoria, 
  Subcategoria,
  EmpresaCompleta, 
  EmpresaFormData 
} from '../types/oftalmologia';

// Cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class WebGeneratorService {
  // Crear una nueva empresa con categorías y subcategorías
  static async createEmpresa(data: EmpresaFormData): Promise<{ empresa: Empresa; mensaje: string }> {
    try {
      // Generar slug único si no se proporciona
      let slug = data.slug_empresa || data.nombre_empresa.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      // Verificar que el slug sea único
      const { data: existingEmpresa } = await supabase
        .from('empresas')
        .select('slug_empresa')
        .eq('slug_empresa', slug)
        .single();

      if (existingEmpresa) {
        slug = `${slug}-${Date.now()}`;
      }

      // Datos básicos de la empresa
      const empresaData = {
        nombre_empresa: data.nombre_empresa,
        slug_empresa: slug,
        descripcion_empresa: data.descripcion_empresa || null,
        correo_empresa: data.correo_empresa || null,
        telefono_empresa: data.telefono_empresa || null,
        direccion_empresa: data.direccion_empresa || null,
        tipo_negocio: data.tipo_negocio || null,
        dominio_deseado: data.dominio_deseado || null,
        logo_url: data.logo_url || null,
        video_promocional_url: data.video_promocional_url || null,
        color_primario: data.color_primario || '#2563eb',
        color_secundario: data.color_secundario || '#1e40af',
        tipografia: data.tipografia || 'Inter',
        estado_sitio: 'publicado',
        ssl_activo: true
      };

      // Insertar empresa
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .insert([empresaData])
        .select()
        .single();

      if (empresaError) {
        throw new Error(`Error creando empresa: ${empresaError.message}`);
      }

      // Procesar categorías si existen
      if (data.categorias && data.categorias.length > 0) {
        for (const categoria of data.categorias) {
          // Insertar categoría
          const { data: categoriaCreada, error: categoriaError } = await supabase
            .from('categorias')
            .insert([{
              empresa_id: empresa.id,
              nombre: categoria.nombre,
              descripcion: categoria.descripcion || null,
              orden: categoria.orden || 0,
              visible: true
            }])
            .select()
            .single();

          if (categoriaError) {
            console.error(`Error creando categoría ${categoria.nombre}:`, categoriaError);
            continue;
          }

          // Procesar subcategorías si existen
          if (categoria.subcategorias && categoria.subcategorias.length > 0) {
            const subcategoriasData = categoria.subcategorias.map(sub => ({
              categoria_id: categoriaCreada.id,
              nombre: sub.nombre,
              descripcion: sub.descripcion || null,
              imagen_url: sub.imagen_url || null,
              enlace_externo: sub.enlace_externo || null,
              orden: sub.orden || 0,
              visible: true
            }));

            const { error: subcategoriasError } = await supabase
              .from('subcategorias')
              .insert(subcategoriasData);

            if (subcategoriasError) {
              console.error(`Error creando subcategorías para ${categoria.nombre}:`, subcategoriasError);
            }
          }
        }
      }

      return { 
        empresa, 
        mensaje: `Empresa creada exitosamente. URL: ${process.env.NEXT_PUBLIC_BASE_URL}/${slug}` 
      };
    } catch (error) {
      console.error('Error en createEmpresa:', error);
      throw error;
    }
  }

  // Obtener todas las empresas
  static async getAllEmpresas(): Promise<Empresa[]> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) {
        throw new Error(`Error obteniendo empresas: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error en getAllEmpresas:', error);
      throw error;
    }
  }

  // Obtener solo empresas activas
  static async getActiveEmpresas(): Promise<Empresa[]> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('estado_sitio', 'publicado')
        .order('fecha_creacion', { ascending: false });

      if (error) {
        throw new Error(`Error obteniendo empresas activas: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error en getActiveEmpresas:', error);
      throw error;
    }
  }

  // Obtener empresa por slug con sus categorías y subcategorías
  static async getEmpresaBySlug(slug: string): Promise<EmpresaCompleta | null> {
    try {
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('*')
        .eq('slug_empresa', slug)
        .eq('estado_sitio', 'publicado')
        .single();

      if (empresaError) {
        if (empresaError.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw new Error(`Error obteniendo empresa: ${empresaError.message}`);
      }

      // Obtener categorías con sus subcategorías
      const { data: categorias, error: categoriasError } = await supabase
        .from('categorias')
        .select(`
          *,
          subcategorias (*)
        `)
        .eq('empresa_id', empresa.id)
        .eq('visible', true)
        .order('orden', { ascending: true });

      if (categoriasError) {
        console.warn('Error obteniendo categorías:', categoriasError.message);
      }

      // Ordenar subcategorías dentro de cada categoría
      const categoriasOrdenadas = categorias?.map(categoria => ({
        ...categoria,
        subcategorias: categoria.subcategorias?.sort((a: any, b: any) => a.orden_subcategoria - b.orden_subcategoria) || []
      })) || [];

      return {
        ...empresa,
        categorias: categoriasOrdenadas
      };
    } catch (error) {
      console.error('Error en getEmpresaBySlug:', error);
      throw error;
    }
  }

  // Obtener empresa por ID
  static async getEmpresaById(id: number): Promise<EmpresaCompleta | null> {
    try {
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', id)
        .single();

      if (empresaError) {
        if (empresaError.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw new Error(`Error obteniendo empresa: ${empresaError.message}`);
      }

      // Obtener categorías con sus subcategorías
      const { data: categorias, error: categoriasError } = await supabase
        .from('categorias')
        .select(`
          *,
          subcategorias (*)
        `)
        .eq('empresa_id', empresa.id)
        .order('orden', { ascending: true });

      if (categoriasError) {
        console.warn('Error obteniendo categorías:', categoriasError.message);
      }

      // Ordenar subcategorías dentro de cada categoría
      const categoriasOrdenadas = categorias?.map(categoria => ({
        ...categoria,
        subcategorias: categoria.subcategorias?.sort((a: any, b: any) => a.orden - b.orden) || []
      })) || [];

      return {
        ...empresa,
        categorias: categoriasOrdenadas
      };
    } catch (error) {
      console.error('Error en getEmpresaById:', error);
      throw error;
    }
  }

  // Actualizar una empresa
  static async updateEmpresa(id: number, data: Partial<EmpresaFormData>): Promise<Empresa> {
    try {
      // Extraer datos que no van en la tabla empresas
      const { categorias, ...empresaData } = data;

      // Actualizar empresa
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .update(empresaData)
        .eq('id', id)
        .select()
        .single();

      if (empresaError) {
        throw new Error(`Error actualizando empresa: ${empresaError.message}`);
      }

      return empresa;
    } catch (error) {
      console.error('Error en updateEmpresa:', error);
      throw error;
    }
  }

  // Cambiar estado activo/inactivo de una empresa
  static async toggleEmpresaStatus(id: number): Promise<Empresa> {
    try {
      // Primero obtener el estado actual
      const { data: currentEmpresa, error: fetchError } = await supabase
        .from('empresas')
        .select('estado_sitio')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(`Error obteniendo estado de empresa: ${fetchError.message}`);
      }

      // Cambiar el estado
      const nuevoEstado = currentEmpresa.estado_sitio === 'publicado' ? 'mantenimiento' : 'publicado';
      const { data: empresa, error: updateError } = await supabase
        .from('empresas')
        .update({ estado_sitio: nuevoEstado })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Error cambiando estado de empresa: ${updateError.message}`);
      }

      return empresa;
    } catch (error) {
      console.error('Error en toggleEmpresaStatus:', error);
      throw error;
    }
  }

  // Eliminar una empresa (eliminación suave - cambiar a inactivo)
  static async deleteEmpresa(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ estado_sitio: 'mantenimiento' })
        .eq('id', id);

      if (error) {
        throw new Error(`Error desactivando empresa: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en deleteEmpresa:', error);
      throw error;
    }
  }

  // Obtener estilos por defecto
  static getDefaultStyles(): Partial<Empresa> {
    return {
      color_primario: '#2563eb',
      color_secundario: '#1e40af',
      tipografia: 'Inter'
    };
  }
}

export default WebGeneratorService;

// Mantener exportación del servicio anterior para compatibilidad
export { WebGeneratorService as OftalmologiaService };
