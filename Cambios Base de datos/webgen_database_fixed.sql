-- WebGenerator Pro Database Implementation
-- PostgreSQL 13+ compatible (Supabase Fixed)

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsqueda de texto optimizada

-- Crear tipos ENUM personalizados
CREATE TYPE user_role AS ENUM ('superadmin', 'admin_empresa');
CREATE TYPE site_status AS ENUM ('creando', 'publicado', 'error', 'mantenimiento');
CREATE TYPE operation_type AS ENUM ('creacion', 'actualizacion', 'publicacion', 'error');
CREATE TYPE operation_status AS ENUM ('iniciado', 'completado', 'error');
CREATE TYPE value_type AS ENUM ('string', 'number', 'boolean', 'json');
CREATE TYPE file_type AS ENUM ('imagen', 'video', 'documento');
CREATE TYPE reference_type AS ENUM ('logo', 'producto', 'servicio', 'subcategoria', 'promocional');

-- 1. Tabla usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL CHECK (char_length(nombre) >= 2),
    rol user_role DEFAULT 'admin_empresa',
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla plantillas
CREATE TABLE plantillas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    tipo_negocio_recomendado VARCHAR(100),
    archivo_plantilla VARCHAR(500) NOT NULL,
    preview_imagen VARCHAR(500),
    activa BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla empresas
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(255) NOT NULL CHECK (char_length(nombre_empresa) >= 2),
    slug_empresa VARCHAR(100) UNIQUE NOT NULL CHECK (slug_empresa ~* '^[a-z0-9-]+$'),
    descripcion_empresa TEXT,
    correo_empresa VARCHAR(255) CHECK (correo_empresa ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    telefono_empresa VARCHAR(50),
    direccion_empresa TEXT,
    tipo_negocio VARCHAR(100),
    dominio_deseado VARCHAR(100),
    subdominio_generado VARCHAR(100) UNIQUE,
    logo_url VARCHAR(500),
    video_promocional_url VARCHAR(500),
    color_primario VARCHAR(7) CHECK (color_primario ~* '^#[0-9A-Fa-f]{6}$'),
    color_secundario VARCHAR(7) CHECK (color_secundario ~* '^#[0-9A-Fa-f]{6}$'),
    tipografia VARCHAR(100),
    plantilla_id INTEGER REFERENCES plantillas(id) ON DELETE SET NULL,
    estado_sitio site_status DEFAULT 'creando',
    ssl_activo BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 4. Tabla clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    nombres VARCHAR(255) NOT NULL CHECK (char_length(nombres) >= 2),
    apellidos VARCHAR(255) CHECK (char_length(apellidos) >= 2),
    fecha_nacimiento DATE CHECK (fecha_nacimiento <= CURRENT_DATE AND fecha_nacimiento >= '1900-01-01'),
    telefono_celular VARCHAR(20) CHECK (char_length(telefono_celular) >= 8),
    activo BOOLEAN DEFAULT true,
    fecha_registro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empresa_id, email) -- Evita correos duplicados por empresa
);

-- 5. Tabla categorias
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL CHECK (char_length(nombre) >= 1),
    descripcion TEXT,
    orden INTEGER DEFAULT 0 CHECK (orden >= 0),
    visible BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empresa_id, nombre) -- Evita nombres duplicados por empresa
);

-- 6. Tabla subcategorias
CREATE TABLE subcategorias (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL CHECK (char_length(nombre) >= 1),
    descripcion TEXT,
    imagen_url VARCHAR(500),
    enlace_externo VARCHAR(500) CHECK (enlace_externo ~* '^https?://'),
    orden INTEGER DEFAULT 0 CHECK (orden >= 0),
    visible BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(categoria_id, nombre) -- Evita nombres duplicados por categoría
);

-- 7. Tabla productos (SIN constraint problemático)
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    subcategoria_id INTEGER REFERENCES subcategorias(id) ON DELETE SET NULL,
    nombre VARCHAR(255) NOT NULL CHECK (char_length(nombre) >= 1),
    descripcion TEXT,
    precio DECIMAL(12,2) CHECK (precio >= 0),
    imagen_url VARCHAR(500),
    orden INTEGER DEFAULT 0 CHECK (orden >= 0),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabla servicios
