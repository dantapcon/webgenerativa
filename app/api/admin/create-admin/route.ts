// API para crear administradores usando Supabase Auth
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Cliente de Supabase con service_role para operaciones administrativas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Función para validar email
const isValidEmail = (email: string) => {
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return regex.test(email);
};

export async function POST(request: NextRequest) {
  try {
    // 📌 Recibir datos del frontend
    const {
      nombres,
      apellidos,
      email,
      password,
      telefono,
      fecha_nacimiento,
      empresa_id,
      activo = true,
    } = await request.json();

    console.log('📥 Datos recibidos del frontend:', {
      nombres, apellidos, email, telefono, fecha_nacimiento, empresa_id
    });

    // 📌 Validar datos obligatorios
    if (!nombres || !email || !password || !empresa_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Los campos nombres, email, password y empresa_id son obligatorios' 
      }, { status: 400 });
    }

    // 📌 Validar email
    if (!isValidEmail(email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email inválido' 
      }, { status: 400 });
    }

    // 📌 Validar que la empresa existe
    const { data: empresa, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .select('id, nombre_empresa')
      .eq('id', empresa_id)
      .single();

    if (empresaError || !empresa) {
      return NextResponse.json({ 
        success: false, 
        error: 'Empresa no encontrada' 
      }, { status: 404 });
    }

    // 📌 Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔐 Contraseña hasheada correctamente');

    // 📌 Verificar si el usuario ya existe en auth.users
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.error('❌ El usuario ya está registrado');
      return NextResponse.json({ 
        success: false, 
        error: 'El usuario ya está registrado' 
      }, { status: 400 });
    }

    // 📌 Crear el usuario en Supabase Auth
    const displayName = apellidos ? `${nombres} ${apellidos}` : nombres;
    const { data: authData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: { display_name: displayName },
      email_confirm: true,
      app_metadata: { roles: ['authenticated'] },
    });

    if (userError) {
      console.error('❌ Error en Supabase Auth:', userError);
      
      let errorMessage = 'Error al registrar el usuario';
      if (userError.message?.includes('email_exists')) {
        errorMessage = 'El email ya está registrado';
      } else if (userError.message?.includes('phone_exists')) {
        errorMessage = 'El número de teléfono ya está registrado';
      }
      
      return NextResponse.json({ 
        success: false, 
        error: errorMessage 
      }, { status: 400 });
    }

    // 📌 Obtener el userId generado
    const userId = authData.user.id;
    console.log('✅ Usuario creado en Supabase Auth:', userId);

    // 📌 Registrar el rol del usuario en `user_has_roles`
    const { error: rolError } = await supabaseAdmin
      .from('user_has_roles')
      .insert({
        role_id: '22222222-2222-2222-2222-222222222222', // UUID del rol administrador
        user_id: userId,
      });

    if (rolError) {
      console.error('❌ Error al asociar rol al usuario:', rolError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error al asociar rol al usuario' 
      }, { status: 400 });
    }

    console.log('✅ Rol de administrador asignado correctamente');

    // 📌 Insertar en la tabla `administradores`
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('administradores')
      .insert({
        user_id: userId,
        empresa_id: empresa_id,
        nombres: nombres,
        apellidos: apellidos || null,
        email: email,
        telefono: telefono || null,
        fecha_nacimiento: fecha_nacimiento || null,
        activo: activo
      })
      .select()
      .single();

    if (adminError) {
      console.error('❌ Error al insertar administrador en la BD:', adminError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error al registrar los datos del administrador' 
      }, { status: 400 });
    }

    console.log('✅ Administrador registrado en la BD:', adminData);

    // 📌 Respuesta de éxito
    const response = {
      success: true,
      message: 'Administrador registrado exitosamente',
      data: {
        id: adminData.id,
        user_id: userId,
        nombres: adminData.nombres,
        apellidos: adminData.apellidos,
        email: adminData.email,
        empresa: empresa.nombre_empresa,
        empresa_id: empresa_id
      }
    };

    console.log('🚀 Proceso de registro finalizado exitosamente');
    return NextResponse.json(response, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error general:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message 
    }, { status: 500 });
  }
}

// Obtener lista de administradores (para superadministradores)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa_id');

    let query = supabaseAdmin
      .from('administradores')
      .select(`
        *,
        empresas!inner(
          id,
          nombre_empresa
        )
      `);

    if (empresaId) {
      query = query.eq('empresa_id', parseInt(empresaId));
    }

    const { data: administradores, error } = await query;

    if (error) {
      console.error('Error obteniendo administradores:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error obteniendo administradores' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: administradores
    });

  } catch (error: any) {
    console.error('Error en GET administradores:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}