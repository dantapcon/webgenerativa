-- ===========================
-- CORRECCIÓN DE POLÍTICAS RLS - SISTEMA DE ADMINISTRACIÓN
-- ===========================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "admin_paginas_select_policy" ON admin_paginas;
DROP POLICY IF EXISTS "admin_paginas_update_policy" ON admin_paginas;
DROP POLICY IF EXISTS "admin_paginas_insert_policy" ON admin_paginas;
DROP POLICY IF EXISTS "admin_paginas_delete_policy" ON admin_paginas;

DROP POLICY IF EXISTS "permisos_admin_empresas_select_policy" ON permisos_admin_empresas;
DROP POLICY IF EXISTS "permisos_admin_empresas_update_policy" ON permisos_admin_empresas;
DROP POLICY IF EXISTS "permisos_admin_empresas_insert_policy" ON permisos_admin_empresas;
DROP POLICY IF EXISTS "permisos_admin_empresas_delete_policy" ON permisos_admin_empresas;

-- ===========================
-- POLÍTICAS PARA admin_paginas
-- ===========================

-- SELECT: service_role puede ver todo, usuarios autenticados pueden ver solo sus datos
CREATE POLICY "admin_paginas_select_policy" ON admin_paginas
    FOR SELECT USING (
        auth.role() = 'service_role' 
        OR 
        auth.role() = 'authenticated'
    );

-- INSERT: Solo service_role puede crear administradores
CREATE POLICY "admin_paginas_insert_policy" ON admin_paginas
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role'
    );

-- UPDATE: service_role puede actualizar todo, usuarios autenticados pueden actualizar sus propios datos
CREATE POLICY "admin_paginas_update_policy" ON admin_paginas
    FOR UPDATE USING (
        auth.role() = 'service_role' 
        OR 
        (auth.role() = 'authenticated' AND auth.uid()::text = id::text)
    );

-- DELETE: Solo service_role puede eliminar
CREATE POLICY "admin_paginas_delete_policy" ON admin_paginas
    FOR DELETE USING (
        auth.role() = 'service_role'
    );

-- ===========================
-- POLÍTICAS PARA permisos_admin_empresas
-- ===========================

-- SELECT: service_role puede ver todo, usuarios autenticados pueden ver sus propios permisos
CREATE POLICY "permisos_admin_empresas_select_policy" ON permisos_admin_empresas
    FOR SELECT USING (
        auth.role() = 'service_role'
        OR
        (auth.role() = 'authenticated' AND EXISTS (
            SELECT 1 FROM admin_paginas 
            WHERE admin_paginas.id = permisos_admin_empresas.admin_id 
            AND auth.uid()::text = admin_paginas.id::text
        ))
    );

-- INSERT: Solo service_role puede crear permisos
CREATE POLICY "permisos_admin_empresas_insert_policy" ON permisos_admin_empresas
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role'
    );

-- UPDATE: service_role puede actualizar todo, usuarios autenticados pueden actualizar sus propios permisos
CREATE POLICY "permisos_admin_empresas_update_policy" ON permisos_admin_empresas
    FOR UPDATE USING (
        auth.role() = 'service_role'
        OR
        (auth.role() = 'authenticated' AND EXISTS (
            SELECT 1 FROM admin_paginas 
            WHERE admin_paginas.id = permisos_admin_empresas.admin_id 
            AND auth.uid()::text = admin_paginas.id::text
        ))
    );

-- DELETE: Solo service_role puede eliminar
CREATE POLICY "permisos_admin_empresas_delete_policy" ON permisos_admin_empresas
    FOR DELETE USING (
        auth.role() = 'service_role'
    );

-- ===========================
-- VERIFICACIÓN
-- ===========================

-- Verificar que las políticas se aplicaron correctamente
SELECT schemaname, tablename, policyname, permissive, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('admin_paginas', 'permisos_admin_empresas')
ORDER BY tablename, policyname;

-- ===========================
-- SCRIPT COMPLETADO
-- ===========================
-- Ejecutar este script para corregir las políticas RLS
