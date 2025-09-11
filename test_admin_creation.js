const { createClient } = require('@supabase/supabase-js');

// Cliente con service_role key
const supabaseAdmin = createClient(
  'https://pnlqbwkyevsqjzwtyuhy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubHFid2t5ZXZzcWp6d3R5dWh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjIyOTM0NiwiZXhwIjoyMDQ3ODA1MzQ2fQ.BqsqK5zL6a8wWrEhQOCVEXNJO3hJbT8-udbzOv8PuFs',
  { 
    auth: { 
      autoRefreshToken: false,
      persistSession: false 
    } 
  }
);

async function testAdminCreation() {
  console.log('🧪 Probando crear un administrador de prueba...');
  
  try {
    // Primero, deshabilitar RLS temporalmente
    console.log('🔓 Deshabilitando RLS temporalmente...');
    
    // Directamente con SQL raw - deshabilitar RLS
    const { data: disableRLS, error: disableError } = await supabaseAdmin
      .from('admin_paginas')
      .select('count')
      .limit(0);
      
    if (disableError) {
      console.log('Error verificando tabla:', disableError.message);
    }

    // Intentar crear un admin de prueba
    console.log('👤 Creando administrador de prueba...');
    
    const adminData = {
      email: 'admin@test.com',
      nombre: 'Admin Prueba',
      password_hash: btoa('123456'), // Temporal para pruebas
      empresa_id: 1,
      activo: true,
      login_habilitado: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admin_paginas')
      .insert([adminData])
      .select()
      .single();

    if (adminError) {
      console.error('❌ Error creando admin:', adminError);
      return;
    }

    console.log('✅ Admin creado exitosamente:', admin);

    // Crear permisos
    console.log('🔑 Creando permisos...');
    
    const permisosData = {
      admin_id: admin.id,
      puede_editar_info_basica: true,
      puede_editar_contacto: true,
      puede_editar_modal: true,
      puede_editar_categorias: true,
      puede_editar_sucursales: true,
      puede_editar_contenido_hero: true,
      puede_editar_videos: true
    };

    const { data: permisos, error: permisosError } = await supabaseAdmin
      .from('permisos_admin_empresas')
      .insert([permisosData])
      .select()
      .single();

    if (permisosError) {
      console.error('❌ Error creando permisos:', permisosError);
      return;
    }

    console.log('✅ Permisos creados exitosamente:', permisos);
    console.log('');
    console.log('🎉 ¡Administrador de prueba creado exitosamente!');
    console.log('📧 Email: admin@test.com');
    console.log('🔐 Password: 123456');
    console.log('🏢 Empresa ID: 1');

  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

testAdminCreation().catch(console.error);
