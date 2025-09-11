-- Solo crear tabla de permisos, usando Supabase Auth para usuarios
CREATE TABLE IF NOT EXISTS admin_permisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- ID del usuario de Supabase Auth
  empresa_id INTEGER NOT NULL REFERENCES empresas(id),
  role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'editor', 'viewer'
  puede_editar_info_basica BOOLEAN DEFAULT false,
  puede_editar_contacto BOOLEAN DEFAULT false,
  puede_editar_modal BOOLEAN DEFAULT false,
  puede_editar_categorias BOOLEAN DEFAULT false,
  puede_editar_sucursales BOOLEAN DEFAULT false,
  puede_editar_contenido_hero BOOLEAN DEFAULT false,
  puede_editar_videos BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, empresa_id)
);

-- Deshabilitar RLS para desarrollo
ALTER TABLE admin_permisos DISABLE ROW LEVEL SECURITY;
