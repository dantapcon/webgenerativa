// API para autenticación de administradores de páginas
import { NextRequest, NextResponse } from 'next/server';
import AdminPaginasService from '@/lib/services/admin-paginas';

// Inicio de sesión
export async function POST(request: NextRequest) {
  try {
    const { email, password, empresa_id } = await request.json();
    
    // Validar campos requeridos
    if (!email || !password || !empresa_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Los campos email, password y empresa_id son requeridos' 
        },
        { status: 400 }
      );
    }

    const result = await AdminPaginasService.login({
      email,
      password,
      empresa_id: parseInt(empresa_id)
    });
    
    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    // En una implementación real, establecerías cookies seguras aquí
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error in POST /api/admin/auth:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}

// Verificar si el login está habilitado
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empresa_id = searchParams.get('empresa_id');
    
    if (!empresa_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El parámetro empresa_id es requerido' 
        },
        { status: 400 }
      );
    }

    const isEnabled = await AdminPaginasService.isLoginEnabled(parseInt(empresa_id));
    
    return NextResponse.json({
      success: true,
      login_enabled: isEnabled
    });

  } catch (error: any) {
    console.error('Error in GET /api/admin/auth:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}

// Habilitar/deshabilitar login
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { empresa_id, enabled } = data;
    
    if (!empresa_id || enabled === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Los campos empresa_id y enabled son requeridos' 
        },
        { status: 400 }
      );
    }

    await AdminPaginasService.toggleLogin(parseInt(empresa_id), enabled);
    
    return NextResponse.json({
      success: true,
      message: `Login ${enabled ? 'habilitado' : 'deshabilitado'} exitosamente`
    });

  } catch (error: any) {
    console.error('Error in PATCH /api/admin/auth:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}
