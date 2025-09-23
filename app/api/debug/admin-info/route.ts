// Endpoint de debug para verificar información del administrador
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa_id');

    if (!empresaId) {
      return NextResponse.json({
        success: false,
        error: 'empresa_id es requerido'
      }, { status: 400 });
    }

    // Obtener administrador de la empresa
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('administradores')
      .select('*')
      .eq('empresa_id', parseInt(empresaId))
      .single();

    console.log('Debug Admin Info:', {
      empresaId,
      admin,
      adminError
    });

    // También verificar la estructura de la tabla procesos_edicion
    const { data: permisos, error: permisosError } = await supabaseAdmin
      .from('procesos_edicion')
      .select('*')
      .eq('id_empresa', parseInt(empresaId))
      .limit(5);

    console.log('Debug Permisos Info:', {
      permisos,
      permisosError
    });

    return NextResponse.json({
      success: true,
      data: {
        admin,
        adminError,
        permisos,
        permisosError,
        estructura_admin: admin ? Object.keys(admin) : null,
        estructura_permisos: permisos?.[0] ? Object.keys(permisos[0]) : null
      }
    });

  } catch (error: any) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    }, { status: 500 });
  }
}