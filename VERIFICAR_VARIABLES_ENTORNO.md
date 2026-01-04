# 🔍 VERIFICACIÓN DE VARIABLES DE ENTORNO

## 📋 Variables Requeridas para Vercel

### ✅ OBLIGATORIAS (Sin estas, la aplicación NO funcionará)

| Variable | Descripción | Dónde obtenerla | Ejemplo |
|----------|-------------|----------------|---------|
| `DATABASE_URL` | String de conexión a Supabase PostgreSQL | Supabase Dashboard → Settings → Database → Connection string (URI) | `postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres` |
| `SESSION_SECRET` | Secret para firmar tokens JWT (mínimo 32 caracteres) | Generar con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | `a1b2c3d4e5f6...` (64 caracteres hex) |
| `NODE_ENV` | Entorno de ejecución | Debe ser `production` en Vercel | `production` |

### ⚠️ OPCIONALES (Recomendadas para funcionalidad completa)

| Variable | Descripción | Dónde obtenerla | Requerida para |
|----------|-------------|----------------|----------------|
| `RESEND_API_KEY` | API Key de Resend para envío de emails | Resend Dashboard → API Keys | Formulario de contacto, emails de bienvenida, notificaciones |
| `RESEND_FROM_EMAIL` | Email remitente (opcional, usa default si no está) | Debe ser un dominio verificado en Resend | Emails transaccionales |
| `VITE_APP_URL` | URL completa de la aplicación desplegada | URL de tu dominio en Vercel | Links en emails, redirecciones |
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase (solo para OAuth) | Supabase Dashboard → Settings → API → Project URL | Login con Google/GitHub/Apple |
| `VITE_SUPABASE_ANON_KEY` | Anon Key de Supabase (solo para OAuth) | Supabase Dashboard → Settings → API → anon public key | Login con Google/GitHub/Apple |

---

## 🔧 Cómo Verificar Variables en Vercel

### Paso 1: Acceder a la Configuración

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona el proyecto `highlight-tax-services`
3. Ve a **Settings** → **Environment Variables**

### Paso 2: Verificar Variables Obligatorias

Verifica que estas variables estén configuradas:

- ✅ `DATABASE_URL` - Debe estar presente
- ✅ `SESSION_SECRET` - Debe estar presente y tener al menos 32 caracteres
- ✅ `NODE_ENV` - Debe ser `production`

### Paso 3: Verificar Variables Opcionales

Si quieres funcionalidad completa, verifica:

- ⚠️ `RESEND_API_KEY` - Para emails (formulario de contacto)
- ⚠️ `VITE_APP_URL` - Para links en emails

---

## 🐛 Diagnóstico de Problemas

### Error: "No se pudo enviar el mensaje"

**Posibles causas:**

1. **`DATABASE_URL` no configurada o incorrecta**
   - Verifica en Vercel → Settings → Environment Variables
   - Debe ser una URL válida de Supabase PostgreSQL
   - Formato: `postgresql://postgres.xxx:password@host:port/database`

2. **Conexión a base de datos fallida**
   - Verifica que la base de datos esté accesible
   - Verifica que el string de conexión sea correcto
   - Revisa los logs de Vercel para ver el error específico

3. **`RESEND_API_KEY` no configurada (solo afecta el email, no el guardado)**
   - El formulario se guarda en la base de datos
   - Solo el email de notificación falla si falta esta variable

### Cómo Verificar en los Logs de Vercel

1. Ve a tu proyecto en Vercel
2. Selecciona el deployment más reciente
3. Haz clic en **Logs**
4. Busca errores relacionados con:
   - `DATABASE_URL`
   - `Error en formulario de contacto`
   - `Database connection error`

---

## 📝 Cómo Agregar Variables en Vercel

### Método 1: Desde el Dashboard

1. Ve a **Settings** → **Environment Variables**
2. Haz clic en **Add New**
3. Ingresa:
   - **Name**: Nombre de la variable (ej: `DATABASE_URL`)
   - **Value**: Valor de la variable
   - **Environment**: Selecciona `Production`, `Preview`, y/o `Development`
4. Haz clic en **Save**

### Método 2: Desde Vercel CLI

```bash
vercel env add DATABASE_URL production
# Pega el valor cuando se solicite
```

---

## ✅ Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] `DATABASE_URL` está configurada en Vercel
- [ ] `SESSION_SECRET` está configurada y tiene al menos 32 caracteres
- [ ] `NODE_ENV` está configurada como `production`
- [ ] Las variables están asignadas al entorno `Production`
- [ ] Se hizo un nuevo deploy después de agregar las variables
- [ ] Los logs de Vercel no muestran errores de conexión a la base de datos

---

## 🔗 Enlaces Útiles

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Resend Dashboard**: https://resend.com/api-keys
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentación de Vercel**: https://vercel.com/docs/environment-variables

---

## 🆘 Si el Problema Persiste

1. **Revisa los logs de Vercel** para ver el error exacto
2. **Verifica que las variables estén en el entorno correcto** (Production)
3. **Asegúrate de hacer un nuevo deploy** después de agregar variables
4. **Verifica la conexión a Supabase** desde el dashboard de Supabase

