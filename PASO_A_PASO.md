# 🚀 GUÍA PASO A PASO COMPLETA

## 📍 Ubicación del Proyecto
```
C:\Users\joshu\highlight-tax-services
```

---

## ✅ PASO 1: Instalar Dependencias

### Opción A: Usando Git Bash (Recomendado)
1. Abre **Git Bash**
2. Navega al proyecto:
   ```bash
   cd /c/Users/joshu/highlight-tax-services
   ```
3. Instala dependencias:
   ```bash
   npm install
   ```
4. Espera a que termine (puede tomar varios minutos)

### Opción B: Usando CMD (Command Prompt)
1. Abre **CMD** (Win + R, escribe `cmd`, Enter)
2. Navega al proyecto:
   ```cmd
   cd C:\Users\joshu\highlight-tax-services
   ```
3. Instala dependencias:
   ```cmd
   npm install
   ```

**⏱️ Tiempo estimado:** 3-5 minutos

---

## ✅ PASO 2: Crear Archivo .env

1. **Abre el archivo `.env.example`** en tu editor de código
2. **Cópialo** (Ctrl+A, Ctrl+C)
3. **Crea un nuevo archivo** llamado `.env` en la misma carpeta
4. **Pega el contenido** (Ctrl+V)
5. **Genera un SESSION_SECRET:**

   Abre Git Bash o CMD y ejecuta:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
   Copia el resultado y reemplaza `tu-session-secret-minimo-32-caracteres-aqui-cambiar-por-uno-real` en el archivo `.env`

6. **Guarda el archivo** `.env`

**📝 El archivo `.env` debe quedar así:**
```env
DATABASE_URL=postgresql://postgres.pfqzfretadqjzjbimvkv:sethum-2zAbpe-bismek@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SESSION_SECRET=tu-secret-generado-aqui
NODE_ENV=development
```

**⏱️ Tiempo estimado:** 2 minutos

---

## ✅ PASO 3: Crear Usuario Admin en Supabase

### 3.1 Abrir Supabase SQL Editor

1. Ve a: **https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv/sql/new**
2. Inicia sesión si es necesario

### 3.2 Copiar el SQL

1. **Abre el archivo** `create-admin.sql` en tu editor de código
   - Ubicación: `C:\Users\joshu\highlight-tax-services\create-admin.sql`
2. **Selecciona TODO** el contenido (Ctrl+A)
3. **Copia** (Ctrl+C)

### 3.3 Ejecutar en Supabase

1. **Pega el SQL** en el editor de Supabase (Ctrl+V)
2. **Haz clic en "Run"** o presiona **Ctrl+Enter**
3. **Verifica el resultado:**
   - Debe mostrar un mensaje de éxito
   - Debe mostrar una fila con el usuario creado:
     ```
     id | email                  | name      | role  | created_at
     ---|------------------------|-----------|-------|------------
     1  | servicestaxx@gmail.com | Joel Paula| admin | 2024-...
     ```

**🔑 Credenciales del admin:**
- **Email:** `servicestaxx@gmail.com`
- **Password:** `Admin123!`

**⏱️ Tiempo estimado:** 2 minutos

---

## ✅ PASO 4: Verificar Tablas en Supabase

### 4.1 Abrir Table Editor

1. Ve a: **https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv/editor**

### 4.2 Cambiar Schema

1. En la parte **superior** de la página, hay un **dropdown** que dice **"vault"**
2. **Haz clic** en el dropdown
3. **Selecciona "public"**
4. Ahora deberías ver todas las tablas listadas

### 4.3 Verificar Tablas

Debes ver estas tablas:
- ✅ `users` - Usuarios
- ✅ `tax_cases` - Casos tributarios
- ✅ `documents` - Documentos
- ✅ `appointments` - Citas
- ✅ `messages` - Mensajes
- ✅ `contact_submissions` - Formularios de contacto
- ✅ `activity_logs` - Logs de actividad
- ✅ `auth_identities` - Identidades OAuth
- ✅ `password_reset_tokens` - Tokens de recuperación
- ✅ `sessions` - Sesiones OAuth

**⏱️ Tiempo estimado:** 1 minuto

---

## ✅ PASO 5: Verificar Variables de Entorno en Vercel

### 5.1 Abrir Vercel Dashboard

1. Ve a: **https://vercel.com/dashboard**
2. Inicia sesión si es necesario

### 5.2 Seleccionar Proyecto

1. Busca y haz clic en el proyecto **`highlight-tax-services`**

### 5.3 Ir a Environment Variables

1. Haz clic en **"Settings"** (en el menú superior)
2. Haz clic en **"Environment Variables"** (en el menú lateral)

### 5.4 Verificar Variables

Debes tener estas variables configuradas:

| Variable | Valor | Estado |
|----------|-------|--------|
| `DATABASE_URL` | `postgresql://postgres.pfqzfretadqjzjbimvkv:...` | ✅ Verificar |
| `SESSION_SECRET` | Tu secret (mínimo 32 caracteres) | ✅ Verificar |
| `NODE_ENV` | `production` | ✅ Verificar |
| `VITE_APP_URL` | `https://highlighttax.com` | ✅ Verificar |

