# 🔧 Actualizar DATABASE_URL en Vercel

## URL de Conexión Directa

Usa esta URL en Vercel:

```
postgresql://postgres:sethum-2zAbpe-bismek@db.pfqzfretadqjzjbimvkv.supabase.co:5432/postgres
```

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
   - Reemplaza el valor con:
     ```
     postgresql://postgres:sethum-2zAbpe-bismek@db.pfqzfretadqjzjbimvkv.supabase.co:5432/postgres
     ```
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
- ✅ No hay errores de "Tenant or user not found"
- ✅ La conexión a la base de datos es exitosa

## 📝 Nota

Esta es una conexión **directa** (puerto 5432), no un pooler. Funciona bien para Vercel, pero si tienes problemas de conexión, considera usar el pooler (puerto 6543) que es más eficiente para serverless.