CREATE TABLE servicios (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    subcategoria_id INTEGER REFERENCES subcategorias(id) ON DELETE SET NULL,
    nombre VARCHAR(255) NOT NULL CHECK (char_length(nombre) >= 1),
    descripcion TEXT,
    imagen_url VARCHAR(500),
    orden INTEGER DEFAULT 0 CHECK (orden >= 0),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabla configuraciones_sitio
CREATE TABLE configuraciones_sitio (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    clave VARCHAR(100) NOT NULL CHECK (char_length(clave) >= 1),
    valor TEXT,
    tipo_valor value_type DEFAULT 'string',
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empresa_id, clave)
);

-- 10. Tabla logs_generacion
CREATE TABLE logs_generacion (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    tipo_operacion operation_type NOT NULL,
    estado operation_status NOT NULL,
    mensaje TEXT,
    detalles_error TEXT,
    tiempo_ejecucion_ms INTEGER CHECK (tiempo_ejecucion_ms >= 0),
    fecha_operacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Tabla archivos_multimedia
CREATE TABLE archivos_multimedia (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL CHECK (char_length(nombre_archivo) >= 1),
    url_archivo VARCHAR(500) NOT NULL,
    tipo_archivo file_type NOT NULL,
    tamaño_bytes BIGINT CHECK (tamaño_bytes > 0),
    formato VARCHAR(10),
    referencia_tipo reference_type,
    referencia_id INTEGER,
    fecha_subida TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ===================================

-- Índices principales para consultas frecuentes
CREATE INDEX idx_empresas_estado_fecha ON empresas(estado_sitio, fecha_creacion DESC);
CREATE INDEX idx_empresas_creador ON empresas(creado_por);
CREATE INDEX idx_empresas_slug ON empresas(slug_empresa) WHERE slug_empresa IS NOT NULL;

-- Índices para separación multi-tenant y consultas por empresa
CREATE INDEX idx_clientes_empresa_activos ON clientes(empresa_id, activo, fecha_registro DESC);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_categorias_empresa_visible ON categorias(empresa_id, visible, orden);
CREATE INDEX idx_subcategorias_categoria_visible ON subcategorias(categoria_id, visible, orden);
CREATE INDEX idx_productos_empresa_activos ON productos(empresa_id, activo, orden);
CREATE INDEX idx_servicios_empresa_activos ON servicios(empresa_id, activo, orden);

-- Índices para búsquedas de texto (usando extensión pg_trgm)
CREATE INDEX idx_empresas_nombre_gin ON empresas USING gin(nombre_empresa gin_trgm_ops);
CREATE INDEX idx_clientes_nombre_gin ON clientes USING gin((nombres || ' ' || COALESCE(apellidos, '')) gin_trgm_ops);
CREATE INDEX idx_productos_nombre_gin ON productos USING gin(nombre gin_trgm_ops);
CREATE INDEX idx_servicios_nombre_gin ON servicios USING gin(nombre gin_trgm_ops);

-- Índices para logs y auditoría
CREATE INDEX idx_logs_empresa_fecha ON logs_generacion(empresa_id, fecha_operacion DESC);
CREATE INDEX idx_logs_estado_tipo ON logs_generacion(estado, tipo_operacion);

-- Índices para archivos multimedia
CREATE INDEX idx_archivos_empresa_tipo ON archivos_multimedia(empresa_id, tipo_archivo);
CREATE INDEX idx_archivos_referencia ON archivos_multimedia(referencia_tipo, referencia_id) WHERE referencia_tipo IS NOT NULL;

-- ===================================
-- FUNCIONES Y TRIGGERS
-- ===================================

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualización automática de timestamps
CREATE TRIGGER trigger_usuarios_fecha_actualizacion
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_empresas_fecha_actualizacion
    BEFORE UPDATE ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_clientes_fecha_actualizacion
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_productos_fecha_actualizacion
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_servicios_fecha_actualizacion
    BEFORE UPDATE ON servicios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_configuraciones_fecha_actualizacion
    BEFORE UPDATE ON configuraciones_sitio
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Función para generar slug automático
CREATE OR REPLACE FUNCTION generar_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                translate(input_text, 'áéíóúñü', 'aeiounу'),
                '[^a-zA-Z0-9\s]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Función para validar edad mínima de clientes (opcional)
CREATE OR REPLACE FUNCTION validar_edad_cliente()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fecha_nacimiento IS NOT NULL AND 
       (CURRENT_DATE - NEW.fecha_nacimiento) < INTERVAL '13 years' THEN
        RAISE EXCEPTION 'El cliente debe tener al menos 13 años';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_edad_cliente
    BEFORE INSERT OR UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION validar_edad_cliente();

-- ===================================
-- VISTAS ÚTILES
-- ===================================

-- Vista para listado completo de empresas con información del creador
CREATE VIEW vista_empresas_completa AS
SELECT 
    e.*,
    u.nombre as nombre_creador,
    u.email as email_creador,
    p.nombre as nombre_plantilla,
    (SELECT COUNT(*) FROM categorias c WHERE c.empresa_id = e.id) as total_categorias,
    (SELECT COUNT(*) FROM productos pr WHERE pr.empresa_id = e.id AND pr.activo = true) as total_productos,
    (SELECT COUNT(*) FROM servicios s WHERE s.empresa_id = e.id AND s.activo = true) as total_servicios,
    (SELECT COUNT(*) FROM clientes cl WHERE cl.empresa_id = e.id AND cl.activo = true) as total_clientes
FROM empresas e
LEFT JOIN usuarios u ON e.creado_por = u.id
LEFT JOIN plantillas p ON e.plantilla_id = p.id;

-- Vista para estructura completa de navegación por empresa
CREATE VIEW vista_navegacion_empresa AS
SELECT 
    e.id as empresa_id,
    e.nombre_empresa,
    c.id as categoria_id,
    c.nombre as categoria_nombre,
    c.orden as categoria_orden,
    sc.id as subcategoria_id,
    sc.nombre as subcategoria_nombre,
    sc.orden as subcategoria_orden,
    sc.imagen_url as subcategoria_imagen
FROM empresas e
LEFT JOIN categorias c ON e.id = c.empresa_id AND c.visible = true
LEFT JOIN subcategorias sc ON c.id = sc.categoria_id AND sc.visible = true
ORDER BY e.id, c.orden, sc.orden;

-- Vista para clientes con información estadística
CREATE VIEW vista_clientes_empresa AS
SELECT 
    c.*,
    e.nombre_empresa,
    EXTRACT(YEAR FROM AGE(c.fecha_nacimiento)) as edad,
    CASE 
        WHEN c.fecha_registro >= CURRENT_DATE - INTERVAL '30 days' THEN 'Nuevo'
        WHEN c.fecha_registro >= CURRENT_DATE - INTERVAL '90 days' THEN 'Reciente'
        ELSE 'Establecido'
    END as categoria_cliente
FROM clientes c
JOIN empresas e ON c.empresa_id = e.id
WHERE c.activo = true;

-- ===================================
-- DATOS INICIALES
-- ===================================

-- Insertar usuario superadministrador inicial
INSERT INTO usuarios (email, password_hash, nombre, rol) 
VALUES ('admin@webgenerator.com', '$2b$10$example_hash_here', 'Super Admin', 'superadmin');

-- Insertar plantillas base
INSERT INTO plantillas (nombre, descripcion, tipo_negocio_recomendado, archivo_plantilla) VALUES
('Corporativa Moderna', 'Plantilla limpia y profesional para empresas corporativas', 'Servicios Profesionales', 'templates/corporativa_moderna.html'),
('E-commerce Básico', 'Plantilla optimizada para tiendas online', 'Comercio', 'templates/ecommerce_basico.html'),
('Restaurante', 'Plantilla especializada para restaurantes y food service', 'Restaurante', 'templates/restaurante.html'),
('Servicios Médicos', 'Plantilla para consultorios y servicios médicos', 'Salud', 'templates/servicios_medicos.html');

-- Trigger adicional para validar subcategoría-categoría mediante función
CREATE OR REPLACE FUNCTION validar_subcategoria_categoria()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que si se asigna subcategoria_id, debe tener categoria_id correspondiente
    IF NEW.subcategoria_id IS NOT NULL AND NEW.categoria_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM subcategorias sc 
            WHERE sc.id = NEW.subcategoria_id 
            AND sc.categoria_id = NEW.categoria_id
        ) THEN
            RAISE EXCEPTION 'La subcategoría no pertenece a la categoría especificada';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger a productos
CREATE TRIGGER trigger_validar_subcategoria_categoria_productos
    BEFORE INSERT OR UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION validar_subcategoria_categoria();

-- Aplicar el trigger a servicios  
CREATE TRIGGER trigger_validar_subcategoria_categoria_servicios
    BEFORE INSERT OR UPDATE ON servicios
    FOR EACH ROW
    EXECUTE FUNCTION validar_subcategoria_categoria();
