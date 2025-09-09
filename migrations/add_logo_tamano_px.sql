-- Migración para agregar campo logo_tamano_px
-- Fecha: 2025-09-08
-- Descripción: Agrega un campo numérico para controlar el tamaño del logo en pixels

ALTER TABLE empresas 
ADD COLUMN logo_tamano_px INTEGER DEFAULT 48;

-- Comentario sobre la columna
COMMENT ON COLUMN empresas.logo_tamano_px IS 'Tamaño del logo en pixels (rango recomendado: 24-96)';
