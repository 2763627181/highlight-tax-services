# 🔍 VERIFICAR VARIABLES DE ENTORNO EN VERCEL

## ⚠️ CRÍTICO: El error FUNCTION_INVOCATION_FAILED generalmente es por variables faltantes

## 📋 Checklist de Variables OBLIGATORIAS

Ve a: **Vercel Dashboard** → **Settings** → **Environment Variables**

### ✅ Variables que DEBEN estar (si falta alguna, la app falla):

1. **`DATABASE_URL`**
   - Valor: `postgresql://postgres.pfqzfretadqjzjbimvkv:sethum-2zAbpe-bismek@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

2. **`SESSION_SECRET`**
   - Valor: `+3cirGDu6qjFGdz2vWLu2QmurGYO8gD6zoYm+VFaKqYDAllT7QwUaeN9EwEyCW1t`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

3. **`NODE_ENV`**
   - Valor: `production`
   - Environments: ✅ Production, ✅ Preview

### ✅ Variables Recomendadas:

4. **`VITE_SUPABASE_URL`**
   - Valor: `https://pfqzfretadqjzjbimvkv.supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

5. **`VITE_SUPABASE_ANON_KEY`**
   - Valor: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcXpmcmV0YWRxanpqYmltdmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MzE5MzksImV4cCI6MjA4MDMwNzkzOX0.0WqX6BqLXkTNwtuFcfwP9TSJvLGf9VKLSc7xRYIXMwM`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

6. **`VITE_APP_URL`**
   - Valor: `https://highlighttax.com`
   - Environments: ✅ Production, ✅ Preview

7. **`RESEND_API_KEY`** (Opcional pero recomendado)
   - Valor: `re_MgFRgznk_GA3J5Xn9A4GSWjBx6qp2pB3G`
   - Environments: ✅ Production, ✅ Preview

8. **`RESEND_FROM_EMAIL`** (Opcional pero recomendado)
   - Valor: `noreply@highlighttax.com` (o tu email)
   - Environments: ✅ Production, ✅ Preview

---

## 🔧 Cómo Agregar Variables

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Para cada variable:
   - Haz clic en **"Add New"**
   - **Key**: Nombre de la variable (ej: `DATABASE_URL`)
   - **Value**: El valor (copia y pega exactamente)
   - **Environments**: Selecciona Production, Preview (y Development si aplica)
   - Haz clic en **"Save"**

---

## 🚨 DESPUÉS DE AGREGAR VARIABLES

**MUY IMPORTANTE**: Después de agregar o modificar variables:

1. Ve a **Deployments**
2. Encuentra el último deployment
3. Haz clic en los **3 puntos** (⋯)
4. Selecciona **"Redeploy"**
5. Espera a que termine (1-2 minutos)

**Sin redeploy, las nuevas variables NO estarán disponibles.**

---

## 🔍 Cómo Verificar que Están Configuradas

### Opción 1: Desde Vercel Dashboard
1. Ve a **Settings** → **Environment Variables**
2. Deberías ver todas las variables listadas
3. **NO** podrás ver los valores (por seguridad), solo los nombres

### Opción 2: Desde los Logs
1. Ve a **Deployments** → Último deployment → **Logs**
2. Busca el mensaje: `[API] Environment check:`
3. Debería mostrar:
   ```
   hasDatabaseUrl: true
   hasSessionSecret: true
   nodeEnv: production
   ```

Si ves `false` en alguna, esa variable falta.

---

## ❌ Errores Comunes

### Error: "DATABASE_URL is required but not set"
**Solución**: Agregar `DATABASE_URL` en Vercel y hacer redeploy

### Error: "SESSION_SECRET is required but not set"
**Solución**: Agregar `SESSION_SECRET` en Vercel y hacer redeploy

### Error: "Cannot connect to database"
**Solución**: Verificar que `DATABASE_URL` sea correcta y que Supabase esté activo

---

## 📞 Si el Problema Persiste

1. Revisa los logs completos en Vercel
2. Busca mensajes que empiecen con `[API]`
3. Comparte el error específico para debugging


