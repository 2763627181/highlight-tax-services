# 🚀 Instrucciones para Crear las Tablas en Supabase

## ⚠️ Problema Actual

Estás viendo el schema `vault` en Supabase, pero las tablas de la aplicación deben estar en el schema `public`.

## 📋 Pasos para Crear las Tablas

### Opción 1: Desde la Terminal (Recomendado)

1. **Asegúrate de tener `DATABASE_URL` configurada:**

   Crea un archivo `.env` en la raíz del proyecto con:
   ```
   DATABASE_URL=postgresql://postgres:[TU-PASSWORD]@[TU-HOST]:5432/postgres
   ```
   
   Obtén esta URL desde Supabase:
   - Ve a **Settings** → **Database**
   - Copia la **Connection String** (URI mode)

2. **Ejecuta el script de setup:**
   ```bash
   cd highlight-tax-services
   npm run db:setup
   ```
   
   O directamente:
   ```bash
   npm run db:push
   ```

3. **Verifica en Supabase:**
   - Ve al **Table Editor**
   - En el dropdown de schema, cambia de `vault` a `public`
   - Deberías ver todas las tablas:
     - `users`
     - `tax_cases`
     - `documents`
     - `appointments`
     - `messages`
     - `contact_submissions`
     - `activity_logs`
     - `auth_identities`
     - `password_reset_tokens`
     - `sessions`

### Opción 2: Desde Supabase SQL Editor

Si prefieres ejecutar SQL directamente:

1. Ve a **SQL Editor** en Supabase
2. Ejecuta este script (creará todas las tablas y enums):

```sql
-- Crear enums
CREATE TYPE user_role AS ENUM ('admin', 'preparer', 'client');
CREATE TYPE case_status AS ENUM ('pending', 'in_process', 'sent_to_irs', 'approved', 'refund_issued');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE filing_status AS ENUM ('single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household', 'qualifying_widow');
CREATE TYPE auth_provider AS ENUM ('local', 'google', 'github', 'apple', 'replit');
CREATE TYPE document_category AS ENUM ('id_document', 'w2', 'form_1099', 'bank_statement', 'receipt', 'previous_return', 'social_security', 'proof_of_address', 'other');

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
```

## 🔍 Cómo Cambiar de Schema en Supabase

1. En el **Table Editor**, verás un dropdown que dice `vault`
2. Haz clic en ese dropdown
3. Selecciona `public`
4. Ahora deberías ver todas tus tablas

## ✅ Verificación

Después de crear las tablas, verifica que:

1. ✅ Puedes ver el schema `public` en el dropdown
2. ✅ Todas las tablas están listadas
3. ✅ Puedes abrir la tabla `users` y ver su estructura
4. ✅ Los enums están creados (puedes verlos en el SQL Editor ejecutando `\dT+` o en la pestaña "Types")

## 🆘 Si Algo Sale Mal

1. **Verifica la conexión:**
   - Asegúrate de que `DATABASE_URL` sea correcta
   - Verifica que tengas permisos en Supabase

2. **Revisa los logs:**
   - Si usas `npm run db:push`, revisa los errores en la terminal
   - Si usas SQL Editor, revisa los mensajes de error

3. **Limpia y recrea:**
   - Si hay conflictos, puedes eliminar las tablas manualmente desde SQL Editor
   - Luego vuelve a ejecutar el script

## 📝 Nota Importante

- Las tablas se crean en el schema `public` por defecto
- El schema `vault` es de Supabase para almacenar secretos (no lo uses para tus tablas)
- Siempre usa el schema `public` para tus tablas de aplicación

