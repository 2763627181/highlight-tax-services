# Configuración de Base de Datos - Highlight Tax Services

## 📋 Resumen del Sistema de Usuarios

### Roles de Usuario

El sistema tiene **3 tipos de roles**:

1. **`client`** (Cliente) - Usuario final que usa el servicio
   - Se registra desde `/portal` o formulario público
   - Solo puede ver sus propios casos, documentos y citas
   - Acceso: `/dashboard`

2. **`preparer`** (Preparador) - Preparador de impuestos
   - Puede ver todos los clientes y sus casos
   - Puede subir documentos para clientes
   - Puede actualizar estados de casos
   - Acceso: `/admin`

3. **`admin`** (Administrador) - Administrador del sistema
   - Acceso completo al sistema
   - Puede crear/editar/eliminar usuarios
   - Puede cambiar roles de usuarios
   - Puede ver todas las estadísticas
   - Acceso: `/admin`

---

## 🗄️ Estructura de Base de Datos

### Tabla Principal: `users`

Todos los usuarios (clientes, preparadores y admins) se almacenan en la misma tabla `users` con el campo `role` que diferencia el tipo:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,  -- Hasheada con bcrypt
  role user_role NOT NULL DEFAULT 'client',  -- 'client', 'preparer', o 'admin'
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  ssn VARCHAR(20),
  date_of_birth TIMESTAMP,
  profile_image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP
);
```

### Otras Tablas Relacionadas

- **`tax_cases`** - Casos tributarios (vinculados a `users.id` como `client_id`)
- **`documents`** - Documentos (vinculados a `users.id` como `client_id`)
- **`appointments`** - Citas (vinculados a `users.id` como `client_id`)
- **`messages`** - Mensajes entre usuarios
- **`contact_submissions`** - Formularios de contacto público
- **`activity_logs`** - Logs de auditoría
- **`auth_identities`** - Identidades OAuth vinculadas
- **`password_reset_tokens`** - Tokens de recuperación de contraseña
- **`sessions`** - Sesiones OAuth

---

## 🔄 Flujo de Registro

### 1. Registro Público (Clientes)

**Endpoint:** `POST /api/auth/register`

**Flujo:**
1. Usuario completa formulario en `/portal`
2. Se valida email, contraseña (mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número)
3. Se verifica que el email no exista
4. Se hashea la contraseña con bcrypt (12 rondas)
5. Se crea usuario con `role: "client"` en la tabla `users`
6. Se registra actividad en `activity_logs`
7. Se envía email de bienvenida
8. Se genera token JWT y se establece cookie
9. Usuario es redirigido a `/dashboard`

**Datos almacenados:**
- Tabla: `users`
- Rol: `client` (siempre)
- Campos: email, password (hasheada), name, phone (opcional)

---

### 2. Creación de Admins/Preparadores

Los admins y preparadores **NO se pueden registrar públicamente**. Solo se pueden crear:

**Opción A: Endpoint Admin (Recomendado)**
- **Endpoint:** `POST /api/admin/create-user`
- **Requiere:** Token especial o modo desarrollo
- **Permite:** Crear usuarios con cualquier rol (client, preparer, admin)

**Opción B: Script Local**
- **Script:** `tsx script/create-user.ts <email> <password> <name> [phone] [role]`
- **Ejemplo:** `tsx script/create-user.ts admin@example.com Pass123 "Admin User" "" "admin"`

**Opción C: Cambiar Rol desde Panel Admin**
- Un admin existente puede cambiar el rol de cualquier usuario
- **Endpoint:** `PATCH /api/admin/users/:id/role`
- **Requiere:** Autenticación como admin

---

## 🚀 Configuración de Supabase

### Paso 1: Crear las Tablas

Ejecuta el script para crear todas las tablas:

```bash
tsx script/setup-database.ts
```

O manualmente:

```bash
npm run db:push
```

Esto creará todas las tablas definidas en `shared/schema.ts` en tu base de datos de Supabase.

### Paso 2: Verificar en Supabase Dashboard

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Table Editor**
4. Deberías ver todas las tablas:
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

### Paso 3: Crear Primer Admin

**Método 1: Usando el endpoint (después del deployment)**

```bash
POST https://highlighttax.com/api/admin/create-user
Headers:
  x-admin-token: [tu-token-secreto]  # Configurar en Vercel como ADMIN_CREATE_USER_TOKEN
