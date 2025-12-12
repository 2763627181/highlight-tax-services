# 🔧 Configurar Variables de Entorno en Vercel

## ⚠️ IMPORTANTE: El error "FUNCTION_INVOCATION_FAILED" generalmente ocurre porque faltan variables de entorno

Este documento explica cómo configurar todas las variables de entorno necesarias en Vercel para que la aplicación funcione correctamente.

---

## 📋 Variables de Entorno Requeridas

### 1. **Variables Críticas (OBLIGATORIAS)**

Estas variables **DEBEN** estar configuradas o la aplicación fallará:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a Supabase PostgreSQL | `postgresql://postgres.pfqzfretadqjzjbimvkv:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres` |
| `SESSION_SECRET` | Secret para JWT tokens (mínimo 32 caracteres) | `+3cirGDu6qjFGdz2vWLu2QmurGYO8gD6zoYm+VFaKqYDAllT7QwUaeN9EwEyCW1t` |
| `NODE_ENV` | Entorno de ejecución | `production` |

### 2. **Variables para Supabase (Cliente)**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | `https://pfqzfretadqjzjbimvkv.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase (pública) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### 3. **Variables Opcionales pero Recomendadas**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_APP_URL` | URL completa de la aplicación | `https://highlighttax.com` |
| `RESEND_API_KEY` | API key de Resend para emails | `re_MgFRgznk_GA3J5Xn9A4GSWjBx6qp2pB3G` |
| `RESEND_FROM_EMAIL` | Email desde el cual se envían correos | `noreply@highlighttax.com` |

---

## 🚀 Pasos para Configurar en Vercel

### Paso 1: Acceder a la Configuración del Proyecto

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `highlight-tax-services`
3. Haz clic en **Settings** (Configuración)
4. En el menú lateral, haz clic en **Environment Variables** (Variables de Entorno)

### Paso 2: Agregar Variables de Entorno

Para cada variable:

1. Haz clic en **Add New** (Agregar Nueva)
2. En **Name** (Nombre), escribe el nombre de la variable (ej: `DATABASE_URL`)
3. En **Value** (Valor), pega el valor de la variable
4. En **Environment** (Entorno), selecciona:
   - ✅ **Production** (siempre)
   - ✅ **Preview** (recomendado)
   - ✅ **Development** (opcional, solo si pruebas localmente)

5. Haz clic en **Save** (Guardar)

### Paso 3: Verificar Variables Configuradas

Asegúrate de tener estas variables configuradas:

```
✅ DATABASE_URL
✅ SESSION_SECRET
✅ NODE_ENV = production
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY
✅ VITE_APP_URL
✅ RESEND_API_KEY (opcional pero recomendado)
✅ RESEND_FROM_EMAIL (opcional pero recomendado)
```

### Paso 4: Hacer Redeploy

**IMPORTANTE**: Después de agregar o modificar variables de entorno, debes hacer un redeploy:

1. Ve a la pestaña **Deployments** (Despliegues)
2. Encuentra el último deployment
3. Haz clic en los **3 puntos** (⋯) del deployment
4. Selecciona **Redeploy** (Redesplegar)
5. Espera a que termine el deployment

---

## 🔍 Verificar que las Variables Están Configuradas

### Opción 1: Desde el Dashboard de Vercel

1. Ve a **Settings** > **Environment Variables**
2. Verifica que todas las variables estén listadas
3. **NO** deberías poder ver los valores (por seguridad), solo los nombres

### Opción 2: Desde los Logs de Deployment

1. Ve a **Deployments**
2. Haz clic en el último deployment
3. Revisa los logs de build
4. Si ves errores como:
   - `SESSION_SECRET debe estar configurada`
   - `DATABASE_URL must be set`
   
   Significa que faltan variables de entorno.

---

## 🐛 Solución de Problemas

### Error: "FUNCTION_INVOCATION_FAILED"

**Causa más común**: Faltan variables de entorno o están mal configuradas.

**Solución**:
1. Verifica que `DATABASE_URL` esté configurada correctamente
2. Verifica que `SESSION_SECRET` tenga al menos 32 caracteres
3. Verifica que `NODE_ENV` esté configurada como `production`
4. Haz un redeploy después de agregar las variables

### Error: "Cannot connect to database"

**Causa**: `DATABASE_URL` incorrecta o base de datos no accesible.

**Solución**:
1. Verifica que la URL de Supabase sea correcta
2. Verifica que uses el puerto **6543** (Transaction mode) para Vercel
3. Verifica que la contraseña de la base de datos sea correcta

### Error: "JWT secret is not configured"

**Causa**: `SESSION_SECRET` no está configurada o está vacía.

**Solución**:
1. Asegúrate de que `SESSION_SECRET` esté configurada
2. Verifica que tenga al menos 32 caracteres
3. Haz un redeploy

---

## 📝 Valores de Ejemplo (NO usar en producción)

```env
# Base de datos
DATABASE_URL=postgresql://postgres.pfqzfretadqjzjbimvkv:sethum-2zAbpe-bismek@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Seguridad
SESSION_SECRET=+3cirGDu6qjFGdz2vWLu2QmurGYO8gD6zoYm+VFaKqYDAllT7QwUaeN9EwEyCW1t

# Entorno
NODE_ENV=production

# Supabase
VITE_SUPABASE_URL=https://pfqzfretadqjzjbimvkv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcXpmcmV0YWRxanpqYmltdmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MzE5MzksImV4cCI6MjA4MDMwNzkzOX0.0WqX6BqLXkTNwtuFcfwP9TSJvLGf9VKLSc7xRYIXMwM

# Aplicación
VITE_APP_URL=https://highlighttax.com

# Email (opcional)
RESEND_API_KEY=re_MgFRgznk_GA3J5Xn9A4GSWjBx6qp2pB3G
RESEND_FROM_EMAIL=noreply@highlighttax.com
```

---

## ✅ Checklist de Verificación

Antes de considerar que todo está configurado:

- [ ] `DATABASE_URL` configurada y verificada
- [ ] `SESSION_SECRET` configurada (mínimo 32 caracteres)
- [ ] `NODE_ENV` configurada como `production`
- [ ] `VITE_SUPABASE_URL` configurada
- [ ] `VITE_SUPABASE_ANON_KEY` configurada
- [ ] `VITE_APP_URL` configurada con la URL correcta
- [ ] Todas las variables están en **Production** environment
- [ ] Se hizo un **Redeploy** después de agregar las variables
- [ ] El deployment se completó sin errores
- [ ] La aplicación funciona correctamente

---

## 🆘 Si Nada Funciona

1. **Revisa los logs de Vercel**:
   - Ve a **Deployments** > Último deployment > **Logs**
   - Busca errores específicos

2. **Verifica la conexión a la base de datos**:
   - Prueba la `DATABASE_URL` desde tu máquina local
   - Verifica que Supabase esté accesible

3. **Contacta soporte**:
   - Si el problema persiste, revisa los logs detallados
   - Los logs de Vercel mostrarán el error exacto

---

**Última actualización**: 2025-12-11


