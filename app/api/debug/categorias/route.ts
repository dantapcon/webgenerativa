import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');
    
    if (!empresaId) {
      return NextResponse.json({ error: 'ID de empresa requerido' }, { status: 400 });
    }

    // Obtener todas las categorías (visibles e invisibles) para depuración
    const { data: categorias, error } = await supabase
      .from('categorias')
      .select('id, nombre, visible, orden, empresa_id')
      .eq('empresa_id', parseInt(empresaId))
      .order('orden', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Contar categorías visibles e invisibles
    const visibles = categorias?.filter(cat => cat.visible) || [];
    const invisibles = categorias?.filter(cat => !cat.visible) || [];

    return NextResponse.json({
      total: categorias?.length || 0,
      visibles: visibles.length,
      invisibles: invisibles.length,
      categorias: categorias,
      categoriasVisibles: visibles,
      categoriasInvisibles: invisibles
    });

  } catch (error) {
    console.error('Error en debug categorías:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}