import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Obtener un producto específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productoId: string }> }
) {
  try {
    const { productoId } = await params;

    if (!productoId) {
      return NextResponse.json(
        { error: 'ID de producto requerido' },
        { status: 400 }
      );
    }

    const { data: producto, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias (
          id,
          nombre,
          descripcion
        ),
        subcategorias (
          id,
          nombre,
          descripcion
        )
      `)
      .eq('id', parseInt(productoId))
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Producto no encontrado' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Error al obtener el producto: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: producto
    });

  } catch (error: any) {
    console.error('Error en GET /api/productos/[productoId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un producto específico
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productoId: string }> }
) {
  try {
    const { productoId } = await params;
    const body = await request.json();

    if (!productoId) {
      return NextResponse.json(
        { error: 'ID de producto requerido' },
        { status: 400 }
      );
    }

    const {
      categoria_id,
      subcategoria_id,
      nombre,
      descripcion,
      precio,
      imagen_url,
      orden,
      activo,
      descuento_prom,
      promocion_activa
    } = body;

    // Validaciones básicas
    if (nombre && nombre.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre no puede estar vacío' },
        { status: 400 }
      );
    }

    // Validar descuento
    if (descuento_prom !== undefined && (descuento_prom < 0 || descuento_prom > 100)) {
      return NextResponse.json(
        { error: 'El descuento debe estar entre 0 y 100' },
        { status: 400 }
      );
    }

    // Verificar que el producto existe y obtener empresa_id
    const { data: productoExistente, error: productoError } = await supabase
      .from('productos')
      .select('id, empresa_id')
      .eq('id', parseInt(productoId))
      .single();

    if (productoError || !productoExistente) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar categoría si se proporciona
    if (categoria_id) {
      const { data: categoria, error: categoriaError } = await supabase
        .from('categorias')
        .select('id')
        .eq('id', categoria_id)
        .eq('empresa_id', productoExistente.empresa_id)
        .single();

      if (categoriaError || !categoria) {
        return NextResponse.json(
          { error: 'Categoría no encontrada o no pertenece a la empresa' },
          { status: 400 }
        );
      }
    }

    // Verificar subcategoría si se proporciona
    if (subcategoria_id && categoria_id) {
      const { data: subcategoria, error: subcategoriaError } = await supabase
        .from('subcategorias')
        .select('id')
        .eq('id', subcategoria_id)
        .eq('categoria_id', categoria_id)
        .single();

      if (subcategoriaError || !subcategoria) {
        return NextResponse.json(
          { error: 'Subcategoría no encontrada o no pertenece a la categoría' },
          { status: 400 }
        );
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {
      fecha_actualizacion: new Date().toISOString()
    };

    // Solo actualizar campos que se proporcionaron
    if (nombre !== undefined) updateData.nombre = nombre.trim();
    if (categoria_id !== undefined) updateData.categoria_id = categoria_id || null;
    if (subcategoria_id !== undefined) updateData.subcategoria_id = subcategoria_id || null;
    if (descripcion !== undefined) updateData.descripcion = descripcion?.trim() || null;
    if (precio !== undefined) updateData.precio = precio || null;
    if (imagen_url !== undefined) updateData.imagen_url = imagen_url || null;
    if (orden !== undefined) updateData.orden = orden;
    if (activo !== undefined) updateData.activo = activo;
    if (descuento_prom !== undefined) updateData.descuento_prom = descuento_prom;
    if (promocion_activa !== undefined) updateData.promocion_activa = promocion_activa;

    // Actualizar el producto
    const { data: producto, error } = await supabase
      .from('productos')
      .update(updateData)
      .eq('id', parseInt(productoId))
      .select(`
        *,
        categorias (
          id,
          nombre,
          descripcion
        ),
        subcategorias (
          id,
          nombre,
          descripcion
        )
      `)
      .single();

    if (error) {
      console.error('Error actualizando producto:', error);
      return NextResponse.json(
        { error: `Error al actualizar el producto: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: producto
    });

  } catch (error: any) {
    console.error('Error en PUT /api/productos/[productoId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un producto específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productoId: string }> }
) {
  try {
    const { productoId } = await params;

    if (!productoId) {
      return NextResponse.json(
        { error: 'ID de producto requerido' },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .select('id, nombre')
      .eq('id', parseInt(productoId))
      .single();

    if (productoError || !producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el producto
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', parseInt(productoId));

    if (error) {
      console.error('Error eliminando producto:', error);
      return NextResponse.json(
        { error: `Error al eliminar el producto: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Producto "${producto.nombre}" eliminado exitosamente`
    });

  } catch (error: any) {
    console.error('Error en DELETE /api/productos/[productoId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Actualización parcial (por ejemplo, cambiar solo el estado activo)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productoId: string }> }
) {
  try {
    const { productoId } = await params;
    const body = await request.json();

    if (!productoId) {
      return NextResponse.json(
        { error: 'ID de producto requerido' },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const { data: productoExistente, error: productoError } = await supabase
      .from('productos')
      .select('id')
      .eq('id', parseInt(productoId))
      .single();

    if (productoError || !productoExistente) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Preparar datos para actualizar (solo campos específicos para PATCH)
    const updateData: any = {
      fecha_actualizacion: new Date().toISOString()
    };

    // Campos típicos para PATCH (cambios de estado)
    if (body.activo !== undefined) updateData.activo = body.activo;
    if (body.promocion_activa !== undefined) updateData.promocion_activa = body.promocion_activa;
    if (body.orden !== undefined) updateData.orden = body.orden;
    if (body.descuento_prom !== undefined) {
      if (body.descuento_prom < 0 || body.descuento_prom > 100) {
        return NextResponse.json(
          { error: 'El descuento debe estar entre 0 y 100' },
          { status: 400 }
        );
      }
      updateData.descuento_prom = body.descuento_prom;
    }

    // Actualizar el producto
    const { data: producto, error } = await supabase
      .from('productos')
      .update(updateData)
      .eq('id', parseInt(productoId))
      .select(`
        *,
        categorias (
          id,
          nombre,
          descripcion
        ),
        subcategorias (
          id,
          nombre,
          descripcion
        )
      `)
      .single();

    if (error) {
      console.error('Error actualizando producto:', error);
      return NextResponse.json(
        { error: `Error al actualizar el producto: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: producto
    });

  } catch (error: any) {
    console.error('Error en PATCH /api/productos/[productoId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}