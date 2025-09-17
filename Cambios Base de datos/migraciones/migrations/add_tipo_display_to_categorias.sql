-- Migración para añadir la columna tipo_display a la tabla categorias
ALTER TABLE categorias ADD COLUMN tipo_display VARCHAR(20) DEFAULT 'horizontal';
