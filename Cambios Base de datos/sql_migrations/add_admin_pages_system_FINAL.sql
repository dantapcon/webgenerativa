-- ===========================
-- SISTEMA DE ADMINISTRACIÓN DE PÁGINAS - FINAL
-- WebGenerator Pro - Solo Empresas
-- ===========================

-- 1. Tabla de administradores de páginas
CREATE TABLE IF NOT EXISTS admin_paginas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT true,
    login_habilitado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Un administrador por empresa
    UNIQUE(empresa_id),
    -- Email único globalmente
    UNIQUE(email)
);

-- 2. Tabla de permisos granulares
CREATE TABLE IF NOT EXISTS permisos_admin_empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admin_paginas(id) ON DELETE CASCADE,
    
    -- Permisos específicos para empresas
    puede_editar_info_basica BOOLEAN DEFAULT false,
    puede_editar_contacto BOOLEAN DEFAULT false,
    puede_editar_modal BOOLEAN DEFAULT false,
    puede_editar_categorias BOOLEAN DEFAULT false,
    puede_editar_sucursales BOOLEAN DEFAULT false,
    puede_editar_contenido_hero BOOLEAN DEFAULT false,
    puede_editar_videos BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Un registro de permisos por admin
    UNIQUE(admin_id)
);

-- 3. Índices para optimización
CREATE INDEX IF NOT EXISTS idx_admin_paginas_empresa_id ON admin_paginas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_admin_paginas_email ON admin_paginas(email);
CREATE INDEX IF NOT EXISTS idx_admin_paginas_activo ON admin_paginas(activo);
CREATE INDEX IF NOT EXISTS idx_permisos_admin_empresas_admin_id ON permisos_admin_empresas(admin_id);

-- 4. Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a las tablas
DROP TRIGGER IF EXISTS update_admin_paginas_updated_at ON admin_paginas;
CREATE TRIGGER update_admin_paginas_updated_at
    BEFORE UPDATE ON admin_paginas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_permisos_admin_empresas_updated_at ON permisos_admin_empresas;
CREATE TRIGGER update_permisos_admin_empresas_updated_at
    BEFORE UPDATE ON permisos_admin_empresas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS (Row Level Security) políticas
ALTER TABLE admin_paginas ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_admin_empresas ENABLE ROW LEVEL SECURITY;

-- Política para administradores - solo pueden ver sus propios datos
DROP POLICY IF EXISTS "admin_paginas_select_policy" ON admin_paginas;
CREATE POLICY "admin_paginas_select_policy" ON admin_paginas
    FOR SELECT USING (
        -- Permitir a service_role (backend) acceso completo
        auth.role() = 'service_role' 
        OR 
        -- Los admins solo pueden ver su propio registro
        auth.uid()::text = id::text
    );

DROP POLICY IF EXISTS "admin_paginas_update_policy" ON admin_paginas;
CREATE POLICY "admin_paginas_update_policy" ON admin_paginas
    FOR UPDATE USING (
        auth.role() = 'service_role' 
        OR 
        auth.uid()::text = id::text
    );

-- Política para permisos - vinculados a admin
DROP POLICY IF EXISTS "permisos_admin_empresas_select_policy" ON permisos_admin_empresas;
CREATE POLICY "permisos_admin_empresas_select_policy" ON permisos_admin_empresas
    FOR SELECT USING (
        auth.role() = 'service_role'
        OR
        EXISTS (
            SELECT 1 FROM admin_paginas 
            WHERE admin_paginas.id = permisos_admin_empresas.admin_id 
            AND auth.uid()::text = admin_paginas.id::text
        )
    );

DROP POLICY IF EXISTS "permisos_admin_empresas_update_policy" ON permisos_admin_empresas;
CREATE POLICY "permisos_admin_empresas_update_policy" ON permisos_admin_empresas
    FOR UPDATE USING (
        auth.role() = 'service_role'
        OR
        EXISTS (
            SELECT 1 FROM admin_paginas 
            WHERE admin_paginas.id = permisos_admin_empresas.admin_id 
            AND auth.uid()::text = admin_paginas.id::text
        )
    );

-- 6. Comentarios para documentación
COMMENT ON TABLE admin_paginas IS 'Administradores de páginas web generadas para empresas';
COMMENT ON COLUMN admin_paginas.empresa_id IS 'Referencia a la empresa administrada';
COMMENT ON COLUMN admin_paginas.login_habilitado IS 'Permite habilitar/deshabilitar el login sin eliminar el admin';

COMMENT ON TABLE permisos_admin_empresas IS 'Permisos granulares para administradores de empresas';
COMMENT ON COLUMN permisos_admin_empresas.puede_editar_info_basica IS 'Permite editar nombre, descripción, teléfono, email de la empresa';
COMMENT ON COLUMN permisos_admin_empresas.puede_editar_contacto IS 'Permite editar dirección, ubicación, horarios';
COMMENT ON COLUMN permisos_admin_empresas.puede_editar_modal IS 'Permite editar contenido del modal (consejos, promociones)';
COMMENT ON COLUMN permisos_admin_empresas.puede_editar_categorias IS 'Permite agregar/editar/eliminar categorías de productos/servicios';
COMMENT ON COLUMN permisos_admin_empresas.puede_editar_sucursales IS 'Permite gestionar múltiples ubicaciones de la empresa';
COMMENT ON COLUMN permisos_admin_empresas.puede_editar_contenido_hero IS 'Permite editar título, descripción e imagen principal';
COMMENT ON COLUMN permisos_admin_empresas.puede_editar_videos IS 'Permite gestionar videos promocionales';

-- ===========================
-- SCRIPT COMPLETADO
-- ===========================
-- Para ejecutar: Copiar y pegar en tu consola SQL de Supabase
-- Este script es idempotente - se puede ejecutar múltiples veces