### 5.5 Agregar Variables Faltantes

Si falta alguna:

1. Haz clic en **"Add New"**
2. **Name:** Escribe el nombre de la variable (ej: `DATABASE_URL` o `VITE_APP_URL`)
3. **Value:** Pega el valor
   - Para `VITE_APP_URL`: usa `https://highlighttax.com` (tu dominio real)
4. **Environment:** Selecciona **"Production"** (y también "Preview" y "Development" si quieres)
5. Haz clic en **"Save"**

> **Importante**: `VITE_APP_URL` se usa para generar enlaces en emails (como reset de contraseña). Debe ser la URL completa de tu dominio con `https://`.

### 5.6 Hacer Nuevo Deploy

Si agregaste o modificaste variables:

1. Ve a la pestaña **"Deployments"**
2. Haz clic en los **3 puntos** del último deploy
3. Selecciona **"Redeploy"**
4. Espera a que termine

**⏱️ Tiempo estimado:** 3-5 minutos

---

## ✅ PASO 6: Verificar Dominio y Certificado SSL

### 6.1 Verificar Dominio en Vercel

1. En Vercel, ve a **Settings** > **Domains**
2. Verifica que `highlighttax.com` esté listado
3. Verifica que el estado sea **Valid** (debería mostrar un candado verde)
4. Si no está configurado:
   - Haz clic en **"Add"**
   - Ingresa `highlighttax.com`
   - Sigue las instrucciones para configurar DNS

### 6.2 Verificar Certificado SSL

1. En la misma página de **Domains**, verifica que:
   - El certificado SSL esté **activo** (candado verde)
   - El estado sea **Valid Configuration**
   - No haya advertencias

2. Si el certificado no está activo:
   - Espera 5-10 minutos (Vercel genera certificados automáticamente)
   - Si después de 10 minutos sigue sin certificado, haz clic en **"Refresh"** o **"Verify"**

### 6.3 Verificar que el Sitio Funcione

1. **Abre:** **https://highlighttax.com**
2. **Verifica que:**
   - La página carga sin errores
   - No muestra error 404
   - No muestra error 500
   - La página principal se ve correctamente
   - El certificado SSL es válido (candado verde en el navegador)

**⏱️ Tiempo estimado:** 2-3 minutos

---

## ✅ PASO 7: Probar Login con Admin

### 7.1 Ir a la Página de Login

1. **Abre:** **https://highlighttax.com/portal**

### 7.2 Hacer Login

1. **Email:** `servicestaxx@gmail.com`
2. **Password:** `Admin123!`
3. Haz clic en **"Sign In"** o **"Iniciar Sesión"**

### 7.3 Verificar Redirección

- Deberías ser **redirigido automáticamente** a:
  - **https://highlighttax.com/admin**

**⏱️ Tiempo estimado:** 1 minuto

---

## ✅ PASO 8: Verificar Panel Admin

### 8.1 Abrir Panel Admin

1. **Abre:** **https://highlighttax.com/admin**
   - O deberías estar ahí después del login

### 8.2 Verificar que Cargue

1. **Verifica que:**
   - La página carga sin errores
   - No muestra error 500
   - Muestra el dashboard del admin

### 8.3 Verificar Estadísticas

El panel debe mostrar:
- ✅ **Total de Clientes** (número)
- ✅ **Casos Pendientes** (número)
- ✅ **Casos Completados** (número)
- ✅ **Total de Reembolsos** (número en formato de dinero)

**⏱️ Tiempo estimado:** 1 minuto

---

## 🎉 ¡TODO LISTO!

Si todos los pasos están completados correctamente:

✅ **Aplicación funcionando:** https://highlighttax.com  
✅ **Admin Panel:** https://highlighttax.com/admin  
✅ **Login:** https://highlighttax.com/portal  
✅ **Usuario Admin creado:** `servicestaxx@gmail.com`

---

## 🆘 Si Algo No Funciona

### Error 404 o 500 en el dominio
1. Ve a Vercel Dashboard > Deployments
2. Revisa los logs del último deploy
3. Verifica que las variables de entorno estén configuradas

### No puedo hacer login
1. Verifica que el usuario admin esté creado en Supabase
2. Ejecuta este SQL en Supabase para verificar:
   ```sql
   SELECT id, email, name, role FROM users WHERE email = 'servicestaxx@gmail.com';
   ```

### Panel admin da error 500
1. Revisa los logs en Vercel
2. Verifica que las tablas estén creadas en Supabase (schema 'public')
3. Verifica que el usuario tenga rol 'admin'

### Las tablas no aparecen
1. Verifica que estés viendo el schema "public" (no "vault")
2. Ejecuta el SQL de `create-tables.sql` nuevamente en Supabase

---

## 📞 Contacto

Si necesitas ayuda adicional:
- **Email:** servicestaxx@gmail.com
- **Revisa los logs en Vercel Dashboard**

---

**✅ ¡Éxito! Tu aplicación está lista para usar.**




