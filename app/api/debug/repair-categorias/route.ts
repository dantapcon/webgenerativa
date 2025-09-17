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

    // Actualizar todas las categorías de esta empresa para que sean visibles
    const { data, error } = await supabase
      .from('categorias')
      .update({ visible: true })
      .eq('empresa_id', empresaId)
      .select('id, nombre, visible');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // También reparar subcategorías
    const { data: subcategorias, error: subError } = await supabase
      .from('subcategorias')
      .update({ visible: true })
      .in('categoria_id', data?.map(cat => cat.id) || [])
      .select('id, nombre, visible');

    if (subError) {
      console.warn('Error reparando subcategorías:', subError.message);
    }

    return NextResponse.json({
      message: 'Categorías reparadas exitosamente',
      categoriasReparadas: data?.length || 0,
      subcategoriasReparadas: subcategorias?.length || 0,
      categorias: data,
      subcategorias: subcategorias
    });

  } catch (error) {
    console.error('Error reparando categorías:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}