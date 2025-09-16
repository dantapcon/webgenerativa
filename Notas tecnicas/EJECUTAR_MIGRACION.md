# MIGRACIÓN DE BASE DE DATOS - Funcionalidades de Sucursales y Mapas

## IMPORTANTE: Configurar Google Maps API primero

⚠️ **PASO OBLIGATORIO ANTES DE LA MIGRACIÓN:**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Maps JavaScript API**
   - **Geocoding API** 
   - **Places API** (opcional, para mejores resultados)
4. Crea credenciales (API Key)
5. Agrega la clave a tu archivo `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave_api_aqui
   ```

Sin esta configuración, la funcionalidad de geocodificación automática no funcionará.

## Paso 1: Conectar a tu base de datos

Accede a tu panel de administración de Supabase o tu cliente de PostgreSQL.

## Paso 2: Ejecutar el script de migración

Copia y ejecuta el siguiente SQL en tu base de datos:

```sql
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

    -- NUEVA FUNCIONALIDAD: SUCURSALES/UBICACIONES
    -- Verificar si la columna sucursales_activo existe
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'sucursales_activo'
    ) THEN
        -- Añadir columna sucursales_activo
        EXECUTE 'ALTER TABLE empresas ADD COLUMN sucursales_activo BOOLEAN DEFAULT FALSE';
    END IF;
END $$;

-- Crear tabla de sucursales si no existe
CREATE TABLE IF NOT EXISTS sucursales (
    id SERIAL PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    horario_lunes VARCHAR(100),
    horario_martes VARCHAR(100),
    horario_miercoles VARCHAR(100),
    horario_jueves VARCHAR(100),
    horario_viernes VARCHAR(100),
    horario_sabado VARCHAR(100),
    horario_domingo VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    orden INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_sucursales_empresa_id ON sucursales(empresa_id);
CREATE INDEX IF NOT EXISTS idx_sucursales_activo ON sucursales(activo);
CREATE INDEX IF NOT EXISTS idx_sucursales_orden ON sucursales(orden);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_sucursales_updated_at ON sucursales;
CREATE TRIGGER update_sucursales_updated_at BEFORE UPDATE ON sucursales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Paso 3: Verificar que las columnas se añadieron

Ejecuta este comando para verificar:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND column_name IN ('descripcion_fondo_tipo', 'descripcion_imagen_fondo', 'video_descripcion', 'hero_fondo_tipo', 'hero_imagen_fondo', 'modal_activo', 'modal_titulo', 'modal_mensaje', 'modal_imagen_url', 'modal_fondo_tipo', 'modal_fondo_color', 'modal_fondo_imagen', 'sucursales_activo')
ORDER BY column_name;
```

Deberías ver las 13 columnas listadas.

**Verificar tabla de sucursales:**
```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sucursales' 
ORDER BY ordinal_position;
```

## Paso 4: Verificación post-migración

**Verificar tabla de sucursales:**
```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sucursales' 
ORDER BY ordinal_position;
```

**Verificar relaciones:**
```sql
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'sucursales' AND constraint_type = 'FOREIGN KEY';
```

## Paso 5: Reiniciar la aplicación

Después de ejecutar la migración y configurar Google Maps API:

1. Detén tu servidor de desarrollo: `Ctrl + C`
2. Reinicia la aplicación: `npm run dev`
3. Ve a cualquier empresa en el admin
4. Activa "Sucursales/Ubicaciones" 
5. Comienza a agregar sucursales con geocodificación automática

## Funcionalidades incluidas:

✅ **Gestión completa de sucursales**
- Agregar, editar y eliminar sucursales
- Geocodificación automática de direcciones
- Gestión de horarios por día de la semana
- Información de contacto (teléfono, WhatsApp, email)

✅ **Integración con mapas**
- Coordenadas automáticas mediante Google Geocoding API
- Preparado para mostrar mapas interactivos
- Soporte para múltiples marcadores

✅ **Base de datos optimizada**
- Tabla de sucursales con índices para mejor rendimiento
- Triggers automáticos para timestamps
- Relaciones correctas con empresas

🔄 **Próximos pasos:**
- Implementar componente de mapa público para mostrar sucursales
- Crear página de "Ubicaciones" en el sitio público
- Agregar filtros por ciudad/región
