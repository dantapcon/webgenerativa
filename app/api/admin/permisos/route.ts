import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const empresaId = searchParams.get('empresa_id');

    if (!userId || !empresaId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('admin_permisos')
      .select('*')
      .eq('user_id', userId)
      .eq('empresa_id', parseInt(empresaId));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ permisos: data });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, empresa_id, permisos } = body;

    if (!user_id || !empresa_id) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const supabase = await createClient();

    // Crear o actualizar permisos
    const { data, error } = await supabase
      .from('admin_permisos')
      .upsert({
        user_id,
        empresa_id: parseInt(empresa_id),
        ...permisos
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ permisos: data });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
