// API para administradores de páginas - Empresas
import { NextRequest, NextResponse } from 'next/server';
import AdminPaginasService from '@/lib/services/admin-paginas';

// Crear administrador para empresa
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validar campos requeridos
    if (!data.empresa_id || !data.email || !data.password || !data.nombre) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Los campos empresa_id, email, password y nombre son requeridos' 
        },
        { status: 400 }
      );
    }

    const admin = await AdminPaginasService.createAdminEmpresa(data);
    
    return NextResponse.json({
      success: true,
      message: 'Administrador creado exitosamente',
      data: admin
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/admin/empresas:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}

// Obtener información del administrador de empresa
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

    let admin;
    if (adminId) {
      admin = await AdminPaginasService.getAdminEmpresa(adminId);
    } else {
      admin = await AdminPaginasService.getAdminByEmpresa(parseInt(empresaId!));
    }

    if (!admin) {
      // 404 es el comportamiento esperado cuando no hay administrador configurado para la empresa
      return NextResponse.json({
        success: false,
        error: 'Administrador no encontrado'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: admin
    });

  } catch (error: any) {
    console.error('Error in GET /api/admin/empresas:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}

// Actualizar administrador de empresa
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { admin_id, ...updateData } = data;
    
    if (!admin_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'admin_id es requerido' 
        },
        { status: 400 }
      );
    }

    const admin = await AdminPaginasService.updateAdminEmpresa(admin_id, updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Administrador actualizado exitosamente',
      data: admin
    });

  } catch (error: any) {
    console.error('Error in PUT /api/admin/empresas:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}

// DELETE - Eliminar administrador
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const admin_id = url.searchParams.get('admin_id');

    if (!admin_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'admin_id es requerido' 
        },
        { status: 400 }
      );
    }

    // En una implementación real, aquí eliminarías el administrador
    // Por ahora, solo simularemos la respuesta
    return NextResponse.json({
      success: true,
      message: 'Administrador eliminado exitosamente'
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/empresas:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}
