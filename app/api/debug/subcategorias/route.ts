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

    // Obtener todas las subcategorías para debug
    const { data: subcategorias, error } = await supabase
      .from('subcategorias')
      .select(`
        id, 
        nombre, 
        visible, 
        orden, 
        categoria_id,
        fecha_creacion,
        categorias!inner (
          id,
          nombre,
          empresa_id
        )
      `)
      .eq('categorias.empresa_id', parseInt(empresaId))
      .order('categoria_id', { ascending: true })
      .order('orden', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Agrupar por visibilidad
    const visibles = subcategorias?.filter(sub => sub.visible) || [];
    const invisibles = subcategorias?.filter(sub => !sub.visible) || [];

    // Agrupar por categoría
    const porCategoria = subcategorias?.reduce((acc: any, sub: any) => {
      const catId = sub.categoria_id;
      if (!acc[catId]) {
        acc[catId] = {
          categoria_id: catId,
          categoria_nombre: sub.categorias?.nombre || 'Desconocida',
          subcategorias: []
        };
      }
      acc[catId].subcategorias.push(sub);
      return acc;
    }, {});

    return NextResponse.json({
      total: subcategorias?.length || 0,
      visibles: visibles.length,
      invisibles: invisibles.length,
      subcategorias: subcategorias,
      subcategoriasVisibles: visibles,
      subcategoriasInvisibles: invisibles,
      porCategoria: Object.values(porCategoria || {})
    });

  } catch (error) {
    console.error('Error en debug subcategorías:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}