-- Migración para añadir columnas de opciones de fondo y ventana flotante
-- Esta migración añade las columnas necesarias para:
-- 1. Guardar las preferencias de fondo para la sección de descripción y hero
-- 2. Personalización del contenido del video y visualización de categorías  
-- 3. Configuración de la ventana flotante de bienvenida

-- Primero verificamos si existen las columnas para evitar errores
DO $$ 
BEGIN
    -- Verificar si la columna descripcion_fondo_tipo existe
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'descripcion_fondo_tipo'
    ) THEN
        -- Añadir columna descripcion_fondo_tipo
        EXECUTE 'ALTER TABLE empresas ADD COLUMN descripcion_fondo_tipo VARCHAR(20) DEFAULT ''color''';
    END IF;

    -- Verificar si la columna descripcion_imagen_fondo existe
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'descripcion_imagen_fondo'
    ) THEN
        -- Añadir columna descripcion_imagen_fondo
        EXECUTE 'ALTER TABLE empresas ADD COLUMN descripcion_imagen_fondo TEXT DEFAULT NULL';
    END IF;

    -- Verificar si la columna video_descripcion existe
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'video_descripcion'
    ) THEN
        -- Añadir columna video_descripcion
        EXECUTE 'ALTER TABLE empresas ADD COLUMN video_descripcion TEXT DEFAULT NULL';
    END IF;

    -- Verificar si la columna hero_fondo_tipo existe
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'hero_fondo_tipo'
    ) THEN
        -- Añadir columna hero_fondo_tipo
        EXECUTE 'ALTER TABLE empresas ADD COLUMN hero_fondo_tipo VARCHAR(20) DEFAULT ''color''';
    END IF;

    -- Verificar si la columna hero_imagen_fondo existe
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'hero_imagen_fondo'
    ) THEN
        -- Añadir columna hero_imagen_fondo
        EXECUTE 'ALTER TABLE empresas ADD COLUMN hero_imagen_fondo TEXT DEFAULT NULL';
    END IF;

    -- Verificar si la columna tipo_display existe en la tabla categorias
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'categorias' AND column_name = 'tipo_display'
    ) THEN
        -- Añadir columna tipo_display
        EXECUTE 'ALTER TABLE categorias ADD COLUMN tipo_display VARCHAR(20) DEFAULT ''horizontal''';
    END IF;

    -- Verificar si la columna modal_activo existe
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'modal_activo'
    ) THEN
        -- Añadir columna modal_activo
        EXECUTE 'ALTER TABLE empresas ADD COLUMN modal_activo BOOLEAN DEFAULT FALSE';
    END IF;

    -- Verificar si la columna modal_titulo existe
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'modal_titulo'
    ) THEN
        -- Añadir columna modal_titulo
        EXECUTE 'ALTER TABLE empresas ADD COLUMN modal_titulo VARCHAR(255) DEFAULT NULL';
    END IF;

    -- Verificar si la columna modal_mensaje existe
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'modal_mensaje'
    ) THEN
        -- Añadir columna modal_mensaje
        EXECUTE 'ALTER TABLE empresas ADD COLUMN modal_mensaje TEXT DEFAULT NULL';
    END IF;

    -- Verificar si la columna modal_imagen_url existe
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'modal_imagen_url'
    ) THEN
        -- Añadir columna modal_imagen_url
        EXECUTE 'ALTER TABLE empresas ADD COLUMN modal_imagen_url TEXT DEFAULT NULL';
    END IF;

    -- Verificar si la columna modal_fondo_tipo existe
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'modal_fondo_tipo'
    ) THEN
        -- Añadir columna modal_fondo_tipo
        EXECUTE 'ALTER TABLE empresas ADD COLUMN modal_fondo_tipo VARCHAR(20) DEFAULT ''color''';
    END IF;

    -- Verificar si la columna modal_fondo_color existe
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'modal_fondo_color'
    ) THEN
        -- Añadir columna modal_fondo_color
        EXECUTE 'ALTER TABLE empresas ADD COLUMN modal_fondo_color VARCHAR(20) DEFAULT ''#ffffff''';
    END IF;

    -- Verificar si la columna modal_fondo_imagen existe
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'modal_fondo_imagen'
    ) THEN
        -- Añadir columna modal_fondo_imagen
        EXECUTE 'ALTER TABLE empresas ADD COLUMN modal_fondo_imagen TEXT DEFAULT NULL';
    END IF;
END $$;
