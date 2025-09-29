import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Obtener productos por categoría
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoriaId: string }> }
) {
  try {
    const { categoriaId } = await params;
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');
    const soloActivos = searchParams.get('activos') === 'true';

    if (!categoriaId) {
      return NextResponse.json(
        { error: 'ID de categoría requerido' },
        { status: 400 }
      );
    }

    // Verificar que la categoría existe
    let categoriaQuery = supabase
      .from('categorias')
      .select('id, nombre, empresa_id')
      .eq('id', parseInt(categoriaId));

    // Si se proporciona empresaId, verificar que la categoría pertenece a esa empresa
    if (empresaId) {
      categoriaQuery = categoriaQuery.eq('empresa_id', parseInt(empresaId));
    }

    const { data: categoria, error: categoriaError } = await categoriaQuery.single();

    if (categoriaError || !categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Obtener productos de la categoría
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
      .eq('categoria_id', parseInt(categoriaId));

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
      data: {
        categoria,
        productos: productos || []
      }
    });

  } catch (error: any) {
    console.error('Error en GET /api/productos/categoria/[categoriaId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo producto en una categoría específica
export async function POST(
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

    const {
      empresa_id,
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

    // Verificar que la categoría existe y pertenece a la empresa
    const { data: categoria, error: categoriaError } = await supabase
      .from('categorias')
      .select('id, empresa_id')
      .eq('id', parseInt(categoriaId))
      .eq('empresa_id', empresa_id)
      .single();

    if (categoriaError || !categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada o no pertenece a la empresa' },
        { status: 404 }
      );
    }

    // Verificar subcategoría si se proporciona
    if (subcategoria_id) {
      const { data: subcategoria, error: subcategoriaError } = await supabase
        .from('subcategorias')
        .select('id')
        .eq('id', subcategoria_id)
        .eq('categoria_id', parseInt(categoriaId))
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
        categoria_id: parseInt(categoriaId),
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
      message: 'Producto creado exitosamente en la categoría',
      data: producto
    });

  } catch (error: any) {
    console.error('Error en POST /api/productos/categoria/[categoriaId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}