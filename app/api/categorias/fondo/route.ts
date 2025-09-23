import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Obtener todas las categorías de una empresa con configuración de fondo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');
    
    if (!empresaId) {
      return NextResponse.json(
        { error: 'ID de empresa requerido' },
        { status: 400 }
      );
    }

    // Obtener todas las categorías con configuración de fondo
    const { data: categorias, error } = await supabase
      .from('categorias')
      .select(`
        id,
        nombre,
        descripcion,
        tipo_display,
        orden,
        visible,
        fecha_creacion,
        fondo_tipo,
        fondo_color,
        fondo_imagen,
        empresa_id
      `)
      .eq('empresa_id', parseInt(empresaId))
      .order('orden', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Error al obtener categorías: ${error.message}` },
        { status: 500 }
      );
    }

    // Procesar datos y asegurar valores por defecto
    const categoriasProcessed = categorias?.map(categoria => ({
      ...categoria,
      fondo_tipo: categoria.fondo_tipo || 'color',
      fondo_color: categoria.fondo_color || '#ffffff',
      fondo_imagen: categoria.fondo_imagen || null
    })) || [];

    // Estadísticas
    const stats = {
      total: categoriasProcessed.length,
      visibles: categoriasProcessed.filter(cat => cat.visible).length,
      con_fondo_color: categoriasProcessed.filter(cat => cat.fondo_tipo === 'color').length,
      con_fondo_imagen: categoriasProcessed.filter(cat => cat.fondo_tipo === 'imagen' && cat.fondo_imagen).length
    };

    return NextResponse.json({
      success: true,
      data: categoriasProcessed,
      stats
    });

  } catch (error) {
    console.error('Error en GET /api/categorias/fondo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Actualizar configuración de fondo para múltiples categorías
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresaId, actualizaciones } = body;

    if (!empresaId) {
      return NextResponse.json(
        { error: 'ID de empresa requerido' },
        { status: 400 }
      );
    }

    if (!actualizaciones || !Array.isArray(actualizaciones)) {
      return NextResponse.json(
        { error: 'Array de actualizaciones requerido' },
        { status: 400 }
      );
    }

    const resultados = [];
    const errores = [];

    // Procesar cada actualización
    for (const actualizacion of actualizaciones) {
      const { categoriaId, fondo_tipo, fondo_color, fondo_imagen } = actualizacion;

      if (!categoriaId) {
        errores.push({ categoriaId, error: 'ID de categoría requerido' });
        continue;
      }

      // Validaciones
      if (fondo_tipo && !['color', 'imagen'].includes(fondo_tipo)) {
        errores.push({ 
          categoriaId, 
          error: 'fondo_tipo debe ser "color" o "imagen"' 
        });
        continue;
      }

      if (fondo_color && !/^#[0-9A-Fa-f]{6}$/.test(fondo_color)) {
        errores.push({ 
          categoriaId, 
          error: 'fondo_color debe ser un color hexadecimal válido (#RRGGBB)' 
        });
        continue;
      }

      try {
        // Verificar que la categoría pertenece a la empresa
        const { data: categoriaExistente, error: errorBusqueda } = await supabase
          .from('categorias')
          .select('id, nombre, empresa_id')
          .eq('id', parseInt(categoriaId))
          .eq('empresa_id', parseInt(empresaId))
          .single();

        if (errorBusqueda || !categoriaExistente) {
          errores.push({ 
            categoriaId, 
            error: 'Categoría no encontrada o no pertenece a la empresa' 
          });
          continue;
        }

        // Preparar datos para actualizar
        const updateData: any = { updated_at: new Date().toISOString() };
        
        if (fondo_tipo !== undefined) updateData.fondo_tipo = fondo_tipo;
        if (fondo_color !== undefined) updateData.fondo_color = fondo_color;
        if (fondo_imagen !== undefined) updateData.fondo_imagen = fondo_imagen;

        // Actualizar la categoría
        const { data: categoriaActualizada, error: errorActualizacion } = await supabase
          .from('categorias')
          .update(updateData)
          .eq('id', parseInt(categoriaId))
          .select('id, nombre, fondo_tipo, fondo_color, fondo_imagen')
          .single();

        if (errorActualizacion) {
          errores.push({ 
            categoriaId, 
            error: `Error al actualizar: ${errorActualizacion.message}` 
          });
          continue;
        }

        resultados.push({
          categoriaId,
          nombre: categoriaActualizada.nombre,
          actualizada: true,
          data: categoriaActualizada
        });

      } catch (error) {
        errores.push({ 
          categoriaId, 
          error: `Error inesperado: ${error}` 
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Se procesaron ${actualizaciones.length} actualizaciones`,
      resultados: {
        exitosas: resultados.length,
        fallidas: errores.length,
        actualizaciones_exitosas: resultados,
        errores: errores
      }
    });

  } catch (error) {
    console.error('Error en POST /api/categorias/fondo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}