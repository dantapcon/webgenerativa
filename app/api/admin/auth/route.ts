// API para autenticación con Supabase Auth y sistema de roles
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { serialize } from 'cookie';

// Cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Inicio de sesión con Supabase Auth
export async function POST(request: NextRequest) {
  try {
    const { email, password, empresa_id } = await request.json();
    
    // Validar campos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Los campos email y password son requeridos' 
        },
        { status: 400 }
      );
    }

    // 1. Iniciar sesión con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.user) {
      return NextResponse.json({
        success: false,
        error: 'Credenciales inválidas'
      }, { status: 401 });
    }

    const userId = data.user.id;

    // 2. Verificar rol del usuario
    const { data: roleData, error: roleError } = await supabase
      .from('user_has_roles')
      .select(`
        role_id,
        roles!inner(
          id,
          nombre,
          numero
        )
      `)
      .eq('user_id', userId)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json({
        success: false,
        error: 'Usuario sin rol asignado'
      }, { status: 403 });
    }

    const userRole = roleData.roles as any; // Forzar tipo para evitar errores de TypeScript
    
    // 3. Crear token de sesión personalizado inicial
    const userPayload = {
      userId,
      role: userRole.numero,
      roleName: userRole.nombre,
      empresaId: empresa_id ? parseInt(empresa_id) : null,
      email: data.user.email
    };
    
    // 4. Verificar permisos según el rol y empresa
    let redirectPath = '/dashboard';
    let hasAccess = false;

    if (userRole.numero === 1) {
      // Superadministrador: acceso a todo
      hasAccess = true;
      redirectPath = '/dashboard';
    } else if (userRole.numero === 2) {
      // Administrador: buscar la empresa a la que pertenece
      const { data: adminData, error: adminError } = await supabase
        .from('administradores')
        .select('id, empresa_id')
        .eq('user_id', userId)
        .single();

      if (adminData && !adminError) {
        hasAccess = true;
        redirectPath = `/dashboard-admin/${adminData.empresa_id}`;
        // Actualizar el empresa_id en el payload
        userPayload.empresaId = adminData.empresa_id;
      } else {
        // Si no se encuentra el administrador en ninguna empresa
        return NextResponse.json({
          success: false,
          error: 'No se encontró información de administrador para este usuario'
        }, { status: 403 });
      }
    } else if (userRole.numero === 3) {
      // Cliente: acceso limitado
      hasAccess = true;
      redirectPath = '/dashboard-cliente';
    }

    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        error: 'No tienes permisos para acceder a esta empresa'
      }, { status: 403 });
    }

    // 5. Establecer cookie de sesión
    const tokenString = JSON.stringify(userPayload);
    const cookie = serialize('authToken', tokenString, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: userId,
        email: data.user.email,
        role: userRole.nombre,
        roleNumber: userRole.numero
      },
      redirectPath
    });

    response.headers.set('Set-Cookie', cookie);
    return response;

  } catch (error: any) {
    console.error('Error in POST /api/admin/auth:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}

// Verificar sesión de usuario
export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie');
    
    if (!cookies || !cookies.includes('authToken')) {
      return NextResponse.json({
        success: false,
        error: 'No hay sesión activa'
      }, { status: 401 });
    }

    // Extraer token de las cookies
    const tokenMatch = cookies.match(/authToken=([^;]+)/);
    if (!tokenMatch) {
      return NextResponse.json({
        success: false,
        error: 'Token de sesión inválido'
      }, { status: 401 });
    }

    try {
      const userPayload = JSON.parse(decodeURIComponent(tokenMatch[1]));
      
      // Si es administrador, consultar información actualizada de la empresa
      if (userPayload.role === 2) {
        const { data: adminData, error: adminError } = await supabase
          .from('administradores')
          .select('empresa_id')
          .eq('user_id', userPayload.userId)
          .single();

        if (adminData && !adminError) {
          userPayload.empresaId = adminData.empresa_id;
        }
      }
      
      return NextResponse.json({
        success: true,
        user: userPayload
      });
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Token de sesión corrupto'
      }, { status: 401 });
    }

  } catch (error: any) {
    console.error('Error in GET /api/admin/auth:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// Cerrar sesión
export async function DELETE(request: NextRequest) {
  try {
    // 1. Cerrar sesión en Supabase Auth
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('Error cerrando sesión en Supabase:', signOutError);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });

    // Establecer las cookies para eliminarlas individualmente
    response.cookies.set('authToken', '', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0
    });

    response.cookies.set('sb-access-token', '', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0
    });

    response.cookies.set('sb-refresh-token', '', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0
    });

    return response;

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/auth:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
