-- Migración para agregar campo tipo_mapa a tabla empresas
-- Fecha: 2025-10-14
-- Descripción: Permite a cada empresa elegir entre Google Maps y OpenStreetMap

-- Agregar columna tipo_mapa a tabla empresas
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS tipo_mapa character varying DEFAULT 'google' 
CHECK (tipo_mapa IN ('google', 'openstreetmap'));

-- Comentario para documentar el campo
COMMENT ON COLUMN public.empresas.tipo_mapa IS 'Tipo de mapa a usar para mostrar sucursales: google o openstreetmap';

-- Actualizar empresas existentes para que tengan el valor por defecto
UPDATE public.empresas 
SET tipo_mapa = 'google' 
WHERE tipo_mapa IS NULL;