// Servicios para las operaciones de base de datos del generador web
import { createClient } from '@supabase/supabase-js';
import { 
  Empresa, 
  Categoria, 
  Subcategoria,
  EmpresaCompleta, 
  EmpresaFormData 
} from '../types/webgenerator';

// Interfaces específicas para el servicio
interface CategoriaServicio {
  id?: number;
  nombre: string;
  descripcion: string;
  tipo_display?: 'horizontal' | 'vertical';
  orden: number;
  fondo_tipo?: 'color' | 'imagen';
  fondo_color?: string;
  fondo_imagen?: string;
  subcategorias: {
    id?: number;
    nombre: string;
    descripcion: string;
    imagen_url: string;
    enlace_externo: string;
    orden: number;
  }[];
}

// Cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class WebGeneratorService {
  // Crear una nueva empresa con categorías y subcategorías
  static async createEmpresa(data: EmpresaFormData): Promise<{ empresa: Empresa; mensaje: string }> {
    try {
      // Validar datos requeridos
      if (!data.nombre_empresa || data.nombre_empresa.trim().length === 0) {
        throw new Error('El nombre de la empresa es requerido');
      }

      if (data.nombre_empresa.trim().length < 2) {
        throw new Error('El nombre de la empresa debe tener al menos 2 caracteres');
      }

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
              tipo_display: categoria.tipo_display || 'horizontal',
              orden: categoria.orden || 0,
              visible: true,
              fondo_tipo: categoria.fondo_tipo || 'color',
              fondo_color: categoria.fondo_color || '#ffffff',
              fondo_imagen: categoria.fondo_imagen || null
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

      // Ordenar subcategorías dentro de cada categoría y filtrar visibles (getEmpresaBySlug)
      const categoriasOrdenadas = categorias?.map(categoria => ({
        ...categoria,
        subcategorias: categoria.subcategorias
          ?.filter((sub: any) => sub.visible) // Solo subcategorías visibles
          ?.sort((a: any, b: any) => a.orden - b.orden) || []
      })) || [];

      // Obtener ventana flotante
      const { data: ventanaFlotante, error: ventanaError } = await supabase
        .from('ventana_flotante')
        .select('*')
        .eq('empresa_id', empresa.id)
        .single();

      if (ventanaError && ventanaError.code !== 'PGRST116') {
        console.warn('Error obteniendo ventana flotante:', ventanaError.message);
      }

      // Agregar categoría de "Ubicaciones" si sucursales_activo está habilitado
      if (empresa.sucursales_activo) {
        categoriasOrdenadas.push({
          id: -1, // ID especial para ubicaciones
          empresa_id: empresa.id,
          nombre: 'Ubicaciones',
          descripcion: 'Nuestras sucursales y ubicaciones',
          orden: 999, // Al final
          visible: true,
          subcategorias: []
        });
      }

      return {
        ...empresa,
        categorias: categoriasOrdenadas,
        ventana_flotante: ventanaFlotante || undefined
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

      // Ordenar subcategorías dentro de cada categoría y filtrar visibles (getEmpresaById)
      const categoriasOrdenadas = categorias?.map(categoria => ({
        ...categoria,
        subcategorias: categoria.subcategorias
          ?.filter((sub: any) => sub.visible) // Solo subcategorías visibles
          ?.sort((a: any, b: any) => a.orden - b.orden) || []
      })) || [];

      // Obtener ventana flotante
      const { data: ventanaFlotante, error: ventanaError } = await supabase
        .from('ventana_flotante')
        .select('*')
        .eq('empresa_id', empresa.id)
        .single();

      if (ventanaError && ventanaError.code !== 'PGRST116') {
        console.warn('Error obteniendo ventana flotante:', ventanaError.message);
      }

      return {
        ...empresa,
        categorias: categoriasOrdenadas,
        ventana_flotante: ventanaFlotante || undefined
      };
    } catch (error) {
      console.error('Error en getEmpresaById:', error);
      throw error;
    }
  }

  // Actualizar una empresa
  static async updateEmpresa(
    id: number, 
    data: Partial<EmpresaFormData>, 
    categoriasData?: Array<CategoriaServicio>,
    ventanaFlotanteData?: any
  ): Promise<Empresa> {
    try {
      console.log('🔍 ===== INICIO UPDATE EMPRESA =====');
      console.log('🔍 ID de empresa:', id);
      console.log('🔍 Datos recibidos:', JSON.stringify(data, null, 2));
      console.log('🔍 CategoriasData recibidas:', JSON.stringify(categoriasData, null, 2));
      
      // Extraer datos que no van en la tabla empresas
      const { categorias, ...tempEmpresaData } = data as any;
      const ventana_flotante = (data as any).ventana_flotante;
      
      // Eliminar ventana_flotante de los datos de empresa si existe
      const { ventana_flotante: _, ...empresaData } = tempEmpresaData;

      // Validar y limpiar el email
      if (empresaData.correo_empresa !== undefined) {
        if (typeof empresaData.correo_empresa === 'string') {
          empresaData.correo_empresa = empresaData.correo_empresa.trim();
          // Si está vacío, convertir a null para la base de datos
          if (empresaData.correo_empresa === '') {
            empresaData.correo_empresa = null;
          }
        }
      }

      console.log('🔍 Categorías extraídas del data.categorias:', JSON.stringify(categorias, null, 2));
      console.log('🔍 Ventana flotante extraída:', JSON.stringify(ventana_flotante, null, 2));

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

      // Actualizar ventana flotante si se proporcionaron datos
      if (ventanaFlotanteData) {
        await this.updateVentanaFlotante(id, ventanaFlotanteData);
      } else if (ventana_flotante) {
        // Si la ventana flotante viene en los datos principales
        await this.updateVentanaFlotante(id, ventana_flotante);
      }

      // Si se proporcionaron categorías, actualizarlas
      if (categoriasData && categoriasData.length > 0) {
        // 1. Obtener categorías actuales
        const { data: categoriasActuales, error: categoriasError } = await supabase
          .from('categorias')
          .select('id')
          .eq('empresa_id', id);

        if (categoriasError) {
          console.error('Error obteniendo categorías actuales:', categoriasError);
        }
        
        const idsCategoriasActuales = categoriasActuales?.map(c => c.id) || [];
        
        console.log('🔍 ===== PROCESANDO CATEGORÍAS =====');
        console.log('🔍 Categorías actuales en BD:', idsCategoriasActuales);
        console.log('🔍 Categorías recibidas:', categoriasData?.length || 0);
        console.log('🔍 Detalle de categorías recibidas:', categoriasData?.map(c => ({
          id: c.id,
          nombre: c.nombre,
          subcategorias_count: c.subcategorias?.length || 0,
          subcategorias_ids: c.subcategorias?.map(s => s.id).filter(Boolean) || []
        })));
        
        // 2. Procesar cada categoría
        for (const categoria of categoriasData) {
          if (categoria.id) {
            // Actualizar categoría existente
            const { error: updateCatError } = await supabase
              .from('categorias')
              .update({
                nombre: categoria.nombre,
                descripcion: categoria.descripcion,
                tipo_display: categoria.tipo_display || 'horizontal',
                orden: categoria.orden,
                fondo_tipo: categoria.fondo_tipo || 'color',
                fondo_color: categoria.fondo_color || '#ffffff',
                fondo_imagen: categoria.fondo_imagen || '',
                visible: true // ¡IMPORTANTE! Asegurar que la categoría siga siendo visible
              })
              .eq('id', categoria.id);

            if (updateCatError) {
              console.error(`Error actualizando categoría ${categoria.id}:`, updateCatError);
            }
            
            // Remover de la lista de IDs para no eliminarla después
            const index = idsCategoriasActuales.indexOf(categoria.id);
            if (index > -1) {
              idsCategoriasActuales.splice(index, 1);
            }
          } else if (categoria.nombre.trim()) {
            // Crear nueva categoría
            const { data: nuevaCategoria, error: createCatError } = await supabase
              .from('categorias')
              .insert({
                empresa_id: id,
                nombre: categoria.nombre,
                descripcion: categoria.descripcion || '',
                tipo_display: categoria.tipo_display || 'horizontal',
                orden: categoria.orden,
                fondo_tipo: categoria.fondo_tipo || 'color',
                fondo_color: categoria.fondo_color || '#ffffff',
                fondo_imagen: categoria.fondo_imagen || '',
                visible: true
              })
              .select()
              .single();

            if (createCatError) {
              console.error('Error creando nueva categoría:', createCatError);
              continue;
            }
            
            categoria.id = nuevaCategoria.id;
          }

          // Procesar subcategorías si la categoría tiene ID
          if (categoria.id) {
            // Obtener subcategorías actuales
            const { data: subcategoriasActuales, error: subError } = await supabase
              .from('subcategorias')
              .select('id')
              .eq('categoria_id', categoria.id);

            if (subError) {
              console.error(`Error obteniendo subcategorías para categoría ${categoria.id}:`, subError);
            }

            const idsSubcategoriasActuales = subcategoriasActuales?.map(s => s.id) || [];
            const subcategoriasRecibidas = categoria.subcategorias || []; // Permitir array vacío
            const idsSubcategoriasRecibidas = subcategoriasRecibidas.filter(s => s.id).map(s => s.id);
            
            console.log(`Categoría ${categoria.id} - Subcategorías en BD: [${idsSubcategoriasActuales.join(', ')}]`);
            console.log(`Categoría ${categoria.id} - Subcategorías recibidas: [${idsSubcategoriasRecibidas.join(', ')}]`);

            // ⚠️ CASO ESPECIAL: Si no hay subcategorías recibidas pero SÍ hay en BD, eliminar TODAS
            if (subcategoriasRecibidas.length === 0 && idsSubcategoriasActuales.length > 0) {
              console.log(`🔥 ELIMINACIÓN TOTAL DETECTADA: Categoría ${categoria.id} recibió 0 subcategorías pero tiene ${idsSubcategoriasActuales.length} en BD`);
              console.log(`Eliminando TODAS las subcategorías de la categoría ${categoria.id}: [${idsSubcategoriasActuales.join(', ')}]`);
              
              const { error: deleteAllSubError } = await supabase
                .from('subcategorias')
                .delete()
                .in('id', idsSubcategoriasActuales);

              if (deleteAllSubError) {
                console.error('❌ Error eliminando TODAS las subcategorías:', deleteAllSubError);
              } else {
                console.log(`✅ TODAS las subcategorías eliminadas exitosamente para categoría ${categoria.id}`);
              }
              
              // Continuar con el siguiente ciclo ya que no hay nada más que procesar para esta categoría
              continue;
            }

            // Procesar cada subcategoría recibida (puede ser array vacío)
            for (const subcategoria of subcategoriasRecibidas) {
              console.log(`Procesando subcategoría:`, subcategoria);
              
              if (subcategoria.id) {
                // Verificar si la subcategoría realmente existe en la base de datos
                const { data: existeSub, error: checkSubError } = await supabase
                  .from('subcategorias')
                  .select('id')
                  .eq('id', subcategoria.id)
                  .maybeSingle();
                
                if (checkSubError) {
                  console.error(`Error verificando subcategoría ${subcategoria.id}:`, checkSubError);
                  continue;
                }
                
                if (!existeSub) {
                  console.warn(`La subcategoría con ID ${subcategoria.id} no existe. Creando nueva...`);
                  // Crear como nueva subcategoría si no existe
                  const insertData: Record<string, any> = {
                    categoria_id: categoria.id,
                    nombre: subcategoria.nombre,
                    descripcion: subcategoria.descripcion || '',
                    imagen_url: subcategoria.imagen_url || '',
                    orden: subcategoria.orden,
                    visible: true
                  };
                  
                  // Solo incluir enlace_externo si no está vacío
                  if (subcategoria.hasOwnProperty('enlace_externo') && subcategoria.enlace_externo && subcategoria.enlace_externo.trim()) {
                    let enlace = subcategoria.enlace_externo.trim();
                    console.log(`Procesando enlace externo para subcategoría existente: "${enlace}"`);
                    
                    // Limpiar espacios y caracteres problemáticos
                    if (enlace.includes(' ') || enlace.includes('\n') || enlace.includes('\t')) {
                      console.warn(`Enlace contiene espacios, limpiando: "${enlace}"`);
                      enlace = enlace.replace(/\s+/g, '');
                    }
                    
                    if (!enlace.match(/^https?:\/\//)) {
                      enlace = `https://${enlace}`;
                    }
                    
                    // Validar antes de incluir
                    if (enlace.match(/^https?:\/\/.+/)) {
                      insertData.enlace_externo = enlace;
                      console.log(`Enlace externo válido para subcategoría existente: "${enlace}"`);
                    } else {
                      console.warn(`Enlace externo no válido para subcategoría existente: "${enlace}"`);
                    }
                  }
                  
                  const { error: createNewSubError } = await supabase
                    .from('subcategorias')
                    .insert(insertData);
                  
                  if (createNewSubError) {
                    console.error('Error creando subcategoría que debería existir:', createNewSubError);
                  }
                  continue;
                }
                
                // Preparar datos para actualizar
                const datosActualizados = {
                  nombre: subcategoria.nombre,
                  descripcion: subcategoria.descripcion || '',
                  imagen_url: subcategoria.imagen_url || '',
                  enlace_externo: subcategoria.enlace_externo || '',
                  orden: subcategoria.orden
                  // visible se manejará en la lógica de cleanData
                };
                
                console.log(`Actualizando subcategoría ${subcategoria.id} con:`, datosActualizados);
                
                // Actualizar subcategoría existente
                try {
                  // Limpieza adicional para evitar problemas con valores nulos
                  const cleanData: Record<string, any> = {};
                  
                  // Solo incluir campos que no sean nulos o undefined
                  if (datosActualizados.nombre) cleanData.nombre = datosActualizados.nombre;
                  if (datosActualizados.descripcion !== undefined) cleanData.descripcion = datosActualizados.descripcion || '';
                  
                  // Validar y limpiar imagen_url - NO permitir base64
                  if (datosActualizados.imagen_url !== undefined) {
                    let imagen_url = datosActualizados.imagen_url || '';
                    
                    // Si es una imagen en formato base64, rechazarla y usar cadena vacía
                    if (imagen_url.startsWith('data:image/')) {
                      console.warn('Se detectó imagen en formato base64, rechazando. Use URLs de imágenes.');
                      imagen_url = '';
                    }
                    
                    cleanData.imagen_url = imagen_url;
                  }
                  
                  // Corrección especial para el enlace_externo para cumplir con la restricción CHECK
                  if (datosActualizados.hasOwnProperty('enlace_externo')) {
                    let enlace = datosActualizados.enlace_externo || '';
                    enlace = enlace.trim();
                    
                    // Solo incluir el campo si hay un enlace válido
                    if (enlace) {
                      console.log(`Procesando enlace externo para actualización: "${enlace}"`);
                      
                      // Limpiar espacios y caracteres problemáticos
                      if (enlace.includes(' ') || enlace.includes('\n') || enlace.includes('\t')) {
                        console.warn(`Enlace contiene espacios, limpiando: "${enlace}"`);
                        enlace = enlace.replace(/\s+/g, '');
                      }
                      
                      // Si hay un enlace y no empieza con http:// o https://, añadir https://
                      if (!enlace.match(/^https?:\/\//)) {
                        enlace = `https://${enlace}`;
                      }
                      
                      // Validar antes de incluir
                      if (enlace.match(/^https?:\/\/.+/)) {
                        cleanData.enlace_externo = enlace;
                        console.log(`Enlace externo válido para actualización: "${enlace}"`);
                      } else {
                        console.warn(`Enlace externo no válido para actualización: "${enlace}"`);
                      }
                    } else {
                      console.log('Enlace externo vacío en actualización, omitiendo campo');
                      // No incluir el campo en la actualización si está vacío
                    }
                  }
                  
                  if (datosActualizados.orden !== undefined) cleanData.orden = datosActualizados.orden || 0;
                  
                  // Mantener las subcategorías como visibles cuando se actualizan
                  // (La eliminación se maneja por separado mediante splice en el frontend)
                  cleanData.visible = true;
                  
                  console.log(`Datos a actualizar para subcategoría ${subcategoria.id}:`, JSON.stringify(cleanData));
                  
                  // Si no hay datos para actualizar, omitir esta actualización
                  if (Object.keys(cleanData).length === 0) {
                    console.log(`No hay datos para actualizar en subcategoría ${subcategoria.id}, omitiendo`);
                    continue;
                  }
                  
                  // Verificar si la subcategoría existe realmente
                  const { data: checkData, error: checkError } = await supabase
                    .from('subcategorias')
                    .select('id')
                    .eq('id', subcategoria.id)
                    .single();
                    
                  if (checkError || !checkData) {
                    console.warn(`La subcategoría ${subcategoria.id} no existe, omitiendo actualización`);
                    continue;
                  }
                  
                  // Realizar la actualización
                  const { data, error: updateSubError } = await supabase
                    .from('subcategorias')
                    .update(cleanData)
                    .eq('id', subcategoria.id)
                    .select();

                  if (updateSubError) {
                    console.error(`Error actualizando subcategoría ${subcategoria.id}:`, updateSubError);
                    console.error(`Datos que causaron el error: ${JSON.stringify(cleanData)}`);
                    
                    // Intento de depuración adicional
                    if (updateSubError.details) {
                      console.error(`Detalles del error: ${updateSubError.details}`);
                    }
                    if (updateSubError.hint) {
                      console.error(`Sugerencia: ${updateSubError.hint}`);
                    }
                    
                    // No lanzar el error para que el proceso continúe
                    console.log('Continuando proceso a pesar del error...');
                  } else {
                    console.log(`Subcategoría ${subcategoria.id} actualizada exitosamente:`, data);
                  }
                } catch (err) {
                  console.error(`Excepción al actualizar subcategoría ${subcategoria.id}:`, err);
                  console.error(`Datos que causaron la excepción: ${JSON.stringify(datosActualizados)}`);
                  
                  // No lanzar el error para que el proceso continúe
                  console.log('Continuando proceso a pesar de la excepción...');
                }

                // Remover de la lista de IDs para no eliminarla después
                const index = idsSubcategoriasActuales.indexOf(subcategoria.id);
                if (index > -1) {
                  idsSubcategoriasActuales.splice(index, 1);
                }
              } else if (subcategoria.nombre.trim()) {
                // Crear nueva subcategoría
                console.log(`Creando nueva subcategoría "${subcategoria.nombre}" para categoría ${categoria.id}`);
                
                // Prepara datos para nueva subcategoría
                const datosNuevaSub: Record<string, any> = {
                  categoria_id: categoria.id,
                  nombre: subcategoria.nombre,
                  descripcion: subcategoria.descripcion || '',
                  imagen_url: subcategoria.imagen_url || '',
                  orden: subcategoria.orden || 0,
                  visible: true
                };
                
                // Manejo especial para enlace_externo
                if (subcategoria.hasOwnProperty('enlace_externo') && subcategoria.enlace_externo && subcategoria.enlace_externo.trim()) {
                  let enlace = subcategoria.enlace_externo.trim();
                  console.log(`Procesando enlace externo original: "${enlace}"`);
                  
                  // Verificar que el enlace no contenga caracteres problemáticos
                  if (enlace.includes(' ') || enlace.includes('\n') || enlace.includes('\t')) {
                    console.warn(`Enlace contiene espacios o caracteres especiales, limpiando: "${enlace}"`);
                    enlace = enlace.replace(/\s+/g, '');
                  }
                  
                  // Si hay un enlace y no empieza con http:// o https://, añadir https://
                  if (!enlace.match(/^https?:\/\//)) {
                    enlace = `https://${enlace}`;
                  }
                  
                  // Validar que el enlace final cumpla con el patrón de la base de datos
                  if (enlace.match(/^https?:\/\/.+/)) {
                    datosNuevaSub.enlace_externo = enlace;
                    console.log(`Enlace externo válido procesado: "${enlace}"`);
                  } else {
                    console.warn(`Enlace externo no válido después del procesamiento: "${enlace}". No se incluirá.`);
                  }
                } else {
                  console.log('No hay enlace externo válido o campo no presente, omitiendo campo');
                }
                // No incluir enlace_externo en los datos si está vacío (evita constraint violation)
                
                console.log(`Intentando crear subcategoría con datos:`, JSON.stringify(datosNuevaSub, null, 2));
                
                const { data: nuevaSubcategoria, error: createSubError } = await supabase
                  .from('subcategorias')
                  .insert(datosNuevaSub)
                  .select()
                  .single();

                if (createSubError) {
                  console.error('Error creando nueva subcategoría:', createSubError);
                  console.error('Datos que causaron el error:', JSON.stringify(datosNuevaSub, null, 2));
                  
                  // Información adicional del error
                  if (createSubError.details) {
                    console.error('Detalles del error:', createSubError.details);
                  }
                  if (createSubError.hint) {
                    console.error('Sugerencia:', createSubError.hint);
                  }
                  if (createSubError.message) {
                    console.error('Mensaje de error:', createSubError.message);
                  }
                  
                  // Continuar con el proceso a pesar del error
                  console.log('Continuando proceso a pesar del error...');
                } else {
                  console.log(`Subcategoría creada con éxito, ID: ${nuevaSubcategoria?.id}`);
                  // Actualizar el ID para evitar duplicación en futuras actualizaciones
                  subcategoria.id = nuevaSubcategoria?.id;
                }
              }
            }

            // Eliminar subcategorías que ya no existen
            if (idsSubcategoriasActuales.length > 0) {
              console.log(`Eliminando ${idsSubcategoriasActuales.length} subcategorías con IDs: ${idsSubcategoriasActuales.join(', ')}`);
              const { error: deleteSubError } = await supabase
                .from('subcategorias')
                .delete()
                .in('id', idsSubcategoriasActuales);

              if (deleteSubError) {
                console.error('Error eliminando subcategorías:', deleteSubError);
              } else {
                console.log(`${idsSubcategoriasActuales.length} subcategorías eliminadas exitosamente`);
              }
            } else {
              console.log(`No hay subcategorías para eliminar en la categoría ${categoria.id}`);
            }
          }
        }

        // 3. Eliminar categorías que ya no existen
        if (idsCategoriasActuales.length > 0) {
          const { error: deleteCatError } = await supabase
            .from('categorias')
            .delete()
            .in('id', idsCategoriasActuales);

          if (deleteCatError) {
            console.error('Error eliminando categorías:', deleteCatError);
          }
        }
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

  // Actualizar ventana flotante de una empresa
  static async updateVentanaFlotante(empresaId: number, data: any): Promise<void> {
    try {
      // Verificar si ya existe una ventana flotante para esta empresa
      const { data: existing, error: selectError } = await supabase
        .from('ventana_flotante')
        .select('id')
        .eq('empresa_id', empresaId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.warn('Error verificando ventana flotante existente:', selectError.message);
      }

      if (existing) {
        // Actualizar existente
        const { error: updateError } = await supabase
          .from('ventana_flotante')
          .update({
            activo: data.activo,
            titulo: data.titulo,
            mensaje: data.mensaje,
            imagen_url: data.imagen_url,
            video_url: data.video_url,
            fondo_tipo: data.fondo_tipo,
            fondo_color: data.fondo_color,
            fondo_imagen: data.fondo_imagen,
            updated_at: new Date().toISOString()
          })
          .eq('empresa_id', empresaId);

        if (updateError) {
          throw new Error(`Error actualizando ventana flotante: ${updateError.message}`);
        }
      } else {
        // Crear nueva
        const { error: insertError } = await supabase
          .from('ventana_flotante')
          .insert([{
            empresa_id: empresaId,
            activo: data.activo || false,
            titulo: data.titulo,
            mensaje: data.mensaje,
            imagen_url: data.imagen_url,
            video_url: data.video_url,
            fondo_tipo: data.fondo_tipo || 'color',
            fondo_color: data.fondo_color || '#ffffff',
            fondo_imagen: data.fondo_imagen
          }]);

        if (insertError) {
          throw new Error(`Error creando ventana flotante: ${insertError.message}`);
        }
      }
    } catch (error) {
      console.error('Error en updateVentanaFlotante:', error);
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
