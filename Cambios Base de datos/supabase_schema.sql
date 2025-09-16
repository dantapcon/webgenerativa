-- Script SQL para crear las tablas del sistema de generación de páginas web oftalmológicas
-- Ejecutar en Supabase SQL Editor

-- Tabla principal de clínicas oftalmológicas
CREATE TABLE IF NOT EXISTS clinicas_oftalmologicas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    lema TEXT,
    logo_url TEXT,
    quienes_somos TEXT NOT NULL,
    mision TEXT NOT NULL,
    vision TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de estilos personalizados para las clínicas
CREATE TABLE IF NOT EXISTS estilos_clinicas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinica_id UUID NOT NULL REFERENCES clinicas_oftalmologicas(id) ON DELETE CASCADE,
    color_primario TEXT DEFAULT '#2c5aa0',
    color_secundario TEXT DEFAULT '#1e3a8a',
    color_acento TEXT DEFAULT '#3b82f6',
    color_texto TEXT DEFAULT '#1f2937',
    color_fondo TEXT DEFAULT '#ffffff',
    fuente_principal TEXT DEFAULT 'Poppins',
    fuente_titulo TEXT DEFAULT 'Poppins',
    tamano_fuente TEXT DEFAULT '16px',
    estilo_botones TEXT DEFAULT 'rounded',
    tema_general TEXT DEFAULT 'moderno',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_clinicas_oftalmologicas_updated_at 
    BEFORE UPDATE ON clinicas_oftalmologicas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estilos_clinicas_updated_at 
    BEFORE UPDATE ON estilos_clinicas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE clinicas_oftalmologicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE estilos_clinicas ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (acceso público completo para el sistema de oftalmología)
-- Estas políticas permiten operaciones sin autenticación para el funcionamiento del sistema

-- Políticas para clinicas_oftalmologicas - acceso completo público
CREATE POLICY "Allow public read access to clinicas" ON clinicas_oftalmologicas
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to clinicas" ON clinicas_oftalmologicas
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to clinicas" ON clinicas_oftalmologicas
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to clinicas" ON clinicas_oftalmologicas
    FOR DELETE USING (true);

-- Políticas para estilos_clinicas - acceso completo público
CREATE POLICY "Allow public read access to estilos" ON estilos_clinicas
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to estilos" ON estilos_clinicas
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to estilos" ON estilos_clinicas
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to estilos" ON estilos_clinicas
    FOR DELETE USING (true);

-- Insertar datos de ejemplo para pruebas
INSERT INTO clinicas_oftalmologicas (
    titulo, 
    lema, 
    logo_url, 
    quienes_somos, 
    mision, 
    vision, 
    telefono, 
    email, 
    direccion
) VALUES (
    'Centro Oftalmológico Visión Total',
    'Tu visión es nuestro compromiso',
    'https://via.placeholder.com/150x150/2c5aa0/white?text=LOGO',
    'Somos un centro oftalmológico especializado con más de 15 años de experiencia en el cuidado de la salud visual. Nuestro equipo de médicos especializados utiliza tecnología de vanguardia para ofrecer diagnósticos precisos y tratamientos efectivos. Nos especializamos en cirugía refractiva, tratamiento de cataratas, glaucoma y enfermedades de la retina.',
    'Proporcionar atención oftalmológica integral de la más alta calidad, utilizando tecnología avanzada y un enfoque humano y personalizado para cada paciente, contribuyendo a preservar y mejorar su salud visual.',
    'Ser el centro oftalmológico de referencia en la región, reconocido por nuestra excelencia médica, innovación tecnológica y compromiso con la prevención y tratamiento de enfermedades visuales.',
    '+593 2 234-5678',
    'info@visiontotal.com',
    'Av. República del Salvador N34-125 y Suiza, Edificio Médico Torre Vitalis, Piso 8'
);

-- Insertar estilos por defecto para la clínica de ejemplo
INSERT INTO estilos_clinicas (
    clinica_id,
    color_primario,
    color_secundario,
    color_acento,
    color_texto,
    color_fondo,
    fuente_principal,
    fuente_titulo,
    tamano_fuente,
    estilo_botones,
    tema_general
) VALUES (
    (SELECT id FROM clinicas_oftalmologicas WHERE titulo = 'Centro Oftalmológico Visión Total' LIMIT 1),
    '#2c5aa0',
    '#1e3a8a',
    '#3b82f6',
    '#1f2937',
    '#ffffff',
    'Poppins',
    'Poppins',
    '16px',
    'rounded',
    'moderno'
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_clinicas_activo ON clinicas_oftalmologicas(activo);
CREATE INDEX IF NOT EXISTS idx_clinicas_created_at ON clinicas_oftalmologicas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estilos_clinica_id ON estilos_clinicas(clinica_id);
