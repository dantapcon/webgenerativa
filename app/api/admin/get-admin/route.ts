// API para obtener administradores de la nueva tabla administradores
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase con service_role para operaciones administrativas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa_id');
    const adminId = searchParams.get('admin_id');
    
    if (!empresaId && !adminId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Se requiere empresa_id o admin_id' 
        },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('administradores')
      .select(`
        *,
        empresas!inner(
          id,
          nombre_empresa
        )
      `);

    if (adminId) {
      query = query.eq('id', adminId);
    } else {
      query = query.eq('empresa_id', parseInt(empresaId!));
    }

    const { data: admin, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No encontrado - comportamiento normal
        return NextResponse.json({
          success: false,
          error: 'Administrador no encontrado'
        }, { status: 404 });
      }
      
      console.error('Error obteniendo administrador:', error);
      return NextResponse.json({
        success: false,
        error: 'Error obteniendo administrador'
      }, { status: 500 });
    }

    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Administrador no encontrado'
      }, { status: 404 });
    }

    // Obtener información del rol del usuario
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_has_roles')
      .select(`
        role_id,
        roles!inner(
          id,
          nombre,
          numero
        )
      `)
      .eq('user_id', admin.user_id)
      .single();

    const adminWithRole = {
      ...admin,
      role: roleData?.roles || null
    };
    
    return NextResponse.json({
      success: true,
      data: adminWithRole
    });

  } catch (error: any) {
    console.error('Error in GET /api/admin/get-admin:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}

// Actualizar administrador
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { admin_id, nombres, apellidos, email, telefono, fecha_nacimiento, activo } = data;

    if (!admin_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'admin_id es requerido' 
        },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (nombres) updateData.nombres = nombres;
    if (apellidos !== undefined) updateData.apellidos = apellidos;
    if (email) updateData.email = email;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (fecha_nacimiento !== undefined) updateData.fecha_nacimiento = fecha_nacimiento;
    if (activo !== undefined) updateData.activo = activo;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedAdmin, error } = await supabaseAdmin
      .from('administradores')
      .update(updateData)
      .eq('id', admin_id)
      .select(`
        *,
        empresas!inner(
          id,
          nombre_empresa
        )
      `)
      .single();

    if (error) {
      console.error('Error actualizando administrador:', error);
      return NextResponse.json({
        success: false,
        error: 'Error actualizando administrador'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Administrador actualizado exitosamente',
      data: updatedAdmin
    });

  } catch (error: any) {
    console.error('Error in PUT /api/admin/get-admin:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}

// Eliminar administrador
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('admin_id');

    if (!adminId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'admin_id es requerido' 
        },
        { status: 400 }
      );
    }

    // Obtener el administrador antes de eliminarlo para obtener el user_id
    const { data: admin, error: getError } = await supabaseAdmin
      .from('administradores')
      .select('user_id')
      .eq('id', adminId)
      .single();

    if (getError || !admin) {
      return NextResponse.json({
        success: false,
        error: 'Administrador no encontrado'
      }, { status: 404 });
    }

    // Eliminar el administrador (esto también eliminará automáticamente el user_has_roles por CASCADE)
    const { error: deleteError } = await supabaseAdmin
      .from('administradores')
      .delete()
      .eq('id', adminId);

    if (deleteError) {
      console.error('Error eliminando administrador:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Error eliminando administrador'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Administrador eliminado exitosamente'
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/get-admin:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}