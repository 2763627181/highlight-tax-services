# 🚨 URGENTE: Actualizar DATABASE_URL en Vercel

## ⚠️ Problema Actual

El error `ENOTFOUND db.pfqzfretadqjzjbimvkv.supabase.co` indica que ese hostname **NO es accesible desde Vercel**, aunque funcione localmente.

## ✅ Solución: Usar Pooler en Vercel

**Aunque la conexión directa funcione localmente, en Vercel debes usar el pooler.**

### URL Correcta para Vercel:

```
postgresql://postgres.pfqzfretadqjzjbimvkv:R0CnJK4mKx9Mfj68@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Diferencias importantes:**
- ❌ Host incorrecto: `db.pfqzfretadqjzjbimvkv.supabase.co` (no funciona en Vercel)
- ✅ Host correcto: `aws-0-us-east-1.pooler.supabase.com` (funciona en Vercel)
- ✅ Usuario: `postgres.pfqzfretadqjzjbimvkv` (con project-ref)
- ✅ Puerto: `6543` (pooler - recomendado para serverless)
- ✅ Contraseña: `R0CnJK4mKx9Mfj68` (nueva contraseña)

## 📋 Pasos para Corregir en Vercel

1. **Ve a Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto

2. **Settings → Environment Variables:**
   - Haz clic en **Settings**
   - Selecciona **Environment Variables**

3. **Editar DATABASE_URL:**
   - Busca la variable `DATABASE_URL`
   - Haz clic en los tres puntos (...) → **Edit**
   - **Reemplaza TODA la URL** con:
     ```
     postgresql://postgres.pfqzfretadqjzjbimvkv:R0CnJK4mKx9Mfj68@aws-0-us-east-1.pooler.supabase.com:6543/postgres
     ```
   - Asegúrate de que esté configurada para **Production, Preview, and Development**
   - Haz clic en **Save**

4. **Redeploy Inmediato:**
   - Ve a **Deployments**
   - Selecciona el último deployment
   - Haz clic en los tres puntos (...) → **Redeploy**
   - O ejecuta: `vercel --prod --yes`

## 🔍 Por Qué Funciona Localmente Pero No en Vercel

- **Localmente:** Tu máquina puede resolver `db.pfqzfretadqjzjbimvkv.supabase.co`
- **En Vercel:** Ese hostname no está disponible para conexiones externas desde entornos serverless
- **Solución:** El pooler (`aws-0-us-east-1.pooler.supabase.com`) está diseñado específicamente para entornos serverless como Vercel

## ✅ Verificación Post-Deploy

Después del redeploy, verifica en los logs que:
- ✅ No aparece el error `ENOTFOUND`
- ✅ El login funciona correctamente
- ✅ Las consultas a la base de datos funcionan

## 📝 Nota sobre Desarrollo Local

Para desarrollo local, puedes usar cualquiera de las dos:
- Conexión directa: `postgresql://postgres:R0CnJK4mKx9Mfj68@db.pfqzfretadqjzjbimvkv.supabase.co:5432/postgres`
- Pooler: `postgresql://postgres.pfqzfretadqjzjbimvkv:R0CnJK4mKx9Mfj68@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

**Pero en Vercel, SIEMPRE usa el pooler.**



