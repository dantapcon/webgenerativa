-- =============================================================================
-- MIGRACIÓN: Agregar campos de personalización de fondo a categorías
-- =============================================================================
-- Descripción: Agrega campos para permitir que cada categoría tenga su propio
--              color de fondo o imagen de fondo personalizada
-- Fecha: 23 de septiembre de 2025
-- Autor: Sistema de desarrollo webgenerativa
-- =============================================================================

-- Verificar que la tabla categorías existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' 
                   AND table_name = 'categorias') THEN
        RAISE EXCEPTION 'La tabla categorias no existe. No se puede proceder con la migración.';
    END IF;
END $$;

-- Agregar nuevos campos para personalización de fondo
ALTER TABLE public.categorias 
ADD COLUMN IF NOT EXISTS fondo_tipo character varying DEFAULT 'color' 
    CHECK (fondo_tipo IN ('color', 'imagen')),
ADD COLUMN IF NOT EXISTS fondo_color character varying DEFAULT '#ffffff' 
    CHECK (fondo_color ~* '^#[0-9A-Fa-f]{6}$'),
ADD COLUMN IF NOT EXISTS fondo_imagen text;

-- Agregar comentarios para documentar los nuevos campos
COMMENT ON COLUMN public.categorias.fondo_tipo IS 'Tipo de fondo para la categoría: color o imagen';
COMMENT ON COLUMN public.categorias.fondo_color IS 'Color de fondo en formato hexadecimal (#RRGGBB)';
COMMENT ON COLUMN public.categorias.fondo_imagen IS 'URL de la imagen de fondo para la categoría';

-- Actualizar categorías existentes con valores por defecto
UPDATE public.categorias 
SET 
    fondo_tipo = 'color',
    fondo_color = '#ffffff'
WHERE fondo_tipo IS NULL;

-- Verificar que los campos se agregaron correctamente
DO $$
DECLARE
    campo_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO campo_count
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'categorias' 
    AND column_name IN ('fondo_tipo', 'fondo_color', 'fondo_imagen');
    
    IF campo_count = 3 THEN
        RAISE NOTICE 'Migración completada exitosamente. Se agregaron % campos a la tabla categorias.', campo_count;
    ELSE
        RAISE WARNING 'La migración puede no haber sido completada correctamente. Se encontraron % campos de 3 esperados.', campo_count;
    END IF;
END $$;

-- =============================================================================
-- FIN DE LA MIGRACIÓN
-- =============================================================================