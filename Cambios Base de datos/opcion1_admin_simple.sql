-- Sistema de admin simplificado
-- Ejecutar en el Editor SQL de Supabase

-- 1. Crear tabla simple de admins
CREATE TABLE IF NOT EXISTS simple_admins (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Deshabilitar RLS para simplicidad
ALTER TABLE simple_admins DISABLE ROW LEVEL SECURITY;

-- 3. Insertar admin de prueba
INSERT INTO simple_admins (empresa_id, email, password_hash, nombre, activo) 
VALUES (1, 'admin@test.com', 'MTIzNDU2', 'Admin Test', true);

-- 4. Verificar
SELECT * FROM simple_admins;
