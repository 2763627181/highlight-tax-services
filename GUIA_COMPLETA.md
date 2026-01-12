# 📋 GUÍA COMPLETA - PASO A PASO

## ✅ PASO 1: Instalar Dependencias

Ya ejecutado: `npm install`

---

## ✅ PASO 2: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Base de datos Supabase
DATABASE_URL=postgresql://postgres.pfqzfretadqjzjbimvkv:R0CnJK4mKx9Mfj68@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Secret para JWT tokens (genera uno nuevo o usa el mismo)
SESSION_SECRET=tu-session-secret-minimo-32-caracteres-aqui

# Entorno
NODE_ENV=development
```

**Para generar SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ PASO 3: Crear Usuario Admin en Supabase

### Opción A: Usando SQL Editor (Recomendado)

1. **Abre Supabase SQL Editor:**
   - Ve a: https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv/sql/new

2. **Abre el archivo `create-admin.sql`** en tu editor de código

3. **Copia TODO el contenido** del archivo (Ctrl+A, Ctrl+C)

4. **Pega el SQL** en el editor de Supabase

5. **Ejecuta** (haz clic en "Run" o presiona Ctrl+Enter)

6. **Verifica** que se creó correctamente (debería mostrar el usuario)

**Credenciales del admin:**
- Email: `servicestaxx@gmail.com`
- Password: `Admin123!`

### Opción B: Usando el script de Node.js

```bash
npm run create-user servicestaxx@gmail.com Admin123! "Joel Paula" "8095305592" admin
```

---

## ✅ PASO 4: Verificar Tablas en Supabase

1. **Ve al Table Editor:**
   - https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv/editor

2. **Cambia el schema:**
   - En la parte superior, hay un dropdown que dice "vault"
   - **Cámbialo a "public"**
   - Ahí deberías ver todas las tablas

3. **Tablas esperadas:**
   - `users` - Usuarios
   - `tax_cases` - Casos tributarios
   - `documents` - Documentos
   - `appointments` - Citas
   - `messages` - Mensajes
   - `contact_submissions` - Formularios de contacto
   - `activity_logs` - Logs de actividad
   - `auth_identities` - Identidades OAuth
   - `password_reset_tokens` - Tokens de recuperación
   - `sessions` - Sesiones OAuth

---

## ✅ PASO 5: Verificar Vercel

### 5.1 Verificar que el dominio funcione

1. **Abre el dominio:**
   - https://highlighttax.com
   - Debe cargar sin errores 404 o 500

### 5.2 Verificar variables de entorno en Vercel

1. **Ve a Vercel Dashboard:**
   - https://vercel.com/dashboard

2. **Selecciona tu proyecto** `highlight-tax-services`

3. **Ve a Settings > Environment Variables**

4. **Verifica que estén configuradas:**
   - `DATABASE_URL` - Tu conexión de Supabase
   - `SESSION_SECRET` - Tu secret (mínimo 32 caracteres)
   - `NODE_ENV` - `production`

5. **Si faltan, agrégalas y haz un nuevo deploy**

### 5.3 Verificar el deploy

1. **Ve a la pestaña "Deployments"**
2. **Verifica que el último deploy sea exitoso** (verde)
3. **Si hay errores, revisa los logs**

---

## ✅ PASO 6: Probar Login con Admin

1. **Abre:** https://highlighttax.com/portal

2. **Haz login con:**
   - Email: `servicestaxx@gmail.com`
   - Password: `Admin123!`

3. **Deberías ser redirigido a:** https://highlighttax.com/admin

4. **Verifica que el panel admin cargue correctamente:**
   - Debe mostrar estadísticas
   - No debe dar errores 500

---

## ✅ PASO 7: Verificar Panel Admin

1. **Abre:** https://highlighttax.com/admin

2. **Verifica que muestre:**
   - Total de clientes
   - Casos pendientes
   - Casos completados
   - Total de reembolsos

3. **Si hay errores:**
   - Revisa los logs en Vercel
   - Verifica que las tablas estén creadas en Supabase
   - Verifica que el usuario admin exista

---

## 🔧 Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Verificar tablas en Supabase
npm run db:check

# Crear usuario
npm run create-user email password name phone role

# Ejecutar SQL en Supabase
npm run db:execute-sql
```

---

## 🆘 Solución de Problemas

### Error 404 o 500 en Vercel
- Revisa los logs en Vercel Dashboard
- Verifica que las variables de entorno estén configuradas
- Verifica que el build se complete correctamente

### No puedo hacer login
- Verifica que el usuario admin esté creado en Supabase
- Verifica que el hash de la contraseña sea correcto
- Revisa los logs del servidor en Vercel

### Las tablas no aparecen
- Verifica que estés viendo el schema "public" (no "vault")
- Ejecuta el SQL de `create-tables.sql` nuevamente

### Panel admin da error 500
- Verifica que las tablas estén creadas
- Verifica que el usuario tenga rol "admin"
- Revisa los logs en Vercel

---

## 📋 Checklist Final

- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` creado con variables de entorno
- [ ] Tablas creadas en Supabase (schema 'public')
- [ ] Usuario admin creado
- [ ] Variables de entorno configuradas en Vercel
- [ ] Vercel desplegado correctamente
- [ ] Dominio funcionando sin errores
- [ ] Login con admin funciona
- [ ] Panel admin carga correctamente

---

## ✅ ¡Todo Listo!

Si todos los pasos están completados, tu aplicación debería estar funcionando correctamente en:
- **Dominio:** https://highlighttax.com
- **Admin Panel:** https://highlighttax.com/admin
- **Login:** https://highlighttax.com/portal




