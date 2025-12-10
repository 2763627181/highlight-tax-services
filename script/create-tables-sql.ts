/**
 * Script para generar el SQL completo para crear todas las tablas
 * Este script genera el SQL que puedes copiar y pegar directamente en Supabase SQL Editor
 */

const SQL_SCRIPT = `
-- ============================================================================
-- SCRIPT SQL PARA CREAR TODAS LAS TABLAS EN SUPABASE
-- ============================================================================
-- Copia y pega este script completo en el SQL Editor de Supabase
-- ============================================================================

-- Crear enums (si no existen)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'preparer', 'client');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE case_status AS ENUM ('pending', 'in_process', 'sent_to_irs', 'approved', 'refund_issued');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE filing_status AS ENUM ('single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household', 'qualifying_widow');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE auth_provider AS ENUM ('local', 'google', 'github', 'apple', 'replit');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE document_category AS ENUM ('id_document', 'w2', 'form_1099', 'bank_statement', 'receipt', 'previous_return', 'social_security', 'proof_of_address', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabla de sesiones
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  ssn VARCHAR(20),
  date_of_birth TIMESTAMP,
  profile_image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  last_login_at TIMESTAMP
);

-- Tabla de tokens de recuperación de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabla de identidades OAuth
CREATE TABLE IF NOT EXISTS auth_identities (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider auth_provider NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabla de casos tributarios
CREATE TABLE IF NOT EXISTS tax_cases (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filing_year INTEGER NOT NULL,
  filing_status filing_status,
  dependents INTEGER DEFAULT 0,
  status case_status NOT NULL DEFAULT 'pending',
  final_amount DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabla de documentos
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_id INTEGER REFERENCES tax_cases(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER,
  category document_category NOT NULL DEFAULT 'other',
  description TEXT,
  uploaded_by_id INTEGER NOT NULL REFERENCES users(id),
  is_from_preparer BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabla de citas
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_id INTEGER REFERENCES tax_cases(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  recipient_id INTEGER NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabla de formularios de contacto
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  service VARCHAR(100),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabla de logs de actividad
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Después de ejecutar, verifica en Table Editor cambiando el schema a "public"
-- ============================================================================
`;

console.log(SQL_SCRIPT);

