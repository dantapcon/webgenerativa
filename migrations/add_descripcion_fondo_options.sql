-- Migración para añadir opciones de fondo para la descripción de la empresa
ALTER TABLE empresas ADD COLUMN descripcion_fondo_tipo VARCHAR(10) DEFAULT 'color';
ALTER TABLE empresas ADD COLUMN descripcion_imagen_fondo TEXT;
