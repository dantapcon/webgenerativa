-- Migración para Sistema de Administración de Páginas
-- Ejecutar en Supabase SQL Editor

-- Tabla para administradores de páginas específicas (EMPRESAS)
CREATE TABLE IF NOT EXISTS admin_paginas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true,
    login_habilitado BOOLEAN DEFAULT false, -- Si el login está activado para esta página
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Un admin por empresa
    UNIQUE(empresa_id)
);

-- Tabla de permisos para administradores de empresas
CREATE TABLE IF NOT EXISTS permisos_admin_empresas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES admin_paginas(id) ON DELETE CASCADE,
    
    -- Permisos específicos por elemento
    puede_editar_info_basica BOOLEAN DEFAULT false,        -- Nombre, descripción
    puede_editar_contacto BOOLEAN DEFAULT false,           -- Teléfono, email, dirección
    puede_editar_modal BOOLEAN DEFAULT false,              -- Modal flotante
    puede_editar_categorias BOOLEAN DEFAULT false,         -- Categorías y subcategorías
    puede_editar_sucursales BOOLEAN DEFAULT false,         -- Ubicaciones
    puede_editar_contenido_hero BOOLEAN DEFAULT false,     -- Contenido del hero
    puede_editar_videos BOOLEAN DEFAULT false,             -- Videos promocionales
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Un registro de permisos por admin
    UNIQUE(admin_id)
);

-- Función para actualizar updated_at (en caso de que no exista)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_admin_paginas_updated_at 
    BEFORE UPDATE ON admin_paginas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permisos_admin_empresas_updated_at 
    BEFORE UPDATE ON permisos_admin_empresas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE admin_paginas ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_admin_empresas ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (temporal para desarrollo)
CREATE POLICY "Allow public access to admin_paginas" ON admin_paginas FOR ALL USING (true);
CREATE POLICY "Allow public access to permisos_admin_empresas" ON permisos_admin_empresas FOR ALL USING (true);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_admin_paginas_empresa_id ON admin_paginas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_admin_paginas_email ON admin_paginas(email);
CREATE INDEX IF NOT EXISTS idx_admin_paginas_login_habilitado ON admin_paginas(login_habilitado);

-- Comentarios para documentación
COMMENT ON TABLE admin_paginas IS 'Administradores asignados a páginas de empresas específicas';
COMMENT ON TABLE permisos_admin_empresas IS 'Permisos granulares para administradores de empresas';