Body:
{
  "email": "servicestaxx@gmail.com",
  "password": "SecurePass123",
  "name": "Joel Paula",
  "phone": "8095305592",
  "role": "admin"
}
```

**Método 2: Usando script local**

```bash
tsx script/create-user.ts servicestaxx@gmail.com SecurePass123 "Joel Paula" "8095305592" "admin"
```

**Método 3: Directamente en Supabase SQL Editor**

```sql
-- Primero hashear la contraseña (usa bcrypt con 12 rondas)
-- O usa el script create-user.ts que lo hace automáticamente

INSERT INTO users (email, password, name, phone, role)
VALUES (
  'servicestaxx@gmail.com',
  '$2a$12$[hash-generado]',  -- Usa bcrypt para generar el hash
  'Joel Paula',
  '8095305592',
  'admin'
);
```

---

## 📊 Consultas Útiles en Supabase

### Ver todos los usuarios

```sql
SELECT id, email, name, role, created_at, is_active
FROM users
ORDER BY created_at DESC;
```

### Ver solo admins

```sql
SELECT id, email, name, created_at
FROM users
WHERE role = 'admin'
ORDER BY created_at DESC;
```

### Ver solo clientes

```sql
SELECT id, email, name, phone, created_at
FROM users
WHERE role = 'client'
ORDER BY created_at DESC;
```

### Ver actividad reciente

```sql
SELECT 
  al.id,
  al.action,
  al.details,
  al.created_at,
  u.email as user_email,
  u.role as user_role
FROM activity_logs al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 50;
```

### Estadísticas de usuarios

```sql
SELECT 
  role,
  COUNT(*) as total,
  COUNT(CASE WHEN is_active = true THEN 1 END) as activos,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactivos
FROM users
GROUP BY role;
```

---

## 🔍 Verificación desde el Panel Admin

Una vez que tengas un usuario admin, puedes:

1. **Ver todos los usuarios:**
   - Endpoint: `GET /api/admin/users`
   - Panel: `/admin` → Sección "Usuarios"

2. **Ver estadísticas:**
   - Endpoint: `GET /api/admin/stats`
   - Panel: `/admin` → Dashboard principal

3. **Ver clientes con detalles:**
   - Endpoint: `GET /api/admin/clients`
   - Panel: `/admin` → Sección "Clientes"

4. **Cambiar roles:**
   - Endpoint: `PATCH /api/admin/users/:id/role`
   - Panel: `/admin` → Sección "Usuarios" → Botón "Cambiar Rol"

---

## ✅ Checklist de Configuración

- [ ] Variables de entorno configuradas en Vercel:
  - [ ] `DATABASE_URL` (Supabase connection string)
  - [ ] `SESSION_SECRET` (mínimo 32 caracteres)
  - [ ] `NODE_ENV=production`
  - [ ] `ADMIN_CREATE_USER_TOKEN` (opcional, para crear usuarios)

- [ ] Tablas creadas en Supabase:
  - [ ] Ejecutar `npm run db:push` o `tsx script/setup-database.ts`
  - [ ] Verificar en Supabase Dashboard que todas las tablas existen

- [ ] Primer admin creado:
  - [ ] Usar endpoint `/api/admin/create-user` o script `create-user.ts`
  - [ ] Verificar que puede hacer login
  - [ ] Verificar que puede acceder a `/admin`

- [ ] Verificación:
  - [ ] Probar registro de cliente desde `/portal`
  - [ ] Verificar que el cliente aparece en Supabase
  - [ ] Verificar que el cliente aparece en panel admin
  - [ ] Probar login del admin
  - [ ] Probar acceso al panel admin

---

## 🆘 Solución de Problemas

### Las tablas no se crean

1. Verifica `DATABASE_URL` en `.env` o variables de entorno
2. Verifica que tengas permisos en Supabase
3. Ejecuta `npm run db:push` y revisa los errores

### No puedo crear admin

1. Verifica que las tablas existan en Supabase
2. Usa el script `create-user.ts` localmente
3. O usa el endpoint con el token correcto

### Los usuarios no aparecen en Supabase

1. Verifica la conexión a la base de datos
2. Revisa los logs de Vercel para errores
3. Verifica que `DATABASE_URL` esté correctamente configurada

---

## 📝 Notas Importantes

1. **Seguridad:**
   - Las contraseñas siempre se hashean con bcrypt (12 rondas)
   - Nunca se almacenan en texto plano
   - Los tokens JWT expiran en 7 días

2. **Roles:**
   - Los usuarios registrados públicamente SIEMPRE son `client`
   - Solo admins pueden crear otros admins o preparadores
   - Un admin no puede cambiar su propio rol

3. **Base de Datos:**
   - Todas las tablas tienen relaciones con `users`
   - Los deletes en cascada están configurados
   - Los timestamps se generan automáticamente

