-- SCRIPT DE RESET Y CONFIGURACIÓN COMPLETA
-- Ejecutar TODO este script en Supabase SQL Editor

-- 1. ELIMINAR POLÍTICAS EXISTENTES (si existen)
DROP POLICY IF EXISTS "Allow public read access to active clinicas" ON clinicas_oftalmologicas;
DROP POLICY IF EXISTS "Allow public read access to clinicas" ON clinicas_oftalmologicas;
DROP POLICY IF EXISTS "Allow public insert to clinicas" ON clinicas_oftalmologicas;
DROP POLICY IF EXISTS "Allow public update to clinicas" ON clinicas_oftalmologicas;
DROP POLICY IF EXISTS "Allow public delete to clinicas" ON clinicas_oftalmologicas;

DROP POLICY IF EXISTS "Allow public read access to estilos" ON estilos_clinicas;
DROP POLICY IF EXISTS "Allow public insert to estilos" ON estilos_clinicas;
DROP POLICY IF EXISTS "Allow public update to estilos" ON estilos_clinicas;
DROP POLICY IF EXISTS "Allow public delete to estilos" ON estilos_clinicas;

-- 2. ELIMINAR TABLAS (si existen)
DROP TABLE IF EXISTS estilos_clinicas;
DROP TABLE IF EXISTS clinicas_oftalmologicas;

-- 3. ELIMINAR FUNCIÓN (si existe)
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 4. CREAR FUNCIÓN PARA TIMESTAMPS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. CREAR TABLA PRINCIPAL
CREATE TABLE clinicas_oftalmologicas (
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

-- 6. CREAR TABLA DE ESTILOS
CREATE TABLE estilos_clinicas (
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

-- 7. CREAR TRIGGERS
CREATE TRIGGER update_clinicas_oftalmologicas_updated_at 
    BEFORE UPDATE ON clinicas_oftalmologicas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estilos_clinicas_updated_at 
    BEFORE UPDATE ON estilos_clinicas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. HABILITAR RLS
ALTER TABLE clinicas_oftalmologicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE estilos_clinicas ENABLE ROW LEVEL SECURITY;

-- 9. CREAR POLÍTICAS PÚBLICAS (SIN RESTRICCIONES)
-- Para clinicas_oftalmologicas
CREATE POLICY "Public access clinicas select" ON clinicas_oftalmologicas
    FOR SELECT TO public USING (true);

CREATE POLICY "Public access clinicas insert" ON clinicas_oftalmologicas
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public access clinicas update" ON clinicas_oftalmologicas
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public access clinicas delete" ON clinicas_oftalmologicas
    FOR DELETE TO public USING (true);

-- Para estilos_clinicas
CREATE POLICY "Public access estilos select" ON estilos_clinicas
    FOR SELECT TO public USING (true);

CREATE POLICY "Public access estilos insert" ON estilos_clinicas
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public access estilos update" ON estilos_clinicas
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public access estilos delete" ON estilos_clinicas
    FOR DELETE TO public USING (true);

-- 10. CREAR ÍNDICES
CREATE INDEX idx_clinicas_activo ON clinicas_oftalmologicas(activo);
CREATE INDEX idx_clinicas_created_at ON clinicas_oftalmologicas(created_at DESC);
CREATE INDEX idx_estilos_clinica_id ON estilos_clinicas(clinica_id);

-- 11. INSERTAR DATOS DE EJEMPLO
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

-- 12. INSERTAR ESTILOS PARA LA CLÍNICA DE EJEMPLO
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

-- 13. VERIFICAR QUE TODO FUNCIONE
SELECT 'Configuración completada exitosamente!' as status,
       (SELECT COUNT(*) FROM clinicas_oftalmologicas) as total_clinicas,
       (SELECT COUNT(*) FROM estilos_clinicas) as total_estilos;
