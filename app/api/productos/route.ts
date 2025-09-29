import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Obtener todos los productos de una empresa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');
    const categoriaId = searchParams.get('categoriaId');
    const subcategoriaId = searchParams.get('subcategoriaId');
    const soloActivos = searchParams.get('activos') === 'true';

    if (!empresaId) {
      return NextResponse.json(
        { error: 'ID de empresa requerido' },
        { status: 400 }
      );
    }

    let query = supabase
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
      .eq('empresa_id', parseInt(empresaId));

    // Filtros opcionales
    if (categoriaId) {
      query = query.eq('categoria_id', parseInt(categoriaId));
    }

    if (subcategoriaId) {
      query = query.eq('subcategoria_id', parseInt(subcategoriaId));
    }

    if (soloActivos) {
      query = query.eq('activo', true);
    }

    // Ordenar por orden y luego por fecha de creación
    query = query.order('orden', { ascending: true })
                 .order('fecha_creacion', { ascending: false });

    const { data: productos, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: `Error al obtener productos: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: productos || []
    });

  } catch (error: any) {
    console.error('Error en GET /api/productos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      empresa_id,
      categoria_id,
      subcategoria_id,
      nombre,
      descripcion,
      precio,
      imagen_url,
      orden = 0,
      activo = true,
      descuento_prom = 0,
      promocion_activa = false
    } = body;

    // Validaciones básicas
    if (!empresa_id || !nombre || nombre.trim().length === 0) {
      return NextResponse.json(
        { error: 'Empresa ID y nombre son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el descuento esté en el rango correcto
    if (descuento_prom < 0 || descuento_prom > 100) {
      return NextResponse.json(
        { error: 'El descuento debe estar entre 0 y 100' },
        { status: 400 }
      );
    }

    // Verificar que la empresa existe
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('id')
      .eq('id', empresa_id)
      .single();

    if (empresaError || !empresa) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la categoría pertenece a la empresa (si se proporciona)
    if (categoria_id) {
      const { data: categoria, error: categoriaError } = await supabase
        .from('categorias')
        .select('id')
        .eq('id', categoria_id)
        .eq('empresa_id', empresa_id)
        .single();

      if (categoriaError || !categoria) {
        return NextResponse.json(
          { error: 'Categoría no encontrada o no pertenece a la empresa' },
          { status: 400 }
        );
      }
    }

    // Verificar que la subcategoría pertenece a la categoría (si se proporciona)
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

    // Crear el producto
    const { data: producto, error } = await supabase
      .from('productos')
      .insert([{
        empresa_id,
        categoria_id: categoria_id || null,
        subcategoria_id: subcategoria_id || null,
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        precio: precio || null,
        imagen_url: imagen_url || null,
        orden,
        activo,
        descuento_prom,
        promocion_activa
      }])
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
      console.error('Error creando producto:', error);
      return NextResponse.json(
        { error: `Error al crear el producto: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Producto creado exitosamente',
      data: producto
    });

  } catch (error: any) {
    console.error('Error en POST /api/productos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto completo
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productoId = searchParams.get('id');
    const body = await request.json();

    if (!productoId) {
      return NextResponse.json(
        { error: 'ID del producto requerido' },
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
    if (!nombre || nombre.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
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
      nombre: nombre.trim(),
      fecha_actualizacion: new Date().toISOString()
    };

    // Solo actualizar campos que se proporcionaron
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
    console.error('Error en PUT /api/productos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productoId = searchParams.get('id');

    if (!productoId) {
      return NextResponse.json(
        { error: 'ID del producto requerido' },
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
    console.error('Error en DELETE /api/productos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}