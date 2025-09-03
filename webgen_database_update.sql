-- Actualización de la tabla subcategorias para permitir enlaces_externos vacíos
ALTER TABLE subcategorias DROP CONSTRAINT IF EXISTS subcategorias_enlace_externo_check;
ALTER TABLE subcategorias ADD CONSTRAINT subcategorias_enlace_externo_check 
    CHECK (enlace_externo IS NULL OR enlace_externo = '' OR enlace_externo ~* '^https?://');

-- Otra opción más simple es permitir valores nulos
-- ALTER TABLE subcategorias ALTER COLUMN enlace_externo DROP NOT NULL;
