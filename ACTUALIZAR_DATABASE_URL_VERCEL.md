# 🔧 Actualizar DATABASE_URL en Vercel

## ⚠️ IMPORTANTE: Para Vercel, USA EL POOLER

**El hostname `db.pfqzfretadqjzjbimvkv.supabase.co` NO funciona en Vercel**, aunque funcione localmente.

### ✅ URL Correcta para Vercel (Pooler - OBLIGATORIO)

```
postgresql://postgres.pfqzfretadqjzjbimvkv:R0CnJK4mKx9Mfj68@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Características:**
- Host: `aws-0-us-east-1.pooler.supabase.com` ⚠️ **CRÍTICO** (no uses `db.pfqzfretadqjzjbimvkv.supabase.co`)
- Puerto: `6543` (Transaction mode - recomendado) o `5432` (Session mode)
- Usuario: `postgres.pfqzfretadqjzjbimvkv` (con project-ref)
- Contraseña: `R0CnJK4mKx9Mfj68`
- **Ventaja:** Diseñado específicamente para entornos serverless como Vercel

### 📝 Nota sobre Desarrollo Local

Para desarrollo local, puedes usar cualquiera de las dos:
- **Conexión directa:** `postgresql://postgres:R0CnJK4mKx9Mfj68@db.pfqzfretadqjzjbimvkv.supabase.co:5432/postgres`
- **Pooler:** `postgresql://postgres.pfqzfretadqjzjbimvkv:R0CnJK4mKx9Mfj68@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

**Pero en Vercel, SIEMPRE usa el pooler.**

## Pasos para Actualizar en Vercel

1. **Ve a Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto `highlight-tax-services`

2. **Settings → Environment Variables:**
   - Haz clic en **Settings**
   - Selecciona **Environment Variables** en el menú lateral

3. **Editar DATABASE_URL:**
   - Busca la variable `DATABASE_URL`
   - Haz clic en los tres puntos (...) → **Edit**
   - Reemplaza el valor con la URL correcta (arriba)
   - Asegúrate de que esté configurada para **Production, Preview, and Development**
   - Haz clic en **Save**

4. **Redeploy:**
   - Ve a **Deployments**
   - Selecciona el último deployment
   - Haz clic en los tres puntos (...) → **Redeploy**
   - O ejecuta: `vercel --prod --yes`

## ✅ Verificación

Después del redeploy, verifica que:
- ✅ El login funciona correctamente
- ✅ No hay errores de "ENOTFOUND" o "getaddrinfo"
- ✅ No hay errores de "Tenant or user not found"
- ✅ La conexión a la base de datos es exitosa

## 🐛 Error Común: ENOTFOUND

Si ves este error en los logs:
```
Error: getaddrinfo ENOTFOUND db.pfqzfretadqjzjbimvkv.supabase.co
```

**Causa:** El hostname `db.pfqzfretadqjzjbimvkv.supabase.co` no es accesible desde Vercel (puede estar bloqueado o no estar disponible para conexiones externas).

**Soluciones:**

1. **Usa el pooler (Recomendado):**
   ```
   postgresql://postgres.pfqzfretadqjzjbimvkv:R0CnJK4mKx9Mfj68@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

2. **Verifica en Supabase Dashboard:**
   - Ve a Settings → Database → Connection string
   - Copia la URL que Supabase proporciona oficialmente
   - Asegúrate de que el proyecto no esté pausado

## 📝 Cómo Obtener la URL Correcta desde Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Settings → Database
3. Scroll hasta **Connection string**
4. Selecciona la pestaña **URI**
5. Copia la URL y reemplaza `[YOUR-PASSWORD]` con tu contraseña
6. Asegúrate de usar el pooler (puerto 6543) para serverless

