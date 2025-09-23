import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Obtener configuración de fondo de una categoría específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoriaId: string }> }
) {
  try {
    const { categoriaId } = await params;

    if (!categoriaId) {
      return NextResponse.json(
        { error: 'ID de categoría requerido' },
        { status: 400 }
      );
    }

    const { data: categoria, error } = await supabase
      .from('categorias')
      .select('id, nombre, fondo_tipo, fondo_color, fondo_imagen, empresa_id')
      .eq('id', parseInt(categoriaId))
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Error al obtener la categoría: ${error.message}` },
        { status: 500 }
      );
    }

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: categoria.id,
        nombre: categoria.nombre,
        empresa_id: categoria.empresa_id,
        fondo_tipo: categoria.fondo_tipo || 'color',
        fondo_color: categoria.fondo_color || '#ffffff',
        fondo_imagen: categoria.fondo_imagen || null
      }
    });

  } catch (error) {
    console.error('Error en GET /api/categorias/[categoriaId]/fondo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar configuración de fondo de una categoría
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoriaId: string }> }
) {
  try {
    const { categoriaId } = await params;
    const body = await request.json();

    if (!categoriaId) {
      return NextResponse.json(
        { error: 'ID de categoría requerido' },
        { status: 400 }
      );
    }

    // Validar datos de entrada
    const { fondo_tipo, fondo_color, fondo_imagen } = body;

    // Validaciones
    if (fondo_tipo && !['color', 'imagen'].includes(fondo_tipo)) {
      return NextResponse.json(
        { error: 'fondo_tipo debe ser "color" o "imagen"' },
        { status: 400 }
      );
    }

    if (fondo_color && !/^#[0-9A-Fa-f]{6}$/.test(fondo_color)) {
      return NextResponse.json(
        { error: 'fondo_color debe ser un color hexadecimal válido (#RRGGBB)' },
        { status: 400 }
      );
    }

    // Verificar que la categoría existe
    const { data: categoriaExistente, error: errorBusqueda } = await supabase
      .from('categorias')
      .select('id, empresa_id')
      .eq('id', parseInt(categoriaId))
      .single();

    if (errorBusqueda || !categoriaExistente) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Preparar datos para actualizar
    const updateData: any = {};
    
    if (fondo_tipo !== undefined) updateData.fondo_tipo = fondo_tipo;
    if (fondo_color !== undefined) updateData.fondo_color = fondo_color;
    if (fondo_imagen !== undefined) updateData.fondo_imagen = fondo_imagen;
    
    // Agregar timestamp de actualización
    updateData.updated_at = new Date().toISOString();

    // Actualizar la categoría
    const { data: categoriaActualizada, error: errorActualizacion } = await supabase
      .from('categorias')
      .update(updateData)
      .eq('id', parseInt(categoriaId))
      .select('id, nombre, fondo_tipo, fondo_color, fondo_imagen, empresa_id')
      .single();

    if (errorActualizacion) {
      return NextResponse.json(
        { error: `Error al actualizar la categoría: ${errorActualizacion.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración de fondo actualizada exitosamente',
      data: categoriaActualizada
    });

  } catch (error) {
    console.error('Error en PUT /api/categorias/[categoriaId]/fondo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Actualización parcial de configuración de fondo
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ categoriaId: string }> }
) {
  try {
    const { categoriaId } = await params;
    const body = await request.json();

    if (!categoriaId) {
      return NextResponse.json(
        { error: 'ID de categoría requerido' },
        { status: 400 }
      );
    }

    // Para PATCH, solo actualizamos los campos proporcionados
    const { fondo_tipo, fondo_color, fondo_imagen } = body;

    // Validaciones solo si los campos están presentes
    if (fondo_tipo !== undefined && !['color', 'imagen'].includes(fondo_tipo)) {
      return NextResponse.json(
        { error: 'fondo_tipo debe ser "color" o "imagen"' },
        { status: 400 }
      );
    }

    if (fondo_color !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(fondo_color)) {
      return NextResponse.json(
        { error: 'fondo_color debe ser un color hexadecimal válido (#RRGGBB)' },
        { status: 400 }
      );
    }

    // Verificar que la categoría existe
    const { data: categoriaExistente, error: errorBusqueda } = await supabase
      .from('categorias')
      .select('id, empresa_id')
      .eq('id', parseInt(categoriaId))
      .single();

    if (errorBusqueda || !categoriaExistente) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Preparar datos para actualizar (solo los campos proporcionados)
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (fondo_tipo !== undefined) updateData.fondo_tipo = fondo_tipo;
    if (fondo_color !== undefined) updateData.fondo_color = fondo_color;
    if (fondo_imagen !== undefined) updateData.fondo_imagen = fondo_imagen;

    // Actualizar la categoría
    const { data: categoriaActualizada, error: errorActualizacion } = await supabase
      .from('categorias')
      .update(updateData)
      .eq('id', parseInt(categoriaId))
      .select('id, nombre, fondo_tipo, fondo_color, fondo_imagen, empresa_id')
      .single();

    if (errorActualizacion) {
      return NextResponse.json(
        { error: `Error al actualizar la categoría: ${errorActualizacion.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración de fondo actualizada exitosamente',
      data: categoriaActualizada
    });

  } catch (error) {
    console.error('Error en PATCH /api/categorias/[categoriaId]/fondo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}