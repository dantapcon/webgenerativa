-- Migración: Agregar campo modal_video_url para videos en ventana flotante
-- Fecha: 8 de septiembre de 2025
-- Descripción: Permite agregar videos (YouTube, Vimeo, etc.) en la ventana flotante de bienvenida

-- Agregar columna modal_video_url a la tabla empresas
ALTER TABLE empresas 
ADD COLUMN modal_video_url TEXT;

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN empresas.modal_video_url IS 'URL del video que aparecerá en la ventana flotante de bienvenida (YouTube, Vimeo, etc.)';

-- Verificar que se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND column_name = 'modal_video_url';
