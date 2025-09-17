import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { empresaId } = await request.json();
    
    if (!empresaId) {
      return NextResponse.json({ error: 'ID de empresa requerido' }, { status: 400 });
    }

    // Obtener IDs de categorías de esta empresa
    const { data: categorias, error: categoriasError } = await supabase
      .from('categorias')
      .select('id')
      .eq('empresa_id', empresaId);

    if (categoriasError) {
      return NextResponse.json({ error: categoriasError.message }, { status: 500 });
    }

    const categoriaIds = categorias?.map(cat => cat.id) || [];

    if (categoriaIds.length === 0) {
      return NextResponse.json({ message: 'No hay categorías para esta empresa' });
    }

    // Actualizar todas las subcategorías de esta empresa para que sean visibles
    const { data, error } = await supabase
      .from('subcategorias')
      .update({ visible: true })
      .in('categoria_id', categoriaIds)
      .select('id, nombre, visible, categoria_id');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Subcategorías reparadas exitosamente',
      subcategoriasReparadas: data?.length || 0,
      subcategorias: data
    });

  } catch (error) {
    console.error('Error reparando subcategorías:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}