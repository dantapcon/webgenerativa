-- Migración para agregar campo titulo_tamano
-- Fecha: 2025-09-08
-- Descripción: Agrega un campo numérico para controlar el tamaño del título del header

ALTER TABLE empresas 
ADD COLUMN titulo_tamano INTEGER DEFAULT 32;

-- Comentario sobre la columna
COMMENT ON COLUMN empresas.titulo_tamano IS 'Tamaño del título del header en pixels (rango recomendado: 16-64)';
