-- Ejecutar en Editor SQL de Supabase (xxcfhuzwvpstcgdepbyn.supabase.co)
-- Sistema de administración para páginas de empresas

-- 1. Crear tabla admin_paginas
CREATE TABLE IF NOT EXISTS admin_paginas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  activo BOOLEAN DEFAULT true,
  login_habilitado BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla permisos_admin_empresas
CREATE TABLE IF NOT EXISTS permisos_admin_empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_paginas(id) ON DELETE CASCADE,
  puede_editar_info_basica BOOLEAN DEFAULT false,
  puede_editar_contacto BOOLEAN DEFAULT false,
  puede_editar_modal BOOLEAN DEFAULT false,
  puede_editar_categorias BOOLEAN DEFAULT false,
  puede_editar_sucursales BOOLEAN DEFAULT false,
  puede_editar_contenido_hero BOOLEAN DEFAULT false,
  puede_editar_videos BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(admin_id)
);

-- 3. Deshabilitar RLS temporalmente para desarrollo
ALTER TABLE admin_paginas DISABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_admin_empresas DISABLE ROW LEVEL SECURITY;

-- 4. Crear admin de prueba para empresa ID 1
INSERT INTO admin_paginas (email, nombre, password_hash, empresa_id, activo, login_habilitado) 
VALUES ('admin@test.com', 'Admin Test', 'MTIzNDU2', 1, true, true)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- 5. Si ya existe el admin, obtener su ID y crear permisos
DO $$
DECLARE
    admin_uuid UUID;
BEGIN
    SELECT id INTO admin_uuid FROM admin_paginas WHERE email = 'admin@test.com';
    
    IF admin_uuid IS NOT NULL THEN
        INSERT INTO permisos_admin_empresas (
            admin_id,
            puede_editar_info_basica,
            puede_editar_contacto,
            puede_editar_modal,
            puede_editar_categorias,
            puede_editar_sucursales,
            puede_editar_contenido_hero,
            puede_editar_videos
        ) VALUES (
            admin_uuid,
            true, true, true, true, true, true, true
        ) ON CONFLICT (admin_id) DO NOTHING;
    END IF;
END $$;

-- 6. Verificar que todo se creó correctamente
SELECT 
    a.id,
    a.email,
    a.nombre,
    a.empresa_id,
    a.activo,
    a.login_habilitado,
    p.puede_editar_info_basica,
    p.puede_editar_contacto
FROM admin_paginas a
LEFT JOIN permisos_admin_empresas p ON a.id = p.admin_id
WHERE a.email = 'admin@test.com';

-- ¡LISTO! Ya tienes:
-- Email: admin@test.com
-- Password: 123456
-- Para empresa ID: 1
