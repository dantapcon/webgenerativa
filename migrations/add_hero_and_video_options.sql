-- Migración para añadir opciones de fondo para el hero y descripción para el video
ALTER TABLE empresas ADD COLUMN hero_fondo_tipo VARCHAR(10) DEFAULT 'color';
ALTER TABLE empresas ADD COLUMN hero_imagen_fondo TEXT;
ALTER TABLE empresas ADD COLUMN video_descripcion TEXT;
