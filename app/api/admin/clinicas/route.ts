// API para administradores de páginas - Clínicas
import { NextRequest, NextResponse } from 'next/server';
import AdminPaginasService from '@/lib/services/admin-paginas';

// Crear administrador para clínica
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validar campos requeridos
    if (!data.clinica_id || !data.email || !data.password || !data.nombre) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Los campos clinica_id, email, password y nombre son requeridos' 
        },
        { status: 400 }
      );
    }

    const admin = await AdminPaginasService.createAdminClinica(data);
    
    return NextResponse.json({
      success: true,
      message: 'Administrador creado exitosamente',
      data: admin
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/admin/clinicas:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}

// Obtener información del administrador de clínica
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicaId = searchParams.get('clinica_id');
    
    if (!clinicaId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'clinica_id es requerido' 
        },
        { status: 400 }
      );
    }

    const admin = await AdminPaginasService.getAdminByClinica(clinicaId);

    if (!admin) {
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
    console.error('Error in GET /api/admin/clinicas:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}
