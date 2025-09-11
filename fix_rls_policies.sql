-- Corregir políticas RLS para permitir operaciones de service_role
-- Fecha: $(date)

-- 1. Eliminar políticas existentes que están causando problemas
DROP POLICY IF EXISTS "admin_paginas_insert_policy" ON admin_paginas;
DROP POLICY IF EXISTS "admin_paginas_select_policy" ON admin_paginas;
DROP POLICY IF EXISTS "admin_paginas_update_policy" ON admin_paginas;
DROP POLICY IF EXISTS "admin_paginas_delete_policy" ON admin_paginas;

DROP POLICY IF EXISTS "permisos_admin_empresas_insert_policy" ON permisos_admin_empresas;
DROP POLICY IF EXISTS "permisos_admin_empresas_select_policy" ON permisos_admin_empresas;
DROP POLICY IF EXISTS "permisos_admin_empresas_update_policy" ON permisos_admin_empresas;
DROP POLICY IF EXISTS "permisos_admin_empresas_delete_policy" ON permisos_admin_empresas;

-- 2. Crear políticas que permitan operaciones de service_role y authenticated

-- Políticas para admin_paginas
CREATE POLICY "admin_paginas_select_policy" ON admin_paginas
    FOR SELECT USING (
        auth.role() = 'service_role' OR 
        auth.role() = 'authenticated' OR
        auth.role() = 'anon'
    );

CREATE POLICY "admin_paginas_insert_policy" ON admin_paginas
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role' OR 
        auth.role() = 'authenticated'
    );

CREATE POLICY "admin_paginas_update_policy" ON admin_paginas
    FOR UPDATE USING (
        auth.role() = 'service_role' OR 
        auth.role() = 'authenticated'
    );

CREATE POLICY "admin_paginas_delete_policy" ON admin_paginas
    FOR DELETE USING (
        auth.role() = 'service_role' OR 
        auth.role() = 'authenticated'
    );

-- Políticas para permisos_admin_empresas
CREATE POLICY "permisos_admin_empresas_select_policy" ON permisos_admin_empresas
    FOR SELECT USING (
        auth.role() = 'service_role' OR 
        auth.role() = 'authenticated' OR
        auth.role() = 'anon'
    );

CREATE POLICY "permisos_admin_empresas_insert_policy" ON permisos_admin_empresas
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role' OR 
        auth.role() = 'authenticated'
    );

CREATE POLICY "permisos_admin_empresas_update_policy" ON permisos_admin_empresas
    FOR UPDATE USING (
        auth.role() = 'service_role' OR 
        auth.role() = 'authenticated'
    );

CREATE POLICY "permisos_admin_empresas_delete_policy" ON permisos_admin_empresas
    FOR DELETE USING (
        auth.role() = 'service_role' OR 
        auth.role() = 'authenticated'
    );

-- 3. Verificar que RLS esté habilitado
ALTER TABLE admin_paginas ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_admin_empresas ENABLE ROW LEVEL SECURITY;

-- 4. Mostrar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('admin_paginas', 'permisos_admin_empresas')
ORDER BY tablename, policyname;

SELECT 'RLS Policies Fixed Successfully' as status;
