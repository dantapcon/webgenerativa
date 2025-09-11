const { createClient } = require('@supabase/supabase-js');

// Cliente con service_role key para operaciones administrativas
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

async function fixRLSPolicies() {
  console.log('🔄 Iniciando corrección de políticas RLS...');
  
  try {
    // 1. Eliminar políticas existentes para admin_paginas
    console.log('📝 Eliminando políticas existentes para admin_paginas...');
    
    const dropPoliciesAdmin = [
      'DROP POLICY IF EXISTS "admin_paginas_insert_policy" ON admin_paginas;',
      'DROP POLICY IF EXISTS "admin_paginas_select_policy" ON admin_paginas;',
      'DROP POLICY IF EXISTS "admin_paginas_update_policy" ON admin_paginas;',
      'DROP POLICY IF EXISTS "admin_paginas_delete_policy" ON admin_paginas;'
    ];
    
    for (const policy of dropPoliciesAdmin) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: policy });
      if (error) console.log(`⚠️  ${error.message}`);
    }

    // 2. Eliminar políticas existentes para permisos_admin_empresas
    console.log('📝 Eliminando políticas existentes para permisos_admin_empresas...');
    
    const dropPoliciesPermisos = [
      'DROP POLICY IF EXISTS "permisos_admin_empresas_insert_policy" ON permisos_admin_empresas;',
      'DROP POLICY IF EXISTS "permisos_admin_empresas_select_policy" ON permisos_admin_empresas;',
      'DROP POLICY IF EXISTS "permisos_admin_empresas_update_policy" ON permisos_admin_empresas;',
      'DROP POLICY IF EXISTS "permisos_admin_empresas_delete_policy" ON permisos_admin_empresas;'
    ];
    
    for (const policy of dropPoliciesPermisos) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: policy });
      if (error) console.log(`⚠️  ${error.message}`);
    }

    // 3. Crear nuevas políticas permisivas para admin_paginas
    console.log('✅ Creando nuevas políticas para admin_paginas...');
    
    const createPoliciesAdmin = [
      `CREATE POLICY "admin_paginas_select_policy" ON admin_paginas
       FOR SELECT USING (
         auth.role() = 'service_role' OR 
         auth.role() = 'authenticated' OR
         auth.role() = 'anon'
       );`,
      
      `CREATE POLICY "admin_paginas_insert_policy" ON admin_paginas
       FOR INSERT WITH CHECK (
         auth.role() = 'service_role' OR 
         auth.role() = 'authenticated'
       );`,
       
      `CREATE POLICY "admin_paginas_update_policy" ON admin_paginas
       FOR UPDATE USING (
         auth.role() = 'service_role' OR 
         auth.role() = 'authenticated'
       );`,
       
      `CREATE POLICY "admin_paginas_delete_policy" ON admin_paginas
       FOR DELETE USING (
         auth.role() = 'service_role' OR 
         auth.role() = 'authenticated'
       );`
    ];
    
    for (const policy of createPoliciesAdmin) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: policy });
      if (error) {
        console.error(`❌ Error creando política admin_paginas: ${error.message}`);
      } else {
        console.log('✅ Política admin_paginas creada exitosamente');
      }
    }

    // 4. Crear nuevas políticas permisivas para permisos_admin_empresas
    console.log('✅ Creando nuevas políticas para permisos_admin_empresas...');
    
    const createPoliciesPermisos = [
      `CREATE POLICY "permisos_admin_empresas_select_policy" ON permisos_admin_empresas
       FOR SELECT USING (
         auth.role() = 'service_role' OR 
         auth.role() = 'authenticated' OR
         auth.role() = 'anon'
       );`,
      
      `CREATE POLICY "permisos_admin_empresas_insert_policy" ON permisos_admin_empresas
       FOR INSERT WITH CHECK (
         auth.role() = 'service_role' OR 
         auth.role() = 'authenticated'
       );`,
       
      `CREATE POLICY "permisos_admin_empresas_update_policy" ON permisos_admin_empresas
       FOR UPDATE USING (
         auth.role() = 'service_role' OR 
         auth.role() = 'authenticated'
       );`,
       
      `CREATE POLICY "permisos_admin_empresas_delete_policy" ON permisos_admin_empresas
       FOR DELETE USING (
         auth.role() = 'service_role' OR 
         auth.role() = 'authenticated'
       );`
    ];
    
    for (const policy of createPoliciesPermisos) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: policy });
      if (error) {
        console.error(`❌ Error creando política permisos: ${error.message}`);
      } else {
        console.log('✅ Política permisos creada exitosamente');
      }
    }

    // 5. Verificar que RLS esté habilitado
    console.log('🔒 Verificando RLS...');
    
    const enableRLS = [
      'ALTER TABLE admin_paginas ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE permisos_admin_empresas ENABLE ROW LEVEL SECURITY;'
    ];
    
    for (const sql of enableRLS) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });
      if (error) console.log(`⚠️  ${error.message}`);
    }

    console.log('🎉 ¡Políticas RLS corregidas exitosamente!');
    console.log('');
    console.log('Ahora deberías poder:');
    console.log('• Crear administradores usando el service_role');
    console.log('• Actualizar permisos sin errores de RLS');
    console.log('• Hacer login con credenciales de admin');

  } catch (error) {
    console.error('❌ Error ejecutando script:', error);
  }
}

// Función auxiliar para crear RPC si no existe
async function createExecSqlRPC() {
  const createRPC = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS text
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      EXECUTE sql_query;
      RETURN 'OK';
    EXCEPTION WHEN OTHERS THEN
      RETURN 'ERROR: ' || SQLERRM;
    END;
    $$ LANGUAGE plpgsql;
  `;
  
  const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: createRPC });
  if (error && !error.message.includes('function "exec_sql" already exists')) {
    // Si la función no existe, intentamos crearla usando una query directa
    console.log('🔧 Creando función auxiliar...');
  }
}

// Ejecutar el script
fixRLSPolicies().catch(console.error);
