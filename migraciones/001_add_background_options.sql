-- Migración para añadir columnas de opciones de fondo
-- Esta migración añade las columnas necesarias para guardar las preferencias de fondo para la sección de descripción
-- y personalización del contenido del video y visualización de categorías

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
END $$;
