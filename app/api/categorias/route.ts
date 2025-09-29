import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Obtener todas las categorías de una empresa
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

    const { data: categorias, error } = await supabase
      .from('categorias')
      .select(`
        *,
        subcategorias (*)
      `)
      .eq('empresa_id', parseInt(empresaId))
      .order('orden', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Error al obtener las categorías: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: categorias || []
    });

  } catch (error) {
    console.error('Error en GET /api/categorias:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva categoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      empresa_id,
      nombre,
      descripcion,
      tipo_display,
      orden,
      visible,
      fondo_tipo,
      fondo_color,
      fondo_imagen
    } = body;

    // Validaciones
    if (!empresa_id || !nombre) {
      return NextResponse.json(
        { error: 'empresa_id y nombre son requeridos' },
        { status: 400 }
      );
    }

    if (nombre.trim().length < 2) {
      return NextResponse.json(
        { error: 'El nombre debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

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

    // Crear la categoría
    const { data: categoria, error: categoriaError } = await supabase
      .from('categorias')
      .insert([{
        empresa_id: parseInt(empresa_id),
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        tipo_display: tipo_display || 'horizontal',
        orden: orden || 0,
        visible: visible !== undefined ? visible : true,
        fondo_tipo: fondo_tipo || 'color',
        fondo_color: fondo_color || '#ffffff',
        fondo_imagen: fondo_imagen || null
      }])
      .select()
      .single();

    if (categoriaError) {
      return NextResponse.json(
        { error: `Error al crear la categoría: ${categoriaError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: categoria
    });

  } catch (error) {
    console.error('Error en POST /api/categorias:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}