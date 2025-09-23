// API para gestionar permisos de administradores usando tabla procesos_edicion
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SECCIONES_EDITABLES, type SeccionEditable, esSeccionValida } from '@/lib/constants/permisos';

// Cliente de Supabase con service_role para operaciones administrativas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// GET: Obtener permisos de un administrador
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('admin_id');
    const empresaId = searchParams.get('empresa_id');

    if (!adminId || !empresaId) {
      return NextResponse.json({
        success: false,
        error: 'admin_id y empresa_id son requeridos'
      }, { status: 400 });
    }

    // Primero verificar que el administrador existe
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('administradores')
      .select('id, empresa_id, nombres, email')
      .eq('id', adminId) // UUID - NO usar parseInt()
      .eq('empresa_id', parseInt(empresaId))
      .single();

    if (adminError || !admin) {
      return NextResponse.json({
        success: false,
        error: 'Administrador no encontrado'
      }, { status: 404 });
    }

    // Obtener permisos del administrador desde procesos_edicion
    const { data: permisos, error } = await supabaseAdmin
      .from('procesos_edicion')
      .select('id_permi, nombre_permi, descripcion_per, id_dato')
      .eq('id_rol', adminId) // UUID - NO usar parseInt()
      .eq('id_empresa', parseInt(empresaId));

    if (error) {
      console.error('Error obteniendo permisos:', error);
      return NextResponse.json({
        success: false,
        error: 'Error obteniendo permisos del administrador'
      }, { status: 500 });
    }

    // Convertir permisos a formato esperado por el frontend
    const permisosFormateados = permisos?.map(p => ({
      id_permi: p.id_permi,
      nombre_permi: p.id_permi, // El frontend espera que nombre_permi sea el ID de la sección
      descripcion_per: p.descripcion_per,
      id_empresa: parseInt(empresaId),
      id_rol: adminId
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        permisos_activos: permisosFormateados,
        admin_info: admin
      }
    });

  } catch (error: any) {
    console.error('Error in GET /api/admin/permisos:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    }, { status: 500 });
  }
}

// POST: Asignar/actualizar permisos de un administrador
export async function POST(request: NextRequest) {
  try {
    const { 
      admin_id, 
      empresa_id, 
      permisos_seleccionados 
    } = await request.json();

    if (!admin_id || !empresa_id || !Array.isArray(permisos_seleccionados)) {
      return NextResponse.json({
        success: false,
        error: 'admin_id, empresa_id y permisos_seleccionados (array) son requeridos'
      }, { status: 400 });
    }

    // Verificar que el administrador existe
    const { data: adminExists, error: adminError } = await supabaseAdmin
      .from('administradores')
      .select('id, empresa_id')
      .eq('id', admin_id) // UUID - NO usar parseInt()
      .eq('empresa_id', parseInt(empresa_id))
      .single();

    if (adminError || !adminExists) {
      return NextResponse.json({
        success: false,
        error: 'Administrador no encontrado para esta empresa'
      }, { status: 404 });
    }

    // Primero, eliminar permisos existentes del administrador para esta empresa
    const { error: deleteError } = await supabaseAdmin
      .from('procesos_edicion')
      .delete()
      .eq('id_rol', admin_id) // UUID - NO usar parseInt()
      .eq('id_empresa', parseInt(empresa_id));

    if (deleteError) {
      console.error('Error eliminando permisos existentes:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Error eliminando permisos existentes'
      }, { status: 500 });
    }

    // Insertar nuevos permisos
    if (permisos_seleccionados.length > 0) {
      const nuevosPermisos = permisos_seleccionados.map((permiso: any) => {
        const seccion = SECCIONES_EDITABLES[permiso.nombre_permi as keyof typeof SECCIONES_EDITABLES];
        return {
          id_permi: permiso.nombre_permi, // Usar el ID de la sección como id_permi
          nombre_permi: seccion?.nombre || permiso.nombre_permi,
          descripcion_per: seccion?.descripcion || permiso.descripcion_per,
          id_dato: null, // No estamos gestionando datos específicos por ahora
          id_empresa: parseInt(empresa_id),
          id_rol: admin_id // UUID - NO usar parseInt()
        };
      });

      console.log('Inserting permisos:', nuevosPermisos);

      const { error: insertError } = await supabaseAdmin
        .from('procesos_edicion')
        .insert(nuevosPermisos);

      if (insertError) {
        console.error('Error insertando nuevos permisos:', insertError);
        return NextResponse.json({
          success: false,
          error: 'Error asignando nuevos permisos',
          debug: insertError
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Permisos actualizados exitosamente',
      data: {
        permisos_asignados: permisos_seleccionados,
        total_permisos: permisos_seleccionados.length
      }
    });

  } catch (error: any) {
    console.error('Error in POST /api/admin/permisos:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    }, { status: 500 });
  }
}

// DELETE: Eliminar todos los permisos de un administrador
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminUserId = searchParams.get('admin_user_id');
    const empresaId = searchParams.get('empresa_id');

    if (!adminUserId || !empresaId) {
      return NextResponse.json({
        success: false,
        error: 'admin_user_id y empresa_id son requeridos'
      }, { status: 400 });
    }

    // Eliminar todos los permisos del administrador para esta empresa
    const { error } = await supabaseAdmin
      .from('procesos_edicion')
      .delete()
      .eq('id_rol', adminUserId)
      .eq('id_empresa', empresaId);

    if (error) {
      console.error('Error eliminando permisos:', error);
      return NextResponse.json({
        success: false,
        error: 'Error eliminando permisos'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Todos los permisos eliminados exitosamente'
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/permisos:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    }, { status: 500 });
  }
}
